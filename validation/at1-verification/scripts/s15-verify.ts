// AT1 Schedule 15 verification — full BE chain; every §3.2.3.16 rule recomputed from the FILED lines.
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
// Federal claims stated as 0 so Schedule 12 files the 022-033 pairs and the link can be checked.
const s12 = { albertaSchedule12: { federalNetIncomeForTax: 1_000_000, federalFigures: { l023: 0, l027: 0, l029: 0, l031: 0, l033: 0 } } };

export const ALL = {
  edaRegular: { federalOpeningBalance: 80_000, federalRegulation1201Claim: 10_000 },
  edaSuccessor: { federalOpeningBalance: 20_000, federalRegulation1202Claim: 5_000 },
  cmedb: { federalOpeningBalance: 20_000, claimed: 5_000 },
  ceeRegular: { federalOpeningBalance: 100_000, albertaOpeningBalance: 90_000, federalCurrentYearExpenses: 50_000 },
  ceeSuccessor: { federalOpeningBalance: 30_000 },
  cdeRegular: { federalOpeningBalance: 200_000, federalCurrentYearExpenses: 100_000 },
  cdeSuccessor: { federalOpeningBalance: 50_000 },
  ccogpeRegular: { federalOpeningBalance: 400_000, federalCurrentYearExpenses: 100_000 },
  ccogpeSuccessor: { federalOpeningBalance: 100_000 },
  fedeRegular: { federalOpeningBalance: 100_000, federalForeignResourceIncome: 5_000 },
  fedeSuccessor: { federalOpeningBalance: 40_000, federalForeignResourceIncome: 15_000 },
  sfedeRegular: [{ countryCode: 'US', federalOpeningBalance: 60_000, federalForeignResourceIncome: 20_000 }],
  sfedeSuccessor: [{ countryCode: 'US', federalOpeningBalance: 10_000, federalForeignResourceIncome: 4_000 }],
  cfreRegular: [{ countryCode: 'US', federalOpeningBalance: 100_000, federalCurrentYearExpenses: 20_000, federalForeignResourceIncome: 50_000, globalForeignResourceLimit: 10_000 }],
  cfreSuccessor: [{ countryCode: 'US', federalOpeningBalance: 30_000, federalForeignResourceIncome: 50_000 }],
};

function go(label: string, s15: Record<string, unknown>, opts: { start?: string; end?: string; alberta?: object } = {}) {
  if (process.argv[2] && !label.startsWith(process.argv[2] + ' ')) return;
  const start = opts.start ?? '2024-01-01', end = opts.end ?? '2024-12-31';
  console.log(`\n================ ${label}`);
  let c: any;
  try {
    const input = { ...id, alberta: opts.alberta ?? yes, ...s12, albertaResourceDeductions15: s15 };
    const a = assembleT2Input(input as never, { taxYearStart: new Date(start), taxYearEnd: new Date(end), program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
    c = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  } catch (e) { console.log('THREW:', (e as Error).message); return; }
  const days = Math.round((+new Date(end) - +new Date(start)) / 86_400_000) + 1;
  const step = days >= 357 ? 1 : days / 365, lin = Math.min(1, days / 365);
  const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '015');
  const p12 = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '012');
  const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
  console.log(`days ${days} (step ${step.toFixed(4)}, linear ${lin.toFixed(4)}) | jacket 062 ${fld('albertaTaxableIncome')} | filed: ${(c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ')}`);
  if (!p) { console.log('Schedule 15 NOT filed'); return; }
  const v = new Map<string, number>();
  for (const x of p.values) if (+x.lineItemId.slice(6) === 1) v.set(x.lineItemId.slice(3, 6), Number(x.value));
  console.log('  filed:', [...v].filter(([, x]) => x !== 0).map(([k, x]) => `${k}=${x}`).join(' '));
  const later = p.values.filter((x: any) => +x.lineItemId.slice(6) > 1);
  if (later.length) console.log('  occ 2+:', later.map((x: any) => `${x.lineItemId.slice(3, 6)}#${+x.lineItemId.slice(6)}=${x.value}`).join(' '));
  const n = (l: string) => v.get(l) ?? 0;
  const has = (l: string) => v.has(l);
  const r = (x: number) => Math.round(x);
  const chk = (name: string, ok: boolean, d: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${d}`);
  if (has('001')) {
    const pool = n('001') + n('003') - n('005');
    chk('007 ≤ 001+003−005', n('007') <= Math.max(0, pool), `${n('007')} vs ${pool}`);
    chk('009 = 001+003−005−007', n('009') === pool - n('007'), `${n('009')} vs ${pool - n('007')}`);
    const ps = n('011') + n('013') + n('015') - n('017');
    chk('021 = 011+013+015−017−019', n('021') === ps - n('019'), `${n('021')} vs ${ps - n('019')}`);
  }
  if (has('023')) {
    const pool = n('023') + n('025') + n('027') - n('029');
    chk('031 ≤ pool (0 if negative)', pool < 0 ? n('031') === 0 : n('031') <= pool, `${n('031')} vs ${pool}`);
    chk('033', n('033') === pool - n('031'), `${n('033')} vs ${pool - n('031')}`);
  }
  if (has('041')) {
    const A = n('041') + n('043') + n('044') + n('045') + n('047') + n('049') + n('051') - n('053') - n('055') - n('058') - n('059') - n('060');
    chk('061 (A>0: ≤A; else =A)', A > 0 ? n('061') <= A : n('061') === A, `061 ${n('061')} | A ${A}`);
    chk('063', n('063') === (A > 0 ? A - n('061') : 0), `${n('063')} vs ${A > 0 ? A - n('061') : 0}`);
    const B = n('064') + n('065') + n('067') + n('069') - n('077') - n('079');
    chk('081 (B>0: ≤B; else =B)', B > 0 ? n('081') <= B : n('081') === B, `081 ${n('081')} | B ${B}`);
    chk('083 = B − 081', n('083') === B - n('081'), `${n('083')} vs ${B - n('081')}`);
  }
  if (has('151')) {
    const E = n('151') + n('153') + n('155') + n('157') - n('159') - n('161') - n('165') - n('167');
    chk('169 ≤ 10% × step × E (0 if E≤0)', E <= 0 ? n('169') === 0 : n('169') <= r(0.1 * step * E), `169 ${n('169')} | cap ${E <= 0 ? 0 : r(0.1 * step * E)} (E ${E})`);
    chk('171', n('171') === (E - n('169') > 0 ? E - n('169') : 0), `${n('171')} vs ${Math.max(0, E - n('169'))}`);
    if (E < 0 && has('091')) chk('105 = E when E < 0', n('105') === E, `105 ${n('105')} | E ${E}`);
    const F = n('173') + n('175') + n('177') - n('181') - n('185') - n('187');
    chk('189 ≤ 10% × step × F', F <= 0 ? n('189') === 0 : n('189') <= r(0.1 * step * F), `189 ${n('189')} | cap ${F <= 0 ? 0 : r(0.1 * step * F)}`);
    const lit191 = F - n('189') > 0 ? F - n('189') - n('167') - n('169') : 0;
    chk('191 (literal spec incl. −167 −169)', n('191') === lit191, `${n('191')} vs literal ${lit191} / clean ${Math.max(0, F - n('189'))}`);
  }
  if (has('091')) {
    const C = n('091') + n('093') + n('094') + n('095') + n('097') - n('099') - n('101') - n('103') - n('105') - n('107') - n('111') - n('110') - n('112');
    chk('115 ≤ 30% × step × C (0 if C<0)', C < 0 ? n('115') === 0 : n('115') <= r(0.3 * step * C), `115 ${n('115')} | cap ${C < 0 ? 0 : r(0.3 * step * C)} (C ${C})`);
    chk('117', n('117') === Math.max(0, C - n('115')), `${n('117')} vs ${Math.max(0, C - n('115'))}`);
    const D = n('119') + n('121') + n('123') - n('127') - n('133') - n('135') - n('137');
    chk('141 ≤ 30% × step × D', D < 0 ? n('141') === 0 : n('141') <= r(0.3 * step * D), `141 ${n('141')} | cap ${D < 0 ? 0 : r(0.3 * step * D)}`);
    chk('143', n('143') === Math.max(0, D - n('141')), `${n('143')} vs ${Math.max(0, D - n('141'))}`);
  }
  if (has('201')) {
    const P = n('201') + n('205') - n('207');
    const cap = P <= 0 ? 0 : Math.min(P, Math.max(r(0.1 * (days / 365) * P), n('231')));
    chk('209 = min(pool, max(10% × days/365 × pool, 231))', n('209') <= cap, `209 ${n('209')} | cap ${cap}`);
    chk('211', n('211') === P - n('209'), `${n('211')} vs ${P - n('209')}`);
    const Q = n('213') + n('215') + n('217') - n('219');
    chk('221 = min(pool, 233)', n('221') <= Math.min(Q, n('233')), `221 ${n('221')} | cap ${Math.min(Q, n('233'))}`);
    chk('223', n('223') === Q - n('221'), `${n('223')} vs ${Q - n('221')}`);
  }
  if (has('243')) {
    const P = n('243') + n('247') + n('249') - n('251');
    const cap = Math.min(P, Math.max(r(0.1 * (days / 365) * P), n('257')));
    chk('253 ≤ min(pool, max(10% × days/365 × pool, 257))', n('253') <= cap, `253 ${n('253')} | cap ${cap}`);
    chk('255', n('255') === P - n('253'), `${n('255')} vs ${P - n('253')}`);
  }
  if (has('263')) {
    const P = n('263') + n('265') + n('267') - n('269');
    chk('273 ≤ min(pool, 277)', n('273') <= Math.min(P, n('277')), `273 ${n('273')} | cap ${Math.min(P, n('277'))}`);
  }
  if (has('283')) {
    const P = n('283') + n('285') + n('287') + n('289') - n('291');
    chk('295', n('295') === P - n('293'), `${n('295')} vs ${P - n('293')} (293 ${n('293')})`);
  }
  if (has('303')) {
    const P = n('303') + n('305') + n('307') - n('309');
    const cap = Math.min(r(0.3 * (days / 365) * P), n('317'));
    chk('313 ≤ min(30% × days/365 × pool, Σ317)', n('313') <= cap, `313 ${n('313')} | cap ${cap}`);
  }
  if (p12) {
    const s = new Map(p12.values.map((x: any) => [x.lineItemId.slice(3, 6), x.value]));
    const q = (l: string) => Number(s.get(l) ?? 0);
    console.log('  S12:', ['002', '022', '026', '028', '030', '032', '040', '050', '054', '090'].map((l) => `${l}=${s.get(l) ?? '-'}`).join(' '));
    chk('S12 022 = 007+019+031', q('022') === n('007') + n('019') + n('031'), `${q('022')} vs ${n('007') + n('019') + n('031')}`);
    chk('S12 026 = 061+081', q('026') === n('061') + n('081'), `${q('026')} vs ${n('061') + n('081')}`);
    chk('S12 028 = 115+141', q('028') === n('115') + n('141'), `${q('028')} vs ${n('115') + n('141')}`);
    chk('S12 030 = 209+221+Σ253+Σ273+Σ293+Σ313', q('030') === n('209') + n('221') + n('253') + n('273') + n('293') + n('313'), `${q('030')} vs ${n('209') + n('221') + n('253') + n('273') + n('293') + n('313')}`);
    chk('S12 032 = 169+189', q('032') === n('169') + n('189'), `${q('032')} vs ${n('169') + n('189')}`);
  }
  for (const i of c.issues ?? []) if (/Schedule 15/.test(i)) console.log('  issue:', i.slice(0, 200));
}

go('P1 all pools, full year', ALL);
go('P2 all pools, short year 184 days', ALL, { start: '2024-07-01', end: '2024-12-31' });
go('P3 all pools, 361-day year', ALL, { start: '2024-01-06', end: '2024-12-31' });
go('P4 CCOGPE regular negative −20,000 feeding CDE 105', { cdeRegular: { federalOpeningBalance: 100_000 }, ccogpeRegular: { federalOpeningBalance: 10_000, federalReceivableOnDisposition: 30_000 } });
go('P5 CEE regular negative (assistance > pool)', { ceeRegular: { federalOpeningBalance: 10_000, federalCurrentYearExpenses: 0, federalGovernmentAssistance: 25_000 } });
go('P6 claims above cap: CDE 200,000, EDA AB 100,000', { edaRegular: { federalOpeningBalance: 80_000, federalRegulation1201Claim: 10_000, albertaRegulation1201Claim: 100_000 }, cdeRegular: { federalOpeningBalance: 300_000, claimed: 200_000 } });
go('P7 060/061 = No with a CDE pool', { cdeRegular: { federalOpeningBalance: 300_000 } }, { alberta: no });
go('P8 maximal-fixture shape (arrays)', (maximalReturn as any).albertaResourceDeductions15);
// ── Second pass ────────────────────────────────────────────────────────────
go('P9 CEE successor negative: opening 5,000, other deductions 12,000', { ceeSuccessor: { federalOpeningBalance: 5_000, federalOtherDeductions: 12_000 } });
go('P10 CCOGPE successor negative −15,000 feeding CDE successor 133 (CDE successor 50,000)', {
  cdeSuccessor: { federalOpeningBalance: 50_000 }, ccogpeSuccessor: { federalOpeningBalance: 5_000, federalReceivableOnDisposition: 20_000 },
});
go('P11 CDE regular negative: opening 10,000, receivable 30,000', { cdeRegular: { federalOpeningBalance: 10_000, federalReceivableOnDisposition: 30_000 } });
go('P12 CMEDB negative: opening 5,000, disposal 8,000', { cmedb: { federalOpeningBalance: 5_000, federalDisposalTransfer: 8_000 } });
go('P13 CFRE two countries (regular + successor)', {
  cfreRegular: [
    { countryCode: 'US', federalOpeningBalance: 100_000, federalForeignResourceIncome: 50_000, globalForeignResourceLimit: 10_000 },
    { countryCode: 'GB', federalOpeningBalance: 50_000, federalForeignResourceIncome: 0, globalForeignResourceLimit: 0 },
  ],
  cfreSuccessor: [
    { countryCode: 'US', federalOpeningBalance: 30_000, federalForeignResourceIncome: 1_000 },
    { countryCode: 'GB', federalOpeningBalance: 30_000, federalForeignResourceIncome: 1_000 },
  ],
});
go('P14 FEDE regular: income 30,000 above 10% of pool 100,000', { fedeRegular: { federalOpeningBalance: 100_000, federalForeignResourceIncome: 30_000 } });
