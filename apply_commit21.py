from pathlib import Path
import shutil

repo = Path(__file__).resolve().parent
index = repo / "index.html"

if not index.exists():
    raise SystemExit("Bitte dieses Skript im Stammordner des Repositories ausführen.")

# Dateien liegen nach dem Entpacken bereits an der richtigen Stelle.
# index.html um die Commit-21-Dateien ergänzen.
text = index.read_text(encoding="utf-8")

css_line = '    <link rel="stylesheet" href="css/commit21.css?v=21">'
if css_line not in text:
    marker = '    <link rel="stylesheet" href="css/charakterwerte.css?v=20.2">'
    text = text.replace(marker, marker + "\n" + css_line)

js_line = '<script src="js/commit21.js?v=21"></script>'
if js_line not in text:
    marker = '<script src="js/speicher.js"></script>'
    text = text.replace(marker, marker + "\n" + js_line)

index.write_text(text, encoding="utf-8")
print("Commit 21 wurde in index.html eingebunden.")
print("Danach ausführen:")
print('  git add index.html css/commit21.css js/commit21.js js/berechnung.js')
print('  git commit -m "Commit 21: Navigation und Effektdetails erweitern"')
print("  git push")
