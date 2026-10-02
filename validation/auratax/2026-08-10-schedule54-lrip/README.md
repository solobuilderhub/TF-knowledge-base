# Schedule 54 — Low Rate Income Pool (LRIP)

**Date captured:** 2026-08-10
**Oracle:** AuraTax (app.auratax.ca), a CRA-certified T2 preparer
**Subject:** T2 Schedule 54, ITA s.89(1) definition of *low rate income pool*
**Status:** completed — schedule **built** from this evidence; **two** defects found in the oracle

Follows directly from
[`2026-08-08-schedule55-part3-1`](../2026-08-08-schedule55-part3-1/README.md),
which established that Part 2 of Schedule 55 takes its excess from *amount A of
Schedule 54* rather than from Schedule 53.

---

## Why this schedule had to be built

Before this, the engine could reach an excessive eligible dividend designation
**only through the general rate income pool** — that is, only for a Canadian-
controlled private corporation.

A corporation that is not a CCPC has no such pool. Its exposure runs the other
way: it carries a **low rate income pool** of income already taxed at low rates,
and it must pay that out as *ordinary* dividends before it may designate anything
as eligible. Designate too early and the excess is the lesser of the pool standing
at that moment and the eligible dividends paid then.

So for every non-CCPC, the engine had **no path to the figure at all** — not a
wrong number, but no number. Schedule 55 Part 2 had nothing to consume.

---

## The form

**Part 1 — the opening pool**

| Line | Meaning |
|---|---|
| 100 | LRIP at the end of the immediately previous tax year |
| 140 | Aggregate investment income for the previous tax year (prior line 440) |
| 150 | **line 140 × 80%** |
| 160 | Investment corporation deduction (prior line 620) **× 4** |
| **190** | **100 + 150 + 160** |

**Part 2 — one row per dividend date** ("complete this part if you paid an
eligible dividend in the tax year")

| Line | Meaning |
|---|---|
| 200 | The date |
| 210 | Dividends receivable before that date, deductible under s.112 |
| 220 | Adjustments for amalgamations, wind-ups, or on ceasing to be a CCPC |
| **230** | **Subtotal (add lines 190, 210, and 220)** |
| 240 | Dividends payable before that date |
| 250 | Excessive eligible dividend designations made before that date |
| **260** | LRIP as of that date — **line 230 minus the total of 240 and 250** |
| 270 | Total eligible dividends paid on that date |
| **280** | Excessive eligible dividend designation — **lesser of 260 and 270** |
| **A** | Total of column 280 → *"Enter amount A at amount C of Schedule 55."* |

**Part 3 — the closing pool**: B = 190; C = 510 + 520; D = B + C; F = 540 + A;
**590 = D − F**, which becomes next year's line 100.

**Part 4** is a worksheet for the adjustment when a corporation ceases to be a
CCPC — a net-asset computation feeding lines 220 and 520. Modelled as a signed
input rather than rebuilt.

Screenshots: `01-schedule54-blank.png`, `03-part1-and-part2-header.png`.

---

## The date-by-date test is the whole point

The pool moves during the year, so the schedule tests **each dividend date
separately**. A corporation that clears its LRIP as ordinary dividends in March
may designate freely in December; one that designates in March cannot. An annual
test would let a December clean-up excuse a March breach — precisely what the
provision exists to prevent.

Line 250 ("designations made before this date") is what chains the rows together.
Our implementation **derives it from the earlier rows** rather than trusting a
hand-entered figure, and orders the rows by date so the chain is real. Where a
preparer supplies a figure that disagrees, both are reported and the supplied one
is used — loudly.

---

## FINDING 1 — the oracle drops line 190 from line 230

Driven live, with Part 1 fully populated:

| Line | Value |
|---|---|
| 100 | 100,000 |
| 140 | 50,000 |
| 150 | 40,000 *(= 140 × 80%, correct)* |
| **190** | **140,000** |
| 210 | 10,000 |
| 220 | (blank) |
| **230** | **10,000** ← should be **150,000** |

The form's own caption for that column reads **"Subtotal (add lines 190, 210, and
220)"**. The product computed 210 alone. It is not that it lacks the figure —
amount B in Part 3 of the same form shows 140,000 correctly. The carry into
Part 2 simply is not made.

---

## FINDING 2 — nothing floors, and the error inverts the closing pool

With 230 understated, everything downstream went negative:

| Line | Value |
|---|---|
| 260 | **−50,000** *(10,000 − 60,000)* |
| 270 | 120,000 |
| 280 | **−50,000** *(as the "lesser of" −50,000 and 120,000)* |
| A | **−50,000** → into Schedule 55 amount C |
| **590** | **190,000** |

Two things are wrong beyond the first defect:

- A **negative excessive eligible dividend designation** is meaningless. The
  "lesser of" test compares a pool balance with a dividend amount; neither can be
  below nil, so the result cannot be either.
- Part 3 *subtracts* amount A, so the negative **inflated the closing pool** from
  140,000 to 190,000. That is the compounding case: the wrong sign does not stay
  in this return, it becomes **next year's opening line 100, 50,000 too high**.

And amount A flows to Schedule 55, where — as the previous session established —
the product also does not floor, producing a negative Part III.1 tax.

Screenshot: `02-negative-cascade.png` (the product renders all three in red).

---

## What we built

`packages/ca-tax/src/t2/schedules/schedule54-lrip.ts`, with both defects
corrected:

- **line 190 carries into line 230**, per the form's own caption;
- **every pool figure floors at nil** — a negative LRIP is not a debt owed to the
  corporation, it is an empty pool;
- **line 250 is derived** from the preceding rows, and rows are date-ordered;
- amount A is surfaced as `totalExcessiveDesignation` and wired into the federal
  engine, so a non-CCPC now reaches Schedule 55 Part 2 and bears Part III.1 tax.

The engine picks the LRIP route when a Schedule 54 is supplied and the GRIP route
otherwise: a corporation cannot be both a CCPC and not one, and only one part of
Schedule 55 applies to it.

17 tests in `packages/ca-tax/tests/t2-lrip.test.ts`, including the exact figures
above as the regression case.

---

## Screenshots

| File | What it proves |
|---|---|
| `01-schedule54-blank.png` | The form — all four parts, every line and caption |
| `02-negative-cascade.png` | **Both defects** — 230 at 10,000 against 190 of 140,000, then 260/280/A all negative in red, and B correctly at 140,000 in Part 3 |
| `03-part1-and-part2-header.png` | The Part 2 column captions, including the "lesser of lines 260 and 270" test |

---

## Method note

Same harness as the previous session; read `research/validation/README.md` first.
Adding a schedule: **Manage schedules** → tick the row → press **east** → **Apply**.

One thing worth knowing: Schedule 54 attaches and renders even on a return whose
corporation type is CCPC, so the pool mechanics can be exercised without setting
up a separate public-corporation return.
