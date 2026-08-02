COMMIT 28 – EFFEKTIMPORT UND NOTIZFELDER

Änderungen:

1. Effektimport deduplizieren
- IDs werden unabhängig davon verglichen, ob sie als Zahl oder Text gespeichert sind.
- Zusätzlich wird eine Signatur aus Name, Kategorie, Quelle und Bonusinhalt verwendet.
- Doppelte Effekte innerhalb derselben Importdatei werden ebenfalls zusammengeführt.
- Nach dem Import wird die gespeicherte Benutzereffektliste erneut bereinigt.
- Favoritenzuordnungen werden auf die beibehaltene Effekt-ID umgestellt.

2. Freitextfelder
- Unter Rüstungsklasse, KMB und KMV gibt es jeweils ein mehrzeiliges Freitextfeld.
- Die Inhalte werden je Charakter gespeichert.
- Import und Export übernehmen die Felder automatisch als Bestandteil der Charakterdaten.
- Das Dashboard bleibt unverändert.

Installation:
1. index.html ersetzen.
2. js/commit22.js ersetzen.
3. js/commit26.js ersetzen.
4. css/commit28.css neu anlegen.

Commit-Nachricht:
Commit 28: Effektimport deduplizieren und Notizfelder für RK, KMB und KMV ergänzen
