import { run } from './s12-verify.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const jacketYes = { ...m.alberta }; // 060/061 = yes plus the jacket's other mandatory answers
const jacketNo = { ...m.alberta, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const route2 = { ...id, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const which = process.argv[2];

if (!which || which === 'v1') run('V1 maximal + S16 federal claim 25,000 (035 filed)', { ...m, albertaSred16: { ...m.albertaSred16, federalAmountClaimed: 25_000 } }, { render: true });
if (!which || which === 'v1b') run('V1b maximal + S16 federal claim 40,000 (= Alberta)', { ...m, albertaSred16: { ...m.albertaSred16, federalAmountClaimed: 40_000 } }, { render: true });
if (!which || which === 'v2') run('V2 route 2 + Schedule 4 ACTA 8(2.2) 2,500 vs 20(12) 1,000', {
  ...route2, alberta: jacketYes, foreign: { foreignNonBusinessIncome: 50_000, foreignNonBusinessTaxPaid: 9_000 },
  albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedIta2012Deduction: 1_000, fedNonBusinessForeignTaxCredit: 5_000, albertaActa82Deduction: 2_500 }] },
}, { render: true });
if (!which || which === 'v3') run('V3 AT1-only: S12 002 = 100,000, 061 = 20,000', {
  ...id, alberta: jacketYes, albertaSchedule12: { federalNetIncomeForTax: 100_000, taxableDividendsDeductible: 20_000 },
}, { render: true });
if (!which || which === 'v4') run('V4 jacket 062 typed 225,000 + 061 = 10,000', {
  ...id, alberta: { ...jacketYes, albertaTaxableIncome: 225_000 }, albertaSchedule12: { taxableDividendsDeductible: 10_000 },
}, { render: true });
if (!which || which === 'v5') run('V5 060/061 = No, route 2, S12 060 Alberta 5,000 vs 061 fed 10,000', {
  ...route2, alberta: jacketNo, albertaSchedule12: { taxableDividendsDeductible: 10_000, albertaTaxableDividendsDeductible: 5_000 },
}, { render: true });
if (!which || which === 'v6') run('V6 060 = Yes, route 2, nothing else entered', { ...route2, alberta: jacketYes }, { render: true });
if (!which || which === 'v7') run('V7 route 2 + T2 donations 30,000 + fed non-cap 40,000 applied, no Alberta S20/S21, 060 yes', {
  ...route2, alberta: jacketYes, donations: { charitable: 30_000 }, losses: { nonCapitalOpening: 40_000, nonCapitalApplied: 40_000 },
  albertaSchedule12: { prospectorsShares: 1_000 },
}, { render: true });
if (!which || which === 'v8') run('V8 AT1-only 002 = 100,000 with S12 Alberta override 060 = 5,000 vs 061 = 20,000', {
  ...id, alberta: jacketYes, albertaSchedule12: { federalNetIncomeForTax: 100_000, taxableDividendsDeductible: 20_000, albertaTaxableDividendsDeductible: 5_000 },
}, { render: true });
if (!which || which === 'v9') run('V9 S12 090 negative + 082 > 0: 002 = 10,000, 061 = 30,000, 083 = 900', {
  ...id, alberta: jacketYes, albertaSchedule12: { federalNetIncomeForTax: 10_000, taxableDividendsDeductible: 30_000, section110_5Additions: 900 },
}, { render: true });
