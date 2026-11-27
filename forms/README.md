# forms/ — the form registry

One place that answers, for every form a corporate return can carry: which bucket
is it in, do we hold the primary document, has it been extracted, and is it in
ca-tax. Read `STATUS.md`; it is regenerated from the disk.

```
forms/
  run.py               THE PIPELINE: extract both ways, generate captions, rebuild status
  registry.tsv         the decisions a person makes: one row per form, its bucket
  file-by-category.py  files each form's PDF and extractions into its bucket's folder
  build-status.py      registry + what is on disk -> STATUS.md   (--check for CI)
  STATUS.md            GENERATED. Never edited.
```

## Category folders

Documents stay where their AUTHORITY puts them:

```
sources/cra-forms/pdf/   federal T2 forms and the provincial schedules CRA administers
sources/tra-forms/pdf/   Alberta AT1 (its own return, filed with TRA)
sources/rq-forms/pdf/    Quebec CO-17 (its own return, filed with Revenu Quebec)
```

Inside `sources/cra-forms/pdf/` and `sources/cra-forms/extracted/`, a form is
filed in its bucket's folder (decided 2026-11-26), so a bucket's documents and
their extractions can be read together:

```
pdf/1-core/                extracted/1-core/                core
pdf/2-basic-ccpc/          extracted/2-basic-ccpc/          ccpc
pdf/3-common-additions/    extracted/3-common-additions/    common
pdf/4-provincial/          extracted/4-provincial/          provincial (CRA-administered)
pdf/5-specialized/         extracted/5-specialized/         specialized
```

The folder for each bucket is `CATEGORY_DIRS` in
`sources/cra-forms/tools/formlib.py`. `retired` has none: CRA archived those
forms and none is held. A form whose bucket had no folder would sit at the top
of `pdf/` and `extracted/`.

The bucket is still decided in one column of `registry.tsv`, and the folder
follows it:

- `python forms/file-by-category.py` moves each form's PDF and extracted files
  to the folder its registry row names, with `git mv` so history follows
  (`--dry-run` to preview). Run it after changing a bucket.
- Every tool finds a form in any folder (`formlib.pdf_path`, `extract_path`)
  and writes a form's extractions into the same folder as its PDF.
- `build-status.py --check` reports a PDF or an extracted file in the wrong
  folder as a defect. It follows renames when it dates the copy held, so filing
  a form never hides a stale copy.

What a move costs: a PDF's path is written into ca-tax. Each generated captions
module cites it as `Source:`, and some hand-authored modules cite it in
comments. After filing forms, regenerate their captions
(`python forms/run.py <FORM>`) and update those citations, in one ca-tax change.

`STATUS.md` is the by-bucket view of everything.

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
common, specialized) ARE judgement: they were seeded on 2026-11-26 to match the
counts in the team's "T2 Form Inventory & Build Buckets" sheet (8 / 19 / ...),
without the sheet's per-form tab.

The same day, core and ccpc were reconciled against the sheet's "Forms" tab and
set `confirmed`. That moved Schedule 5 into core; Schedule 101 into ccpc; T2054,
Schedules 54, 88 and 89 into ccpc; and Schedules 44, 49, 55 (to common) and 28
(to specialized) out of it.

Then common, provincial and specialized were reconciled the same way:
- T1134 and Schedules 25, 43, 71, 72 and 130 went from common to specialized.
- T2057 and Schedule 19 went from specialized to common.
- RC312 (common) and RC3133 (specialized) were added.

The sheet's Schedules 10, 63, 65 and 390 stay `retired`, because CRA marks them ARCHIVED. Its T666 (BC SR&ED) has no row, because it is not on CRA's forms list.

Still `proposed`, because the sheet does not list them: T1174, Schedule 37, T2002, and provincial Schedules 320, 343, 345, 392, 426, 504, 517 and 552.

## The chain every form follows

```
CRA's list            sources/cra-forms/catalog/cra-forms-list.json   (what exists, last update)
   |  registry.tsv    (which bucket)
primary document      sources/cra-forms/pdf/[<category>/]<FORM>-<slug>.pdf   tools/fetch-form.sh
   |
extraction            extracted/[<category>/]<stem>.lines.tsv    text layout       tools/extract-lines.py
                      extracted/[<category>/]<stem>.fields.tsv   the form's fields tools/extract-xfa.py
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

Also rebuilt from the forms on 2026-11-26: Part IV tax on dividends from
connected corporations, the two RDTOH pools and the dividend refund
(`schedule3-part4-rdtoh.ts`, from Schedule 3 Parts 1 and 2 and page 7 of the
T2 return). The refund is now split by pool, and last year's refund comes off
the opening balances.

Still open: Schedule 52 (which jacket line 279 calls for), and Schedule 43's
amounts 4A, 4C and 4D feeding Part IV, which the engine takes as inputs.

## Is a definition complete? `form-coverage`

In ca-tax: `npx tsx scripts/form-coverage.mts`, and the same comparison runs as
`tests/t2-form-coverage.test.ts` on every `npm test`. For every T2 form
definition:

- a line the definition carries whose number is printed nowhere in the document
  FAILS (a wrong number, with certainty);
- a box the form's field list has that the definition does not carry FAILS,
  unless excused with a reason in the test.

As of 2026-11-26 all 21 definitions pass. Getting there removed two wrong line
numbers (jacket 425, Schedule 6 406), corrected three Schedule 3 captions that
were one column out, and took the T2 jacket from 114 lines to all 223.

Grid forms (Schedules 8, 13, 23, 130) carry lines neither extractor pairs with
a caption, because the numbers are column headings. The check confirms every
one of those numbers is printed in the document; it cannot confirm the caption
beside it. That part still rests on a person having read the page.

A definition is completed with `completeFromFieldList` (ca-tax,
`src/forms/build.ts`): the lines nobody typed come from the form's own field
list, with the section decided by the part they are printed under.

## T2 rules as data

`src/forms/rules.ts` in ca-tax parses the arithmetic CRA states in each box's
description into a formula ("Amount 1D minus line 260", "Total of lines 350 to
370", "Amount 2B or 2C, whichever is less") and into carries between forms
("Enter this amount on line 313 of the T2 return"). `tests/t2-line-rules.test.ts`
uses it three ways:

1. **The documents against themselves**: no rule refers to a line its own form
   does not have.
2. **The definitions against the documents**: a carry the form states lands on
   a line the destination definition has, and a hand-authored `to` link agrees
   with the one the form states.
3. **The engine against the document**: Schedule 3 lines 460, 465 and 470 from
   the engine equal what the form's formulas give.

It reads 79 of the 185 descriptions that state arithmetic (43%). What it does
not read is mostly a multiplication by a rate or a prose condition; those stay
as text and are counted, never guessed.

One thing it found in CRA's own documents: Schedule 2 E (23) still sends the
gifts-of-medicine deduction to line 315 of the T2 return, and the 2026 jacket
has no line 315.

Since then the check follows the lettered subtotals too (the generated
captions export each form's lettered amounts), and
`tests/t2-engine-against-forms.test.ts` in ca-tax runs the engine against the
forms for Schedule 2 (line 280 and amount 1D) and Schedule 53 (lines 490 and
590). Its first run found that line 590 was being filed after the year's
eligible dividends instead of before them.

Schedules now checked against the engine: 2, 3, 4, 7 and 53. What each run
found:

| Schedule | Lines checked | Found |
|---|---|---|
| 3 | 460, 465, 470 | agrees |
| 2 | 280, amount 1D | agrees |
| 53 | 490, 590 | **590 was filed after the year's eligible dividends** |
| 4 | amount 1M, line 110 | **a loss created by section 112 dividends was never carried forward** |
| 7 | 092, 745 | agrees |

The parser reads 81 of the 185 line descriptions that state arithmetic, and
227 of the 330 lettered amounts that do (69%); the lettered amounts are where
most of each form's arithmetic is written.

**To add a schedule**: hand `evaluateFromRules` the figures the engine was
given, by line number or amount letter; pin any figure the form computes with a
rate (those are not parsed); name the line the engine's result corresponds to;
assert they are equal. Schedule 1 and Schedule 8 cannot be done this way:
Schedule 1's descriptions state no arithmetic, and Schedule 8 is a grid whose
cells have no description. They need a rendered-page reading instead.

The rule-book adapter (emitting these rules in the AT1 rule-book row schema, so
`knowledge-base/formulas/t2/<form>.md` exists like the AT1 pages) is not built.

## Provincial schedules

All 81 current provincial and territorial schedules CRA administers are held in
`sources/cra-forms/pdf/4-provincial/` and extracted (lines and fields), alongside Alberta's
AT1 and Quebec's CO-17. They are not built in ca-tax: `generate-captions.py`
emits caption modules only for the core, CCPC and common buckets, so a
provincial form gets its module the day its registry row is moved.

Each province has one "corporation tax calculation" schedule that the rest
feed (Ontario 500, British Columbia 427, Manitoba 383, Saskatchewan 411, Nova
Scotia 346, New Brunswick 366, Newfoundland and Labrador 307, Prince Edward
Island 322, Yukon 443, Northwest Territories 461, Nunavut 481). Start a
province there. Schedule 5 Part 2 is where each one lands, and its definition
now carries every Part 2 line.

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

