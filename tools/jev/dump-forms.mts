/**
 * Dump our form DEFINITIONS (the hand-authored ones the interface and engine use) to JSON so
 * pilot.py can compare them with the rule book.
 *
 *   cd packages/ca-tax && npx tsx ../../research/tools/jev/dump-forms.mts <out.json>
 *
 * AT1 today. For T2 (or another program) add its `[form, file, exportName]` rows to LIST and
 * point FORMS_DIR at its forms; the output shape stays {form: [{line, caption, note, ...}]}.
 */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const FORMS_DIR = resolve(process.cwd(), 'src/t2/at1/forms');
const LIST: [form: string, file: string, exportName: string][] = [
  ['000', 'jacket', 'AT1_JACKET'], ['001', 'schedule1', 'AT1_SCHEDULE_1'], ['002', 'schedule2', 'AT1_SCHEDULE_2'],
  ['003', 'schedule3', 'AT1_SCHEDULE_3'], ['004', 'schedule4', 'AT1_SCHEDULE_4'], ['010', 'schedule10', 'AT1_SCHEDULE_10'],
  ['012', 'schedule12', 'AT1_SCHEDULE_12'], ['013', 'schedule13', 'AT1_SCHEDULE_13'], ['015', 'schedule15', 'AT1_SCHEDULE_15'],
  ['016', 'schedule16', 'AT1_SCHEDULE_16'], ['017', 'schedule17', 'AT1_SCHEDULE_17'], ['018', 'schedule18', 'AT1_SCHEDULE_18'],
  ['020', 'schedule20', 'AT1_SCHEDULE_20'], ['021', 'schedule21', 'AT1_SCHEDULE_21'], ['029', 'schedule29', 'AT1_SCHEDULE_29'],
];
const out: Record<string, unknown[]> = {};
for (const [form, file, name] of LIST) {
  const mod = await import(pathToFileURL(resolve(FORMS_DIR, `${file}.ts`)).href);
  out[form] = (mod[name].fields as any[]).map((f) => ({
    line: f.line, caption: f.caption, requirement: f.requirement ?? null,
    note: f.note ?? null, printedSource: f.printedSource ?? null, role: f.role, kind: f.kind,
  }));
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}:${v.length}`).join(' '));
