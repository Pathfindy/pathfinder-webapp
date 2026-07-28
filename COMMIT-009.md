# Commit 9 – Effektaktivierungen kopieren

Commit-Message:

`feat(characters): copy effect activations between characters`

Geänderte Dateien:
- `js/app.js`
- `css/style.css`

Funktion:
1. Zielcharakter aktiv auswählen.
2. Beim Quellcharakter auf 📋 tippen.
3. Kopieren bestätigen.
4. Die Effektaktivierungen des Zielcharakters werden ersetzt.

Hinweise:
- Kopiert werden die aktiven/inaktiven Zustände der Effektliste.
- Selbst angelegte Effektdefinitionen bleiben weiterhin im gemeinsamen Effektarchiv verfügbar.
- Der bisherige globale Effektstatus wird beim ersten Start automatisch auf den aktiven Charakter migriert.
