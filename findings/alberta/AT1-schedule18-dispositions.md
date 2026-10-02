# AT1 Schedule 18 — Alberta Dispositions of Capital Property

**Source:** Alberta TRA, *Corporate Income Tax Net File Specifications*, Chapter 3
v2025.2, §3.2.3.19. Local copy: `research/spec/AT1-Chapter3-2025.2-full.txt`
(lines 16951-18120).

**Status:** implemented.
`packages/ca-tax/src/t2/at1/schedules/schedule18-dispositions.ts`, 23 tests in
`tests/at1-schedule18-dispositions.test.ts`.

## Shape

Like AT1 Schedule 13, a reconciliation overlay on the federal schedule (here
Schedule 6): Alberta figures default to federal, and only the differing figures
are entered. Same filing gate — forbidden when `000060` and `000061` are both 2,
required when the capital gains reserve **opening balance**, the proceeds of
disposition, or the adjusted cost bases differ from federal.

The structural difference from federal Schedule 6 is that Alberta reports **six
category totals** rather than itemising each disposition:

| Category | Proceeds | ACB | Outlays | Gain |
|---|---|---|---|---|
| shares | 018002 | 018022 | 018042 | 018054 |
| real estate | 018004 | 018024 | 018044 | 018055 |
| bonds | 018006 | 018026 | 018046 | 018056 |
| other properties | 018008 | 018028 | 018048 | 018057 |
| personal-use property | 018010 | 018030 | 018050 | 018058 |
| listed personal property | 018012 | 018032 | 018052 | 018059 |

Each gain is `proceeds − (ACB + outlays)`.

## Three rules that are easy to get wrong

**1. Outlays have no Alberta variant.** Proceeds and ACB say "if Alberta differs,
enter the Alberta amount." The outlay lines (018042-018052) instead say **"Must
equal the total of all occurrences of fed 006*n*40."** There is no Alberta
override, and the implementation refuses one — an entered Alberta outlay is
ignored in favour of the federal figure.

**2. A personal-use property LOSS is not deductible.** Line 018058 is calculated
`018010 − (018030 + 018050)` and then: *"If amount is negative, default to zero."*
The category floors at zero. Listed personal property (018059) does **not** floor
— it is signed.

**3. An LPP loss must not shelter ordinary capital gains.** This is the subtle
one, and the specification encodes it structurally rather than stating it. Line
076 has two variants that differ *only* in which terms appear:

```
018059 ≥ 0:  [054 + 055 + 056 + 057 + 058 + 059 − 060 + 064 + 066 − 068
              − 071 − 073 + min(077, 078) + 096 − 098] × inclusion rate
018059 <  0: [054 + 055 + 056 + 057 + 058             + 064 + 066 − 068
              − 071 − 073 + min(077, 078) + 096 − 098] × inclusion rate
```

When the LPP result is a loss, **both** 018059 and 018060 drop out of the sum.
Carrying a negative 018059 into the total would let a loss on a painting reduce
the taxable gain on shares, which is exactly what the LPP regime forbids. Line
018060 is separately capped: *"If 018059 is negative, value must equal zero"* and
otherwise the lesser of the LPP gain and the available prior-year LPP losses.

Both variants floor the final result at zero.

## The rest of line 076

| Line | Item | Direction |
|---|---|---|
| 018064 | capital gains dividends (fed 006875) | + |
| 018066 | capital gain reserve **opening** balance (fed 006880) | + |
| 018068 | capital gain reserve **closing** balance (fed 006885) | − |
| 018071 | gain on donated listed securities (fed 006895) | − |
| 018073 | gain on donated ecologically sensitive land (fed 006896) | − |
| 018077 / 018078 | exemption threshold / gains from actual property | + **lesser of** |
| 018096 | s.34.2 taxable capital gains (fed 006899) | + |
| 018098 | s.34.2 allowable capital losses (fed 006901) | − |

`min(018077, 018078)` is stated as such and is not a sum.

## The ABIL section

A separate per-corporation list (018082-018092) for property that qualifies for
and results in an allowable business investment loss:

```
018094 = Σ [ 018088 − (018090 + 018092) ] × inclusion rate      reported NEGATIVE
```

The spec marks 018094 with a `-` sign flag and says *"Value must be negative."*
The implementation only aggregates entries that are actually losses and raises an
issue naming any entry that shows a gain, since a gain in the ABIL section means
the disposition was filed in the wrong place.

## Inclusion rate and the straddling exception

Line 076 is written as × 50%. The specification also carries a **filing
requirement exception**:

> If dispositions in a taxation year straddle one or more inclusion rate periods,
> then supporting documentation MUST be submitted with the AT1 RSI to detail how
> the inclusion rate was calculated.

with the periods named as ¾, ⅔ and ½. The engine takes a single `inclusionRate`
(defaulting to ½) and, when the caller flags a straddling year, raises an issue
saying supporting calculations must accompany the RSI. It deliberately does not
blend rates it cannot verify: a wrong blend is worse than an explicit hand-off,
because the return would look complete.

Note that the ⅔ rate never took effect — the 2024 federal proposal to raise the
inclusion rate was abandoned — but the parameter stays because the ¾ periods are
real history and the engine is used for prior-year work.

## Election flag

Line 018001 — electing to transfer property under Alberta Corporate Tax Act
14.1, 14.2 or 16.1 — requires form AT107, AT108 or AT109 with the AT1 RSI. The
engine raises this as an issue when the flag is set, because it is a paper
attachment the Net File payload cannot carry.

## Re-investigated, 2026-09-03

**"Alberta gains don't flow into AT1 Schedule 12" was stale.** Re-checked
`assemble-at1-schedules.ts`'s `scheduleTwelve()` directly: it already calls
`albertaDispositionAdjustments` (defined in `schedule12-reconciliation.ts`,
producing `albertaCapitalGainDifference` + `albertaAbilDifference` — the
same `Schedule12Adjustment` shape as `albertaCcaScheduleAdjustments`),
spread into the `adjustments` array feeding `reconcileAlbertaNetIncome`
whenever `dispositions` is present. Confirmed it's real and tested (not a
stub) — `packages/ca-tax/src/t2/at1/schedules/schedule12-reconciliation.ts:286`.
This must already have landed during earlier work on this same project
(the "Tier 1: add the missing capitalGains/abil block" item from an earlier
planning pass) and the finding was never updated to say so.

**The reserve cross-check remains open, but is currently a non-issue in
practice** — re-checked `scheduleEighteen()` in `assemble-at1-schedules.ts`:
it doesn't populate capital-gains-reserve opening/closing balances AT ALL
today (its own doc comment already discloses this: "capital-gains-reserve
figures are not modelled on the federal side and are not wired here"). So
there is currently no path where a mismatched reserve balance could reach
Schedule 18 from this composer — the cross-check the original note wanted
has nothing to check yet. Left open for when/if capital-gains-reserve data
gets wired into Schedule 18 from a real source; a validation with no live
data path to guard is not worth building speculatively.
