# GIFI code fix: capital assets & cost of sales were filed under the wrong leaf codes

## What was wrong

`apps/server/src/filing/t2-cif.service.ts`'s `buildGifiFromReturn()` — the function
that turns this app's `balanceSheet`/`incomeStatement` guided-editor fields into the
actual filed GIFI Schedule 100/125 lines — mapped two combined app fields onto GIFI
codes that mean something narrower and different:

| App field | Was filed as | What that code actually means (per `@classytic/ledger-ca`'s own account database) | Should be |
|---|---|---|---|
| `capitalAssetsNet` (one combined net figure) | `1740` | **"Machinery and Equipment"** — one leaf sub-category of capital assets, cost basis only (`packages/ledger-ca/src/accounts/assets.ts`) | `2008` — "Total Tangible Capital Assets" |
| `costOfSales` (one combined figure) | `8320` | **"Purchases / Cost of Materials"** — one component of cost of sales (`packages/ledger-ca/src/accounts/income-statement.ts`) | `8518` — "Total Cost of Sales" |

Both wrong codes were confirmed by reading `@classytic/ledger-ca`'s own canonical
GIFI account tables directly (source: `D:\projects\algoclan\fajr\packages\ledger-ca\src\accounts\`),
not guessed. Also cross-checked against CRA's own "Commonly used field codes" reference
pages, which are printed directly on the T2SCH100/T2SCH125 PDFs themselves (page 2 of
Schedule 100, pages 3-4 of Schedule 125) — these list `2008`/`8518` with exactly the
above meanings, independent of ledger-ca's own database.

## Why it happened, and why the fix is safe

`buildGifiReturn()` (`packages/ledger-ca/src/cor/gifi-return.ts`) is a pure pass-through:
whatever `{code: amount}` map it's given, it emits verbatim as GIFI lines (tagging each
with the account NAME resolved from `getGIFIByCode`), and its only balance check
(`validateGifiBalancing`) compares the two grand-total codes (`2599` total assets vs
`3640` total liabilities+equity) — it does **not** recompute `isTotal` codes like `2008`
or `8518` from their own listed sub-accounts. That was worth confirming before touching
anything: if it HAD auto-recomputed totals from children, filing a raw value directly
into `2008` (itself flagged `isTotal: true`) might have been silently discarded/zeroed.
It doesn't, so writing the app's one combined figure straight into `2008`/`8518` is safe
and changes nothing about the balance-sheet arithmetic (`2599`/`3640`, computed
separately in `t2-cif.service.ts` from the same input fields, are unaffected either way).

## The residual gap — closed, 2026-09-03

Added an optional `accumulatedAmortization` field (`BalanceSheetValues`, GIFI 2009).
Confirmed the correct arithmetic directly against `@classytic/ledger-ca`'s own
account database rather than assuming it: `2599` ("Total Assets")'s
`totalAccountTypes` definition in `packages/ledger-ca/src/accounts/assets.ts`
SUBTRACTS `2009` from `2008` to reach the net figure it feeds into — i.e. `2008`
(gross) − `2009` (accumulated amortization) = net. So `buildGifiFromReturn` now
files `capitalAssetsNet + accumulatedAmortization` at `2008` (the true gross
total when amortization is entered, or the net figure alone when it isn't — same
behavior as before this fix) and `accumulatedAmortization` itself at `2009`.

This app's OWN balance-sheet total (`2599`, checked by `validateGifiBalancing`
against `3640`) deliberately stays on the NET `capitalAssetsNet` figure and is
untouched by this change — `2008`/`2009` are a supplementary GIFI breakdown, not
an input to this app's own accounting, confirmed by a regression test asserting
`2599` is identical with and without `accumulatedAmortization` entered.

Field is optional; leaving it blank preserves the exact pre-fix behavior (net
figure filed alone at 2008), so no existing return's filed payload changes
unless the preparer opts in.

Regression tests: `apps/server/tests/t2-cif-gifi.test.ts` — the net-only case,
the gross-plus-2009 case, the unchanged-2599 case, and (unchanged from the
original fix) that `costOfSales` still files at `8518` not the old `8320`.

## Where this was fixed

- `apps/server/src/filing/t2-cif.service.ts` — the two code assignments.
- `apps/web/.../_config/schedules/t2/balance-sheet.ts` / `income-statement.ts` — the
  guided-editor field descriptions, to match.
- `apps/web/.../_config/schedules/t2/paper/balance-sheet-form-view.tsx` /
  `income-statement-form-view.tsx` — the new paper Form Views built alongside this fix.
