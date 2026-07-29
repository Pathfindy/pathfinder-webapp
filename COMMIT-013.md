# Commit 13 – Bonuseingabe von +20 bis -20

Commit-Message:
`feat(effects): expand bonus values from +20 to -20`

Änderungen:
- Die Bonuseingabe umfasst jetzt alle ganzzahligen Werte von `+20` bis `-20`.
- `0` liegt in der Mitte der Auswahlliste.
- Oberhalb von `0` stehen `+1`, `+2` bis `+20`.
- Unterhalb von `0` stehen `-1`, `-2` bis `-20`.
- Positive Werte werden weiterhin mit einem führenden Pluszeichen angezeigt.
- Die Auswahl bleibt mit bestehenden Effekten kompatibel.

Geänderte Datei:
- `js/app.js`
