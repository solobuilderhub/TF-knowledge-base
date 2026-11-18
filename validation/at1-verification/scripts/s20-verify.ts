// AT1 Schedule 20 verification — full chain (rendered); every §3.2.3.20 rule recomputed from the FILED 020 lines,
// plus Schedule 12 (054 / 056 / 058 / 090) cross-checks.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s20-verify.ts [D1 …]
import { run } from './s12-verify.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const at1 = (income: number) => ({ albertaSchedule12: { federalNetIncomeForTax: income } });
const PRINT_ONLY = ['006', '012', '014', '042', '044', '046', '048', '066', '072', '074'];

function go(k: string, label: string, input: Record<string, unknown>, alberta: object = yes) {
  if (process.argv[2] && process.argv[2] !== k) return;
  const r = run(`${k} ${label}`, { ...id, alberta, ...input }, { render: true });
  if (!r) return;
  const p = (r.c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '020');
  const s = (l: string) => r.s12.get(l) ?? 0;
  if (!p) { console.log(`  Schedule 20 NOT in payload | S12 054 ${s('054')} 090 ${s('090')}`); return; }
  const v = new Map<string, number>(), occ: string[] = [];
  for (const x of p.values) { const o = +x.lineItemId.slice(6), f = x.lineItemId.slice(3, 6); if (o === 1) v.set(f, Number(x.value)); if (['090', '092', '094', '096', '098', '100'].includes(f)) occ.push(`${f}#${o}=${x.value}`); }
  const d = new Map<string, number>((p.display ?? []).map((x: any) => [x.lineItemId.slice(3, 6), Number(x.value)]));
  const n = (l: string) => v.get(l) ?? 0;
  console.log('  020 values :', [...v].filter(([, x]) => !Number.isNaN(x)).map(([a, b]) => `${a}=${b}`).join(' '), occ.length ? `| carryforward: ${occ.join(' ')}` : '');
  console.log('  020 display:', [...d].map(([a, b]) => `${a}=${b}`).join(' '));
  const chk = (name: string, ok: boolean, t: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${t}`);
  const ni = s('054');
  if (v.has('016')) {
    const pool = n('002') - n('004') + n('008') + n('010') - n('013');
    const max048 = n('030') + 0.25 * (n('032') + n('034') + Math.min(n('036'), Math.min(n('038'), n('040'))));
    const cap = Math.max(0, Math.min(pool, Math.round(max048), ni));
    chk('030 = max(0, 054 × 75%)', n('030') === Math.max(0, Math.round(ni * 0.75)), `${n('030')} vs ${Math.max(0, Math.round(ni * 0.75))}`);
    chk('016 ≤ least of (pool, 048, 054)', n('016') <= cap, `016 ${n('016')} | pool ${pool}, 048 ${Math.round(max048)}, 054 ${ni}`);
    chk('018 = 002 − 004 + 008 + 010 − 013 − 016', n('018') === pool - n('016'), `${n('018')} vs ${pool - n('016')}`);
    chk('S12 056 = 016', s('056') === n('016'), `${s('056')}`);
  }
  if (v.has('076')) {
    const pool = n('062') - n('064') + n('068') + n('070') - n('073');
    const cap = Math.max(0, Math.min(pool, ni - n('016')));
    chk('076 ≤ lesser of (pool, 054 − 056)', n('076') <= cap, `076 ${n('076')} | pool ${pool}, 054 − 056 = ${ni - n('016')}`);
    chk('078 = 062 − 064 + 068 + 070 − 073 − 076', n('078') === pool - n('076'), `${n('078')}`);
    chk('S12 058 = 076', s('058') === n('076'), `${s('058')}`);
  }
  const printed = PRINT_ONLY.filter((l) => v.has(l));
  chk('print-only lines not transmitted', printed.length === 0, printed.join(' ') || 'none');
  chk('Alberta taxable income (090) not driven below 0 by donations', s('090') >= 0 || ni < 0, `054 ${ni} → 090 ${s('090')}`);
  if (ni <= 0) chk('no Schedule 20 in a nil-income or loss year', false, `054 = ${ni} but Schedule 20 is filed`);
  for (const i of r.c.issues ?? []) if (/Schedule 20|donation|gift/i.test(i)) console.log('  issue:', i.slice(0, 200));
}

go('D1', 'T2: charitable 40,000, cultural 4,000, ecological 6,000, opening pool 10,000; Alberta gifts opening 2,000', {
  ...t2, donations: { charitable: 40_000, cultural: 4_000, ecological: 6_000, openingDonationPool: 10_000 }, albertaDonations: { giftsOpening: 2_000 },
});
go('D2', 'AT1-only income 32,000: charitable 30,000, gifts 20,000', { ...at1(32_000), albertaDonations: { charitableCurrentYear: 30_000, giftsCurrentYear: 20_000 } });
go('D3', 'AT1-only income 10,000: charitable 50,000, taxable gains on gifts 40,000', { ...at1(10_000), albertaDonations: { charitableCurrentYear: 50_000, taxableCapitalGainsOnGifts: 40_000 } });
go('D4', 'AT1-only loss year −50,000: charitable 10,000', { ...at1(-50_000), albertaDonations: { charitableCurrentYear: 10_000 } });
go('D5', 'AT1-only income 100,000: charitable 50,000, claim typed 90,000 (max 75,000)', { ...at1(100_000), albertaDonations: { charitableCurrentYear: 50_000, charitableOpening: 40_000, charitableApplied: 90_000 } });
go('D6', 'T2 charitable 40,000; Alberta claim 20,000; jacket 060 = 061 = No', { ...t2, donations: { charitable: 40_000 }, albertaDonations: { charitableApplied: 20_000 } }, no);
go('D7', 'AT1-only income 5,000: charitable 10,000 + a carryforward row (2023, charitable 3,000); no gifts', {
  ...at1(5_000), albertaDonations: { charitableCurrentYear: 10_000, carryforwardRows: [{ yearOfOrigin: '2023-12-31', charitable: 3_000 }] },
});
go('D8', 'AT1-only income 100,000: gifts 10,000, gifts claim typed 50,000', { ...at1(100_000), albertaDonations: { giftsCurrentYear: 10_000, giftsApplied: 50_000 } });
