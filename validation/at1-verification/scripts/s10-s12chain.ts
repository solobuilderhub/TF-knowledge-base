import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
const input = { identification: { corpType: 'ccpc', province: 'AB' }, albertaSchedule12: { federalNetIncomeForTax: -50_000 },
  albertaContinuity: { farmCurrentYearLoss: 8_000, nonCapitalCarrybacks: [{ amount: 20_000 }] } };
const a = assembleT2Input(input as never, { taxYearStart: new Date('2025-01-01'), taxYearEnd: new Date('2025-12-31'), program: 'AT1' } as never) as any;
const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
const r = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
const v = (s: string, l: string) => (r.schedulePayloads ?? []).find((x: any) => x.scheduleId === s)?.values.find((x: any) => x.lineItemId === `${s}${l}001`)?.value;
console.log('S12 002', v('012', '002'), '054', v('012', '054'), '| S21 001', v('021', '001'), '019', v('021', '019'), '021', v('021', '021'), '037', v('021', '037'), '| S10 002', v('010', '002'), '| jacket 062', r.fields.find((x: any) => x.line === 'albertaTaxableIncome')?.value);
