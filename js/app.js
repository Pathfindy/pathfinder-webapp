// Das azlantische Helferlein der Boni
// app.js
// Version 0.6.1

const seiten={
 dashboard:document.getElementById("dashboard"),
 effekte:document.getElementById("effekte"),
 charaktere:document.getElementById("charaktere")
};

function zeigeSeite(name){
 Object.values(seiten).forEach(s=>s.style.display="none");
 if(seiten[name]) seiten[name].style.display="block";
}

document.getElementById("btnDashboard").onclick=()=>zeigeSeite("dashboard");
document.getElementById("btnEffekte").onclick=()=>zeigeSeite("effekte");
document.getElementById("btnCharaktere").onclick=()=>zeigeSeite("charaktere");
zeigeSeite("dashboard");

let effekte=[];

const STORAGE_KEYS={
 status:"pf-effekte",
 benutzerEffekte:"pf-benutzer-effekte"
};

function ladeJson(key,standardwert){
 try{
   const rohwert=localStorage.getItem(key);
   return rohwert===null?standardwert:JSON.parse(rohwert);
 }catch(fehler){
   console.warn(`Gespeicherte Daten unter "${key}" konnten nicht gelesen werden:`,fehler);
   return standardwert;
 }
}

function speichereJson(key,wert){
 localStorage.setItem(key,JSON.stringify(wert));
}

function ladeStatus(){
 const status=ladeJson(STORAGE_KEYS.status,{});
 return status && typeof status==="object" && !Array.isArray(status)?status:{};
}

function speichereStatus(status){
 speichereJson(STORAGE_KEYS.status,status);
}

function ladeBenutzerEffekte(){
 const benutzer=ladeJson(STORAGE_KEYS.benutzerEffekte,[]);
 return Array.isArray(benutzer)?benutzer:[];
}

function speichereBenutzerEffekte(benutzer){
 speichereJson(STORAGE_KEYS.benutzerEffekte,benutzer);
}

function neueEffektId(){
 if(typeof crypto!=="undefined" && typeof crypto.randomUUID==="function"){
   return crypto.randomUUID();
 }
 return "effekt-"+Date.now()+"-"+Math.random().toString(36).slice(2);
}

function standardEffektId(effekt){
 const basis=`${effekt.name||"effekt"}-${effekt.kategorie||"standard"}`
   .toLowerCase()
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"")
   .replace(/[^a-z0-9]+/g,"-")
   .replace(/^-+|-+$/g,"");
 return `standard-${basis||"effekt"}`;
}

function normalisiereEffekt(effekt={}){
 const standard=!!effekt.standard;
 return {
   id:effekt.id||(standard?standardEffektId(effekt):neueEffektId()),
   standard,
   aktiv:!!effekt.aktiv,
   name:effekt.name||"",
   kategorie:effekt.kategorie||"",
   beschreibung:effekt.beschreibung||"",
   quelle:effekt.quelle||"",
   boni:Array.isArray(effekt.boni)?effekt.boni:[]
 };
}

function erzeugeEffekt(daten={}){
 return normalisiereEffekt({
   ...daten,
   standard:false,
   aktiv:false
 });
}

async function ladeEffekte(){
 try{
   const antwort=await fetch("data/effekte.json");
   const standardEffekte=await antwort.json();
   const status=ladeStatus();

   const benutzerRohdaten=ladeBenutzerEffekte();
   const benutzer=benutzerRohdaten.map(effekt=>normalisiereEffekt({...effekt,standard:false}));
   speichereBenutzerEffekte(benutzer);

   effekte=standardEffekte
     .map(effekt=>normalisiereEffekt({...effekt,standard:true}))
     .concat(benutzer);
   effekte.forEach(effekt=>effekt.aktiv=!!status[effekt.name]);

   console.log("Effekte geladen:",effekte.length);
   baueEffektliste();
 }catch(fehler){
   console.error("Fehler beim Laden:",fehler);
 }
}

function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 const suche=document.getElementById("suche");
 if(!liste) return;
 const status=ladeStatus();
 const filter=(suche?.value||"").toLowerCase();
 liste.innerHTML="";
 effekte.sort((a,b)=>a.name.localeCompare(b.name,"de"));
 effekte.filter(e=>e.name.toLowerCase().includes(filter)).forEach(effekt=>{
   effekt.aktiv=!!status[effekt.name];
   const eintrag=document.createElement("div");
   eintrag.className="effekt";
   const cb=document.createElement("input");
   cb.type="checkbox";
   cb.checked=effekt.aktiv;
   cb.addEventListener("change",()=>{
      status[effekt.name]=cb.checked;
      speichereStatus(status);
      effekt.aktiv=cb.checked;
      if(typeof berechneWerte==="function") berechneWerte();
   });
   const label=document.createElement("label");
   label.appendChild(cb);
   const info=document.createElement("div");
   info.className="effekt-info";
   info.innerHTML=`<div class="effekt-name">${effekt.name}</div><div class="effekt-kategorie">${effekt.kategorie}</div>`;
   if(!effekt.standard){
      const del=document.createElement("button");
      del.textContent="🗑";
      del.onclick=()=>{
        if(confirm("Effekt wirklich löschen?")){
          effekte=effekte.filter(x=>x.id!==effekt.id);
          const ben=effekte.filter(x=>!x.standard);
          speichereBenutzerEffekte(ben);
          baueEffektliste();
        }
      };
      eintrag.append(label,info,del);
   } else {
      eintrag.append(label,info);
   }
   liste.appendChild(eintrag);
 });
 if(suche && !suche.dataset.bound){
    suche.dataset.bound="1";
    suche.addEventListener("input",baueEffektliste);
 }
}

ladeEffekte();

document.addEventListener("DOMContentLoaded",()=>{
 const b=document.getElementById("btnNeuerEffekt");
 if(b){
   b.addEventListener("click",()=>{
      
   });
 }
});

document.addEventListener("DOMContentLoaded",()=>{
 const btn=document.getElementById("btnNeuerEffekt");
 const dlg=document.getElementById("effektDialog");
 document.getElementById("btnSchliessenDialog")?.addEventListener("click",()=>dlg.close());
 btn?.addEventListener("click",()=>dlg.showModal());
 document.getElementById("btnSpeichernEffekt")?.addEventListener("click",()=>{
   const daten=erzeugeEffekt({
    name:effektName.value.trim(),
    kategorie:effektKategorie.value,
    beschreibung:effektBeschreibung.value.trim(),
    quelle:effektQuelle.value.trim()
   });
   let benutzer=ladeBenutzerEffekte()
     .map(effekt=>normalisiereEffekt({...effekt,standard:false}));
   benutzer.push(daten);
   speichereBenutzerEffekte(benutzer);
   effekte.push(daten);
   baueEffektliste();
   dlg.close();
 });
});

// === v0.6.0 foundation ===
// Datenmodell-Vorbereitung für Bonuszeilen
const PF_BONUS_ZIELE = [];
const PF_BONUSARTEN = [];
const PF_BONUSWERTE = [1,2,3,4,5,6,7,8,0,-1,-2,-3,-4,-5,-6,-7,-8];

function neuerLeererBonus(){
    return {
        ziel:"",
        bonusart:"",
        wert:0
    };
}

// ==== v0.6.0 editor scaffold ====
function fuegeBonuszeileHinzu(){
 const c=document.getElementById("bonusContainer");
 if(!c) return;
 const row=document.createElement("div");
 row.className="bonus-zeile";
 row.innerHTML=`
<select disabled><option>Ziel (folgt)</option></select>
<select disabled><option>Bonusart (folgt)</option></select>
<select disabled><option>Wert (folgt)</option></select>
<button type="button">🗑</button>`;
 row.querySelector("button").onclick=()=>row.remove();
 c.appendChild(row);
}
document.addEventListener("DOMContentLoaded",()=>{
 const b=document.getElementById("btnBonusHinzufuegen");
 if(b){
   b.addEventListener("click",fuegeBonuszeileHinzu);
   if(document.getElementById("bonusContainer")?.children.length===0){
      fuegeBonuszeileHinzu();
   }
 }
});
