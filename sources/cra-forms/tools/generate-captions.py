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

    python generate-captions.py                # every form with a .lines.tsv
    python generate-captions.py T2SCH01        # one form

Run `extract-lines.py` first — this reads its output, not the PDF.
"""

from __future__ import annotations

import re
import sys

from formlib import ROOT as FORMS_ROOT, extracted_lines, layout_text, page_of_line, part_of_line

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
    """`T2SCH01-net-income-for-tax` → `schedule1`."""
    m = re.match(r"T2SCH0*(\d+)", stem)
    return f"schedule{m.group(1)}" if m else re.sub(r"[^A-Za-z0-9]", "", stem)


def main() -> int:
    wanted = sys.argv[1:]
    from formlib import EXTRACT_DIR
    tsvs = sorted(EXTRACT_DIR.glob("*.lines.tsv"))
    if wanted:
        tsvs = [t for t in tsvs if any(w in t.name for w in wanted)]
    if not tsvs:
        print("no .lines.tsv found — run extract-lines.py first", file=sys.stderr)
        return 1

    DEST_DIR.mkdir(parents=True, exist_ok=True)
    written = []
    for tsv in tsvs:
        stem = tsv.name.replace(".lines.tsv", "")
        key = stem.split("-")[0]
        if key in GRID_FORMS:
            print(f"{stem:52s} SKIPPED — grid form, authored by hand")
            continue

        rows = extracted_lines(stem)
        if not rows:
            continue

        text = layout_text(stem)
        pages = page_of_line(text)
        parts = part_of_line(text)

        name = camel(stem)
        const = f"{name.upper().replace('SCHEDULE', 'SCHEDULE_')}_CAPTIONS"
        pdf_rel = f"research/sources/cra-forms/pdf/{stem}.pdf"
        form_id = FORM_IDS.get(key, key)

        out = [
            "/**",
            f" * {form_id} — line numbers and captions, GENERATED from the CRA form.",
            " *",
            " * Do not hand-edit. Re-run:",
            " *   python research/sources/cra-forms/extract-lines.py",
            " *   python research/sources/cra-forms/generate-captions.py",
            " *",
            f" * Source: {pdf_rel}",
            " *",
            " * This module holds ONLY what the printed page states. Sections, roles and",
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
            "}",
            "",
            f"export const {const}: readonly GeneratedCaption[] = [",
        ]
        for num, caption in rows:
            cap = caption.replace("\\", "\\\\").replace("'", "\\'")
            part = parts.get(num)
            part_field = f", part: '{part}'" if part else ""
            out.append(
                f"  {{ line: '{num}', caption: '{cap}', page: {pages.get(num, 1)}{part_field} }},"
            )
        out.append("];")
        out.append("")
        out.append(f"/** {form_id} captions by line number. */")
        out.append(f"export const {const}_BY_LINE: ReadonlyMap<string, GeneratedCaption> =")
        out.append(f"  new Map({const}.map((c) => [c.line, c]));")
        out.append("")

        dest = DEST_DIR / f"{name}.captions.ts"
        dest.write_text("\n".join(out), encoding="utf8", newline="\n")
        written.append((dest.name, len(rows)))
        print(f"{stem:52s} {len(rows):4d} lines -> generated/{dest.name}")

    print(f"\n{len(written)} module(s), {sum(n for _, n in written)} lines")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
