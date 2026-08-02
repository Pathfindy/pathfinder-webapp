COMMIT 27 – RETTUNGSWÜRFE NEU AUFGEBAUT

Basis:
- funktionierender Commit 26.1

Enthalten:
- index.html
- js/commit26.js
- css/commit27.css

Berechnung auf der Seite „Werte“:

RW-Reflex
= Grundwert RW-Reflex + gültige Boni auf RW-Reflex

RW-Wille
= Grundwert RW-Wille + gültige Boni auf RW-Wille

RW-Zähigkeit
= Grundwert RW-Zähigkeit + gültige Boni auf RW-Zähigkeit

RW-Furcht
= fertig berechneter RW-Wille + separat berechnete Boni auf RW-Furcht

RW-Bezauberung
= fertig berechneter RW-Wille + separat berechnete Boni auf RW-Bezauberung

RW-Verzauberung
= fertig berechneter RW-Wille + separat berechnete Boni auf RW-Verzauberung

RW-Gift
= fertig berechneter RW-Zähigkeit + separat berechnete Boni auf RW-Gift

Wichtig:
- Die Stapelregeln des Basis-Rettungswurfs und des Spezial-Rettungswurfs
  werden getrennt angewendet.
- Ein Furchtbonus wirkt ausschließlich auf RW-Furcht.
- Ein Bezauberungsbonus wirkt ausschließlich auf RW-Bezauberung.
- Ein Verzauberungsbonus wirkt ausschließlich auf RW-Verzauberung.
- Ein Giftbonus wirkt ausschließlich auf RW-Gift.
- Die Spezialboni verändern ihren Basis-Rettungswurf nicht.
- Das Dashboard bleibt unverändert und zeigt weiterhin ausschließlich
  Effektboni. Grundwerte der Seite „Werte“ werden dort nicht addiert.

Darstellung:
- Grundwertfelder bleiben nur für RW-Reflex, RW-Wille und RW-Zähigkeit.
- Die Spezial-Rettungswürfe werden eingerückt unter ihrem Basis-RW angezeigt.
- Beim Antippen zeigt die Detailansicht den fertigen Basis-RW und nur die
  zusätzlichen Boni des gewählten Spezial-Rettungswurfs.

Installation:
1. index.html im Hauptverzeichnis ersetzen.
2. js/commit26.js ersetzen.
3. css/commit27.css in den Ordner css hochladen.
4. Commit-Nachricht:
   Commit 27: Spezial-Rettungswürfe aus fertig berechneten Basis-RW ableiten
5. GitHub Pages abwarten und die App vollständig neu laden.
