COMMIT 23 – FESTES ADMIN-PASSWORT

Passwort:
7536

Änderungen:
- Benutzer können keine eigene Admin-PIN mehr festlegen.
- Für alle Installationen gilt das feste Passwort 7536.
- Der bisherige LocalStorage-Eintrag "pf-admin-pin-hash" wird entfernt.
- Fehlversuchssperre, Sitzungssperre und automatische Sperrung bleiben erhalten.
- Die vorhandene Oberfläche wird weiterverwendet und auf "Passwort" umgestellt.

MANUELLE INSTALLATION AUF GITHUB

1. Lade js/commit23.js in den Ordner js hoch.
2. Ergänze in index.html direkt unter:

   <script src="js/commit22.js?v=22"></script>

   diese Zeile:

   <script src="js/commit23.js?v=23"></script>

3. Commit-Nachricht:

   Commit 23: Festes Admin-Passwort einführen

ALTERNATIV LOKAL

python apply_commit23.py /pfad/zum/projekt

TEST

1. Webseite vollständig neu laden.
2. Admin öffnen.
3. Passwort 7536 eingeben.
4. Falsches Passwort prüfen.
5. Automatische Admin-Sperre prüfen.

HINWEIS

Da die Anwendung über öffentliches GitHub Pages ausgeliefert wird, ist das Passwort
im JavaScript-Quellcode einsehbar. Es verhindert versehentliche Änderungen, bietet
aber keinen Schutz gegen gezielte technische Zugriffe.
