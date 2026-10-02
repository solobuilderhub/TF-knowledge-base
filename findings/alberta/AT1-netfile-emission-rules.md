# AT1 Net File — the XSD and the M/O/X emission rules

**Status:** both implemented and asserted. Validator at
`tests/certification/at1-xsd-validator.ts`; the critical-field guard at
`packages/ca-tax/src/t2/at1/filing/at1-line-items.ts`. Certification suite: **47
assertions, no todos**.

## The correction worth recording

Both of these were logged as blocked on documents we did not hold — "obtain
`AlbertaCorporateIncomeTaxReturn.xsd` and the RSI Cross-Reference from TRA". That
was wrong. **Both are inside the specification already in
`../../sources/tra-spec/AT1-Chapter3-2025.2-full.txt`**: the schema in full at
§3.3.8, and the emission rules at §3.2.3.

The lesson generalises and belongs with the others in `research/README.md`:
before recording something as blocked on an external document, **search the
documents already held**. A 25,000-line specification is not something anyone has
read end to end, and its table of contents is the cheapest thing to check.

## The XSD

Extracted verbatim to
`../../sources/tra-spec/AlbertaCorporateIncomeTaxReturn.xsd` and confirmed to parse.
Small — one root, three nested elements, four simple types:

```
ReturnSubmission → Return → ProgramCode, then Schedule (one or more)
Schedule  @Number : ScheduleNumber   length 3, \w{3}          Value (one or more)
Value     @LineItemID : LineItemID   length 9, \w{3}[0-9]{6}
          content     : ValueString  maxLength 175
ProgramCode          : length 2, [0-9]{2}
```

Note the schema itself is stamped **Version 0.09, November 19 2010** — it has been
stable for fifteen years, which is worth knowing when weighing how much to invest
in following it.

### Why the validator reads the schema rather than hard-coding it

`validateAt1NetFile` parses the facets out of the XSD **at run time**. Change the
schema file and the validator changes with it; hand-copying `length="9"` into a
test would decouple the two silently.

It also avoids a Java-backed XSD validator dependency for a schema this small. The
trade is that the parse is targeted rather than general — acceptable because the
schema is flat and unnamespaced, and unacceptable the moment it isn't.

Two implementation points that would otherwise bite:

- **XSD patterns are implicitly anchored; JavaScript's are not.** `\w{3}[0-9]{6}`
  in an unanchored `RegExp` matches any string *containing* that shape. Wrapped in
  `^(?:…)$`.
- **The schema declares a `sequence`, not a `choice`.** A payload with
  `ProgramCode` after the first `Schedule` has every element present and is still
  invalid. Checked explicitly.

The suite includes three **negative** tests — a malformed line item id, an
over-long value, and an out-of-order `ProgramCode`. A validator that never fails is
not a validator, and those tests are what say so.

## The M/O/X emission rules (§3.2.3)

| Class | Rule |
|---|---|
| **M** — Mandatory | MUST be provided. `0` **must be printed** for a null numeric. A mandatory **date** must be a real date — *"'0' is not an acceptable value for a date field"*. |
| **O** — Optional | The preparer's choice, but an optional line with a null value **must not be included**. |
| **X** — Conditional | Condition met ⇒ becomes Mandatory. Condition not met ⇒ becomes Optional (may be omitted; if present, cannot be null). |

The same applies at schedule level: every schedule including the AT1 itself is
conditional, and must only be printed if its condition is met **and** not all of
its line items are null.

The instinct to omit zeros as tidier is exactly backwards for a mandatory line —
omitting a mandatory zero is a rejection.

## Critical Mandatory — the rule that required new code

The specification goes further for five fields:

> These "critical mandatory" fields MUST be present on the AT1 RSI. **Software
> must disallow the printing/generation of the AT1 RSI** if any one of these
> fields has not been specified on the preparer's AT1.

| Field | |
|---|---|
| 000010 | Legal Name |
| 000012 | Mailing Address line 1 |
| 000014 | Mailing Address city |
| 000036 | Taxation Year Beginning |
| 000037 | Taxation Year Ending |

**"Disallow" means refuse, not warn.** `assertCriticalFields` therefore *throws* —
a payload missing one of these is not a payload with a gap in it, it is one that
must never leave the building. `renderAt1NetFile` calls it first, so there is no
path that produces such a payload.

`At1CriticalFieldMissingError` carries the full `missing` list rather than the
first failure, because a preparer fixing a rejected return wants all of them at
once. Blank-but-present counts as missing — `"   "` is not a legal name.

An invalid date is treated as missing, not as a formatting problem, which follows
directly from the specification's refusal to accept `0` for a date.

## RSI print format — was stale, then wired end-to-end, 2026-09-03

**The renderer itself was already built and tested** (`at1-rsi-renderer.ts`,
`renderAt1Rsi`/`renderRsiHeader`/`renderRsiLineItem`/`formatRsiAmount`/
`formatRsiText`/`formatRsiDate`, 24 passing tests transcribed against the
spec's own worked examples) — this "Open" note was stale, same as several
others in this sweep. **Nearly destroyed it by accident**: reached for
`Write` to create what I believed was a new file at the same path, without
checking it already existed and was tracked in git — `git status` should
have been checked first, per this session's own standing discipline for
exactly this situation. Caught via a user interrupt before continuing, and
restored cleanly with `git checkout`. Lesson: `Write` will silently succeed
over an untracked-by-me but git-tracked file if the harness believes the
file was "read" earlier in a since-compacted part of the session — check
`git status`/`git diff` before writing to any path whose provenance isn't
freshly confirmed, not just trust the tool not erroring.

**What was genuinely missing, now built**: the renderer had no bridge to
this app's own `At1FilingData`/`At1ScheduleData` (the shapes
`composeAt1FilingData`/`renderAt1NetFile` already use) — it was unreachable
from anywhere in `apps/server`. Added:

- `at1-rsi-adapter.ts` — `toRsiHeader`/`toRsiJacketSchedules`/`toRsiSchedule`/
  `toRsiLineItems`, converting the Net File shapes into the RSI renderer's
  own `RsiHeaderInput`/`RsiScheduleInput` through its existing formatters
  (no new business arithmetic — same computed figures, different text rules).
- A real bug found while wiring the EDI (transmitter) schedule through:
  `renderRsiLineItem` validated line item ids against `/^\d{9}$/` (all
  digits), but the EDI schedule's own ids (`EDI019001` etc.) start with
  letters. Checked against the vendored XSD's own `LineItemID` type
  (`\w{3}[0-9]{6}` — Schedule ID is `\w{3}`, only Field+Occurrence are
  digits) — the SAME pattern Net File's own validator already enforces — and
  fixed the regex to match. A complete RSI (jacket + schedules + EDI) could
  not have rendered before this.
- `apps/server/src/engine/at1-rsi.service.ts` — `prepareAt1Rsi`, mirroring
  `prepareAt1NetFile` exactly (same engagement/client/amendment/computed-return
  loading, same frozen-input and mandatory-completeness gates, reusing the
  same `composeAt1FilingData`) up to the point of rendering, then produces
  RSI text instead of XML. Wired as a new `prepare-rsi` action on the
  engagement-year resource, alongside the existing `prepare-netfile`.

Regression tests: `tests/at1-rsi-adapter.test.ts` (ca-tax) — converts a real
computed AT1 Schedule 13 payload through the adapter and asserts the full
composed document (jacket + schedule + EDI) renders correctly, including the
`**`-negative convention on a real balance-owing figure.

**Still not built**: a UI entry point (a "print RSI" button next to the
existing Net File preparation action) — the finding never asked for one
specifically, but there's now a real backend action with nothing pointing
at it. True physical pagination (§3.2.1.3-3.2.1.12 — paper size, margins,
font metrics, real page-by-page `n of total` counts) is deliberately not
attempted; see `at1-rsi-renderer.ts`'s own doc comment for why — this
renders exact per-schedule TEXT CONTENT, one schedule per logical page, not
a laid-out physical document.

## M/O/X beyond the jacket — still open

The per-field M/O/X classification lives in the cross-reference tables
schedule by schedule. Only the AT1 jacket's mandatory lines are enforced
today. Extending this to every schedule is mechanical but large, and is the
natural next step if a payload is ever rejected for an omitted conditional
field. Not attempted in this pass — genuinely large, and (per the same
judgment applied elsewhere in this sweep) speculative work without a
concrete rejected payload driving which fields actually need it first.
