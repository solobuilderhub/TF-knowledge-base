"""The whole forms pipeline, in order, with one command.

    python forms/run.py              # every form
    python forms/run.py T2SCH03      # forms whose file name starts with this

  1. extract-lines.py     pdf/ -> extracted/<form>.lines.tsv    (the page as text)
  2. extract-jacket.py    the T2 jacket, which needs its own reader
  3. extract-xfa.py       pdf/ -> extracted/<form>.fields.tsv   (the form's own fields)
  4. generate-captions.py extracted/ -> ca-tax src/t2/forms/generated/
  5. build-status.py      registry + disk -> forms/STATUS.md

Then, in ca-tax: `npm run typecheck && npm test`. A line nobody has classified
makes the form definition throw, naming the line: that is the work list.

Needs `pdftotext` on PATH and `pip install -r forms/requirements.txt`.
To bring in a new or reprinted PDF first: sources/cra-forms/tools/fetch-form.sh.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOOLS = HERE.parent / "sources" / "cra-forms" / "tools"


def step(script: Path, *args: str) -> None:
    print(f"\n== {script.name} {' '.join(args)}", flush=True)
    done = subprocess.run([sys.executable, str(script), *args], cwd=script.parent)
    if done.returncode != 0:
        sys.exit(f"{script.name} failed ({done.returncode}); nothing after it was run.")


def main() -> None:
    wanted = sys.argv[1:]
    schedules = [w for w in wanted if w.upper().startswith("T2SCH")]
    if not wanted:
        step(TOOLS / "extract-lines.py")
    elif schedules:
        step(TOOLS / "extract-lines.py", *[f"{w}*.pdf" for w in schedules])
    if not wanted or any(w.upper().startswith("T2-") for w in wanted):
        step(TOOLS / "extract-jacket.py")
    step(TOOLS / "extract-xfa.py", *wanted)
    step(TOOLS / "generate-captions.py", *wanted)
    step(HERE / "build-status.py")


if __name__ == "__main__":
    main()
