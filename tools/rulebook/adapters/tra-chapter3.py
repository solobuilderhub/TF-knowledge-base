#!/usr/bin/env python3
"""
TRA AT1 Net File specification, Chapter 3 (§3.2.3 cross-reference tables)
→ packages/ca-tax/spec/at1/forms/<form>.json (one file per form, one row per line)
  + packages/ca-tax/spec/at1/manifest.json

The spec is "Protected A": the verbatim rules live only in ca-tax's PRIVATE
repository (spec/ is not in the published package) and in research/.

One row per printed line of every CURRENT AT1 form (the jacket and TRA's
fourteen published schedules): its name, type, length, sign, M/O/X, the
BUSINESS RULE verbatim, the page it is printed on, and — parsed out of the
rule, never instead of it — the lines it references and, where the rule is a
pure arithmetic formula, that formula as an expression.

Reads the PDF by word position (PyMuPDF), never a text dump: `pdftotext`
detaches codes from rows and mangles glyphs (the ¾ in Schedule 14 became �).

Every column's x is read from the page's OWN header — pages shift by ~10pt —
anchored on the stacked "M / O / X" header, which every table page carries:

    code      x < 75
    name      after the code, up to the "Type" header
    type      under "Type";  length under "Length";  sign under "+/-"
    M/O/X     under the stacked header
    rule      after the M/O/X column, up to the "Map" header

A row runs from its code down to the next code or section marker. Text above
a page's first marker continues the previous page's last row — rules cross
page breaks.

Legacy forms are not extracted (decided 2026-09-30; evidence in
research/evidence/at1-schedule-universe/): Schedules 5-9, 11, 14, and
Schedule 12 lines 010-013.

    python tra-chapter3.py            # write forms/*.json + manifest.json
    python tra-chapter3.py --report   # coverage per form, write nothing
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parents[2]
SPEC = RESEARCH / "sources" / "tra-spec" / "AT1-Chapter3-2026.4.pdf"
#: The versioned home of the extracted rules: ca-tax (research/ is not a git
#: repository). The renderer there writes the engine module and the
#: knowledge-base pages from this one file.
OUT = RESEARCH.parent / "packages" / "ca-tax" / "spec" / "at1"
RULESET = "at1-tra-ch3-2026.4"

HEADING = re.compile(r"3\.2\.3\.\d+\s+(?:Schedule\s+(\d+)|(AT1)\s*-)")
CODE = re.compile(r"^\d{3}$")
SECTION = re.compile(r"^(?!AT1$)[A-Z][A-Z0-9]{2,}$")
STRICTNESS = {"O": 0, "X": 1, "M": 2}
TYPES = ("$", "N", "AN", "A", "D", "%")
FOOTER = re.compile(r"^(Page|Version|August|Classification:?)$")

#: Not extracted — see the module docstring.
LEGACY_FORMS = {"005", "006", "007", "008", "009", "011", "014"}
LEGACY_LINES = {"012": {"010", "011", "012", "013"}}

#: Printed titles, for file names and headings (TRA's published list).
TITLES = {
    "000": "AT1 Alberta Corporate Income Tax Return (jacket)",
    "001": "Schedule 1 — Alberta Small Business Deduction",
    "002": "Schedule 2 — Alberta Income Allocation Factor",
    "003": "Schedule 3 — Alberta Other Tax Deductions and Credits",
    "004": "Schedule 4 — Alberta Foreign Investment Income Tax Credit",
    "010": "Schedule 10 — Alberta Loss Carry-Back Application",
    "012": "Schedule 12 — Alberta Income/Loss Reconciliation",
    "013": "Schedule 13 — Alberta Capital Cost Allowance",
    "015": "Schedule 15 — Alberta Resource Related Deductions",
    "016": "Schedule 16 — Alberta Scientific Research Expenditures",
    "017": "Schedule 17 — Alberta Reserves",
    "018": "Schedule 18 — Alberta Dispositions of Capital Property",
    "020": "Schedule 20 — Alberta Charitable Donations & Gifts Deduction",
    "021": "Schedule 21 — Alberta Calculation of Current Year Loss and Continuity of Losses",
    "029": "Schedule 29 — Alberta Innovation Employment Grant",
}

#: A floor per form — catches a collapsed parse, not drift.
EXPECTED_MIN = {
    "000": 60, "001": 6, "002": 35, "010": 18, "012": 45, "013": 18,
    "015": 80, "018": 30, "020": 15, "021": 28, "029": 30,
}


# ── page structure ──────────────────────────────────────────────────────────

def heading_of(words: list) -> str | None:
    lines: dict[int, list[tuple[float, str]]] = {}
    for x0, y0, _x1, _y1, word, *_ in words:
        if y0 < 100:
            lines.setdefault(round(y0), []).append((x0, word))
    for _y, ws in sorted(lines.items()):
        m = HEADING.search(" ".join(w for _x, w in sorted(ws)))
        if m:
            return m.group(1).zfill(3) if m.group(1) else "000"
    return None


def columns(words: list) -> dict[str, float] | None:
    """Column x positions, read from this page's header."""
    tops = [w for w in words if w[4] in ("M", "O", "X") and w[1] < 200]
    mox = None
    for m in (w for w in tops if w[4] == "M"):
        for o in (w for w in tops if w[4] == "O"):
            for x in (w for w in tops if w[4] == "X"):
                if (abs(m[0] - o[0]) < 4 and abs(o[0] - x[0]) < 4
                        and 0 < o[1] - m[1] < 16 and 0 < x[1] - o[1] < 16):
                    mox = ((m[0] + x[0]) / 2, x[1])
                    break
            if mox:
                break
        if mox:
            break
    if mox is None:
        return None
    mx, bottom = mox

    def header_x(label: str, default: float) -> float:
        hits = [w[0] for w in words if w[4] == label and bottom - 40 < w[1] <= bottom + 2]
        return hits[0] if hits else default

    return {
        "mox": mx,
        "header_bottom": bottom,
        "type": header_x("Type", mx - 119),
        "length": header_x("Length", mx - 84),
        "sign": header_x("+/-", mx - 37),
        "map": header_x("Map", mx + 184),
    }


def footer_top(words: list) -> float:
    ys = [w[1] for w in words if FOOTER.match(w[4]) and w[1] > 480]
    return min(ys) if ys else 1e9


def printed_page(words: list) -> str | None:
    for i, w in enumerate(words):
        if w[4] == "Page" and i + 1 < len(words) and re.match(r"^\d-\d+$", words[i + 1][4]):
            return words[i + 1][4]
    return None


def text_of(words: list) -> str:
    """Words in reading order: lines by y, words by x; word-break hyphens rejoined."""
    lines: dict[int, list] = {}
    for w in words:
        key = round(w[1] / 3)
        lines.setdefault(key, []).append(w)
    out = ""
    for key in sorted(lines):
        line = " ".join(w[4] for w in sorted(lines[key], key=lambda w: w[0]))
        if not out:
            out = line
        elif re.search(r"[A-Za-z]-$", out) and re.match(r"^[a-z]", line):
            out += line  # "non-" + "capital" → "non-capital"
        else:
            out += " " + line
    return re.sub(r"\s+", " ", out).strip()


# ── extraction ──────────────────────────────────────────────────────────────

def extract() -> dict:
    doc = fitz.open(SPEC)
    forms: dict[str, dict] = {}
    headerless: list[int] = []
    last_row: dict | None = None  # the row a page-top continuation belongs to
    last_form: str | None = None
    # Conditional-section scope, per form: an X/O header opens it, an M header
    # closes it, an unmarked header continues whatever was open before it.
    scope: dict[str, str | None] = {}
    last_page: int = -2
    last_col: dict[str, float] | None = None

    for index, page in enumerate(doc):
        words = page.get_text("words")
        form = heading_of(words)
        continuation = False
        if form is None:
            # A table can run onto a page with no heading and no column header
            # (S15 lines 115 and 293 open pp. 147 and 167 at the very top).
            # Directly after a table page, such a page continues that form, in
            # the previous page's columns. Skipping it — as the first extractor
            # did — silently dropped those lines from the table.
            if last_form is None or last_page != index - 1 or last_col is None:
                continue
            if not any(CODE.match(w[4]) and w[0] < 75 for w in words):
                continue
            form, continuation = last_form, True
        col = last_col if continuation else columns(words)
        if col is None:
            if any(CODE.match(w[4]) and w[0] < 75 for w in words):
                headerless.append(index + 1)
            continue
        if continuation:
            # No header on the page: the body starts under the running head.
            col = {**col, "header_bottom": 48}
        if form != last_form:
            last_row = None
        last_form, last_page, last_col = form, index, col
        entry = forms.setdefault(form, {"pages": [], "rows": [], "sections": [], "title_rule": ""})
        entry["pages"].append(index + 1)
        printed = printed_page(words)

        top, bottom = col["header_bottom"] + 2, footer_top(words) - 2
        body = [w for w in words if top < w[1] < bottom]
        markers = sorted(
            (w for w in body if w[0] < 75 and (CODE.match(w[4]) or SECTION.match(w[4]))),
            key=lambda w: w[1],
        )

        def band(y0: float, y1: float) -> dict:
            ws = [w for w in body if y0 <= w[1] < y1]
            return {
                "name": [w for w in ws if 75 <= w[0] < col["type"] - 4],
                "type": [w for w in ws if col["type"] - 4 <= w[0] < col["length"] - 4],
                "length": [w for w in ws if col["length"] - 4 <= w[0] < col["sign"] - 4],
                "sign": [w for w in ws if col["sign"] - 4 <= w[0] < col["mox"] - 8],
                "mox": [w for w in ws if abs(w[0] - col["mox"]) < 9 and w[4] in ("M", "O", "X")],
                "rule": [w for w in ws if col["mox"] + 9 <= w[0] < col["map"] - 3],
            }

        # Continuation of the previous page's last row.
        first_y = markers[0][1] - 4 if markers else bottom
        cont = band(top, first_y)
        if last_row is not None and (cont["rule"] or cont["name"]):
            if cont["name"]:
                last_row["name"] = (last_row["name"] + " " + text_of(cont["name"])).strip()
            if cont["rule"]:
                last_row["rule"] = (last_row["rule"] + " " + text_of(cont["rule"])).strip()

        for i, marker in enumerate(markers):
            y0 = marker[1] - 4
            y1 = markers[i + 1][1] - 4 if i + 1 < len(markers) else bottom
            b = band(y0, y1)
            letter = sorted(b["mox"], key=lambda w: w[1])[0][4] if b["mox"] else None
            label = marker[4]
            if SECTION.match(label):
                section = {
                    "code": label,
                    "name": text_of(b["name"]),
                    "requirement": letter,
                    "rule": text_of(b["rule"]),
                    "page": {"pdf": index + 1, "printed": printed},
                }
                entry["sections"].append(section)
                if letter in ("X", "O"):
                    scope[form] = label
                elif letter == "M":
                    scope[form] = None
                last_row = section
                continue
            row = {
                "line": label,
                "name": text_of(b["name"]),
                "type": text_of(b["type"]) or None,
                "length": text_of(b["length"]) or None,
                "sign": text_of(b["sign"]) or None,
                "requirement": letter,
                "section": scope.get(form),
                "rule": text_of(b["rule"]),
                "page": {"pdf": index + 1, "printed": printed},
            }
            entry["rows"].append(row)
            last_row = row

    return {"forms": forms, "headerless": headerless}


# ── derivations (conveniences — the rule text stays the authority) ─────────

REF = re.compile(r"(?<![\d$,.])(fed\s+)?(\d{3})(\d{3,4})(\d{3})?(?![\d,])")
EXPR_OK = re.compile(r"^[\d\s+\-*/().]+$")


#: Every form number the AT1 specification defines, current or legacy. A
#: reference to any other form number can only be federal (there is no AT1
#: Schedule 32: "sum of 032429, 032431 and 032432" is federal T661 data).
AT1_FORM_NUMBERS = {"000", "001", "002", "003", "004", "005", "006", "007", "008", "009",
                    "010", "011", "012", "013", "014", "015", "016", "017", "018", "020",
                    "021", "029"}
#: An unprefixed reference chained straight onto a federal one is federal too:
#: "fed 001113 minus 001406", "fed 021120 minus fed 021130".
CHAIN = re.compile(r"^\s*(?:,|\+|-|–|minus|plus|and|or|less)\s*$", re.I)


def refs_of(rule: str, form: str) -> dict:
    own, other, federal = set(), set(), set()
    matches = list(REF.finditer(rule))
    fed_ids = {m.group(2) + m.group(3) for m in matches if m.group(1)}
    previous_federal_end = None
    for m in matches:
        fed, sched, field, occ = m.group(1), m.group(2), m.group(3), m.group(4)
        ident = sched + field
        chained = previous_federal_end is not None and CHAIN.match(rule[previous_federal_end:m.start()])
        if fed or ident in fed_ids or chained or sched not in AT1_FORM_NUMBERS:
            federal.add(ident)
            previous_federal_end = m.end()
            continue
        previous_federal_end = None
        if len(field) == 3:
            ref = ident + (occ or "")
            (own if sched == form else other).add(ref)
    return {"own": sorted(own), "other": sorted(other), "federal": sorted(federal)}


def kinds_of(rule: str) -> list[str]:
    r = rule.lower()
    kinds = []
    if re.search(r"\bvalue\s*=|\bcalculate\b|\bvalue equals\b", r):
        kinds.append("formula")
    if re.search(r"(value\s*(=|equals)|enter)\s*(the\s*)?fed\b|federal (balance|amount)", r):
        kinds.append("default-to-federal")
    if re.search(r"cannot exceed|cannot be (less|greater)|must equal|must be (negative|positive|zero|less|greater)|not exceed", r):
        kinds.append("constraint")
    if re.search(r"must (not )?exist|do not allow|is required|must be completed|then this section", r):
        kinds.append("existence")
    return kinds or (["text"] if rule else [])


FRACTIONS = {"½": "(1/2)", "¼": "(1/4)", "¾": "(3/4)"}


def expr_of(rule: str) -> str | None:
    """A rule that is ONLY `Value = <arithmetic>` or `Calculate: <arithmetic>`
    over line references → that arithmetic, normalized (× → *, – → -)."""
    m = re.match(r"^\s*(?:Value\s*=|Calculate:)\s*(.+?)\.?\s*$", rule)
    if not m:
        return None
    body = m.group(1)
    for glyph, frac in FRACTIONS.items():
        body = body.replace(glyph, frac)
    body = re.sub(r"\s*[xX×]\s*", " * ", body).replace("−", "-").replace("–", "-")
    body = re.sub(r"\s+", " ", body).strip()
    return body if EXPR_OK.match(body) else None


def finalize(raw: dict) -> dict:
    forms = {}
    for form, entry in sorted(raw["forms"].items()):
        if form in LEGACY_FORMS or form not in TITLES:
            continue
        legacy = LEGACY_LINES.get(form, set())
        merged: dict[str, dict] = {}
        order: list[str] = []
        for row in entry["rows"]:
            line = row["line"]
            if line in legacy:
                continue
            if line == form and not row["requirement"]:
                entry["title_rule"] = row["rule"]  # the table's own title row
                continue
            prior = merged.get(line)
            if prior is None:
                merged[line] = row
                order.append(line)
            elif STRICTNESS.get(row["requirement"] or "", -1) > STRICTNESS.get(prior["requirement"] or "", -1):
                # e.g. "013 Capital Cost Allowance" (title, X) vs "013 CCA rate" (M)
                merged[line] = row
        rows = []
        for line in order:
            row = merged[line]
            rule = row["rule"]
            row["kinds"] = kinds_of(rule)
            row["refs"] = refs_of(rule, form)
            expr = expr_of(rule)
            if expr:
                row["expr"] = expr
            rows.append(row)
        forms[form] = {
            "title": TITLES[form],
            "pages": [entry["pages"][0], entry["pages"][-1]],
            "condition": entry["title_rule"],
            "sections": entry["sections"],
            "rows": rows,
        }
    return forms


def main() -> int:
    if not SPEC.exists():
        print(f"specification not found: {SPEC}", file=sys.stderr)
        return 1
    raw = extract()
    forms = finalize(raw)

    problems = [
        f"  S{f}: {len(forms.get(f, {}).get('rows', []))} rows, expected at least {floor}"
        for f, floor in EXPECTED_MIN.items()
        if len(forms.get(f, {}).get("rows", [])) < floor
    ]
    missing_letter = [
        f"{f}{r['line']}" for f, e in forms.items() for r in e["rows"] if not r["requirement"]
    ]

    if "--report" in sys.argv:
        for f, e in forms.items():
            rows = e["rows"]
            ruled = sum(1 for r in rows if r["rule"])
            exprs = sum(1 for r in rows if r.get("expr"))
            fed = sum(len(r["refs"]["federal"]) for r in rows)
            print(f"S{f} pp.{e['pages'][0]}-{e['pages'][1]}  rows:{len(rows):3d}  with rule:{ruled:3d}"
                  f"  expr:{exprs:2d}  fed refs:{fed:3d}  sections:{len(e['sections'])}")
        if raw["headerless"]:
            print(f"pages with codes but no header: {raw['headerless']}")
        if missing_letter:
            print(f"rows with no M/O/X: {' '.join(missing_letter)}")
        for p in problems:
            print(p)
        return 0

    if problems:
        print("extraction incomplete:\n" + "\n".join(problems), file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256(SPEC.read_bytes()).hexdigest()
    manifest = {
        "ruleset": RULESET,
        "source": str(SPEC.relative_to(RESEARCH)).replace("\\", "/"),
        "sha256": digest,
        "version": "2026.4",
        "adapter": "research/tools/rulebook/adapters/tra-chapter3.py",
        "excluded_legacy": {"forms": sorted(LEGACY_FORMS), "lines": {k: sorted(v) for k, v in LEGACY_LINES.items()}},
        "counts": {f: len(e["rows"]) for f, e in forms.items()},
    }
    # One file per form, ONE ROW PER LINE: a spec revision then diffs as the
    # rows that changed, form by form. LF and a stable key order keep it
    # byte-identical run to run.
    forms_dir = OUT / "forms"
    forms_dir.mkdir(parents=True, exist_ok=True)
    for stale in forms_dir.glob("*.json"):
        stale.unlink()
    one = lambda o: json.dumps(o, ensure_ascii=False)  # noqa: E731
    for form, e in forms.items():
        body = [
            "{",
            f' "ruleset": {one(RULESET)},',
            f' "form": {one(form)},',
            f' "title": {one(e["title"])},',
            f' "pages": {one(e["pages"])},',
            f' "condition": {one(e["condition"])},',
            ' "sections": [',
            ",\n".join(f"  {one(s)}" for s in e["sections"]),
            " ],",
            ' "rows": [',
            ",\n".join(f"  {one(r)}" for r in e["rows"]),
            " ]",
            "}",
        ]
        text = "\n".join(line for line in body if line != "") + "\n"
        (forms_dir / f"{form}.json").write_text(text, encoding="utf8", newline="\n")
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n", encoding="utf8", newline="\n")
    old = OUT / "rules.json"
    if old.exists():
        old.unlink()
    print(f"wrote {OUT.relative_to(RESEARCH.parent)}/forms/*.json ({len(forms)} forms, {sum(manifest['counts'].values())} rows)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
