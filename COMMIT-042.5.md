# Commit 42.5 – Wertquelle pro Bonuszeile

- Im Effekteditor ist die Wertquelle jeder Bonuszeile jetzt deutlich sichtbar:
  - Fest
  - Stufenwert
- Desktop: sichtbare Spaltenüberschriften Ziel / Bonusart / Wertquelle / Faktor / Wert.
- Mobil: Wertquelle wird optisch hervorgehoben.
- Erklärung direkt über den Bonuszeilen.
- Fest:
  - eingetragener Bonuswert bleibt konstant.
- Stufenwert:
  - Höhe kommt aus der Stufen-/GAB-Logik.
  - Faktor kann den Stufenwert multiplizieren oder umkehren.
  - Vorzeichen wird aus dem Grundwert der Bonuszeile übernommen.
- Die Auswahl wird pro Bonuszeile gespeichert.
- Die bisherige globale Commit-42.4-Regel, nach der GAB-abhängige Effekte automatisch
  alle Bonuszeilen als Stufenwert behandelten, wurde entfernt.
- Heftiger Angriff und Mächtige magische Fänge behalten ihre Sonderlogiken.
- Version v0.42.5.
