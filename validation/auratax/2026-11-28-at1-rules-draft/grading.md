# Grading: AuraTax-derived AT1 draft vs Chapter 3

Each line Chapter 3 defines, compared with the draft built from AuraTax (`draft.csv`). Every row: `grading.csv`.

## Overall

| | |
|---|---|
| Lines Chapter 3 defines | 662 |
| …that the draft has (AuraTax's line dictionary) | 636 (96%) |
| Chapter 3 lines with a business rule | 658 |
| …for which the draft has any rule at all | 529 (80%) |
| Chapter 3 rules that name other lines or federal lines | 541 |
| …where the draft names **all** the same lines | 269 (50%) |
| …where it names **some** of them | 113 (21%) |
| …where it names **none** of them | 159 (29%) |
| Lines the draft gives an M/O/X for | 36 (agrees with Chapter 3: 35) |
| Chapter 3 mandatory (M) lines | 208 (draft marks 6 as M) |

## By kind of Chapter 3 rule

A rule can be of several kinds. "Draft carries something" means: a formula or check for must-equal and arithmetic;
a rule flag or check for presence and constraints; any rule for instructions.

| Kind | Chapter 3 rules | Draft carries something | Share |
|---|---|---|---|
| instruction | 224 | 157 | 70% |
| must equal | 207 | 201 | 97% |
| arithmetic | 142 | 138 | 97% |
| other | 93 | 45 | 48% |
| constraint | 79 | 65 | 82% |
| presence | 54 | 40 | 74% |

## By schedule

| Schedule | Lines | With a Chapter 3 rule | Draft has a rule | Rules naming fields | All fields matched |
|---|---|---|---|---|---|
| 000 | 71 | 71 | 43 (61%) | 47 | 10 (21%) |
| 001 | 10 | 10 | 10 (100%) | 10 | 3 (30%) |
| 002 | 43 | 43 | 42 (98%) | 43 | 22 (51%) |
| 003 | 43 | 40 | 26 (65%) | 34 | 9 (26%) |
| 004 | 5 | 5 | 5 (100%) | 5 | 0 (0%) |
| 010 | 40 | 40 | 30 (75%) | 30 | 16 (53%) |
| 012 | 71 | 71 | 68 (96%) | 70 | 43 (61%) |
| 013 | 21 | 20 | 9 (45%) | 16 | 0 (0%) |
| 015 | 127 | 127 | 111 (87%) | 127 | 79 (62%) |
| 016 | 12 | 12 | 10 (83%) | 11 | 9 (82%) |
| 017 | 24 | 24 | 18 (75%) | 15 | 15 (100%) |
| 018 | 45 | 45 | 34 (76%) | 43 | 9 (21%) |
| 020 | 26 | 26 | 21 (81%) | 17 | 9 (53%) |
| 021 | 85 | 85 | 74 (87%) | 72 | 44 (61%) |
| 029 | 39 | 39 | 28 (72%) | 1 | 1 (100%) |

## Side by side: a random sample

### Sch 012 line 073: Limited partnership losses of preceding taxation years for federal purposes (Chapter 3 p.3-116)

- **Chapter 3** (M): Must equal fed 200335.
- **Draft** (—): If ((any of lines X = 060, 061: Sch 000 line X is Yes)) ; and T2 Sch 200 is in the return ; and (line 073 is on the form and (T2 Sch 200: line 335) is on the form): Must equal (T2 Sch 200: line 335) · Check (warning): The federal amount at line ⟨073⟩ must equal ⟨map(['335']: t('app.at1.common.lineRef', {line: each of [335]})).join(' + ')⟩ of the federal T2 return (⟨(Σ over each ['335'] of (((T2 Sch 200: line {each of [335]}) (blank as 0))))⟩).
- Fields: Chapter 3 `T2/200/335`, draft `T2/200/335`

### Sch 029 line 108: Maximum expenditure limit for the year (Chapter 3 p.3-223)

- **Chapter 3** (M): If line 100 = 1, then value = line102. Otherwise, if line 100 = 2, value = line 104.
- **Draft** (—): If (line 108 is on the form and not line 100 is blank): Calculate: (line 102 if line 100 is Yes, else line 104)
- Fields: Chapter 3 `-`, draft `AT1/029/100 AT1/029/102 AT1/029/104`

### Sch 021 line 103: Restricted Farm Losses: Deduct: Other adjustments (Chapter 3 p.3-210)

- **Chapter 3** (X): If the Alberta amount of other adjustments to restricted farm losses differs from the federal amount, then enter the Alberta amount. Otherwise, value = fed 004450.
- **Draft** (—): If T2 Sch 004 is in the return ; and line 103 is blank ; and T2 Sch 004: line 450 is non-zero: Must equal T2 Sch 004: line 450
- Fields: Chapter 3 `T2/004/450`, draft `T2/004/450`

### Sch 003 line 125: Investor Tax Credit received during the year (Chapter 3 p.3-54)

- **Chapter 3** (X): There should be no amount for occurrences 1 to 4.
- **Draft** (—): (nothing)
- Fields: Chapter 3 `-`, draft `-`

### Sch 015 line 255: Regular Exp.: Closing balance (Chapter 3 p.3-162)

- **Chapter 3** (X): Value = 015243 + 015247 + 015249 - 015251 - 015253
- **Draft** (—): If for each row of line 241 ; and ((amount E [a7_T1_1] (sequence)) < 0): Set to 0 · If for each row of line 241 ; and hasClosingBalance⟨= true; then in a loop, if (field < 0), = false⟩: Calculate: (amount E [a7_T1_1] (sequence) − line 253 (sequence))
- Fields: Chapter 3 `AT1/015/243 AT1/015/247 AT1/015/249 AT1/015/251 AT1/015/253`, draft `AT1/015/241 AT1/015/253`

### Sch 029 line 202: Taxation Year Beginning (Chapter 3 p.3-226)

- **Chapter 3** (M): If line 100 =1, then value = taxation year beginning for the corporation with the longest taxation year.
- **Draft** (—): (nothing)
- Fields: Chapter 3 `-`, draft `-`

### Sch 020 line 002: Charitable donations at the end of the preceding taxation year (Chapter 3 p.3-192)

- **Chapter 3** (M): If the Alberta charitable donations balance at the end of the preceding taxation year differs from the federal balance, then enter the Alberta balance. Otherwise, the value equals the ending balance of the preceding taxation year on the federal schedule 2.
- **Draft** (—): If T2 Sch 002 is in the return ; and line 002 is blank ; and T2 Sch 002: amount 1A [a1] is non-zero: Must equal T2 Sch 002: amount 1A [a1]
- Fields: Chapter 3 `-`, draft `-`

### Sch 021 line 185: Restricted farm losses (Chapter 3 p.3-219)

- **Chapter 3** (X): If the Alberta restricted farm loss for a specific occurrence differs from the federal amount, then enter the Alberta amount. Otherwise, the value equals the federal amount
- **Draft** (—): If ((line 185 (row 1)) is on the form and (line 185 (row 1)) is blank): Must equal line 107
- Fields: Chapter 3 `-`, draft `AT1/021/107`

### Sch 001 line 045: Allocation of the Base Amount (Chapter 3 p.3-45)

- **Chapter 3** (M): If there is a value at 001041, then this field must exist. Enter the amount allocated to each associated corp with the first occurrence being the corp filing the return. The allocation must be the same as per the federal schedule 23 this is accomplished by using the same percentage used federally to determine the allocation for Alberta purposes. Multiply the $200,000 Alberta base amount by the corresponding value for the same corporation from fed 023350. Ensure to sort such that 001045001 belonging to the corp filing this return. Total of all occurrences max $200,000.
- **Draft** (—): If line 001 is Yes ; and for each row of line 045: Calculate: (200000 × (amount 044 [a5_T1_044] (same row) ÷ 100))
- Fields: Chapter 3 `AT1/001/041 T2/023/350`, draft `AT1/001/001`

### Sch 029 line 206: Number of days in the longest year (Chapter 3 p.3-226)

- **Chapter 3** (M): If line 204 exists, then line 206 must exist. Calculate the number of days in the taxation year using line 202 and line 204 to a maximum of 365 days (366 days if the longest taxation year Note: includes February 29). The Innovation Employment Grant program came to effect on January 1, 2021, therefore the calculation should not include days prior to January 1, 2021.
- **Draft** (—): If DATE_UTIL.allValid((DATE_UTIL.dateFrom('202', this schedule)), (DATE_UTIL.dateFrom('204', this schedule))): Calculate: days · Rule: Set to 0 if negative · Rule: Must be ≤ 366
- Fields: Chapter 3 `-`, draft `-`

### Sch 000 line 030: Special Corporation Status (Chapter 3 p.3-24)

- **Chapter 3** (X): If fed 200218=1 or federal form 018 exists, then this field must equal either 1=Investment Corp., 2=Mutual Fund Corp. If enter one of the following values if applicable: 3=Co-operative 4=Credit Union 5=Exempt corp. under fed ITA section 149. 6=Insurance Corporation 7=Non-resident Corporation
- **Draft** (—): Check (warning): Line ⟨field.code⟩ must be 1 (Investment Corporation) or 2 (Mutual Fund Corporation) when federal schedule 018 is attached or value at line 218 from federal schedule 200 is YES
- Fields: Chapter 3 `T2/200/218`, draft `AT1/000/218`

### Sch 018 line 090: Adjusted cost base (Chapter 3 p.3-190)

- **Chapter 3** (X): If the Alberta adjusted cost base is the same as the federal adjusted cost base, enter the amount from the corresponding occurrence of fed 006930 for the related Alberta occurrence. Otherwise, enter the Alberta adjusted cost base for each occurrence of 018082.
- **Draft** (—): (nothing)
- Fields: Chapter 3 `AT1/018/082 T2/006/930`, draft `-`

