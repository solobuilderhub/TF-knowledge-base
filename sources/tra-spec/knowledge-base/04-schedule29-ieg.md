Source: AT1-Chapter3-2026.4-full.txt section 3.1.1 "Important Note to Software Developers" (line 251, changes-since-2026.3 bullet) and section 3.2.3.29 "Schedule 29 - Alberta Innovation Employment Grant" cross-reference table (.txt lines 14879-15009, printed footers "Page 3-220"/"Page 3-221"). Compared against AT1-Chapter3-2025.2-full.txt section 3.2.3.29 (.txt lines 20734-20932, printed footers "Page 3-218"/"Page 3-220"). Engine cross-check against `packages/ca-tax/src/t2/at1/schedules/schedule29-eligible-expenditures.ts`, `at4970-ieg-projects.ts`, `schedule29-ieg.ts`, and usage sites in `filing/at1-schedule-line-items.ts` and `forms/schedule29.ts`.

# AT1 Schedule 29 (form 029) — T661 line 557 vs 559 current-expenditures transition

## What changed since 2026.3

2026.4's changelog (.txt line 251-252):

> "AT1 Schedule 29 updated to incorporate inclusion of federal T661 line 557 for multiple
> fields to reflect the current expenditures transition."

Confirmed genuinely new: `grep -n "557"` against the entire AT1-Chapter3-2025.2-full.txt returns
**zero hits** anywhere in that document. Line 557 does not exist in the 2025.2 spec at all —
every 2025.2 Schedule 29 field that touches federal SR&ED expenditures cites line 559 only.
(A different schedule, 3.2.3.10 "Schedule 9 - Alberta SR&ED Tax Credit", still cites line 559
only in 2026.4 too — .txt lines 5688-5713 — Schedule 9 was NOT touched by this transition.)

## The exact transition rule and cutoff date

Stated once, in full, on AT1 field **029003**'s Business Rules/Comments column
(.txt lines 14906-14941):

> "Enter the amount of federal qualified SR&ED expenditures shown on line 557/559 of federal
> form T661 (after IEG amount on Schedule 029 line 130 has been included in the amount entered
> on line 513 of form T661). NOTE: For Alberta IEG calculations, use the federal amount of
> qualified SR&ED expenditures reported on **line 559** of federal Form T661 for taxation years
> ending **before December 16, 2024**. For taxation years ending **after December 15, 2024**,
> use the federal amount of current SR&ED expenditures reported on **line 557** of federal
> Form T661."

"Ending before December 16, 2024" and "ending after December 15, 2024" are the same day
boundary stated two ways — there is no gap or overlap:

| Taxation year end | Federal source line |
|---|---|
| On or before 2024-12-15 | T661 line 559 ("qualified SR&ED expenditures") |
| On or after 2024-12-16 | T661 line 557 ("current SR&ED expenditures") |

The two federal lines are **not a renumbering of the same figure** — line 559 is "qualified"
SR&ED expenditures, line 557 is "current" SR&ED expenditures, per the spec's own wording.

## Affected fields (all in Schedule 29, form 029)

Every field in the entire 2026.4 document containing the string "557" is one of these four,
all inside 3.2.3.29:

| Field | Caption (2026.4) | Old wording (2025.2) | New wording (2026.4) |
|---|---|---|---|
| **029003** | Federal amount of qualified SR & ED expenditures at line 557/559 of federal T661 | "...at line 559 of federal T661" — cites 559 only, no transition text (.txt 2025.2 lines 20802-20813) | Full transition rule quoted above; carries the exact Dec 15/16, 2024 cutoff |
| **029005** | Portion of line 557/559 of federal T661 carried out in Alberta | "Portion of line 559 of federal T661 carried out in Alberta" (2025.2 lines 20815-20825) | "Enter the portion of line 557/559 of federal Form T661 that is in respect of SR&ED carried out in Alberta... 029005 must be ≤ 029003." |
| **029007** | Deduct: Federal prescribed proxy amount (if any) included in the Alberta portion of line 557/559 | "...included in the Alberta portion of line 559" (2025.2 lines 20885-20894) | "Value must equal federal proxy amount included in the Alberta portion of Federal form T661, line 557/559. Must equal total of line 111 from form AT4970." |
| **029011** | Add: IEG that reduced the federal expenditure in line 557/559 of federal T661 in the taxation year | "...in line 559 of federal T661 in the taxation year" (2025.2 lines 20899-20903) | "Value = Schedule 029 line 130. See Guide to Claiming The Alberta Innovation Employment Grant." |

Field **029009** ("Add: Alberta proxy amount") is part of the same computation chain but its
caption/rule text never mentions line 557/559 in either version — it is unaffected wording-wise.

**Total: 4 fields affected** (029003, 029005, 029007, 029011), matching the changelog's
"multiple fields." Confirmed by exhaustive grep — no other field code in the 2026.4 document
(including Schedule 9's own line-559 fields, 009003-009015) references line 557.

## Engine cross-check

Reviewed in full: `packages/ca-tax/src/t2/at1/schedules/schedule29-eligible-expenditures.ts`,
`at4970-ieg-projects.ts`, `schedule29-ieg.ts`; usage sites in `filing/at1-schedule-line-items.ts`
and `forms/schedule29.ts` (grepped for `iegT661SourceLine`).

| Field | Spec (2026.4) | Engine | Verdict |
|---|---|---|---|
| Cutoff date/logic | On/before 2024-12-15 → line 559; on/after 2024-12-16 → line 557 | `schedule29-eligible-expenditures.ts:72-74`: `export function iegT661SourceLine(taxationYearEnd: string): '557' \| '559' { return taxationYearEnd >= '2024-12-16' ? '557' : '559'; }` | **MATCH** — the `>= '2024-12-16'` boundary is exactly the spec's Dec 15/16 split; no off-by-one, no gap or overlap between the two branches. |
| 029003 (federal amount, line 557/559) | New transition text applies here (this is the field the NOTE is attached to) | `IegEligibleExpendituresInput.federalAmount` — doc comment at line 77 says "(T661 line 559 or 557)"; module header (lines 44-53) states the rule and cites "Fall 2026 re-certification" | **MATCH** on substance. `iegT661SourceLine` is exported and referenced from `at1-schedule-line-items.ts` and `forms/schedule29.ts` as informational guidance for which federal line to key from — it does not feed into `computeIegEligibleExpenditures`'s arithmetic, which is correct: the Alberta computation (031 = 005 − 007 + 009 + 011 + 025) is identical either way per the module's own note, and the spec's 029003 rule is a *sourcing* instruction, not a different formula. |
| 029005 (Alberta portion of 557/559) | Same 557/559 sourcing, no separate transition logic (references 029003) | `at4970-ieg-projects.ts` lines 66, 68, 72, 74 — comments say "federal T661 559/557" (order reversed vs. spec's "557/559" but semantically identical); `schedule29-eligible-expenditures.ts` line 79 `albertaPortion` | **MATCH** — no separate cutoff needed since it derives from whichever line 029003 used. |
| 029007 (deduct federal proxy amount) | Same 557/559 sourcing | `federalProxyAmount` param, `schedule29-eligible-expenditures.ts` line 81; `at4970-ieg-projects.ts` line 73 | **MATCH** — same reasoning as 029005. |
| 029011 (add IEG that reduced federal expenditure) | Same 557/559 sourcing | `iegReducingFederalExpenditure`, `schedule29-eligible-expenditures.ts` lines 85-92 | **MATCH** — same reasoning; the doc comment correctly frames it as "zero for a first-time current-year claim." |

**No discrepancy found.** The engine's `iegT661SourceLine` cutoff (`taxationYearEnd >=
'2024-12-16' ? '557' : '559'`) is byte-exact against the spec's stated boundary ("ending before
December 16, 2024" = 559; "ending after December 15, 2024" = 557 — the same single day
boundary), and the function is correctly scoped as informational/sourcing metadata rather than
an arithmetic gate, consistent with all four affected fields (029003, 029005, 029007, 029011)
sharing one underlying federal-line choice rather than each having its own independent rule.

One residual gap, not a mismatch: neither the spec excerpt located nor the engine states what
happens for a corporation whose taxation year *straddles* the transition in some other sense
(e.g., an amended T661 refiled under the other line numbering) — not addressed by either source,
so there is nothing to reconcile here; flagging only so a future re-read of the spec's guide
material isn't skipped if TRA publishes worked examples for the boundary year.

## Related

- [./03-jacket-mandatory-fields.md](./03-jacket-mandatory-fields.md)
- [./06-changelog-2025.2-to-2026.4.md](./06-changelog-2025.2-to-2026.4.md)
- [./00-index.md](./00-index.md)
