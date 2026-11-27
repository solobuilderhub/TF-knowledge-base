# Sch ?: (no AuraTax line dictionary)

What AuraTax 2.3.33 computes for this schedule, read from its calculator code (`574.2fc49058f3a3a53e.js`).
Not a primary source. Notation and conventions: [../README.md](../README.md).

**Also set by the calculators of:** Sch 383, Sch 307, Sch 500, Sch 322, Sch 366, Sch 411, Sch 427, Sch 443, Sch 461, Sch 481

| Line | Caption | Formula | Only when | Source |
|---|---|---|---|---|
| {targetFieldCode} |  | amount 2C [a2_3] |  | 383_1.ts · calc_export · L15017 (carried here) · run 67 |
| {targetField} |  | amount 2G [a2_5] | (((((CORP.establishedProvinces()) includes provinces.NL) and PROVINCE.taxableIncome(provinces.NL) is not blank) or (((CORP.establishedProvinces()) includes provinces.NLO) and PROVINCE.taxableIncome(provinces.NLO) is not blank))); and (((establishedProvinces.length = 1) and ((((CORP.establishedProvinces())) includes provinces.NL) or (((CORP.establishedProvinces())) includes provinces.NLO)))) | 307.ts · calc_export · L12958 (carried here) · run 86 |
| {targetFieldCode} |  | amount 1C [a1_3] | ((((CORP.establishedProvinces()) includes provinces.ON) and not (PROVINCE.taxableIncome(provinces.ON)) is blank)); and amount 1C [a1_3] is on the form | 500.ts · calc_1_1C · L18523 (carried here) · run 96 |
| {targetFieldId} |  | amount 3A [a3_1] | ((((CORP.establishedProvinces()) includes provinces.ON) and not (PROVINCE.taxableIncome(provinces.ON)) is blank)); and (CORP.wasOnlyCCPC() and (Sch 502 is in the return or Sch 506 is in the return)); and amount 3A [a3_1] is on the form | 500.ts · calc_3_3A · L18604 (carried here) · run 96 |
| {targetFieldCode} |  | amount 3G [a3_lG] | ((((CORP.establishedProvinces()) includes provinces.PE) and not PROVINCE.taxableIncome(provinces.PE) is blank)) | 322.ts · calc_export · L13557 (carried here) · run 123 |
| {targetFieldCode} |  | amount 2C [a2_3] | ((((CORP.establishedProvinces()) includes provinces.NB) and not PROVINCE.taxableIncome(provinces.NB) is blank)) | 366.ts · calc_export · L14618 (carried here) · run 133 |
| {targetFieldCode} |  | amount 3C [a3_3] | ((((CORP.establishedProvinces()) includes provinces.SK) and not PROVINCE.taxableIncome(provinces.SK) is blank)) | 411.ts · calc_export · L16423 (carried here) · run 136 |
| {targetFieldCode} |  | amount 2C [a2_3] | ((((CORP.establishedProvinces()) includes provinces.BC) and PROVINCE.taxableIncome(provinces.BC) is not blank)) | 427.ts · calc_export · L17382 (carried here) · run 140 |
| {targetFieldCode} |  | amount 2C [a2_3] | ((((CORP.establishedProvinces()) includes provinces.YT) and not PROVINCE.taxableIncome(provinces.YT) is blank)) | 443.ts · calc_export · L18065 (carried here) · run 148 |
| {targetFieldCode} |  | amount 2C [a2_3] | ((((CORP.establishedProvinces()) includes provinces.NT) and not (PROVINCE.taxableIncome(provinces.NT)) is blank)) | 461.ts · calc_export · L18361 (carried here) · run 152 |
| {targetFieldCode} |  | amount 2C [a2_3] | ((((CORP.establishedProvinces()) includes provinces.NU) and not (PROVINCE.taxableIncome(provinces.NU)) is blank)) | 481.ts · calc_export · L18450 (carried here) · run 153 |
