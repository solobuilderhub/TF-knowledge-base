// AuraTax screenshot inputs → ca-tax computeSchedule4.
// AuraTax: B 100,000; C .625; D 5,000 (so 068/066 = 0.08); col 5 (ACTA 8(2.2)) 3,000; E 5,000; F 10,000; 018 = 14,062.
// Jacket chosen to reproduce those: 062 400,000, 064 0 → 066 250,000; 068 20,000; 070 5,938 → 068 − 070 = 14,062.
// E = fed 120 − max(3,000, fed 130) = 5,000 → fed 130 2,000 (differs, as col 5 requires), fed 120 8,000.
import { computeSchedule4, schedule4Values } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/schedules/schedule4-foreign-investment-tax-credit.ts';

const j = { f062: 400_000, f064: 0, f065: 0.625, f068: 20_000, f070: 5_938, f071: 0 };
const r = computeSchedule4({
  countries: [{ country: 'US', netForeignInvestmentIncome: 100_000, fedForeignTaxPaid: 8_000, fedIta2012Deduction: 2_000, albertaActa82Deduction: 3_000, fedNonBusinessForeignTaxCredit: 10_000 }],
  albertaTaxableIncome: j.f062, royaltyTaxDeduction: j.f064, allocationFactor: j.f065, basicAlbertaTax: j.f068,
});
const c = r.countries[0];
console.log('E (006)', c.taxPaidNetOfDeduction, '| F (008)', c.federalNonBusinessForeignTaxCredit);
console.log('D', c.incomeProrationAmount, '| G', c.taxPaidLessFederalCredit, '| H (012)', c.allowableCredit, '| 014', r.totalAllowableCredit);
const f018 = j.f068 - (j.f070 + j.f071);
console.log('018 (068 − (070 + 071))', f018, '| 020 = lesser(014, 018)', Math.min(r.totalAllowableCredit, f018));
console.log('filed 004 lines:', schedule4Values(r).values.map((v) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' '));
console.log('issues:', r.issues);
