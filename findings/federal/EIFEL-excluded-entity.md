# EIFEL — excessive interest and financing expenses limitation

**Research note · sources: ITA s.18.2 / 18.21, CRA guidance, practitioner commentary**

## The headline finding — it changes our risk assessment

I previously classified EIFEL as a **P0 silent wrong answer** for our target
client. That was **overstated**, and the reason matters.

s.18.2(1) defines an **excluded entity**, to which the regime simply does not
apply. There are three exceptions, and the first one covers almost our entire
target segment:

| Exception | Test |
|---|---|
| **Small CCPC** | CCPC throughout the year **and** taxable capital employed in Canada, together with associated corporations, **< $50 million** |
| **De minimis** | Net interest and financing expenses of the group **≤ $1,000,000** |
| **Domestic** | All or substantially all business carried on in Canada, subject to conditions |

An owner-managed Alberta CCPC is essentially always inside the small-CCPC
exception, and would usually also clear the de minimis test. **EIFEL does not
apply to it.**

So the correct engineering response is **not** "build the limitation". It is
**determine excluded-entity status**, and gate out only in the residual cases
where none of the exceptions is met.

## Why this is still worth building

The exception is not automatic and the residual cases are real:

- A corporation that is **not a CCPC**. The product supports "other private" and
  "public" corporation types; neither gets the small-CCPC exception.
- A CCPC whose **associated group** taxable capital reaches $50M. The test is on
  the group, not the filer.
- Either of those with **net interest and financing expenses over $1M**.

Today such a return computes and returns an answer with unrestricted interest
deductions — overstated deductions, understated taxable income, no warning.

## The elegant part: we already hold the inputs

Both limbs of the small-CCPC test are data the engine already has:

- **CCPC status** — an existing engine input, already gating the SBD.
- **Taxable capital employed in Canada** — computed by **Schedule 33**, which is
  implemented, and already used for the SBD taxable-capital grind.

So the most common exception resolves with **no additional preparer input**. We
only need to ask for net interest and financing expenses, and only when the
small-CCPC exception has not already settled it.

## Scope of this implementation

**Recognition and gate-out. Not the limitation calculation.**

Determining that the regime does not apply is a complete and correct answer for
the overwhelming majority of returns. Refusing the residual is correct too. What
would be incorrect is computing a restricted amount using a ratio and an
adjusted-taxable-income definition we have not built — so we do not.

For reference when the calculation is eventually built: the fixed ratio is 30%
of adjusted taxable income, with a 40% transitional ratio for tax years
beginning before 1 January 2024. **[PIN]** both before implementing.

## Applicability

Tax years **beginning on or after 1 October 2023**. Earlier years are outside the
regime entirely and must not be gated.

## Test matrix

1. Tax year beginning before 2023-10-01 ⇒ regime does not apply, no gate.
2. CCPC, group taxable capital < $50M ⇒ excluded (small CCPC), no gate.
3. CCPC, group taxable capital ≥ $50M, net IFE ≤ $1M ⇒ excluded (de minimis).
4. CCPC, group taxable capital ≥ $50M, net IFE > $1M ⇒ **not excluded, gate out**.
5. Non-CCPC, net IFE ≤ $1M ⇒ excluded (de minimis).
6. Non-CCPC, net IFE > $1M, domestic exception asserted ⇒ excluded (domestic).
7. Non-CCPC, net IFE > $1M, no exception ⇒ **not excluded, gate out**.
8. Net IFE not supplied where it is needed ⇒ gate out (fail closed — we do not
   assume the expense is small).
