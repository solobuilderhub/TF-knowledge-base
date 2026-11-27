# Sch t2ws1: Calculating your estimated tax payable and tax credits for 2027

From AuraTax 2.3.33, `fixtures/t2/specs/t2ws1.json` and `extras/t2ws1.json`. Not a primary source; check every rule against the published form.

## AuraTax's help text for this schedule

• Use this worksheet to estimate your corporation's 2027 tax payable and tax credits.

• You may not have to make instalment payments if you are a new corporation. For more information on completing this worksheet, see canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-payments.

• Start by completing this worksheet, then use the estimated amounts to calculate either your monthly instalment payments (Worksheet 2) or your quarterly instalment payments (Worksheet 3).

• This worksheet does not have to be filed with your T2, Corporation Income Tax Return.

## Lines

### Estimated tax payable for 2027

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| amount A [a1_lA] | Estimated taxable income for 2027 | $ | AuraTax-only |  |  |  |
| [a1_txt0] | Estimated 2027 federal tax on income |  | heading |  |  |  |
| amount 1 [a1_l1] | Base amount of federal tax on income (Part I tax) - amount A × 38% | $ | AuraTax-only |  |  |  |
| amount 2 [a1_l2] | Additional tax on personal services business income. | $ | AuraTax-only |  |  |  |
| amount 3 [a1_l3] | Additional tax on banks and life insurers | $ | AuraTax-only |  |  |  |
| amount 4 [a1_l4] | Total labour requirements addition to tax | $ | AuraTax-only |  |  |  |
| amount 5 [a1_l5] | Recapture of investment tax credit  | $ | AuraTax-only |  |  |  |
| amount 6 [a1_l6] | Refundable tax on Canadian-controlled private corporation's (CCPC's) investment income  | $ | AuraTax-only |  |  |  |
| amount B [a1_lB] | Total estimated 2027 federal tax on income before credits (add amounts 1 to 6) | $ | total, AuraTax-only |  |  |  |
| [a1_txt1] | Estimated 2027 non-refundable tax credits |  | heading |  |  |  |
| amount N1 [a1_N1] | Small business deduction (maximum $95,000) - amount A × 19% | $ | AuraTax-only |  |  | Capped at 95000 |
| amount N2 [a1_N2] | Federal tax abatement - amount A × 10% | $ | AuraTax-only |  |  |  |
| amount N3 [a1_N3] | Manufacturing and processing profits deduction and zero-emission technology manufacturing deduction | $ | AuraTax-only |  |  |  |
| amount N4 [a1_N4] | Investment corporation deduction. | $ | AuraTax-only |  |  |  |
| amount N5 [a1_N5] | Federal foreign non-business income tax credit | $ | AuraTax-only |  |  |  |
| amount N6 [a1_N6] | Federal foreign business income tax credit | $ | AuraTax-only |  |  |  |
| amount N7 [a1_N7] | General tax reduction for CCPCs | $ | AuraTax-only |  |  |  |
| amount N8 [a1_N8] | General tax reduction | $ | AuraTax-only |  |  |  |
| amount N9 [a1_N9] | Federal logging tax credit | $ | AuraTax-only |  |  |  |
| amount N10 [a1_N10] | Eligible Canadian bank deduction | $ | AuraTax-only |  |  |  |
| amount N11 [a1_N11] | Federal qualifying environmental trust tax credit | $ | AuraTax-only |  |  |  |
| amount N12 [a1_N12] | Investment tax credit | $ | AuraTax-only |  |  |  |
| amount C [a1_lC] | Total estimated 2027 non-refundable tax credits (add amounts N1 to N12) | $ | total, AuraTax-only |  |  |  |
| [a1_txt2] | Estimated 2027 federal tax payable |  | heading |  |  |  |
| amount D [a1_lD] | Estimated 2027 tax payable on income (Part I tax) (amount B minus amount C) | $ | AuraTax-only |  |  | Set to 0 if negative |
| amount E [a1_lE] | Estimated 2027 tax payable on capital of financial institutions (Part VI tax) | $ | AuraTax-only |  |  |  |
| amount F [a1_lF] | Estimated 2027 tax payable on corporations paying dividends on taxable preferred shares (Part VI.1 tax). | $ | AuraTax-only |  |  |  |
| amount G [a1_lG] | Estimated 2027 additional tax payable on authorized foreign banks (Part XIII.1 tax) | $ | AuraTax-only |  |  |  |
| amount H [a1_lH] | Total estimated 2027 federal tax payable(add amounts D to G) | $ | total, AuraTax-only |  |  |  |
| amount I [a1_lI] | Estimated 2027 net provincial and territorial tax payable before refundable credits | $ | AuraTax-only |  |  |  |

### Estimated refundable tax credits for 2027

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| amount R1 [a2_R1] | Investment tax credit refund | $ | AuraTax-only |  |  |  |
| amount R2 [a2_R2] | Dividend refund | $ | AuraTax-only |  |  |  |
| amount R3 [a2_R3] | Federal capital gains refund | $ | AuraTax-only |  |  |  |
| amount R4 [a2_R4] | Federal qualifying environmental trust tax credit | $ | AuraTax-only |  |  |  |
| amount R5 [a2_R5] | Canadian film or video production tax credit | $ | AuraTax-only |  |  |  |
| amount R6 [a2_R6] | Film or video production services tax credit | $ | AuraTax-only |  |  |  |
| amount R7 [a2_R7] | Canadian journalism labour tax credit | $ | AuraTax-only |  |  |  |
| amount R8 [a2_R8] | Tax withheld at source. | $ | AuraTax-only |  |  |  |
| amount R9 [a2_R9] | Provincial and territorial capital gains refund | $ | AuraTax-only |  |  |  |
| amount R10 [a2_R10] | Newfoundland and Labrador manufacturing and processing investment tax credit | $ | AuraTax-only |  |  |  |
| amount R11 [a2_R11] | Newfoundland and Labrador green technology tax credit | $ | AuraTax-only |  |  |  |
| amount R12 [a2_R12] | Newfoundland and Labrador research and development tax credit | $ | AuraTax-only |  |  |  |
| amount R13 [a2_R13] | Newfoundland and Labrador film and video industry tax credit | $ | AuraTax-only |  |  |  |
| amount R14 [a2_R14] | Newfoundland and Labrador interactive digital media tax credit | $ | AuraTax-only |  |  |  |
| amount R15 [a2_R15] | Newfoundland and Labrador all-spend film and video production tax credit | $ | AuraTax-only |  |  |  |
| amount R16 [a2_R16] | Nova Scotia research and development tax credit | $ | AuraTax-only |  |  |  |
| amount R17 [a2_R17] | Nova Scotia digital media tax credit | $ | AuraTax-only |  |  |  |
| amount R18 [a2_R18] | Nova Scotia capital investment tax credit | $ | AuraTax-only |  |  |  |
| amount R19 [a2_R19] | Nova Scotia digital animation tax credit | $ | AuraTax-only |  |  |  |
| amount R20 [a2_R20] | New Brunswick research and development tax credit | $ | AuraTax-only |  |  |  |
| amount R21 [a2_R21] | Ontario qualifying environmental trust tax credit | $ | AuraTax-only |  |  |  |
| amount R22 [a2_R22] | Ontario co-operative education tax credit | $ | AuraTax-only |  |  |  |
| amount R23 [a2_R23] | Ontario computer animation and special effects tax credit | $ | AuraTax-only |  |  |  |
| amount R24 [a2_R24] | Ontario film and television tax credit | $ | AuraTax-only |  |  |  |
| amount R25 [a2_R25] | Ontario production services tax credit | $ | AuraTax-only |  |  |  |
| amount R26 [a2_R26] | Ontario interactive digital media tax credit | $ | AuraTax-only |  |  |  |
| amount R27 [a2_R27] | Ontario book publishing tax credit | $ | AuraTax-only |  |  |  |
| amount R28 [a2_R28] | Ontario innovation tax credit | $ | AuraTax-only |  |  |  |
| amount R29 [a2_R29] | Ontario business-research institute tax credit | $ | AuraTax-only |  |  |  |
| amount R30 [a2_R30] | Ontario regional opportunities investment tax credit | $ | AuraTax-only |  |  |  |
| amount R31 [a2_R31] | Ontario made manufacturing investment tax credit | $ | AuraTax-only |  |  |  |
| amount R57 [a2_R57] | Ontario shortline railway investment tax credit | $ | AuraTax-only |  |  |  |
| amount R32 [a2_R32] | Manitoba cultural industries printing tax credit | $ | AuraTax-only |  |  |  |
| amount R33 [a2_R33] | Manitoba research and development tax credit | $ | AuraTax-only |  |  |  |
| amount R34 [a2_R34] | Manitoba interactive digital media tax credit | $ | AuraTax-only |  |  |  |
| amount R35 [a2_R35] | Manitoba book publishing tax credit | $ | AuraTax-only |  |  |  |
| amount R36 [a2_R36] | Manitoba green energy equipment tax credit | $ | AuraTax-only |  |  |  |
| amount R37 [a2_R37] | Manitoba film and video production tax credit | $ | AuraTax-only |  |  |  |
| amount R38 [a2_R38] | Manitoba manufacturing investment tax credit | $ | AuraTax-only |  |  |  |
| amount R39 [a2_R39] | Manitoba paid work experience tax credit | $ | AuraTax-only |  |  |  |
| amount R40 [a2_R40] | Manitoba rental housing construction incentive tax credit | $ | AuraTax-only |  |  |  |
| amount R41 [a2_R41] | Manitoba community enterprise development tax credit | $ | AuraTax-only |  |  |  |
| amount R42 [a2_R42] | Manitoba child care centre development tax credit | $ | AuraTax-only |  |  |  |
| amount R43 [a2_R43] | Saskatchewan qualifying environmental trust tax credit | $ | AuraTax-only |  |  |  |
| amount R44 [a2_R44] | Saskatchewan manufacturing and processing investment tax credit | $ | AuraTax-only |  |  |  |
| amount R45 [a2_R45] | Saskatchewan research and development tax credit | $ | AuraTax-only |  |  |  |
| amount R46 [a2_R46] | British Columbia qualifying environmental trust tax credit | $ | AuraTax-only |  |  |  |
| amount R47 [a2_R47] | British Columbia film and television tax credit | $ | AuraTax-only |  |  |  |
| amount R48 [a2_R48] | British Columbia production services tax credit | $ | AuraTax-only |  |  |  |
| amount R49 [a2_R49] | British Columbia mining exploration tax credit | $ | AuraTax-only |  |  |  |
| amount R50 [a2_R50] | British Columbia scientific research and experimental development tax credit | $ | AuraTax-only |  |  |  |
| amount R51 [a2_R51] | British Columbia book publishing tax credit | $ | AuraTax-only |  |  |  |
| amount R52 [a2_R52] | British Columbia training tax credit | $ | AuraTax-only |  |  |  |
| amount R53 [a2_R53] | British Columbia interactive digital media tax credit | $ | AuraTax-only |  |  |  |
| amount R54 [a2_R54] | British Columbia shipbuilding and ship repair industry tax credit | $ | AuraTax-only |  |  |  |
| amount R55 [a2_R55] | British Columbia clean buildings tax credit | $ | AuraTax-only |  |  |  |
| amount R58 [a2_R58] | British Columbia manufacturing and processing investment tax credit | $ | AuraTax-only |  |  |  |
| amount R56 [a2_R56] | Yukon research and development tax credit | $ | AuraTax-only |  |  |  |
| amount J [a2_lK] | Total estimated refundable tax credits for 2027 (add amounts R1 to R58) | $ | total, AuraTax-only |  |  |  |

## Help text on individual lines

- **amount D [a1_lD]**: If negative enter "0"
- **amount H [a1_lH]**: If the total of Parts I, VI, VI.1 and XIII.1 tax payable is $3,000 or less for either 2027 or 2026, you do not have to make instalment payments on this amount for 2027.
- **amount I [a1_lI]**: See the table of income tax rates and business limits for provinces and territories at canada.ca/en/revenue-agency/services/tax/businesses/topics/ corporations/corporation-tax-rates.html. This amount is your provincial and territorial tax payable (Part I tax and any other applicable tax, including capital taxes) net of provincial and territorial non-refundable credits. If the provincial and territorial tax before refundable credits is $3,000 or less for either 2027 or 2026, you do not have to make instalment payments on this amount for 2027. Do not include provincial tax payable from Quebec or Alberta.
