// Schedule 4 through the real filing chain (maximal return), then the same country rows
// through computeSchedule4 with the jacket figures that run actually produced.
import { renderAt1NetFile } from '../../../../ca-tax/src/t2/at1/filing/at1-netfile-renderer.ts';
import { computeSchedule4 } from '../../../../ca-tax/src/t2/at1/schedules/schedule4-foreign-investment-tax-credit.ts';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from '../../../../TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const taxYearStart = new Date('2024-01-01');
const taxYearEnd = new Date('2024-12-31');

function run(label: string, input: Record<string, unknown>) {
  const assembled = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
  const p = assembled.period;
  const fed = { ...assembled, period: { start: new Date(p.start), end: new Date(p.end), label: p.label }, isCcpc: true };
  const computed = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  const data = composeAt1FilingData({
    computed: { fields: computed.fields, identity: {}, filingInput: input },
    client: { name: 'X Ltd.', address: { street: '1 St', city: 'Calgary', province: 'AB', postalCode: 'T2P1A1' },
      corporateAccountNumber: '1234567890', businessNumber: '123456782RC0001', contactPerson: 'Q', contactTelephone: '4035550100',
      natureOfBusiness: 'Mfg', typeOfCorporation: '1', authorizedEmail: 'q@x.test' },
    engagement: { taxYearStart, taxYearEnd }, certification: { firstName: 'A', lastName: 'B', position: 'CFO' }, forFiling: false,
  } as never);
  const xml = renderAt1NetFile(data, computed.schedulePayloads ?? []);
  const val = (id: string) => xml.match(new RegExp(`LineItemID="${id}">([^<]*)<`))?.[1] ?? '(absent)';
  const block = (s: string) => [...(xml.match(new RegExp(`<Schedule Number="${s}">([\\s\\S]*?)</Schedule>`))?.[1] ?? '').matchAll(/LineItemID="(\d{9})">([^<]*)</g)].map((x) => `${x[1].slice(3, 6)}=${x[2]}`);
  const fld = (l: string) => computed.fields.find((x: any) => x.line === l)?.value;
  console.log(`\n== ${label}`);
  console.log('jacket 062', val('000062001'), '| 065', val('000065001'), '| 068', val('000068001'), '| 070', val('000070001'), '| 072', val('000072001'), '| 080', val('000080001'));
  console.log('filed Schedule 4:', block('004').join(' ') || '(not filed)');
  console.log('S3 602:', block('003').find((s) => s.startsWith('602=')) ?? '(no S3)');
  const s4issues = (computed.issues ?? []).filter((i: string) => i.includes('Schedule 4'));
  console.log('S4 issues:', s4issues.map((i: string) => i.slice(0, 120)));
  return { f062: Number(fld('albertaTaxableIncome')), f065: Number(fld('allocationFactor')), f068: Number(fld('basicAlbertaTax')), f070: Number(fld('albertaSmallBusinessDeduction')) };
}

const m = maximalReturn as Record<string, any>;
const j = run('maximal return (US: income 50,000, tax paid 7,500, fed credit 5,000)', m);
run('same, with 062 stated on the jacket', { ...m, alberta: { ...(m.alberta ?? {}), albertaTaxableIncome: j.f062 } });

// Same rows, with the jacket figures this very return produced.
const c = m.albertaForeignInvestment4.countries[0];
const r = computeSchedule4({
  countries: [{ country: c.country, netForeignInvestmentIncome: c.netForeignInvestmentIncome, fedForeignTaxPaid: c.fedForeignTaxPaid, fedNonBusinessForeignTaxCredit: c.fedNonBusinessForeignTaxCredit }],
  albertaTaxableIncome: j.f062, royaltyTaxDeduction: 0, allocationFactor: j.f065, basicAlbertaTax: j.f068,
});
console.log('\n== same rows, real jacket inputs (062', j.f062, '065', j.f065, '068', j.f068, ')');
console.log('D', r.countries[0].incomeProrationAmount, '| G', r.countries[0].taxPaidLessFederalCredit, '| 012', r.countries[0].allowableCredit, '| 014', r.totalAllowableCredit);
console.log('018 = 068 - (070 + 071) =', j.f068 - j.f070, '| 020 = lesser(014, 018) =', Math.min(r.totalAllowableCredit, j.f068 - j.f070));
