# Commit 29 – Charakterporträts, Charakternotizen und vollständiger Effektexport

## Änderungen

- Jeder Charakter kann ein eigenes Porträt erhalten.
- Das Bild wird beim Einfügen mittig quadratisch zugeschnitten, auf 320 × 320 Pixel verkleinert und als komprimiertes JPEG gespeichert.
- Das Charakterbanner wird nur höher, wenn tatsächlich ein Porträt vorhanden ist.
- Porträts können ersetzt oder entfernt werden.
- Die Funktion gilt auch für bereits vorhandene Charaktere.
- Jeder Charakter erhält ein frei ausfüllbares, mehrzeiliges Notizfeld.
- Porträt und Notiz werden im Charakterobjekt gespeichert und dadurch mit exportiert und importiert.
- Beim Charakterexport werden jetzt alle selbst angelegten Effekte exportiert, nicht nur die aktuell aktiven.
- Der Aktivstatus der Effekte bleibt separat in `effektStatus` erhalten.

## Dateien

- `index.html`
- `js/commit22.js`
- `js/commit29.js`
- `css/commit29.css`

## Commit-Nachricht

`Commit 29: Charakterporträts, Charakternotizen und vollständiger Effektexport`
