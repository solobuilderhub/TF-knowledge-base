# Questions for TRA: AT1 Net File specification (Chapter 3, v2026.4) and the printed forms

From: Tax Foundry (Net File software). Each question quotes the specification line or printed form it
comes from. Where the answer changes what we transmit, we say how.

## A. Schedule 1, line 015 (business limit)

Chapter 3 (001015) and the printed Schedule 1 (TRA11723, Area B) give different values.

1. For a corporation not associated with another CCPC, is 001015 the specification's `A - B` (taxable
   capital reduction only), or the printed form's Area B result (j) / (k), which also deducts the
   passive-income reduction and the line 515 assignment divided by 2.5?
2. Is the year prorated only when shorter than 51 weeks (printed form), or always, by days / 365 (rule)?
3. For an associated corporation, does 001015 include the taxable-capital and passive-income reductions?

## B. Schedule 4, 004012 (allowable credit) and 004006

4. 004012 is "the lesser of D or G". When the federal credit (004008) exceeds the net foreign tax
   (004006), G is negative. Is a negative 004012 to be transmitted (AuraTax does), or is it floored at
   zero? A negative 000072 would increase Alberta tax payable.
5. For 004002 (type A, length 2): which code list (federal Schedule 21 / ISO 3166 alpha-2)?

## C. Schedule 3, APITC room (lines 304 to 312)

6. The business rules for 003304 / 306 / 308 / 310 / 312 limit application to
   `000068 - (000070 + 000072) - (003104 + 003204 ...)`, which leaves out 000071 and 000074, while
   003602 and 003604 (and so 000076) use `000068 - (000070 + 000071 + 000072 + 000074)`. Is the wider
   APITC room intended? As written, 003312 can exceed what 003604 allows, so credit is used up that is
   never deducted. We currently also cap 003312 at 003602 - 003104 - 003204.

## D. Schedule 13 (capital cost allowance)

7. 013011 (the 50% rule): the rule for 013019 is written as `[(...) - 013011] x 013013 x days / 365`, and
   011 is X ("enter the corresponding amount from fed 008211"). The printed form (TRA11733) has no
   column 011; column 19 / line 037 is the half-year adjustment. Is 013011 still expected in Net File,
   and is it the same quantity as 013037?
8. 013013: "Allow input for classes where the rate is elective." Which classes are these? We currently
   report a typed rate that differs from the class's statutory rate, and compute at the typed rate.
9. 013039 and 013045 (designated immediate expensing property, "before 2024"): for a tax year that
   starts after 2023-12-31, are these lines and the immediate expensing column to be rejected, or
   are they still accepted for property that qualified earlier?

## E. Schedule 15 (resource-related deductions)

10. Line 015105 ("Deduct: credit balance in the CCOGPE pool"): the rule says "If amount A is negative,
    then value = amount A." Line 015115 then subtracts 015105. Taken literally, a negative 105 is
    added to the CDE pool. Is 105 meant to be the credit balance as a positive amount (so the
    deduction reduces CDE), as the caption and the Income Tax Act treatment suggest?
11. Line 015169: a negative A is routed to 105 "if the corporation has made a designation under
    66.7(4)(a)(iii)", otherwise to 015133. Which field carries the designation in Net File?
12. Line 015191: the rule subtracts `015167 + 015169` (claims on the regular pool) from the successor
    pool total. We subtract only the successor claim. Is the literal text intended?
13. Accelerated claims: 015115 / 141 / 169 / 189 say "Accelerated claims will be accepted by TRA's system.
    Override of the above calculation should be utilized to report accelerated claims." How is an
    override transmitted: simply a value above the 30% / 10% cap, or a separate indicator?
14. Negative foreign pools (015209 / 221 / 253 / 273 / 293 / 313): "include the pool balance in 012040".
    Is it entered as a positive amount at 012040 with the federal counterpart on 012041 (and an
    explanation at 012048), as for the Schedule 18 component?

## F. Schedule 12 (income / loss reconciliation)

15. 012036 is "sum of 017001 to 017047 inclusive". Read literally that includes Schedule 17's totals
    (017021). Is the opening balance plus transfer-in (rows 001 to 017 and 031 to 047 only) intended?
16. Jacket 000062 when 000060 and 000061 are both 2: "(fed 004110 + fed 004310) x (-1) if it exists,
    otherwise fed 200360 - fed 200370". When the corporation has a current-year loss, is 000062 the
    negative loss amount?
17. 012092 ("fed 200370"): only for section 149(1)(t) insurers. Can it be omitted for everyone else
    (we send 0)?

## G. Schedule 4 and federal Schedule 21 per country

18. "AB form 004 may exist only if fed form 021 exists. Sort the field occurrences in the same order as on
    the federal form." Our federal Schedule 21 is a single aggregate. Is the Alberta Schedule 4 accepted
    when its country rows total the federal Schedule 21 amounts but carry no per-country federal rows?

## H. Regulation 413 (non-residents)

19. Schedule 2 lines 004 and 008 are "fed 005129 - fed 005127" and "fed 005169 - fed 005167 (only if
    Reg 413 (non-residents) applies)". For Schedule 1 line 021, the rule lists regulations 402, 403, 404,
    405, 408, 409 and 411 for the 127 / 167 reduction. For a Reg 413 corporation, we take 127 and 167 off
    the totals once (Schedule 2) and make no further reduction at 021. Is that the intended result?
