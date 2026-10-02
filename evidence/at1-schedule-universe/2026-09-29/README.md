# AT1 schedule universe — which schedules a current AT1 needs (2026-09-29)

**Question.** TRA's Net File specification (Chapter 3, v2026.4) still has cross-reference
tables for AT1 Schedules 5, 6, 7, 8, 9, 11 and 14, and Schedule 12 lines 010–013
(cumulative eligible capital). Tax Foundry implements none of them. Is that a gap?

**Answer.** No. These are legacy forms. TRA no longer publishes them, the current printed
forms do not carry them, and the market-leading competitor does not offer them. Tax
Foundry's AT1 set matches TRA's published set exactly.

## Evidence

| # | Source | What it shows | File |
|---|---|---|---|
| 1 | TRA's official forms page, alberta.ca/corporate-income-tax (captured 2026-09-29) | TRA publishes **14** AT1 schedules: 1, 2, 3, 4, 10, 12, 13, 15, 16, 17, 18, 20, 21, 29. Nothing is published for 5–9, 11 or 14. | `tra-alberta-ca-forms-list.png`, `tra-alberta-ca-forms-list-2.png`, `tra-alberta-ca-forms-list.txt` |
| 2 | AuraTax, Manage Schedules on a live AT1 return (the team QA Aura account; return "TF VALIDATION ALBERTA LTD.", `8c645ecd-…`) | Aura's entire AT1 schedule set is 000, EDI, 001, 002, 003, 004, 010, 012, 013, 015, 016, 017, 018, 020, 021, 029, plus the AT4970 attachment. Aura has no 005–009, 011 or 014. The dialog was cancelled and nothing was changed. | `auratax-manage-schedules-dialog.png`, `auratax-manage-schedules-dialog-scrolled.png`, `auratax-manage-schedules-dialog.txt` |
| 3 | Current printed Schedule 12, TRA11732 (AT112) Rev. 2026-03 | It has **no** eligible-capital rows. Lines 010–013 exist only in the Net File spec, not on the form TRA prints today. | `tra-printed-schedule12-rev2026-03.txt` (source PDF: `research/sources/tra-forms/pdf/AT1SCH12-…`) |
| 4 | Net File spec v2026.4, §3.2.3.15 (Schedule 14) | Schedule 14 applies only to "taxation years that end on or after January 1, 2017 and include December 31, 2016", the transition year. Cumulative eligible capital pools became CCA class 14.1 on 2017-01-01, so no current-year return can file Schedule 14. | `tra-netfile-spec-2026.4-schedule14-applicability.txt` |
| 5 | Net File spec v2026.4, table of contents | The spec keeps tables for legacy schedules (5–9, 11, 14) next to the current ones. So the spec's contents are not the list of forms in use; TRA's published forms list is. | `tra-netfile-spec-2026.4-schedule-toc.txt` |

## What the legacy schedules were

Descriptions are from the spec's table of contents; the regime status is ours.

- **5, 6, 7** Alberta Royalty Tax Deduction / Credit / Supplemental: legacy royalty regime.
  TRA does not publish these forms.
- **8** Political Contributions Tax Credit: TRA does not publish this form. Tax Foundry
  collects the credit on the jacket itself (`politicalContributionsTaxCredit`).
- **9** Alberta SR&ED Tax Credit: legacy. The current Alberta R&D incentive is the Innovation
  Employment Grant (Schedule 29).
- **11** Manufacturing & Processing Profits Deduction: TRA does not publish this form. Tax
  Foundry collects the deduction on the jacket itself (`manufacturingDeduction`).
- **14** Cumulative Eligible Capital: the pre-2017 regime (see #4).

## Tax Foundry's position

Implement exactly TRA's published set. Tax Foundry does this, including the AT4970 IEG
project listing. It keeps no legacy forms.

Schedule 18: TRA also publishes a variant "for taxation years ending on or before June 30,
2019". That is itself legacy. Tax Foundry implements the current (post-July-2019) form only.
