# AT1 Schedule 1 — Alberta Small Business Deduction

**Research note · source: `AT1-Chapter3-2025.2-full.txt` §3.2.3.2 (the TRA Net File
specification), read directly**

## Current state before this work

The Alberta SBD existed only as three lines inline in `at1-tax.ts`:

```
albertaSbdIncome = least of (active business income, business limit, Alberta taxable income)
```

That is the arithmetic core and it is right, but the specification attaches
**eligibility rules and an association rule** to Schedule 1 that the inline
version does not implement. Those are the parts that make a return wrong rather
than merely incomplete.

## What the specification requires

### Eligibility gate (form 001 existence rules)

> *"If 000029 = 1 or 2 throughout the taxation year or 000030 = 3 or 4 (i.e.
> Alberta co-op or credit union) … then form 001 can be completed. If 000030 = 5
> (i.e. sec. 149 exempt), then form 001 cannot exist. **SBD cannot be
> claimed.**"*

Three consequences:

1. Only a corporation that was a **CCPC throughout the year**, or an **Alberta
   co-operative or credit union**, may claim the deduction.
2. A **s.149-exempt** corporation may not claim it **at all** — and the same
   exception appears against the tax lines: *"If 000030 = 5 … then value must =
   zero."*
3. "Throughout the taxation year" is a real condition. A corporation that
   became or ceased to be a CCPC mid-year does not satisfy it.

### Association (AT1 jacket line 000001, NOT a Schedule 1 field)

> *"Is the corporation associated with one or more Canadian-controlled private
> corporations?"* — defaulted from the federal return (fed 200160, or the
> presence of federal Schedule 23), otherwise entered.

**Correction (this line was originally written as "line 001001", i.e. as if it
were Schedule 1's own field 001 — that was wrong.** A later investigation
(`AT1-jacket-line-001-extractor-boundary.md`) found the spec's §3.2.3.2 text
places this question in the SAME section as Schedule 1 for narrative reasons —
it's asked as an eligibility gate for the SBD — but 4 real, accepted TRA
Fall-2026 NetFile certification samples all file it as `000001001`, on the
**jacket** (schedule 000), and never as `001001001`. Schedule 1's own
`<Schedule Number="001">` block starts at field 003 in every sample. See
`packages/ca-tax/src/t2/at1/forms/jacket.ts`'s `LINE_001` for where this is
now modelled.

The Alberta business limit follows the federal allocation. An associated group
shares one limit; the corporation's own share must be supplied.

### Taxable income basis (line 001009)

> *"Taxable Income (less adj. for foreign tax credits)"*

Where AT1 form 004 (Alberta Foreign Investment Income Tax Credit) exists, the
taxable income used for the SBD is reduced. We accept the adjusted figure as an
input rather than deriving it, since form 004 is not yet implemented.

## Separate finding — Alberta general rate is day-weighted

The specification sets out the general-rate history with **day-weighted
proration** across mid-year changes:

| Period | Rate |
|---|---|
| after 2006-03-31 and before 2015-07-01 | 10.0% |
| after 2015-06-30 and before 2019-07-01 | 12.0% |
| after 2019-06-30 and before 2020-01-01 | 11.0% |
| after 2019-12-31 and before 2020-07-01 | 10.0% |
| after 2020-06-30 | **8.0%** |

with `value = Σ (income × rate × days-in-band ÷ days-in-year)`, rounded up at
$0.50, floored at zero.

`at1-tax.ts` applies a single flat rate. For a 2024 return that is correct — the
rate has been 8% since July 2020, so no band straddles. **It would be wrong for
any year straddling a change**, which matters if prior-year returns are ever
filed or amended. Recorded as a separate gap; not fixed here because it does not
affect current-year filings.

## Implementation

`packages/ca-tax/src/t2/at1/schedules/schedule1-sbd.ts`

- `AlbertaCorporationStatus`: `'ccpc' | 'albertaCoopOrCreditUnion' | 'section149Exempt' | 'other'`
- Returns `eligible`, the deduction income, and `issues` explaining any refusal.
- `at1-tax.ts` consumes it, so the eligibility gate applies to the tax
  calculation rather than sitting beside it.

## Test matrix

1. CCPC throughout the year ⇒ eligible; least-of applies.
2. CCPC **not** throughout the year ⇒ not eligible, issue raised.
3. Alberta co-op / credit union ⇒ eligible.
4. s.149-exempt ⇒ **not eligible**, deduction nil, issue raised.
5. Other corporation type ⇒ not eligible.
6. Associated with no allocated limit ⇒ issue raised.
7. Associated with an allocated limit ⇒ that limit used.
8. Deduction capped by Alberta taxable income.
9. Deduction capped by active business income.
10. Through `computeAlbertaTax`: an ineligible corporation pays the general rate
    on all Alberta taxable income.
