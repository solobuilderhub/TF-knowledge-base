// AT1 Schedule 13 verification — full BE chain; every §3.2.3.14 rule recomputed from the FILED lines.
import { computeFederalT2 } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const s12 = { albertaSchedule12: { federalNetIncomeForTax: 500_000 } };

function go(label: string, input: Record<string, any>, start = '2024-01-01', end = '2024-12-31') {
  if (process.argv[2] && !label.startsWith(process.argv[2] + ' ')) return;
  console.log(`\n================ ${label}`);
  let c: any, federal: any;
  try {
    const a = assembleT2Input(input as never, { taxYearStart: new Date(start), taxYearEnd: new Date(end), program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
    federal = computeFederalT2(fed as never) as any;
    c = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  } catch (e) { console.log('THREW:', (e as Error).message); return; }
  const days = Math.round((+new Date(end) - +new Date(start)) / 86_400_000) + 1;
  const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '013');
  const p12 = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '012');
  const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
  console.log(`days ${days} | T2 CCA ${federal.cca?.totalCca ?? '-'} | jacket 062 ${fld('albertaTaxableIncome')} | filed: ${(c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ')}`);
  if (!p) { console.log('Schedule 13 NOT filed'); }
  else {
    const occ = new Map<number, Map<string, any>>();
    for (const v of p.values) {
      const o = +v.lineItemId.slice(6), f = v.lineItemId.slice(3, 6);
      if (!occ.has(o)) occ.set(o, new Map());
      occ.get(o)!.set(f, v.value);
    }
    for (const [o, r] of occ) {
      console.log(`  occ ${o}: ${[...r].map(([k, v]) => `${k}=${v}`).join(' ')}`);
      if (!r.has('001')) continue;
      const n = (f: string) => Number(r.get(f) ?? 0);
      const pool = n('003') + n('005') + n('007') - n('009');
      const ok = (name: string, pass: boolean, detail: string) => console.log(`     ${pass ? 'OK  ' : 'DIFF'} ${name}: ${detail}`);
      ok('021 = 003+005+007−009+015−017−019', n('021') === pool + n('015') - n('017') - n('019'), `filed ${n('021')} | rule ${pool + n('015') - n('017') - n('019')}`);
      const rate = r.get('013') === 'NA' ? NaN : Number(r.get('013')) / 100;
      const cap = Math.round((pool - n('037')) * rate * Math.min(days, 365) / 365);
      if (!Number.isNaN(rate)) ok('019 ≤ [(pool) − 011(=037)] × 013 × days/365 (+045)', n('019') <= cap + n('045'), `filed 019 ${n('019')} | cap ${cap}${n('045') ? ` + 045 ${n('045')}` : ''}`);
      ok('015 exists only when pool < 0', !r.has('015') || pool < 0 || n('015') === 0 && false, `015 ${r.has('015') ? r.get('015') : '(absent)'} | pool ${pool}`);
      if (n('017')) ok('017 ≤ pool', n('017') <= pool, `017 ${n('017')} | pool ${pool}`);
      ok('011 filed when half-year applies', !n('037') || r.has('011'), `011 ${r.get('011') ?? '(absent)'} | 037 ${n('037')}`);
      const expect037 = Math.max(0, Math.round(0.5 * (n('005') - n('029') - n('031') + n('033') - n('009'))));
      ok('037 = ½(005 − 029 − 031 + 033 − 009)', n('037') === expect037, `filed ${n('037')} | rule ${expect037}`);
    }
    console.log('  display:', (p.display ?? []).map((v: any) => `${v.lineItemId.slice(3, 6)}#${+v.lineItemId.slice(6)}=${v.value}`).join(' '));
  }
  if (p12) console.log('  S12:', p12.values.filter((v: any) => ['002', '004', '005', '006', '007', '008', '009', '050', '054', '090'].includes(v.lineItemId.slice(3, 6))).map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' '));
  for (const i of c.issues ?? []) if (/Schedule 13|CCA|capital cost/i.test(i)) console.log('  issue:', i.slice(0, 260));
}

const at1 = (rows: object[], extra: Record<string, unknown> = {}) => ({ ...id, alberta: yes, ...s12, albertaCca13: { classes: rows }, ...extra });
go('A AT1-only class 8 open 100,000 add 20,000', at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000 }]));
go('B A + S12 federal 005 = 15,000', { ...at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000 }]), albertaSchedule12: { federalNetIncomeForTax: 500_000, federalFigures: { l005: 15_000 } } });
go('C recapture class 10 open 10,000 disp 15,000', at1([{ ccaClass: '10', openingUCC: 10_000, dispositions: 15_000 }]));
go('D terminal loss class 8 open 10,000 emptied', at1([{ ccaClass: '8', openingUCC: 10_000, classEmptied: true }]));
go('E claim 50,000 > max 20,000', at1([{ ccaClass: '8', openingUCC: 100_000, claim: 50_000 }]));
go('F short year 184 days, class 8 open 100,000', at1([{ ccaClass: '8', openingUCC: 100_000 }]), '2024-07-01', '2024-12-31');
go('G rate override class 8 → 30', at1([{ ccaClass: '8', openingUCC: 100_000, rate: 30 }]));
go('H T2 path: T2 class 8 open 100,000 add 20,000; AB claim 10,000', {
  ...id, alberta: yes, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 },
  cca: { classes: [{ ccaClass: '8', openingUCC: 100_000, additions: 20_000 }] },
  albertaCca13: { classes: [{ ccaClass: '8', claim: 10_000 }] } });
go('I T2 path short year 184 days: T2 class 8 open 100,000; AB claim 5,000', {
  ...id, alberta: yes, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 },
  cca: { classes: [{ ccaClass: '8', openingUCC: 100_000 }] },
  albertaCca13: { classes: [{ ccaClass: '8', claim: 5_000 }] } }, '2024-07-01', '2024-12-31');
go('J T2 path, no AB overrides (060 yes)', {
  ...id, alberta: yes, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 },
  cca: { classes: [{ ccaClass: '8', openingUCC: 100_000, additions: 20_000 }] } });
go('K immediate expensing on a 2024 return: class 8 add 20,000, IE 20,000', at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000, immediateExpensing: 20_000 }]));
// ── Second pass ────────────────────────────────────────────────────────────
go('M class 13 leasehold layer 50,000 (lease to 2033), AT1-only', { ...id, alberta: yes, ...s12, albertaCca13: { class13Layers: [{ capitalCost: 50_000, leaseEnd: '2033-12-31', isFirstYear: true }] } });
go('M2 class 14 property 36,500 (life 3,650 days), AT1-only', { ...id, alberta: yes, ...s12, albertaCca13: { class14Properties: [{ capitalCost: 36_500, lifeDaysAtAcquisition: 3_650 }] } });
go('M3 class 13 layer 50,000 + class 13 opening UCC typed 50,000', { ...id, alberta: yes, ...s12, albertaCca13: { class13OpeningUCC: 50_000, class13Layers: [{ capitalCost: 50_000, leaseEnd: '2033-12-31', isFirstYear: true }] } });
go('M4 class 14 property 36,500 + class 14 opening UCC typed 36,500', { ...id, alberta: yes, ...s12, albertaCca13: { class14OpeningUCC: 36_500, class14Properties: [{ capitalCost: 36_500, lifeDaysAtAcquisition: 3_650 }] } });
go('N AIIP: class 8 open 100,000 add 20,000, AIIP 20,000', at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000, aiipAcquisitions: 20_000 }]));
go('O assistance: class 8 open 100,000 add 20,000, net adj −2,000 (031 = 2,000)', at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000, netAdjustments: -2_000, assistanceReceived: 2_000 }]));
go('P immediate expensing on a 2023 return: add 20,000, DIEP 20,000, IE 20,000', at1([{ ccaClass: '8', openingUCC: 100_000, additions: 20_000, diepAcquisitions: 20_000, immediateExpensing: 20_000 }]), '2023-01-01', '2023-12-31');
go('Q 125 immediate expensing limit 500,000', at1([{ ccaClass: '8', openingUCC: 100_000 }], { albertaCca13: { immediateExpensingLimit: 500_000, classes: [{ ccaClass: '8', openingUCC: 100_000 }] } }));
go('R 060/061 = No with an Alberta CCA row', at1([{ ccaClass: '8', openingUCC: 100_000 }], { alberta: { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' } }));
go('L terminal loss AB only: T2 class 8 open 10,000 (not emptied), AB emptied', {
  ...id, alberta: yes, incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 },
  cca: { classes: [{ ccaClass: '8', openingUCC: 10_000 }] },
  albertaCca13: { classes: [{ ccaClass: '8', classEmptied: true }] } });
