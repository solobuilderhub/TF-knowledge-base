# Schedule 13 — Alberta Capital Cost Allowance

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-120 – 3-126 (PDF 120–126 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH13-cca-TRA11733.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** If 000060 and 000061 = 2, then do not allow the completion of form 013. If the opening UCC balance of any asset or the CCA claim for any asset for Alberta purposes differs from that for federal purposes, then form 013 is REQUIRED to be completed.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| CCA | Capital Cost Allowance | — | — | 3-120 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 125 | Immediate expensing limit | $ | X | — | If a corporation is associated with one or more EPOPs, the immediate expensing allocated amount value should = fed 008125. If a corporation is not associated with one or more EPOPs, line 125 should be left blank. | 3-120 |
| 001 | Class number | AN | M | — | If there is an asset, then enter the class number that relates to that asset. If no class number, use the regulation number from the Income Tax Act | 3-120 |
| 003 | Undepreciated capital cost at the beginning of the year | $ | M | — | For each occurrence of 013001, if the opening balance is different for Alberta purposes, enter the amount of Alberta UCC from last year. Otherwise, if the amount is the same as federal, then value = fed 008201. | 3-120 |
| 005 | Cost of acquisitions during the year | $ | X | — | For each occurrence of 013001, if the acquisitions for Alberta purposes differ from the federal acquisitions, enter the Alberta amount. Otherwise, enter the amount at fed 008203 for each occurrence. | 3-122 |
| 039 | Cost of acquisitions from column 3 that are designated immediate expensing property (100) | $ | X | — | A DIEP reported in column 4 is a property acquired after April 18, 2021 by a corporation that was a Canadian-controlled private corporation (CCPC) throughout the year, which became available for use in the tax year (before 2024) and was designated as such on or before the day that is 12 months after the filing-due date for the tax year to which the designation relates. It includes all capital property subject to the CCA rules other than property included in Classes 1 to 6, 14.1, 17, 47, 49 and 51. A property can only qualify as DIEP in the year in which it becomes available for use. See subsection 1104(3.1) of the federal regulations for more information. | 3-122 |
| 029 | Cost of acquisitions from column 13 that are accelerated investment incentive properties (AIIP) or properties included in Classes 54 to 56 | $ | X | — | For each occurrence of 013001, if the acquisitions for Alberta purposes differ from the federal acquisitions, enter the Alberta amount. Otherwise, enter the amount at fed 008225 for each occurrence. | 3-123 |
| 007 | Net adjustments | $ | X | — | For each occurrence of 013001, if the adjustments made to the class in the taxation year for Alberta purposes differ from the federal adjustments, enter the Alberta amount. Otherwise, enter the amount at fed 008205 for each occurrence. | 3-123 |
| 031 | Amount from column 5 that is assistance received or receivable during the year for a property, subsequent to its disposition | $ | X | — | For each occurrence of 013001, if the assistance received or receivable during the year for Alberta purposes differ from the federal assistance, enter the Alberta amount. Otherwise, enter the amount at fed 008221 for each occurrence. | 3-123 |
| 009 | Proceeds of dispositions during the year | $ | X | — | For each occurrence of 013001, if assets in the class were disposed of during the year and the proceeds of disposition for Alberta purposes differs from the federal proceeds of disposition, enter the Alberta amount. Otherwise, enter the amount at fed 008207. Note proceeds cannot exceed the original capital cost of an asset. | 3-123 |
| 041 | Proceeds of dispositions of the DIEP | $ | X | — | — | 3-124 |
| 043 | UCC of the DIEP | $ | X | — | The only amounts incurred before April 19, 2021 to be included in this column are certain inventory purchases from arm’s length persons or partnerships where the conditions in paragraphs 1100(0.3) (a) to (c) of the federal regulations are met. | 3-124 |
| 045 | Immediate expensing | $ | X | — | Immediate expensing applies to DIEP included in column 11. | 3-124 |
| 033 | Amount from column 5 that is repaid during the year for a property, subsequent to its disposition | $ | X | — | For each occurrence of 013001, if the assistance repaid for Alberta purposes differ from the federal repaid, enter the Alberta amount. Otherwise, enter the amount at fed 008222 for each occurrence. | 3-125 |
| 011 | 50% rule | $ | X | — | For each occurrence of 013001, if the amount for Alberta purposes is the same as for federal purposes, enter the corresponding amount from fed 008211. Otherwise, enter the Alberta amount. | 3-125 |
| 035 | UCC adjustments for AIIP acquired during the year | $ | X | — | For each occurrence of 013001, value = 013029 - (013009 + 013031 + 013005 + 013029 - 013033) x relevant factor; If negative, value = 0. | 3-125 |
| 037 | UCC adjustments for non- AIIP acquired during the year | $ | X | — | For each occurrence of 013001, value = 013005 - 013029 - 013031 + 013033 - 013009 x ½; If negative, value = 0. | 3-125 |
| 013 | CCA rate | AN | M | — | For each occurrence of 013001, default to the rate from fed 008212 for the same class item. Allow input for classes where the rate is elective. Format may include a decimal if the rate includes a fractional percentage (i.e. express 20% as 20 and 10.5% as 10.5). If a rate is not applicable, enter NA. | 3-125 |
| 015 | Recapture of capital cost allowance | $ | X | — | Can only exist when (013003 + 013005 + 013007 - 013009) for the pool becomes negative, then the negative amount so calculated is to be entered as a positive value for each occurrence of 013015. | 3-126 |
| 017 | Terminal Loss | $ | X | — | For each occurrence of 013001, enter the amount of terminal loss. For this occurrence, the value cannot exceed 013003 + 013005 + 013007 - 013009 and fed 008220 must equal zero for this same class item. | 3-126 |
| 019 | Capital cost allowance | $ | M | — | For each occurrence of 013001 and if it is a declining balance, the value cannot exceed: [(013003+013005+ 013007-013009) - 013011] X 013013 X number of days in taxation year (max 365)/365. | 3-126 |
| 021 | Undepreciated capital cost at the end of the year | $ | M | — | Value = 013003 + 013005 + 013007 - 013009 + 013015 - 013017 - 013019 | 3-126 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **013021** = `013003 + 013005 + 013007 - 013009 + 013015 - 013017 - 013019`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 125 | 008125 |
| 003 | 008201 |
| 005 | 008203 |
| 029 | 008225 |
| 007 | 008205 |
| 031 | 008221 |
| 009 | 008207 |
| 033 | 008222 |
| 011 | 008211 |
| 013 | 008212 |
| 017 | 008220 |
