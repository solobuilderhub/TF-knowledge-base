# Sch t2ws3: Calculating your quarterly instalment payments for 2027

From AuraTax 2.3.33, `fixtures/t2/specs/t2ws3.json` and `extras/t2ws3.json`. Not a primary source; check every rule against the published form.

## AuraTax's help text for this schedule

• Use this worksheet to calculate your 2027 quarterly instalment payments for an eligible Canadian-controlled private corporation (CCPC). If you are not eligible to make quarterly instalment payments, use Worksheet 2.

• To find out if you are eligible to make quarterly instalment payments, see canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-payments.

• Use the estimates calculated from Worksheet 1 to complete this worksheet. If you had tax payable for 2026, complete option 2; if you had tax payable for 2025, complete option 3.

• Instalment payments are due on the last day of every complete quarter of your corporation's tax year. For more information, see canada.ca/important-dates-corporations and select “Instalment due dates”.

• This worksheet does not have to be filed with your T2, Corporation Income Tax Return.

## Lines

### Option 1 – 2027

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| amount 1A [a1_l1A] | Total estimated 2027 federal tax payable (amount H from Worksheet 1) | $ | AuraTax-only |  |  |  |
| amount 1B [a1_l1B] | Estimated 2027 net provincial and territorial tax payable before refundable credits (amount I from Worksheet 1) | $ | AuraTax-only |  |  |  |
| amount 1C [a1_l1C] | Total estimated 2027 tax payable (amount 1A plus amount 1B) | $ | AuraTax-only |  |  |  |
| amount 1D [a1_l1D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | $ | AuraTax-only |  |  |  |
| amount 1E [a1_l1E] | Option 1 instalment base amount (amount 1C minus amount 1D) | $ | AuraTax-only |  |  |  |
| amount 1F [a1_l1F] | Four quarterly payments due under option 1 (amount 1E divided by 4) | $ | total, AuraTax-only |  |  |  |

### Option 2 – 2026

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| amount 2A [a2_l2A] | Total 2026 federal tax payable (total of lines 700, 720, 724, 727 from your T2 return for 2026) | $ | AuraTax-only |  |  |  |
| amount 2B [a2_l2B] | 2026 net provincial and territorial tax payable before refundable credits (line 760 from your T2 return for 2026) | $ | AuraTax-only |  |  |  |
| amount 2C [a2_l2C] | Total 2026 tax payable (amount 2A plus amount 2B) | $ | AuraTax-only |  |  |  |
| amount 2D [a2_l2D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | $ | AuraTax-only |  |  |  |
| amount 2E [a2_l2E] | Option 2 instalment base amount (amount 2C minus amount 2D) | $ | AuraTax-only |  |  |  |
| amount 2F [a2_l2F] | Four quarterly payments due under option 2 (amount 2E divided by 4) | $ | total, AuraTax-only |  |  |  |

### Option 3 – 2025

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| amount 3A [a3_l3A] | Total 2025 federal tax payable (total of lines 700, 720, 724, 727 from your T2 return for 2025) | $ | AuraTax-only |  |  |  |
| amount 3B [a3_l3B] | 2025 net provincial and territorial tax payable before refundable credits (line 760 from your T2 return for 2025) | $ | AuraTax-only |  |  |  |
| amount 3C [a3_l3C] | Total 2025 tax payable (amount 3A plus amount 3B) | $ | AuraTax-only |  |  |  |
| amount 3D [a3_l3D] | Total estimated refundable tax credits for 2027 (amount J from Worksheet 1) | $ | AuraTax-only |  |  |  |
| amount 3E [a3_l3E] | Option 3 instalment base amount (amount 3C minus amount 3D) | $ | AuraTax-only |  |  |  |
| amount 3F [a3_l3F] | First payment due under option 3 (amount 3E divided by 4) | $ | total, AuraTax-only |  |  |  |
| amount 3G [a3_l3G] | Option 2 instalment base amount (amount 2E) | $ | AuraTax-only |  |  |  |
| amount 3H [a3_l3H] | First payment due under option 3 (amount 3F) | $ | AuraTax-only |  |  |  |
| amount 3I [a3_l3I] | Difference (amount 3G minus amount 3H) | $ | AuraTax-only |  |  |  |
| amount 3J [a3_l3J] | Remaining three quarterly payments due under option 3 (amount 3I divided by 3) | $ | total, AuraTax-only |  |  |  |

### Summary

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| [a4_1] | Under option 1, the following amount is due each quarter of the tax year. | $ | AuraTax-only |  |  |  |
| [a4_2] | Under option 2, the following amount is due each quarter of the tax year. | $ | AuraTax-only |  |  |  |
| [a4_3] | Under option 2, the following amount is due for the first quarter of the tax year | $ | AuraTax-only |  |  |  |
| [a4_4] | Then, the following amount is due each quarter for the remaining three quarters of the tax year. | $ | AuraTax-only |  |  |  |
| [a4_txt1] | Note |  | heading |  |  |  |
| [a4_txt1_1] | You can use the option that results in the least amount payable by instalments. Any remaining unpaid tax is payable on or before the balance-due day.<br>We will charge interest if you use option 1 and the estimated tax is lower than the year's actual tax and the tax calculated using option 2 or 3. |  | heading |  |  |  |

## Help text on individual lines

- **amount 1A [a1_l1A]**: If the total of Parts I, VI, VI.1 and XIII.1 tax payable is $3,000 or less for either 2027 (amount 1A) or 2026 (amount 2A), you do not have to make instalment payments on this amount for 2027.
- **amount 1B [a1_l1B]**: This amount is net of provincial and territorial non-refundable credits. If the provincial and territorial tax before refundable credits is $3,000 or less for either 2027 (amount 1B) or 2026 (amount 2B), you do not have to make instalment payments on this amount for 2027.
- **amount 2A [a2_l2A]**: If the total of Parts I, VI, VI.1 and XIII.1 tax payable is $3,000 or less for either 2027 (amount 1A) or 2026 (amount 2A), you do not have to make instalment payments on this amount for 2027.
- **amount 2B [a2_l2B]**: This amount is net of provincial and territorial non-refundable credits. If the provincial and territorial tax before refundable credits is $3,000 or less for either 2027 (amount 1B) or 2026 (amount 2B), you do not have to make instalment payments on this amount for 2027.
