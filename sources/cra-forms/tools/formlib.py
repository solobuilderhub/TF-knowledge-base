#!/usr/bin/env python3
"""
Shared primitives for reading a CRA form's structure off the printed page.

Four scripts here need the same three things — where the part headings are, which
lines sit under each, and how to normalise a caption. They had grown four copies,
which is how the caption cleaner ended up fixed in one place and not the others.

Nothing in here writes anything; the scripts that import it do.
"""

from __future__ import annotations

import re
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent

#: Primary source documents, exactly as CRA publishes them. Never written to.
PDF_DIR = ROOT / "pdf"
#: Everything derived from them. Regenerate freely; nothing here is hand-edited.
EXTRACT_DIR = ROOT / "extracted"

# Back-compat for callers that still say HERE.
HERE = ROOT

# A three-digit CRA line number, not part of a longer run of digits.
LINE_RE = re.compile(r"(?<!\d)(\d{3})(?!\d)")

# "Part 3 – Foreign investment income", "Area A – …". The dash is usually
# mojibake after a latin-1 decode, so any punctuation is allowed as separator.
# "Part 3", "Area A", and — Schedule 130's shape — "Part 2F". A form may letter
# its sub-parts, and matching only `Part <number>` collapses eighteen distinct
# sections into two.
HEADING_RE = re.compile(
    r"^\s*(?P<kind>Part|Area|Section)\s+(?P<num>[0-9]+[A-Z]?|[A-Z])\s*\W{0,3}\s*(?P<title>.{4,}?)\s*$"
)


def _is_real_heading(title: str) -> bool:
    """Is this a part heading, or something that merely looks like one?

    Two real false positives, both of which silently corrupted a form:

    - Schedule 31 prints a body sentence beginning "Part 22 - on page 11.
      However, if the partnership does not have enough ITC...". Read as a
      heading it opens a SECOND "Part 22" and steals every line after it.
    - Schedule 4 prints "Section 80 - Adjustments for forgiven amounts . . . 140"
      once inside each of its five loss parts. Read as a heading it closes the
      enclosing part and captures the rest of the form, which collapsed all five
      loss sections into one.

    A heading is a title: it starts with a capital, is not a sentence, and is not
    a field. Dot leaders followed by a line number are what a FIELD has and a
    heading never does.
    """
    t = title.strip()
    if not t or not t[0].isupper():
        return False
    if t.endswith("."):
        return False
    # A heading naming another part is a cross-reference inside prose.
    if re.match(r"^(on|in|from|to|see|and|or)", t, re.I):
        return False
    # Leaders then a line number => a field on the form, not a heading.
    if re.search(r"(?:\s*[.·]){4,}\s*\d{3}\s*$", t):
        return False
    return True


def layout_text(stem: str) -> str:
    """The `pdftotext -layout` output for a form, or empty if not extracted yet."""
    path = EXTRACT_DIR / f"{stem}.layout.txt"
    return path.read_text(encoding="latin-1") if path.exists() else ""


def extracted_lines(stem: str) -> list[tuple[str, str]]:
    """The `(line, caption)` rows produced by `extract-lines.py`."""
    path = EXTRACT_DIR / f"{stem}.lines.tsv"
    if not path.exists():
        return []
    return [
        (row.split("\t", 1)[0], row.split("\t", 1)[1])
        for row in path.read_text(encoding="utf8").splitlines()[1:]
        if row.strip()
    ]


def part_headings(text: str) -> list[tuple[str, str]]:
    """Every part heading in order, as `(key, title)` — `('Part 3', 'Foreign …')`."""
    out: list[tuple[str, str]] = []
    for raw in text.splitlines():
        m = HEADING_RE.match(raw)
        if not m or not _is_real_heading(m.group("title")):
            continue
        title = re.sub(r"\s{2,}.*$", "", m.group("title"))  # drop column headers
        title = re.sub(r"\s*\(continued\)\s*$", "", title, flags=re.I)
        key = f"{m.group('kind')} {m.group('num')}"
        if not out or out[-1][0] != key:
            out.append((key, title))
    return out


def part_of_line(text: str) -> dict[str, str]:
    """Which part each line number sits under, read off the page.

    Ranges cannot do this job. Schedule 7 numbers Part 1 (aggregate investment
    income, all world source) and Part 3 (foreign investment income) with
    INTERLEAVED lines and identical captions — "Eligible portion of taxable
    capital gains for the year" is a line in both. Assigning by range files a
    foreign figure as a worldwide one, which is the distinction that schedule
    exists to make.
    """
    current = ""
    found: dict[str, str] = {}
    for raw in text.splitlines():
        m = HEADING_RE.match(raw)
        if m and _is_real_heading(m.group("title")):
            current = f"{m.group('kind')} {m.group('num')}"
            continue
        if not current:
            continue
        for n in LINE_RE.findall(raw):
            found.setdefault(n, current)
    return found


def page_of_line(text: str) -> dict[str, int]:
    """Which printed page each line number first appears on."""
    found: dict[str, int] = {}
    for i, page in enumerate(text.split("\f"), start=1):
        for n in LINE_RE.findall(page):
            found.setdefault(n, i)
    return found


def clean_caption(caption: str) -> str:
    """Normalise the mojibake and padding `pdftotext` leaves behind.

    The forms use an en dash between a label and its qualifier ("Provision for
    income taxes – current"). Decoding the PDF byte as latin-1 yields U+00AD
    (soft hyphen), which renders as nothing at all — so a caption compared
    against the printed form would look identical yet never match.
    """
    caption = (
        caption.replace("­", "–")  # soft hyphen -> en dash
        .replace("�", "–")  # replacement char -> en dash
        .replace(" ", " ")  # non-breaking space
    )
    caption = re.sub(r"(?:\s*[.·]){2,}", " ", caption)
    caption = re.sub(r"\s+", " ", caption).strip()
    return caption.strip(" -–")


def strip_enumeration(caption: str) -> str:
    """Drop the form's own list markers and footnote daggers."""
    caption = re.sub(r"^\d+\.\s+", "", caption)  # "1. Taxable dividends"
    caption = re.sub(r"\s*\*+\s*$", "", caption)  # trailing footnote asterisk
    caption = re.sub(r"\s*\bNote \d+\s*$", "", caption)
    return caption.strip()


def form_stems() -> list[str]:
    """Every form that has been extracted, by file stem."""
    return sorted(p.name.replace(".lines.tsv", "") for p in EXTRACT_DIR.glob("*.lines.tsv"))
