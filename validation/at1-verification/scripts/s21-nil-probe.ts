// Why is Schedule 21 filed on a profitable return with no losses? Dump it for a few inputs.
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };

function go(label: string, input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart: new Date('2024-01-01'), taxYearEnd: new Date('2024-12-31'), program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  const c = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '021');
  console.log(`\n== ${label}\nfiled: ${(c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ')}`);
  console.log('fed nonCap currentYearLoss', fed.losses?.nonCapital?.currentYearLoss, '| eifel', JSON.stringify(fed.eifelCapacity ?? null));
  if (p) console.log('021:', p.values.map((v: any) => `${v.lineItemId.slice(3, 6)}#${+v.lineItemId.slice(6)}=${v.value}`).join(' '));
}

go('A: AT1-only, 002 = 1,000,000, nothing else', { ...id, alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 1_000_000 } });
go('B: A + Schedule 15 CDE regular (fed opening 200,000)', { ...id, alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 1_000_000 }, albertaResourceDeductions15: { cdeRegular: { federalOpeningBalance: 200_000 } } });
go('C: A with jacket 060/061 = No', { ...id, alberta: { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' }, albertaSchedule12: { federalNetIncomeForTax: 1_000_000 } });
