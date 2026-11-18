// AT1 jacket (form 000) verification — full chain to the RENDERED Net File XML, as production composes it
// (identity via withAt1JacketIdentity). Every §3.2.3.1 rule recomputed from the filed jacket lines and the
// filed lines of the schedules it reads (001, 002, 003, 004, 012, 029).
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\jacket-verify.ts [J1 …]
import { renderAt1NetFile } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { computeFederalT2 } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from '../../../../TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { withAt1JacketIdentity } from '../../../../TaxFoundry-be/src/engine/engagement-compute.service.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
// Every mandatory jacket answer, no M&P / political credit unless a scenario adds one.
const jacket = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const client = {
  name: 'Jacket Test Ltd.', address: { street: '1 Test Way', city: 'Calgary', province: 'AB', postalCode: 'T2P1A1' },
  corporateAccountNumber: '1234567890', businessNumber: '123456782RC0001', contactPerson: 'Dana QA',
  contactTelephone: '4035550100', natureOfBusiness: '5411', typeOfCorporation: '1', authorizedEmail: 'qa@taxfoundry.test',
};
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 }, sbd: { activeBusinessIncome: 600_000 } };

function go(k: string, label: string, input: Record<string, any>, opt: { start?: string; end?: string; client?: object } = {}) {
  if (process.argv[2] && process.argv[2] !== k) return;
  const start = opt.start ?? '2024-01-01', end = opt.end ?? '2024-12-31';
  const full = { ...id, ...input, alberta: { ...jacket, ...(input.alberta ?? {}) } };
  console.log(`\n================ ${k} ${label}`);
  let c: any, federal: any;
  try {
    const a = assembleT2Input(full as never, { taxYearStart: new Date(start), taxYearEnd: new Date(end), program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: full.identification.corpType === 'ccpc' };
    federal = computeFederalT2(fed as never) as any;
    c = runAT1Compute(assembleProvincialInput('AT1', fed, full as never, { isCcpc: fed.isCcpc })) as any;
  } catch (e) { console.log('  COMPUTE THREW:', (e as Error).message.slice(0, 200)); return; }
  const cl = { ...client, ...(opt.client ?? {}) };
  const identity = withAt1JacketIdentity({ taxYearStart: start, taxYearEnd: end }, cl as never, full);
  const data = composeAt1FilingData({ computed: { fields: c.fields, identity, filingInput: full }, client: cl, engagement: { taxYearStart: new Date(start), taxYearEnd: new Date(end) },
    certification: { firstName: 'A', lastName: 'B', position: 'CFO' }, forFiling: false } as never);
  let xml = '';
  try { xml = renderAt1NetFile(data, c.schedulePayloads ?? []); } catch (e) { console.log('  RENDER THREW:', (e as Error).message.slice(0, 220)); }
  const sched = (s: string) => {
    const body = s === '000' ? xml.match(/<Schedule Number="000">([\s\S]*?)<\/Schedule>/)?.[1] : xml.match(new RegExp(`<Schedule Number="${s}">([\\s\\S]*?)</Schedule>`))?.[1];
    const mm = new Map<string, string>();
    for (const x of (body ?? '').matchAll(/LineItemID="(\w{3}\d{6})">([^<]*)</g)) if (x[1].endsWith('001')) mm.set(x[1].slice(3, 6), x[2]);
    return body ? mm : undefined;
  };
  const J = sched('000');
  if (!J) { console.log('  (no rendered jacket — using engine fields only)'); }
  const f = (slug: string) => Number(c.fields.find((x: any) => x.line === slug)?.value ?? 0);
  const j = (l: string) => (J ? Number(J.get(l) ?? NaN) : NaN);
  const has = (l: string) => J?.has(l) ?? false;
  const S = (s: string) => sched(s);
  const n = (m0: Map<string, string> | undefined, l: string) => Number(m0?.get(l) ?? 0);
  const filed = (c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ');
  console.log(`  schedules: ${filed} | fed TI ${federal.taxableIncome}`);
  if (J) console.log('  jacket:', ['029', '030', '047', '048', '060', '061', '062', '064', '065', '068', '070', '071', '072', '074', '076', '080', '081', '082', '085', '086', '087', '090', '091', '092', '095', '096', '115', '129'].map((l) => `${l}=${J.get(l) ?? '-'}`).join(' '));
  else console.log(`  engine: 062 ${f('albertaTaxableIncome')} 065 ${f('allocationFactor')} 068 ${f('basicAlbertaTax')} 070 ${f('albertaSmallBusinessDeduction')} 071 ${f('manufacturingDeduction')} 074 ${f('politicalContributionsTaxCredit')} 080 ${f('albertaTaxPayable')}`);
  for (const i of c.issues ?? []) if (/line 0(62|68|70|71|74|80|90)|jacket|AT1 line/i.test(i)) console.log('  issue:', i.slice(0, 200));
  if (!J) return;
  const chk = (name: string, ok: boolean, s: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${s}`);

  // ── Tax calculation ──
  const s12 = S('012');
  const yes60 = J.get('060') === '1', yes61 = J.get('061') === '1';
  if (yes60) chk('061 = 1 when 060 = 1', yes61, `061 ${J.get('061')}`);
  if (yes60 || yes61) chk('062 = 012090 − 012092 (060 or 061 = 1)', s12 !== undefined && j('062') === n(s12, '090') - n(s12, '092'), s12 ? `062 ${j('062')} | 090 ${n(s12, '090')}` : 'Schedule 12 not filed');
  else chk('062 = fed 360 − 370 (060 = 061 = 2)', j('062') === federal.taxableIncome, `062 ${j('062')} | fed 360 ${federal.taxableIncome}`);
  const s2 = S('002');
  if (s2) {
    const r = (a: string, b: string) => (n(s2, b) ? n(s2, a) / n(s2, b) : 0);
    const both = n(s2, '004') && n(s2, '008');
    const fac = both ? (r('002', '004') + r('006', '008')) / 2 : r('002', '004') + r('006', '008');
    chk('065 = [(002002/002004) + (002006/002008)] × ½', Math.abs(j('065') - fac) < 5e-7, `${J.get('065')} vs ${fac.toFixed(6)}`);
  } else chk('065 = 1 without Schedule 2', j('065') === 1, `${J.get('065')}`);
  const base066 = Math.max(0, (j('062') - j('064')) * j('065'));
  const exp068 = J.get('030') === '5' ? 0 : Math.max(0, Math.round(base066 * 0.08));
  chk('068 = round((062 − 064) × 065 × 8%) (0 if 030 = 5)', j('068') === exp068, `${j('068')} vs ${exp068}`);
  const s1 = S('001');
  if (s1) {
    const least = Math.min(n(s1, '003') - j('064'), n(s1, '009') - j('064'), n(s1, '015') * 2.5);
    const exp070 = Math.round(Math.max(0, least) * n(s1, '021') * 0.06);
    chk('070 = least(001003 − 064, 001009 − 064, 001015 × 250%) × 001021 × 6%', Math.abs(j('070') - exp070) <= 1, `${j('070')} vs ${exp070} (001003 ${s1.get('003')}, 001009 ${s1.get('009')}, 001015 ${s1.get('015')}, 001021 ${s1.get('021')})`);
  } else chk('070 = 0 without Schedule 1', j('070') === 0, `${j('070')}`);
  chk('071 = 0 (formula × days before 2001-04-01 ÷ days; nil for any year after 2001)', j('071') === 0, `${j('071')}`);
  const s4 = S('004');
  const sum4012 = s4 ? [...(xml.match(/<Schedule Number="004">([\s\S]*?)<\/Schedule>/)?.[1] ?? '').matchAll(/LineItemID="004012\d{3}">([^<]*)</g)].reduce((t, x) => t + Number(x[1]), 0) : 0;
  chk('072 = lesser of Σ004012 and 068 − (070 + 071) (0 without Schedule 4)', j('072') === (s4 ? Math.min(sum4012, j('068') - j('070') - j('071')) : 0), `072 ${j('072')} | Σ004012 ${sum4012}`);
  chk('074 ≤ least of $1,000 and 068 − (070 + 071 + 072)', j('074') <= Math.min(1000, Math.max(0, j('068') - j('070') - j('071') - j('072'))), `074 ${j('074')}`);
  const s3 = S('003');
  chk('076 = 003604 (0 without Schedule 3)', j('076') === (s3 ? n(s3, '604') : 0), `076 ${j('076')} | 003604 ${s3?.get('604') ?? '-'}`);
  chk('080 = 068 − (070 + 071 + 072 + 074 + 076)', j('080') === j('068') - (j('070') + j('071') + j('072') + j('074') + j('076')), `${j('080')}`);
  const s29 = S('029');
  if (s29) chk('129 = (029110 + 029112 × 029128) − 029132 (jacket rule)', j('129') === Math.round(n(s29, '110') + n(s29, '112') * n(s29, '128')) - n(s29, '132'), `129 ${j('129')} | 029134 ${s29.get('134')}`);
  const spec090 = j('080') - (j('081') + j('082') + j('085') + j('086') + j('087'));
  const form090 = j('080') - (j('129') + j('082') + j('085') + j('086') + j('115') + j('087'));
  chk('090 = 080 − (081 + 082 + 085 + 086 + 087) (spec rule)', j('090') === spec090, `filed ${j('090')} | spec ${spec090} | printed form (088) ${form090}`);
  chk('091 = 0 (Net File)', j('091') === 0, `${J.get('091')}`);
  chk('092 present when 090 < 0', !(j('090') < 0) || has('092'), `090 ${j('090')} | 092 ${J.get('092') ?? '(absent)'}`);
  chk('096 present when 095 = 1', J.get('095') !== '1' || has('096'), `095 ${J.get('095')} | 096 ${J.get('096') ?? '(absent)'}`);
  if (has('041')) chk('043 present when 041 exists', has('043'), `041 ${J.get('041')} | 043 ${J.get('043') ?? '(absent)'}`);
  if (j('085') > 0) chk('110 present when 085 > 0', has('110'), `110 ${J.get('110') ?? '(absent)'}`);
  // ── Identification / federal-mirror lines ──
  const rev = Number(full.incomeStatement?.revenue ?? NaN);
  if (!Number.isNaN(rev)) chk('047 = fed GIFI 8299 (+ 9659)', j('047') === rev, `047 ${j('047')} | T2 revenue ${rev}`);
  const type = J.get('029');
  const sbdGranted = j('070') > 0;
  chk('029 consistent with the SBD (only types 1 / 2 / 5 can claim)', !sbdGranted || ['1', '2', '5'].includes(type ?? ''), `029 ${type} | 070 ${j('070')}`);
  chk('036 / 037 = the tax year', J.get('036') === start.replace(/-/g, '') && J.get('037') === end.replace(/-/g, ''), `${J.get('036')} / ${J.get('037')}`);
  chk('035 = 15-character BN', /^\d{9}RC\d{4}$/.test(J.get('035') ?? ''), `${J.get('035')}`);
}

go('J1', 'baseline T2: revenue 1,000,000, cost of sales 400,000, ABI 600,000', t2);
go('J2', 'two provinces: AB 700,000 / 150,000, ON 300,000 / 50,000', { ...t2, provincialAllocation: { establishments: [{ province: 'AB', grossRevenue: 700_000, salariesWages: 150_000 }, { province: 'ON', grossRevenue: 300_000, salariesWages: 50_000 }] } });
go('J3', 'short year (184 days)', t2, { start: '2024-07-01', end: '2024-12-31' });
go('J4', 'royalty tax deduction 10,000 (albertaSbd)', { ...t2, albertaSbd: { royaltyTaxDeduction: 10_000 } });
go('J5', 'M&P deduction typed 3,000 (071)', { ...t2, alberta: { manufacturingDeduction: 3_000 } });
go('J6', 'political contributions credit typed 5,000 (074)', { ...t2, alberta: { politicalContributionsTaxCredit: 5_000 } });
go('J6b', 'political credit 1,000 on a small return (062 = 10,000 typed, ABI 10,000)', { ...id, sbd: { activeBusinessIncome: 10_000 }, alberta: { albertaTaxableIncome: 10_000, politicalContributionsTaxCredit: 1_000 } });
go('J7', 'Schedule 4 credit (US: 50,000 / paid 9,000 / 20(12) 1,000 / F 5,000)', { ...t2, foreign: { foreignNonBusinessIncome: 50_000, foreignNonBusinessTaxPaid: 9_000 }, albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedIta2012Deduction: 1_000, fedNonBusinessForeignTaxCredit: 5_000 }] } });
go('J8', 'Innovation Employment Grant 16,800 (Schedule 29 G1)', { ...t2, albertaIeg: { federalAmount: 200_000, albertaPortion: 150_000, primaryFieldCode: 1, group: [{ name: 'Claimant', taxableCapital: 2_000_000, priorYear1: 100_000, priorYear2: 120_000 }] } });
go('J9', 'instalments 20,000 (overpayment)', { ...t2, payments: { instalmentsPaid: 20_000 } });
go('J10', 'prepared by a tax preparer for a fee (095 = Yes)', { ...t2, alberta: { preparedByTaxPreparerForFee: 'yes' } });
go('J11', '060 = Yes, 061 = No', { ...t2, alberta: { reportsDifferentAlbertaIncome: 'yes', electsDifferentDiscretionaryAmounts: 'no' } });
go('J12', 'type of corporation: client record 4 (public), jacket blank, corpType CCPC', t2, { client: { typeOfCorporation: '4' } });
go('J13', 'special status 5 (s.149 exempt)', { ...t2, alberta: { specialCorporationStatus: '5' } });
go('J14', 'loss year: AT1-only, Schedule 12 002 = −50,000', { albertaSchedule12: { federalNetIncomeForTax: -50_000 } });
go('J15', 'functional currency 1 (USD)', { ...t2, alberta: { functionalCurrency: '1' } });
go('J16', 'AT1-only route 1: 062 typed 225,000', { alberta: { albertaTaxableIncome: 225_000 } });
go('J17', 'Schedule 3 + Schedule 4 together (S3 baseline APITC 10,000 / 1,000)', {
  ...t2, foreign: { foreignNonBusinessIncome: 50_000, foreignNonBusinessTaxPaid: 9_000 },
  albertaForeignInvestment4: { countries: [{ country: 'US', netForeignInvestmentIncome: 50_000, fedForeignTaxPaid: 9_000, fedIta2012Deduction: 1_000, fedNonBusinessForeignTaxCredit: 5_000 }] },
  albertaOtherCredits3: { vintages: { agriProcessingTaxCredit: [{ yearIndex: 0, taxYearEnd: '2024-12-31', received: 10_000, applied: 1_000 }] } },
});
