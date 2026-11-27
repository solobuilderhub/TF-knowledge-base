#!/usr/bin/env python3
"""
Turn the form data shipped inside the AuraTax desktop app into a readable
rules register: every line of every schedule, with its type, the rules
AuraTax enforces on it, and where its value comes from and goes to.

Source: an installed AuraTax (AuraSoft Inc.) desktop app. Inside its resources
folder (the one holding app.asar):
  app.asar.unpacked/app/assets/fixtures/<program>/
    specs/<schedule>.json   the line dictionary (code, caption, type, length, sign)
    extras/<schedule>.json  AuraTax's layer on top: sections, flows, _rule validations
    refs/                   rates, schedule dependencies, indexes

NOT a primary source. This is AuraTax's reading of the forms, kept as a
cross-check against the CRA / TRA documents. Nothing produced here may be
copied into ca-tax, the BE or the FE.

Usage (from this session folder):
  python -I tools/extract.py                       # t2 and at1, Windows default install
  python -I tools/extract.py t2                    # one program
  python -I tools/extract.py --app <resources>     # any other install location
"""

from __future__ import annotations

import csv
import json
import os
import struct
import sys
from collections import Counter
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

OUT = Path(__file__).resolve().parent.parent
# Set in main() from --app, or from the Windows default install location.
APP = Path()
FIXTURES = Path()


def default_app() -> Path | None:
    """The Windows per-user install. Other systems must pass --app: no guessing."""
    local = os.environ.get("LOCALAPPDATA")
    return Path(local) / "Programs" / "auratax" / "resources" if local else None


# --------------------------------------------------------------------------- #
# Reading
# --------------------------------------------------------------------------- #

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def app_version() -> str:
    """The version in package.json inside app.asar (asar: pickle header, then JSON index)."""
    asar = APP / "app.asar"
    try:
        with asar.open("rb") as f:
            head = f.read(16)
            header_size = struct.unpack_from("<I", head, 4)[0]
            json_len = struct.unpack_from("<I", head, 12)[0]
            index = json.loads(f.read(json_len))
            entry = index["files"]["package.json"]
            f.seek(8 + header_size + int(entry["offset"]))
            return json.loads(f.read(entry["size"]))["version"]
    except Exception as e:  # the register is still useful without it
        return f"unknown ({e.__class__.__name__})"


# --------------------------------------------------------------------------- #
# Rendering references
# --------------------------------------------------------------------------- #

class Schedule:
    def __init__(self, code: str, spec: dict, extra: dict):
        self.code = code
        self.name = spec.get("name", "")
        self.help = extra.get("_help", "")
        self.sections = extra.get("_sections", [])
        self.records: list[dict] = []
        self.by_key: dict[str, dict] = {}
        self._merge(spec, extra)

    def _merge(self, spec: dict, extra: dict) -> None:
        for f in spec.get("fields", []):
            rec = {
                "code": f.get("code", ""), "id": f.get("id", ""),
                "caption": f.get("name", ""), "type": f.get("type", ""),
                "length": f.get("length", ""), "sign": f.get("sign", ""),
                "max": f.get("mox", "") or f.get("max", ""),
                "looping": f.get("looping", ""), "in_dictionary": True, "x": {},
            }
            self._add(rec)
        for f in extra.get("fields", []):
            target = self.by_key.get(f.get("code") or "") or self.by_key.get(f.get("id") or "")
            if target is None:  # customisation of a field the dictionary lacks
                target = self._add({
                    "code": f.get("code", ""), "id": f.get("id", ""), "caption": "",
                    "type": f.get("type", ""), "length": f.get("length", ""),
                    "sign": f.get("sign", ""), "max": "", "looping": f.get("looping", ""),
                    "in_dictionary": False, "x": {},
                })
            target["x"].update(f)
        for f in extra.get("_addOns", []):
            rec = {
                "code": "", "id": f.get("id", ""), "caption": f.get("name", ""),
                "type": f.get("type", ""), "length": f.get("length", ""), "sign": "",
                "max": "", "looping": f.get("looping", ""), "in_dictionary": False, "x": dict(f),
            }
            anchor = self.by_key.get(f.get("nextTo") or "")
            self._add(rec, after=anchor)

    def _add(self, rec: dict, after: dict | None = None) -> dict:
        if after is not None and after in self.records:
            self.records.insert(self.records.index(after) + 1, rec)
        else:
            self.records.append(rec)
        for k in (rec["code"], rec["id"]):
            if k and k not in self.by_key:
                self.by_key[k] = rec
        return rec

    def ordered(self) -> list[tuple[str, dict]]:
        """(section name, record) in the order the form prints them."""
        seen: set[int] = set()
        out: list[tuple[str, dict]] = []
        keys = [r["code"] or r["id"] for r in self.records]
        for sec in self.sections:
            name = sec.get("name", "")
            if "codes" in sec:
                members = [self.by_key.get(c) for c in sec["codes"]]
            else:
                try:
                    i, j = keys.index(sec["start"]), keys.index(sec["end"])
                    members = self.records[i:j + 1]
                except (KeyError, ValueError):
                    members = []
            for r in members:
                if r is not None and id(r) not in seen:
                    seen.add(id(r))
                    out.append((name, r))
        for r in self.records:
            if id(r) not in seen:
                out.append(("(not in any section)", r))
        return out

    def label(self, key) -> str:
        """`510` -> `line 510`; `a2` -> `amount B` when the form letters it."""
        if isinstance(key, list):  # AT1 writes some single references as one-item lists
            return ", ".join(self.label(k) for k in key)
        key = str(key)
        if key.isdigit():
            return f"line {key}"
        rec = self.by_key.get(key)
        alias = (rec or {}).get("x", {}).get("alias") or (rec or {}).get("x", {}).get("_alias")
        return f"amount {alias} [{key}]" if alias else f"[{key}]"


SCHEDULES: dict[str, Schedule] = {}


def sched_label(code: str) -> str:
    return f"Sch {code}"


#: What a leading ∞ points at, by the program being read. In AT1, `∞001#403` is
#: T2 Schedule 1 line 403 (AT1 Sch 12 line 005, federal CCA). In T2 it points the
#: other way, at the linked provincial return (T2 S1 line 309 -> `∞012#017`, AT1 Sch 12).
LINKED = {"at1": "T2", "co17": "T2", "t2": "linked provincial return"}
PROGRAM = {"name": ""}


def ref(target: str) -> str:
    """`130#158` -> `Sch 130 line 158`; `∞001#403` read from AT1 -> `T2 Sch 001 line 403`."""
    linked = target.startswith("∞")
    target = target.lstrip("∞")
    sched, _, key = target.partition("#")
    if linked:  # another program's schedules: don't resolve against this one
        where = f"line {key}" if key.isdigit() else f"[{key}]"
        return f"{LINKED.get(PROGRAM['name'], 'linked return')} {sched_label(sched)} {where}"
    s = SCHEDULES.get(sched)
    where = s.label(key) if s and key else (f"line {key}" if key.isdigit() else f"[{key}]")
    return f"{sched_label(sched)} {where}".strip()


def lines(s: Schedule, keys) -> str:
    return ", ".join(s.label(k) for k in keys)


def outside(v: dict) -> str:
    sched = v.get("schedule") or v.get("schedulePrefix", "?")
    other = SCHEDULES.get(sched)
    keys = v.get("fields", [])
    labels = ", ".join(other.label(k) for k in keys) if other else ", ".join(keys)
    return f"{sched_label(sched)} {labels}"


# --------------------------------------------------------------------------- #
# Rules, glossed. The raw JSON is always written beside the gloss.
# --------------------------------------------------------------------------- #

def gloss(s: Schedule, key: str, v) -> str:
    sev = ""
    base = key
    for suffix, word in (("AsWarn", "warning"), ("AsInfo", "info"), ("Info", "info")):
        if key.endswith(suffix) and key != suffix:
            base, sev = key[: -len(suffix)], f" ({word})"
            break
    g = {
        "required": lambda: "Required" if v is True else f"Required: {v}",
        "requiredIfFields": lambda: f"Required when {lines(s, v)} filled",
        "requiredIfTrue": lambda: f"Required when {s.label(v)} is Yes",
        "requiredIfFieldEquals": lambda: f"Required when {s.label(v['field'])} = {v['value']!r}",
        "requiresFields": lambda: f"If filled, {lines(s, v)} must be filled too",
        "requiresAnyOfFields": lambda: f"If filled, at least one of {lines(s, v)} must be filled",
        "noRequiresFields": lambda: f"If filled, {lines(s, v)} must be blank",
        "excludesFields": lambda: f"Cannot be filled together with {lines(s, v)}",
        "emptyRequiresFields": lambda: f"If blank, {lines(s, v)} must be filled",
        "requiresSchedules": lambda: f"If filled, {', '.join(map(sched_label, v))} must be included",
        "requiresSchedule": lambda: f"If filled, {', '.join(map(sched_label, v))} must be included",
        "requiresAnyOfSchedules": lambda: f"If filled, one of {', '.join(map(sched_label, v))} must be included",
        "noRequiresSchedules": lambda: f"If filled, {', '.join(map(sched_label, v))} must not be included",
        "requiresOutsideFields": lambda: f"If filled, {outside(v)} must be filled",
        "requiresAnyOfOutsideFields": lambda: f"If filled, one of {outside(v)} must be filled",
        "lowerThan": lambda: f"Must be less than {s.label(v)}",
        "lowerOrEqualTo": lambda: f"Must not exceed {s.label(v)}",
        "equalsOrLowerThan": lambda: f"Must be ≤ {v}",
        "equalsOrMoreThan": lambda: f"Must be ≥ {v}",
        "greaterThan": lambda: f"Must be > {v}",
        "equals": lambda: f"Must equal {v}",
        "enforceMax": lambda: f"Capped at {v}",
        "enforceMin": lambda: f"Floor of {v}",
        "zeroIfNegative": lambda: "Set to 0 if negative",
        "zeroIfPositive": lambda: "Set to 0 if positive",
        "positiveIfNegative": lambda: "Negative values turned positive",
        "negativeIfPositive": lambda: "Positive values turned negative",
        "negate": lambda: "Sign reversed",
        "emptyIfZero": lambda: "Left blank when 0",
        "zeroIfEmpty": lambda: "0 when blank",
        "blankIfFields": lambda: f"Blanked when {lines(s, v)} filled",
        "blankIfNotFields": lambda: f"Blanked unless {lines(s, v)} filled",
        "blankIfVal": lambda: f"Blank when the value is {v!r}",
        "isBefore": lambda: f"Date must be before {v}",
        "isAfter": lambda: f"Date must be after {v}",
        "shouldBeAfter": lambda: f"Date must be after {s.label(v)}",
        "initialReturnOnly": lambda: "Initial return only",
        "agencyUseOnly": lambda: "For CRA use only",
        "format": lambda: f"Format: {v}",
        "formats": lambda: f"Format: one of {', '.join(v)}",
    }.get(base)
    if g is None:
        return f"{key}: {json.dumps(v, ensure_ascii=False)}"
    try:
        return g() + sev
    except Exception:
        return f"{key}: {json.dumps(v, ensure_ascii=False)}"


def is_heading(r: dict) -> bool:
    """A part or group heading the dictionary lists as a row ("Part 1", "Identification")."""
    x = r["x"]
    return (not (r["type"] or x.get("type")) and not r["code"].isdigit()
            and not x.get("_rule") and not x.get("_origin") and not x.get("_reportOn"))


def kind(r: dict) -> str:
    if is_heading(r):
        return "heading"
    x = r["x"]
    parts = []
    if x.get("_total") or x.get("total"):
        parts.append("total")
    if x.get("_subTotal"):
        parts.append("subtotal")
    if x.get("_disabled") is True:
        parts.append("calculated")
    if x.get("_allowManual"):
        parts.append("override allowed")
    if x.get("_hidden"):
        parts.append("hidden")
    if not r["in_dictionary"]:
        parts.append("AuraTax-only")
    if r["looping"] == "Y" or x.get("looping") == "Y":
        parts.append("repeats")
    return ", ".join(parts) or "input"


# --------------------------------------------------------------------------- #
# Writing
# --------------------------------------------------------------------------- #

def md_cell(text: str) -> str:
    return str(text).replace("|", "\\|").replace("\r", " ").replace("\n", "<br>")


def write_program(prog: str, version: str) -> None:
    root = FIXTURES / prog
    specs = {p.stem: load(p) for p in sorted((root / "specs").glob("*.json"))}
    extras = {p.stem: load(p) for p in sorted((root / "extras").glob("*.json"))}
    SCHEDULES.clear()
    PROGRAM["name"] = prog
    for code in sorted(set(specs) | set(extras)):
        SCHEDULES[code] = Schedule(code, specs.get(code, {}), extras.get(code, {}))

    refs = root / "refs"
    deps = load(refs / "schedules-deps.json") if (refs / "schedules-deps.json").exists() else {}
    rates = load(refs / "calculate-params.json") if (refs / "calculate-params.json").exists() else None

    out = OUT / prog
    (out / "schedules").mkdir(parents=True, exist_ok=True)

    rows, flows = [], []
    rule_kinds: Counter = Counter()
    index = []
    for code, s in SCHEDULES.items():
        n_rules = n_flows = n_lines = 0
        body: list[str] = []
        notes: list[str] = []
        current = None
        for section, r in s.ordered():
            x = r["x"]
            key = r["code"] or r["id"]
            caption = r["caption"] or x.get("name", "")
            shown = x.get("name", "")
            rule = x.get("_rule") or {}
            glossed = [gloss(s, k, v) for k, v in rule.items()]
            rule_kinds.update(rule.keys())
            origin = [ref(t) for t in x.get("_origin", [])]
            report = [ref(t) for t in x.get("_reportOn", [])]
            for t in x.get("_origin", []):
                flows.append((t.lstrip("∞").partition("#")[0], t.lstrip("∞").partition("#")[2], code, key, "_origin", "∞" if t.startswith("∞") else ""))
            for t in x.get("_reportOn", []):
                flows.append((code, key, t.lstrip("∞").partition("#")[0], t.lstrip("∞").partition("#")[2], "_reportOn", "∞" if t.startswith("∞") else ""))
            n_rules += len(rule)
            n_flows += len(origin) + len(report)
            n_lines += 1 if r["code"] else 0
            rows.append({
                "schedule": code, "schedule_name": s.name, "section": section,
                "line": r["code"], "id": r["id"], "alias": x.get("alias") or x.get("_alias", ""),
                "caption": caption, "display_caption": shown if shown and shown != caption else "",
                "type": r["type"] or x.get("type", ""), "length": r["length"], "sign": r["sign"],
                "max": r["max"], "kind": kind(r),
                "from": "; ".join(origin), "to": "; ".join(report),
                "rules": "; ".join(glossed),
                "rules_raw": json.dumps(rule, ensure_ascii=False) if rule else "",
                "default": x.get("_defaultValue", ""),
                "help": x.get("_help", ""),
            })
            if section == "(not in any section)" and is_heading(r):
                continue  # kept in lines.csv; on the page it would only repeat a part title
            if section != current:
                current = section
                body += ["", f"### {section or '(untitled section)'}", "",
                         "| Line | Caption | Type | Kind | From | To | Rules |",
                         "|---|---|---|---|---|---|---|"]
            line_cell = r["code"] or s.label(r["id"])
            body.append("| " + " | ".join(md_cell(c) for c in (
                line_cell, caption, r["type"] or x.get("type", ""), kind(r),
                "<br>".join(origin), "<br>".join(report), "<br>".join(glossed),
            )) + " |")
            if x.get("_help"):
                notes.append(f"- **{line_cell}**: {x['_help'].strip()}")

        md = [f"# {sched_label(code)}: {s.name}", "",
              f"From AuraTax {version}, `fixtures/{prog}/specs/{code}.json` and `extras/{code}.json`. "
              "Not a primary source; check every rule against the published form.", ""]
        if code in deps:
            md += ["**Takes values from:** " + ", ".join(ref(t) for t in deps[code]), ""]
        if s.help:
            md += ["## AuraTax's help text for this schedule", "", s.help.strip(), ""]
        md += ["## Lines"] + body
        if notes:
            md += ["", "## Help text on individual lines", ""] + notes
        (out / "schedules" / f"{code}.md").write_text("\n".join(md) + "\n", encoding="utf-8")
        index.append((code, s.name, n_lines, n_rules, n_flows))

    fields = list(rows[0].keys()) if rows else []
    with (out / "lines.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    with (out / "flows.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["from_schedule", "from_key", "to_schedule", "to_key", "declared_by", "marker"])
        w.writerows(flows)
    if rates is not None:
        (out / "rates.json").write_text(json.dumps(rates, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    readme = [
        f"# AuraTax {prog.upper()} rules register", "",
        f"Generated by `tools/extract.py` from AuraTax {version} (`fixtures/{prog}/`). "
        "AuraTax's reading of the forms, not the forms themselves: a cross-check only.", "",
        "- `schedules/<code>.md`: one page per schedule, lines in form order",
        "- `lines.csv`: every line, with the raw rule JSON beside the plain-English gloss",
        "- `flows.csv`: every declared flow between schedules (`_origin` = comes from, `_reportOn` = goes to). "
        f"`marker` = ∞ means the other end is on the {LINKED.get(prog, 'linked return')}, not this return.",
        "- `rates.json`: AuraTax's rate table (`refs/calculate-params.json`)" if rates is not None else "",
        "",
        f"**{len(SCHEDULES)} schedules, {sum(i[2] for i in index)} numbered lines, "
        f"{sum(rule_kinds.values())} rules, {len(flows)} flows.**", "",
        "What is not here: the calculation formulas. Totals marked `total`/`subtotal` and lines marked "
        "`calculated` are computed in the app's code (`main.js`), not in this data.", "",
        "## Schedules", "", "| Schedule | Name | Lines | Rules | Flows |", "|---|---|---|---|---|",
    ]
    readme += [f"| [{c}](schedules/{c}.md) | {md_cell(n)} | {l} | {r} | {fl} |" for c, n, l, r, fl in index]
    readme += ["", "## Rule kinds used", "", "| Rule | Count |", "|---|---|"]
    readme += [f"| `{k}` | {v} |" for k, v in rule_kinds.most_common()]
    (out / "README.md").write_text("\n".join(line for line in readme) + "\n", encoding="utf-8")
    print(f"{prog}: {len(SCHEDULES)} schedules, {len(rows)} rows, {sum(rule_kinds.values())} rules, "
          f"{len(flows)} flows -> {out}")


def main() -> None:
    global APP, FIXTURES
    args = sys.argv[1:]
    app = None
    if "--app" in args:
        i = args.index("--app")
        if i + 1 >= len(args):
            sys.exit("--app needs the AuraTax resources folder (the one holding app.asar)")
        app = Path(args[i + 1])
        del args[i:i + 2]
    app = app or default_app()
    if app is None or not (app / "app.asar").is_file():
        sys.exit(f"AuraTax not found at {app}. Pass --app <the AuraTax folder holding app.asar>.")
    APP = app
    FIXTURES = APP / "app.asar.unpacked" / "app" / "assets" / "fixtures"
    progs = args or ["t2", "at1"]
    version = app_version()
    print(f"AuraTax {version}")
    for prog in progs:
        if not (FIXTURES / prog / "specs").is_dir():
            sys.exit(f"no fixtures for {prog!r} under {FIXTURES}")
        write_program(prog, version)


if __name__ == "__main__":
    main()
