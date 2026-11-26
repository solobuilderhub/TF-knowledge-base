# forms/ — the form registry

One place that answers, for every form a corporate return can carry: which bucket
is it in, do we hold the primary document, has it been extracted, and is it in
ca-tax. Read `STATUS.md`; it is regenerated from the disk.

```
forms/
  run.py            THE PIPELINE: extract both ways, generate captions, rebuild status
  registry.tsv      the decisions a person makes: one row per form, its bucket
  build-status.py   registry + what is on disk -> STATUS.md   (--check for CI)
  STATUS.md         GENERATED. Never edited.
```

## Why the PDFs are not in bucket folders

The bucket is a decision, and decisions change: a form moves from "later" to
"build now" when a client needs it. A PDF's path is an identifier: it is written
into every generated captions module in ca-tax and read by four tools. Folders
by bucket would make every re-bucketing a rename across two repositories.

So documents stay where their AUTHORITY puts them, which never changes:

```
sources/cra-forms/pdf/   federal T2 forms and the provincial schedules CRA administers
sources/tra-forms/pdf/   Alberta AT1 (its own return, filed with TRA)
sources/rq-forms/pdf/    Quebec CO-17 (its own return, filed with Revenu Quebec)
```

and the bucket lives in one column of `registry.tsv`. `STATUS.md` is the
by-bucket view.

## registry.tsv

| Column | Meaning |
|---|---|
| `form` | CRA's own id (`T2SCH8`, `T661`), or `AT1SCH13`, `CO-17` |
| `authority` | `CRA`, `TRA` or `RQ`: who publishes the form |
| `jurisdiction` | `FED`, or the province the schedule belongs to |
| `category` | `core`, `ccpc`, `common`, `provincial`, `specialized`, `retired` |
| `classification` | `proposed` until someone who knows the client base confirms the bucket |
| `note` | free text |

The provincial bucket and the retired bucket are not judgement: the province
comes from CRA's numbering (300s Newfoundland and Labrador ... 500s Ontario) and
"retired" from CRA marking the form ARCHIVED. The federal buckets (core, ccpc,
common, specialized) ARE judgement and are all `proposed`: they were seeded on
2026-11-26 to match the counts in the team's "T2 Form Inventory & Build Buckets"
sheet (8 / 19 / ...), without the sheet's per-form tab. Reconcile against that
tab and set `confirmed`.

## The chain every form follows

```
CRA's list            sources/cra-forms/catalog/cra-forms-list.json   (what exists, last update)
   |  registry.tsv    (which bucket)
primary document      sources/cra-forms/pdf/<FORM>-<slug>.pdf         tools/fetch-form.sh
   |
extraction            extracted/<stem>.lines.tsv    text layout       tools/extract-lines.py
                      extracted/<stem>.fields.tsv   the form's fields tools/extract-xfa.py
   |
generated captions    ca-tax src/t2/forms/generated/                  tools/generate-captions.py
form definition       ca-tax src/t2/forms/scheduleN.ts                hand-authored
engine                ca-tax src/t2/schedules/scheduleN-*.ts          hand-authored
```

`STATUS.md` has one column per link, so a broken chain shows as a blank cell.

## Two extractions of the same document

`lines.tsv` reads the page as text. `fields.tsv` reads the fillable form's own
field list, where CRA gives every box a caption for screen readers:

    Line 280. Charitable donations closing balance. Amount 1D minus line 260.

The line number, the caption and the arithmetic are attached to the field
itself. On the forms held it finds lines the text extractor misses (Schedule 6:
61 against 12; Schedule 7: 70 against 39; Schedule 3: 35 against 18), and where
both find a line they are an independent check on each other.

It is not complete on its own either: grid cells on Schedules 8, 9, 23, 100 and
125 carry no caption, and three PDFs held are flat (12, 13, 33). A form is
authored from both, and `STATUS.md` shows the counts side by side.

## Keeping it current

1. **Refresh CRA's list** (each filing season, and before a release): see
   `sources/cra-forms/catalog/README.md`. Then `python build-status.py`.
2. **A new form** appears as a defect ("on CRA's list and has no registry row").
   Add the row.
3. **A reprint** appears under "Out of date" (CRA's update date is later than
   the commit that brought our copy in). Move the old copy aside, fetch the new
   one with `sources/cra-forms/tools/fetch-form.sh`, run `python forms/run.py`,
   then `npm run typecheck && npm test` in ca-tax. A new line nobody has
   classified makes its form definition throw and names the line. Commit the
   research change and the ca-tax change together.
4. `python build-status.py --check` exits 1 on any defect.

## Adopted on 2026-11-26

The five reprints CRA issued in October and November 2026 are in `pdf/`, and
ca-tax's captions are regenerated from them:

| Form | Was | Now | What changed |
|---|---|---|---|
| T2 jacket | E (26) | October 2026 reprint | +279, -273, 6 captions |
| Schedule 3 | E (25) | E (26) | +243, 445, 451, 456-459, 570, 580 (suspended dividends); 16 captions |
| Schedule 5 | E (26) | October 2026 reprint | +684, -696, -699 |
| Schedule 7 | E (25) | E (26) | 3 captions |
| Schedule 31 | E (26) | October 2026 reprint | Parts 2 and 10 split into A/B; +386-389, 397, 402, 555 |

The form definitions carry the new lines and the engine computes them:

- Schedule 3 Parts 3 and 4, with suspended dividends: `schedule3-dividends-paid.ts`.
- Schedule 31 Parts 9 and 10, the expenditure limit under both regimes:
  `schedule31-expenditure-limit.ts`; and the 35% rate for an eligible Canadian
  public corporation in `schedule31-sred-itc.ts`.

Each was written from the arithmetic the form prints, and
`tests/t2-2026-reprints.test.ts` in ca-tax works every line by hand.

Still open: Part IV tax on dividends from connected corporations (Schedule 3
columns 250 to 280), the eligible / non-eligible ordering of the dividend
refund, and jacket line 279 (a question that calls for Schedule 52, which is
not built).

## Is a definition complete? `form-coverage`

In ca-tax: `npx tsx scripts/form-coverage.mts`. For every T2 form definition it
lists the lines the definition carries that neither reading of the PDF found,
and the lines the document has that the definition does not.

On 2026-11-26, 12 of 21 definitions match their document exactly (Schedules 1,
3, 4, 7, 24, 31, 33, 43, 50, 53, 55, 141). The rest:

| Form | Gap |
|---|---|
| T2 jacket | 115 document lines not in the definition (114 of 228 carried) |
| Schedule 5 | built for one province's lines; 158 document lines not carried, and 49 definition lines the extractors do not find (Part 1 grid) |
| Schedule 2 | 23 document lines not carried |
| Schedule 21 | 12 document lines not carried |
| Schedule 6 | 8 not carried; line 406 is in the definition and not in the document |
| Schedules 8, 13, 23, 130 | grid forms: most definition lines cannot be found by either extractor and rest on a person having read the page |

"Definition only" on a grid form is not an error by itself, but it is exactly
where a wrong number would hide: Schedule 3 had three captions one column out
until its definition was compared with the field list.

"Out of date" in `STATUS.md` clears once the new PDFs are committed (it compares
CRA's update date with the commit date of our copy).

## What certified products file

CRA's list of certified T2 software, with the services each is certified for:
https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-businesses/corporation-internet-filing/software.html

Read on 2026-11-26. Beyond Corporation Internet Filing itself, nearly every
product is certified for T2 Auto-fill, Attach-a-doc, the authorization request
and T1135; most add T1134 and T106; several add Pre-validate, T2SCH89 and T2054.
That is the realistic companion set, and why T1135 / T1134 / T106 sit in the
"common" bucket.

## Next: T2 rules as data (design, not built)

AT1 has a rule book because TRA publishes one (`PLAN-rulebook-pipeline.md`). T2
has been waiting on CRA's CIF specification. `fields.tsv` removes most of that
wait: the caption of a computed field states its rule in a fixed vocabulary
("Amount 1D minus line 260", "Line 250 plus line 210", "Include this amount on
line 112 of Schedule 1").

Proposed, in this order:

1. **A `cra-xfa` adapter for the rule-book pipeline.** It reads `fields.tsv` and
   emits the same row schema the AT1 adapter does (form, line, caption, rule
   text, references). No new schema.
2. **Parse the fixed phrases into a formula graph**: `plus`, `minus`,
   `multiplied by`, `whichever is less`, and "enter on / include on line N of
   Schedule M" as a cross-form link. Phrases that do not parse stay as text and
   are counted, never guessed.
3. **Check, do not generate.** The engine stays hand-written pure functions. A
   conformance test evaluates each parsed formula on the engine's own output and
   fails where they differ, as `at1-formula-conformance.test.ts` does for AT1.
   The cross-form links are checked against `src/forms/registry.ts`.
4. **Only then** consider a table-driven evaluator for the purely arithmetic
   lines (subtotals, carry-forwards), leaving judgement rules (CCA classes,
   loss ordering, association) in code.

Step 3 is where the value is: every reprint then shows up as a failing test
naming the line, instead of as a filing rejection.
