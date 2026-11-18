// S12 040/041 with and without an ACTA 8(2.2) amount that differs from fed 20(12). Credit kept positive.
import { renderAt1NetFile } from '../../../../ca-tax/src/t2/at1/filing/at1-netfile-renderer.ts';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const taxYearStart = new Date('2024-01-01');
const taxYearEnd = new Date('2024-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
const m = maximalReturn as any;
const row = (extra: Record<string, number>) => ({ ...m, albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedNonBusinessForeignTaxCredit: 2_000, ...extra }] } });
const pick = (c: any) => {
  const s12 = (c.schedulePayloads ?? []).find((p: any) => p.scheduleId === '012');
  const s4 = (c.schedulePayloads ?? []).find((p: any) => p.scheduleId === '004');
  const v = (p: any, f: string) => p?.values.find((x: any) => x.lineItemId.slice(3, 6) === f)?.value;
  return `S12 040=${v(s12, '040')} 041=${v(s12, '041')} | S4 006=${v(s4, '006')} 012=${v(s4, '012')}`;
};
console.log('no 8(2.2) amount       :', pick(compute(row({ fedIta2012Deduction: 1_000 }))));
console.log('8(2.2) 2,500 ≠ 20(12) 1,000:', pick(compute(row({ fedIta2012Deduction: 1_000, albertaActa82Deduction: 2_500 }))));
