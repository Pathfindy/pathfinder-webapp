# Hotfix für Commit 15

Commit-Message:

`fix(admin): initialize PIN-protected admin mode`

## Fehlerursache

Die Admin-Oberfläche war vorhanden, aber `initialisiereAdminModus()` wurde beim Start der App nicht aufgerufen. Dadurch wurden keine Ereignisse für Entsperren, Sperren oder PIN-Bestätigung registriert.

## Änderung

- Admin-Modus wird in `initialisiereApp()` initialisiert.
- PIN-Dialog und Schaltflächen reagieren wieder.
