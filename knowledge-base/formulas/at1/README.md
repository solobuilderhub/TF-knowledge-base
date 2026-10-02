# AT1 formulas — TRA Chapter 3 (§3.2.3), form by form

> **Ruleset** `at1-tra-ch3-2026.4` · **Source** `sources/tra-spec/AT1-Chapter3-2026.4.pdf` (sha256 `6dcebc6dd25cab4e…`)  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit.

Every line of every current AT1 form, with its business rule **verbatim** and the spec page it is printed on. Read the form page before implementing or changing a form; cite the rule in the code.

| Form | Page | Lines | Mandatory | Formulas | Federal refs | Spec pages |
|---|---|---|---|---|---|---|
| 000 | [AT1 Alberta Corporate Income Tax Return (jacket)](./000-jacket.md) | 71 | 48 | 2 | 42 | 3-20 – 3-39 |
| 001 | [Schedule 1 — Alberta Small Business Deduction](./001-small-business-deduction.md) | 10 | 7 | 0 | 12 | 3-41 – 3-45 |
| 002 | [Schedule 2 — Alberta Income Allocation Factor](./002-income-allocation-factor.md) | 43 | 1 | 0 | 72 | 3-46 – 3-50 |
| 003 | [Schedule 3 — Alberta Other Tax Deductions and Credits](./003-other-tax-deductions-and-credits.md) | 43 | 3 | 5 | 0 | 3-51 – 3-57 |
| 004 | [Schedule 4 — Alberta Foreign Investment Income Tax Credit](./004-foreign-investment-income-tax-credit.md) | 5 | 1 | 0 | 4 | 3-58 – 3-59 |
| 010 | [Schedule 10 — Alberta Loss Carry-Back Application](./010-loss-carry-back-application.md) | 40 | 8 | 0 | 7 | 3-89 – 3-98 |
| 012 | [Schedule 12 — Alberta Income/Loss Reconciliation](./012-income-loss-reconciliation.md) | 71 | 35 | 1 | 55 | 3-102 – 3-119 |
| 013 | [Schedule 13 — Alberta Capital Cost Allowance](./013-capital-cost-allowance.md) | 21 | 5 | 1 | 11 | 3-125 – 3-126 |
| 015 | [Schedule 15 — Alberta Resource Related Deductions](./015-resource-related-deductions.md) | 127 | 33 | 10 | 97 | 3-134 – 3-169 |
| 016 | [Schedule 16 — Alberta Scientific Research Expenditures](./016-scientific-research-expenditures.md) | 12 | 4 | 2 | 9 | 3-171 – 3-172 |
| 017 | [Schedule 17 — Alberta Reserves](./017-reserves.md) | 24 | 0 | 0 | 15 | 3-173 – 3-179 |
| 018 | [Schedule 18 — Alberta Dispositions of Capital Property](./018-dispositions-of-capital-property.md) | 46 | 5 | 1 | 34 | 3-181 – 3-191 |
| 020 | [Schedule 20 — Alberta Charitable Donations & Gifts Deduction](./020-charitable-donations-and-gifts-deduction.md) | 27 | 7 | 2 | 19 | 3-192 – 3-198 |
| 021 | [Schedule 21 — Alberta Calculation of Current Year Loss and Continuity of Losses](./021-calculation-of-current-year-loss-and-continuity-of-losses.md) | 85 | 34 | 13 | 59 | 3-200 – 3-219 |
| 029 | [Schedule 29 — Alberta Innovation Employment Grant](./029-innovation-employment-grant.md) | 39 | 17 | 0 | 0 | 3-220 – 3-230 |

## Not here, deliberately

The specification still carries tables for legacy forms — Schedules 5, 6, 7, 8, 9, 11, 14 and Schedule 12 lines 010, 011, 012, 013. TRA no longer publishes them, the printed forms do not carry them, and they are not implemented. Evidence: `research/evidence/at1-schedule-universe/2026-09-29/README.md`.

## Pipeline

```
research/sources/tra-spec/AT1-Chapter3-2026.4.pdf
  → research/tools/rulebook/adapters/tra-chapter3.py   (PyMuPDF, by word position)
  → packages/ca-tax/spec/at1/forms/<form>.json + manifest.json (private repo; the source of truth)
  → packages/ca-tax/scripts/rulebook/render.ts
      → src/t2/at1/filing/generated/at1-spec-rows.ts  (shipped: M/O/X, types, sections — no rule text)
      → research/knowledge-base/formulas/at1/*.md      (these pages)
```

Design and the T2 extension: `research/PLAN-rulebook-pipeline.md`.
