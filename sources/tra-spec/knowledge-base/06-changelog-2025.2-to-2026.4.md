Source: `AT1-Chapter3-2025.2-full.txt` (25,385 lines, pdftotext -layout of the 2025.2 PDF, footer "Version 2025.2 / August 2025") diffed against `AT1-Chapter3-2026.4-full.txt` (18,677 lines, pdftotext -layout of `AT1-Chapter3-2026.4.pdf`, footer "Version 2026.4 / August 2026", re-extracted locally with `pdftotext -layout` and confirmed byte-for-byte identical to the checked-in .txt — 0 lines of diff). Section 3.1.1 "Important Note to Software Developers" (2026.4 .txt lines 245-253) is scoped to changes "since release 2026.3", not since 2025.2, so this file closes that gap by diffing the two endpoint documents directly. Methodology: raw `diff`, a whitespace/word-token diff with page-boilerplate stripped, and full-document token-frequency comparisons (dollar amounts, percentages, SIC codes, country/province codes) — see "Why the doc got shorter" for why line-level diff alone is unusable here.

# Changelog: AT1 Chapter 3 spec, release 2025.2 → 2026.4

## Why the doc got shorter

The 6,708-line drop (25,385 → 18,677) is a PDF-generation/layout artifact, not content loss. Evidence:

- **Total word count is nearly unchanged**: 67,388 words (2025.2) vs 66,241 (2026.4) — a 1.7% difference, in the wrong direction to explain a 26% line-count drop. After stripping page headers/footers/classification stamps, the word counts are 63,618 vs 64,099 — 2026.4 actually has *more* words.
- **The drop is concentrated almost entirely in section 3.2.3 "Cross-Reference Tables"** (the AT1/schedule field-mapping tables): 2025.2 lines 641–21,837 (21,196 lines) vs 2026.4 lines 806–15,681 (14,875 lines) — a 6,321-line difference, which accounts for ~94% of the document's total 6,708-line reduction. Sampled directly (e.g. AT1 form header row, Schedule 1 field 015 "Business Limit"): the 2025.2 PDF's table columns are narrow enough that pdftotext -layout emits one word (sometimes one syllable) per physical line ("SCHEDULE/FORM/LINE" / blank / blank / "MAPPINGS" / blank / "Line" / blank / "Code" …), while the 2026.4 PDF's tables are laid out with wider columns so the same cell text packs onto far fewer physical lines. The table content itself, spot-checked verbatim on Schedule 1 line 015 (the $200,000/$11,250/$90,000/April-6-2022 business-limit formula) and the AT1 field 000 completion rule, is word-for-word identical between versions.
- **Section 3.5 "SIC Codes" and 3.4 "Country/Province Codes" are verbatim carryovers**, just reflowed from one column to two. Extracting the 4-digit SIC codes as a set gives exactly 876 codes in both files, zero added/removed (the one apparent "extra" 4-digit token in 2026.4, `2026`, is the version-year footer leaking into a page, not a code). The 2-letter country/province codes: 276 unique codes, identical counts in both. Tellingly, several pages inside 2026.4's SIC section (.txt lines ~16940–17104) still carry a stale **"Version 2025.2 / August 2025"** footer stamp instead of "Version 2026.4 / August 2026" — TRA appears to have copy-pasted these appendix pages into the new template without re-stamping them, confirming they weren't touched.
- **Full-document token-frequency parity**: every `$`-prefixed dollar amount in the corpus (`grep -oE '\$[0-9][0-9,]*' | sort | uniq -c`) and every `NN%`/`NN.N%` percentage token appear with **identical values and identical counts** in both files (`diff` of the sorted frequency tables returns nothing). No dollar threshold or rate changed anywhere in the document, including outside the known Schedule 29 edit.
- **Secondary, smaller cause**: 2025.2's running header/footer ("Page 3-NN" / "Version 2025.2" / "August 2025" / "Classification: Protected A" ×2, plus a literal "===== PAGE N =====" marker) is present on every one of its 275 pages as extractable text; 2026.4 has zero "Page 3-NN" or "===== PAGE" text lines at all — its running footer (which still exists visually, e.g. "Page 3-286 / Version 2026.4 / August 2026" appears at document end) is present on far fewer of 2026.4's 286 pages. This trims roughly 3,000-4,000 lines of pure boilerplate but, unlike the table reflow, contributes no ambiguity about content.

Net effect: 2026.4 is a **denser layout of the same content**, not a trimmed spec. Anyone reading only the 2026.4 .txt is not missing table rows, SIC codes, country codes, thresholds, or rates that existed in 2025.2.

## Undocumented changes found

None found beyond the documented 3, after: full-corpus dollar-amount and percentage token-frequency diffs (exact match), SIC/country code set diffs (exact match), TOC/section-outline diff (identical section numbers and titles 3.1 through 3.5, no additions/removals/renumbering), verbatim spot-checks of Schedule 1's business-limit formula and the AT1 form-000 completion rule, and byte-identical WSDL/SOAP endpoint and service-availability text (section 3.3.4-3.3.5). A word-level diff of the full section 3.2.3 cross-reference tables was also attempted but produced too much false-positive noise from table-cell reflow to be usable as a standalone signal (see methodology note above) — it was not treated as authoritative on its own, only as a secondary check layered on top of the token-frequency and spot-check evidence, which converge on "no change."

| Section/field | Old (2025.2) | New (2026.4) | Engine relevance |
|---|---|---|---|
| — | — | — | No undocumented substantive changes identified. |

## Changes already covered elsewhere

The 3 changes disclosed in section 3.1.1 "Important Note to Software Developers" (since release 2026.3) are documented in depth in other knowledge-base files and are not duplicated here:

1. AT1 field 103 revised for international phone numbers — see `./03-jacket-mandatory-fields.md`
2. AT1 Schedule 29 updated for federal T661 line 557 (current-expenditures transition) — see `./04-schedule29-ieg.md`
3. Additions to section 3.3.14 Error messages — see `./02-error-messages.md`

## Related

- `./00-index.md`
- `./01-netfile-transmission.md`
- `./02-error-messages.md`
- `./03-jacket-mandatory-fields.md`
- `./04-schedule29-ieg.md`
