# Schedule 16 — Alberta Scientific Research Expenditures

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-171 – 3-172 (PDF 170–172 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH16-scientific-research-TRA11737.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| SRE | Scientific Research Expenditures | — | — | 3-195 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 016 | Subtotal | $ | M | — | Calculate: 016002 - (016004 + 016006 + 016008) + 016010 + 016012 + 016014 + 016015. | 3-171 |
| 002 | Allowable current year SR&ED expenditures (from federal form 032 line 400) | $ | M | — | Value must equal fed 032400. | 3-195 |
| 004 | Deduct: Gov’t and non-gov’t assistance for expenditures (use federal schedule 32 (T661) line 430 from 2007 and prior versions; use sum of lines 429, 431 and 432 from 2008 and later versions) | $ | X | — | Value must equal fed 032430 from 2007 and prior versions OR sum of 032429, 032431 and 032432 from 2008 and later versions. | 3-195 |
| 006 | Deduct: Previous yr’s investment tax credit (ITC) claimed for SR&ED (from federal form 032 line 435) | $ | X | — | Value must equal fed 032435. | 3-195 |
| 008 | Deduct: Sale of SR&ED capital assets and other deductions (from federal form 032 line 440) | $ | X | — | Value must equal fed 032440. | 3-195 |
| 010 | Add: Repayments of government and non-government assistance for SR&ED (from federal form 032 line 445) | $ | X | — | Value must equal fed 032445. | 3-171 |
| 012 | Add: Unclaimed SR&ED expenditure pool balance from the previous year | $ | X | — | Enter the amount of Alberta unclaimed SR&ED expenditure pool balance from last year or the federal SR&ED expenditure pool balance from last year if the amount is the same for federal and Alberta purposes. | 3-171 |
| 014 | Add: SR&ED expenditure pool transfer from amalgamation or wind-up of a wholly-owned subsidiary | $ | X | — | If the amount of SR&ED expenditure pool transferred from amalgamation or wind-up of a wholly-owned subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 032452. | 3-171 |
| 015 | Add: Amount of ITC recaptured in the previous taxation year (from federal form 032 line 453) | $ | X | — | Value must equal fed 032453. | 3-171 |
| 018 | SR&ED expenditure pool deduction available | $ | X | — | If 016016 is positive, then value equals this amount. If 016016 is negative, default to zero. | 3-171 |
| 020 | Deduct: SR&ED expenditure pool deduction claimed | $ | M | — | Value cannot exceed 016018. | 3-172 |
| 022 | Unclaimed SR&ED expenditure pool deduction balance | $ | M | — | Value = 016018 - 016020 | 3-172 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **016016** = `016002 - (016004 + 016006 + 016008) + 016010 + 016012 + 016014 + 016015`
- **016022** = `016018 - 016020`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 032400 |
| 004 | 032430, 032431, 032432 |
| 006 | 032435 |
| 008 | 032440 |
| 010 | 032445 |
| 014 | 032452 |
| 015 | 032453 |
