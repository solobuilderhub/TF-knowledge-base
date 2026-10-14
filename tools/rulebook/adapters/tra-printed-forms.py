#!/usr/bin/env python3
"""
TRA's PRINTED AT1 forms -> packages/ca-tax/spec/at1/printed/<form>.json

Chapter 3 (tra-chapter3.py) lists the fields that are TRANSMITTED. A printed
form also carries lines that are only arithmetic on the form - Schedule 1's
007 ("Balance line 003 minus line 005") and 013, the totals on Schedule 2,
the running balances on Schedule 21 - which Net File never sends and Chapter 3
therefore never mentions. This adapter reads the printed form itself and
records every numbered line Chapter 3 does NOT list, with the caption exactly
as printed. The caption IS the formula ("Balance line 003 minus line 005 (if
negative, enter "0")").

Output is the lines the specification lacks, not a copy of the form: a line
that has a Chapter 3 row is left to that row.

Reads by position (PyMuPDF text blocks): a line number is a token of exactly
three digits that is not part of a sentence ("line 021", "Reg 409", "007, 013
and C" are references, not lines) and not a rate (".070"). Its caption is the
text printed in the same block, else the blocks to its left on the same row,
else the block directly above it. A caption the geometry cannot settle is
written with `"confidence": "low"` so a reader knows to check the form.

    python tra-printed-forms.py            # write printed/<form>.json
    python tra-printed-forms.py --report   # show what would be written
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parents[2]
FORMS = RESEARCH / "sources" / "tra-forms" / "pdf"
SPEC = RESEARCH.parent / "packages" / "ca-tax" / "spec" / "at1"

#: PDF file prefix -> form number. The jacket is "AT1-jacket".
def form_of(path: Path) -> str | None:
    m = re.match(r"AT1SCH(\d\d)-", path.name)
    if m:
        return "0" + m.group(1)
    if path.name.startswith("AT1-jacket"):
        return "000"
    return None


NUMBER = re.compile(r"^\d{3}$")
#: The word before a number that makes it a reference, not a line.
REFERENCE_BEFORE = {
    "line", "lines", "and", "or", "reg", "to", "the", "column", "columns",
    "amount", "amounts", "of", "on", "at", "form", "schedule", "box", "ita",
    "from", "than", "minus", "plus", "x", "by", "less", "add", "ending",
    "after", "before", "year", "years", "article", "section",
}
PUNCT = "■▪•"  # the form's black squares and bullets


def clean(text: str) -> str:
    text = re.sub(r"[%s]" % PUNCT, " ", text)
    text = re.sub(r"[ \t]+", " ", text.replace("\n", " "))
    text = re.sub(r"\.{4,}", " ", text)  # dot leaders
    return re.sub(r"\s+", " ", text).strip()


OVERRIDES = json.loads(
    (HERE / "tra-printed-forms.overrides.json").read_text(encoding="utf8")
)


def spec_lines(form: str) -> set[str]:
    """Lines (3-digit tails) Chapter 3 lists for this form."""
    f = SPEC / "forms" / f"{form}.json"
    if not f.exists():
        return set()
    data = json.loads(f.read_text(encoding="utf8"))
    out: set[str] = set()
    for section in data.get("sections", []):
        pass
    rows = data.get("rows")
    if rows is None:
        # rows live under the top-level list the extractor wrote
        for v in data.values():
            if isinstance(v, list) and v and isinstance(v[0], dict) and "line" in v[0]:
                rows = v
    for r in rows or []:
        out.add(r["line"][-3:])
    return out


def overlap(a0: float, a1: float, b0: float, b1: float) -> float:
    return max(0.0, min(a1, b1) - max(a0, b0)) / max(1e-6, min(a1 - a0, b1 - b0))


def extract(path: Path) -> list[dict]:
    doc = fitz.open(path)
    found: dict[str, dict] = {}
    for page in doc:
        blocks = [b for b in page.get_text("blocks") if b[6] == 0]
        # Footer / header furniture: skip the strip with the form number and page count.
        blocks = [b for b in blocks if not (b[1] > 745 or "Rev. 20" in b[4])]
        words = page.get_text("words")
        for w in words:
            x0, y0, x1, y1, text = w[:5]
            if not NUMBER.match(text):
                continue
            # What precedes it on the same text line?
            same = sorted(
                (o for o in words if o[5] == w[5] and o[6] == w[6] and o[7] < w[7]),
                key=lambda o: o[7],
            )
            prev = same[-1][4].strip(",.:;()").lower() if same else ""
            if prev in REFERENCE_BEFORE:
                continue
            if same and same[-1][4].endswith(","):
                continue
            nxt = next(
                (o for o in words if o[5] == w[5] and o[6] == w[6] and o[7] == w[7] + 1),
                None,
            )
            if nxt is not None and nxt[4][:1] in ",)" and not nxt[4].startswith(")"):
                # "007, 013 and C" - a list of references
                continue
            blk = next(
                (b for b in blocks if b[0] - 1 <= x0 and x1 <= b[2] + 1 and b[1] - 1 <= y0 and y1 <= b[3] + 1),
                None,
            )
            if blk is None:
                continue
            own = clean(blk[4])
            # Caption: the rest of the token's own block ...
            rest = clean(re.sub(r"(?<!\d)%s(?!\d)" % text, " ", blk[4], count=1))
            rest = re.sub(r"\b(Yes|No)\b$", "", rest).strip()
            confidence = "high"
            caption = rest if len(rest) >= 8 else ""
            if not caption:
                # ... else blocks to the left on the same row, nearest first.
                row = [
                    b for b in blocks
                    if b is not blk and b[2] <= x0 + 2 and overlap(b[1], b[3], y0, y1) > 0.5
                ]
                row.sort(key=lambda b: (b[0], b[1]))
                if row:
                    # contiguous: stop at the first block with a number of its own
                    caption = clean(" ".join(clean(b[4]) for b in row))
                    confidence = "medium"
            if not caption:
                above = [
                    b for b in blocks
                    if b is not blk and b[3] <= y0 + 2 and y0 - b[3] < 24 and b[0] <= x1
                    and overlap(b[0], b[2], x0 - 200, x1) > 0
                ]
                if above:
                    above.sort(key=lambda b: -b[3])
                    caption = clean(above[0][4])
                    confidence = "low"
            if not caption:
                continue
            # A caption that is itself a row of line numbers is a column header row.
            if re.fullmatch(r"(\d{3}\s*)+", caption):
                continue
            row = {
                "line": text,
                "caption": caption,
                "page": page.number + 1,
                "confidence": confidence,
            }
            found.setdefault((text, page.number + 1), row)
    return sorted(found.values(), key=lambda r: (r["page"], r["line"]))


def main() -> None:
    report = "--report" in sys.argv
    SPEC_OUT = SPEC / "printed"
    if not report:
        SPEC_OUT.mkdir(parents=True, exist_ok=True)
    only = [a for a in sys.argv[1:] if not a.startswith("-")]
    for pdf in sorted(FORMS.glob("*.pdf")):
        form = form_of(pdf)
        if form is None or (only and form not in only):
            continue
        listed = spec_lines(form)
        extract_all = extract(pdf)
        lines = [r for r in extract_all if r["line"] not in listed]
        ov = OVERRIDES.get(form, {})
        excluded = ov.get("exclude", {})
        captions = ov.get("caption", {})
        kept = []
        for r in lines:
            key = f"{r['line']}@{r['page']}"
            if key in excluded:
                continue
            if key in captions:
                r["caption"] = captions[key]
                r["confidence"] = "checked"
            kept.append(r)
        lines = kept
        stale = [k for k in {**excluded, **captions} if k not in {f"{r['line']}@{r['page']}" for r in extract_all}]
        if stale:
            sys.exit(f"{form}: override keys match no printed token: {stale}")
        doc = {
            "form": form,
            "printedForm": f"research/sources/tra-forms/pdf/{pdf.name}",
            "note": "Numbered lines printed on the form that Chapter 3 does not list. Not transmitted; the caption is as printed.",
            "lines": lines,
        }
        if report:
            print(f"== {form} ({len(lines)} printed-only lines; spec lists {len(listed)})")
            for r in lines:
                print(f"  {r['line']} p{r['page']} [{r['confidence']}] {r['caption'][:110]}")
        else:
            (SPEC_OUT / f"{form}.json").write_text(
                json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf8", newline="\n"
            )
            print(f"{form}: {len(lines)} lines")


if __name__ == "__main__":
    main()
