// Feed a fully-entered AAPITC table (lines 330-340) through the real backend composer and the engine,
// and show which of the table's figures reach the filed Schedule 3.
import { assembleSchedule3 } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';

// Jacket: 068 200,000; 070 30,000 → room is not the constraint here.
const mad = { taxPayableBeforeDeduction: 200_000, line070: 30_000, line071: 0, line072: 0, line074: 0 };

const table = [
  // occ 0 — current year: received 50,000 (334); applied 10,000 (336) = 20% cap exactly
  { yearIndex: 0, taxYearEnd: '2025-12-31', received: 50_000, applied: 10_000 },
  // occ 1 — received 100,000 (334), 70,000 left (335); applied 30,000 (336) = 30% x 334
  { yearIndex: 1, taxYearEnd: '2024-12-31', received: 100_000, openingBalance: 70_000, applied: 30_000 },
  // occ 2 — received 100,000 (334), 80,000 left (335); applied 50,000 (336) = 50% x 334
  { yearIndex: 2, taxYearEnd: '2023-12-31', received: 100_000, openingBalance: 80_000, applied: 50_000 },
  // occ 10 — 6,000 left, 1,000 applied, so 338 should be 5,000 (= 335 - 336)
  { yearIndex: 10, taxYearEnd: '2015-12-31', received: 20_000, openingBalance: 6_000, applied: 1_000, expired: 5_000 },
];

const credits = assembleSchedule3({ albertaOtherCredits3: { vintages: { agriProcessingTaxCredit: table } } } as never);
console.log('composer → engine input:', JSON.stringify(credits?.apitc));
const r = computeSchedule3({ mad, ...credits } as never);
const filed = schedule3Values(r).values.map((v) => v.lineItemId.slice(3, 6));
const v = Object.fromEntries(schedule3Values(r).values.map((x) => [x.lineItemId.slice(3, 6), x.value]));
console.log('filed 300-316:', JSON.stringify(Object.fromEntries(['300', '302', '304', '306', '308', '310', '312', '314', '316'].map((k) => [k, v[k]]))));
console.log('any 330-340 filed?', filed.filter((f) => f >= '330' && f <= '340'));
console.log('issues:', r.issues);

// What the table says the spec values should be
console.log('table expects: 304=10,000 306=30,000 308=50,000 310=1,000 312=91,000 314=5,000');
// On-screen 340, as alberta-credit-vintage-tables.tsx computes it (closingOf)
const closingOf = (r: any) => (r.openingBalance ?? 0) + (r.received ?? 0) - (r.applied ?? 0) - (r.expired ?? 0);
const spec340 = (r: any) => (r.yearIndex === 0 ? (r.received ?? 0) - (r.applied ?? 0) : (r.openingBalance ?? 0) - (r.applied ?? 0) - (r.expired ?? 0));
for (const row of table) console.log(`occ ${row.yearIndex}: UI 340 = ${closingOf(row)}  spec 340 = ${spec340(row)}`);
