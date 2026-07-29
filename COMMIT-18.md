# Commit 18

Commit-Message:

`feat(admin): export merged effect database`

Version: 0.18.0

## Neu

- Admin-Schaltfläche „⬇️ effekte.json exportieren“
- Exportiert ausschließlich Standardeffekte
- Führt originale Effekte, lokale Änderungen und neu angelegte Standardeffekte zusammen
- Setzt `aktiv` im Export immer auf `false`
- Sortiert die exportierte Datenbank alphabetisch
- Benutzerdefinierte Effekte werden nicht exportiert

## Installation

1. ZIP entpacken.
2. `app.js` im Repository unter `js/app.js` ersetzen.
3. Commit erstellen.

## Verwendung

1. Admin-Modus entsperren.
2. „⬇️ effekte.json exportieren“ auswählen.
3. Die heruntergeladene Datei bei Bedarf unter `data/effekte.json` ins Repository übernehmen.

Hinweis: Lokale Änderungen und neue Standardeffekte bleiben nach dem Export im Browser gespeichert.
