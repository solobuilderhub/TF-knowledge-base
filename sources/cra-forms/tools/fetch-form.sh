#!/usr/bin/env bash
# Download one CRA form PDF through a real browser session: canada.ca does not
# answer curl from this machine, and does answer a browser.
#
#   ./fetch-form.sh t2sch9 ../pdf/2-basic-ccpc/T2SCH09-related-associated.pdf
#
# Takes the form's page id (as in .../forms/<id>.html) and the destination,
# which is the category folder of the form's bucket (forms/README.md).
# Prefers the fillable PDF: its form fields are what extract-xfa.py reads.
# Needs agent-browser on PATH. Never overwrites: move the old copy away first.
set -euo pipefail
id="$1"; dest="$2"
[ -e "$dest" ] && { echo "exists, not overwritten: $dest" >&2; exit 2; }
export AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION:-cra-forms}"
agent-browser navigate "https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/${id}.html" >/dev/null
agent-browser eval '(async () => {
  const links = [...document.querySelectorAll("main a")].map(a => a.href).filter(h => /\.pdf$/i.test(h));
  const url = links.find(h => /-fill-/.test(h)) ?? links[0];
  if (!url) return JSON.stringify({ error: "no PDF link on " + location.href });
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return JSON.stringify({ url, b64: btoa(s) });
})()' | python -I -c '
import sys, json, base64
d = json.loads(sys.stdin.read())
if isinstance(d, str): d = json.loads(d)
if "error" in d: sys.exit(d["error"])
raw = base64.b64decode(d["b64"])
if raw[:4] != b"%PDF": sys.exit("not a PDF: " + d["url"])
open(sys.argv[1], "wb").write(raw)
print(len(raw), d["url"])
' "$dest"
