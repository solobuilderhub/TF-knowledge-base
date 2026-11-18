// The real filing chain (as at1-transmission-conformance.test.ts drives it) on the maximal return,
// plus jacket 071/074 and filled ITC/CITC year-of-origin tables. Reads the RENDERED XML.
import { renderAt1NetFile } from '../../../../ca-tax/src/t2/at1/filing/at1-netfile-renderer.ts';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from '../../../../TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const taxYearStart = new Date('2024-01-01');
const taxYearEnd = new Date('2024-12-31');
const engagement = { taxYearStart, taxYearEnd, program: 'AT1' };

const m = maximalReturn as Record<string, any>;
const input: Record<string, unknown> = {
  ...m,
  alberta: { ...(m.alberta ?? {}), manufacturingDeduction: 3_000, politicalContributionsTaxCredit: 400 },
  albertaOtherCredits3: {
    ...m.albertaOtherCredits3,
    vintages: {
      ...(m.albertaOtherCredits3?.vintages ?? {}),
      investorTaxCredit: [
        { yearIndex: 0, taxYearEnd: '2024-12-31', received: 5_000, applied: 1_000 },
        { yearIndex: 1, taxYearEnd: '2023-12-31', openingBalance: 2_000, applied: 0 },
      ],
      capitalInvestmentTaxCredit: [{ yearIndex: 0, taxYearEnd: '2024-12-31', received: 3_000, applied: 500 }],
    },
  },
};

const assembled = assembleT2Input(input as never, engagement as never) as Record<string, any>;
const p = assembled.period;
const fed = { ...assembled, period: { start: new Date(p.start), end: new Date(p.end), label: p.label }, isCcpc: true };
const computed = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
const data = composeAt1FilingData({
  computed: { fields: computed.fields, identity: {}, filingInput: input },
  client: {
    name: 'Maximal Ltd.', address: { street: '1 Test Way', city: 'Calgary', province: 'AB', postalCode: 'T2P1A1' },
    corporateAccountNumber: '1234567890', businessNumber: '123456782RC0001', contactPerson: 'Dana QA',
    contactTelephone: '4035550100', natureOfBusiness: 'Manufacturing', typeOfCorporation: '1', authorizedEmail: 'qa@taxfoundry.test',
  },
  engagement: { taxYearStart, taxYearEnd },
  certification: { firstName: 'A', lastName: 'B', position: 'CFO' },
  forFiling: false,
} as never);
const xml = renderAt1NetFile(data, computed.schedulePayloads ?? []);

const val = (id: string) => xml.match(new RegExp(`LineItemID="${id}">([^<]*)<`))?.[1] ?? '(absent)';
const block = (s: string) => [...(xml.match(new RegExp(`<Schedule Number="${s}">([\\s\\S]*?)</Schedule>`))?.[1] ?? '').matchAll(/LineItemID="(\d{9})">([^<]*)</g)].map((x) => `${x[1].slice(3, 6)}=${x[2]}`);

console.log('SCHED 10', block('010').join(' '));
console.log('JACKET 012/014/015/017/025/026/034/037:', ['012','014','015','017','025','026','034','037'].map((l) => val('000' + l + '001')).join(' | '));

