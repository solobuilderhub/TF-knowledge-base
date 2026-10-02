# AT1 Chapter 3 knowledge base — Version 2026.4 (Fall 2026 re-certification)

Verified knowledge base built from TRA's "AT1 Chapter 3" spec, cross-checked
against the source PDF page-by-page (not just the `pdftotext -layout`
extraction — see each file's fidelity notes). Built 2026-08-30 for the Fall
2026 AT1 NetFile re-certification round (TC1/TC1-amended/TC2/TC3).

Source documents: `../AT1-Chapter3-2026.4.pdf` (current), `../AT1-Chapter3-2026.4-full.txt`
(layout extraction), `../AT1-Chapter3-2025.2-full.txt` (prior version, for diff).

## The one fact you need right now

**NetFile test-site endpoint** (section 3.3.4, verified against PDF page 3-233):

```
https://citsoftwarecert.finance.gov.ab.ca/CITNetFile-PublicWebServices-context-root/CITReturnFilingSoap12HttpPort?WSDL
```

No production URL is published in the spec — TRA issues that directly after
certification, alongside your real Software Certification Code (this round's
is `HL2026`, replacing the `AB0000` placeholder). See [01-netfile-transmission](./01-netfile-transmission.md).

## Files

| File | Covers |
|---|---|
| [01-netfile-transmission.md](./01-netfile-transmission.md) | Test-site URL, WSDL, SOAP sample envelopes, size/time limits, declaration text, success codes (30001/30002), EDI Schedule Listing (which is actually the software-cert/filer-detail schedule, not a per-AT1-schedule mandatory/optional table — see its own notes) |
| [02-error-messages.md](./02-error-messages.md) | Full §3.3.14 error-code catalog, transcribed from rendered PDF pages (the .txt scrambles this table's columns — do not use the .txt for error codes) |
| [03-jacket-mandatory-fields.md](./03-jacket-mandatory-fields.md) | Lines 101 (Certification Date), 103 (Certification Phone), 105 (CIT Authorized Email) — what actually changed (see correction below) |
| [04-schedule29-ieg.md](./04-schedule29-ieg.md) | The federal T661 line 557-vs-559 transition (cutoff: taxation years ending on/after 2024-12-16 use 557), all 4 affected fields, and a field-by-field check against the existing engine code |
| [06-changelog-2025.2-to-2026.4.md](./06-changelog-2025.2-to-2026.4.md) | Full version diff — confirms nothing changed beyond TRA's own 3-item changelist |

## Corrections to what the cover email implied

Two things worth knowing before you act on the email at face value:

1. **Lines 101/103/105 were already mandatory on the printed/RSI form in
   2025.2.** What's actually new in 2026.4 is that NetFile's own submission
   gate (error 10020) now also rejects a return missing them, alongside TYB —
   previously only CAN/TYE/core EDI fields triggered that specific reject.
   Net effect for you is the same either way (fill them in), but it's a
   validation-gate change, not a form-requirement change.
2. **Line 103's "international phone numbers" change is a length widening,
   not a format change.** Old: exactly 10 digits (NANP-style). New: 10-15
   digits, still digits-only per the spec text — no `+`, spaces, or
   punctuation documented. The product's own phone field already has no
   format validation at all (confirmed by direct code search), so no code
   change is needed either way.

## Engine cross-check result

Schedule 29's T661 557/559 transition — the one substantive engine-facing
change in this release — is **already implemented correctly** in
`packages/ca-tax/src/t2/at1/schedules/schedule29-eligible-expenditures.ts`'s
`iegT661SourceLine()`, byte-exact against the spec's cutoff date. No code
change needed for this round's certification on that front.

## The per-line rules (§3.2) now live in `research/knowledge-base/formulas/at1/`

Extracted from the PDF by `research/tools/rulebook/` — every line of every current form, its business rule verbatim, and its page. The note below predates that.

## What's NOT in this knowledge base

Section 3.2 (AT1 RSI Return Format — the full per-schedule field-by-field
cross-reference tables, ~15,000 lines / most of the document) was not
exhaustively re-transcribed here — it's unchanged from 2025.2 per the
changelog diff, and the existing `packages/ca-tax` engine was already built
against it. Look it up directly in `../AT1-Chapter3-2026.4-full.txt` (or the
2025.2 version — content-identical for anything not listed above) by schedule
number when you need a specific field spec; the fidelity issues found in this
pass (garbled multi-column tables) are concentrated in 3.3.6 and 3.3.14,
already handled above — general per-field text in 3.2 read cleanly in every
spot-check done across the four extraction passes.
