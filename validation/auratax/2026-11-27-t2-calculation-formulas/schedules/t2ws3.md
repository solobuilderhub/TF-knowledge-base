# Sch t2ws3: Calculating your quarterly instalment payments for 2027

What AuraTax 2.3.33 computes for this schedule, read from its calculator code (`574.2fc49058f3a3a53e.js`).
Not a primary source. Notation and conventions: [../README.md](../README.md).

**Calculators:** `calculators/t2ws3.ts` (run 159)

**Cleared before each calculation:** amount 1A [a1_l1A], amount 1B [a1_l1B], amount 1C [a1_l1C], amount 1D [a1_l1D], amount 1E [a1_l1E], amount 1F [a1_l1F], amount 2A [a2_l2A], amount 2B [a2_l2B], amount 2C [a2_l2C], amount 2D [a2_l2D], amount 2E [a2_l2E], amount 2F [a2_l2F], amount 3C [a3_l3C], amount 3D [a3_l3D], amount 3E [a3_l3E], amount 3F [a3_l3F], amount 3G [a3_l3G], amount 3H [a3_l3H], amount 3I [a3_l3I], amount 3J [a3_l3J]

| Line | Caption | Formula | Only when | Source |
|---|---|---|---|---|
| amount 1A [a1_l1A] | Total estimated 2027 federal tax payable (amount H from Worksheet 1) | Sch t2ws1 amount H [a1_lH] |  | t2ws3.ts · calc_line1A · L22590 · run 159 |
| amount 1B [a1_l1B] | Estimated 2027 net provincial and territorial tax payable before refundable credits (amount I from Worksheet 1) | Sch t2ws1 amount I [a1_lI] |  | t2ws3.ts · calc_line1B · L22593 · run 159 |
| amount 1C [a1_l1C] | Total estimated 2027 tax payable (amount 1A plus amount 1B) | sum(amount 1A [a1_l1A], amount 1B [a1_l1B]) |  | t2ws3.ts · calc_line1C · L22596 · run 159 |
| amount 1D [a1_l1D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | Sch t2ws1 amount J [a2_lK] |  | t2ws3.ts · calc_line1D · L22599 · run 159 |
| amount 1E [a1_l1E] | Option 1 instalment base amount (amount 1C minus amount 1D) | (amount 1C [a1_l1C] − amount 1D [a1_l1D]) |  | t2ws3.ts · calc_line1E · L22602 · run 159 |
| amount 1F [a1_l1F] | Four quarterly payments due under option 1 (amount 1E divided by 4) | (amount 1E [a1_l1E] ÷ 4) |  | t2ws3.ts · calc_line1F · L22605 · run 159 |
| amount 2A [a2_l2A] | Total 2026 federal tax payable (total of lines 700, 720, 724, 727 from your T2 return for 2026) | sum(Sch 200 line 700, Sch 200 line 720, Sch 200 line 724, Sch 200 line 727) |  | t2ws3.ts · calc_line2A · L22610 · run 159 |
| amount 2B [a2_l2B] | 2026 net provincial and territorial tax payable before refundable credits (line 760 from your T2 return for 2026) | Sch 200 line 760 |  | t2ws3.ts · calc_line2B · L22613 · run 159 |
| amount 2C [a2_l2C] | Total 2026 tax payable (amount 2A plus amount 2B) | sum(amount 2A [a2_l2A], amount 2B [a2_l2B]) |  | t2ws3.ts · calc_line2C · L22616 · run 159 |
| amount 2D [a2_l2D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | Sch t2ws1 amount J [a2_lK] |  | t2ws3.ts · calc_line2D · L22619 · run 159 |
| amount 2E [a2_l2E] | Option 2 instalment base amount (amount 2C minus amount 2D) | (amount 2C [a2_l2C] − amount 2D [a2_l2D]) |  | t2ws3.ts · calc_line2E · L22622 · run 159 |
| amount 2F [a2_l2F] | Four quarterly payments due under option 2 (amount 2E divided by 4) | (amount 2E [a2_l2E] ÷ 4) |  | t2ws3.ts · calc_line2F · L22625 · run 159 |
| amount 3C [a3_l3C] | Total 2025 tax payable (amount 3A plus amount 3B) | sum(amount 3A [a3_l3A], amount 3B [a3_l3B]) |  | t2ws3.ts · calc_line3C · L22630 · run 159 |
| amount 3D [a3_l3D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | Sch t2ws1 amount J [a2_lK] |  | t2ws3.ts · calc_line3D · L22633 · run 159 |
| amount 3E [a3_l3E] | Option 3 instalment base amount (amount 3C minus amount 3D) | (amount 3C [a3_l3C] − amount 3D [a3_l3D]) |  | t2ws3.ts · calc_line3E · L22636 · run 159 |
| amount 3F [a3_l3F] | First payment due under option 3 (amount 3E divided by 4) | (amount 3E [a3_l3E] ÷ 4) |  | t2ws3.ts · calc_line3F · L22639 · run 159 |
| amount 3G [a3_l3G] | Option 2 instalment base amount (amount 2E) | amount 2E [a2_l2E] |  | t2ws3.ts · calc_line3G · L22642 · run 159 |
| amount 3H [a3_l3H] | First payment due under option 3 (amount 3F) | amount 3F [a3_l3F] |  | t2ws3.ts · calc_line3H · L22645 · run 159 |
| amount 3I [a3_l3I] | Difference (amount 3G minus amount 3H) | (amount 3G [a3_l3G] − amount 3H [a3_l3H]) |  | t2ws3.ts · calc_line3I · L22648 · run 159 |
| amount 3J [a3_l3J] | Remaining three quarterly payments due under option 3 (amount 3I divided by 3) | (amount 3I [a3_l3I] ÷ 3) |  | t2ws3.ts · calc_line3J · L22651 · run 159 |
