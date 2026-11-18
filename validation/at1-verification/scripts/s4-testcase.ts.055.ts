// UI test case for Schedule 4 on the Route 2 return (revenue 1,000,000, cost of sales 400,000 → 062 600,000, 068 48,000, 070 30,000).
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
const taxYearStart = new Date('2024-01-01'), taxYearEnd = new Date('2024-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
const base = { identification: { corpType: 'ccpc', province: 'AB' }, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 }, foreign: { foreignNonBusinessIncome: 50_000, foreignNonBusinessTaxPaid: 9_000 } };
const show = (label: string, countries: object[], extra: Record<string, unknown> = {}) => {
  try {
    const c = compute({ ...base, ...extra, albertaForeignInvestment4: { countries } });
    const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
    const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '004');
    console.log(`\n## ${label}\n   jacket 062 ${fld('albertaTaxableIncome')} 065 ${fld('allocationFactor')} 068 ${fld('basicAlbertaTax')} 070 ${fld('albertaSmallBusinessDeduction')} 072 ${fld('foreignInvestmentTaxCredit')} 080 ${fld('albertaTaxPayable')}`);
    if (!p) console.log('   Schedule 4 NOT filed');
    else {
      console.log('   values :', p.values.map((v: any) => `${v.lineItemId.slice(3, 6)}#${+v.lineItemId.slice(6)}=${v.value}`).join(' '));
      console.log('   display:', (p.display ?? []).map((v: any) => `${v.lineItemId.slice(3, 6)}#${+v.lineItemId.slice(6)}=${v.value}`).join(' '));
    }
    for (const i of (c.issues ?? []).filter((m: string) => /Schedule 4|Schedule 21|foreign/i.test(m))) console.log('   issue:', i);
    const s12 = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '012');
    if (s12) console.log('   S12 040/041:', s12.values.filter((v: any) => ['040', '041'].includes(v.lineItemId.slice(3, 6))).map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' '));
  } catch (e) { console.log(`\n## ${label}\n   THREW: ${(e as Error).message}`); }
};
const us = { country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedIta2012Deduction: 1_000, fedNonBusinessForeignTaxCredit: 5_000 };
const uk = { country: 'GB', netForeignInvestmentIncome: 10_000, fedForeignTaxPaid: 3_000, fedIta2012Deduction: 0, fedNonBusinessForeignTaxCredit: 500 };
show('C 0.55 (AB 550k/110k, ON 450k/90k)', [us], { provincialAllocation: { establishments: [{ province: 'AB', grossRevenue: 550_000, salariesWages: 110_000 }, { province: 'ON', grossRevenue: 450_000, salariesWages: 90_000 }] } });
show('C 0.55, no S21 tax paid (AuraTax inputs: 120 blank, 8(2.2) 1,000)', [{ ...us, fedForeignTaxPaid: 0, fedIta2012Deduction: 0, albertaActa82Deduction: 1_000 }], { foreign: { foreignNonBusinessIncome: 50_000 }, provincialAllocation: { establishments: [{ province: 'AB', grossRevenue: 550_000, salariesWages: 110_000 }, { province: 'ON', grossRevenue: 450_000, salariesWages: 90_000 }] } });
