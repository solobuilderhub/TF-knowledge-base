# Schedule 4 — Alberta Foreign Investment Income Tax Credit

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-58 – 3-59 (PDF 58–59 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH04-foreign-investment-income-tax-credit-TRA11728.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| FIC | Foreign Investment Credits | — | — | 3-58 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 004 | Alberta Foreign Investment Income Tax Credit | — | X | — | AB form 004 may exist only if fed form 021 exists. Sort the field occurrences in the same order as on the federal form. If the calculations result in Allowable Credits = zero, (i.e. total of all occurrences of 004012 = 0), then do not print form 004. | 3-58 |
| 002 | Country in which foreign non-business income was earned. | A | M | — | Must equal all occurrences of fed 021100. | 3-58 |
| 006 | Foreign investment income tax paid, net of amounts deducted from Income. | $ | X | — | If 004004 exists and the ITA subsection 20(12) deduction was computed differently for Alberta purposes for the occurrence, then value for the occurrence will be: fed 021120 minus the greater of the Alberta amount deducted from income per ACTA 8(2.2) and fed 021130. Otherwise, value will be: [fed 021120 minus fed 021130 for the occurrence]. NOTE: If ITA 20(12) deduction differs from the ACTA 8(2.2) deduction, 012040 must include the total of these Alberta amounts. These would be offset by the total federal 021130 values included in 012050. | 3-58 |
| 008 | Federal non-business foreign tax credit. | $ | X | — | Must equal all occurrences of fed 021180. | 3-59 |
| 012 | Allowable Credit (Lesser of D or G) | $ | X | — | Must equal the lesser of: 004004 X 000065 X [000068/((000062 – 000064) X 000065)] or (004006 - 004008) X 000065 (Calculate to 3 decimal places rounding up at 5.) | 3-59 |

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 021100 |
| 006 | 021120, 021130 |
| 008 | 021180 |

## Other AT1 lines referenced

`000062` · `000064` · `000065` · `000068` · `012040` · `012050`
