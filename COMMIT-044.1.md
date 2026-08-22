# Commit 44.1 – Attribute aktualisieren ohne Zuklappen

## Attributboni
Die Attributanzeige wird jetzt nach jeder normalen Effekt-Neuberechnung aktualisiert.
Ein aktiver Effekt mit z. B. `Attribut ST +2` wird dadurch sofort im
„Aktuellen Wert“ von Stärke berücksichtigt.

Beispiel:
- ST Grundwert 16
- aktiver Effekt Attribut ST +2
- Aktueller Wert 18
- Modifikator +4

## Aufklappzustand
Die Eingabe eines neuen Grundwertes baut den Charakter-/Kampagnenbaum nicht mehr
komplett neu auf. Dadurch bleibt der Bereich „Attribute“ geöffnet.

Der Bereich klappt nur noch zu, wenn der Nutzer ihn selbst über die Überschrift
„Attribute“ schließt oder wenn die gesamte Charakteransicht aus einem anderen
Grund tatsächlich neu aufgebaut wird.

## Technisch
- Neue In-Place-Funktion `aktualisiereAttributeAnsicht44`.
- Attributzeilen besitzen stabile Charakter- und Attribut-Datenkennungen.
- `berechneWerte()` aktualisiert anschließend auch die sichtbaren Attribute.
- Version v0.44.1.
