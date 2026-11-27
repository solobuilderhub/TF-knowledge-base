# Sch t2ws1: Calculating your estimated tax payable and tax credits for 2027

What AuraTax 2.3.33 computes for this schedule, read from its calculator code (`574.2fc49058f3a3a53e.js`).
Not a primary source. Notation and conventions: [../README.md](../README.md).

**Calculators:** `calculators/t2ws1.ts` (run 157)

**Cleared before each calculation:** amount 1 [a1_l1], amount B [a1_lB], amount N1 [a1_N1], amount N2 [a1_N2], amount C [a1_lC], amount D [a1_lD], amount H [a1_lH], amount J [a2_lK]

| Line | Caption | Formula | Only when | Source |
|---|---|---|---|---|
| amount 1 [a1_l1] | Base amount of federal tax on income (Part I tax) - amount A × 38% | (amount A [a1_lA] × 0.38) |  | t2ws1.ts · calc_line1 · L22425 · run 157 |
| amount B [a1_lB] | Total estimated 2027 federal tax on income before credits (add amounts 1 to 6) | sum(amount 1 [a1_l1], amount 2 [a1_l2], amount 3 [a1_l3], amount 4 [a1_l4], amount 5 [a1_l5], amount 6 [a1_l6]) |  | t2ws1.ts · calc_lineB · L22431 · run 157 |
| amount N1 [a1_N1] | Small business deduction (maximum $95,000) - amount A × 19% | (amount A [a1_lA] × 0.19) |  | t2ws1.ts · calc_line_N1 · L22434 · run 157 |
| amount N2 [a1_N2] | Federal tax abatement - amount A × 10% | (amount A [a1_lA] × 0.1) |  | t2ws1.ts · calc_line_N2 · L22440 · run 157 |
| amount C [a1_lC] | Total estimated 2027 non-refundable tax credits (add amounts N1 to N12) | sum(amount N1 [a1_N1], amount N2 [a1_N2], amount N3 [a1_N3], amount N4 [a1_N4], amount N5 [a1_N5], amount N6 [a1_N6], amount N7 [a1_N7], amount N8 [a1_N8], amount N9 [a1_N9], amount N10 [a1_N10], amount N11 [a1_N11], amount N12 [a1_N12]) |  | t2ws1.ts · calc_lineC · L22446 · run 157 |
| amount D [a1_lD] | Estimated 2027 tax payable on income (Part I tax) (amount B minus amount C) | (amount B [a1_lB] − amount C [a1_lC]) |  | t2ws1.ts · calc_lineD · L22449 · run 157 |
| amount H [a1_lH] | Total estimated 2027 federal tax payable(add amounts D to G) | sum(amount D [a1_lD], amount E [a1_lE], amount F [a1_lF], amount G [a1_lG]) |  | t2ws1.ts · calc_lineH · L22452 · run 157 |
| amount J [a2_lK] | Total estimated refundable tax credits for 2027 (add amounts R1 to R58) | see [long formula 1](#long-formulas) |  | t2ws1.ts · calc_lineJ · L22457 · run 157 |

## Long formulas

**Long formula 1**

### amount J [a2_lK] (t2ws1.ts · calc_lineJ · L22457 · run 157)

sum(amount R1 [a2_R1], amount R2 [a2_R2], amount R3 [a2_R3], amount R4 [a2_R4], amount R5 [a2_R5], amount R6 [a2_R6], amount R7 [a2_R7], amount R8 [a2_R8], amount R9 [a2_R9], amount R10 [a2_R10], amount R11 [a2_R11], amount R12 [a2_R12], amount R13 [a2_R13], amount R14 [a2_R14], amount R15 [a2_R15], amount R16 [a2_R16], amount R17 [a2_R17], amount R18 [a2_R18], amount R19 [a2_R19], amount R20 [a2_R20], amount R21 [a2_R21], amount R22 [a2_R22], amount R23 [a2_R23], amount R24 [a2_R24], amount R25 [a2_R25], amount R26 [a2_R26], amount R27 [a2_R27], amount R28 [a2_R28], amount R29 [a2_R29], amount R30 [a2_R30], amount R31 [a2_R31], amount R57 [a2_R57], amount R32 [a2_R32], amount R33 [a2_R33], amount R34 [a2_R34], amount R35 [a2_R35], amount R36 [a2_R36], amount R37 [a2_R37], amount R38 [a2_R38], amount R39 [a2_R39], amount R40 [a2_R40], amount R41 [a2_R41], amount R42 [a2_R42], amount R43 [a2_R43], amount R44 [a2_R44], amount R45 [a2_R45], amount R46 [a2_R46], amount R47 [a2_R47], amount R48 [a2_R48], amount R49 [a2_R49], amount R50 [a2_R50], amount R51 [a2_R51], amount R52 [a2_R52], amount R53 [a2_R53], amount R54 [a2_R54], amount R55 [a2_R55], amount R58 [a2_R58], amount R56 [a2_R56])

Only when: -

