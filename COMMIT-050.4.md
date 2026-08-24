# Commit 50.4 – Kopfzeile und Effektfilter korrigiert

## Effektseite
- Commit 25 zieht Suchfeld, Filter und Ergebnis nicht mehr aus dem neuen
  aufklappbaren Such-/Filterblock heraus.
- Der komplette Bereich „Suche & Filter“ klappt gemeinsam auf und zu.
- Suchfeld und blauer ×-Button stehen in derselben Zeile unmittelbar nebeneinander.
- Der ×-Button leert nur das Suchfeld; er ist selbst kein aufklappbarer Bereich.

## Einheitliche Kopfzeile
Auf allen Seiten:
1. App-Titel scrollt nach oben aus dem Bild.
2. Menüzeile bleibt oben fixiert.
3. „Aktiv: Charakter“ bleibt direkt darunter fixiert.

Zusätzlich:
- Kampf/Werte: Schnellleiste sitzt als dritte fixierte Zeile direkt darunter.
- Effekte: „Suche & Filter“ sitzt als dritte fixierte Zeile direkt darunter.

Die tatsächlichen Höhen von Menü und Charakterzeile werden per JavaScript gemessen,
damit keine Überlappungen oder Lücken durch feste Schätzwerte entstehen.

Version v0.50.4.
