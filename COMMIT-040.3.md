# Commit 40.3 – GAB-/Stufenwert-Vorzeichen

Bei allgemeinen stufenabhängigen Bonuszeilen ging bisher das Vorzeichen des Grundwerts verloren.

Korrektur:
- Stufenwert bestimmt die Höhe.
- Grundwert bestimmt das Vorzeichen.
- Negative Werte wachsen korrekt ins Negative.
- Positive Werte wachsen korrekt ins Positive.

Defensive Kampfweise:
- GAB 1–3: Angriff -1, KMB -1, RK +1
- GAB 4–7: Angriff -2, KMB -2, RK +2
- GAB 8–11: Angriff -3, KMB -3, RK +3
- GAB 12–20: Angriff -4, KMB -4, RK +4

Version v0.40.3
