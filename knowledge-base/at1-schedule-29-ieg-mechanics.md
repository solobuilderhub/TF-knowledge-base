# AT1 Schedule 29 — the Innovation Employment Grant, in full

**Why this document exists.** The engine and UI were built from only 2 of the
form's 3 pages (page 2 and page 3 — page 1 was never rendered or read). This
went unnoticed because nothing in the test suite compared output against a
real, TRA-published worked example — every number was internally consistent
with itself, not with the form. Two things fixed that: TRA's official
["Guide to Claiming the Innovation Employment Grant"](https://www.alberta.ca/system/files/custom_downloaded_images/tra-guide-claiming-the-innovation-employment-grant.pdf)
(`research/sources/tra-guides/`) has two **fully worked examples with real
answer figures** (Examples 3 and 4 — the same fact patterns TRA's Fall 2026
Test Cases 2 and 3 are built from), and TRA's own re-certification email named
the exact gap (federal T661 line 557 vs 559). Screenshots of every page cited
below are in `research/knowledge-base/screenshots/`.

Every number in this document has been checked against the official
worked examples, not derived from first principles. Where a figure below
says "✓ verified", it matches the Guide's own filled-in form exactly.

---

## The whole picture: 3 pages + 1 attachment, not 2 pages

| Page | What it computes | Status before this fix |
|---|---|---|
| **Page 1** — Eligible Expenditures (lines 001–040) | Derives the "eligible expenditures" figure from federal T661, in 6 steps | **Never built.** The engine took `eligibleExpenditures` as a bare input; the real form derives it. |
| **Page 2** — Maximum Expenditure Limit + Grant Calculation (100–134) | The credit itself: 8% base rate, 12% enhanced rate (two different formulas depending on associated/not) | Built, and the core math (110/112/125/126/128/130/134) is verified correct. |
| **Page 3** — Agreement Among Associated Corporations (200–325) | Splits the shared $4M pool and the "Allowed Amount" among associated members | Built, and verified correct **except** two bugs (below). |
| **AT4970 attachment** — Listing of IEG Projects (101–170) | Per-project breakdown of Alberta vs. other-province SR&ED spending, feeding page 1 | **Never built. Not even known about.** |

---

## Page 1 — Eligible Expenditures for IEG Purposes

```
001  (For Department Use — a stamp box near Legal Name/CAN, no caption or formula, not
     a preparer-entered field)
003  Federal amount of qualified/current SR&ED expenditures on line 559/557 of federal T661
005  Portion of line 559/557 carried out in Alberta
007  Deduct: federal prescribed proxy amount (if any) included in the Alberta portion of 559/557
009  Add: Alberta proxy amount
011  Add: IEG that reduced the federal expenditure in 559/557 IN THE TAXATION YEAR
025  Add: Alberta portion of any repayment of government assistance (other than an IEG) OR
     A CONTRACT PAYMENT made in the taxation year that relates to amounts included in line 005
     above made in the taxation year OR ANY PRECEDING TAXATION YEAR (portion of line 560 of
     federal T661 that relates to Alberta, other than an IEG)
031  TOTAL: Eligible Expenditures for Alberta Purposes = 005 − 007 + 009 + 011 + 025
040  Primary field of science or technology (code 1–4: natural/formal, engineering/tech,
     medical/health, agricultural sciences)
```

> **Line 025 has two independent triggers, not one**: (a) a repayment of
> government assistance other than an IEG, **or** (b) a contract payment —
> and both can relate to amounts from the current year **or any preceding
> taxation year**, not just the current year. An earlier draft of this
> document compressed this to "repayment of government assistance" only,
> which would miscode a contract-payment trigger and any prior-year-related
> amount. Neither trigger is exercised by TC1/TC2/TC3's given facts (no
> repayments or contract payments mentioned), so 025 = 0 for all three, but
> the UI/engine field should still model both triggers, not just one.

**031 is what the engine currently calls `eligibleExpenditures` / `currentYearExpenditures`.**
It is not a bare input — it is *derived*, and 005/007/009 come straight off the
AT4970 attachment's totals row (below).

### The T661 line 557/559 transition rule (the CRA email's headline change)

> For taxation years ending **before December 16, 2024**: use federal T661
> line **559** (qualified SR&ED expenditures).
> For taxation years ending **after December 15, 2024**: use federal T661
> line **557** (current SR&ED expenditures) instead.

This is a **date-gated switch in which federal figure feeds line 003/005**,
not a new field. All three Fall 2026 test cases have year-ends after
2024-12-15, so all three use **line 557**. TC1's year-end is 2025-08-31 — also
past the cutover.

### The "Step 1 / Step 2" columns in the Guide are NOT two form fields

The Guide's sample pages show every page-1 line as `Step 1 / Step 2` to
illustrate that reporting either (a) the federal figures **before** deducting
the current year's own IEG as government assistance, or (b) the figures
**after** that deduction with line 011 adding the IEG back — arrive at the
same **031**. Confirmed on both worked examples: Step 1 and Step 2 give
identical 031 (400,000 in Example 3, 1,000,000 in Example 4 — see below).
**Only one set of numbers is filed.** Every test case's own wording ("before
deducting the IEG as provincial government assistance on federal line 513")
tells you which set: the **pre-deduction (Step 1)** figures, meaning **line
011 is 0** for a first-time current-year claim. Do not build a literal
two-pass iteration — just use the pre-deduction federal figures directly.

---

## AT4970 — Listing of Innovation Employment Grant Projects (a separate attachment)

One row **per Alberta SR&ED project**:

```
101  Project title (same as federal T661 Part 2 line 200)
103  Project code (federal T661 line 206)
105  Portion of federal T661 line 559/557 incurred in Alberta, per project, BEFORE IEG
107  Portion of federal T661 line 559/557 NOT carried out in Alberta, per project
109  Total salaries and wages paid re: SR&ED carried out in Alberta, per project
111  Total prescribed proxy amount included in the Alberta portion of 559/557 (if claimed federally)
113  Alberta proxy amount for each project (if 111 applies)
```

Plus a jurisdiction-breakdown table (135–161, one line per province/territory,
label "Amount Incurred") and a grand total (**170**).

**The TOTAL row's 105/107/111/113 feed Schedule 29 page 1's 005/007/009**
directly (confirmed: Example 3's AT4970 total 105=400,000 → Sch29 005=400,000;
111=55,000 → Sch29 007=55,000; 113=55,000 → Sch29 009=55,000).

This is a genuinely separate NetFile schedule (AuraTax lists it as attachment
`4970`, not part of `029`) — it needs its own `scheduleId`.

> **Note on the CRA email's "AT1 Lines 101, 103, and 105 are now mandatory"**
> — these are almost certainly **AT4970's** 101/103/105 (project
> title/code/Alberta-portion), not Schedule 29's or the jacket's. The jacket
> already has its own, unrelated 101/103/105 (certification date / phone /
> email) which the generated captions already mark mandatory — worth
> double-checking against the actual updated Chapter 3 spec once obtained
> (not yet in this repo — the CRA email says it was attached; ask for a copy).

---

## Page 2 — Maximum Expenditure Limit + Grant Calculation

```
100  Associated with one or more corporations for IEG purposes? (Yes/No) — if Yes, complete page 3
102  If associated: allocated expenditure limit, TRANSCRIBED from this corporation's own
     line 240 on page 3 (row 1, the claimant)
104  If NOT associated: $4,000,000 × (days in tax year / 365, or 366 incl. Feb 29)
108  Maximum expenditure limit for the year = 102 or 104, as applicable

110  Part I (8%, both associated and non-associated) = (lesser of 031, 108) × 8%

Part II (12%) — TWO DIFFERENT FORMULAS, never both:
112  (a) NON-associated = ((lesser of 031, 108) − Base Amount from 118) × 12%
       114  Eligible expenditures, first preceding year (THIS corporation's own — no group)
       116  Eligible expenditures, second preceding year (THIS corporation's own)
       118  Base amount = average of 114 + 116
       ^ 114/116/118 are used ONLY when NOT associated. An associated corporation
         leaves them BLANK — confirmed on both worked examples.
125  (b) ASSOCIATED = (lesser of 108, allocated allowed amount from line 325) × 12%
       No base amount at all. A different formula, not a variant.

126  Taxable capital — if associated, = Σ every member's line 265 on page 3 (= page 3's
     line 300, verified: Example 3 → 126=25,000,000=300; Example 4 → 126=20,000,000=300).
     If NOT associated, = this corporation's own taxable capital, one figure, no aggregation.
128  Reduction factor = ((40,000,000 − (126 − 10,000,000)) / 40,000,000), floor 1 at TC ≤ $10M
130  IEG before recapture = (110 + (112 or 125)) × 128   [sum FIRST, then multiply]
132  Recapture (IEG-funded property sold / converted to commercial use)
134  NET IEG = 130 − 132 → AT1 jacket, line 129
```

### ⚠️ Correction to a prior finding this session

An earlier pass this session flagged a discrepancy between the live Schedule
29 form ("sum 110+112, then multiply by 128") and TRA's Chapter 3 spec text
("multiply only 112 by 128"), and recommended asking TRA directly. **Both
worked examples in TRA's own Guide confirm the form's own reading is
correct**: Example 3 → 130 = (32,000+18,000)×0.625 = 31,250 ✓; Example 4 →
130 = (80,000+39,000)×0.75 = 89,250 ✓. Sum-then-multiply is right. Still
worth mentioning to TRA that Chapter 3's business-rule text is stale, but
it is **not** a live risk to the filed dollar figure.

### The pre-existing "group base amount" concept does not exist on the real form — confirm before keeping it

The engine (built in an earlier session, before this one) has a
`computeIegGroupFigures` function that **aggregates the whole associated
group's prior-two-years spending into one shared base amount**, used
regardless of associated/non-associated status. **This concept is not on the
form.** For a non-associated corporation, the base amount (118) is that
corporation's own two prior years, full stop — no group. For an associated
corporation, there is no base-amount box at all; 125 replaces the whole
mechanism with the Agreement's Allowed Amount. There is no scenario on the
real form where a "group" contributes to a shared base amount. This appears
to be a modelling error inherited from before this session, not something
introduced this session — flagging for a decision before the rebuild removes
or repurposes it.

---

## Page 3 — Agreement Among Associated Corporations

Header (once per agreement):

```
200  CAN of the associated member with the LONGEST taxation year
202  That member's own tax year begin
204  That member's own tax year end
206  Days in that longest year (max 365, 366 if includes Feb 29)
208  Maximum Expenditure Limit = $4,000,000 × (206 / 365)
```

Per member, claimant first:

```
220  Federal Business Number (FBN) — NOT a name field; there is no name line at all
230  Alberta CAN
235  This member's own current taxation year end (that ended within the CALENDAR year
     of the claiming corporation — i.e. same calendar year, not necessarily same period)
240  Allocated expenditure limit (agreed share of the $4M pool) — row 1's value is what
     gets transcribed to page 2 line 102
245  Current year's eligible expenditures (this member's own)
250  Eligible expenditures, first preceding year (this member's own)
260  Eligible expenditures, second preceding year (this member's own)
265  Taxable capital, first preceding year (this member's own)
267  Individual corporation maximum allowed amount = 245 − [(250 + 260) / 2]
268  Allocated allowed amount = LEAST of: 240, 267, and the lesser of
     [(4,000,000 × days-in-THIS-member's-own-tax-year / 365 or 366) or line 031] less base
```

Totals:

```
270  Σ 240   (must not exceed 208)
275  Σ 245   ("X")
280  Σ 250   ("Y")
290  Σ 260   ("Z")
300  Σ 265
310  Group Allowed Amount = 275 − (280 + 290) / 2  =  X − (Y+Z)/2
320  Σ 268   (must not exceed 310)
325  The CLAIMING corporation's own 268, restated — feeds page 2 line 125
```

### ⚠️ Two real bugs found by comparing against the official worked example

**Bug 1 — line 267 must NOT be floored at zero.** The engine currently does
`Math.max(0, currentYearExpenditures - base)` for 267. The official Example 4
shows a member with 267 = **−50,000**, printed as a negative number
(`(50,000)`) — not floored. Only **268** is floored at zero ("cannot allocate
a negative amount" — Note 8 on the official form). Fix: let 267 go negative;
compute 268 = `Math.max(0, Math.min(240, 267, dayProratedComponent))`.

**Bug 2 — a member with no Alberta permanent establishment gets 268 = 0,
full stop, regardless of what the formula computes.** Example 4's Corporation
C has a *positive* 267 = 60,000 (matches this project's own earlier hand-
calculation exactly) — but TRA's own official note (Note 9) is explicit:

> "Allocated amount to CAN 7777888899 is 0 as corporation does not have a
> permanent establishment in Alberta and is therefore not eligible for the
> IEG. **However, even though the corporation does not have a permanent
> establishment in Alberta, its eligible expenditures are still included in
> the calculation of line 310.**"

So a member's raw 245/250/260/265 figures **always** count toward the group
totals (275/280/290/300/310), but their own 268 is **forced to 0** unless
they have an Alberta PE. This is a genuinely new qualifying condition — the
engine's `IegAgreementMember` needs a `hasAlbertaPermanentEstablishment`
field (or equivalent), defaulting to a fail-closed `false`/unknown rather
than assuming every member qualifies. TaxFoundry's own TC3-fact-pattern test
already has this exact case (Corporation C, BC-only PE) and was passing with
the WRONG allocated amount (60,000 instead of 0) before this correction.

---

## Verified worked examples (ground truth — use these for regression tests)

### Example 3 (→ basis for Fall 2026 Test Case 2)

Qualified corp: 400,000 Alberta / 600,000 Ontario current year (of 1,000,000
total), 300,000 / 200,000 prior two years, TC $12M. Associated corp: 400,000 /
150,000 / 100,000, TC $13M. Allocated 240 = 3,000,000 (claimant) / 1,000,000.

| Line | Value | Line | Value |
|---|---|---|---|
| 031 | 400,000 | 267 (claimant) | 150,000 |
| 108 | 3,000,000 | 268 (claimant) | 150,000 |
| 110 | 32,000 | 300 (=126) | 25,000,000 |
| 125 | 18,000 | 310 | 425,000 |
| 128 | 0.625 | 320 | 425,000 |
| 130 | 31,250 | 325 | 150,000 |
| **134 (NET IEG)** | **31,250** | | |

### Example 4 (→ basis for Fall 2026 Test Case 3 — same A/B/C/D fact pattern
### TaxFoundry's own tests already use, one year later)

Corp A (claimant, TC $10M): 1,000,000 Alberta current year, 750,000 / 600,000
prior two years. Allocated 240 = 3,000,000.
Corp B (Alberta PE, TC $3M): 200,000 / 0 / 500,000.
Corp C (**BC PE only**, TC $5M): 100,000 / 80,000 / 0 — **267 = 60,000 but
268 = 0, no Alberta PE**.
Corp D (Ontario PE only, TC $2M): no SR&ED at all — 267 = 0, 268 = 0.

| Line | Value | Line | Value |
|---|---|---|---|
| 031 | 1,000,000 | 267 (B) | −50,000 → 268 = 0 |
| 108 | 3,000,000 | 267 (C) | 60,000 → 268 = 0 (no AB PE) |
| 110 | 80,000 | 300 (=126) | 20,000,000 |
| 125 | 39,000 | 310 | 335,000 |
| 128 | 0.75 | 320 | 325,000 (only A's 268 counts) |
| 130 | 89,250 | 325 | 325,000 |
| **134 (NET IEG)** | **89,250** | | |

---

## Independent verification (2026-08-29)

A separate multi-agent pass re-rendered every page above from the primary
PDFs, blind to this document, then compared. Result: every substantive claim
confirmed exactly — both page-3 bugs, the base-amount-doesn't-exist-when-
associated finding, all AT4970 fields and both worked examples' numbers cell
for cell. Two corrections applied above (025's full trigger conditions;
field 001 noted). Full reports: see the workflow run, or re-derive by
re-rendering the cited pages.

A completeness sweep of the full 32-page Guide additionally surfaced:

- **Amended returns: not mentioned anywhere in this Guide** (zero
  occurrences of "amend" in 32 pages). Not a blocker for TC1/TC1-AMENDED,
  though — **confirmed TC1 and TC1-AMENDED never mention Schedule 29 or IEG
  at all** (grepped both test case documents). TC1's amended-return mechanic
  is a general AT1 resubmission concern (a different current-year loss
  figure), unrelated to IEG. No action needed here before the rebuild.
- **Line 132 (Recapture) mechanics are deferred to a separate document**
  (Information Circular IEG-1, not in this repo). Not exercised by any of
  TC1/TC2/TC3's given facts (no property sold/converted in any test case) —
  keep as an optional input-only field, same as already built, and defer the
  full computation until a real case needs it.
- **A corporation not associated for IEG purposes but associated under
  federal T2 Schedule 9** must still populate column 265 (taxable capital)
  for each SCH9-associated corp, per notes on lines 100/126. Not exercised by
  TC2/TC3's given facts (both describe direct IEG-association), so not
  blocking — but worth a code comment flagging the nuance for a future case.

## What still needs the actual TRA documents (not yet in this repo)

- **The updated Chapter 3 spec** — CRA's email says it was attached; only the
  old `AT1-Chapter3-2025.2-full.txt` exists in `research/sources/tra-spec/`.
  Needed to confirm the Section 3.3.14 error-message additions and the exact
  103/international-phone format change (which schedule's 103 — jacket or
  AT4970 — and the new length/pattern; the jacket's own 101/103/105 are
  already marked mandatory in the generated captions, so this may already be
  covered, but the phone-format pattern itself isn't confirmed anywhere yet).
- Whichever schedule the user meant by "schedule 0 doesn't match AuraTax" —
  no concrete evidence gathered yet; needs either a fresh AuraTax capture or
  the specific comparison notes. Possibly this concern is now explained by
  everything above (comparing an 80%-incomplete Schedule 29 against
  AuraTax's full rendering would look completely alien) rather than being a
  separate, additional jacket-specific bug — but not confirmed either way.
