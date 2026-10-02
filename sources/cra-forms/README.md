# CRA schedule reference PDFs — validation source

> **Adding more forms:** see [`WANTED.md`](WANTED.md) for the prioritised
> download list and why it has to be done by hand — canada.ca does not answer
> automated fetches from this machine (curl times out outright; a scripted
> browser wedges).

Blank official CRA T2 schedule forms, used to validate TaxFoundry's engine line-by-line.
Sourced from the CRA fixture set (identical to the `canada.ca/.../formspubs` PDFs; the
canada.ca CDN 403s automated fetches, so these were pulled from the mirror and diffed
against the on-form CRA revision codes below).

| File | Form | Rev | Validated against engine |
|---|---|---|---|
| `T2SCH01-net-income-for-tax.pdf` | Schedule 1 — Net income for tax | — | `schedule1.ts` |
| `T2SCH06-capital-gains.pdf` | Schedule 6 — Dispositions of capital property | — | `schedule6-capital-gains.ts` |
| `T2SCH08-cca.pdf` | Schedule 8 — CCA | — | `schedule8.ts` |
| `T2SCH13-continuity-of-reserves.pdf` | Schedule 13 — Continuity of reserves | E (22) | `schedule13-reserves.ts` ✅ |
| `T2SCH33-taxable-capital.pdf` | Schedule 33 — Taxable capital (large corps) | E (15) | `schedule33-taxable-capital.ts` ✅ |

## Layout

```
pdf/         the primary documents, exactly as CRA publishes them.
             Never written to by any script.
extracted/   everything derived from them — <form>.layout.txt and
             <form>.lines.tsv. Regenerate freely; nothing here is hand-edited.
tools/       the pipeline.
```

Run the pipeline from `tools/`:

```bash
cd research/sources/cra-forms/tools
python extract-lines.py       # pdf/ -> extracted/
python generate-captions.py   # extracted/ -> the engine's generated captions
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
