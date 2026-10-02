# CCA — the straight-line classes (13, 14) and class 14.1

**Status:** implemented. `packages/ca-tax/src/t2/schedules/cca-straight-line.ts`,
33 tests in `tests/t2-cca-straight-line.test.ts`.

**Why now.** `computeCcaClass` threw `UnsupportedCcaClassError` for classes 13, 14
and 14.1. AT1 Schedule 12's own commentary names **classes 1 and 13** as the
typical Alberta-versus-federal divergence, and leasehold improvements are the one
straight-line class an owner-managed client actually meets — a tenant fitting out
rented premises. Leaving it unsupported meant the engine refused to compute the
exact schedule Alberta expects to see reconciled.

## Finding 1 — class 14.1 was miscategorised in our own rate table

The rate table's comment lumped "14 / 14.1 intangibles" together as straight-line
and excluded both. That is wrong for 14.1.

**Class 14.1 is a declining-balance class at 5%.** It was created on
1 January 2017 to replace the repealed eligible-capital-property regime, and it is
computed by the ordinary declining-balance calculator like any other class. It has
been added to `CCA_DECLINING_BALANCE_RATES_2024` at `0.05`.

**Confirmed against a certified product.** AuraTax's own class picker on T2
Schedule 8 labels each class with its rate: `Class 13 (Varies)`,
`Class 14 (Varies)`, `Class 14.1 (5%)`. Both halves of this finding — 14.1 has a
flat rate, 13 and 14 have none — are visible on the live form. Evidence in
`research/validation/auratax/2026-08-07-cca-classes/`.

Only classes **13 and 14** are genuinely straight-line, and `computeCcaClass`
still throws for those two — correctly, since applying a rate that does not exist
would silently produce a wrong number.

## Finding 2 — class 13 is per-LAYER, and never faster than five years

Reg 1100(1)(b) + **Schedule III**. The rule people misremember is "amortise over
the lease term." What Schedule III actually says:

> **s.2** — the prorated portion is the lesser of one-fifth of the capital cost of a
> particular leasehold interest and the amount determined by dividing the capital
> cost by the number of 12-month periods (**not exceeding 40**) commencing with the
> beginning of the particular taxation year in which the capital cost was incurred
> and ending with the day the lease is to terminate.

Two consequences that a naive "cost ÷ lease term" gets wrong in opposite
directions:

- **A short lease does not accelerate the write-off.** The lesser of `cost ÷ 5` and
  `cost ÷ N` means you divide by the *larger* of 5 and N. A three-year lease
  amortises over five years, not three.
- **A long lease is capped at 40 periods**, not at the actual term.

And **s.2 says "a particular leasehold interest"** — each capital cost incurred in
a given tax year is its own layer with its own denominator. A 2024 improvement on a
lease signed in 2019 has fewer periods left to run than the original fit-out, so
pooling them into one average is wrong. The implementation models layers, not a
pool.

### The s.3 constraints, all enforced

| | Rule | Implementation |
|---|---|---|
| s.3(a) | costs incurred before the lease was acquired are deemed incurred when it was acquired | caller supplies the layer's tax year |
| s.3(b) | where the lease grants renewal rights, it is deemed to terminate at the end of the term **next succeeding** the one in which the cost was incurred | `leaseholdPeriods(start, leaseEnd, firstRenewalEnd)` — the **first** renewal only; later ones are ignored |
| s.3(c) | a portion cannot exceed the layer's remaining undepreciated balance | `Math.min(portion, remainingBalance)` |
| s.3(d) | once claims **plus disposition proceeds** equal the capital cost, the layer yields nil | proceeds reduce `remainingBalance` |
| s.3(e) | once the class UCC is nil, every portion is nil | falls out of the s.1 lesser-of |

**s.1** then caps the class: the deduction is the lesser of Σ prorated portions and
the class's undepreciated capital cost before the deduction. So a layer can
generate a portion the class cannot afford to pay out, and the class limit binds.

### Counting the periods in MONTHS, not in 365-day blocks

`leaseholdPeriods` originally divided elapsed days by 365 and rounded up. That
made a lease running 2024-01-01 to 2033-12-31 come out as **eleven** periods
rather than ten, purely because three leap days pushed 3,652 days past 3,650. The
count is now done in whole calendar months. This is the kind of error that is
invisible in a spot check and shifts every year's claim.

### The half-year rule — RESOLVED from the primary text, and we had it wrong

This was open through two rounds and is now settled, by reading the regulations
themselves rather than any summary. Both are held locally under
`../../sources/legislation/`.

**Reg 1100(2)** does not reduce a claim. It says the amount deductible

> "under subsection (1) in respect of property of a class in Schedule II is to be
> determined **as if the undepreciated capital cost … were adjusted** by adding the
> positive or negative amount determined by the formula A(B) + A.1(B.1) − 0.5(C)"

It adjusts the **UCC**. Nothing else.

**Schedule III s.1** makes the class 13 deduction

> "the lesser of **(a)** the aggregate of each amount determined in accordance with
> section 2 … that is a prorated portion …; and **(b)** the undepreciated capital
> cost … as of the end of the taxation year (before making any deduction under
> section 1100) of property of the class."

So the half-year rule reaches class 13 — the deduction is made under
paragraph 1100(1)(b), which is "under subsection (1)" — but it lands on **limb
(b), the ceiling**. The prorated portion in limb (a) is untouched.

**The practical consequence is that it almost never bites.** A first-year prorated
portion is at most `cost ÷ 5`, 20% of the layer's cost, while the halved UCC is
50% of it. The ceiling only binds when the class pool is already thin for other
reasons.

The implementation originally halved the *portion*, on the strength of secondary
sources that all say "the half-year rule applies to class 13" — true, but not in
the way that phrasing suggests. That **understated a first-year claim by half**:
$5,000 instead of $10,000 on a $100,000 fit-out over a ten-year lease. Now
corrected — `halfYearUccReduction` and `adjustedUccCeiling` are reported on the
result so the ceiling is visible in the audit trail.

Note also why the earlier attempt to settle this against a certified competitor
failed: **AuraTax does not compute class 13 at all.** Its rate column shows
"Varies" and its column 21 is captioned "CCA (for declining balance method …)", so
the figure is preparer-entered. Computing Schedule III is a capability a certified
competitor does not have — but that also means it can never be the oracle for it.
The regulation is.

## Finding 3 — class 14 is amortised in DAYS over each property's own life

Reg 1100(1)(c). Not a rate, and not the class 13 mechanic either:

```
max CCA = lesser of   Σ [ capital cost × days in tax year
                          ÷ days of life REMAINING when the cost was incurred ]
                      undepreciated capital cost of the class
```

The denominator is fixed at acquisition. It is neither the property's total life
nor the days left today, and getting that wrong compounds every year.

**No half-year rule.** The day count already handles a mid-year acquisition, so
halving on top would deduct twice for the same fact.

A property with no limited life is not class 14 property at all — it belongs in
class 14.1. `computeClass14` returns nil for a zero life and says so, rather than
dividing by zero.

## Finding 4 — the class 14.1 pre-2027 transitional additional allowance

Reg 1100(1)(c.1)/(c.2). When eligible capital property became class 14.1 on
1 January 2017, the rate dropped from the old regime's 7% to 5%. The transitional
rules keep **pre-2017 expenditures** moving at the old pace until the regime fully
washes out:

- **2%** of the 1 January 2017 class 14.1 balance, reduced by the additional
  allowance already taken against it, for any tax year **ending before 2027**.
  With the ordinary 5%, that restores the 7% pace on the transitional portion.
- A **$500 floor**: where the ordinary claim plus the additional allowance falls
  short of $500, the additional allowance may be topped up to bring the total
  class 14.1 deduction to $500 — bounded by the transitional balance and by the
  class UCC. This exists so a small legacy goodwill pool clears rather than
  amortising forever at 5% of a shrinking number.

`computeClass141AdditionalAllowance` **fails closed**: with no transitional
balance supplied it claims nothing. Most corporations have no pre-2017 balance,
and one that does must state it rather than have it inferred — a missing balance
must never behave as an unlimited one.

The allowance is switched off entirely for a tax year ending 2027-01-01 or later,
so the rule expires on its own without anyone having to remember to remove it.

## Closed, 2026-09-03

**s.13(39) recapture reduction — implemented.** Two independent sources
(Finance Canada's own explanatory notes to the enacting bill, cross-checked
against a secondary summary of the statute) corroborate the core mechanic: a
disposition of class 14.1 property that was eligible capital property (ECP)
before 2017 deems an ADDITIONAL capital cost equal to the LEAST of three
amounts — 1/4 of the proceeds, 1/4 of the property's capital cost, and a
third amount the retrieval tooling available here could not confirm against
the Act's own text (Justice Laws' page for s.13 truncates before reaching
subsection 39). Implemented the two corroborated limbs in
`computeClass141RecaptureReduction` (`cca-straight-line.ts`), bounding the
third by a caller-supplied REMAINING transitional balance rather than
guessing — the same fail-closed convention `computeClass141AdditionalAllowance`
already uses one function up (a missing balance behaves as zero, never
unlimited). Wired into `federal-t2.ts` via a new `class141Disposition` input:
the deemed addback nets directly against the '14.1' row's `recapture` (and
`cca.totalRecapture`), floored so it can never invert a real recapture into
a deduction.

**A second, previously undocumented gap found and fixed in the same pass:**
`computeClass141AdditionalAllowance` (the 2%/$500-floor transitional rule,
already fully built and tested) was **never called from `federal-t2.ts` at
all** — genuinely dead code, the same class of bug as the AT1
Schedule-12/AAII findings elsewhere in this sweep. Wired via a new
`class141Transitional` input; its `additionalAllowance` now folds into the
line 403 CCA deduction alongside the ordinary 5% claim.

Regression tests: `tests/t2-cca-straight-line.test.ts` — unit tests for
`computeClass141RecaptureReduction`, plus a `computeFederalT2 integration`
describe block proving both rules end-to-end (additional allowance reaching
line 403; recapture reduction netting into `cca.totalRecapture`; the
reduction correctly capped at the recapture actually triggered rather than
inverting it).

**Classes 13/14 wiring — was already closed, the finding was stale.**
Re-checked `computeCcaSchedule` directly (the function this finding's
"Open" section named): it's true that classes 13/14 don't run THROUGH it —
but `federal-t2.ts` already sums `ccaClasses` (declining balance) +
`class13`/`class14` (the full layered mechanics) into ONE line 403 entry
(confirmed at the point `totalCcaDeduction` is built), so a return mixing
them does not need to total them by hand. `computeSchedule8` (the
discriminated-union rollup the finding suggested building) does exist in
`schedule8.ts` but turned out to be genuinely unused dead code — `grep`
across `apps/` found no import of it anywhere; `federal-t2.ts`'s own
parallel summing achieves the same result without it.

**Still a real, disclosed gap — not attempted here:** the guided editor
(`apps/web/.../schedules/t2/cca.ts`) and `assemble-t2-input.ts` have no entry
point for a NEW class 13 leasehold layer or class 14 limited-life property —
only `computeCcaClass`'s narrower "existing opening-UCC pool, no addition"
path is reachable from the UI (`STRAIGHT_LINE_OPENING_BALANCE_ONLY` in
`schedule8.ts`). The full `class13`/`class14` engine inputs
(`FederalT2Input`) are built, tested, and wired end-to-end into Schedule 1 —
a preparer with a genuinely NEW leasehold improvement or limited-life
intangible this year simply has no UI to enter the lease-term/remaining-life
data that mechanic needs. Building that UI (a per-layer array with lease
dates, renewal terms, remaining-life days) is real, separate, appropriately
larger scope than this pass — same judgment call as `class141Transitional`/
`class141Disposition` above having no UI entry point either (both are
engine-ready, preparer-unreachable).

## Sources

- [Income Tax Regulations, SCHEDULE III (Class 13) — Justice Laws](https://laws-lois.justice.gc.ca/eng/regulations/c.r.c.,_c._945/page-92.html)
- [Income Tax Regulations, s.1100 — Justice Laws](https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._945/section-1100.html)
- [9 March 2001 Internal T.I. 2001-0063737, Schedule III of the Regulations](https://taxinterpretations.com/cra/severed-letters/2001-0063737)
- [Class 13 — Leasehold interest, DT Max knowledge base](https://support.drtax.ca/KB/faqs-windows-english/source/webpages/kpa320-20191025094046ni.htm)
- [Schedule 10, AT1 Schedule 14, and Class 14.1 — TaxCycle](https://www.taxcycle.com/resources/help-topics/t2-corporate-tax/t2-forms-and-worksheets/schedule-10-at1-schedule-14-and-class-141/)
- [Eligible capital property (Class 14.1) — Taxprep](https://www.taxprep.com/assistance/T1/2019/v30/en-ca/Content/FORMS/T2124CECForm.htm)
