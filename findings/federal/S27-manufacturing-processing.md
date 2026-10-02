# T2 Schedule 27 — the M&P deduction is a structural wash

**Status:** implemented. `packages/ca-tax/src/t2/schedules/schedule27-mp.ts`,
13 tests in `tests/t2-schedule27-mp.test.ts`.

**Primary sources held locally:**
`../../sources/legislation/ITA-section-123.4-general-rate-reduction.txt`,
`../../sources/legislation/T4012-line-616-mp-deduction.txt`,
`../../sources/cra-forms/T2SCH27-manufacturing-processing.pdf`.

## The finding

This was tracked as a P0 on the premise that *"eligible corporations overpay"*
without it. **That premise was wrong.** The manufacturing and processing profits
deduction under s.125.1(1) changes what a return reports; it does not change the
tax.

s.123.4(1) defines "full rate taxable income" — the base of the general rate
reduction — as taxable income *less*, among other things:

> **(i)** if an amount is deducted under subsection 125.1(1) from the corporation's
> tax otherwise payable under this Part for the year, **the amount obtained by
> dividing the amount so deducted by the corporation's general rate reduction
> percentage**

So the general reduction given up is

```
grrp × (deduction ÷ grrp)  =  deduction
```

**exactly, for any non-zero general rate reduction percentage.** The division is
what neutralises it.

## Why this matters more than the arithmetic

The obvious explanation — "both rates are 13%, so they cancel" — is *true today and
is not the reason*. Had the rates differed, the offset would still land exactly,
because the statute divides by whatever the general reduction percentage happens to
be. In 2011, when the M&P rate was 13% and the general reduction 11.5%, more than
the M&P income left the base and the wash still held.

An implementation built on "both are 13%" would carry a rate-equality assumption
that was never load-bearing, and would raise a false alarm on any future rate
change. `washesOut` therefore keys on whether a general rate reduction exists at
all, not on whether the two rates match.

The deduction is real relief only in a year with **no** general rate reduction,
which is how it worked before s.123.4 was introduced in 2001.

## Why implement it anyway

A certified return must report line 616 and the correspondingly reduced full-rate
taxable income at lines 638/639. Reporting nil where a corporation has M&P profits
is a filing error even though the tax is identical. This is a **filing-correctness**
requirement, not a tax-correctness one — a distinction the original P0 framing
collapsed.

The module reports `deduction`, `fullRateTaxableIncomeReduction` and
`equivalentGeneralRateReductionForgone` so the neutrality is visible on the return
rather than assumed.

## Eligibility, which is a real gate

- **At least 10% of gross revenue** for the year from manufacturing or processing
  goods in Canada for sale or lease. Both revenue figures are required; absent
  them the deduction fails closed rather than being assumed.
- **s.125.1(3) exclusions** — farming, fishing, logging, construction, operating an
  oil or gas well, extracting petroleum or natural gas, extracting minerals,
  processing ore, producing industrial minerals. A corporation in these lines does
  not qualify however much processing the activity involves. This matters for the
  Alberta client base, where oil and gas is the obvious near-miss.
- M&P profits inside the small-business band already get the 9% rate and are
  excluded from the deduction.

## Not the same as ZETM

Zero-emission technology manufacturing (s.125.1(2)) shares line 616 but is a
**genuine** rate reduction — 15% → 7.5% on general-rate income, 9% → 4.5% on
SBD income — and is excluded from full rate taxable income by its own formula in
s.123.4(1)(a)(ii), not by the divide-by-grrp mechanism. It is computed separately by
`computeZetm` and it does *not* wash out.

Three things share line 616 and only one of them is neutral. Worth keeping straight.

## Closed, 2026-09-03

Parts 1 and 2 profit-derivation implemented in `schedule27-mp.ts`, verified
against the rendered form (`T2SCH27-manufacturing-processing.pdf`, T2 SCH 27
E (22) — `pdftotext -layout` is reliable for this form, unlike the
grid-shaped forms elsewhere in this repo that need PyMuPDF rendering
instead):

- **`computeSmallManufacturerTest`** (Part 1) — the four small-manufacturer
  requirements (primarily M&P; combined active business income ≤ $200,000
  under s.5201 of the Regulations, where "combined" includes associated
  corporations for the TEST only, not the profits figure itself — a real
  detail: qualifying profits are line 100 ALONE, not line 110; no s.5201(c)-
  (c.3) excluded activity; no active business outside Canada). Qualifying
  returns Canadian M&P profits = line 100 directly.
- **`computePart2MPProfits`** (Part 2) — the labour-and-capital formula
  `MP = ADJUBI × (MC+ML)/(C+L)`, taking the five already-aggregated Schedule
  27 sub-results (ADJUBI from Part 3, C/MC from Parts 4-5, L/ML from Parts
  6-7) as inputs. MC is capped at C and ML at L (matching the form's own
  "cannot be more than" ceilings on lines 150/170), and a nil (C+L)
  denominator fails closed rather than dividing by zero.
- **`computeCanadianMPProfits`** — routes to Part 1 or Part 2 exactly as the
  form's own page-1 instructions direct ("small manufacturing corporations
  that meet all requirements in Part 1 should begin with Part 1 ... all
  other corporations should begin with Part 2").

**Deliberately NOT built**: deriving Parts 3-8's own five sub-results from
GRANULAR data (per-property CCA-class eligibility and its M&P-use
percentage, per-employee wage allocation, s.1204 resource profits) — this
app collects none of that anywhere today, and each of those Parts is its own
multi-line form with its own adjustments (the exclusions in Part 6 alone —
salaries embedded in capital cost, foreign-business wages, resource-activity
wages, R&D wages — are a genuinely separate, larger scope). The formula
function takes the five results as inputs, same as `computeMpDeduction`
already took the single combined profits figure — this closes exactly what
this finding's "Open" section asked for (the Parts 1/2 arithmetic), not a
new granular guided-editor UI.

Also NOT wired into `federal-t2.ts`'s Part I tax pipeline in this pass —
confirmed while researching this that `computeMpDeduction` itself (not just
Parts 1/2) was never called from `federal-t2.ts` at all, the same "engine
built, never invoked" class of gap as several other findings in this sweep.
Left unwired here deliberately: this finding's own core conclusion is that
the deduction washes out EXACTLY against the general rate reduction whenever
one is in force, so wiring it changes only the REPORTED line 616 breakdown,
never `totalFederalTax`. Getting that wiring subtly wrong (e.g. reducing the
general-rate-reduction base without correspondingly restoring it) risks
introducing an actual tax bug for zero net benefit beyond report
completeness — a worse trade than leaving line 616 unreported, which is
what this app has always done. Revisit as its own, carefully-checked pass if
"complete" filing (not just correct tax) becomes the priority.

Regression tests: `tests/t2-schedule27-mp.test.ts` — Part 1 qualification/
disqualification on each of the four requirements, Part 2's ratio formula
and its MC/ML caps, the nil-denominator fail-closed case, and the
`computeCanadianMPProfits` routing (Part 1 wins when it qualifies, Part 2
otherwise, and the composer feeds `computeMpDeduction` directly).
