from pathlib import Path
import shutil, sys

quelle = Path(__file__).resolve().parent
ziel = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

for rel in [
    "index.html",
    "js/charakterwerte.js",
    "js/berechnung.js",
    "js/commit24.js",
    "css/charakterwerte.css",
    "css/commit24.css"
]:
    src = quelle / rel
    dst = ziel / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

print("Commit 24 wurde installiert.")
