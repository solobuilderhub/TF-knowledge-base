# TaxFoundry — Technical Architecture (grounded in the real stack)

Everything here is verified against the local package sources and the fajr apps as of 2026-07-27.
Versions/paths in `../AGENTS.md`. This is the "how to wire it" reference; `BUILD-PLAN.md` is the "in what order".

---

## 0. Shape

```
                         ┌─────────────────── apps/web (Next 16) ───────────────────┐
                         │  fluid (UI) · formkit (schema→form) · arc-next (TanStack) │
                         │  better-auth cookie session · form-config per schedule    │
                         └───────────────▲───────────────────────────────────────────┘
                                         │ REST /api/*  (auto-CRUD)  + /api/auth/*  + /api/mcp
                         ┌───────────────┴─────────────── apps/server (Fastify/arc) ─┐
   fin-io connectors ───▶│ resources (defineResource triads) · better-auth · mongokit │
   (QBO/Xero/Plaid/CSV)  │ arc/mcp (every resource → agent tool)                       │
   optional Fajr conn. ──▶│                                                            │
                         │   ┌─────────── tax engine (pure, no LLM, versioned) ──────┐ │
                         │   │ @classytic/ca-tax  T2 + AT1 compute  (our build)       │ │
                         │   │ implements @classytic/tax-core TaxEngine contract      │ │
                         │   └────────────────────────────────────────────────────────┘ │
                         │   agents (arc-ai, later) → propose only → FactLog            │
                         └──────────────────────────────────────────────────────────────┘
                                         │ MongoDB (mongokit)  +  Net File SOAP → TRA / CIF XML → CRA
```

---

## 1. Server (`apps/server`) — mirror `fajr-be-arc/src`

### Entry + boot
- `src/index.ts` — load env → `mongoose.connect(uri)` → `createAppInstance()` → dev-only `syncIndexes` → `app.listen()`.
- `src/app.ts` — the wiring hub:
```ts
export async function createAppInstance(overrides = {}) {
  const resources = overrides.resources ?? await loadResources(import.meta.url); // auto-discover *.resource.ts
  return createApp({
    preset: config.isProd ? 'production' : 'development',
    resourcePrefix: '/api',
    resources,
    auth: { type: 'betterAuth', betterAuth: createBetterAuthAdapter({ auth: getAuth(), orgContext: true }) },
    cors: {...}, trustProxy: true, bodyLimit: 75*1024*1024,
    arcPlugins: { events: { registry, wal, validateMode } },
    bootstrap: [ async (f) => { setApp(f); /* engine warmups */ } ],
    afterResources: async (f) => { await registerMcpEndpoint(f, { resources: mcpResources, auth: getAuth() }); },
  });
}
```

### Per-resource triad (the convention)
Each resource = `<name>.model.ts` (raw Mongoose via mongokit) + `<name>.repository.ts` (`createRepository(Model, {tenant, softDelete, timestamps, schema, events})`) + `<name>.resource.ts` (`defineResource({ name, adapter: createAdapter(Model, repo), presets:[orgScoped], permissions, schemaOptions:{fieldRules} })`).

`shared/adapter.ts` → `createAdapter(model, repo)` wraps `createMongooseAdapter` (mongokit) → the `DataAdapter` arc consumes.
`shared/presets/index.ts` → `orgScoped = multiTenantPreset({ tenantField:'organizationId' })`.
`shared/permissions.ts` → `requireOrgOwner/Manager/Staff` over arc's `requireOrgRole`.

### Auth (`resources/auth/auth.config.ts`) — better-auth singleton
```ts
_auth = betterAuth({
  secret, baseURL, basePath: '/api/auth',
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  user: { additionalFields: { roles: {...} } },
  emailAndPassword: { enabled: true }, socialProviders: { google },
  plugins: [ bearer(), mcp({ loginPage:'/login' }), apiKey({ defaultPrefix:'taxf_' }),
             adminPlugin({...}), organization({ ac, roles:{admin,staff,member}, organizationHooks }) ],
});
registerBetterAuthStubs(mongoose, { plugins:['organization'] });   // from @classytic/mongokit/better-auth
```
Multi-tenant: `organization` = the CPA **firm**. Every tax resource is org-scoped (`organizationId`). To expose BA's `organization`/`member` as arc resources, use `createBetterAuthOverlay({ auth, mongoose, collection })` (read-side).

### MCP (`src/mcp/index.ts`)
`mcpPlugin` auto-generates `list_/get_/create_/update_/delete_<resource>` tools + one per custom route, at `/api/mcp`, through the same permission/audit chain. `McpAuthResolver` verifies `x-api-key`/`Bearer taxf_…` → `{userId, organizationId, orgRoles}`. This is the agent surface — arc-ai agents call these tools.

### TaxFoundry-specific resources (net-new)
| Resource | Purpose |
|---|---|
| `client` | the taxpayer corporation (BN, name, jurisdiction, fiscal year) — org-scoped to the firm |
| `engagement-year` | one filing engagement: client + tax-year-end; holds status, program (T2/AT1) |
| `fact-log` | **append-only** typed events (`SourceImported`, `AccountMapped`, `AdjustmentComputed`, `HumanOverride`, `DiagnosticRaised/Cleared`, `ReviewSignedOff`, `TransmissionAttempted`, `CRAAcknowledged`). immutable (fieldRules) |
| `proposal` | agent output; status accepted/rejected/superseded — the only agent write path |
| `gifi-mapping` | per-client GL→GIFI cache (the compounding asset); seeds year N+1 |
| `computed-return` | materialized fold of fact-log through engine — **cache, never authoritative**; carries `engineVersion` + per-field provenance |
| `review-memo` | green/amber/red cited flags for HITL sign-off |
| `filing-record` | XML/SOAP payload hash, timestamp, CRA/TRA ack, T183 custody |
| custom routes | `POST /engagement-year/:id/compute`, `/prevalidate`, `/transmit`, `/import-cor` |

### Tax engine (pure) — `@classytic/ca-tax` T2/AT1 module
- Implements `@classytic/tax-core` `TaxEngine<TInput,TBreakdown>`: `validate(input)` → `compute(input): TaxObligation` → `render(obligation)` (CIF XML / AT1 Net File XML).
- Follow the shipped `gst34Engine` in ca-tax as the pattern.
- Year-versioned rule tables (`slabs/2024.ts`, `2025.ts`); effective-dated via tax-core `./effective` + `./registry` for mid-year patches.
- **No LLM import** — enforce with a CI dependency-graph rule.
- The pure **renderer** (XML serialization) lives in `@classytic/ca-tax` (`t2/at1/filing/`, no I/O). **Transmission** — the SOAP/CIF client with CRA/TRA network egress, credentials, endpoints, and ack parsing — is a **gateway adapter and lives in the HOST** (`apps/server/src/filing/`), per the repo boundary rule. No separate transmission package.

---

## 2. Web (`apps/web`) — mirror `fajr-fe`

- **Next 16, React 19, Tailwind v4, better-auth cookie.** App Router. TS-first (fajr-fe is JS; we lean on `field.for<T>()`, `defineSchema<T>()`, `createCrudHooks<T>` for end-to-end typing).
- **`app/layout.tsx`** → `<Providers>`. **`components/providers/Providers.tsx`** (`"use client"`, browser-guarded) configures arc-next singletons at load:
```tsx
if (typeof window !== "undefined") {
  configureClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL, authMode: "cookie" });
  configureToast({ success: toast.success, error: toast.error });
  configureNavigation(useRouter);
  configureAuth({ getOrgId: getActiveOrgId });   // active firm
}
// tree: <TanstackProvider><ThemeProvider><Toaster/><TooltipProvider><ShadcnFormSystemProvider>{children}…
```
- **`lib/get-query-client.ts`** — server: new client per request; browser: singleton. `staleTime 10min`, `refetchOnWindowFocus:false`.
- **Auth gate** — `app/(app)/layout.tsx` async server component: `getServerSession()` → redirect if none.
- **Data layer per resource** — vertical slice: `api/<res>.ts` (`createCrudApi("engagement-years",{basePath:"/api"})` + `Object.assign` for `/:id/action` verbs like `compute`, `transmit`) → `hooks/query/use-<res>.ts` (`createCrudHooks`) → page.
- **Forms** — the schedule forms are the heart. Each schedule = `{ zodSchema, formkitSchema }` in a `*-form-config.ts`, rendered with `<FormGenerator schema={getScheduleSchema()} control={form.control}/>` inside a fluid `<FormSheet>`. formkit field builders (`field.text/number/select/date/array/group`) map to fluid inputs (`MoneyInput`, `NumberInput`, `SelectInput`, `FormFieldArray`) via the shadcn/fluid adapter (`components/form-system/adapters/`). **Tax line numbers → field `name`; CRA labels → field `label`.**

### The return editor (our answer to AuraTax's editor)
- Left: schedule tree (jacket + added schedules), driven by `engagement-year` schedule list.
- Center: the active schedule's generated form (formkit).
- Right/top: **Review memo** (agent flags), **Pre-validate**, **Compute**, **Transmit** actions → server custom routes.
- Every numeric field shows provenance (engine/imported/human) — the trust UI the incumbents can't offer.

---

## 3. Data ingestion
- **fin-io** (`@classytic/fin-io`) normalizes QBO/Xero/Plaid/CSV/OFX → canonical trial balance. Standard path.
- **CRA Auto-fill (AFR)** via Represent-a-Client (later).
- **COR file import** — parse filed `.cor` → GIFI S100/S125 opening balances (fajr already does this; reuse). Doubles as the golden-return corpus feeder.
- **Optional Fajr connector** — pulls already-GIFI-coded books for firms on Fajr. Not required.

## 4. Why this composition
- arc gives authed multi-tenant CRUD + the agent MCP surface for ~one `defineResource` per entity — no hand-rolled controllers.
- tax-core keeps the engine a swappable pure function with a stable contract; ca-tax is where jurisdiction logic lives (repo CLAUDE.md boundary: packages = primitives+formulas, host = composition).
- formkit + fluid mean each of the ~30 schedules is a data-defined form, not bespoke React — the only scalable way to cover 177 T2 schedules over time.
