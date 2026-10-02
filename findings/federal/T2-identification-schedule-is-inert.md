# T2 "Identification" guided-editor schedule collects data nothing reads

**Status: fixed, 2026-09-03.** Found while researching `identification.ts`
to build its paper Form View — the investigation that was supposed to be
"which jacket lines does this map to" turned into "does anything downstream
even read this at all." Closed as part of a sweep through every open
`research/findings/` item.

## The fix

The original investigation's grep (`ri\.identification\|IdentificationValues`
over `apps/server/src/engine/`) missed `apps/server/src/filing/` entirely —
re-checking there found `t2-cif.service.ts` already reads and wires
`firstReturn`, `nonResident`, `amalgamation`, `windUp`, `finalReturn`,
`acquisitionOfControl`, `professionalCorp`, `inactive`, `relatedCorporations`,
`foreignAffiliates`, `foreignPropertyOver100k`, and
`nonArmsLengthNonResidentTransactions` into the filed CIF questionnaire, and
`co17-return.service.ts` already reads `quebecId`. The finding's "genuinely
inert everywhere checked" list was stale for those fields — this app's filing
pipeline is a separate path from its compute pipeline, and the original
search only checked the latter.

What was genuinely still missing, now fixed:

- **`deemedYearEnd`** — typed on `T2CifQuestionnaire`'s host interface but
  never read into the questionnaire object. Added the missing
  `deemedYearEnd != null` mapping in `t2-cif.service.ts`, a `deemedYearEnd`
  field on `T2CifQuestionnaire`, and its XML serialization at line 066.
- **The `nonResident`/`residentOfCanada` split was backwards.** The jacket's
  real line 080 asks "Is the corporation a resident of Canada?" — the
  OPPOSITE of what the guided editor collects. The renderer had TWO fields:
  a `residentOfCanada` field with the correct line (080) that nothing ever
  populated, and a `nonResident` field that DID get populated but was tagged
  with line 071 (amalgamation's line, not a real "non-resident" line at
  all). Fixed by inverting `idn.nonResident` into `residentOfCanada` at the
  service layer and removing the mistagged `nonResident` field/element
  entirely — line 080 now gets the preparer's real answer.
- **Wrong jacket line-number citations throughout `T2CifQuestionnaire`**
  (`packages/ca-tax/src/t2/filing/t2-cif-renderer.ts`) — `firstYear` was
  tagged 067 (really `professionalCorp`'s line), `amalgamation` was tagged
  072 (really `windUp`'s line), `windUp` was tagged 076 (a different concept,
  "final year BEFORE amalgamation"), `addressChanged` was tagged 063 (really
  `acquisitionOfControl`'s line). Corrected all of them against the same
  rendered-PDF citations already verified for
  `identification-form-view.tsx`/`identification.ts` (`research/sources/cra-forms/pdf/T2-jacket.pdf`
  pages 1-2), and added the two that had no citation at all
  (`acquisitionOfControl` → 063, `relatedCorporations` → 150).
- **`corpType` is deliberately NOT wired**, and the guided-editor field was
  REMOVED (not fixed) rather than connected. `engagement-compute.service.ts`
  derives CCPC/SBD eligibility ONLY from the client record on purpose — a
  trust-boundary decision, documented in that file's own comment, that
  prevents a return input from ever asserting its own corporation type to
  win the 9% rate. Wiring `identification.corpType` as an override (the
  finding's own first suggestion) would have reopened exactly that hole.
  The correct close was the finding's OTHER suggested option: remove the
  duplicate field and point preparers at the client record, which is what
  the "Corporation" section's own description now says.

**Still not modelled, by design, disclosed inline** (paper Form View + the
`identification.ts`/`t2-cif.service.ts` code comments all say this now): none
of the Yes/No filing-trigger fields feed a computed DOLLAR figure.
`acquisitionOfControl`/`deemedYearEnd`/`amalgamation`/`windUp` can genuinely
force a short tax year with its own proration under the Act (s.249(4)/(3.1)) —
that's real, separate engineering work (loss-pool expiry, CCA half-year-rule
reset, a second short-year computation), not attempted here.

Regression test: `tests/t2-cif.test.ts` — `'questionnaire lines match the
rendered T2-jacket PDF, not the earlier mixed-up citations'` asserts every
corrected line number and the `residentOfCanada` inversion.

---

*Original finding, preserved below for context:*

## What was checked

`grep -rn "ri\.identification\|IdentificationValues" apps/server/src/engine/`
— every hit is in the Zod schema/contract layer
(`contracts/t2-input.ts`, `contracts/return-input.ts`) that VALIDATES the
shape of `ReturnInput.identification`. **Zero hits anywhere in
`assemble-t2-input.ts`, `t2-compute.ts`, `engagement-compute.service.ts`, or
any other file that actually builds the compute-engine's input or the filed
jacket payload** (`province` excepted — see below). The data is collected,
typed, stored — and never reaches the actual tax CALCULATION.

**Correction/nuance**: `apps/server/src/review/diagnostics.ts` DOES read
three of these fields — `corpType` (line 70, OR'd with the client record's
own corpType, for a "have you answered this at all" completeness warning),
`inactive` (line 57, gates whether other missing-data warnings even fire),
and `province` (line 85). So "nothing reads this at all" is too strong for
those three: they feed the REVIEW/diagnostics checklist a preparer sees
before filing, just not the actual computed dollar figures or the filed
jacket payload. The other ~13 fields (`quebecId`,
`acquisitionOfControl`, `deemedYearEnd`, `professionalCorp`,
`addressChanged`, `firstReturn`, `nonResident`, `amalgamation`, `windUp`,
`finalReturn`, `foreignAffiliates`, `foreignPropertyOver100k`,
`nonArmsLengthNonResidentTransactions`, `relatedCorporations`) do not appear
in `diagnostics.ts` either — genuinely inert everywhere checked.

Confirmed specifically for the schedule's most consequential field,
`corpType` ("Type of corporation at the end of the tax year", jacket line
040): `federal-t2.ts`'s own doc comment states the SBD "FAIL[s] CLOSED on
corporation type" and is granted "ONLY when the caller explicitly asserts
CCPC status." Tracing where that assertion actually comes from —
`engagement-compute.service.ts:177`: `const isCcpc = (client.corpType ??
'').toUpperCase().includes('CCPC')` — it's sourced from the **client
record's own `corpType` field** (set at client creation, a separate part of
this app entirely), not from `identification.ts`'s guided-editor selection
at all. A preparer who changes the "Type of corporation" answer on this
schedule changes nothing about whether the return claims the SBD.

## Scope of the gap

Every field in `identification.ts`'s guided editor is in this state EXCEPT
one: `corpType`, `quebecId`, `acquisitionOfControl`, `deemedYearEnd`,
`professionalCorp`, `inactive`, `addressChanged`, `firstReturn`,
`nonResident`, `amalgamation`, `windUp`, `finalReturn`, `foreignAffiliates`,
`foreignPropertyOver100k`, `nonArmsLengthNonResidentTransactions`,
`relatedCorporations` — none of these identifiers appear in the
compute/filing pipeline. **`province` is genuinely live**, confirmed at
`assemble-t2-input.ts:599,617`: `returnInput.identification?.province` is
read and spread into `AssembledFederalInput` as the single-jurisdiction
fallback province, used whenever `provincial-allocation.ts`'s own
`establishments` array is empty (a single-province corporation with no
multi-jurisdiction allocation to enter).

## Why this wasn't fixed inline

This is a genuine architecture question, not a one-line fix: should these
fields be wired into the compute/filing pipeline (real engineering work,
schedule by schedule — `acquisitionOfControl`/`deemedYearEnd` plausibly feed
a short-tax-year proration somewhere; `province` plausibly should override
or confirm the client record's own province; the various Yes/No "attach
schedule N" triggers are pure filing-metadata that this app's Net File/CIF
generation may need for real, separate from any computed dollar figure), or
should the guided editor be trimmed to remove fields that duplicate the
client record and are otherwise decorative? Both are legitimate directions;
picking one is a product decision, not something to guess at while building
a paper Form View for a different, narrower purpose.

## What the paper Form View does about it (for now)

`schedule-identification-form-view.tsx` (federal T2 jacket page 1
identification/attachments block — the printed lines were verified directly
against the rendered PDF, `research/sources/cra-forms/pdf/T2-jacket.pdf`
pages 1-2, NOT the raw text extraction, which is unreliable there — see the
component's own doc comment) shows the fields with CORRECTED line-number
citations (several of `identification.ts`'s original citations were also
simply wrong — see the companion fix in `identification.ts` itself) but adds
a clear, unmissable disclosure that this schedule's answers are not yet
consumed by any computation or filing output in this app.

## If this needs to be revisited

- Decide, deliberately, whether `identification.ts` should feed the
  compute/filing pipeline or be trimmed. If the former: start with
  `corpType` — either wire it as a genuine override of the client record's
  own type (with a clear precedence rule, matching this app's existing
  "frozen identity at compute time" pattern for AT1), or remove the field
  from this schedule entirely and point preparers at the client record
  instead, since maintaining two places to answer the same question with no
  connection between them is worse than one.
- `province` needs no further verification — already confirmed live and
  should stay excluded from any future "trim the dead fields" pass.
