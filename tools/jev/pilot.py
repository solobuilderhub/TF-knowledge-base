#!/usr/bin/env python3
"""
Pilot: can Jev (TypeSafe System One) check our AT1 form definitions against the
extracted rule book?

For every line both sides have, one request asks Jev typed questions about a
(specification row, our field) pair:

  same     Noul    our caption names the same line item as the spec name
  note     Noul    our note does not contradict the spec rule (when a note exists)
  kind     Choice  classify the spec rule (compared with the extractor's `kinds`)

Each is run twice: on the TRUE pair, and on a NEGATIVE CONTROL where our side is
another line's caption/note from the same form. A checker that cannot tell those
apart is not a checker, so the headline number is the separation (AUC) between
true and control, not agreement on the true pairs.

Inputs
  --forms   JSON dump of our form definitions: {form: [{line, caption, note, ...}]}
            (written by a tsx script from packages/ca-tax/src/t2/at1/forms/*)
  spec      packages/ca-tax/spec/at1/forms/*.json (private)
Key: TYPESAFE_API_KEY in research/.env (gitignored) or the environment.
Spec text is sent to TypeSafe (their terms: no training on inputs, no
disclosure beyond service providers).
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import os
import random
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parents[1]
SPEC = RESEARCH.parent / "packages" / "ca-tax" / "spec" / "at1" / "forms"
URL = "https://api.typesafe.ai/v1/systemone"
KINDS = {
    "formula": "The rule computes the value from other lines or fields.",
    "default-to-federal": "The rule defaults the value to a federal (T2) field.",
    "constraint": "The rule limits what values are allowed (max, min, cannot exceed, must equal).",
    "existence": "The rule says when the field or form must or must not be present.",
    "text": "The rule is descriptive text or an instruction and fits none of the others.",
}
KEY = ""


def load_key() -> str:
    if os.environ.get("TYPESAFE_API_KEY"):
        return os.environ["TYPESAFE_API_KEY"]
    env = RESEARCH / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf8").splitlines():
            if line.startswith("TYPESAFE_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("TYPESAFE_API_KEY not set (research/.env)")


def call(state: dict, questions: dict, model: str) -> dict:
    body = json.dumps({"model": model, "state": state, "questions": questions}).encode()
    for attempt in range(5):
        req = urllib.request.Request(
            URL,
            data=body,
            headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 4:
                time.sleep(2**attempt)
                continue
            raise RuntimeError(f"{e.code}: {e.read().decode()[:300]}")
    raise RuntimeError("retries exhausted")


def spec_side(r: dict) -> dict:
    return {"line_name": r["name"], "business_rule": r["rule"][:1500]}


Q_SAME = {
    "type": "noul",
    "instructions": "The implementation's caption names the same line item as the specification's line_name (wording may differ slightly, but it must be the same item, not a neighbouring one).",
}
Q_NOTE = {
    "type": "noul",
    "instructions": "The implementation's note is consistent with the specification's business_rule: it does not state a condition, source, limit or formula that the rule contradicts.",
}
Q_KIND = {
    "type": "choice",
    "instructions": "What kind of rule is the specification's business_rule? Pick the dominant one.",
    "criteria": KINDS,
}


def auc(pos: list[float], neg: list[float]) -> float:
    if not pos or not neg:
        return float("nan")
    wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
    return wins / (len(pos) * len(neg))


def main() -> None:
    global KEY
    ap = argparse.ArgumentParser()
    ap.add_argument("--forms", required=True)
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--spec-dir", help="rule-book forms dir (default: AT1)")
    ap.add_argument("--line-slice", default="3:6", help="slice of OUR line id that is the rule-book line (AT1 FFFLLLNNN: 3:6)")
    ap.add_argument("--model", default="jev-latest")
    ap.add_argument("--out", default=str(HERE / "pilot-result.json"))
    a = ap.parse_args()
    KEY = load_key()
    global SPEC
    if a.spec_dir:
        SPEC = Path(a.spec_dir)
    ours = json.loads(Path(a.forms).read_text(encoding="utf8"))
    rng = random.Random(7)
    jobs = []
    for form, fields in ours.items():
        if a.only and form not in a.only:
            continue
        spec = json.loads((SPEC / f"{form}.json").read_text(encoding="utf8"))["rows"]
        by_line = {r["line"]: r for r in spec}
        lo, hi = (int(x) for x in a.line_slice.split(":"))
        mine: dict[str, dict] = {}
        for f in fields:
            mine.setdefault(f["line"][lo:hi], f)  # AT1 FFFLLLNNN -> LLL (first occurrence)
        pairs = [(ln, by_line[ln], mine[ln]) for ln in by_line if ln in mine]
        pool = [m for _, _, m in pairs]
        for ln, r, m in pairs:
            other = rng.choice([x for x in pool if x["caption"] != m["caption"]] or pool)
            jobs.append({"form": form, "line": ln, "row": r, "mine": m, "control": other})

    def run(j: dict) -> dict:
        r, m, c = j["row"], j["mine"], j["control"]
        out: dict = {"form": j["form"], "line": j["line"], "kinds": r.get("kinds", []), "tokens": 0}
        for tag, side in (("true", m), ("ctrl", c)):
            qs = {"same": Q_SAME}
            impl = {"caption": side["caption"]}
            if side.get("note"):
                impl["note"] = side["note"][:1200]
                qs["note"] = Q_NOTE
            if tag == "true":
                qs["kind"] = Q_KIND
            res = call({"specification": spec_side(r), "implementation": impl}, qs, a.model)
            ans = res["answers"]
            out[tag] = {
                "same": ans["same"]["noul"],
                "note": ans["note"]["noul"] if "note" in ans else None,
                "kind": [ans["kind"]["choice"], ans["kind"]["confidence"]] if "kind" in ans else None,
                "caption": side["caption"],
            }
            out["tokens"] += res["usage"]["input_tokens"]
        return out

    results = []
    with cf.ThreadPoolExecutor(8) as ex:
        for i, res in enumerate(ex.map(run, jobs)):
            results.append(res)
            if i % 50 == 0:
                print(f"  {i}/{len(jobs)}", file=sys.stderr)
    Path(a.out).write_text(json.dumps(results, indent=1), encoding="utf8")
    summarise(results)


def summarise(results: list[dict]) -> None:
    pos = [r["true"]["same"] for r in results]
    neg = [r["ctrl"]["same"] for r in results]
    print(f"\nlines checked: {len(results)}   input tokens: {sum(r['tokens'] for r in results)}")
    print(
        f"same   AUC true-vs-control: {auc(pos, neg):.3f}   mean true {sum(pos)/len(pos):.2f}  mean ctrl {sum(neg)/len(neg):.2f}"
    )
    print(
        f"       true pairs scored < 0.5: {sum(p < 0.5 for p in pos)}   control pairs scored >= 0.5: {sum(n >= 0.5 for n in neg)}"
    )
    np_ = [r["true"]["note"] for r in results if r["true"]["note"] is not None]
    nn = [r["ctrl"]["note"] for r in results if r["ctrl"]["note"] is not None]
    if np_ and nn:
        print(
            f"note   n={len(np_)}   AUC true-vs-control: {auc(np_, nn):.3f}   mean true {sum(np_)/len(np_):.2f}  mean ctrl {sum(nn)/len(nn):.2f}"
        )
    k = [r for r in results if r["true"]["kind"] and r["kinds"]]
    if k:
        first = sum(r["true"]["kind"][0] == r["kinds"][0] for r in k)
        anyk = sum(r["true"]["kind"][0] in r["kinds"] for r in k)
        print(f"kind   agrees with extractor primary kind {first}/{len(k)}, any kind {anyk}/{len(k)}")


if __name__ == "__main__":
    main()
