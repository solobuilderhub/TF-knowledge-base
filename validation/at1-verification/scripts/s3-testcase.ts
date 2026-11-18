// UI test case for Schedule 3: baseline (no issues) + one-change-at-a-time negative cases. Room: 068 48,000, 070 30,000 → 602 18,000.
import { assembleSchedule3 } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';
const mad = { taxPayableBeforeDeduction: 48_000, line070: 30_000, line071: 0, line072: 0, line074: 0 };
const itc = [
  { yearIndex: 0, taxYearEnd: '2024-12-31', received: 2_000, applied: 2_000 },
  { yearIndex: 1, taxYearEnd: '2023-12-31', openingBalance: 3_000, applied: 3_000 },
  { yearIndex: 4, taxYearEnd: '2020-12-31', openingBalance: 1_000, expired: 1_000 },
];
const citc = [
  { yearIndex: 0, taxYearEnd: '2024-12-31', received: 4_000, applied: 1_000 },
  { yearIndex: 2, taxYearEnd: '2022-12-31', openingBalance: 2_000, applied: 2_000 },
  { yearIndex: 10, taxYearEnd: '2014-12-31', openingBalance: 500, expired: 500 },
];
const apitc = [
  { yearIndex: 0, taxYearEnd: '2024-12-31', received: 10_000, applied: 1_000 },
  { yearIndex: 1, taxYearEnd: '2023-12-31', received: 10_000, openingBalance: 7_000, applied: 3_000 },
  { yearIndex: 2, taxYearEnd: '2022-12-31', received: 10_000, openingBalance: 6_000, applied: 4_000 },
  { yearIndex: 10, taxYearEnd: '2014-12-31', received: 5_000, openingBalance: 1_500, applied: 500, expired: 1_000 },
];
const L = ['100','102','104','106','108','200','202','204','206','208','300','302','304','306','308','310','312','314','316','600','602','604'];
const run = (label: string, s3: any, show = L, table = false) => {
  const r = computeSchedule3({ mad, ...assembleSchedule3({ albertaOtherCredits3: s3 } as never) } as never) as any;
  const vals = schedule3Values(r).values;
  const one = Object.fromEntries(vals.filter((x) => x.lineItemId.endsWith('001')).map((x) => [x.lineItemId.slice(3, 6), x.value]));
  console.log(`\n## ${label}\n  ` + show.map((l) => `${l}=${one[l]}`).join(' '));
  if (table) for (const [a, b] of [['120','130'],['220','230'],['330','340']]) {
    const by: Record<string, string[]> = {};
    for (const x of vals) { const l = x.lineItemId.slice(3, 6); if (l >= a && l <= b) (by[x.lineItemId.slice(6)] ??= []).push(`${l}=${x.value}`); }
    for (const [n, f] of Object.entries(by)) console.log(`   ${a} row ${n}: ${f.join(' ')}`);
  }
  for (const i of r.issues) console.log('   issue:', i);
};
const base = { vintages: { investorTaxCredit: itc, capitalInvestmentTaxCredit: citc, agriProcessingTaxCredit: apitc } };
const swap = (k: string, i: number, patch: object) => ({ vintages: { ...base.vintages, [k]: (base.vintages as any)[k].map((r: any, j: number) => j === i ? { ...r, ...patch } : r) } });
run('BASELINE', base, L, true);
run('N10 occ10 338 typed 800 (should be 1,000)', swap('agriProcessingTaxCredit', 3, { expired: 800 }), ['310','314','316']);

