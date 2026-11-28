#!/usr/bin/env python3
"""
Merge what AuraTax knows about each line into a Chapter-3-style rules draft.

One page per schedule, one row per numbered line, in the columns of TRA's AT1
Chapter 3 cross-reference tables: Line, Name, Type, Length, +/-, M/O/X,
Business rule, plus the AuraTax source of every statement.

Inputs (all produced by our own tools from the installed AuraTax):
  --lines       <form-data register>/<prog>/lines.csv   (line dictionary + rule flags)
  --formulas    formulas.csv    (node formulas.mjs --program <prog>)
  --validators  validators.csv  (node formulas.mjs --program <prog> --validators)

Usage: python -I draft.py --program AT1 --lines .. --formulas .. --validators .. --out <dir>
Not a primary source: AuraTax's reading of the forms, written in Chapter 3's shape.
"""
import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ap = argparse.ArgumentParser()
for a in ("--program", "--lines", "--formulas", "--validators", "--out"):
    ap.add_argument(a, required=True)
A = ap.parse_args()
OUT = Path(A.out)
(OUT / "schedules").mkdir(parents=True, exist_ok=True)


def read(p):
    return list(csv.DictReader(open(p, encoding="utf-8-sig")))


lines = [r for r in read(A.lines) if r["line"].isdigit()]
formulas = defaultdict(list)
for r in read(A.formulas):
    formulas[(r["schedule"], r["line"])].append(r)
checks = defaultdict(list)
schedule_checks = defaultdict(list)
for r in read(A.validators):
    if r["line"].isdigit():
        checks[(r["schedule"], r["line"])].append(r)
    else:
        schedule_checks[r["schedule"]].append(r)

SINGLE_REF = re.compile(r"^\(?(T2 Sch \w+:? |Sch \w+:? )?(line \d+|amount \S+ \[\w+\]|\[\w+\])\)?( \(when [^)]*\))?$")


def mox(raw):
    try:
        rule = json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        return ""
    if rule.get("required") is True:
        return "M"
    if any(k.startswith("requiredIf") for k in rule):
        return "X"
    return ""


def formula_statement(e, line):
    f = e["formula"]
    if f in (f"line {line}",):
        return None  # a line re-saved with its own value so its sign rules apply: not a rule
    if e["kind"].startswith("reset"):
        return None
    if e["kind"].startswith("total"):
        stmt = f"Total: {f}"
    elif SINGLE_REF.match(f) or f in ("0", "blank"):
        stmt = f"Must equal {f}" if f not in ("0", "blank") else f"Set to {f}"
    else:
        stmt = f"Calculate: {f}"
    if e["conditions"]:
        stmt = f"If {e['conditions']}: {stmt}"
    return stmt


rows = []
by_sch = defaultdict(list)
for r in lines:
    key = (r["schedule"], r["line"])
    stmts, basis = [], []
    for e in sorted(formulas.get(key, []), key=lambda x: int(x["run_order"] or 0)):
        s = formula_statement(e, r["line"])
        if s:
            stmts.append(("formula", s))
            basis.append(f"formula {e['module'].replace('calculators/', '')}·{e['function'] or e['export']}" if e["chunk_line"] != "0" else "total-index.json")
    for g in [x.strip() for x in r["rules"].split(";") if x.strip()]:
        stmts.append(("rule", f"Rule: {g}"))
    if r["rules"]:
        basis.append("rule flags (extras)")
    for c in checks.get(key, []):
        sev = c["severity"] or "check"
        stmts.append(("check", f"Check ({sev}): {c['message']}"))
        basis.append(f"validator {c['module'].replace('validators/', '')}·{c['line']}")
    row = {
        "schedule": r["schedule"], "line": r["line"], "name": r["caption"], "type": r["type"],
        "length": r["length"], "sign": r["sign"], "mox": mox(r["rules_raw"]),
        "rule": " ‖ ".join(s for _, s in stmts),
        "n_formula": sum(k == "formula" for k, _ in stmts), "n_rule": sum(k == "rule" for k, _ in stmts),
        "n_check": sum(k == "check" for k, _ in stmts), "basis": "; ".join(dict.fromkeys(basis)),
        "check_conditions": " ‖ ".join(c["conditions"] for c in checks.get(key, [])),
    }
    rows.append(row)
    by_sch[r["schedule"]].append(row)

with open(OUT / "draft.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

esc = lambda s: str(s).replace("|", "\\|").replace("\n", " ")
for sch, rs in sorted(by_sch.items()):
    md = [f"# {A.program} Sch {sch}: rules draft (derived from AuraTax)", "",
          "Chapter-3-style table built from AuraTax's line dictionary, rule flags, calculator formulas and validator",
          "messages. **Not a primary source.** Every statement names its AuraTax source in the Basis column.", ""]
    if schedule_checks.get(sch):
        md += ["**Schedule-level checks:**", ""] + [f"- ({c['severity'] or 'check'}) {esc(c['message'])}" for c in schedule_checks[sch]] + [""]
    md += ["| Line | Name | Type | Length | +/- | M/O/X | Business rule (derived) | Basis |", "|---|---|---|---|---|---|---|---|"]
    for r in rs:
        md.append(f"| {r['line']} | {esc(r['name'])} | {r['type']} | {r['length']} | {esc(r['sign'])} | {r['mox'] or '—'} | "
                  f"{esc(r['rule']).replace(' ‖ ', '<br>') or '—'} | {esc(r['basis'])} |")
    (OUT / "schedules" / f"{sch}.md").write_text("\n".join(md) + "\n", encoding="utf-8")

with_rule = sum(1 for r in rows if r["rule"])
print(json.dumps({"lines": len(rows), "with_rule": with_rule, "formula": sum(r["n_formula"] > 0 for r in rows),
                  "rule_flags": sum(r["n_rule"] > 0 for r in rows), "checks": sum(r["n_check"] > 0 for r in rows),
                  "schedules": len(by_sch)}))
