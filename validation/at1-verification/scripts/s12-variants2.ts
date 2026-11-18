import { run } from './s12-verify.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const jacketYes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const which = process.argv[2];

if (!which || which === 'dump') {
  const r = run('DUMP maximal S15 / S17', m)!;
  for (const s of ['015', '017']) {
    const p = r.c.schedulePayloads.find((x: any) => x.scheduleId === s);
    console.log(s, p.values.map((v: any) => `${v.lineItemId.slice(3, 6)}#${+v.lineItemId.slice(6)}=${v.value}`).join(' '));
  }
}
if (!which || which === 'v9') run('V9 090 floor: 002 = 10,000, 061 = 30,000, 083 = 900', {
  ...id, alberta: jacketYes, albertaSchedule12: { federalNetIncomeForTax: 10_000, taxableDividendsDeductible: 30_000, section110_5Additions: 900 },
}, { render: true });
if (!which || which === 'v2b') {
  const us = { ...m.albertaForeignInvestment4.countries[0], fedIta2012Deduction: 1_000, albertaActa82Deduction: 2_500 };
  run('V2b maximal + Schedule 4 ACTA 8(2.2) 2,500 vs 20(12) 1,000', { ...m, albertaForeignInvestment4: { countries: [us] } }, { render: true });
}
if (!which || which === 'v10') run('V10 AT1-only loss: 002 = −30,000, 060 yes', {
  ...id, alberta: jacketYes, albertaSchedule12: { federalNetIncomeForTax: -30_000 },
}, { render: true });
