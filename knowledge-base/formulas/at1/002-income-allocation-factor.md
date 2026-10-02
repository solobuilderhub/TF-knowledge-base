# Schedule 2 — Alberta Income Allocation Factor

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-46 – 3-50 (PDF 46–50 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH02-income-allocation-factor-TRA11724.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| SAC | Special Allocation Categories | — | — | 3-46 |
| GAF | General Allocation Formula | — | — | 3-46 |
| SAF | Area B Special Allocation Formulas | X | If 002001 = 1 and fed 005100 is not equal to 402, then the appropriate values must be completed to determine the special allocation formula. | 3-47 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 002 | Allocation of Income | — | X | — | If 000062 is greater than zero and if fed 005119 < fed 005129 or fed 005159 < fed 005169, then complete form 002. | 3-46 |
| 001 | Is the corporation in any of the following categories? | N | M | — | If special allocation rules apply (fed 005100 value is other than 402), value = 1. Otherwise, if general allocation (fed 005100 = 402), default value = 2. | 3-46 |
| 004 | Total salaries and wages paid in all jurisdictions (per federal form 005) | $ | X | — | Must exist if 002002 exists. Must equal fed 005129 – fed 005127 (only if Reg 413 (non-residents) applies). | 3-46 |
| 006 | Gross revenue in Alberta (per federal form 005) | $ | X | — | If 002001 = 2 and fed 005100 = 402, value must equal fed 005159. | 3-46 |
| 008 | Gross revenue in all jurisdictions (per federal form 005) | $ | X | — | Must exist if 002006 exists. Must equal fed 005169 – fed 005167(only if Reg 413 (non-residents) applies). | 3-46 |
| 012 | Salaries and wages paid in Alberta | $ | X | SAF | If fed 005100 = 409, must equal fed 005119. | 3-47 |
| 014 | Total salaries and wages paid | $ | X | SAF | Must exist if 002012 exists. Must equal fed 005129 – fed 005127. | 3-47 |
| 016 | Kilometres traveled in Alberta | N | X | SAF | If fed 005100 = 409, value must equal fed 005159. | 3-47 |
| 018 | Total kilometres traveled in jurisdictions where corporation has permanent establishment | N | X | SAF | Must exist if 002016 exists. Value must equal fed 005169. | 3-47 |
| 022 | Salaries and wages paid in Alberta | $ | X | SAF | If fed 005100 = 408, then must equal fed 005119. | 3-47 |
| 024 | Total salaries and wages paid | $ | X | SAF | Must exist if 002022 exists. Must equal fed 005129 – fed 005127. | 3-47 |
| 026 | Bushels of grain received at Alberta elevators | N | X | SAF | If fed 005100 = 408, value must equal fed 005159. | 3-47 |
| 028 | Bushels of grain received at all elevators | N | X | SAF | Must exist if 002026 exists. Value must equal fed 005169. | 3-47 |
| 032 | Salaries and wages paid in Alberta | $ | X | SAF | If fed 005100 = 411, then value must equal fed 005119. | 3-47 |
| 034 | Total salaries and wages paid in Canada | $ | X | SAF | Must exist if 002032 exists. Must equal fed 005129 - fed 005127. | 3-47 |
| 036 | Miles of pipeline in Alberta | N | X | SAF | If fed 005100 = 411, value must equal fed 005159. | 3-48 |
| 038 | Total Miles of pipeline in provinces where corporation has permanent establishment | N | X | SAF | Must exist if 002036 exists. Value must equal fed 005169 - fed 005167 | 3-48 |
| 046 | Net premiums in Alberta | $ | X | SAF | If fed 005100 = 403, value must equal fed 005159. | 3-48 |
| 048 | Total net premiums earned | $ | X | SAF | Must exist if 002046 exists. Value must equal fed 005169. | 3-48 |
| 052 | Salaries and wages paid in Alberta | $ | X | SAF | If fed 005100 = 404, value must equal fed 005119. | 3-48 |
| 054 | Total salaries and wages paid | $ | X | SAF | Must exist if 002052 exists, value must equal fed 005129 – fed 005127. | 3-48 |
| 056 | Loans & deposits in Alberta | $ | X | SAF | If fed 005100 = 404, value must equal fed 005159. | 3-48 |
| 058 | Total loans & deposits | $ | X | SAF | Must exist if 002056 exists, value must equal fed 005169. | 3-48 |
| 066 | Gross revenue earned in Alberta | $ | X | SAF | If fed 005100 = 405, value must equal fed 005159. | 3-48 |
| 068 | Total gross revenue | $ | X | SAF | Must exist if 002066 exists, value must equal fed 005169. | 3-48 |
| 072 | Fixed asset cost (other than aircraft) in Alberta | $ | X | SAF | If fed 005100 = 407, value must equal fed 005119. | 3-48 |
| 074 | Fixed asset cost (other than aircraft) in Canada | $ | X | SAF | Must exist if 002072 exists. Value must equal fed 005129 - fed 005127. | 3-48 |
| 076 | Revenue plane miles flown in Alberta | N | X | SAF | If fed 005100 = 407. Value must equal fed 005159. | 3-48 |
| 078 | Revenue plane miles flown in Canada where the corporation has permanent establishment | N | X | SAF | Must exist if 002076 exists. Value must equal fed 005169 - fed 005167. | 3-49 |
| 082 | Equated track miles in Alberta | N | X | SAF | If fed 005100 = 406(1) or 406(2), value must equal fed 005119. | 3-49 |
| 084 | Total equated track miles in Canada | N | X | SAF | Must exist if 002082 exists. Value must equal fed 005129 - fed 005127. | 3-49 |
| 086 | Gross ton miles in Alberta | N | X | SAF | If fed 005100 = 406(1) or 406(2), value must equal fed 005159. | 3-49 |
| 088 | Total gross ton miles in Canada | N | X | SAF | Must exist if 002086 exists, value must equal fed 005169 - fed 005167. | 3-49 |
| 090 | Salaries and wages paid in Alberta | $ | X | SAF | If fed 005100 = 410, value must equal fed 005119. | 3-49 |
| 092 | Total salaries and wages paid in Canada | $ | X | SAF | Must exist if 002090 exists, must equal fed 005129 - fed 005127. | 3-49 |
| 094 | Port-call-tonnage in Alberta | N | X | SAF | If fed 005100 = 410, value must equal fed 005159. | 3-49 |
| 096 | Total port-call-tonnage in all provinces with permanent establishments | N | X | SAF | Must exist if 002094 exists. Value must equal total port-call-tonnage in all provinces with permanent establishments. | 3-49 |
| 098 | Total port-call-tonnage in Canada | N | X | SAF | If fed 005100 = 410, value must equal fed 005169 - fed 005167. | 3-49 |
| 100 | Total port-call-tonnage in all countries | N | X | SAF | Must exist if 002090 exists. Value must equal fed 005169. | 3-50 |
| 102 | (002098/002100) X (AT1 lines 062 - 064) | $ | X | SAF | Must exist if 002090 or 002094 exists. Value = 002098/ 002100 X (000062 - 000064). | 3-50 |
| 104 | 002090/002092 X [(AT1 lines 062 - 064) - 002102] | $ | X | SAF | If 002090 or 002094 exist, then value = 002090/002092 X [(000062 - 000064) - 002102] | 3-50 |
| 106 | Amount taxable in Alberta | $ | X | SAF | If fed 005100 = 412, enter the amount taxable in Alberta. | 3-50 |
| 108 | AT1 line 062 - AT1 line 064 | $ | X | SAF | If 002106 exists, then value = 000062 - 000064. | 3-50 |

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 002 | 005119, 005129, 005159 |
| 001 | 005100 |
| 004 | 005127, 005129 |
| 006 | 005100, 005159 |
| 008 | 005167, 005169 |
| 012 | 005100, 005119 |
| 014 | 005127, 005129 |
| 016 | 005100, 005159 |
| 018 | 005169 |
| 022 | 005100, 005119 |
| 024 | 005127, 005129 |
| 026 | 005100, 005159 |
| 028 | 005169 |
| 032 | 005100, 005119 |
| 034 | 005127, 005129 |
| 036 | 005100, 005159 |
| 038 | 005167, 005169 |
| 046 | 005100, 005159 |
| 048 | 005169 |
| 052 | 005100, 005119 |
| 054 | 005127, 005129 |
| 056 | 005100, 005159 |
| 058 | 005169 |
| 066 | 005100, 005159 |
| 068 | 005169 |
| 072 | 005100, 005119 |
| 074 | 005127, 005129 |
| 076 | 005100, 005159 |
| 078 | 005167, 005169 |
| 082 | 005100, 005119 |
| 084 | 005127, 005129 |
| 086 | 005100, 005159 |
| 088 | 005167, 005169 |
| 090 | 005100, 005119 |
| 092 | 005127, 005129 |
| 094 | 005100, 005159 |
| 098 | 005100, 005167, 005169 |
| 100 | 005169 |
| 106 | 005100 |

## Other AT1 lines referenced

`000062` · `000064`
