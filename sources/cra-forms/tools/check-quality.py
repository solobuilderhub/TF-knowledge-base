#!/usr/bin/env python3
"""
Grade each extraction before anything is authored from it.

A caption pulled off a two-column form can still be a fragment: the leader row
may have wrapped, or the number may belong to a grid column rather than the
caption beside it. Authoring a definition from one of those puts a plausible,
wrong caption into the system — which is the exact failure this whole exercise
exists to remove. Better to know which forms need a human first.

Heuristics, each of which has produced a real false caption in this repository:

  fragment   starts lower-case, or with a closing bracket — a wrapped line
  date-mask  contains YYYYMMDD or "Year Month Day" — a grid column heading
  stub       under 12 characters — almost never a real caption
  footnote   ends in a bare '*' or a dangling '('
  repeated   the same caption twice WITHIN ONE PART — a column head read as a
             field. Across parts a repeat is usually the form mirroring itself:
             Schedule 7 asks for "Eligible portion of taxable capital gains for
             the year" in Part 1 (worldwide) and again in Part 3 (foreign), and
             both are real lines.

WHAT IT CANNOT SEE
------------------
Every heuristic below judges a caption in isolation. It cannot detect **cross-
column contamination** — a caption that reads perfectly and belongs to a
different line. On a dense two-column page the joiner walks back into the
neighbouring column and produces exactly that.

The T2 jacket is the case in point: it scores 153/167 "clean" and several of
those captions are stitched from two unrelated questions. A high score means "no
obvious fragments", not "safe to author from". For any form whose numbers are
scattered across the page rather than sitting on leader rows, render it and read
it.

    python check-quality.py
"""

from __future__ import annotations

import re

from formlib import extracted_lines, form_stems, layout_text, part_of_line


def problems(caption: str) -> list[str]:
    out = []
    if caption[:1].islower() or caption.startswith((")", "]", "and ", "or ", "is ")):
        out.append("fragment")
    if re.search(r"YYYYMMDD|Year Month Day|YYYY", caption):
        out.append("date-mask")
    if len(caption) < 12:
        out.append("stub")
    if caption.rstrip().endswith("*") or caption.count("(") != caption.count(")"):
        out.append("footnote")
    return out


def main() -> int:
    print(f"{'form':46s} {'lines':>5s} {'clean':>6s} {'suspect':>8s}  verdict")
    print("-" * 88)
    for stem in form_stems():
        rows = extracted_lines(stem)
        if not rows:
            print(f"{stem:46s} {0:5d} {0:6d} {0:8d}  no extraction")
            continue
        parts = part_of_line(layout_text(stem))

        suspect = []
        for line, cap in rows:
            p = problems(cap)
            here = parts.get(line)
            same_part = [l for l, c in rows if c == cap and parts.get(l) == here]
            if len(same_part) > 1:
                p.append("repeated")
            if p:
                suspect.append((line, cap, p))

        clean = len(rows) - len(suspect)
        ratio = clean / len(rows)
        verdict = (
            "author from extraction"
            if ratio >= 0.9
            else "review the flagged lines"
            if ratio >= 0.6
            else "HAND-AUTHOR - extraction unusable"
        )
        print(f"{stem:46s} {len(rows):5d} {clean:6d} {len(suspect):8d}  {verdict}")
        for line, cap, p in suspect[:4]:
            print(f"{'':46s}   {line}  [{','.join(p)}] {cap[:52]}")
        if len(suspect) > 4:
            print(f"{'':46s}   ... {len(suspect) - 4} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
