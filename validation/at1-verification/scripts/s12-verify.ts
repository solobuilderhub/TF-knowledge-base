// AT1 Schedule 12 verification: full BE chain, then every §3.2.3.13 formula/cross-rule recomputed from the FILED lines.
import { renderAt1NetFile } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { computeFederalT2 } from '../../../../TaxFoundry-be/node_modules/@classytic/ca-tax/dist/index.mjs';
import { assembleProvincialInput } from '../../../../TaxFoundry-be/src/engine/assemble-provincial-input.ts';
import { assembleT2Input } from '../../../../TaxFoundry-be/src/engine/assemble-t2-input.ts';
import { runAT1Compute } from '../../../../TaxFoundry-be/src/engine/at1-compute.ts';
import { composeAt1FilingData } from '../../../../TaxFoundry-be/src/engine/at1-netfile.service.ts';
import { maximalReturn } from '../../../../TaxFoundry-be/tests/fixtures/at1-maximal-return.ts';

const taxYearStart = new Date('2024-01-01'), taxYearEnd = new Date('2024-12-31');
const client = {
  name: 'Maximal Ltd.', address: { street: '1 Test Way', city: 'Calgary', province: 'AB', postalCode: 'T2P1A1' },
  corporateAccountNumber: '1234567890', businessNumber: '123456782RC0001', contactPerson: 'Dana QA',
  contactTelephone: '4035550100', natureOfBusiness: 'Manufacturing', typeOfCorporation: '1', authorizedEmail: 'qa@taxfoundry.test',
};

export function run(label: string, input: Record<string, any>, opts: { render?: boolean } = {}) {
  console.log(`\n================ ${label}`);
  let c: any, federal: any;
  try {
    const a = assembleT2Input(input as never, { taxYearStart, taxYearEnd, program: 'AT1' } as never) as any;
    const fed = { ...a, period: { start: new Date(a.period.start), end: new Date(a.period.end), label: a.period.label }, isCcpc: true };
    federal = computeFederalT2(fed as never) as any;
    c = runAT1Compute(assembleProvincialInput('AT1', fed, input as never, { isCcpc: true })) as any;
  } catch (e) { console.log('THREW:', (e as Error).message); return; }

  // Per-schedule line map; occurrences summed (Σ rules).
  const payloads: any[] = c.schedulePayloads ?? [];
  const lines = (s: string, src: any[] = payloads) => {
    const m = new Map<string, number>();
    const p = src.find((x: any) => x.scheduleId === s);
    for (const v of p?.values ?? []) if (typeof v.value === 'number') m.set(v.lineItemId.slice(3, 6), (m.get(v.lineItemId.slice(3, 6)) ?? 0) + v.value);
    return p ? m : undefined;
  };
  let s12 = lines('012');
  const fld = (k: string) => c.fields.find((x: any) => x.line === k)?.value;
  console.log('fed: netIncome(300)', federal.netIncomeForTax, 'taxableIncome(360)', federal.taxableIncome,
    'donations(311)', federal.donations?.donationsClaimed, 'nonCap applied(331)', federal.losses?.nonCapital?.appliedCurrentYear);
  console.log('jacket 060/061 ->', input.alberta?.reportsDifferentAlbertaIncome, input.alberta?.electsDifferentDiscretionaryAmounts, '| 062', fld('albertaTaxableIncome'));
  console.log('schedules filed:', payloads.map((p) => p.scheduleId).join(' '));

  if (opts.render) {
    const data = composeAt1FilingData({ computed: { fields: c.fields, identity: {}, filingInput: input }, client,
      engagement: { taxYearStart, taxYearEnd }, certification: { firstName: 'A', lastName: 'B', position: 'CFO' }, forFiling: false } as never);
    const xml = renderAt1NetFile(data, payloads);
    const body = xml.match(/<Schedule Number="012">([\s\S]*?)<\/Schedule>/)?.[1];
    const m = new Map<string, number>();
    for (const x of (body ?? '').matchAll(/LineItemID="(\d{9})">([^<]*)</g)) m.set(x[1].slice(3, 6), Number(x[2]));
    console.log('RENDERED 012:', body ? [...m].map(([k, v]) => `${k}=${v}`).join(' ') : '(not rendered)');
    console.log('RENDERED jacket 060/061/062:', ['060', '061', '062'].map((l) => xml.match(new RegExp(`LineItemID="000${l}001">([^<]*)<`))?.[1] ?? '-').join(' / '));
    if (body) s12 = m;
  }
  if (!s12) { console.log('Schedule 12 NOT filed'); for (const i of c.issues ?? []) if (/Schedule 12|060|061/.test(i)) console.log('  issue:', i); return; }
  const p12 = payloads.find((x: any) => x.scheduleId === '012');
  console.log('S12 filed :', [...s12].map(([k, v]) => `${k}=${v}`).join(' '));
  console.log('S12 display:', (p12?.display ?? []).map((v: any) => `${v.lineItemId.slice(3, 6)}=${v.value}`).join(' '));

  const n = (l: string) => s12!.get(l) ?? 0;
  const S = (ls: string[]) => ls.reduce((t, l) => t + n(l), 0);
  const chk = (name: string, filed: number | undefined, expect: number | string | undefined) =>
    console.log(`  ${filed === expect ? 'OK  ' : 'DIFF'} ${name}: filed ${filed ?? '(absent)'} | rule ${expect ?? '(n/a)'}`);

  // 050
  const f050 = -n('005') + n('007') - n('009') - n('011') + n('013') + n('015') - n('017') + n('019') - n('021') - n('023') - n('027') - n('029') - n('031') - n('033') + n('037') - n('039') + n('041');
  chk('050 (035 excluded)', s12.get('050'), f050);
  if (s12.has('035')) console.log(`       035=${n('035')} → 050 with +035 ${f050 + n('035')}, with −035 ${f050 - n('035')}`);
  // 054
  const f054 = n('002') - n('050') - n('004') + n('006') - n('008') - n('010') + n('012') + n('014') - n('016') + n('018') - n('020') - n('022') - n('026') - n('028') - n('030') - n('032') - n('034') + n('036') - n('038') + n('042') + n('040');
  chk('054 = 002 − 050 − 004 … − 034 … + 040', s12.get('054'), f054);
  // 090 / 091
  const A = S(['056', '058', '060', '062', '064', '066', '068', '070', '072', '074', '078', '130', '140']);
  const B = S(['057', '059', '061', '063', '065', '067', '069', '071', '073', '075', '079', '131', '141']);
  chk('090', s12.get('090'), n('054') - A < 0 && n('082') > 0 ? n('082') : n('054') - A + n('082'));
  chk('091', s12.get('091'), n('002') - B < 0 && n('083') > 0 ? n('083') : n('002') - B + n('083'));
  chk('jacket 062 = 090 − 092', fld('albertaTaxableIncome'), n('090') - n('092'));
  chk('002 = fed 200300', s12.get('002'), input.albertaSchedule12?.federalNetIncomeForTax ?? federal.netIncomeForTax);
  chk('091 vs fed 200360', s12.get('091'), federal.taxableIncome);

  // Cross-schedule rules
  const s13 = lines('013'), s15 = lines('015'), s16 = lines('016'), s17 = lines('017'), s18 = lines('018'), s20 = lines('020'), s21 = lines('021');
  const L = (m: Map<string, number> | undefined, l: string) => m?.get(l) ?? 0;
  if (s13) { chk('004 = Σ013019', s12.get('004'), L(s13, '019')); chk('006 = Σ013015', s12.get('006'), L(s13, '015')); chk('008 = Σ013017', s12.get('008'), L(s13, '017')); }
  if (s15) {
    chk('022 = 015007+019+031', s12.get('022'), L(s15, '007') + L(s15, '019') + L(s15, '031'));
    chk('026 = 015061+081', s12.get('026'), L(s15, '061') + L(s15, '081'));
    chk('028 = 015115+141', s12.get('028'), L(s15, '115') + L(s15, '141'));
    chk('032 = 015169+189', s12.get('032'), L(s15, '169') + L(s15, '189'));
  }
  if (s16) chk('034 = 016016<0 ? 016016 : 016020', s12.get('034'), L(s16, '016') < 0 ? L(s16, '016') : L(s16, '020'));
  if (s17) {
    let o = 0, cl = 0; for (const [k, v] of s17) { const i = +k; if (i >= 1 && i <= 47) o += v; if (i >= 61 && i <= 77) cl += v; }
    chk('036 = Σ017001..047', s12.get('036'), o); chk('038 = Σ017061..077', s12.get('038'), cl);
  }
  if (s18) chk('040 includes 018076 + 018094', s12.get('040'), L(s18, '076') + L(s18, '094'));
  chk('056 = S20 ? 020016 : fed 311', s12.get('056'), s20 ? L(s20, '016') : federal.donations?.donationsClaimed ?? 0);
  chk('057 = fed 311', s12.get('057'), federal.donations?.donationsClaimed ?? 0);
  if (s20) chk('058 = 020076', s12.get('058'), L(s20, '076'));
  if (s21) {
    chk('064 = 021041', s12.get('064'), L(s21, '041'));
    chk('066 = 021061 × 0.5', s12.get('066'), Math.round(L(s21, '061') * 0.5));
    chk('068 = 021099', s12.get('068'), L(s21, '099'));
    chk('070 = 021079', s12.get('070'), L(s21, '079'));
    chk('072 = Σ021139', s12.get('072'), L(s21, '139'));
    chk('130 = 021240', s12.get('130'), L(s21, '240'));
    chk('082 = 021017', s12.get('082'), L(s21, '017'));
  } else {
    chk('064 = fed 331 (no S21)', s12.get('064'), federal.losses?.nonCapital?.appliedCurrentYear ?? 0);
  }
  chk('065 = fed 331', s12.get('065'), federal.losses?.nonCapital?.appliedCurrentYear ?? 0);
  for (const [a, f] of [['060', '061'], ['074', '075'], ['078', '079'], ['140', '141'], ['062', '063']]) if (s12.has(a) || s12.has(f)) chk(`${a} = ${f} (both = fed)`, s12.get(a), s12.get(f));
  if (s12.has('040')) chk('048 present when 040', p12?.values.some((v: any) => v.lineItemId.startsWith('012048')) ? 1 : 0, 1);
  chk('100 present', s12.get('100') !== undefined ? 1 : 0, 1);
  for (const i of c.issues ?? []) if (/Schedule 12|line 0(54|90)|060|061/.test(i)) console.log('  issue:', i.slice(0, 220));
  return { c, federal, s12 };
}

if (process.argv[2] === 'max') run('MAXIMAL RETURN (rendered)', maximalReturn as any, { render: true });
