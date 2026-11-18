// The real filing chain (as at1-transmission-conformance.test.ts drives it) on the maximal return,
// plus jacket 071/074 and filled ITC/CITC year-of-origin tables. Reads the RENDERED XML.
import { renderAt1NetFile } from 'C:/Users/User/Desktop/TaxFoundry/ca-tax/src/t2/at1/filing/at1-netfile-renderer.ts';
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

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

console.log('JACKET  068', val('000068001'), '| 070', val('000070001'), '| 071', val('000071001'), '| 072', val('000072001'), '| 074', val('000074001'), '| 076', val('000076001'), '| 080', val('000080001'), '| 090', val('000090001'));
console.log('SCHED 3', block('003').join(' '));
console.log('SCHED 4', block('004').join(' '));
console.log('S3 120-130 / 220-230 / 330-340 filed:', block('003').filter((s) => /^(1[23]\d|2[23]\d|3[34]\d)=/.test(s)));
const f = (l: string) => computed.fields.find((x: any) => x.line === l)?.value;
console.log('engine fields: basicAlbertaTax', f('basicAlbertaTax'), 'sbd', f('albertaSmallBusinessDeduction'), 'albertaTaxPayable', f('albertaTaxPayable'), 'totalOwing', f('totalOwing'));
console.log('filingData 071/072/074/076:', data.manufacturingDeduction, data.foreignInvestmentTaxCredit, data.politicalContributionsTaxCredit, data.otherDeductions);

