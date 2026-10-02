# Field map — AT1 Schedules 12 and 21

**Verified against the live TRA-certified form**, 2026-08-08, on the AT1
validation return (tax year ending 31 December 2025). Screenshot:
`../validation/auratax/2026-08-07-cca-classes/screenshots/11-at1-sch21-loss-continuity.png`.

Both were originally transcribed from the specification text and then checked on
the form. The check was worth doing: it confirmed every line number **and** turned
up two things the spec text did not convey — an emission rule on Schedule 12, and
three whole loss pools on Schedule 21.

Engine: `packages/ca-tax/src/t2/at1/filing/at1-schedule-line-items.ts`.

---

# AT1 Schedule 12 — Alberta income/loss reconciliation

## Area A — net income for Alberta corporate income tax purposes

Every reconciling item is a **pair**: a federal figure beside an Alberta one, and
the form derives the divergence. The live column order is **Federal Dollar Amount
first, then Alberta Dollar Amount** — so the **odd** line is federal and the
**even** line is Alberta.

| Item | Federal | Alberta |
|---|---|---|
| Capital cost allowance | **005** | **004** |
| Recapture of CCA | **007** | **006** |
| Terminal loss | **009** | **008** |
| Farming inventory — mandatory adjustment, current year | 015 | 014 |
| Farming inventory — mandatory adjustment, prior year | 017 | 016 |
| Farming inventory — optional value, current year | 019 | 018 |
| Farming inventory — optional value, prior year | 021 | 020 |
| Depletion | 023 | 022 |
| Canadian exploration expenses | 027 | 026 |
| Canadian development expenses | 029 | 028 |
| Foreign exploration and development expenses | 031 | 030 |
| Canadian oil and gas property expenses | 033 | 032 |
| Scientific research expenses claimed in year | 035 | 034 |
| **Tax reserves deducted in prior year** | **037** | **036** |
| **Tax reserves claimed in current year** | **039** | **038** |
| Capital tax liability in other provinces | 042 | — |
| Other — attach supporting schedule | 041 | 040 |

Plus:

| Line | Item |
|---|---|
| **002** | Net income (loss) for **federal** purposes, from T2 line 300 |
| 050 / 052 | The two column subtotals |
| **054** | **Net income (loss) for Alberta purposes = line 002 − line 050 + line 052** |
| 048 | Explanation, required if line 040 is used |

## The emission rule the specification text does not carry

Printed on the form, above the pairs:

> Only specify the federal and Alberta amount of the items that are calculated
> differently for Alberta purposes or where the opening balance for Alberta
> purposes differs from the federal opening balance. **If these amounts are the
> same, DO NOT indicate the amount for either federal or Alberta purposes.**

This is the opposite of the instinct to report everything. A pair whose two
figures agree must be **omitted entirely** — filing it asserts a divergence that
does not exist. `schedule12Values` now drops any pair where the Alberta and
federal figures are equal, at nil or otherwise.

## Area B — taxable income for Alberta

Same pairing, deductions this time. Federal / Alberta:

| Item | Federal | Alberta |
|---|---|---|
| Charitable donations | 057 | 056 |
| Gifts to Canada or a province, cultural and ecological gifts | 059 | 058 |
| Taxable dividends deductible under ITA s.112, 113 or 186(6) | 061 | 060 |
| Part VI.1 tax deduction | 063 | 062 |
| Non-capital losses of preceding years | 065 | **064** |
| Net-capital losses of preceding years | 067 | **066** |
| Restricted farm losses of preceding years | 069 | **068** |
| Farm losses of preceding years | 071 | **070** |
| Limited partnership losses of preceding years | 073 | 072 |
| Restricted interest and financing expenses | 131 | 130 |
| Taxable capital gains / dividends from a central credit union | 075 | 074 |

The bolded Alberta lines are the destinations Schedule 21 carries into — see below.

---

# AT1 Schedule 21 — current year loss and continuity of losses

## Part 1 — calculating the current-year non-capital loss

| Line | Item |
|---|---|
| **001** | **Net income (loss) per AB Schedule 12 line 054** ← the S12 → S21 chain |
| 002 | Deduct: RIFE deducted under ITA para 111(1)(a.1) |
| 003 | Deduct: net capital losses deducted in the year |
| 005 | Deduct: taxable dividends deductible |
| 007 | Deduct: Part VI.1 tax deductible |
| 011 | Deduct: prospector's and grubstaker's shares |
| 012 | Deduct: employer deduction for non-qualified securities, ITA para 110(1)(e) |
| 013 | Subtotal of lines 002 to 012 |
| 015 | Line 001 − line 013 |
| 017 | Deduct: ITA s.110.5 / 115(1)(a)(vii) additions for foreign tax credits |
| 019 | Add: current year farm loss |
| **021** | **Non-capital loss for the current year = 015 − 017 + 019** |

## Part 2 — FIVE loss continuities, not two

The specification text reads as two columns. The form has **five pools**, each a
full continuity:

| | Non-capital | Capital | Farm | Restricted farm | Listed personal property |
|---|---|---|---|---|---|
| Carried forward from preceding year | **031** | **051** | **071** | **091** | **111** |
| Deduct: losses expired | 032 | — | 072 | 092 | 113 |
| Beginning of taxation year | 033 | — | 073 | 093 | 115 |
| Add: transfer on wind-up / amalgamation | 035 | 055 | 075 | 095 | — |
| **Add: current year loss** | **037** | **057** | **077** | **097** | **117** |
| Add: ABIL expired (fed Sch 4 line 220) | — | 059 | — | — | — |
| Deduct: applied against income | 041 | 061 | **079** | **099** | 119 |
| Deduct: ITA s.80 adjustment | 043 | 063 | 081 | 101 | — |
| Deduct: other adjustments | 045 | 065 | 083 | 103 | 121 |
| **Deduct: total carry-back to prior years** | **047** | **067** | **085** | **105** | **123** |
| **Closing balance** | **049** | **069** | **087** | **107** | **125** |

Four of the five map directly onto pools the federal Schedule 4 engine already
computes (non-capital, net-capital, farm, restricted farm). There is a sixth
section below these — *continuity of limited partnership losses* — laid out
per-partnership rather than as a single column, and not yet modelled.

Every carry-back line notes that **Schedule 10 must also be completed**.

## The cross-schedule carry-forwards

Stated beside each line on the form:

| From Schedule 21 | To Schedule 12 |
|---|---|
| 041 — non-capital applied against taxable income | line **064** |
| 061 — capital applied against current year gain, **× the inclusion rate** | line **066** |
| 079 — farm applied against taxable income | line **070** |
| 099 — restricted farm applied against farming income | line **068** |
| 119 — LPP applied against LPP gain | *"if Schedule 18 exists, from line 060; otherwise federal Schedule 6 line 655"* |

**Implemented** as `schedule12LossDeductions(alberta, federal, inclusionRate)`,
which derives the Area B pairs from the Schedule 21 continuities.

**The capital one is the trap.** Schedule 21 tracks capital losses at their FULL
amount; Schedule 12 deducts the ALLOWABLE portion. Carrying the raw figure across
over-deducts by a factor of two at the current rate. Every other pool carries at
face value, so the one that differs is the one an eye skips.

Restricted farm losses carry from the *applied against farming income* line rather
than an applied-against-taxable-income line, because farming income is the only
income they may offset — the same constraint the federal Schedule 4 engine
enforces.

## Confirmed unchanged from the specification text

Every line number transcribed from the spec text for both schedules matched the
live form. The two additions above are things the text omitted, not contradicted.
