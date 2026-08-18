# Commit 39.7 – Reparatur Stufenlogik + GAB

Basis:
- Ausgangspunkt ist der Test-Stand vor dem fehlerhaften 39.6-Umbau.
- Navigation und Menüstruktur wurden nicht umgebaut.

Korrekturen:
- Stufenabhängige Bonuszeilen werden im Dashboard und in Kampf über denselben
  effektStufenwert() aufgelöst, den das Effektbanner anzeigt.
- Altbestände aus Commit 39, bei denen ein stufenabhängiger Effekt ausschließlich
  feste Bonuswerte gespeichert hatte, werden auf Stufenwert migriert.
- Beim erstmaligen Aktivieren der Stufenabhängigkeit werden vorhandene Bonuszeilen
  standardmäßig auf Stufenwert gestellt; sie können danach einzeln wieder auf Fest
  gestellt werden.
- Admin-Änderungen an Standard-Effekten werden auch nach Sperren des Admin-Modus
  und nach Neuladen angewendet.
- Nach dem Speichern eines Effekts werden Dashboard/Kampf sofort neu berechnet.
- GAB ist ein gespeicherter Charakterwert im Charakterbanner.
- GAB kann als Stufenbezug eines Effekts gewählt werden.
- Charakterexport enthält GAB automatisch als Bestandteil des Charakterobjekts.
- Version v0.39.7.
