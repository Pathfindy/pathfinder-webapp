# Commit 41.1 – Überarbeitung

- Angriffsmodus „Iterativ nach GAB“ umbenannt in „Einzel- + Zusatzangriffe“.
- Natürliche Angriffe sind wieder normale einzelne Angriffskarten.
  Sie werden nicht mehr als eigener Angriffsmodus angeboten.
- Bereits in 41.0 gespeicherte natürliche Angriffsmodi werden beim Laden
  automatisch als Einzelangriff behandelt; Name, Schaden und Notiz bleiben erhalten.
- Wisch-Navigation stabilisiert:
  - feste Seitenreihenfolge wie Menü
  - Geste merkt sich die Startseite
  - Wechsel erfolgt über die vorhandenen Menübuttons
  - horizontale Scrollbereiche und Bedienelemente sind ausgenommen
  - vertikale/diagonale Gesten werden stärker gefiltert
- Charakter-Speicherung gehärtet:
  - Klassenstufe, Klassenname und GAB werden bereits bei Eingabe gespeichert
  - beim Charakterwechsel wird vorher explizit gespeichert
  - pagehide/beforeunload sichern den aktuellen Charakterzustand
- Version v0.41.1.
