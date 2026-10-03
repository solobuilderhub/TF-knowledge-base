# Gap reports — AT1 Schedules 1 and 2 (validated 2026-10-03)

Two external gap reports (`gap-report-schedule1.md`, `gap-report-schedule2.md`) compared our
formulas with TRA Chapter 3. They were written against server `e9944c0`, which predates the
0.0.35 work, so every claim was re-checked against current code (server `9c56399`, ca-tax
0.0.35). Verdicts and what was done:

## Fixed

| Item | Verdict | Fix |
|---|---|---|
| G1-06 line 009 base and foreign-tax-credit term | already fixed in 0.0.35 | 009 = 062 − (2.5 × T2 636 + 10/3 × S4 008), before allocation; the jacket SBD is Schedule 1's least-of-three × 021 |
| G2-00 title row overwrote the real line (and dropped 12 conditions) | real, and wider than reported: 002, 004, 010, 015, 017, plus phantom 018 / 020 lines | extractor: first same-numbered row is the title when another follows (`tra-chapter3.py`) |
| G2-03 / G1-07 outside Canada | real, high | Outside Canada is a row of the allocation (T2 Schedule 5 row 027, lines 127 / 167; totals 129 / 169). 065 on the full totals; 019 / 020 derived from that row (or typed on Schedule 1 for an AT1 prepared without the T2 grid); 021 recomputed with them off the bases |
| G2-01 Schedule 2 existence rule | real | filed only if 062 > 0 and Alberta < the totals (Area B: 062 > 0) |
| G1-10 Schedule 1 filed for an ineligible corporation | real | gated on `result.eligible` (029 = 1/2 or 030 = 3/4; never 030 = 5) |
| G2-08 form-definition errors | real | 002–008 conditional; T2SCH5 links 119 / 129 / 159 / 169; ship note "062 − 064" |

## Open (not yet fixed)

| Item | Note |
|---|---|
| G1-03 / G1-04 / G1-08 / G1-09 | one source for association and allocation: derive 001 from the federal list / T2 line 160, A from 001045, and add the Area A cross-checks (filer first, CAN = 000034, Σ045 ≤ 200,000) |
| G2-02 / G2-04 / G2-05 | line 001 from fed 005100; a partly typed Area A override reads blanks as nil; Area B is not prefilled from Schedule 5 |
| G2-07 | a dormant multi-province year gives Alberta 0%; federal splits equally |
| G1-05 | no pre-2022-04-07 branch ($11,250 divisor) |
| Reg. 413 | non-residents take totals less 127 / 167; not modelled (type the Area A boxes without the outside-Canada amounts) |

## Decisions, not bugs

- **G1-01 / G1-02.** The printed form's Area B and the Net File rule disagree (passive-income
  reduction at 015; proration only below 357 days vs every year). The engine follows the
  printed form. Recommended: ask TRA which they want.
- **G1-11.** The printed form's footnote says 2001 and line 003's rule says 2002. Both are
  transcribed correctly; the inconsistency is TRA's.
