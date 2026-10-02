# Schedule 15 — Alberta Resource Related Deductions

> **Ruleset** `at1-tra-ch3-2026.4` · **Spec pages** 3-134 – 3-169 (PDF 134–169 of `sources/tra-spec/AT1-Chapter3-2026.4.pdf`)  
> **Printed form** `research/sources/tra-forms/pdf/AT1SCH15-resource-related-deductions-TRA11736.pdf`  
> GENERATED from `packages/ca-tax/spec/at1/forms/` — do not hand-edit. Re-render: `npx tsx scripts/rulebook/render.ts` in packages/ca-tax.

## Sections

| Code | Section | M/O/X | Condition | Page |
|---|---|---|---|---|
| EDA | Continuity of Earned Depletion Base | — | — | 3-134 |
| CMEDB | Continuity of Mining Exploration Depletion Base | — | — | 3-137 |
| CEE | Cumulative Canadian Exploration Expenses | — | — | 3-138 |
| CDE | Cumulative Canadian Development Expenses | — | — | 3-143 |
| CCOGPE | Cumulative Canadian Oil and Gas Property Expenses | — | — | 3-151 |
| FEDE | Foreign Exploration and Development Expenses | — | — | 3-157 |
| SFEDE | Specified Foreign Exploration and Development Expenses | — | — | 3-161 |
| CFRE | Cumulative Foreign Resource Expenses | — | — | 3-164 |

## Lines

| Line | Name | Type | M/O/X | Section | Business rule (verbatim) | Page |
|---|---|---|---|---|---|---|
| 015 | Resource Related Deductions | — | X | — | If 000060 and 000061 = 2, then do not allow the completion of form 015. If the opening balance or the claim for Alberta purposes differs from that for federal purposes and 000061 = 1, then form 015 is REQUIRED to be completed. | 3-134 |
| 001 | Regular Expenses: Balance at end of preceding taxation year | $ | M | — | Enter the amount of Alberta regular expenses earned depletion allowance balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012101. | 3-134 |
| 003 | Regular Expenses: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of the regular expenses earned depletion allowance acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012105. | 3-134 |
| 005 | Regular Expenses: transferred on sale of resource property to successor | $ | X | — | If the amount of the regular expenses earned depletion allowance transferred on sale of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012110. | 3-135 |
| 007 | Regular Expenses: Claim for the year per federal Regulation 1201 | $ | M | — | If the regular expenses earned depletion allowance Regulation 1201 amount for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012115. Value cannot exceed: 015001 + 015003 - 015005. If none, enter zero. | 3-135 |
| 009 | Regular Expenses: Closing balance | $ | M | — | Value = 015001 + 015003 - 015005 - 015007. | 3-135 |
| 011 | Successor Expenses: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta successor expenses earned depletion allowance balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012126. | 3-135 |
| 013 | Successor Expenses: transferred on amalgamation or wind-up subsidiary | $ | X | — | If the amount of the successor expenses earned depletion allowance acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012130. | 3-136 |
| 017 | Successor Expenses: transferred on sale of resource property | $ | X | — | If the amount of the successor expenses earned depletion allowance transferred on sale of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012135. | 3-136 |
| 019 | Successor Expenses: Claim for the year per federal Regulation 1202(2) | $ | M | — | If the successor expenses earned depletion allowance Regulation 1202(2) amount for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012140. Value cannot exceed: 015011 + 015013 + 015015 - 015017. If none, enter zero. | 3-137 |
| 021 | Successor Expenses: Closing balance | $ | M | — | Value = 015011 + 015013 + 015015 - 015017 - 015019. | 3-137 |
| 023 | Continuity of Mining Exploration Depletion Base: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta mining exploration depletion base balance from last year or, if the balance is the same for federal and Alberta purposes, enter the current year fed 012150. | 3-137 |
| 025 | Continuity of Mining Exploration Depletion Base: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of mining exploration depletion base acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012155. | 3-137 |
| 027 | Continuity of Mining Exploration Depletion Base: transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of mining exploration depletion base acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012160. | 3-138 |
| 029 | Continuity of Mining Exploration Depletion Base: transferred on disposal of resource property to successor | $ | X | — | If the amount of mining exploration depletion base transferred on disposal of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012165. | 3-138 |
| 031 | Continuity of Mining Exploration Depletion base: deduct: Claim for the year per federal Regulation 1203(1) | $ | M | — | If 015023 + 015025 + 015027 - 015029 is negative, then 015031 must equal zero. If 015023 + 015025 + 015027 - 015029 is positive, then 015031 cannot exceed that positive amount. | 3-138 |
| 033 | Continuity of Mining Exploration Depletion Base: Closing Balance | $ | M | — | Value = 015023 + 015025 + 015027 - 015029 - 015031 | 3-138 |
| 041 | Regular Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CEE regular expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter the current year fed 012200. | 3-139 |
| 043 | Regular Exp.: Add: current year expenses excluding expenses incurred under look-back rule | $ | X | — | Value must equal fed 012205. | 3-139 |
| 044 | Regular Exp.: Add: current year expenses under look-back rule [federal subsection 66(12.66)] | $ | X | — | Value must equal fed 012206. | 3-139 |
| 045 | Regular Exp.: Add: reclassified from Canadian development expenses (federal subsections 66.1(9) and 66.7 (9)) | $ | X | — | Value must equal fed 012210. | 3-139 |
| 047 | Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CEE regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012215. | 3-139 |
| 049 | Regular Exp.: Add: Canadian renewable and conservation expenses | $ | X | — | Value must equal fed 012217. | 3-139 |
| 051 | Regular Exp.: Add: other additions | $ | X | — | If the amount of CEE regular expenses other additions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012220. | 3-140 |
| 053 | Regular Exp.: Deduct: government assistance and grants | $ | X | — | Value must equal fed 012225. | 3-140 |
| 055 | Regular Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CEE regular expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012230. | 3-140 |
| 058 | Regular Exp.: Deduct: current and previous year Canadian exploration expenses renounced in the year pursuant to a flow-through share agreement | $ | X | — | Value must equal fed 012243. | 3-140 |
| 059 | Regular Exp.: Deduct: transferred on disposition of resource property to successor | $ | X | — | If the amount of CEE regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012240. | 3-140 |
| 060 | Regular Exp.: Deduct: expenses renounced under look-back rule [ federal subsection 66(12.66)] | $ | X | — | Value must equal fed 012244. | 3-141 |
| 061 | Regular Exp.: Deduct: current year claim per federal subsections 66.1(2) and 66.7(3) | $ | M | — | Calculate: 015041 + 015043 + 015044 + 015045 + 015047 + 015049 + 015051 - 015053 - 015055 - 015058 - 015059 - 015060. If calculated amount > zero, then value cannot exceed the calculated amount. If calculated amount is less than or equal to zero, then value must equal calculated amount. | 3-141 |
| 063 | Regular Exp.: Closing balance | $ | M | — | A = 015041 + 015043 + 015044 + 015045 + 015047 + 015049 + 015051 - 015053 - 015055 - 015058 - 015059 - 015060. If A = positive amount, then value = A - 015061. If A = negative amount, then value = zero. | 3-141 |
| 064 | Successor Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CEE successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012250. | 3-141 |
| 065 | Successor Exp.: Add: reclassified from Canadian development expenses | $ | X | — | Value must equal fed 012255. | 3-142 |
| 067 | Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CEE successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012260. | 3-142 |
| 069 | Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CEE successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012265. | 3-142 |
| 077 | Successor Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CEE successor expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012280. | 3-142 |
| 079 | Successor Exp.: Deduct: transferred on disposition of resource property to successor | $ | X | — | If the amount of CEE successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012290. | 3-143 |
| 081 | Successor Exp.: Deduct: current year claim (or income inclusion if subtotal is negative) | $ | M | — | Calculate: 015064 + 015065 + 015067 + 015069 - 015077 - 015079. If calculated amount > zero, then value cannot exceed the calculated amount. If calculated amount is less than or equal to zero, then value must equal calculated amount. | 3-143 |
| 083 | Successor Exp.: Closing balance | $ | M | — | Value = 015064 + 015065 + 015067 + 015069 - 015077 - 015079 - 015081. | 3-143 |
| 091 | Regular Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CDE regular expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012300. | 3-143 |
| 093 | Regular Exp.: Add: current year expenses excluding expenses incurred under look-back rule | $ | X | — | Value must equal fed 012303. | 3-144 |
| 094 | Regular Exp.: Add: current year expenses under look-back rule [federal subsection 66(12.66)] | $ | X | — | Value must equal fed 012304. | 3-144 |
| 095 | Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CDE regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012305. | 3-144 |
| 097 | Regular Exp.: Add: other additions | $ | X | — | If the amount of CDE regular expenses other additions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012310. | 3-144 |
| 099 | Regular Exp.: Deduct: reclassified Canadian exploration expenses (federal subsections 66.1(9) and 66.7(9)) | $ | X | — | Value must equal fed 012315. | 3-144 |
| 101 | Regular Exp.: Deduct: government assistance and grants | $ | X | — | Value must equal fed 012320. | 3-144 |
| 103 | Regular Exp.: Deduct: receivable on disposition of underground oil and gas storage rights or mining property | $ | X | — | If the amount of CDE regular expenses receivable on disposition of underground oil and gas storage rights or mining property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012325. | 3-145 |
| 105 | Regular Exp.: Deduct: credit balance in the cumulative Canadian oil and gas property expense pool. | $ | X | — | If the amount of CDE regular expenses credit balance in the cumulative Canadian oil and gas property expense pool for Alberta purposes differs from the federal amount, enter the Alberta amount. Calculate: A = 015151 + 015153 + 015155 + 015157 - 015159 - 015161- 015165 - 015167. If amount A is negative, then value = amount A. Otherwise, enter fed 012330. | 3-145 |
| 107 | Regular Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CDE regular expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. (Note: If 015139 is negative, include the amount at 015107 as a positive value.) Otherwise, enter fed 012335. | 3-146 |
| 110 | Regular Exp.: Deduct: current and previous year Canadian development expenses renounced in the year pursuant to a flow-through share agreement | $ | X | — | Value must equal fed 012343. | 3-146 |
| 111 | Regular Exp.: Deduct: transferred on disposition of resource property to successor | $ | X | — | If the amount of CDE regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012340. | 3-146 |
| 112 | Regular Exp.: Deduct: expenses renounced under look-back rule [federal subsection 66(12.66)] | $ | X | — | Value must equal fed 012344. | 3-146 |
| 115 | Regular Exp.: Deduct: current year claim per federal subsection 66.2(2) | $ | M | — | If Value = 015091 + 015093 + 015094 + 015095 + 015097 - 015099 - 015101 - 015103 - 015105 - 015107 - 015111 - 015110 - 015112 is negative, then value = zero. If Value = 015091 + 015093 + 015094 + 015095 + 015097 - 015099 - 015101 - 015103 - 015105 - 015107 - 015111 - 015110 – 015112 is positive, and if: - number of days in tax year are greater than or equal to 357 days, then value cannot exceed .30 X (015091 + 015093 + 015094 + 015095 + 015097 - 015099 - 015101 - 015103 - 015105 - 015107 - 015111 - 015110 - 015112). or - number of days in tax year are less than 357 days, then value cannot exceed .30 X (no. of days in tax year/365) X (015091 + 015093 + 015094 + 015095 + 015097 - 015099 - 015101 - 015103 - 015105 - 015107 - 015111 - 015110 - 015112). [NOTE: Accelerated claims will be accepted by TRA’s system. Override of the above calculation should be utilized to report accelerated claims. TRA has no plans to adjust Alberta Sch.15 form to include accelerated expenses at this time but that may change at a future date.] | 3-147 |
| 117 | Regular Exp.: Closing balance | $ | M | — | Value = 015091 + 015093 + 015094 + 015095 + 015097 - 015099 - 015101 - 015103 - 015105 - 015107 - 015111 - 015110 - 015112 - 015115. If 015117 is negative, then, value = zero. | 3-148 |
| 119 | Successor Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CDE successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012350. | 3-148 |
| 121 | Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CDE successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012355. | 3-148 |
| 123 | Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CDE successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012357. | 3-149 |
| 127 | Successor Exp.: Deduct: reclassified Canadian exploration expenses (federal subsections 66.1(9) and 66.7(9) | $ | X | — | Value must equal fed 012365. | 3-149 |
| 133 | Successor Exp.: Deduct: credit balance in the cumulative Canadian oil and gas property expense pool | $ | X | — | If the amount of CDE successor expenses credit balance in the cumulative Canadian oil and gas property expense pool for Alberta purposes differs from the federal amount, enter the Alberta amount. Calculate: A = 015173 + 015175 + 015177 - 015181 - 015185. If amount A is negative, then value may not exceed amount A. | 3-149 |
| 135 | Successor Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CDE successor expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012385. | 3-150 |
| 137 | Successor Exp.: Deduct: transferred on disposition of resource property | $ | X | — | If the amount of CDE successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012390. | 3-150 |
| 141 | Successor Exp.: Deduct: current year claim per federal subsection 66.2(2) | $ | M | — | If Value = 015119 + 015121 + 015123 - 015127 - 015133 - 015135 – 015137 is negative, then value = zero. If Value = 015119 + 015121 + 015123 - 015127 - 015133 - 015135 – 015137 is positive, and if: - number of days in tax year are greater than or equal to 357 days, then value cannot exceed .30 X (015119 + 015121 + 015123 - 015127 - 015133 - 015135 - 015137). or - number of days in tax year are less than 357 days, then value cannot exceed .30 X (no. of days in tax year/365) X (015119 + 015121 + 015123 - 015127 - 015133 - 015135 - 015137). | 3-150 |
| 143 | Successor Exp.: Closing balance | $ | M | — | Value = 015119 + 015121 + 015123 - 015127 - 015133 - 015135 - 015137 - 015141. If 015143 is negative, then, value = zero. | 3-151 |
| 151 | Regular Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CCOGPE regular expenses balance from last year or if, the balance is the same for federal and Alberta purposes, enter current year fed 012400. | 3-151 |
| 153 | Regular Exp.: Add: current year expenses | $ | X | — | Value must equal fed 012405. | 3-151 |
| 155 | Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CCOGPE regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012410. | 3-151 |
| 157 | Regular Exp.: Add: other additions | $ | X | — | If the amount of CCOGPE regular expenses other additions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012415. | 3-151 |
| 159 | Regular Exp.: Deduct: received or receivable on disposition of Canadian oil and gas property | $ | X | — | If the amount of CCOGPE regular expenses received or receivable on disposition of Canadian oil and gas property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012420. | 3-152 |
| 161 | Regular Exp.: Deduct: government assistance and grants | $ | X | — | Value must equal fed 012425. | 3-152 |
| 165 | Regular Exp.: Deduct: transferred on disposition of resource property to successor | $ | X | — | If the amount of CCOGPE regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012435. | 3-152 |
| 167 | Regular Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CCOGPE regular expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012440. | 3-152 |
| 169 | Regular Exp.: Deduct: current year claim per federal subsections 66.4(2) and 66.7(5) | $ | M | — | A = 015151 + 015153 + 015155 + 015157 - 015159 - 015161 - 015165 - 015167. If amount A = zero, then value = zero. If amount A < zero and: a) Corp. has made a designation pursuant to subparagraph 66.7(4)(a)(iii), then amount A must be carried forward to 015105 and enter zero at 015169 and 015171. Or b) Corp. has not made a designation, then amount A must be carried forward to 015133 and enter zero at 015169 and 015171. If amount A > zero, and if: - number of days in tax year are greater than or equal to 357 days, then value cannot exceed .10 X amount A or - number of days in tax year are less than 357 days, then value cannot exceed .10 X (no. of days in tax year/365) X amount A. [NOTE: Accelerated claims will be accepted by TRA’s system. Override of the above calculation should be utilized to report accelerated claims. TRA has no plans to adjust Alberta Sch.15 form to include accelerated expenses at this time but that may change at a future date.] | 3-152 |
| 171 | Regular Exp.: Closing balance | $ | M | — | If (015151 + 015153 + 015155 + 015157 - 015159 - 015161- 015165 - 015167 - 015169) > 0, then value = 015151 + 015153 + 015155 + 015157 - 015159 - 015161 - 015165 - 015167 - 015169. Otherwise, value = zero | 3-154 |
| 173 | Successor Exp.: Balance at the end of preceding taxation year | $ | M | — | Enter the amount of the Alberta CCOGPE successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012450. | 3-154 |
| 175 | Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CCOGPE successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012455. | 3-155 |
| 177 | Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of CCOGPE successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012460. | 3-155 |
| 181 | Successor Exp.: Deduct: received or receivable on disposition of Canadian oil and gas property | $ | X | — | If the amount of CCOGPE successor expenses received or receivable on disposition of Canadian oil and gas property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012470. | 3-155 |
| 185 | Successor Exp.: Deduct: transferred on disposition of resource property | $ | X | — | If the amount of CCOGPE successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012485. | 3-156 |
| 187 | Successor Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of CCOGPE successor expenses other deductions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012490. | 3-156 |
| 189 | Successor Exp.: Deduct: current year claim per federal subsections 66.4(2) and 66.7(5) | $ | M | — | A = 015173 + 015175 + 015177 - 015181 - 015185 - 015187. If amount A < zero and: a) Corp. has made a designation pursuant to subparagraph 66.7(4)(a)(iii), then amount A must be carried forward to 015133 and enter zero at 015189 and 015191. Or b) Corp. has not made a designation, then amount A must be included in 015167 and enter zero at 015189 and 015191. If amount A > zero, and if: - number of days in tax year are greater than or equal to 357 days, then value cannot exceed .10 X amount A or - number of days in tax year are less than 357 days, then value cannot exceed .10 X (no. of days in tax year/365) X amount A. | 3-156 |
| 191 | Successor Exp.: Closing balance | $ | M | — | If (015173 + 015175 + 015177 - 015181- 015185 - 015187 - 015189) > 0, then value = 015173 + 015175 + 015177 - 015181 - 015185 - 015187 - 015189 - 015167 - 015169. Otherwise, value = zero. | 3-157 |
| 201 | Regular Exp.: Balance at end of preceding taxation year | $ | M | — | Enter the amount of the Alberta Foreign Exploration and Development Expenses regular expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012500. | 3-157 |
| 205 | Regular Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Foreign Exploration and Development Expenses regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012510. | 3-157 |
| 207 | Regular Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of Foreign Exploration and Development Expenses regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012515. | 3-158 |
| 209 | Regular Exp.: Deduct: current year claim per federal subsections 66(4) and 66.7(2) | $ | M | — | Value is the lesser of: the pool balance: 015201 + 015205 – 015207 OR the greater of a or b where: a) = .10 x (number of days in taxation year/365) x (015201 + 015205 - 015207) and b) = 015231 If pool balance is negative, include the pool balance in 012040 and enter zero at 015209 and 015211. | 3-158 |
| 211 | Regular Exp.: Closing balance | $ | M | — | Value = 015201 + 015205 - 015207 - 015209 | 3-158 |
| 213 | Successor Exp.: Balance at the end of preceding taxation year | $ | M | — | Enter the amount of the Alberta Foreign Exploration and Development Expenses successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012550. | 3-159 |
| 215 | Successor Exp.: Add: transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Foreign Exploration and Development Expenses successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012555. | 3-159 |
| 217 | Successor Exp.: Add: transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Foreign Exploration and Development Expenses successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012560. | 3-160 |
| 219 | Successor Exp.: Deduct: other deductions or transfers | $ | X | — | If the amount of Foreign Exploration and Development Expenses successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012565. | 3-160 |
| 221 | Successor Exp.: Deduct: current year claim per federal subsections 66(4) and 66.7(2) | $ | M | — | Value is the lesser of: the pool balance (015213 + 015215 + 015217 - 015219) OR 015233. If pool balance is negative, enter pool balance at 012040 and enter zero at 015221 and 015223. | 3-160 |
| 223 | Successor Exp.: Closing balance | $ | M | — | Value = 015213 + 015215 + 015217 - 015219 - 015221 | 3-160 |
| 231 | Regular Exp.: Foreign - source resource income | $ | X | — | Value must equal fed 012530. | 3-160 |
| 233 | Successor Exp.: Foreign - source resource income | $ | X | — | Value must equal fed 012580. | 3-161 |
| 241 | Regular Exp.: Country in which regular expenses were incurred | A | X | — | Must equal all occurrences of fed 012601. (See Chapter 1, Appendix 1- 5 for the complete list of acceptable country address codes) | 3-161 |
| 243 | Regular Exp.: Balance at end of preceding taxation year | $ | X | — | Enter the amount of the Specified Foreign Exploration and Development Expenses regular expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012600. | 3-161 |
| 247 | Regular Exp.: Amount transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012610. | 3-161 |
| 249 | Regular Exp.: Other additions | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses regular expenses other additions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012611. | 3-161 |
| 251 | Regular Exp.: Other deductions or transfers | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012615. | 3-162 |
| 253 | Regular Exp.: Current year claim per federal subsection 66(4) | $ | X | — | Value is the lesser of: the pool balance: 015243 + 015247+ 015249 - 015251 OR the greater of a or b where: a) = .10 x (number of days in taxation year/365) x (015243 + 015247+ 015249 - 015251) and b) = 015257 If pool balance is negative, include the pool balance in 012040 and enter zero at 015253 and 015255. | 3-162 |
| 255 | Regular Exp.: Closing balance | $ | X | — | Value = 015243 + 015247 + 015249 - 015251 - 015253 | 3-162 |
| 257 | Regular Exp.: Foreign resource income | $ | X | — | Value must equal fed 012630. | 3-163 |
| 261 | Successor Exp.: Country in which successor expenses were incurred | A | X | — | Must equal all occurrences of fed 012651. (See Chapter 1, Appendix 1- 5 for the complete list of acceptable country address codes) | 3-163 |
| 263 | Successor Exp.: Balance at end of preceding taxation year | $ | X | — | Enter the amount of the Specified Foreign Exploration and Development Expenses successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012650. | 3-163 |
| 265 | Successor Exp.: Amount transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012655. | 3-163 |
| 267 | Successor Exp.: Amount transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012660. | 3-163 |
| 269 | Successor Exp.: Other deductions or transfers | $ | X | — | If the amount of Specified Foreign Exploration and Development Expenses successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012665. | 3-164 |
| 273 | Successor Exp.: Current year claim per federal subsection 66.7(2) | $ | X | — | Value is the lesser of: the pool balance (015263 + 015265 + 015267 - 015269) OR 015277. If pool balance is negative, include pool balance at 012040 and enter zero at 015273 and 015275. | 3-164 |
| 275 | Successor Exp.: Closing balance | $ | X | — | Value = 015263 + 015265 + 015267 - 015269 - 015273 | 3-164 |
| 277 | Successor Exp.: Foreign resource income | $ | X | — | Value must equal fed 012680. | 3-164 |
| 281 | Regular Exp.: Country in which regular expenses were incurred | A | X | — | Must equal all occurrences of fed 012701. (See Chapter 1, Appendix 1- 5 for the complete list of acceptable country address codes) | 3-164 |
| 283 | Regular Exp.: Balance at the end of the preceding taxation year | $ | X | — | Enter the amount of the Cumulative Foreign Resource Expenses regular expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012700. | 3-165 |
| 285 | Regular Exp.: Current year expenses | $ | X | — | Value must equal fed 012705. | 3-165 |
| 287 | Regular Exp.: Amount transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Cumulative Foreign Resource Expenses regular expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012710. | 3-165 |
| 289 | Regular Exp.: Other additions | $ | X | — | If the amount of Cumulative Foreign Resource Expenses regular expenses other additions for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012711. | 3-165 |
| 291 | Regular Exp.: Other deductions or transfers | $ | X | — | If the amount of Cumulative Foreign Resource Expenses regular expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012715. | 3-165 |
| 293 | Regular Exp.: Current year claim per federal subsection 66.21(4) | $ | X | — | Value = A + B where A is greater of: (i) = .10 x (number of days in taxation year/365) x (015283 + 015285 + 015287+ 015289 – 015291), and (ii) the least of: (i) .30 x (number of days in taxation year/365) x (015283 + 015285 + 015287+ 015289 – 015291) (ii) 015297 for a particular country (iii) total of all occurrence of 015297 B is lesser of: (i) (015283 + 015285 + 015287+ 015289 – 015291) minus amount A, and (ii) the global foreign resource limit for the year designated for that country If (015283 + 015285 + 015287+ 015289 – 015291) is negative, include this amount in 012040 and enter zero at 015293 and 015295. | 3-167 |
| 295 | Regular Exp.: Closing balance | $ | X | — | Value = 015283 + 015285 + 015287 + 015289 - 015291 - 015293 | 3-168 |
| 297 | Regular Exp.: Foreign resource income (loss) | $ | X | — | Value must equal all occurrences of fed 012730. | 3-168 |
| 301 | Successor Exp.: Country in which successor expenses were incurred | A | X | — | Must equal all occurrences of fed 012751. (See Chapter 1, Appendix 1- 5 for the complete list of acceptable country address codes) | 3-168 |
| 303 | Successor Exp.: Balance at the end of the preceding taxation year | $ | X | — | Enter the amount of the Cumulative Foreign Resource Expenses successor expenses balance from last year or, if the balance is the same for federal and Alberta purposes, enter current year fed 012750. | 3-168 |
| 305 | Successor Exp.: Amount transferred on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Cumulative Foreign Resource Expenses successor expenses acquired on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012755. | 3-168 |
| 307 | Successor Exp.: Amount transferred other than on amalgamation or wind-up of subsidiary | $ | X | — | If the amount of Cumulative Foreign Resource Expenses successor expenses acquired other than on amalgamation or wind-up of subsidiary for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012760. | 3-168 |
| 309 | Successor Exp.: Other deductions or transfers | $ | X | — | If the amount of Cumulative Foreign Resource Expenses successor expenses transferred on disposition of resource property for Alberta purposes differs from the federal amount, enter the Alberta amount. Otherwise, enter fed 012765. | 3-169 |
| 313 | Successor Exp.: Current year claim per federal subsection 66.7(2.3) | $ | X | — | Value is lesser of: .30 x (number of days in taxation year/365) x (015303 + 015305 + 015307- 015309), OR Total of all occurrence of 015317 If (015303 + 015305 + 015307- 015309) is negative, include this amount in 012040 and enter zero at 015313 and 015315. | 3-169 |
| 315 | Successor Exp.: Closing balance | $ | X | — | Value = 015303 + 015305 + 015307 - 015309 - 015313. | 3-169 |
| 317 | Successor Exp.: Foreign resource income (loss) | $ | X | — | Value must equal all occurrences of fed 012780. | 3-169 |

## Formulas (machine-checkable)

Rules that are pure arithmetic over line references, normalized (`×` → `*`, `–` → `-`). The formula-conformance test checks each against the engine.

- **015009** = `015001 + 015003 - 015005 - 015007`
- **015021** = `015011 + 015013 + 015015 - 015017 - 015019`
- **015033** = `015023 + 015025 + 015027 - 015029 - 015031`
- **015083** = `015064 + 015065 + 015067 + 015069 - 015077 - 015079 - 015081`
- **015211** = `015201 + 015205 - 015207 - 015209`
- **015223** = `015213 + 015215 + 015217 - 015219 - 015221`
- **015255** = `015243 + 015247 + 015249 - 015251 - 015253`
- **015275** = `015263 + 015265 + 015267 - 015269 - 015273`
- **015295** = `015283 + 015285 + 015287 + 015289 - 015291 - 015293`
- **015315** = `015303 + 015305 + 015307 - 015309 - 015313`

## Federal inputs

Every federal field a rule on this form reads (`fed SSSFFF`, or `SSSFFFF` for the four-digit GIFI/jacket forms 100/101/125/140). This is the AT1 ↔ T2 seam.

| Line | Federal fields |
|---|---|
| 001 | 012101 |
| 003 | 012105 |
| 005 | 012110 |
| 007 | 012115 |
| 011 | 012126 |
| 013 | 012130 |
| 017 | 012135 |
| 019 | 012140 |
| 023 | 012150 |
| 025 | 012155 |
| 027 | 012160 |
| 029 | 012165 |
| 041 | 012200 |
| 043 | 012205 |
| 044 | 012206 |
| 045 | 012210 |
| 047 | 012215 |
| 049 | 012217 |
| 051 | 012220 |
| 053 | 012225 |
| 055 | 012230 |
| 058 | 012243 |
| 059 | 012240 |
| 060 | 012244 |
| 064 | 012250 |
| 065 | 012255 |
| 067 | 012260 |
| 069 | 012265 |
| 077 | 012280 |
| 079 | 012290 |
| 091 | 012300 |
| 093 | 012303 |
| 094 | 012304 |
| 095 | 012305 |
| 097 | 012310 |
| 099 | 012315 |
| 101 | 012320 |
| 103 | 012325 |
| 105 | 012330 |
| 107 | 012335 |
| 110 | 012343 |
| 111 | 012340 |
| 112 | 012344 |
| 119 | 012350 |
| 121 | 012355 |
| 123 | 012357 |
| 127 | 012365 |
| 135 | 012385 |
| 137 | 012390 |
| 151 | 012400 |
| 153 | 012405 |
| 155 | 012410 |
| 157 | 012415 |
| 159 | 012420 |
| 161 | 012425 |
| 165 | 012435 |
| 167 | 012440 |
| 173 | 012450 |
| 175 | 012455 |
| 177 | 012460 |
| 181 | 012470 |
| 185 | 012485 |
| 187 | 012490 |
| 201 | 012500 |
| 205 | 012510 |
| 207 | 012515 |
| 213 | 012550 |
| 215 | 012555 |
| 217 | 012560 |
| 219 | 012565 |
| 231 | 012530 |
| 233 | 012580 |
| 241 | 012601 |
| 243 | 012600 |
| 247 | 012610 |
| 249 | 012611 |
| 251 | 012615 |
| 257 | 012630 |
| 261 | 012651 |
| 263 | 012650 |
| 265 | 012655 |
| 267 | 012660 |
| 269 | 012665 |
| 277 | 012680 |
| 281 | 012701 |
| 283 | 012700 |
| 285 | 012705 |
| 287 | 012710 |
| 289 | 012711 |
| 291 | 012715 |
| 297 | 012730 |
| 301 | 012751 |
| 303 | 012750 |
| 305 | 012755 |
| 307 | 012760 |
| 309 | 012765 |
| 317 | 012780 |

## Other AT1 lines referenced

`000060` · `000061` · `012040`
