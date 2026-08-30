# Commit 52.2 – Hotfix dynamische Wertequellen

Fehlerbild:
Beim Aktivieren eines Effekts mit „Attribut-Mod.“ konnte die Kampfansicht beim
Neuberechnen der Angriffe abbrechen. Ursache war eine rekursive Berechnung:
Attribut-Mod. -> aktueller Attributwert -> Effektboni -> Attribut-Mod. -> ...

Fix:
- Rekursionsschutz je Attribut für die Wertquelle „Attribut-Mod.“
- aktive reguläre Attributboni werden weiterhin in den aktuellen Modifikator einbezogen
- Klassenstufe bleibt dynamisch und wurde zusätzlich gegen ungültige Zahlen abgesichert
- bestehende Effekte/Daten bleiben kompatibel

Version v0.52.2.
