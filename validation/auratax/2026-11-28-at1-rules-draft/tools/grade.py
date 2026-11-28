#!/usr/bin/env python3
"""
Grade an AuraTax-derived rules draft against the real specification (AT1 Chapter 3).

Reads the KB's verbatim Chapter 3 rule book (knowledge-base/formulas/at1/*.md) and
the draft (draft.csv), and for every line Chapter 3 defines measures:
  - coverage: does the draft have the line, and any rule for it?
  - references: which lines / federal lines does each side's rule name, and how
    many of Chapter 3's does the draft also name (recall)?
  - M/O/X: does the draft's Mandatory/Optional/Conditional match?
  - by kind of Chapter 3 rule (must equal / arithmetic / presence / constraint /
    instruction): how often does the draft carry something for it?

Usage: python -I grade.py --rulebook <kb>/knowledge-base/formulas/at1 --draft draft.csv --out <dir>
"""
import argparse
import csv
import json
import random
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ap = argparse.ArgumentParser()
for a in ("--rulebook", "--draft", "--out"):
    ap.add_argument(a, required=True)
A = ap.parse_args()
OUT = Path(A.out)

# ── Chapter 3, verbatim ───────────────────────────────────────────────────────
c3 = {}
for f in sorted(Path(A.rulebook).glob("*.md")):
    m = re.match(r"(\d{3,4}|EDI)-", f.name)
    if not m:
        continue
    sch = m.group(1)
    for line in f.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| Line") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 7 or not re.fullmatch(r"\d{3}", cells[0]):
            continue
        key = (sch, cells[0])
        if key not in c3:  # first occurrence
            c3[key] = {"name": cells[1], "type": cells[2], "mox": cells[3], "rule": cells[5], "page": cells[6]}

draft = {(r["schedule"], r["line"]): r for r in csv.DictReader(open(A.draft, encoding="utf-8-sig"))}


def kinds_of(t):
    t = t.lower()
    k = set()
    if re.search(r"\bcalculate\b|\bsum of\b|\s[+\-x]\s\d{6}|multipl|divid", t):
        k.add("arithmetic")
    if re.search(r"must equal|value must equal|must be equal", t):
        k.add("must equal")
    if re.search(r"must exist|is mandatory|must be completed|must be provided|is required|then .* must exist", t):
        k.add("presence")
    if re.search(r"do not allow|cannot|must not|not allowed|can only|valid date|format|yyyy|must be (a valid|between|greater|less|positive|negative)", t):
        k.add("constraint")
    if re.search(r"^enter|\benter the\b|\bdo not include\b", t):
        k.add("instruction")
    return k or ({"other"} if t and t not in ("—", "-") else set())


AT1_FORMS = {f"{i:03d}" for i in range(30)}


def c3_refs(rule, sch):
    """Fields Chapter 3 names: 012004 (Alberta form+line), fed 200300 / fed 1001060 (federal).
    A bare code whose form is not an AT1 form (032429, 200355) is federal."""
    refs = set()
    for m in re.finditer(r"fed\s*(\d{3})(\d{3,4})\b", rule):
        refs.add(("T2", m.group(1), m.group(2)))
    for m in re.finditer(r"(?<!fed )(?<!fed)(?<!\d)(\d{3})(\d{3})(\d{3})?(?!\d)", rule):
        refs.add(("AT1" if m.group(1) in AT1_FORMS else "T2", m.group(1), m.group(2)))
    return refs


def _nums(token):
    """'338' -> ['338'];  '{each of [429, 431, 432]}' -> ['429', '431', '432']"""
    return re.findall(r"\d{3,4}", token)


def draft_refs(rule, sch):
    refs = set()
    text = rule
    taken = []
    # validator messages: "line 403 of the federal Schedule 1", "line 910 from federal Schedule 006",
    # "line 300 of the federal T2 return"
    for m in re.finditer(r"line ⟨?(\d{3})⟩? (?:of|from) (?:the )?federal Schedule ⟨?(\d+)⟩?", text):
        refs.add(("T2", m.group(2).zfill(3), m.group(1))); taken.append(m.span())
    for m in re.finditer(r"line ⟨?(\d{3})⟩? of the federal T2 return", text):
        refs.add(("T2", "200", m.group(1))); taken.append(m.span())
    # references to another schedule, single lines or lists: T2 Sch 200: line {each of [311, 312]}
    LINE = r"(?: \([^)]*\))?:? line (\{each of \[[^\]]*\]\}|\d{3,4})"
    for m in re.finditer(r"T2 Sch (\w+)" + LINE, text):
        for n in _nums(m.group(2)):
            refs.add(("T2", m.group(1).zfill(3), n))
        taken.append(m.span())
    for m in re.finditer(r"(?<!T2 )Sch (\d{3})" + LINE, text):
        for n in _nums(m.group(2)):
            refs.add(("AT1", m.group(1), n))
        taken.append(m.span())
    # what is left: lines of this schedule
    rest = list(text)
    for a, b in taken:
        rest[a:b] = " " * (b - a)
    for m in re.finditer(r"line ⟨?(\{each of \[[^\]]*\]\}|\d{3})⟩?", "".join(rest)):
        for n in _nums(m.group(1)):
            refs.add(("AT1", sch, n))
    return refs


results = []
for key, c in c3.items():
    sch, line = key
    d = draft.get(key)
    crule = c["rule"] if c["rule"] not in ("—", "-") else ""
    drule = d["rule"] if d else ""
    cr = {r for r in c3_refs(crule, sch) if r != ("AT1", sch, line)}
    dr = {r for r in draft_refs(drule, sch) if r != ("AT1", sch, line)}
    hit = cr & dr
    results.append({
        "schedule": sch, "line": line, "name": c["name"], "page": c["page"],
        "in_draft": bool(d), "c3_has_rule": bool(crule), "draft_has_rule": bool(drule),
        "c3_kinds": ",".join(sorted(kinds_of(crule))),
        "draft_formula": bool(d and int(d["n_formula"])), "draft_check": bool(d and int(d["n_check"])),
        "draft_rule_flags": bool(d and int(d["n_rule"])),
        "c3_mox": c["mox"], "draft_mox": (d["mox"] if d else "") or "",
        "c3_refs": " ".join(sorted("/".join(r) for r in cr)), "draft_refs": " ".join(sorted("/".join(r) for r in dr)),
        "ref_recall": (len(hit) / len(cr)) if cr else None,
        "c3_rule": crule, "draft_rule": drule,
    })

OUT.mkdir(parents=True, exist_ok=True)
with open(OUT / "grading.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(results[0].keys()))
    w.writeheader()
    w.writerows(results)

# ── summary ───────────────────────────────────────────────────────────────────
N = len(results)
with_rule = [r for r in results if r["c3_has_rule"]]
pct = lambda a, b: f"{(100 * a / b):.0f}%" if b else "—"
in_draft = sum(r["in_draft"] for r in results)
covered = sum(r["draft_has_rule"] for r in with_rule)
withrefs = [r for r in with_rule if r["ref_recall"] is not None]
full = sum(r["ref_recall"] == 1 for r in withrefs)
some = sum(0 < r["ref_recall"] < 1 for r in withrefs)
none_ = sum(r["ref_recall"] == 0 for r in withrefs)
mox_known = [r for r in results if r["draft_mox"]]
mox_agree = sum(r["draft_mox"] == r["c3_mox"] for r in mox_known)
c3_m = [r for r in results if r["c3_mox"] == "M"]
kind_rows = defaultdict(lambda: [0, 0])
for r in with_rule:
    for k in r["c3_kinds"].split(","):
        if not k:
            continue
        kind_rows[k][0] += 1
        has = {"arithmetic": r["draft_formula"] or r["draft_check"], "must equal": r["draft_formula"] or r["draft_check"],
               "presence": r["draft_rule_flags"] or r["draft_check"], "constraint": r["draft_rule_flags"] or r["draft_check"],
               "instruction": r["draft_has_rule"], "other": r["draft_has_rule"]}[k]
        kind_rows[k][1] += bool(has)

by_sch = defaultdict(lambda: Counter())
for r in results:
    s = by_sch[r["schedule"]]
    s["lines"] += 1
    s["c3_rule"] += r["c3_has_rule"]
    s["covered"] += r["c3_has_rule"] and r["draft_has_rule"]
    if r["ref_recall"] is not None and r["c3_has_rule"]:
        s["withrefs"] += 1
        s["full"] += r["ref_recall"] == 1

summary = {
    "chapter3_lines": N, "lines_in_draft": in_draft, "chapter3_lines_with_rule": len(with_rule),
    "draft_has_a_rule_for_them": covered, "rules_naming_fields": len(withrefs),
    "all_fields_also_in_draft": full, "some_fields": some, "no_fields": none_,
    "mox_given_by_draft": len(mox_known), "mox_agree": mox_agree, "chapter3_mandatory": len(c3_m),
    "chapter3_mandatory_marked_M_by_draft": sum(r["draft_mox"] == "M" for r in c3_m),
}
(OUT / "grading.json").write_text(json.dumps(summary, indent=1) + "\n", encoding="utf-8")

random.seed(3)
sample = random.sample([r for r in with_rule if r["in_draft"]], 12)
esc = lambda s: str(s).replace("|", "\\|").replace("\n", " ")
md = [
    "# Grading: AuraTax-derived AT1 draft vs Chapter 3", "",
    "Each line Chapter 3 defines, compared with the draft built from AuraTax (`draft.csv`). Every row: `grading.csv`.", "",
    "## Overall", "",
    "| | |", "|---|---|",
    f"| Lines Chapter 3 defines | {N} |",
    f"| …that the draft has (AuraTax's line dictionary) | {in_draft} ({pct(in_draft, N)}) |",
    f"| Chapter 3 lines with a business rule | {len(with_rule)} |",
    f"| …for which the draft has any rule at all | {covered} ({pct(covered, len(with_rule))}) |",
    f"| Chapter 3 rules that name other lines or federal lines | {len(withrefs)} |",
    f"| …where the draft names **all** the same lines | {full} ({pct(full, len(withrefs))}) |",
    f"| …where it names **some** of them | {some} ({pct(some, len(withrefs))}) |",
    f"| …where it names **none** of them | {none_} ({pct(none_, len(withrefs))}) |",
    f"| Lines the draft gives an M/O/X for | {len(mox_known)} (agrees with Chapter 3: {mox_agree}) |",
    f"| Chapter 3 mandatory (M) lines | {len(c3_m)} (draft marks {summary['chapter3_mandatory_marked_M_by_draft']} as M) |",
    "",
    "## By kind of Chapter 3 rule", "",
    "A rule can be of several kinds. \"Draft carries something\" means: a formula or check for must-equal and arithmetic;",
    "a rule flag or check for presence and constraints; any rule for instructions.", "",
    "| Kind | Chapter 3 rules | Draft carries something | Share |", "|---|---|---|---|",
    *[f"| {k} | {v[0]} | {v[1]} | {pct(v[1], v[0])} |" for k, v in sorted(kind_rows.items(), key=lambda x: -x[1][0])],
    "",
    "## By schedule", "",
    "| Schedule | Lines | With a Chapter 3 rule | Draft has a rule | Rules naming fields | All fields matched |", "|---|---|---|---|---|---|",
    *[f"| {s} | {c['lines']} | {c['c3_rule']} | {c['covered']} ({pct(c['covered'], c['c3_rule'])}) | {c['withrefs']} | {c['full']} ({pct(c['full'], c['withrefs'])}) |"
      for s, c in sorted(by_sch.items())],
    "",
    "## Side by side: a random sample", "",
]
for r in sample:
    md += [f"### Sch {r['schedule']} line {r['line']}: {esc(r['name'])} (Chapter 3 p.{r['page']})", "",
           f"- **Chapter 3** ({r['c3_mox']}): {esc(r['c3_rule'])}",
           f"- **Draft** ({r['draft_mox'] or '—'}): {esc(r['draft_rule']).replace(' ‖ ', ' · ') or '(nothing)'}",
           f"- Fields: Chapter 3 `{r['c3_refs'] or '-'}`, draft `{r['draft_refs'] or '-'}`", ""]
(OUT / "grading.md").write_text("\n".join(md) + "\n", encoding="utf-8")
print(json.dumps(summary))
