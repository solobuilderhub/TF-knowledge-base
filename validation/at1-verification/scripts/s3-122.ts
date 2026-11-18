import { assembleSchedule3 } from '../../../../TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { computeSchedule3, schedule3Values } from '../../../../ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';
const r = computeSchedule3({ mad: { taxPayableBeforeDeduction: 500000, line070: 0, line071: 0, line072: 0, line074: 0 },
  ...assembleSchedule3({ albertaOtherCredits3: { vintages: { investorTaxCredit: [{ yearIndex: 1, openingBalance: 8000, applied: 3000 }] } } } as never) } as never) as any;
console.log(schedule3Values(r).values.filter((v) => v.lineItemId.slice(3, 6) >= '120' && v.lineItemId.slice(3, 6) <= '130').map((v) => v.lineItemId.slice(3, 6) + '=' + v.value).join(' '), '| issues:', r.issues);
