// TRA Test Case 1, August 2026 edition: TYB 2024-09-01, TYE 2025-08-31, class 8 by AIIP (no immediate expensing).
import { renderAt1NetFile } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/node_modules/@classytic/ca-tax/dist/t2/index.mjs';
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { TRA_CASES } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/tra-cases.ts';

const amended = process.argv[2] === 'a';
const base = TRA_CASES.tc1;
const ri: any = structuredClone(base.returnInput);
const ex = amended ? 843_800 : 818_800; // federal NI −19,800 (−44,800 amended) with CCA 201,000
ri.incomeStatement = { revenue: 1_000_000, otherExpenses: ex };
ri.cca.classes = [
  { ccaClass: '8', openingUCC: 5_000, additions: 1_000_000, aiip: true },
  { ccaClass: '1', openingUCC: 5_000, claim: 0 },
];
ri.cca.class13Layers[0].leaseEnd = '2029-08-31';
const cb = amended ? [35_000, 3_000, 2_500] : [10_000, 3_000, 2_500];
ri.albertaContinuity.nonCapitalCarrybacks = [
  { taxYearEnd: '2024-08-31', amount: cb[0] },
  { taxYearEnd: '2023-08-31', amount: cb[1] },
  { taxYearEnd: '2022-08-31', amount: cb[2] },
];
ri.albertaContinuity.capitalCarrybacks = [
  { taxYearEnd: '2024-08-31', amount: 50_000 },
  { taxYearEnd: '2023-08-31', amount: 50_000 },
  { taxYearEnd: '2022-08-31', amount: 50_000 },
];
if (amended) ri.edi = { ...ri.edi, amendedReturn: '1', amendedDescription: 'Current-year loss revised' };

const taxYearStart = new Date('2024-09-01');
const taxYearEnd = new Date('2025-08-31');
const engagement = { taxYearStart, taxYearEnd, program: 'AT1' };
const assembled: any = assembleT2Input(ri, engagement as never);
const p = assembled.period;
const fed = { ...assembled, period: { start: new Date(p.start), end: new Date(p.end), label: p.label }, isCcpc: true };
const computed: any = runAT1Compute(assembleProvincialInput('AT1', fed, ri, { isCcpc: true }));
const data = composeAt1FilingData({
  computed: { fields: computed.fields, identity: {}, filingInput: ri },
  client: base.client,
  engagement: { taxYearStart, taxYearEnd },
  certification: { firstName: 'Dana', lastName: 'Whitecourt', position: 'President' },
  forFiling: false,
} as never);
const xml = renderAt1NetFile(data, computed.schedulePayloads ?? []);
console.log('federal taxYear:', fed.taxYear ?? fed.period?.label);
console.log('ISSUES:\n  ' + (computed.issues ?? []).join('\n  '));
console.log(xml);
