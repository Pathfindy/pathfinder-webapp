# Englischer Zauberabgleich – v0.59.8

Stand 24. Oktober 2026. Dieses Archiv enthält die komplette Web-App und die aktualisierte **bestehende** deutsche Zauberdatenbank.

## Ergebnis und Grenzen

* 1.280 Zaubereinträge und eindeutige IDs wurden erhalten.
* 1.278 Einträge haben einen englischen **Namensvorschlag**, die auf bekannten Pathfinder-1-Zaubernamen und englischen Indizes beruhen.
* 2 **Kampagnenwelt**-Zauber haben keinen ausreichend belegten englischen Originalnamen: `Blitz der Besessenheit`, `Lebensschutz`.
* Englische **Buchbezeichnungen** sind für die vier Kern-Quellbücher ergänzt. `Kampagnenwelt` hat ohne genaues englisches Quellbuch keine sichere englische Buchangabe.
* Englische **Buchseiten** bleiben null, da deutsche Seitenzahlen nicht auf englische Editionen übertragbar sind.
* Die Namen sind überwiegend **nicht einzeln quellenverifiziert**. Nicht als abgeschlossenen 100%-Originaltext-Abgleich verwenden.

## Prüfungen

* 1.280 deutsche Namen, IDs, Schreibweisen, Klassenzuordnungen, Regeldaten erhalten (Feldvergleich zur Ausgangs-ZIP).
* ID-Eindeutigkeit, deutsche Namens-Eindeutigkeit, JSON-Syntax, Gesamtzahl geprüft.
* Bereits im Ausgangsbestand existiert eine sachliche Dublette (z991/z1017, Massen-Mittelschwere Wunden verursachen). Beide ursprünglichen IDs bleiben aus Kompatibilitätsgründen erhalten; der englische Name ist daher zweimal vorhanden.
* JS-Syntax und ZIP-Integrität separat kontrolliert.
* Spalte `abgleich_en_status`: `vorschlag` (vorläufig), `pruefen` (problematische Kandidaten), `offen` (kein Name).
* Vollständige Einzelliste in `ABGLEICH_EN_GESAMT.csv`.

## Online-Quellen (englische Originalschreibweisen)

* https://pathfinder.d20srd.org/indices/spelllists.html
* https://pathfinder.d20srd.org/advancedPlayersGuide/advancedSpellIndex.html
* https://pathfinder.d20srd.org/ultimateMagic/ultimateMagicSpellLists.html
* https://pathfinder.d20srd.org/ultimateCombat/ultimateCombatSpellLists.html

**Bewusst kein Ratespiel:** Unbekannte Originalseiten und die beiden Kampagnenwelt-Namen bleiben leer.
