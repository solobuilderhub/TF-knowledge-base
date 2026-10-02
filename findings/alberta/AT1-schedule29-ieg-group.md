# AT1 Schedule 29 — the associated-group layer for the IEG

**Status:** implemented.
`packages/ca-tax/src/t2/at1/schedules/schedule29-ieg-group.ts`, 14 tests in
`tests/at1-ieg-group.test.ts`, plus 5 certification assertions against Alberta's
own Test Case 3.

**Source:** `../../sources/tra-test-cases/Alberta Test Case 3 - Fall 2025.txt` —
the four-corporation fact pattern below is Alberta's, not invented.

## Why the group layer is not optional

`computeIeg` needs three figures. **Two of them are group figures**, and computing
a member in isolation gets both wrong in the same direction:

| Figure | In isolation | Across the group | Effect |
|---|---|---|---|
| Expenditure limit | no grind at $10M ⇒ full $4,000,000 | ground to $3,000,000 on the group's $20M | limit **overstated** |
| Base level of spending | A's own prior years ⇒ $675,000 | the whole group's ⇒ $965,000 | base **understated**, so the 20% increment is **overstated** |

Both errors run in the taxpayer's favour. That is the direction that fails an
audit, so neither is a benign approximation.

## Which year's figures — the part that is easy to get wrong

Members of a group rarely share a year-end, and Test Case 3 is built precisely to
catch an implementation that assumes they do. Its four corporations have year-ends
in **December, June, September and March**.

**Taxable capital** — each member contributes the figure for its own **last
taxation year ending in the preceding calendar year**. Four members, four different
years' figures, and each is the right one. It is *not* the year ending nearest the
claimant's year-end.

**Base level of spending** — each member contributes the eligible Alberta
expenditures of its own prior two taxation years, whenever those fell.

**The denominator stays 2.** It is the number of prior *years* in the average, not
the number of figures summed. A four-member group divides a sum of **eight**
figures by **two**. Dividing by eight would be the natural mistake and would cut
the base to a quarter, inflating every increment.

## Only Alberta spending counts

The grant is on SR&ED **carried out in Alberta**. Test Case 3 splits this three
ways and each split matters:

- **A** spent $1,500,000 federally, of which **$1,000,000 in Alberta** and $500,000
  in British Columbia. Only the Alberta figure enters.
- **C** has a permanent establishment **only in British Columbia** and still
  contributes its Alberta-attributable spending. Having no Alberta presence does
  not exclude a member.
- **D** does **no SR&ED at all**. It contributes nothing to the base — and still
  contributes its **taxable capital to the grind**. A member that cannot claim the
  grant can still shrink it for everyone else.

## Test Case 3 worked through

| | Taxable capital | Prior yr 1 (AB) | Prior yr 2 (AB) |
|---|---:|---:|---:|
| A (Dec year-end) | 10,000,000 | 750,000 | 600,000 |
| B (Jun year-end) | 3,000,000 | 0 | 500,000 |
| C (Sep year-end) | 5,000,000 | 80,000 | 0 |
| D (Mar year-end) | 2,000,000 | — | — |
| **Group** | **20,000,000** | | **1,930,000** |

```
group taxable capital   = 20,000,000
grind                   = 4,000,000 × (20M − 10M) ÷ (50M − 10M) = 1,000,000
group limit             = 3,000,000

prior-year total        = 1,930,000
base level of spending  = 1,930,000 ÷ 2 = 965,000

A's Alberta spending    = 1,000,000        (within the limit, so uncapped)
  8% × 965,000          =    77,200
  20% × 35,000          =     7,000        (the increment above the base)
A's IEG                 =    84,200        → AT1 line 129
```

Note how small the increment is: A spent $1,000,000 against a base of $965,000, so
only $35,000 earns the 20% rate. Using A's standalone base of $675,000 would put
$325,000 in the increment and overstate the grant by roughly $50,000 — more than
half again.

## Allocating the shared limit

The group may split the ground-down limit as it agrees, and the total cannot exceed
it. `allocateIegExpenditureLimit` **does not silently rescale** an over-allocation —
that would quietly change an agreed split — it caps in the order given and raises
an issue. `allocateIegEvenly` divides evenly and gives the remainder to the first
member so the total is exactly the limit rather than a few dollars short.

`unallocated` is reported rather than assumed claimed, because unallocated limit is
a live planning fact, not an error.

## An empty group produces the MAXIMUM grant, not nil

Worth stating on its own, because it inverts the usual instinct about missing data.

An empty group has **nil taxable capital**, so no grind and the **full $4,000,000
limit**; and a **nil base**, so every dollar spent lands in the **20% increment**
rather than the 8% band. Omitting the group therefore produces the *largest* grant
the rules allow.

That makes "no group supplied" the worst possible default. `computeAlbertaReturn`
claims **nothing** when the group is empty and says which way the failure would
otherwise have run. A group of one is a legitimate input and is how a genuinely
standalone claimant is expressed — passing the claimant itself, always.

The general form of this is worth carrying: **before choosing a fail-closed
default, work out which direction the missing input actually pushes the number.**
Assuming absent data yields a small answer is a guess, and here it is the wrong
one.

## Open

- **Test Case 3 states no allocation agreement** among A, B, C and D, so the
  certification assertion allocates the whole limit to A. This is recorded as an
  assumption on the manifest entry rather than buried in the test. It does not
  affect the answer here — A's $1,000,000 of spending is well under even a
  quarter share — but it would in a case where the limit binds.
- **Confirmed, 2026-09-03 — recomputed, not pro-rated, and the app already does
  this correctly.** TRA's own "Guide to Claiming the Innovation Employment Grant"
  (fetched via `alberta.ca`, `pdftotext -layout` on the retrieved PDF — the
  `open.alberta.ca`-hosted version 403s to both `curl` and `WebFetch`, but the
  `alberta.ca`-hosted guide doesn't) states line 009 exactly: **"the Alberta
  proxy amount is 55 per cent of the salaries and wages used in the calculation
  of the prescribed proxy amount included in the federal expenditures of the
  corporation for the taxation year that were paid in respect of SR&ED carried
  out in Alberta."** That settles the question this note raised — the Alberta
  figure is an independent 55%-of-Alberta-salary computation, not a pro-rated
  share of the federal proxy dollar amount.

  Checked whether this app gets it right: `schedule29-ieg.ts`'s `computeIeg`
  takes a plain `eligibleExpenditures: number` — it never attempts to derive a
  proxy amount from a salary figure itself, by design (same caller-supplies-the-
  aggregate pattern used throughout this codebase). The guided editor
  (`alberta-ieg.ts`) already mirrors the REAL form's own two-line structure —
  `federalProxyAmount` (line 007) and `albertaProxyAmount` (line 009) are
  SEPARATE fields, both at the top level and per-project (AT4970 lines
  111/113) — and `assemble-at1-schedules.ts` passes `albertaProxyAmount`
  straight through (`num(iegInput.albertaProxyAmount)` / `num(p.albertaProxyAmount)`)
  with no pro-ration from `federalProxyAmount` anywhere in the pipeline. So the
  preparer enters the Alberta-recomputed figure directly (per the guide's own
  instruction, same as filling in the paper form), exactly as it should be.
  No code change needed — this was a confirm-before-certifying question, and
  it's now confirmed correct.
