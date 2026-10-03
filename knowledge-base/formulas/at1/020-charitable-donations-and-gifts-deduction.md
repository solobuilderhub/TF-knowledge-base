# Schedule 20 — Alberta Charitable Donations & Gifts Deduction

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-192 – 3-198 (PDF 192–198 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH20-charitable-donations-TRA11740.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** If 000060 and 000061 = 2, then do not allow completion of form 020. If the opening balances for charitable donations or gifts differ from the federal opening balances or if the current year’s claim for charitable donations and gifts differs from the federal claim, then form 020 is REQUIRED. If the corporation is reporting nil net income or a loss for the year, donations CANNOT be claimed – in this case, do NOT allow Schedule 20 to be created.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| MDC | Maximum deduction calculation for donations for taxation years starting after 1996 | M | Must be completed to determine the maximum deduction allowable for the taxation year. | 3-193 |
| GIFTS | Gifts | X | If the corp has made charitable donations of gifts to Canada or a province, gifts of certified cultural property or gifts of certified ecologically sensitive land, then this section must be completed. | 3-195 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 002 | Charitable donations at the end of the preceding taxation year | $ | M | — | If the Alberta charitable donations balance at the end of the preceding taxation year differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the ending balance of the preceding taxation year on the federal schedule 2. | 3-192 |
| 004 | Deduct: donations expired after five taxation years | $ | X | — | If 020002 is not equal to fed 002 amount A, then enter the Alberta charitable donations that have expired after five taxation years. Otherwise, value = fed 002239. | 3-192 |
| 008 | Add: donations transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the donations transferred upon amalgamation or wind-up of a subsidiary differ for Alberta purposes, then enter the Alberta amount. Otherwise, value = fed 002250. | 3-193 |
| 010 | Add: total current year charitable donations made | $ | X | — | Value must = fed 002210. | 3-193 |
| 013 | Deduct: Adjustment for an acquisition of control (for donations made after March 22, 2004) | $ | X | — | Value must = fed 002255 | 3-193 |
| 016 | Amount applied against taxable income: Lesser of: total donations available (line 014) and maximum deduction calculation (line 048) Not exceeding Alberta net income schedule 12 line 054. | $ | M | — | Enter the amount not exceeding the least of: 020002 - 020004 + 020008 + 020010 - 020013; or 020030 + [(020032 + 020034 + (least of 020036 and 020038 and 020040)) X .25]; or 012054. If amount is less than or equal to zero, value must equal zero. | 3-193 |
| 018 | Charitable donations closing balance: line 014 - 016 | $ | M | — | Value = 020002 - 020004 + 020008 + 020010 – 020013 - 020016. | 3-193 |
| 030 | Alberta net income for tax purposes*: schedule 12, line 054 X 75% | $ | M | — | Value = 012054 X .75 unless corporation is a credit union, then value will be Alberta net income for tax purposes before the deduction of payments pursuant to allocations in proportion to borrowing and bonus interest X .75. If negative, enter zero. | 3-194 |
| 032 | Taxable capital gains arising in respect of gifts of capital property | $ | X | — | If the amount of taxable capital gains arising in respect of gifts of capital property for Alberta purposes differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 002225. | 3-194 |
| 034 | Taxable capital gain in respect of deemed gifts of non-qualifying securities per ITA subsection 40(1.01) | $ | X | — | If the amount of taxable capital gains in respect of deemed gifts of non-qualifying securities for Alberta purposes differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 002227. | 3-194 |
| 036 | The amount of the recapture of capital cost allowance in respect of charitable gifts | $ | X | — | If the amount of the recapture of capital cost allowance in respect of charitable gifts for Alberta purposes differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 002230. | 3-195 |
| 038 | Proceeds of dispositions less outlays and expenses | $ | X | — | If the amount of the Alberta proceeds of dispositions less outlays and expenses differs from the federal amount, then enter the Alberta amount. Otherwise, value equals fed form 002 amount E. | 3-195 |
| 040 | The capital cost | $ | X | — | If the Alberta capital cost differs from the federal capital cost, then enter the Alberta amount. Otherwise, value equals fed form 002 amount F. | 3-195 |
| 062 | Gifts balance at the end of the preceding taxation year | $ | M | GIFTS | If the Alberta gifts balance at the end of the preceding taxation year differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the sum of the federal balances from fed form 002 at the end of the preceding taxation year for: 1. gifts to Canada or a province; 2. gifts of certified cultural property; and 3. gifts of certified ecologically sensitive land. | 3-196 |
| 064 | Deduct: gifts expired after five taxation years | $ | X | GIFTS | If 020062 is not equal to the equivalent federal amount, then enter the Alberta amount of gifts that have expired after five taxation years or after 10 taxation years for gifts made after February 10, 2014. Otherwise, value = fed 002339 + fed 002439 + fed 002539. | 3-196 |
| 068 | Add: gifts transferred on amalgamation or wind-up of a subsidiary | $ | X | GIFTS | If the gifts transferred upon amalgamation or wind-up of a subsidiary differ for Alberta purposes, then enter the Alberta amount. Otherwise, value = fed 002350 + fed 002450 + fed 002550. | 3-196 |
| 070 | Add: total current year gifts made | $ | X | GIFTS | Value must = fed 002310 + fed 002410 + fed 002510. | 3-197 |
| 073 | Deduct: Adjustment for an acquisition of control (for donations made after March 22, 2004) | $ | X | GIFTS | Value = fed 002355 + fed 002455 + fed 002555. | 3-197 |
| 076 | Deduct: Amount applied against taxable income | $ | M | GIFTS | Value cannot exceed the lesser of: 020062 - 020064 + 020068 + 020070 - 020073; or 012054 - 012056. | 3-197 |
| 078 | Gifts closing balance: line 074 - 076 | $ | M | GIFTS | Value = 020062 - 020064 + 020068 + 020070 - 020073 - 020076. | 3-197 |
| 090 | Year of origin YYYY/MM/DD | D | X | GIFTS | 020090 must exist if 020092, 020094, 020096, 020098 or 020100 exists. | 3-197 |
| 092 | Charitable donations available for carryforward | $ | X | GIFTS | If the Alberta charitable donations available for carryforward differ from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-197 |
| 094 | Gifts to Canada, a province, or territory available for carryforward | $ | X | GIFTS | If the Alberta gifts to Canada, a province, or territory available for carryforward differ from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-197 |
| 096 | Gifts of certified cultural property available for carryforward | $ | X | GIFTS | If the Alberta gifts of certified cultural property available for carryforward differ from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-198 |
| 098 | Gifts of certified ecological sensitive land available for carryforward | $ | X | GIFTS | If the Alberta gifts of certified ecological sensitive land available for carryforward differ from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-198 |
| 100 | Additional deduction for gifts of medicine available for carryforward | $ | X | GIFTS | If the Alberta additional deduction for gifts of medicine available for carryforward differ from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-198 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **020018** = `020002 - 020004 + 020008 + 020010 - 020013 - 020016`
- **020078** = `020062 - 020064 + 020068 + 020070 - 020073 - 020076`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 004 | 002239 |
| 008 | 002250 |
| 010 | 002210 |
| 013 | 002255 |
| 032 | 002225 |
| 034 | 002227 |
| 036 | 002230 |
| 064 | 002339, 002439, 002539 |
| 068 | 002350, 002450, 002550 |
| 070 | 002310, 002410, 002510 |
| 073 | 002355, 002455, 002555 |

## Other AT1 lines referenced

`012054` · `012056`
