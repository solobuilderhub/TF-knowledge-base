#!/usr/bin/env python3
"""
Extract the authoritative line numbers and captions from the CRA form PDFs.

WHY LAYOUT MODE, AND NOT A MARKDOWN CONVERTER
---------------------------------------------
A CRA schedule is a two-column form: the caption sits on the left with dot
leaders, and its line number sits on the right. The pairing IS the meaning.

Reading-order extractors (pdfminer, and therefore MarkItDown's PDF path) flatten
that into prose: every caption first, then all the numbers as a detached block.
Measured on Schedule 1 — pdfminer produced 4 caption/number pairs and 121
orphaned numbers; `pdftotext -layout` produced 113 pairs and no orphans.

Zipping two detached lists by position is not a fallback: the numbering has gaps
(107 is followed by 110), so a single merged or dropped caption shifts every
later pair by one and silently mislabels the rest of the form. A figure on the
wrong CRA line is the exact defect this whole exercise exists to prevent.

So: `pdftotext -layout`, which preserves the geometry the pairing depends on.

USAGE
    python extract-lines.py            # every T2SCH*.pdf here
    python extract-lines.py T2SCH01*   # a subset

Writes `<stem>.lines.tsv` (line<TAB>caption) and `<stem>.layout.txt` beside each
PDF. Both are checked in: the PDFs are the primary source, these are the derived
tables the engine and the interface read, and a diff on them is reviewable.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

from formlib import EXTRACT_DIR, PDF_DIR, clean_caption, strip_enumeration

# A caption, its dot leaders, then the line number. The leaders are what make
# this unambiguous — they only ever appear between a caption and its number.
# pdftotext renders them SPACE-SEPARATED (". . . . ."), so the run has to allow
# the gaps; requiring consecutive dots matches almost nothing.
LEADERS = r"(?:\s*[.·]){4,}"
LINE_RE = re.compile(rf"^\s*(?P<caption>\S.*?\S)\s*{LEADERS}\s*(?P<line>\d{{3}})\b")

# Some rows put the number first (the Part 2 grids on continuation pages).
LEADING_RE = re.compile(r"^\s*(?P<line>\d{3})\s+(?P<caption>[A-Za-z]\S.*?)\s*$")

# Totals and subtotals carry their number inline: "Total (lines 101 to 199) 500".
TOTAL_RE = re.compile(r"^\s*(?P<caption>(?:Sub)?[Tt]otal[^\n]*?)\s+(?P<line>\d{3})\s*\S*\s*$")


def is_continuation(raw: str) -> bool:
    """Is this line the earlier half of a caption that wrapped?

    A wrapped caption looks like this in layout mode — the number sits on the
    LAST physical line, and everything before it is orphaned:

        1. Taxable dividends (other than excluded dividends) paid ... in the year on
           short-term preferred shares . . . . . . . . . . . . . . . 220

    Reading only the numbered row yields "short-term preferred shares", which is
    a plausible caption and the wrong one. So a run of preceding lines is joined
    on, stopping at a blank line — the forms put one between fields.
    """
    s = raw.strip()
    if not s:
        return False
    if re.search(r"(?:\s*[.·]){4,}", raw):  # has leaders: a field of its own
        return False
    if re.search(r"(?<!\d)\d{3}(?!\d)\s*$", s):  # ends in a line number
        return False
    if re.match(r"^(Part|Area|Section|Schedule|Note|Total|Subtotal)\b", s):
        return False
    if s.endswith(":") or s.isupper():  # a heading, not a caption
        return False
    # A sentence is prose the form prints ABOVE a field, not the first half of a
    # wrapped caption — "Aggregate investment income is all world source income."
    # sits directly over line 002 with no blank line between them, and joining it
    # buries the real caption.
    if s.endswith("."):
        return False
    if len(s) < 4:
        return False
    return True


def extract(pdf: Path) -> list[tuple[str, str]]:
    layout = EXTRACT_DIR / f"{pdf.stem}.layout.txt"
    subprocess.run(
        ["pdftotext", "-layout", str(pdf), str(layout)],
        check=True,
        capture_output=True,
    )
    lines = layout.read_text(encoding="latin-1").splitlines()

    rows: list[tuple[str, str]] = []
    seen: set[str] = set()
    for i, raw in enumerate(lines):
        for pattern in (LINE_RE, TOTAL_RE, LEADING_RE):
            m = pattern.match(raw)
            if not m:
                continue
            caption = m.group("caption")
            line = m.group("line")

            # Walk back over the wrapped half of the caption, nearest first.
            if pattern is LINE_RE:
                prefix: list[str] = []
                j = i - 1
                while j >= 0 and is_continuation(lines[j]) and len(prefix) < 3:
                    prefix.insert(0, lines[j].strip())
                    j -= 1
                if prefix:
                    caption = " ".join(prefix) + " " + caption

            caption = strip_enumeration(clean_caption(caption))
            if len(caption) < 4 or caption.isdigit():
                break
            if line in seen:
                break
            seen.add(line)
            rows.append((line, caption))
            break
    return rows


def main() -> int:
    EXTRACT_DIR.mkdir(exist_ok=True)
    patterns = sys.argv[1:] or ["T2SCH*.pdf"]
    pdfs = sorted({p for pat in patterns for p in PDF_DIR.glob(pat)})
    if not pdfs:
        print("no PDFs matched", file=sys.stderr)
        return 1

    total = 0
    for pdf in pdfs:
        rows = extract(pdf)
        out = EXTRACT_DIR / f"{pdf.stem}.lines.tsv"
        out.write_text(
            "line\tcaption\n" + "\n".join(f"{n}\t{c}" for n, c in rows) + "\n",
            encoding="utf8",
            newline="\n",
        )
        total += len(rows)
        print(f"{pdf.name:52s} {len(rows):4d} lines -> {out.name}")
    print(f"\n{len(pdfs)} form(s), {total} numbered lines")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
