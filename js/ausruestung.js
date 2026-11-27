(() => {
  'use strict';
  // Ausrüstungskompendium, Version 0.61.29 – eigenständig, ohne Eingriff in Charakterdaten.
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

  // Nur Kompendium-Quellen; Seitenzahlen der jeweiligen Ausgabe getrennt halten.
  function quellenText(x) {
    const seite = v => v === null || v === undefined || v === '' ? '' : String(v);
    const de = seite(x.seite), en = seite(x.seite_en);
    return `ARK ${de ? 'S. ' + de : '(Seite offen)'} / Ultimate Equipment ${en ? 'p. ' + en : '(Seite offen)'}`;
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

  function inventarAendern(id, fn) {
    const c = aktiverCharakter();
    if (!c || c.id !== id || !charakterSpeicherBereit) { alert('Kein sicher geladener Charakter ausgewählt.'); return false; }
    const alt = c.ausruestung;
    c.ausruestung = fn(Array.isArray(alt) ? alt : []);
    if (!speichereCharaktere()) { c.ausruestung = alt; alert('Änderung konnte nicht sicher gespeichert werden.'); return false; }
    inventarRendern();
    return true;
  }
  function aktion(label, fn) {
    const b = text('button', label, 'ausr-inv-aktion'); b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  const koerperplaetze = ['Kopf','Stirn','Augen','Hals','Schultern','Brust','Körper','Rüstung','Handgelenke','Hände','Gürtel','Füße','Ring links','Ring rechts','Haupthand','Nebenhand'];
  function platzOptionen(x) {
    const k = x.kategorie || '', p = x.ausruestungsplatz || '';
    if (k === 'Ring' || p === 'Ring') return [['Ring links'],['Ring rechts']];
    if (/^(Gewöhnlicher|Magischer) Schild$/.test(k) || p === 'Nebenhand') return [['Nebenhand']];
    if (/^(Gewöhnliche|Magische) Rüstung$/.test(k) || p === 'Rüstung') return [['Rüstung']];
    if (/^(Gewöhnliche|Magische) Waffe$/.test(k) || p === 'Waffenhand') {
      if (/pfeil|bolzen|munition/i.test(x.name) && !/bogen|armbrust/i.test(x.name)) return [];
      if (/zweihand/i.test(x.waffenwerte?.Art || '') || /armbrust|bogen/i.test(x.name)) return [['Haupthand','Nebenhand']];
      return [['Haupthand'],['Nebenhand'],['Haupthand','Nebenhand']];
    }
    if (koerperplaetze.includes(p)) return [[p]];
    if (p === 'Keiner' && k === 'Wundersamer Gegenstand') return [[]];
    return [];
  }
  function anlegen(c,e) {
    const optionen = platzOptionen(e.gegenstand);
    if (!optionen.length) return;
    const d = dialog(), el = d.querySelector('#ausruestungPergamentText625');
    el.replaceChildren(text('h2',e.gegenstand.name),text('p','Ausrüstungsplatz auswählen:'));
    for (const plaetze of optionen) el.append(aktion(plaetze.join(' + ') || 'Platzlos anlegen',()=>{
      const aktuell = aktiverCharakter(); if (!aktuell || aktuell.id !== c.id) return;
      const konflikt = (aktuell.ausruestung || []).filter(v=>v.id!==e.id && v.angelegt && (v.belegtePlaetze || []).some(p=>plaetze.includes(p)));
      if (konflikt.length && !confirm('Ablegen: '+konflikt.map(v=>v.gegenstand.name).join(', ')+'?')) return;
      if (inventarAendern(c.id,l=>l.map(v=>v.id===e.id?{...v,angelegt:true,belegtePlaetze:plaetze}:konflikt.some(k=>k.id===v.id)?{...v,angelegt:false,belegtePlaetze:[]}:v))) d.close();
    }));
    if (!d.open) d.showModal();
  }
  function inventarRendern() {
    const box = root.querySelector('#ausrInventar630'); if (!box) return;
    const offen = new Map([...box.querySelectorAll('.ausr-inv-gruppe')].map(g=>[g.dataset.kategorie,g.open]));
    box.replaceChildren();
    const c = aktiverCharakter();
    if (!c || !charakterSpeicherBereit) { box.append(text('p','Kein sicher geladener Charakter.')); return; }
    box.append(text('p', c.name, 'ausr-inv-name'));
    const liste = Array.isArray(c.ausruestung) ? c.ausruestung : [];
    const belegt = document.createElement('details'); belegt.className='ausr-inv-gruppe'; belegt.dataset.kategorie='__belegt'; belegt.open=offen.get('__belegt') ?? false; belegt.append(text('summary','Angelegte Ausrüstung'));
    for (const p of koerperplaetze) { const e=liste.find(v=>v.angelegt && (v.belegtePlaetze||[]).includes(p)); belegt.append(text('div',p+': '+(e?.gegenstand?.name || '–'),'ausr-slot')); }
    for (const e of liste.filter(v=>v.angelegt && !(v.belegtePlaetze||[]).length)) belegt.append(text('div','Platzlos: '+e.gegenstand.name,'ausr-slot'));
    box.append(belegt);
    const gruppen = new Map();
    for (const e of liste) {
      if (!e || !e.gegenstand) continue;
      const k = e.gegenstand.kategorie || 'Sonstiges';
      if (!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(e);
    }
    if (!gruppen.size) box.append(text('p','Noch keine Ausrüstung. Gegenstand im Kompendium suchen und hinzufügen.'));
    for (const [k, eintraege] of [...gruppen].sort((a,b)=>a[0].localeCompare(b[0],'de'))) {
      const gruppe = document.createElement('details'); gruppe.open = offen.get(k) ?? true; gruppe.dataset.kategorie=k; gruppe.className = 'ausr-inv-gruppe';
      gruppe.append(text('summary', `${k} (${eintraege.length})`));
      for (const e of eintraege.sort((a,b)=>String(a.gegenstand.name).localeCompare(String(b.gegenstand.name),'de'))) {
        const zeile = document.createElement('div'); zeile.className = 'ausr-inv-zeile';
        zeile.append(aktion(e.gegenstand.name, ()=>zeigeGegenstand(e.gegenstand, false)));
        const controls = document.createElement('div'); controls.className = 'ausr-inv-controls';
        const menge = document.createElement('input'); menge.type='number'; menge.min='1'; menge.max='999999'; menge.step='1'; menge.value=e.anzahl; menge.setAttribute('aria-label',`Anzahl ${e.gegenstand.name}`);
        menge.addEventListener('change',()=>{ const n=Number(menge.value); if(!Number.isInteger(n)||n<1||n>999999){menge.value=e.anzahl;return;} if(!inventarAendern(c.id,l=>l.map(v=>v.id===e.id?{...v,anzahl:n}:v))) menge.value=e.anzahl; });
        controls.append(menge);
        if (e.angelegt || platzOptionen(e.gegenstand).length) {
          const tragen = aktion(e.angelegt?'✓':'○',()=>e.angelegt?inventarAendern(c.id,l=>l.map(v=>v.id===e.id?{...v,angelegt:false,belegtePlaetze:[]}:v)):anlegen(c,e));
          tragen.classList.add('ausr-tragen'); tragen.setAttribute('aria-label',e.angelegt?'Ablegen':'Anlegen'); tragen.title=e.angelegt?'Ablegen':'Anlegen'; tragen.setAttribute('aria-pressed',String(!!e.angelegt)); controls.append(tragen);
        }
        const entfernen=aktion('✕',()=>{if(confirm(`${e.gegenstand.name} aus der Ausrüstung entfernen?`)) inventarAendern(c.id,l=>l.filter(v=>v.id!==e.id));}); entfernen.setAttribute('aria-label','Entfernen'); entfernen.title='Entfernen'; controls.append(entfernen);
        zeile.append(controls); gruppe.append(zeile);
      }
      box.append(gruppe);
    }
  }
  function zeigeGegenstand(x, hinzufuegen = true) {
    const d = dialog();
    const el = d.querySelector('#ausruestungPergamentText625');
    el.replaceChildren();
    el.append(text('h2', x.name));
    if (x.name_en) el.append(text('p', x.name_en, 'zauber-pergament-englisch-600'));
    const dl = document.createElement('dl');
    const felder = [
      ['Quelle', quellenText(x)],
      ['Kategorie', x.kategorie],
      ['Platz', x.ausruestungsplatz || 'Kein fester Platz'],
      ['Preis', x.preis_original || (x.preis_gm === null || x.preis_gm === undefined || x.preis_gm === '' ? '–' : `${format(x.preis_gm)} GM`)],
      ['Gewicht', x.gewicht],
      ['ZS', x.zs],
      ['Aura', x.aura],
      ['Erschaf. Kosten', x.erschaffungskosten_gm === null || x.erschaffungskosten_gm === undefined || x.erschaffungskosten_gm === '' ? '–' : `${format(x.erschaffungskosten_gm)} GM`]
    ];
    for (const [label, wert] of felder) {
      dl.append(text('dt', label), text('dd', format(wert)));
    }
    if (x.waffenwerte || x.ruestungswerte) {
      for (const [label, wert] of Object.entries(x.waffenwerte || x.ruestungswerte)) {
        dl.append(text('dt', label), text('dd', format(wert)));
      }
    }
    if (x.erschaffungsvoraussetzungen || (x.id && x.id.startsWith('ak-'))) {
      dl.append(text('dt', 'Erschaf. Voraus.'), text('dd', x.erschaffungsvoraussetzungen || 'Noch nicht erfasst.'));
    }
    el.append(dl);
    if (hinzufuegen) {
      const c = aktiverCharakter();
      const b = aktion('Zur Ausrüstung hinzufügen', () => {
        if (!c) return;
        const ok = inventarAendern(c.id, liste => [...liste, {
          id: globalThis.crypto?.randomUUID?.() || neueCharakterId(),
          grundId:x.id, gegenstand:JSON.parse(JSON.stringify(x)), anzahl:1,
          angelegt:false, belegtePlaetze:[], angriffe:[], material:null,
          qualitaet:null, verbesserungsbonus:0, eigenschaften:[], boni:[]
        }]);
        if (ok) d.close();
      });
      b.disabled = !c || !charakterSpeicherBereit;
      el.append(b);
    }
    el.append(text('h3', 'Beschreibung'));
    el.append(text('p', x.beschreibung || 'Noch nicht erfasst.', 'zauber-pergament-beschreibung-600'));
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
      else if (x.kategorie) b.append(text('small', x.kategorie));
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
            <summary>Filter: Kategorie und Platz</summary>
            <div class="ausr-filterfelder">
              <label>Kategorie<select id="ausrKategorie625" aria-label="Gegenstandskategorie"></select></label>
              <label>Platz<select id="ausrPlatz625" aria-label="Ausrüstungsplatz"></select></label>
            </div>
          </details>
          <div class="zauber-lexikon-treffer-600 ausr-trefferliste" id="ausrTreffer625"></div>
          <p class="ausr-datenhinweis">Datenaufbau läuft: Viele englische Namen, Preise und Beschreibungen sind noch nicht überprüft.</p>
        </div>
      </details>
      <details class="ausr-lexikon" open><summary>Meine Ausrüstung</summary><div class="ausr-inhalt" id="ausrInventar630"></div></details>`;
    inventarRendern();
    const k = root.querySelector('#ausrKategorie625');
    const a = root.querySelector('#ausrPlatz625');
    filterOptionen(k, gegenstaende.map(x=>x.kategorie), 'Alle Kategorien', kategorie);
    filterOptionen(a, gegenstaende.map(x=>x.ausruestungsplatz), 'Alle Plätze', platz);
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
        const antwort = await fetch('data/ausruestung.json?v=61.29');
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
    else inventarRendern();
  });
  document.addEventListener('pf-charakter-importiert', inventarRendern);
  // Auch globale Charakterwechsel berücksichtigen, ohne die Suchansicht neu aufzubauen.
  const vorher = window.aktualisiereAlleAnsichten;
  window.aktualisiereAlleAnsichten = function(...args) {
    const result = vorher.apply(this,args); inventarRendern(); return result;
  };
})();
