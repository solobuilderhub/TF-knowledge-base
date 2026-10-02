# Field map — AT1 Schedules 16 and 17

Transcribed from the TRA Net File specification, Chapter 3 v2025.2, §3.2.3.17 and
§3.2.3.18, then **verified line by line against the live TRA-certified form on
2026-08-07**. Screenshots
`../validation/auratax/2026-08-07-cca-classes/screenshots/11-at1-sch16-sred-pool.png`
and `12-at1-sch17-reserves.png`.

Both schedules matched the specification transcription. The live forms added two
things the spec text did not carry, both recorded below: Schedule 16's line 022 →
next year's line 012 chain, and Schedule 17's four total lines with their explicit
Schedule 12 destinations.

---

# AT1 Schedule 16 — Alberta Scientific Research Expenditures

Engine: `packages/ca-tax/src/t2/at1/schedules/schedule16-sred.ts`.

**What it is not.** Three SR&ED-adjacent things exist and they are routinely
confused:

| | What it computes | Where |
|---|---|---|
| Federal Schedule 31 | SR&ED **investment tax credit** | `schedules/schedule31-sred-itc.ts` |
| AT1 Schedule 29 | Alberta **Innovation Employment Grant** | `at1/schedules/schedule29-ieg.ts` |
| **AT1 Schedule 16** | Alberta SR&ED **expenditure pool** — a deduction against income | this |

## Lines

| Line | Item | Federal source | Alberta variant? |
|---|---|---|---|
| **002** | Allowable current year SR&ED expenditures | T661 line **400** | no — *"must equal"* |
| **004** | Deduct: government and non-government assistance | line **430** (≤2007) or **429 + 431 + 432** (2008+) | no |
| **006** | Deduct: previous year's ITC claimed for SR&ED | line **435** | no |
| **008** | Deduct: sale of SR&ED capital assets and other | line **440** | no |
| **010** | Add: repayments of assistance | line **445** | no |
| **012** | Add: unclaimed pool balance from the previous year | — | **YES** |
| **014** | Add: pool transfer on amalgamation / wind-up of a wholly-owned subsidiary | line **452** | **YES** |
| **015** | Add: ITC recaptured in the previous taxation year | line **453** | no |
| **016** | Subtotal | | computed |
| **018** | Pool deduction available | | computed |
| **020** | Pool deduction claimed | | discretionary |
| **022** | Unclaimed pool balance carried forward | | computed |

The form annotates line 022: *"(Use this amount as the carry forward amount for
next year, **line 012**)"* — an explicit year-over-year chain. A multi-year engine
must feed 022 into the following year's 012; nothing else closes the pool.

## The total algorithm

```
016 = 002 − (004 + 006 + 008) + 010 + 012 + 014 + 015     signed
018 = 016 if positive, otherwise nil
020 ≤ 018                                                  discretionary
022 = 018 − 020                                            carries forward
```

Three points that matter:

1. **Only lines 012 and 014 may differ from federal.** Everything else is *"must
   equal fed 032nnn"*. That is why the filing trigger is *"the opening balance or
   the claim"* — those are the only two places Alberta can diverge.
2. **A negative subtotal does not become a negative pool.** Assistance and
   prior-year credits can exceed the expenditures; line 018 then floors at nil and
   nothing is available. The engine raises an issue rather than returning a silent
   zero.
3. **The claim is discretionary and the pool carries forward indefinitely.** A
   corporation with no income to shelter claims nil and keeps the balance. Line 020
   defaulting to "claim everything" would quietly waste a pool, so the caller
   should pass the claim explicitly whenever income is thin.

## Filing rules

- **Forbidden** when `000060` and `000061` are both 2.
- **Required** when the opening balance (012) or the claim (020) differs from
  federal **and** `000061 = 1`.

---

# AT1 Schedule 17 — Alberta Reserves

Engine: `packages/ca-tax/src/t2/at1/schedules/schedule17-reserves.ts`.
Federal counterpart: T2 Schedule 13 Part 2, blank PDF at
`../sources/cra-forms/T2SCH13-continuity-of-reserves.pdf`.

A pure three-column continuity over eight reserve kinds. A tax reserve deducted in
one year is reversed into income the next and a fresh reserve re-deducted.

## Lines

| Reserve kind | Opening | Transfer on w/u or amalg. | Closing | Federal source |
|---|---|---|---|---|
| Doubtful debts | **001** | **031** | **061** | fed 013110 / 013115 / 013120 |
| Undelivered goods and services not rendered | **003** | **033** | **063** | fed 013130 / 013135 / 013140 |
| Prepaid rent | **005** | **035** | **065** | fed 013150 / 013155 / 013160 |
| Returnable containers | **009** | **039** | **069** | fed 013190 / 013195 / 013200 |
| Unpaid amounts | **011** | **041** | **071** | fed 013210 / 013215 / 013220 |
| Insurance corporations policy reserves | **013** | **043** | **073** | federal balance |
| Bank reserves | **015** | **045** | **075** | federal balance |
| Other tax reserves | **017** | **047** | **077** | federal balance |

The fourth slot — **007 / 037 / 067** — is unused in the specification. Do not
assume it is a missing row; the eight kinds above are the complete set.

**Alberta carries two kinds the federal Part 2 does not**: insurance corporations
policy reserves and bank reserves. Neither applies to an owner-managed CCPC, but
both are modelled — omitting a row silently drops a balance, and a dropped reserve
balance is a wrong return, not a missing feature.

## Totals, and where they go

The live form carries four total lines the specification transcription did not, and
names both Schedule 12 destinations on its face:

| Line | Total | Carries to |
|---|---|---|
| **021** | Σ opening balances | — |
| **051** | Σ transfers | — |
| **081** | Σ closing balances | *"Carry forward the amount at line 081 to **Schedule 12, line 038**"* |
| **091** | line 021 + line 051 | *"Carry forward the amount at line 091 to **Schedule 12, line 036**"* |

Exported as `AT1_RESERVE_TOTAL_LINES`.

## The total algorithm

```
091 = Σ opening + Σ transfer      last year's reserves reversed into income
    → S12 line 036, an ADDITION

081 = Σ closing                   this year's reserves
    → S12 line 038, a DEDUCTION

net = 081 − 091                   negative ⇒ reserves drawn down, income rose
```

Same direction as the federal Schedule 13 Part 2 flow into Schedule 1
(lines 270 + 275 → S1 addition; line 280 → S1 deduction).

**Part 1 of the federal Schedule 13 — capital gains reserves under
s.40(1)(a)(iii) — is NOT here.** It routes to Schedule 6 federally and to AT1
Schedule 18 lines 066/068 provincially. Modelling it in both places would
double-count.

## Filing rules

- **Forbidden** when `000060` and `000061` are both 2.
- **Required** when the opening reserve balances, the transfers, **or** the closing
  reserve balances differ from federal — any of the three columns, on any kind.

## Schedule 12 reconciliation

`albertaReserveDifference(albertaNetEffect, federalNetEffect)` — a larger Alberta
reserve deduction lowers Alberta income and is a DEDUCTION.

The full set of Schedule 12 carry-forwards now wired:

| From | Helper |
|---|---|
| Sch 13 — CCA, recapture, terminal loss | `albertaCcaScheduleAdjustments` |
| Sch 18 — taxable capital gain, ABIL | `albertaDispositionAdjustments` |
| Sch 17 — reserves | `albertaReserveDifference` |
