# AT1 jacket — the printed form's line 088 total vs. the Net File 090 formula

**Status: investigated, not a bug. No code change.**

## The apparent discrepancy

`AT1-jacket-TRA11722.pdf` (Rev. 2025-07, page 2) prints an intermediate total,
line **088**, directly above the balance:

> Total (lines 129 + 082 + 085 + 086 + 115 + 087)
> Balance Unpaid (Overpayment) (line 080 - line 088)

That includes the Innovation Employment Grant (**129**) and the Alberta Film
and Television Tax Credit (**115**), and omits the SR&ED tax credit (**081**)
entirely.

The engine (`packages/ca-tax/src/t2/at1/filing/at1-line-items.ts`,
`albertaBalanceUnpaid`) computes:

```
000090 = 000080 − (000081 + 000082 + 000085 + 000086 + 000087)
```

— the opposite: **081** included, **129**/**115** excluded. `jacket.ts`'s own
doc comment explicitly reasons about this, citing a prior defect where 129 was
wrongly netted in.

## What was checked

- **Both spec versions currently vendored** — `AT1-Chapter3-2025.2-full.txt`
  and the newer `AT1-Chapter3-2026.4-full.txt` — state the identical formula
  for line 090: `000080 - (000081 + 000082 + 00085 + 000086 + 000087)`. No
  mention of 088, 115, or 129 in the balance calculation in either version.
- **`research/sources/tra-spec/knowledge-base/06-changelog-2025.2-to-2026.4.md`**
  (an existing, independent, methodical diff of the two spec releases,
  cross-checked via full-corpus dollar/percentage token-frequency diffs, TOC
  diff, and a verbatim spot-check of the "AT1 form-000 completion rule")
  concludes there are **no undocumented substantive changes** between the two
  versions anywhere in the document, and the 3 disclosed changes (phone
  number length, Schedule 29 T661 line 557, error-catalog additions) don't
  touch the balance formula.
- **The spec's own worked Net File XML example** (both versions, same values)
  has every credit line — 081, 082, 086, 087 — at zero, so it can't
  distinguish the two formulas; it doesn't resolve the question either way.
- **Line 000088 does not exist anywhere** in either spec version's
  cross-reference tables, nor anywhere in this codebase — it has no Net File
  Line-Item-ID. It appears to be a **paper-form-only arithmetic aid**, not a
  transmitted value.

## Conclusion

This app files via **Net File** (XML transmission), not paper/RSI — and per
`at1-rsi-print-format.md` (already documented in this repo), TRA certifies
Net File and the AT1 RSI/paper format **separately**; passing one says
nothing about the other. The printed form's 088/090 arithmetic looks like a
convenience subtotal for a human completing the form by hand, using a set of
credits that may have been updated on the paper form's layout without a
matching update to the Net File Chapter 3 cross-reference table's formula
text — or possibly a genuine long-standing inconsistency in TRA's own
paper form that predates both vendored spec versions.

Either way: what this software actually transmits to TRA is governed by the
Net File spec, which is internally consistent across both available versions
and matches the engine exactly. **The engine's `090` formula is correct for
what it actually files.** No code change made.

## If this needs to be revisited

- A worked Net File XML example with non-zero 115/129 values (none exists in
  either spec's own samples) would be the cleanest way to confirm TRA's
  systems actually expect the narrower formula.
- Checking with TRA's Net File certification desk directly would be
  authoritative but wasn't attempted here (outside a coding session's scope).
