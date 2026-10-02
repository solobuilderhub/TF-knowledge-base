# Rule-book pipeline

Turns an official filing specification (a "rule book") into one versioned data file, and
renders every view of it from that file:

- readable pages, form by form;
- typed data for the engine;
- guard tests.

AT1 (TRA Chapter 3) is live. T2 (CRA's CIF specification) adds only an adapter. Design and
rationale: `research/PLAN-rulebook-pipeline.md`.

```
research/sources/<source>/<doc>.pdf                    the rule book, as issued (never edited)
  → research/tools/rulebook/adapters/<source>.py       adapter: PDF → per-form JSON (Python, PyMuPDF)
  → packages/ca-tax/spec/<ruleset>/forms/<form>.json  THE source of truth — one file per form, one row per line
    + manifest.json                                     source sha256, version, counts, legacy exclusions
  → packages/ca-tax/scripts/rulebook/render.ts          renderer (Node) → every view:
      src/t2/at1/filing/generated/at1-spec-rows.ts     shipped: M/O/X, types, sections (`@classytic/ca-tax/t2`)
      research/knowledge-base/formulas/at1/*.md        one page per form — read these before building a form
```

The rule text lives in ca-tax's **private** repository because the specification is
"Protected A":

- `spec/` is not in the published package (`files` is `dist` only);
- the shipped `at1-spec-rows.ts` carries structure only (lines, M/O/X, types), never rule
  text;
- the server and web repositories are public, so tests there read the rules from the
  sibling private checkout and skip without it.

## Run it

```bash
# 1. The spec changed (new PDF in research/sources/tra-spec/): re-extract into spec/at1/forms/.
python research/tools/rulebook/adapters/tra-chapter3.py --report   # coverage per form, writes nothing
python research/tools/rulebook/adapters/tra-chapter3.py            # writes packages/ca-tax/spec/at1/

# 2. Re-render every view (always after step 1; never edit an output by hand).
cd packages/ca-tax && npx tsx scripts/rulebook/render.ts
```

The `spec/at1/forms/` diff is the changelog of the new spec version, form by form.

## One row

```jsonc
{
  "line": "037", "name": "Non-Capital Losses - Add: Current year loss",
  "type": "$", "length": "1/13", "sign": "+", "requirement": "M", "section": "CNCL",
  "rule": "Value = 021021 x (-1).",                    // VERBATIM — the authority
  "kinds": ["formula"],                                // formula | default-to-federal | constraint | existence | text
  "refs": { "own": ["021021"], "other": [], "federal": [] },
  "expr": "021021 * (-1)",                             // only when the rule is pure arithmetic
  "page": { "pdf": 201, "printed": "3-201" }
}
```

`kinds`, `refs` and `expr` are derived from `rule` and never replace it. A rule the parser
cannot classify keeps `kinds: ["text"]` and is never dropped.

## The guards

| Test | Where | Fails when |
|---|---|---|
| `rulebook-drift.test.ts` | ca-tax | Any output differs from a fresh render (a hand edit, or a re-extract with no re-render). The ruleset is not exactly TRA's published forms. A rule cites a line that does not exist (known spec errata are listed with reasons). |
| `at1-spec-coverage.test.ts` | ca-tax | A schedule builder omits a mandatory row, or files a row the spec does not define. |
| `at1-formula-conformance.test.ts` | server | A filed value contradicts its spec formula, on any recorded corpus scenario, the maximal return or a TRA certification case. Exceptions and unreachable formulas are listed with reasons. |

## Building a form with it (the agentic workflow)

1. Read `research/knowledge-base/formulas/<ruleset>/<form>.md`: every line's rule, its page,
   and the federal fields it reads.
2. Read the printed form (`research/sources/…/pdf`) for layout.
3. Implement, citing the rule in the code (`§3.2.3.21: Value = 021021 × (−1)`).
4. Run the guards. A formula row is checked automatically once a fixture files it.

## Adding a rule book (T2)

1. Put the document in `research/sources/<source>/`, as issued.
2. Write `adapters/<source>.py`. It must emit the same row schema. Everything
   source-specific (column positions, reference syntax, legacy exclusions) stays in the
   adapter.
3. Point the renderer at the new ruleset: add its outputs next to `at1`.
4. Add the ruleset to the drift test. Then add fixtures, and the formula-conformance test
   covers it.

## What the first AT1 run found (2026-09-30)

- **Two lines missing from the old spec table.** S15 lines 115 (M) and 293 (X) open
  pages 147 and 167, which carry no heading, and the previous extractor skipped those pages.
  The engine already filed both lines; only the table lacked them.
- **Schedule 16 filed its subtotal (016) without its component lines (004–015).** TRA could
  not reconcile 016 from the filed lines. Fixed.
- **The Schedule 16 federal claim never reached Schedule 12.** The Alberta/federal SR&ED
  difference, which is why Schedule 16 is filed at all, did not move Alberta net income.
  Fixed: the difference is reconciled as an adjustment.
- **Spec errata recorded, not "fixed":**
  - 015107 cites 015139;
  - 021057 subtracts 018075;
  - jacket 066 and S21 015 are printed working with no Net File row.
