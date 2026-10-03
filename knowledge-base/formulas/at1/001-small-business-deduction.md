# Schedule 1 — Alberta Small Business Deduction

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-41 – 3-45 (PDF 41–45 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH01-small-business-deduction-TRA11723.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** If: • 000029 = 1 or 2 throughout the taxation year or 000030 = 3 or 4 (i.e. Alberta co-op or credit union), and • Schedule 12 exists and 012102 + 012104 > 0 or, if schedule 12 does not exist, fed 200400 > 0, then form 001 can be completed. If 000030 = 5 (i.e. sec. 149 exempt), then form 001 cannot exist. SBD cannot be claimed.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| APASBD | Association for Purposes of the Alberta Small Business Deduction | — | — | 3-41 |
| ASBD | Alberta Small Business Deduction | — | — | 3-41 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 001 | Is the corporation associated with one or more Canadian-controlled private corporations? | N | M | — | If fed 200160 equals 1 or fed form 023 exists, then value = 1 (Yes). If fed 200160 is blank and there is no fed form 023, then 001001 must be completed. Allow input of a valid code 1 (Yes) or 2 (No). | 3-41 |
| 003 | Inc. from active business carried on in Canada as reported on the T2 line 400 OR schedule 12, line 106 | $ | M | — | If form 012 exists and 012100 = 1, then value = 012102 + 012104. If negative, default = 0. Otherwise, if form 012 does not exist, default to fed 200400. Note: if fed 200400 includes specified partnership income and the tax year ends after March 31, 2002, then fed Schedule 7 column G must be recalculated using the applicable small business threshold to arrive at the Income from active businesses for Alberta purposes. Threshold are: $300,000 on April 1, 2001 $350,000 on April 1, 2002 $400,000 on April 1, 2003 $430,000 on April 1, 2007 $460,000 on April 1, 2008 $500,000 on April 1, 2009 The amount must be prorated by the number of days in the partnership’s fiscal period straddling the threshold dates. See AT1 Guide for more details. | 3-41 |
| 009 | Taxable Income (less adj. For foreign tax credits. See Guide for calc. Details) | $ | M | — | If form 004 exists, calculate: 000062 - [(2.5 X fed 200636) + (10/3 X sum of 004008)]. If form 004 does not exist, calculate: 000062 - [(2.5 X fed 200636) + (10/3 X sum of fed 021180)]. If negative, default = zero. | 3-42 |
| 015 | Business Limit: as determined from AREA B | $ | M | — | If 001001 = 1, then A = 001045001 X No. of days in tax year (Max 365)/365. Note: the percentage used to allocate the Alberta Small Business Threshold for the calculation of 001045 must equal the federal percentage used to determine the federal business limit. Otherwise, if 001001 = 2, calculate: For taxation years starting before April 7, 2022 A = $200,000 X No. of days in tax year (Max 365)/365. B = A X fed 200415 (Max $11,250)/$11,250. Value = A – B For taxation years starting after April 6, 2022 A = $200,000 X No. of days in tax year (Max 365)/365. B = A X fed 200415 (Max $90,000)/$90,000. Value = A – B | 3-43 |
| 019 | Amount reported on federal Schedule 5, line 127 | $ | X | — | If fed 200750 = MJ, then value = fed 005127 | 3-43 |
| 020 | Amount reported on federal Schedule 5, line 167 | $ | X | — | If fed 200750 = MJ, then value = fed 005167 | 3-43 |
| 021 | Alberta allocation factor Allocation Agreement | % | M | — | Value cannot be less than 000065. If greater than 000065, then value must be calculated using the following adjusted form 002 amounts to determine form 002 column I amount: if fed 005100 is equal to 402, 409, 408, 411, 403, 404 or 405 then a. reduce 002004, 002014, 002024, 002034 or 002054, as applicable, by the amount at fed 005127, if any; and b. reduce 002008, 002018, 002028, 002038, 002048, 002058 or 002068, as applicable, by the amount of fed 005167, if any. Default value = 000065. If 001001 = 1, then this section must be completed. | 3-44 |
| 041 | Name of the Associated Canadian-controlled Private Corporations | AN | M | — | If 001001 = 1, this field must exist. Must be the same as each occurrence of fed 023100. Sort such that 001041001 = corp filing this return. | 3-44 |
| 043 | Corporate Account Number | N | X | — | Enter the applicable Alberta CAN for each corp registered in Alberta. The value of 001043001 must be equal to the value of 000034. | 3-44 |
| 045 | Allocation of the Base Amount | $ | M | — | If there is a value at 001041, then this field must exist. Enter the amount allocated to each associated corp with the first occurrence being the corp filing the return. The allocation must be the same as per the federal schedule 23 this is accomplished by using the same percentage used federally to determine the allocation for Alberta purposes. Multiply the $200,000 Alberta base amount by the corresponding value for the same corporation from fed 023350. Ensure to sort such that 001045001 belonging to the corp filing this return. Total of all occurrences max $200,000. | 3-45 |

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 001 | 200160 |
| 003 | 200400 |
| 009 | 021180, 200636 |
| 015 | 200415 |
| 019 | 005127, 200750 |
| 020 | 005167, 200750 |
| 021 | 005100 |
| 041 | 023100 |
| 045 | 023350 |

## Other AT1 lines referenced

`000034` · `000062` · `000065` · `002034` · `002058` · `004008` · `012100` · `012102` · `012104`
