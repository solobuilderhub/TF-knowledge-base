# AuraTax form data vs ca-tax: lines, rules and flows for T2 and AT1

**Date:** 2026-11-27
**Subject:** CRA hasn't sent T2 business rules (there's no equivalent of TRA's Chapter 3 yet). In the
meantime, how does a certified product read the T2 forms, and where does ca-tax disagree with it?
**Source:** the AuraTax desktop app, version 2.3.33 (Windows), compared with `@classytic/ca-tax` 0.0.38.
**Status:** done for line dictionaries and flows. Calculation formulas not yet examined.

This session differs from the earlier ones here. It doesn't drive the browser. It reads the
form data the desktop app ships with: plain JSON files under its install folder, holding every
schedule's lines, validation rules and cross-schedule flows. No code was decompiled.

**Not a primary source.** This is AuraTax's reading of the forms. Nothing in this folder may be
copied into ca-tax, the BE or the FE: line numbers and captions there come only from the
published CRA / TRA document. A disagreement found here is a reason to open that document. On its
own it is never a fix.

## What was checked

1. AuraTax's data was extracted into a readable register: `t2/` (172 schedules, 1,471 rules,
   1,655 flows) and `at1/` (17 schedules, 121 rules, 590 flows).
2. That register was compared line by line with ca-tax's form registry (`compare/`).
3. **AT1 came first, as calibration.** ca-tax's AT1 is TRA-certified, so on AT1 the comparison
   measures AuraTax.
4. **Then T2.** Every disagreement that mattered was checked against the CRA PDF in
   `sources/cra-forms/pdf/`, rendered with `tools/render-lines.py`.

## What was found

### AT1: AuraTax agrees with our certified AT1

- **Line numbers** agree on every schedule both sides define.
- **Captions:** 438 are worded differently, but in style, not meaning. AuraTax uses the
  specification's descriptions ("Capital Cost Allowance for Alberta purposes"); ca-tax uses
  the printed form ("Capital cost allowance — Alberta").
- **Flows from the T2:** 90 agree. AuraTax also routes values through its own working
  amounts, which ca-tax doesn't have.
- **Sch 12 line 083.** AuraTax takes it from T2 line **355**. So does TRA Chapter 3 §3.2.3.13,
  and so does our BE (`TaxFoundry-be/src/engine/assemble-at1-schedules.ts:1489`). The printed
  AT1 form says 335, a known TRA typo, and ca-tax's `from` metadata follows that typo.
- **ca-tax bug, Sch 12 line 002** (`ca-tax/src/t2/at1/forms/schedule12.ts:491`):
  - Its `from` is `{ form: 'T2SCH1', line: '300' }`, but its own note says "Line 300 of the
    T2 jacket". It should name `'T2'`.
  - T2 Schedule 1 has its own line 300 (cash-basis accounts payable), so the registry's
    broken-link test can't catch this.
  - It's metadata only. The FE's generated `schedule12.layout.ts` carries the same link.

**Verdict:** AuraTax's line dictionary and flows are reliable enough to check against.

### T2: ca-tax form definitions that don't match the CRA form

All are `input` lines. None is emitted by the current T2 payload builder (Schedule 21 sends
only its two credit lines), so nothing wrong is filed today. They are wrong in the form
definitions, and therefore in the Form View and any future wiring. In every case below,
AuraTax agreed with the printed page.

| Form | Line | The CRA page says | ca-tax says | Shown in |
|---|---|---|---|---|
| Sch 23 | 025 | Date filed (do not use this area) | Calendar year the agreement applies to | 01 |
| Sch 23 | 050 | Enter the calendar year the agreement applies to | Tax year start | 01 |
| Sch 23 | 075 | Is this an amended agreement … ? (Yes/No) | Tax year end | 01 |
| Sch 23 | 100 | Column 1: Name of associated corporations | Is this an amended agreement…? (flag) | 02 |
| Sch 23 | 200 | Column 2: Business number of associated corporations | Is this agreement intended to replace…? (flag) | 02 |
| Sch 23 | 300 | Column 3: Association code | Are all the associated corporations listed below? (flag) | 02 |
| Sch 21 | 348 | Column 3M: Amount expired in the year | Balance at the end of the previous tax year (that's column 3L, which has no line number) | 03 |
| Sch 21 | 350 | Column 3N: Opening balance (3L minus 3M) | Amount expired in the year | 03 |
| Sch 31 | 903, 913, 933 | Credit to be applied, 3rd previous tax year | "Total of lines 901 to" (the total is unnumbered, 6A); 901, 902, 911… are not defined | 04 |
| Sch 31 | 602 | Column B: Name of eligible trade | "wages11 D or $2,000" | 05 |
| Sch 130 | 022 | Column 2: Partnership account number | "income or included in (column 3 minus column 4" | 06 |
| Sch 130 | 076 | Column 4: Variable J (lesser of column 2 and column 3) | "adjusted taxable income" | 07 |

- **Not a revision difference.** ca-tax's provenance for Sch 23 and Sch 21 names the same
  revision the KB holds (T2 SCH 23 E (19)).
- **Sch 31 and Sch 130 come from our extraction.** Those captions are exactly what
  `sources/cra-forms/extracted/` holds for those lines: `pdftotext` reading a grid page. The
  caption pipeline needs a check for grid pages, and `check-quality.py` should flag captions
  like these.

## What it changed

Nothing yet. These are for the ca-tax owner to fix from the CRA page, not from this folder.

## Screenshots

Each one is a render of the CRA PDF in this repo, not of AuraTax:

| File | PDF | What it proves |
|---|---|---|
| `01-sch23-lines-025-050-075.png` | `pdf/2-basic-ccpc/T2SCH23-associated-business-limit.pdf` p.1 | 025 is the date filed, 050 the calendar year, 075 the amended-agreement question |
| `02-sch23-table-columns-100-400.png` | same, p.1 | 100/200/300/350/400 are the table's columns: name, BN, association code, %, $ |
| `03-sch21-part3-columns-345-360.png` | `pdf/3-common-additions/T2SCH21-foreign-tax-credits.pdf` p.2 | Column 3L has no line number; 348 is amount expired and 350 is opening balance |
| `04-sch31-part6-lines-901-903.png` | `pdf/3-common-additions/T2SCH31-sred-itc.pdf` p.4 | 901–903 are the three years' "credit to be applied"; the total is unnumbered (6A) |
| `05-sch31-part7-columns-601-605.png` | same, p.10 | 602 is "Name of eligible trade" |
| `06-sch130-columns-021-026.png` | `pdf/5-specialized/T2SCH130-eifel.pdf` p.3 | 022 is the partnership account number |
| `07-sch130-columns-073-078.png` | same, p.7 | 076 is variable J |

## Not checked yet

- **17 T2 captions flagged "different meaning?"** that aren't in the table above. They're
  mostly totals worded differently (Sch 7 079/092, Sch 21 180/280, jacket 405).
- **Flows where ca-tax names only the source schedule** and AuraTax names the exact line:
  Sch 1 112/130/416, and jacket 311/313/314/440/565/640/712/720/725/728. These are
  candidates for ca-tax once checked on the form.
- **438 T2 lines that AuraTax defines and ca-tax doesn't yet.** These are coverage, not
  errors.
- **`t2/rates.json`,** AuraTax's rate table, against ours. It contains at least one error of
  its own: Ontario's small business rate is 0.32 for 2020–2022, where it should be 0.032.
- **The calculation formulas.** They aren't in the data but in the app's code
  (`main.*.js`, about 12 MB).

## Contents

| Path | What |
|---|---|
| `t2/`, `at1/` | The register. `README.md` is the index; `schedules/<code>.md` is one page per schedule in form order; `lines.csv` holds every line with the raw rule JSON beside the plain-English gloss; plus `flows.csv` and `rates.json` |
| `compare/` | AuraTax vs ca-tax: `<prog>.md` (summary + items to check), `<prog>-lines.csv` (every line) |
| `ca-tax-forms.json` | ca-tax 0.0.38's form registry, dumped from its built package |
| `screenshots/` | The CRA page renders above |
| `tools/` | The scripts below |

In the register, these columns are the extractor's interpretation:
- **Kind:** `calculated` means AuraTax doesn't let the user type in the line; `AuraTax-only`
  means the line isn't in AuraTax's own line dictionary.
- **Rules:** the plain-English wording.

Everything else is AuraTax's data as shipped.

## Regenerating

From this folder:

```bash
python -I tools/extract.py                        # Windows default install; else add --app <AuraTax folder holding app.asar>
node tools/dump-ca-tax-forms.mjs <built ca-tax>   # e.g. a ca-tax checkout after `npm run build`
python -I tools/compare.py
python -I tools/render-lines.py screenshots ../../../sources/cra-forms/pdf/<category>/<form>.pdf <line>...   # needs pymupdf
```

Rerun after an AuraTax update. The register records the version it was read from.

## How AuraTax stores the rules

The data lives under `resources/app.asar.unpacked/app/assets/fixtures/<program>/`:

- **`specs/`:** the line dictionary, one file per schedule in CRA numbering (200 = T2 jacket).
  Each line has its number, caption, type, length and sign.
- **`extras/`:** AuraTax's layer on top:
  - `_rule` holds the validations: "requires line X", "requires schedule Y", limits, formats
    and sign handling.
  - `_origin` / `_reportOn` hold the flows. A leading `∞` marks a link to the linked return:
    in AT1, `∞001#403` is T2 Schedule 1 line 403.
  - `_disabled` marks calculated lines; `_total` / `_subTotal` mark totals.
- **`refs/`:** the rate table (`calculate-params.json`), schedule dependencies and indexes.
- **The tax UI is an Angular bundle.** The calculations live in its code, not in this data.
