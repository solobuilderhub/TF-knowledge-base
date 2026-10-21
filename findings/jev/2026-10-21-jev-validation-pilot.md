# Jev as a form / formula validator: pilot findings (2026-10-21)

Model `jev-1.13` (TypeSafe System One), key in `research/.env`. Tools: `research/tools/jev/`
(guide: `tools/jev/GUIDE.md`). Raw results: `findings/jev/data/`. Every test scores the TRUE
pair, a CONTROL (another line's text) and a MUTANT (one injected defect).

## Verdict

Jev is a **precise comparator of short, atomic text** and an **unreliable judge of long prose or
code**. Use it as a lead generator for human review, never as a pass/fail gate on correctness.

| Test | Scale | Result | Use? |
|---|---|---|---|
| Our caption vs spec line name (`pilot.py`) | 644 lines, 15 forms | AUC **0.991**; true mean 0.92, wrong-line 0.12. 10 true pairs < 0.5, all benign (repeated "Year of origin" rows keyed to the first occurrence, a garbled PUA glyph at 012050, 000092 / 002108 wrapped captions) | **Yes**: gate for "does the form definition name the same lines the spec does" |
| Our note vs spec rule (`pilot.py`) | 363 notes | AUC 0.75 | Weak: our notes explain, they do not restate the rule |
| Rule-kind classification (`pilot.py`) | 640 rows | agrees with the extractor's primary kind 339 (53%), any kind 418 (65%) | No: the extractor's `kinds` are a heuristic; neither is ground truth |
| Rule vs formula text (`expr_check.py`) | 37 formulas, 36 mutants | 36 / 36 caught (operator 24/24, operand 12/12); true 0.98, mutant 0.02 | **Yes**: formula-vs-formula is exact |
| Rule vs raw code (`formula_check.py`) | 192 pairs, 164 mutants | true 0.11, AUC 0.64, **0 / 164** caught | **No**: code snippets are noise; the layer that applies a default is elsewhere |
| Rule vs whole plain-text implementation (`implemented_check.py`) | Schedule 1, 10 lines, 30 mutants | "conflicts" true 0.83 / control 0.82; 2 / 30 caught | **No** |
| Sentence vs text (`sentence_check.py`) | Schedule 1, 10 lines | surfaced every known divergence; 2 / 30 injected defects caught; false leads on long conditionals | **Lead generator**, human reviews |

## Schedule 1 leads (each was real or a known deliberate divergence)

| Line | Lead | Status |
|---|---|---|
| 001001 | fed 200160 (T2 line 160) is not read; spec says Yes when it is 1 | **Open gap**: decide whether to read it |
| 001003 | specified-partnership-income recalculation (federal Schedule 7) not applied | Known, documented (Net File rule); open |
| 001015 | printed form's Area B (greater of capital and passive reductions) vs spec's capital-only | Known decision G1-01; ask TRA |
| 001019 / 001020 | condition `fed 200750 = MJ` not applied (filed whenever the amount > 0) | Open: harmless when 127 / 167 are zero outside multi-jurisdiction returns, but not the spec's wording |
| 001041 | names are not compared with fed 023100 | **Open gap** (G1-09 follow-up) |
| 001009, 001043 | clean | none |

`implemented/001.txt` was written partly from memory of earlier work (the 041 name check and
the Σ045 ≤ 200,000 check in particular): re-verify it against the code before relying on it.

## Cost and terms

Whole pilot well under $0.10 (about 1.3 M input tokens at $0.042 / M). TypeSafe's privacy policy:
inputs are not used for training and not disclosed beyond service providers; it does not list
subprocessors or state a retention period. Rule text is Protected A: only send it with the
owner's approval (given 2026-10-21 for this key). Rotate the key after use.

## Jev's documented limits that explain the results

From `docs.typesafe.ai/model-jaggedness/jev-1.13.md`: unreliable at counting and numeric
nearness, reads dates as text, answers the question as written (scoping words, negation), and
accuracy falls as unrelated text enters the state. Short, single-claim questions avoid all of
these; long rules do not.
