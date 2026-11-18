// AT1 Schedule 16 verification — full chain (rendered), every §3.2.3.17 rule recomputed from the FILED 016 lines,
// plus the Schedule 12 034/035/054 checks from s12-verify.ts.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s16-verify.ts [U1 …]
import { run } from './s12-verify.ts';
import { maximalReturn } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const s12 = { albertaSchedule12: { federalNetIncomeForTax: 500_000 } };
const base = { currentYearExpenditures: 120_000, assistance: 10_000, priorYearItcClaimed: 5_000, openingPoolBalance: 30_000 };

function go(k: string, label: string, s16: Record<string, unknown>, alberta: object = yes) {
  if (process.argv[2] && process.argv[2] !== k) return;
  const r = run(`${k} ${label}`, { ...id, alberta, ...s12, albertaSred16: s16 }, { render: true });
  if (!r) return;
  const p = (r.c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '016');
  if (!p) { console.log('  Schedule 16 NOT in payload'); return; }
  const v = new Map<string, number>(p.values.map((x: any) => [x.lineItemId.slice(3, 6), Number(x.value)]));
  const n = (l: string) => v.get(l) ?? 0;
  console.log('  016 filed:', [...v].map(([a, b]) => `${a}=${b}`).join(' '));
  const chk = (name: string, ok: boolean, d: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${d}`);
  const sub = n('002') - (n('004') + n('006') + n('008')) + n('010') + n('012') + n('014') + n('015');
  chk('016 = 002 − (004+006+008) + 010 + 012 + 014 + 015', n('016') === sub, `${n('016')} vs ${sub}`);
  chk('018 = 016 if positive, else 0', n('018') === Math.max(0, n('016')), `${n('018')}`);
  chk('020 ≤ 018', n('020') <= n('018'), `020 ${n('020')} | 018 ${n('018')}`);
  chk('022 = 018 − 020', n('022') === n('018') - n('020'), `${n('022')}`);
  const s12034 = r.s12.get('034');
  chk('S12 034 = 016 if negative, else 020', s12034 === (n('016') < 0 ? n('016') : n('020')), `034 ${s12034 ?? '(absent)'}`);
  if (s16.federalAmountClaimed !== undefined) {
    const differs = Number(s16.federalAmountClaimed) !== (s12034 ?? 0);
    chk('S12 035 filed when the federal claim differs (and when S16 exists)', r.s12.has('035'), `035 ${r.s12.get('035') ?? '(absent)'} | fed claim ${s16.federalAmountClaimed}${differs ? '' : ' (equal)'}`);
  }
  for (const i of r.c.issues ?? []) if (/Schedule 16|SR&ED/.test(i)) console.log('  issue:', i.slice(0, 200));
}

go('U1', 'baseline: exp 120,000, assistance 10,000, prior ITC 5,000, opening 30,000, claim 40,000 = fed claim', { ...base, amountClaimed: 40_000, federalOpeningPoolBalance: 30_000, federalAmountClaimed: 40_000 });
go('U2', 'claim blank → claims the whole pool', { ...base });
go('U3', 'claim 200,000 > available 135,000', { ...base, amountClaimed: 200_000 });
go('U4', 'negative subtotal: exp 10,000, assistance 30,000, fed claim 0', { currentYearExpenditures: 10_000, assistance: 30_000, federalAmountClaimed: 0 });
go('U5', 'Alberta opening blank, federal opening 30,000 (same), exp 50,000, claim 20,000 = fed', { currentYearExpenditures: 50_000, amountClaimed: 20_000, federalOpeningPoolBalance: 30_000, federalAmountClaimed: 20_000 });
go('U5b', 'federal opening 30,000 only, nothing else typed', { federalOpeningPoolBalance: 30_000 });
go('U6', 'opening differs (Alberta 30,000 vs fed 20,000), claims equal 40,000', { ...base, amountClaimed: 40_000, federalOpeningPoolBalance: 20_000, federalAmountClaimed: 40_000 });
go('U7', 'jacket 060 = 061 = No, claim 40,000 vs fed 25,000', { ...base, amountClaimed: 40_000, federalAmountClaimed: 25_000 }, no);
go('U8', 'all components: repayments 2,000, transfer 3,000, ITC recaptured 1,000, sale 4,000', { ...base, saleOfCapitalAssetsAndOther: 4_000, assistanceRepayments: 2_000, poolTransferredIn: 3_000, priorYearItcRecaptured: 1_000, amountClaimed: 0, federalAmountClaimed: 0 });
