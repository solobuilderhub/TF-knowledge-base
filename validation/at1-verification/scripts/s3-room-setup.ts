// Which AT1 inputs give Schedule 3 line 602 = 18,000? Full chain, 2024 tax year.
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
const taxYearStart = new Date('2024-01-01'), taxYearEnd = new Date('2024-12-31');
function compute(input: Record<string, unknown>) {
  const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
  return runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
}
const s3 = { vintages: {
  investorTaxCredit: [
    { yearIndex: 0, taxYearEnd: '2024-12-31', received: 2000, applied: 2000 },
    { yearIndex: 1, taxYearEnd: '2023-12-31', openingBalance: 3000, applied: 3000 },
    { yearIndex: 4, taxYearEnd: '2020-12-31', openingBalance: 1000, expired: 1000 }],
  capitalInvestmentTaxCredit: [
    { yearIndex: 0, taxYearEnd: '2024-12-31', received: 4000, applied: 1000 },
    { yearIndex: 2, taxYearEnd: '2022-12-31', openingBalance: 2000, applied: 2000 },
    { yearIndex: 10, taxYearEnd: '2014-12-31', openingBalance: 500, expired: 500 }],
  agriProcessingTaxCredit: [
    { yearIndex: 0, taxYearEnd: '2024-12-31', received: 10000, applied: 1000 },
    { yearIndex: 1, taxYearEnd: '2023-12-31', received: 10000, openingBalance: 7000, applied: 3000 },
    { yearIndex: 2, taxYearEnd: '2022-12-31', received: 10000, openingBalance: 6000, applied: 4000 },
    { yearIndex: 10, taxYearEnd: '2014-12-31', received: 5000, openingBalance: 1500, applied: 500, expired: 1000 }] } };
const show = (label: string, input: Record<string, unknown>) => {
  try {
    const c = compute(input);
    const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
    const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '003');
    const v = (l: string) => p?.values.find((x: any) => x.lineItemId === `003${l}001`)?.value;
    console.log(`\n## ${label}\n   062 ${fld('albertaTaxableIncome')} 065 ${fld('allocationFactor')} 068 ${fld('basicAlbertaTax')} 070 ${fld('albertaSmallBusinessDeduction')} 076 ${fld('otherDeductions')} 080 ${fld('albertaTaxPayable')}`);
    console.log(`   S3 104 ${v('104')} 204 ${v('204')} 312 ${v('312')} 316 ${v('316')} 600 ${v('600')} 602 ${v('602')} 604 ${v('604')}`);
    for (const i of (c.issues ?? []).filter((m: string) => /Schedule 3/.test(m))) console.log('   issue:', i);
  } catch (e) { console.log(`\n## ${label}\n   THREW: ${(e as Error).message}`); }
};
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
show('A. T2 income statement: revenue 1,000,000, cost of sales 400,000; SBD ABI 600,000, taxable capital 1,000,000',
  { ...id, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 }, sbd: { activeBusinessIncome: 600_000, taxableCapital: 1_000_000 }, albertaOtherCredits3: s3 });
show('B. Same, no SBD section filled', { ...id, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 }, albertaOtherCredits3: s3 });
show('C. Override only: AT1 line 062 = 600,000, nothing on T2', { ...id, alberta: { albertaTaxableIncome: 600_000 }, albertaOtherCredits3: s3 });
show('D. Override 062 = 225,000, nothing on T2', { ...id, alberta: { albertaTaxableIncome: 225_000 }, albertaOtherCredits3: s3 });
