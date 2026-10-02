# AT1 Alberta Corporate Income Tax Return (jacket)

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-20 – 3-39 (PDF 17–40 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1-jacket-TRA11722.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| ACTC | Alberta Corporate Tax Calculation | — | — | 3-27 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 005 | Software Approval Code | AN | M | — | To be supplied by Treasury Board and Finance upon certification of the AT1 RSI and/or Alberta Net File Return software. | 3-20 |
| 010 | Legal Name of Corporation | AN | M | — | **CRITICAL MANDATORY** Must equal fed 200002. This field must be entered. | 3-20 |
| 011 | Operating Name of Corporation | AN | O | — | If fed 125000101 exists, default to this name or allow for input of the corp operating name, otherwise default to blank. | 3-20 |
| 012 | Mailing Address of Business Line 1 | AN | M | — | **CRITICAL MANDATORY** If fed 200021 is a name, then value should equal fed 200022 if it exists. If fed 200021 is an address, value should equal fed 200021. Otherwise, if no address at fed 200021 or fed 200022, specify value for 000012. This field must be entered. | 3-21 |
| 013 | Mailing Address of Business Line 2 | AN | X | — | If fed 200021 is a name, then value should equal fed 200023 if it exists. If fed 200021 is an address, value should equal fed 200022 + fed 200023. Otherwise, if no address at fed 200021 or fed 200022, specify value for 000013 if it is required. | 3-21 |
| 014 | City/Town | AN | M | — | **CRITICAL MANDATORY** May equal fed 200025 if it exists, otherwise specify city/town. This field must be entered. | 3-21 |
| 015 | Prov./State | A | X | — | May equal fed 200026 if it exists, otherwise specify a valid province or state code. See Section 3.4 for listings of valid codes. If the country of origin is Canada or the US, then this field MUST be completed with a valid code. | 3-21 |
| 016 | Country Code | A | X | — | May equal fed 200027 if it exists, otherwise allow input of a valid country code only if other than Canada. See Section 3.4 for listing of valid codes. | 3-22 |
| 017 | Postal/Zip Code | AN | M | — | May equal fed 200028 if it exists, otherwise specify a valid postal or zip code. If the country of origin is Canada or the US, then this field MUST be completed with a valid code. | 3-22 |
| 018 | Assessment Address Name | AN | O | — | If fields 012 to 017 are not to be used for mailing the NOA and assmt correspondence, specify alternate address in 024. fields 018 to At 000018 enter name of addressee at alternate address if required. | 3-22 |
| 019 | Assessment Address Line 1 | AN | X | — | If 018 exists or if fields 012 to 017 are not to be used for mailing the NOA and assmt correspondence, specify address line 1. | 3-22 |
| 020 | Assessment Address Line 2 | AN | O | — | Specify address line 2 if required. | 3-22 |
| 021 | City/Town | AN | X | — | If 019 exists, specify city/town. | 3-22 |
| 022 | Prov./State | A | X | — | If 021 exists and the City/Town is within Canada or US, specify a valid province or state code. See Section 3.4 for listing of valid codes. | 3-23 |
| 023 | Country Code | A | X | — | If 022 exists, allow input of a valid country code only if other than Canada. See Section 3.4 for listing of valid codes. | 3-23 |
| 024 | Postal/Zip Code | AN | X | — | If 022 exists, specify a valid postal or zip code. | 3-23 |
| 025 | Contact Person to discuss return | AN | M | — | If the contact person for the AT1 is the same as for the T2, value = fed 200958 if it exists. If fed 200957 = 1, value = fed 200951 + fed 200950. Otherwise, if contact person is different for the AT1, allow input of the contact person’s name. | 3-23 |
| 026 | Contact Person’s Telephone No. | N | M | — | If same as federal, value = fed 200959 if it exists, if not then equal to fed 200956. If different from the federal contact, allow input of contact person’s phone number. Must include area code. | 3-23 |
| 027 | Contact Person’s Fax No. | N | O | — | Fax number of contact person. Must include area code. | 3-23 |
| 028 | Nature of Business | N | M | — | Must be a valid code from the SIC codes (See Section 3.5). Otherwise, default value = 9999. | 3-23 |
| 029 | Type of Corporation | N | M | — | Must be a valid code: 1=CCPC (fed 200040=1); 2=AB professional (fed 200040=1); 3=other private (fed 200040 = 2); 4=Public (fed 200040=3); 5=other (fed 200040=4 or 5). Note: If a corporation is a CCPC at the end of the year but not throughout the year, then value = 5. | 3-24 |
| 030 | Special Corporation Status | N | X | — | If fed 200218=1 or federal form 018 exists, then this field must equal either 1=Investment Corp., 2=Mutual Fund Corp. If enter one of the following values if applicable: 3=Co-operative 4=Credit Union 5=Exempt corp. under fed ITA section 149. 6=Insurance Corporation 7=Non-resident Corporation | 3-24 |
| 031 | Has there been a wind-up of a subsidiary under ITA section 88 during the current taxation year? | N | M | — | Value = fed 200072. Or if fed 024400, fed 024500, fed 024600 or fed 024700 exist, value must = 1. Otherwise, default value = 2. | 3-24 |
| 032 | Is this the first year of filing after an amalgamation? | N | M | — | Value = fed 200071. Or if fed 024200, or fed 024300 exist, value must = 1. Otherwise, default value = 2. | 3-24 |
| 034 | Alberta Corporate Account Number | N | M | — | **CRITICAL MANDATORY** Must be the Alberta Corporate Account Number. NOTE: If first year filing after amalgamation (i.e. fed 200071=1) then ensure client is prompted to enter the new CAN for the amalgamated corp. – they may be able to use the same core fed BN but they will have a new CAN assigned on amalgamation. (The mod 10 check digit algorithm is available on request from TRA) | 3-25 |
| 035 | Federal Business Number | AN | M | — | Must equal fed 200001. No override permitted. | 3-25 |
| 036 | Taxation Year Beginning | D | M | — | **CRITICAL MANDATORY** Must equal fed 200060. No override permitted. This field must be entered. | 3-25 |
| 037 | Taxation Year Ending | D | M | — | **CRITICAL MANDATORY** Must equal fed 200061. No override permitted. This field must be entered. | 3-25 |
| 038 | Tax Year End Change since last return filed? | N | M | — | Enter a valid code to specify if the taxation year end has changed since the last return was filed. 1 = Yes, 2 = No. If fed 200063 = 1, then 000038 must equal 1. | 3-25 |
| 039 | Reason for Tax Year End Change | N | X | — | If 000038=1, must be a valid code: 1=CRA approved change; 2=Change in Control (fed 200063=1); 3=Final Return (if fed 200076 or fed 200078 = 1, value must equal 3). If 000038=2, then value must be blank. | 3-26 |
| 041 | State the functional currency used | N | X | — | Enter a valid code to specify the functional currency used if other than Canadian. 1 = United States of America; 2 = United Kingdom; 3 = European Monetary Union; 4 = Australia ; 5 = Japan | 3-26 |
| 043 | Average Exchange Rate | N | X | — | If 000041 exist, value cannot be blank. | 3-26 |
| 047 | Gross Revenue | $ | M | — | Must equal the sum of all occurrences of fed 1258299 + all occurrences of fed 1259659. | 3-26 |
| 048 | Total Assets | $ | M | — | Must equal fed 1002599. | 3-26 |
| 050 | Final Return? | N | M | — | If 000039 = 3, then value must = 1. Otherwise, value may equal 1 (Yes) or 2 (No) but cannot be blank. | 3-26 |
| 051 | Reason for Final Return | N | X | — | If 000050=1, must be a valid code: 1=Amalg (fed 200076=1); 2=Discontinuance of permanent establishment (fed 200078 = 1); 3=Bankruptcy; 4=Wind-up into parent; 5=Dissolution of corporation. If 000050=2, field must not exist. | 3-26 |
| 052 | Date of Amalgamation | D | X | — | If 000051=1, date of amalgamation must exist. Value must be one day after or equal 000037. | 3-27 |
| 053 | Date Operations Ceased. | D | X | — | If 000051=5, date operations ceased must exist. If 000050=2, field must not exist. | 3-27 |
| 054 | Transfer of property under ITA 85(1), 85(2) or 97(2) ? | N | M | — | If the corp has elected federally to transfer property during this taxation year under these ITA sections (fed T2057, T2058 or T2059 may have been completed or will need to be completed for the taxation year) value = 1 (Yes). Otherwise, default value = 2 (No). | 3-27 |
| 060 | Is the corporation reporting different taxable income for AB and federal purposes? | N | M | — | If the corp is electing to calculate AB taxable income/loss different from federal taxable income/loss, then value = 1. Otherwise, default = 2. NOTE: IF VALUE = 1, THEN A VALID SCHEDULE 12 MUST EXIST. | 3-27 |
| 061 | Has the corp elected to use any different discretionary amounts for the current year claim or do opening balances differ for federal and Alberta purposes? | N | M | — | If 000060 = 1, then 000061 must = 1. Or if the corp is electing to differ the amount of any discretionary accounts (i.e. CCA, loss, etc) in the current year or if the opening balance of any of these for AB is not equal to the fed amount, then value = 1 . Otherwise, default = 2. NOTE: IF VALUE = 1, THEN A VALID SCHEDULE 12 MUST EXIST. | 3-28 |
| 062 | Alberta Taxable Income or (Loss) | $ | M | — | If either 000060 or 000061 = 1 then value = 012090 - 012092. If both 000060 and 000061= 2, value = (fed 004110 + fed 004310) x (-1) if it exists, otherwise default = fed 200360 - fed 200370. | 3-28 |
| 064 | Royalty Tax Deduction | $ | M | — | If form 005 exists, value = 005016 + 005140 where the value cannot exceed 000062. Otherwise if form 005 does not exist, default = zero. | 3-28 |
| 065 | Alberta Allocation Factor | % | M | — | If form 002 exists, then compute the following to 6 decimal places: If 002002 or 002006 exist, calculate: [(002002/002004) + (002006/002008)] x ½ Note: where 002004 or 002008 = zero, do not multiply by ½. If 002012 or 002016 exist, value = [(002012/002014) + (002016/002018)] x ½ If 002022 or 002026 exist, value = [(002022/002024) + (002026/002028)] x ½ If 002032 or 002036 exist, value = [(002032/002034) + (002036/002038)] x ½ If 002046 exists, value = 002046/002048 If 002052 or 002056 exist, value = [(002052/002054) + (2 x 002056/002058)] x 1/3 If 002066 exists, value = 002066/002068 If 002072 or 002076 exist, value = [(002072/002074) + (3 x 002076/002078] x ¼ If 002082 or 002086 exist, value = [(002082/002084) + (002086/002088)] x ½ If 002090 or 002094 exist, then value = [(002102 x 002094/002096) + 002104] / (000062 - 000064) If 002106 exists, value = 002106/002108 Otherwise if AB form 002 does not exist, default = 1 | 3-28 |
| 068 | Basic Alberta Tax Payable | $ | M | — | A = [(000062 - 000064) x 000065] B = nbr of days in tax year after March 31, 2006 and before July 1, 2015 C = nbr of days in tax year after June 30, 2015 and before July 1, 2019 D = nbr of days in tax year after June 30, 2019 and before January 1, 2020 E = nbr of days in tax year after December 31, 2019 and before July 1, 2020 F = nbr of days in tax year after June 30, 2020 G = total nbr of days in tax year H = A x .100 x B/H I = A x .120 x C/H J = A x .110 x D/H K = A x .100 x E/H L = A x .080 x F/H Value = H + I + J + K + L Round up at $.50 to the nearest dollar. If the value is negative, default = zero. NOTE EXCEPTION: If 000030 = 5 (i.e. sec. 149 exempt) then value must = zero. However, if it is a partial exemption, then 000068 can be greater than zero. (The following method is used by TRA to compute 000068: 1. Compute the ATP rate for the different applicable periods. For example: For a straddle taxation year of November 1, 2005 to October 31, 2006. .115 x 151 = 17.365 .100 x 214 = 21.4 2. Add the total ATP rate from step 1 and divide by the period length to obtain a total prorated rate, keeping the 5 decimals. 17.365 + 21.4 = 38.765 / 365 = 0.10621 3. Multiply line 000066 by the total prorated rate, rounding to a whole number.) | 3-30 |
| 070 | Alberta Small Business Deduction | $ | M | — | If form 001 exists, calculate: A = 001003 - 000064 B = 001009 - 000064 C = nbr of days in tax yr after March 31, 2009 & before July 1, 2015 D = nbr of days in tax yr after June 30, 2015 & before January 1, 2017 E = nbr of days in tax yr after December 31, 2016 & before July 1, 2019 F = nbr of days in tax yr after June 30, 2019 & before January 1, 2020 G = nbr of days in tax yr after December 31, 2019 & before July 1, 2020 H = nbr of days after June 30, 2020 I = total nbr of days in tax yr J = [least of A, B or (001015 X 250%)] x 001021 X .070 X C/I K = [least of A, B or (001015 X 250%)] x 001021 X .090 X D/I L = [least of A, B or (001015 X 250%)] x 001021 X .100 X E/I M = [least of A, B or (001015 X 250%)] x 001021 X .090 X F/I N = [least of A, B or (001015 X 250%)] x 001021 X .080 X G/I O = [least of A, B or (001015 X 250%)] x 001021 X .060 X H/I Value = J + K + L + M + N + O Otherwise, if form 001 does not exist default = zero. | 3-32 |
| 071 | Alberta Manufacturing and Processing Profits Deduction | $ | M | — | If form 011 exists, calculate: A = 011042 if it exists, otherwise A = 011001. B = [least of (001003 – 000064), (001009 – 000064) and 001015] x 001021 C = A – B D = (000062 - 000064) x 000065 E = D - [(least of (001003 – 000064), (001009 – 000064) and 001015) + 011013) x 000065] F = nbr of days in tax yr before April 1/01 G = nbr of days in tax yr after Mar 31/01 Value = (the lessor of C or E) x [F/(F+G)] x .01 Otherwise if form 011 does not exist, default = zero. | 3-33 |
| 072 | Alberta Foreign Investment Income Tax Credit | $ | M | — | If form 004 exists, value equals the lessor of: the sum of all occurrences of 004012 or 000068 - (000070 + 000071). Otherwise if form 004 does not exist, default = zero. | 3-34 |
| 074 | Alberta Political Contributions Tax Credit | $ | M | — | If form 008 exists, calculate according to the applicable period: All political contributions for the taxation year were made in 2003 or earlier: A=(sum of all occurrences of 008008)+ 008012 where 008012 only contains contributions made in 2003 or earlier If A is less than or equal to $150, then B = A x .75 If A is greater than $150 but less than or equal to $825, then B = $112.50 + [(A - $150) x .50]. If A is greater than $825, then B = $450 + [(A - $825) x .333] Value = least of: B; or $750; or 000068 - (000070 + 000071 + 000072) All political contributions for the taxation year were made in 2004 or later: A=(sum of all occurrences of 008008)+ 008013 If A is less than or equal to $200, then B = A x .75 If A is greater than $200 but less than or equal to $900, then B = $150 + [(A - $200) x .50]. If A is greater than $900, then B = $600 + [(A - $900) x .333] Value = least of: B; or $1000; or 000068 - (000070 + 000071 + 000072) Political contributions must have been made in BOTH 2003 and 2004 AND the taxation year begins in 2003 and end in 2004: Value = 75%A + 75%B + 50%C + 50%D + 1/3E + 1/3F Where X = (sum of all occurrences of 008008 where date ends only in 2004)+ 008013 Y = (sum of all occurrences of 008008)+ 008012 + 008013 Then A = lesser of: Y and $150 B = lesser of: (X – A) and $50 C = lesser of: [Y- (A + B)] and $675 D = lesser of: [X – (A + B+ C)] and $225 E = lesser of: [Y- (A + B + C + D)] and $900 F = lesser of: [X – (A + B + C + D + E)] and $300 Otherwise if form 008 does not exist, default = zero. | 3-34 |
| 076 | Other Deductions | $ | M | — | Default value = zero. This field is reserved for 029“other” possible deductions which include the Investor Tax Credit, and Capital Investment Tax Credit and Agri-Processing Investor Tax Credit. It is possible that this field could be overridden by the client to enter the other Schedule 8 political contributions tax credit under the Senatorial Selection Act – see AT1 Guide regarding Schedule 8 for further information. If form 003 exists, value = 604. Value cannot exceed 000068 - (000070 + 000071 + 000072 + 000074). | 3-36 |
| 080 | Alberta Tax Payable | $ | M | — | Calculate: 000068 - (000070 + 000071 + 000072 + 000074 + 000076). | 3-37 |
| 081 | Alberta Scientific Research & Experimental Development Tax Credit | $ | M | — | If form 009 exists, value = (lesser of line 009031 and 009108 X 10%) minus 009112 minus 009116. Otherwise if form 009 does not exist, default = zero. | 3-37 |
| 129 | Innovation Employment Grant | $ | M | — | If form 029 exists, value = (029110 + 029112 X 029128) minus 029132. Otherwise if form 029 does not exist, default = zero. | 3-37 |
| 082 | Instalments and other payments and ARTC instalments credited to income tax account for this taxation year | $ | M | — | If payments were made to TRA for this taxation year other than any amount enclosed with this return, enter the total amount of payment. Otherwise, default = zero. | 3-37 |
| 085 | Interactive Digital Media Tax Credit (IDMTC) | $ | M | — | If Interactive Digital Media Tax Credits exist, enter the value. Otherwise, default = zero. | 3-37 |
| 110 | Tax Certificate Number | AN | X | — | If 000085 > zero, value cannot be blank. | 3-37 |
| 086 | Alberta Capital Gains Refund | $ | M | — | If 000030 = 1 or 2, enter the Alberta capital gain refund amount. Otherwise set field value to zero. | 3-37 |
| 115 | Alberta Film and Television Tax Credit (FTTC) | $ | M | — | If Alberta Film and Television Tax Credit (FTTC) exist, enter the value. Otherwise, default = zero. | 3-38 |
| 087 | Other Credits | $ | M | — | If Qualifying Environmental Trust amount exists, enter the value. Otherwise, default = zero. | 3-38 |
| 090 | Balance Unpaid (Overpayment) | $ | M | — | Calculate: 000080 - (000081 + 000082 + 00085 + 000086 + 000087). | 3-38 |
| 091 | Payment Amount | $ | M | — | If 000090 is greater than zero, enter amount of your payment. (i.e. cheque, cash or pre-authorized debit amount). Otherwise, if 000090 is less than or equal to zero, then default = zero. NOTE: Default to zero for Net File Return format. | 3-38 |
| 092 | Method of Payment | N | X | — | If 000090 is less than zero, enter a valid code: 1 = Refund, 2 = Apply to payments for the next taxation year. | 3-38 |
| 093 | Fax number for transmitting NOA | N | O | — | If NOA is to be faxed, specify the fax number. Area code must be included. | 3-38 |
| 095 | Was this return prepared by a tax preparer for a fee? | N | M | — | If return was prepared by a tax preparer then value = 1 (yes) otherwise default value = 2 (no) | 3-38 |
| 096 | If yes, provide the preparer's name or firm name | AN | X | — | If field 095 = 1 provide tax preparers name or firm name. | 3-39 |
| 097 | Surname of signing officer | A | M | — | May be equal to fed 200950, or enter the surname of the person who signed for this return, who must be an authorized signing officer of the corporation. | 3-39 |
| 098 | First name of signing officer | A | M | — | May be equal to fed 200951, or enter the first name of the person who signed for this return, who must be an authorized signing officer of the corporation. | 3-39 |
| 099 | Position, office or rank of signing officer | A | M | — | May be equal to fed 200954, or enter the position of the person who signed for this return, who must be an authorized signing officer of the corporation. | 3-39 |
| 101 | Certification: Date | D | M | — | No override permitted. This field must be entered. | 3-39 |
| 103 | Certification: Telephone Number | N | M | — | No override permitted. Must include area code. This field must be entered. | 3-39 |
| 105 | CIT Authorized Email | AN | M | — | No override permitted. This field must be entered. Must be a valid-formatted e-mail address. This email must belong to the owner, operator, or director of the corporation. It is not intended for accountants, tax preparers, or third party. It will only be used to send important TRACS updates and key documents related to your tax account. The regular expression used for address validation is the following: ^[a-z0- 9!#$%&''*+/=?^_`{\|}~- ]+(\.[a-z0- 9!#$%&''*+/=?^_`{\|}~- ]+)*@([a-z0-9]([a-z0- 9-]*[a-z0- 9])?\.)+([A-Z]{1,6})$ Â À Ç É Ê Ë È Î Ï Ô Ö Û Ü Ù â à ç é ê ë è î ï ô ö û ü ù 2017043239 | 3-39 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **000080** = `000068 - (000070 + 000071 + 000072 + 000074 + 000076)`
- **000090** = `000080 - (000081 + 000082 + 00085 + 000086 + 000087)`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 010 | 200002 |
| 011 | 125000 |
| 012 | 200021, 200022 |
| 013 | 200021, 200022, 200023 |
| 014 | 200025 |
| 015 | 200026 |
| 016 | 200027 |
| 017 | 200028 |
| 025 | 200950, 200951, 200957, 200958 |
| 026 | 200956, 200959 |
| 029 | 200040 |
| 030 | 200218 |
| 031 | 024600, 024700, 200072 |
| 032 | 024300, 200071 |
| 034 | 200071 |
| 035 | 200001 |
| 036 | 200060 |
| 037 | 200061 |
| 038 | 200063 |
| 039 | 200063, 200076, 200078 |
| 047 | 1258299, 1259659 |
| 048 | 1002599 |
| 051 | 200076, 200078 |
| 062 | 004110, 004310, 200360, 200370 |
| 105 | 2017043 |

## Other AT1 lines referenced

`001003` · `001009` · `001015` · `001021` · `002002` · `002004` · `002006` · `002008` · `002012` · `002014` · `002016` · `002018` · `002022` · `002024` · `002026` · `002028` · `002032` · `002034` · `002036` · `002038` · `002046` · `002048` · `002052` · `002054` · `002056` · `002058` · `002066` · `002068` · `002072` · `002074` · `002076` · `002078` · `002082` · `002084` · `002086` · `002088` · `002090` · `002094` · `002096` · `002102` · `002104` · `002106` · `002108` · `004012` · `005016` · `005140` · `008008` · `008012` · `008013` · `009031` · `009108` · `009112` · `009116` · `011001` · `011013` · `011042` · `012090` · `012092` · `029110` · `029112` · `029128` · `029132`
