# Commit 47.1 – Häkchen „Wirkt gegen körperlose Berührung“ sichtbar

Ursache:
- `app.js` enthielt die neue Checkbox aus Commit 47.
- `commit21.js` überschreibt `rendereBonusEditor()` später beim Laden.
- Die dort wirksame Editor-Version enthielt die neue Checkbox noch nicht.

Fix:
- Die Checkbox wurde in die tatsächlich wirksame `rendereBonusEditor()`-Funktion
  in `commit21.js` übernommen.
- Sie erscheint ausschließlich bei:
  - Ziel: Rüstungsklasse
  - Bonusart: Rüstung oder Schild
- Änderungen von Ziel oder Bonusart bauen die Bonuszeile jetzt sofort neu auf,
  damit das Häkchen unmittelbar erscheint bzw. verschwindet.
- Der Zustand wird weiterhin pro Bonuszeile als
  `wirktGegenKoerperloseBeruehrung` gespeichert.
- Version v0.47.1.
