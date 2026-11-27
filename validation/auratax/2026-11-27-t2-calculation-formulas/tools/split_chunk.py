r"""Split a webpack chunk into one file per original source module, for reading.

AuraTax's bundles keep each module's source path in a banner comment:
    /***/ 6153:
    /*!***...***!*\
      !*** ./src/app/modules/t2/calculators/001.ts ***!
      \***...***/
Each module body is written to out/<path>.js. Webpack's import prefixes are
shortened so the code reads like the original ("dirtify(...)" instead of
"(0,_aurasoft_t2_base__WEBPACK_IMPORTED_MODULE_2__.dirtify)(...)").

LOCAL READING AID ONLY. AuraTax's code: never commit it to any repo.
Usage: python -I split_chunk.py <chunk.js> <out_dir> [path-prefix-filter]
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
chunk, out = Path(sys.argv[1]), Path(sys.argv[2])
only = sys.argv[3] if len(sys.argv) > 3 else ""
text = chunk.read_text(encoding="utf-8")

starts = [m for m in re.finditer(r"^/\*\*\*/ (\d+):\n", text, re.M)]
BANNER = re.compile(r"\A/\*!\*+!\*\\\r?\n\s*!\*\*\* (\S+) \*\*\*!\r?\n\s*\\\*+/\r?\n")
T2BASE = re.compile(r"\(0,_aurasoft_t2_base__WEBPACK_IMPORTED_MODULE_\d+__\.(\w+)\)|_aurasoft_t2_base__WEBPACK_IMPORTED_MODULE_\d+__\.(\w+)")
OTHER = re.compile(r"\(0,_?(\w+?)__WEBPACK_IMPORTED_MODULE_\d+__\.(\w+)\)|_?(\w+?)__WEBPACK_IMPORTED_MODULE_\d+__\.(\w+)")

written = 0
for i, m in enumerate(starts):
    end = starts[i + 1].start() if i + 1 < len(starts) else len(text)
    body = text[m.end():end]
    b = BANNER.match(body)
    if not b:
        continue
    path = b.group(1)
    if only and not path.startswith(only):
        continue
    code = body[b.end():]
    code = T2BASE.sub(lambda x: x.group(1) or x.group(2), code)
    code = OTHER.sub(lambda x: f"{x.group(1) or x.group(3)}.{x.group(2) or x.group(4)}", code)
    rel = path.lstrip("./").replace("src/app/modules/", "").replace("node_modules/", "node_modules__/")
    dest = out / (re.sub(r"\.(ts|mjs|js)$", "", rel) + ".js")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(f"// AuraTax module {m.group(1)}: {path}  (from {chunk.name}; reading aid, not for any repo)\n" + code, encoding="utf-8")
    written += 1
print(f"{chunk.name}: {len(starts)} modules, {written} written -> {out}")
