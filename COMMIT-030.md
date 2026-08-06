# Commit 30 – Angriffszuweisbare Effekte

## Neue Funktion

Beim Erstellen oder Bearbeiten eines Effekts kann **„Angriff zuweisbar“** aktiviert werden. Nur bei solchen Effekten erscheint auf dem Effektbanner die Auswahl:

- `-` – wirkt auf alle Angriffe
- `A1` – wirkt nur auf den obersten Angriff der Seite „Werte“
- `A2` – wirkt nur auf den zweiten Angriff
- bis `A6`

Die Zuordnung betrifft ausschließlich folgende Bonusziele:

- Angriff Nah
- Angriff Fern
- Schaden Nah
- Schaden Fern

Alle anderen Boni eines Effekts wirken weiterhin global. Die Auswahl wird pro Charakter gespeichert und beim Charakterexport/-import übernommen.

## Kompatibilität

Alte Effekte besitzen standardmäßig `angriffZuweisbar: false` und funktionieren unverändert. Alte Charakterexporte ohne `effektAngriffsziele` werden weiterhin importiert; die Auswahl steht dann auf `-`.

## Version

Im Kopf der App wird `v0.30` angezeigt.

## Commit-Nachricht

`Commit 30: Angriffszuweisbare Effekte und Versionsanzeige ergänzen`
