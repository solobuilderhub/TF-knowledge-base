#!/usr/bin/env python3
"""
Compare AuraTax's line dictionary and flows with ca-tax's form registry.

Inputs (both produced in this folder):
  ca-tax-forms.json     node tools/dump-ca-tax-forms.mjs
  <prog>/lines.csv      python -I tools/extract.py

Output: compare/<prog>.md and compare/<prog>-lines.csv

Read the result as "where do the two disagree", never as "which is right".
For AT1, ca-tax is TRA-certified, so a disagreement mostly measures AuraTax.
For T2, neither side is authoritative: the CRA form decides.

Usage: python -I tools/compare.py [at1 t2]
"""

from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent.parent


def norm_caption(s: str) -> str:
    s = unicodedata.normalize("NFKC", s or "").lower()
    s = s.replace("’", "'").replace("–", "-").replace("—", "-").replace("“", '"').replace("”", '"')
    s = re.sub(r"\s+", " ", s).strip(" .:;")
    return s


STOP = {"the", "of", "a", "an", "for", "to", "in", "on", "and", "or", "from", "per", "line", "lines",
        "amount", "enter", "add", "deduct", "less", "plus", "minus", "if", "is", "at", "by", "—", "-"}


def similarity(a: str, b: str) -> float:
    """Token overlap of two captions, ignoring filler words: 1.0 = same words."""
    ta = {t for t in re.findall(r"[a-z0-9&]+", norm_caption(a)) if t not in STOP}
    tb = {t for t in re.findall(r"[a-z0-9&]+", norm_caption(b)) if t not in STOP}
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / min(len(ta), len(tb))


def sched3(s: str) -> str:
    return s.zfill(3) if s.isdigit() and len(s) < 3 else s


def ca_form_to_ref(form: str) -> tuple[str, str] | None:
    """ca-tax form id -> (program, AuraTax schedule code)."""
    if form == "T2":
        return "t2", "200"
    if form == "AT1":
        return "at1", "000"
    if form == "AT4970":
        return "at1", "4970"
    m = re.fullmatch(r"(T2|AT1)SCH0*(\d+)", form)
    if m:
        return ("t2" if m.group(1) == "T2" else "at1"), m.group(2).zfill(3)
    return None


def ca_line(program: str, schedule: str, line: str) -> str:
    """AT1's 9-digit TRA reference `012002001` -> `002`. T2 lines are already 3-digit."""
    if program == "AT1" and re.fullmatch(r"\d{9}", line):
        return line[3:6]
    return line


def ca_ref_str(ref: dict | None) -> str:
    if not ref:
        return ""
    form = ref.get("form", "")
    if form == "T661":  # filed as T2 Schedule 32
        form = "T2SCH32"
    mapped = ca_form_to_ref(form)
    line = ref.get("line") or ""
    if mapped is None:
        return f"{ref.get('form')} {line}".strip()
    prog, sched = mapped
    if prog == "at1" and re.fullmatch(r"\d{9}", line):
        line = line[3:6]
    return f"{prog.upper()} {sched}#{line}"


def aura_refs(cell: str, prog: str) -> list[str]:
    """`T2 Sch 001 line 403; Sch 012 line 054` -> ['T2 001#403', 'AT1 012#054']."""
    out = []
    for part in filter(None, (p.strip() for p in cell.split(";"))):
        m = re.match(r"(?:(T2|linked provincial return) )?Sch (\S+) (?:line (\S+)|.*\[(\S+)\])", part)
        if not m:
            out.append(part)
            continue
        owner = m.group(1)
        p = ("T2" if owner == "T2" else "PROV") if owner else prog.upper()
        out.append(f"{p} {m.group(2)}#{m.group(3) or m.group(4)}")
    return out


def compare(prog: str) -> None:
    ca = json.loads((HERE / "ca-tax-forms.json").read_text(encoding="utf-8"))
    PROG = prog.upper()
    ca_lines: dict[tuple[str, str], dict] = {}
    ca_forms = {}
    for form in ca["forms"]:
        if form["program"] != PROG:
            continue
        sched = sched3(form["schedule"])
        ca_forms[sched] = form
        for f in form["fields"]:
            key = (sched, ca_line(PROG, sched, f["line"]))
            ca_lines.setdefault(key, f)

    aura_rows = list(csv.DictReader((HERE / prog / "lines.csv").open(encoding="utf-8-sig")))
    aura: dict[tuple[str, str], dict] = {}
    for r in aura_rows:
        if r["line"].isdigit() and r["schedule"] in ca_forms:
            aura.setdefault((r["schedule"], r["line"]), r)

    rows = []
    stats = defaultdict(lambda: defaultdict(int))
    for key in sorted(set(ca_lines) | set(aura)):
        sched, line = key
        c, a = ca_lines.get(key), aura.get(key)
        cap_c = c["caption"] if c else ""
        cap_a = a["caption"] if a else ""
        sim = similarity(cap_c, cap_a) if c and a else 0.0
        if c and a:
            verdict = ("same" if cap_c == cap_a else
                       "same after normalising" if norm_caption(cap_c) == norm_caption(cap_a) else
                       "reworded" if sim >= 0.5 else
                       "different meaning?")
        else:
            verdict = "only in ca-tax" if c else "only in AuraTax"
        stats[sched][verdict] += 1
        from_c = ca_ref_str(c.get("from")) if c else ""
        from_a_all = aura_refs(a["from"], prog) if a else []
        # AuraTax often routes a value through its own working amount (`013#a11_T1_TTC17`);
        # only references to a numbered line can be compared with ca-tax's.
        from_a = [r for r in from_a_all if re.search(r"#\d+$", r)]
        to_c = ca_ref_str(c.get("to")) if c else ""
        to_a = "; ".join(aura_refs(a["to"], prog)) if a else ""
        flow = ""
        if c and a and (from_c or from_a_all):
            if from_c and from_c in from_a:
                flow = "from agrees"
            elif from_c and from_a:
                flow = "from differs"
            elif from_c and from_a_all:
                flow = "from indirect in AuraTax"
            elif from_c:
                flow = "from only in ca-tax"
            else:
                flow = "from only in AuraTax"
        from_a = "; ".join(from_a_all)
        if flow:
            stats[sched][flow] += 1
        rows.append({
            "schedule": sched, "line": line, "verdict": verdict, "caption_similarity": f"{sim:.2f}",
            "ca_tax_caption": cap_c, "auratax_caption": cap_a,
            "ca_tax_role": c["role"] if c else "", "auratax_kind": a["kind"] if a else "",
            "ca_tax_from": from_c, "auratax_from": from_a, "from_check": flow,
            "ca_tax_to": to_c, "auratax_to": to_a,
            "auratax_rules": a["rules"] if a else "",
        })

    out = HERE / "compare"
    out.mkdir(exist_ok=True)
    with (out / f"{prog}-lines.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    cols = ["same", "same after normalising", "reworded", "different meaning?", "only in ca-tax",
            "only in AuraTax", "from agrees", "from differs", "from indirect in AuraTax",
            "from only in ca-tax", "from only in AuraTax"]
    md = [f"# {PROG}: AuraTax vs ca-tax {ca['caTaxVersion']}", "",
          "Lines compared only on schedules ca-tax defines. "
          + ("ca-tax's AT1 is TRA-certified, so disagreements mostly measure AuraTax; "
             "each one still goes to the TRA specification before anyone concludes."
             if prog == "at1" else
             "Neither side is the authority: every disagreement is settled by the CRA form in the KB."),
          "", "| Schedule | " + " | ".join(cols) + " |", "|---|" + "---|" * len(cols)]
    totals = defaultdict(int)
    for sched in sorted(stats):
        md.append(f"| {sched} | " + " | ".join(str(stats[sched].get(c, 0) or "") for c in cols) + " |")
        for c in cols:
            totals[c] += stats[sched].get(c, 0)
    md.append("| **all** | " + " | ".join(f"**{totals[c]}**" for c in cols) + " |")

    review = [r for r in rows if r["verdict"] == "different meaning?" or r["from_check"] == "from differs"]
    md += ["", f"## To check against the primary document ({len(review)})", "",
           "Captions that share under half their words, and flows where both sides name a "
           "different numbered line.", "",
           "| Sch | Line | Why | ca-tax | AuraTax |", "|---|---|---|---|---|"]
    for r in review:
        why = "flow" if r["from_check"] == "from differs" else "caption"
        left = r["ca_tax_from"] if why == "flow" else r["ca_tax_caption"]
        right = r["auratax_from"] if why == "flow" else r["auratax_caption"]
        if why == "flow":
            left, right = f"{left} ({r['ca_tax_caption']})", right
        md.append(f"| {r['schedule']} | {r['line']} | {why} | {left.replace('|', '/')} | {right.replace('|', '/')} |")
    md += ["", f"Every line: `compare/{prog}-lines.csv`."]
    (out / f"{prog}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"{prog}: " + ", ".join(f"{c}={totals[c]}" for c in cols))


if __name__ == "__main__":
    for p in sys.argv[1:] or ["at1", "t2"]:
        compare(p)
