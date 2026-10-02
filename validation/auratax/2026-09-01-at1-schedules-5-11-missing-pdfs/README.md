# AT1 Schedules 5, 6, 7, 8, 9, 11 — do they even exist as separate published forms?

**Date:** 2026-09-01
**Subject:** `research/sources/tra-forms/pdf/` has no fillable PDF for AT1
Schedules 5 (Royalty Tax Deduction), 6 (Royalty Tax Credit), 7 (Royalty Tax
Credit/Deduction Supplemental), 8 (Political Contributions Tax Credit), 9
(SR&ED Tax Credit), or 11 (Manufacturing and Processing Profits Deduction) —
`schedule5.ts` through `schedule11.ts` are all hand-authored from the TRA
Chapter 3 specification text instead, each with a doc comment saying so. Is
that a gap this session should chase down, or is it already the correct
final state?
**Status:** Resolved — not a gap. Three independent sources agree these six
schedules simply are not published as their own fillable forms right now.

## What was checked

1. **`alberta.ca/corporate-income-tax`**, fetched and asked explicitly to list
   every link mentioning "Schedule" or a TRA/AT form number, including
   collapsed sections. Returned 17 real links (jacket, Schedules 1-4, 10,
   12-13, 15-18, 20-21, 29, plus two attachment forms). Schedules 5, 6, 7, 8,
   9, 11 are not among them — confirmed by the fetch tool's own explicit
   "not present on this page" note, not an inference from a shorter list.
2. **Alberta's Central Forms Repository** (`cfr.forms.gov.ab.ca`), probed
   directly with `curl` carrying an ordinary browser `User-Agent` (the
   technique documented in
   `../2026-08-25-at1-schedule1-royalty/README.md` — no login needed for a
   public form). Verified the technique against a known-good number first
   (`TRA11731`, 200, real PDF, byte-identical to what's already vendored).
   Then probed every unused number in the sequence between the confirmed
   schedules: 11726, 11727, 11729, 11730, 11734, 11735, 11739, 11742-11745.
   All but one (`TRA11739`, the *superseded pre-2019* Schedule 18) returned
   302 — the same "log in has changed" redirect a protected/nonexistent form
   gives, not a real document.
3. **AuraTax** (TRA-certified AT1 Net File preparer, used here as the
   project's own live oracle) — logged into the existing "TF Validation
   Alberta Ltd." test AT1 return and opened **Manage Schedules**, which
   lists every schedule AuraTax's own AT1 product implements, split into
   "available" (not yet attached) and "current" (attached to this return).

## Finding

AuraTax's own Manage Schedules dialog lists exactly 15 schedule slots for
AT1, combined across both panes:

```
000  001  002  003  004  010  012  013  015  016  017  018  020  021  029
```

— plus the `AT4970` attachment. That is **precisely** the set this package
already has PDFs and `FormDefinition`s for (jacket + 1, 2, 3, 4, 10, 12, 13,
15, 16, 17, 18, 20, 21, 29). Schedules 5, 6, 7, 8, 9, 11 (and, incidentally,
14 and 19) are not offered by AuraTax at all — not hidden behind a filter,
not paywalled, simply not in either list. A TRA-certified commercial
competitor does not implement them either.

Screenshots: `04-manage-schedules-dialog.png` is the primary evidence — the
full available/current split, with every TRA form code AuraTax itself
displays next to each schedule (confirms `TRA11723`–`TRA11741` line up with
what this package already has, and that `003`/`004`/`015` show inconsistent
TRA-code display — 004 shows `TRA11728` inline, 003 and 015 show none in
AuraTax's own UI either).

## Why this makes sense, not just a coincidence

Reading this package's own existing schedule engines confirms each of these
six is independently a shrinking or already-closed program:

- **Schedule 6/7 (Royalty Tax Credit)** — `schedule6.ts`'s own doc comment:
  administered as an *instalment program*, not a claimed credit; nets to
  nothing in the balance formula the way Schedule 8/9's credits do.
- **Schedule 9 (SR&ED Tax Credit)** — `schedule9.ts`'s own doc comment: *"the
  credit is WOUND DOWN"* — not claimable for anything carried out in Alberta
  on or after 2020-01-01.
- **Schedule 11 (Manufacturing and Processing Profits Deduction)** —
  `alberta-schedule11.ts`'s own hint text: *"Historical — pre-2001-04-01
  only."*

A commercial vendor has no reason to build and certify a fillable form for a
program that predates 2001 or wound down in 2020. This isn't evidence the
schedules are unimportant to this package — the engines are real and
correct — it's evidence TRA and the market around it have moved on from
publishing them as their own standalone paper forms.

## What this changes

**Superseded 2026-09-08: Schedules 5, 6, 7, 8 and 9 have now been DELETED**
from all three repos — form definitions, engine modules, server composers
and contracts, web schedule configs and paper views, and their tests.

When this was first written the conclusion was "nothing changes": the
engines were real and correct, so they were left in place. Three further
pieces of evidence turned that around:

1. **TRA's current printed AT1 has no line for any of them.** TRA11722
   Rev. 2025-07 page 2 strikes its deductions at 070 (Schedule 1), 072
   (Schedule 4) and 076 (Schedule 3), and its credits at 129 (Schedule 29),
   082, 085, 086, 115 and 087. Lines 064, 071, 074 and 081 — the four these
   schedules feed — are not printed anywhere on the form.
2. **The programs are repealed, not merely dormant.** The Alberta Royalty
   Tax Credit ended with 2006; corporate political contributions have been
   prohibited outright since 2015-06-15 (Bill 1), so the contribution
   Schedule 8's credit rewards cannot lawfully be made; the Alberta SR&ED
   tax credit was eliminated for expenditures after 2019-12-31 and replaced
   by the Innovation Employment Grant, which is Schedule 29.
3. **Every form definition in this package declares `taxYears: { from: 2024 }`.**
   None of these five can apply to any year the product files, so the
   definitions were asserting something false.

The RSI still carries lines 064, 071, 074 and 081 — §3.2.3.1 marks them
mandatory and the Net File format stays stable across reassessment years —
so those four are still emitted, now as a documented constant zero with the
repeal reason on each. See `NOTES` in ca-tax's `t2/at1/forms/jacket.ts`.

Deleting them also surfaced a live defect they had been masking: the balance
at line 090 was computed from §3.2.3.1's own rule, which nets the eliminated
Schedule 9 credit (081) and omits both 129 and 115. Every corporation
claiming an Innovation Employment Grant was filed with a balance overstated
by the whole grant. Line 090 now follows the printed form, and the review
layer raises `AT1_BALANCE_FORMULA_CONFLICT` where the two differ.

### Original conclusion, retained

It closes the open question from earlier that session ("are these forms
really needed, and where would more come from") with a definitive
no-PDF-exists-anywhere answer, so nobody re-attempts this search at the same
cost.

## Screenshots

| File | What it proves |
|---|---|
| `01-program-picker.png` | Logged into the AuraTax test account, program tile picker |
| `02-current-state.png` | The existing AT1 test return, jacket (schedule 000) open |
| `03-manage-schedules-attempt.png` | (Discarded — a mis-click landed in the search box, not the dialog; kept only as a record of the `agent-browser click <ref>` no-op issue recurring, same as the earlier session's note) |
| `04-manage-schedules-dialog.png` | **Primary evidence** — the full Manage Schedules split, 15 slots total, no 5/6/7/8/9/11 |

## Method note

Confirms two things from `../2026-08-25-at1-schedule1-royalty/README.md`
still hold:

- `agent-browser click <ref>` still no-ops on some of this app's Angular
  Material controls (`Manage schedules` button, the AT1 program tile).
  `document.querySelectorAll(...)`, find by text, call `.click()` directly —
  reliable both times.
- The CFR direct-PDF-via-`curl` trick needs a real browser `User-Agent` —
  confirmed by first replicating it against a known-good form before trusting
  a negative result on an unknown one.

Cancelled the Manage Schedules dialog before closing — no changes made to
the shared test return.
