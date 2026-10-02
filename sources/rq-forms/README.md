# Revenu Québec source documents

Primary documents for the **CO-17** Québec corporation income tax return, held so
the form layer traces to a published form rather than to memory.

```
pdf/         the documents as downloaded — never written to
extracted/   derived .layout.txt (pdftotext -layout)
```

## What is here

| File | Form | Version |
|---|---|---|
| `pdf/CO-17-2025-12.pdf` | **CO-17** Déclaration de revenus des sociétés | 2025-12 |
| `pdf/CO-17-SP-2024-12.pdf` | CO-17.SP, non-profit corporations | 2024-12 |
| `pdf/CO-17-SP-2024-12-DXI.pdf` | CO-17.SP, fillable variant | 2024-12 |

Downloaded by hand on 2026-08-20 from
[revenuquebec.ca](https://www.revenuquebec.ca/fr/services-en-ligne/formulaires-et-publications/details-courant/co-17/).
The site returns **403 to automated fetches**, exactly as canada.ca does, so this
is the only route — see the same note in `../cra-forms/WANTED.md`.

## Québec numbers boxes, it does not number lines

The CRA prints a three-digit line number; TRA uses a nine-character
`SSSFFFOOO`. Québec uses a **box number that may carry a letter**:

```
01a  01b  01c        identity
299                  revenu imposable
420  420c  420d      taxable income, eligible-business income, tax
421  421a … 421g     Québec proportion, then the credits
425                  impôt à payer
```

So `420c` is a real box, not a sub-part of 420, and the suffix is significant.
This is why `FormDefinition.scheme` carries `'rq-box'` rather than reusing
`'cra-line'` — a consumer that assumes three digits would truncate them.

## The form extracts cleanly. The FILING SPECIFICATION is a different document

`pdftotext -layout` reads CO-17 well (452 lines over 5 pages) because it is a
leader-and-caption form rather than a grid. No rendering pass was needed, unlike
CRA Schedules 2, 3, 5, 21 and 24.

What is **not** here, and cannot be downloaded, is the **online-filing
specification** — the XML element names ImpôtNet expects. Revenu Québec
distributes that through its partner/developer programme, the same gate as CRA's
certified CIF schema. `co17-return-renderer.ts` says so in its own header and
produces a clearly-labelled draft for that reason.

The practical split:

- **The form** (held) → line numbers, captions, the form definition, the numbers
  a preparer sees in the editor.
- **The specification** (not held) → transmission. Blocked either way, exactly as
  federal transmission is.

## The SBD is computed elsewhere

Québec's small business deduction is not calculated on CO-17. Lines **420c** and
**420d** carry figures in from form **CO-771**, which is not held here. The
eligibility test is Québec's own — a paid-hours threshold, not the federal
associated-group test — so nothing about it can be inferred from the federal
return.
