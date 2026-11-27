# research/validation — external validation of engine behaviour

Evidence that a computation matches something outside our own reading of the law:
a certified competitor's output, a CRA/TRA worked example, a certification test
case. Kept separate from `research/spec` (what the specification says) and
`research/cra-schedules` (what the legislation says), because the question is
different — not "what is the rule" but "does anyone else agree with us".

## Layout

```
validation/
  auratax/
    <YYYY-MM-DD>-<topic>/
      README.md          what was checked, what was found, what it changed
      screenshots/       numbered, one screen per file
      *.txt              raw page dumps where useful
  <other-source>/...
```

One directory per validation session. The date is when the evidence was captured,
because a live product changes and a screenshot is only true as of its date.

## Naming screenshots

`NN-short-slug.png`, numbered in the order they were taken so the sequence is
readable without opening them. Reference them from the session README with what
each one proves — an unexplained screenshot is not evidence.

## AuraTax

**auratax.ca / app.auratax.ca**, vendor AuraSoft Inc. A TRA-certified AT1 Net File
and CRA-certified T2 preparer. Used here as an **oracle**: where our engine and a
certified product disagree on a number, one of us is wrong and it is worth knowing
which before a return is filed.

Full-prep is free and only transmission is paid, so a return can be prepared and
inspected without filing anything.

The desktop app also ships its form data as plain JSON: every schedule's lines,
validation rules and cross-schedule flows, for T2, AT1 and CO-17.
`auratax/2026-11-27-form-data-cross-check/` extracts that data into a readable
register, compares it with ca-tax, and holds the scripts to redo both after an
AuraTax update. `auratax/2026-11-27-t2-calculation-formulas/` documents every T2
line its calculator code computes: the formula, the conditions, and the exact
source. Like everything here, both are pointers to the CRA/TRA document, never a
source of line numbers or rules.

The competitive teardown — product surface, pricing, workflow, where they are
beatable — lives in `internal/competitive/auratax/` and is deliberately NOT here.
This directory holds only calculation evidence.

## Driving the browser

`agent-browser` (https://github.com/vercel-labs/agent-browser). Session driver in
each session directory as `ab.sh`.

Four things that cost time on this machine, recorded so they do not cost it twice:

- **A cold launch takes 2-4 minutes.** Do not wrap the first `open` in a short
  `timeout` — killing the CLI does not stop the daemon, so the browser comes up
  anyway and the next command against that session is instant. A `timeout` shorter
  than the launch looks exactly like a hang and is the single easiest way to
  misdiagnose this. Launch once, let it return, then work against the live session.
- **Do not retry in parallel.** Each concurrent attempt leaves an orphaned Chrome
  and daemon behind; a handful of them saturates the machine and makes every
  attempt genuinely slower. If sessions wedge, kill the agent-browser Chrome and
  node processes and delete the stale
  `~/.agent-browser/*.{pid,port,stream,version,config,engine}` files.
- **The daemon's working directory is not the shell's.** `screenshot foo.png`
  writes relative to wherever the daemon started, not where the command was run.
  Always pass an absolute path.
- **`fill` appends rather than replaces on Angular Material inputs**, and
  `Control+a` does not select inside them. To change or clear a value, set it via
  the native `value` setter and dispatch `input` + `change` + `blur` — that path
  also persists to the server, which `fill` sometimes did not.
