# Commit 50 – Effekt-Schnellauswahl und Kampf-Symbole

## Schnellleisten auf Kampf / Werte
Direkt unter dem Kopfbereich stehen zwei kompakte, einklappbare Schnellleisten:
- Schwert: Nahkampf
- Bogen: Fernkampf

Die bisherige Reihenfolge der eigentlichen Kampfbereiche bleibt unverändert:
1. Angriffe
2. Rüstungsklasse
3. Rettungswürfe
4. KMB / KMV

Die Schnellleisten sind reine Verknüpfungen auf die vorhandenen Effekte. Ein Effekt hat keinen zweiten Aktivstatus.
- Tippen schaltet denselben Effekt an/aus, der auch auf der Effektseite angezeigt wird.
- Änderungen auf der Effektseite spiegeln sich in der Schnellleiste.
- Langes Drücken wechselt zur Effektseite, filtert auf den Effekt und scrollt ihn in den sichtbaren Bereich.
- Im Schnellbutton werden Klammerzusätze des Effektnamens ausgeblendet.

## Zuweisung im Effektbanner
Bei Favoriten erscheinen Schwert und Bogen als kleine Schalter im Effektbanner.
- Schwert aktiv: Nahkampf-Schnellleiste
- Bogen aktiv: Fernkampf-Schnellleiste
- beide aktiv: Effekt erscheint in beiden
- die Zuweisung ist charakterbezogen

## Fixierter Kopf
Auf Kampf / Werte bleiben die Kopfzeile und die beiden Schnellleisten beim Scrollen fixiert.

## Kampf-Symbole
- Angriff: Schwert bei Art = Nah, Bogen bei Art = Fern
- Rüstungsklasse: Schild
- Reflex: gelber Zauberstern
- Wille: blauer Zauberstern
- Zähigkeit: roter Zauberstern

Die Symbole sind als Vektorgrafiken umgesetzt und damit auf allen Plattformen konsistent.

## Export / Import
Charakterexport ist Version 6. Die charakterbezogenen Schnellleisten-Zuweisungen werden mit exportiert/importiert.
Ältere Exportversionen 1–5 bleiben importierbar.

Version v0.50.0.
