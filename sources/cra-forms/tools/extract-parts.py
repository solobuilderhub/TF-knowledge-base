#!/usr/bin/env python3
"""
Show which PART of a form each line belongs to — a diagnostic for authoring.

`generate-captions.py` already records the part on every generated caption row,
so nothing depends on this script. It exists to answer the question a person has
in front of them while writing a definition: *what are this form's parts, and
which lines are in each?* — which is exactly the `sectionByPart` map they are
about to type.

    python extract-parts.py                 # every form
    python extract-parts.py T2SCH31         # one form
    python extract-parts.py T2SCH31 --map   # emit a ready-to-paste sectionByPart
"""

from __future__ import annotations

import sys

from formlib import extracted_lines, form_stems, layout_text, part_headings, part_of_line


def slug(title: str) -> str:
    """A plausible section id from a part title — a starting point to edit."""
    words = [w for w in title.lower().replace("—", " ").replace("–", " ").split() if w.isalpha()]
    skip = {"the", "of", "and", "for", "a", "an", "to", "in", "on", "under", "from"}
    keep = [w for w in words if w not in skip][:3]
    return "-".join(keep) or "section"


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    want_map = "--map" in sys.argv

    stems = form_stems()
    if args:
        stems = [s for s in stems if any(a in s for a in args)]

    for stem in stems:
        text = layout_text(stem)
        headings = part_headings(text)
        assignment = part_of_line(text)
        known = {line for line, _ in extracted_lines(stem)}
        placed = {k: v for k, v in assignment.items() if k in known}

        by_part: dict[str, list[str]] = {}
        for line, part in sorted(placed.items(), key=lambda kv: int(kv[0])):
            by_part.setdefault(part, []).append(line)

        unplaced = sorted(known - set(placed))
        print(f"\n=== {stem} — {len(headings)} part(s), {len(placed)}/{len(known)} lines placed ===")
        for key, title in headings:
            lines = by_part.get(key, [])
            print(f"  {key} — {title}")
            print(f"      {len(lines):3d} lines: {', '.join(lines) if lines else '(none)'}")
        if unplaced:
            print(f"  (no part heading above them): {', '.join(unplaced)}")

        if want_map:
            print("\n  sectionByPart: {")
            for key, title in headings:
                if by_part.get(key):
                    print(f"    '{key}': '{slug(title)}',")
            print("  },")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
