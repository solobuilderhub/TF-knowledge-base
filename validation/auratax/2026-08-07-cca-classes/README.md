# AuraTax validation — CCA classes 13 / 14 / 14.1

**Date:** 2026-08-07
**Status:** completed — both the T2 CCA schedule and the AT1 side.

Validated against **AuraTax** (app.auratax.ca, AuraSoft Inc.), a CRA-certified T2
and TRA-certified AT1 preparer, used here as an oracle for the capital cost
allowance work in
[`research/cra-schedules/CCA-straight-line-classes.md`](../../../cra-schedules/CCA-straight-line-classes.md).

Returns used: the existing scratch return **"DIFF S4"** (BN 12345 6782 RC0001,
year end 31 December 2024) for the T2 work — Schedule 8 was empty when opened and
**was restored to empty**, verified by reload (`05-sch8-restored-empty.png`); and a
new AT1 return **"TF Validation Alberta Ltd."** (year end 31 December 2025) created
for the Alberta work, which is left in place as the validation artifact. Nothing
was transmitted.

## Findings

### 1. CONFIRMED — class 14.1 is 5% declining balance; 13 and 14 have no fixed rate

AuraTax's own class picker on T2 Schedule 8 labels every class with its rate.
Screenshot `04-cca-class-picker-rates.png`, full 55-class list in
`cca-class-list.txt`:

```
Class 12   (100%)
Class 13   (Varies)      ← no fixed rate
Class 14   (Varies)      ← no fixed rate
Class 14.1 (5%)          ← a flat rate, like any declining-balance class
Class 16   (40%)
```

This independently confirms the correction made in the same session: our rate
table's comment had grouped **14.1 with 13 and 14 as "straight-line"** and excluded
all three, so class 14.1 threw `UnsupportedCcaClassError`. It is a declining-balance
class at 5% and now computes like any other. A certified product's own labelling is
about as direct as this evidence gets.

It equally confirms the other half: 13 and 14 are *"Varies"* — no rate exists to
apply, so the separate Schedule III / Reg 1100(1)(c) arithmetic we implemented is
not optional.

### 2. CONFIRMED — the `netAdjustments` column added to our Schedule 8 is real

Live column 6: **"Adjustments and transfers (show amounts that will reduce the UCC
in brackets)"**, line 205 — signed, exactly as modelled. Columns 7 and 8 are its
sub-amounts, "assistance received or receivable" (221) and "repaid" (222), both
*"subsequent to its disposition"*.

This column was added to `CcaClassInput` while building AT1 Schedule 13, because
neither return's closing undepreciated capital cost balances without it. It is on
the live certified form.

### 3. CONFIRMED — our half-year rule matches the form's stated formula

Live column 17: *"UCC adjustment for property acquired during the year other than
AIIP, RIIP and property included in Classes 54 to 56 (**0.5 multiplied by the
result of column 3 minus column 4 minus column 5 plus column 8 minus column 7
minus column 9**)"*.

Half of net additions, with dispositions and assistance netted off — which is what
`computeCcaClass` does.

### 4. The half-year-on-class-13 question is NOT answerable from AuraTax

This was the open question the session was meant to settle, and the answer is that
this oracle cannot settle it.

Column 21 is captioned *"CCA (**for declining balance method**, the result of
column 10 plus column 15 plus column 16 minus column 17, multiplied by column 18 or
a lower amount)"* — the form scopes its own formula to declining balance. With the
rate column showing *"Varies"* for class 13, there is nothing for AuraTax to
compute; columns 18 and 21 are read-only computed fields with a manual override
(the "back_hand" toggle), and for class 13 the preparer supplies the number.

So AuraTax **does not compute class 13 at all**. Two consequences:

- The half-year question stays open. It needs a CRA worked example or a
  technical interpretation, not a competitor. Our default remains to apply it —
  the conservative side, claiming less rather than more.
- Computing Schedule III properly is a **capability difference**, not parity work.
  A certified competitor leaves the hardest straight-line class to the preparer.

### 5. CORRECTED SCOPE — the current-year AT1 has 14 schedules, not 22

The "Manage Schedules" picker on a 2025 AT1 return lists the complete set
(`08-at1-manage-schedules-full-list.png`, full text in `at1-schedule-list.txt`):

```
001 Alberta Small Business Deduction          013 Capital Cost Allowance (CCA)
002 Allocation of Income                      015 Resource Related Deductions
003 Investor Tax Credit                       016 Scientific Research Expenditures
004 AB Foreign Investment Income Tax Credit   017 Reserves
010 Loss Carry-Back Application               018 Dispositions of Capital Property
012 Income/Loss Reconciliation                020 Charitable Donations & Gifts
                                              021 Current Year Loss and Continuity
                                              029 Innovation Employment Grant
```

Fourteen numbered schedules, plus the 000 jacket, the EDI record and one attachment
(AT4970, the IEG project listing).

Our docs had been quoting **"of the 22 schedules in the Alberta specification"**,
inferred from the specification's numbering running to 21 plus 29. That
over-counted by eight. Corrected to 14 in `apps/docs/02-coverage.md` and
`07-known-gaps.md`, which changes the coverage story from "10 of 22" to **9 of 14
implemented**, and names exactly what is left: **S3, S4, S15, S16, S17**.

**Schedule 14 is absent from the list**, which independently confirms the scoping
finding in `research/spec/AT1-schedule14-cec.md`: eligible capital property was
repealed on 1 January 2017 and the schedule survives only for the straddling year.
A certified product does not offer it for a 2025 return.

### 6. CONFIRMED — AT1 Schedule 13 matches our model line for line

Live column 23: *"CCA (**for declining balance method**, the result of column 15
plus column 18 minus column 19, multiplied by column 20, or a lower amount, **plus
column 12**)"* — that is rate × (UCC after immediate expensing + AIIP enhancement −
half-year adjustment), with immediate expensing added back on top. Exactly
`computeCcaClass`.

Column 24 closing UCC is simply *column 10 minus column 23*. Column 5 is **"Net
adjustments (show negative amounts in brackets)"** — signed, on the Alberta side
too, confirming the `netAdjustments` column on both returns.

### 7. FIXED — Schedule 13 carries THREE totals to Schedule 12, not one

The live form states it in a footer: *"Carry forward the amounts from lines 023,
025 and 027 to Schedule 12 lines 006, 008 and 004 respectively"* — **CCA, recapture
and terminal loss**.

Only the CCA difference was wired up (`albertaCcaDifference`). Recapture and
terminal loss differ whenever the Alberta pools do, and each changes Alberta
income: recapture is income, so more of it for Alberta is an **addition**; a
terminal loss is a deduction, so more of it is a **deduction**. A return with an
identical CCA claim but a different recapture reconciled to the wrong Alberta
income.

Added `albertaRecaptureDifference`, `albertaTerminalLossDifference` and
`albertaCcaScheduleAdjustments` (all three in the order the form states them).
10 tests.

### 8. FIXED — a real defect: the s.34.2 lines are grossed up ×2

Live AT1 Schedule 18:

> 096 — Taxable capital gains under section 34.2 … (**line 275 of federal Schedule
> 73**) **× 2**
> 098 — Allowable capital losses under section 34.2 … (**line 285**) **× 2**

Federal Schedule 73 lines 275 and 285 are *taxable* gains and *allowable* losses —
already at the ½ inclusion rate. Everything else on Schedule 18 is a whole capital
gain until line 076 applies the rate once, so Alberta doubles them on the way in.

Our implementation added them raw and then applied the inclusion rate to the total,
**halving an already-halved figure**. On $30,000 of s.34.2 taxable capital gains
the Alberta taxable capital gain came out $15,000 instead of $30,000. Fixed with
`SECTION_34_2_GROSS_UP`; 4 tests, and the pre-existing test that encoded the wrong
behaviour was corrected.

This is the finding that justified the whole exercise. It was invisible from the
specification text, which lists the two lines without the multiplier.

### 9. CONFIRMED — the listed-personal-property rule, in plain language

The specification encodes it structurally, as two variants of line 076 differing
only in which terms appear. The live form just says it, at line 062:

> Total of Column D (**Do not include the amounts at lines 059 and 060 if the
> difference is a net loss**)

Which is what we implemented: when the LPP result is a loss, both it and the
prior-year LPP losses drop out, so an LPP loss cannot shelter ordinary capital
gains. Also confirmed: line 079 is the **lesser** of 077 and 078, not their sum.

## Screenshots

| File | What it shows |
|---|---|
| `01-landing-programs.png` | Program grid — 11 return types, T2 holds 8 returns |
| `02-t2-return-editor-schedule-tree.png` | Return editor, left-hand schedule tree and toolbar |
| `03-t2-sch8-cca-grid.png` | Schedule 8 CCA grid — the full 23-column layout with CRA line numbers |
| `04-cca-class-picker-rates.png` | **The key evidence** — class picker showing 13 (Varies), 14 (Varies), 14.1 (5%) |
| `05-sch8-restored-empty.png` | Schedule 8 restored to empty after the session |
| `06-at1-create-return-dialog.png` | AT1 create-return dialog — the fields a new Alberta return needs |
| `07-at1-return-editor.png` | AT1 return editor for the new validation return |
| `08-at1-manage-schedules-full-list.png` | **The AT1 inventory** — 14 numbered schedules, no Schedule 14 |
| `09-at1-sch13-alberta-cca.png` | Alberta Schedule 13 — columns, the CCA formula, the Schedule 12 carry-forward footer |
| `10-at1-sch18-dispositions.png` | Alberta Schedule 18 — the six categories, the LPP exclusion, the ×2 s.34.2 lines |

`cca-class-list.txt` — all 55 classes with their rates, as AuraTax labels them.
`at1-schedule-list.txt` — the full AT1 schedule inventory as listed by the product.

## Method notes — correcting the earlier failure diagnosis

An earlier version of this file recorded that `agent-browser` "could not cold-launch
Chrome" and that `agent-browser install` had never been run. **Both were wrong.**

- Chrome was already installed — four versions under `~/.agent-browser/browsers/`.
  Running `install` was unnecessary.
- The browser launched fine every time. What actually happened: a cold launch takes
  **2-4 minutes** on this machine, and each attempt was wrapped in a `timeout` of
  90-170 seconds that killed the CLI *while the daemon carried on and completed the
  launch in the background*. The browser was up; only the command that requested it
  had been killed. Running several attempts in parallel to "hurry it up" then left
  ~24 orphaned Chrome processes and made everything genuinely slower.

The fix was simply to run one command against the already-live session and let it
return. Everything after that was fast.

Two real gotchas worth keeping:

- **The daemon's working directory is not the shell's.** `screenshot foo.png` writes
  relative to wherever the daemon was started, not where you ran the command. Pass
  an absolute path.
- **`fill` appends rather than replaces on these Angular Material inputs**, and
  `Control+a` does not select inside them. To change or clear a value, set it
  through the native `value` setter and dispatch `input` + `change` + `blur`. That
  path also persists to the server, which `fill` sometimes did not.
