# Commit 52.1 – Wertquelle Klassenstufe

## Entfernt
Die in Commit 52 neu eingeführte Bonusart „Attributs Modifikator“ wurde wieder
aus der Bonusarten-Auswahl entfernt. Bereits testweise damit gespeicherte
Bonuszeilen werden als „Namenlos“ normalisiert.

## Wertequellen
Die dynamischen Wertequellen bleiben erhalten und wurden erweitert:

- Attribut-Mod.
  - ST, GE, KO, IN, WE oder CH
  - verwendet den aktuellen Attributsmodifikator

- Klassenstufe
  - Auswahl einer Klasse
  - verwendet die aktuelle Stufe dieser Klasse beim aktiven Charakter

Beispiel „Böses niederstrecken“:
- Angriff: Wertquelle Attribut-Mod. → CH
- Rüstungsklasse: Wertquelle Attribut-Mod. → CH
- Schaden: Wertquelle Klassenstufe → Paladin

Damit ist keine spezielle Bonusart für diese dynamischen Werte nötig;
die normale Bonusart des jeweiligen Effekts kann unabhängig gewählt werden.

Version v0.52.1.
