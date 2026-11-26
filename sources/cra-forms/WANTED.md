# CRA source documents — sourcing notes

What is held and what is missing is in [`../../forms/STATUS.md`](../../forms/STATUS.md)
(generated). This file keeps the sourcing notes, which cost real time to learn.

## Fetching

`canada.ca` does not answer `curl` from this machine (it times out, with no
response at all). It does answer a real browser, and `tools/fetch-form.sh`
drives one:

```bash
cd tools
./fetch-form.sh t2sch9 ../pdf/T2SCH09-related-associated.pdf
```

It reads the PDF link off the form's own page and prefers the fillable PDF,
whose field list `extract-xfa.py` reads. It never overwrites: to take a
reprint, move the old copy away first. Then `python forms/run.py` from the
research root.

## The jacket needed its own extractor

`T2-jacket.pdf` is held and authored. It could not be read by the schedule
pipeline: its numbers sit in right-hand boxes, its captions run to their LEFT,
and a number printed inside a caption is a cross-reference rather than a field.

`tools/extract-jacket.py` handles it — a line box sits at x ≥ 340, and the
caption is the text to its left on the same row. 180 boxes captured, 93 dropped
as cross-references rather than guessed.

Worth remembering: `check-quality.py` scored the *schedule* extractor's attempt
at the jacket 153/167 "clean" while its captions were stitched from unrelated
questions. That score judges each caption in isolation. **A high score means
"no obvious fragments", not "safe to author from".**

## Not built, on purpose

The federal long tail that is inapplicable by sector (financial institutions,
insurers, credit unions, film and video production, journalism, resource, the
clean-economy credits themselves) is the "specialized" bucket in
`forms/registry.tsv`. Its documents are not held and nothing is planned for it.
