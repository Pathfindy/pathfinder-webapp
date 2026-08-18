# Commit 40.2 – globaler Nutzerbonus korrigiert

Ursache des Fehlers:
- Das Häkchen „Boni nach Nutzereingabe“ erzeugte zwar die Auswahl im Effektbanner.
- Die Berechnung verwendete den gewählten Wert aber nur, wenn jede einzelne
  Bonuszeile zusätzlich die Wertquelle „Nutzereingabe“ besaß.
- Normal angelegte Bonuszeilen mit Grundwert +1 blieben deshalb bei +1.

Korrektur:
- „Boni nach Nutzereingabe“ gilt jetzt wirklich global für den gesamten Effekt.
- Ist das Häkchen aktiv, ersetzt der im Effektbanner gewählte Wert (+1 bis +5)
  automatisch den Grundwert aller Bonuszeilen dieses Effekts.
- Es ist keine zusätzliche Wertquellen-Auswahl pro Bonuszeile erforderlich.
- Alte Daten mit Wertquelle „Nutzereingabe“ bleiben kompatibel.
- Auswahl bleibt charakterbezogen gespeichert.
- Dashboard und Kampf werden nach einer Änderung sofort neu berechnet.
- Admin-Oberfläche aus 40.1 bleibt erhalten: Häkchen neben „Angriff zuweisbar“,
  keine Min/Max/Standard-Felder.

Version: v0.40.2
