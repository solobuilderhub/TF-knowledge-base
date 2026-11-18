// Schedule 12 second pass — the rules the first pass did not run (farm inventory, 042, ABI 100-106,
// Area A presence when the supporting schedule exists, recapture on a T2 return).
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s12-pass2.ts [W1 …]
import { run } from './s12-verify.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const m = maximalReturn as Record<string, any>;
const yes = { ...m.alberta, manufacturingDeduction: undefined, politicalContributionsTaxCredit: undefined };
const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const w = process.argv[2];
const line = (r: any, s: string, l: string) => (r?.c.schedulePayloads ?? []).find((x: any) => x.scheduleId === s)?.values.find((x: any) => x.lineItemId === `${s}${l}001`)?.value;
const go = (k: string, label: string, input: Record<string, unknown>, after?: (r: any) => void) => {
  if (w && w !== k) return;
  const r = run(`${k} ${label}`, { ...id, alberta: yes, ...input }, { render: true });
  if (r && after) after(r);
};

go('W1', 'farm inventory, AT1-only: 014 3,000 / fed 015 1,000; 016 2,000 / fed 017 500', {
  albertaSchedule12: { federalNetIncomeForTax: 500_000, farmInventory: { mandatoryCurrent: 3_000, mandatoryPrior: 2_000 }, federalFigures: { l015: 1_000, l017: 500 } },
}, (r) => console.log(`  expect: 054 = 500,000 − (1,000 − 500) + (3,000 − 2,000) = 500,500 | filed 054 ${line(r, '012', '054')}`));
go('W1b', 'farm inventory, Alberta = federal (3,000 / fed 3,000) — pair must be omitted', {
  albertaSchedule12: { federalNetIncomeForTax: 500_000, farmInventory: { mandatoryCurrent: 3_000 }, federalFigures: { l015: 3_000 } },
}, (r) => console.log(`  014 ${line(r, '012', '014') ?? '(absent)'} 015 ${line(r, '012', '015') ?? '(absent)'} 054 ${line(r, '012', '054')}`));
go('W2', 'farm inventory, T2 path: T2 S1 line 224 = 1,000; Alberta 014 = 3,000', {
  ...t2, netIncome: { lines: { '224': 1_000 } }, albertaSchedule12: { farmInventory: { mandatoryCurrent: 3_000 } },
}, (r) => console.log(`  T2 net income ${r.federal.netIncomeForTax} | 015 ${line(r, '012', '015') ?? '(absent)'} (expect 1,000 = T2 line 224)`));
go('W3', '042 capital tax in other provinces 2,000', {
  albertaSchedule12: { federalNetIncomeForTax: 500_000, capitalTaxOtherProvinces: 2_000 },
}, (r) => console.log(`  expect 042 2,000, 050 0, 054 502,000 | filed 042 ${line(r, '012', '042')} 050 ${line(r, '012', '050')} 054 ${line(r, '012', '054')}`));
const abi = (r: any) => console.log(`  100 ${line(r, '012', '100')} 102 ${line(r, '012', '102') ?? '-'} 104 ${line(r, '012', '104') ?? '-'} 106 ${line(r, '012', '106') ?? '-'} | S1 003 ${line(r, '001', '003')} | fed ABI ${r.federal.activeBusinessIncome ?? '-'}`);
go('W4', 'ABI differs: fed ABI 600,000, adjustment −100,000', { ...t2, sbd: { activeBusinessIncome: 600_000 }, albertaSchedule12: { abiDiffersFromFederal: 'yes', abiDiscretionaryAdjustment: -100_000 } }, abi);
go('W4b', 'ABI differs: adjustment −700,000 (106 negative)', { ...t2, sbd: { activeBusinessIncome: 600_000 }, albertaSchedule12: { abiDiffersFromFederal: 'yes', abiDiscretionaryAdjustment: -700_000 } }, abi);
go('W4c', 'ABI differs: 102 typed 550,000 while fed 200400 = 600,000 (> 0)', { ...t2, sbd: { activeBusinessIncome: 600_000 }, albertaSchedule12: { abiDiffersFromFederal: 'yes', abiFederalAmount: 550_000, abiDiscretionaryAdjustment: 0 } }, abi);
go('W4d', 'ABI No (default): 102/104/106 must not exist', { ...t2, sbd: { activeBusinessIncome: 600_000 }, albertaSchedule12: { abiDiffersFromFederal: 'no' } }, abi);
go('W5', 'S13 exists only because opening UCC differs (claims equal 10,000)', {
  ...t2, cca: { classes: [{ ccaClass: '8', openingUCC: 100_000, claim: 10_000 }] }, albertaCca13: { classes: [{ ccaClass: '8', openingUCC: 90_000, claim: 10_000 }] },
}, (r) => console.log(`  004 ${line(r, '012', '004') ?? '(absent)'} 005 ${line(r, '012', '005') ?? '(absent)'} — spec: 005 must exist when S13 exists due to differing opening balances`));
go('W6', 'recapture differs on a T2 return: T2 class 10 open 10,000 disp 15,000; Alberta open 8,000', {
  ...t2, cca: { classes: [{ ccaClass: '10', openingUCC: 10_000, dispositions: 15_000 }] }, albertaCca13: { classes: [{ ccaClass: '10', openingUCC: 8_000 }] },
}, (r) => console.log(`  T2 net income ${r.federal.netIncomeForTax} | 006 ${line(r, '012', '006') ?? '-'} 007 ${line(r, '012', '007') ?? '-'} 054 ${line(r, '012', '054')} (expect 006 7,000, 007 5,000, 054 = 002 + 2,000)`));
