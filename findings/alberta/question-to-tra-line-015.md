# Question for TRA: AT1 Schedule 1 line 015 (business limit), printed form vs Net File rule

Two TRA documents give different values for the same line. We need to know which governs the
transmitted figure. Until then the engine follows the printed form.

**Net File specification (Chapter 3, 001015)** for a corporation not associated with another CCPC:
value = A − B, where A = $200,000 × days/365 (maximum 365) and B = A × (fed 200415, maximum
$90,000) / $90,000, i.e. the taxable-capital reduction only. For an associated corporation the
value is 001045001 × days/365 with no reduction stated. The 357-day condition printed on the form
("shorter than 51 weeks") is not in the rule: the rule prorates every year.

**Printed AT1 Schedule 1, Area B (TRA11723 Rev. 2023-04)**, for years starting after 2018:
(h) is the lesser of (a) or (b) minus (f), where (f) is the greater of the taxable-capital
reduction (c) and the passive-income reduction (e). The form then says "Enter Amount (j) or (k)
on line 015" (after subtracting the line 515 assignment divided by 2.5).

**Questions**
1. Is the value of 001015 the printed form's (j) / (k), including the passive-income reduction
   and the assignment, or the specification's A − B?
2. If the specification governs, where is the passive-income reduction applied, if at all?
3. Is the year prorated only when shorter than 51 weeks (form) or always (rule)?
4. For an associated corporation, does 001015 include the taxable-capital and passive-income
   reductions?

**Effect of each answer on us:** a corporation with adjusted aggregate investment income above
$50,000 (reduction) or associated-group taxable capital above $10,000,000 files a different 001015
under the two readings. Our certified test cases TC1 to TC3 do not carry passive income.
