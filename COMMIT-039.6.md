# Commit 39.6 – Stufenlogik neu stabilisiert + GAB

- Charakterstufe bleibt Summe aller Klassenstufen.
- GAB ist ein eigenes, am Charakter gespeichertes Feld.
- Stufenbezug kann Charakterstufe, Klassenstufe, Zauberstufe, manuelle Stufe oder GAB sein.
- Alte fehlerhafte Commit-39-Effekte mit Stufenlogik, aber ausschließlich festen Bonuswerten werden auf Stufenwert migriert.
- Beim Aktivieren der Stufenabhängigkeit werden vorhandene Bonuszeilen standardmäßig auf Stufenwert gesetzt; einzelne Zeilen können anschließend wieder auf Fest gestellt werden.
- Dashboard und Kampf/Werte verwenden dieselbe effektStufenwert()-Auflösung wie das Effektbanner.
- Admin-Änderungen an Standardeffekten bleiben nach Sperren und Neuladen wirksam.
- Export enthält Stufenlogik, Wertquellen und Angriffsmodus.
- GAB wird mit dem Charakter gespeichert und damit automatisch im Charakterexport mitgeführt.
- Version v0.39.6.
