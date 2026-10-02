# Field map — T2 Schedule 8, federal Capital Cost Allowance

**Captured from the live CRA-certified form**, 2026-08-07, tax year ending
31 December 2024. Raw capture: `_raw/_raw-t2-sch8.txt`. Screenshot:
`../validation/auratax/2026-08-07-cca-classes/screenshots/03-t2-sch8-cca-grid.png`.
Blank CRA PDF: `../sources/cra-forms/T2SCH08-cca.pdf`.

Engine: `packages/ca-tax/src/t2/schedules/schedule8.ts` (declining balance) and
`cca-straight-line.ts` (classes 13 and 14).

## Part 2 — the CCA calculation grid

One question precedes it: **line 101** — *"Is the corporation electing under
subsection 1101(5q) of the Income Tax Regulations?"* (separate class election for
certain buildings).

### Columns 1-8 — inputs

| Col | Line | Name |
|---:|---|---|
| 1 | **200** | Class number |
| 2 | **201** | Undepreciated capital cost (UCC) at the beginning of the year |
| 3 | **203** | Cost of acquisitions during the year *(new property must be available for use)* |
| 4 | **225** | of which **AIIP**, or property acquired before 2025 in classes 54-56 |
| 5 | **226** | of which **RIIP** (reaccelerated), or property acquired after 2024 in classes 54-56 |
| 6 | **205** | **Adjustments and transfers** *(show amounts that will reduce the UCC in brackets)* — **SIGNED** |
| 7 | **221** | of col 6 that is assistance received or receivable, subsequent to disposition |
| 8 | **222** | of col 6 that is repaid during the year, subsequent to disposition |

### Columns 9-16 — netting the incentive additions

| Col | Line | Name | Formula |
|---:|---|---|---|
| 9 | **207** | Proceeds of dispositions | input |
| 10 | — | **UCC** | `col 2 + col 3 ± col 6 − col 9` |
| 11 | — | Proceeds available to reduce AIIP/RIIP/class 54-56 additions | `col 7 + col 9 − col 3 + col 4 + col 5 − col 8` |
| 12 | — | Net capital cost additions of AIIP (and pre-2025 classes 54-56) | `col 4 − col 11` |
| 13 | — | Proceeds from col 11 available against RIIP | `col 11 − col 4` |
| 14 | — | Net capital cost additions of RIIP (and post-2024 classes 54-56) | `col 5 − col 13` |
| 15 | — | UCC adjustment for AIIP | `col 12 × the relevant factor` |
| 16 | — | UCC adjustment for RIIP | `col 14 × the relevant factor` |

### Columns 17-23 — the half-year rule, rate and result

| Col | Line | Name | Formula |
|---:|---|---|---|
| 17 | — | UCC adjustment for property **other than** AIIP/RIIP/classes 54-56 | `0.5 × (col 3 − col 4 − col 5 + col 8 − col 7 − col 9)` ← **the half-year rule** |
| 18 | **212** | CCA rate % | **alphanumeric** — `NA` where no rate applies |
| 19 | **213** | Recapture of CCA | |
| 20 | **215** | Terminal loss | |
| 21 | **217** | **CCA** | `(col 10 + col 15 + col 16 − col 17) × col 18, or a lower amount` — *"for declining balance method"* |
| 22 | **220** | UCC at the end of the year | `col 10 − col 21` |
| 23 | **224** | Year the property class became available for use | |

### Internal table (asset allocation)

| Col | Line | Name |
|---:|---|---|
| 1 | **300** | CCA class row number, from column 200 |
| 2 | **301** | Type of asset code |
| 3 | **302** | Province where the asset is located |
| 4 | **303** | Percentage allocated to the asset |

Feeds the provincial allocation, not the CCA amount.

## The total algorithm, restated

```
UCC before CCA = opening UCC + acquisitions ± net adjustments − dispositions
CCA            = rate × ( UCC before CCA
                        + AIIP enhancement
                        + RIIP enhancement
                        − half-year adjustment )      ... or any lower amount
closing UCC    = UCC before CCA − CCA
```

Three things worth pinning down, because each is a place a naive implementation
goes wrong:

1. **Column 6 is signed.** Assistance received reduces the pool; assistance repaid
   restores it. It is not an acquisition, so it sits *outside* the half-year and
   AIIP calculations — it enters the pool at column 10 and nowhere else.
2. **The half-year rule is on NET additions**, not gross: dispositions and
   assistance are subtracted before halving (column 17). Halving gross additions
   overstates the reduction whenever there were dispositions.
3. **The AIIP/RIIP enhancement lifts the rate base, not the pool.** Column 21 can
   compute more than the UCC actually available, so the claim must still be capped
   at the pool.

## Straight-line classes are NOT computed by this grid

Column 21's caption scopes its own formula: *"CCA (**for declining balance
method** …)"*. Column 18 accepts `NA`.

The class picker labels every class with its rate, and the three that matter here
read: **`Class 13 (Varies)`**, **`Class 14 (Varies)`**, **`Class 14.1 (5%)`**
(full list in `../validation/auratax/2026-08-07-cca-classes/cca-class-list.txt`).

So classes 13 and 14 have no rate to put in column 18, and the certified preparer
we compared against leaves the column 21 figure to be typed in. Our engine computes
them instead:

- **Class 13** — Reg 1100(1)(b) + Schedule III, per-layer straight line. See
  `../findings/federal/CCA-straight-line-classes.md`.
- **Class 14** — Reg 1100(1)(c), day-based over each property's own remaining life.
- **Class 14.1** — a *declining-balance* class at 5%, so it goes through this grid
  normally, plus the pre-2027 transitional additional allowance under
  Reg 1100(1)(c.1)/(c.2).

## Alberta counterpart

AT1 Schedule 13 — see `at1-schedule-13-cca.md`. The Alberta form has a **DIEP /
immediate-expensing block** where the federal form has the RIIP columns, and its
totals carry to Alberta Schedule 12. The two maps are not interchangeable.
