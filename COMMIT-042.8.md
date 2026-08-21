# Commit 42.8 – Wertquelle/Faktor endgültig sichtbar

Ursache:
- `commit21.js` enthielt bereits den neuen 6-spaltigen Bonus-Editor.
- `commit24.js` wird danach geladen und definierte `rendereBonusEditor` erneut.
- Diese alte Commit-24-Funktion erzeugte nur:
  Ziel | Bonusart | Wert | Löschen
- Dadurch verschwanden Wertquelle und Faktor nach dem Laden wieder vollständig.

Fix:
- Der veraltete Bonus-Editor-Override wurde aus `commit24.js` entfernt.
- Die aktuelle Editor-Implementierung aus `app.js` / `commit21.js` bleibt dadurch zuletzt wirksam.
- Pro Bonuszeile stehen jetzt sichtbar zur Verfügung:
  Ziel | Bonusart | Wertquelle | Faktor | Wert | Löschen
- Wertquelle: Fest oder Stufenwert.
- Faktor ist bei Stufenwert editierbar.
- Version v0.42.8.
