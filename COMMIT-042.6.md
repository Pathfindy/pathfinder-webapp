# Commit 42.6 – Wertquelle im Effekteditor tatsächlich wirksam

Ursache:
- `app.js` enthielt den neuen Editor aus Commit 42.5 korrekt.
- `commit21.js` überschreibt `rendereBonusEditor` jedoch später beim Laden.
- Diese ältere Commit-21-Version zeigte nur Ziel, Bonusart und Wert und entfernte
  dadurch Wertquelle und Faktor wieder aus dem sichtbaren Editor.

Änderung:
- Die spätere `rendereBonusEditor`-Implementierung in `commit21.js` unterstützt jetzt ebenfalls:
  - Fest
  - Stufenwert
  - Stufenfaktor
  - Wert
- Spaltenüberschriften bleiben sichtbar.
- Stufenwert kann nur bei aktivierter Stufenabhängigkeit gewählt werden.
- Jede Bonuszeile speichert ihre eigene `wertQuelle` und ihren `stufenFaktor`.
- Die Berechnung respektiert die Auswahl pro Bonuszeile.
- Keine automatische Umwandlung aller GAB-Bonuszeilen mehr.
- Heftiger Angriff und Mächtige magische Fänge behalten ihre Sonderlogik.

Version v0.42.6.
