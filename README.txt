COMMIT 27 – SPEZIAL-RETTUNGSWÜRFE ABLEITEN

Enthalten:
- index.html
- js/commit26.js
- css/commit27.css

Neue Berechnung:
- RW-Furcht basiert auf RW-Wille.
- RW-Bezauberung basiert auf RW-Wille.
- RW-Verzauberung basiert auf RW-Wille.
- RW-Gift basiert auf RW-Zähigkeit.

Die Spezial-Rettungswürfe besitzen kein eigenes Grundwertfeld mehr.
Sie werden eingerückt unter dem jeweiligen Basis-Rettungswurf angezeigt.

Stapelregeln:
Für einen Spezial-Rettungswurf werden die Boni auf den Basis-Rettungswurf und
die speziellen Boni gemeinsam ausgewertet. Boni desselben nicht stapelbaren
Bonustyps werden nicht addiert; nur der höchste positive Bonus und der
stärkste Malus dieses Typs werden berücksichtigt. Stapelbare Bonusarten
werden weiterhin addiert.

Beispiel:
- +2 Widerstand auf RW-Wille
- +4 Widerstand gegen Furcht
Ergebnis für RW-Furcht: Es gilt +4, nicht +6.

Dashboard:
Die vier Spezial-Rettungswürfe werden ebenfalls aus Wille bzw. Zähigkeit
und den anwendbaren Spezialboni berechnet.

Bestehende Daten:
Alte separat gespeicherte Grundwerte für Furcht, Gift, Bezauberung und
Verzauberung werden nicht mehr verwendet, aber nicht aus dem Export gelöscht.

Installation:
1. index.html im Hauptverzeichnis ersetzen.
2. js/commit26.js ersetzen.
3. css/commit27.css in den Ordner css hochladen.
4. Commit-Nachricht:
   Commit 27: Spezial-Rettungswürfe von Wille und Zähigkeit ableiten
5. GitHub Pages abwarten und die App neu laden.
