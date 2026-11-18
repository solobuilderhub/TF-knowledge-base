// AT1 Schedule 29 (Innovation Employment Grant) verification — full BE chain; every §3.2.3.29 rule recomputed
// from the FILED 029 lines, plus jacket line 129.
// Run from TaxFoundry-be:  npx tsx ..\TF-knowledge-base\validation\at1-verification\scripts\s29-verify.ts [G1 …]
import { assembleProvincialInput } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from 'C:/Users/User/Desktop/TaxFoundry/TaxFoundry-be/src/engine/at1-compute.ts';

const id = { identification: { corpType: 'ccpc', province: 'AB' } };
const t2 = { incomeStatement: { revenue: 1_000_000, costOfSales: 400_000 } };
const claimant = { name: 'Claimant Ltd.', taxableCapital: 2_000_000, priorYear1: 100_000, priorYear2: 120_000 };
const base = { federalAmount: 200_000, albertaPortion: 150_000, primaryFieldCode: 1, group: [claimant] };

function go(k: string, label: string, ieg: Record<string, unknown>, start = '2024-01-01', end = '2024-12-31') {
  if (process.argv[2] && process.argv[2] !== k) return;
  console.log(`\n================ ${k} ${label}`);
  let c: any;
  try {
    const input = { ...id, ...t2, albertaIeg: ieg };
    const a = assembleT2Input(input as never, { taxYearStart: new Date(start), taxYearEnd: new Date(end), program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
    c = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  } catch (e) { console.log('THREW:', (e as Error).message); return; }
  const fld = (x: string) => c.fields.find((f: any) => f.line === x)?.value;
  const p = (c.schedulePayloads ?? []).find((x: any) => x.scheduleId === '029');
  const days = Math.round((+new Date(end) - +new Date(start)) / 86_400_000) + 1;
  console.log(`  filed: ${(c.schedulePayloads ?? []).map((x: any) => x.scheduleId).join(' ')} | jacket 129 ${fld('innovationEmploymentGrant')} | days ${days}`);
  for (const i of c.issues ?? []) if (/Schedule 29|IEG|Innovation|AT4970/i.test(i)) console.log('  issue:', i.slice(0, 220));
  if (!p) { console.log('  Schedule 29 NOT in payload'); return; }
  const v = new Map<string, any>(), occ: string[] = [];
  for (const x of p.values) { const o = +x.lineItemId.slice(6), f = x.lineItemId.slice(3, 6); if (o === 1) v.set(f, x.value); else occ.push(`${f}#${o}=${x.value}`); }
  const d = new Map<string, any>((p.display ?? []).map((x: any) => [x.lineItemId.slice(3, 6), x.value]));
  const n = (l: string) => Number(v.get(l) ?? 0);
  console.log('  029:', [...v].map(([a, b]) => `${a}=${b}`).join(' '));
  if (occ.length) console.log('  029 occ 2+:', occ.join(' '));
  console.log('  display:', [...d].map(([a, b]) => `${a}=${b}`).join(' '));
  const chk = (name: string, ok: boolean, s: string) => console.log(`  ${ok ? 'OK  ' : 'DIFF'} ${name}: ${s}`);
  const l031 = n('005') - n('007') + n('009') + n('011') + n('025');
  chk('031 (display) = 005 − 007 + 009 + 011 + 025', Number(d.get('031')) === l031, `${d.get('031')} vs ${l031}`);
  chk('005 ≤ 003', n('005') <= n('003'), `005 ${n('005')} | 003 ${n('003')}`);
  const assoc = n('100') === 1;
  if (!assoc) {
    const d104 = Math.min(days, 366);
    chk('104 = 4,000,000 × days / 365 (max 365, or 366 with Feb 29)', n('104') === Math.round(4_000_000 * d104 / 365), `${n('104')} vs ${Math.round(4_000_000 * d104 / 365)}`);
  }
  chk('108 = 102 (assoc) or 104', n('108') === (assoc ? n('102') : n('104')), `${n('108')}`);
  const capped = Math.min(l031, n('108'));
  chk('110 = 8% × min(031, 108)', n('110') === Math.round(0.08 * capped), `${n('110')} vs ${Math.round(0.08 * capped)}`);
  if (!assoc) {
    const b118 = Math.round((n('114') + n('116')) / 2);
    chk('112 = (min(031, 108) − avg(114, 116)) × 12%', n('112') === Math.round(0.12 * (capped - b118)), `${n('112')} vs ${Math.round(0.12 * (capped - b118))} (base 118 = ${b118})`);
  } else {
    chk('112 = 0 when associated', n('112') === 0, `${n('112')}`);
    chk('124 = (120 + 122) / 2', n('124') === Math.round((n('120') + n('122')) / 2), `${n('124')}`);
    chk('125 = min(108, 325) × 12%', n('125') === Math.round(0.12 * Math.min(n('108'), n('325'))), `${n('125')}`);
    chk('102 = claimant 240', n('102') === n('240'), `${n('102')} vs ${n('240')}`);
  }
  const tc = n('126');
  const f128 = tc <= 10_000_000 ? 1 : Math.max(0, (40_000_000 - (tc - 10_000_000)) / 40_000_000);
  chk('128 = (40M − (126 − 10M)) / 40M, 1 if ≤ 10M', Math.abs(Number(v.get('128')) - f128) < 1e-6, `${v.get('128')} vs ${f128.toFixed(6)}`);
  const enh = assoc ? n('125') : n('112');
  chk('130 = (110 + 112 or 125) × 128', n('130') === Math.round((n('110') + enh) * f128), `${n('130')} vs ${Math.round((n('110') + enh) * f128)}`);
  chk('134 = 130 − 132', n('134') === n('130') - n('132'), `${n('134')}`);
  const jacket = Math.round(n('110') + enh * f128) - n('132');
  chk('jacket 129 = (110 + 112 × 128) − 132 (jacket rule)', Number(fld('innovationEmploymentGrant')) === jacket, `129 ${fld('innovationEmploymentGrant')} | jacket rule ${jacket} | S29 134 ${n('134')}`);
  if (assoc) {
    const rows = new Map<number, Record<string, number>>();
    for (const x of p.values) { const o = +x.lineItemId.slice(6), f = x.lineItemId.slice(3, 6); if (+f >= 240 && +f <= 268) rows.set(o, { ...(rows.get(o) ?? {}), [f]: Number(x.value) }); }
    for (const [o, r] of rows) {
      const i267 = r['245'] - Math.round((r['250'] + r['260']) / 2);
      chk(`267 occ ${o} = 245 − (250 + 260)/2`, r['267'] === i267, `${r['267']} vs ${i267}`);
      chk(`268 occ ${o} ≤ 267 (0 if negative) and ≤ 240`, r['268'] <= Math.max(0, Math.min(i267, r['240'])), `268 ${r['268']}`);
      chk(`240 occ ${o} ≤ 4,000,000 × 206 / 365`, r['240'] <= Math.round(4_000_000 * n('206') / 365), `${r['240']}`);
    }
    const sum = (f: string) => [...rows.values()].reduce((s, r) => s + (r[f] ?? 0), 0);
    chk('126 = Σ 265 (line 300)', n('126') === sum('265'), `${n('126')} vs ${sum('265')}`);
    chk('120 = Σ 250; 122 = Σ 260', n('120') === sum('250') && n('122') === sum('260'), `${n('120')} / ${n('122')}`);
    chk('325 = first 268', n('325') === (rows.get(1)?.['268'] ?? NaN), `${n('325')}`);
  }
}

go('G1', 'non-associated baseline: federal 200,000, Alberta 150,000, prior 100,000 / 120,000, TC 2M', base);
go('G2', 'short year (184 days)', base, '2024-07-01', '2024-12-31');
go('G3', 'spending above the limit: Alberta 5,000,000', { ...base, federalAmount: 5_000_000, albertaPortion: 5_000_000 });
go('G4', 'taxable capital in the band: 30,000,000', { ...base, group: [{ ...claimant, taxableCapital: 30_000_000 }] });
go('G5', 'recapture 2,000', { ...base, recapture: 2_000 });
go('G6', 'spending below base: prior 300,000 / 300,000', { ...base, group: [{ ...claimant, priorYear1: 300_000, priorYear2: 300_000 }] });
go('G7', 'two-member group, no agreement', { ...base, group: [claimant, { name: 'Sister Ltd.', taxableCapital: 5_000_000, priorYear1: 50_000, priorYear2: 50_000 }] });
go('G8', 'associated agreement (claimant + sister)', {
  ...base,
  agreementLongestYearCan: '1234567890', agreementLongestYearBegin: '2024-01-01', agreementLongestYearEnd: '2024-12-31',
  agreementMembers: [
    { name: 'Claimant Ltd.', fbn: '123456782', albertaCan: '1234567890', currentTaxationYearEnd: '2024-12-31', allocatedExpenditureLimit: 2_000_000, currentYearExpenditures: 150_000, priorYear1: 100_000, priorYear2: 120_000, taxableCapitalPriorYear: 2_000_000 },
    { name: 'Sister Ltd.', fbn: '987654321', albertaCan: '9876543210', currentTaxationYearEnd: '2024-12-31', allocatedExpenditureLimit: 2_000_000, currentYearExpenditures: 300_000, priorYear1: 200_000, priorYear2: 200_000, taxableCapitalPriorYear: 5_000_000, hasAlbertaPermanentEstablishment: 'yes' },
  ],
});
go('G9', 'empty group (fail closed)', { ...base, group: [] });
go('G10', '005 > 003: federal 100,000, Alberta portion 150,000', { ...base, federalAmount: 100_000 });
