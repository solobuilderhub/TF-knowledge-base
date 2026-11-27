// Dump ca-tax's form registry (lines, captions, links) to JSON for comparison.
//
// Takes the root of a BUILT @classytic/ca-tax package explicitly — a ca-tax
// checkout after `npm run build`, or an installed copy under some
// node_modules/@classytic/ca-tax. No default: this repo does not reach into a
// sibling's directory tree on its own. Reads only; writes nothing there.
//
//   node tools/dump-ca-tax-forms.mjs <ca-tax package root>   ->   ca-tax-forms.json
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = process.argv[2];
if (!root) {
  console.error('usage: node tools/dump-ca-tax-forms.mjs <root of a built @classytic/ca-tax package>');
  process.exit(1);
}
const caTax = resolve(root);
const entry = join(caTax, 'dist', 'forms', 'index.mjs');
if (!existsSync(entry)) {
  console.error(`${entry} not found: pass a built @classytic/ca-tax package (run \`npm run build\` in a checkout)`);
  process.exit(1);
}
const { name, version } = JSON.parse(readFileSync(join(caTax, 'package.json'), 'utf8'));
if (name !== '@classytic/ca-tax') {
  console.error(`${caTax} is ${name}, not @classytic/ca-tax`);
  process.exit(1);
}
const { FORMS } = await import(pathToFileURL(entry).href);

const forms = FORMS.map((f) => ({
  id: f.id,
  program: f.program,
  schedule: f.schedule,
  title: f.title,
  fields: f.fields.map((x) => ({
    line: x.line,
    caption: x.caption,
    kind: x.kind,
    role: x.role,
    section: x.section,
    from: x.from ?? null,
    to: x.to ?? null,
  })),
}));
const out = join(here, '..', 'ca-tax-forms.json');
writeFileSync(out, `${JSON.stringify({ caTaxVersion: version, forms }, null, 1)}\n`);
console.log(`ca-tax ${version}: ${forms.length} forms, ${forms.reduce((n, f) => n + f.fields.length, 0)} fields -> ${out}`);
