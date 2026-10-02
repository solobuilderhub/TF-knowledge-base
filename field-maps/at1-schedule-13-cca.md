# Field map — AT1 Schedule 13, Alberta Capital Cost Allowance

**Captured from the live TRA-certified form**, 2026-08-07, tax year ending
31 December 2025. Raw capture: `_raw/_raw-at1-sch13.txt`. Screenshot:
`../validation/auratax/2026-08-07-cca-classes/screenshots/09-at1-sch13-alberta-cca.png`.

This is the authoritative column-and-line reference. Where it disagrees with the
transcription in `../sources/tra-spec/AT1-Chapter3-2025.2-full.txt`, **the live
form wins** — the specification's PDF-to-text extraction garbles some formulas, and
two of them were wrong (noted at the bottom).

Engine: `packages/ca-tax/src/t2/at1/schedules/schedule13-cca.ts`.

## Columns, in form order

The grid is rendered in three horizontally-scrolling blocks. Line numbers are the
Net File `013nnn` identifiers.

### Block 1 — inputs (columns 1-8)

| Col | Line | Name | Notes |
|---:|---|---|---|
| — | **125** | Immediate expensing limit | Per return, not per class. Only when associated with EPOPs |
| 1 | **001** | Class number | Picker, not free text |
| 2 | **003** | UCC at the beginning of the year | *"must equal the closing balance from last year's CCA schedule"* |
| 3 | **005** | Cost of acquisitions during the year | *"new property must be available for use"* |
| 4 | **039** | of which designated immediate expensing property (DIEP) | Subset of col 3 |
| 5 | **007** | **Net adjustments** | *"show negative amounts in brackets"* — **SIGNED** |
| 6 | **031** | Assistance received or receivable, subsequent to disposition | |
| 7 | **033** | Assistance repaid, subsequent to disposition | |
| 8 | **009** | Proceeds of dispositions | *"amount not to exceed the capital cost"* |

### Block 2 — the DIEP and AIIP machinery (columns 9-16)

| Col | Line | Name | Formula |
|---:|---|---|---|
| 9 | **041** | Proceeds of dispositions of the DIEP | input |
| 10 | — | **UCC for the year before CCA claim** | `col 2 + col 3 ± col 5 − col 8` |
| 11 | **043** | UCC of the DIEP | input |
| 12 | **045** | Immediate expensing | input, applies to col 11 |
| 13 | — | Cost of acquisitions on remainder of class | `col 3 − col 4 + col 11 − col 12` |
| 14 | **029** | of which AIIP or classes 54-56 | input |
| 15 | — | Remaining UCC | `col 10 − col 12`, floored at 0 |
| 16 | — | Proceeds available to reduce AIIP UCC | `col 8 − col 9 + col 6 − col 13 + col 14 − col 7` |

### Block 3 — adjustments, rate and result (columns 17-24)

| Col | Line | Name | Formula |
|---:|---|---|---|
| 17 | — | Net capital cost additions of AIIP | `col 14 − col 16` |
| 18 | **035** | UCC adjustment for AIIP | `col 17 × the relevant factor` |
| 19 | **037** | UCC adjustment for non-AIIP | `(col 13 − col 14 − col 6 + col 7 − col 8 + col 9) × 0.5` ← the half-year rule |
| 20 | **013** | CCA rate | `NA` where a rate does not apply |
| 21 | **015** | Recapture of capital cost allowance | |
| 22 | **017** | Terminal loss | |
| 23 | **019** | **CCA** | `(col 15 + col 18 − col 19) × col 20, or a lower amount, + col 12` — *"for declining balance method"* |
| 24 | **021** | UCC at the end of the year | `col 10 − col 23` |

### Totals, and where they go

| Line | Total of | Carries to |
|---|---|---|
| **023** | **Recapture** (col 21, line 015) | Schedule 12 line **006** — "Recapture of CCA for Alberta purposes" |
| **025** | **Terminal loss** (col 22, line 017) | Schedule 12 line **008** — "Terminal Loss for Alberta purposes" |
| **027** | **CCA** (col 23, line 019) | Schedule 12 line **004** — "Capital Cost Allowance for Alberta purposes" |

Stated on the form itself: *"Carry forward the amounts from lines 023, 025 and 027
to Schedule 12 lines 006, 008 and 004 respectively."*

**The order is a trap.** The footer lists the destinations as 006, 008, 004 — not
in ascending order — so reading it quickly suggests 023 is the CCA total because
CCA is the headline figure. It is not. Schedule 12 settles it independently:
*012004 "must equal the sum of all occurrences of **013019**"* (the CCA column),
*012006 = "…**013015**"* (recapture), *012008 = "…**013017**"* (terminal loss).

An earlier version of this map had these three swapped, and the payload builder
inherited the error — filing the CCA total against the recapture line. Right label,
wrong number, which is the failure mode that is hardest to spot on a filed return.

## The total algorithm, restated

Read column 23 carefully — it is the whole schedule in one line:

```
CCA = rate × ( UCC-after-immediate-expensing
              + AIIP first-year enhancement
              − half-year adjustment )
    + immediate expensing
```

Immediate expensing is **added on top**, not rate-multiplied — it is a 100%
write-off of DIEP, and the rate applies only to what is left. "or a lower amount"
is what makes CCA discretionary.

Closing UCC is then simply `UCC before CCA − CCA`. Recapture and terminal loss do
**not** appear in the closing-UCC formula; they leave the pool by other means and
are reported separately on lines 021 and 017.

## Filing rules

- **Forbidden** when jacket lines `000060` and `000061` are both 2 — the return
  declares no Alberta/federal divergence, so the form has nothing to say.
- **Required** when the opening UCC of any asset, or the CCA claim for any asset,
  differs from federal.
- `000060 = 1` **forces** `000061 = 1`, and either requires a valid Schedule 12.

Every substantive column reads *"if the X for Alberta purposes differ from the
federal X, enter the Alberta amount, otherwise enter fed 008nnn"* — this is a
reconciliation overlay on the federal Schedule 8, not a second CCA engine. That is
why `computeAlbertaSchedule13` runs the shared `computeCcaClass` twice rather than
reimplementing the mechanics.

## Corrections to the specification transcription

Two things in `findings/alberta/AT1-schedule13-cca.md` came from the spec text dump
and are wrong against the live form:

1. **There is no column `013011` "50% rule".** The half-year adjustment is column
   19, line **037**. The spec text lists an `011` and folds the half-year into the
   column-19 formula; the live form has no `011` field.
2. **Closing UCC is `col 10 − col 23`**, not
   `003 + 005 + 007 − 009 + 015 − 017 − 019`. Recapture and terminal loss are not
   subtracted from the closing balance.

Both are consistent with what the engine already computes.

## Federal counterpart

T2 Schedule 8 — see `t2-schedule-08-cca.md`. The column sets differ: the federal
form has separate AIIP and **RIIP** (reaccelerated) columns and no DIEP block in
the same shape, so the two maps are not interchangeable.
