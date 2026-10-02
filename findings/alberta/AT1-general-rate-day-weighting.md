# AT1 — the Alberta general rate is day-weighted, not flat

**Source:** Alberta Treasury Board and Finance, *Corporate Income Tax Net File
Specifications*, Chapter 3, version 2025.2 (August 2025). Local copy:
`research/spec/AT1-Chapter3-2025.2-full.txt`.

**Status:** implemented. `packages/ca-tax/src/t2/at1/rates/general-rate-bands.ts`,
wired into `computeAlbertaTax`. 10 tests in `tests/at1-general-rate-bands.test.ts`.

## The defect this closes

The engine applied a single general rate to the whole tax year — the rate in the
rate book for that year. The specification does not do that. It **prorates by
days across every rate band the tax year touches**:

```
value = Σ ( income × rate_band × days_in_band ÷ days_in_year )
```

with the result rounded up at $0.50 and floored at zero.

That distinction is invisible for a modern calendar year and material for
anything earlier. Alberta cut its general rate five times:

| Period | Rate |
|---|---|
| after 2006-03-31 and before 2015-07-01 | 10.0% |
| after 2015-06-30 and before 2019-07-01 | 12.0% |
| after 2019-06-30 and before 2020-01-01 | 11.0% |
| after 2019-12-31 and before 2020-07-01 | 10.0% |
| after 2020-06-30 | 8.0% |

Every one of those changes lands mid-calendar-year except the 2020-01-01 one, so
a corporation with a June, September or December year-end straddled a band in
2015, 2019 and 2020.

## Why it matters for a filing product

Calendar 2020 is the worst case: 182 days at 10% and 184 days at 8%, a blended
8.99%. Applying the year-end rate of 8% understates Alberta tax by roughly
**12% of the general-rate tax** — on $1,000,000 of general-rate income, $9,945.

The engine is used for amendments and prior-year filings, not only for the
current year, so "every year we will ever file is 8% throughout" is not a safe
assumption to bake in. It also fails silently: a flat rate produces a plausible
number, and nothing in the return signals that a band boundary was crossed.

## What was implemented

`computeDayWeightedGeneralTax(income, periodStart, periodEnd, bands?)` returns
the tax plus the per-band day counts and the blended effective rate, so the
audit trail shows *which* bands applied and for how many days rather than only
the total.

`computeAlbertaTax` day-weights when `periodStart` **and** `periodEnd` are both
supplied and otherwise falls back to the flat `GENERAL_RATE`. The fallback is
deliberate and documented: it is exactly right for any year from July 2020, and
callers that never pass a period keep their existing behaviour rather than
silently changing.

Two boundaries worth recording:

- **Endpoints are inclusive.** A tax year is counted inclusive of both its first
  and last day, so calendar 2024 is 366 days, not 365.
- **The small-business rate is NOT day-weighted.** Only the general rate has
  banded history in this period; the SBD rate stayed at 2%. Weighting it too
  would have been a plausible-looking error.

## Interaction with the CCA proration

Not the same rule, and they must not be confused:

- **Rate day-weighting** (this note) splits the year across *rate bands*. Its
  denominator is the days in the tax year.
- **CCA short-year proration** (Reg 1100(3), AT1 Schedule 13 line 013019) scales
  the claim by *days ÷ 365*, and the specification caps the numerator at 365 —
  a 366-day leap year is not prorated up.

A short tax year can trigger both at once.

## Open

- The band table stops at 8%. Any future Alberta rate change is a one-line
  addition to `AB_GENERAL_RATE_BANDS`; the host can also inject its own history
  via the `generalRateBands` input without a package release.
- Whether TRA expects banker's rounding or half-up at the band level or only on
  the total. The specification says "round up at $.50" for the total; this
  implementation sums unrounded band amounts and rounds once, which is the
  reading that avoids compounding rounding error across bands.
