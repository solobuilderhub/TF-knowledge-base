# Guide: validating a new form or program with Jev

Evidence for everything below: `findings/jev/2026-10-21-jev-validation-pilot.md`.
Rule of thumb: **Jev compares short, single-claim text well; it judges long prose and code
badly.** Deterministic tests decide correctness; Jev finds what to look at.

## The pipeline, in the order to run it

For a new form set (T2 CIF, a new AT1 year, another province):

1. **Rule book first.** The extractor must have produced `spec/<program>/forms/<form>.json`
   (one row per line: `line`, `name`, `rule`, `kinds`, `expr`, `requirement`; see
   `tools/rulebook/README.md`). Jev checks against these rows, so an extraction error will
   look like a code error. Run the extractor's own drift tests before anything else.
2. **Dump our definitions.** `tools/jev/dump-forms.mts` writes `{form: [{line, caption, note}]}`
   from the hand-authored form definitions. For a new program add its rows to `LIST` and its
   forms directory; run with `npx tsx` from the package that owns the forms:
   `cd packages/ca-tax && npx tsx ../../research/tools/jev/dump-forms.mts out.json`
3. **Captions: `pilot.py`** (the reliable check).
   `python tools/jev/pilot.py --forms out.json [--spec-dir <rule-book forms dir>] [--only 001]`
   - Read the **true pairs scored < 0.5** first. Expect benign ones: a caption repeated in
     several sections (it compares the first occurrence), glyph noise in the spec.
   - A real one is a definition that names the wrong line, or a wrong form/line mapping.
   - Assumes our line ids are `FFFLLLNNN` (form, line, occurrence) and the rule book's `line`
     is `LLL`. T2 ids differ: change the one key line in `pilot.py` (`f["line"][3:6]`) and
     nothing else.
   - Healthy: AUC against the wrong-line control above 0.95. If it is lower, the pairing is
     wrong (keys), not the forms.
4. **Formulas as formulas: `expr_check.py`.** Where the rule book has an `expr`, this proves
   Jev tells the formula from a corrupted copy (needs to be 100%; it was). If you build a
   *text file of our implemented formulas* in the same `expr` grammar, point this script at it
   and every mismatch is a real difference. Keep those files short and one claim per line.
5. **Implemented behaviour, written down: `implemented/<form>.txt`.** Entries start
   `### FFFLLL` and describe, in plain sentences, what our code does **and what it does not do**,
   written from the code (ca-tax builders + host assemblers), never from the spec. Then
   `python tools/jev/sentence_check.py <form>` lists rule sentences the description does not
   seem to cover, and description sentences the rule does not seem to support.
   - It is a **review aid**: roughly half its flags are false leads on long conditionals, and it
     catches only a minority of injected prose defects. A clean line proves nothing.
   - Its value is in forcing the honest "does NOT" sentences. Write them.
6. **Deterministic checks stay the authority.** For arithmetic, extend
   `apps/server/tests/at1-formula-conformance.test.ts` (evaluates each rule's `expr` against
   filed returns). Every Jev lead that is a real gap becomes a test or a documented decision in
   `findings/`, not a Jev score.

## What not to do

- Do not send raw code against a rule (`formula_check.py` caught 0 of 164 defects; kept only as
  the documented failure).
- Do not ask one verdict question about a long rule and a long description
  (`implemented_check.py`: "conflicts" 0.83 for the true pair and 0.82 for the control).
- Do not use scores as a gate in CI. They are probabilities from a model with documented
  jaggedness; they vary with option order and context.
- Do not use Jev's rule-kind classification as ground truth for the extractor.

## How to judge any new check (always do this)

Score three things for every check you add: the TRUE pair, a CONTROL (a different line's
text), and a MUTANT (the true text with one injected defect: operator, number, greater<->lesser,
Yes<->No). If the mutant scores like the true pair, the check is blind to that defect class and
must not be trusted for it. The existing scripts show how (`mutate()` in `implemented_check.py`).

## Operating notes

- **Key:** `research/.env` (`TYPESAFE_API_KEY`, gitignored; `.env.example` for the name) or the
  environment. Never commit it, never put it in a script. Rotate when the person who issued it
  says so.
- **Data:** the rule text is Protected A and goes to TypeSafe (no training on inputs, no
  disclosure beyond service providers; no retention period stated). Get the data owner's
  approval each time, and prefer the short per-line text to whole documents.
- **Cost:** about $0.042 per million input tokens; a full 15-form pass of `pilot.py` is under
  $0.05 (about 700 k tokens). Output is free.
- **Outputs:** `tools/jev/out/` is gitignored (it holds rule text). Save conclusions as a dated
  note under `findings/jev/` with the numbers, and copy the small result JSONs into
  `findings/jev/data/`.
- **API:** `POST https://api.typesafe.ai/v1/systemone`, body `{model, state, questions}`;
  question types `noul` (0-1 yes), `choice`, `score`. Docs index: `docs.typesafe.ai/llms.txt`,
  OpenAPI: `api.typesafe.ai/openapi.json`. Pin the model (`jev-latest` resolves to 1.13 today)
  when you need comparable numbers across runs; note the version in the findings.
- **Order of questions:** Jev is sensitive to option order in `choice`; prefer `noul`.
