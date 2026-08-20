# Commit 42.1 – Vermögen repariert

- Ursache der leeren Seite behoben: `vermoegen` war nicht im zentralen `seiten`-Objekt von app.js registriert.
- Kampf und Leben ebenfalls in diesem zentralen Seitenregister ergänzt.
- Menüposition geändert: Vermögen steht jetzt zwischen Dashboard und Admin.
- Wisch-Navigation auf dieselbe sichtbare Reihenfolge angepasst:
  Charaktere → Kampf → Leben → Effekte → Dashboard → Vermögen → Admin.
- Gesamtvermögen-Ausgabe setzt zur Sicherheit sowohl `value` als auch `textContent`.
- Version v0.42.1.
