// AT1 Schedule 21 verification — full BE chain; every §3.2.3.21 rule recomputed from the FILED lines.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s21-verify.ts [R1 …]
import { computeFederalT2 } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const at1Only = (s12: Record<string, unknown>) => ({ albertaSchedule12: s12 });

function go(label: string, input: Record<string, any>) {
  if (process.argv[2] && !label.startsWith(process.argv[2] + ' ')) return;
  console.log(`\n================ ${label}`);
  let c: any, federal: any;
  try {
    const full = { ...id, alberta: yes, ...input };
    const a = assembleT2Input(full as never, { taxYearStart: new Date('2024-01-01'), taxYearEnd: new Date('2024-12-31'), program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
    federal = computeFederalT2(fed as never) as any;
    c = runAT1Compute(assembleProvincialInput('AT1', fed, full as never, { isCcpc: true })) as any;
  } catch (e) { console.log('THREW:', (e as Error).message); return; }
  const pay = (s: string) => (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === s);
  const map = (s: string) => {
    const r = new Map<string, Map<number, any>>();
    for (const v of pay(s)?.values ?? []) {
      const f = v.lineItemId.slice(3, 6), o = +v.lineItemId.slice(6);
      if (!r.has(f)) r.set(f, new Map());
      r.get(f)!.set(o, v.value);
    }
    return r;
  };
  const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
  console.log(`fed: net income ${federal.netIncomeForTax} | non-cap opening ${federal.losses?.nonCapital?.openingBalance} applied ${federal.losses?.nonCapital?.appliedCurrentYear} | jacket 062 ${fld('albertaTaxableIncome')} | filed: ${(c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ')}`);
  const s21 = map('021'), s12 = map('012'), s10 = map('010'), s18 = map('018');
  if (!pay('021')) { console.log('Schedule 21 NOT filed'); return; }
  const n = (m: Map<string, Map<number, any>>, l: string, o = 1) => Number(m.get(l)?.get(o) ?? 0);
  const has = (m: Map<string, Map<number, any>>, l: string, o = 1) => m.get(l)?.has(o) ?? false;
  const v = (l: string) => n(s21, l);
  const single = [...s21].filter(([, occ]) => occ.size === 1 && occ.has(1)).map(([k, occ]) => `${k}=${occ.get(1)}`);
  console.log('  021:', single.join(' '));
  const multi = [...s21].filter(([, occ]) => occ.size > 1 || !occ.has(1));
  if (multi.length) console.log('  021 occurrences:', multi.map(([k, occ]) => `${k}[${[...occ].map(([o, x]) => `${o}:${x}`).join(',')}]`).join(' '));
  const chk = (name: string, ok: boolean, d: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${d}`);

  // Part 1
  chk('001 = S12 054', v('001') === n(s12, '054'), `${v('001')} vs ${n(s12, '054')}`);
  if (has(s21, '002')) chk('002 = 240', v('002') === v('240'), `${v('002')} vs ${v('240')}`);
  if (has(s21, '061')) chk('003 = 061 × ½ (present with 061)', has(s21, '003') && v('003') === Math.round(v('061') * 0.5), `${has(s21, '003') ? v('003') : '(absent)'} vs ${Math.round(v('061') * 0.5)}`);
  for (const [a, b] of [['005', '061'], ['007', '063'], ['011', '079'], ['012', '141'], ['017', '082']] as const)
    if (has(s21, a) || n(s12, b)) chk(`${a} = S12 ${b}`, v(a) === n(s12, b), `${v(a)} vs ${n(s12, b)}`);
  const d13 = v('002') + v('003') + v('005') + v('007') + v('011') + v('012');
  const base = v('001') - d13;
  const exp021 = base > 0 ? Math.min(0, 0 - v('017') + v('019')) : Math.min(0, base - v('017') + v('019'));
  chk('021 formula', v('021') === exp021, `${v('021')} vs ${exp021}`);
  // Non-capital
  chk('033 = 031 − 032', v('033') === v('031') - v('032'), `${v('033')} vs ${v('031') - v('032')}`);
  chk('037 = −021', v('037') === -v('021'), `${v('037')} vs ${-v('021')}`);
  chk('049 formula', v('049') === v('033') + v('035') + v('037') - v('041') - v('043') - v('045') - v('047'), `${v('049')} vs ${v('033') + v('035') + v('037') - v('041') - v('043') - v('045') - v('047')}`);
  chk('047 = S10 004+006+008', v('047') === n(s10, '004') + n(s10, '006') + n(s10, '008'), `${v('047')}`);
  chk('031 = federal balance when Alberta not stated', v('031') === (federal.losses?.nonCapital?.openingBalance ?? 0) || input.albertaContinuity?.nonCapitalOpening !== undefined, `031 ${v('031')} | fed ${federal.losses?.nonCapital?.openingBalance ?? 0}`);
  chk('041 = fed 004130 when Alberta not stated', v('041') === (federal.losses?.nonCapital?.appliedCurrentYear ?? 0) || input.albertaContinuity?.nonCapitalApplied !== undefined, `041 ${v('041')} | fed ${federal.losses?.nonCapital?.appliedCurrentYear ?? 0}`);
  // Capital
  chk('069 formula', v('069') === v('051') + v('055') + v('057') + v('059') - v('061') - v('063') - v('065') - v('067'), `${v('069')}`);
  if (v('057') > 0) chk('061 = 0 when 057 > 0', v('061') === 0, `061 ${v('061')}`);
  const fedGain = Math.max(0, federal.capitalGains?.netCapitalGain ?? federal.capitalGains?.capitalGain ?? 0);
  if (v('061') > 0 && !pay('018')) chk('061 ≤ fed 006890 − 006895 (no S18)', v('061') <= fedGain, `061 ${v('061')} | federal gain ${fedGain}`);
  // 057 — current-year capital loss: Schedule 18's bracket × −1, else −(fed 006890 − 006895).
  if (pay('018')) {
    const q = (l: string) => n(s18, l);
    const br = q('054') + q('055') + q('056') + q('057') + q('058') + (q('059') >= 0 ? q('059') - q('060') : 0) + q('064') + q('066') - q('068') - q('075');
    chk('057 = −(S18 054+…−075) if negative', v('057') === (br < 0 ? -br : 0), `057 ${v('057')} | S18 bracket ${br}`);
  } else if (federal.capitalGains) {
    console.log(`  fed capitalGains: ${JSON.stringify(federal.capitalGains).slice(0, 240)}`);
  }
  // Schedule 10 cross-links (only when Schedule 10 is filed)
  if (pay('010')) {
    const t = (...ls: string[]) => ls.reduce((s, l) => s + n(s10, l), 0);
    chk('047 = 010004+006+008', v('047') === t('004', '006', '008'), `${v('047')} vs ${t('004', '006', '008')}`);
    chk('067 = 010044+046+048', v('067') === t('044', '046', '048'), `${v('067')} vs ${t('044', '046', '048')}`);
    chk('085 = 010014+016+018', v('085') === t('014', '016', '018'), `${v('085')} vs ${t('014', '016', '018')}`);
    const other = t('034', '036', '038'), b23 = n(s10, '023'), b25 = n(s10, '025');
    if (b23 === 1 && b25 === 2) chk('105 = 010034+036+038 (023 only)', v('105') === other, `${v('105')} vs ${other}`);
    if (b25 === 1 && b23 === 2) chk('123 = 010034+036+038 (025 only)', v('123') === other, `${v('123')} vs ${other}`);
    if (b23 === 1 && b25 === 1) chk('105 ≤ total, 123 ≤ total, 105 + 123 = total (both)', v('105') <= other && v('123') <= other && v('105') + v('123') === other, `105 ${v('105')} + 123 ${v('123')} vs ${other}`);
    chk('S10 002 = 037', n(s10, '002') === v('037'), `${n(s10, '002')} vs ${v('037')}`);
    chk('S10 012 = 077', n(s10, '012') === v('077'), `${n(s10, '012')} vs ${v('077')}`);
    chk('S10 042 = 057', n(s10, '042') === v('057'), `${n(s10, '042')} vs ${v('057')}`);
  }
  // 099 — "cannot exceed the Alberta farm income for the year" (no farm income is modelled AT1-side)
  if (v('099') > 0) console.log(`  NOTE 099 = ${v('099')} applied against farming income — no Alberta farm income figure exists to cap it`);
  // AOL 181-187
  for (const [o] of s21.get('181') ?? []) {
    const yi = n(s21, '181', o);
    chk(`187 absent on AOL occ ${o} when year ${yi} > 7`, yi <= 7 || !has(s21, '187', o), `187 ${has(s21, '187', o) ? n(s21, '187', o) : '(absent)'}`);
  }
  // Farm / restricted farm / LPP
  chk('073 = 071 − 072', v('073') === v('071') - v('072'), `${v('073')}`);
  chk('077 = 019', v('077') === v('019'), `${v('077')} vs ${v('019')}`);
  chk('087 formula', v('087') === v('073') + v('075') + v('077') - v('079') - v('081') - v('083') - v('085'), `${v('087')}`);
  chk('093 = 091 − 092', v('093') === v('091') - v('092'), `${v('093')}`);
  chk('107 formula', v('107') === v('093') + v('095') + v('097') - v('099') - v('101') - v('103') - v('105'), `${v('107')}`);
  chk('115 = 111 − 113', v('115') === v('111') - v('113'), `${v('115')}`);
  chk('125 formula', v('125') === v('115') + v('117') - v('119') - v('121') - v('123'), `${v('125')}`);
  if (pay('018')) {
    const lppNet = n(s18, '012') - n(s18, '032') - n(s18, '052');
    chk('117 = −(018012 − 032 − 052) if negative (S18 exists)', v('117') === (lppNet < 0 ? -lppNet : 0), `117 ${v('117')} | S18 LPP net ${lppNet}`);
    chk('119 = 018060 (S18 exists)', v('119') === n(s18, '060'), `119 ${v('119')} | 018060 ${n(s18, '060')}`);
  }
  // Limited partnerships
  for (const [o] of s21.get('133') ?? []) {
    const close = n(s21, '133', o) + n(s21, '135', o) + n(s21, '137', o) - n(s21, '139', o);
    chk(`141 occ ${o}`, n(s21, '141', o) === close, `${n(s21, '141', o)} vs ${close}`);
  }
  // RIFE
  if (has(s21, '250')) {
    chk('250 formula', v('250') === v('200') + v('210') - v('220') + v('230') - v('240'), `${v('250')}`);
    chk('310 = 200 + 210 − 220', v('310') === v('200') + v('210') - v('220'), `${v('310')}`);
    chk('350 = min(310, 320 + 330)', v('350') === Math.min(v('310'), v('320') + v('330')), `${v('350')}`);
  }
  // Year of origin
  for (const [o] of s21.get('151') ?? []) {
    const row = (l: string) => n(s21, l, o);
    const bal = row('155') + row('157') + row('159') - row('165') - row('167');
    chk(`169 occ ${o} (year ${row('151')})`, row('169') === bal, `${row('169')} vs ${bal}`);
    const needs153 = ['155', '159', '167', '169'].some((l) => has(s21, l, o));
    chk(`153 present on occ ${o} (required with 155/159/167/169)`, !needs153 || has(s21, '153', o), has(s21, '153', o) ? String(s21.get('153')!.get(o)) : '(absent)');
    if (row('151') === 0) chk('157 occ 0 = 021 (literal)', row('157') === v('021'), `157 ${row('157')} | 021 ${v('021')}`);
  }
  // Schedule 12 links
  if (pay('012')) {
    chk('S12 064 = 041', n(s12, '064') === v('041'), `${n(s12, '064')} vs ${v('041')}`);
    chk('S12 066 = 061 × ½', n(s12, '066') === Math.round(v('061') * 0.5), `${n(s12, '066')}`);
    chk('S12 068 = 099', n(s12, '068') === v('099'), `${n(s12, '068')} vs ${v('099')}`);
    chk('S12 070 = 079', n(s12, '070') === v('079'), `${n(s12, '070')} vs ${v('079')}`);
    const lp = [...(s21.get('139') ?? new Map()).values()].reduce((t: number, x: any) => t + Number(x), 0);
    chk('S12 072 = Σ139', n(s12, '072') === lp, `${n(s12, '072')} vs ${lp}`);
    if (has(s21, '240')) chk('S12 130 = 240', n(s12, '130') === v('240'), `${n(s12, '130')} vs ${v('240')}`);
    console.log(`  S12: 054=${n(s12, '054')} 064=${n(s12, '064')} 065=${n(s12, '065')} 090=${n(s12, '090')}`);
  }
  for (const i of c.issues ?? []) if (/Schedule 21|limited partnership|Line 240|line 0(37|61)/i.test(i)) console.log('  issue:', i.slice(0, 220));
}

go('R1 T2 path: fed non-cap opening 50,000 applied 20,000; Alberta S21 opened, nothing typed', {
  ...t2, losses: { nonCapitalOpening: 50_000, nonCapitalApplied: 20_000 }, albertaContinuity: {},
});
go('R2 AT1-only income 100,000 with farm loss 8,000', { ...at1Only({ federalNetIncomeForTax: 100_000 }), albertaContinuity: { farmCurrentYearLoss: 8_000 } });
go('R3 AT1-only loss −50,000; fed 320 10,000; 355 900; farm loss 8,000', {
  ...at1Only({ federalNetIncomeForTax: -50_000, taxableDividendsDeductible: 10_000, section110_5Additions: 900 }),
  albertaContinuity: { farmCurrentYearLoss: 8_000 },
});
go('R4 T2 capital gain 40,000; Alberta capital opening 30,000 applied 30,000', {
  ...t2, capitalGains: { dispositions: [{ description: 'Shares', proceeds: 100_000, acb: 60_000, category: 'shares' }] },
  albertaContinuity: { capitalOpening: 30_000, capitalApplied: 30_000 },
});
go('R4b same, capital applied 50,000 (> gain 40,000), opening 60,000', {
  ...t2, capitalGains: { dispositions: [{ description: 'Shares', proceeds: 100_000, acb: 60_000 }] },
  albertaContinuity: { capitalOpening: 60_000, capitalApplied: 50_000 },
});
go('R5 limited partnerships: new LP with only a current-year loss; LP-1 applied above balance', {
  ...at1Only({ federalNetIncomeForTax: 100_000 }),
  albertaContinuity: { limitedPartnerships: [{ identifier: 'LP-NEW', currentYearLoss: 5_000 }, { identifier: 'LP-1', precedingYearBalance: 7_000, applied: 9_000 }] },
});
go('R6 RIFE opening 12,000, current 3,000, excess capacity 5,000', {
  ...at1Only({ federalNetIncomeForTax: 100_000 }), albertaContinuity: { rife: { openingBalance: 12_000, currentYearRife: 3_000, excessCapacity: 5_000 } },
});
go('R7 LPP gain 6,000 on S18, S18 unapplied LPP losses 5,000, S21 LPP opening 5,000', {
  ...t2, capitalGains: { dispositions: [{ description: 'Coin collection', proceeds: 10_000, acb: 4_000, category: 'listedPersonal' }] },
  albertaSchedule18: { unappliedLppLosses: 5_000 }, albertaContinuity: { lppOpening: 5_000 },
});
go('R7b LPP loss 4,000 on S18 (proceeds 2,000, ACB 6,000), S21 LPP blank', {
  ...t2, capitalGains: { dispositions: [{ description: 'Painting', proceeds: 2_000, acb: 6_000, category: 'listedPersonal' }] },
  albertaSchedule18: { unappliedLppLosses: 0 }, albertaContinuity: {},
});
// ── Second pass: cross-form rules ──────────────────────────────────────────
const lossYear = { incomeStatement: { revenue: 100_000, otherExpenses: 150_000 } };
const s10cont = {
  farmCurrentYearLoss: 8_000, restrictedFarmCurrentYearLoss: 2_000, lppCurrentYearLoss: 1_000,
  otherLossIncludesRestrictedFarm: 'yes', otherLossIncludesListedPersonal: 'yes', capitalCurrentYearLoss: 10_000,
  nonCapitalCarrybacks: [{ amount: 20_000 }, { amount: 10_000 }], farmCarrybacks: [{}, { amount: 3_000 }],
  otherLossCarrybacks: [{ amount: 1_500 }], capitalCarrybacks: [{}, {}, { amount: 4_000 }],
};
go('R9 Schedule 10 links (both 023 and 025 ticked)', { ...lossYear, albertaContinuity: s10cont });
go('R9b Schedule 10 links (023 only), other carry-back 800', { ...lossYear, albertaContinuity: { ...s10cont, otherLossIncludesListedPersonal: 'no', otherLossCarrybacks: [{ amount: 800 }] } });
go('R10 capital loss year, no Schedule 18 (uncategorized: proceeds 50,000, ACB 80,000)', {
  ...t2, capitalGains: { dispositions: [{ description: 'Shares', proceeds: 50_000, acb: 80_000 }] }, albertaContinuity: {},
});
go('R10b capital loss year with Schedule 18 (category shares)', {
  ...t2, capitalGains: { dispositions: [{ description: 'Shares', proceeds: 50_000, acb: 80_000, category: 'shares' }] }, albertaContinuity: {},
});
go('R11 restricted farm applied 10,000, no farm income', {
  ...at1Only({ federalNetIncomeForTax: 100_000 }), albertaContinuity: { restrictedFarmOpening: 10_000, restrictedFarmApplied: 10_000 },
});
go('R12 other-loss year of origin: farm 5,000 year 1; LPP 500 year 9', {
  ...at1Only({ federalNetIncomeForTax: 100_000 }),
  albertaContinuity: { otherLossVintages: [{ yearIndex: 1, farmLosses: 5_000 }, { yearIndex: 9, listedPersonalPropertyLosses: 500 }] },
});
go('R13 filing condition: T2 loss year, Alberta CCA differs (S13), no Alberta S21 entered', {
  ...lossYear, cca: { classes: [{ ccaClass: '8', openingUCC: 100_000 }] }, albertaCca13: { classes: [{ ccaClass: '8', claim: 0 }] },
});
go('R14 Part 1 007 / 011 / 012: loss −50,000; 325 2,000, 350 1,500, 352 800', {
  ...at1Only({ federalNetIncomeForTax: -50_000, partVI1TaxDeductible: 2_000, prospectorsShares: 1_500, nonQualifiedSecuritiesDeduction: 800 }),
  albertaContinuity: {},
});
go('R15 017 above fed 355: Alberta s.110.5 1,500 vs fed 900', {
  ...at1Only({ federalNetIncomeForTax: -50_000, section110_5Additions: 900, albertaSection110_5Additions: 1_500 }), albertaContinuity: {},
});
go('R8 non-capital vintages: 1 year ago 40,000 applied 10,000; AB opening 40,000 applied 10,000', {
  ...at1Only({ federalNetIncomeForTax: 100_000 }),
  albertaContinuity: { nonCapitalOpening: 40_000, nonCapitalApplied: 10_000, nonCapitalVintages: [{ yearsAgo: 1, taxYearEnd: '2023-12-31', balanceAtBeginning: 40_000, applied: 10_000 }] },
});
