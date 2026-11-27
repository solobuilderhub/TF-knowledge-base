# AT1: AuraTax vs ca-tax 0.0.38

Lines compared only on schedules ca-tax defines. ca-tax's AT1 is TRA-certified, so disagreements mostly measure AuraTax; each one still goes to the TRA specification before anyone concludes.

| Schedule | same | same after normalising | reworded | different meaning? | only in ca-tax | only in AuraTax | from agrees | from differs | from indirect in AuraTax | from only in ca-tax | from only in AuraTax |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 000 | 18 | 2 | 32 | 6 | 16 | 1 | 2 |  | 3 |  | 20 |
| 001 | 3 |  | 7 |  | 6 |  | 2 |  |  |  | 4 |
| 002 | 28 | 2 | 13 |  |  |  | 5 |  |  |  | 36 |
| 003 | 9 | 5 | 29 |  |  |  | 1 |  |  |  | 8 |
| 004 |  |  | 5 |  | 3 |  |  |  |  |  | 3 |
| 010 | 19 | 1 | 8 |  |  | 5 | 4 |  |  | 12 |  |
| 012 | 1 | 3 | 65 | 1 | 4 |  | 33 | 7 | 5 |  | 13 |
| 013 | 10 | 1 | 8 | 1 | 3 |  | 4 |  |  | 1 | 6 |
| 015 |  |  | 126 | 1 |  |  |  |  |  |  | 73 |
| 016 | 1 |  | 11 |  |  |  | 6 |  |  |  | 2 |
| 017 |  |  | 24 |  | 4 |  | 18 |  |  |  |  |
| 018 | 26 | 2 | 16 |  | 6 |  | 1 | 2 |  |  | 20 |
| 020 | 17 | 4 | 5 |  | 10 |  | 1 |  | 1 |  | 19 |
| 021 | 13 | 10 | 61 | 1 | 3 |  | 13 | 2 |  |  | 38 |
| 029 | 5 | 2 | 28 | 1 | 10 |  |  |  |  |  | 9 |
| 4970 |  |  |  |  | 8 |  |  |  |  |  |  |
| **all** | **150** | **32** | **438** | **11** | **73** | **6** | **90** | **11** | **9** | **13** | **251** |

## To check against the primary document (22)

Captions that share under half their words, and flows where both sides name a different numbered line.

| Sch | Line | Why | ca-tax | AuraTax |
|---|---|---|---|---|
| 000 | 028 | caption | SIC Code | Nature of Business |
| 000 | 039 | caption | If "Yes", specify the reason: | Reason for Tax Year End Change |
| 000 | 051 | caption | If "Yes", specify the reason: | Reason for Final Return |
| 000 | 068 | caption | Total (line G + line H + line I + line J + line K) | Basic Alberta Tax Payable |
| 000 | 091 | caption | If line 090 is a balance due (i.e. positive amount), indicate the amount enclosed with the return | Payment Amount |
| 000 | 092 | caption | If line 090 is an overpayment (i.e. negative amount), indicate the desired disposition: | Method of Payment |
| 012 | 002 | flow | T2 001#300 (Net income (loss) for federal purposes) | T2 200#300 |
| 012 | 048 | caption | Explanation of other reconciling items | If amount in Line 040, provide explanation |
| 012 | 060 | flow | T2 200#320 (Taxable dividends deductible under ITA s.112, 113 or 138(6) — Alberta) | AT1 012#061 |
| 012 | 062 | flow | T2 200#325 (Part VI.1 tax deduction — Alberta) | AT1 012#063 |
| 012 | 074 | flow | T2 200#340 (Taxable capital gains / dividends from a central credit union — Alberta) | AT1 012#075 |
| 012 | 078 | flow | T2 200#350 (Prospector's and grubstaker's shares — Alberta) | AT1 012#079 |
| 012 | 083 | flow | T2 200#335 (ITA section 110.5 and/or subparagraph 115(1)(a)(vii) additions — federal) | T2 200#355 |
| 012 | 140 | flow | T2 200#352 (Employer deduction for non-qualified securities — Alberta) | AT1 012#141 |
| 013 | 037 | caption | UCC adjustment for property other than AIIP | UCC adjustments for non- AIIP acquired during the year |
| 015 | 081 | caption | Deduct: current year claim per federal subsections 66.1(2) and 66.7(3) | Successor Exp.: Deduct: current year claim (or income inclusion if subtotal is negative) |
| 018 | 096 | flow | T2 073#275 (Taxable capital gains under section 34.2 of the federal Act (line 275 of federal Schedule 73, Income Inclusion Summary for Corporations that are members of Partnerships) X 2 =) | T2 006#899 |
| 018 | 098 | flow | T2 073#285 (Deduct: Allowable capital losses under section 34.2 of the federal Act (line 285 of federal Schedule 73, Income Inclusion Summary for Corporations that are Members of Partnerships) X 2 =) | T2 006#901 |
| 021 | 057 | flow | T2 004#210 (Net capital losses (Gross amount) — Current year loss) | AT1 018#a2_099; T2 006#890; T2 006#895 |
| 021 | 072 | caption | Farm losses — Deduct: losses expired (see note on page 4) | Farm Losses: Deduct: losses expired after ten taxation years |
| 021 | 157 | flow | AT1 021#021 (Loss incurred in current year) | AT1 021#037 |
| 029 | 132 | caption | If the corporation has received an IEG in respect of property that is sold or converted to commercial use during the taxation year, enter the amount of recapture | If the corporation disposed of any Alberta Innovation Employment Grant property or is deemed to have disposed of property during the taxation year, enter the amount of recapture |

Every line: `compare/at1-lines.csv`.
