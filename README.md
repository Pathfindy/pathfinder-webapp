# Commit 6 – Bonus stacking engine

Commit-Message:

`feat(calculation): implement bonus stacking engine`

## Geänderte Dateien

- `js/berechnung.js`
- `js/app.js`

## Enthaltene Regeln

- Es werden nur aktive Effekte ausgewertet.
- Boni werden nach Ziel gruppiert.
- Gleichartige positive Boni stapeln nicht; nur der höchste zählt.
- Mali derselben Bonusart werden addiert.
- Ausweich-, Umstands- und unbenannte Boni werden vollständig addiert.
- Ungültige oder leere Bonuszeilen werden sicher ignoriert.
- `berechneBonusErgebnis(effekte)` gibt ein reines Ergebnisobjekt zurück.
- `berechneWerte()` verwendet die globale Effektliste, verändert das Dashboard in diesem Commit aber noch nicht.

## Beispiel

```js
berechneBonusErgebnis([
  {
    aktiv: true,
    boni: [
      { ziel: "Rüstungsklasse", bonusart: "Moral", wert: 2 },
      { ziel: "Rüstungsklasse", bonusart: "Moral", wert: 4 },
      { ziel: "Rüstungsklasse", bonusart: "Ausweich", wert: 1 }
    ]
  }
]);

// { "Rüstungsklasse": 5 }
```

## Einspielen

Ersetze im GitHub-Browser den vollständigen Inhalt von:

1. `js/berechnung.js`
2. `js/app.js`

und speichere beide gemeinsam mit:

`feat(calculation): implement bonus stacking engine`
