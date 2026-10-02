# research/ — the internal tax knowledge base

**Internal. Not shipped.** `apps/docs` is what the client reads; this is what we
work from. Keep client-facing framing out of here and keep the hard detail in.

The purpose is that a future session — or a developer who has never seen a T2 —
can answer three questions without re-deriving anything:

1. **What does the law actually say?** → `sources/`
2. **What fields does this schedule have, and what is the total algorithm?** →
   `field-maps/`
3. **Why did we implement it this way, and what is still open?** → `findings/`

Plus `validation/`, which is the evidence that someone outside this repo agrees
with us.

## Layout

```
research/
  sources/            ORIGINAL documents, unmodified. The ground truth.
    legislation/      Income Tax Regulations text (s.1100, Schedule III)
    cra-forms/        Blank CRA T2 schedule PDFs, as published
    tra-spec/         Alberta TRA Net File specification, Chapter 3
    tra-test-cases/   Alberta Fall-2025 certification test cases

  field-maps/         LINE-BY-LINE reference: every field, its line number,
                      its formula, and the total algorithm restated
    _raw/             raw captures the maps were built from

  findings/           ANALYSIS: what we concluded, why, and what is open
    federal/          T2 schedules and the Income Tax Act
    alberta/          AT1 schedules and the Alberta Corporate Tax Act

  validation/         EVIDENCE from outside this repo — certified competitors,
                      CRA worked examples. Screenshots and raw captures.
    <source>/<date>-<topic>/

  architecture.md · BUILD-PLAN.md · forms-catalog.md
```

## Where to start for a given task

| Task | Read first |
|---|---|
| Implementing a T2 schedule | `field-maps/` for the line map, then `sources/cra-forms/` for the blank form |
| Implementing an AT1 schedule | `knowledge-base/formulas/at1/<form>.md` — every line's rule verbatim, with its spec page (generated; see `tools/rulebook/`) — then the matching `field-maps/at1-*.md` |
| A number looks wrong | `sources/legislation/` — go to the regulation, not to a summary |
| "Is this in scope?" | `findings/` first; several schedules are deliberately excluded and the reason is recorded |
| Certifying | `sources/tra-test-cases/` — these must reproduce exactly |

## Field maps — the ones that exist

| File | Covers |
|---|---|
| `field-maps/t2-schedule-08-cca.md` | Federal Schedule 8, all 23 columns + the internal allocation table |
| `field-maps/at1-schedule-13-cca.md` | Alberta Schedule 13, all 24 columns + the Schedule 12 carry-forwards |
| `field-maps/at1-schedule-18-dispositions.md` | Alberta Schedule 18, six categories + the ABIL section |
| `field-maps/at1-schedules-12-21.md` | Alberta Schedules 12 and 21 — live-verified; five loss pools, and the do-not-report-agreeing-pairs rule |
| `field-maps/at1-rsi-print-format.md` | The AT1 RSI print layout — the second filing format, certified separately |
| `field-maps/at1-schedules-16-17.md` | Alberta Schedule 16 (SR&ED pool) and 17 (reserves), incl. the S17 total lines and their S12 destinations |

Each states the **total algorithm** in a few lines at the end, because the column
list alone does not tell you how the schedule composes.

**Build a field map for every schedule as you implement it.** The line numbers are
the Net File / CIF payload identifiers and they are not guessable; recovering them
later costs a live session with a certified product.

## Hard-won rules

These cost real time or produced real defects. They generalise.

**Go to the regulation, not to a summary.** The class 13 half-year rule was
implemented from search results and secondary sources, all of which said "the
half-year rule applies to class 13". True — but Reg 1100(2) adjusts the
*undepreciated capital cost*, and Schedule III s.1 tests the deduction against that
adjusted UCC in limb (b) while leaving the prorated portion in limb (a) alone.
Halving the portion, which is what "the half-year rule applies" sounds like,
understates a first-year claim by half. Only the primary text showed this.

**Where a specification's prose and its worked example disagree, follow the
example.** The RSI header section opens by saying the header has three lines, then
describes four, and the sample shows four. Prose miscounts; a worked example is
what the authority actually validates against.

**A live check is worth doing even when the text was right.** Schedules 12 and 21 were transcribed from the specification and then checked on the form. Every line number matched — and the check still paid for itself twice: the form carries an emission rule the text omits (do not report a reconciling pair whose two figures agree), and Schedule 21 has **five** loss continuities where the text reads as two. Confirmation is not the only outcome of verifying; finding what the source never mentioned is the other.

**The live form beats the specification text.** The TRA specification is a PDF; our
copy is extracted text, and the extraction garbles formulas. Two lines in the
Alberta Schedule 13 map were wrong from the text dump and were corrected from the
live form. Where they disagree, the form wins.

**The specification omits things the form states.** AT1 Schedule 18 lines 096 and
098 carry a **× 2** gross-up that appears on the form and not in the specification
text. Without it the s.34.2 amounts are halved twice. That defect shipped and was
only caught by reading the live form.

**Read the footers.** AT1 Schedule 13 says on its face: *"Carry forward the amounts
from lines 023, 025 and 027 to Schedule 12 lines 006, 008 and 004 respectively."*
Only the first of the three was wired up.

**Count the schedules, do not infer them.** Coverage was quoted as "of 22 Alberta
schedules", inferred from the specification numbering running to 21 plus 29. The
real current-year set is **14**. A certified product's own schedule picker settles
it in one screenshot.

**Group figures are not the claimant's figures.** The innovation-grant limit grinds
on the ASSOCIATED GROUP's taxable capital and the spending base aggregates the whole
group's prior years. Computing a member alone overstates the limit and understates
the base — both in the taxpayer's favour, which is the direction that fails an
audit. Alberta's own Test Case 3 is built to catch exactly this, with four members
at four different year-ends.

**Search the documents you already hold before recording a blocker.** The Net File
XSD and the RSI emission rules were both logged as "blocked on obtaining documents
from the authority". Both were already inside the 25,000-line specification in
`sources/tra-spec/` — the schema in full at section 3.3.8, the rules at 3.2.3.
Nobody reads a specification end to end; its table of contents is the cheapest
thing to check, and checking it turned a standing blocker into an afternoon.

**Cross-check a mapping against a second source before trusting it.** A form's
footer said "carry lines 023, 025 and 027 to Schedule 12 lines 006, 008 and 004
respectively". Read quickly that suggests 023 holds the headline figure. It is the
opposite — the destinations are listed out of order. Schedule 12 settles it
independently by stating which source line each of its own lines sums. The first
reading went into a field map and from there into a payload builder, which filed
one total under another's label. **Right label, wrong number is the hardest error
to see on a filed return**, and a second source costs minutes.

**A test that never looks for a thing cannot tell you it is missing.** The Net File
payload emitted only the jacket for months. The per-case certification test passed
throughout, because it asserted the jacket's mandatory lines were present and never
asked whether the supporting schedules were. Passing tests were then read as
evidence the format was complete. When a test guards a *payload*, assert what the
payload must CONTAIN, not merely that the parts you happened to build are well
formed.

**Fail closed — but check which way "closed" is.** Where a figure is required and
absent — an income limit, an at-risk amount, a transitional balance — claim nothing
and raise an issue. A missing limit must never behave as an unlimited one.

The direction is not always obvious. An empty associated group for the innovation
grant has nil taxable capital (so no grind, and the full limit) and a nil base (so
every dollar earns the enhanced rate) — absent data there yields the **largest**
possible claim, not the smallest. Work out which way the missing input pushes the
number before deciding what safe means.

## Fetching from canada.ca

`curl` and `WebFetch` are blocked (403 / connection timeout) even with a browser
user-agent. `fetch()` **from inside a live agent-browser session works**, and that
is how `sources/cra-forms/` and `sources/legislation/` were pulled. Recipe in
`validation/README.md`.

Form PDF URLs follow
`https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/t2sch<N>/t2sch<N>-fill-<YY>e.pdf`,
but the `<YY>` revision differs per schedule and guessing it 404s. Resolve it by
fetching `…/forms-publications/forms/t2sch<N>.html` and reading the PDF links out
of the HTML.
