from pathlib import Path
import sys

projekt = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
index = projekt / "index.html"
quelle = Path(__file__).resolve().parent / "js" / "commit23.js"
ziel = projekt / "js" / "commit23.js"

if not index.exists():
    raise SystemExit(f"index.html nicht gefunden: {index}")

ziel.parent.mkdir(parents=True, exist_ok=True)
ziel.write_text(quelle.read_text(encoding="utf-8"), encoding="utf-8")

html = index.read_text(encoding="utf-8")
script = '<script src="js/commit23.js?v=23"></script>'

if script not in html:
    marker = '<script src="js/commit22.js?v=22"></script>'
    if marker not in html:
        raise SystemExit("Commit-22-Scriptzeile wurde in index.html nicht gefunden.")
    html = html.replace(marker, marker + "\n" + script, 1)
    index.write_text(html, encoding="utf-8")

print("Commit 23 wurde angewendet.")
print("Geändert:")
print("- js/commit23.js")
print("- index.html")
