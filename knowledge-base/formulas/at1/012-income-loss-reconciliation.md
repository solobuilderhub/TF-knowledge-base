# Schedule 12 — Alberta Income/Loss Reconciliation

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-102 – 3-119 (PDF 102–119 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH12-income-loss-reconciliation-TRA11732.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

**When this form is filed:** This form is required if either 000060 or 000061 = 1. If both 000060 and 000061 = 2, then do not allow completion of form 012.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| NIACITP | Net Income for Alberta Corporate Income Tax Purposes | — | — | 3-102 |
| TIA | Taxable Income for Alberta | — | — | 3-114 |
| RABI | Reconciliation of Active Business Income (ABI) | X | Complete only if the corp is electing to calculate Active Business Income for Alberta purposes different than for federal purposes. | 3-117 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 002 | Net Income (Loss) for federal purposes from T2 line 300 | $ | M | — | Must equal fed 200300. | 3-102 |
| 004 | Capital Cost Allowance for Alberta purposes | $ | X | — | If form 013 exists, value must equal the sum of all occurrences of 013019. | 3-102 |
| 005 | Capital Cost Allowance for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012004 or if the Alberta schedule exists due to differing opening or closing pool balances, value must equal fed 001403. | 3-102 |
| 006 | Recapture of CCA for Alberta purposes | $ | X | — | If form 013 exists, value must equal the sum of all occurrences of 013015. | 3-102 |
| 007 | Recapture of CCA for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012006 or if the Alberta schedule exists due to differing opening or closing pool balances, value must equal fed 001107. | 3-102 |
| 008 | Terminal Loss for Alberta purposes | $ | X | — | If form 013 exists, then must equal the sum of all occurrences of 013017. | 3-102 |
| 009 | Terminal Loss for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012008 or if the Alberta schedule exists due to differing opening or closing pool balances, then must equal fed 001404. | 3-103 |
| 014 | Farming Inventory: Mandatory inventory adjustment - included in current year for Alberta purposes | $ | X | — | If this value for Alberta’s purpose is not equal to fed 001224, then enter the value of farming inventory mandatory inventory adjustment included in current year for Alberta’s purpose. | 3-105 |
| 015 | Farming Inventory: Mandatory inventory adjustment - included in current year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012014, must equal fed 001224. | 3-105 |
| 016 | Farming Inventory: Mandatory inventory adjustment - included in prior year for Alberta purposes | $ | X | — | If the value for Alberta’s purpose is not equal to fed 001309, then enter the value of farming inventory mandatory inventory adjustment included in prior year for Alberta’s purpose. | 3-105 |
| 017 | Farming Inventory: Mandatory inventory adjustment - included in prior year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012016, must equal fed 001309. | 3-105 |
| 018 | Farming Inventory: Optional value of inventory - included in current year for Alberta purposes | $ | X | — | If the value for Alberta’s purpose is not equal to fed 001229, then enter the value of farming inventory optional value of inventory included in current year for Alberta’s purpose. | 3-105 |
| 019 | Farming Inventory: Optional value of inventory - included in current year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012018, must equal fed 001229. | 3-106 |
| 020 | Farming Inventory: Optional value of inventory - included in prior year for Alberta purposes | $ | X | — | If the value for Alberta’s purpose is not equal to fed 001313, then enter the value of farming Inventory optional value of inventory included in prior year for Alberta’s purpose. | 3-106 |
| 021 | Farming Inventory: Optional value of inventory - included in prior year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012020, must equal fed 001313. | 3-106 |
| 022 | Depletion for Alberta purposes | $ | X | — | If form 015 exists, must equal: 015007 + 015019 + 015031 | 3-107 |
| 023 | Depletion for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012022 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001344. | 3-107 |
| 026 | Canadian Exploration Expense (CEE) for Alberta purposes | $ | X | — | If form 015 exists, must equal: 015061 + 015081. | 3-107 |
| 027 | Canadian Exploration Expense (CEE) for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012026 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001341. | 3-107 |
| 028 | Canadian Development Expense (CDE) for Alberta purposes | $ | X | — | If form 015 exists, must equal: 015115 + 015141. | 3-107 |
| 029 | Canadian Development Expense (CDE) for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012028 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001340. | 3-107 |
| 030 | Foreign Exploration and Development Expense for Alberta purposes | $ | X | — | If form 015 exists, must equal: 015209 + 015221 + all occurrences of 015253 + all occurrences of 015273 + all occurrences of 015293 + all occurrences of 015313. | 3-108 |
| 031 | Foreign Exploration and Development Expense for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012030 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001345. | 3-108 |
| 032 | Canadian Oil and Gas Property Expense (COGPE) for Alberta purposes | $ | X | — | If form 015 exists, must equal: 015169 + 015189. | 3-108 |
| 033 | Canadian Oil and Gas Property Expense (COGPE) for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012032 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001342. | 3-108 |
| 034 | Scientific Research Expenses claimed in the year for Alberta purposes | $ | X | — | If form 016 exists and if 016016 is negative, then value = 016016. Otherwise, value = 016020. | 3-109 |
| 035 | Scientific Research Expenses claimed in the year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012034 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001411 or fed 001231. Enter fed 001411 value as a positive amount. Enter fed 001231 as a negative amount. | 3-109 |
| 036 | Tax Reserves deducted in prior year for Alberta purposes | $ | X | — | If form 017 exists, must equal: sum of 017001 to 017047 inclusive. | 3-109 |
| 037 | Tax Reserves deducted in prior year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012036 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001125. | 3-109 |
| 038 | Tax Reserves claimed in current year for Alberta purposes | $ | X | — | If form 017 exists, must equal: sum of 017061 to 017077 inclusive. | 3-109 |
| 039 | Tax Reserves claimed in current year for federal purposes | $ | X | — | If the federal amount differs from the Alberta amount at 012038 or if the Alberta schedule exists due to differing opening or closing pool balances, must equal fed 001413. | 3-109 |
| 042 | Capital tax liability in other provinces | $ | X | — | Enter the value for capital tax liability for other Canadian jurisdictions (eg. fed 1258762 or from a free format fed Schedule 1 field) if it exists. DO NOT INCLUDE THE CAPITAL TAX LIABILITY IN OTHER PROVINCES AMOUNT IN THE TOTAL FEDERAL AMOUNT AT LINE 050. | 3-110 |
| 040 | Other for Alberta purposes - specify | $ | X | — | Value will be the total amount of any other discretionary account items not specifically listed on form 012 and, 1. if form 018 exists, then must include as an addition to 012040: 018076 + 018094. 2. if form 015 exists, then must include the following addition as an to 012040 only if the computed amount for each calculation is negative but enter value as a positive amount: AREA C Regular Expenses: 015041 + 015043 + 015045 + 015047 + 015049 + included as a deduction to 012040. 4. Enter the value for foreign affiliate deductible losses if different for Alberta purposes. Value must be entered as an addition to 012040. If no form 015, 018, or 004 and there are no other discretionary account items, then the field must not exist. | 3-110 |
| 041 | Other for federal purposes - specify | $ | X | — | Value will be the total amount of the offsetting federal values that correspond to the Alberta values listed in field 012040. That is, the total of: 1. if an amount has been included in 012040 for Alberta form 018, then the amount from fed 001113 minus 001406. Must be included as an addition to field 012041; 2. if an amount has been included in 012040 for Alberta form 015, then the corresponding federal amount(s) from fed form 001 Other Additions. Must be included as an addition to field 012041; 3. if an amount has been included in 012040 due to ACTA subsection 8(2.2), then the amount from fed form 021 Part 1 column D. Must be included as a deduction to field 012041. 4. if an amount has been included in 012040 due to ITA s.152(6.1), then the amount from fed 001218. Must be included as a deduction to field 012041. If there are no “other” discretionary account item differences between federal and Alberta, then the field must not exist. | 3-112 |
| 048 | If amount in Line 040, provide explanation | AN | X | — | If 012040 exists, then 012048 must exist. | 3-113 |
| 050 | Total Federal Amount | $ | M | — | Calculate: - 012005 + 012007 - 012009 - 012011 + 012013 + 012015 - 012017 + 012019 - 012021 - 012023 - 012027 - 012029 - 012031 - 012033 +/- 012035 (add if using federal schedule1 line 231 and subtract if federal schedule 1 line 411) + 012037 - 012039 + 012041 Otherwise, if there is no discretionary differences between federal and Alberta, this value should be zero. | 3-113 |
| 054 | Net Income (Loss) for Alberta purposes | $ | M | — | Calculate: 012002 - 012050 - 012004 + 012006 - 012008 - 012010 + 012012 + 012014 - 012016 + 012018 - 012020 - 012022 - 012026 - 012028 - 012030 - 012032 – 012034 + 012036 - 012038 + 012042 + 012040 | 3-114 |
| 056 | Charitable Donations for Alberta purposes | $ | M | — | If form 020 exists, must equal 020016, otherwise must equal fed 200311. | 3-114 |
| 057 | Charitable Donations for federal purposes | $ | M | — | Must equal fed 200311. | 3-114 |
| 058 | Gifts to Canada or a province, cultural gifts and Ecological gifts for Alberta purposes | $ | M | — | If form 020 exists, must equal 020076. Otherwise must equal fed 200312 + fed 200313 + fed 200314. | 3-114 |
| 059 | Gifts to Canada or a province, cultural gifts and Ecological gifts for federal purposes | $ | M | — | Must equal fed 200312 + fed 200313 + fed 200314. | 3-114 |
| 060 | Taxable dividend deductible under ITA section 112, 113 or 138(6) for Alberta purposes | $ | M | — | Must equal fed 200320. | 3-114 |
| 061 | Taxable dividend deductible under ITA section 112, 113 or 138(6) for federal purposes | $ | M | — | Must equal fed 200320. | 3-114 |
| 062 | Part VI.1 tax deduction for Alberta purposes | $ | M | — | Must equal fed 200325. | 3-114 |
| 063 | Part VI.1 tax deduction for federal purposes | $ | M | — | Must equal fed 200325. | 3-115 |
| 064 | Non-capital losses of preceding taxation years for Alberta purposes | $ | M | — | If form 021 exists, must equal 021041. Otherwise must equal fed 200331. | 3-115 |
| 065 | Non-capital losses of preceding taxation years for federal purposes | $ | M | — | Must equal fed 200331. | 3-115 |
| 066 | Net-capital losses of preceding taxation years for Alberta purposes | $ | M | — | If form 021 exists, must equal 021061 X inclusion rate applicable to the year of application. Otherwise must equal fed 200332. | 3-115 |
| 067 | Net-capital losses of preceding taxation years for federal purposes | $ | M | — | Must equal fed 200332. | 3-115 |
| 068 | Restricted farm losses of preceding taxation years for Alberta purposes | $ | M | — | If form 021 exists, must equal 021099. Otherwise must equal fed 200333. | 3-115 |
| 069 | Restricted farm losses of preceding taxation years for federal purposes | $ | M | — | Must equal fed 200333. | 3-115 |
| 070 | Farm losses of preceding taxation years for Alberta purposes | $ | M | — | If form 021 exists, must equal 021079. Otherwise must equal fed 200334. | 3-115 |
| 071 | Farm losses of preceding taxation years for federal purposes | $ | M | — | Must equal fed 200334. | 3-115 |
| 072 | Limited partnership losses of preceding taxation years for Alberta purposes | $ | M | — | If form 021 exists, must equal the sum of all occurrences of 021139. Otherwise must equal fed 200335. | 3-115 |
| 073 | Limited partnership losses of preceding taxation years for federal purposes | $ | M | — | Must equal fed 200335. | 3-116 |
| 130 | Restricted Interest and Financing Expense for Alberta purposes | $ | M | — | If form 021 exists, must equal 021240. Otherwise must equal fed 200336 | 3-116 |
| 131 | Restricted Interest and Financing Expense for federal purposes | $ | M | — | Must equal fed 200336 | 3-116 |
| 074 | Taxable capital gains or taxable dividends allocated from a central credit union for Alberta purposes | $ | M | — | Must equal fed 200340. | 3-116 |
| 075 | Taxable capital gains or taxable dividends allocated from a central credit union for federal purposes | $ | M | — | Must equal fed 200340. | 3-116 |
| 078 | Prospector’s and grubstaker’s shares for Alberta purposes | $ | M | — | Must equal fed 200350. | 3-116 |
| 079 | Prospector’s and grubstaker’s shares for federal purposes | $ | M | — | Must equal fed 200350. | 3-116 |
| 140 | Employer deductions for non-qualified securities for Alberta purposes | $ | M | — | Must equal fed 200352. | 3-116 |
| 141 | Employer deductions for non-qualified securities for federal purposes | $ | M | — | Must equal fed 200352. | 3-116 |
| 082 | Add: ITA section 110.5 and 115(1)(a)(vii) additions for Alberta purposes | $ | M | — | If form 021 exists, must equal 021017. If no form 021, value may not exceed fed 200355 to the extent that 000070 and/or 000071 would increase as a result. | 3-116 |
| 083 | Add: ITA section 110.5 and 115(1)(a)(vii) additions for federal purposes | $ | M | — | Must equal fed 200355. | 3-117 |
| 090 | Taxable Income for Alberta purposes or (Loss) | $ | M | — | Calculate: A = 012056 + 012058 + 012060 + 012062 + 012064 + 012066 + 012068 + 012070 + 012072 + 012074 + 012078 +012130 +012140. If 012054 - A < zero and 012082 > 0, then value = 012082. Otherwise, value = 012054 - A + 012082. | 3-117 |
| 091 | Taxable Income for federal purposes or (Loss) | $ | M | — | Calculate: B = 012057 + 012059 + 012061 + 012063 + 012065 + 012067 + 012069 + 012071 + 012073 + 012075 + 012079 +012131 + 012141. If 012002 – B < zero and 012083 > 0, then value = 012083. Otherwise, value = 012002 - B + 012083. | 3-117 |
| 092 | Taxable Income per ITA paragraph 149(1)(t) | $ | M | — | Must equal fed 200370, if blank default to zero. | 3-117 |
| 100 | Does the corporation’s calculation of ABI for AB purposes differ from its federal ABI? | N | M | RABI | If the corp is calculating Alberta ABI different from federal ABI, set value = 1 (Yes). Otherwise, default to 2 (No). | 3-118 |
| 102 | Active Business Income from federal schedule 7 calculated amount Q or federal schedule 16 line 124. | $ | X | RABI | If 012100 = 1, then the value must exist. If 012100 = 1 and fed 200400 > zero, then value = fed 200400. Note: if fed 200400 includes specified partnership income and the tax year ends after March 31, 2002, then fed Schedule 7 column G must be recalculated using the applicable business limit to arrive at the Income from active businesses for Alberta purposes. I.e. $300,000 on April 1, 2001, $350,000 on April 1, 2002, $400,000 on April 1, 2003 and prorated accordingly if the taxation year straddles any of these dates. See AT1 Guide for more details. Otherwise, if 012100 = 1 and fed 200400 is less than or equal to zero, then value must equal calculated amount of fed 007 amount Q or fed 016124 (if negative, use the negative amount, do not default to zero). If 012100 = 2, then field must not exist. | 3-118 |
| 104 | Adjustment to ABI for AB purposes due to discretionary items | $ | X | RABI | If 012100 = 1 enter the amount of adjustment to ABI for AB purposes due to discretionary items. If 012100 = 2, then field must not exist. | 3-119 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **012054** = `012002 - 012050 - 012004 + 012006 - 012008 - 012010 + 012012 + 012014 - 012016 + 012018 - 012020 - 012022 - 012026 - 012028 - 012030 - 012032 - 012034 + 012036 - 012038 + 012042 + 012040`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 200300 |
| 005 | 001403 |
| 007 | 001107 |
| 009 | 001404 |
| 015 | 001224 |
| 017 | 001309 |
| 019 | 001229 |
| 021 | 001313 |
| 023 | 001344 |
| 027 | 001341 |
| 029 | 001340 |
| 031 | 001345 |
| 033 | 001342 |
| 035 | 001231, 001411 |
| 037 | 001125 |
| 039 | 001413 |
| 042 | 1258762 |
| 041 | 001113, 001218, 001406 |
| 056 | 200311 |
| 057 | 200311 |
| 058 | 200312, 200313, 200314 |
| 059 | 200312, 200313, 200314 |
| 060 | 200320 |
| 061 | 200320 |
| 062 | 200325 |
| 063 | 200325 |
| 064 | 200331 |
| 065 | 200331 |
| 066 | 200332 |
| 067 | 200332 |
| 068 | 200333 |
| 069 | 200333 |
| 070 | 200334 |
| 071 | 200334 |
| 072 | 200335 |
| 073 | 200335 |
| 130 | 200336 |
| 131 | 200336 |
| 074 | 200340 |
| 075 | 200340 |
| 078 | 200350 |
| 079 | 200350 |
| 140 | 200352 |
| 141 | 200352 |
| 082 | 200355 |
| 083 | 200355 |
| 102 | 016124, 200400 |

## Other AT1 lines referenced

`000070` · `000071` · `013015` · `013017` · `013019` · `015007` · `015019` · `015031` · `015041` · `015043` · `015045` · `015047` · `015049` · `015061` · `015081` · `015115` · `015141` · `015169` · `015189` · `015209` · `015221` · `015253` · `015273` · `015293` · `015313` · `016016` · `016020` · `017001` · `017047` · `017061` · `017077` · `018076` · `018094` · `020076` · `021017` · `021041` · `021061` · `021079` · `021099` · `021139` · `021240`
