// Jacket 062 when 060 = 061 = No (re-verification 2026-11-15). Spec 3-27: 062 = "(fed 004110 + fed 004310) x (-1)
// if it exists, otherwise fed 200360 - fed 200370", i.e. FEDERAL TAXABLE income, not net income.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\jacket-062-probe.ts
import { run } from './s12-verify.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const no = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };

const cases: [string, Record<string, unknown>][] = [
  ['P1 T2 only, no deductions', { ...t2 }],
  ['P2 T2 donations 40,000 (no Alberta entries)', { ...t2, donations: { charitable: 40_000 } }],
  ['P3 T2 non-capital loss carried forward 100,000 applied', { ...t2, losses: { nonCapitalOpening: 100_000 } }],
];
for (const [label, input] of cases) {
  const r = run(label, { ...id, alberta: no, ...input }, { render: true });
  if (!r) continue;
  const fed = (r as any).fed ?? {};
  console.log(`  >> jacket 062 = ${(r as any).J?.get?.('062') ?? '(see RENDERED line above)'}`);
}
