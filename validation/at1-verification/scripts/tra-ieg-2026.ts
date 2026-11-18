// TRA Test Cases 2 and 3, Fall 2026 (TYE 2025-12-31), compared with IEG Guide examples 3 and 4.
//   npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\tra-ieg-2026.ts tc2|tc3 [guide]   (from TaxFoundry-be)
// "guide" fills the inputs the way the guide's sample forms are filled: step-2 figures on 003/005/011,
// the proxy amounts on 007/009/111/113, the AT4970 jurisdiction table, and the guide's longest-year pick.
import { renderAt1NetFile } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/t2/index.mjs';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from '../../../../TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { TRA_CASES } from '../../../../TaxFoundry-be/tests/fixtures/tra-cases.ts';

const id = (process.argv[2] ?? 'tc3') as 'tc2' | 'tc3';
const guide = process.argv[3] === 'guide';
const c = TRA_CASES[id];
const ri: any = structuredClone(c.returnInput);
const ieg = ri.albertaIeg;
const shift = (d: string) => `${Number(d.slice(0, 4)) + 1}${d.slice(4)}`;

// Move every date one year forward (TRA: TYB 2025-01-01, TYE 2025-12-31).
ieg.agreementLongestYearBegin = shift(ieg.agreementLongestYearBegin);
ieg.agreementLongestYearEnd = shift(ieg.agreementLongestYearEnd);
ieg.agreementDaysInLongestYear = 365; // no 29 February in any of the 2024-25 years
for (const m of ieg.agreementMembers) {
  m.currentTaxationYearEnd = shift(m.currentTaxationYearEnd);
  if (m.daysInTaxYear) m.daysInTaxYear = 365;
}

if (guide) {
  const g = id === 'tc2'
    ? { proxy: 55_000, grant: 31_250, ab: 400_000, other: 600_000, otherJ: 'ontario' }
    : { proxy: 220_000, grant: 89_250, ab: 1_000_000, other: 500_000, otherJ: 'britishColumbia' };
  ieg.projects[0].federalProxyAmount = g.proxy;
  ieg.projects[0].albertaProxyAmount = g.proxy;
  ieg.federalAmount = g.ab + g.other - g.grant; // step 2: 003 after the IEG on T661 line 513
  ieg.albertaPortion = g.ab - g.grant; // step 2: 005
  ieg.iegReducingFederalExpenditure = g.grant; // step 2: 011
  ieg.jurisdictions = [
    { jurisdiction: 'alberta', amountIncurred: g.ab - g.grant },
    { jurisdiction: g.otherJ, amountIncurred: g.other },
  ];
  if (id === 'tc3') {
    // The guide names Corporation B (Julyâ€“June year) as the longest year, not C.
    ieg.agreementLongestYearCan = '700200300';
    ieg.agreementLongestYearBegin = '2024-07-01';
    ieg.agreementLongestYearEnd = '2025-06-30';
  }
}

const taxYearStart = new Date('2025-01-01');
const taxYearEnd = new Date('2025-12-31');
const engagement = { taxYearStart, taxYearEnd, program: 'AT1' };
const assembled: any = assembleT2Input(ri, engagement as never);
const p = assembled.period;
const fed = { ...assembled, period: { start: new Date(p.start), end: new Date(p.end), label: p.label }, isCcpc: true };
const computed: any = runAT1Compute(assembleProvincialInput('AT1', fed, ri, { isCcpc: true }));
const data = composeAt1FilingData({
  computed: { fields: computed.fields, identity: {}, filingInput: ri },
  client: c.client,
  engagement: { taxYearStart, taxYearEnd },
  certification: { firstName: 'Dana', lastName: 'Whitecourt', position: 'President' },
  forFiling: false,
} as never);
const xml = renderAt1NetFile(data, computed.schedulePayloads ?? []);
console.log(`== ${id}${guide ? ' (guide-style inputs)' : ' (fixture inputs, dates moved to 2025)'}`);
console.log('ISSUES:\n  ' + (computed.issues ?? []).join('\n  '));
const lines = [...xml.matchAll(/LineItemID="(\w{9})">([^<]*)</g)].map((m) => [m[1], m[2]] as const);
const keep = lines.filter(([k]) => !k.startsWith('000') && !k.startsWith('EDI'));
const jacket = lines.filter(([k]) => ['000036001', '000037001', '000062001', '000129001', '000090001'].includes(k));
console.log([...jacket, ...keep].map(([k, v]) => `${k} ${v}`).join('\n'));
