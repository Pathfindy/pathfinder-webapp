# Commit 16 – Hotfix Bonusarten

Commit-Message:

```text
fix(bonus): add Glück and migrate bonus type names
```

## Änderungen

- Ergänzt die Bonusart `Glück`.
- Benennt `Unbenannt` beziehungsweise ältere Einträge `Unbekannt` in `Namenlos` um.
- Benennt `Umstand` in `Situation` um.
- Migriert bestehende Benutzer-, Standard- und Admin-Effekte beim Laden über `normalisiereBonusart()`.
- `Namenlos` und `Situation` bleiben als stapelbare Bonusarten vorgesehen.
- `Glück` ist als reguläre, nicht stapelbare Bonusart vorgesehen.

Dieser Hotfix ändert noch nicht die eigentliche Stapellogik. Diese folgt separat.

## Anwendung

1. ZIP in den Hauptordner des Repositories entpacken.
2. Im Hauptordner ausführen:

```bash
node apply-hotfix.js
```

3. Syntax prüfen:

```bash
node --check js/app.js
```

4. Geänderte Datei committen.
