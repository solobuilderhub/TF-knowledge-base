# AT1 Schedule 20 — Alberta Charitable Donations & Gifts Deduction

**Research note · source: `AT1-Chapter3-2025.2-full.txt` §3.2.3.20, line codes read directly**

## Shape: a continuity pool, not a percentage limit

The federal Schedule 2 applies a 75%-of-net-income cap. **Alberta's Schedule 20
does not.** It is a continuity schedule whose claim is capped by an income
figure carried from AT1 Schedule 12 — a different mechanism, and modelling it as
a federal-style percentage would be wrong.

## Line map

| Code | Line | Effect |
|---|---|---|
| 020062 | Gifts balance at the end of the prior year | opening |
| 020064 | Deduct: gifts expired | − |
| 020068 | Add: gifts transferred on amalgamation / wind-up | + |
| 020070 | Add: total current year gifts made | + |
| 020073 | Deduct: adjustment for an acquisition of control (donations after 2004-03-22) | − |
| 020076 | Deduct: amount applied against taxable income | − (capped) |
| 020078 | Gifts closing balance | = |

Closing (020078) is specified exactly:

```
020078 = 020062 − 020064 + 020068 + 020070 − 020073 − 020076
```

## The cap on the claim (020076)

> *"Value cannot exceed the lesser of: 020062 − 020064 + 020068 + 020070 − 020073;
> or 012054 − 012056."*

Two ceilings:

1. **The pool itself** — you cannot claim more than is available.
2. **`012054 − 012056`** — an income figure from AT1 Schedule 12 (Alberta income
   / loss reconciliation).

Schedule 12 is implemented, but exposing those two specific lines is a separate
piece of work. We take the income ceiling as an explicit input
(`incomeLimit`) rather than reaching into Schedule 12 — and, since a missing
ceiling must not become an unlimited claim, an absent value means **nothing may
be claimed**. Fail closed.

## Federal-difference fields (020090–020100)

The carryforward detail by year of origin is reported per gift class —
charitable, gifts to Canada/a province, certified cultural property, ecologically
sensitive land, gifts of medicine. Each carries the same rule:

> *"If the Alberta amount differs from the federal amount, then enter the Alberta
> amount. Otherwise, the value equals the federal amount."*

So the Alberta figures **default to the federal ones** and are only entered when
they diverge. That default is the behaviour to implement; it is not optional
convenience.

## Test matrix

1. Opening only, nothing claimed ⇒ closing equals opening.
2. Current-year gifts increase the pool.
3. Expiry and acquisition-of-control adjustments reduce it.
4. Transfers on amalgamation increase it.
5. Claim capped by the pool.
6. Claim capped by the income ceiling.
7. Income ceiling absent ⇒ nothing claimed, issue raised.
8. Blank claim ⇒ claim the maximum both ceilings allow.
9. Closing balance matches the specified arithmetic exactly.
10. Alberta carryforward figures default to the federal ones when not entered.
