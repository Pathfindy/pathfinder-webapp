# Commit 41.5 – Reparatur der drei offenen Fehler

## Mächtige magische Fänge
- Ursache gefunden: In effekte.json fehlte beim Effekt die Eigenschaft
  `sonderlogik: "maechtige-magische-faenge"`.
- Die Eigenschaft ist wieder direkt im Effekt hinterlegt.
- Zusätzlich erkennt die Normalisierung den Effekt anhand seines Namens,
  damit ältere lokale Admin-Änderungen die Sonderlogik nicht erneut entfernen können.
- Im Banner stehen wieder die beiden Anwendungen zur Verfügung:
  - Alle natürlichen Angriffe +1
  - Ein Angriff nach Zauberstufe (+1 bis +5)

## Wisch-Navigation
- Die bisherige Wischlogik verwendete eine andere Reihenfolge als die sichtbare Menüleiste.
- Zusätzlich fehlten Kampf und Leben im alten `seiten`-Objekt von app.js.
- Die Wischlogik arbeitet jetzt direkt mit den DOM-Seiten und exakt mit der sichtbaren
  Menü-Reihenfolge aus Commit 21:
  Charaktere → Kampf → Leben → Effekte → Dashboard → Admin.
- Links wischen = nächster Menüpunkt rechts.
- Rechts wischen = vorheriger Menüpunkt links.
- Eingabefelder, Angriffskarten, Dialoge und horizontal scrollbare Bereiche bleiben ausgenommen.

## Boni nach Nutzereingabe
- Auswahl wird verbindlich auf +1 bis +10 gesetzt.
- Alte lokale Admin-Overrides mit `max: 5` können die Auswahl nicht mehr auf +5 begrenzen.
- Getter, Setter, Effektbanner und Effekt-Normalisierung verwenden dieselbe feste Spanne.

Version: v0.41.5
