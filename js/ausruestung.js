(() => {
  'use strict';
  const page=document.getElementById('ausruestung');
  const btn=document.getElementById('btnAusruestung');
  const root=document.getElementById('ausruestungInhalt');
  if(!page||!btn||!root)return;
  let daten=[],filter='',kategorie='',platz='',auswahl=null,bereit=false,fehler='';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const fmt=v=>v==null||v===''?'–':typeof v==='number'?new Intl.NumberFormat('de-DE').format(v):esc(v);
  const val=v=>v==null||v===''?'Noch nicht erfasst':esc(v);
  const kategorien=()=>[...new Set(daten.map(x=>x.kategorie).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  const plaetze=()=>[...new Set(daten.map(x=>x.ausruestungsplatz).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));
  function render(){
    if(!bereit){root.innerHTML=`<div class="ausr-karte">${fehler?esc(fehler):'Ausrüstungsdaten werden geladen …'}</div>`;return;}
    const hits=daten.filter(x=>(!kategorie||x.kategorie===kategorie)&&(!platz||x.ausruestungsplatz===platz)&&(!filter||norm([x.name,x.name_en,x.kategorie,x.ausruestungsplatz].join(' ')).includes(norm(filter))));
    root.innerHTML=`<div class="ausr-karte"><div class="ausr-filter"><label>Gegenstand suchen<input id="ausrSuche" type="search" placeholder="Deutscher oder englischer Name …" value="${esc(filter)}"></label><label>Kategorie<select id="ausrKategorie"><option value="">Alle Kategorien</option>${kategorien().map(x=>`<option value="${esc(x)}" ${kategorie===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>Ausrüstungsplatz<select id="ausrPlatz"><option value="">Alle Plätze</option>${plaetze().map(x=>`<option value="${esc(x)}" ${platz===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label></div><div class="ausr-status">${hits.length} von ${daten.length} Einträgen · Datenaufbau läuft: Die meisten Detailangaben und englischen Namen sind noch nicht verifiziert.</div><div class="ausr-layout"><div class="ausr-liste" id="ausrListe">${hits.slice(0,250).map(x=>`<button type="button" data-id="${esc(x.id)}" class="ausr-treffer ${auswahl===x.id?'ausr-aktiv':''}"><strong>${esc(x.name)}</strong><small>${esc(x.kategorie)}${x.name_en?' · '+esc(x.name_en):''}</small></button>`).join('')}${hits.length>250?'<p class="ausr-hinweis">Es werden die ersten 250 Treffer angezeigt. Bitte die Suche eingrenzen.</p>':''}${!hits.length?'<p class="ausr-hinweis">Keine passenden Gegenstände.</p>':''}</div><div class="ausr-details" id="ausrDetails"></div></div></div>`;
    const search=root.querySelector('#ausrSuche');
    search.addEventListener('input',e=>{const pos=e.target.selectionStart;filter=e.target.value;render();const n=root.querySelector('#ausrSuche');n.focus();n.setSelectionRange(pos,pos)});
    root.querySelector('#ausrKategorie').addEventListener('change',e=>{kategorie=e.target.value;render()});
    root.querySelector('#ausrPlatz').addEventListener('change',e=>{platz=e.target.value;render()});
    root.querySelector('#ausrListe').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;auswahl=b.dataset.id;root.querySelectorAll('.ausr-treffer').forEach(t=>t.classList.toggle('ausr-aktiv',t.dataset.id===auswahl));details()});
    if(!hits.some(x=>x.id===auswahl))auswahl=hits[0]?.id||null;
    details();
  }
  function details(){
    const el=root.querySelector('#ausrDetails');if(!el)return;
    const x=daten.find(z=>z.id===auswahl);
    if(!x){el.innerHTML='<p>Bitte einen Gegenstand auswählen.</p>';return;}
    const row=(name,v)=>`<div class="ausr-zeile"><span>${name}</span><strong>${v}</strong></div>`;
    el.innerHTML=`<h3>${esc(x.name)}${x.name_en?` <small>(${esc(x.name_en)})</small>`:''}</h3><div class="ausr-daten">${row('Quelle (DE)',esc(x.quelle_de||'–'))}${row('Quelle (EN)',esc(x.quelle_en||'–'))}${row('Buchseite',fmt(x.seite))}${row('Kategorie',esc(x.kategorie))}${row('Wo getragen',esc(x.ausruestungsplatz||'Kein fester Platz'))}${row('Preis (GM)',fmt(x.preis_gm))}${row('ZS',fmt(x.zs))}${row('Aura',fmt(x.aura))}${row('Erschaffungskosten (GM)',fmt(x.erschaffungskosten_gm))}</div><h4>Beschreibung</h4><p class="ausr-text">${val(x.beschreibung)}</p><h4>Erschaffungsvoraussetzungen</h4><p class="ausr-text">${val(x.erschaffungsvoraussetzungen)}</p><p class="ausr-pruefung">${esc(x.pruefstatus||'Nicht geprüft')}</p>`;
  }
  async function load(){try{const r=await fetch('data/ausruestung.json?v=1',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);const j=await r.json();if(!Array.isArray(j.gegenstaende))throw Error('Ungültige Datenstruktur');daten=j.gegenstaende;bereit=true;render()}catch(e){fehler='Ausrüstungsdaten konnten nicht geladen werden: '+e.message;render()}}
  btn.addEventListener('click',()=>{
    zeigeSeite('ausruestung');
    document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(!bereit&&!fehler)load();else render();
  });
})();
