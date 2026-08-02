COMMIT 27.1 – VERIFIZIERTER FIX DER UNTERRETTUNGSWÜRFE

Enthalten:
- index.html
- js/commit26.js
- css/commit27.css

Korrektur:
- RW-Wille verwendet ausschließlich Boni mit Ziel RW-Wille.
- RW-Zähigkeit verwendet ausschließlich Boni mit Ziel RW-Zähigkeit.
- RW-Furcht verwendet ausschließlich RW-Wille-Boni und RW-Furcht-Boni.
- RW-Bezauberung verwendet ausschließlich RW-Wille-Boni und RW-Bezauberung-Boni.
- RW-Verzauberung verwendet ausschließlich RW-Wille-Boni und RW-Verzauberung-Boni.
- RW-Gift verwendet ausschließlich RW-Zähigkeit-Boni und RW-Gift-Boni.
- Ein Spezialbonus wirkt weder auf den Basis-Rettungswurf noch auf andere
  Unterrettungswürfe.

Stapelregeln:
Die relevanten Basis- und Spezialboni werden für jeden Unterrettungswurf
separat zusammengestellt und anschließend gemeinsam nach Bonusart ausgewertet.

Beispiel:
Grundwert RW-Wille 8
+4 Moral auf RW-Furcht

Ergebnis:
RW-Wille        8
RW-Furcht       12
RW-Bezauberung  8
RW-Verzauberung 8

Wichtig:
Die Cache-Version von js/commit26.js wurde auf 27.1 erhöht. Dadurch lädt der
Browser auf Smartphones tatsächlich die korrigierte Datei.

Installation:
1. index.html im Hauptverzeichnis ersetzen.
2. js/commit26.js ersetzen.
3. css/commit27.css kann unverändert erneut hochgeladen werden.
4. Commit-Nachricht:
   Commit 27.1: Unterrettungswürfe strikt getrennt berechnen
5. GitHub Pages abwarten und die App vollständig neu öffnen.
