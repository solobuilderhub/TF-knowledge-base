Source: AT1-Chapter3-2026.4.pdf section 3.2.1 "AT1 RSI Return Format" / 3.2.3.1 "AT1 - Alberta Corporate Income Tax Return" cross-reference table, verified against PDF pages 39-40 (printed footers "Page 3-39" and "Page 3-40"); compared against AT1-Chapter3-2025.2-full.txt (fields at that version's printed "Page 3-41"/"Page 3-42", .txt lines 3043-3084). Error-catalog cross-check compared against AT1-Chapter3-2025.2-full.txt lines 22572-22601 and against `./02-error-messages.md` (built from rendered PDF pages, the authoritative source for exact error numbers — see Fidelity Notes below).

# AT1 Jacket (Form 000) — Lines 101, 103, 105: Now-Mandatory Certification Fields

## Location note

The task brief expected these fields to sit in the narrative section 3.2.1 (the AT1 RSI
formatting rules, .txt lines ~295-806). They don't — 3.2.1 only describes the *general*
formatting/OCR rules for the RSI. The actual field-level spec (caption, Type, Length, M/O/X
flag, business rules) lives in the **cross-reference table, section 3.2.3.1 "AT1 - Alberta
Corporate Income Tax Return"**, which is part of section 3.2.3 ("Cross-reference tables"),
not 3.2.1. In the 2026.4 PDF this table entry for lines 101/103/105 is on PDF pages 39-40
(footer-labeled "Page 3-39" / "Page 3-40"). Confirmed by extracting those exact PDF pages
directly with `pdftotext -f 39 -l 40` and diffing against the full-text .txt — the two are
byte-for-byte identical for this table, so the .txt is trustworthy here (unlike the
error-message table, see Fidelity Notes).

All three fields belong to form/schedule ID `000` (the AT1 jacket itself); the RSI's 3-digit
field codes are simply `101`, `103`, `105` — there is no `000101`/`000103`/`000105`
compound code in the source text (that compound form is used elsewhere only informally,
e.g. in the error message table's own prose "AT1 line 103").

---

## Line 101 — Certification: Date

- **Caption:** "Certification: Date"
- **Field ID:** 101 (Form 000 — AT1 jacket)
- **Data type:** `D` (Date), fixed length `8` (implicitly YYYYMMDD, per the doc-wide date format rule stated elsewhere in 3.2.1)

**2025.2** (AT1-Chapter3-2025.2-full.txt, line 3052), Requirement = **M**:
> "101 Certification: Date D 8 M No override permitted. This field must be entered."

**2026.4** (AT1-Chapter3-2026.4-full.txt, line 2709), Requirement = **M**:
> "101 Certification: Date D 8 [...] M No override permitted. This field must be entered."

**What changed:** The field-level spec text is byte-identical between versions — line 101 was
already flagged mandatory ("M") in the 3.2.3.1 cross-reference table in 2025.2. What's new in
2026.4 is that AT1 line 101 was added to the explicit list of fields checked by the **NetFile
XML submission-level validation** (error message 10020, "Return is missing one or more
mandatory line items") — see "What actually changed" below.

---

## Line 103 — Certification: Telephone Number

- **Caption:** "Certification: Telephone Number"
- **Field ID:** 103 (Form 000 — AT1 jacket)
- **Data type:** `N` (Numeric)

**2025.2** (AT1-Chapter3-2025.2-full.txt, lines 3055-3059), Requirement = **M**, Length = **10**:
> "103 Certification: Telephone Number N 10 M No override permitted. Must include area code.
> This field must be entered."

**2026.4** (AT1-Chapter3-2026.4-full.txt, lines 2713-2717), Requirement = **M**, Length = **10-15**:
> "103 Certification: Telephone Number N 10-15 [...] M No override permitted. Must include
> area code. This field must be entered."

**Format spec, old vs. new:**
- **2025.2:** exactly **10** digits, numeric type, "must include area code" — i.e. a fixed
  10-digit North-American-style number (no country code, no separators, no `+`).
- **2026.4:** **10 to 15** digits, still numeric type (`N`), same "must include area code"
  language carried forward, no separators/`+`/extension characters documented — this is the
  field the "Important Note to Software Developers" (3.1.1) refers to: "AT1 field 103 has
  been revised to be able to accept international phone numbers." The revision is purely a
  **length-range widening** (10 → 10-15 digits); the doc does not add a country-code prefix
  character, punctuation, or a `+E.164`-style mask — it's still an all-numeric string, just
  longer.

**What changed:** (1) Length constraint widened from a fixed `10` to a range `10-15` to admit
international numbers, exactly as the 2026.4 developer note states. (2) Line 103 was added
to the NetFile XML "missing mandatory line items" validation list (error 10020) — see below.
The M flag in the cross-reference table itself was already present in 2025.2, unchanged.

Do not confuse this field with the *EDI schedule's* own "Phone Number" field (third-party
service provider contact phone, error-catalog entries in the low-201xx range) — that is a
different field on a different schedule, also documented as "minimum 10 digits maximum 15
digits numeric" in **both** 2025.2 and 2026.4 (unchanged across versions), and is unrelated
to AT1 line 103.

---

## Line 105 — CIT Authorized Email

- **Caption:** "CIT Authorized Email"
- **Field ID:** 105 (Form 000 — AT1 jacket)
- **Data type:** `AN` (Alphanumeric), Length `5/50` (min 5 / max 50 characters)

**2025.2** (AT1-Chapter3-2025.2-full.txt, lines 3061-3081), Requirement = **M**:
> "105 CIT Authorized Email AN 5/50 M No override permitted. This field must be entered. Must
> be a valid-formatted e-mail address. The regular expression used for address validation is
> the following: `^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([A-Z]{1,6})$`"
> (followed by a list of accepted accented characters: Â À Ç É Ê Ë È Î Ï Ô Ö Û Ü Ù â à ç é ê
> ë è î ï ô ö û ü ù)

**2026.4** (AT1-Chapter3-2026.4-full.txt, lines 2719-2779), Requirement = **M** (see fidelity
note below — the M glyph is column-displaced in the extracted text, landing next to "mail
address" a few lines down instead of on the field's header line; "This field must be
entered." removes any ambiguity that it is mandatory):
> "105 CIT Authorized Email AN 5/50 No override permitted. This field must be entered. Must
> be a valid-formatted e-mail address. **This email must belong to the owner, operator, or
> director of the corporation. It is not intended for accountants, tax preparers, or third
> party. It will only be used to send important TRACS updates and key documents related to
> your tax account.** The regular expression used for address validation is the following:
> `^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([A-Z]{1,6})$`"
> (same regex, followed by an accented-character list that is garbled/unreadable in this
> extraction — see Fidelity Notes)

**What changed:** (1) The regex and length/type spec are unchanged. (2) 2026.4 adds an
ownership restriction not present in 2025.2: the email must belong to an owner/operator/
director of the corporation specifically — not an accountant, tax preparer, or third party —
and is scoped to TRACS updates/tax-account documents. This addition is **not** listed in the
3.1.1 "changes since 2026.3" note, so it was very likely introduced in an intermediate
release between 2025.2 and 2026.3 rather than in the 2026.4 delta itself; flagged here for
completeness since it's a real content difference between the two source files compared. (3)
Line 105 was added to the NetFile XML "missing mandatory line items" validation list (error
10020) — see below. The table's M flag was already present in 2025.2.

---

## What actually changed for these three lines (the real story behind "now mandatory")

The 3.2.3.1 cross-reference table's Mandatory/Optional/Conditional (M/O/X) flag — which per
section 3.2.1's own definition governs "whether fields are mandatory, conditional or optional
**for the purpose of printing the field on the AT1 RSI**" (paper/OCR output) — already showed
**M** for all three fields (101, 103, 105) in 2025.2. That flag did not change.

What *is* new in 2026.4 is a change to the **NetFile XML submission-level validation**
(section 3.3.14 error message catalog, error **10020**, "Return is missing one or more
mandatory line items. Please contact the developer of your software."). Comparing the
Description text of that same error code between versions:

- **2025.2** (lines 22581-22588): "Return XML is missing line items deemed mandatory for all
  filers. This includes CAN (AT1 Line 034), TYE (AT1 Line 037) and the mandatory line items in
  Section 3.3.6 EDI Schedule Listing." — **no mention of TYB, 101, 103, or 105.**
- **2026.4** (lines 16433-16449, corroborated by `./02-error-messages.md` row for 10020,
  which was built from the rendered PDF pages rather than the scrambled .txt table): "Return
  XML is missing line items deemed mandatory for all filers. This includes: CAN (AT1 Line
  034); TYB (AT1 Line 036); TYE (AT1 Line 037); the mandatory line items in Section 3.3.6 EDI
  Schedule Listing; **Date (AT1 line 101)**; **Telephone number (AT1 line 103)**;
  **Authorized email (AT1 line 105)**."

So the cover email's "AT1 Lines 101, 103, and 105 are now mandatory" is correct, but the
precise mechanism is: these fields are now enforced as mandatory at the **NetFile electronic
submission gate** (reject the whole return with error 10020 if absent), not that the AT1 RSI
printed-form spec changed — that was already M. TYB (line 036) got the same treatment and
should probably be swept into whatever "mandatory fields" pass looks at 034/036/037 line
items, though it's out of scope for this file (jacket lines 101/103/105 only).

Note also that the narrative "order of processing" summary earlier in section 3.3 (item 5,
"Missing Mandatory Line Items", .txt line 16306-16316 in 2026.4) was **not** updated to match
— it still reads "Corporate Account Number (AT1 line 034), Taxation Year End (AT1 line 037),
and all the line items designated as 'mandatory' under the EDI Schedule in Section 3.3.6,"
identical to 2025.2, with no mention of TYB/101/103/105. This is an internal inconsistency in
the source document itself (not a pdftotext artifact — both this narrative bullet list and
the error-catalog description are plain single-column text and extract cleanly) — worth
flagging to whoever implements the "which fields are mandatory" logic, since two sections of
the same spec now disagree.

---

## Fidelity Notes (pdftotext / PDF issues encountered)

1. **pdftoppm unavailable in this environment** — the Read tool's `pages` param (image
   rendering) failed with "pdftoppm is not installed." All PDF cross-checks in this file were
   done instead with `pdftotext -f <n> -l <n>` extracting specific physical pages, then
   diffing against the full-document .txt. For the 3.2.3.1 table (pages 39-40) this diff came
   back byte-identical, so the .txt is trustworthy for *this specific* table.
2. **Field 105's M flag is column-displaced in 2026.4's .txt** (and, less severely, in the
   PDF-page-only extraction too — same tool, same result): it lands three lines down from the
   field's header row, aligned with the word "mail" in "mail address," rather than on the
   `AN 5/50` row. This is very likely a genuine vertical-positioning quirk in the PDF's own
   cell layout for this specific multi-line comment (the flag character sits lower in the
   cell than the cell's first text line), reproduced faithfully by pdftotext rather than
   introduced by it. Not a fidelity issue with the .txt extraction itself, but worth a second
   look with actual page-image rendering if that tool becomes available, since I could not
   visually confirm alignment.
3. **The error-message table (3.3.14) is unreliable in the .txt** for exact Number-to-row
   correspondence — confirmed independently here (I initially misread the "missing mandatory
   line items" error as 10025 based on the .txt's scrambled column layout, before
   cross-checking against `./02-error-messages.md`, which was built from rendered PDF page
   images and shows the correct number, 10020). Any error-code number cited elsewhere for
   these fields should be sourced from `./02-error-messages.md`, not from grepping the .txt
   directly.
4. **Accented-character list is mojibake in 2026.4's .txt** (page 40, after the line 105
   regex) — renders as `�����������` block glyphs, where the same list is legible plain text
   (Â À Ç É Ê Ë È Î Ï Ô Ö Û Ü Ù â à ç é ê ë è î ï ô ö û ü ù) in 2025.2's .txt. Likely a
   font-encoding mismatch for that specific character run in the 2026.4 PDF's font subset,
   not a content change. A trailing bare number `2017043239` also appears after the garbled
   block on page 40 with no clear label — possibly a document/form revision ID stamped in the
   margin; provenance unclear from text alone, flagged rather than guessed at.

## Related
- [Schedule 29 — federal T661 line 557 IEG changes](./04-schedule29-ieg.md)
- [Changelog: 2025.2 to 2026.4](./06-changelog-2025.2-to-2026.4.md)
- [Knowledge base index](./00-index.md)
- [Error messages catalog (full 3.3.14 table)](./02-error-messages.md)
