# AT1 jacket (schedule 000) — comparison session, prompted by "schedule 0 doesn't match"

> **Stale count, corrected 2026-09-01**: item 1 below cites "74 fields / 51
> mandatory" as the jacket's authoritative field list. A later investigation
> (`research/findings/alberta/AT1-jacket-line-001-extractor-boundary.md`)
> found 3 of those 74 were fabricated (misattributed from AT1 Schedule 1 by an
> extractor bug); the corrected, current count is 72 fields / 49 mandatory
> (71 from `jacket.captions.ts` + 1 hand-authored `LINE_001`, since real
> filed samples prove line 001 genuinely belongs to the jacket despite not
> appearing in the spec's own tabular MAPPINGS). This session's own
> live-browser verification of the jacket UI (the rest of this document) is
> otherwise unaffected — it did not depend on the exact field count.

**Date:** 2026-08-29
**Subject:** does our AT1 jacket UI have a real, separate defect (distinct from
the Schedule 29 gap already found and fixed this session)?
**Status:** AuraTax leg blocked (no cached session, no credentials). Own-app
leg completed. Ground-truth-vs-code leg completed.

## Blocked on AuraTax

`app.auratax.ca` redirected straight to `auth.auratax.ca/u/login/identifier`
— no cached login in this browser profile. Per house rules
(`research/validation/README.md`), did not create a new account or guess
credentials. Screenshot: `screenshots/01-auratax-login-required.png`.

## What was checked instead

1. **`packages/ca-tax/src/t2/at1/forms/jacket.ts` +
   `generated/jacket.captions.ts`** (TRA Chapter 3 spec, 74 fields / 51
   mandatory) — the authoritative field list for the full AT1 return.
2. **The return editor's "Alberta AT1 jacket" schedule**
   (`apps/web/.../return/_config/schedules/alberta.ts`), live in the browser
   — created a fresh account, client (BN 100092287), and AT1 engagement
   (`.../engagements/6a9276a28c67269e4f9bb1e4/return`), opened the AT1 tab.
   Screenshot: `../../../..` (see scratchpad path in final report — not
   committed here as it's a throwaway QA account).
3. **The `/jacket` full-document view** (`_shared/jacket-document.tsx`,
   `buildJacket`) — same engagement, `/jacket` route.

## Finding

No defect. The return editor's "Alberta AT1 jacket" schedule is a
**deliberately partial input form** — by design (see the doc comment at the
top of `alberta.ts`) it only collects the ~13 fields TRA's spec can't derive
from the client record, the federal return, or the engine: grossRevenue
(047), totalAssets (048), nine mandatory Yes/No questions (001, 031, 032,
038, 050, 054, 060, 061, 095), corporationStatus, wasCcpcThroughoutYear, and
royaltyTaxDeduction. Every caption, line number, and required flag rendered
live matched `jacket.ts`/`alberta.ts` exactly — verified via
`agent-browser get text main` against the panel.

The **full 74-line AT1 return** (identification, addresses, contact, income,
tax calc, five credits, certification) renders separately at
`/dashboard/engagements/{id}/jacket` via `buildJacket()` — but only *after*
the return is computed ("This return hasn't been computed yet — the jacket
appears once you compute it").

## Likely explanation for the user's complaint

A preparer who opens the return editor's "AT1" tab expecting AuraTax's single
full-page AT1 return, and instead sees ~13 fields, has good reason to say "it
doesn't match at all" — even though nothing is broken. The full jacket exists,
just on a different route and gated behind compute. This is a UX/discoverability
gap (the split isn't obvious from the editor), not a data-correctness bug. No
code fix applied — recommending the product team either link to the full
`/jacket` view more prominently from the editor's AT1 tab, or add a passive
read-only preview of the derived fields inline.

## Screenshots

| File | What it shows |
|---|---|
| `screenshots/01-auratax-login-required.png` | AuraTax redirected to login — access blocked, no credentials available |
