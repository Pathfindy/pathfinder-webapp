COMMIT 21 – Installation
========================

Die GitHub-Verbindung konnte die Dateien lesen, besitzt aber derzeit keine
Schreibberechtigung für das Repository. Dieses Paket ist deshalb vollständig
zum Einspielen vorbereitet.

Enthalten:
- css/commit21.css
- js/commit21.js
- js/berechnung.js
- apply_commit21.py

Vorgehen:
1. ZIP direkt in den Stammordner des Repositories entpacken.
2. Im Stammordner ausführen:
       python apply_commit21.py
3. Danach:
       git add index.html css/commit21.css js/commit21.js js/berechnung.js
       git commit -m "Commit 21: Navigation und Effektdetails erweitern"
       git push

Umgesetzt:
- Menü-Reihenfolge: Charaktere, Werte, Effekte, Dashboard, Admin
- aktiver Menübutton bleibt dunkelblau und ersetzt die Seitenüberschrift
- aktiver Charakter auf der Effektseite
- Bonusarten ergänzt und umbenannt
- stapelbar: Ausweichen, Situation, Namenlos, Malus
- kompakte Bonianzeige auf Effektkarten
- Bereich und Dauer gemäß Excel-Blatt „Parameter“
