// Commit 55.13: Zauberseite – Hotfix Sticky-Gradbanner
(() => {
  "use strict";
  const page=document.getElementById("zauber"), btn=document.getElementById("btnZauber"), root=document.getElementById("zauberInhalt55");
  if(!page||!btn||!root) return;

  const EINHEIT_KEY="pf-reichweiten-einheit";
  const BENUTZER_KEY="pf-benutzer-zauber";
  const ADMIN_AENDERUNGEN_KEY="pf-admin-zauber-aenderungen";
  const ADMIN_NEU_KEY="pf-admin-zauber-neu";
  const METAMAGIE_KEY="pf-metamagie-erlernt";
  const METAMAGIE_ANWENDUNG_KEY="pf-metamagie-anwendung";
  const ZAUBERKLASSEN=new Set(["Alchemist","Antipaladin","Arkanist","Barde","Blutwüter","Druide","Ermittler","Hexe","Hexenmeister","Inquisitor","Jäger","Kampfmagus","Kleriker","Kriegspriester","Magier","Mystiker","Paladin","Paktmagier","Schamane","Skalde","Waldläufer"]);
  const STANDARD={Alchemist:["IN","vorbereitet"],Antipaladin:["CH","vorbereitet"],Arkanist:["IN","vorbereitet"],Barde:["CH","spontan"],Blutwüter:["CH","spontan"],Druide:["WE","vorbereitet"],Ermittler:["IN","vorbereitet"],Hexe:["IN","vorbereitet"],Hexenmeister:["CH","spontan"],Inquisitor:["WE","spontan"],Jäger:["WE","spontan"],Kampfmagus:["IN","vorbereitet"],Kleriker:["WE","vorbereitet"],Kriegspriester:["WE","vorbereitet"],Magier:["IN","vorbereitet"],Mystiker:["CH","spontan"],Paladin:["CH","vorbereitet"],Paktmagier:["CH","spontan"],Schamane:["WE","vorbereitet"],Skalde:["CH","spontan"],Waldläufer:["WE","vorbereitet"]};
  // Klassenstufe, auf der der jeweilige Zaubergrad erstmals verfügbar wird.
  const GRAD_START={
    voll:{0:1,1:1,2:3,3:5,4:7,5:9,6:11,7:13,8:15,9:17},
    spontan9:{0:1,1:1,2:4,3:6,4:8,5:10,6:12,7:14,8:16,9:18},
    sechs:{0:1,1:1,2:4,3:7,4:10,5:13,6:16},
    vier:{1:4,2:7,3:10,4:13}
  };
  const KLASSEN_PROGRESSION={Alchemist:"sechs",Antipaladin:"vier",Arkanist:"voll",Barde:"sechs",Blutwüter:"vier",Druide:"voll",Ermittler:"sechs",Hexe:"voll",Hexenmeister:"spontan9",Inquisitor:"sechs",Jäger:"sechs",Kampfmagus:"sechs",Kleriker:"voll",Kriegspriester:"sechs",Magier:"voll",Mystiker:"spontan9",Paladin:"vier",Paktmagier:"sechs",Schamane:"voll",Skalde:"sechs",Waldläufer:"vier"};

  let basisDaten=null,daten={zauber:[]},klasseAktiv="",suche="",offeneGrade=new Set(),editorId=null,editorStandard=false,metamagieOffen=false,offeneKlassen=new Set();

  const METAMAGIE=[
    {id:"ausdehnen",name:"Zauber ausdehnen",quelle:"GRW",slot:1,typ:"dauer",faktor:2,hinweis:"Verdoppelt die Wirkungsdauer."},
    {id:"gestenlos",name:"Gestenlos zaubern",quelle:"GRW",slot:1,typ:"komponenten",hinweis:"Somatische Komponente entfällt."},
    {id:"lautlos",name:"Lautlos zaubern",quelle:"GRW",slot:1,typ:"komponenten",hinweis:"Verbale Komponente entfällt."},
    {id:"reichweite",name:"Zauberreichweite erhöhen",quelle:"GRW",slot:1,typ:"reichweite",faktor:2,hinweis:"Verdoppelt berechenbare Reichweiten."},
    {id:"verstarken",name:"Zauber verstärken",quelle:"GRW",slot:2,typ:"sonder",hinweis:"Variable numerische Wirkungen werden um 50 % verstärkt."},
    {id:"maximieren",name:"Zaubereffekt maximieren",quelle:"GRW",slot:3,typ:"sonder",hinweis:"Variable numerische Wirkungen werden maximiert."},
    {id:"bereich",name:"Zauberbereich erweitern",quelle:"GRW",slot:3,typ:"sonder",hinweis:"Verdoppelt geeignete Flächenmaße."},
    {id:"schnell",name:"Schnell zaubern",quelle:"GRW",slot:4,typ:"sonder",hinweis:"Verändert den Zeitaufwand des Zaubers."},
    {id:"erhohen",name:"Zaubergrad erhöhen",quelle:"GRW",slot:"variabel",typ:"hoehen",hinweis:"Erhöht tatsächlichen Zaubergrad und damit u. a. den SG."},
    {id:"benommen",name:"Benommen machender Zauber",quelle:"EXP",slot:3,typ:"sonder",hinweis:"Schadenszauber können das Ziel zusätzlich benommen machen."},
    {id:"elementar",name:"Elementarer Zauber",quelle:"EXP",slot:1,typ:"sonder",hinweis:"Kann die Energieart eines geeigneten Zaubers ändern."},
    {id:"intensiviert",name:"Intensivierter Zauber",quelle:"EXP",slot:1,typ:"sonder",hinweis:"Erhöht bei geeigneten Zaubern die ZS-Obergrenze für Schadenswürfel."},
    {id:"nachhaltig",name:"Nachhaltiger Zauber",quelle:"EXP",slot:2,typ:"sonder",hinweis:"Erzwingt bei geeigneten Zaubern einen zweiten Rettungswurf."},
    {id:"selektiv",name:"Selektiver Zauber",quelle:"EXP",slot:1,typ:"sonder",hinweis:"Kann ausgewählte Kreaturen aus Flächeneffekten ausnehmen."},
    {id:"widerstand",name:"Zauberresistenz durchdringen",quelle:"ABR",slot:1,typ:"zr",hinweis:"Erleichtert das Überwinden von Zauberresistenz bei diesem Zauber."},
    {id:"echo",name:"Echozauber",quelle:"ABR",slot:3,typ:"sonder",hinweis:"Der Zauber kann ein weiteres Mal genutzt werden."},
    {id:"eisig",name:"Eisiger Zauber",quelle:"ABR",slot:1,typ:"sonder",hinweis:"Kältezauber können das Ziel zusätzlich verstricken."},
    {id:"umstossend",name:"Umstoßender Zauber",quelle:"ABR",slot:1,typ:"sonder",hinweis:"Machtzauber können einen Zu-Fall-Bringen-Versuch auslösen."},
    {id:"threnodisch",name:"Threnodischer Zauber",quelle:"ABR",slot:2,typ:"sonder",hinweis:"Bestimmte geistesbeeinflussende Zauber können Untote betreffen."}
  ];
  const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ch=()=>typeof aktiverCharakter==="function"?aktiverCharakter():null;
  const readJson=(key,standard)=>{try{const v=JSON.parse(localStorage.getItem(key)||"null");return v??standard}catch{return standard}};
  const writeJson=(key,v)=>localStorage.setItem(key,JSON.stringify(v));
  function adminAktiv(){return typeof istAdminEntsperrt==="function"?!!istAdminEntsperrt():false}
  function zauberKlassen(c){return (c?.klassen||[]).filter(k=>ZAUBERKLASSEN.has(k.name));}
  function config(c,name){
    c.zauberklassen=c.zauberklassen&&typeof c.zauberklassen==="object"?c.zauberklassen:{};
    const d=STANDARD[name]||["IN","vorbereitet"], klassenstufe=Number((c.klassen||[]).find(k=>k.name===name)?.stufe||0);
    const cfg=c.zauberklassen[name]||(c.zauberklassen[name]={
      attribut:d[0],art:d[1],zs:klassenstufe,zsAuto:true,letzteKlassenstufe:klassenstufe,
      konzBonus:0,zrBonus:0,sgBonus:0,aktiveGrade:[],gradeAuto:true,slots:{},gelernt:{},vorbereitet:{},vorbereitungen:[],nurGelernt:{},verbraucht:{}
    });
    cfg.slots=cfg.slots&&typeof cfg.slots==="object"?cfg.slots:{};
    cfg.gelernt=cfg.gelernt&&typeof cfg.gelernt==="object"?cfg.gelernt:{};
    cfg.vorbereitet=cfg.vorbereitet&&typeof cfg.vorbereitet==="object"?cfg.vorbereitet:{};
    cfg.vorbereitungen=Array.isArray(cfg.vorbereitungen)?cfg.vorbereitungen:[];
    if(!cfg.vorbereitungenMigriert5510){for(const [g,o] of Object.entries(cfg.vorbereitet||{})){if(!o||typeof o!=="object")continue;for(const [zid,n0] of Object.entries(o)){const n=Math.max(0,Math.trunc(Number(n0)||0));for(let i=0;i<n;i++)cfg.vorbereitungen.push({id:"m"+Date.now().toString(36)+g+i+Math.random().toString(36).slice(2,5),zid:String(zid),basisGrad:Number(g),slotGrad:Number(g),meta:[]})}}cfg.vorbereitungenMigriert5510=true;}
    if(typeof cfg.gradeAuto!=="boolean") cfg.gradeAuto=cfg.aktiveGrade.length===0;
    cfg.nurGelernt=cfg.nurGelernt&&typeof cfg.nurGelernt==="object"?cfg.nurGelernt:{};
    cfg.verbraucht=cfg.verbraucht&&typeof cfg.verbraucht==="object"?cfg.verbraucht:{};
    if(!Array.isArray(cfg.aktiveGrade)) cfg.aktiveGrade=[];
    cfg.aktiveGrade=[...new Set(cfg.aktiveGrade.map(Number).filter(g=>Number.isInteger(g)&&g>=0&&g<=9))].sort((a,b)=>a-b);
    if(typeof cfg.zsAuto!=="boolean") cfg.zsAuto=Number(cfg.zs||0)===Number(cfg.letzteKlassenstufe??klassenstufe);
    const vorher=Number(cfg.letzteKlassenstufe??klassenstufe);
    if(cfg.zsAuto || Number(cfg.zs||0)===vorher) cfg.zs=klassenstufe;
    cfg.letzteKlassenstufe=klassenstufe;
    return cfg;
  }
  function save(){if(typeof speichereCharaktere==="function")speichereCharaktere();}
  function mod(c,key){return typeof attributModifikator==="function"?Number(attributModifikator(c,key)||0):0;}
  function attrWert(c,key){return typeof attributAktuellerWert==="function"?Number(attributAktuellerWert(c,key)||0):Number(c?.attribute?.[key]||10);}
  function maxGrad(c,x){return Math.max(-1,Math.min(9,Math.floor(attrWert(c,x.attribut)-10)));}
  function klassenMaxGrad(k){const typ=KLASSEN_PROGRESSION[k.name],t=GRAD_START[typ]||{},st=Number(k.stufe||0);let max=-1;for(const [g,start] of Object.entries(t))if(st>=start)max=Math.max(max,Number(g));return max;}
  function autoGrade(k,x,c){const max=Math.min(klassenMaxGrad(k),maxGrad(c,x));return Array.from({length:Math.max(0,max+1)},(_,g)=>g).filter(g=>gradVorhanden(k,g));}
  function effektiveGrade(k,x,c){if(x.gradeAuto){x.aktiveGrade=autoGrade(k,x,c)}return x.aktiveGrade.filter(g=>g<=Math.min(klassenMaxGrad(k),maxGrad(c,x)));}
  function hoechsterGrad(k,x,c){const a=effektiveGrade(k,x,c);return a.length?Math.max(...a):-1;}
  function ids(x,g){const a=x.gelernt[g];return Array.isArray(a)?a:[]}
  function prep(x,g){const o=x.vorbereitet[g];return o&&typeof o==="object"?o:{}}
  function slotMax(x,g){return Math.max(0,Math.trunc(Number(x.slots[g])||0))}
  function prepAnzahl(x,g){return Object.values(prep(x,g)).reduce((a,b)=>a+Math.max(0,Math.trunc(Number(b)||0)),0)}
  function prepInstanzen(x){return Array.isArray(x.vorbereitungen)?x.vorbereitungen:[];}
  function prepSlotAnzahl(x,g){return prepInstanzen(x).filter(v=>Number(v.slotGrad)===Number(g)).length;}
  function prepZauberAnzahl(x,zid){return prepInstanzen(x).filter(v=>String(v.zid)===String(zid)).length;}
  function prepVariantenText(x,zid){const a=prepInstanzen(x).filter(v=>String(v.zid)===String(zid));if(!a.length)return "";const gruppen={};for(const v of a){const defs=metaDefs(v.meta||[]),n=defs.length?defs.map(m=>m.name.replace(/^Zauber /,"").replace(/ zaubern$/,"")).join(" + "):"normal";const key=`${n}|${v.slotGrad}`;gruppen[key]=(gruppen[key]||0)+1}return Object.entries(gruppen).map(([key,n])=>{const [name,sg]=key.split("|");return `${n}× ${name} (Slot ${sg})`}).join(" · ");}
  function prepHinzufuegen(x,z,g,meta){const defs=metaDefs(meta),slotGrad=metaSlotGrad(g,defs);if(slotGrad>9||prepSlotAnzahl(x,slotGrad)>=slotMax(x,slotGrad))return false;x.vorbereitungen.push({id:"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6),zid:String(z.id),basisGrad:Number(g),slotGrad,meta:[...meta]});return true;}
  function prepEntfernen(x,zid){for(let i=x.vorbereitungen.length-1;i>=0;i--)if(String(x.vorbereitungen[i].zid)===String(zid)){x.vorbereitungen.splice(i,1);return true}return false;}
  function verbraucht(x,g){return Math.max(0,Math.min(slotMax(x,g),Math.trunc(Number(x.verbraucht[g])||0)))}
  function fmt(n){return n>0?`+${n}`:String(n)}
  function einheit(){return localStorage.getItem(EINHEIT_KEY)||"m"}
  function runde(n){n=Math.round(n*100)/100;return Number.isInteger(n)?String(n):String(n).replace(".",",")}
  function reichweiteMeter(text,zs){let t=String(text||"").replace(/,/g,".");if(!t)return null;if(/berührung|du|persönlich|unbegrenzt/i.test(t))return null;let m=t.match(/(\d+(?:\.\d+)?)m(?:\+(\d+(?:\.\d+)?)m\/(\d*)St)?/i);if(!m)return null;let wert=Number(m[1]);if(m[2])wert+=Number(m[2])*Math.floor(zs/Math.max(1,Number(m[3]||1)));return wert;}
  function reichweiteText(text,zs){const m=reichweiteMeter(text,zs);if(m===null)return text||"–";const e=einheit();if(e==="ft")return `${runde(m/0.3)} ft`;if(e==="feld")return `${runde(m/1.5)} Felder`;return `${runde(m)} m`;}
  function normZauber(z){const klassen=z?.klassen&&typeof z.klassen==="object"?z.klassen:{};return {...z,id:String(z.id||("u"+Date.now().toString(36)+Math.random().toString(36).slice(2,7))),name:String(z.name||"").trim(),schule:String(z.schule||""),beschreibung:String(z.beschreibung||""),zeitaufwand:String(z.zeitaufwand||""),komponenten:String(z.komponenten||""),reichweite:String(z.reichweite||""),wirkungsbereich:String(z.wirkungsbereich||""),ziel:String(z.ziel||""),dauer:String(z.dauer||""),rettungswurf:String(z.rettungswurf||""),zauberresistenz:z.zauberresistenz??"",regelwerk:String(z.regelwerk||""),seite:z.seite===""||z.seite==null?"":Number(z.seite),klassen};}
  function kombiniereDaten(){
    const basis=(basisDaten?.zauber||[]).map(normZauber), aender=readJson(ADMIN_AENDERUNGEN_KEY,{}), benutzer=readJson(BENUTZER_KEY,[]), adminNeu=readJson(ADMIN_NEU_KEY,[]);
    const merged=basis.map(z=>aender[z.id]?normZauber({...z,...aender[z.id],id:z.id}):z);
    daten={zauber:[...merged,...benutzer.map(normZauber),...adminNeu.map(z=>normZauber({...z,standard:true}))]};
  }
  async function load(){if(basisDaten)return;try{const r=await fetch("data/zauber.json?v=55.11");if(!r.ok)throw new Error();basisDaten=await r.json()}catch{basisDaten={zauber:[]}}kombiniereDaten();}
  function gradVorhanden(k,g){return (daten.zauber||[]).some(z=>Object.prototype.hasOwnProperty.call(z.klassen||{},k.name)&&Number(z.klassen[k.name])===Number(g));}
  function touchWert(fern=false){const c=ch(),gab=typeof charakterGAB==="function"?Number(charakterGAB(c)||0):Number(c?.gab||0),a=mod(c,fern?"GE":"ST");return gab+a;}

  function metaErlernt(c){const raw=c?.metamagieErlernt;return Array.isArray(raw)?raw:[]}
  function metaSetErlernt(c,ids){c.metamagieErlernt=[...new Set(ids)].filter(id=>METAMAGIE.some(m=>m.id===id));save()}
  function metaAnwendung(c,zid){c.zauberMetamagie=c.zauberMetamagie&&typeof c.zauberMetamagie==="object"?c.zauberMetamagie:{};const a=c.zauberMetamagie[zid];return Array.isArray(a)?a:[]}
  function metaSetAnwendung(c,zid,ids){c.zauberMetamagie=c.zauberMetamagie&&typeof c.zauberMetamagie==="object"?c.zauberMetamagie:{};c.zauberMetamagie[zid]=[...new Set(ids)].filter(id=>METAMAGIE.some(m=>m.id===id));save()}
  function metaDefs(ids){return ids.map(id=>METAMAGIE.find(m=>m.id===id)).filter(Boolean)}
  function metaSlotZusatz(defs){return defs.reduce((n,m)=>n+(Number.isFinite(Number(m.slot))?Number(m.slot):0),0)}
  function metaHoehenZusatz(defs){const m=defs.find(x=>x.typ==="hoehen");return m?1:0}
  function metaEffektiverGrad(g,defs){return Math.min(9,Number(g)+metaHoehenZusatz(defs))}
  function metaSlotGrad(g,defs){return Math.min(9,Number(g)+metaSlotZusatz(defs)+metaHoehenZusatz(defs))}
  function metaReichweiteText(z,x,defs){const basis=reichweiteMeter(z.reichweite,x.zs);const faktor=defs.some(m=>m.typ==="reichweite")?2:1;if(basis===null)return reichweiteText(z.reichweite,x.zs);const e=einheit(),m=basis*faktor;if(e==="ft")return `${runde(m/0.3)} ft`;if(e==="feld")return `${runde(m/1.5)} Felder`;return `${runde(m)} m`}
  function metaDauerText(z,x,defs){const r=dauerRunden(z.dauer,Number(x.zs||0));if(r===null)return String(z.dauer||"");const faktor=defs.some(m=>m.typ==="dauer")?2:1;const rr=r*faktor;return `${z.dauer} (${formatDauerWert(z.dauer,rr)})`}
  function metaNameZusatz(defs){return defs.length?` [${defs.map(m=>m.name.replace(/^Zauber /,"").replace(/ zaubern$/,"" )).join(", ")}]`:""}

  function renderMetamagie(c){
    const box=document.createElement("section");box.className="zauber-karte-55 zauber-metamagie-558";
    const gelernt=new Set(metaErlernt(c));
    box.innerHTML=`<div class="zauber-metamagie-kopf-5512"><strong>Metamagie-Talente</strong><span>${gelernt.size} erlernt</span><button type="button" class="zauber-toggle-5512" data-meta-toggle aria-expanded="${metamagieOffen}" aria-label="Metamagische Talente ${metamagieOffen?"zuklappen":"aufklappen"}">${metamagieOffen?"▴":"▾"}</button></div><div class="zauber-metamagie-inhalt-5512" ${metamagieOffen?"":"hidden"}><div class="zauber-hinweis-55">Quellen: GRW, EXP und ABR.</div><div class="zauber-metamagie-grid-558">${METAMAGIE.map(m=>`<label class="zauber-meta-talent-558${gelernt.has(m.id)?" aktiv":""}"><input type="checkbox" data-meta-lernen="${m.id}" ${gelernt.has(m.id)?"checked":""}><span><strong>${esc(m.name)}</strong><small>${m.quelle} · Slot +${m.slot==="variabel"?"variabel":m.slot}</small><em>${esc(m.hinweis)}</em></span></label>`).join("")}</div></div>`;
    root.append(box);
    box.querySelector('[data-meta-toggle]').onclick=()=>{metamagieOffen=!metamagieOffen;render()};
    box.querySelectorAll('[data-meta-lernen]').forEach(el=>el.onchange=()=>{metamagieOffen=true;const ids=new Set(metaErlernt(c));el.checked?ids.add(el.dataset.metaLernen):ids.delete(el.dataset.metaLernen);metaSetErlernt(c,[...ids]);render()});
  }

  function renderKlassen(c,klassen){
    const box=document.createElement("section");box.className="zauber-karte-55 zauber-klassenbox-5510";
    for(const k of klassen){
      const x=config(c,k.name),panel=document.createElement("div"),offen=offeneKlassen.has(k.name);panel.className="zauber-klassendetails-5510"+(k.name===klasseAktiv?" aktiv":"");
      panel.innerHTML=`<div class="zauber-klassenkopf-5512"><button type="button" class="zauber-klassenwahl-55" data-klasse aria-pressed="${k.name===klasseAktiv}" title="${esc(k.name)} als aktive Zauberklasse wählen"><span class="zauber-klassenname-5512">${esc(k.name)}</span><span class="zauber-klassenstufe-5512"> ${Number(k.stufe||0)}</span></button><span class="zauber-klasseninfo-5512">${x.attribut} · ${x.art} · ZS ${Number(x.zs||0)}</span><button type="button" class="zauber-toggle-5512" data-klasse-toggle aria-expanded="${offen}" aria-label="Einstellungen für ${esc(k.name)} ${offen?"zuklappen":"aufklappen"}">${offen?"▴":"▾"}</button></div><div class="zauber-klasseninhalt-5512" ${offen?"":"hidden"}><div class="zauber-klassenzeile-55"><label>Attribut <select data-a>${["ST","GE","KO","IN","WE","CH"].map(a=>`<option ${a===x.attribut?"selected":""}>${a}</option>`).join("")}</select></label><label>Art <select data-art><option value="vorbereitet" ${x.art==="vorbereitet"?"selected":""}>vorbereitet</option><option value="spontan" ${x.art==="spontan"?"selected":""}>spontan</option></select></label><label>ZS <input data-zs type="number" min="0" max="99" value="${Number(x.zs||0)}"></label></div></div>`;
      panel.querySelector('[data-klasse]').onclick=()=>{klasseAktiv=k.name;render()};
      panel.querySelector('[data-klasse-toggle]').onclick=()=>{offen?offeneKlassen.delete(k.name):offeneKlassen.add(k.name);render()};
      panel.querySelector('[data-a]').onchange=e=>{offeneKlassen.add(k.name);x.attribut=e.target.value;save();render()};
      panel.querySelector('[data-art]').onchange=e=>{offeneKlassen.add(k.name);x.art=e.target.value;save();render()};
      panel.querySelector('[data-zs]').onchange=e=>{offeneKlassen.add(k.name);x.zs=Math.max(0,Number(e.target.value)||0);x.zsAuto=x.zs===Number(k.stufe||0);x.letzteKlassenstufe=Number(k.stufe||0);save();render()};
      box.append(panel);
    }root.append(box);
  }

  function renderWerte(c,k,x){
    const am=mod(c,x.attribut),aw=attrWert(c,x.attribut),konz=Number(x.zs||0)+am+Number(x.konzBonus||0),zr=Number(x.zs||0)+Number(x.zrBonus||0),mg=maxGrad(c,x),kg=klassenMaxGrad(k),nah=touchWert(false),fern=touchWert(true);
    effektiveGrade(k,x,c);
    const box=document.createElement("section");box.className="zauber-karte-55";
    box.innerHTML=`<div class="zauber-kopf-55"><h3>${esc(k.name)} ${Number(k.stufe||0)} · ZS ${Number(x.zs||0)} · ${x.attribut} ${aw} (${fmt(am)})</h3><label>Reichweite <select id="zauberEinheit55"><option value="m">Meter</option><option value="feld">Felder</option><option value="ft">Feet</option></select></label></div><div class="zauber-werte-55"><div class="zauber-wert-55">Konzentration<strong>W20 ${fmt(konz)}</strong><small>ZS ${fmt(Number(x.zs||0))} + ${x.attribut}-Mod ${fmt(am)}</small></div><div class="zauber-wert-55">ZR überwinden<strong>W20 ${fmt(zr)}</strong><small>Zauberstufe ${fmt(Number(x.zs||0))}</small></div><div class="zauber-wert-55">Berührung Nah<strong>W20 ${fmt(nah)}</strong><small>GAB + ST-Mod</small></div><div class="zauber-wert-55">Berührung Fern<strong>W20 ${fmt(fern)}</strong><small>GAB + GE-Mod</small></div></div><div class="zauber-gradmodus-5510"><label><input type="checkbox" id="zauberGradeAuto5510" ${x.gradeAuto?"checked":""}> Zaubergrade automatisch nach Klassenstufe</label><small>Klassenmaximum: Grad ${kg<0?"–":kg} · Attributsmaximum: Grad ${mg<0?"–":mg}</small></div><div class="zauber-sg-grid-55">${Array.from({length:10},(_,g)=>{const aktiv=x.aktiveGrade.includes(g),vorhanden=gradVorhanden(k,g),attributOk=g<=mg,klasseOk=g<=kg;return `<button type="button" class="zauber-sg-55${aktiv?" aktiv":""}" data-grad="${g}" ${vorhanden&&attributOk&&klasseOk&&!x.gradeAuto?"":"disabled"} aria-pressed="${aktiv}" title="${x.gradeAuto?"Automatische Freischaltung aktiv":!vorhanden?"Für diese Klasse sind in der Datenbank keine Zauber dieses Grades vorhanden":!klasseOk?`Klassenstufe ${Number(k.stufe||0)} reicht noch nicht für Grad ${g}`:!attributOk?`${x.attribut} ${aw}: Für Grad ${g} wird mindestens ${10+g} benötigt`:"Grad für diesen Charakter ein-/ausblenden"}">Grad ${g}</button>`}).join("")}</div>`;
    root.append(box);box.querySelector('#zauberGradeAuto5510').onchange=e=>{x.gradeAuto=e.target.checked;if(x.gradeAuto)x.aktiveGrade=autoGrade(k,x,c);save();render()};const sel=box.querySelector('#zauberEinheit55');sel.value=einheit();sel.onchange=()=>{localStorage.setItem(EINHEIT_KEY,sel.value);render()};
    box.querySelectorAll('[data-grad]').forEach(b=>b.onclick=()=>{const g=Number(b.dataset.grad);if(g>mg||g>kg||x.gradeAuto)return;x.aktiveGrade=x.aktiveGrade.includes(g)?x.aktiveGrade.filter(v=>v!==g):[...x.aktiveGrade,g].sort((a,b)=>a-b);save();render()});
  }

  const QUELLEN_KUERZEL={"Grundregelwerk":"GRW","Expertenregeln":"EXP","Ausbauregeln: Magie":"ABR","Ausbauregeln II: Kampf":"ABR II"};
  function quellenText(z){if(!z.regelwerk||!z.seite)return "";return `${QUELLEN_KUERZEL[z.regelwerk]||z.regelwerk} S. ${z.seite}`}
  function dauerRunden(text,zs){
    const t=String(text||"").replace(/\s+/g,"").replace(/Min/g,"min"); if(!t)return null; let m;
    if((m=t.match(/^(\d*)Rd\/St$/i)))return (Number(m[1]||1)*zs);
    if((m=t.match(/^(\d*)Rd\/(\d+)St$/i)))return Number(m[1]||1)*Math.floor(zs/Number(m[2]));
    if((m=t.match(/^(\d*)min\/St$/i)))return Number(m[1]||1)*10*zs;
    if((m=t.match(/^(\d*)h\/St$/i)))return Number(m[1]||1)*600*zs;
    if((m=t.match(/^(\d*)Tag\/St$/i)))return Number(m[1]||1)*14400*zs;
    if((m=t.match(/^(\d+)Rd$/i)))return Number(m[1]);
    if((m=t.match(/^(\d+)min$/i)))return Number(m[1])*10;
    if((m=t.match(/^(\d+)h$/i)))return Number(m[1])*600;
    if((m=t.match(/^(\d+)Rd\+(\d*)Rd\/St$/i)))return Number(m[1])+Number(m[2]||1)*zs;
    return null;
  }
  function dauerIstStundenProStufe(text){
    const t=String(text||"").replace(/\s+/g,"").replace(/Stunden?/gi,"h").replace(/Std\.?/gi,"h");
    return /^(?:\d*)h\/St$/i.test(t)||/^(?:\d*)Tag\/St$/i.test(t);
  }
  function formatDauerWert(text,runden){
    const r=Math.max(0,Number(runden)||0);
    if(dauerIstStundenProStufe(text)){
      const stunden=r/600;
      return `${runde(stunden)} Std.`;
    }
    return `${runde(r)} Runde${r===1?"":"n"}`;
  }
  function dauerText(text,zs){const r=dauerRunden(text,zs);return r===null?String(text||""):`${text} (${formatDauerWert(text,r)})`}
  function rwText(text,sg){const t=String(text||"").trim();if(!t)return "";const hatRw=!/^-$/.test(t)&&!/^kein/i.test(t);return hatRw?`${t} (SG ${sg})`:t}
  function zeitText(t){const v=String(t||"").trim();const m={A:"1 Standard-Aktion",SA:"1 Schnelle Aktion",AA:"1 Augenblickliche Aktion"};return m[v]||v.replace(/^(\d+)Rd$/i,"$1 Runde(n)").replace(/^(\d+)min$/i,"$1 Minute(n)").replace(/^(\d+)h$/i,"$1 Stunde(n)")||"–"}
  function komponentenText(t){const v=String(t||"").trim();if(!v)return "–";const a=[];if(/v/i.test(v))a.push("V");if(/g/.test(v))a.push("G");if(/m/i.test(v))a.push("M");if(/f/i.test(v))a.push("F");if(/[A-Z]G/.test(v)||v.includes("G"))a.push("GF");return [...new Set(a)].join(", ")||v}
  function reichweitenArt(t){const v=String(t||"").trim();if(!v)return "–";if(/berührung/i.test(v))return "Berührung";if(/^(du|persönlich)$/i.test(v))return "Persönlich";if(/∞|unbegrenzt/i.test(v))return "Unbegrenzt";if(/^7[,.]5m\+1[,.]5m\/2St$/i.test(v))return "Nah";if(/^30m\+3m\/St$/i.test(v))return "Mittel";if(/^120m\+12m\/St$/i.test(v))return "Weit";return "Fest/Sonder"}
  function reichweiteMitArt(z,x,defs){const art=reichweitenArt(z.reichweite);const wert=metaReichweiteText(z,x,defs);return art==="–"?wert:(art==="Berührung"||art==="Persönlich"||art==="Unbegrenzt")?art:`${art} (${wert})`}
  function zrInfo(z,x){const raw=z.zauberresistenz;if(raw===true||/^(ja|j|yes)$/i.test(String(raw||"")))return `Ja · W20 ${fmt(Number(x.zs||0)+Number(x.zrBonus||0))}`;if(raw===false||/^(nein|n|no)$/i.test(String(raw||"")))return "Nein";if(/siehe\s*text/i.test(String(raw||"")))return "siehe Text";return "–"}
  function zauberHtml(z,k,x,g){
    const c=ch(), erlernt=new Set(metaErlernt(c)), angewandt=metaAnwendung(c,z.id).filter(id=>erlernt.has(id)), defs=metaDefs(angewandt), effGrad=metaEffektiverGrad(g,defs), slotGrad=metaSlotGrad(g,defs), sg=10+effGrad+mod(c,x.attribut)+Number(x.sgBonus||0),source=quellenText(z),spontan=x.art==="spontan",gelernt=ids(x,g).includes(z.id),p=prepZauberAnzahl(x,z.id),maxGradVerf=hoechsterGrad(k,x,c),slotFrei=slotGrad<=maxGradVerf&&(spontan||prepSlotAnzahl(x,slotGrad)<slotMax(x,slotGrad));
    const varianten=prepVariantenText(x,z.id);
    const control=spontan?`<label class="zauber-lerncheck-55"><input type="checkbox" data-lern="${esc(z.id)}" ${gelernt?"checked":""}> gelernt / verfügbar</label>`:`<div class="zauber-prep-wrap-5510"><div class="zauber-prep-55"><button type="button" data-minus="${esc(z.id)}" ${p<=0?"disabled":""}>−</button><strong>${p}× vorbereitet</strong><button type="button" data-plus="${esc(z.id)}" ${!slotFrei?"disabled":""}>+</button></div>${varianten?`<small class="zauber-prep-varianten-5510">${esc(varianten)}</small>`:""}</div>`;
    const editierbar=!z.standard||adminAktiv(), lernbare=METAMAGIE.filter(m=>erlernt.has(m.id));
    const meta=lernbare.length?`<details class="zauber-meta-anwendung-558"><summary>Metamagie${defs.length?` · Slot Grad ${slotGrad}`:""}</summary><div class="zauber-meta-auswahl-558">${lernbare.map(m=>{const test=metaDefs([...new Set([...angewandt.filter(id=>id!==m.id),m.id])]),bedarf=metaSlotGrad(g,test),ok=bedarf<=maxGradVerf;return `<label class="${ok?"":"nicht-verfuegbar-5510"}"><input type="checkbox" data-meta-anwenden="${m.id}" data-zid="${esc(z.id)}" ${angewandt.includes(m.id)?"checked":""} ${!ok&&!angewandt.includes(m.id)?"disabled":""}><span>${esc(m.name)} <small>${m.quelle} · +${m.slot==="variabel"?"variabel":m.slot}${!ok?` · benötigt Grad ${bedarf}`:""}</small></span></label>`}).join("")}</div>${defs.length?`<div class="zauber-meta-ergebnis-558">Effektiver Zaubergrad: <strong>${effGrad}</strong> · benötigter Slot: <strong>Grad ${slotGrad}</strong>${slotGrad>maxGradVerf?` · <strong>nicht verfügbar</strong>`:spontan?` · Slotverbrauch manuell`:""}</div>`:""}</details>`:"";
    return `<article class="zauber-eintrag-55" data-zauber-id="${esc(z.id)}"><div class="zauber-eintrag-kopf-55"><h4>${esc(z.name)}${esc(metaNameZusatz(defs))}</h4><div class="zauber-eintrag-aktionen-554">${editierbar?`<button type="button" data-edit="${esc(z.id)}" title="Zauber bearbeiten" aria-label="Zauber bearbeiten">✏️</button>`:""}</div></div>${control}${meta}<div class="zauber-meta-55 zauber-meta-werte-556">${source?`<span>Quelle: <strong class="zauber-detail-559">${esc(source)}</strong></span>`:''}<span>Zeitaufwand: <strong class="zauber-detail-559">${esc(zeitText(z.zeitaufwand))}</strong></span><span>Komponenten: <strong class="zauber-detail-559">${esc(komponentenText(z.komponenten))}</strong></span><span>Defensiv: <strong class="zauber-detail-559">W20 ${fmt(Number(x.zs||0)+mod(c,x.attribut)+Number(x.konzBonus||0))} gegen SG ${15+2*effGrad}</strong></span><span>ZR: <strong class="zauber-detail-559">${esc(zrInfo(z,x))}</strong></span><span>Reichweite: <strong class="zauber-reichweite-55">${esc(reichweiteMitArt(z,x,defs))}</strong></span>${z.dauer?`<span>Dauer: <strong class="zauber-dauer-556">${esc(metaDauerText(z,x,defs))}</strong></span>`:''}${z.rettungswurf?`<span>RW: <strong class="zauber-rw-556">${esc(rwText(z.rettungswurf,sg))}</strong></span>`:''}</div>${defs.filter(m=>m.typ==="sonder"||m.typ==="komponenten"||m.typ==="zr").length?`<div class="zauber-meta-hinweise-558">${defs.filter(m=>m.typ==="sonder"||m.typ==="komponenten"||m.typ==="zr").map(m=>`<span><strong>${esc(m.name)}:</strong> ${esc(m.hinweis)}</span>`).join("")}</div>`:""}${z.beschreibung?`<div class="zauber-beschreibung-55">${esc(z.beschreibung)}</div>`:''}</article>`;
  }

  function renderGradListen(k,x){
    const box=document.createElement("section");box.className="zauber-karte-55";const aktive=effektiveGrade(k,x,ch()).filter(g=>gradVorhanden(k,g));
    const filter=document.createElement("div");filter.className="zauber-filter-55 zauber-filter-mit-loeschen-554";filter.innerHTML=`<input id="zauberSuche55" placeholder="Zauber suchen…" value="${esc(suche)}"><button type="button" id="btnZauberSucheLeeren554" aria-label="Zaubersuche leeren" title="Suche leeren">×</button><button type="button" id="btnNeuerZauber554">+ Zauber</button>`;box.append(filter);
    const listen=document.createElement("div");listen.className="zauber-gradlisten-55";box.append(listen);root.append(box);
    const sucheEl=filter.querySelector('#zauberSuche55'),clear=filter.querySelector('#btnZauberSucheLeeren554');
    const updateClear=()=>clear.classList.toggle('sichtbar',!!sucheEl.value);
    sucheEl.oninput=e=>{suche=e.target.value;updateClear();renderGradInhalte(listen,k,x)};clear.onclick=()=>{suche="";sucheEl.value="";updateClear();renderGradInhalte(listen,k,x);sucheEl.focus()};updateClear();
    filter.querySelector('#btnNeuerZauber554').onclick=()=>oeffneZauberEditor(null,k,x,false);
    if(!aktive.length){listen.innerHTML='<p class="zauber-leer-55">Bitte oben einen oder mehrere verfügbare Zaubergrade aktivieren.</p>';return}renderGradInhalte(listen,k,x);
  }

  function renderSlotsSpontan(summary,x,g){
    const max=slotMax(x,g),used=verbraucht(x,g),box=document.createElement('span');box.className='zauber-slotkaestchen-554';
    for(let i=0;i<max;i++){const b=document.createElement('button');b.type='button';b.className='zauber-slot-554'+(i<used?' verbraucht':'');b.dataset.slotUse=String(i);b.title=i<used?'Slot verbraucht – anklicken zum Wiederherstellen':'Freier Slot – anklicken zum Verbrauchen';b.setAttribute('aria-label',b.title);b.textContent=i<used?'✓':'□';box.append(b)}summary.append(box);
    box.querySelectorAll('[data-slot-use]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const i=Number(b.dataset.slotUse);x.verbraucht[g]=i<used?i:i+1;save();render()});
  }

  function renderGradInhalte(container,k,x){
    const q=suche.trim().toLocaleLowerCase('de');container.innerHTML='';
    for(const g of effektiveGrade(k,x,ch()).filter(g=>gradVorhanden(k,g))){
      const all=(daten.zauber||[]).filter(z=>Object.prototype.hasOwnProperty.call(z.klassen||{},k.name)&&Number(z.klassen[k.name])===g).sort((a,b)=>a.name.localeCompare(b.name,'de')),known=ids(x,g),prepared=prep(x,g),only=!!x.nurGelernt[g];
      let list=all.filter(z=>!q||z.name.toLocaleLowerCase('de').includes(q)).filter(z=>!only||(x.art==="spontan"?known.includes(z.id):prepZauberAnzahl(x,z.id)>0));
      const max=slotMax(x,g),used=x.art==="vorbereitet"?prepSlotAnzahl(x,g):verbraucht(x,g),frei=Math.max(0,max-used),details=document.createElement('details');details.className='zauber-gradgruppe-55';details.open=offeneGrade.has(g);
      details.innerHTML=`<summary><span>Grad ${g}</span><span class="zauber-gradstatus-55"><label onclick="event.stopPropagation()">pro Tag <input data-slot="${g}" type="number" min="0" max="99" value="${max}"></label><strong>${frei} frei / verfügbar</strong><label onclick="event.stopPropagation()"><input data-only="${g}" type="checkbox" ${only?"checked":""}> ${x.art==="spontan"?"nur gelernte":"nur vorbereitete"}</label><span>${list.length} Zauber</span></span></summary><div class="zauber-liste-55">${list.length?list.map(z=>zauberHtml(z,k,x,g)).join(''):'<p class="zauber-leer-55">Keine passenden Zauber gefunden.</p>'}</div>`;
      container.append(details);details.addEventListener('toggle',()=>{if(details.open)offeneGrade.add(g);else offeneGrade.delete(g)});
      if(x.art==="spontan")renderSlotsSpontan(details.querySelector('summary .zauber-gradstatus-55'),x,g);
      details.querySelector('[data-slot]').onchange=e=>{x.slots[g]=Math.max(0,Math.trunc(Number(e.target.value)||0));x.verbraucht[g]=Math.min(verbraucht(x,g),x.slots[g]);offeneGrade.add(g);save();renderGradInhalte(container,k,x)};
      details.querySelector('[data-only]').onchange=e=>{x.nurGelernt[g]=e.target.checked;offeneGrade.add(g);save();renderGradInhalte(container,k,x)};
      details.querySelectorAll('[data-lern]').forEach(el=>el.onchange=()=>{let a=ids(x,g).slice();a=el.checked?[...new Set([...a,el.dataset.lern])]:a.filter(id=>id!==el.dataset.lern);x.gelernt[g]=a;offeneGrade.add(g);save();renderGradInhalte(container,k,x)});
      details.querySelectorAll('[data-plus]').forEach(el=>el.onclick=()=>{const z=daten.zauber.find(v=>String(v.id)===String(el.dataset.plus));if(!z)return;const meta=metaAnwendung(ch(),z.id).filter(id=>metaErlernt(ch()).includes(id));if(prepHinzufuegen(x,z,g,meta)){offeneGrade.add(g);save();renderGradInhalte(container,k,x)}});
      details.querySelectorAll('[data-minus]').forEach(el=>el.onclick=()=>{if(prepEntfernen(x,el.dataset.minus)){offeneGrade.add(g);save();renderGradInhalte(container,k,x)}});
      details.querySelectorAll('[data-edit]').forEach(el=>el.onclick=()=>{const z=daten.zauber.find(v=>String(v.id)===String(el.dataset.edit));if(z)oeffneZauberEditor(z,k,x,!!z.standard)});
      details.querySelectorAll('[data-meta-anwenden]').forEach(el=>el.onchange=()=>{const c=ch(),id=el.dataset.zid,ids=new Set(metaAnwendung(c,id));el.checked?ids.add(el.dataset.metaAnwenden):ids.delete(el.dataset.metaAnwenden);metaSetAnwendung(c,id,[...ids]);offeneGrade.add(g);renderGradInhalte(container,k,x)});
    }
  }

  function stelleEditorBereit(){
    if(document.getElementById('zauberDialog554'))return;const d=document.createElement('dialog');d.id='zauberDialog554';d.className='zauber-dialog-554';d.innerHTML=`<form method="dialog" id="zauberForm554"><h3 id="zauberDialogTitel554">Zauber</h3><div class="zauber-editor-grid-554"><label>Name<input id="zauberName554" required></label><label>Schule<input id="zauberSchule554"></label><label>Regelwerk<input id="zauberRegelwerk554"></label><label>Seite<input id="zauberSeite554" type="number" min="1"></label><label>Zeitaufwand<input id="zauberZeit554"></label><label>Komponenten<input id="zauberKomponenten554"></label><label>Reichweite<input id="zauberReichweite554"></label><label>Ziel<input id="zauberZiel554"></label><label>Dauer<input id="zauberDauer554"></label><label>Rettungswurf<input id="zauberRw554"></label><label>ZR (Ja/Nein)<input id="zauberZr559"></label></div><fieldset><legend>Klassen / Grad</legend><div id="zauberKlassenEditor554" class="zauber-editor-klassen-554"></div></fieldset><label>Beschreibung<textarea id="zauberBeschreibung554" rows="5"></textarea></label><div class="dialog-aktionen"><button type="submit" id="btnZauberSpeichern554">Speichern</button><button type="button" id="btnZauberAbbrechen554">Abbrechen</button></div></form>`;document.body.append(d);d.querySelector('#btnZauberAbbrechen554').onclick=()=>d.close();d.querySelector('#zauberForm554').onsubmit=e=>{e.preventDefault();speichereZauberEditor()};
  }
  function oeffneZauberEditor(z,k,x,standard){
    stelleEditorBereit();const d=document.getElementById('zauberDialog554');editorId=z?.id||null;editorStandard=!!standard;document.getElementById('zauberDialogTitel554').textContent=z?'Zauber bearbeiten':'Neuen Zauber anlegen';
    const set=(id,v)=>document.getElementById(id).value=v??'';set('zauberName554',z?.name);set('zauberSchule554',z?.schule);set('zauberRegelwerk554',z?.regelwerk);set('zauberSeite554',z?.seite);set('zauberZeit554',z?.zeitaufwand);set('zauberKomponenten554',z?.komponenten);set('zauberReichweite554',z?.reichweite);set('zauberZiel554',z?.ziel);set('zauberDauer554',z?.dauer);set('zauberRw554',z?.rettungswurf);set('zauberZr559',z?.zauberresistenz===true?'Ja':z?.zauberresistenz===false?'Nein':z?.zauberresistenz);set('zauberBeschreibung554',z?.beschreibung);
    const ce=document.getElementById('zauberKlassenEditor554');ce.innerHTML='';[...ZAUBERKLASSEN].sort((a,b)=>a.localeCompare(b,'de')).forEach(name=>{const val=z?.klassen?.[name],row=document.createElement('label');row.innerHTML=`<span>${esc(name)}</span><input type="number" min="0" max="9" data-editor-klasse="${esc(name)}" placeholder="–" value="${val===undefined?'':Number(val)}">`;ce.append(row)});d.showModal();
  }
  function editorDaten(){const klassen={};document.querySelectorAll('[data-editor-klasse]').forEach(i=>{if(i.value!=="")klassen[i.dataset.editorKlasse]=Math.max(0,Math.min(9,Number(i.value)||0))});return normZauber({id:editorId||undefined,name:document.getElementById('zauberName554').value,schule:document.getElementById('zauberSchule554').value,regelwerk:document.getElementById('zauberRegelwerk554').value,seite:document.getElementById('zauberSeite554').value,zeitaufwand:document.getElementById('zauberZeit554').value,komponenten:document.getElementById('zauberKomponenten554').value,reichweite:document.getElementById('zauberReichweite554').value,ziel:document.getElementById('zauberZiel554').value,dauer:document.getElementById('zauberDauer554').value,rettungswurf:document.getElementById('zauberRw554').value,zauberresistenz:(()=>{const v=document.getElementById('zauberZr559').value.trim();return /^ja$/i.test(v)?true:/^nein$/i.test(v)?false:v})(),beschreibung:document.getElementById('zauberBeschreibung554').value,klassen});}
  function speichereZauberEditor(){const z=editorDaten();if(!z.name){document.getElementById('zauberName554').focus();return}if(editorId){const basis=(basisDaten?.zauber||[]).some(v=>String(v.id)===String(editorId));if(basis){if(!adminAktiv()){alert('Standardzauber können nur im entsperrten Admin-Modus geändert werden.');return}const o=readJson(ADMIN_AENDERUNGEN_KEY,{});o[editorId]=z;writeJson(ADMIN_AENDERUNGEN_KEY,o)}else{for(const key of [BENUTZER_KEY,ADMIN_NEU_KEY]){const a=readJson(key,[]),idx=a.findIndex(v=>String(v.id)===String(editorId));if(idx>=0){a[idx]=z;writeJson(key,a);break}}}}else{const key=adminAktiv()?ADMIN_NEU_KEY:BENUTZER_KEY,a=readJson(key,[]);a.push(z);writeJson(key,a)}kombiniereDaten();document.getElementById('zauberDialog554').close();render();}

  async function render(){await load();root.innerHTML='';const c=ch();if(!c){root.innerHTML='<section class="zauber-karte-55 zauber-leer-55">Kein aktiver Charakter.</section>';return}const klassen=zauberKlassen(c);if(!klassen.length){root.innerHTML='<section class="zauber-karte-55 zauber-leer-55">Der aktive Charakter besitzt aktuell keine unterstützte Zauberklasse.</section>';return}if(!klassen.some(k=>k.name===klasseAktiv))klasseAktiv=klassen[0].name;renderKlassen(c,klassen);renderMetamagie(c);const k=klassen.find(k=>k.name===klasseAktiv),x=config(c,k.name);renderWerte(c,k,x);renderGradListen(k,x);save();}

  // Zauberdaten sind Teil des Charakterobjekts und müssen Import/Export-Normalisierung überleben.
  if(typeof normalisiereCharakter==="function"&&!normalisiereCharakter.__zauber5510){const altNormalisiere=normalisiereCharakter;const neu=function(charakter={}){const basis=altNormalisiere(charakter);return {...basis,zauberklassen:charakter.zauberklassen&&typeof charakter.zauberklassen==="object"?charakter.zauberklassen:(basis.zauberklassen||{}),metamagieErlernt:Array.isArray(charakter.metamagieErlernt)?charakter.metamagieErlernt:(basis.metamagieErlernt||[]),zauberMetamagie:charakter.zauberMetamagie&&typeof charakter.zauberMetamagie==="object"?charakter.zauberMetamagie:(basis.zauberMetamagie||{})}};neu.__zauber5510=true;normalisiereCharakter=neu;}

  const oldShow=zeigeSeite;zeigeSeite=function(name){oldShow(name);if(name==='zauber')render()};btn.onclick=()=>zeigeSeite('zauber');
  if(typeof waehleCharakter==='function'){const old=waehleCharakter;waehleCharakter=function(id){const r=old(id);if(r&&page.style.display!=='none')render();return r}}
  if(typeof setzeCharakterKlassen==='function'){const oldSet=setzeCharakterKlassen;setzeCharakterKlassen=function(id,klassen){const r=oldSet(id,klassen);if(r&&id===aktiverCharakterId&&page.style.display!=='none')render();return r}}
  window.pfZauber55={render};
})();
