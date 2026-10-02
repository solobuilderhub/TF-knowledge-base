# Schedule 43 — Part VI.1 tax on taxable preferred share dividends

**Status: fully closed, 2026-09-03.** The tax (below) was already wired into
`totalFederalTax`; the s.110(1)(k) deduction (§3) was the open item — its
multiple was already correctly transcribed and tested in
`part-vi-1-deduction.ts`, but `computePartVI1Deduction` was never actually
CALLED from `federal-t2.ts` (genuinely dead code, confirmed by grep — the
same class of gap as the AAII/resource-deductions findings elsewhere in this
sweep). Re-verified the multiple against a second source (Justice Laws'
archived `section-110-20181213.html`, which — unlike the live page used
originally — is short enough not to truncate before reaching paragraph
110(1)(k); fetched verbatim, matches `part-vi-1-deduction.ts`'s own quoted
text exactly) and found the real jacket line via an independent T2
line-index source: **line 325**, "Part VI.1 tax deduction," cross-referencing
line 724 exactly as this codebase's own `jacket.ts` already documented.

Wired `computePartVI1Deduction(partVI1.partVI1Tax, isoDay(input.periodEnd))`
into `federal-t2.ts`'s Division C deductions (jacket line 325) — required
moving the Part VI.1 tax computation earlier in the function (it has no
dependency on taxable income, only on `input.preferredShareDividends` and
rates, so nothing else needed to move). `partVI1Deduction` is exposed on
`FederalT2Result` for the audit trail; an unreadable tax year end fails
closed (nil deduction, an issue raised) rather than guessing at the
multiple, matching this module's own pre-existing design.

Regression tests added to `tests/t2-part6-1.test.ts`: the 3.5× deduction
reaching `taxableIncomeCalc.deductions`/`taxableIncome` end-to-end, the 3×
multiple for a pre-2010 year end, and the fail-closed nil-multiple case.

---

**Research note · sources: ITA s.191.1 (laws-lois, fetched verbatim), s.110(1)(k), practitioner commentary**

Why this matters for our client profile: Part VI.1 is payable by **any taxable
Canadian corporation** — CCPCs included — that *pays* dividends on taxable
preferred shares. Estate freezes are routine in owner-managed CCPCs and freeze
preferreds commonly meet the taxable-preferred-share definition, so this is the
target segment, not an edge case.

The Part IV.1 half of Schedule 43 is a **different tax** on the *recipient* and
is genuinely out of scope for us: a dividend received by a private corporation
is an excepted dividend.

---

## 1. The charge — s.191.1(1)

Tax equals the total of:

| Base | Rate |
|---|---|
| Dividends on **short-term preferred shares** | **40%** (years ending after 2011) |
| Dividends on **other taxable preferred shares**, where a **s.191.2 election** was made | **40%** |
| Dividends on **other taxable preferred shares**, no election | **25%** |

Historical short-term rates: 50% (years ending before 2010), 45% (2010–2011).
Rate-book entries, not constants.

Excluded dividends are outside the base entirely.

## 2. The dividend allowance — s.191.1(2)

- Maximum **$500,000** per year.
- **Ground down dollar-for-dollar** where non-excluded dividends paid on taxable
  preferred shares in the **preceding** year exceeded **$1,000,000**. So prior
  year of $1.3M ⇒ allowance $200,000; prior year of $1.5M or more ⇒ nil.
- **Associated corporations: the allowance is NIL unless an allocation
  agreement is filed.** The group shares one $500,000 allowance. This is a
  fail-closed default in the statute, and our implementation must reproduce it
  rather than helpfully assuming $500,000.

The allowance reduces the **base**, not the tax, and is consumed in order across
the rate bands.

### Ordering decision

The statute applies the allowance against short-term preferred dividends first,
then the remaining allowance against the other bands. We implement that order
explicitly: consuming the allowance against the highest-rate band first is the
result the ordering produces, and it is also the taxpayer-favourable reading, so
the two do not conflict here.

## 3. The knock-on — s.110(1)(k)

Part VI.1 tax paid is deductible in computing **taxable income**, at a multiple
of the tax. **This is why omitting Part VI.1 is a two-sided error**: it
understates tax payable *and* overstates taxable income.

> **[PIN]** The statutory multiple in s.110(1)(k) must be transcribed from the
> Act before the deduction is wired into taxable income. It is deliberately NOT
> hard-coded from memory in the first implementation pass — the tax computation
> ships first, the deduction follows once the multiple is pinned from source.
> Until then the engine reports the tax and flags the outstanding deduction
> rather than silently applying a guessed factor.

## 4. Interaction with Part IV.1

A s.191.2 election by the issuer (raising its own rate to 40%) **exempts the
recipient** from the 10% Part IV.1 tax. We model the election as an input
because it changes our rate; the recipient-side consequence is out of scope.

## 5. Implementation

`packages/ca-tax/src/t2/schedules/schedule43-part6-1.ts`

Inputs: dividends by class (short-term / other), whether the s.191.2 election
was made, prior-year taxable preferred dividends, whether associated, and the
allocated allowance where associated.

Outputs: allowance after grind, base by band, tax by band, total Part VI.1 tax,
and an `issues` list surfacing the associated-corporation agreement requirement.

Rates and thresholds live in the effective-dated rate book
(`PART_VI_1_*`), never inline.

## 6. Test matrix

1. No preferred dividends ⇒ nil.
2. Short-term only, under allowance ⇒ nil.
3. Short-term only, over allowance ⇒ 40% of the excess.
4. Other taxable preferred, no election ⇒ 25% of excess.
5. Other taxable preferred, with election ⇒ 40% of excess.
6. Both classes ⇒ allowance consumed against short-term first.
7. Prior-year > $1M ⇒ allowance ground down dollar-for-dollar.
8. Prior-year ≥ $1.5M ⇒ allowance nil.
9. Associated, no agreement ⇒ allowance nil + blocking issue raised.
10. Associated, agreement filed ⇒ allocated amount used.
