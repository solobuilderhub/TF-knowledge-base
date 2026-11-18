import { assembleSchedule3 } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';
const rows = [
  { yearIndex: 0, taxYearEnd: '2025-12-31', received: 300, applied: 300 },
  { yearIndex: 1, taxYearEnd: '2024-12-31', received: 100, openingBalance: 200, applied: 300 },
  { yearIndex: 2, taxYearEnd: '2023-12-31', received: 300, openingBalance: 400, applied: 500 },
];
const r = computeSchedule3({ mad: { taxPayableBeforeDeduction: 500000, line070: 0, line071: 0, line072: 0, line074: 0 },
  ...assembleSchedule3({ albertaOtherCredits3: { vintages: { agriProcessingTaxCredit: rows } } } as never) } as never) as any;
const vals = schedule3Values(r).values;
console.log('page 1:', vals.filter((v) => v.lineItemId.slice(3, 4) === '3' && v.lineItemId.slice(3, 6) <= '316').map((v) => v.lineItemId.slice(3, 6) + '=' + v.value).join(' '));
console.log('336 filed per row:', vals.filter((v) => v.lineItemId.startsWith('003336')).map((v) => v.value).join(' / '));
console.log('340 filed per row:', vals.filter((v) => v.lineItemId.startsWith('003340')).map((v) => v.value).join(' / '));
for (const i of r.issues) console.log('issue:', i);
