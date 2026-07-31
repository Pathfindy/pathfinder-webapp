from pathlib import Path

index = Path("index.html")
text = index.read_text(encoding="utf-8")

css_line = '    <link rel="stylesheet" href="css/commit22.css?v=22">\n'
if "css/commit22.css" not in text:
    marker = '    <link rel="stylesheet" href="css/commit21.css?v=21">\n'
    if marker not in text:
        marker = '    <link rel="stylesheet" href="css/commit21.css?v=21.1">\n'
    if marker not in text:
        raise SystemExit("CSS-Einfügestelle für commit21.css nicht gefunden.")
    text = text.replace(marker, marker + css_line, 1)

script_line = '<script src="js/commit22.js?v=22"></script>\n'
if "js/commit22.js" not in text:
    marker = '<script src="js/commit21.js?v=21.1"></script>'
    if marker not in text:
        marker = '<script src="js/commit21.js?v=21"></script>'
    if marker not in text:
        raise SystemExit("Script-Einfügestelle für commit21.js nicht gefunden.")
    text = text.replace(marker, marker + "\n" + script_line.rstrip(), 1)

index.write_text(text, encoding="utf-8")
print("index.html wurde für Commit 22 angepasst.")
