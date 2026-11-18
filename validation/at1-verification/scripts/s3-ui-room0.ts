import { assembleSchedule3 } from '../../../../TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from '../../../../ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';
const rows = [
  { yearIndex: 0, taxYearEnd: '2025-12-31', received: 300, applied: 300 },
  { yearIndex: 1, taxYearEnd: '2024-12-31', received: 100, openingBalance: 200, applied: 300 },
  { yearIndex: 2, taxYearEnd: '2023-12-31', received: 300, openingBalance: 400, applied: 500 },
];
// 068 fully absorbed by the small business deduction (070) → room 0
const r = computeSchedule3({ mad: { taxPayableBeforeDeduction: 5000, line070: 5000, line071: 0, line072: 0, line074: 0 },
  ...assembleSchedule3({ albertaOtherCredits3: { vintages: { agriProcessingTaxCredit: rows } } } as never) } as never) as any;
const v = schedule3Values(r).values.filter((x) => x.lineItemId.endsWith('001'));
console.log(v.filter((x) => ['300','302','304','306','308','310','312','314','316','600','602','604'].includes(x.lineItemId.slice(3, 6))).map((x) => x.lineItemId.slice(3, 6) + '=' + x.value).join(' '));
for (const i of r.issues) console.log('issue:', i);
