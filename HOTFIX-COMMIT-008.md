# Hotfix zu Commit 8

Commit-Message:

`fix(characters): initialize character controls`

Fehlerursache:
Die Charakterfunktionen waren vorhanden, aber der Button wurde in der veröffentlichten
`app.js` nicht mit dem Klick-Handler verbunden und `ladeCharaktere()` wurde nicht gestartet.

Geändert:
- robuste App-Initialisierung über `initialisiereApp()`
- Klick-Handler für `#btnNeuerCharakter`
- Aufruf von `ladeCharaktere()`
- Schutz vor mehrfacher Event-Bindung
