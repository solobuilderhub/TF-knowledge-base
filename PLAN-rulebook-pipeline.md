# Plan — the rule-book pipeline (formulas, form by form)

**Status: BUILT for AT1 (2026-09-30).** Operating guide: `research/tools/rulebook/README.md`. T2 awaits the CIF specification.

> **As built, differs from the design below:**
>
> - The data is `packages/ca-tax/spec/at1/forms/<form>.json`, one file per form and one row per
>   line, not one `rules.json`. It lives in ca-tax's **private** repository.
> - The renderer is `scripts/rulebook/render.ts` in ca-tax.
> - **No rule text ships**: the spec is "Protected A", the npm package is public, and so are the
>   server and web repositories. The shipped module is structure only, and server tests read the
>   rules from the private checkout.

**Goal.** Every line of every form has its business rule available, verbatim, with the page
it came from, in an organized place: `research/knowledge-base/formulas/<ruleset>/`. The rule
is also available as data the engine and tests can check against, so an agent building a
form reads it from there instead of grepping a 15,000-line text dump. AT1 (TRA Chapter 3)
comes first; the same pipeline takes T2 when we have CRA's rule book.

## What research found (2026-09-30)

- **Source.** `research/sources/tra-spec/AT1-Chapter3-2026.4.pdf` has 286 pages, with §3.2.3
  cross-reference tables for the jacket and every schedule. Page ranges: S000 pp. 17–40,
  S012 102–119, S015 134–169, S021 199–219, S029 220–231, and so on. The tables also cover
  the legacy schedules 5–9, 11 and 14, which we tag and do not implement (see
  `evidence/at1-schedule-universe/`).
- **The layout is column-stable per page** (landscape, 792×612). Each page repeats its own
  header, so every column's x is read from that page, never assumed:
  - code at x≈38;
  - line name ≈109–245;
  - type ≈251;
  - length ≈290;
  - `+/-` ≈337;
  - M/O/X ≈374;
  - **Business Rules ≈400–545**;
  - Map / QUAL / LOOP / Pos, which are empty on every table page that matters.
- **A rule's text can cross a page break.** It continues above the next page's first code
  (for example, S21 line 021's rule ends at the top of p. 201), so the continuation belongs to
  the previous row.
- **Glyphs.** PyMuPDF reads them correctly (`¾` = U+00BE in S14's formula); `pdftotext`
  turns them into `�`. That is one more reason the text dump is not a source.
- **Rule vocabulary**, from counts over the whole document:
  - 92 explicit formulas, `Value = …`;
  - 197 constraints: `cannot exceed`, `cannot be less than`, `must equal`;
  - 505 federal references, `fed 004100`, and `fed 1001060` for the four-digit
    GIFI-style forms 100/101/125/140;
  - Alberta references as `SSSFFF` or `SSSFFFOOO` (`021031`, `001043003`);
  - section headers with their own condition (`CNCL`, `PQRABIL`, …).
- **What already exists and gets reused:**
  - `tools/extract-at1-schedule-rows.py` already locates rows, M/O/X, type and conditional
    sections by word position; it emits only M/O/X and type (`at1-spec-rows.ts`).
  - The CRA forms pipeline (`sources/cra-forms/tools`: PDF → `lines.tsv` → captions) is the
    T2 form-caption side. Its README records that canada.ca must be fetched by hand.
  - The drift-test convention (`apps/web/tests/forms-drift.test.ts`): generated files are
    checked in, and a test fails if they go stale.
- **T2's rule book is not in the repo.** CRA's equivalent of Chapter 3 is the T2
  Corporation Internet Filing (CIF) specification, issued to registered software
  developers. It has a different shape from Chapter 3, which is why the design separates the
  source-specific *adapter* from the shared *schema*.

## Design

### One schema, many sources

A **ruleset** is one versioned source document, for example `at1-tra-ch3-2026.4` and later
`t2-cra-cif-<version>`. Every row, whatever the source, normalizes to:

```jsonc
{
  "form": "021",                 // the source's own form id
  "line": "037",                 // printed line / field code
  "name": "Non-Capital Losses - Add: Current year loss",
  "type": "$", "length": "1/13", "sign": "+",
  "requirement": "M",            // M / O / X, as printed
  "section": "CNCL",             // conditional section, when inside one
  "rule": "Value = 021021 x (-1).",          // VERBATIM, whitespace-normalized only
  "kinds": ["formula"],          // formula | default-to-federal | constraint | existence | text
  "refs": {                      // parsed out of `rule`, never instead of it
    "own":     ["021021"],
    "federal": [],
    "jacket":  []
  },
  "expr": "-(021021)",           // ONLY when the rule is a pure arithmetic formula; else absent
  "page": { "pdf": 201, "printed": "3-201" },
  "status": "current"            // current | legacy (S5–S9, S11, S14, S12 010–013)
}
```

The rule text is the authority. `kinds`, `refs` and `expr` are derived conveniences, and
any rule the parser cannot classify is kept with `kinds: ["text"]`, never dropped.

### Stages

```
sources/<source>/<doc>.pdf            1 SOURCE   checked in, never modified; sha256 recorded
        │  adapter (Python, PyMuPDF)
        ▼
knowledge-base/formulas/<ruleset>/rules.json           2 EXTRACT   one JSON, all forms, + source sha256
        │  renderer (Node, in-repo)
        ├─▶ knowledge-base/formulas/<ruleset>/<form>.md  3 READ      one page per form, for people and agents
        └─▶ packages/ca-tax/src/.../generated/<ruleset>.ts 4 USE    typed data for the engine and tests
                                                         5 GUARD   drift + conformance tests
```

1. **Source**: the PDF, as issued. `manifest.json` records its sha256, version and date.
2. **Extract**: a per-source adapter.
   - `adapters/tra-chapter3.py` extends today's row extractor with the Business Rules column,
     cross-page continuation and page numbers.
   - It checks its own coverage and fails the run instead of guessing: every row it finds has
     a rule or is explicitly rule-less, per-form row floors hold (as `EXPECTED_MIN` does
     today), and nothing lands in an unknown column.
   - Its output is `rules.json`, which is committed.
3. **Read**: a renderer writes one Markdown page per form, `formulas/at1/021-loss-continuity.md`.
   - It has a header linking the printed form PDF, the spec page range and the status
     (current or legacy).
   - Then a table: line · name · M/O/X · rule verbatim · refs · spec page.
   - Then a "Formulas" section listing each `expr`, and a "Federal inputs" section listing each
     `fed …` reference. That is the list T2 must supply, so it doubles as the AT1 ↔ T2 seam.
4. **Use**: the same renderer emits the TypeScript module.
   - It supersedes `at1-spec-rows.ts`: the same exports (`AT1_SPEC_ROWS`, `mandatoryFields`,
     `isSpecField`) plus `AT1_SPEC_RULES`.
   - Existing consumers keep working unchanged.
5. **Guard** (Node, no Python in CI):
   - *Drift*: re-render `rules.json` → Markdown + TS in-process and compare bytes with what is
     checked in. It fails if anyone hand-edits either, as the forms pipeline does.
   - *Formula conformance*: for every row with an `expr`, run the engine on fixtures and
     assert that the filed value equals the expression evaluated over the filed refs, such as
     021037 = −021021 or 021033 = 021031 − 021032. Each exception must be listed with a
     reason, the same pattern as `KNOWN_GAPS`.
   - *Reference coverage*: every `own` reference must resolve to a row of its form. A rule
     citing a line that doesn't exist is an extraction bug or a spec erratum, and is reported.

### Layout

```
research/
  tools/rulebook/
    README.md                 how to add a ruleset; the schema above
    schema.json               the row schema (validated in the guard test)
    adapters/tra-chapter3.py  AT1 (supersedes tra-spec/tools/extract-at1-schedule-rows.py)
    adapters/cra-cif.py       later — T2, once the CIF spec is in sources/
    render.mjs                rules.json → Markdown + TS
  knowledge-base/formulas/
    README.md                 index of rulesets
    at1/                      ruleset at1-tra-ch3-2026.4
      manifest.json           source path, sha256, version, extracted-at, counts
      rules.json
      000-jacket.md  001-small-business-deduction.md … 029-innovation-employment-grant.md
    t2/                       later
```

**Current forms only (decided 2026-09-30).** The legacy tables (S5–S9, S11, S14, and S12
lines 010–013) are not extracted. The formulas README lists them once, with the link to
`evidence/at1-schedule-universe/`, so nobody builds them by mistake.

```
```

### The agentic workflow it enables (per form)

1. Read `formulas/<ruleset>/<form>.md` for every line's rule and page.
2. Read the printed form in `sources/…/pdf` and its generated captions, for the layout.
3. Implement against the rules. A formula row gets a conformance test automatically, and any
   other row cites its rule in the code comment, as the code already does by hand today
   ("§3.2.3.21: Value = 021021 × (−1)").
4. The guard tests fail on any line the implementation contradicts.

For T2, the only new work is the CIF adapter. Schema, renderer, Markdown, TS and guards are
all shared.

## Build order

1. Extend the adapter to rules, page numbers and continuations, and add a `--report` coverage
   print. Hand-verify three dense forms against the PDF: S012, S015 and S021.
2. Commit `rules.json` and `manifest.json`. Add the renderer, then the Markdown pages and the
   index.
3. Emit the TS module and switch `at1-spec-rows.ts` consumers to it (same exports), with the
   drift test.
4. Add reference-coverage and formula-conformance tests. The first run is expected to surface
   real findings, which get triaged like the fix lists.
5. Update the `research/README.md` and `tra-spec/knowledge-base/00-index.md` pointers, and the
   CLAUDE.md "generated files" note.

**Risks and how the design handles them.**

- *Wrapped or merged rows*: the page-local header and row-by-code segmentation already
  proven for M/O/X, plus row floors per form.
- *Rules citing other rules in prose*: kept verbatim, with `kinds: ["text"]`.
- *Spec errata* (the spec prints Schedules 16 and 17 both under "3.2.3.17"): read the form
  from the title, as the current extractor already does.
- *A new spec version*: re-run the adapter; the drift test then shows exactly which rules
  changed. That becomes the changelog for re-certification.
