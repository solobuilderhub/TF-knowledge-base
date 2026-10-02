# Schedule 55 — Part III.1 tax on excessive eligible dividend designations

**Date captured:** 2026-08-08
**Oracle:** AuraTax (app.auratax.ca), a CRA-certified T2 preparer
**Subject:** T2 Schedule 55, ITA s.185.1
**Status:** completed — one real defect found and fixed, one oracle defect found and NOT copied

This closes **P1-3**. Schedule 55 previously had two of three verification methods
(statutory text, independent hand-derivation); this is the third.

---

## Why this schedule was worth checking

Part III.1 is a **penalty tax on a paperwork error**. A corporation designates a
dividend eligible, discovers the general rate income pool did not support it, and
owes 20% of the shortfall — on a dividend it has already paid out. The amounts are
large relative to the mistake, and the taxpayer's escape route is an election that
must be made within 90 days of the assessment.

Anything that misstates this schedule misstates it by a fifth of a dividend.

---

## What the certified form actually looks like

Two parts, both feeding **line 710 of the T2 return**.

**Part 1 — Canadian-controlled private corporations and deposit insurance corporations**

| Line | Label |
|---|---|
| 100 | Total taxable dividends paid in the tax year |
| 150 | Total eligible dividends paid in the tax year |
| 160 | GRIP at the end of the tax year (line 590 of **Schedule 53**) |
| **A** | Excessive eligible dividend designation (**line 150 minus line 160**) |
| 180 | Excessive eligible dividend designations elected under **subsection 185.1(2)** to be treated as ordinary dividends |
| **B** | Subtotal (**amount A minus line 180**) |
| 190 | Part III.1 tax — CCPC or DIC (**amount B multiplied by 20%**) → line 710 |

**Part 2 — Other corporations**

| Line | Label |
|---|---|
| 200 | Total taxable dividends paid in the tax year |
| **C** | Total excessive eligible dividend designations (**amount A of Schedule 54**) |
| 280 | Elected under subsection 185.1(2) to be treated as ordinary dividends |
| **D** | Subtotal (**amount C minus line 280**) |
| 290 | Part III.1 tax — other corporations (**amount D multiplied by 20%**) → line 710 |

**The two parts source the excess differently.** Part 1 derives it arithmetically
from eligible dividends less the GRIP pool (Schedule 53). Part 2 imports it from
**Schedule 54** — the LRIP schedule — because a non-CCPC's excess arises against
the low rate income pool, not the general one. From that point the arithmetic is
identical.

Screenshot: `screenshots/05-schedule55-blank.png`.

---

## FINDING 1 — the election is an AMOUNT, not a switch (our defect, now fixed)

**This was a real error in our engine, and it ran in the taxpayer's favour.**

`computeSchedule55` treated `electsOrdinaryDividend` as a boolean: elect, and the
whole excess is reclassified and the whole tax disappears. The form is not built
that way, and neither is the Act.

Live proof, from a single return with the election varied:

| Case | A | line 180 | B | line 190 | screenshot |
|---|---|---|---|---|---|
| No election | 200,000 | — | 200,000 | **40,000** | `06-case1-no-election.png` |
| Partial election | 200,000 | 80,000 | 120,000 | **24,000** | `07-case2-partial-election.png` |

The statute is explicit. s.185.1(2)(a)(ii) reduces the original dividend by

> the amount **claimed by the corporation in the election** not exceeding the
> excessive eligible dividend designation

— a *claimed amount*, capped at the excess. A corporation may elect on part of
the excess and pay 20% on the rest.

**What our engine did on the partial case:** reported nil tax. **The right
answer:** 24,000. We would have filed a return understating Part III.1 tax by the
full amount of the unelected remainder.

**Fixed** in `packages/ca-tax/src/t2/schedules/schedule55-part3-1.ts`:
`electedAmount` carries the claim, `electsMaximum` is the shorthand for claiming
the whole excess, and the result now reports `taxableExcess` (amount B / D)
alongside the tax.

---

## FINDING 2 — the oracle produces a NEGATIVE Part III.1 tax (their defect, not copied)

Claiming **more** than the excess:

| A | line 180 | B | line 190 |
|---|---|---|---|
| 200,000 | 250,000 | **−50,000** | **−10,000** |

Screenshot: `screenshots/08-over-election-negative-tax.png`.

The certified product simply subtracts line 180 from amount A with no floor, and
reports a negative tax on a penalty provision. That cannot be right: s.185.1(2)
caps the claim at the excess in terms ("not exceeding the excessive eligible
dividend designation"), so the condition is unreachable on a correct return — but
the product does not enforce the cap, and a preparer who mistypes a figure gets a
plausible-looking negative rather than a refusal.

**We cap the claim at the excess and raise an issue.** This is recorded because it
is the one place where matching the oracle would have made us wrong. An oracle is
evidence, not authority — where it and the statute disagree, the statute wins.

---

## FINDING 3 — the form has no 30% line, but the law does

Searching the rendered schedule: **two occurrences of "20%", zero of "30%", and no
mention of paragraph (c) or of artificial designations.**

That is a property of the *form*, not of the law. ITA s.185.1(1), fetched from
the primary source during this session, reads:

> ...pay a tax under this Part for the taxation year equal to **the total of**
> **(a) 20%** of the excessive eligible dividend designation, and
> **(b)** if the excessive eligible dividend designation arises because of the
> application of paragraph (c) of the definition *excessive eligible dividend
> designation* in subsection 89(1), **10%** of the excessive eligible dividend
> designation.

So a paragraph (c) case is assessed at **30%**, and the Act's own structure is
"20% **plus** 10%" — which is exactly how our engine decomposes it (`baseTax` +
`paragraphCSurtax`). **Confirmed, not corrected.**

The form's silence is consistent with paragraph (c) being an anti-avoidance limb
that CRA assesses rather than a box a preparer self-reports.

---

## FINDING 4 — the election bar on paragraph (c) cases: confirmed verbatim

s.185.1(2) opens:

> If, **in respect of an excessive eligible dividend designation that is not
> described in paragraph (1)(b)** ...

Paragraph (1)(b) is the 10% limb. So the election is unavailable precisely where
the extra 10% applies — which is why `electionAvailable` is modelled as the
negation of `arisesUnderParagraphC` rather than as an independent input.
**Confirmed.**

---

## Scoreboard

| Aspect | Verdict |
|---|---|
| 20% base rate | **confirmed** — form and Act agree |
| 20% + 10% = 30% structure for paragraph (c) | **confirmed** from the Act; absent from the form |
| Election barred in paragraph (c) cases | **confirmed** verbatim |
| Election is a claimed amount, partial permitted | **CORRECTED** — we had it as all-or-nothing |
| Claim capped at the excess | **we are right, the oracle is wrong** |
| Part 1 vs Part 2 sourcing (S53 vs S54) | newly documented |

Three confirmations, one correction, one place where the oracle should not be
followed. The correction is the one that mattered: it under-taxed every partial
election.

---

## Screenshots

| File | What it proves |
|---|---|
| `01-landing.png` | Signed in; the product's program list |
| `02-t2-editor.png` | The T2 return editor used for the test |
| `03-manage-schedules.png` | Schedule picker before Schedule 55 was added |
| `04-schedule-picker.png` | The 135-schedule T2 inventory |
| `05-schedule55-blank.png` | **The form itself** — both parts, every line and label |
| `06-case1-no-election.png` | A 200,000 → line 190 40,000 (the flat 20%) |
| `07-case2-partial-election.png` | **The correction** — line 180 of 80,000 leaves B 120,000, line 190 24,000 |
| `08-over-election-negative-tax.png` | **The oracle's defect** — line 190 at −10,000 |
| `09-part2-other-corporations.png` | Part 2: C 150,000 → line 290 30,000 |

`t2-schedule-list.raw.txt` — the product's full T2 schedule inventory (135 entries),
useful for scoping future coverage questions.

---

## What changed in the code

- `packages/ca-tax/src/t2/schedules/schedule55-part3-1.ts` — election modelled as a
  claimed amount with a statutory cap; `taxableExcess` and `issues[]` added.
- `packages/ca-tax/src/t2/engine/federal-t2.ts` — new
  `electedOrdinaryDividendAmount` input; `electOrdinaryDividend` retained as the
  claim-everything shorthand.
- `packages/ca-tax/tests/t2-part3-1.test.ts` — the four figures above asserted
  directly, including the partial election and the refusal to go negative.

## Reproducing this

`ab.sh` in this directory drives the session. Read
`research/validation/README.md` first — it records the four things about this
browser harness that otherwise cost an hour each.

Navigation, for next time: the schedule tree only lists schedules already in the
return. To reach one that is not, open **Manage schedules** (the settings icon in
the left rail), tick the row, press **east** to move it into the selected list —
ticking alone does nothing — then **Apply**. The form then appears in the rail by
number.
