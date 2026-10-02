# Plan — one corporation-year, many filings

Status: proposed, not started. Written 2026-09-07 against
`ca-tax@0.0.17`, `TaxFoundry-be@77575c9`, `TaxFoundry-fe@06824de`.

## The problem

An `EngagementYear` is one filing: a client, a tax year, and a program. Its own
model comment says so. A corporation with an Alberta permanent establishment
owes two returns, so it needs two engagements, and a preparer sees two of
everything for one corporation-year.

Every competing Canadian product does the opposite. TaxCycle, Corporate Taxprep,
Cantax and ProFile all use one client file per corporation per tax year, with
the AT1 and CO-17 generated inside it from the same data. A preparer coming from
any of them will not recognise what we show.

We diverged for a defensible reason. Those products have no governance layer: no
review sign-off bound to a computation, no officer authorization bound to a
result hash, no filing record that refuses to be written unless a real gateway
answered. Ours bind per filing, and that is what pushed the model to one
engagement per filing. The control posture is stronger than the desktop norm.
The information architecture is worse.

### What the data says

Read-only counts against the production database, 2026-09-07:

| Collection | Documents |
|---|---|
| engagementyears | 81 (56 T2, 23 AT1, 2 CO17) |
| computedreturns | 110 |
| reviewmemos | 69 |
| t183authorizations | 14 |
| factlogs | 250 |
| filingrecords | 5 |
| submissionattempts | 2 |

Five client-years hold more than one engagement. **Every one is a same-program
duplicate** — T2 with T2, or AT1 with AT1. There is not a single
federal-plus-Alberta pair in the system.

Two conclusions. Nobody has used the two-engagement workflow, which suggests it
blocked people rather than merely confusing them. And the migration has **no
merge cases**: each existing engagement becomes a corporation-year holding
exactly one filing. That is a mechanical backfill, not a judgement about whose
data wins.

The five same-program duplicates are a separate data-hygiene issue. The
`{organizationId, clientId, taxYearEnd, program}` index is not unique, so
accidental duplicates are possible today.

## What is already right, and shrinks this work

`returnInput` is **already corporation-year shaped**. It is a flat union of 36
schedule slices — 22 federal, 13 Alberta, 1 Québec — with no per-program
nesting, and it is generated from a Zod contract on the server with a drift
test. The federal slices declare no `programs` restriction, so an Alberta
engagement already collects the entire federal dataset and shows the full
federal schedule tree.

`SCHEDULE_KEYS_MATCH_RETURN_INPUT` pins the schedule keys against
`keyof ReturnInput` as a bidirectional exactness assertion over the whole union.
It is program-blind and **does not need to change**.

So the shared dataset already exists in the right shape. What is wrong is only
the wrapper: one engagement can hold that dataset but can only ever produce one
filing from it. That is a smaller problem than it looks.

The clearest evidence is in the compute path. For an Alberta corporation the
federal return is computed **twice**: once transiently inside
`assembleProvincialInput`, where `computeFederalT2` runs in full and only
`taxableIncome` survives, and once for real on the companion engagement. The
data to produce both results from one pass already flows through that function.
Only the output shape and the persistence layer forbid it.

## Target model

```
EngagementYear  (the corporation-year — one per client per tax year)
  clientId, taxYearStart, taxYearEnd, firstReturn
  returnInput          the shared dataset, entered once
  organizationId, createdBy, deletedAt
  status               DERIVED from its filings, not stored

Filing  (child — one per return the corporation owes)
  engagementYearId, program (T2 | AT1 | CO17)
  status               draft | in_progress | ready | filed
  engineVersion        pinned at compute time
  amendsFilingId       an amendment amends a FILING, not a corporation-year
  amendmentDescription
  organizationId, createdBy, deletedAt
```

`program`, `engineVersion`, `status` and the amendment pair move off the parent.
Everything else stays.

### Child collections

| Collection | Change | Why |
|---|---|---|
| computed-return | `engagementYearId` → `filingId` | Already carries `program`. One fold per jurisdiction; an AT1 fold has no federal line on it. |
| review-memo | → `filingId` | Flags are program-conditional in three places. The "one open memo per engagement" upsert would otherwise collapse two jurisdictions into one document. |
| t183-authorization | → `filingId` | T183CORP is specifically the CRA federal instrument. Alberta's equivalent is the certification block. Two distinct legal artifacts. |
| filing-record | → `filingId` | Already carries `program` and `channel`. |
| submission-attempt | → `filingId` | Already carries `program`, and its idempotency key is `${program}:${engagementId}:${payloadHash}` — program is doing `filingId`'s job today. |
| fact-log | **keeps `engagementYearId`**, gains nullable `filingId` | See below. |
| proposal | unchanged | Agent suggestions on the working data. |
| gifi-mapping | unchanged | Already client-keyed. |

### The fact log is the delicate one

It has a unique index on `{organizationId, engagementYearId, seq}`, with an
atomic counter keyed `factlog:<org>:<engagement>`. That is one ordered audit
trail per engagement. Splitting it per filing forks the trail and orphans the
counters.

Keep the sequence at corporation-year grain and add a **nullable** `filingId`
discriminator. The ledger stays single and ordered; facts that belong to a
specific return are attributable; facts about the shared data (`save-input`,
`auto-fill`) carry no filing and correctly belong to the corporation-year. No
counter migration, no index change.

### Status

`status` is written as `in_progress` by compute and `filed` by all three
transmit services. It tracks a filing's progress, so it moves to `Filing`. The
parent's status is derived: filed when every filing is filed, otherwise the
least advanced. Derive it, do not store it — a stored parent status is a second
source of truth that will drift.

## The action split

Fourteen actions on the engagement resource today.

**Stay on the corporation-year (3).** `save-input` — this is the shared dataset,
and moving it here is what deletes the reason `create-companion-filing` exists.
`preview-cca` — a pure function of the year and the classes, never touches
program. `auto-fill` — pulls from the corporation's CRA account; one pull serves
every filing.

**Move to the filing (9).** `compute`, `verify-reproducible`, `generate-review`,
`authorize-t183`, `prepare-cif`, `prepare-co17`, `prepare-netfile`,
`prepare-rsi`, `transmit`. Each is already guarded on program, and the four
`prepare-*` actions plus `transmit` are a per-jurisdiction family wearing a
shared prefix. Five actions on one resource where only one is ever legal for a
given document is the surface symptom of the model problem.

**Dissolve (2).** `create-companion-filing` becomes "add a filing".
`companion-filing` becomes a read of the parent's filings.

## Routes

| Route | Change |
|---|---|
| `/engagements` | Rows become corporation-years, with the filings shown as badges. |
| `/engagements/[id]` | A corporation-year hub: identity, the shared return, and one stepper card per filing. |
| `/engagements/[id]/return` | **Unchanged address.** The data is corporation-year. Add a filing selector that drives the schedule tree. |
| `/engagements/[id]/filings/[filingId]/review` | Was `/review`. |
| `/engagements/[id]/filings/[filingId]/t183` | Was `/t183`. Federal only. |
| `/engagements/[id]/filings/[filingId]/export` | Was `/export`. The companion card disappears. |
| `/engagements/[id]/filings/[filingId]/jacket` and `/print` | Were `/jacket`, `/print`. |
| `/reviews` | Column keys on `filingId`. |

Six of the seven `[id]` sub-routes are per-filing. Only `return` is genuinely
corporation-year, which is the one that matters most and the one that does not
have to move.

`scheduleTreeFor(program)` becomes `scheduleTreeFor(activePrograms: Set)`, or the
editor keeps calling it per selected filing. `isProgramSpecific` stops being a
filter and becomes the sidebar grouping key. `ScheduleDef.formView` receives
`engagement`, and `reserves-form-view.tsx` reads `.program` off it — that prop
contract needs the active filing passed explicitly, since the engagement will no
longer have a program.

## Sequence

Each phase ships and leaves the system working. Nothing here requires a big-bang
cutover.

**Phase 1 — introduce Filing behind the scenes.** Add the collection and a
nullable `filingId` to the six child collections. Backfill one filing per
existing engagement. Dual-write on every path that creates a child. Read paths
untouched. Ships invisibly; nothing in the UI changes.

**Phase 2 — flip reads to `filingId`.** One collection at a time, in this order:
submission-attempt, filing-record, t183-authorization, review-memo,
computed-return. Least to most coupled, so each step is small and reversible.
After each, `engagementYearId` on that collection becomes redundant but stays.

**Phase 3 — move the nine actions onto a filing resource.** Keep the old action
names on the engagement as thin forwarders that resolve the single filing, so the
MCP surface and any client keep working. Delete the forwarders in phase 6.

**Phase 4 — one compute, many filings.** The prize. Change
`assembleProvincialInput` to return the federal result alongside the provincial
input, and have compute persist a computed return per filing in one transaction.
This is what stops the federal return being computed twice and thrown away, and
it is what makes the federal payload genuinely available from an Alberta
corporation-year. Do it after phase 3 so there is somewhere to put the second
result.

**Phase 5 — the UI.** Corporation-year hub, filing routes, the filing selector
in the return editor. This is where a preparer finally sees one corporation-year.

**Phase 6 — remove the old shape.** Drop `program`, `engineVersion`, `status`
and the amendment pair from `EngagementYear`. Drop `engagementYearId` from the
five child collections. Delete `companion-filing.service.ts`, its two actions and
its UI card. Fix the stale MCP doc string, which today tells agents an engagement
is "one client + one tax year + program (T2 or AT1)" and omits CO17.

## Migration

There is **no migration tooling in the repo**. That has to be built first: a
`migrations/` directory, a runner script, a `migrations` collection recording
what has run, and an `npm run migrate` entry. Keep it minimal; three or four
migrations will exist in total.

Each migration needs a rollback. For phase 1 that is trivial — drop the Filing
collection and unset `filingId`. For phase 6 it is not, so phase 6 waits until
phases 1 to 5 have been in production long enough to be trusted.

**Backfill rules for phase 1.** For each `EngagementYear`, create one `Filing`
carrying its `program`, `status`, `engineVersion` and amendment pair. Set
`filingId` on each of its computed returns, review memos, T183 authorizations,
filing records and submission attempts, and on its facts. Translate
`amendsEngagementYearId` to `amendsFilingId` in a second pass, once every
engagement has a filing.

Expected volume: 81 filings created, roughly 450 child documents stamped. Small
enough to run in one pass with no batching.

**Two engagements are referenced by filing records.** Those are immutable
evidence of a transmitted return. The backfill only adds a `filingId`; it must
not touch any other field on them, and the migration should assert that
afterwards.

**The five same-program duplicates are left alone.** Do not auto-merge. They
become five corporation-years that happen to share a client and a year, which is
untidy but harmless. Offer a manual merge later, or clean them by hand. Never
auto-merge records that may carry filing evidence.

## Blast radius

**Server.** 49 of 114 source files touch the engagement id or the program, so 43
percent of the tree. Seven models carry `engagementYearId`; three already carry
`program`. Nineteen call sites branch on program: nine route to a jurisdiction
engine or renderer, ten are guards. Eight resources expose `engagementYearId` in
`allowedFilterFields` and need a `filingId` peer.

**Web.** Nine files reference `engagementYearId`, twelve read `.program`. The
type anchor is `api/engagements.ts:26`, so TypeScript will surface every one of
them from a single edit. Concentrations: `return-editor.tsx` with ten program
reads, `engagement-export.tsx` with five.

**Engine.** `@classytic/ca-tax` needs nothing for phases 1 to 3 and 5. Phase 4
touches only the host's `assembleProvincialInput`, not the package.

## Risks

**The fact-log unique index.** Handled by keeping the sequence at
corporation-year grain, but it is the one place where getting the grain wrong
corrupts an append-only ledger. Write the phase 1 migration test against a copy
of production before running it.

**Phase 4 changes what a compute produces.** Two computed returns from one
action, in one transaction. The reproducibility snapshot, the frozen filing
input and the identity freeze all have to be per filing. Do not let this phase
merge with any other.

**The certification window.** Nothing here changes the engine, the renderers or
the payloads, so certification evidence is unaffected. Phase 4 changes when a
federal result is persisted, not how it is computed. Worth stating explicitly to
anyone reviewing the change for certification impact.

**Scope creep into the schedule registry.** It is tempting to reorganise
`SCHEDULES` while touching the editor. Do not. The registry and `ReturnInput` are
already the right shape and the exactness pin protects them.

## What I would not do

Do not make `Filing` carry its own `returnInput`. The whole point is one dataset.
A per-filing override sounds useful and would immediately reintroduce the
question of which copy is authoritative.

Do not sync data between filings. They legitimately diverge, and Alberta's
reconciliation schedules exist to record exactly how.

Do not auto-create the federal filing when an Alberta one is made. Offer it. Some
corporations file only federally, and a filing that exists implies a return that
is owed.

## Estimate

Phases 1 and 2 are the bulk of the risk and about a third of the work. Phase 4 is
the highest-value and the most delicate. Phase 5 is the largest by file count and
the lowest risk. Phase 6 is small but must wait.

The honest framing: this is a week of focused work, not an afternoon, and the
migration tooling is a prerequisite that does not exist yet. It is worth doing —
the current model has already stopped anyone from filing an Alberta corporation
federally — but it should be its own piece of work with its own review, not
folded into something else.
