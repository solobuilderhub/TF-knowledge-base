#!/usr/bin/env python3
"""Text-vs-text test: can Jev tell a rule's own normalised formula from a corrupted one?
(The rule book's `expr` is the formula as parsed from the rule; mutants change one
operator, constant or line.) If it can, an implemented-formula text file is worth
building; if it cannot, prose-vs-formula checks by Jev are not trustworthy."""
import concurrent.futures as cf, glob, json, random, re, sys
import pilot

pilot.KEY = pilot.load_key()
rng = random.Random(5)
rows = []
for f in sorted(glob.glob(str(pilot.SPEC / "[0-9]*.json"))):
    d = json.load(open(f, encoding="utf8"))
    rows += [(d["form"], r) for r in d["rows"] if r.get("expr")]
Q = {"type": "noul", "instructions": "The candidate formula states exactly the same calculation as the rule: same operands, same operators, same constants."}

def mutate(e):
    c = []
    m = re.search(r" ([+\-*/]) ", e)
    if m:
        o = {"+": "-", "-": "+", "*": "/", "/": "*"}[m.group(1)]
        c.append((e[: m.start()] + f" {o} " + e[m.end():], "operator"))
    m = re.search(r"\b(\d+(?:\.\d+)?)\b", e)
    if m and not re.fullmatch(r"\d{6,9}", m.group(1)):
        c.append((e[: m.start()] + str(float(m.group(1)) * 2).rstrip("0").rstrip(".") + e[m.end():], "constant"))
    refs = re.findall(r"\b\d{6,9}\b", e)
    if len(refs) >= 2:
        c.append((e.replace(refs[0], refs[1], 1), "operand"))
    return rng.choice(c) if c else None

def ask(r, cand):
    res = pilot.call({"specification": {"line_name": r["name"], "business_rule": r["rule"][:1500]}, "candidate_formula": cand}, {"ok": Q}, "jev-latest")
    return res["answers"]["ok"]["noul"]

def run(x):
    form, r = x
    out = {"line": form + r["line"], "true": ask(r, r["expr"])}
    m = mutate(r["expr"])
    if m:
        out["mutant"], out["kind"] = ask(r, m[0]), m[1]
    return out

with cf.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(run, rows))
mu = [r for r in res if "mutant" in r]
print(f"formulas {len(res)}  mean true {sum(r['true'] for r in res)/len(res):.2f}  mean mutant {sum(r['mutant'] for r in mu)/len(mu):.2f}")
print(f"AUC true vs mutant {pilot.auc([r['true'] for r in mu],[r['mutant'] for r in mu]):.3f}   caught (mutant < true-0.3): {sum(r['mutant']<r['true']-0.3 for r in mu)}/{len(mu)}")
for k in ("operator", "constant", "operand"):
    s = [r for r in mu if r["kind"] == k]
    if s: print(f"  {k:9} n={len(s):3} caught {sum(r['mutant']<r['true']-0.3 for r in s)}  mean true {sum(r['true'] for r in s)/len(s):.2f} mutant {sum(r['mutant'] for r in s)/len(s):.2f}")
json.dump(res, open("out/expr-results.json", "w"), indent=1)
