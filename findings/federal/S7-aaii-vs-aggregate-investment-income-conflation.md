# T2 Schedule 7 — the app conflates two different investment-income figures

**Status: fixed, 2026-09-03.** Found while researching the SBD/S7 guided
editor to build its paper Form View — flagged here rather than fixed inline
at the time, since it was an engine/data-collection design question, not a
paper-view scoping decision. Closed as part of a sweep through every open
`research/findings/` item.

## The fix

Implemented the "simplest correct fix" option below rather than the "more
complete" one: building Schedule 7 Part 2's own derivation would mean
collecting or deriving `705/710/715/720/725/730/735/740/741` (active-asset
exclusions, "income/losses from property," a s.91(4) FAPI adjustment,
dividends from connected corporations) — several of which this app doesn't
collect anywhere else today, and guessing at that shape risked a second,
subtler conflation. The disclosed-approximation fix is honest about the gap
without fabricating precision the app doesn't have the inputs for.

- `FederalT2Input` (`federal-t2.ts`) now has TWO fields: `aaii` (prior-year
  ADJUSTED figure, s.125(7) — grind only) and a new `aggregateInvestmentIncome`
  (current-year plain figure, line 092/440 — RDTOH only). RDTOH now reads
  `input.aggregateInvestmentIncome ?? input.aaii` — the same approximation as
  before, but explicit and overridable rather than silently forced.
- Found and fixed a THIRD site with the identical bug while auditing every
  `input.aaii` read: `computeGrip`'s `generalRateIncome` (s.89(1) "full rate
  taxable income," which also excludes the current-year figure, not the
  prior-year adjusted one) was subtracting `input.aaii` too. Now uses
  `input.aggregateInvestmentIncome ?? input.aaii`, same fallback.
- Guided editor (`apps/web/.../schedules/t2/sbd.ts`) now exposes both fields
  with labels naming the year and the exact Schedule 7 line each maps to;
  regenerated `return-input.ts` via `emit-return-input.ts`.
- Server contract (`SbdValues` in `t2-input.ts`) and `assemble-t2-input.ts`
  updated to carry the new optional field through.
- Regression test: `tests/t2-schedule7-aaii-conflation.test.ts` — asserts the
  old single-field behavior is preserved by default, and that a genuinely
  diverging `aggregateInvestmentIncome` changes RDTOH without touching the
  grind.

**Still not modelled**: Schedule 7 Part 2's own derivation. A preparer whose
AAII and AII genuinely diverge must now enter both figures themselves
(previously they had no way to express the difference at all); the app still
does not compute AAII from finer-grained inputs. That's the "more complete
fix" below, left undone by design for the reasons above.

---

*Original finding, preserved below for context:*

## The two figures Schedule 7 itself keeps separate

- **Line 440 (jacket) / Part 1 of Schedule 7** — "Aggregate investment income"
  (AII). Feeds the refundable portion of Part I tax and the RDTOH mechanism
  (`computePart4Rdtoh` in `federal-t2.ts`).
- **Line 745 (Schedule 7's own line, `SCHEDULE_7_ADJUSTED_AII_LINE` in
  `packages/ca-tax/src/t2/forms/schedule7.ts`) / Part 2 of Schedule 7** —
  "Adjusted aggregate investment income" (AAII), per s.125(7). This is the
  passive-income measure that grinds the $500,000 business limit: $5 of limit
  for every $1 above $50,000, gone entirely at $150,000.

`schedule7.ts`'s own module doc comment states this distinction explicitly —
"Two separate jobs sit on one form, and confusing them is the classic error"
— and names the exact grind mechanic on line 745, not 440.

## What this app actually does

`apps/web/.../schedules/t2/sbd.ts`'s guided editor has ONE field, `aaii`,
labelled *"Adjusted aggregate investment income (line 440)"* — which is
already an internally inconsistent label (line 440 is the JACKET's plain AII,
confirmed in `packages/ca-tax/src/t2/forms/jacket.ts`: `F('440', 'Aggregate
investment income', 'refundable', { role: 'carried-in', from: { form:
'T2SCH7', line: '' } })` — no "adjusted" anywhere in that caption).

`federal-t2.ts` then uses this SAME single `input.aaii` value for BOTH real
purposes:

- Line 751: passed as `aaii` into `computeBusinessLimit` — which applies the
  real s.125(5.1)(b) grind formula (`AAII_REDUCTION_PER_DOLLAR × max(0, aaii −
  AAII_THRESHOLD)`) — i.e. this call site genuinely NEEDS the adjusted figure
  (line 745).
- Line 801: passed as `aggregateInvestmentIncome` into `computePart4Rdtoh` —
  which needs the PLAIN figure (line 440).

For a corporation where AII and AAII happen to be equal — no net capital
losses applied within the AII calculation, no foreign tax deducted from it,
no adjustments under the s.125(7) definition — this produces the right answer
by coincidence. For a corporation where they diverge, the business-limit
grind is computed against the wrong number, understating or overstating the
reduced business limit and therefore the small business deduction itself.

## Why this wasn't fixed inline

Fixing it properly means the guided editor needs to collect the two figures
SEPARATELY (or derive AAII from AII plus the s.125(7) adjustments, which this
app does not model at all — Schedule 7 Part 2 is not built). That's an engine
input-shape change plus a UI change, not a paper-view decision, and changes
what gets asked of every existing SBD-claiming return in this app. Flagging
for a deliberate decision rather than guessing at the right UI split.

## What the T2SCH7 paper Form View does about it (for now)

The paper view (`schedule7-form-view.tsx`) shows the single `aaii` field
bound to jacket line 440 ONLY — matching what the engine and jacket
FormDefinition both agree on for THAT use. It does not fabricate a separate
line 745 box, since nothing in this app collects a distinct adjusted figure
to put there; a fabricated box would misrepresent the app as already having
fixed this. A note on the field explains the conflation and points here.

## If this needs to be revisited

- Simplest correct fix: rename the field to make clear it's asking for line
  440, and pass a SEPARATE (currently-nonexistent) `input.adjustedAaii` into
  `computeBusinessLimit`'s grind — defaulting to `input.aaii` only as an
  approximation, with a note that it may overstate the grind whenever true
  AAII is genuinely lower than AII.
- A more complete fix would build Schedule 7 Part 2's own derivation
  (`SCHEDULE_7_ADJUSTED_AII_LINE`'s neighbourhood, lines ~700-745) so AAII is
  computed from real inputs rather than typed twice by the preparer.
