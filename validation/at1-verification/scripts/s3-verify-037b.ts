// ca-tax 0.0.37: Schedule 3 validations + prior-year roll-forward.
import { assembleSchedule3 } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-schedule-composers/schedule-3-compose.ts';
import { applyPriorAlbertaCredits, priorCreditsFrom } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/prior-year-openings.service.ts';
import { computeSchedule3, schedule3Values } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/schedules/schedule3-other-deductions-credits.ts';

const wide = { taxPayableBeforeDeduction: 500_000, line070: 0, line071: 0, line072: 0, line074: 0 };
const run = (label: string, s3: object, lines: string[]) => {
  const r = computeSchedule3({ mad: wide, ...assembleSchedule3({ albertaOtherCredits3: s3 } as never) } as never) as any;
  const vals = schedule3Values(r).values;
  const one = Object.fromEntries(vals.filter((x) => x.lineItemId.endsWith('001')).map((x) => [x.lineItemId.slice(3, 6), x.value]));
  console.log(`\n## ${label}\n  `, lines.map((l) => `${l}=${one[l]}`).join(' '));
  for (const i of r.issues ?? []) console.log('   issue:', i);
  return vals;
};
const apitc = (rows: object[]) => ({ vintages: { agriProcessingTaxCredit: rows } });

run('336 typed above 30% cap: occ1 334=100k 335=70k applied 40k', apitc([{ yearIndex: 1, taxYearEnd: '2024-12-31', received: 100_000, openingBalance: 70_000, applied: 40_000 }]), ['306', '316']);
run('335 > 334: occ1 334=50k 335=70k', apitc([{ yearIndex: 1, taxYearEnd: '2024-12-31', received: 50_000, openingBalance: 70_000 }]), ['306', '316']);
const v = run('332 missing: occ1 334=100k 335=70k no date', apitc([{ yearIndex: 1, received: 100_000, openingBalance: 70_000 }]), ['306']);
console.log('   332 filed on that row?', v.some((x) => x.lineItemId.startsWith('003332')));
run('338 on occ 5', apitc([{ yearIndex: 5, taxYearEnd: '2020-12-31', received: 10_000, openingBalance: 10_000, expired: 2_000 }]), ['310', '314', '316']);
run('228 on occ 3', { vintages: { capitalInvestmentTaxCredit: [{ yearIndex: 3, taxYearEnd: '2022-12-31', openingBalance: 10_000, expired: 2_000 }] } }, ['206', '208']);
run('APITC occ 3 without 334 (filed as 0?)', apitc([{ yearIndex: 3, taxYearEnd: '2022-12-31', openingBalance: 10_000 }]), ['310']);

// Prior-year roll: last year's filed Schedule 3 → this year's openings
const li = (line: string, n: number, value: unknown) => ({ lineItemId: `003${line}${String(n).padStart(3, '0')}`, value });
const lastYear = [
  li('108', 1, 15_000), li('208', 1, 4_000), li('316', 1, 40_000),
  li('120', 1, 0), li('122', 1, '20241231'), li('130', 1, 10_000),
  li('330', 1, 0), li('332', 1, '20241231'), li('334', 1, 50_000), li('340', 1, 40_000),
];
const prior = priorCreditsFrom(lastYear);
console.log('\n## prior read:', JSON.stringify(prior));
const blank = applyPriorAlbertaCredits({ albertaOtherCredits3: {} }, prior);
console.log('   blank input →', JSON.stringify(blank.returnInput.albertaOtherCredits3), blank.issues);
const typed = applyPriorAlbertaCredits({ albertaOtherCredits3: { itcCarryforwardFromPriorYear: 9_000, apitcFirstAvailable: 30_000 } }, prior);
console.log('   typed 102=9k →', typed.issues);
run('rolled APITC occ1 (prior 334 = 50k, 340 = 40k): 30% cap should be 15,000', blank.returnInput.albertaOtherCredits3 as object, ['102', '202', '302', '306', '316']);
const noApitcTable = applyPriorAlbertaCredits({ albertaOtherCredits3: {} }, { ...prior, apitcRows: [] });
console.log('\n## prior 316 = 40k, no prior APITC table rows →', JSON.stringify(noApitcTable.returnInput.albertaOtherCredits3));
