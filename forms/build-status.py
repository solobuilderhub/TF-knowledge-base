"""The form registry report: registry.tsv + what is on disk -> STATUS.md

`registry.tsv` holds the decisions a person makes (which bucket a form is in).
Everything else in STATUS.md is read off the disk each run, so it cannot go
stale by being forgotten:

  CRA's own list      sources/cra-forms/catalog/cra-forms-list.json
  the document held   sources/<authority>-forms/pdf/[<category>/]
  what was extracted  sources/cra-forms/extracted/[<category>/]<form>.lines.tsv   (pdftotext)
                                                               <form>.fields.tsv  (form template)

CRA forms are filed in category folders (formlib.CATEGORY_DIRS); a PDF or an
extracted file in the wrong folder is a defect: python file-by-category.py.
  what ca-tax has     src/t2/forms/generated/*.captions.ts, src/t2/forms/*.ts,
                      src/t2/schedules/*.ts (and at1/, co17/ for those returns)

    python build-status.py           # rewrite STATUS.md
    python build-status.py --check   # exit 1 on a defect (see DEFECTS below)

Standard library only.
"""

from __future__ import annotations

import csv
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parent
CRA = RESEARCH / "sources" / "cra-forms"
sys.path.insert(0, str(CRA / "tools"))
from formlib import CATEGORY_DIRS, EXTRACT_DIR, PDF_DIR, extract_path, pdf_files  # noqa: E402  (stdlib only)

# ca-tax sits beside research in the monorepo checkout, or as a sibling repo.
CA_TAX = next(
    (p for p in (RESEARCH.parent / "packages" / "ca-tax", RESEARCH.parent / "ca-tax") if p.exists()),
    None,
)

CATEGORIES = [
    ("core", "1 - Core (every return)"),
    ("ccpc", "2 - Basic CCPC"),
    ("common", "3 - Common additions"),
    ("provincial", "4 - Provincial"),
    ("specialized", "5 - Specialized"),
    ("retired", "Retired by the authority (archived)"),
]


def read_tsv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f, delimiter="\t"))


def schedule_number(form: str) -> str | None:
    m = re.fullmatch(r"(?:T2SCH|AT1SCH)(\d+)", form)
    return m.group(1) if m else None


def pdf_for(form: str, authority: str) -> Path | None:
    n = schedule_number(form)
    if authority == "CRA":
        pats = ["T2-jacket.pdf"] if form == "T2" else [f"T2SCH{n}-*.pdf", f"T2SCH{int(n):02d}-*.pdf"] if n else [f"{form}*.pdf"]
        root = PDF_DIR
    elif authority == "TRA":
        pats = [f"AT1SCH{int(n):02d}-*.pdf"] if n else ["AT1-jacket-*.pdf"]
        root = RESEARCH / "sources" / "tra-forms" / "pdf"
    else:
        pats = ["CO-17-2*.pdf"]
        root = RESEARCH / "sources" / "rq-forms" / "pdf"
    for pat in pats:
        hit = sorted(root.rglob(pat))  # CRA forms sit in category folders
        if hit:
            return hit[0]
    return None


def committed_on(path: Path) -> str:
    """The date the held copy last changed in git: when we last fetched it.

    --follow looks through renames, so filing a form into a category folder does
    not count as fetching it again (which would hide a stale copy).
    """
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--follow", "--format=%cs", "--", str(path)],
            cwd=RESEARCH, capture_output=True, text=True, check=False,
        ).stdout.strip()
        return out
    except OSError:
        return ""


def revision(stem: str) -> str:
    layout = extract_path(stem, ".layout.txt")
    if not layout.exists():
        return ""
    m = re.search(r"T2 ?(?:SCH ?\d+)? ?E ?\(\d{2}(?:/\d{2})?\)", layout.read_text(encoding="utf-8", errors="replace"))
    return m.group(0) if m else ""


def lines_of(path: Path, column: int | str) -> set[str]:
    if not path.exists():
        return set()
    out = set()
    with path.open(encoding="utf-8", newline="") as f:
        rows = csv.reader(f, delimiter="\t")
        header = next(rows, [])
        idx = header.index(column) if isinstance(column, str) and column in header else (column if isinstance(column, int) else 0)
        if isinstance(column, int):
            f.seek(0)
            rows = csv.reader(f, delimiter="\t")
        for r in rows:
            if len(r) > idx and re.fullmatch(r"\d{3,4}", r[idx].strip()):
                out.add(r[idx].strip())
    return out


def ca_tax_modules(form: str, authority: str) -> tuple[str, str, str]:
    """(generated captions, form definition, engine modules) as short names."""
    if CA_TAX is None:
        return ("?", "?", "?")
    t2 = CA_TAX / "src" / "t2"
    n = schedule_number(form)
    if authority == "CRA":
        gen = t2 / "forms" / "generated" / ("T2jacket.captions.ts" if form == "T2" else f"schedule{n}.captions.ts")
        definition = t2 / "forms" / ("jacket.ts" if form == "T2" else f"schedule{n}.ts")
        engines = sorted(p.name for p in (t2 / "schedules").glob(f"schedule{n}*.ts") if re.match(rf"schedule{n}(\D|$)", p.name)) if n else []
        if form == "T2":
            engines = sorted(p.name for p in (t2 / "jacket").glob("*.ts"))[:1] if (t2 / "jacket").exists() else []
    elif authority == "TRA":
        gen = Path("-")
        definition = t2 / "at1" / "forms" / ("jacket.ts" if form == "AT1" else f"schedule{int(n)}.ts")
        engines = sorted(p.name for p in (t2 / "at1" / "schedules").glob(f"schedule{int(n)}*.ts") if re.match(rf"schedule{int(n)}(\D|$)", p.name)) if n else ["alberta-return.ts"]
    else:
        gen = Path("-")
        definition = t2 / "co17" / "forms" / "co17.ts"
        engines = sorted(p.name for p in (t2 / "co17").glob("*.ts"))[:1]
    return (
        "yes" if gen.exists() else "",
        definition.name if definition.exists() else "",
        ", ".join(engines),
    )


def main() -> int:
    check = "--check" in sys.argv
    registry = read_tsv(HERE / "registry.tsv")
    catalog_file = CRA / "catalog" / "cra-forms-list.json"
    catalog_doc = json.loads(catalog_file.read_text(encoding="utf-8"))
    catalog = {r[0]: r for r in catalog_doc["rows"]}
    defects: list[str] = []
    notes: list[str] = []

    known = {r["form"] for r in registry}
    for form in sorted(catalog):
        if re.fullmatch(r"T2SCH\d+", form) and form not in known:
            defects.append(f"{form} is on CRA's list and has no registry row (a new schedule?): add it to registry.tsv.")
    held = {p.name: p for p in pdf_files()}
    claimed: set[str] = set()

    out: list[str] = []
    totals = []
    for key, heading in CATEGORIES:
        rows = [r for r in registry if r["category"] == key]
        rows.sort(key=lambda r: (r["authority"], r["jurisdiction"], 0 if schedule_number(r["form"]) is None else 1, int(schedule_number(r["form"]) or 0), r["form"]))
        if not rows:
            continue
        built = 0
        table = [
            "| Form | Title | Where | PDF held | Revision | CRA updated | Lines (text / fields / both) | Captions | Form definition | Engine |",
            "|---|---|---|---|---|---|---|---|---|---|",
        ]
        for r in rows:
            form, auth = r["form"], r["authority"]
            cat = catalog.get(form)
            if auth == "CRA" and cat is None:
                defects.append(f"{form} is in registry.tsv and not on CRA's list: retired, renumbered or a typo.")
            title = (cat[1] if cat else r["note"] or "").replace("|", "/")
            updated = cat[2] if cat else ""
            pdf = pdf_for(form, auth)
            rev = fetched = ""
            text_lines: set[str] = set()
            field_lines: set[str] = set()
            if pdf is not None:
                claimed.add(pdf.name)
                fetched = committed_on(pdf)
                if auth == "CRA":
                    rev = revision(pdf.stem)
                    text_lines = lines_of(extract_path(pdf.stem, ".lines.tsv"), 0)
                    field_lines = lines_of(extract_path(pdf.stem, ".fields.tsv"), "line")
                    filed_in = pdf.parent.relative_to(PDF_DIR).as_posix()
                    belongs = CATEGORY_DIRS.get(r["category"], ".")
                    if filed_in != belongs:
                        shown = lambda d: "pdf/" if d == "." else f"pdf/{d}/"  # noqa: E731
                        defects.append(
                            f"{form} is filed in {shown(filed_in)} and its bucket ({r['category']}) belongs in {shown(belongs)}: run python forms/file-by-category.py."
                        )
                    if updated and fetched and updated > fetched:
                        notes.append(f"{form}: CRA updated the form on {updated}; the copy held was fetched {fetched}. Download it again and re-run the extractors.")
            gen, definition, engine = ca_tax_modules(form, auth)
            if definition and pdf is None:
                defects.append(f"{form} has a form definition in ca-tax ({definition}) and no primary document in sources/: its line numbers cannot be checked.")
            if definition or engine:
                built += 1
            counts = ""
            if text_lines or field_lines:
                counts = f"{len(text_lines)} / {len(field_lines)} / {len(text_lines & field_lines)}"
            stale = " **stale**" if (auth == "CRA" and pdf is not None and updated and fetched and updated > fetched) else ""
            table.append(
                f"| {form} | {title[:70]} | {r['jurisdiction']} | {'yes' if pdf else ''} | {rev} | {updated}{stale} | {counts} | {gen} | {definition} | {engine} |"
            )
        with_pdf = sum(1 for line in table[2:] if line.split("|")[4].strip() == "yes")
        totals.append((heading, len(rows), with_pdf, built))
        out += [f"## {heading}", "", *table, ""]

    for name in sorted(set(held) - claimed):
        defects.append(f"sources/cra-forms/{held[name].relative_to(CRA).as_posix()} matches no registry row.")
    for f in sorted(p for p in EXTRACT_DIR.rglob("*") if p.is_file()):
        m = re.fullmatch(r"(.+?)(\.lines\.tsv|\.fields\.tsv|\.layout\.txt)", f.name)
        if m and f != extract_path(m.group(1), m.group(2)):
            defects.append(
                f"sources/cra-forms/{f.relative_to(CRA).as_posix()} is not in the same category folder as its PDF: run python forms/file-by-category.py."
            )

    head = [
        "# Form registry status",
        "",
        "GENERATED by `forms/build-status.py`. Do not edit; edit `registry.tsv` or fix the disk, then re-run.",
        "",
        f"CRA's list captured {catalog_doc.get('captured', '')[:10]} from {catalog_doc.get('source', '')}.",
        "",
        "| Bucket | Forms | Primary document held | In ca-tax |",
        "|---|---|---|---|",
        *[f"| {h} | {n} | {p} | {b} |" for h, n, p, b in totals],
        "",
        "Lines column: line numbers found by the text extractor / by the fillable form's own fields / by both.",
        "A form where the two disagree widely is a grid form: its numbers are column headings, and it is authored by hand.",
        "",
    ]
    if defects:
        head += ["## Defects", "", *[f"- {d}" for d in defects], ""]
    if notes:
        head += ["## Out of date", "", *[f"- {n}" for n in notes], ""]
    (HERE / "STATUS.md").write_text("\n".join(head + out), encoding="utf-8", newline="\n")
    for h, n, p, b in totals:
        print(f"{h:40s} forms={n:3d} pdf={p:3d} ca-tax={b:3d}")
    print(f"{len(defects)} defect(s), {len(notes)} out of date")
    for d in defects:
        print("DEFECT", d)
    return 1 if (check and defects) else 0


if __name__ == "__main__":
    sys.exit(main())
