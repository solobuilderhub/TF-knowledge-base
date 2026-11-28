# AT1 rules draft from AuraTax, graded against Chapter 3

**Date:** 2026-11-28
**Subject:** CRA has no public T2 equivalent of TRA's Chapter 3. Can a Chapter-3-style rules document be rebuilt from
what AuraTax ships? This session tests that on AT1 first, where the real Chapter 3 exists to grade against.
**Source:** AuraTax 2.3.33 desktop (AT1 bundle `315.*.js`, its form data, its English messages); TRA AT1
Chapter 3 v2026.4, through the KB's verbatim rule book (`knowledge-base/formulas/at1/`).
**Status:** done for AT1. The T2 version (same method) is not built yet.

**Not a primary source.** The draft is AuraTax's reading of the AT1 forms, written in Chapter 3's shape.
Nothing here may be copied into ca-tax, the BE or the FE.

## What was built

1. **AT1 formula register** (`formulas/`), from the AuraTax calculators. Same tool as the T2 register
   (`../2026-11-27-t2-calculation-formulas/tools/formulas.mjs`, now run with `--program at1`):
   - 401 value-setting call sites, all recorded (0 missing), 737 entries.
   - 136 of the entries are federal defaults from AuraTax's import tables ("if the line is blank, take fed X"),
     which AT1 applies through a shared helper (`fnAT1.safe_dirtify`).
2. **AT1 checks** (`formulas/validators.csv`), from the AuraTax validators:
   - 203 checks in 17 modules, 251 entries, each with its severity, its condition, and AuraTax's English
     message with the values filled in.
   - Checks AuraTax generates from lookup tables (for example "must equal federal Schedule 1 line X", for
     14 lines) are expanded line by line.
3. **The draft** (`schedules/<code>.md`, `draft.csv`):
   - Chapter 3's columns for every AT1 line: Line, Name, Type, Length, +/−, M/O/X and Business rule.
   - The business rule combines the formulas, AuraTax's rule flags and the checks.
   - Every statement names its AuraTax source.
4. **The grading** (`grading.md`, `grading.csv`, `grading.json`): every line Chapter 3 defines, compared with the
   draft. Fields named on both sides are compared automatically, and a random sample is compared by hand.

## Results

| | |
|---|---|
| Lines Chapter 3 defines | 662 |
| …that AuraTax has | 636 (96%) |
| Chapter 3 lines with a business rule | 658 |
| …where the draft has a rule too | **529 (80%)** |
| Chapter 3 rules naming other lines or federal lines | 541 |
| …where the draft names all the same ones | 269 (50%) |
| …some of them | 113 (21%) |
| …none of them | 159 (29%) |
| Mandatory/Optional/Conditional given by the draft | 36 lines (35 agree), against 208 lines Chapter 3 marks mandatory |

By kind of Chapter 3 rule, how often the draft carries something for it:

| Kind | Share |
|---|---|
| "Must equal" a line or federal line | 97% |
| Arithmetic ("Calculate…") | 97% |
| Constraints and formats | 82% |
| Presence ("must exist") | 74% |
| Instructions ("enter…, otherwise fed X") | 70% |

**Agreement by hand.** I compared a random sample of 15 lines with the rule texts side by side.

- **12 agree in substance.** Some take a different route, for example an AuraTax subtotal where Chapter 3 lists the lines.
- **1 is partial:** 020/070, below.
- **2 are missing:**
  - 029/124, the averaging of the base amount;
  - 018/088, the proceeds of disposition taken per occurrence.

The automatic "all fields" score (50%) understates the real agreement for two reasons:

- AuraTax often works through its own totals, such as `Sch 021 [a2_T4_TTC5]`, where Chapter 3 lists the lines it sums.
- Its messages build line lists at run time.

## Findings

- **AT1 Sch 12 line 035 sign: AuraTax is right.** AuraTax stores 035 as fed 001411 − fed 001231, a signed amount,
  so subtracting 035 in line 050 matches Chapter 3's "add if fed line 231, subtract if fed line 411". This corrects
  my reading of the calculator alone, before the validators were extracted.
- **AT1 Sch 20 line 070: AuraTax contradicts itself.**
  - Its check, like Chapter 3, says fed 002310 + 002410 + 002510.
  - Its calculator's federal default fills the line from fed 002410 + 002520.
- **Mandatory/Optional/Conditional is almost absent from AuraTax's data.** It marks 36 lines; Chapter 3 marks 208
  lines mandatory. Whatever AuraTax does about mandatory lines happens elsewhere (its filing output, presumably),
  not in the rule data or the checks.
- **What a rebuilt draft cannot have:**
  - the explanations Chapter 3 gives in prose;
  - legislative references;
  - the mandatory and critical classification.

## What it means for T2

- **The method works.** On AT1 it recovers about four in five rules in substance.
- **It's strongest** on calculations, "must equal" links, federal defaults and consistency checks.
- **It's weakest** on Mandatory/Optional/Conditional and on interpretation.
- **A T2 draft built the same way** should be useful as a working list and as a checklist. CRA's T2 developer
  specifications would replace it as the authority when they arrive.

## Contents

| Path | What |
|---|---|
| `schedules/<code>.md`, `draft.csv` | The draft, one page per AT1 schedule |
| `grading.md`, `grading.csv`, `grading.json` | The grading against Chapter 3 (quotes Chapter 3 rules; Protected A, KB only) |
| `formulas/` | The AT1 formula register (`README.md`, `schedules/`, `formulas.csv`) and the checks (`validators.csv`) |
| `tools/draft.py`, `tools/grade.py` | Build the draft, grade it |

## Regenerating

From the KB root, with AuraTax installed and `npm install` run once in
`validation/auratax/2026-11-27-t2-calculation-formulas/tools/`:

```bash
A=validation/auratax
D=$A/2026-11-28-at1-rules-draft
node $A/2026-11-27-t2-calculation-formulas/tools/formulas.mjs --program at1 --validators --out $D/formulas
python -I $D/tools/draft.py --program AT1 --lines $A/2026-11-27-form-data-cross-check/at1/lines.csv \
  --formulas $D/formulas/formulas.csv --validators $D/formulas/validators.csv --out $D
python -I $D/tools/grade.py --rulebook knowledge-base/formulas/at1 --draft $D/draft.csv --out $D
```
