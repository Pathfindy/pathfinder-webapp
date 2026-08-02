COMMIT 25.2 – DOPPELTE BENUTZEREFFEKTE BEREINIGEN

Enthalten:
- index.html
- js/commit22.js

Behoben:
- Export/Import erzeugt keine doppelten selbst angelegten Effekte mehr.
- Effekte werden beim Import sowohl über ihre ID als auch über
  Name + Kategorie + Quelle erkannt.
- Bereits vorhandene doppelte Benutzereffekte werden beim Start automatisch
  zusammengeführt.
- Favoriten-IDs werden auf den erhaltenen Effekt übertragen.
- Charakterstatus bleibt erhalten, da dieser weiterhin über den Effektnamen
  verwaltet wird.
- Cache-Version von commit22.js wurde auf 25.2 erhöht.

Installation:
1. index.html im Hauptverzeichnis ersetzen.
2. js/commit22.js ersetzen.
3. Commit-Nachricht:
   Commit 25.2: Doppelte Benutzereffekte nach Import verhindern
4. GitHub Pages abwarten.
5. App auf dem Smartphone vollständig schließen und neu öffnen.
   Bei Bedarf Browser-Cache aktualisieren, aber NICHT die Website-Daten löschen.

Hinweis:
Die automatische Bereinigung betrifft ausschließlich benutzerdefinierte Effekte.
Standardeffekte werden nicht verändert.
