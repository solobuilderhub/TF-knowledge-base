# Field map — AT1 Schedule 18, Alberta Dispositions of Capital Property

**Captured from the live TRA-certified form**, 2026-08-07, tax year ending
31 December 2025. Raw capture: `_raw/_raw-at1-sch18.txt`. Screenshot:
`../validation/auratax/2026-08-07-cca-classes/screenshots/10-at1-sch18-dispositions.png`.

Engine: `packages/ca-tax/src/t2/at1/schedules/schedule18-dispositions.ts`.

Federal counterpart: T2 Schedule 6, blank PDF at
`../sources/cra-forms/T2SCH06-capital-gains.pdf`. The shapes differ — federal
Schedule 6 itemises each disposition, Alberta reports six category totals.

## Header

| Line | Question |
|---|---|
| **001** | Is the corporation electing to transfer property under **ACTA s.14.1(3), 14.2(3) or 16.1(3)**? Yes/No |

A "Yes" requires form **AT107, AT108 or AT109** with the AT1 RSI — a paper
attachment the Net File payload cannot carry.

## The six category totals

Each row is `D = A − (B + C)`.

| Category | A proceeds | B adjusted cost base | C outlays & expenses | D gain/(loss) |
|---|---|---|---|---|
| Shares | **002** | **022** | **042** | **054** |
| Real estate | **004** | **024** | **044** | **055** |
| Bonds | **006** | **026** | **046** | **056** |
| Other properties | **008** | **028** | **048** | **057** |
| **Personal-use property** | **010** | **030** | **050** | **058** |
| **Listed personal property** | **012** | **032** | **052** | **059** |

Plus:

| Line | Item |
|---|---|
| **053** | Add: line 160 of federal Schedule 6 (into the shares row) |
| **060** | Subtract: unapplied listed personal property losses from other years, **up to the total LPP gains** |

The two shaded categories behave differently and this is where implementations go
wrong:

- **Personal-use property (058)** — a loss is not deductible. The category floors
  at zero.
- **Listed personal property (059)** — may be negative, but an LPP loss offsets
  only LPP gains. See line 062.

Column C has **no Alberta variant** on any row: the specification says outlays
*"must equal"* the corresponding federal figure.

## The running total

| Line | Item | Formula |
|---|---|---|
| **062** | Total of column D | **"Do not include the amounts at lines 059 and 060 if the difference is a net loss"** |
| **064** | Capital gains dividends | + |
| **066** | Capital gain reserve **opening** balance | + |
| **068** | Capital gain reserve **closing** balance | − |
| **070** | Capital gain or (loss) | `062 + 064 + 066 − 068` |
| **071** | Deduct: gain on donated listed securities, para 38(a.1)(i)/(iii) | − |
| **073** | Deduct: gain on donated ecologically sensitive land, para 38(a.2) | − |
| **075** | | `070 − (071 + 073)` |
| **077** | Add: exemption threshold at time of disposal | flow-through share class, s.40(12) |
| **078** | Add: total capital gains from disposition of actual property | |
| **079** | | **lesser of 077 or 078** — not their sum |
| **096** | Taxable capital gains under s.34.2 — *line 275 of federal Schedule 73* **× 2** | + |
| **097** | Subtotal | `075 + 079 + 096` |
| **098** | Allowable capital losses under s.34.2 — *line 285 of federal Schedule 73* **× 2** | − |
| **099** | Total capital gains or losses | `097 − 098` |
| **076** | **Taxable capital gain** | `099 × 50%` |

## Three rules that are easy to get wrong

### 1. An LPP loss must not shelter ordinary gains

Line 062 says it in plain language: *"Do not include the amounts at lines 059 and
060 if the difference is a net loss."* When the LPP result is negative, **both**
059 and 060 drop out of the total. The specification encodes the same rule
structurally, as two variants of line 076 that differ only in which terms appear —
the live form is the clearer statement of the two.

### 2. Lines 096 and 098 are grossed up ×2

Federal Schedule 73 lines 275 and 285 hold **taxable** capital gains and
**allowable** capital losses — already at the ½ inclusion rate. Everything else on
this schedule is a *whole* capital gain until line 076 applies the rate once, so
Alberta doubles them on the way in.

**This was a live defect in our engine** until 2026-08-07: the s.34.2 amounts were
added raw and then halved with everything else, halving an already-halved figure.
On $30,000 of s.34.2 taxable capital gains the Alberta taxable capital gain came
out $15,000 instead of $30,000. Fixed via `SECTION_34_2_GROSS_UP`.

The specification text lists both lines *without* the multiplier, so this was only
visible on the form.

### 3. Line 079 is a lesser-of, not a sum

`min(077, 078)`.

## Allowable business investment loss section

A separate per-corporation list — *"property qualifying for and resulting in an
allowable business investment loss"*.

| Line | Field |
|---|---|
| **082** | Name of small business corporation |
| **084** | Shares (1) or debt (2) |
| **086** | Date of acquisition, `YYYYMMDD` |
| **088** | A — proceeds of disposition |
| **090** | B — adjusted cost base |
| **092** | C — outlays and expenses |
| — | D — `A − (B + C)` |
| **094** | **Allowable business investment loss** = total of column D × inclusion rate |

Line 094 is flagged negative in the specification (*"Value must be negative"*), so
only genuine losses belong here. An entry showing a gain means the disposition was
filed in the wrong section, and the engine raises an issue naming it.

## Filing rules

- **Forbidden** when jacket lines `000060` and `000061` are both 2.
- **Required** when the capital gains reserve **opening balance**, the proceeds of
  disposition, or the adjusted cost bases differ from federal.
- **Filing requirement exception:** where dispositions straddle more than one
  inclusion-rate period (¾, ⅔, ½), supporting documentation detailing the rate
  calculation **must** accompany the AT1 RSI. The engine applies a single rate and
  raises an issue rather than blending rates it cannot verify.

## Not yet wired

Alberta capital gains do not flow into the AT1 Schedule 12 reconciliation the way
the Schedule 13 totals now do. The numbers are all present on
`AlbertaSchedule18Result`; the wiring is not. See
`../findings/alberta/AT1-schedule18-dispositions.md`.
