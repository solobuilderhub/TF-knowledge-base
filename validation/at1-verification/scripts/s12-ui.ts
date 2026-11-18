// Schedule 12 UI test cases — AT1-only (no T2 data), every value enterable on a fresh AT1 engagement.
import { run } from './s12-verify.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const s16 = { currentYearExpenditures: 120_000, openingPoolBalance: 30_000, amountClaimed: 40_000 };
const us = { country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedIta2012Deduction: 1_000, fedNonBusinessForeignTaxCredit: 5_000 };
const w = process.argv[2];
const go = (k: string, label: string, input: Record<string, unknown>) => { if (!w || w === k) run(`${k} ${label}`, { ...id, ...input }, { render: true }); };

go('BASE', '002 = 500,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000 } });
go('T1a', 'S16, federal claim blank', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaSred16: s16 });
go('T1b', 'S16, federal claim 0', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaSred16: { ...s16, federalAmountClaimed: 0 } });
go('T1c', 'S16, federal claim 25,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaSred16: { ...s16, federalAmountClaimed: 25_000 } });
go('T2', 'federal 065 = 40,000, no S21', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000, federalFigures: { l065: 40_000 } } });
go('T2b', 'federal 065 = 40,000 + S21 non-cap opening 40,000 applied 40,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000, federalFigures: { l065: 40_000 } },
  albertaContinuity: { nonCapitalOpening: 40_000, nonCapitalApplied: 40_000 } });
go('T3', '060 Yes, jacket 062 typed 225,000, S12 empty', { alberta: { ...yes, albertaTaxableIncome: 225_000 } });
go('T3b', '060 Yes, S12 002 = 225,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 225_000 } });
go('T4', 'S4 ACTA 8(2.2) 2,500 vs 20(12) 1,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaForeignInvestment4: { countries: [{ ...us, albertaActa82Deduction: 2_500 }] } });
go('T4b', 'S4 ACTA, 062 typed 500,000, S12 empty', { alberta: { ...yes, albertaTaxableIncome: 500_000 }, albertaForeignInvestment4: { countries: [{ ...us, albertaActa82Deduction: 2_500 }] } });
go('T5', 'jacket 062 typed 225,000 + S12 061 = 10,000', { alberta: { ...yes, albertaTaxableIncome: 225_000 }, albertaSchedule12: { taxableDividendsDeductible: 10_000 } });
go('T6', '060/061 No; 002 500,000, 061 10,000, Alberta 060 5,000', { alberta: no, albertaSchedule12: { federalNetIncomeForTax: 500_000, taxableDividendsDeductible: 10_000, albertaTaxableDividendsDeductible: 5_000 } });
go('T7', '002 100,000, 061 20,000, Alberta 060 5,000', { alberta: yes, albertaSchedule12: { federalNetIncomeForTax: 100_000, taxableDividendsDeductible: 20_000, albertaTaxableDividendsDeductible: 5_000 } });
