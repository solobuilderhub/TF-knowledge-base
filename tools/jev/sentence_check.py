#!/usr/bin/env python3
"""Sentence-level text vs text. Jev fails on a long rule against a long implementation
(implemented_check.py: it calls nearly everything a conflict) but is exact on short
claims (expr_check.py). So split BOTH sides into sentences and ask short questions:

  rule sentence  -> "the implementation does what THIS requirement says"   (coverage)
  impl sentence  -> "THIS statement is consistent with the rule"            (no extras/conflicts)

One request per line carries all the questions (they are answered in parallel and in
isolation against the same state). A line's rule-sentence minimum and impl-sentence
minimum are the leads; the sentences themselves say what to read.

    python sentence_check.py 001
"""
import json, random, re, sys
from pathlib import Path
import pilot
from implemented_check import entries, mutate

HERE = Path(__file__).resolve().parent

def sents(t):
    t = re.sub(r"\s+", " ", t)
    parts = re.split(r"(?<=[.;])\s+(?=[A-Z(\d$])", t)
    return [p.strip() for p in parts if len(p.strip()) > 12 and not p.strip().lower().startswith(("note:", "see "))]

def ask(rule_name, rule, impl):
    qs = {}
    for i, s in enumerate(sents(rule)):
        qs[f"R{i}"] = {"type": "noul", "instructions": f"The implementation does what this requirement of the rule says (same sources, conditions, numbers): \"{s[:400]}\""}
    for i, s in enumerate(sents(impl)):
        qs[f"I{i}"] = {"type": "noul", "instructions": f"This statement about the implementation is consistent with the rule and adds nothing the rule forbids: \"{s[:400]}\""}
    res = pilot.call({"rule": rule[:1800], "implementation": impl}, qs, "jev-latest")["answers"]
    r = {k: v["noul"] for k, v in res.items() if k[0] == "R"}
    i = {k: v["noul"] for k, v in res.items() if k[0] == "I"}
    return r, i

def main():
    form = sys.argv[1]
    pilot.KEY = pilot.load_key()
    rng = random.Random(2)
    spec = {r["line"]: r for r in json.load(open(pilot.SPEC / f"{form}.json", encoding="utf8"))["rows"]}
    impl = entries(form)
    rows = []
    for ln, text in impl.items():
        rule = spec[ln]["rule"]
        rs, is_ = ask(spec[ln]["name"], rule, text)
        peers = [t for k, t in impl.items() if k != ln]
        crs, cis = ask(spec[ln]["name"], rule, rng.choice(peers)) if peers else ({}, {})
        mut = []
        for _ in range(3):
            m = mutate(text, rng)
            if m:
                mr, mi = ask(spec[ln]["name"], rule, m[0])
                mut.append({"what": m[1], "rmin": min(mr.values()), "imin": min(mi.values())})
        rows.append({"line": form + ln, "name": spec[ln]["name"], "rule_sents": sents(rule), "impl_sents": sents(text),
                     "R": rs, "I": is_, "ctrl_rmin": min(crs.values()) if crs else None, "ctrl_imin": min(cis.values()) if cis else None, "mut": mut})
    json.dump(rows, open(HERE / "out" / f"sentence-{form}.json", "w"), indent=1)
    avg = lambda xs: sum(xs) / max(1, len(xs))
    t_r = [min(r["R"].values()) for r in rows]; t_i = [min(r["I"].values()) for r in rows]
    print(f"form {form}: {len(rows)} lines")
    print(f"  rule-coverage min    true {avg(t_r):.2f}  control {avg([r['ctrl_rmin'] for r in rows if r['ctrl_rmin'] is not None]):.2f}  mutant {avg([m['rmin'] for r in rows for m in r['mut']]):.2f}")
    print(f"  impl-consistency min true {avg(t_i):.2f}  control {avg([r['ctrl_imin'] for r in rows if r['ctrl_imin'] is not None]):.2f}  mutant {avg([m['imin'] for r in rows for m in r['mut']]):.2f}")
    flagged = sum(min(m["rmin"], m["imin"]) < min(min(r["R"].values()), min(r["I"].values())) - 0.3 for r in rows for m in r["mut"])
    print(f"  mutants clearly worse than own true: {flagged}/{sum(len(r['mut']) for r in rows)}\n")
    for r in rows:
        print(f"== {r['line']} {r['name'][:60]}")
        for k, s in zip(sorted(r["R"], key=lambda x: int(x[1:])), r["rule_sents"]):
            if r["R"][k] < 0.5: print(f"   RULE not covered ({r['R'][k]:.2f}): {s[:150]}")
        for k, s in zip(sorted(r["I"], key=lambda x: int(x[1:])), r["impl_sents"]):
            if r["I"][k] < 0.5: print(f"   IMPL not supported ({r['I'][k]:.2f}): {s[:150]}")

if __name__ == "__main__":
    main()
