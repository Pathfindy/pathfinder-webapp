# Commit 12 – Navigation reparieren

Commit-Message:
`fix(navigation): remove stray closing brace`

Ursache:
- In `js/app.js` befand sich nach `baueEffektliste()` eine überzählige schließende Klammer.
- Dadurch hatte die gesamte JavaScript-Datei einen Syntaxfehler.
- Deshalb wurden die Klick-Handler für Dashboard, Effekte und Charaktere nicht ausgeführt.

Änderung:
- Überzählige Klammer entfernt.
- JavaScript-Syntax mit `node --check` geprüft.
