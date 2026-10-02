# Schedule 4 — the three loss classes we were missing

**Research note · sources: ITA s.111(1), CRA IT-302R3, practitioner commentary**

Schedule 4 implemented non-capital (s.111(1)(a)) and net-capital (s.111(1)(b))
losses. Three further classes appear on the same schedule and were absent. A
corporation holding any of them got a **wrong carry-forward**, and continuity
errors compound: a wrong pool in one year is wrong in every later year until
someone reconciles it by hand.

## The distinguishing property: what income each may offset

This is the whole correctness point. Non-capital losses offset **any** income.
These three do not.

| Class | ITA | May be deducted against | Carry-forward |
|---|---|---|---|
| **Farm loss** | s.111(1)(d) | Any income | 20 years (back 3) |
| **Restricted farm loss** | s.111(1)(c) | **Farming income only** | 20 years |
| **Limited partnership loss** | s.111(1)(e) | **Income from that partnership only** | **Indefinite** |

A restricted farm loss arises where farming is **not** a chief source of income:
the non-deductible portion of the farming loss becomes restricted and may only
ever be recovered against farming income.

A limited partnership loss is further capped by the partner's **at-risk amount**
(s.96(2.2)) for the partnership's fiscal period ending in the year, reduced by
that partner's share of investment tax credits, farm losses and certain resource
expenses.

## Design decisions

**Restriction is modelled as a ceiling, not a warning.** Each pool is clamped to
its own permitted income base. A restricted farm loss cannot be applied against
non-farming income no matter what is requested — over-application is not
possible through the API.

**At-risk is an explicit input.** We do not attempt to derive the at-risk amount
from partnership data we do not hold; it is supplied and used as a hard cap. If
it is absent the limited partnership pool cannot be applied at all, which is the
fail-closed reading.

**Application order.** Non-capital first (it can absorb anything), then farm
(also unrestricted), then the restricted pools against their own bases. Applying
an unrestricted pool before a restricted one preserves the restricted pool for
the only income that can ever use it — the taxpayer-favourable ordering.

**Indefinite carry-forward is not "no expiry tracking".** The limited partnership
pool still accepts an explicit expiry input; the difference is that nothing
expires by default.

## Test matrix

1. Restricted farm loss cannot touch non-farming income.
2. Restricted farm loss applies against farming income, capped by the pool.
3. Farm loss applies against any income.
4. Limited partnership loss capped by the at-risk amount.
5. Limited partnership loss with no at-risk amount supplied ⇒ nothing applied.
6. Limited partnership loss capped by income from that partnership.
7. Ordering: unrestricted pools consumed before restricted ones.
8. All pools carry closing balances forward.
9. Existing non-capital / net-capital behaviour unchanged.
