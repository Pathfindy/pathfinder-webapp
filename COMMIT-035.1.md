# Commit 35.1 – Energielogik

- Energien widerstehen: Unter der Auswahl 10/20/30 gibt es je Energietyp eine freie Eingabe.
- Ist die freie Eingabe leer, gilt die Auswahl 10/20/30.
- Ist die freie Eingabe befüllt, gilt dieser Wert als Reduktion.
- Schutz vor Energien prüft bei Schaden zuerst den identischen Energietyp unter Energien widerstehen.
- Nur wenn dieser Widerstand aktiviert ist, wird dessen Reduktion zuerst abgezogen.
- Danach wird der verbleibende Schaden vom Restpool von Schutz vor Energien abgezogen.
- Ein danach verbleibender Schaden geht zuerst auf Temp-TP und danach auf aktuelle TP.
