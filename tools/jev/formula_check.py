#!/usr/bin/env python3
"""
Formula pipeline: does the code that files a line implement the rule TRA wrote?

1. PAIRS  For every rule row whose kinds include formula / default-to-federal /
          constraint and whose line the engine files, take the rule (verbatim,
          from the private rule book) and the CODE that files that line (the
          statements that mention it in the form's builder function in
          packages/ca-tax/src/t2/at1/filing/at1-schedule-line-items.ts).
          Written as plain text, one file per form, so a person can read the
          same pairs Jev reads: out/pairs/<form>.txt
2. ASK    One Noul per pair: "the code computes what the rule says".
3. PROVE  The same question is asked of
            - CONTROL   the code of a different line of the same form, and
            - MUTANT    the true code with one injected defect (max<->min,
                        a changed constant, + <-> -, an operand dropped).
          Jev is only worth trusting where it scores the true pair high AND the
          control / mutant low. The report gives AUC against controls and the
          share of mutants it caught.
4. REPORT out/formula-report.md: per line, true / control / mutant scores, and
          the disagreements worth a human look (true pair < 0.5).

This is a SECOND OPINION on prose-vs-code. It does not replace the deterministic
checks (apps/server tests/at1-formula-conformance.test.ts evaluates the rule's
arithmetic against filed returns); Jev reads, it does not execute.

Key: TYPESAFE_API_KEY in research/.env. Spec text and code snippets are sent to
TypeSafe (no training on inputs; no disclosure beyond service providers).
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import random
import re
import sys
from pathlib import Path

import pilot  # same directory: key, call, auc

HERE = Path(__file__).resolve().parent
OUT = HERE / "out"
SRC = pilot.RESEARCH.parent / "packages" / "ca-tax" / "src" / "t2" / "at1" / "filing" / "at1-schedule-line-items.ts"
#: form -> the builder function that files it
BUILDERS = {
    "001": "schedule1Values",
    "002": "schedule2Values",
    "010": "schedule10Values",
    "012": "schedule12Values",
    "013": "schedule13Values",
    "016": "schedule16Values",
    "017": "schedule17Values",
    "018": "schedule18Values",
    "020": "schedule20Values",
    "021": "schedule21Values",
    "029": "schedule29Values",
}
WANT = {"formula", "default-to-federal", "constraint"}
CONTEXT = 7


def functions(text: str) -> dict[str, tuple[int, int]]:
    lines = text.split("\n")
    starts = [(m.group(1), i) for i, l in enumerate(lines) if (m := re.match(r"^(?:export )?function (\w+)\(", l))]
    out = {}
    for k, (name, i) in enumerate(starts):
        end = starts[k + 1][1] if k + 1 < len(starts) else len(lines)
        out[name] = (i, end)
    return out


def snippet(lines: list[str], lo: int, hi: int, line: str) -> str | None:
    """Statements in lines[lo:hi] that mention the line id, with a little context."""
    pat = re.compile(r"['\"`]%s['\"`]|\b%s\b" % (line, line))
    hits = [i for i in range(lo, hi) if pat.search(lines[i]) and not lines[i].lstrip().startswith(("*", "//", "/*"))]
    if not hits:
        return None
    keep: set[int] = set()
    for h in hits[:4]:
        keep.update(range(max(lo, h - CONTEXT), min(hi, h + CONTEXT + 1)))
    out, prev = [], None
    for i in sorted(keep):
        if prev is not None and i != prev + 1:
            out.append("  // ...")
        out.append(lines[i])
        prev = i
    return "\n".join(out)[:2600]


def mutate(code: str, rng: random.Random) -> tuple[str, str] | None:
    cands: list[tuple[str, str]] = []
    if "Math.max" in code:
        cands.append((code.replace("Math.max", "Math.min", 1), "max->min"))
    if "Math.min" in code:
        cands.append((code.replace("Math.min", "Math.max", 1), "min->max"))
    m = re.search(r"(?<![\w.'\"])(\d{2,}(?:_\d{3})*)(?![\w'\"])", code)
    if m:
        v = m.group(1)
        nv = str(int(v.replace("_", "")) * 2)
        cands.append((code[: m.start()] + nv + code[m.end():], f"constant {v}->{nv}"))
    m = re.search(r" ([+-]) ", code)
    if m:
        flip = "-" if m.group(1) == "+" else "+"
        cands.append((code[: m.start()] + f" {flip} " + code[m.end():], f"{m.group(1)}->{flip}"))
    m = re.search(r"\s*(<=|>=|<|>)\s", code)
    if m:
        flip = {"<=": ">", ">=": "<", "<": ">=", ">": "<="}[m.group(1)]
        cands.append((code[: m.start()] + f" {flip} " + code[m.end():], f"{m.group(1)}->{flip}"))
    return rng.choice(cands) if cands else None


Q = {
    "type": "noul",
    "instructions": "The code computes exactly what the specification rule says for this line: the same source fields, the same condition, the same arithmetic and the same limits.",
}


def build_pairs() -> list[dict]:
    text = SRC.read_text(encoding="utf8")
    lines = text.split("\n")
    fns = functions(text)
    pairs = []
    for form, fn in BUILDERS.items():
        if fn not in fns:
            continue
        lo, hi = fns[fn]
        spec = json.loads((pilot.SPEC / f"{form}.json").read_text(encoding="utf8"))["rows"]
        for r in spec:
            if not (set(r["kinds"]) & WANT):
                continue
            code = snippet(lines, lo, hi, r["line"])
            if code is None:
                continue
            pairs.append({"form": form, "line": r["line"], "name": r["name"], "rule": r["rule"][:1800], "code": code})
    return pairs


def write_pair_files(pairs: list[dict]) -> None:
    d = OUT / "pairs"
    d.mkdir(parents=True, exist_ok=True)
    by: dict[str, list[dict]] = {}
    for p in pairs:
        by.setdefault(p["form"], []).append(p)
    for form, ps in by.items():
        body = [f"AT1 form {form}: rule (TRA Chapter 3) beside the code that files the line\n"]
        for p in ps:
            body.append(f"=== {form}{p['line']}  {p['name']}\nRULE:\n{p['rule']}\n\nCODE:\n{p['code']}\n")
        (d / f"{form}.txt").write_text("\n".join(body), encoding="utf8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--model", default="jev-latest")
    ap.add_argument("--no-ask", action="store_true", help="only write the pair files")
    a = ap.parse_args()
    pilot.KEY = pilot.load_key()
    pairs = [p for p in build_pairs() if not a.only or p["form"] in a.only]
    write_pair_files(pairs)
    print(f"{len(pairs)} rule/code pairs -> {OUT / 'pairs'}", file=sys.stderr)
    if a.no_ask:
        return
    rng = random.Random(11)
    by_form: dict[str, list[dict]] = {}
    for p in pairs:
        by_form.setdefault(p["form"], []).append(p)

    def ask(rule: dict, code: str) -> float:
        res = pilot.call({"specification": {"line_name": rule["name"], "business_rule": rule["rule"]}, "code": code}, {"ok": Q}, a.model)
        return res["answers"]["ok"]["noul"]

    def run(p: dict) -> dict:
        peers = [x for x in by_form[p["form"]] if x["line"] != p["line"] and x["code"] != p["code"]]
        out = {"form": p["form"], "line": p["line"], "name": p["name"], "true": ask(p, p["code"])}
        if peers:
            out["ctrl"] = ask(p, rng.choice(peers)["code"])
        m = mutate(p["code"], rng)
        if m:
            out["mutant"], out["mutation"] = ask(p, m[0]), m[1]
        return out

    with cf.ThreadPoolExecutor(8) as ex:
        results = list(ex.map(run, pairs))
    OUT.mkdir(exist_ok=True)
    (OUT / "formula-results.json").write_text(json.dumps(results, indent=1), encoding="utf8")
    report(results)


def report(results: list[dict]) -> None:
    t = [r["true"] for r in results]
    c = [r["ctrl"] for r in results if "ctrl" in r]
    mu = [r for r in results if "mutant" in r]
    lines = ["# Jev formula check: code vs rule", ""]
    lines.append(f"Pairs: {len(results)}. Mean score, true {sum(t)/len(t):.2f}; control {sum(c)/max(1,len(c)):.2f}.")
    lines.append(f"AUC true vs control: {pilot.auc(t, [r['ctrl'] for r in results if 'ctrl' in r]):.3f}")
    caught = sum(r["mutant"] < r["true"] - 0.15 for r in mu)
    lines.append(f"Mutants ({len(mu)}): scored clearly below the true pair {caught}/{len(mu)}; AUC true vs mutant {pilot.auc([r['true'] for r in mu], [r['mutant'] for r in mu]):.3f}")
    lines += ["", "## Pairs the checker doubts (true < 0.5): read these", "", "| Line | Name | true | ctrl | mutant |", "|---|---|---|---|---|"]
    for r in sorted(results, key=lambda r: r["true"]):
        if r["true"] < 0.5:
            lines.append(f"| {r['form']}{r['line']} | {r['name'][:60]} | {r['true']:.2f} | {r.get('ctrl', float('nan')):.2f} | {r.get('mutant', float('nan')):.2f} |")
    lines += ["", "## Mutants it missed (scored within 0.15 of the true pair)", "", "| Line | Mutation | true | mutant |", "|---|---|---|---|"]
    for r in mu:
        if r["mutant"] >= r["true"] - 0.15:
            lines.append(f"| {r['form']}{r['line']} | {r['mutation']} | {r['true']:.2f} | {r['mutant']:.2f} |")
    (OUT / "formula-report.md").write_text("\n".join(lines) + "\n", encoding="utf8")
    print("\n".join(lines[:6]))


if __name__ == "__main__":
    main()
