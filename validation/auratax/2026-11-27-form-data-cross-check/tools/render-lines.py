"""Render a clip of a PDF page around each occurrence of given line numbers. Usage: render_lines.py out_dir pdf line [line...]"""
import sys
import pymupdf as fitz
out, pdf, lines = sys.argv[1], sys.argv[2], sys.argv[3:]
doc = fitz.open(pdf)
stem = pdf.replace("\\", "/").split("/")[-1].split("-")[0]
for line in lines:
    hits = 0
    for pno, page in enumerate(doc):
        for w in page.get_text("words"):
            if w[4] == line and hits < 2:
                y0 = max(0, w[1] - 70); y1 = min(page.rect.height, w[3] + 45)
                clip = fitz.Rect(0, y0, page.rect.width, y1)
                pix = page.get_pixmap(dpi=110, clip=clip)
                path = f"{out}/{stem}-{line}-p{pno+1}-{hits}.png"
                pix.save(path); hits += 1
                print(path)
    if not hits:
        print(f"{line}: not found as a word")
