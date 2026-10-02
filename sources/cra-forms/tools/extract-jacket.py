#!/usr/bin/env python3
"""
Extract the T2 jacket, which the schedule pipeline cannot read.

WHY THE JACKET NEEDS ITS OWN TOOL
---------------------------------
`extract-lines.py` assumes a schedule's geometry: a caption on the left, dot
leaders, and its line number on the right of the same physical row. The jacket
does not work that way. Its nine pages are dense and irregular, and running the
schedule extractor over it produced captions stitched together from two
unrelated questions — line 010 came out carrying both the address-change
question and the acquisition-of-control question.

Worse, `check-quality.py` scored that 153/167 "clean", because every heuristic it
has judges a caption in isolation and cannot see a caption that reads perfectly
and belongs to a different line.

TWO RULES THIS TOOL USES INSTEAD
--------------------------------
1. **A line box sits in a right-hand column.** Numbers at low x are
   cross-references printed inside a caption — "Taxable income (from line 360 on
   page 3)" contains 360 and is not a field. Measured across the computational
   pages, the boxes cluster at x >= 340 and the references sit below x ~ 330.

2. **The caption is the text to the LEFT on the same row**, not above it. That is
   the jacket's dominant geometry, and it is why walking backwards through
   preceding lines — correct for a schedule — crosses into the neighbouring
   column here.

Anything this cannot resolve is dropped rather than guessed. A jacket line filed
against the wrong caption is exactly the defect the whole pipeline exists to
prevent.

    python extract-jacket.py            # writes extracted/T2-jacket.lines.tsv
    python extract-jacket.py --report   # show what was dropped and why
"""

from __future__ import annotations

import re
import sys

import fitz

from formlib import EXTRACT_DIR, PDF_DIR, clean_caption

#: A number to the left of this is printed inside a caption, not a field box.
LINE_BOX_MIN_X = 340.0

#: Rows are matched on their vertical centre, within this many points.
ROW_TOLERANCE = 4.0

NUM_RE = re.compile(r"^\d{3}$")


def caption_left_of(words, box) -> str:
    """The text sharing a row with the box, to its left."""
    centre = (box[1] + box[3]) / 2
    left = [
        w
        for w in words
        if w[2] <= box[0] and abs((w[1] + w[3]) / 2 - centre) < ROW_TOLERANCE
    ]
    left.sort(key=lambda w: w[0])
    text = " ".join(w[4] for w in left)
    # Drop leader runs, then any leading fragment of a PREVIOUS field's box.
    text = re.sub(r"(?:\s*\.){2,}", " ", text)
    return clean_caption(text)


def extract(path) -> tuple[list[tuple[str, str, int]], list[tuple[str, str]]]:
    doc = fitz.open(path)
    rows: list[tuple[str, str, int]] = []
    dropped: list[tuple[str, str]] = []
    seen: set[str] = set()

    for pageno, page in enumerate(doc, start=1):
        words = page.get_text("words")
        for box in [w for w in words if NUM_RE.match(w[4])]:
            line = box[4]
            if box[0] < LINE_BOX_MIN_X:
                dropped.append((line, f"p{pageno}: a cross-reference inside a caption"))
                continue
            caption = caption_left_of(words, box)
            if len(caption) < 6:
                dropped.append((line, f"p{pageno}: no caption to its left"))
                continue
            if line in seen:
                dropped.append((line, f"p{pageno}: already captured"))
                continue
            seen.add(line)
            rows.append((line, caption, pageno))

    rows.sort(key=lambda r: (r[2], int(r[0])))
    return rows, dropped


def main() -> int:
    pdf = PDF_DIR / "T2-jacket.pdf"
    if not pdf.exists():
        print(f"not found: {pdf}", file=sys.stderr)
        return 1

    rows, dropped = extract(pdf)
    out = EXTRACT_DIR / "T2-jacket.lines.tsv"
    out.write_text(
        "line\tcaption\tpage\n" + "\n".join(f"{n}\t{c}\t{p}" for n, c, p in rows) + "\n",
        encoding="utf8",
        newline="\n",
    )
    print(f"{len(rows)} line boxes -> {out.name}")
    print(f"{len(dropped)} dropped (cross-references and unresolvable rows)")

    if "--report" in sys.argv:
        print("\ndropped:")
        for line, why in dropped:
            print(f"  {line}  {why}")
        print("\ncaptured:")
        for n, c, p in rows:
            print(f"  p{p} {n}  {c[:78]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
