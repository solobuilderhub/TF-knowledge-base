#!/usr/bin/env python3
"""
Formula pipeline, text vs text: the implemented-formula files against the rule book.

  implemented/<form>.txt   what the engine does, per line, in plain words, written
                           from the CODE (not from the spec). Entries start "### FFFLLL".
  spec rows                packages/ca-tax/spec/at1/forms/<form>.json (private)

Why text vs text: Jev read prose against raw code and failed (formula_check.py: AUC 0.64,
0 of 164 injected defects caught). Prose against a formula or prose it read cleanly
(expr_check.py: 36 of 36 caught). So the code is translated to text once, by a person,
and Jev compares text with text.

For each entry, one Noul: "the implementation does what the rule says: same sources,
conditions, arithmetic and limits". Asked of the TRUE pair, a CONTROL (another line's
implementation) and a MUTANT (the implementation with one defect injected: a number,
greater<->lesser, a regulation, yes<->no, an added/removed 'not'). The report ranks the
true pairs lowest-first: those are where the code and the rule may disagree, and each
needs a human decision. A low score is a lead, not a verdict.

    python implemented_check.py 001
"""
from __future__ import annotations

import json
import random
import re
import sys
from pathlib import Path

import pilot

HERE = Path(__file__).resolve().parent
QS = {
    "conflicts": {
        "type": "noul",
        "instructions": "Something the implementation does conflicts with the specification rule: a different source, condition, number, comparison or limit than the rule states.",
    },
    "complete": {
        "type": "noul",
        "instructions": "The implementation covers every requirement the specification rule states. A requirement the implementation says it does not apply or does not read is not covered.",
    },
}
SWAPS = [("greater", "lesser"), ("lesser", "greater"), ("above", "below"), ("less than", "more than"), ("Yes", "No"), ("times", "divided by"), ("first", "last"), ("never below", "never above"), ("floored at zero", "capped at zero")]


def entries(form: str) -> dict[str, str]:
    text = (HERE / "implemented" / f"{form}.txt").read_text(encoding="utf8")
    out = {}
    for m in re.finditer(r"^### (\d{6})\n(.*?)(?=^### |\Z)", text, re.S | re.M):
        out[m.group(1)[3:]] = m.group(2).strip()
    return out


def mutate(t: str, rng: random.Random) -> tuple[str, str] | None:
    c = []
    for a, b in SWAPS:
        if a in t:
            c.append((t.replace(a, b, 1), f"{a} -> {b}"))
    m = re.search(r"\b(\d[\d,]*(?:\.\d+)?)\b", t)
    if m:
        v = m.group(1)
        try:
            n = float(v.replace(",", ""))
            nv = f"{n * 2:g}"
            c.append((t[: m.start()] + nv + t[m.end():], f"{v} -> {nv}"))
        except ValueError:
            pass
    return rng.choice(c) if c else None


def main() -> None:
    form = sys.argv[1]
    pilot.KEY = pilot.load_key()
    rng = random.Random(3)
    spec = {r["line"]: r for r in json.loads((pilot.SPEC / f"{form}.json").read_text(encoding="utf8"))["rows"]}
    impl = entries(form)
    res = []

    def ask(r, text):
        a = pilot.call({"specification": {"line_name": r["name"], "business_rule": r["rule"][:1800]}, "implementation": text}, QS, "jev-latest")
        return {k: a["answers"][k]["noul"] for k in QS}

    for ln, text in impl.items():
        r = spec[ln]
        peers = [t for k, t in impl.items() if k != ln]
        row = {"line": form + ln, "name": r["name"], "true": ask(r, text)}
        if peers:
            row["ctrl"] = ask(r, rng.choice(peers))
        for k in range(3):  # several independent mutants per line
            m = mutate(text, rng)
            if m:
                row.setdefault("mutants", []).append({"what": m[1], **ask(r, m[0])})
        res.append(row)
    (HERE / "out").mkdir(exist_ok=True)
    (HERE / "out" / f"implemented-{form}.json").write_text(json.dumps(res, indent=1), encoding="utf8")
    mu = [x for r in res for x in r.get("mutants", [])]
    n = len(res)
    avg = lambda xs: sum(xs) / max(1, len(xs))
    print(f"form {form}: {n} lines")
    print(f"  conflicts  true {avg([r['true']['conflicts'] for r in res]):.2f}  control {avg([r['ctrl']['conflicts'] for r in res if 'ctrl' in r]):.2f}  mutant {avg([x['conflicts'] for x in mu]):.2f}")
    print(f"  complete   true {avg([r['true']['complete'] for r in res]):.2f}  control {avg([r['ctrl']['complete'] for r in res if 'ctrl' in r]):.2f}  mutant {avg([x['complete'] for x in mu]):.2f}")
    print(f"  mutants flagged (conflicts rose >0.3 over own true): {sum(x['conflicts'] > r['true']['conflicts'] + 0.3 for r in res for x in r.get('mutants', []))}/{len(mu)}\n")
    print("conflicts complete line   (leads, worst first)")
    for r in sorted(res, key=lambda r: -(r["true"]["conflicts"] + 1 - r["true"]["complete"])):
        print(f"  {r['true']['conflicts']:.2f}     {r['true']['complete']:.2f}    {r['line']}  {r['name'][:56]}")


if __name__ == "__main__":
    main()
