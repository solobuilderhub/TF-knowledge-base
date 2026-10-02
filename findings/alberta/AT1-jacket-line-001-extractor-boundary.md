# AT1 jacket extractor — a `SEGMENT` boundary bug, and where line 001 really lives

> **CORRECTION, 2026-09-26 — the conclusion below about line 001 is wrong.**
> The four "accepted TRA Fall-2026 NetFile certification samples" in
> `research/validation/tra-test-cases-fall-2026/` are this app's own renders.
> None was ever accepted: the database records every AT1 submission, and before
> 2026-09-25 all three were rejected (10025, 20100, 10030). §3.2.3.2 defines the
> association question as **Schedule 1 line 001 (M)** and the specification's own
> XML sample files `001001001`; the jacket has no line 001. Filing `000001001`,
> out-of-order line items and the non-spec Schedule 29 totals drew **10030**
> ("duplicate line items"). With the payload conformed to the §3.2.3 tables, TRA's
> certification site ACCEPTED TC2 (505002651224), TC1 (505002651225) and TC3
> (505002651226). The tables are now extracted from the PDF by word position:
> `research/sources/tra-spec/tools/extract-at1-schedule-rows.py`.

**Status: bug found and fixed. Two related things changed: the extractor, and
which form files "associated with CCPCs."**

## The apparent discrepancy

`research/sources/tra-spec/tools/extract-at1-jacket.py` reads the jacket's
(form 000's) field list out of `AT1-Chapter3-2025.2-full.txt` using
`SEGMENT = (690, 3393)` (a fixed line range) and a per-row regex, deduping by
3-digit field number with "first found wins."

That range is too wide. Reading the spec directly: the jacket's own section
header (`0B0B3.2.3.1 AT1 - Alberta Corporate Income Tax Return`) repeats
across pages from line 697 through 2993, and the VERY NEXT section header
(`1B1B3.2.3.2 Schedule 1 - Alberta Small Business Deduction`) begins at line
3092 — i.e. the jacket's true table ends at line 3091, two full pages before
the old `SEGMENT`'s end bound of 3393. Schedule 1's own section embeds a
sub-table headed "APASBD — Association for Purposes of the Alberta Small
Business Deduction" (spec line 3161) with its own field `001` ("Is the
corporation associated with one or more Canadian-controlled private
corporations?"), followed immediately by Schedule 1's own `ASBD` table
starting at field `003`. The old, too-wide `SEGMENT` captured APASBD's `001`
and Schedule 1's `003`/`009` as if they belonged to the jacket, and "first
found wins" let them silently win over nothing (the jacket's own table never
had a competing `001`/`003`/`009` row to lose to).

## The fix, extractor side

`extract-at1-jacket.py` now has a `FORM_HEADER` regex
(`^\d+B\d+B3\.2\.3\.(\d+)\b`) that records the section digit of the first
header it sees (`1` for the jacket) and truncates the working segment the
moment a header with a DIFFERENT digit appears. This is a durable stop
condition, not a hardcoded line number — it survives future spec-revision
line shifts, unlike the fixed `SEGMENT` end bound it replaces (kept as a
generous outer bound only).

Result: `jacket.captions.ts` went from 74 fields (51 mandatory) to 71 (48
mandatory) — correctly dropping `001`, `003`, `009`. Every other known-good
jacket line (005, 010–105, 110, 115, 129 — the full list checked against
`at1-line-items.ts`'s own doc comment) is still present; nothing was lost.

## But real filed XML disagrees with the spec's own table structure — for 001 only

Before trusting the corrected 71-field list at face value, it was checked
against real evidence: 4 accepted TRA Fall-2026 NetFile certification samples
already checked into this repo
(`research/validation/tra-test-cases-fall-2026/{tc1,tc2,tc3,tc1-amended}-netfile.xml`).
All four:

- File `<Value LineItemID="000001001">` as the FIRST value inside
  `<Schedule Number="000">` (the jacket), right after `ProgramCode` and right
  before `000005001` (SCC) — in every sample, both Yes (`1`) and No (`2`)
  answers.
- File `<Schedule Number="001">` starting at `001003001` — never
  `001001001`, `001007001` maps to the balance line, `001009001`/`001013001`
  follow. Schedule 1 genuinely has no field 001 of its own in any real
  sample.

So the extractor's structural fix was right for `003`/`009` (real duplicates,
confirmed absent from the jacket in every sample) but wrong for `001` — that
field IS real, and belongs to the jacket, despite the spec's own tabular
MAPPINGS never listing a "001" row inside the jacket's true section boundary
(690–3091). The likely explanation: field 001 is documented as PROSE in the
section's filing-exemption preamble (the "8 questions" gate text around spec
line 767–778: *"If ALL the answers to the following 8 questions are Yes...
the corp is exempt from filing"*) rather than as a table row the extractor's
row-regex can see — a genuine gap in what the tabular MAPPINGS enumerate, not
evidence the field doesn't exist.

## Resolution

- `jacket.captions.ts` stays generator-owned and unmodified for this case —
  71 fields, correctly excluding 001/003/009 per the spec's own table
  structure.
- `jacket.ts` hand-splices ONE additional field, `LINE_001`, ahead of the
  generated ones, with a doc comment citing this file and the 4 real samples.
  This is the one legitimate exception to "don't hand-edit the generated
  captions" in this schedule — because the discrepancy isn't with the
  generator's correctness, it's with what the spec's table can express at
  all.
- `schedule1.ts` no longer models a field 001 of its own (removed, along with
  its now-empty `association` `SECTIONS` entry).
- `at1-schedule-line-items.ts`'s `schedule1Values` no longer files
  `001001001` (the `isAssociated`/`put('001', ...)` path was removed
  entirely, not just left unused — a dead-but-wired path with its own
  interface field and doc comment was exactly the kind of landmine a future
  edit could accidentally re-wire).
- `at1-line-items.ts`'s jacket-level `At1FilingData`/`AT1_RETURN_LINE_ITEMS`/
  `AT1_MANDATORY_WITHOUT_DEFAULT` keep `associatedWithCcpcs` (000001001);
  `activeBusinessIncome`/`federalTaxableIncome` (003/009) were removed —
  those really were fabricated jacket-level duplicates with no real jacket
  line to attach to.
- The guided editor's "Associated with one or more CCPCs? (line 001)"
  question (`apps/web/.../schedules/at1/alberta.ts`) stays a genuine,
  standalone, mandatory jacket-level question — NOT auto-derived from
  Schedule 1's own SBD-eligibility association test
  (`assemble-at1-schedules.ts`'s `scheduleOne`/`isAssociated`), because that
  derivation is `undefined` whenever the corporation isn't claiming the
  Alberta SBD at all, while jacket line 001 is unconditionally mandatory
  regardless of whether Schedule 1 applies. An independent, prior
  live-validation session
  (`research/validation/auratax/2026-08-29-jacket-comparison/`) had already
  verified this exact guided-editor question against the live product with
  no defect, before any of this investigation — corroborating evidence, not
  just the 4 samples.

## If this needs to be revisited

- If the AT1 NetFile spec is ever re-vendored at a newer revision, re-run
  `extract-at1-jacket.py --report` and diff the field list — the
  `FORM_HEADER` stop condition should keep working, but line 001's
  prose-only documentation means it will NEVER appear in the generated
  output; that's expected, not a regression.
- A worked Net File XML sample with `associatedWithCcpcs` answered `1` (Yes)
  AND a populated Schedule 1 Area A agreement table together would be the
  cleanest way to triple-confirm the jacket-vs-Schedule-1 split for the
  "associated" case specifically (all 4 available samples happen to have
  simple/no association data for Schedule 1's own agreement table).
