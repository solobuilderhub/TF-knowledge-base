#!/usr/bin/env python3
"""
PDF → the GENERATED half of a form definition.

Writes one module per form into `packages/ca-tax/src/t2/forms/generated/`,
carrying only what the printed document itself states: the line number, the
caption exactly as printed, and the page it appears on.

Everything a human knows and the paper does not say — which section a line
belongs to, whether a preparer enters it or the engine derives it, that amount A
of one schedule becomes amount C of another — lives in the hand-authored module
beside it. The split is the point: regenerating after a CRA reprint updates the
captions and cannot discard the research.

    python generate-captions.py                # every extracted form
    python generate-captions.py T2SCH01        # one form

Run `extract-lines.py` and `extract-xfa.py` first: this reads their output, not
the PDF.

TWO READINGS OF ONE DOCUMENT ARE MERGED. `lines.tsv` is the page read as text;
`fields.tsv` is the fillable form's own field list. Neither is complete alone:
the text reading loses a line when a reprint shifts a box (the 2026 jacket
reprint dropped 450, 520-575 from it), and the field list has no caption on
some grid cells. A line either one finds is emitted. The caption is the printed
one where the text reading has it; `fieldCaption` is CRA's own description of
the box, which also states the arithmetic ("Amount 1D minus line 260").
"""

from __future__ import annotations

import csv
import re
import sys

from formlib import ROOT as FORMS_ROOT, extracted_lines, layout_text, page_of_line, part_of_line, pdf_path

ROOT = FORMS_ROOT.parents[2]
DEST_DIR = ROOT / "packages" / "ca-tax" / "src" / "t2" / "forms" / "generated"

# The forms whose numbers sit beside captions on leader rows. Grid-shaped forms
# (Schedule 8 CCA, Schedule 13 reserves) put their numbers in COLUMN HEADINGS
# instead, so a row-wise read finds almost nothing — they are excluded here and
# authored by hand rather than extracted badly and trusted.
GRID_FORMS = {"T2SCH08", "T2SCH13"}

FORM_IDS = {
    "T2SCH01": "T2SCH1",
    "T2SCH04": "T2SCH4",
    "T2SCH06": "T2SCH6",
    "T2SCH07": "T2SCH7",
    "T2SCH27": "T2SCH27",
    "T2SCH31": "T2SCH31",
    "T2SCH33": "T2SCH33",
    "T2SCH43": "T2SCH43",
    "T2SCH53": "T2SCH53",
    "T2SCH55": "T2SCH55",
    "T2SCH73": "T2SCH73",
}


def camel(stem: str) -> str:
    """`T2SCH01-net-income-for-tax` → `schedule1`; `T661-sred-expenditures` → `t661`."""
    m = re.match(r"T2SCH0*(\d+)", stem)
    if m:
        return f"schedule{m.group(1)}"
    if stem.startswith("T2-"):
        return re.sub(r"[^A-Za-z0-9]", "", stem)
    return stem.split("-")[0].lower()


# What a field caption says after the line's own description: which row or
# option of the line this particular box is. Not part of the line's caption.
_INSTANCE_RE = re.compile(r"\s*(?:(?:Row|Instance|Column) \d+\.?|Yes\.?|No\.?)\s*$")


def field_captions(stem: str) -> dict[str, tuple[str, int]]:
    """line -> (CRA's description of the box, page), from `<stem>.fields.tsv`."""
    from formlib import extract_path

    path = extract_path(stem, ".fields.tsv")
    out: dict[str, tuple[str, int]] = {}
    if not path.exists():
        return out
    with path.open(encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f, delimiter="	"):
            line = r["line"]
            if not line or line in out:
                continue
            text = re.sub(r"^\s*Line\s+\d+\.?\s*", "", r["speak"])
            text = _INSTANCE_RE.sub("", text).strip()
            out[line] = (text, int(r["page"] or 1))
    return out


_AMOUNT_RE = re.compile(r"^\s*Amount\s+(\d{0,2}[A-Z]{1,2}\d?)\.\s*(.*)$")


def lettered_amounts(stem: str) -> dict[str, tuple[str, int]]:
    """letter -> (description, page) for the boxes that have a letter and no line.

    A subtotal is often printed twice ("Instance 1" with the arithmetic,
    "Instance 2" bare, where it is carried to the next column). The fuller
    description is kept.
    """
    from formlib import extract_path

    path = extract_path(stem, ".fields.tsv")
    out: dict[str, tuple[str, int]] = {}
    if not path.exists():
        return out
    with path.open(encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f, delimiter="	"):
            if r["line"]:
                continue
            m = _AMOUNT_RE.match(r["speak"])
            if not m:
                continue
            text = _INSTANCE_RE.sub("", m.group(2)).strip()
            letter = m.group(1)
            if letter not in out or len(text) > len(out[letter][0]):
                out[letter] = (text, int(r["page"] or 1))
    return out


def emitted_forms() -> set[str]:
    """The forms ca-tax carries captions for, by PDF file key (`T2SCH03`, `T661`).

    Decided by the registry: the core, CCPC and common buckets. A provincial or
    specialized form is held and extracted so it can be read and validated, and
    is not turned into a module nobody imports. Without a registry (a checkout
    that has only this directory) every form is emitted, as before.
    """
    registry = FORMS_ROOT.parents[1] / "forms" / "registry.tsv"
    if not registry.exists():
        return {t.name.split("-")[0].upper() for t in (FORMS_ROOT / "extracted").rglob("*.tsv")}
    out: set[str] = set()
    with registry.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f, delimiter="	"):
            if row["authority"] != "CRA" or row["category"] not in ("core", "ccpc", "common"):
                continue
            form = row["form"].upper()
            m = re.fullmatch(r"T2SCH(\d+)", form)
            out.add(f"T2SCH{int(m.group(1)):02d}" if m else ("T2" if form == "T2" else form))
    return out


def main() -> int:
    wanted = sys.argv[1:]
    from formlib import EXTRACT_DIR
    stems = sorted(
        {t.name.replace(".lines.tsv", "") for t in EXTRACT_DIR.rglob("*.lines.tsv")}
        | {t.name.replace(".fields.tsv", "") for t in EXTRACT_DIR.rglob("*.fields.tsv")}
    )
    if wanted:
        stems = [t for t in stems if any(w in t for w in wanted)]
    if not stems:
        print("nothing extracted: run extract-lines.py and extract-xfa.py first", file=sys.stderr)
        return 1

    DEST_DIR.mkdir(parents=True, exist_ok=True)
    emit = emitted_forms()
    written = []
    for stem in stems:
        key = stem.split("-")[0]
        dest_name = f"{camel(stem)}.captions.ts"
        if key.upper() not in emit and not (DEST_DIR / dest_name).exists():
            # Extracted for research, not built in ca-tax: a provincial or
            # specialized form. Its captions are generated the day its
            # registry row moves to a bucket ca-tax builds.
            continue
        if key in GRID_FORMS:
            print(f"{stem:52s} SKIPPED — grid form, authored by hand")
            continue

        rows = [(n, c) for n, c in extracted_lines(stem) if n.isdigit()]
        fields = field_captions(stem)
        seen = {n for n, _ in rows}
        # Lines only the form's own fields know, in the order the form lists them.
        rows += [(n, cap) for n, (cap, _) in fields.items() if n not in seen]
        if not rows:
            continue

        text = layout_text(stem)
        pages = page_of_line(text)
        parts = part_of_line(text)

        name = camel(stem)
        const = f"{name.upper().replace('SCHEDULE', 'SCHEDULE_')}_CAPTIONS"
        held = pdf_path(stem)
        where = held.relative_to(FORMS_ROOT).as_posix() if held is not None else f"pdf/{stem}.pdf"
        pdf_rel = f"research/sources/cra-forms/{where}"
        form_id = FORM_IDS.get(key, key)

        out = [
            "/**",
            f" * {form_id} — line numbers and captions, GENERATED from the CRA form.",
            " *",
            " * Do not hand-edit. Re-run:",
            " *   python research/forms/run.py",
            " *",
            f" * Source: {pdf_rel}",
            " *",
            " * This module holds ONLY what the document states. Sections, roles and",
            " * the links between schedules are hand-authored in the module beside it, so",
            " * that regenerating after a reprint updates captions without discarding what",
            " * anyone worked out.",
            " */",
            "",
            "/** A line exactly as the form prints it. */",
            "export interface GeneratedCaption {",
            "  line: string;",
            "  caption: string;",
            "  page: number;",
            "  /**",
            "   * The part of the form the line sits under, as printed.",
            "   *",
            "   * Read off the page rather than inferred from the number, because the",
            "   * numbering interleaves: Schedule 7 gives Part 1 and Part 3 the same",
            "   * captions for different lines (worldwide against foreign-source), and a",
            "   * range would file one as the other.",
            "   */",
            "  part?: string;",
            "  /**",
            "   * CRA's own description of the box, from the fillable form's field list.",
            "   * It usually states the arithmetic (\"Amount 1D minus line 260\") or where",
            "   * the figure is carried. Absent where the form gives the box no description.",
            "   */",
            "  fieldCaption?: string;",
            "  /** True when only the field list has this line: the text reading missed it. */",
            "  fieldOnly?: true;",
            "}",
            "",
            f"export const {const}: readonly GeneratedCaption[] = [",
        ]
        for num, caption in rows:
            cap = caption.replace("\\", "\\\\").replace("'", "\\'")
            part = parts.get(num)
            part_field = f", part: '{part}'" if part else ""
            fc = fields.get(num)
            page = pages.get(num) or (fc[1] if fc else 1)
            fc_field = ""
            if fc and fc[0]:
                esc = fc[0].replace("\\", "\\\\").replace("'", "\\'")
                fc_field = f", fieldCaption: '{esc}'"
            only = ", fieldOnly: true" if num not in seen else ""
            out.append(
                f"  {{ line: '{num}', caption: '{cap}', page: {page}{part_field}{fc_field}{only} }},"
            )
        out.append("];")
        out.append("")
        out.append(f"/** {form_id} captions by line number. */")
        out.append(f"export const {const}_BY_LINE: ReadonlyMap<string, GeneratedCaption> =")
        out.append(f"  new Map({const}.map((c) => [c.line, c]));")
        out.append("")

        amounts = lettered_amounts(stem)
        if amounts:
            out.append("/**")
            out.append(" * The form's lettered amounts (\"Amount 1D\"): subtotals and inputs that have a")
            out.append(" * letter and no line number. They are never transmitted, but the arithmetic of")
            out.append(" * the numbered lines runs through them, so a rule cannot be followed without them.")
            out.append(" */")
            out.append("export interface GeneratedAmount {")
            out.append("  letter: string;")
            out.append("  /** CRA's description of the box, which states its arithmetic where it has any. */")
            out.append("  description: string;")
            out.append("  page: number;")
            out.append("}")
            out.append("")
            out.append(f"export const {const.replace('_CAPTIONS', '_AMOUNTS')}: readonly GeneratedAmount[] = [")
            for letter, (text, page) in amounts.items():
                esc = text.replace("\\", "\\\\").replace("'", "\\'")
                out.append(f"  {{ letter: '{letter}', description: '{esc}', page: {page} }},")
            out.append("];")
            out.append("")

        dest = DEST_DIR / f"{name}.captions.ts"
        dest.write_text("\n".join(out), encoding="utf8", newline="\n")
        written.append((dest.name, len(rows)))
        print(f"{stem:52s} {len(rows):4d} lines -> generated/{dest.name}")

    print(f"\n{len(written)} module(s), {sum(n for _, n in written)} lines")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
