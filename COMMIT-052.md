# Commit 52 – Manuelle Modi & Attributs Modifikator

## Kampf/Werte
- Angriff: „Grund-Angriff“ -> „Manuelle Modi.“
- Angriff: „Grund-Schaden“ -> „Manuelle Modi.“
- Kampfmanöver: Spalte „Grundwert“ -> „Manuelle Modi.“

Die gespeicherten Werte und die bisherige Berechnungslogik bleiben unverändert;
es handelt sich um eine klarere Bezeichnung der manuellen Eingabefelder.

## Effekte – dynamischer Attributsmodifikator
Neue Bonusart:
- Attributs Modifikator

Neue Wertquelle:
- Attribut-Mod.

Bei Auswahl von „Attribut-Mod.“ wird statt eines festen Zahlenwerts ein Attribut gewählt:
- Stärke (ST)
- Geschicklichkeit (GE)
- Konstitution (KO)
- Intelligenz (IN)
- Weisheit (WE)
- Charisma (CH)

Der Bonuswert entspricht immer dem AKTUELLEN Modifikator dieses Attributes
inklusive aktiver Attributseffekte.

Beispiele:
- Böses niederstrecken: CH-Modifikator als Bonus auf Angriff, Schaden und RK.
- Göttliche Würde: CH-Modifikator als Bonus auf Rettungswürfe.

„Attributs Modifikator“ ist stapelbar, entsprechend der bisherigen internen
Bonusart „Modifikator Attribut“.

Version v0.52.0.
