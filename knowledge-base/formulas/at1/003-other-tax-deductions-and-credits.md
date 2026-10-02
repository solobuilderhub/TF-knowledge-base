# Schedule 3 — Alberta Other Tax Deductions and Credits

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-51 – 3-57 (PDF 51–57 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH03-other-tax-deductions-credits-TRA11725.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| ITC | Investor Tax Credit | X | If the corporation has Investor Tax Credit in the current year or carry forward amount from the prior year, then this section must be completed. | 3-51 |
| CITC | Capital Investment Tax Credit | X | If the corporation has Capital Investment Tax Credit in the current year or carry forward amount from the prior year, then this section must be completed. | 3-51 |
| APITC | Agri-Processing Investor Tax Credit | X | If the corporation has Agri- Processing Investment Tax Credit in the current year or carry forward amount from the prior year, then this section must be completed. | 3-52 |
| MAD | Maximum Allowable Deduction | — | — | 3-54 |
| AITC | Analysis of balance of Investor Tax Credit by year of origin | X | If the corporation has Investor Tax Credit, complete this section. | 3-54 |
| ACITC | Analysis of balance of Capital Investor Tax Credit by year of origin | X | If the corporation has Capital Investor Tax Credit, complete this section. | 3-55 |
| AAPITC | Analysis of balance of Agri-Processing Investment Tax Credit by year of origin | X | If the corporation has Agri- Processing Investment Tax Credit, complete this section. | 3-56 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 100 | Total amounts shown on all Investor Tax Credit certificates issued to the corporation during the year | $ | X | ITC | — | 3-51 |
| 102 | Total Investor Tax Credit amount carried forward from prior year(s) | $ | X | ITC | Value = 003108 from the preceding taxation year. | 3-51 |
| 104 | Amount applied to current taxation year | $ | X | ITC | Value cannot exceed 000068 - (000070 + 000071 + 000072 + 000074). Value must equal sum of all occurrences of 003126. | 3-51 |
| 106 | Deduct: Total Investor Tax Credit Expired | $ | X | ITC | Value must equal 003128. | 3-51 |
| 108 | Amount available for carry forward | $ | X | ITC | Value = 003100 + 003102 - 003104 - 003106. | 3-51 |
| 200 | Total amounts shown on all Capital Investment Tax Credit certificates issued to the corporation during the year | $ | X | CITC | — | 3-51 |
| 202 | Total Capital Investment Tax Credit amount carried forward from prior year(s) | $ | X | CITC | Value = 003208 from the preceding taxation year. | 3-52 |
| 204 | Amount applied to current taxation year | $ | X | CITC | If 003108 > 0, then value must equal zero. Otherwise, value cannot exceed 000068 - (000070 + 000071 + 000072 + 000074) - 003104. Value must equal sum of all occurrences of 003226. | 3-52 |
| 206 | Deduct: Total Capital Investment Tax Credit Expired | $ | X | CITC | Value must equal 003228. | 3-52 |
| 208 | Amount available for carry forward | $ | X | CITC | Value = 003200 + 003202 - 003204 - 003206. | 3-52 |
| 300 | Total amounts shown on all Agri-Processing Investment Tax Credit certificates issued to the corporation during the year | $ | X | APITC | — | 3-52 |
| 302 | Total Agri-Processing Investment Tax Credit amount carried forward from prior year(s) | $ | X | APITC | Value = 003316 from the preceding taxation year. | 3-52 |
| 304 | Amount applied from current taxation year | $ | X | APITC | Value cannot exceed 000068 - (000070 + 000072) - (003104 + 003204 + 003306 + 003308 + 003310). Value must equal occurrence 0 of 003336. | 3-53 |
| 306 | Agri-Processing Investment Tax Credit applied from 1st preceding taxation year | $ | X | APITC | Value cannot exceed 000068 - (000070 + 000072) - (003104 + 003204 + 003308 + 003310). Value must equal occurrence 1 of 003336. | 3-53 |
| 308 | Agri-Processing Investment Tax Credit applied from 2nd preceding taxation year | $ | X | APITC | Value cannot exceed 000068 - (000070 + 000072) - (003104 + 003204 + 003310). Value must equal occurrence 2 of 003336. | 3-53 |
| 310 | Agri-Processing Investment Tax Credit applied from 3rd to 10th preceding taxation years | $ | X | APITC | Value cannot exceed 000068 - (000070 + 000072) - (003104 + 003204). Value must equal the sum of occurrences 3 through 10 of 003336. | 3-53 |
| 312 | Total amount applied to current taxation year | $ | X | APITC | Value cannot exceed 000068 - (000070 + 000072) - (003104 + 003204). Value must equal the sum of lines 003304 + 003306 + 003308 + 003310 | 3-53 |
| 314 | Deduct: Total Agri- Processing Investment Tax Credit Expired | $ | X | APITC | Value must equal 003338 occurrence 10. | 3-53 |
| 316 | Amount available for carry forward | $ | X | APITC | Value = 003300 + 003302 - 003312 - 003314. | 3-54 |
| 600 | Investor Tax Credit and Capital Investment Tax Credit | $ | M | APITC | Value = 003104 + 003204 + 003312. | 3-54 |
| 602 | From AT1 page 2, line 068 - (lines 070 + 072 +074) | $ | M | APITC | Value = 000068 - (000070 + 000071 + 000072 + 000074). | 3-54 |
| 604 | Total Deduction (Alberta Other Tax Deductions and Credits) | $ | M | APITC | Value equals lesser of line 003600 and line 003602 | 3-54 |
| 120 | Occurrence number of preceding taxation year | N | X | AITC | 003120 must exist if 003122 exists. | 3-54 |
| 122 | Tax year end | D | X | AITC | For each occurrence of 003120, value = tax year end. 003122 must exist if 003124, 003125, 003126, 003128 or 003130 exists. | 3-54 |
| 124 | Investor Tax Credit balance at beginning of the year and transfers | $ | X | AITC | Enter the Investor Tax Credit balance at the beginning of each year. | 3-54 |
| 125 | Investor Tax Credit received during the year | $ | X | AITC | There should be no amount for occurrences 1 to 4. | 3-54 |
| 126 | Investor Tax Credit applied to reduce tax payable | $ | X | AITC | Value of 003126 must be less than or equal to 003124 + 003125. | 3-54 |
| 128 | Investor Tax Credit expired during the year | $ | X | AITC | Value must equal 003106. There should be no amount for occurrences 0 to 3. | 3-55 |
| 130 | Investor Tax Credit available for carry forward | $ | X | AITC | For each occurrence of 003120, calculate the value: 003124 + 003125 - 003126 - 003128. | 3-55 |
| 220 | Occurrence number of preceding taxation year | N | X | ACITC | 003220 must exist if 003222 exists. | 3-55 |
| 222 | Tax year end | D | X | ACITC | For each occurrence of 003220, value = tax year end. 003222 must exist if 003224, 003225, 003226, 003228 or 003230 exists. | 3-55 |
| 224 | Capital Investor Tax Credit balance at beginning of the year and transfers | $ | X | ACITC | Enter the Capital Investor Tax Credit balance at the beginning of each year. | 3-55 |
| 225 | Capital Investor Tax Credit received during the year | $ | X | ACITC | There should be no amount for occurrences 1 to 10. | 3-55 |
| 226 | Capital Investor Tax Credit applied to reduce tax payable | $ | X | ACITC | Value of 003226 must be less than or equal 003224 + 003225. | 3-55 |
| 228 | Capital Investor Tax Credit expired during the year | $ | X | ACITC | Value must equal 003206. There should be no amount for occurrences 0 to 9. | 3-55 |
| 230 | Capital Investor Tax Credit available for carry forward | $ | X | ACITC | For each occurrence of 003220, calculate the value: 003224 + 003225 - 003226 - 003228. | 3-55 |
| 330 | Occurrence number of preceding taxation year | N | X | AAPITC | 003330 must exist if 003332 exists. | 3-56 |
| 332 | Tax year end | D | X | AAPITC | For each occurrence of 003330, value = tax year end. 003332 must exist if 003334, 003335, 003336, 003338 or 003340 exists. | 3-56 |
| 334 | Agri-Processing Investment Tax Credit received in the taxation year | $ | X | AAPITC | Enter the original Agri-processing Investment Tax Credit (APITC) amount received for the taxation year | 3-56 |
| 335 | Agri-Processing Investment Tax Credit available for carry forward at beginning of the year | $ | X | AAPITC | The original Agri-processing Investment Tax Credit (APITC) amount received for the taxation year less the amount applied in prior year(s) | 3-56 |
| 336 | Agri-Processing Investment Tax Credit applied to reduce tax payable | $ | X | AAPITC | Value of 003336 occurrence 0 must be < or = to occurrence 0 line 003334 x 20%. Value of 003336 occurrence 1 must be < or = to occurrence 1 line 003334 x 30%. Value of 003336 occurrence 2 must be < or = to occurrence 2 line 003334 x 50%. Value of 003336 occurrences 3 through 10 must be < or = the sum of occurrences 3 through 10 of line 003335. | 3-56 |
| 338 | Agri-Processing Investment Tax Credit expired during the year | $ | X | AAPITC | Value must equal occurrence 10 line 003335- occurrence 10 line 003336. There should be no amount for occurrences 0 to 9. | 3-57 |
| 340 | Agri-Processing Investment Tax Credit available for carry forward at the end of the year | $ | X | AAPITC | For occurrence 0 value must equal occurrence 0 line 003334 - occurrence 0 line 003336. For occurrences 1 through 10 value must equal line 003335 - 003336 - 003338. | 3-57 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **003108** = `003100 + 003102 - 003104 - 003106`
- **003208** = `003200 + 003202 - 003204 - 003206`
- **003316** = `003300 + 003302 - 003312 - 003314`
- **003600** = `003104 + 003204 + 003312`
- **003602** = `000068 - (000070 + 000071 + 000072 + 000074)`

## Other AT1 lines referenced

`000068` · `000070` · `000071` · `000072` · `000074`
