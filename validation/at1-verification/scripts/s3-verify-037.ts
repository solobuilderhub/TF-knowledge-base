// ca-tax 0.0.37: re-run every Schedule 3 repro from issue-schedule3-itc.md / -aapitc-330-340.md.
import { assembleSchedule3 } from '../../../../TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from '../../../../ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';
import { vintageClosing } from '../../../../TaxFoundry-fe/app/dashboard/engagements/[id]/return/_config/schedules/at1/vintage-closing.ts';

// Report jacket: 068 76,000; 070 30,000; 071 5,000; 072 2,000; 074 1,000 → 602 = 38,000, APITC spec room 44,000.
const tight = { taxPayableBeforeDeduction: 76_000, line070: 30_000, line071: 5_000, line072: 2_000, line074: 1_000 };
const wide = { taxPayableBeforeDeduction: 500_000, line070: 0, line071: 0, line072: 0, line074: 0 };

const run = (label: string, mad: object, s3: object, lines: string[]) => {
  const credits = assembleSchedule3({ albertaOtherCredits3: s3 } as never);
  const r = computeSchedule3({ mad, ...credits } as never) as any;
  const vals = schedule3Values(r).values;
  const one = Object.fromEntries(vals.filter((x) => x.lineItemId.endsWith('001')).map((x) => [x.lineItemId.slice(3, 6), x.value]));
  const sections = [...new Set(vals.map((x) => x.lineItemId.slice(3, 4) + '00'))].join(',');
  console.log(`\n## ${label}`);
  console.log('  ', lines.map((l) => `${l}=${one[l]}`).join(' '), `| sections filed: ${sections}`);
  for (const i of r.issues ?? []) console.log('   issue:', i);
  return { r, vals };
};
const tableOf = (vals: any[], from: string, to: string) => {
  const byOcc: Record<string, string[]> = {};
  for (const x of vals) {
    const l = x.lineItemId.slice(3, 6);
    if (l < from || l > to) continue;
    (byOcc[x.lineItemId.slice(6)] ??= []).push(`${l}=${x.value}`);
  }
  for (const [n, f] of Object.entries(byOcc)) console.log(`   row ${n}: ${f.join(' ')}`);
};

// ITC item 1 — default claim with expired
run('ITC-1 100=20k 102=10k 106=5k, 104 blank (expect 104 25,000, 108 0)', tight,
  { itcCertificatesIssued: 20_000, itcCarryforwardFromPriorYear: 10_000, itcExpired: 5_000 }, ['100', '102', '104', '106', '108', '600', '602', '604']);
// ITC item 2 — typed 104 over room
run('ITC-2 typed 104=60k, room 38k (expect 38,000 + issue)', tight,
  { itcCertificatesIssued: 100_000, itcAmountApplied: 60_000 }, ['104', '108']);
// ITC item 4 — table drives 104/106 and is filed
const t = run('ITC-4 table: occ0 recv 10k; occ1 open 8k applied 3k; occ4 open 2k expired 2k', wide,
  { vintages: { investorTaxCredit: [
    { yearIndex: 0, taxYearEnd: '2025-12-31', received: 10_000 },
    { yearIndex: 1, taxYearEnd: '2024-12-31', openingBalance: 8_000, applied: 3_000 },
    { yearIndex: 4, taxYearEnd: '2021-12-31', openingBalance: 2_000, expired: 2_000 },
  ] } }, ['100', '102', '104', '106', '108']);
tableOf(t.vals, '120', '130');
// ITC table validation: 126 > 124+125, expiry on occ 1
run('ITC-4b table: applied 9k > opening 5k; expired on occ 1', wide,
  { vintages: { investorTaxCredit: [{ yearIndex: 1, taxYearEnd: '2024-12-31', openingBalance: 5_000, applied: 9_000, expired: 1_000 }] } }, ['104', '106', '108']);

// CITC — same bug as ITC-1
run('CITC 200=20k 202=10k 206=5k, 204 blank (expect 204 25,000, 208 0)', tight,
  { citcCertificatesIssued: 20_000, citcCarryforwardFromPriorYear: 10_000, citcExpired: 5_000 }, ['200', '202', '204', '206', '208']);
// CITC knock-on: ITC 10k with 5k expired
run('CITC knock-on: ITC 100=10k 106=5k; CITC 200=20k (108 must not be negative)', tight,
  { itcCertificatesIssued: 10_000, itcExpired: 5_000, citcCertificatesIssued: 20_000 }, ['104', '108', '204', '208']);

// APITC A-1 — caps on 334 (wide room)
const apitcTable = [
  { yearIndex: 0, taxYearEnd: '2025-12-31', received: 50_000, applied: 10_000 },
  { yearIndex: 1, taxYearEnd: '2024-12-31', received: 100_000, openingBalance: 70_000, applied: 30_000 },
  { yearIndex: 2, taxYearEnd: '2023-12-31', received: 100_000, openingBalance: 80_000, applied: 50_000 },
  { yearIndex: 10, taxYearEnd: '2015-12-31', received: 20_000, openingBalance: 6_000, applied: 1_000, expired: 5_000 },
];
const a = run('APITC table (expect 300 50k 304 10k 306 30k 308 50k 310 1k 312 91k 314 5k 316 110k... 302 = Σ335 156k)', wide,
  { vintages: { agriProcessingTaxCredit: apitcTable } }, ['300', '302', '304', '306', '308', '310', '312', '314', '316']);
tableOf(a.vals, '330', '340');
for (const row of apitcTable) console.log(`   FE 340 occ ${row.yearIndex}: ${vintageClosing(row, true)}`);
// A-1 default claim (no applied typed): occ2 receipt 100k, 80k left → cap 50k
run('APITC A-1 default: occ2 334=100k 335=80k, nothing applied (expect 308 50,000)', wide,
  { vintages: { agriProcessingTaxCredit: [{ yearIndex: 2, taxYearEnd: '2023-12-31', received: 100_000, openingBalance: 80_000 }] } }, ['308', '312', '316']);
// A-2 — room vs 602
run('APITC A-2: occ2 334=100k 335=80k, tight jacket (602 38k)', tight,
  { vintages: { agriProcessingTaxCredit: [{ yearIndex: 2, taxYearEnd: '2023-12-31', received: 100_000, openingBalance: 80_000 }] } }, ['308', '312', '316', '600', '602', '604']);
run('APITC A-2: ITC 20k + occ5 60k left, tight jacket', tight,
  { itcCertificatesIssued: 20_000, vintages: { agriProcessingTaxCredit: [{ yearIndex: 5, taxYearEnd: '2020-12-31', openingBalance: 60_000 }] } }, ['104', '310', '312', '316', '600', '602', '604']);
// A-3 — aggregate path, expired = whole 3rd–10th balance
run('APITC A-3 aggregate: 3rd-10th 10k, 314 typed 10k (expect 310 0, 316 0)', tight,
  { apitcThirdToTenthAvailable: 10_000, apitcExpired: 10_000 }, ['302', '310', '312', '314', '316']);
// A-3 — table path, occ 10 nothing applied
const a3 = run('APITC A-3 table: occ10 335=10k, nothing applied', tight,
  { vintages: { agriProcessingTaxCredit: [{ yearIndex: 10, taxYearEnd: '2015-12-31', openingBalance: 10_000 }] } }, ['302', '310', '312', '314', '316']);
tableOf(a3.vals, '330', '340');
