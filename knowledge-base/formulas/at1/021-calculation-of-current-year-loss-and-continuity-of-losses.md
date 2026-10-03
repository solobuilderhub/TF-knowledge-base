# Schedule 21 — Alberta Calculation of Current Year Loss and Continuity of Losses

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-199 – 3-219 (PDF 199–219 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH21-loss-continuity-TRA11741.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** If 000060 and 000061 = 2, then do not allow completion of form 021. If Alberta opening balances differ from federal opening balances, if the current year loss for Alberta’s purposes differs from federal current year loss or if the current year’s loss application for Alberta differs from the federal loss application, then form 021 is REQUIRED.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| CYNCL | Current Year Non-capital Losses | X | If a non-capital loss exists in the current year, then this section must be completed. | 3-199 |
| CNCL | Continuity of Non-Capital Losses | X | If non-capital losses exist in the prior or current year, then this section must be completed to maintain the continuity of the loss. | 3-201 |
| CCL | Continuity of Capital Losses | X | If capital losses exist in the prior or current year, then this section must be completed to maintain the continuity of the loss. | 3-203 |
| CFL | Continuity of Farm Losses | X | If farm losses exist in the prior or current year, then this section must be completed to maintain the continuity of the loss. | 3-206 |
| CRFL | Continuity of Restricted Farm Losses | X | If restricted farm losses exist in the prior or current year, then this section must be completed to maintain the continuity of the loss. | 3-208 |
| CLPPL | Continuity of Listed Personal Property Losses | X | If listed personal property losses exist in the prior or current year, then this section must be completed to maintain the continuity of the loss. | 3-210 |
| CLPL | Continuity of Limited Partnership Losses | X | If the corporation has limited partnership losses, complete this section. | 3-212 |
| CRIFE | Continuity of Restricted Interest and Financing Expenses | X | If restricted interest and financing expenses exist in the prior or current year, then this section must be completed to maintain the continuity of the pool balance. | 3-215 |
| ANCL | Analysis of balance of non-capital losses by year of origin | X | If the corporation has non-capital losses, complete this section. | 3-216 |
| AOL | Analysis of other losses by year of origin | X | If the corporation has farm, restricted farm or listed personal property losses, complete this section. | 3-218 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 001 | Net Income (loss) per AB Sched. 12 line 054 | $ | M | CYNCL | Value must equal 012054. | 3-199 |
| 002 | Deduct: RIFE deducted in the year under paragraph 111(1)(a.1) of ITA | $ | X | CYNCL | Must equal 021240 | 3-199 |
| 003 | Deduct: Net capital losses deducted in the year | $ | X | CYNCL | Must equal 021061 x Inclusion Rate. If 021061 is blank, then field must not exist. | 3-199 |
| 005 | Deduct: Taxable dividends deductible | $ | X | CYNCL | Value must equal fed 200320. | 3-199 |
| 007 | Deduct: Amount of Part VI.1 tax deductible | $ | X | CYNCL | Value must equal fed 200325. | 3-199 |
| 011 | Deduct: Amount deductible as prospector’s and grubstaker’s shares | $ | X | CYNCL | Value must equal fed 200350. | 3-200 |
| 012 | Deduct: Employer deduction for non-qualified securities – Paragraph 110(1)(e) of ITA | $ | X | CYNCL | Value must equal fed 200352 | 3-200 |
| 017 | Deduct: ITA section 110.5 and 115(1)(a)(vii) additions for foreign tax credits | $ | M | CYNCL | Value cannot exceed fed 200355 to the extent that 00070 and/or 000071 would increase as a result. | 3-200 |
| 019 | Add: Current year farm loss | $ | X | CYNCL | If the current year Alberta farm loss differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004310. Value cannot exceed 021015. | 3-200 |
| 021 | Non-capital loss for the current year | $ | M | CYNCL | If 021001 - (021002+021003 + 021005 + 021007 + 021011+021012) is greater than zero, then calculate: 0 - 021017 + 021019. Value must be less than or equal to zero. Otherwise, calculate: 021001 - (021002+021003 + 021005 + 021007 + 021011+021012) - 021017 + 021019. If the amount is negative, then value equals calculated amount. Otherwise, if value is greater than or equal to zero, default to zero. | 3-200 |
| 031 | Non-Capital Losses - Losses carried forward from preceding taxation years | $ | M | CNCL | If the Alberta non-capital loss balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-201 |
| 032 | Non-Capital Losses - Deduct: losses expired after seven taxation years | $ | X | CNCL | If the Alberta non-capital losses expired after seven taxation years differ from the federal amount, then enter the Alberta expired non-capital losses. Otherwise, value = fed 004100. | 3-201 |
| 033 | Non-Capital Losses - Losses - beginning of taxation year | $ | M | CNCL | Value = 021031 - 021032. | 3-201 |
| 035 | Non-Capital Losses - Add: Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation | $ | X | CNCL | If the Alberta non-capital losses transferred from wind-up and amalgamation differ from the federal amount of transfers, then enter the Alberta amount. Otherwise, value = fed 004105. | 3-201 |
| 037 | Non-Capital Losses - Add: Current year loss | $ | M | CNCL | Value = 021021 x (-1). | 3-201 |
| 041 | Non-Capital Losses - Deduct: Amount applied against taxable income | $ | M | CNCL | If the Alberta amount of non-capital losses applied against income differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004130. In no case can the amount deducted against income create a negative value at 012090. | 3-202 |
| 043 | Non-Capital Losses - Deduct: ITA section 80 adjustment | $ | X | CNCL | If the Alberta amount of section 80 adjustment to non-capital losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004140. | 3-202 |
| 045 | Non-Capital Losses -Deduct: Other adjustments | $ | X | CNCL | If the Alberta amount of other adjustments to non-capital losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004150. NOTE: Do NOT include ITA 111(10) adjustments. | 3-202 |
| 047 | Non-Capital Losses - Deduct: Total loss carry back to prior taxation years | $ | X | CNCL | If the total Alberta non-capital loss carry back amount differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004901 + fed 004902 + fed 004903. Value cannot exceed: 021033 + 021035 + 021037 - 021041 - 021043 - 021045. 021047 must equal 010004 + 010006 + 010008 | 3-202 |
| 049 | Non-Capital Losses - Losses - closing balance | $ | M | CNCL | Value = 021033 + 021035 + 021037 - 021041 - 021043 - 021045 - 021047 | 3-203 |
| 051 | Capital Losses: Loss carried forward from prior taxation years | $ | M | CCL | If the Alberta capital loss balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-203 |
| 055 | Capital Losses: Add: Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation | $ | X | CCL | If the Alberta capital losses transferred from wind-up and amalgamation differ from the federal amount of transfers, then enter the Alberta amount. Otherwise, value = fed 004205. | 3-203 |
| 057 | Capital Losses: Add: Current year loss | $ | M | CCL | If 018059 is greater than or equal to zero, value = (018054 + 018055 + 018056 + 018057 + 018058 + 018059 - 018060 + 018064 + 018066 - 018068 - 018075) x (-1). If 018059 is less than zero, value = (018054 + 018055 + 018056 + 018057 + 018058 + 018064 + 018066 - 018068 - 018075) x (-1). If form 018 does not exist, then calculate: fed 006890 - fed 006895. If calculated amount is negative, value = calculated amount x (-1). Otherwise, default value = zero. | 3-203 |
| 059 | Capital Losses: Add: Allowable business investment loss expired as non-capital loss X 4/3* | $ | X | CCL | If the Alberta allowable business investment loss expired as non-capital loss differ from the federal amount, then enter the Alberta amount multiplied by 4/3. Otherwise, value = fed 004220. | 3-204 |
| 061 | Capital Losses: Deduct: Amount applied against current year capital gain | $ | X | CCL | If 021057 > 0, then value must equal zero. • If form 018 exists and if 018059 is greater than or equal to zero, calculate: 018054 + 018055 + 018056 + 018057 + 018058 + 018059 - 018060 + 018064 + 018066 - 018068 - 018072. • If form 018 exists and if 018059 is less than zero, calculate: 018054 + 018055 + 018056 + 018057 + 018058 + 018064 + 018066 - 018068 - 018072. If calculated amount is a positive amount, then value cannot exceed the calculated amount and the value must be entered as a positive value. If form 018 does not exist, calculate: fed 006890 - fed 006895. If calculated amount is a positive amount, then value cannot exceed the calculated amount and the value must be entered as a positive value. In no case can the amount deducted against current year capital gain create a negative value at 012090. | 3-204 |
| 063 | Capital Losses: Deduct: ITA section 80 adjustment | $ | X | CCL | If the Alberta amount of section 80 adjustment to capital losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004240. | 3-205 |
| 065 | Capital Losses: Deduct: Other adjustments | $ | X | CCL | If the Alberta amount of other adjustments to capital losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004250. | 3-205 |
| 067 | Capital Losses: Deduct: Total loss carry back to prior taxation years | $ | X | CCL | If the total Alberta capital loss carry back amount differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004951 + fed 004952 + fed 004953. Value cannot exceed 021051 + 021055 + 021057 + 021059 - 021061 - 021063 - 021065. 021067 must equal 010044 + 010046 + 010048 | 3-206 |
| 069 | Capital Losses: Losses - closing balance | $ | M | CCL | Value = 021051 + 021055 + 021057 + 021059 - 021061 - 021063 - 021065 - 021067 | 3-206 |
| 071 | Farm Losses: Losses carried forward from preceding taxation year | $ | M | CFL | If the Alberta farm loss balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-206 |
| 072 | Farm Losses: Deduct: losses expired after ten taxation years | $ | X | CFL | If the Alberta farm losses expired after ten taxation years differ from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004300. | 3-206 |
| 073 | Farm Losses: Losses - beginning of taxation year | $ | M | CFL | Value = 021071 - 021072. | 3-207 |
| 075 | Farm Losses: Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation | $ | X | CFL | If the Alberta farm losses transferred from wind-up and amalgamation differ from the federal amount of transfers, then enter the Alberta amount. Otherwise, value = fed 004305. | 3-207 |
| 077 | Farm Losses: Current year loss | $ | M | CFL | Value = 021019. | 3-207 |
| 079 | Farm Losses: Deduct: Amount applied against taxable income | $ | X | CFL | If the Alberta amount of farm losses applied against income differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004330. In no case can the amount deducted against income create a negative value at 012090. | 3-207 |
| 081 | Farm Losses: Deduct: ITA section 80 adjustment | $ | X | CFL | If the Alberta amount of section 80 adjustment to farm losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004340. | 3-207 |
| 083 | Farm Losses: Deduct: Other adjustments | $ | X | CFL | If the Alberta amount of other adjustments to farm losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004350. | 3-207 |
| 085 | Farm Losses: Deduct: Total loss carry back to prior taxation years | $ | X | CFL | If the total Alberta farm loss carry back amount differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004921 + fed 004922 + fed 004923. Value cannot exceed 021073 + 021075 + 021077 - 021079 - 021081 - 021083. 021085 must equal 010014 + 010016 + 010018 | 3-208 |
| 087 | Farm Losses: Losses - closing balance | $ | M | CFL | Value = 021073 + 021075 + 021077 - 021079 - 021081 - 021083 - 021085 | 3-208 |
| 091 | Restricted Farm Losses: Losses carried forward from preceding taxation years | $ | M | CRFL | If the Alberta restricted farm loss balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-208 |
| 092 | Restricted Farm Losses: Deduct: losses expired after ten taxation years | $ | X | CRFL | If the Alberta restricted farm losses expired after ten taxation years differ from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004400. | 3-208 |
| 093 | Restricted Farm Losses: Losses - beginning of taxation year | $ | M | CRFL | Value = 021091 - 021092. | 3-209 |
| 095 | Restricted Farm Losses: Losses transfer from wind-up of a wholly-owned subsidiary and amalgamation | $ | X | CRFL | If the Alberta restricted farm losses transferred from wind-up and amalgamation differ from the federal amount of transfers, then enter the Alberta amount. Otherwise, value = fed 004405. | 3-209 |
| 097 | Restricted Farm Losses: Current year loss | $ | M | CRFL | If the current year Alberta restricted farm loss differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004410. | 3-209 |
| 099 | Restricted Farm Losses: Deduct: Amount applied against farming income | $ | X | CRFL | If the Alberta amount of restricted farm losses applied against income differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004430. In any case, the value cannot exceed the Alberta farm income for the year. | 3-209 |
| 101 | Restricted Farm Losses: Deduct: ITA section 80 adjustment | $ | X | CRFL | If the Alberta amount of section 80 adjustment to restricted farm losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004440. | 3-209 |
| 103 | Restricted Farm Losses: Deduct: Other adjustments | $ | X | CRFL | If the Alberta amount of other adjustments to restricted farm losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004450. | 3-210 |
| 105 | Restricted Farm Losses: Deduct: Total loss carry back to prior taxation years | $ | X | CRFL | If the total Alberta restricted farm loss carry back amount differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004941 + fed 004942 + fed 004943. Value cannot exceed 021093 + 021095 + 021097 - 021099 - 021101 - 021103. If 010023 = 1 (Yes) and 0100025 = 2 (No), then 021105 must equal 010034 + 010036 + 010038 If 010023 = 1 (Yes) and 0100025 = 1 (Yes), then 021105 cannot exceed 010034 + 010036 + 010038 | 3-210 |
| 107 | Restricted Farm Losses: Losses - closing balance | $ | M | CRFL | Value = 021093 + 021095 + 021097 - 021099 - 021101 - 021103 - 021105 | 3-210 |
| 111 | Listed Personal Property Losses - Losses carried forward from preceding taxation year | $ | M | CLPPL | If the Alberta listed personal property loss balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-211 |
| 113 | Listed Personal Property Losses - Deduct: losses expired after seven taxation years | $ | X | CLPPL | If the Alberta listed personal property losses expired after seven taxation years differ from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004500. | 3-211 |
| 115 | Listed Personal Property Losses - Losses - beginning of taxation year | $ | M | CLPPL | Value = 021111 - 021113. | 3-211 |
| 117 | Listed Personal Property Losses - Current year loss | $ | M | CLPPL | If form 018 exists, calculate: 018012 - 018032 - 018052. If amount is negative, value = calculated amount x -1. Otherwise, value = zero. If form 018 does not exist, value = fed 004510. | 3-211 |
| 119 | Listed Personal Property Losses - Deduct: Amount applied against listed personal property gain | $ | X | CLPPL | If 021117 > 0, then value must equal zero. If form 018 exists, then value must equal 018060. Otherwise, value = fed 006655. | 3-211 |
| 121 | Listed Personal Property Losses - Deduct: Adjustments | $ | X | CLPPL | If the Alberta amount of adjustments to listed personal property losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004550. | 3-212 |
| 123 | Listed Personal Property Losses - Deduct: Total loss carry back to prior taxation years | $ | X | CLPPL | If the total Alberta listed personal property loss carry back amount differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004961 + fed 004962 + fed 004963. Value cannot exceed 021115 + 021117 - 021119 - 021121 If 010025 = 1 (Yes) and 0100023 = 2 (No), then 021123 must equal 010034 + 010036 + 010038 If 010025 = 1 (Yes) and 0100023 = 1 (Yes), then 021123 cannot exceed 010034 + 010036 + 010038 | 3-212 |
| 125 | Listed Personal Property Losses - Losses - closing balance | $ | M | CLPPL | Value = 021115 + 021117 - 021119 - 021121 - 021123 | 3-212 |
| 131 | Partnership Identifier | AN | X | CLPL | For each partnership loss, enter the partnership name. | 3-212 |
| 133 | Limited partnership losses at end of preceding taxation year | $ | M | CLPL | If the Alberta limited partnership losses at the end of the preceding taxation year are the same as the federal, enter the amount from the corresponding occurrence of fed 004662 for the related Alberta occurrence. Otherwise, enter the Alberta limited partnership losses at the end of the preceding year for each occurrence of 021131. | 3-213 |
| 135 | Limited partnership losses transferred from amalgamation or wind-up of subsidiary | $ | X | CLPL | If the amount of transfers from amalgamation or wind-up for Alberta limited partnership losses is the same as the federal, enter the amount from the corresponding occurrence of fed 004664 for the related Alberta occurrence. Otherwise, enter the Alberta amount of transfers from amalgamation or wind-up of limited partnership losses for each occurrence of 021131. | 3-213 |
| 137 | Current year limited partnership loss | $ | M | CLPL | If the current year loss amount for Alberta limited partnership losses is the same as the federal, enter the amount from the corresponding occurrence of fed 004670 for the related Alberta occurrence. Otherwise, enter the current year loss amount for Alberta limited partnership losses for each occurrence of 021131. | 3-213 |
| 139 | Limited partnership losses applied | $ | M | CLPL | If the amount applied for Alberta limited partnership losses is the same as the federal, enter the amount from the corresponding occurrence of fed 004675 for the related Alberta occurrence. Otherwise, enter the amount applied for Alberta limited partnership losses for each occurrence of 021131, where the value cannot exceed 021133 + 021135. In no case can the sum of all occurrences create a negative value at 012090. | 3-214 |
| 141 | Limited partnership losses closing balance (133 + 135 + 137 - 139) | $ | M | CLPL | For each occurrence of 021131, calculate the value: 021133 + 021135 + 021137 - 021139. | 3-215 |
| 200 | RIFE at the end of the previous tax year | $ | M | CRIFE | If the Alberta RIFE balance from the preceding taxation years differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. | 3-215 |
| 210 | RIFE - Add: RIFE transferred from wind-up of a wholly-owned subsidiary or amalgamation | $ | X | CRIFE | If the Alberta RIFE transferred from wind-up and amalgamation differs from the federal amount of transfers, then enter the Alberta amount. Otherwise, value = fed 004705. | 3-215 |
| 220 | RIFE- Deduct: adjustment for an acquisition of control | $ | X | CRIFE | If the Alberta amount of adjustment for an acquisition of control differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004750. | 3-215 |
| 230 | Add: Current-year restricted interest and financing expense determined under subsection 111(8) of ITA | $ | X | CRIFE | Must = fed 004710 | 3-216 |
| 240 | RIFE - Deduct: RIFE deducted for the tax year | $ | M | CRIFE | If the Alberta amount of RIFE applied against income differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004730. In no case can the amount deducted against income create a negative value at 012090. | 3-216 |
| 250 | Closing Balance of RIFE | $ | M | CRIFE | Value = 021200 + 021210- 021220 + 021230 - 021240 | 3-216 |
| 310 | RIFE from previous tax years | $ | M | CRIFE | Value = 021200 + 021210- 021220 | 3-216 |
| 320 | Corporation’s excess capacity for the year | $ | M | CRIFE | Must = fed 130129 | 3-216 |
| 330 | Total of all amounts of the corporation’s received capacity for the year | $ | M | CRIFE | Must = fed 130130 | 3-216 |
| 350 | RIFE deductible under paragraph 111(1)(a.1) of ITA for the year. | $ | M | CRIFE | Lesser of 021310 and (021320+021330) | 3-216 |
| 151 | Occurrence number of preceding taxation year | N | X | ANCL | 021151 must exist if 021153 exists. | 3-217 |
| 153 | Tax year end | D | X | ANCL | For each occurrence of 021151, value = tax year end. 021153 must exist if 021155, 021159, 021167 or 021169 exists. | 3-217 |
| 155 | Balance at the beginning of year | $ | X | ANCL | If the Alberta non-capital loss balance at the beginning of the year differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the federal balance. There should be no amount for occurrence 0. | 3-217 |
| 157 | Loss incurred in current year | $ | X | ANCL | Value must equal 021021. There should be no amount for occurrences 1 to 20. | 3-217 |
| 159 | Adjustments and Transfers | $ | X | ANCL | If the Alberta amount of adjustments and transfers to non-capital losses differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal balance. | 3-217 |
| 165 | Loss carried back | $ | X | ANCL | Value must equal 021047. There should be no amount for occurrences 1 to 20. | 3-217 |
| 167 | Applied to reduce taxable income | $ | X | ANCL | If the Alberta amount Applied to reduce taxable income for a specific occurrence differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount. Value cannot exceed taxable income for that specific tax year end. There should be no amount for occurrence 0. | 3-218 |
| 169 | Balance at the end of year (155 + 157 + 159 - 165 - 167) | $ | X | ANCL | For each occurrence of 021151, calculate the value: 021155 + 021157 + 021159 - 021165 - 021167. | 3-218 |
| 181 | Occurrence number of preceding taxation year | N | X | AOL | 021181 must exist if 021183, or 021185, or 021187 exists. | 3-219 |
| 183 | Farm losses | $ | X | AOL | If the Alberta farm loss for a specific occurrence differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-219 |
| 185 | Restricted farm losses | $ | X | AOL | If the Alberta restricted farm loss for a specific occurrence differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount | 3-219 |
| 187 | Listed personal property losses | $ | X | AOL | If the Alberta listed personal property loss for a specific occurrence differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount. There should be no amount for occurrences 8 to 20. | 3-219 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **021033** = `021031 - 021032`
- **021037** = `021021 * (-1)`
- **021049** = `021033 + 021035 + 021037 - 021041 - 021043 - 021045 - 021047`
- **021069** = `021051 + 021055 + 021057 + 021059 - 021061 - 021063 - 021065 - 021067`
- **021073** = `021071 - 021072`
- **021077** = `021019`
- **021087** = `021073 + 021075 + 021077 - 021079 - 021081 - 021083 - 021085`
- **021093** = `021091 - 021092`
- **021107** = `021093 + 021095 + 021097 - 021099 - 021101 - 021103 - 021105`
- **021115** = `021111 - 021113`
- **021125** = `021115 + 021117 - 021119 - 021121 - 021123`
- **021250** = `021200 + 021210- 021220 + 021230 - 021240`
- **021310** = `021200 + 021210- 021220`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 005 | 200320 |
| 007 | 200325 |
| 011 | 200350 |
| 012 | 200352 |
| 017 | 200355 |
| 019 | 004310 |
| 032 | 004100 |
| 035 | 004105 |
| 041 | 004130 |
| 043 | 004140 |
| 045 | 004150 |
| 047 | 004901, 004902, 004903 |
| 055 | 004205 |
| 057 | 006890, 006895 |
| 059 | 004220 |
| 061 | 006890, 006895 |
| 063 | 004240 |
| 065 | 004250 |
| 067 | 004951, 004952, 004953 |
| 072 | 004300 |
| 075 | 004305 |
| 079 | 004330 |
| 081 | 004340 |
| 083 | 004350 |
| 085 | 004921, 004922, 004923 |
| 092 | 004400 |
| 095 | 004405 |
| 097 | 004410 |
| 099 | 004430 |
| 101 | 004440 |
| 103 | 004450 |
| 105 | 004941, 004942, 004943 |
| 113 | 004500 |
| 117 | 004510 |
| 119 | 006655 |
| 121 | 004550 |
| 123 | 004961, 004962, 004963 |
| 133 | 004662 |
| 135 | 004664 |
| 137 | 004670 |
| 139 | 004675 |
| 210 | 004705 |
| 220 | 004750 |
| 230 | 004710 |
| 240 | 004730 |
| 320 | 130129 |
| 330 | 130130 |

## Other AT1 lines referenced

`000071` · `010004` · `010006` · `010008` · `010014` · `010016` · `010018` · `010023` · `010025` · `010034` · `010036` · `010038` · `010044` · `010046` · `010048` · `012054` · `012090` · `018012` · `018032` · `018052` · `018054` · `018055` · `018056` · `018057` · `018058` · `018059` · `018060` · `018064` · `018066` · `018068` · `018072` · `018075`
