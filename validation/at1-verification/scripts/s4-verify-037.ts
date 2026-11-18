// ca-tax 0.0.37: Schedule 4 display channel, nil-not-filed, AuraTax inputs, 006 → S12 side effect.
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';
import { computeSchedule4 } from '../../../../ca-tax/src/t2/at1/schedules/schedule4-foreign-investment-tax-credit.ts';

const taxYearStart = new Date('2024-01-01');
const taxYearEnd = new Date('2024-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
const s = (c: any, id: string) => (c.schedulePayloads ?? []).find((p: any) => p.scheduleId === id);
const m = maximalReturn as any;

// 1. Display channel (C/D/G per row, 014/018/020)
const c1 = compute(m);
console.log('S4 display:', s(c1, '004')?.display?.map((v: any) => `${v.lineItemId.slice(3, 9)}=${v.value}`).join(' '));

// 2. Nil credit → form not filed. Federal credit larger than tax paid → G negative → 012 = 0.
const nil = { ...m, albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 2_000, fedNonBusinessForeignTaxCredit: 5_000 }] } };
const c2 = compute(nil);
console.log('nil case: S4 filed?', !!s(c2, '004'), '| jacket 072 field', c2.fields.find((f: any) => f.line === 'foreignInvestmentTaxCredit')?.value);

// 3. 8(2.2) differs from 20(12) → S12 040/041/048
const acta = { ...m, alberta: { ...(m.alberta ?? {}), reportsDifferentAlbertaIncome: 'yes', electsDifferentDiscretionaryAmounts: 'yes' },
  albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 7_500, fedIta2012Deduction: 1_000, albertaActa82Deduction: 2_500, fedNonBusinessForeignTaxCredit: 5_000 }] } };
const c3 = compute(acta);
const s12 = s(c3, '012');
console.log('S12 040/041/048:', (s12?.values ?? []).filter((v: any) => ['040', '041', '048'].includes(v.lineItemId.slice(3, 6))).map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' | '));
console.log('S4 006 with 8(2.2) 2,500 vs 20(12) 1,000:', s(c3, '004')?.values.find((v: any) => v.lineItemId.startsWith('004006'))?.value, '(expect 7,500 − 2,500 = 5,000)');

// 4. AuraTax inputs on 0.0.37 computeSchedule4
const r = computeSchedule4({ countries: [{ country: 'US', netForeignInvestmentIncome: 100_000, fedForeignTaxPaid: 8_000, fedIta2012Deduction: 2_000, albertaActa82Deduction: 3_000, fedNonBusinessForeignTaxCredit: 10_000 }],
  albertaTaxableIncome: 400_000, royaltyTaxDeduction: 0, allocationFactor: 0.625, basicAlbertaTax: 20_000, creditRoom: 14_062 });
const c = r.countries[0];
console.log('AuraTax case: C', r.allocationFactor, 'D', c.incomeProrationAmount, 'G', c.taxPaidLessFederalCredit, 'H', c.allowableCredit, '014', r.totalAllowableCredit, '018', r.creditRoomLine018, '020', r.jacketCreditLine020);
