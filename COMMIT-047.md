# Commit 47 – Erweiterte Rüstungsklasse

## Maximaler GE-Bonus
In der RK-Gruppe kann der maximale positive GE-Bonus durch die getragene Rüstung eingetragen werden.
Leer bedeutet keine Begrenzung. Negative GE-Modifikatoren werden nie begrenzt.

## RK-Werte
- Rüstungsklasse
- Auf dem falschen Fuß
- Berührung
- Berührung gegen Körperlose

Alle vier Werte sind anklickbar und zeigen ihre Berechnung.

## Regeln
Normale RK:
10 + begrenzter GE-Modifikator + Größe + gültige RK-Boni.

Auf dem falschen Fuß:
Positiver GE-Bonus entfällt. Ein negativer GE-Modifikator bleibt erhalten.
Ausweichen-Boni werden nicht berücksichtigt.

Berührung:
Rüstungsbonus, Schildbonus und natürliche Rüstung werden ignoriert.

Berührung gegen Körperlose:
Wie Berührung. Rüstungs- und Schildboni können jedoch über die neue Eigenschaft
„Wirkt gegen körperlose Berührung“ ausdrücklich erhalten bleiben.
Natürliche Rüstung wird ignoriert.

## Effekteditor
Bei RK-Bonuszeilen der Bonusart Rüstung oder Schild erscheint:
„Wirkt gegen körperlose Berührung“.

Die Eigenschaft wird mit der Bonuszeile gespeichert und steht damit auch bei
Charakter-Export/Import über die vorhandene Effektspeicherung zur Verfügung.

Version v0.47.0.
