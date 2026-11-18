// UI test case for Schedule 10, 2025 tax year (preceding years 2024/2023/2022), full chain.
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
const taxYearStart = new Date('2025-01-01'), taxYearEnd = new Date('2025-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
const base = { identification: { corpType: 'ccpc', province: 'AB' }, incomeStatement: { revenue: 100_000, otherExpenses: 150_000 } };
const cont = {
  farmCurrentYearLoss: 8_000,
  restrictedFarmCurrentYearLoss: 2_000,
  lppCurrentYearLoss: 1_000,
  otherLossIncludesRestrictedFarm: 'yes',
  otherLossIncludesListedPersonal: 'yes',
  capitalCurrentYearLoss: 10_000,
  nonCapitalCarrybacks: [{ amount: 20_000 }, { amount: 10_000 }],
  farmCarrybacks: [{}, { amount: 3_000 }],
  otherLossCarrybacks: [{ amount: 1_500 }],
  capitalCarrybacks: [{}, {}, { amount: 4_000 }],
};
const show = (label: string, c: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
  try {
    const r = compute({ ...base, ...extra, albertaContinuity: c });
    const p = (r.schedulePayloads ?? []).find((x: any) => x.scheduleId === '010');
    const s21 = (r.schedulePayloads ?? []).find((x: any) => x.scheduleId === '021');
    const v21 = (l: string) => s21?.values.find((x: any) => x.lineItemId === `021${l}001`)?.value;
    console.log(`\n## ${label}`);
    console.log('   S10:', p ? p.values.map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' ') : 'NOT filed');
    console.log(`   S21 019=${v21('019')} 021=${v21('021')} 037=${v21('037')} 057=${v21('057')} 077=${v21('077')} 097=${v21('097')} 117=${v21('117')}`);
    for (const i of (r.issues ?? []).filter((m: string) => /Schedule 10|carry|loss/i.test(m))) console.log('   issue:', i);
  } catch (e) { console.log(`\n## ${label}\n   REFUSED: ${(e as Error).message}`); }
};
show('FULL PATH: S12 line 002 = -50,000, no income statement, 037 blank', cont, { incomeStatement: {}, albertaSchedule12: { federalNetIncomeForTax: -50_000 } });
show('FULL PATH N6: S12 line 002 = +50,000 (profit)', cont, { incomeStatement: {}, albertaSchedule12: { federalNetIncomeForTax: 50_000 } });
