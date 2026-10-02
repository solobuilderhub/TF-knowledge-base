# AT1 Schedule 12 federal wiring — completeness status

**Status: tracking doc, not a single investigation.** Unlike this directory's
other files, this one exists to record REMAINING scoped work that has no
other durable home in the repo (no `TODO.md`/`ROADMAP.md` convention exists
here — `research/findings/` is otherwise a "why X is/isn't a bug" knowledge
base, and this is the one exception, added because a prior session's
approved plan file lived only in a local Claude Code plan directory outside
any repo and would otherwise be lost to conversation history). Update it in
place as tiers land; don't create a new file per tier.

## Done (Tier 1)

Confirmed via `apps/server/src/engine/assemble-at1-schedules.ts`'s
`scheduleTwelve()`: the Area A (`X`, omit-when-equal) vs Area B (`M`,
always-both-sides) mandatory-emit distinction is now correctly applied —
Area B's loss-deduction lines (064-071) were previously silently dropped
whenever Alberta had no override, which is the common case, not the
exception. Limited partnership losses (072/073) are wired from AT1 Schedule
21's own pool. See `AT1-jacket-088-vs-090-balance.md` for a related,
separately-resolved question about this schedule's balance-line semantics.

## Done (Tier 2) — built 2026-09-03

Federal T2 previously had **zero** CEE/CDE/COGPE/depletion/foreign-exploration
tracking (confirmed: no matches in `federal-t2.ts`). Unblocked when canada.ca
(previously 403/timeout via both `WebFetch` and raw `curl`) turned out
reachable again on re-test — `WebFetch` on `canada.ca/.../forms/t2sch12.html`
now succeeds. Downloaded the real form
(`research/sources/cra-forms/pdf/T2SCH12-resource-related-deductions.pdf`,
T2 SCH 12 E (26)), rendered all 9 pages, read each Part directly (not via
`pdftotext`, which misaligns grid-shaped forms elsewhere in this codebase).

Built `packages/ca-tax/src/t2/schedules/schedule12-resource-deductions.ts` —
five compute functions (Depletion = EDA regular/successor + CMEDB → Schedule
1 line 344; CEE → 341; CDE → 340; COGPE → 342; Foreign exploration/
development + SFEDE + CFRE → 345), each verified against the rendered form's
own formulas, including the CURRENT-LAW multi-tier accelerated rates the
original scoping missed entirely: CDE and COGPE both blend a base rate (30%/
10%) with a bonus rate (15%/5%) on the portion of the pool that is a
CURRENT-YEAR addition (RCDE/RCOGPE, ITA ss.66.2/66.4, phasing 2024-2034).
ACDE (the OLDER accelerated tier, pre-2025 only) is deliberately not modelled
as a separate input — this schedule version is titled "2025 and later tax
years", so a current-year addition is always RCDE-eligible for the mainline
case this version targets, not a guess.

Wired into `federal-t2.ts` (`schedule1Deductions` pushes for lines 340-345)
and into `assemble-t2-input.ts`'s new `scheduleTwelve()` — which made a
real, separate discovery along the way: the ONLY place this app collects
these figures is `ri.albertaResourceDeductions15` (the AT1-only "Resource
Related Deductions (S15)" guided-editor page), and its `federal<X>` fields
were being collected and then DISCARDED — read only by AT1's own Schedule 15
reconciliation as a comparison baseline, never fed into the actual federal
computation. So federal Schedule 1 lines 340-345 stayed 0 even when a
preparer had entered real federal pool data on that page. Fixed by reading
the same `federal<X>` fields into the new federal module too — filling in
the AT1 Schedule 15 page now genuinely changes the filed FEDERAL return, not
just the AT1 reconciliation (see the schedule's own updated doc comment in
`apps/web/.../schedules/at1/alberta-schedule15.ts`).

Wired the AT1-side diff into `assemble-at1-schedules.ts`'s `scheduleTwelve()`
— the original ask: lines 022/023 (Depletion), 026/027 (CEE), 028/029 (CDE),
030/031 (Foreign), 032/033 (COGPE), each AT1 Schedule 15's own claim total
against the new federal module's matching claim total, via a new shared
`albertaResourceDeductionDifference` helper (mirrors `albertaCcaDifference`'s
established direction convention). Verified against the rendered
`AT1SCH12-...-TRA11732.pdf` page 1's own line-source annotations (e.g.
"Depletion... Schedule 15 lines 007 + 019 + 031").

**Bug found and fixed during initial QA, before this tier could be closed**:
`federal-t2.ts`'s `computeFederalT2()` built the local `resourceDeductions`
value correctly (used it for `schedule1Deductions`, so net income was already
right) but never included it in the function's own returned object — so
`assemble-at1-schedules.ts`'s Schedule 12 diff always read `undefined` and
showed the federal side as $0 regardless of what was entered. Fixed with a
one-line addition to the return statement; regression-tested in
`t2-schedule12-resource-deductions.test.ts` (`computeFederalT2integration —
resourceDeductions`, asserts the field survives the round trip). Re-verified
live post-fix: entering federal CEE and forcing a genuine Alberta/federal
divergence (jacket lines 000060/000061 = Yes, plus an Alberta-only override)
now shows the correct non-zero federal figure on line 027. Note for future
re-testing: after any `ca-tax` tarball reinstall, restart both dev servers —
a running `next dev`/`tsx watch` process keeps the old build in memory and
will falsely appear to still have the bug. Also note the 026/027 (and every
other) pair is a `pair()`-style Area A field: it only renders at all when
Alberta and federal genuinely diverge, by TRA spec design, so testing with
matching federal/Alberta figures will show nothing on either line — that is
correct, not a regression.

**Real, disclosed limitation not closed here**: because the source page
(`albertaResourceDeductions15`) is `programs: ["AT1"]`-gated, a PURE T2
(non-AT1) filer still has no guided-editor surface to claim resource
deductions at all — the new federal module and Schedule 1 wiring exist, but
nothing populates them for a plain federal-only engagement. Giving pure-T2
filers their own entry point is separate, not-yet-scoped work.

Also simplified relative to AT1's own 2269-line mirror (a deliberate,
disclosed scope limit, not an oversight — see the new module's own doc
comment): amalgamation/wind-up transfers, transfers to/from a successor
corporation, flow-through share renunciations, the look-back rule
(s.66(12.66)), and CEE↔CDE reclassification are all collapsed into a plain
`otherAdditions`/`otherDeductions` catch-all per pool rather than modelled
individually — each is real but rare, and entering it as a bare catch-all
risks nothing worse than under-crediting a rare provision, whereas guessing
at its unique interaction with the pool risked getting it wrong silently.
SFEDE/CFRE (Parts 8/9, per-country grids) are summed into one flat total
across countries rather than tracked per-country — the form's own
per-country allocation is a preparer-side exercise this engine does not
perform.

Lower-priority items bundled in the same tier, still not done:
- Farm inventory (AT1 014-021): real federal lines exist (224/229/309/313)
  but no pool on either side — these are preparer elections in practice,
  lowest priority; expose as plain manual fields once/if a natural home
  exists.
- SR&ED expenses claimed (034/035): ties to AT1's already-built-but-unwired
  Schedule 16; federal `schedule1.ts`'s `CARRIED_IN` already references T661
  line 460 — investigate whether that's sufficient for a first pass before
  assuming it needs the same canada.ca research the resource module does.
- "Other" (040-042/048): a genuinely complex multi-source aggregation per
  spec — confirmed niche, correctly deferred to manual entry, not tracked
  as open work.

## Not done (Tier 3) — deferred as a separate track by explicit prior instruction

Three federal modules exist but are dead code, never called from
`federal-t2.ts`: `dividendsDeductibleS112()`
(`t2/jacket/taxable-income.ts`), `part-vi-1-deduction.ts`, and
`eifel-limitation.ts`. Wiring them is **federal correctness, independent of
AT1** — the user explicitly chose to track this as a separate track earlier
in the session that produced this doc, not as part of the AT1 Schedule 12
work. Revisit AT1 Schedule 12 lines 061/063/130/131 once that separate track
lands; don't pull it into an AT1-focused session unprompted.

Central credit union dividends (AT1 line 075): no concept found in either
engine — needs scoping from the spec before building, not currently even
partially started.

## Done: federal T2 paper Form Views (not a Schedule 12 item, tracked here for "what's left")

Federal T2 paper Form Views were a different piece of work from the same
approved plan (Phase 4). **As of 2026-09-03, every T2 schedule in
`apps/web/.../schedules/t2/` has a real, dedicated paper Form View** — the
17-schedule gap this section used to describe is closed. Built across this
and a prior session: T2SCH1 (net income), T2SCH8 (CCA), T2SCH2 (donations),
T2SCH13 (reserves), T2SCH3 (dividends), T2SCH4 (losses), T2SCH5 (provincial
allocation), T2SCH6 (capital gains), T2SCH7 (small business deduction —
really T2 jacket lines 400/410/440), T2SCH21 (foreign tax credit — federal,
not to be confused with AT1's own Schedule 21), T2SCH24/S101 (first return +
opening balance sheet), T2SCH31 (SR&ED ITC), T2SCH33 (taxable capital),
T2SCH43 (Part IV.1/VI.1 preferred-share taxes), T2SCH50 (shareholders),
T2SCH88 (internet business — genuinely has no printed line numbers, verified
against the rendered PDF), T2SCH100/125/141 (GIFI balance sheet/income
statement/notes — 100/125 are blank fillable grids with no printed line
positions at all, cited by GIFI field code instead; a real filing bug was
found and fixed along the way: `capitalAssetsNet`/`costOfSales` were being
filed under the wrong GIFI leaf codes — see
`research/findings/federal/gifi-capital-assets-cost-of-sales-code-fix.md`),
the T2 jacket's identification/attachments pages (hand-built, no
`FormDefinition` backs pages 1-2 by design), EIFEL, and the
payments/instalments jacket line (840, alongside a citation fix to a wrong
890/894 claim in both the guided editor and `packages/ca-tax`'s
`settlement.ts`).

`t2/reserves.ts` — the one schedule shared verbatim by both T2 and AT1 (same
array holds federal opening/transfer/closing AND the Alberta override
fields) — was found to be MISSING its AT1-side view entirely (its `formView`
only ever rendered the federal `Schedule13FormView`; `Schedule17FormView`
was built but orphaned, unreachable from any AT1 engagement). Fixed via a
`ReservesFormView` wrapper that renders both, gating the AT1 section on
`engagement.program === "AT1"`.

T2SCH13's Part 1 (capital-gains reserves) is honestly not modelled — this
app has nowhere for that data to live at all (see the view's own doc
comment) — and several other schedules disclose real, deliberate scope gaps
the same way (e.g. T2SCH6's acquisition-date columns, T2SCH43's Part 4,
T2SCH125's farming section) rather than fabricating coverage. Some totals
are computed client-side as a live sum of already-collected rows when
federal T2 has no per-line `schedulePayloads` mechanism the way AT1 does —
confirmed case by case to be the exact arithmetic the engine itself performs,
not a re-derivation, so this carries no drift risk.
