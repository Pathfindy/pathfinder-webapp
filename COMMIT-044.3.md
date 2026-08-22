# Commit 44.3 – Attributsmodifikator in Angriffsdetails

Die tatsächliche Angriffsberechnung aus Commit 44.2 war bereits korrekt.
Fehlerhaft war nur die anklickbare Detailauflistung aus `commit25.js`, weil sie
weiterhin ausschließlich Effektboni zeigte und den neuen nativen Attributsmodifikator
nicht in ihre Aufschlüsselung einbezog.

## Korrektur
- Nahkampfangriff ohne Waffenfinesse:
  - zeigt ST-Modifikator
- Fernkampfangriff:
  - zeigt GE-Modifikator
- Nahkampfangriff mit Waffenfinesse:
  - zeigt GE-Modifikator (Waffenfinesse)
- Nahkampfschaden:
  - zeigt ST-Modifikator
- Fernkampfschaden:
  - erhält weiterhin keinen automatischen Attributsmodifikator

Der Attributsmodifikator wird in der Detailansicht als
`Modifikator Attribut` / `Grundkomponente – immer berücksichtigt` angezeigt.

Die angezeigte Detail-Summe entspricht dadurch wieder der bereits korrekten
Berechnung auf der Angriffskarte.

Version v0.44.3.
