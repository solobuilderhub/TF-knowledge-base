"""Read the form fields out of a FILLABLE CRA PDF: pdf/ -> extracted/<form>.fields.tsv

A fillable CRA form is an XFA document. Its template names every box the form
has, and gives each one an accessibility caption ("speak" text) that CRA writes
for screen readers, for example:

    Line 280. Charitable donations closing balance. Amount 1D minus line 260.

That one sentence carries the line number, the caption and the arithmetic, and
it is attached to the field itself, so nothing has to be inferred from where
text sits on the page. `extract-lines.py` (pdftotext -layout) cannot do that
for a grid form, where the numbers are column headings; this can.

One row per field:

    page  part  field  line  kind  digits  speak

  page    1-based page the field sits on
  part    the subform chain under the page (CRA's own names, e.g. Prt1_Char_Don_sf)
  field   the field's name in the template
  line    the line number the speak text opens with, or empty (lettered amounts
          such as "Amount 1D" have no line number and are not transmitted)
  kind    numeric / text / date / check / choice / button
  digits  the most digits a numeric field accepts, where the form states it
  speak   the caption, whitespace collapsed

The three flat PDFs held (Schedules 12, 13, 33) have no template; they are
reported and skipped, never guessed at.

Needs PyMuPDF (`pip install pymupdf`), the same dependency as tools/rulebook.

    python extract-xfa.py              # every PDF in pdf/
    python extract-xfa.py T2SCH02      # forms whose file name starts with this
"""

from __future__ import annotations

import csv
import re
import sys
import xml.etree.ElementTree as ET

import pymupdf

from formlib import EXTRACT_DIR, PDF_DIR

LINE_RE = re.compile(r"^\s*Line\s+(\d{3,4})\b", re.I)
KINDS = {
    "numericEdit": "numeric",
    "textEdit": "text",
    "dateTimeEdit": "date",
    "checkButton": "check",
    "choiceList": "choice",
    "button": "button",
    "barcode": "barcode",
    "signature": "signature",
}


def xfa_template(path) -> str:
    """The XFA `template` packet, or '' when the PDF is not a fillable form."""
    doc = pymupdf.open(path)
    acro = doc.xref_get_key(doc.pdf_catalog(), "AcroForm")
    if acro[0] != "xref":
        return ""
    xfa = doc.xref_get_key(int(acro[1].split()[0]), "XFA")
    if xfa[0] != "array":
        return ""
    # The array alternates packet names and stream references.
    parts = re.findall(r"\(([^)]*)\)\s*(\d+) 0 R", xfa[1])
    for name, xref in parts:
        if name == "template":
            return (doc.xref_stream(int(xref)) or b"").decode("utf-8", "replace")
    return ""


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def child(el, name):
    for c in el:
        if local(c.tag) == name:
            return c
    return None


def field_rows(template: str):
    root = ET.fromstring(template)
    rows = []

    def walk(el, page, chain):
        for c in el:
            tag = local(c.tag)
            if tag == "subform" or tag == "subformSet" or tag == "area" or tag == "exclGroup":
                name = c.get("name") or ""
                if tag == "subform" and re.fullmatch(r"Page\d+", name, re.I):
                    walk(c, int(re.sub(r"\D", "", name)), [])
                else:
                    walk(c, page, chain + [name] if name else chain)
            elif tag == "field":
                ui = child(c, "ui")
                kind = ""
                if ui is not None:
                    for u in ui:
                        kind = KINDS.get(local(u.tag), kind)
                speak = ""
                assist = child(c, "assist")
                if assist is not None:
                    sp = child(assist, "speak")
                    tip = child(assist, "toolTip")
                    speak = (sp.text if sp is not None and sp.text else "") or (
                        tip.text if tip is not None and tip.text else ""
                    )
                speak = " ".join(speak.split())
                digits = ""
                for ev in c.iter():
                    if local(ev.tag) == "script" and ev.text:
                        m = re.search(r"validateKeystrokeNumeric\(this,\s*(\d+)", ev.text)
                        if m:
                            digits = m.group(1)
                            break
                m = LINE_RE.match(speak)
                rows.append(
                    (
                        page or "",
                        "/".join(chain),
                        c.get("name") or "",
                        m.group(1) if m else "",
                        kind,
                        digits,
                        speak,
                    )
                )

    walk(root, 0, [])
    return rows


def main() -> int:
    prefixes = sys.argv[1:]
    pdfs = sorted(p for p in PDF_DIR.glob("*.pdf") if not prefixes or any(p.name.startswith(x) for x in prefixes))
    if not pdfs:
        print("no PDFs matched", file=sys.stderr)
        return 1
    EXTRACT_DIR.mkdir(exist_ok=True)
    for pdf in pdfs:
        template = xfa_template(pdf)
        if not template:
            print(f"{pdf.name:48s} flat PDF, no form template: skipped")
            continue
        rows = [r for r in field_rows(template) if r[4] != "button"]
        out = EXTRACT_DIR / f"{pdf.stem}.fields.tsv"
        with out.open("w", encoding="utf-8", newline="") as f:
            w = csv.writer(f, delimiter="\t", lineterminator="\n")
            w.writerow(["page", "part", "field", "line", "kind", "digits", "speak"])
            w.writerows(rows)
        lines = {r[3] for r in rows if r[3]}
        print(f"{pdf.name:48s} {len(rows):4d} fields, {len(lines):4d} distinct lines -> {out.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
