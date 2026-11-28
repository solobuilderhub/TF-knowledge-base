#!/usr/bin/env node
// AuraTax calculators (T2 or AT1) -> formula register.
//
// Parses AuraTax's shipped calculator bundle (never executes it) and writes,
// for every line the calculators set, the formula in readable notation, the
// conditions it sits under, and the exact source location. Every dirtify() and
// reportValueOn() call is accounted for; anything the translator cannot render
// exactly is marked "as written" and counted.
//
//   node formulas.mjs [--program t2|at1] --app <AuraTax resources folder> --out <dir>
//
// Not a primary source: this documents what AuraTax computes, not what is right.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

// ── arguments ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const APP = arg('--app') ?? (process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Programs', 'auratax', 'resources'));
const OUT = arg('--out');
if (!APP || !OUT || !existsSync(join(APP, 'app.asar'))) {
  console.error('usage: node formulas.mjs --app <AuraTax folder holding app.asar> --out <dir>');
  process.exit(1);
}
const WEB = join(APP, 'app.asar.unpacked', 'app');
const PROG = (arg('--program') ?? 't2').toLowerCase();
const P = PROG.toUpperCase();
const MOD = `./src/app/modules/${PROG}/`;
const FIX = join(WEB, 'assets', 'fixtures', PROG);

// ── the calculator chunk: the one holding ./src/app/modules/<program>/<program>-calculate.ts
const chunkName = readdirSync(WEB).filter((f) => f.endsWith('.js'))
  .find((f) => readFileSync(join(WEB, f), 'utf8').includes(`!*** ${MOD}${PROG}-calculate.ts ***!`));
if (!chunkName) { console.error(`${P} calculator chunk not found`); process.exit(1); }
const SRC = readFileSync(join(WEB, chunkName), 'utf8');
const chunkSha = createHash('sha256').update(SRC).digest('hex');
const version = (() => {
  try {
    const buf = readFileSync(join(APP, 'app.asar'));
    const headerSize = buf.readUInt32LE(4), jsonLen = buf.readUInt32LE(12);
    const index = JSON.parse(buf.subarray(16, 16 + jsonLen).toString('utf8'));
    const e = index.files['package.json'];
    const start = 8 + headerSize + Number(e.offset);
    return JSON.parse(buf.subarray(start, start + e.size).toString('utf8')).version;
  } catch { return 'unknown'; }
})();

const comments = [];
const AST = acorn.parse(SRC, { ecmaVersion: 'latest', sourceType: 'script', locations: true, onComment: comments });
const lineOf = (node) => node.loc.start.line;
const raw = (node) => SRC.slice(node.start, node.end).replace(/\(0,_?[\w$]+?__WEBPACK_IMPORTED_MODULE_\d+__\.(\w+)\)/g, '$1')
  .replace(/_?([\w$]+?)__WEBPACK_IMPORTED_MODULE_\d+__\./g, (m, mod) => (mod === 'aurasoft_t2_base' ? '' : `${mod}.`))
  .replace(/\s+/g, ' ');

// Module id -> { path, fn }
const banners = comments.filter((c) => c.type === 'Block' && /!\*\*\* \.\/\S+ \*\*\*!/.test(c.value))
  .map((c) => ({ start: c.start, path: c.value.match(/!\*\*\* (\.\/\S+) \*\*\*!/)[1] }));
const modules = new Map();
walk.simple(AST, {
  ObjectExpression(o) {
    for (const p of o.properties) {
      if (p.type !== 'Property' || p.key.type !== 'Literal' || typeof p.key.value !== 'number') continue;
      if (!/Function/.test(p.value.type)) continue;
      const b = banners.filter((x) => x.start < p.value.start).at(-1);
      if (b && !modules.has(p.key.value)) modules.set(p.key.value, { id: p.key.value, path: b.path, fn: p.value });
    }
  },
});
const byPath = new Map([...modules.values()].map((m) => [m.path, m]));

// ── fixtures: captions, aliases, order, rates ───────────────────────────────
const loadJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
function loadSpecs(FIX) {
  const specs = {};
for (const f of readdirSync(join(FIX, 'specs'))) {
  const code = f.replace(/\.json$/, '');
  const s = loadJson(join(FIX, 'specs', f));
  const fields = new Map();
  (s.fields ?? []).forEach((fld, i) => {
    for (const k of [fld.code, fld.id]) if (k && !fields.has(k)) fields.set(k, { caption: fld.name ?? '', order: 1000 + i, code: fld.code || undefined });
  });
  specs[code] = { name: s.name ?? '', fields };
}
for (const f of readdirSync(join(FIX, 'extras'))) {
  const code = f.replace(/\.json$/, '');
  const e = loadJson(join(FIX, 'extras', f));
  const sp = (specs[code] ??= { name: '', fields: new Map() });
  let extra = 100000;
  for (const fld of e.fields ?? []) {
    const k = fld.code || fld.id;
    const alias = fld.alias || fld._alias;
    const cur = sp.fields.get(k);
    if (cur) { if (alias) cur.alias = alias; if (!cur.caption && fld.name) cur.caption = fld.name; }
    else sp.fields.set(k, { caption: fld.name ?? '', alias, order: extra++ });
  }
  for (const a of e._addOns ?? []) {
    const have = sp.fields.get(a.id);
    if (have) { have.alias = have.alias || a.alias || a._alias; if (!have.caption && a.name) have.caption = a.name; continue; }
    const anchor = a.nextTo && sp.fields.get(a.nextTo);
    sp.fields.set(a.id, { caption: a.name ?? '', alias: a.alias || a._alias, order: anchor ? anchor.order + 0.5 : extra++ });
  }
  let pos = 0; // the page's own order, where AuraTax lists it
  for (const sec of e._sections ?? []) for (const k of sec.codes ?? []) { const fld = sp.fields.get(k); if (fld) fld.order = pos++; }
}
  return specs;
}
const specsByProg = { [PROG]: loadSpecs(FIX) };
if (PROG !== 't2') specsByProg.t2 = loadSpecs(join(WEB, 'assets', 'fixtures', 't2'));
const specs = specsByProg[PROG];
const rates = loadJson(join(FIX, 'refs', 'calculate-params.json'));
const rateDate = loadJson(join(FIX, 'conf.json')).lastCalcParamDate;

// ── calculation order and module -> schedule ────────────────────────────────
const modVarToPath = (modFn) => {
  const m = new Map();
  walk.simple(modFn, {
    VariableDeclarator(d) {
      if (d.init?.type === 'CallExpression' && d.init.callee.name === '__webpack_require__' && d.init.arguments[0]?.type === 'Literal') {
        const target = modules.get(d.init.arguments[0].value);
        if (target) m.set(d.id.name, target.path);
      }
    },
  });
  return m;
};
const regModule = byPath.get(`${MOD}calculators/${PROG}.ts`);
const regVars = modVarToPath(regModule.fn);
const registry = [];
walk.simple(regModule.fn, {
  ObjectExpression(o) {
    const sch = o.properties.find((p) => p.key?.name === 'sch')?.value;
    const fn = o.properties.find((p) => p.key?.name === 'fn')?.value;
    if (sch?.type === 'Literal' && fn?.type === 'MemberExpression') {
      registry.push({ sch: sch.value, path: regVars.get(fn.object.name), exp: fn.property.name, order: registry.length + 1 });
    }
  },
});
// t2-calculate's init(): '005_1' -> filterSchedules('005', t2)
const schAlias = {};
walk.simple(byPath.get(`${MOD}${PROG}-calculate.ts`).fn, {
  Property(p) {
    const k = p.key.type === 'Literal' ? p.key.value : p.key.name;
    if (p.value.type === 'CallExpression' && /filterSchedules$/.test(raw(p.value.callee))) schAlias[k] = p.value.arguments[0].value;
    if (p.value.type === 'Identifier') schAlias[k] = p.value.name; // resolved below
  },
  VariableDeclarator(d) {
    if (d.init?.type === 'CallExpression' && /filterSchedules$/.test(raw(d.init.callee))) schAlias[`$${d.id.name}`] = d.init.arguments[0].value;
  },
});
for (const [k, v] of Object.entries(schAlias)) if (typeof v === 'string' && schAlias[`$${v}`]) schAlias[k] = schAlias[`$${v}`];
const realSch = (s) => (typeof schAlias[s] === 'string' && !schAlias[s].startsWith('$') && /^[\w]+$/.test(schAlias[s]) && specs[schAlias[s]] ? schAlias[s] : s);

// ── names and scopes ────────────────────────────────────────────────────────
function short(n) {
  if (!n) return null;
  if (n.type === 'SequenceExpression') n = n.expressions.at(-1);
  if (n.type === 'ChainExpression') n = n.expression;
  if (n.type === 'Identifier') return n.name;
  if (n.type === 'MemberExpression' && !n.computed) {
    if (n.object.type === 'Identifier') {
      const m = n.object.name.match(/^_?([\w$]*?)__WEBPACK_IMPORTED_MODULE_\d+__$/);
      if (m) return m[1] === 'aurasoft_t2_base' || m[1] === 't2_functions' || m[1] === `${PROG}_functions` ? n.property.name : `${m[1]}.${n.property.name}`;
      return `${n.object.name}.${n.property.name}`;
    }
    const inner = short(n.object);
    return inner ? `${inner}.${n.property.name}` : null;
  }
  return null;
}
class Scope {
  constructor(parent, vars = new Map()) { this.parent = parent; this.vars = vars; }
  lookupRaw(name) { return this.vars.get(name) ?? this.parent?.lookupRaw(name); }
  // while a fixed list is being expanded, its loop variable stands for the current value
  lookup(name) { const b = this.lookupRaw(name); return b?.eachOf && b.current ? { node: b.current } : b; }
}
function declsIn(fnNode, before) {
  // Every write to a variable declared here, with the if-conditions it sits under and
  // whether it happens inside a nested function (a loop callback). A variable written
  // once is inlined; one written in several steps is shown with every step, never just
  // the last one.
  const vars = new Map();
  const writes = new Map();
  const declared = new Set();
  const addWrite = (name, w) => (writes.get(name) ?? writes.set(name, []).get(name)).push(w);
  const visit = (node, conds, nested) => {
    if (!node || typeof node.type !== 'string') return;
    const enteringNested = node !== fnNode && /Function/.test(node.type);
    if (node.type === 'VariableDeclarator' && node.id.type === 'ArrayPattern' && !nested && node.init?.type === 'CallExpression'
      && node.init.callee.type === 'MemberExpression' && node.init.callee.property.name === 'split' && node.init.arguments[0]?.type === 'Literal') {
      node.id.elements.forEach((el, i) => {
        if (el?.type !== 'Identifier') return;
        declared.add(el.name);
        if (node.start < before) addWrite(el.name, { op: '=', node: { type: 'SplitElement', of: node.init.callee.object, sep: node.init.arguments[0].value, index: i, start: node.start, end: node.end }, conds, nested, start: node.start });
      });
    }
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && !nested) {
      declared.add(node.id.name);
      if (node.init && node.start < before) addWrite(node.id.name, { op: '=', node: node.init, conds, nested, start: node.start });
    }
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier' && node.start < before) {
      addWrite(node.left.name, { op: node.operator, node: node.right, conds, nested, start: node.start });
    }
    if (node.type === 'UpdateExpression' && node.argument.type === 'Identifier' && node.start < before) {
      addWrite(node.argument.name, { op: node.operator, node: null, conds, nested, start: node.start });
    }
    if (node.type === 'IfStatement') {
      visit(node.test, conds, nested);
      visit(node.consequent, [...conds, { test: node.test, neg: false }], nested);
      visit(node.alternate, [...conds, { test: node.test, neg: true }], nested);
      return;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc') continue;
      const v = node[key];
      if (Array.isArray(v)) v.forEach((x) => visit(x, conds, nested || enteringNested));
      else if (v && typeof v.type === 'string') visit(v, conds, nested || enteringNested);
    }
  };
  visit(fnNode.body, [], false);
  for (const name of declared) {
    const ws = (writes.get(name) ?? []).sort((x, y) => x.start - y.start);
    if (!ws.length) continue;
    // one plain write is just that value, even inside an if-block (the call sits in the same block)
    const simple = ws.length === 1 && ws[0].op === '=' && !ws[0].nested;
    vars.set(name, simple ? { node: ws[0].node } : { node: ws.at(-1).node, steps: ws, name });
  }
  // plain assignments to names declared further out (let x; in an enclosing function)
  for (const [name, ws] of writes) {
    if (declared.has(name)) continue;
    const plain = ws.filter((w) => w.op === '=' && !w.nested);
    if (plain.length === ws.length && plain.length === 1 && !plain[0].conds.length) vars.set(name, { node: plain[0].node });
    else vars.set(name, { node: ws.at(-1).node, steps: ws, name });
  }
  return vars;
}
const methodName = (callee) => {
  const c = unwrap(callee);
  if (c?.type === 'MemberExpression' && !c.computed) return c.property.name;
  return short(c)?.split('.').pop() ?? null;
};
const ARRAY_METHODS = new Set(['forEach', 'map', 'filter', 'find', 'some', 'every', 'reduce', 'findIndex', 'flatMap']);

// ── tests (conditions) ──────────────────────────────────────────────────────
// In JavaScript a bare amount as a condition means "not blank and not zero"; say so.
const BOOLEAN_NAME = /^(is|was|has|can|should|non|every|some|includes|becoming)[A-Z]?|^(isChecked|isBlank|nonBlank|isTrue|isFalse)$/;
function testKind(node, scope, seen = 0) {
  const n = unwrap(node);
  if (!n || seen > 8) return 'other';
  if (n.type === 'Identifier') {
    const b = scope.lookup(n.name);
    if (b?.fieldRef) return 'value';
    if (b?.sch) return 'schedule';
    if (b?.node && !b.steps) return testKind(b.node, b.scope ?? scope, seen + 1);
    return 'other';
  }
  if (n.type === 'CallExpression') {
    const nm = methodName(n.callee) ?? '';
    if (nm === 'getSchedule') return 'schedule';
    if (nm === 'getField') return 'field';
    if (BOOLEAN_NAME.test(nm)) return 'boolean';
    if (/^(valueFrom|valueOf|sumFrom|minusFrom|multiFrom|leastFrom|oneFrom|doSum|doMinus|doMulti|doDiv|floatVal|floatValueFrom|totalOf|leastOf|maxOf|minOf|oneOf|zeroIfNegative)$/.test(nm)) return 'value';
    return 'other';
  }
  if (n.type === 'MemberExpression') {
    if (!n.computed && n.property.name === 'length') return 'value';
    const r = resolve(n, scope);
    if (r?.node && unwrap(r.node) !== n) return testKind(r.node, r.scope, seen + 1);
    return 'other';
  }
  return 'other';
}
function renderTest(node, scope, ctx) {
  const n = unwrap(node);
  if (n?.type === 'MemberExpression' && !n.computed && n.property.name === 'linkedT2') return 'a linked T2 return exists';
  if (n?.type === 'UnaryExpression' && n.operator === '!' && unwrap(n.argument)?.type === 'MemberExpression' && unwrap(n.argument).property?.name === 'linkedT2') return 'there is no linked T2 return';
  if (n?.type === 'LogicalExpression' && (n.operator === '&&' || n.operator === '||')) {
    return `(${renderTest(n.left, scope, ctx)} ${OPS[n.operator]} ${renderTest(n.right, scope, ctx)})`;
  }
  if (n?.type === 'UnaryExpression' && n.operator === '!' && unwrap(n.argument)?.type === 'UnaryExpression' && unwrap(n.argument).operator === '!') {
    return renderTest(unwrap(n.argument).argument, scope, ctx); // !!x is just x as a test
  }
  if (n?.type === 'UnaryExpression' && n.operator === '!') {
    const k = testKind(n.argument, scope);
    const t = render(n.argument, scope, ctx);
    if (k === 'value') return `${t} is blank or zero`;
    if (k === 'schedule') return `${t} is not in the return`;
    if (k === 'field') return `${t} is not on the form`;
    return `not ${renderTest(n.argument, scope, ctx)}`;
  }
  const k = testKind(n, scope);
  const t = render(n, scope, ctx);
  if (k === 'value') return `${t} is non-zero`;
  if (k === 'schedule') return `${t} is in the return`;
  if (k === 'field') return `${t} is on the form`;
  return t;
}
const negate = (t) => {
  if (t.startsWith('not ')) return t.slice(4);
  if (/ is non-zero$/.test(t)) return t.replace(/ is non-zero$/, ' is blank or zero');
  if (/ is in the return$/.test(t)) return t.replace(/ is in the return$/, ' is not in the return');
  return `not ${t}`;
};

// ── rendering ───────────────────────────────────────────────────────────────
const OPS = { '===': '=', '==': '=', '!==': '≠', '!=': '≠', '&&': 'and', '||': 'or', '??': 'or else', '*': '×', '/': '÷', '-': '−', '+': '+', '<': '<', '>': '>', '<=': '≤', '>=': '≥', '%': 'mod' };
const fmtNum = (v) => (Number.isInteger(v) ? String(v) : String(+v.toPrecision(12)));
// AuraTax's internal field id ('f4507') -> the printed line number ('450')
const lineCode = (sch, key, prog) => {
  if (/^\d+$/.test(key)) return key;
  const c = (prog ? specsByProg[prog] : specs)?.[sch]?.fields.get(key)?.code;
  return c && /^\d+$/.test(c) ? c : key;
};
const keyLabel = (sch, key, prog) => {
  key = lineCode(sch, key, prog);
  if (/^\d+$/.test(key)) return `line ${key}`;
  const f = (prog ? specsByProg[prog] : specs)?.[sch]?.fields.get(key);
  return f?.alias ? `amount ${f.alias} [${key}]` : `[${key}]`;
};

class Ctx {
  constructor(moduleSch) { this.moduleSch = moduleSch; this.asWritten = []; this.named = new Set(); this.depth = 0; this.active = new Set(); }
  flag(node) { this.asWritten.push(raw(node)); return `⟦${raw(node)}⟧`; }
}

function unwrap(n) { while (n && (n.type === 'ChainExpression' || n.type === 'ParenthesizedExpression')) n = n.expression; return n; }
// one part of 'a:b'.split(':'), as written in a destructuring
const splitText = (n, scope, ctx) => `${render(n.of, scope, ctx)} part ${n.index + 1}`;

// Follow identifiers and member paths to the node they stand for.
function resolve(node, scope, seen = 0) {
  node = unwrap(node);
  if (!node || seen > 12) return null;
  if (node.type === 'Identifier') {
    const b = scope.lookup(node.name);
    if (!b) return null;
    if (b.steps) return { binding: b };
    if (b.node) return resolve(b.node, b.scope ?? scope, seen + 1) ?? { node: b.node, scope: b.scope ?? scope };
    return { binding: b };
  }
  if (node.type === 'MemberExpression') {
    const base = resolve(node.object, scope, seen + 1);
    const key = node.computed ? literalKey(node.property, scope) : node.property.name;
    if (base?.node && key != null) {
      const o = unwrap(base.node);
      if (o.type === 'ObjectExpression') {
        const p = o.properties.find((pp) => pp.type === 'Property' && String(pp.key.type === 'Literal' ? pp.key.value : pp.key.name) === key);
        if (p) return resolve(p.value, base.scope, seen + 1) ?? { node: p.value, scope: base.scope };
      }
    }
    return null;
  }
  return { node, scope };
}

// A schedule-valued expression -> { kind: 'this' | 'sch' | 'list' | 'item', code, label }
function schRef(node, scope, ctx, seen = 0) {
  node = unwrap(node);
  if (!node || seen > 12) return null;
  if (node.type === 'Identifier') {
    const b = scope.lookup(node.name);
    if (b?.sch) return b.sch;
    if (b?.node) return schRef(b.node, b.scope ?? scope, ctx, seen + 1);
    return null;
  }
  if (node.type === 'CallExpression') {
    const name = short(node.callee);
    let a0 = unwrap(node.arguments[0]);
    if (a0 && a0.type !== 'Literal' && a0.type !== 'TemplateLiteral' && literalKey(a0, scope) != null) a0 = { type: 'Literal', value: literalKey(a0, scope) };
    const linked = node.arguments[1] && /linkedT2/.test(raw(node.arguments[1])) && PROG !== 't2' ? 't2' : null;
    if (linked && (name === 'getSchedule' || name === 'filterSchedules') && a0?.type === 'Literal') {
      return { kind: name === 'getSchedule' ? 'sch' : 'list', code: a0.value, prog: linked, label: `T2 Sch ${a0.value}` };
    }
    if (name === 'getSchedule' && a0?.type === 'Literal') return { kind: 'sch', code: a0.value };
    if (name === 'filterSchedules' && a0?.type === 'Literal') return { kind: 'list', code: a0.value };
    // getSchedule(`032.${sch.sequence}`, t2): the copy of Sch 032 matching this copy
    if ((name === 'getSchedule' || name === 'filterSchedules') && a0?.type === 'TemplateLiteral') {
      const head = a0.quasis[0].value.cooked.match(/^(\w+)\./);
      if (head) return { kind: name === 'getSchedule' ? 'sch' : 'list', code: head[1], label: `Sch ${head[1]} (copy ${render(a0.expressions[0], scope, ctx)})` };
    }
    if (node.callee.type === 'MemberExpression' || node.callee.type === 'ChainExpression') {
      const r = resolve(node.callee, scope);
      const fn = r?.node && unwrap(r.node);
      if (fn && /Function/.test(fn.type) && fn.params.length === 0) {
        const body = fn.body.type === 'BlockStatement' ? fn.body.body.find((s) => s.type === 'ReturnStatement')?.argument : fn.body;
        if (body) return schRef(body, r.scope, ctx, seen + 1) ?? { kind: 'sch', code: '?', label: render(body, r.scope, ctx) };
      }
      const meth = methodName(node.callee);
      if (meth === 'find' || meth === 'filter') {
        const of = schRef(node.callee.object ?? node.callee.expression?.object, scope, ctx, seen + 1);
        if (of) return { kind: meth === 'find' ? 'sch' : 'list', code: of.code, label: `${of.label ?? `Sch ${of.code}`} (${meth === 'find' ? 'the copy' : 'copies'} where ${render(node.arguments[0], scope, ctx)})` };
      }
    }
    return null;
  }
  if (node.type === 'MemberExpression') {
    const r = resolve(node, scope);
    if (r?.node && r.node !== node) return schRef(r.node, r.scope, ctx, seen + 1);
    if (r?.binding?.sch) return r.binding.sch;
    if (node.computed) {
      const list = schRef(node.object, scope, ctx, seen + 1);
      const idx = unwrap(node.property);
      if (list?.kind === 'list' && idx.type === 'Literal') return { kind: 'sch', code: list.code, label: `Sch ${list.code} (copy ${idx.value + 1})` };
    }
    return null;
  }
  if (node.type === 'ConditionalExpression') {
    const a = schRef(node.consequent, scope, ctx, seen + 1), b = schRef(node.alternate, scope, ctx, seen + 1);
    if (a && b) return { kind: 'sch', code: a.code, label: `${schText(a)} if ${render(node.test, scope, ctx)}, else ${schText(b)}` };
  }
  if (node.type === 'LogicalExpression' && node.operator === '&&') return schRef(node.right, scope, ctx, seen + 1);
  if (node.type === 'LogicalExpression') {
    const a = schRef(node.left, scope, ctx, seen + 1), b = schRef(node.right, scope, ctx, seen + 1);
    if (a || b) return a && b ? { kind: 'sch', code: a.code, label: `${schText(a)}, or else ${schText(b)}` } : (a ?? b);
  }
  return null;
}
const schText = (s) => s.label ?? (s.kind === 'this' ? 'this schedule' : s.kind === 'item' ? `each Sch ${s.code}` : s.kind === 'list' ? `every Sch ${s.code}` : `Sch ${s.code}`);

// A line key that is a literal, directly or through a variable bound to one.
function literalKey(node, scope) {
  const k = unwrap(node);
  if (k?.type === 'Literal') return String(k.value);
  if (k?.type === 'Identifier') {
    const b = scope.lookup(k.name);
    if (b?.node && unwrap(b.node).type === 'Literal') return String(unwrap(b.node).value);
    if (b?.node?.type === 'SplitElement') {
      const whole = literalKey(b.node.of, b.scope ?? scope);
      if (whole != null) return whole.split(b.node.sep)[b.node.index];
    }
  }
  if (k?.type === 'Identifier' || k?.type === 'MemberExpression') {
    const r = resolve(k, scope);
    if (r?.node && unwrap(r.node).type === 'Literal') return String(unwrap(r.node).value);
  }
  return null;
}

function lineRef(schNode, keyNode, scope, ctx, row) {
  const s = schRef(schNode, scope, ctx);
  const k = unwrap(keyNode);
  let key;
  if (literalKey(k, scope) != null) key = literalKey(k, scope);
  else if (k?.type === 'TemplateLiteral') key = render(k, scope, ctx).replace(/^`|`$/g, '');
  else if (k?.type === 'BinaryExpression' && k.operator === '+' && unwrap(k.left).type === 'Literal' && /\.$/.test(unwrap(k.left).value)) {
    key = `${unwrap(k.left).value}{${render(k.right, scope, ctx)}}`;
  } else key = `{${render(k, scope, ctx)}}`;
  // '200.{that row}' -> line 200, same row; '450.1' -> line 450, row 1
  const rowed = key.match(/^(\w+)\.\{?(.+?)\}?$/);
  if (rowed) { key = rowed[1]; row = row ?? (rowed[2] === 'that row' ? 'same row' : rowed[2]); }
  const sch = s?.code && s.code !== '?' ? s.code : ctx.moduleSch;
  const base = /^[\w]+$/.test(key) ? keyLabel(sch, key, s?.prog) : `line ${key}`;
  const suffix = row ? ` (${/^\d+$/.test(row) ? `row ${row}` : row})` : '';
  if (!s) return `${render(schNode, scope, ctx)} → ${base}${suffix}`;
  if (s.kind === 'this') return (ctx.qualifyThis ? `Sch ${ctx.moduleSch} ` : '') + base + suffix;
  if (s.label) return `${s.label}: ${base}${suffix}`;
  return `${s.kind === 'item' ? `Sch ${s.code} (that copy)` : s.kind === 'list' ? `Sch ${s.code} (each copy)` : `Sch ${s.code}`} ${base}${suffix}`;
}

function paramsPath(node, scope) {
  // params[appConfig.lastCalcParamDate].federal.basicRate, possibly through a const
  const parts = [];
  let n = unwrap(node);
  while (n && n.type === 'MemberExpression') {
    if (!n.computed) parts.unshift(n.property.name);
    else if (unwrap(n.property).type === 'Literal') parts.unshift(String(unwrap(n.property).value));
    else if (/lastCalcParamDate/.test(raw(n.property))) { parts.unshift('@date'); }
    else return null;
    n = unwrap(n.object);
  }
  if (n?.type !== 'Identifier') return null;
  const b = scope.lookup(n.name);
  if (b?.params) return parts[0] === '@date' ? parts.slice(1) : null;
  if (b?.node) { const inner = paramsPath(b.node, b.scope ?? scope); return inner ? [...inner, ...parts] : null; }
  return null;
}
const rateText = (path) => {
  let v = rates[rateDate];
  for (const p of path) v = v?.[p];
  return `rate ${path.join('.')}${typeof v === 'number' ? ` (${fmtNum(v)} at ${rateDate})` : ''}`;
};

const listOfKeys = (arr, sch, scope, ctx, row) => (unwrap(arr)?.type === 'ArrayExpression'
  ? unwrap(arr).elements.map((e) => lineRef(sch, e, scope, ctx, row))
  : [`each of ${render(arr, scope, ctx)}`]);

function callbackScope(fn, kind, listNode, scope, ctx) {
  const vars = new Map();
  // filterFields('f4507', sch).forEach(field => ...): each row of a table column
  let ln = unwrap(listNode);
  if (ln?.type === 'Identifier') { const r = resolve(ln, scope); if (r?.node) ln = unwrap(r.node); }
  if (ln?.type === 'CallExpression' && short(ln.callee) === 'filterFields') {
    const s = schRef(ln.arguments[1], scope, ctx);
    const k = unwrap(ln.arguments[0]);
    const key = k?.type === 'Literal' ? String(k.value) : `{${render(k, scope, ctx)}}`;
    const sch = !s || s.kind === 'this' ? ctx.moduleSch : s.code;
    const fieldRef = { sch, key, row: 'each row', schDesc: s, keyNode: ln.arguments[0] };
    const itemIdx = kind === 'reduce' ? 1 : 0;
    fn.params.forEach((p, i) => {
      if (i === itemIdx) vars.set(p.name, { fieldRef, text: `${s && s.kind !== 'this' ? `Sch ${sch} ` : ''}${keyLabel(sch, key)} (that row)` });
      else if (kind === 'reduce' && i === 0) vars.set(p.name, { text: 'running total' });
      else vars.set(p.name, { text: p.name });
    });
    const inner = new Scope(scope, vars);
    for (const [k2, v] of declsIn(fn, Infinity)) inner.vars.set(k2, { ...v, scope: inner });
    return inner;
  }
  const of = schRef(listNode, scope, ctx);
  const item = of ? { kind: 'item', code: of.code, label: of.label ? `each of ${of.label}` : undefined } : null;
  const ps = fn.params.map((p) => p.name);
  const itemIdx = kind === 'reduce' ? 1 : 0;
  // ['115', '120'].forEach(code => ...): a fixed list, expanded one entry per value
  const literals = ln?.type === 'ArrayExpression' && ln.elements.length && ln.elements.every((e) => e?.type === 'Literal')
    ? ln.elements.map((e) => e.value) : null;
  ps.forEach((p, i) => {
    if (i === itemIdx && literals) vars.set(p, { eachOf: literals, text: `each of [${literals.join(', ')}]` });
    else if (i === itemIdx) vars.set(p, item ? { sch: item, text: item.label ?? `each Sch ${item.code}` } : { text: `each item of ${render(listNode, scope, ctx)}` });
    else if (kind === 'reduce' && i === 0) vars.set(p, { text: 'running total' });
    else vars.set(p, { text: p });
  });
  const inner = new Scope(scope, vars);
  for (const [k, v] of declsIn(fn, Infinity)) inner.vars.set(k, { ...v, scope: inner });
  return inner;
}
const bodyExpr = (fn) => (fn.body.type === 'BlockStatement' ? fn.body.body.find((s) => s.type === 'ReturnStatement')?.argument : fn.body);

function reduceText(call, scope, ctx) {
  const list = call.callee.object ?? call.callee.expression?.object;
  const fn = unwrap(call.arguments[0]);
  if (!fn || !/Function/.test(fn.type)) return ctx.flag(call);
  const inner = callbackScope(fn, 'reduce', list, scope, ctx);
  const acc = fn.params[0]?.name;
  const listTxt = schRef(list, scope, ctx) ? schText({ ...schRef(list, scope, ctx), kind: schRef(list, scope, ctx).kind === 'list' ? 'list' : 'sch' }) : render(list, scope, ctx);
  // prev.push(E); return prev;   ->  list of E
  if (fn.body.type === 'BlockStatement') {
    const stmts = fn.body.body;
    const push = stmts.length === 2 && stmts[0].type === 'ExpressionStatement' && stmts[0].expression.type === 'CallExpression'
      && short(stmts[0].expression.callee) === `${acc}.push` && stmts[1].type === 'ReturnStatement';
    if (push) return `{${render(stmts[0].expression.arguments[0], inner, ctx)}, for each ${listTxt.replace(/^every /, '')}}`;
    const plus = stmts.length === 2 && stmts[0].type === 'ExpressionStatement' && stmts[0].expression.type === 'AssignmentExpression'
      && stmts[0].expression.operator === '+=' && stmts[0].expression.left.name === acc && stmts[1].type === 'ReturnStatement';
    if (plus) return `Σ over each ${listTxt.replace(/^every /, '')} of (${render(stmts[0].expression.right, inner, ctx)})`;
  }
  const e = bodyExpr(fn);
  if (e && e.type === 'BinaryExpression' && e.operator === '+' && unwrap(e.left).type === 'Identifier' && unwrap(e.left).name === acc) {
    return `Σ over each ${listTxt.replace(/^every /, '')} of (${render(e.right, inner, ctx)})`;
  }
  if (e && e.type === 'CallExpression' && methodName(e.callee) === 'concat' && unwrap(e.callee.object)?.name === acc) {
    return `{${render(e.arguments[0], inner, ctx)}, for each ${listTxt.replace(/^every /, '')}}`;
  }
  if (e && e.type === 'CallExpression' && short(e.callee) === 'doSum' && unwrap(e.arguments[0])?.type === 'ArrayExpression') {
    const els = unwrap(e.arguments[0]).elements;
    if (els.length === 2 && els[0].type === 'Identifier' && els[0].name === acc) return `Σ over each ${listTxt.replace(/^every /, '')} of (${render(els[1], inner, ctx)})`;
  }
  return ctx.flag(call);
}

function render(node, scope, ctx) {
  node = unwrap(node);
  if (!node) return 'blank';
  if (ctx.depth > 40) return ctx.flag(node);
  ctx.depth++;
  try { return renderInner(node, scope, ctx); } finally { ctx.depth--; }
}
function renderInner(node, scope, ctx) {
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'number') return fmtNum(node.value);
      if (typeof node.value === 'string') return `'${node.value}'`;
      return String(node.value);
    case 'TemplateLiteral':
      return '`' + node.quasis.map((q, i) => q.value.cooked + (node.expressions[i] ? (literalKey(node.expressions[i], scope) ?? `{${render(node.expressions[i], scope, ctx)}}`) : '')).join('') + '`';
    case 'Identifier': {
      if (node.name === 'undefined') return 'blank';
      const b = scope.lookup(node.name);
      if (!b) return node.name;
      if (b.fieldRef?.keyNode) {
        const lit = literalKey(b.fieldRef.keyNode, scope);
        if (lit) return `${b.fieldRef.schDesc && b.fieldRef.schDesc.kind !== 'this' ? `Sch ${b.fieldRef.sch} ` : ''}${keyLabel(b.fieldRef.sch, lit)} (that row)`;
      }
      if (b.text) return b.text;
      if (b.sch) return schText(b.sch);
      if (b.params) return 'rates';
      if (b.steps) {
        if (ctx.active.has(b)) return b.name; // a self-reference while building up: just the name
        ctx.active.add(b);
        try {
        const sc = b.scope ?? scope;
        const parts = b.steps.map((w) => {
          const cond = w.conds.map((c) => `${c.neg ? 'not ' : ''}${renderTest(c.test, sc, ctx)}`).join(' and ');
          const rhs = w.node ? render(w.node, sc, ctx) : '1';
          const what = w.op === '=' ? `= ${rhs}` : w.op === '++' ? '+= 1' : w.op === '--' ? '−= 1' : `${OPS[w.op.slice(0, -1)] ?? w.op.slice(0, -1)}= ${rhs}`;
          return `${w.nested ? 'in a loop, ' : ''}${cond ? `if ${cond}, ` : ''}${what}`;
        });
        return `${b.name}⟨${parts.join('; then ')}⟩`;
        } finally { ctx.active.delete(b); }
      }
      if (b.node) {
        if (ctx.active.has(b)) return node.name;
        const n = unwrap(b.node);
        if (/Function/.test(n.type) || n.type === 'ObjectExpression') return node.name;
        const s = schRef(n, b.scope ?? scope, ctx);
        if (s) return schText(s);
        ctx.active.add(b);
        let t;
        try { t = render(n, b.scope ?? scope, ctx); } finally { ctx.active.delete(b); }
        return /^[\w.\[\]' ]+$/.test(t) ? t : `(${t})`;
      }
      return node.name;
    }
    case 'MemberExpression': {
      if (!node.computed && node.property.name === 'sequence') {
        const o = unwrap(node.object);
        const b = o.type === 'Identifier' ? scope.lookup(o.name) : null;
        if (b?.fieldRef) return 'that row';
        if (b?.sch) return b.sch.kind === 'this' ? 'this copy' : 'that copy';
      }
      if (!node.computed && node.property.name === 'value') return render(node.object, scope, ctx); // a field's value
      const p = paramsPath(node, scope);
      if (p) return rateText(p);
      const r = resolve(node, scope);
      if (r?.node && unwrap(r.node) !== node) return render(r.node, r.scope, ctx);
      const s = schRef(node, scope, ctx);
      if (s) return schText(s);
      if (!node.computed && node.property.name === 'length') {
        const l = schRef(node.object, scope, ctx);
        if (l) return `number of copies of Sch ${l.code}`;
      }
      const nm = short(node);
      if (nm && !/^[A-Z_]+$/.test(nm)) { ctx.named.add(nm); return nm; }
      return nm ?? `${render(node.object, scope, ctx)}[${render(node.property, scope, ctx)}]`;
    }
    case 'LogicalExpression':
      if (node.operator === '&&' && ['schedule', 'field'].includes(testKind(node.left, scope))) {
        return `${render(node.right, scope, ctx)} (when ${renderTest(node.left, scope, ctx)})`;
      }
    // falls through
    case 'BinaryExpression': {
      const l = render(node.left, scope, ctx), r = render(node.right, scope, ctx);
      return `(${l} ${OPS[node.operator] ?? node.operator} ${r})`;
    }
    case 'UnaryExpression':
      if (node.operator === '!' && unwrap(node.argument).type === 'UnaryExpression' && unwrap(node.argument).operator === '!') return render(unwrap(node.argument).argument, scope, ctx);
      if (node.operator === '!') return `not ${render(node.argument, scope, ctx)}`;
      if (node.operator === '-') return `−${render(node.argument, scope, ctx)}`;
      return `${node.operator} ${render(node.argument, scope, ctx)}`;
    case 'ConditionalExpression': {
      // isBlank(v) ? 0 : v  ->  v (blank as 0)
      const t = unwrap(node.test);
      if (t.type === 'CallExpression' && short(t.callee) === 'isBlank' && unwrap(node.consequent).type === 'Literal' && unwrap(node.consequent).value === 0
        && raw(t.arguments[0]) === raw(node.alternate)) return `${render(node.alternate, scope, ctx)} (blank as 0)`;
      return `(${render(node.consequent, scope, ctx)} if ${render(node.test, scope, ctx)}, else ${render(node.alternate, scope, ctx)})`;
    }
    case 'ArrayExpression':
      return `[${node.elements.map((e) => render(e, scope, ctx)).join(', ')}]`;
    case 'CallExpression':
      return renderCall(node, scope, ctx);
    case 'SplitElement': {
      const lit = literalKey({ type: 'Identifier', name: '__split' }, new Scope(scope, new Map([['__split', { node }]])));
      return lit != null ? `'${lit}'` : splitText(node, scope, ctx);
    }
    case 'NewExpression':
      return `new ${short(node.callee) ?? render(node.callee, scope, ctx)}(${node.arguments.map((x) => render(x, scope, ctx)).join(', ')})`;
    case 'SpreadElement':
      return `…${render(node.argument, scope, ctx)}`;
    case 'ObjectExpression':
      return `{${node.properties.map((p) => (p.type === 'SpreadElement' ? `…${render(p.argument, scope, ctx)}`
        : p.shorthand ? `${p.key.name}: ${render(p.value, scope, ctx)}`
          : `${p.key.type === 'Literal' ? p.key.value : p.key.name}: ${render(p.value, scope, ctx)}`)).join(', ')}}`;
    case 'ArrowFunctionExpression':
    case 'FunctionExpression': {
      const e = bodyExpr(node);
      if (!e) return ctx.flag(node);
      const inner = new Scope(scope, new Map(node.params.map((p) => [p.name, { text: p.name }])));
      return `(${node.params.map((p) => p.name).join(', ')} ⇒ ${render(e, inner, ctx)})`;
    }
    case 'AssignmentExpression':
      return `${render(node.left, scope, ctx)} ${node.operator} ${render(node.right, scope, ctx)}`;
    default:
      return ctx.flag(node);
  }
}

function renderCall(node, scope, ctx) {
  const name = short(node.callee);
  const a = node.arguments;
  const R = (n) => render(n, scope, ctx);
  const items = (n) => (unwrap(n)?.type === 'ArrayExpression' ? unwrap(n).elements.map(R) : [`each of ${R(n)}`]);
  const seq = (n) => (n ? R(n) : null);
  switch (name) {
    case 'extractValue': if (a.length === 1) return R(a[0]); return lineRef(a[1], a[0], scope, ctx);
    case 'valueFrom': case 'floatValueFrom': case 'getField': return lineRef(a[1], a[0], scope, ctx);
    case 'valueOf': case 'floatValueOf': case 'floatVal': case 'Number': case 'parseFloat': case 'String': return R(a[0]);
    case 'filterFields': return `every row of ${lineRef(a[1], a[0], scope, ctx)}`;
    case 'totalOf': return `total of ${R(a[0])}`;
    case 'sumFrom': return `sum(${listOfKeys(a[1], a[0], scope, ctx, seq(a[2])).join(', ')})`;
    case 'minusFrom': return `(${listOfKeys(a[1], a[0], scope, ctx, seq(a[2])).join(' − ')})`;
    case 'multiFrom': return `(${listOfKeys(a[1], a[0], scope, ctx, seq(a[2])).join(' × ')})`;
    case 'leastFrom': return `least(${listOfKeys(a[1], a[0], scope, ctx, seq(a[2])).join(', ')})`;
    case 'maxFrom': return `max(${listOfKeys(a[1], a[0], scope, ctx).join(', ')})`;
    case 'minFrom': return `min(${listOfKeys(a[1], a[0], scope, ctx).join(', ')})`;
    case 'oneFrom': return `first non-blank of(${listOfKeys(a[1], a[0], scope, ctx, seq(a[2])).join(', ')})`;
    case 'doSum': {
      let a0 = unwrap(a[0]);
      let sc0 = scope;
      if (a0?.type === 'Identifier') { const r = resolve(a0, scope); if (r?.node) { a0 = unwrap(r.node); sc0 = r.scope; } }
      if (a0?.type === 'CallExpression' && methodName(a0.callee) === 'reduce') {
        const t = reduceText(a0, sc0, ctx);
        const m = t.match(/^\{([\s\S]*), for each ([^{}]+)\}$/);
        if (m) return `Σ over each ${m[2]} of (${m[1]})`;
        return `sum(${t})`;
      }
      const it = items(a[0]); return it.length === 1 ? `sum(${it[0]})` : `(${it.join(' + ')})`;
    }
    case 'getSchedule': case 'filterSchedules': { const sr = schRef(node, scope, ctx); return sr ? schText(sr) : `${name}(${a.map(R).join(', ')})`; }
    case 'doMinus': return `(${items(a[0]).join(' − ')})`;
    case 'doMulti': return `(${items(a[0]).join(' × ')})`;
    case 'doDiv': return `(${items(a[0]).join(' ÷ ')})`;
    case 'leastOf': return `least(${items(a[0]).join(', ')})`;
    case 'minOf': return `min(${items(a[0]).join(', ')})`;
    case 'maxOf': return `max(${items(a[0]).join(', ')})`;
    case 'oneOf': return `first non-blank of(${items(a[0]).join(', ')})`;
    case 'isChecked': return `${lineRef(a[1], a[0], scope, ctx)} is Yes`;
    case 'isTrue': return `${R(a[0])} is Yes`;
    case 'isFalse': return `${R(a[0])} is No`;
    case 'zeroIfNegative': return `max(0, ${R(a[0])})`;
    case 'addTo': return `${R(a[0])} + ${R(a[1])}`;
    case 'isBlank': return `${R(a[0])} is blank`;
    case 'nonBlank': return `${R(a[0])} is not blank`;
    case 'Math.round': case 'Math.abs': case 'Math.min': case 'Math.max': case 'Math.floor': case 'Math.ceil': case 'Math.trunc':
      return `${name.slice(5)}(${a.map(R).join(', ')})`;
    default: break;
  }
  const callee = unwrap(node.callee);
  const meth = callee?.type === 'MemberExpression' && !callee.computed ? callee.property.name : name?.split('.').pop();
  if (name === 'T2_UTIL.dateFromString' && unwrap(a[0])?.type === 'Literal') return `date ${unwrap(a[0]).value}`;
  if (meth === 'getTime' && !a.length) return R(callee.object);
  if (meth === 'reduce') return reduceText(node, scope, ctx);
  // ['220', '222'].every(code => isFalse(valueFrom(code, sch)))  ->  all of lines 220, 222: line X is No
  const litList = unwrap(callee?.object);
  if ((meth === 'every' || meth === 'some') && litList?.type === 'ArrayExpression' && litList.elements.every((e) => e?.type === 'Literal')
    && a[0] && /Function/.test(unwrap(a[0]).type)) {
    const fn = unwrap(a[0]);
    const e = bodyExpr(fn);
    if (e) {
      const inner = new Scope(scope, new Map([[fn.params[0].name, { text: 'X' }]]));
      const body = render(e, inner, ctx).replace(/\{X\}/g, 'X');
      return `(${meth === 'every' ? 'all' : 'any'} of lines X = ${litList.elements.map((x) => x.value).join(', ')}: ${body})`;
    }
  }
  // a small local function: inline its body with the arguments substituted
  const local = callee?.type === 'Identifier' || callee?.type === 'MemberExpression' ? resolve(callee, scope) : null;
  const lf = local?.node && unwrap(local.node);
  if (lf && /Function/.test(lf.type) && lf.params.every((p) => p.type === 'Identifier')) {
    const e = bodyExpr(lf);
    const simpleBody = lf.body.type !== 'BlockStatement' || lf.body.body.length === 1;
    if (e && simpleBody && ctx.depth < 30) {
      const inner = new Scope(local.scope, new Map(lf.params.map((p, i) => [p.name, a[i] ? { node: a[i], scope } : { text: 'blank' }])));
      return `(${render(e, inner, ctx)})`;
    }
  }
  if (ARRAY_METHODS.has(meth) && a[0] && /Function/.test(unwrap(a[0]).type)) {
    const list = node.callee.object ?? node.callee.expression?.object;
    const fn = unwrap(a[0]);
    const inner = callbackScope(fn, meth, list, scope, ctx);
    const e = bodyExpr(fn);
    if (!e) return ctx.flag(node);
    const lt = schRef(list, scope, ctx) ? `Sch ${schRef(list, scope, ctx).code}` : R(list);
    return `${meth}(${lt}: ${render(e, inner, ctx)})`;
  }
  if (meth === 'includes') return `(${R(callee.object)} includes ${R(a[0])})`;
  const shown = a.filter((x) => !(x.type === 'Identifier' && scope.lookup(x.name)?.t2));
  if (name) {
    ctx.named.add(name);
    return `${name}(${shown.map(R).join(', ')})`;
  }
  // a method on a computed value: moment(...).utc(start), dateFromString(...).getTime(), ...
  if (callee?.type === 'MemberExpression' && !callee.computed) return `${R(callee.object)}.${meth}(${shown.map(R).join(', ')})`;
  if (callee?.type === 'CallExpression') return `${R(callee)}(${shown.map(R).join(', ')})`;
  return ctx.flag(node);
}

// ── what one call sets ──────────────────────────────────────────────────────
const KIND = { dirtify: 'set', reportValueOn: 'carried here', addTo: 'added to', calcTotal: 'total recomputed', safe_dirtify: 'federal default' };
// AT1's shared helper fnAT1.safe_dirtify(table, sch, fedSchedule): for each line of the table that is blank,
// set it from the federal line(s) the table names, when that amount is non-zero.
const setterName = (callee) => { const n = short(callee); return n && /(^|\.)safe_dirtify$/.test(n) ? 'safe_dirtify' : n; };
const totalIndex = loadJson(join(FIX, 'refs', 'total-index.json'));
function totalFormula(sch, key) {
  const t = totalIndex[sch]?.[key];
  if (Array.isArray(t)) return `sum(${t.map((c) => keyLabel(sch, String(c))).join(', ')})`;
  if (typeof t === 'string') return `sum of every row of ${keyLabel(sch, t)}`;
  return 'its total-index total (no entry for this line)';
}
const keyNodeOf = (call, cname, scope) => unwrap(cname === 'dirtify' || cname === 'addTo'
  ? targetKeyNode(call.arguments[0], scope)
  : cname === 'reportValueOn' ? call.arguments[1] : call.arguments[0]);
function analyse(call, cname, scope, ctx, moduleSch) {
  const A = call.arguments;
  if (cname === 'dirtify' || cname === 'addTo') {
    const t = targetOf(A[0], scope, ctx, moduleSch);
    ctx.qualifyThis = t.sch !== moduleSch && t.sch !== '?';
    const formula = cname === 'dirtify'
      ? (A[1] ? render(A[1], scope, ctx) : 'blank')
      : `${keyLabel(t.sch, t.key)} + ${render(A[1], scope, ctx)}`;
    return { targetSch: t.sch, targetKey: t.key, row: t.row, formula };
  }
  const [keyN, schN] = cname === 'reportValueOn' ? [A[1], A[2]] : [A[0], A[1]];
  const s = schRef(schN, scope, ctx);
  const targetSch = s?.kind === 'this' ? moduleSch : s?.code ?? '?';
  ctx.qualifyThis = targetSch !== moduleSch && targetSch !== '?';
  const lit = literalKey(keyN, scope);
  let targetKey = lit;
  let row = null;
  if (targetKey == null) {
    const t = render(keyN, scope, ctx).replace(/^`|`$/g, '');
    const m = t.match(/^(\w+)\.\{?(.+?)\}?$/);
    if (unwrap(keyN)?.type === 'TemplateLiteral' && m) { targetKey = m[1]; row = m[2] === 'that row' ? 'same row' : m[2]; }
    else targetKey = `{${t}}`;
  } else {
    const m = targetKey.match(/^(\w+)\.(\d+)$/);
    if (m) { targetKey = m[1]; row = m[2]; }
  }
  const formula = cname === 'reportValueOn' ? render(A[0], scope, ctx) : totalFormula(targetSch, targetKey);
  return { targetSch, targetKey, row, formula };
}

// ── walk each calculator ────────────────────────────────────────────────────
const entries = [];
const resets = {};
const stats = { dirtify: 0, reportValueOn: 0, exact: 0, partial: 0, unresolvedTarget: 0, modules: 0, calcFunctions: 0 };
const named = new Map();

for (const reg of registry) {
  const mod = byPath.get(reg.path);
  if (!mod) { console.error(`missing module ${reg.path}`); continue; }
  const moduleSch = realSch(reg.sch);
  let exportNode = null;
  walk.simple(mod.fn, { VariableDeclarator(d) { if (d.id.name === reg.exp) exportNode = d.init; } });
  if (!exportNode) { console.error(`missing export ${reg.exp} in ${reg.path}`); continue; }
  stats.modules++;
  const moduleScope = new Scope(null, declsIn(mod.fn, Infinity));
  const fns = exportNode.type === 'ArrayExpression' ? exportNode.elements : [exportNode];
  fns.forEach((fn, idx) => {
    if (!fn || !/Function/.test(fn.type)) return;
    const isReset = exportNode.type === 'ArrayExpression' && idx === 0;
    if (!isReset) stats.calcFunctions++;
    walk.ancestor(fn, {
      CallExpression(call, _state, ancestors) {
        const cname = setterName(call.callee);
        if (isReset) {
          if (cname === 'resetFields') {
            const s = schRef(call.arguments[0], buildScope(ancestors, fn, moduleScope, moduleSch, call), new Ctx(moduleSch));
            const code = s?.kind === 'this' || !s ? moduleSch : s.code;
            const arr = unwrap(call.arguments[1]);
            if (arr?.type === 'ArrayExpression') (resets[code] ??= new Set()) && arr.elements.forEach((e) => e.type === 'Literal' && resets[code].add(String(e.value)));
          }
          return;
        }
        if (!Object.hasOwn(KIND, cname)) return;
        stats[cname] = (stats[cname] ?? 0) + 1;
        const baseScope = buildScope(ancestors, fn, moduleScope, moduleSch, call);
        if (cname === 'safe_dirtify') { recordSafeDirtify(call, ancestors, baseScope, reg, moduleSch); return; }
        // A loop over a table: for (const [line, fed] of Object.entries(T)) / for (const line in T).
        // Each row of T becomes its own entry, with the loop variables bound to that row.
        const loop = tableLoop(ancestors, baseScope);
        // The key of a target set inside ['115', '120'].forEach(code => ...) is one of a fixed list.
        const keyArg = keyNodeOf(call, cname, baseScope);
        const listVar = keyArg?.type === 'Identifier' ? keyArg : keyArg?.type === 'TemplateLiteral' && unwrap(keyArg.expressions[0])?.type === 'Identifier' ? unwrap(keyArg.expressions[0]) : null;
        const each = !loop && listVar ? baseScope.lookup(listVar.name)?.eachOf : null;
        const holder = each ? baseScope.lookupRaw(listVar.name) : null;
        for (const v of loop ? loop.rows : each ?? [null]) {
          if (holder) holder.current = { type: 'Literal', value: v, start: call.start, end: call.start };
          if (loop) for (const [name, node] of v) baseScope.vars.set(name, { node });
          const scope = baseScope;
          const ctx = new Ctx(moduleSch);
          const { targetSch, targetKey, row: rowText, formula } = analyse(call, cname, scope, ctx, moduleSch);
          if (targetSch === '?' || /[{}]/.test(targetKey)) stats.unresolvedTarget++;
          const conditions = conditionsOf(ancestors, call, scope, ctx, targetKey);
          const srcFn = [...ancestors].reverse().find((n) => /Function/.test(n.type) && n.id?.name)?.id.name ?? '';
          const exact = ctx.asWritten.length === 0;
          stats[exact ? 'exact' : 'partial']++;
          for (const n of ctx.named) named.set(n, (named.get(n) ?? 0) + 1);
          entries.push({
            targetSch, targetKey, row: rowText, kind: KIND[cname],
            formula, conditions: each ? conditions.filter((c) => !(c.startsWith('for each') && c.includes(`'${each[0]}'`))) : conditions,
            module: reg.path.replace(MOD, ''), export: reg.exp, fn: srcFn,
            chunkLine: lineOf(call), col: call.loc.start.column, runOrder: reg.order, moduleSch, exact, asWritten: ctx.asWritten,
          });
        }
        if (holder) delete holder.current;
        if (loop) for (const name of loop.names) baseScope.vars.delete(name);
      },
    });
  });
}

// for (const [k, v] of Object.entries(T)) / for (const k in T), T a literal table: one binding set per row
function tableLoop(ancestors, scope) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const n = ancestors[i];
    if (/Function/.test(n.type)) break; // only loops inside the function that sets the value
    let table = null, names = null, rowsOf = null;
    if (n.type === 'ForOfStatement' && n.left.type === 'VariableDeclaration' && n.left.declarations[0].id.type === 'ArrayPattern'
      && n.right.type === 'CallExpression' && raw(n.right.callee) === 'Object.entries') {
      table = resolve(n.right.arguments[0], scope)?.node;
      const [k, v] = n.left.declarations[0].id.elements.map((e) => e?.name);
      names = [k, v].filter(Boolean);
      rowsOf = (p) => [[k, { type: 'Literal', value: String(p.key.value ?? p.key.name), start: n.start, end: n.start }], ...(v ? [[v, p.value]] : [])];
    }
    if (n.type === 'ForInStatement' && n.left.type === 'VariableDeclaration' && n.left.declarations[0].id.type === 'Identifier') {
      table = resolve(n.right, scope)?.node;
      const k = n.left.declarations[0].id.name;
      names = [k];
      rowsOf = (p) => [[k, { type: 'Literal', value: String(p.key.value ?? p.key.name), start: n.start, end: n.start }]];
    }
    if (table && unwrap(table).type === 'ObjectExpression') {
      const props = unwrap(table).properties.filter((p) => p.type === 'Property');
      return { names, rows: props.map(rowsOf) };
    }
  }
  return null;
}

// fnAT1.safe_dirtify(table, sch, fedSchedule): one "federal default" entry per row of the table
function recordSafeDirtify(call, ancestors, scope, reg, moduleSch) {
  const ctx0 = new Ctx(moduleSch);
  // the same name may be declared in sibling blocks: the table is the latest one declared before the call
  const r0 = resolve(call.arguments[0], scope);
  const table = r0?.binding?.steps ? r0.binding.steps.filter((w) => w.start < call.start).at(-1)?.node : r0?.node;
  const fed = schRef(call.arguments[2], scope, ctx0);
  const fedLabel = fed ? schText(fed) : render(call.arguments[2], scope, ctx0);
  const target = schRef(call.arguments[1], scope, ctx0);
  const targetSch = !target || target.kind === 'this' ? moduleSch : target.code;
  if (unwrap(table)?.type !== 'ObjectExpression') {
    stats.unresolvedTarget++;
    entries.push({ targetSch: '?', targetKey: `{${render(call.arguments[0], scope, ctx0)}}`, row: null, kind: KIND.safe_dirtify,
      formula: `each line of the table, from ${fedLabel}`, conditions: [], module: reg.path.replace(MOD, ''), export: reg.exp, fn: '',
      chunkLine: lineOf(call), col: call.loc.start.column, runOrder: reg.order, moduleSch, exact: false, asWritten: [raw(call)] });
    return;
  }
  const srcFn = [...ancestors].reverse().find((n) => /Function/.test(n.type) && n.id?.name)?.id.name ?? '';
  for (const p of unwrap(table).properties) {
    if (p.type !== 'Property') continue;
    const ctx = new Ctx(moduleSch);
    const key = String(p.key.value ?? p.key.name);
    const v = unwrap(p.value);
    const fedLines = v.type === 'ArrayExpression' ? v.elements.map((e) => String(e.value)) : [String(v.value)];
    const refs = fedLines.map((l) => `${fedLabel}: ${keyLabel(fed?.code ?? '', l, fed?.prog)}`);
    const formula = refs.length === 1 ? refs[0] : `sum(${refs.join(', ')})`;
    const conditions = [...conditionsOf(ancestors, call, scope, ctx, key), `line ${key} is blank`, `${formula} is non-zero`];
    stats.exact++;
    entries.push({ targetSch, targetKey: key, row: null, kind: KIND.safe_dirtify, formula, conditions,
      module: reg.path.replace(MOD, ''), export: reg.exp, fn: srcFn, chunkLine: lineOf(call), col: call.loc.start.column,
      runOrder: reg.order, moduleSch, exact: true, asWritten: [] });
  }
}

// Second sweep: every dirtify/reportValueOn in a calculator module that the
// pass above did not record — reset functions and the module's own helpers,
// which take the schedule as a parameter. Nothing is left uncounted.
const seenCalls = new Set(entries.map((e) => `${e.module}@${e.chunkLine}@${e.col}`));
const sweptModules = new Set();
for (const reg of registry) {
  if (sweptModules.has(reg.path)) continue;
  sweptModules.add(reg.path);
  const mod = byPath.get(reg.path);
  if (!mod) continue;
  const moduleSch = realSch(reg.sch);
  const moduleScope = new Scope(null, declsIn(mod.fn, Infinity));
  walk.ancestor(mod.fn, {
    CallExpression(call, _s, ancestors) {
      const cname = setterName(call.callee);
      if (!Object.hasOwn(KIND, cname)) return;
      const module = reg.path.replace(MOD, '');
      if (seenCalls.has(`${module}@${lineOf(call)}@${call.loc.start.column}`)) return;
      const fnAnc = ancestors.filter((n) => /Function/.test(n.type));
      const owner = [...fnAnc].reverse().find((n) => n.id?.name) ?? null;
      const ownerName = owner?.id?.name ?? '(anonymous)';
      const isResetFn = ownerName === 'reset';
      // a helper's parameters stay as named placeholders
      let scope = moduleScope;
      const paramBinding = (p) => {
        const n = p.name ?? raw(p);
        if (n === 'sch' || n === 'schedule') return [n, { sch: { kind: 'this', code: moduleSch } }];
        if (n === 't2') return [n, { t2: true, text: 'the return' }];
        if (n === 'params') return [n, { params: true }];
        return [n, { text: `‹${n}›` }];
      };
      for (const f of fnAnc.slice(1)) {
        const sc = new Scope(scope, new Map(f.params.map(paramBinding)));
        for (const [k, v] of declsIn(f, call.start)) if (!sc.vars.has(k)) sc.vars.set(k, { ...v, scope: sc });
        scope = sc;
      }
      stats[cname] = (stats[cname] ?? 0) + 1;
      if (cname === 'safe_dirtify') { recordSafeDirtify(call, ancestors, scope, reg, moduleSch); return; }
      const ctx = new Ctx(moduleSch);
      const { targetSch, targetKey, row: rowText, formula } = analyse(call, cname, scope, ctx, moduleSch);
      if (targetSch === '?' || /[{}]/.test(targetKey)) stats.unresolvedTarget++;
      for (const n of ctx.named) named.set(n, (named.get(n) ?? 0) + 1);
      const exact = ctx.asWritten.length === 0;
      stats[exact ? 'exact' : 'partial']++;
      entries.push({
        targetSch, targetKey, row: rowText,
        kind: isResetFn ? `reset (${KIND[cname]})` : `helper ${ownerName}(${owner?.params.map((p) => p.name).join(', ') ?? ''})`,
        formula, conditions: conditionsOf(ancestors, call, scope, ctx, targetKey), module, export: reg.exp, fn: ownerName,
        chunkLine: lineOf(call), col: call.loc.start.column, runOrder: reg.order, moduleSch, exact, asWritten: ctx.asWritten,
      });
    },
  });
}

function buildScope(ancestors, calcFn, moduleScope, moduleSch, at) {
  let scope = moduleScope;
  for (let i = 0; i < ancestors.length; i++) {
    const n = ancestors[i];
    if (!/Function/.test(n.type)) continue;
    const vars = new Map();
    if (n === calcFn) {
      const [p0, p1, p2] = n.params.map((p) => p.name);
      if (p0) vars.set(p0, { sch: { kind: 'this', code: moduleSch } });
      if (p1) vars.set(p1, { t2: true, text: 'the return' });
      if (p2) vars.set(p2, { params: true });
    } else {
      const parent = ancestors[i - 1];
      const meth = parent?.type === 'CallExpression' ? methodName(parent.callee) : null;
      if (parent?.type === 'CallExpression' && ARRAY_METHODS.has(meth) && parent.arguments.includes(n)) {
        const s = callbackScope(n, meth, parent.callee.object ?? parent.callee.expression?.object, scope, new Ctx(moduleSch));
        for (const [k, v] of s.vars) vars.set(k, v);
      }
    }
    const sc = new Scope(scope, vars);
    for (const [k, v] of declsIn(n, at.start)) if (!vars.has(k)) sc.vars.set(k, { ...v, scope: sc });
    scope = sc;
  }
  return scope;
}

// The key argument of the getField() a dirtify target resolves to (through variables).
function targetKeyNode(node, scope, seen = 0) {
  node = unwrap(node);
  if (node?.type === 'Identifier' && seen < 8) {
    const b = scope.lookup(node.name);
    if (b?.fieldRef?.keyNode) return b.fieldRef.keyNode;
    return b?.node ? targetKeyNode(b.node, b.scope ?? scope, seen + 1) : null;
  }
  if (node?.type === 'CallExpression' && short(node.callee) === 'getField') return node.arguments[0];
  return null;
}

function targetOf(node, scope, ctx, moduleSch, seen = 0) {
  node = unwrap(node);
  if (node?.type === 'Identifier') {
    const b = scope.lookup(node.name);
    if (b?.fieldRef) {
      const lit = b.fieldRef.keyNode ? literalKey(b.fieldRef.keyNode, scope) : null;
      return { sch: b.fieldRef.sch, key: lit ?? b.fieldRef.key, row: b.fieldRef.row };
    }
    if (b?.node && seen < 8) return targetOf(b.node, b.scope ?? scope, ctx, moduleSch, seen + 1);
    if (b?.text) return { sch: moduleSch, key: `{${b.text}}` };
  }
  if (node?.type === 'CallExpression') {
    const name = short(node.callee);
    if (name === 'getField') {
      const s = schRef(node.arguments[1], scope, ctx);
      const k = unwrap(node.arguments[0]);
      const lit = literalKey(k, scope);
      let key = lit ?? render(k, scope, ctx).replace(/^`|`$/g, '');
      let row = null;
      const m = key.match(/^(\w+)\.\{?(.+?)\}?$/);
      if (m) { key = m[1]; row = m[2] === 'that row' ? 'same row' : m[2]; }
      if (lit == null && k?.type !== 'TemplateLiteral') key = `{${key}}`;
      return { sch: !s || s.kind === 'this' ? moduleSch : s.code, key, row };
    }
    if (name === 'filterFields') {
      const s = schRef(node.arguments[1], scope, ctx);
      const k = unwrap(node.arguments[0]);
      return { sch: !s || s.kind === 'this' ? moduleSch : s.code, key: k?.type === 'Literal' ? String(k.value) : `{${render(k, scope, ctx)}}`, row: 'every row' };
    }
  }
  if (node?.type === 'MemberExpression' && seen < 8) {
    const r = resolve(node, scope);
    if (r?.node && unwrap(r.node) !== node) return targetOf(r.node, r.scope, ctx, moduleSch, seen + 1);
  }
  return { sch: '?', key: `{${render(node, scope, ctx)}}` };
}

function conditionsOf(ancestors, call, scope, ctx, targetKey) {
  const out = [];
  for (let i = 0; i < ancestors.length - 1; i++) {
    const n = ancestors[i], child = ancestors[i + 1];
    let c = null;
    if (n.type === 'IfStatement') c = child === n.consequent ? renderTest(n.test, scope, ctx) : child === n.alternate ? negate(renderTest(n.test, scope, ctx)) : null;
    else if (n.type === 'ConditionalExpression' && child !== n.test) c = child === n.consequent ? renderTest(n.test, scope, ctx) : negate(renderTest(n.test, scope, ctx));
    else if (n.type === 'LogicalExpression' && child === n.right) c = n.operator === '&&' ? renderTest(n.left, scope, ctx) : n.operator === '||' ? negate(renderTest(n.left, scope, ctx)) : null;
    else if (n.type === 'CallExpression' && /Function/.test(child.type) && ARRAY_METHODS.has(methodName(n.callee))) {
      const list = n.callee.object ?? n.callee.expression?.object;
      const s = schRef(list, scope, ctx);
      c = `for each ${s ? `Sch ${s.code}` : render(list, scope, ctx).replace(/^every /, '')}`;
    }
    if (!c) continue;
    // "if the line exists": the guard on the very field being set adds nothing
    const bare = c.replace(/ is (on the form|non-zero)$/, '');
    if (bare === `line ${targetKey}` || bare === keyLabel(ctx.moduleSch, targetKey) || bare.endsWith(`[${targetKey}]`)) continue;
    out.push(c);
  }
  return out;
}

// Totals AuraTax computes from data (refs/total-index.json), before any calculator
// runs: validateReturn() calls calculateTotals() first, then calculate() twice.
stats.totalIndex = 0;
for (const [sch, totals] of Object.entries(totalIndex)) {
  for (const key of Object.keys(totals)) {
    stats.totalIndex++;
    entries.push({
      targetSch: sch, targetKey: key, row: null, kind: 'total (total index)', formula: totalFormula(sch, key), conditions: [],
      module: 'refs/total-index.json', export: '', fn: '', chunkLine: 0, col: 0, runOrder: 0, moduleSch: sch, exact: true, asWritten: [],
    });
  }
}

// ── write ───────────────────────────────────────────────────────────────────
for (const e of entries) { e.fieldId = e.targetKey; e.targetKey = lineCode(e.targetSch, e.targetKey); }
mkdirSync(join(OUT, 'schedules'), { recursive: true });
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const caption = (sch, key) => specs[sch]?.fields.get(key)?.caption ?? '';
const order = (sch, key) => specs[sch]?.fields.get(key)?.order ?? 1e9;
const bySch = new Map();
for (const e of entries) (bySch.get(e.targetSch) ?? bySch.set(e.targetSch, []).get(e.targetSch)).push(e);
const schCodes = [...bySch.keys()].sort((x, y) => x.localeCompare(y, undefined, { numeric: true }));

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csv = [['schedule', 'line', 'row', 'caption', 'kind', 'formula', 'conditions', 'exact', 'as_written', 'module', 'export', 'function', 'chunk_line', 'run_order'].join(',')];
for (const code of schCodes) {
  const list = bySch.get(code).sort((x, y) => order(code, x.targetKey) - order(code, y.targetKey) || x.runOrder - y.runOrder || x.chunkLine - y.chunkLine);
  const sp = specs[code];
  const md = [
    `# Sch ${code}: ${sp?.name ?? '(no AuraTax line dictionary)'}`, '',
    `What AuraTax ${version} computes for this schedule, read from its calculator code (\`${chunkName}\`).`,
    'Not a primary source. Notation and conventions: [../README.md](../README.md).', '',
  ];
  const mods = [...new Set(list.filter((e) => e.moduleSch === code).map((e) => `\`${e.module}\` (run ${e.runOrder})`))];
  if (mods.length) md.push(`**Calculators:** ${mods.join(', ')}`, '');
  const feeders = [...new Set(list.filter((e) => e.moduleSch !== code).map((e) => `Sch ${e.moduleSch}`))];
  if (feeders.length) md.push(`**Also set by the calculators of:** ${feeders.join(', ')}`, '');
  if (resets[code]?.size) md.push(`**Cleared before each calculation:** ${[...resets[code]].sort((x, y) => order(code, x) - order(code, y)).map((k) => keyLabel(code, k)).join(', ')}`, '');
  md.push('| Line | Caption | Formula | Only when | Source |', '|---|---|---|---|---|');
  const notes = [];
  const longs = [];
  for (const e of list) {
    const lineCell = /^[\w]+$/.test(e.targetKey) ? keyLabel(code, e.targetKey).replace(/^line /, '') : e.targetKey;
    const src = e.chunkLine === 0 ? 'total-index.json' : `${e.module.replace('calculators/', '')} · ${e.fn || e.export} · L${e.chunkLine}${e.kind === 'set' ? '' : ` (${e.kind})`} · run ${e.runOrder}`;
    const self = e.formula === keyLabel(code, e.fieldId ?? e.targetKey) || e.formula === keyLabel(code, e.targetKey);
    const f0 = self ? `its own value, re-saved so its _rule (sign, limit) applies` : e.formula;
    const f = e.exact ? f0 : `${f0} **[as written]**`;
    let cell = f;
    if (cell.length > 600) { longs.push(`### ${lineCell}${e.row ? ` (row ${e.row})` : ''} (${src})\n\n${f}\n\nOnly when: ${e.conditions.join('; and ') || '-'}`); cell = `see [long formula ${longs.length}](#long-formulas)`; }
    md.push(`| ${esc(lineCell)}${e.row ? ` (row ${esc(e.row)})` : ''} | ${esc(caption(code, e.targetKey))} | ${esc(cell)} | ${esc(e.conditions.join('; and '))} | ${esc(src)} |`);
    if (!e.exact) notes.push(`- **${esc(lineCell)}** (${src}): ${e.asWritten.map((s) => `\`${s.length > 300 ? `${s.slice(0, 300)}…` : s}\``).join('; ')}`);
    csv.push([code, e.targetKey, e.row, caption(code, e.targetKey), e.kind, e.formula, e.conditions.join(' ; and '), e.exact, e.asWritten.join(' ‖ '), e.module, e.export, e.fn, e.chunkLine, e.runOrder].map(csvCell).join(','));
  }
  if (longs.length) md.push('', '## Long formulas', '', ...longs.flatMap((l, i) => [`**Long formula ${i + 1}**`, '', l, '']));
  if (notes.length) md.push('', '## Parts shown as written', '', 'The translator could not render these parts exactly; they appear between ⟦ ⟧ in the formula, verbatim from the code:', '', ...notes);
  writeFileSync(join(OUT, 'schedules', `${code === '?' ? '_unresolved' : code}.md`), `${md.join('\n')}\n`);
}
writeFileSync(join(OUT, 'formulas.csv'), `﻿${csv.join('\n')}\n`);


// ── completeness proof, independent of the passes above ─────────────────────
const callSites = new Map();
for (const path of new Set(registry.map((r) => r.path))) {
  walk.simple(byPath.get(path).fn, {
    CallExpression(c) {
      const n = setterName(c.callee);
      if (Object.hasOwn(KIND, n)) callSites.set(`${path.replace(MOD, '')}@${lineOf(c)}@${c.loc.start.column}`, n);
    },
  });
}
const recorded = new Set(entries.filter((e) => e.chunkLine).map((e) => `${e.module}@${e.chunkLine}@${e.col}`));
const missing = [...callSites.keys()].filter((k) => !recorded.has(k));
const byKind = {};
for (const n of callSites.values()) byKind[n] = (byKind[n] ?? 0) + 1;

// value-setting calls elsewhere in the T2 bundle (validators, services): not formulas
const OUTSIDE_NOTES = {
  'validators/T183.ts': 'Prefills the T183 identification lines (corporation name, business number, tax period, line a1_5 from jacket line 997, and the copied jacket lines) when they are empty.',
  'validators/001.ts': 'After the user confirms a validation prompt: sets line 118 to the suggested amount.',
  'validators/077.ts': 'After the user confirms a validation prompt: sets the line named in the prompt to the computed total.',
  'validators/078.ts': 'After the user confirms a validation prompt: sets line 185 to the line 160 amount.',
  'validators/389.ts': 'Makes a negative number of pages positive.',
  'validators/200.ts': 'Sets jacket line 099 (software approval code) from the AuraTax configuration for the tax year.',
  'services/t2-program.service.ts': 'Ticks the jacket attachment question for a schedule that is present (1 = Yes) and unticks it when the schedule is removed (2 = No); sets jacket line 205 to Yes when certain Schedule 500 credits are claimed.',
};
const outside = [];
for (const m of modules.values()) {
  if (!m.path.startsWith(MOD) || /\/calculators\//.test(m.path)) continue;
  let n = 0;
  walk.simple(m.fn, { CallExpression(c) { if (['dirtify', 'reportValueOn', 'reportValue', 'addTo', 'subFrom', 'calcTotal'].includes(short(c.callee))) n++; } });
  if (n) outside.push({ path: m.path.replace(MOD, ''), n });
}

// the TODO notes AuraTax left in its own calculators
const todos = [];
for (const path of new Set(registry.map((r) => r.path))) {
  const fn = byPath.get(path).fn;
  for (const c of comments) {
    if (c.start > fn.start && c.end < fn.end && /\btodo\b/i.test(c.value)) {
      todos.push(`- \`${path.replace(`${MOD}calculators/`, '')}\` L${SRC.slice(0, c.start).split('\n').length}: ${c.value.trim().replace(/\s+/g, ' ')}`);
    }
  }
}

// where the named functions live
const fnHome = (() => {
  for (const f of readdirSync(WEB).filter((x) => x.endsWith('.js'))) {
    const t = readFileSync(join(WEB, f), 'utf8');
    const m = t.match(new RegExp(`!\\*\\*\\* (\\./src/app/modules/${PROG}/${PROG}-functions\\.ts) \\*\\*\\*!`));
    if (m) return `\`${m[1]}\` in \`${f}\``;
  }
  return `the shared AuraTax ${P} functions module`;
})();

const pct = (a, b) => `${((100 * a) / b).toFixed(1)}%`;
const unresolvedN = entries.filter((e) => e.targetSch === '?' || /[{}]/.test(e.targetKey)).length;
const exactN = entries.filter((e) => e.exact).length;
const readme = [
  `# AuraTax ${P} calculation formulas`, '',
  `Every ${P} line AuraTax ${version} calculates, with its formula, the conditions it applies under, and where`,
  'it sits in the AuraTax code. Generated by `tools/formulas.mjs` from the shipped calculator bundle. Do not edit by hand.', '',
  '**Not a primary source.** This is what AuraTax computes, not what the law or the CRA form says. A formula here',
  'is a pointer to check against the CRA form; never copy one into ca-tax, the BE or the FE.', '',
  '## Provenance', '',
  '| | |', '|---|---|',
  `| AuraTax | ${version} |`,
  `| Calculator bundle | \`${chunkName}\` (sha256 \`${chunkSha.slice(0, 16)}…\`) |`,
  `| Rate date ${P} uses | ${rateDate} (\`conf.json\` \`lastCalcParamDate\`); no other date of the rate table is read |`,
  `| Calculators | ${registry.length} registrations in \`calculators/${PROG}.ts\`, ${stats.calcFunctions} calculation functions |`, '',
  '## Completeness', '',
  'Every call that sets a value in the calculator modules was counted independently of the translation, and each one',
  'is recorded. Fixed lists (`[\'115\', \'120\'].forEach(...)`) are expanded into one entry per line.', '',
  '| | Count |', '|---|---|',
  ...Object.entries(byKind).map(([k, v]) => `| \`${k}\` calls (${KIND[k]}) | ${v} |`),
  `| Call sites found | ${callSites.size} |`,
  `| Call sites recorded | ${callSites.size - missing.length} |`,
  `| **Call sites missing** | **${missing.length}** |`,
  `| Totals from \`refs/total-index.json\` | ${stats.totalIndex} |`,
  `| Entries in the register | ${entries.length} |`,
  `| Translated exactly | ${exactN} (${pct(exactN, entries.length)}) |`,
  `| Partly shown as written (⟦…⟧, listed on the schedule page) | ${entries.length - exactN} |`,
  `| Target line depends on data (see [_unresolved.md](schedules/_unresolved.md)) | ${unresolvedN} |`, '',
  missing.length ? `Missing: ${missing.join(', ')}` : '',
  '## How AuraTax calculates', '',
  '- **Order.** When a return is checked, AuraTax first fills every total in `refs/total-index.json`, then runs all',
  `  ${registry.length} calculators in the order below, then runs them all again (its comment: "todo: yes, twice to ensure accuracy").`,
  '- **Several entries for one line** run in the order of their run number (Source column); the last one whose conditions hold wins.',
  '- **Each calculator** first clears the lines listed under "Cleared before each calculation", then runs its',
  '  functions once for every copy of its schedule.',
  '- **Rounding.** A money line is rounded to whole dollars (`Math.round`, halves up) unless the line keeps cents.',
  '  The line\'s own `_rule` (zero if negative, sign, limits) is applied after that.',
  '- **Overrides.** A line the preparer has overridden is never recalculated.',
  '- **Blanks.** `sum` and `+` skip blanks (all blank gives blank). `×` with a blank gives blank, with a 0 gives 0.',
  '  `−` gives blank if the first value is blank. `÷` by blank or 0 gives blank. `least(…)` is blank if *any* input is',
  '  blank; `min`/`max` skip blanks. `first non-blank of(…)` takes the first filled value. `max(0, x)` keeps a blank blank.',
  '- **Yes/No** lines hold 1 (Yes) or 2 (No).',
  '- **A bare amount as a condition** ("line 400 is non-zero") means not blank and not 0.',
  '- **Quirk:** `max(…)`/`min(…)` over table columns ignore the row they are given.', '',
  '## Notation', '',
  '| Written | Means |', '|---|---|',
  '| `line 360` | line 360 of the schedule the page is about |',
  '| `Sch 027 line 140` | line 140 of Schedule 27 |',
  '| `Sch 125 (that copy) line 8459` | on each copy of a schedule the return can hold several of |',
  '| `amount F [a59]` | an AuraTax working amount, with the letter the form gives it; `[a59]` alone has no letter |',
  '| `(row n)`, `(same row)`, `each row` | rows of a table |',
  '| `Σ over each Sch 125 of (…)` | summed across every copy |',
  '| `x⟨= A; then if c, += B⟩` | a value built in steps, every step shown |',
  '| `rate federal.basicRate (0.38 at …)` | from the rate table (`refs/calculate-params.json`) |',
  '| `CORP.…()`, `PROVINCE.…()` | named AuraTax functions (list below) |',
  '| `⟦…⟧` | code shown verbatim because it could not be translated |',
  '| Source `001.ts · calc_101 · L39` | calculator file, function, line in the bundle |', '',
  '## Schedules', '',
  '| Schedule | Name | Entries |', '|---|---|---|',
  ...schCodes.map((c) => `| [${c === '?' ? 'unresolved' : c}](schedules/${c === '?' ? '_unresolved' : c}.md) | ${esc(specs[c]?.name ?? '')} | ${bySch.get(c).length} |`), '',
  '## Calculation order', '',
  ...registry.map((r) => `${r.order}. Sch ${r.sch}: \`${r.path.replace(`${MOD}calculators/`, '')}\` (\`${r.exp}\`)`), '',
  '## Values set outside the calculators', '',
  'Not formulas: prefills and user-confirmed corrections in validators and services.', '',
  '| Module | Calls | What it does |', '|---|---|---|',
  ...outside.map((o) => `| \`${o.path}\` | ${o.n} | ${OUTSIDE_NOTES[o.path] ?? '(not described yet: read the module)'} |`), '',
  '## TODO notes AuraTax left in its calculators', '',
  ...(todos.length ? todos : ['None.']), '',
  '## Named functions used', '',
  `Defined in ${fnHome}, except the \`T2_UTIL\` and \`DATE_UTIL\` helpers in the shared AuraTax library. Counts are entries using each.`, '',
  '| Function | Entries |', '|---|---|',
  ...[...named.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `| \`${n}\` | ${c} |`), '',
  '## Regenerating', '',
  'From this folder, with Node 22+ and AuraTax installed:', '',
  '```bash',
  'cd tools && npm install && cd ..',
  'node tools/formulas.mjs --out .                      # Windows default install',
  'node tools/formulas.mjs --app <AuraTax folder holding app.asar> --out .',
  '```', '',
  'After an AuraTax update, regenerate and read the diff: the sha256 above changes with the bundle.',
  '`tools/split_chunk.py` splits a bundle into one readable file per module, for checking a Source',
  'reference by eye. Keep its output outside every repo: it is AuraTax code.',
];
writeFileSync(join(OUT, 'README.md'), `${readme.join('\n')}\n`);

// ── validators: every check AuraTax runs on a line ─────────────────────────
// For each schedule's validator object ({ '002': (sch, at1) => {...}, ... }),
// every value it can return: the message (English text from the shipped i18n,
// with its parameters rendered), the severity, and the conditions on the way.
const validatorEntries = [];
const vstats = { modules: 0, validators: 0, returns: 0, messages: 0, unresolved: 0 };
const loadMessages = () => {
  for (const f of readdirSync(WEB).filter((x) => x.endsWith('.js'))) {
    const t = readFileSync(join(WEB, f), 'utf8');
    if (!t.includes('!*** ./src/app/i18n/messages/en/')) continue;
    let found = null;
    walk.simple(acorn.parse(t, { ecmaVersion: 'latest' }), {
      CallExpression(c) {
        if (c.callee.type === 'MemberExpression' && c.callee.object.name === 'JSON' && c.callee.property.name === 'parse'
          && c.arguments[0]?.type === 'Literal' && typeof c.arguments[0].value === 'string') {
          try { const o = JSON.parse(c.arguments[0].value); if (o.app || o.t2 || o.at1) found = o.app ? o : { app: o }; } catch { /* not the messages */ }
        }
      },
    });
    if (found) return { file: f, messages: found };
  }
  return { file: null, messages: {} };
};
const MESSAGES = args.includes('--validators') ? loadMessages() : { file: null, messages: {} };
const messageText = (key) => key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), MESSAGES.messages);

// module-level functions of a module, by name (function declarations and const arrows)
function moduleFunctions(modFn) {
  const fns = new Map();
  for (const st of modFn.body.body ?? []) {
    if (st.type === 'FunctionDeclaration' && st.id) fns.set(st.id.name, st);
    if (st.type === 'VariableDeclaration') for (const d of st.declarations) {
      if (d.id.type === 'Identifier' && d.init && /Function/.test(d.init.type)) fns.set(d.id.name, d.init);
    }
  }
  return fns;
}

// returns whose nearest enclosing function is fn (a concise arrow body counts as one)
function returnsOf(fn) {
  if (fn.body.type !== 'BlockStatement') return [{ node: fn.body, ancestors: [fn] }];
  const out = [];
  walk.ancestor(fn.body, {
    ReturnStatement(r, _s, anc) {
      const nearest = [...anc].reverse().find((n) => /Function/.test(n.type));
      if (!nearest || nearest === fn) out.push({ node: r.argument, ancestors: [fn, ...anc] });
    },
  });
  return out;
}

const SEVERITY = { WARN: 'warning', WARNING: 'warning', ERROR: 'error', INFO: 'info', ERR: 'error' };

// Every message a returned value can be, with the conditions inside helpers.
function messagesOf(node, scope, ctx, fns, depth, conds) {
  const n = unwrap(node);
  if (!n || depth > 4) return n ? [{ unresolved: raw(n), conds }] : [];
  if (n.type === 'Identifier') {
    if (n.name === 'undefined') return [];
    const b = scope.lookup(n.name);
    if (b?.node && !b.steps) return messagesOf(b.node, b.scope ?? scope, ctx, fns, depth + 1, conds);
    return [{ unresolved: raw(n), conds }];
  }
  if (n.type === 'Literal' && (n.value === null || n.value === false)) return [];
  if (n.type === 'ConditionalExpression') {
    return [
      ...messagesOf(n.consequent, scope, ctx, fns, depth, [...conds, renderTest(n.test, scope, ctx)]),
      ...messagesOf(n.alternate, scope, ctx, fns, depth, [...conds, negate(renderTest(n.test, scope, ctx))]),
    ];
  }
  if (n.type === 'LogicalExpression' && n.operator === '&&') {
    return messagesOf(n.right, scope, ctx, fns, depth, [...conds, renderTest(n.left, scope, ctx)]);
  }
  if (n.type === 'ObjectExpression') {
    const prop = (k) => n.properties.find((p) => p.type === 'Property' && (p.key.name ?? p.key.value) === k)?.value;
    if (prop('msg')) {
      const typeTxt = prop('type') ? (short(prop('type')) ?? raw(prop('type'))) : '';
      const tk = typeTxt.split('.').pop().replace(/['"]/g, '').toUpperCase();
      const sev = SEVERITY[tk] ?? (typeTxt || 'unspecified');
      return [{ msgNode: prop('msg'), scope, severity: sev, focus: prop('focusField') ? render(prop('focusField'), scope, ctx) : '', conds }];
    }
    return [{ unresolved: raw(n), conds }];
  }
  if (n.type === 'CallExpression') {
    // a helper defined in this module (warn(...), mustEqualIfSch(...)): follow it with its arguments bound
    const name = short(n.callee);
    const callee = unwrap(n.callee);
    let f = name && fns.get(name);
    let fScope = null;
    if (!f) { const r = resolve(callee, scope); if (r?.node && /Function/.test(unwrap(r.node).type)) { f = unwrap(r.node); fScope = r.scope; } }
    if (f) {
      const params = new Map(f.params.map((p, i) => {
        if (p.type === 'Identifier') return [p.name, n.arguments[i] ? { node: n.arguments[i], scope } : { text: 'blank' }];
        if (p.type === 'AssignmentPattern') return [p.left.name, n.arguments[i] ? { node: n.arguments[i], scope } : { node: p.right, scope }];
        return [raw(p), { text: raw(p) }];
      }));
      const fs = new Scope(fScope ?? scope, params);
      for (const [k, v] of declsIn(f, Infinity)) if (!fs.vars.has(k)) fs.vars.set(k, { ...v, scope: fs });
      const out = [];
      for (const r of returnsOf(f)) {
        const inner = conditionsOf(r.ancestors, r.node, fs, ctx, '');
        out.push(...messagesOf(r.node, fs, ctx, fns, depth + 1, [...conds, ...inner]));
      }
      return out;
    }
    return [{ unresolved: raw(n), conds }];
  }
  return [{ unresolved: raw(n), conds }];
}

// t('app.at1.s012.netIncome', { amount: … }) -> the English sentence, parameters shown as ⟨…⟩
function messageOf(node, scope, ctx) {
  let n = unwrap(node);
  for (let i = 0; i < 6 && n?.type === 'Identifier'; i++) {
    const b = scope.lookup(n.name);
    if (!b?.node) break;
    scope = b.scope ?? scope; n = unwrap(b.node);
  }
  if (n?.type === 'CallExpression' && short(n.callee) === 't' && unwrap(n.arguments[0])?.type === 'Literal') {
    const key = unwrap(n.arguments[0]).value;
    const tmpl = messageText(key);
    const ps = unwrap(n.arguments[1]);
    const vals = {};
    if (ps?.type === 'ObjectExpression') for (const p of ps.properties) if (p.type === 'Property') vals[p.key.name ?? p.key.value] = render(p.value, scope, ctx).replace(/^'([^']*)'$/, '$1');
    if (typeof tmpl !== 'string') return { key, text: `(no English text for ${key})`, found: false };
    return { key, text: tmpl.replace(/\{(\w+)\}/g, (m, k) => (k in vals ? `⟨${vals[k]}⟩` : m)), found: true };
  }
  return { key: '', text: render(n, scope, ctx), found: false };
}

function collectValidators() {
  const regMod = byPath.get(`${MOD}validators/${PROG}.ts`);
  if (!regMod) return;
  const vars = modVarToPath(regMod.fn);
  const reg = [];
  walk.simple(regMod.fn, {
    VariableDeclarator(d) {
      if (d.id.name !== `${P}_VALIDATORS` || d.init?.type !== 'ObjectExpression') return;
      for (const p of d.init.properties) {
        if (p.type !== 'Property' || p.value.type !== 'MemberExpression') continue;
        reg.push({ sch: String(p.key.value ?? p.key.name), path: vars.get(p.value.object.name), exp: p.value.property.name ?? p.value.property.value });
      }
    },
  });
  for (const r of reg) {
    const mod = byPath.get(r.path);
    if (!mod) continue;
    vstats.modules++;
    let obj = null;
    walk.simple(mod.fn, { VariableDeclarator(d) { if (d.id.name === r.exp) obj = d.init; } });
    if (obj?.type !== 'ObjectExpression') continue;
    const moduleScope = new Scope(null, declsIn(mod.fn, Infinity));
    const fns = moduleFunctions(mod.fn);
    const schCode = realSch(r.sch);
    // one (line, function, extra bindings) per validator, expanding spreads and generated tables
    const items = [];
    const fromObject = (o, extra) => {
      for (const p of o.properties) {
        if (p.type === 'SpreadElement') {
          const t = unwrap(p.argument);
          const target = t.type === 'Identifier' ? resolve(t, moduleScope)?.node : t;
          if (unwrap(target)?.type === 'ObjectExpression' && unwrap(target).properties.length) { fromObject(unwrap(target), extra); continue; }
          // const X = {}; Object.keys(MAP).forEach(code => { X[code] = (sch, at1) => ... })
          if (t.type === 'Identifier') {
            walk.simple(mod.fn, {
              CallExpression(c) {
                if (methodName(c.callee) !== 'forEach') return;
                const keysCall = unwrap(c.callee.object);
                if (keysCall?.type !== 'CallExpression' || raw(keysCall.callee) !== 'Object.keys') return;
                const cb = unwrap(c.arguments[0]);
                if (!cb || !/Function/.test(cb.type)) return;
                let assigned = null;
                walk.simple(cb.body, { AssignmentExpression(a) { if (a.left.type === 'MemberExpression' && a.left.object.name === t.name && /Function/.test(a.right.type)) assigned = a.right; } });
                if (!assigned) return;
                const map = resolve(keysCall.arguments[0], moduleScope)?.node;
                if (unwrap(map)?.type !== 'ObjectExpression') return;
                for (const mp of unwrap(map).properties) {
                  const k = String(mp.key.value ?? mp.key.name);
                  items.push({ line: k, fn: assigned, extra: new Map([...extra, [cb.params[0].name, { node: { type: 'Literal', value: k, start: c.start, end: c.start } }]]) });
                }
              },
            });
          }
          continue;
        }
        if (p.type !== 'Property') continue;
        const k = String(p.key.value ?? p.key.name);
        const v = unwrap(p.value);
        if (/Function/.test(v.type)) { items.push({ line: k, fn: v, extra }); continue; }
        // '070': equalsFederal('070', ['310', '410', '510']): a module helper that returns the validator
        if (v.type === 'CallExpression') {
          const f = fns.get(short(v.callee));
          const made = f && (/Function/.test(unwrap(f.body)?.type) ? unwrap(f.body)
            : f.body.type === 'BlockStatement' ? unwrap(f.body.body.find((st) => st.type === 'ReturnStatement')?.argument) : null);
          if (made && /Function/.test(made.type)) {
            const bound = new Map(extra);
            f.params.forEach((pp, i) => { if (pp.type === 'Identifier' && v.arguments[i]) bound.set(pp.name, { node: v.arguments[i] }); });
            items.push({ line: k, fn: made, extra: bound });
            continue;
          }
        }
        items.push({ line: k, alias: raw(v), extra });
      }
    };
    fromObject(obj, new Map());
    for (const it of items) {
      vstats.validators++;
      if (it.alias) {
        validatorEntries.push({ schedule: schCode, line: it.line, severity: '', message: `same checks as ${it.alias}`, key: '', conditions: [], module: r.path.replace(MOD, ''), fn: it.line, chunkLine: 0, exact: false });
        continue;
      }
      const base = new Scope(moduleScope, new Map(it.extra));
      const [p0, p1] = it.fn.params.map((x) => x.name);
      if (p0) base.vars.set(p0, { sch: { kind: 'this', code: schCode } });
      if (p1) base.vars.set(p1, { t2: true, text: 'the return' });
      for (const [k, v] of declsIn(it.fn, Infinity)) if (!base.vars.has(k)) base.vars.set(k, { ...v, scope: base });
      for (const r2 of returnsOf(it.fn)) {
        vstats.returns++;
        const ctx = new Ctx(schCode);
        // conditions on the way to this return (inside the validator itself)
        const outer = conditionsOf(r2.ancestors, r2.node ?? it.fn, base, ctx, '');
        for (const m of messagesOf(r2.node, base, ctx, fns, 0, outer)) {
          if (m.unresolved) {
            vstats.unresolved++;
            validatorEntries.push({ schedule: schCode, line: it.line, severity: '?', message: `⟦${m.unresolved}⟧`, key: '', conditions: m.conds, module: r.path.replace(MOD, ''), fn: it.line, chunkLine: lineOf(r2.node ?? it.fn), exact: false });
            continue;
          }
          const msg = messageOf(m.msgNode, m.scope, ctx);
          vstats.messages++;
          validatorEntries.push({
            schedule: schCode, line: it.line, severity: m.severity, message: msg.text, key: msg.key, focus: m.focus,
            conditions: m.conds, module: r.path.replace(MOD, ''), fn: it.line, chunkLine: lineOf(r2.node ?? it.fn),
            exact: msg.found && ctx.asWritten.length === 0,
          });
        }
      }
    }
  }
}
if (args.includes('--validators')) {
  collectValidators();
  const vcsv = [['schedule', 'line', 'severity', 'message', 'message_key', 'focus', 'conditions', 'exact', 'module', 'chunk_line'].join(',')];
  for (const v of validatorEntries) vcsv.push([v.schedule, v.line, v.severity, v.message, v.key, v.focus ?? '', v.conditions.join(' ; and '), v.exact, v.module, v.chunkLine].map(csvCell).join(','));
  writeFileSync(join(OUT, 'validators.csv'), `﻿${vcsv.join('\n')}\n`);
  console.error(`validators: ${JSON.stringify({ ...vstats, entries: validatorEntries.length, messagesFile: MESSAGES.file })}`);
}

const stat = {
  auratax: version, chunk: chunkName, chunkSha256: chunkSha, rateDate,
  calculators: stats.modules, calcFunctions: stats.calcFunctions,
  callSites: callSites.size, callSitesMissing: missing.length, byKind,
  entries: entries.length, exact: stats.exact, partlyAsWritten: stats.partial, unresolvedTargets: stats.unresolvedTarget,
  schedules: schCodes.length,
  namedFunctions: Object.fromEntries([...named.entries()].sort((a, b) => b[1] - a[1])),
  registry: registry.map((r) => `${r.order}. ${r.sch} ← ${r.path.replace(`${MOD}calculators/`, '')} (${r.exp})`),
};
writeFileSync(join(OUT, 'stats.json'), `${JSON.stringify(stat, null, 1)}\n`);
console.log(JSON.stringify({ ...stat, namedFunctions: Object.keys(stat.namedFunctions).length, registry: stat.registry.length }));
