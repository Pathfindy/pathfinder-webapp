# Commit 53 – Charakter-Scroll, Angriff-Standardwert, Energieschaden-Notiz

## Charakter
Beim Bearbeiten einer Klassenstufe wird die Charakterseite während der Eingabe
nicht mehr komplett neu aufgebaut. Dadurch bleibt die Scrollposition erhalten
und die Eingabe kann ohne Sprung zum Seitenanfang abgeschlossen werden.
Auch beim abschließenden Change wird die vorherige Scrollposition wiederhergestellt.

## Kampf / Werte
Neue Angriffe starten bei „Manuelle Modi.“ für den Angriff nun mit 0 statt -999.
Bestehende gespeicherte Angriffe bleiben unverändert.

## Leben / Trefferpunkte / Energieschaden
Neues frei beschreibbares mehrzeiliges Notizfeld.
- pro Charakter gespeichert
- leer bzw. kurzer Inhalt: einzeilige Höhe
- wächst automatisch mit dem eingegebenen Text
- kein manueller Resize-Griff nötig

Version v0.53.0.
