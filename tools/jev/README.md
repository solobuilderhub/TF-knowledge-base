# Jev (TypeSafe System One) as a checker for our forms and formulas

**How to use it on a new form or program: [GUIDE.md](./GUIDE.md).** Dated findings with numbers: `findings/jev/2026-10-21-jev-validation-pilot.md`; raw results: `findings/jev/data/`. `dump-forms.mts` exports our form definitions for `pilot.py`.

Jev answers typed questions (Noul = probability of yes) about a piece of text, fast and
cheap ($0.042 / M input tokens; the whole pilot cost well under $0.10). Key: `research/.env`
(`TYPESAFE_API_KEY`, gitignored; `.env.example` shows the name). Rule text is sent to
TypeSafe: their privacy policy says inputs are not used for training and not disclosed beyond
service providers. Outputs are in `out/` (gitignored).

Every script scores the TRUE pair, a CONTROL (another line's text) and a MUTANT (one injected
defect). A checker is only as good as its separation of those.

| Script | Compares | Result (2026-10-21, jev-1.13) |
|---|---|---|
| `pilot.py` | our caption / note vs the spec line name / rule, all 15 forms (644 lines) | **Captions: AUC 0.991** (true 0.92, wrong-line 0.12). Only 10 true pairs < 0.5, all benign (repeated "Year of origin" rows, a garbled glyph). **Notes vs rules: AUC 0.75**, weak: our notes are explanations, not statements of the rule. Rule-kind classification agrees with the extractor 339 / 640. |
| `formula_check.py` | the spec rule vs the RAW CODE that files the line (192 pairs) | **Fails.** true 0.11, AUC 0.64, 0 of 164 injected defects caught. The code snippet is noise (comments, plumbing, defaults live in another layer). Do not use. |
| `expr_check.py` | the spec rule vs a formula (rule book `expr`), mutated | **Exact**: 36 / 36 mutants caught (operator, operand), true 0.98 vs mutant 0.02. Short, atomic text works. |
| `implemented_check.py` | rule vs a whole plain-text implementation entry, one verdict | **Fails.** Says "conflicts" for everything (true 0.83, control 0.82). Long prose against long prose is Jev's documented weak spot. |
| `sentence_check.py` | each rule SENTENCE vs the implementation, each implementation sentence vs the rule | **Useful as a lead generator, not a gate.** On Schedule 1 it surfaced every divergence we know of and wrote them down: T2 line 160 not read (001001), partnership recalculation not applied (001003), printed form vs spec Area B (001015), fed 200750 condition not applied (001019/020), Schedule 23 name match not done (001041). Also false leads on long conditionals (001015, 001045). Injected defects in prose are caught only 2 / 30, so a clean result proves nothing. |

## What this means

- Use Jev for **short, atomic comparisons**: does this caption name the same line, does this
  formula equal that formula. Those are reliable.
- Use `sentence_check.py` as a **review aid**: it lists which rule sentences the written-down
  implementation does not seem to cover. A person decides. It is not a correctness check.
- Correctness stays with the deterministic checks: `apps/server/tests/at1-formula-conformance.test.ts`
  (evaluates every pure-arithmetic rule against filed returns) and the corpus.
- The step that carries the risk is writing `implemented/<form>.txt` from the code. It is only
  as honest as its author (`implemented/001.txt` states what the code does NOT do, which is
  what makes the sentence check useful). Extending it to the other forms is manual work.

```bash
python tools/jev/pilot.py --forms <dump of our form fields .json>   # captions / notes
python tools/jev/expr_check.py                                      # formula vs formula
python tools/jev/sentence_check.py 001                              # implemented/001.txt vs rules
```
`pilot.py` needs a JSON dump of our form fields (`{form: [{line, caption, note}]}`); it is
produced by importing `AT1_SCHEDULE_*` from `packages/ca-tax/src/t2/at1/forms/` with tsx.
