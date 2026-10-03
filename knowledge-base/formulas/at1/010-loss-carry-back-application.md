# Schedule 10 — Alberta Loss Carry-Back Application

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-89 – 3-98 (PDF 89–98 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH10-loss-carryback-TRA11731.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** If the corp is requesting a loss carry-back to prior taxation years, then form 010 must be completed even if the corp is exempt from filing the AT1 (must be filed for the year in which the loss incurred).

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| ACTA | Loss to be Applied Under the ACTA | — | — | 3-89 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 002 | Non-capital Loss: Amt of current yr loss available for carry-back | $ | X | — | If the corporation has a value at 021037 and chooses to carry the loss back to a prior year, Value = 021037. Otherwise, if form 021 does not exist, value = fed 004110. | 3-89 |
| 003 | 1st preceding taxation year ending | D | X | — | 010003 must exist if 010004, 010014, 010034 or 010044 exists. | 3-89 |
| 004 | Non-capital Loss: 1st preceding taxation year ending | $ | X | — | 010004 may exist only if 010002 exists. 010004 must be less than or equal to 010002 | 3-89 |
| 005 | 2nd preceding taxation year ending | D | X | — | 010005 must exist if 010006, 010016, 010036 or 010046 exists. | 3-89 |
| 006 | Non-capital Loss: 2nd preceding taxation year ending | $ | X | — | 010006 may exist only if 010002 exists. 010006 must be less than or equal to 010002 | 3-89 |
| 007 | 3rd preceding taxation year ending | D | X | — | 010007 must exist if 010008, 010018, 010038 or 010048 exists. | 3-90 |
| 008 | Non-capital Loss: 3rd preceding taxation year ending | $ | X | — | 010008 may exist only if 010002 exists. 010008 must be less than or equal to 010002 | 3-90 |
| 010 | Non-capital Loss: Balance of current year loss available for carry forward | $ | X | — | If 010002 exists, then 010010 must exists. Value must equal: 010002 - (010004 + 010006 + 010008) where 010004 + 010006 + 010008 cannot exceed 010002 | 3-90 |
| 012 | Farm Loss: Amt of current yr loss available for carry-back | $ | X | — | If the corporation has a value at 021077 and chooses to carry the loss back to a prior year, then set value = 021077. Otherwise, if form 021 does not exist, value = fed 004310. | 3-90 |
| 014 | Farm Loss: 1st preceding taxation year ending | $ | X | — | 010014 may exist only if 010012 exists. 010014 must be less than or equal to 010012 | 3-90 |
| 016 | Farm Loss: 2nd preceding taxation year ending | $ | X | — | 010016 may exist only if 010012 exists. 010016 must be less than or equal to 010012 | 3-90 |
| 018 | Farm Loss: 3rd preceding taxation year ending | $ | X | — | 010018 may exist only if 010012 exists. 010018 must be less than or equal to 010012 | 3-91 |
| 020 | Farm Loss: Balance of current year loss available for carry forward | $ | X | — | If 010012 exists, then 010020 must exists. Value must equal: 010012 - (010014 + 010016 + 010018) where 010014 + 010016 + 010018 cannot exceed 010012 | 3-91 |
| 023 | Other Losses: Restricted farm | N | X | — | If the corporation has a value at 021097 or fed 200233 and chooses to carry the loss back to a prior year, set 010023 = 1 (Yes). Otherwise, default = 2 (No, not applicable). | 3-91 |
| 025 | Other Losses: Listed Personal Property | N | X | — | If the corporation has a value at 021117 or fed 004510 and chooses to carry the loss back to a prior year, set 010025 = 1 (Yes). Otherwise, default = 2 (No, not applicable). | 3-91 |
| 032 | Other Losses: Amt of current yr loss available for carry-back | $ | X | — | If 010023 = 1 and 010025 = 0, then value = 021097. Otherwise, if form 021 does not exist, value = fed 004410. If 010025 = 1 and 010023 = 0, then value = 021117. Otherwise, if form 021 does not exist, value = fed 004510. If 010023 =1 and 010025 = 1, then value = 021097 + 021117. Otherwise, if form 021 does not exist, value = fed 004410 + fed 004510. | 3-91 |
| 034 | Other Losses: 1st preceding taxation year ending | $ | X | — | 010034 may exist only if 010032 exists. 010034 must be less than or equal to 010032 | 3-92 |
| 036 | Other Losses: 2nd preceding taxation year ending | $ | X | — | 010036 may exist only if 010032 exists. 010036 must be less than or equal to 010032 | 3-92 |
| 038 | Other Losses: 3rd preceding taxation year ending | $ | X | — | 010038 may exist only if 010032 exists. 010038 must be less than or equal to 010032 | 3-92 |
| 040 | Other Losses: Balance of current year loss available for carry forward | $ | X | — | If 010032 exists, then 010040 must exists. Value must equal: 010032 - (010034 + 010036 + 010038) where 010034 + 010036 + 010038 cannot exceed 010032 | 3-92 |
| 042 | Capital: Gross Amt of current yr loss available for carry-back | $ | X | — | If the corporation has a value at 021057 and chooses to carry the loss back to a prior year, then set value = 021057 Otherwise, if form 021 does not exist, value = fed 004210 | 3-93 |
| 043 | Inclusion Rate | % | X | — | 010043 may exist only if 010042 exists. 010043 must equal the inclusion rate applicable to the year of application (as per form 018 calculation if the form existed in the year of application or, if not, per fed 006 amount “m” calculation). Express as a decimal to 6 digits e.g. 2/3 = .666667, ½ = .5 | 3-93 |
| 044 | Capital: Gross amount applied to 1st preceding taxation year ending | $ | X | — | 010044 may exist only if 010042 and 010043 exist. 010044 must be less than or equal to 010042 | 3-93 |
| 045 | Inclusion Rate | % | X | — | 010045 may exist only if 010042 exists. 010045 must equal the inclusion rate applicable to the year of application (as per form 018 calculation if the form existed in the year of application or, if not, per fed 006 amount “m” calculation). Express as a decimal to 6 digits e.g. 2/3 = .666667, ½ = .5 | 3-94 |
| 046 | Capital: Gross amount applied to 2nd preceding taxation year ending | $ | X | — | 010046 may exist only if 010042 and 010045 exist. 010046 must be less than or equal to 010042 | 3-95 |
| 047 | Inclusion Rate | % | X | — | 010047 may exist only if 010042 exists. 010047 must equal the inclusion rate applicable to the year of application (as per form 018 calculation if the form existed in the year of application or, if not, per fed 006 amount “m” calculation). Express as a decimal to 6 digits e.g. 2/3 = .666667, ½ = .5 | 3-96 |
| 048 | Capital: Gross amount applied to 3rd preceding taxation year ending | $ | X | — | 010048 may exist only if 010042 and 010047 exist. 010048 must be less than or equal to 010042 | 3-96 |
| 050 | Capital: Balance of current year loss available for carry forward. | $ | X | — | If 010042 exists, then 010050 must exists. Value must equal: 010042 - (010044 + 010046 + 010048) where 010044 + 010046 + 010048 cannot exceed 010042 | 3-96 |
| 052 | Contact Person to discuss this application. | AN | M | — | Contact person’s name. | 3-96 |
| 054 | Contact Person’s Telephone No. | N | M | — | Phone number of contact person. Must include area code. | 3-97 |
| 056 | Contact Person’s Fax No. | N | O | — | Fax number of contact person. Must include area code. | 3-97 |
| 058 | Mailing Address for Notice of Reassessment Line 1. | AN | M | — | **CRITICAL MANDATORY** Mailing address for Notice of Reassessment. This field must be entered. | 3-97 |
| 060 | Mailing Address for Notice of Reassessment Line 2. | AN | O | — | Specify address line 2 if required. | 3-97 |
| 062 | City/Town | AN | M | — | **CRITICAL MANDATORY** city/town. This field must be entered. | 3-97 |
| 064 | Prov./State | A | X | — | Specify a valid province or state code. See Section 3.4 for listing of valid codes. If the country of origin is Canada or the US, then this field MUST be completed with a valid code. | 3-97 |
| 066 | Country Code | A | X | — | Allow input of a valid country code only if other than Canada. See Section 3.4 for listing of valid codes. | 3-97 |
| 068 | Postal/Zip Code | AN | M | — | Specify a valid postal or zip code. If the country of origin is Canada or the US, then this field MUST be completed with a valid code. | 3-97 |
| 082 | Alberta Corporate Account Number | N | M | — | **CRITICAL MANDATORY** Must be the Alberta Corporate Account Number. If the schedule 10 is submitted with the AT1 RSI or AT1 Net File Return then value must = 000034. | 3-98 |
| 084 | Current Taxation Year Ending | D | M | — | **CRITICAL MANDATORY** Current taxation year ending. This field must be entered. If the schedule 10 is submitted with the AT1 RSI or AT1 Net File Return then value must = 000037. | 3-98 |
| 090 | Functional Currency Other Than Canadian? | N | M | — | Enter a valid code to specify if monetary amounts reported in functional currency other than Canadian. 1 = Yes, 2 = No. | 3-98 |

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 004110 |
| 012 | 004310 |
| 023 | 200233 |
| 025 | 004510 |
| 032 | 004410, 004510 |
| 042 | 004210 |

## Other AT1 lines referenced

`000034` · `000037` · `021037` · `021057` · `021077` · `021097` · `021117`
