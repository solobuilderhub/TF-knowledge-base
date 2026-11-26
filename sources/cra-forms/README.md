# CRA forms — the primary documents

The CRA forms the engine is checked against, exactly as CRA publishes them, and
everything derived from them.

**What is held, at which revision, and how far each form has got** is not
listed here any more: it is generated into [`../../forms/STATUS.md`](../../forms/STATUS.md)
from this directory, so it cannot fall behind. The pipeline and the rules for
adding or replacing a form are in [`../../forms/README.md`](../../forms/README.md).

## Layout

```
pdf/         the primary documents, exactly as CRA publishes them.
             Written only by tools/fetch-form.sh, and never over an existing file.
extracted/   everything derived from them. Regenerate freely; never hand-edited.
               <form>.layout.txt   pdftotext -layout
               <form>.lines.tsv    line, caption: the page read as text
               <form>.fields.tsv   the fillable form's own field list, with
                                   CRA's description of each box
catalog/     CRA's own list of forms (what exists, what was last updated)
tools/       the extractors and the fetcher
```

Run everything with one command, from the research root:

```bash
pip install -r forms/requirements.txt      # once: PyMuPDF
python forms/run.py                        # every form
python forms/run.py T2SCH03                # one form
```

The individual tools, when one step is wanted on its own:

```bash
cd sources/cra-forms/tools
./fetch-form.sh t2sch9 ../pdf/T2SCH09-related-associated.pdf
python extract-lines.py       # pdf/ -> extracted/*.lines.tsv
python extract-jacket.py      # the T2 jacket, which needs its own reader
python extract-xfa.py         # pdf/ -> extracted/*.fields.tsv
python generate-captions.py   # extracted/ -> ca-tax's generated captions
python check-quality.py       # a verdict per form, before authoring anything
python extract-parts.py T2SCH31 --map   # a form's parts, ready to paste
```

**Fillable (`-fill-`) PDFs extract identically to the flat ones** — measured on
Schedule 1, same 117 lines — so either variant is fine to drop into `pdf/`.


## Schedule 13 — Continuity of Reserves (validated 2026-08-03)

Part 2 "Other reserves" — six rows, three columns (opening / transfer-on-amalgamation / closing):

| Reserve | Opening | Transfer | Closing |
|---|---|---|---|
| Doubtful debts | 110 | 115 | 120 |
| Undelivered goods & services | 130 | 135 | 140 |
| Prepaid rent | 150 | 155 | 160 |
| Returnable containers | 190 | 195 | 200 |
| Unpaid amounts | 210 | 215 | 220 |
| Other tax reserves | 230 | 235 | 240 |
| **Totals** | **270** | **275** | **280** |

Flow to Schedule 1: `(270 + 275)` → S1 **line 125 addition**; `280` → S1 **line 413 deduction**.
Part 1 (capital-gains reserves, s.40(1)(a)(iii)) routes to **Schedule 6** (lines 880/885), not S1 —
handled by `schedule6-capital-gains.ts`, deliberately **not** re-modelled in S13.

**Implementation:** `computeSchedule13(rows)` → `schedule1Addition = opening + transfer`,
`schedule1Deduction = closing`. Injected into S1 in `federal-t2.ts` (s.12(1)(e) addition, s.20(1) deduction).

## Schedule 33 — Taxable Capital Employed in Canada (validated 2026-08-03)

- **Part 1 Capital** (line 190) = add lines 101, 103–112 (Subtotal A) − lines 121–124 (Subtotal B); floor 0.
- **Part 2 Investment allowance** (line 490) = add lines 401–407.
- **Part 3 Taxable capital** (line 500) = 190 − 490; floor 0.
- **Part 4 Taxable capital employed in Canada** (line 690) = 500 × (taxable income earned in Canada [610] ÷ taxable income). Nil taxable income deemed $1,000 (Reg 8601). Ratio 1 for a wholly-Canadian corp.
- **Part 5** (0.225% at line 415): the **superseded** capital-tax-era grind. NOT implemented — the current
  business-limit grind is straight-line **$10M → $50M** (Budget 2022, s.125(5.1)(a)) and lives in `schedule7.ts`.
  Federal Part I.3 tax itself was repealed (2006) — not computed.

**Implementation:** `computeTaxableCapital(detail)` → line 690, which feeds the S7 grind
(`taxableCapital` input). An explicit prior-year/associated-group `taxableCapital` on S7 wins;
otherwise S33's figure fills. `filingRequired` flags > $10M (large-corporation test).

**Validated numeric case:** $30M taxable capital → halfway through the $10M–$50M band →
$500k business limit ground to $250k → SBD income capped at $250k. (Test: `t2-schedule13-33.test.ts`,
integration: `compute-route.integration.test.ts`.)
