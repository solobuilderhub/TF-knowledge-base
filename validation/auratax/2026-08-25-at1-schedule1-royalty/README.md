# AT1 Schedules 1, 20, 29 — line-number spot-check, prompted by a certification question

**Date captured:** 2026-08-25
**Oracle:** AuraTax (app.auratax.ca), a TRA-certified AT1 preparer, PLUS the
official TRA form PDFs downloaded directly from `cfr.forms.gov.ab.ca` (see
`research/sources/tra-forms/pdf/`)
**Subject:** whether TaxFoundry's field-to-line mapping for AT1 Schedules 1, 20
and 29 is correct
**Status:** completed — **Schedule 29 had a real defect, now fixed**; Schedules
1, 2, 10 and 20 were checked and are correct as they stood

---

## Why this session happened

TRA's certification team asked which Alberta schedules the software supports.
Before answering, the schedule-coverage list was cross-checked against
`AT1_SCHEDULES_WITH_BUILDERS` — which turned up a claim, based on a `grep` of
`research/sources/tra-spec/AT1-Chapter3-2025.2-full.txt`, that Schedule 1's
royalty-deduction fields (005/007/011/013) didn't exist and were a bug.

**That claim was wrong**, and the way it was wrong is the point of this
session: the Chapter 3 spec's raw text extraction dropped rows for Schedule 1
that are plainly present on the live form. This project's own rule — *render
the page before believing an extraction* — exists for exactly this failure
mode, and a `grep` against extracted text is the same class of mistake as
trusting `pdftotext` on a two-column layout without rendering it.

## Schedule 1 — confirmed correct (`03-schedule1.png`)

Logged into an existing AuraTax AT1 return and opened Schedule 001 directly.
Every field matches the code exactly:

| Line | Live form | Code (`at1-schedule-line-items.ts`) |
|---|---|---|
| 001 | Associated with a CCPC? | ✓ |
| 003 | Income from active businesses | ✓ |
| 005 | Deduct: royalty tax deduction (Sch 5, line 021) | ✓ |
| 007 | Balance, 003 − 005 | ✓ |
| 009 | Taxable income, adjusted | ✓ |
| 011 | Deduct: royalty tax deduction | ✓ |
| 013 | Balance, 009 − 011 | ✓ |
| 015 | $200,000 threshold base | (not filed — not asserted) |

No change made. The engine's Schedule 1 builder was correct before this
session and remains correct.

## Schedule 2 and Schedule 10 — confirmed correct against the TRA spec text

Unlike Schedule 1, these two DID extract cleanly from
`AT1-Chapter3-2025.2-full.txt` — checked field-by-field, both match the code
exactly (002/004/006/008 for allocation; 002/003–008/010/042/044/046/048 for
loss carry-back). No change made.

## Schedule 20 — confirmed correct (`04-schedule20-area-a.png`, `05-schedule20-area-b.png`)

All 25 fields across Area A (charitable donations), Area B (maximum deduction
calculation) and the gifts continuity match the live form exactly, extracted
via `element.innerText` rather than scrolling (the panel's scroll container
wasn't reachable through the automation used here — reading the full text
node was more reliable than fighting it). No change made.

## Schedule 29 — a real defect, found and fixed

Adding Schedule 029 to the test AT1 return (`06-`, `07-`, `08-` — via **Manage
schedules** → tick the row → the `east` arrow button → **Apply**) and opening
it (`09-schedule29-page1.png`) showed line 128 captioned **"($40,000,000 −
(line 126 − $10,000,000)) / $40,000,000"** — a REDUCTION FACTOR from 0 to 1,
not "incremental eligible expenditures" as the code's field-128 mapping
claimed.

Downloaded the official form directly (`research/sources/tra-forms/pdf/
AT1SCH29-innovation-employment-grant-TRA14637.pdf`, Rev. 2026-06) and rendered
page 2 at 250dpi (`10-tra-pdf-schedule29-page2-official.png`) to confirm
against the primary source, not just a third party's rendering. It agrees with
AuraTax exactly:

```
line 110  Part I:  (Lesser of 031 and 108) × 8%
line 112  Part II (non-associated): ((Lesser of 031 and 108) − Base Amount) × 12%
line 125  Part II (associated):     (Lesser of 108 or allocated allowed amount) × 12%
line 126  Taxable capital
line 128  (($40,000,000 − (line 126 − $10,000,000)) / $40,000,000)  [enter 1 if TC ≤ $10M]
line 130  IEG = (line 110 + (line 112 or line 125)) × line 128
line 132  Recapture
line 134  NET IEG (130 − 132) → AT1 page 2, line 129
```

The engine (`schedule29-ieg.ts`) instead reduced the **$4,000,000 expenditure
limit** itself on the same $10M–$50M band, then computed the credit against
the smaller limit. The two are not the same calculation: reducing an input to
a formula with two different rates (8% and 12%) applied at different stages is
not equivalent to computing the formula in full and then scaling the output —
they only coincide when spending never approaches the limit. A worked example
proving the divergence is in `packages/ca-tax/tests/t2-at1-ieg.test.ts`
(`'diverges sharply from the old (wrong) mechanism once spending nears the
limit'`).

A second, smaller defect rode along: line 110 was computed as 8% of only the
*non-incremental* portion of spending, not the full capped amount the form
specifies. In total-dollar terms this happened to net out to the same figure
as the correct decomposition whenever there was no taxable-capital grind
(8%×(capped−increment) + 20%×increment = 8%×capped + 12%×increment,
algebraically) — which is exactly why it went unnoticed: the *total* grant was
right in the common case, only the individual 110/112 fields filed were wrong,
and only the total went wrong once taxable capital entered the $10M–$50M band.

### What was fixed

`packages/ca-tax/src/t2/at1/schedules/schedule29-ieg.ts` — `computeIeg` now
takes `taxableCapital` and an optional `recapture`; `computeIegReductionFactor`
replaces `computeIegExpenditureLimit` (removed — a breaking change to that
export); the $4M limit is no longer taxable-capital-ground anywhere, including
the associated-group layer (`schedule29-ieg-group.ts`). The payload builder
(`schedule29Values`) now files 110, 112, 126, 128, 130, 132 (when present) and
134 — previously only 110, 112 and a wrongly-labelled 128. The UI-facing form
definition (`forms/schedule29.ts`) had the identical error baked into its own
captions and rate constant (`AT1_IEG_ENHANCED_RATE` was 0.2, should be 0.12)
and was fixed the same way. Full detail and every changed number: see the
doc comment at the top of `schedule29-ieg.ts` and the CHANGELOG (`[0.0.2]`).

### One thing NOT resolved — worth asking TRA directly

TRA's own Chapter 3 specification (`AT1-Chapter3-2025.2-full.txt`, version
2025.2 / August 2025 — ten months **older** than the Schedule 29 PDF above)
states the AT1 jacket's line-129 business rule as:

```
(029110 + 029112 X 029128) minus 029132
```

— multiplying **only line 112** by the factor, not the sum of 110 and 112.
That contradicts Schedule 29's own printed caption at line 130, which both the
official PDF and AuraTax's live rendering agree reads as "sum, then multiply."
The code now follows the newer, doubly-corroborated schedule form. Given the
Schedule 29 PDF is stamped a full 10 months later than the spec text, the
likeliest explanation is that TRA's Chapter 3 document simply hasn't been
resynced against the form — but this is exactly the kind of question the
current TRA correspondence exists for, and it changes the filed dollar figure
for any corporation whose taxable capital sits inside the $10M–$50M band.

## Screenshots

| File | What it proves |
|---|---|
| `01-login-landing.png` | Logged into the AuraTax test account |
| `02-at1-return.png` | The existing AT1 test file, schedules 000–021 already attached |
| `03-schedule1.png` | Schedule 1 — every royalty field (005/007/011/013) exactly as coded |
| `04-schedule20-area-a.png` | Schedule 20 Area A — all 10 donation-continuity fields |
| `05-schedule20-area-b.png` | Schedule 20 Area B header, confirming the maximum-deduction fields |
| `06-manage-schedules-list.png` | The Manage Schedules dialog — 029 available, not yet attached |
| `07-manage-schedules-add-029.png` | 029 moved to "current schedules" |
| `08-schedule029-added.png` | 029 attached, ready to open |
| `09-schedule29-page1.png` | Schedule 29 live — confirms the 110/112/128/130/132/134 layout |
| `10-tra-pdf-schedule29-page2-official.png` | The OFFICIAL TRA PDF (Rev. 2026-06), rendered at 250dpi — the primary-source confirmation, independent of AuraTax |

## Method note

Same harness as `2026-08-10-schedule54-lrip`; read `research/validation/README.md`
first. Two things learned this session, worth recording so they aren't
re-discovered at cost next time:

- **`agent-browser click <ref>` on some AuraTax grid tiles silently no-ops.**
  What worked: `document.querySelectorAll('mat-grid-tile')` in `eval`, find by
  `textContent`, and call `.click()` on the element directly. Slower but
  reliable against this app's Angular Material grid.
- **When a form panel's scroll container won't respond to `scroll`/`PageDown`**,
  reading `element.innerText` via `eval` gets the full text regardless of
  scroll position — faster than fighting the scroll, and it was how Schedule
  20's Area B and gifts sections were confirmed.
- **The official TRA form PDFs are directly downloadable**, not just the
  Chapter 3 spec — `https://cfr.forms.gov.ab.ca/Form/<code>` (e.g. `TRA14637`
  for Schedule 29) serves the PDF directly to a `curl` request carrying an
  ordinary browser `User-Agent` header; no login or browser needed. The full
  set for every AT1 schedule this package implements is now in
  `research/sources/tra-forms/pdf/`. This is a BETTER primary source than the
  Chapter 3 spec text for line-level captions — it is what the extraction
  pipeline should prefer going forward, the same way CRA's own PDF forms are
  preferred over any secondary description of them.
