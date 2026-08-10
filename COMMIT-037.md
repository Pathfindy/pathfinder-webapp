# Commit 37 – Leben: zentrale Schadensverarbeitung

## Trefferpunkte
- Normale Schadenseingabe bleibt im Trefferpunkte-Bereich.
- Ist Steinhaut aktiv, reduziert sie normalen Schaden automatisch um maximal 10 Punkte je Treffer.
- Der Steinhaut-Restpool wird entsprechend reduziert.
- Restschaden geht zuerst auf Temp-TP und danach auf aktuelle TP.

## Energieschaden
- Neue Eingaben direkt unter der normalen Schadenseingabe für:
  Elektro, Feuer, Kälte, Säure, Schall.
- Steinhaut wird bei Energieschaden ausdrücklich nicht berücksichtigt.
- Reihenfolge:
  1. Energien widerstehen desselben Typs, falls aktiviert.
  2. Schutz vor Energien desselben Typs, falls aktiviert.
  3. Überschuss auf Temp-TP.
  4. Danach aktuelle TP.

## Tabellen
- Steinhaut: eigene Schadenseingabe entfernt.
- Energien widerstehen: eigene Schadenseingabe entfernt.
- Schutz vor Energien: eigene Schadenseingabe entfernt.
- Tabellen und Abstände für kleine Handybildschirme kompakter gestaltet.
