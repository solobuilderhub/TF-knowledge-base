# Schedule 18 — Alberta Dispositions of Capital Property

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-181 – 3-191 (PDF 181–191 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH18-dispositions-TRA15156.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| TCG | Taxable Capital Gain or (loss) | — | — | 3-186 |
| PQRABIL | Property qualifying for and resulting in allowable business investment loss | X | If property qualifies for and results in an allowable business investment loss, then this section must be completed. | 3-189 |
| ABIL | Allowable Business Investment Loss | — | — | 3-190 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 018 | Dispositions of Capital Property Capital Property Dispositions | — | X | — | If 000060 and 000061 = 2, then do not allow completion of form 018. If the capital gains reserve opening balance, proceeds of disposition or adjusted cost bases differ from the federal amounts, form 018 is REQUIRED. ***FILING REQUIREMENT EXCEPTION: If dispositions in a taxation year straddle one or more inclusion rate periods, then supporting documentation MUST be submitted with the AT1 RSI to detail how the inclusion rate was calculated. | 3-181 |
| 001 | Is the corporation electing to transfer property per ACTA 14.1, 14.2 or 16.1? | N | M | — | If the corp is electing to transfer property under ACTA 14.1, 14.2 or 16.1, then set value = 1 (Yes). Otherwise, default to 2 (No). NOTE: if the corp is electing for Alberta, then either form AT107, AT108 or AT109 must be submitted with the AT1 RSI. See website: www.finance.gov.ab.ca/publicat ions/tax_rebates/corporate/form s for prescribed forms. | 3-181 |
| 002 | Total of all shares | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006120. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-182 |
| 004 | Total of all real estate | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006220. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-182 |
| 006 | Total of all bonds | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006320. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-182 |
| 008 | Total of all other properties | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006420. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-182 |
| 010 | Total of all personal-use property (note: losses are not deductible) | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006520. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-182 |
| 012 | Total of all listed personal property | $ | X | — | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, then enter the total of all occurrences of fed 006620. Otherwise, enter the Alberta total amount of proceeds of disposition. | 3-183 |
| 022 | Adjusted cost base: Total of all shares | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006130. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-183 |
| 024 | Adjusted cost base: Total of all real estate | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006230. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-183 |
| 026 | Adjusted cost base: Total of all bonds | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006330. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-183 |
| 028 | Adjusted cost base: Total of all other properties | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006430. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-184 |
| 030 | Adjusted cost base: Total of all personal-use property | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006530. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-184 |
| 032 | Adjusted cost base: Total of all listed personal property | $ | X | — | If Alberta adjusted cost bases are the same as the federal adjusted cost bases, then enter the total of all occurrences of fed 006630. Otherwise, enter the Alberta total amount of all adjusted cost bases. | 3-184 |
| 042 | Outlays and expenses: Total of all shares | $ | X | — | Must equal the total of all occurrences of fed 006140. | 3-184 |
| 044 | Outlays and expenses: Total of all real estate | $ | X | — | Must equal the total of all occurrences of fed 006240. | 3-184 |
| 046 | Outlays and expenses: Total of all bonds | $ | X | — | Must equal the total of all occurrences of fed 006340. | 3-184 |
| 048 | Outlays and expenses: Total of all other properties | $ | X | — | Must equal the total of all occurrences of fed 006440. | 3-185 |
| 050 | Outlays and expenses: Total of all personal-use property | $ | X | — | Must equal the total of all occurrences of fed 006540. | 3-185 |
| 052 | Outlays and expenses: Total of all listed personal property | $ | X | — | Must equal the total of all occurrences of fed 006640. | 3-185 |
| 053 | Add: Line 160 of federal Schedule 6 | $ | X | — | Must equal fed 006160. | 3-185 |
| 054 | Gain or (loss): Total of all shares | $ | X | — | Must equal 018002 - (018022 + 018042). | 3-185 |
| 055 | Gain or (loss): Total of all real estate | $ | X | — | Must equal 018004 - (018024 + 018044). | 3-185 |
| 056 | Gain or (loss): Total of all bonds | $ | X | — | Must equal 018006 - (018026 + 018046). | 3-185 |
| 057 | Gain or (loss): Total of all other property | $ | X | — | Must equal 018008 - (018028 + 018048). | 3-185 |
| 058 | Gain: Total of all personal-use property | $ | X | — | Calculate: 018010 - (018030 + 018050). If amount is negative, default to zero, otherwise value = calculated amount. | 3-185 |
| 059 | Gain: Total of all listed personal property | $ | X | — | Calculate: 018012 - (018032 + 018052). | 3-185 |
| 060 | Subtract: Unapplied listed personal property losses from other years up to the total listed personal property gains | $ | X | — | If 018059 is negative, value must equal zero. If calculated amount at 018059 is positive and form 021 exists, then value must be the lesser of the calculated amount and 021115. If calculated amount at 018059 is positive and form 021 does not exist, then value must be the lesser of the calculated amount and fed 004502. | 3-185 |
| 064 | Capital gains dividends | $ | X | — | Must equal fed 006875. | 3-186 |
| 066 | Add: capital gain reserve opening balance | $ | X | — | If Alberta capital gains reserve opening balance is the same as the federal capital gains reserve opening balance, then value equals fed 006880. Otherwise, enter the Alberta capital gains reserve opening balance. | 3-186 |
| 068 | Deduct: capital gain reserve closing balance | $ | X | — | If Alberta capital gains reserve closing balance is the same as the federal capital gains reserve closing balance, then value equals fed 006885. Otherwise, enter the Alberta capital gains reserve closing balance. | 3-186 |
| 071 | Deduct: Gain on the donation to a qualified done of a share, debt obligation, or right listed on a designated stock exchange and other securities | $ | X | — | If Alberta gain on donation of a share, debt obligation, or right are the same as the federal gain on donation of securities, then the value equals fed 006895. Otherwise, value equals the Alberta gain on donation of securities. | 3-186 |
| 072 | Gain on donations of a share, debt obligation, or right listed on a designated stock exchange and amounts under paragraph 38(a.1) of Act PLUS Gain on donation of ecologically sensitive land | $ | X | — | A = If Alberta gain on donations of a share, debt obligation, or right are the same as the federal gain on donations of securities, then value equals fed 006895. Otherwise, value equals the Alberta gain on donations of securities. B = If Alberta gain on donations of ecologically sensitive land is the same as the federal gain on donations of securities, then value equals fed 006896. Otherwise, value equals the Alberta gain on donations of ecologically sensitive land. Value = A + B | 3-187 |
| 073 | Deduct: Gain on donation to a qualified done of ecologically sensitive land | $ | X | — | If Alberta gain on donations of ecologically sensitive land is the same as the federal gain on donations of securities, then the value equals fed 006896. Otherwise, value equals the Alberta gain on donations of ecologically sensitive land. | 3-187 |
| 076 | Taxable capital gain: Line 074 X 50% Taxable capital gain: Line 099 x 50% | $ | X | — | If 018059 is greater than or equal to zero, calculate: (018054 + 018055 + 018056 + 018057 + 018058 + 018059 - 018060 + 018064 + 018066 - 018068 - 018072) X 50%. If 018059 is less than zero, calculate: (018054 + 018055 + 018056 + 018057 + 018058 + 018064 + 018066 - 018068 - 018072) X 50%. If greater than or equal to zero, value = calculated amount. If less than zero, default to zero. If 018059 is greater than or equal to zero, calculate: [018054 + 018055 + 018056 + 018057 + 018058 + 018059 - 018060 + 018064 + 018066 - 018068 – 018071 – 018073 + (lesser of 018077 and 018078) + 018096 – 018098] X 50%. If 018059 is less than zero, calculate: [018054 + 018055 + 018056 + 018057 + 018058 + 018064 + 018066 - 018068 - 018071 - 018073 + (lesser of 018077 and 018078) + 018096 - 0180298] X 50%. If greater than or equal to zero, value = calculated amount. If less than zero, default to zero. | 3-187 |
| 077 | Add: Exemption threshold at time of disposal | $ | X | — | If Alberta exemption threshold at time of disposition is the same as the federal exemption threshold at time of disposition, then the value equals fed 006897. Otherwise, value equals the Alberta exemption threshold at time of disposition. | 3-189 |
| 078 | Add; Total of capital gains from disposition of actual property | $ | X | — | If Alberta total capital gains from disposition of actual property is the same as the federal total capital gains from disposition of actual property, then value equals 006898. Otherwise, value equals the Alberta total capital gain from disposition of actual property. | 3-189 |
| 082 | Name of small business corporation | AN | M | PQRABIL | Enter the name of each small business corporation. | 3-189 |
| 084 | Shares or debt | N | M | PQRABIL | For each occurrence of 018082, enter either code 1 for shares or code 2 for debt as applicable. | 3-189 |
| 086 | Date of Acquisition YYYYMMDD | D | M | PQRABIL | Must equal the corresponding occurrence of fed 006910 for each related Alberta occurrence. | 3-189 |
| 088 | Proceeds of disposition | $ | X | PQRABIL | If Alberta proceeds of disposition are the same as the federal proceeds of disposition, enter the amount from the corresponding occurrence of fed 006920 for the related Alberta occurrence. Otherwise, enter the Alberta proceeds of disposition for each occurrence of 018082. | 3-190 |
| 090 | Adjusted cost base | $ | X | PQRABIL | If the Alberta adjusted cost base is the same as the federal adjusted cost base, enter the amount from the corresponding occurrence of fed 006930 for the related Alberta occurrence. Otherwise, enter the Alberta adjusted cost base for each occurrence of 018082. | 3-190 |
| 092 | Outlays and expenses | $ | X | PQRABIL | Must equal the corresponding occurrence of fed 006940 for each related Alberta occurrence. | 3-190 |
| 094 | (Loss) Col. A - (Cols. B + C): Allowable Business Investment Loss: total of column D X Inclusion Rate | $ | M | PQRABIL | For every occurrence of 018082, value = sum of: [018088 - (018090 + 018092)] X Inclusion Rate. Value must be negative. NOTE: If dispositions straddle one or more inclusion rate period(s) (i.e. ¾, 2/3 and ½), then supporting calculations must be attached to the AT1 RSI. | 3-190 |
| 096 | Taxable capital gains under section 34.2 of the federal Act | $ | X | PQRABIL | Must equal fed 006899 | 3-191 |
| 098 | Deduct: Allowable capital losses under section 34.2 of the federal Act | $ | X | PQRABIL | Must equal fed 006901 | 3-191 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **018059** = `018012 - (018032 + 018052)`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 006120 |
| 004 | 006220 |
| 006 | 006320 |
| 008 | 006420 |
| 010 | 006520 |
| 012 | 006620 |
| 022 | 006130 |
| 024 | 006230 |
| 026 | 006330 |
| 028 | 006430 |
| 030 | 006530 |
| 032 | 006630 |
| 042 | 006140 |
| 044 | 006240 |
| 046 | 006340 |
| 048 | 006440 |
| 050 | 006540 |
| 052 | 006640 |
| 053 | 006160 |
| 060 | 004502 |
| 064 | 006875 |
| 066 | 006880 |
| 068 | 006885 |
| 071 | 006895 |
| 072 | 006895, 006896 |
| 073 | 006896 |
| 077 | 006897 |
| 086 | 006910 |
| 088 | 006920 |
| 090 | 006930 |
| 092 | 006940 |
| 096 | 006899 |
| 098 | 006901 |

## Other AT1 lines referenced

`000060` · `000061` · `006898` · `021115`
