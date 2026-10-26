# AT1 Schedule 3 and the jacket link: remediation plan (2026-10-26)

Sources: the three issue files in `Downloads/tax-foundry/new/` (ITC/CITC/APITC lines,
MAD + ITC/CITC tables + jacket link, APITC table), checked against current code and the rule
book (`spec/at1/forms/003.json`, `000.json`). Aura's "?" popups show the Chapter 3 rule for each
line; every one of them is already in `knowledge-base/formulas/at1/003-...md`. The gap was that
the rule book was never used to drive Schedule 3: it was transcribed from prose once, and the
three credit tables were collected in the UI and never read.

## Root cause (one sentence)

Two inputs for the same fact (page-1 aggregate fields and the year-of-origin tables), the engine
reading the aggregate, so every rule that ties 104/106/204/206/300-316 to the tables
(`104 = Σ126`, `106 = 128`, `304 = 336 occ 0` ...) was unenforceable and the tables were never filed.

## Verified before planning

| Claim | Verified |
|---|---|
| 080 ignores 071/072/074/076 (HIGH) | **Yes.** `AlbertaReturnResult.albertaTaxPayable` = 068 − 070; the host files 071/072/074/076 as 0. Also true of 072: Schedule 4's credit never reaches the jacket |
| Default claim ignores expired → negative carry-forward | Yes (ITC, CITC, APITC) |
| Silent cap on a typed claim | Yes |
| APITC caps use 335 not 334 | Yes |
| 340 display adds 334 to 335 on preceding rows | Yes (web `closingOf`) |
| Tables never filed, never read | Yes (except 335) |

## Design

One source: **the tables**. Page-1 lines become derived whenever a table has rows.

| Page 1 | Derived from |
|---|---|
| 100 / 102 / 104 / 106 | 125 occ 0 / Σ124 / Σ126 / 128 |
| 200 / 202 / 204 / 206 | 225 occ 0 / Σ224 / Σ226 / 228 |
| 300 / 302 / 304–310 / 314 | 334 occ 0 / Σ335 occ 1–10 / 336 by occurrence / 338 occ 10 (= 335 − 336 on occ 10) |
| 130 / 230 / 340 | per rule: 124+125−126−128; 224+225−226−228; occ 0: 334−336, occ 1–10: 335−336−338 |

A typed page-1 figure that disagrees with its table is a finding (typed wins nowhere: the
table is what is filed). Without table rows the aggregate path still works, with the fixes below.

## Phases

1. **Jacket link (HIGH).** ca-tax: `AlbertaReturnResult` gains 071/072/074/076; 080 = 068 −
   (070+071+072+074+076), floored at nil. Server: store and file the four. 072 = lesser of
   Σ004012 and 068 − (070 + 071) (jacket rule); 076 = Schedule 3 line 604.
2. **Schedule 3 engine.** Default claims net of expired; an issue whenever a typed claim is
   capped; APITC caps on 334 (original receipt) and on the vintage's own 335; APITC application
   also limited by 602 − 104 − 204 so no credit is consumed that line 604 will not deduct
   (the issue file's A-2; stricter than the spec's text, satisfies it); tables computed (130/230/340,
   338 occ 10) and filed (120–130, 220–230, 330–340); presence/occurrence rules checked.
3. **Server.** Composer reads every table column (not just 335); contract unchanged (the row
   already has all columns). Prior-year defaults (102/202/302 from last year's 108/208/316):
   see the open question below.
4. **Web.** `closingOf` per the rule for the APITC table; shading per the rule (128 occ 0–3,
   228 occ 0–9, 338 occ 0–9); page-1 lines shown as computed when a table has rows.
5. **Rule-book hygiene.** `implemented/003.txt` for the Jev sentence check; tests assert each
   Schedule 3 rule by line number (104 = Σ126 etc.) against the engine.

## Open questions

- **Prior-year carry-forward (102/202/302 ← last year's 108/208/316).** Needs the prior year's
  computed return. `prior-year-openings.service.ts` rolls forward federal pools only. Plan: add
  the three Alberta balances to that service; typed value stays an override and a difference is
  flagged. Done only if the service's data model allows it without a new collection.
- **A-2 (APITC room excludes 071/074).** Decided in code (stricter cap, documented). Worth asking
  TRA whether the wider APITC room is intended.

## Status (2026-10-26)

| Phase | Status |
|---|---|
| 1 Jacket link (080 = 068 - (070+071+072+074+076)) | **Done**, ca-tax + server; end-to-end transmission test |
| 2 Schedule 3 engine (tables as source, expired-aware default, cap reports, 334 caps, 602 limit, filing 120-130 / 220-230 / 330-340) | **Done**, 21 rule-book tests |
| 3 Server (composer reads every table column; prior-year carry-forwards for 102 / 202 and each row's opening) | **Done**; prior-year read from the last computed AT1 return's Schedule 3 payload |
| 4 Web (340 display, page-1 lines derived when a table has rows) | **Done**. Shading kept as the printed form has it; the engine reports amounts on rows the rule disallows |
| 5 Rule-book hygiene (`implemented/003.txt`, tests by line) | **Done** |

Not done: a browser run of the filing flow with a Schedule 3 return (no dev servers were started
in this session); recommended before release. The A-2 room decision is in code (stricter cap),
and still worth a question to TRA.
