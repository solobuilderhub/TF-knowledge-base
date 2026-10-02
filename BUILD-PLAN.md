# TaxFoundry — Build Plan

Sequenced backward from CRA/TRA certification windows (fall & spring). Principle: **ledger → engine → filing path → agents.**
Agents are the cheap, replaceable layer; the engine + filing are the long-lead, certifiable items.

## Phase 0 — foundation & evidence (start now, parallel)
- [ ] **Golden-return corpus** (named owner): replay filed `.cor` returns via fajr's COR import → fixtures the engine must reproduce. No certification dependency. *This is the moat; every month late = corpus not accumulated.*
- [ ] Scaffold `apps/server` + `apps/web` (done — see below). Wire auth + one trivial org-scoped resource end-to-end; prove login → CRUD → MCP tool works.
- [ ] Lock v1 scope + gate-out rule (done in AGENTS.md / PRD).
- [ ] Get from regulators: AT1 track (Net File vs RSI), exact window dates, re-cert cadence.

## Phase 1 — the ledger + jacket
- [ ] `fact-log` resource (append-only, immutable fieldRules) + `computed-return` (cache, engineVersion + provenance) + `engagement-year`/`client` resources.
- [ ] **Provenance serializer assertion** (blocks transmit if any field provenance = `model`) — ~20 lines, written before any agent. The single most important safety control.
- [ ] T2 **jacket** engine + schema (identification, tax-year, page-9 summary skeleton) in `@classytic/ca-tax`, implementing tax-core `TaxEngine`. Web: jacket form via formkit against the same schema.
- [ ] GIFI **S100/S125/S141** schemas + validity checks (assets=liab+equity, required non-null lines).

## Phase 2 — compute + AT1 in parallel (certifiable core)
- [ ] **S1** net-income book→tax reconciliation (engine core). **S8 CCA** incl. immediate expensing. **S7** AAII/SBD. **S3/S55/S53** dividends/Part IV/GRIP. **S50**.
- [ ] **AT1** (Sch 000) + Sch 1, 2, 12, 13, 21, 10, 18 — enough to pass **Test Case 1**. Decide IEG (Sch 29 / TC2-3) in/out (couples to SR&ED).
- [ ] Engine reproduces the golden returns + TC1 exactly.
- [ ] Year-versioned rule tables; CI rule: engine has no LLM import.

## Phase 3 — filing path (→ certification)
- [x] **Renderer** (pure, in `@classytic/ca-tax`): AT1 **Net File** XML against `AlbertaCorporateIncomeTaxReturn.xsd` (`renderAt1NetFile`). CIF **T2 XML** renderer pending the T2 schema.
- [ ] **Transmission = HOST gateway adapter** (`apps/server/src/filing/`, NOT a package): SOAP client + ack parser for AT1 Net File; CIF transmitter for T2. Egress-isolated; the only component reaching CRA/TRA; writes the `filing-record`.
- [ ] Pre-validate (edit/diagnostic catalogue) + Transmit flow + T183 e-sign capture + 6-yr WORM custody.
- [ ] Submit test cases to TRA certification environment → **certification window**.
- [ ] Fallback: a non-agentic deterministic filer that certifies is a shippable milestone.

## Phase 4 — the agent layer (differentiation, built last)
- [ ] arc-ai agents over the arc/mcp surface: **ingestion agent** (fin-io + AFR + COR), **mapping agent** (GL→GIFI + confidence + per-client cache), **review agent** (cited memo, green/amber/red), HITL queue.
- [ ] Complexity gate (deterministic out-of-scope detection → CPA referral).
- [ ] L1 pilot with 2–3 Alberta CPA firms.

## Definition of done for v1
An Alberta CCPC's books → agent-drafted, human-reviewed T2 + AT1 → transmitted & accepted by CRA + TRA, with a full fact-log audit trail and provenance on every filed number. Passes the Fall-2025 test cases and N reproduced `.cor` golden returns.

## Immediate next actions (next session)
1. `apps/server`: implement `auth.config.ts` (getAuth) + `client`/`engagement-year` resources + boot; verify `/api/auth`, `/api/clients`, `/api/mcp`.
2. `apps/web`: Providers + auth gate + engagement-year list/create vertical slice.
3. `@classytic/ca-tax`: T2 jacket `schema.ts` + a failing test that loads TC1 and asserts AT1 line values (red first).
