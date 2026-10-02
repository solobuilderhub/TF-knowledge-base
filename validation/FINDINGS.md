# Accuracy validation — findings log

Differential testing of our federal T2 engine against a certified product (AuraTax),
plus what the exercise has already proven. Live-driven via agent-browser on the user's
own AuraTax account (prepare-only). Updated 2026-08-10.

## Confirmed correctness bug — FIXED (found by our own harness)

**Short tax year proration was missing.** For a stub year the engine returned the full
$500,000 business limit and full-year CCA — over-claiming the SBD and CCA on every
short-year return.

- **Business limit** — ITA 125(5)(b): limit × (days ÷ 365). A 182-day 2024 year →
  $500,000 × 182/365 = **$249,315** (was $500,000). Fixed in `schedule7.ts`
  (`computeBusinessLimit` gained `prorationFactor`).
- **CCA** — Reg 1100(3): declining-balance claim × (days ÷ 365). Fixed in `schedule8.ts`
  (`computeCcaClass`/`computeCcaSchedule` gained `prorationFactor`). Immediate expensing
  is NOT prorated here — the caller caps the (short-year-prorated) $1.5M limit.
- `federal-t2.ts` `shortYearProrationFactor(periodStart, periodEnd)` = inclusive days÷365,
  capped at 1, drives both. +5 tests in `t2-short-year.test.ts`. 263 ca-tax tests green.

This is the headline result: the harness found and closed a real filing error before the
oracle was even consulted.

### Second bug — the fix wasn't wired through the host (FIXED)

The engine reads `input.periodStart`/`periodEnd` for short-year proration (and mid-year
provincial rate weighting), but `assembleT2Input` only emitted `period: {start,end,label}` —
so on a REAL return computed through the host, `periodStart`/`periodEnd` were undefined and
**the proration never fired** (it worked only in the pure-engine unit test). Fixed:
`assembleT2Input` now emits `periodStart`/`periodEnd` from the engagement's tax year.
Integration test added (compute a 182-day T2 via the editor path → `sbdIncome` = 249,315).
This also switches on mid-year provincial rate day-weighting, which had the same latent gap.
63 server tests green.

## Our locked expected numbers

`apps/server/scripts/validate/{scenarios.ts, run.ts, ours.json}` — 9 scenarios incl. the
hard edges (over-limit, non-CCPC, CCA, short-year, associated, S33 capital grind,
multi-province, Part IV). Re-run any time: `npx tsx scripts/validate/run.ts`.
Post-fix headline figures (2024, Ontario, CCPC unless noted):

| Scenario | Reduced BL | SBD (430) | Part I (700) | Total tax (770) |
|---|--:|--:|--:|--:|
| S1 CCPC 200k | 500,000 | 38,000 | 18,000 | 24,400 |
| S2 CCPC 600k | 500,000 | 95,000 | 60,000 | 87,500 |
| S3 non-CCPC 300k | — | 0 | 45,000 | 79,500 |
| S5 short-year 500k (182d) | **249,315** | 47,370 | 60,041 | 96,848 |
| S7 capital grind $30M | 250,000 | 47,500 | 75,000 | 123,250 |
| S9 Part IV (100k portfolio div) | 500,000 | 9,500 | 4,500 (+38,333 Pt IV) | 44,433 |

## AuraTax live-validation observations (agent-browser, direct)

- Login: email-first (the team QA Aura account) → password. Landing = program picker;
  **T2 Corporations (8)**, AT1 (1). Returns open into a long Angular GIFI-driven form.
- **The earlier "DIFF Sx" returns are PARTIALLY filled** — e.g. DIFF S4 reads all $0
  (it was interrupted mid-entry). So the earlier background-agent run produced NO reliable
  computed numbers; do not trust reconstructed fragments from its transcript.
- BN used by the run and accepted by AuraTax's checksum: **123456782**.
- **Efficient extraction technique** (works): each line's CRA number is a `span.gifi`
  prefix inside its `mat-form-field`; once a return is computed, all jacket lines can be
  read in ONE call:
  ```js
  const map={}; document.querySelectorAll('span.gifi').forEach(s=>{
    const line=s.textContent.trim(); if(!/^[0-9]{3,4}$/.test(line))return;
    const ff=s.closest('mat-form-field'); if(!ff)return;
    const inp=ff.querySelector('input,textarea');
    map[line]=inp?inp.value:ff.textContent.replace(line,'').trim();
  }); // → {300, 360, 430, 550, 608, 700, 770, ...}
  ```
  Lines 300/360/430/550/608/700/770 are all present in the DOM (120 lines total).
- **Entering income (SOLVED technique):** the GIFI income statement is at `/sch/125` — a
  grid with a "Trade sales of goods and services" cell. `agent-browser fill` sets the DOM
  value but Angular's model does NOT react. The working trick is the native-setter +
  event dispatch:
  ```js
  const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  set.call(inp,'600000');
  inp.dispatchEvent(new Event('input',{bubbles:true}));
  inp.dispatchEvent(new Event('change',{bubbles:true}));
  inp.dispatchEvent(new Event('blur',{bubbles:true}));
  ```
  After that, Total Income recomputes to $600,000. Verified live on DIFF S4.
- **The real blocker (extraction):** AuraTax is per-schedule lazy-rendered — each schedule
  is its own URL (`/t2/{id}/sch/125`, `/sch/200`, …) and navigating to one UNMOUNTS the
  others, so the jacket tax-calc lines (300/360/430/700/770) are only in the DOM on the
  jacket's own page/seq. The `span.gifi` extraction only sees the CURRENTLY-rendered
  schedule. Reading the final tax total therefore needs navigating to the exact jacket
  tax-calc page/seq and extracting there — which is many careful steps per return.
- **Recommendation:** manual browser diffing of all scenarios is real but expensive per
  data point. Highest-leverage alternatives: (a) enrol in CRA's software-developer cert
  program for the official test cases (the true oracle), or (b) hand-derive the hard-edge
  expected numbers from the ITA sections and reconcile ours to those (no oracle, but
  statute-anchored — this is how the short-year bug was already confirmed). The harness +
  `ours.json` make either path a one-command re-check.

## What remains to validate against the oracle

S2 (over-limit), S6 (associated), **S7 (capital grind — validates the new S33 straight-line
$10M→$50M)**, S8 (multi-province), S9 (Part IV — earlier AuraTax build wouldn't attach
Schedule 3). Recommended: finish one clean AuraTax return per scenario and diff the
extracted line map against `ours.json`.

## Oracle availability (for reference)

- CRA official T2 certification test cases: NOT public — gated behind CRA software-developer
  certification enrollment. The gold standard once enrolled.
- TaxCycle / UFileT2 / TaxTron: Windows desktop, licensed — not browser-drivable.
- AuraTax: web, certified, user's own account, "prepare free / pay only to transmit" — the
  usable oracle, at the cost of manual GIFI entry.

---

## 2026-08-10 — Schedule 54, Low Rate Income Pool (T2)

**Built from the live form. The oracle was wrong twice, and one of the errors
escapes into a later year.**

Schedule 54 is the non-CCPC route to Part III.1: no general rate income pool, so
the exposure runs against the low-rate pool instead, tested **date by date**. The
engine previously had no path to this figure at all for a non-CCPC.

The comparison product **drops line 190 from line 230**, though the form's own
caption says to add it — and it holds the value correctly elsewhere on the same
form. With the pool understated, nothing floors: the excessive designation went
to −50,000, and because Part 3 subtracts it, the **closing pool inflated** from
140,000 to 190,000. That becomes next year's opening balance.

We carry 190, floor every pool figure, derive the running "designations before
this date" from the rows themselves, and order the rows by date.

Full evidence: [`auratax/2026-08-10-schedule54-lrip/`](auratax/2026-08-10-schedule54-lrip/README.md)

---

## 2026-08-08 — Schedule 55, Part III.1 (T2)

**One correction, one place the oracle is wrong, two confirmations.**

The subsection 185.1(2) election is a **claimed amount, not a switch**: line 180
is a dollar figure, the taxed base is the excess minus it, and the remainder
still bears 20%. We had modelled it all-or-nothing, so a partial election
reported nil tax where 24,000 was owing — an understatement, the dangerous
direction. Fixed.

The comparison product does **not** floor that subtraction: claiming 250,000
against a 200,000 excess yields a Part III.1 tax of −10,000 there. The statute
caps the claim at the excess. We cap and raise an issue; do not copy this one.

Confirmed: the extra 10% for anti-avoidance cases is real despite appearing
nowhere on the form (the Act states the charge as a total of two components),
and the election is barred in exactly those cases.

Full evidence: [`auratax/2026-08-08-schedule55-part3-1/`](auratax/2026-08-08-schedule55-part3-1/README.md)

---

## AT1 Schedules 5, 6, 7, 8, 9, 11 — confirmed not published as standalone forms

Three independent sources agree: alberta.ca's own corporate-income-tax page,
direct `curl` probing of every unused number in the CFR sequence between
confirmed schedules, and AuraTax's own Manage Schedules dialog (which lists
every AT1 schedule the certified product implements — exactly 15 slots,
matching what this package already has, with none of these six). Not a
research gap — these programs are historical, wound-down, or
instalment-administered (see the session README for why), so no vendor
currently publishes a fillable form for them.

Full evidence: [`auratax/2026-09-01-at1-schedules-5-11-missing-pdfs/`](auratax/2026-09-01-at1-schedules-5-11-missing-pdfs/README.md)

---

