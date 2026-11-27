"""File each CRA form's PDF and extracted files into its category folder.

    python forms/file-by-category.py             # move what is out of place
    python forms/file-by-category.py --dry-run   # only say what would move

The bucket comes from registry.tsv, and the folder for each bucket from
`CATEGORY_DIRS` in sources/cra-forms/tools/formlib.py. A bucket with no folder
there sits at the top of pdf/ and extracted/. A form's PDF and its extracted
files (.lines.tsv, .fields.tsv, .layout.txt) always end up in the same folder,
moved with `git mv` when git tracks them so their history follows.

Re-run after changing a row's bucket, or after giving another bucket a folder.
Then `python build-status.py --check`, which reports anything still out of place.

Moving a PDF changes the path ca-tax's generated captions cite as their
Source: regenerate the captions (python forms/run.py <FORM>) for the forms that
moved, in the same change as the ca-tax commit.

Standard library only.
"""

from __future__ import annotations

import csv
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RESEARCH = HERE.parent
CRA = RESEARCH / "sources" / "cra-forms"
sys.path.insert(0, str(CRA / "tools"))
from formlib import CATEGORY_DIRS, EXTRACT_DIR, PDF_DIR, pdf_files  # noqa: E402

SUFFIXES = (".lines.tsv", ".fields.tsv", ".layout.txt")


def pdf_patterns(form: str) -> list[str]:
    """File-name patterns for a registry form id, as build-status.py matches them."""
    if form == "T2":
        return ["T2-jacket.pdf"]
    m = re.fullmatch(r"T2SCH(\d+)", form)
    if m:
        return [f"T2SCH{m.group(1)}-*.pdf", f"T2SCH{int(m.group(1)):02d}-*.pdf"]
    return [f"{form}*.pdf"]


def tracked(path: Path) -> bool:
    return subprocess.run(
        ["git", "ls-files", "--error-unmatch", str(path)], cwd=RESEARCH, capture_output=True
    ).returncode == 0


def move(src: Path, dest: Path, dry: bool) -> None:
    print(f"  {src.relative_to(CRA).as_posix()}  ->  {dest.relative_to(CRA).as_posix()}")
    if dry:
        return
    if dest.exists():
        sys.exit(f"exists, not overwritten: {dest}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    if tracked(src):
        subprocess.run(["git", "mv", str(src), str(dest)], cwd=RESEARCH, check=True)
    else:
        src.rename(dest)


def main() -> int:
    dry = "--dry-run" in sys.argv
    with (HERE / "registry.tsv").open(encoding="utf-8", newline="") as f:
        rows = [r for r in csv.DictReader(f, delimiter="\t") if r["authority"] == "CRA"]

    moves = 0
    for r in rows:
        pdf = next((hits[0] for pat in pdf_patterns(r["form"]) if (hits := pdf_files(pat))), None)
        if pdf is None:
            continue
        folder = CATEGORY_DIRS.get(r["category"], "")
        pending = []
        if pdf.parent != PDF_DIR / folder:
            pending.append((pdf, PDF_DIR / folder / pdf.name))
        for suffix in SUFFIXES:
            for src in EXTRACT_DIR.rglob(f"{pdf.stem}{suffix}"):
                if src.parent != EXTRACT_DIR / folder:
                    pending.append((src, EXTRACT_DIR / folder / src.name))
        if not pending:
            continue
        print(f"{r['form']} ({r['category']})")
        for src, dest in pending:
            move(src, dest, dry)
        moves += len(pending)

    print(f"\n{moves} file(s) {'would move' if dry else 'moved'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
