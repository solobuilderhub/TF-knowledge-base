# AT1 Schedule 14 — Alberta Cumulative Eligible Capital Deduction

**Status: removed, 2026-09-04.**

Eligible capital property was repealed 1 January 2017 — the cumulative
eligible capital pool (goodwill, customer lists, incorporation costs,
unlimited-life licences) was folded into CCA class 14.1. TRA kept Schedule 14
alive for exactly one case: a corporation whose tax year straddles
2016-12-31. By 2026 that covers only returns for tax years that ended by
~2017-2018 — no current or realistically amendable filing needs it. Alberta's
own current corporate-income-tax forms page no longer lists Schedule 14 at
all, and AuraTax (the certified competitor this repo uses as a live oracle)
doesn't offer it either (`research/validation/auratax/2026-08-07-cca-classes/`
and the AT1 schedules 5-11 validation notes).

A compute module (`schedule14-cec.ts`, 18 tests) had been built against the
TRA spec for completeness, but it was never wired to anything: no server
composer, no `schedulePayloads` filing builder (it was named in
`AT1_SCHEDULES_WITHOUT_BUILDERS` from day one), no guided-editor UI. Dead
code with no path to a filed return. Removed rather than left half-built:
the module, its test file, its exports from `packages/ca-tax/src/t2/at1/index.ts`,
and its references in `at1-schedule-line-items.ts`'s doc comments.

If this schedule is ever genuinely needed (a preparer with a real
straddling-year amendment), the prior research is preserved in git history —
search this file's history for the full line-map, arithmetic, and the
negative-pool ("Amount to be Included in Income Arising from Disposition")
section this project had already worked out before removal.
