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
    deduction reduces CDE), as the caption and the Income Tax Act treatment suggest? The same question
    applies to the successor side (015133, "if amount A is negative, then value may not exceed amount A",
    subtracted in 015141).
11. Line 015169: a negative A is routed to 105 "if the corporation has made a designation under
    66.7(4)(a)(iii)", otherwise to 015133. Which field carries the designation in Net File?
12. Line 015191: the rule subtracts `015167 + 015169` (claims on the regular pool) from the successor
    pool total. We subtract only the successor claim. Is the literal text intended?
13. Accelerated claims: 015115 / 141 / 169 / 189 say "Accelerated claims will be accepted by TRA's system.
    Override of the above calculation should be utilized to report accelerated claims." How is an
    override transmitted: simply a value above the 30% / 10% cap, or a separate indicator?
14. Negative pools (015209 / 221 / 253 / 273 / 293 / 313 and a negative CDE pool at 015107 / 015139):
    "include the pool balance in 012040". Is it entered as a positive amount at 012040 with the federal
    counterpart on 012041 (and an explanation at 012048), as for the Schedule 18 component? Which
    Schedule 15 areas does the 012040 rule list (the Chapter 3 text for it, p. 3-110, reads garbled)?
21. 015313 (CFRE successor): the cap is "total of all occurrences of 015317". Is that a per-country cap equal
    to the total foreign resource income of all countries (so the countries together may claim more than
    that total), or should the claims across all countries together not exceed the sum of 015317?

## F. Schedule 12 (income / loss reconciliation)

15. 012036 is "sum of 017001 to 017047 inclusive". Read literally that includes Schedule 17's totals
    (017021). Is the opening balance plus transfer-in (rows 001 to 017 and 031 to 047 only) intended?
16. Jacket 000062 when 000060 and 000061 are both 2: "(fed 004110 + fed 004310) x (-1) if it exists,
    otherwise fed 200360 - fed 200370". When the corporation has a current-year loss, is 000062 the
    negative loss amount?
17. 012092 ("fed 200370"): only for section 149(1)(t) insurers. Can it be omitted for everyone else
    (we send 0)?
20. 021157 (loss incurred in current year, occurrence 0): "Value must equal 021021." 021021 is the
    non-capital loss as a negative amount, while 021169 = 155 + 157 + 159 - 165 - 167 only produces the
    closing balance if 157 is positive. Is 157 the loss as a positive amount (= 021021 x -1, as 021037)?
    We file it positive.
22. 012106 and 012052 / 080 / 081: these are printed on the form and not listed in Chapter 3. We do not
    transmit them. Confirm they are not expected.

## G. Schedule 4 and federal Schedule 21 per country

18. "AB form 004 may exist only if fed form 021 exists. Sort the field occurrences in the same order as on
    the federal form." Our federal Schedule 21 is a single aggregate. Is the Alberta Schedule 4 accepted
    when its country rows total the federal Schedule 21 amounts but carry no per-country federal rows?

## H. Regulation 413 (non-residents)

19. Schedule 2 lines 004 and 008 are "fed 005129 - fed 005127" and "fed 005169 - fed 005167 (only if
    Reg 413 (non-residents) applies)". For Schedule 1 line 021, the rule lists regulations 402, 403, 404,
    405, 408, 409 and 411 for the 127 / 167 reduction. For a Reg 413 corporation, we take 127 and 167 off
    the totals once (Schedule 2) and make no further reduction at 021. Is that the intended result?

## I. Added 2026-11-11 (from the schedules 16 / 17 / 18 / 20 / 21 / 29 and jacket reports)

23. Schedule 18, lines 096 and 098 (the s. 34.2 partnership amounts, federal Schedule 73 lines 275 / 285).
    076 is "(097 - 098) x inclusion rate" with 097 = subtotal + 096. If 275 / 285 are already the taxable
    (50%) amounts, should they be grossed up (x 2) before the inclusion rate is applied, or added as they
    are? We gross them up so that 076 matches the printed arithmetic. Please confirm which TRA recomputes.
24. Jacket 000129 against Schedule 29 line 130. Both carry the grant amount. When the two disagree (for
    example after the grant is limited), which one does TRA validate, and what is the tolerance?
25. Jacket 000090 (balance of tax payable / overpayment). The printed form and Chapter 3 differ on how the
    instalments and 092 relate. Is 000092 required whenever 000090 is negative, and ignored otherwise?
26. Jacket 000071 (manufacturing and processing deduction). The formula gives F = 0 for years after
    2001-03-31. If a value is sent, is it rejected or ignored? We send nothing.
27. Jacket 000074 (political contributions credit). We cap it at 1,000 and at the room left after 070-072.
    Is there a rule beyond Schedule 8 (which we do not file) that TRA expects us to apply?
28. Schedule 20, line 076 and 016. We cap 076 at 012054 - 012056 and 016 at 012054. Please confirm
    that 016 and 076 are not otherwise limited, and that Schedule 20 must not be created in a nil or
    loss year (we do not file it, and leave the donations in the federal pool).

### Resolution of 23–28 (team answers, 2026-11-12)

Closed from the spec / IEG Guide / TC2-TC3 acceptance — do NOT send: 24 (129 = Schedule 29 line 134), 26 (071 is
always 0), 27 (074 is 0 without Schedule 8, locked), 28 (016 / 076 caps and no Schedule 20 in a loss year are in
the spec). 25 is closed once the 090 approach is chosen (we keep the printed form's 090 and require 092).

Still for TRA:
- **23.** Schedule 18 lines 096 / 098 (s. 34.2): we file them as the spec says ("must equal" fed 006899 /
  006901, no gross-up). Does TRA's 076 formula halve an amount that is already taxable?
- **25b.** Does jacket line 090 net the IEG (line 129)? The spec formula is 090 = 080 - (081 + 082 + 085 + 086 +
  087), without 129; the printed AT1 nets 129. TC2 / TC3 were accepted with 090 = -31,250 / -89,250 and no 092.
