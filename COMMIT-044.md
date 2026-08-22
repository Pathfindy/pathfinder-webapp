# Commit 44 – Attribute als Charakter-Stammdaten

## Charakterseite
Neuer aufklappbarer Bereich „Attribute“:
- ST, GE, KO, IN, WE, CH
- Grundwert: Auswahl 1–40
- Aktueller Wert: Grundwert + aktive Boni auf das jeweilige Attribut
- Modifikator: floor((Aktueller Wert - 10) / 2)

Bestehende und neue Charaktere starten bei fehlenden Attributdaten mit 10.

## Effekte
Die bisherigen sechs Hilfseffekte ST/GE/KO/IN/WE/CH „(Attribut)“ entfallen.
Alte lokale Kopien bzw. Admin-Overrides dieser Hilfseffekte werden beim Laden bereinigt.

Neue Bonusziele im Effekteditor:
- Attribut ST
- Attribut GE
- Attribut KO
- Attribut IN
- Attribut WE
- Attribut CH

GAB (Dynamik) bleibt erhalten.

## Filter
„Charakterwerte“ entfällt aus dem sichtbaren Kategorienfilter.
GAB (Dynamik) bleibt intern in dieser Kategorie und wird nur angezeigt, wenn alle sichtbaren Kategorien aktiv sind. Als Admin bleibt der Effekt bearbeitbar.

## Noch nicht in Commit 44
Die Attributsmodifikatoren werden noch nicht automatisch mit Angriff, Schaden, KMB/KMV, RK oder Rettungswürfen verknüpft. Diese Verknüpfungen folgen im nächsten Schritt.

Version v0.44.0.
