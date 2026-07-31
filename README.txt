COMMIT 22 – CHARAKTER-IMPORT/EXPORT

Enthalten:
- js/commit22.js
- css/commit22.css
- apply_commit22.py

Funktionen:
- Aktiven Charakter als JSON exportieren
- Charakter aus JSON importieren
- Import als neuer Charakter oder Überschreiben des aktiven Charakters
- Enthält Charakterdaten, TP, Angriffe, Effektaktivierungen und benötigte aktive Benutzereffekte
- Validierung von Format und Exportversion

INSTALLATION ÜBER GITHUB:
1. js/commit22.js in den Ordner js hochladen.
2. css/commit22.css in den Ordner css hochladen.
3. index.html bearbeiten und ergänzen:

Im <head>, nach commit21.css:
<link rel="stylesheet" href="css/commit22.css?v=22">

Nach commit21.js:
<script src="js/commit22.js?v=22"></script>

4. Commit-Nachricht:
Commit 22: Charakter Import und Export hinzufügen

5. Nach dem Deployment die Seite mit Strg+F5 neu laden.

ALTERNATIV LOKAL:
python apply_commit22.py
