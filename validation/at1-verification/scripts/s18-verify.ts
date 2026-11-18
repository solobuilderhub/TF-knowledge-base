// AT1 Schedule 18 verification — full chain (rendered); every §3.2.3.19 rule recomputed from the FILED 018 lines,
// plus Schedule 12 (040 / 041 / 054) and Schedule 21 (057 / 115) cross-checks.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s18-verify.ts [Y1 …]
import { run } from './s12-verify.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const shares = { description: 'Shares of X', proceeds: 150_000, acb: 80_000, outlays: 2_000, category: 'shares' };
const land = { description: 'Land', proceeds: 300_000, acb: 250_000, outlays: 5_000, category: 'realEstate' };
const PRINT_ONLY = ['062', '070', '075', '079', '097', '099'];

function go(k: string, label: string, input: Record<string, unknown>, alberta: object = yes) {
  if (process.argv[2] && process.argv[2] !== k) return;
  const r = run(`${k} ${label}`, { ...id, alberta, ...input }, { render: true });
  if (!r) return;
  const pay = (s: string) => (r.c.schedulePayloads ?? []).find((x: any) => x.scheduleId === s);
  const p = pay('018');
  if (!p) { console.log('  Schedule 18 NOT in payload'); return; }
  const v = new Map<string, number>(), occ: string[] = [];
  for (const x of p.values) {
    const f = x.lineItemId.slice(3, 6), o = +x.lineItemId.slice(6);
    if (o === 1) v.set(f, Number(x.value)); else occ.push(`${f}#${o}=${x.value}`);
  }
  const d = new Map<string, number>((p.display ?? []).map((x: any) => [x.lineItemId.slice(3, 6), Number(x.value)]));
  const n = (l: string) => v.get(l) ?? 0;
  console.log('  018 non-zero:', [...v].filter(([, x]) => x !== 0 && !Number.isNaN(x)).map(([a, b]) => `${a}=${b}`).join(' '), occ.length ? `| occ 2+: ${occ.join(' ')}` : '');
  console.log('  018 display :', [...d].map(([a, b]) => `${a}=${b}`).join(' '));
  const chk = (name: string, ok: boolean, s: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${s}`);
  const cats: [string, string, string, string][] = [['002', '022', '042', '054'], ['004', '024', '044', '055'], ['006', '026', '046', '056'], ['008', '028', '048', '057']];
  for (const [pr, acb, out, g] of cats) chk(`${g} = ${pr} − (${acb} + ${out})`, n(g) === n(pr) - (n(acb) + n(out)), `${n(g)}`);
  chk('058 = max(0, 010 − (030 + 050))', n('058') === Math.max(0, n('010') - (n('030') + n('050'))), `${n('058')}`);
  chk('059 = 012 − (032 + 052)', n('059') === n('012') - (n('032') + n('052')), `${n('059')}`);
  const s21 = pay('021');
  const s21115 = s21 ? Number(s21.values.find((x: any) => x.lineItemId === '021115001')?.value ?? 0) : undefined;
  if (n('059') <= 0) chk('060 = 0 when 059 ≤ 0', n('060') === 0, `${n('060')}`);
  else chk(`060 = min(059, ${s21 ? 'S21 115' : 'fed 004502'})`, n('060') === Math.min(n('059'), s21115 ?? 0), `060 ${n('060')} | 059 ${n('059')} | S21 115 ${s21115 ?? '(no S21)'}`);
  const lpp = n('059') >= 0 ? n('059') - n('060') : 0;
  const bracket = n('054') + n('055') + n('056') + n('057') + n('058') + lpp + n('064') + n('066') - n('068') - n('071') - n('073') + Math.min(n('077'), n('078'));
  const lit = Math.max(0, Math.round(0.5 * (bracket + n('096') - n('098'))));
  const form = Math.max(0, Math.round(0.5 * (bracket + 2 * n('096') - 2 * n('098'))));
  chk('076 = [… + 096 − 098] × 50% (spec, literal)', n('076') === lit, `filed ${n('076')} | spec ${lit}${lit !== form ? ` | with 096/098 × 2: ${form}` : ''}`);
  if (d.has('099')) chk('display 099 × 50% = filed 076', Math.max(0, Math.round(0.5 * (d.get('099') ?? 0))) === n('076'), `099 ${d.get('099')} → ${Math.max(0, Math.round(0.5 * (d.get('099') ?? 0)))} vs 076 ${n('076')}`);
  const filedPrintOnly = PRINT_ONLY.filter((l) => v.has(l));
  chk('print-only 062/070/075/079/097/099 not transmitted', filedPrintOnly.length === 0, filedPrintOnly.join(' ') || 'none');
  if (v.has('094')) {
    const rows = new Map<number, Record<string, number>>();
    for (const x of p.values) { const o = +x.lineItemId.slice(6); const f = x.lineItemId.slice(3, 6); if (['088', '090', '092'].includes(f)) rows.set(o, { ...(rows.get(o) ?? {}), [f]: Number(x.value) }); }
    const bil = [...rows.values()].reduce((s, r0) => s + Math.min(0, (r0['088'] ?? 0) - ((r0['090'] ?? 0) + (r0['092'] ?? 0))), 0);
    chk('094 = Σ min(0, 088 − (090 + 092)) × ½, negative', n('094') === Math.round(0.5 * bil) && n('094') <= 0, `${n('094')} vs ${Math.round(0.5 * bil)}`);
  }
  const s = (l: string) => r.s12.get(l);
  console.log(`  S12: 040=${s('040') ?? '-'} 041=${s('041') ?? '-'} 054=${s('054')} | S21 057=${s21 ? s21.values.find((x: any) => x.lineItemId === '021057001')?.value : '(no S21)'} 115=${s21115 ?? '-'}`);
  for (const i of r.c.issues ?? []) if (/Schedule 18|ABIL|business investment/i.test(i)) console.log('  issue:', i.slice(0, 200));
}

go('Y1', 'T2 shares + land; Alberta real-estate ACB 260,000 (fed 250,000)', { ...t2, capitalGains: { dispositions: [shares, land] }, albertaSchedule18: { albertaCategories: [{ category: 'realEstate', acb: 260_000 }] } });
go('Y2', 'personal-use loss (proceeds 5,000, ACB 8,000) + shares gain', { ...t2, capitalGains: { dispositions: [shares, { description: 'Boat', proceeds: 5_000, acb: 8_000, category: 'personalUse' }] }, albertaSchedule18: { albertaCategories: [{ category: 'shares', acb: 70_000 }] } });
go('Y3', 'LPP loss −4,000 alongside a shares gain', { ...t2, capitalGains: { dispositions: [shares, { description: 'Painting', proceeds: 2_000, acb: 6_000, category: 'listedPersonal' }] }, albertaSchedule18: { albertaCategories: [{ category: 'shares', acb: 70_000 }] } });
go('Y4', 'LPP gain 6,000; S21 LPP opening 5,000; S18 unapplied LPP losses blank', { ...t2, capitalGains: { dispositions: [{ description: 'Coins', proceeds: 10_000, acb: 4_000, category: 'listedPersonal' }] }, albertaSchedule18: { albertaCategories: [{ category: 'listedPersonal', acb: 4_000 }] }, albertaContinuity: { lppOpening: 5_000 } });
go('Y5', 'capital gains reserve: fed opening 10,000 / closing 4,000; Alberta closing 6,000', { ...t2, capitalGains: { dispositions: [shares] }, albertaSchedule18: { federalReserveOpening: 10_000, federalReserveClosing: 4_000, albertaReserveClosing: 6_000 } });
go('Y6', 's.34.2 taxable capital gains 1,000 (federal Schedule 73 line 275)', { ...t2, capitalGains: { dispositions: [shares] }, albertaSchedule18: { section342TaxableCapitalGains: 1_000 } });
go('Y7', 'donated securities 5,000; exemption threshold 3,000 / actual-property gains 2,000', { ...t2, capitalGains: { dispositions: [shares] }, albertaSchedule18: { gainOnDonatedSecurities: 5_000, exemptionThreshold: 3_000, capitalGainsFromActualProperty: 2_000 } });
go('Y8', 'ABIL: loss row (1,000 / 90,000 / 500) + a gain row (50,000 / 10,000)', { ...t2, albertaSchedule18: { abilEntries: [
  { name: 'Failed Startup Ltd.', kind: 'shares', dateOfAcquisition: '2019-03-01', proceeds: 1_000, acb: 90_000, outlays: 500 },
  { name: 'Winner Ltd.', kind: 'shares', dateOfAcquisition: '2018-01-01', proceeds: 50_000, acb: 10_000 },
] } });
go('Y9', 'jacket 060 = 061 = No with an Alberta ACB difference', { ...t2, capitalGains: { dispositions: [shares, land] }, albertaSchedule18: { albertaCategories: [{ category: 'realEstate', acb: 260_000 }] } }, no);
go('Y10', 'AT1-only: S12 002 = 500,000; Alberta shares proceeds 100,000 ACB 60,000', { albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaSchedule18: { albertaCategories: [{ category: 'shares', proceeds: 100_000, acb: 60_000 }] } });
