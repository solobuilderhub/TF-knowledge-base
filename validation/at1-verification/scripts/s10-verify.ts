// AT1 Schedule 10 vs §3.2.3.11 — full chain, filed payload + Schedule 21 sources.
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
const taxYearStart = new Date('2024-01-01'), taxYearEnd = new Date('2024-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
// Loss year: revenue 100,000, expenses 150,000 → non-capital loss 50,000.
const base = { identification: { corpType: 'ccpc', province: 'AB' }, incomeStatement: { revenue: 100_000, otherExpenses: 150_000 } };
const show = (label: string, cont: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
  try {
    const c = compute({ ...base, ...extra, albertaContinuity: cont });
    const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '010');
    const s21 = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '021');
    const v21 = (l: string) => s21?.values.find((x: any) => x.lineItemId === `021${l}001`)?.value;
    console.log(`\n## ${label}`);
    console.log('   S10:', p ? p.values.map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' ') : 'NOT filed');
    console.log(`   S21 037=${v21('037')} 057=${v21('057')} 077=${v21('077')} 097=${v21('097')} 117=${v21('117')}`);
    for (const i of (c.issues ?? []).filter((m: string) => /Schedule 10|carry/i.test(m))) console.log('   issue:', i);
  } catch (e) { console.log(`\n## ${label}\n   THREW: ${(e as Error).message}`); }
};
show('T1 non-capital: 20,000 → 1st, 10,000 → 2nd', { nonCapitalCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 20_000 }, { taxYearEnd: '2022-12-31', amount: 10_000 }] });
show('T2 non-capital: only 2nd preceding 5,000 (1st blank), no dates', { nonCapitalCarrybacks: [{}, { amount: 5_000 }] });
show('T3 non-capital: 60,000 > loss 50,000', { nonCapitalCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 60_000 }] });
show('T4 farm: loss 8,000, 3,000 → 1st', { farmCurrentYearLoss: 8_000, farmCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 3_000 }] });
show('T5 other: RF 2,000 + LPP 1,000 both boxes, 1,500 → 1st', { otherLossIncludesRestrictedFarm: 'yes', otherLossIncludesListedPersonal: 'yes', restrictedFarmCurrentYearLoss: 2_000, lppCurrentYearLoss: 1_000, otherLossCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 1_500 }] });
show('T6 other: LPP only box, LPP 1,000, 400 → 3rd', { otherLossIncludesListedPersonal: 'yes', lppCurrentYearLoss: 1_000, otherLossCarrybacks: [{}, {}, { amount: 400 }] });
show('T7 other: rows but NO box ticked', { restrictedFarmCurrentYearLoss: 2_000, otherLossCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 500 }] });
show('T8 capital: loss 10,000, 4,000 → 1st', { capitalCurrentYearLoss: 10_000, capitalCarrybacks: [{ taxYearEnd: '2023-12-31', amount: 4_000 }] });
show('T9 4 rows', { nonCapitalCarrybacks: [{ amount: 1 }, { amount: 1 }, { amount: 1 }, { amount: 1 }] });
show('T10 profit year (no loss), non-capital row 1,000', { nonCapitalCarrybacks: [{ amount: 1_000 }] }, { incomeStatement: { revenue: 200_000, otherExpenses: 100_000 } });
show('T11 all four columns', { nonCapitalCarrybacks: [{ amount: 10_000 }], farmCurrentYearLoss: 5_000, farmCarrybacks: [{}, { amount: 2_000 }], capitalCurrentYearLoss: 6_000, capitalCarrybacks: [{}, {}, { amount: 6_000 }], otherLossIncludesRestrictedFarm: 'yes', restrictedFarmCurrentYearLoss: 1_000, otherLossCarrybacks: [{ amount: 1_000 }] });
