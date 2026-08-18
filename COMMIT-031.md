# Commit 31 – Effekte und Spezial-Rettungswürfe

## Änderungen

1. Der zusätzliche Hinweis „Aktiv: …“ auf der Seite **Effekte** wurde entfernt. Die globale Charakterauswahl bleibt bestehen.
2. Spezial-Rettungswürfe **Furcht**, **Verzauberung**, **Bezauberung** und **Gift** werden aus dem jeweiligen Grund-Rettungswurf aufgebaut und Boni nach Bonusart gemeinsam bewertet. Ein allgemeiner und ein spezieller Bonus derselben nicht stapelbaren Bonusart werden nicht addiert; der jeweils höhere Bonus gilt.
3. Datenkorrektur **Heldenmahl**: `RW-Wille` Moralbonus von `+4` auf `+1` korrigiert; `RW-Furcht` und `RW-Gift` bleiben jeweils `+4`.
4. Version auf **v0.31** erhöht.

### Beispiel
Grund-Wille +4, Resistenzumhang +2, Heldenmahl: Willen +1 Moral, Furcht +4 Moral.
- Willen: 4 + 2 + 1 = **+7**
- Furcht: 4 + 2 + max(1,4 Moral) = **+10**

## Commit-Nachricht
`Commit 31: Spezial-Rettungswürfe typgerecht berechnen und Effekte-Kopf bereinigen`
