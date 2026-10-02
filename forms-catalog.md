# TaxFoundry — Forms & Schedule Catalog (source-of-truth inventory)

Two authorities drive the build. **Do not invent field IDs — lift them from these.**
1. **Federal T2** — CRA T2 return + schedules (field = line number, e.g. line 060). Cross-checked live against AuraTax's T2 editor (`competitors/auratax/t2-editor-full-text.txt`).
2. **Alberta AT1** — `spec/AT1-Chapter3-2025.2-full.txt` (275pp dev spec). Every AT1/schedule field has an 11-char Line-Item-ID `NNNNNNNNN` (schedule# + line# + occurrence).

---

## A. Federal T2 — v1 schedule set

### Always present
| Form | Name | Notes |
|---|---|---|
| T2 jacket | Corporation Income Tax Return (9 pages) | Identification (001 BN, 002 name, 040 corp type, 060/061 tax-year start/end, 063 s.249(4) acq-of-control, s.249(3.1) deemed y/e, amalgamation, s.88 wind-up, s.149 exempt), pages 2–3 yes/no schedule-trigger grid, page 9 tax summary |
| S100 | Balance Sheet (GIFI) | + **S101** Opening Balance Sheet (first return) |
| S125 | Income Statement (GIFI) | |
| S141 | GIFI — Notes Checklist (Additional Info) | **mandatory even when empty** |
| S1 | Net Income (Loss) for Income Tax Purposes | book→tax reconciliation; the engine's core |
| S50 | Shareholder Information | any shareholder ≥10% |

### Triggered (v1)
| Form | Name | Trigger |
|---|---|---|
| S8 | Capital Cost Allowance (CCA) | any depreciable property |
| S3 | Dividends Received / Paid + Part IV tax | dividends |
| S55 | Part III.1 tax | every taxable dividend paid |
| S53 | GRIP (General Rate Income Pool) | eligible dividend paid / GRIP changed |
| S7 | Aggregate Investment Income + Income Eligible for SBD | AAII / SBD |
| S5 | Tax Calculation Supplementary — provincial/territorial | provincial credits / multi-juris (mostly N/A single-AB) |

### Referenced by the T2 jacket page-9 tax summary (confirmed present in AuraTax; some are v1-out, tracked here for completeness)
S2 (donations & gifts), S4 (loss continuity — non-cap/net-cap/farm/limited-partnership/restricted-farm), S18 (capital gains refund), S21 (foreign tax credits — business/non-business/logging), S23 (SBD allocation among associated), S27 (M&P + zero-emission tech deduction), S31 (Investment Tax Credit), S58 (Cdn journalism labour tax credit), S68 (banks & life insurers add'l tax). RDTOH/ERDTOH/NERDTOH, dividend refund, Part I/IV/IV.1/VI.1 tax, instalment eligibility all live on the jacket summary.

> **Out of v1 (gate → CPA):** S9/S23 associated-group linking, T1134/T1135/T106 foreign, multi-jurisdiction S5 allocation, S31/T661 SR&ED, T2-ADJ amendments.

### GIFI ranges (from strategy dossier — verify vs current e-file spec before freezing)
current assets 1000–1599 · capital assets 1600–2179 · long-term assets 2180–2599 · current liab 2600–3139 · long-term liab 3140–3499 · equity 3500–3640 · partners' capital 3540–3585 (overlaps equity, mutually exclusive by entity type) · retained earnings 3660–3849 · revenue 8000–8299 · COGS 8300–8519 · opex 8520–9369 · farming 9370–9970. Required non-null lines: 2599, 3499, 3620, 3575, 8299, 9368, 9659, 9898, 3849, 9999. Validity checks: assets = liab + equity; revenue − expenses = net non-farm income.

---

## B. Alberta AT1 — full schedule inventory (`spec/AT1-Chapter3-2025.2-full.txt`)

AT1 return + 22 schedules. Filed as **Net File** (SOAP/XSD `AlbertaCorporateIncomeTaxReturn.xsd`) or **RSI** (print). XML order: Header → Schedules ascending → EDI schedule → Footer.

| Sch | Name | v1? |
|---|---|---|
| AT1 (Sch 000) | Alberta Corporate Income Tax Return | ✅ core |
| 1 | Alberta Small Business Deduction | ✅ |
| 2 | Alberta Income Allocation Factor | ✅ (single-AB → 1.0) |
| 3 | Alberta Other Tax Deductions and Credits | ✅ |
| 4 | Alberta Foreign Investment Income Tax Credit | ~ |
| 5 | Alberta Royalty Tax Deduction | ✗ resource |
| 6 | Alberta Royalty Tax Credit | ✗ resource |
| 7 | Alberta Royalty Tax Credit/Deduction Supplemental | ✗ resource |
| 8 | Alberta Political Contributions Tax Credit | ~ |
| 9 | Alberta SR&ED Tax Credit | ✗ (SR&ED out of v1) |
| 10 | Alberta Loss Carry-Back Application | ✅ (test case 1) |
| 11 | Alberta Manufacturing & Processing Profits Deduction | ~ |
| 12 | Alberta Income/Loss Reconciliation | ✅ |
| 13 | Alberta Capital Cost Allowance (CCA) | ✅ (test case 1: class 1/8/13 + immediate expensing) |
| 14 | Alberta Cumulative Eligible Capital Deduction | ~ |
| 15 | Alberta Resource Related Deductions | ✗ resource |
| 16 | Alberta Scientific Research Expenditures | ✗ |
| 17 | Alberta Reserves | ~ |
| 18 | Alberta Dispositions of Capital Property | ✅ (test case 1: net capital loss) |
| 20 | Alberta Charitable Donations & Gifts Deduction | ~ |
| 21 | Alberta Calculation of Current Year Loss & Continuity of Losses | ✅ (test case 1) |
| 29 | Alberta Innovation Employment Grant (IEG) | ✅ (test cases 2 & 3 — AT1 line 129) |

**AT1 return (Sch 000) key Line-Item-IDs** (from spec sample XML — see `spec` file for full cross-ref tables):
`000005001` SCC (software cert code) · `000010001` legal name · `000012/014/015/017` address · `000034001` CAN (Corporate Account Number) · `000035001` BN (RC0001) · `000036/037001` tax year begin/end · `000047001` federal taxable income · `000062001` Alberta tax · `000065001` allocation factor · `000080001` Alberta Tax Payable · `000090001` balance · `000097/098/099` certification name/position. Schedule N line items are `NNN…` prefixed by schedule number (e.g. Sch 1 → `001…`, Sch 21 → `021…`, Sch 29 → `029…`).

---

## C. Certification test cases → engine acceptance suite (`test-cases/`)

| Case | What it exercises | v1 schedules hit |
|---|---|---|
| **TC1** (+AMENDED) | TYB 2023-09-01 → TYE 2024-08-31. Current-year loss $25k (amended $50k), net cap loss $75k. CCA class 1/8/13 with **immediate expensing** (class 8 +$1M addition), AB-only claims diverging from federal. Non-cap loss c/f $100k + carry-backs; net-cap loss carry-backs. | AT1, Sch 12, **13**, **21**, **10**, **18** |
| **TC2** | TYB 2024-01-01→TYE 2024-12-31. **NIL return, IEG only.** Qualified CCPC, associated w/ 1 corp. Fed SR&ED $1M (line 559), $400k AB / $600k ON. Prior-year AB eligible exp; taxable capital $12M (line 690 SCH33); proxy method. | AT1 line 129, **Sch 29** |
| **TC3** | Same period. **IEG, 4 associated corps A/B/C/D**, multi-province SR&ED, taxable-capital grind across the group ($10M/$3M/$5M/$2M). | AT1 line 129, **Sch 29** (associated grind) |

**Acceptance:** the engine must produce AT1 Net File XML that TRA's certification environment accepts, reproducing each case's expected line values. Build TC1 first (mainstream: losses+CCA), then TC2/TC3 (IEG — needed only if we keep IEG in v1; note IEG involves SR&ED which is otherwise gated — decide with product).

---

## D. Field-schema convention (how each form becomes code)
For every form: `packages/…/forms/<form>/<year>/schema.ts` exporting `{ lines: LineDef[] }` where a `LineDef = { id, label, type, mOX: 'M'|'O'|'X', validation }`.
- `id` = CRA line number (T2) or AT1 Line-Item-ID (AB).
- `mOX` = Mandatory/Optional/Conditional per the AT1 cross-ref "M O X" column (spec §3.2.1) — drives RSI/XML emission (omit optional zero/null).
- Same `schema.ts` feeds **both** the engine (compute/validate) and the web `formkit` config (render) — single source of truth.
- Renderer maps `LineDef.id` → XML `<Value LineItemID="…">` (AT1) / CIF XML tag (T2).
