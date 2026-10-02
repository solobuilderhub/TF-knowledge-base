#!/usr/bin/env python3
"""
Extract the AT1 jacket (schedule 000) from the TRA specification.

WHY THIS IS NOT THE CRA PIPELINE
--------------------------------
The federal tools read a PRINTED FORM: caption, dot leaders, line number on one
physical row. Alberta does not publish a fillable AT1 to read that way. What TRA
publishes is a SPECIFICATION whose cross-reference tables are the authority, and
they carry something the CRA forms do not — an explicit **M / O / X** column
saying whether each field is mandatory, optional or conditional.

That column is the reason this extractor exists. Section 3.2.3 states:

    When a form is printed, all mandatory Field IDs must be output to the AT1
    RSI. ... If the value of a mandatory field cannot be determined the value
    must default to zero.

So "mandatory" here is a filing obligation on the OUTPUT, not merely on the
preparer's input, and a renderer silently omitting one produces a payload that
does not satisfy the specification. Carrying the flag through into the form
definition is what lets a test say so.

THE ONE PARSING TRAP
--------------------
A row is `NNN Caption <type> <len> <sign> <M|O|X> <rule>`, but the caption wraps
freely, so the type token can sit three or four physical lines below the number.
The join therefore runs forward until the type token appears, stopping early if
another row starts.

Getting the type-token regex wrong is silent: an earlier version anchored it with
`\\b` before `$`, which cannot match — a space and a `$` are both non-word
characters, so there is no boundary between them. Every DOLLAR field was skipped
and the run still looked healthy at 51 fields. It should be 74. **A parser that
drops a whole column reports success, so assert the count.**

    python extract-at1-jacket.py            # writes the generated captions module
    python extract-at1-jacket.py --report    # print what was parsed
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = HERE.parent / "AT1-Chapter3-2025.2-full.txt"
OUT = (
    HERE.parents[3]
    / "packages"
    / "ca-tax"
    / "src"
    / "t2"
    / "at1"
    / "forms"
    / "generated"
    / "jacket.captions.ts"
)

#: The jacket's cross-reference table. Generous outer bound; the real boundary is
#: found at runtime by FORM_HEADER below, because Schedule 1's own page header
#: ("1B1B3.2.3.2 Schedule 1 - Alberta Small Business Deduction") starts at line
#: 3092 — NOT 3393. A former version of this constant used 3393, which is deep
#: inside Schedule 1's own table and swept in its APASBD/ASBD sub-form fields
#: (e.g. APASBD's own "001") under the jacket's field "001", clobbering it via
#: "first found wins" dedup. Keep this end generous; FORM_HEADER is what
#: actually stops the parse at the correct spot, including if a future spec
#: revision shifts these line numbers again.
SEGMENT = (690, 3393)

#: `NNN Caption` opens a row.
ROW = re.compile(r"^(\d{3}) (.*)$")

#: Repeated page header, e.g. "0B0B3.2.3.1 AT1 - Alberta Corporate Income Tax
#: Return" or "1B1B3.2.3.2 Schedule 1 - Alberta Small Business Deduction". The
#: digit after "3.2.3." identifies which form/schedule owns the table printed
#: beneath it. It repeats on every page of the SAME form/schedule (harmless),
#: but the moment it changes, that form's table has ended and a different
#: form's table has begun — extraction must stop there even if SEGMENT's fixed
#: end is still generous.
FORM_HEADER = re.compile(r"^\d+B\d+B3\.2\.3\.(\d+)\b")

#: `<type> <len> <sign?> <M|O|X>`. The leading `(?:^|\s)` is deliberate — `\b`
#: cannot match before `$`, and using it silently drops every dollar field.
TYPE = re.compile(r"(?:^|\s)(\$|AN|A|N|D|%)\s+\d+(?:/\d+)?\s*([+\-/]*)\s*\b([MOX])\b")

#: How many physical lines a caption may wrap over before we give up.
MAX_WRAP = 7

#: Fields the parse must find, or the extractor is silently under-reporting.
EXPECTED_MIN = 70

#: The specification's own type letters are carried through UNMAPPED. `$`, `%`,
#: `D` and `AN`/`A` map cleanly, but **`N` does not**: it covers a yes/no answer
#: (`N 1`), a coded value (`N 4` nature of business) and a telephone number
#: alike. Deciding which is a reading of the caption, not of the table, so it
#: belongs in the hand-authored module — the same split the CRA generators use.
SPEC_TYPES = {"$", "%", "N", "AN", "A", "D"}


def extract(text: str) -> list[dict]:
    seg = [line.rstrip() for line in text.split("\n")[SEGMENT[0] : SEGMENT[1]]]

    # Stop at the first page header belonging to a DIFFERENT form/schedule than
    # the one this segment opened on. The header repeats harmlessly on every
    # page of the same form; only a change in the "3.2.3.N" suffix means the
    # table has handed off to another form (e.g. Schedule 1, whose own table
    # then contains APASBD/ASBD sub-tables with their own field numbering that
    # must never be mistaken for the jacket's).
    anchor: str | None = None
    end = len(seg)
    for i, line in enumerate(seg):
        header = FORM_HEADER.match(line.strip())
        if not header:
            continue
        if anchor is None:
            anchor = header.group(1)
        elif header.group(1) != anchor:
            end = i
            break
    seg = seg[:end]

    found: dict[str, dict] = {}

    for i, line in enumerate(seg):
        m = ROW.match(line)
        if not m:
            continue
        number = m.group(1)
        if number in found:
            continue  # the tables repeat headers across pages; first wins

        buf = m.group(2)
        hit = TYPE.search(buf)
        j = i
        while not hit and j - i < MAX_WRAP:
            j += 1
            if j >= len(seg):
                break
            nxt = seg[j].strip()
            if ROW.match(nxt):
                break
            buf = f"{buf} {nxt}".strip()
            hit = TYPE.search(buf)
        if not hit:
            continue

        caption = re.sub(r"\s+", " ", buf[: hit.start()]).strip().replace("�", "'")
        if not caption:
            continue
        found[number] = {
            "line": number,
            "caption": caption,
            "specType": hit.group(1) if hit.group(1) in SPEC_TYPES else "AN",
            "requirement": {"M": "mandatory", "O": "optional", "X": "conditional"}[hit.group(3)],
            "critical": "CRITICAL MANDATORY" in buf,
        }

    return [found[k] for k in sorted(found)]


def emit(rows: list[dict]) -> str:
    body = "\n".join(
        "  {{ line: '{line}', caption: {caption}, specType: '{specType}', "
        "requirement: '{requirement}'{critical} }},".format(
            line=r["line"],
            caption="'" + r["caption"].replace("\\", "\\\\").replace("'", "\\'") + "'",
            specType=r["specType"],
            requirement=r["requirement"],
            critical=", critical: true" if r["critical"] else "",
        )
        for r in rows
    )
    mandatory = sum(1 for r in rows if r["requirement"] == "mandatory")
    return f'''/**
 * AT1 jacket (schedule 000) — line items and captions, GENERATED from the TRA
 * specification's cross-reference tables.
 *
 * Do not hand-edit. Re-run:
 *   python research/sources/tra-spec/tools/extract-at1-jacket.py
 *
 * Source: research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt
 *
 * {len(rows)} fields, of which {mandatory} are mandatory. Unlike a CRA form, the
 * specification states an explicit requirement per field, and §3.2.3 makes
 * "mandatory" an obligation on the OUTPUT: *"all mandatory Field IDs must be
 * output to the AT1 RSI ... if the value of a mandatory field cannot be
 * determined the value must default to zero."* A renderer that omits one is not
 * merely incomplete — it is filing a payload the specification rejects.
 *
 * `critical` marks the smaller set the specification says software must REFUSE
 * to generate without; see `assertCriticalFields`.
 */

/** One AT1 jacket field, exactly as the specification tabulates it. */
export interface GeneratedAt1Caption {{
  line: string;
  caption: string;
  /**
   * The specification's own type letter, carried through unmapped. `N` is
   * ambiguous — it covers a yes/no answer, a coded value and a telephone number
   * alike — so the mapping to a form-field kind is a reading of the caption and
   * is made in the hand-authored module beside this one.
   */
  specType: '$' | '%' | 'N' | 'AN' | 'A' | 'D';
  requirement: 'mandatory' | 'optional' | 'conditional';
  /** Software must refuse to generate the return when this is absent. */
  critical?: boolean;
}}

export const AT1_JACKET_CAPTIONS: readonly GeneratedAt1Caption[] = [
{body}
];
'''


def main() -> int:
    if not SPEC.exists():
        print(f"not found: {SPEC}", file=sys.stderr)
        return 1

    rows = extract(SPEC.read_text(encoding="utf8", errors="replace"))
    if len(rows) < EXPECTED_MIN:
        print(
            f"parsed only {len(rows)} fields, expected at least {EXPECTED_MIN} — "
            "the type-token regex is probably dropping a column",
            file=sys.stderr,
        )
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(emit(rows), encoding="utf8", newline="\n")

    mandatory = [r for r in rows if r["requirement"] == "mandatory"]
    print(f"{len(rows)} fields ({len(mandatory)} mandatory) -> {OUT.relative_to(HERE.parents[3])}")

    if "--report" in sys.argv:
        for r in rows:
            flag = r["requirement"][0].upper() + ("*" if r.get("critical") else " ")
            print(f"  {r['line']} {flag} {r['specType']:6} {r['caption'][:64]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
