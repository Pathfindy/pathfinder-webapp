# Commit 15 – Admin-Modus

**Commit-Message:**

`feat(admin): add PIN-protected admin mode`

## Änderungen

- Admin-Seite zur Navigation hinzugefügt.
- Vierstellige PIN wird beim ersten Öffnen festgelegt.
- PIN wird als SHA-256-Hash im lokalen Speicher abgelegt.
- Entsperrung gilt nur für die aktuelle Browser-Sitzung.
- Automatische Sperre nach 15 Minuten Inaktivität.
- Nach fünf falschen Eingaben gilt eine Sperrzeit von 30 Sekunden.
- Admin-Werkzeuge sind ausschließlich im entsperrten Zustand sichtbar.

Hinweis: Da die App ohne Backend auf GitHub Pages läuft, ist die PIN ein Schutz vor versehentlicher Nutzung, aber keine serverseitige Zugriffskontrolle.
