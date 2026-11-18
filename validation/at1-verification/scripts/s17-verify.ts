// AT1 Schedule 17 verification — full chain (rendered); every §3.2.3.18 rule recomputed from the FILED 017 lines,
// plus the Schedule 12 036-039 / 054 checks from s12-verify.ts.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s17-verify.ts [X1 …]
import { run } from './s12-verify.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const no = { ...yes, reportsDifferentAlbertaIncome: 'no', electsDifferentDiscretionaryAmounts: 'no' };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const OPEN = ['001', '003', '005', '009', '011', '013', '015', '017'];
const XFER = ['031', '033', '035', '039', '041', '043', '045', '047'];
const CLOSE = ['061', '063', '065', '069', '071', '073', '075', '077'];
const PRINT_ONLY = ['021', '051', '081', '091'];

function go(k: string, label: string, input: Record<string, unknown>, alberta: object = yes) {
  if (process.argv[2] && process.argv[2] !== k) return;
  const r = run(`${k} ${label}`, { ...id, alberta, ...input }, { render: true });
  if (!r) return;
  const p = (r.c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '017');
  if (!p) { console.log('  Schedule 17 NOT in payload'); return; }
  const v = new Map<string, number>(p.values.map((x: any) => [x.lineItemId.slice(3, 6), Number(x.value)]));
  const n = (l: string) => v.get(l) ?? 0;
  const S = (ls: string[]) => ls.reduce((t, l) => t + n(l), 0);
  console.log('  017 non-zero:', [...v].filter(([, x]) => x !== 0).map(([a, b]) => `${a}=${b}`).join(' '), `| lines filed: ${v.size}`);
  const chk = (name: string, ok: boolean, d: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${d}`);
  chk('021 = Σ opening', n('021') === S(OPEN), `${n('021')} vs ${S(OPEN)}`);
  chk('051 = Σ transfer', n('051') === S(XFER), `${n('051')} vs ${S(XFER)}`);
  chk('081 = Σ closing', n('081') === S(CLOSE), `${n('081')} vs ${S(CLOSE)}`);
  chk('091 = 021 + 051', n('091') === n('021') + n('051'), `${n('091')}`);
  const printOnlyFiled = PRINT_ONLY.filter((l) => v.has(l));
  chk('print-only 021/051/081/091 not transmitted', printOnlyFiled.length === 0, printOnlyFiled.length ? `filed: ${printOnlyFiled.join(' ')}` : 'none');
  const zeros = [...v].filter(([l, x]) => x === 0 && !PRINT_ONLY.includes(l)).length;
  chk('X lines with no amount omitted', zeros === 0, `${zeros} zero lines filed`);
  const s = (l: string) => r.s12.get(l);
  console.log(`  S12: 036=${s('036') ?? '-'} 037=${s('037') ?? '-'} 038=${s('038') ?? '-'} 039=${s('039') ?? '-'} 050=${s('050')} 054=${s('054')}`);
  if (s('036') !== undefined) chk('S12 036 = Σ opening + Σ transfer (017021 + 017051)', s('036') === S(OPEN) + S(XFER), `${s('036')} vs ${S(OPEN) + S(XFER)}`);
  if (s('038') !== undefined) chk('S12 038 = Σ closing (017081)', s('038') === S(CLOSE), `${s('038')} vs ${S(CLOSE)}`);
  for (const i of r.c.issues ?? []) if (/Schedule 17|reserve/i.test(i)) console.log('  issue:', i.slice(0, 200));
}

go('X1', 'T2: doubtful debts open 5,000 close 8,000; Alberta close 9,000', {
  ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, transfer: 0, closing: 8_000 }] },
  albertaReserves17: { rows: [{ type: 'doubtfulDebts', closing: 9_000 }] },
});
go('X2', 'AT1-only (S12 002 = 500,000): Alberta doubtful debts open 5,000 close 9,000', {
  albertaSchedule12: { federalNetIncomeForTax: 500_000 }, albertaReserves17: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 9_000 }] },
});
go('X3', 'T2 + Alberta-only kind: insurance policy reserves close 4,000', {
  ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 8_000 }] },
  albertaReserves17: { rows: [{ type: 'insurancePolicyReserves', closing: 4_000 }] },
});
go('X4', 'two Alberta rows of the same kind (close 3,000 + 2,000)', {
  ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 8_000 }] },
  albertaReserves17: { rows: [{ type: 'doubtfulDebts', closing: 3_000 }, { type: 'doubtfulDebts', closing: 2_000 }] },
});
go('X5', 'jacket 060 = 061 = No with an Alberta reserve', {
  ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 8_000 }] },
  albertaReserves17: { rows: [{ type: 'doubtfulDebts', closing: 9_000 }] },
}, no);
go('X6', 'transfer: T2 transfer 0; Alberta transfer 1,000 on undelivered goods (fed open 2,000 close 2,500)', {
  ...t2, reserves: { rows: [{ type: 'undeliveredGoodsAndServices', opening: 2_000, transfer: 0, closing: 2_500 }] },
  albertaReserves17: { rows: [{ type: 'undeliveredGoodsAndServices', transfer: 1_000 }] },
});
go('X7', 'Alberta row equal to federal (close 8,000 = fed 8,000)', {
  ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 8_000 }] },
  albertaReserves17: { rows: [{ type: 'doubtfulDebts', closing: 8_000 }] },
});
go('X8', 'T2 reserves only, no Alberta entry (060 = Yes)', { ...t2, reserves: { rows: [{ type: 'doubtfulDebts', opening: 5_000, closing: 8_000 }] } });
