# AT1 Schedule 13 — Alberta Capital Cost Allowance

**Source:** Alberta TRA, *Corporate Income Tax Net File Specifications*, Chapter 3
v2025.2, §3.2.3.14. Local copy: `research/spec/AT1-Chapter3-2025.2-full.txt`
(lines 11057-11660).

**Status:** implemented. `packages/ca-tax/src/t2/at1/schedules/schedule13-cca.ts`,
17 tests in `tests/at1-schedule13-cca.test.ts`.

## The finding: this is a reconciliation form, not a second CCA calculator

The obvious way to build AT1 Schedule 13 is to write an Alberta CCA engine. That
would be wrong, and expensively so — two engines drifting apart is the classic
way a tax product starts producing inconsistent returns.

Every substantive line of the Alberta form says the same thing:

> "For each occurrence of 013001, if the *X* for Alberta purposes differ from the
> federal *X*, enter the Alberta amount. **Otherwise, enter the amount at fed
> 008*nnn*.**"

The mechanics — half-year rule, AIIP enhancement, immediate expensing of DIEP,
recapture, terminal loss, the declining-balance rate — are the federal ones,
unchanged. Alberta's contribution is a *divergence* layer: which columns differ,
and by how much.

So the implementation runs the **same** `computeCcaClass` twice, once on the
federal row and once on the row after Alberta overrides are merged in. There is
one set of mechanics and one place a bug can live.

## Line map

| Line | Name | Federal default |
|---|---|---|
| 013125 | immediate expensing limit (per return) | fed 008125 |
| 013001 | class number | — |
| 013003 | UCC at the beginning of the year | fed 008201 |
| 013005 | cost of acquisitions | fed 008203 |
| 013029 | of which AIIP or class 54-56 | fed 008225 |
| 013039 | of which DIEP | subset of 008203 |
| 013007 | net adjustments | fed 008205 |
| 013009 | proceeds of dispositions | fed 008207 |
| 013031 | assistance received after disposition | fed 008221 |
| 013033 | assistance repaid after disposition | fed 008222 |
| 013011 | 50% rule | fed 008211 |
| 013013 | CCA rate | fed 008212 |
| 013015 | recapture | — |
| 013017 | terminal loss | — |
| 013019 | capital cost allowance | — |
| 013021 | UCC at the end of the year | — |

Two formulas are stated exactly and are enforced:

```
013019 ≤ [(013003 + 013005 + 013007 − 013009) − 013011] × 013013 × min(days, 365) ÷ 365
013021 =   013003 + 013005 + 013007 − 013009 + 013015 − 013017 − 013019
```

## Filing rules

- **Forbidden** when `000060 = 2` and `000061 = 2` — the return declares no
  Alberta/federal divergence at all, so there is nothing for the form to say.
- **Required** when the opening UCC of any asset, or the CCA claim for any asset,
  differs from federal.
- `000060 = 1` **forces** `000061 = 1`, and either one requires a valid
  Schedule 12.

The engine reports `formRequired` and `formPermitted` separately and raises an
issue on the contradiction (required but not permitted), because that combination
is a filer error the TRA will reject rather than something the engine can resolve.

## Two changes this drove in the shared code

**1. A `netAdjustments` column was missing from the federal Schedule 8.** Both
forms have it (fed 008205 / AT1 013007) and neither the federal nor the Alberta
closing-UCC formula balances without it. It is signed — assistance received
reduces the pool, assistance repaid restores it — and it sits *outside* the
half-year and AIIP calculation because it is not an acquisition. Added to
`CcaClassInput`; the federal closing UCC is now `opening + additions +
netAdjustments − dispositions − CCA`.

**2. A name collision.** The federal T2 Schedule 13 is *Continuity of Reserves*
and already exported `computeSchedule13`. Two different schedules share the
number 13 across the two returns. The Alberta one is exported as
`computeAlbertaSchedule13` / `AlbertaSchedule13Input` / `AlbertaSchedule13Result`,
matching the existing `computeAlbertaSbd` / `computeAlbertaTax` convention. Worth
knowing that the same collision exists for other numbers and the `Alberta` prefix
is the rule, not an exception.

## Short-year proration

`013019` prorates by `min(days, 365) ÷ 365`. The cap matters: a 366-day leap year
is **not** prorated *up* to 366/365. This is distinct from the general-rate
day-weighting (see `AT1-general-rate-day-weighting.md`), which divides by the
actual days in the year, leap year included.

## Closed, 2026-09-03

**Straight-line classes — this "Open" item was stale.** Re-checked
`schedule13-cca.ts` directly: `computeAlbertaSchedule13` already has
dedicated `computeClass13Pair`/`computeClass14Pair` handling (full
leasehold/limited-life mechanics via `computeClass13`/`computeClass14`, not
the generic throwing path), and class 14.1 already works through the
generic `computeCcaClass` path since it's a plain 5% declining-balance class
— confirmed empirically (`{ccaClass: '14.1', openingUCC: 100000, additions:
20000}` computes cleanly, no throw). This must have been built during
earlier CCA work in this same session and the finding was never updated.
Existing test coverage (`tests/at1-schedule13-cca.test.ts`, "a NEW class 13
leasehold addition") already proves it.

**013035/013037 — genuinely open, now closed.** Downloaded the rendered PDF
(`research/sources/tra-forms/pdf/AT1SCH13-cca-TRA11733.pdf`, TRA11733,
already vendored) and rendered both pages via PyMuPDF — `pdftotext -layout`
extracts none of this form's line numbers at all for this grid, confirming
the finding's own caution. Read directly:

- **013035** (column 18): "UCC adjustment for AIIP and property included in
  Classes 54 to 56 (column 17 multiplied by the relevant factor)" — this
  IS the engine's own `aiipEnhancement`.
- **013037** (column 19): "UCC adjustment for property acquired during the
  year OTHER than AIIP … (0.5 multiplied by …)" — this IS the engine's own
  `halfYearAdjustment`.
- Column 23 (013019, the actual CCA claimed) confirms the mapping: "for
  declining balance method, the result of column 15 plus column 18 minus
  column 19 … multiplied by column 20 [rate]" — exactly
  `computeCcaClass`'s own `ccaBase = uccBeforeCca − immediateExpensingClaim
  − halfYearAdjustment + aiipEnhancement`.

So this was pure EMISSION, not new arithmetic — both figures were already
computed correctly, just never written to the Net File payload. Added
`put('035', c.alberta.aiipEnhancement)` / `put('037',
c.alberta.halfYearAdjustment)` to `schedule13Values` in
`at1-schedule-line-items.ts`. Both are nil for the straight-line classes
(13/14), matching the form's own "for declining balance method" scoping of
the column-23 formula they feed.

Regression tests added to `tests/at1-netfile-schedules.test.ts`: AIIP vs.
non-AIIP additions route to the correct line (and suspend the other, per
the AIIP mechanic), and a straight-line class-13 row emits nil for both.
