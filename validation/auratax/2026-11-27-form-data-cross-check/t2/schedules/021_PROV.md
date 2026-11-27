# Sch 021_PROV: Part 9 – Provincial or territorial foreign tax credit

From AuraTax 2.3.33, `fixtures/t2/specs/021_PROV.json` and `extras/021_PROV.json`. Not a primary source; check every rule against the published form.

## AuraTax's help text for this schedule

• Fill out a separate calculation for each province or territory for which you are claiming the credit.

• If you have foreign non-business income from more than one country, fill out a separate calculation for each country and total these calculations to determine the credit for the applicable province or territory.

## Lines

### Part 9 – Provincial or territorial foreign tax credit

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| [a58] |  |  | heading |  |  |  |
| [a59] |  | AN | AuraTax-only |  |  |  |
| [a60] | Foreign non-business income tax available for provincial or territorial foreign tax credit: |  | heading |  |  |  |
| amount 9A [a61] | Foreign non-business income tax paid for the year (amount from column 1C in Part 1) |  | heading |  |  |  |
| amount 9B [a62] | Foreign non-business income tax paid, deducted from income under subsection 20(12) (amount from column 1D in Part 1) |  | heading |  |  |  |
| amount 9C [a63] | Subtotal (amount 9A minus amount 9B) |  | heading |  |  |  |
| amount 9D [a64] | Federal foreign non-business income tax credit deductible (amount from column 1I in Part 1) |  | heading |  |  |  |
| amount 9E [a65] | Foreign non-business income tax credit available (amount 9C minus amount 9D) |  | heading |  |  |  |
| [a9_L1] | If amount 9E is "0", no provincial or territorial foreign tax credit may be claimed in respect of the foreign country. |  | heading |  |  |  |
| amount 9F [a78] | Amount 9E x (taxable income earned in the province or territory [Note 1] / taxable income [Note 2]) |  | heading |  |  |  |
| [a69] | Limit on amount of foreign non-business income tax that can be claimed: |  | heading |  |  |  |
| amount 9G [a70] | Net foreign non-business income earned in the year (amount from column 1B in Part 1) |  | heading |  |  |  |
| amount 9H [a76] | Amount 9G x provincial or territorial tax rate |  | heading |  |  |  |
| amount 9I [a77] | Amount 9H x [(taxable income earned in the province or territory) / (taxable income)] |  | heading |  |  |  |
| amount 9J [a75] | Provincial or territorial foreign tax credit (lesser of amount 9F or amount 9I) |  | AuraTax-only |  | Sch 005 line 501<br>Sch 005 line 528<br>Sch 005 line 554<br>Sch 005 line 576<br>Sch 005 line 408<br>Sch 005 line 601<br>Sch 005 line 625<br>Sch 005 line 650<br>Sch 005 line 676<br>Sch 005 line 701<br>Sch 005 line 730<br>Sch 510 line 550 |  |
| [a9_L2] | Enter amount 9J on the corresponding line in Part 2 of Schedule 5, Tax Calculation Supplementary – Corporations. If you have more than one calculation of the credit for a province or territory, enter the total credits calculated on the corresponding line in Part 2 of Schedule 5. |  | heading |  |  |  |
| [a9_L3] | For Ontario, if the corporation is not a life insurance corporation, also enter amount 9J on line 550 of Schedule 510, Ontario Corporate Minimum Tax. |  | heading |  |  |  |
| [a9_pre9F_1] |  | $ | hidden, AuraTax-only |  |  |  |
| [a9_pre9F_2] |  | $ | hidden, AuraTax-only |  |  |  |
| [a9_pre9I] |  | $ | hidden, AuraTax-only |  |  |  |
| [a9_pre9H] |  | % | hidden, AuraTax-only |  |  |  |

### (not in any section)

| Line | Caption | Type | Kind | From | To | Rules |
|---|---|---|---|---|---|---|
| [a58] |  | AN | AuraTax-only |  |  |  |

## Help text on individual lines

- **amount 9F [a78]**: Note 1 : Enter the amount allocated to the province or territory in column F from Part 1 of Schedule 5. For Nova Scotia and Newfoundland and 
Labrador, include their offshore areas. For Ontario, if the corporation's taxable income is nil, calculate the amount in column F as if the taxable 
income were $1,000.

Note 2 : Do not include taxable income earned outside Canada. For Ontario, if the corporation's taxable income is nil, enter "1,000."
- **amount 9H [a76]**: For all provinces and territories except Ontario, use the higher tax rate. If the rate has changed during the tax year, use the average rate 
based on the number of days in the tax year before and after the change. For Ontario, use the basic rate of tax calculated in Part 1 of 
Schedule 500, Ontario Corporation Tax Calculation.
- **amount 9I [a77]**: Enter the amount allocated to the province or territory in column F from Part 1 of Schedule 5. For Nova Scotia and Newfoundland and 
Labrador, include their offshore areas. For Ontario, if the corporation's taxable income is nil, calculate the amount in column F as if the taxable 
income were $1,000.

Enter the amount from line 360 or amount Z, whichever applies, from page 3 of the T2 Corporation Income Tax Return. For Ontario, if the 
corporation's taxable income is nil, enter "1,000."
