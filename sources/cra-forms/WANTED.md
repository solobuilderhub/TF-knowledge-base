# CRA source documents

**Nothing is outstanding.** All 28 forms the engine needs are held in `pdf/`.
This file is kept for the sourcing notes below, which cost real time to learn.

The engine computes these schedules, but the repository holds no primary document
for them — so their line numbers and captions have never been checked against the
printed form. Everything here is a **download list**, not a defect list.

## Why this can't be automated from here

`canada.ca` does not serve automated fetches from this machine. `curl` with a
browser user-agent **times out entirely** (no response, not a 403), and a
scripted browser session wedged on the same host. The PDFs already in this
directory came from a mirror for that reason.

Downloading them by hand in a normal browser takes a couple of minutes and is
more reliable than anything scripted, so that is the route.

## How to do it

Open the page, click the PDF link, and drop the file into `pdf/`. **Either variant
works** — the fillable `-fill-` PDFs extract identically to the flat ones
(measured on Schedule 1: the same 117 lines), so whichever the page offers first
is fine.

Form pages follow one pattern:

```
https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch<N>.html
```

Then, from `tools/`:

```bash
python extract-lines.py
python generate-captions.py
python check-quality.py
```

---

## Everything on this list has arrived

27 forms in `pdf/`, covering the T2 jacket and every schedule the engine
computes. Nine arrived as newer revisions than previously held, which is how the
Schedule 31 shape change was caught.

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

## Not wanted

The rest of the federal long tail is inapplicable by sector — financial
institutions, insurers, credit unions, film and video production, journalism,
resource, the clean-economy investment credits themselves — or is an information
return rather than a calculation.

Alberta needs nothing: TRA publishes a specification rather than fillable forms,
and every AT1 schedule that applies has been captured from the live certified
product and recorded in `research/field-maps/`.
