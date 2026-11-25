(() => {
  'use strict';
  // Ausrüstungskompendium, Version 0.61.25 – eigenständig, ohne Eingriff in Charakterdaten.
  const btn = document.getElementById('btnAusruestung');
  const root = document.getElementById('ausruestungInhalt');
  if (!btn || !root) return;

  let gegenstaende = [];
  let ladeversuch = null;
  let suchtext = '';
  let kategorie = '';
  let platz = '';
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de');
  const format = value => (value === null || value === undefined || value === '') ? '–' :
    typeof value === 'number' ? new Intl.NumberFormat('de-DE').format(value) : String(value);

  // Keine erfundenen englischen Seitenzahlen: die deutschen Buchseiten gehören zur ARK-Ausgabe.
  const kuerzelDE = [
    [/^ausr[uü]stungskompendium/i, 'ARK'],
    [/^grundregelwerk/i, 'GRW'],
    [/^expertenregeln/i, 'EXP'],
    [/^ausbauregeln/i, 'ABR']
  ];
  const kuerzelEN = [
    [/^ultimate equipment/i, 'UE'],
    [/^core rulebook/i, 'CRB'],
    [/^advanced player.s guide/i, 'APG'],
    [/^ultimate magic/i, 'UM']
  ];
  function quellenTeile(roherWert, muster) {
    return String(roherWert ?? '').split(/\s*\/\s*/).map(value => {
      const original = value.trim();
      if (!original) return '';
      for (const [regex, kuerzel] of muster) if (regex.test(original)) return kuerzel;
      return original;
    }).filter(Boolean);
  }
  function quellenText(x) {
    const deutsch = [...new Set(quellenTeile(x.quelle_de, kuerzelDE))];
    const englisch = [...new Set(quellenTeile(x.quelle_en, kuerzelEN))];
    if (deutsch.length === 1 && x.seite !== null && x.seite !== undefined && x.seite !== '') {
      deutsch[0] += ` S. ${x.seite}`;
    }
    if (englisch.length === 1 && x.seite_en !== null && x.seite_en !== undefined && x.seite_en !== '') {
      englisch[0] += ` p. ${x.seite_en}`;
    }
    return [deutsch.join(', '), englisch.join(', ')].filter(Boolean).join(' / ') || '–';
  }

  function text(tag, content, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    e.textContent = String(content ?? '');
    return e;
  }

  // Exakt die Pergament-Dialogklasse des vorhandenen Zauberlexikons wiederverwenden.
  function dialog() {
    let d = document.getElementById('ausruestungPergament625');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'ausruestungPergament625';
    d.className = 'zauber-pergament-600 ausr-pergament';
    const inhalt = document.createElement('div');
    inhalt.className = 'zauber-pergament-inhalt-600';
    const schliessen = text('button', '✕', 'zauber-pergament-schliessen-600');
    schliessen.type = 'button';
    schliessen.setAttribute('aria-label', 'Gegenstandbeschreibung schließen');
    schliessen.addEventListener('click', () => d.close());
    inhalt.append(schliessen);
    const beschreibung = document.createElement('div');
    beschreibung.id = 'ausruestungPergamentText625';
    inhalt.append(beschreibung);
    d.append(inhalt);
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    document.body.append(d);
    return d;
  }

  function zeigeGegenstand(x) {
    const d = dialog();
    const el = d.querySelector('#ausruestungPergamentText625');
    el.replaceChildren();
    el.append(text('h2', x.name));
    if (x.name_en) el.append(text('p', x.name_en, 'zauber-pergament-englisch-600'));
    const dl = document.createElement('dl');
    const felder = [
      ['Quelle', quellenText(x)],
      ['Kategorie', x.kategorie],
      ['Ausrüstungsplatz', x.ausruestungsplatz || 'Kein fester Platz'],
      ['Preis', x.preis_gm === null || x.preis_gm === undefined || x.preis_gm === '' ? '–' : `${format(x.preis_gm)} GM`],
      ['ZS', x.zs],
      ['Aura', x.aura],
      ['Erschaffungskosten', x.erschaffungskosten_gm === null || x.erschaffungskosten_gm === undefined || x.erschaffungskosten_gm === '' ? '–' : `${format(x.erschaffungskosten_gm)} GM`]
    ];
    for (const [label, wert] of felder) {
      dl.append(text('dt', label), text('dd', format(wert)));
    }
    el.append(dl);
    el.append(text('h3', 'Beschreibung'));
    el.append(text('p', x.beschreibung || 'Noch nicht erfasst.', 'zauber-pergament-beschreibung-600'));
    el.append(text('h3', 'Erschaffungsvoraussetzungen'));
    el.append(text('p', x.erschaffungsvoraussetzungen || 'Noch nicht erfasst.', 'zauber-pergament-beschreibung-600'));
    if (x.pruefstatus) el.append(text('p', x.pruefstatus, 'ausr-pruefung'));
    if (!d.open) d.showModal();
  }

  function filterOptionen(select, werte, titel, aktuell) {
    select.replaceChildren();
    const alle = document.createElement('option');
    alle.value = '';
    alle.textContent = titel;
    select.append(alle);
    for (const wert of [...new Set(werte.filter(Boolean))].sort((a,b) => a.localeCompare(b,'de'))) {
      const o = document.createElement('option');
      o.value = wert;
      o.textContent = wert;
      select.append(o);
    }
    select.value = aktuell;
  }

  function trefferAktualisieren() {
    const treffer = root.querySelector('#ausrTreffer625');
    const anzahl = root.querySelector('#ausrAnzahl625');
    if (!treffer || !anzahl) return;
    treffer.replaceChildren();
    const suche = norm(suchtext.trim());
    // Genau wie beim Zauberlexikon: keine Gegenstandsliste, bevor gesucht wird.
    if (!suche) {
      anzahl.textContent = `${gegenstaende.length} Gegenstände verfügbar`;
      treffer.append(text('p', 'Zum Nachschlagen einen deutschen oder englischen Gegenstandsnamen eingeben.', 'ausr-hinweis'));
      return;
    }
    const gefunden = gegenstaende.filter(x =>
      (!kategorie || x.kategorie === kategorie) &&
      (!platz || x.ausruestungsplatz === platz) &&
      norm(`${x.name || ''} ${x.name_en || ''}`).includes(suche)
    ).sort((a,b) => String(a.name || '').localeCompare(String(b.name || ''), 'de'));
    anzahl.textContent = `${gefunden.length} Treffer`;
    if (!gefunden.length) {
      treffer.append(text('p', 'Keine passenden Gegenstände gefunden.', 'ausr-hinweis'));
      return;
    }
    for (const x of gefunden.slice(0, 100)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'zauber-lexikon-trefferknopf-600 ausr-treffer';
      b.append(text('strong', x.name));
      if (x.name_en) b.append(text('small', x.name_en));
      b.addEventListener('click', () => zeigeGegenstand(x));
      treffer.append(b);
    }
    if (gefunden.length > 100) treffer.append(text('p', 'Es werden die ersten 100 Treffer angezeigt. Bitte die Suche verfeinern.', 'ausr-hinweis'));
  }

  function oberflaeche() {
    root.innerHTML = `
      <details class="zauber-lexikon-600 ausr-lexikon" id="ausrLexikon625">
        <summary><img src="assets/runes/Ausruestungskompendium.png" alt="" aria-hidden="true" class="zauber-lexikon-rune-612 ausr-titelrune"><span>Ausrüstungskompendium</span></summary>
        <div class="zauber-lexikon-inhalt-602 ausr-inhalt">
          <p class="ausr-hinweis">Alle Gegenstände nach deutschem oder englischem Namen durchsuchen.</p>
          <div class="zauber-lexikon-suche-600 ausr-suche">
            <input type="search" id="ausrSuche625" autocomplete="off" placeholder="Deutscher oder englischer Gegenstandsname …" aria-label="Ausrüstungskompendium durchsuchen">
            <span id="ausrAnzahl625" aria-live="polite"></span>
          </div>
          <details class="ausr-filterklappe" id="ausrFilter625">
            <summary>Filter: Kategorie und Ausrüstungsplatz</summary>
            <div class="ausr-filterfelder">
              <label>Kategorie<select id="ausrKategorie625" aria-label="Gegenstandskategorie"></select></label>
              <label>Ausrüstungsplatz<select id="ausrPlatz625" aria-label="Ausrüstungsplatz"></select></label>
            </div>
          </details>
          <div class="zauber-lexikon-treffer-600 ausr-trefferliste" id="ausrTreffer625"></div>
          <p class="ausr-datenhinweis">Datenaufbau läuft: Viele englische Namen, Preise und Beschreibungen sind noch nicht überprüft.</p>
        </div>
      </details>`;
    const k = root.querySelector('#ausrKategorie625');
    const a = root.querySelector('#ausrPlatz625');
    filterOptionen(k, gegenstaende.map(x=>x.kategorie), 'Alle Kategorien', kategorie);
    filterOptionen(a, gegenstaende.map(x=>x.ausruestungsplatz), 'Alle Ausrüstungsplätze', platz);
    root.querySelector('#ausrSuche625').value = suchtext;
    root.querySelector('#ausrSuche625').addEventListener('input', e => { suchtext = e.target.value; trefferAktualisieren(); });
    k.addEventListener('change', e => { kategorie = e.target.value; trefferAktualisieren(); });
    a.addEventListener('change', e => { platz = e.target.value; trefferAktualisieren(); });
    trefferAktualisieren();
  }

  async function laden() {
    if (ladeversuch) return ladeversuch;
    root.innerHTML = '<p class="ausr-hinweis">Ausrüstungsdaten werden geladen …</p>';
    ladeversuch = (async () => {
      try {
        const antwort = await fetch('data/ausruestung.json?v=1');
        if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
        const daten = await antwort.json();
        if (!Array.isArray(daten.gegenstaende)) throw new Error('Ungültiges Datenformat');
        gegenstaende = daten.gegenstaende;
        oberflaeche();
      } catch (fehler) {
        root.replaceChildren(text('p', `Ausrüstungsdaten konnten nicht geladen werden: ${fehler.message}`, 'ausr-hinweis'));
        ladeversuch = null;
      }
    })();
    return ladeversuch;
  }

  btn.addEventListener('click', () => {
    zeigeSeite('ausruestung');
    document.querySelectorAll('nav button').forEach(element => element.classList.remove('active'));
    btn.classList.add('active');
    if (!ladeversuch) void laden();
  });
})();
