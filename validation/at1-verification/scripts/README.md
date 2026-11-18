# AT1 verification scripts

These scripts produced the evidence in the AT1 verification docs (`issue-*.md`, `testcase-*-ui.md`, `final-review-*.md`). Those docs are in `TestCases/AT1/verification/`, outside this repo. Re-run them after a fix: each fixed finding should change from `DIFF` to `OK`, and every row in a doc's "Verified correct" table should stay `OK`.

**Built against:** ca-tax 0.0.37, TaxFoundry-be `93fff0c`, TaxFoundry-fe `cda001e`.

## How to run

Run them **from `TaxFoundry-be`**, so that `@classytic/ca-tax` and `tsx` resolve from the BE's `node_modules`:

```powershell
cd <your checkout>\TaxFoundry-be
npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s13-verify.ts          # all scenarios
npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s13-verify.ts F        # one scenario, by label prefix
```

- The scripts import BE source and the BE's installed ca-tax by **relative path** (`../../../../TaxFoundry-be/...`, `../../../../ca-tax/...`). So `TF-knowledge-base`, `TaxFoundry-be` and `ca-tax` must be checked out side by side in the same folder.
- `s3-jacket-e2e.mts` is out of date: it imports a name that `ca-tax/dist/t2.mjs` no longer exports. Use `s3-jacket-e2e.ts` instead.
- A ca-tax fix must be **published and installed in the BE**, or linked with `npm run build` in `ca-tax` and then `npm i --no-save file:../ca-tax` in the BE. Otherwise the scripts still run the old engine. Check first with `(Get-Content node_modules\@classytic\ca-tax\package.json | ConvertFrom-Json).version`.

## Index

| Script | Doc | Scenario argument |
|---|---|---|
| `s12-verify.ts` | issue-schedule12 (checker, plus the maximal return) | `max` |
| `s12-variants.ts` | issue-schedule12 V1–V9 | `v1` … `v9`, `v1b` |
| `s12-variants2.ts` | issue-schedule12 V2b, V9, V10, Schedule 15 / 17 dump | `v2b`, `v9`, `v10`, `dump` |
| `s12-ui.ts` | testcase-schedule12-ui (BASE, T1a–T7) | `BASE`, `T1a`, … |
| `s12-pass2.ts` | issue-schedule12 second pass W1–W6 | `W1` … `W6`, `W1b`, `W4b`–`W4d` |
| `s13-verify.ts` | issue-schedule13 A–R (M–R = second pass) | `A` … `R`, `M2`–`M4` |
| `s13-lease-periods.ts` | issue-schedule13 finding 11 (Date vs ISO period count) | — |
| `s15-verify.ts` | issue-schedule15 P1–P14 (P9–P14 = second pass) | `P1` … `P14` |
| `s16-verify.ts` | issue-schedule16 U1–U8 | `U1` … `U8`, `U5b` |
| `s17-verify.ts` | issue-schedule17 X1–X8 | `X1` … `X8` |
| `s18-verify.ts` | issue-schedule18 Y1–Y10 | `Y1` … `Y10` |
| `s20-verify.ts` | issue-schedule20 D1–D8 | `D1` … `D8` |
| `s29-verify.ts` | issue-schedule29 G1–G10 | `G1` … `G10` |
| `jacket-verify.ts` | issue-jacket J1–J17 | `J1` … `J17`, `J6b` |
| `s21-verify.ts` | issue-schedule21 R1–R15 | `R1` … `R15`, `R4b`, `R7b`, `R9b`, `R10b` |
| `s21-nil-probe.ts` | issue-schedule15 re-verification: a nil Schedule 21 is filed when a Schedule 15 exists | — |
| `jacket-062-probe.ts` | final-review-2026-11-16 finding 0: jacket 062 when 060 = 061 = No | — |
| `tra-tc1-2026.ts` | TRA Fall 2026 Test Case 1 (TYE 2025-08-31, AIIP), as filed 2026-11-11 | `a` = the amended case |
| `tra-ieg-2026.ts` | TRA Fall 2026 Test Cases 2 / 3 (IEG), against IEG Guide Examples 3 / 4 | `tc2` / `tc3`, then `guide` for the guide's inputs |

**Testing a branch before release:** check out the branch in all three repos, run `npm install` (first time only) and `npm run build` in `ca-tax`, then `npm i --no-save file:../ca-tax` in the BE. Afterwards, check out `main` again and run `npm install` in the BE to go back to the published ca-tax. A DIFF that appears on both `main` and the branch is still open. Comparing the two runs only shows what changed, so also list every DIFF left on the branch.
| `s10-*.ts` | testcase-schedule10-ui | — |
| `s4-*.ts` | issue-schedule4-fitc, testcase-schedule4-ui | — |
| `s3-*.ts`, `s3aapitc.ts` | issue-schedule3-*, testcase-schedule3-ui | — |

`s12-variants*.ts` and `s12-ui.ts` import `./s12-verify.ts`, so keep them in the same folder.
