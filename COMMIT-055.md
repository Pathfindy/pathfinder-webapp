# Commit 55 – Zauber

Version 0.55.0 startet die neue Zauberseite.

- neue Seite „Zauber“ in Navigation und Wischreihenfolge
- Zauberwirker werden aus den Klassen des aktiven Charakters erkannt
- pro Zauberklasse: frei wählbares Zauberattribut, vorbereitet/spontan und Zauberstufe (ZS)
- Anzeige von Konzentrationsbonus, defensivem Zaubern und Wurf zum Überwinden von Zauberresistenz
- Zauber-SG für Grad 0–9 aus Zauberattribut und Grad
- Datenbank aus „Bogen Spieler 6.300“, Blatt „ZauberListen“: 1.926 eindeutige Zaubereinträge; Klassen-/Gradzuordnungen werden getrennt gespeichert
- Suche und Filter nach Zaubergrad
- Zauberdetails aus der Excel: Quelle, Schule, Kurzbeschreibung, Reichweite, Dauer und Rettungswurf soweit im Quelldatensatz codiert
- stufenabhängige Reichweiten werden mit der ZS des aktiven Zauberwirkers berechnet
- Reichweitenanzeige wählbar in Meter, Felder oder Feet (1 Feld = 1,5 m; 1 ft = 0,3 m), analog zur Kampfseite

Noch nicht Bestandteil dieser ersten Version: Zauberslot-Verbrauch, vorbereitete/bekannte Zauber pro Charakter, Metamagie sowie weitere Klassenressourcen wie Energie fokussieren, Kampfrausch oder Bardenauftritt.


## v0.55.1

- Navigation: „Zauber“ steht nun zwischen „Effekte“ und „Zeit“, inklusive Wischreihenfolge.
- Die separate oberste Zeile „Zauberklasse“ wurde entfernt.
- Die aktive Zauberklasse wird direkt in „Zauberwirker-Einstellungen“ per Klick auf die Klasse gewählt; die aktive Klasse ist dunkelblau/weiß markiert.
- Zaubergrade 0–9 lassen sich pro Charakter und Zauberklasse über die SG-Felder aktivieren/deaktivieren. Aktivierte Grade sind dunkelblau mit weißer Schrift.
- Grade ohne Zauber in der importierten Datenbank sind deaktiviert.
- Nur aktivierte Grade erscheinen darunter. Jeder Grad ist als einklappbares Banner umgesetzt; die Zauberliste wird erst beim Aufklappen sichtbar.
- Die Suchfunktion filtert innerhalb der aktivierten Grade.

## v0.55.2
- Hotfix: `data/zauber.json` wieder in den Teststand aufgenommen. Ohne diese Datei war die Zauberdatenbank leer; dadurch wurden alle Grad-Schaltflächen als nicht verfügbar deaktiviert.
- Grad 0–9 kann nun angeklickt und pro Charakter/Zauberklasse aktiviert bzw. deaktiviert werden, sofern der Grad in der Zauberdatenbank für die Klasse vorhanden ist.


## v0.55.3
- Aktivierbare Zaubergrade werden nun zusätzlich durch das aktuelle Bezugsattribut begrenzt: Zum Wirken eines Zaubers ist mindestens ein Attributswert von `10 + Zaubergrad` erforderlich. Beispiel: IN 12 erlaubt maximal Grad 2. Höhere Grade bleiben deaktiviert und bereits gespeicherte höhere Grade werden nicht angezeigt, solange das Attribut zu niedrig ist.
- Die Begrenzung verwendet den aktuellen Attributswert inklusive der bereits von der App berechneten Attributsänderungen.
- „ZR überwinden“ zeigt den vollständigen Wurf als `W20 + ZS` (zuzüglich eines ggf. hinterlegten ZR-Bonus) statt nur den Bonuswert.


## v0.55.3
- Zaubergrade sind nur noch bis zum durch das aktuelle Bezugsattribut erlaubten Grad aktivierbar (Mindestwert 10 + Zaubergrad).
- „ZR überwinden“ zeigt den vollständigen Wurf `W20 + Zauberstufe`; „Konzentration“ zeigt `W20 + Zauberstufe + Attributsmodifikator`.
- Quellen aus „Folianten: Zauber“ wurden ausschließlich vorhandenen Excel-/App-Zaubern zugeordnet. Die App-Datenbank wurde nicht um PDF-Zauber erweitert.
- Spontane Zauberwirker können pro Grad gelernte/verfügbare Zauber markieren und auf diese filtern.
- Vorbereitende Zauberwirker können Zauber vorbereiten, mehrfach vorbereiten und auf vorbereitete Zauber filtern.
- Pro aktivem Grad gibt es ein Eingabefeld für Zauber pro Tag/Slots und eine Anzeige der noch freien/verfügbaren Anzahl.


## v0.55.4
- Zaubersuche mit Löschbutton analog zur Effektseite.
- Geöffnete Zaubergrad-Banner bleiben beim Lernen/Vorbereiten/Filtern geöffnet.
- Zauberdatenbank auf Einträge mit zugeordnetem Regelwerk und Seitenzahl reduziert (nur 1.168 belegte PDF-Zuordnungen bleiben).
- ZS folgt Änderungen der Klassenstufe automatisch, solange der Nutzer die ZS nicht bewusst manuell abweichend eingestellt hat.
- Spontane Zauberwirker erhalten anklickbare Tages-Slot-Kästchen zum Verbrauchen/Wiederherstellen.
- Anzeige „Max. Zaubergrad“ entfernt.
- Benutzer können eigene Zauber anlegen/bearbeiten; Standardzauber können im entsperrten Admin-Modus bearbeitet werden. Änderungen bleiben lokal gespeichert.
- Berührungsangriff Nah (GAB + ST-Mod) und Fern (GAB + GE-Mod) ergänzen die Zauberwerte.


## v0.55.5
- Seite Zeit: Initiative auf Mobilgeräten korrigiert; Initiativwert und Teilnehmername liegen in getrennten Grid-Spalten und überlagern sich nicht mehr.
- Zaubereinträge zeigen den Zaubergrad nicht nochmals im einzelnen Eintrag; der Grad ergibt sich aus dem übergeordneten Grad-Banner.
- Die Schule wird im kompakten Zaubereintrag nicht mehr angezeigt.
- Quellen werden als Kürzel dargestellt: GRW, EXP, ABR und ABR II, jeweils mit Seitenzahl.
- Eindeutig berechenbare Wirkungsdauern werden zusätzlich anhand der aktuellen ZS in Kampfrunden ausgegeben. Sonderdauern bleiben unverändert.
- Bei vorhandenen Rettungswürfen wird der aktuelle Zauber-SG in Klammern ergänzt.
- Metamagie ist für einen folgenden Teil von Commit 55 vorgesehen; in v0.55.5 wird noch keine Slotgrad-/Metamagie-Logik eingeführt.


## v0.55.6
- Grad-Schaltflächen zeigen nur noch „Grad X“; der SG wird dort nicht mehr wiederholt.
- Der separate SG direkt hinter dem Zaubernamen wurde entfernt.
- Reichweite, Dauer und Rettungswurf werden im Zauberbanner gleichartig dargestellt; die jeweiligen Werte sind hervorgehoben.
- Berechnete Wirkungsdauern werden passend skaliert: bis 10 Runden als Runden, darüber bis unter 60 Minuten als Minuten, ab 60 Minuten als Stunden. Die originale Dauerangabe bleibt zusätzlich sichtbar.


## v0.55.7
- Daueranzeige korrigiert: Berechenbare Zauberdauern unterhalb der Kategorie „1 Stunde/Stufe“ werden konsequent in Runden ausgegeben.
- Dauern ab „1 Stunde/Stufe“ werden anhand der aktuellen ZS in Stunden ausgegeben. Damit bleibt z. B. „1 Min./Stufe“ auch bei hoher ZS eine Rundenanzeige.
- v0.55.7 baut auf dem lokalen v0.55.6-Teststand auf; v0.55.6 musste dafür nicht zuvor im Repository vorhanden sein.


## v0.55.8
- Metamagie-Grundsystem auf der Zauberseite ergänzt.
- Umfang bewusst auf Metamagietalente aus GRW, EXP und ABR beschränkt.
- Erlernte Metamagietalente werden charakterweit markiert; nur erlernte Talente stehen anschließend am einzelnen Zauber zur Auswahl.
- Die konkrete Anwendung bleibt vom Besitz des Talents getrennt. Der Grundzauber in der Datenbank wird nicht verändert.
- Slotgraderhöhung wird je gewählter Metamagie angezeigt und addiert. „Zaubergrad erhöhen“ wird als Sonderfall mit Erhöhung des effektiven Zaubergrads und damit des SG behandelt.
- „Zauber ausdehnen“ verdoppelt automatisch die berechnete Dauer; „Zauberreichweite erhöhen“ verdoppelt automatisch berechenbare Reichweiten.
- Weitere Metamagien aus GRW/EXP/ABR werden zunächst mit Slotänderung und Regelhinweis eingebunden, wenn ihre Wirkung nicht zuverlässig aus den vorhandenen Zauberdaten automatisiert werden kann.
- Architektur vorbereitet für den nächsten Schritt: vorbereitete Zauberkopien bzw. spontane Wirkungen können später ihre konkrete Metamagie-Konfiguration getrennt speichern und an Effekte/Zeit übergeben.

## v0.55.9
- Metamagie-Talente als ausklappbarer Bereich; beim Aktivieren bleibt der Bereich geöffnet.
- Hinweis unter Zauberwirker-Einstellungen entfernt; Metamagie-Hinweis auf GRW, EXP und ABR begrenzt.
- Quelle in Zaubereinträgen wie Reichweite/Dauer hervorgehoben.
- Zaubereinträge um Zeitaufwand, Komponenten und defensives Zaubern (Konzentrationswurf gegen SG 15 + 2 × effektiver Zaubergrad) erweitert.
- ZR wird pro Zauber als Ja/Nein geführt; bei Ja wird der ZR-Wurf W20 + ZS (+ Bonus) angezeigt. Fehlende ZR-Daten werden nicht geraten.
- Reichweite zeigt zusätzlich die Kategorie Persönlich, Berührung, Nah, Mittel, Weit, Unbegrenzt oder Fest/Sonder.
- Bestehende Zeitaufwand- und Komponenten-Codes werden für die Anzeige lesbar aufbereitet.


## v0.55.10
- Zauberklassen-Einstellungen ohne separate Überschrift; jede Klasse ist ausklappbar und bleibt beim Bearbeiten geöffnet.
- Automatische Zaubergrad-Freischaltung nach Klassenstufe und PF1-Zauberprogression; Attributsgrenze bleibt zusätzlich wirksam. Automatik kann für manuelle Gradwahl abgeschaltet werden.
- Metamagie wird nur angeboten, wenn der benötigte Slotgrad für den Charakter grundsätzlich verfügbar ist.
- Vorbereitende Zauberwirker speichern konkrete Vorbereitungsinstanzen mit Metamagie und Ziel-Slotgrad; der höhere Slot wird automatisch belegt. Normale und metamagische Varianten desselben Zaubers können parallel vorbereitet werden.
- Bestehende Vorbereitungen aus älteren Versionen werden als normale Vorbereitungsinstanzen migriert.
- Spontane Zauberwirker erhalten weiterhin nur die Anzeige des benötigten Slotgrades; der tatsächliche Slotverbrauch bleibt bewusst manuell.
- Zauberklassen-Konfiguration, gelernte Zauber, Slots, Vorbereitungen und Metamagie liegen am Charakterobjekt und sind damit Bestandteil des bestehenden vollständigen Charakterexports/-imports.
- ZR-Anzeige pro Zauber bleibt Ja/Nein; bei Ja wird W20 + aktuelle ZS (+ ZR-Bonus) angezeigt.

## v0.55.11 – Zauberresistenz-Daten
- Zauberdatenbestand auf 1.168 vorhandene App-Zauber konsolidiert (`anzahl` korrigiert).
- Feld `zauberresistenz` für alle Zauber ergänzt.
- Anzeige unterscheidet `Ja · W20 + ZS`, `Nein` und regelabhängige Sonderfälle `siehe Text`.
- Keine neuen Zauber aufgenommen.
- ZR ist ein eigenes Zaubermerkmal und wird nicht aus dem Rettungswurf abgeleitet.


## v0.55.12 – Zauber-UI: Auswahl, Aufklappen und Sticky Gradbanner
- Zauberklasse wählen und Klasseneinstellungen auf-/zuklappen sind getrennte Aktionen.
- Aktive Zauberklasse wird dunkelblau mit weißer Schrift markiert.
- Mobil zeigt der Klassenbutton nur die Klassenbezeichnung; die Stufe entfällt dort zugunsten von Platz.
- Eigener Pfeilbutton öffnet/schließt die Klasseneinstellungen; Klick auf den Klassenbereich klappt nichts mehr auf oder zu.
- Metamagie verwendet denselben getrennten Pfeilmechanismus.
- Kopfzeile eines geöffneten Zaubergrads bleibt beim Scrollen sticky sichtbar.


## v0.55.13 – Hotfix Sticky-Gradbanner
- Geöffnete Zaubergrad-Container verwenden kein `overflow:hidden` mehr, damit `position: sticky` relativ zum Viewport wirken kann.
- Das Gradbanner berücksichtigt den vorhandenen Sticky-Seitenkopf über `--pf-kopf-sticky-hoehe`.
- Erhöhter z-index und eigener Hintergrund verhindern, dass Zauber beim Scrollen über dem Banner liegen.
