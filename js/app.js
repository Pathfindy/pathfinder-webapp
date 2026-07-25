// Das azlantische Helferlein der Boni
// app.js
// Version 0.3.3

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

async function ladeEffekte(){
 try{
   const antwort=await fetch("data/effekte.json");
   effekte=await antwort.json();
   console.log("Effekte geladen:",effekte.length);
   const status=JSON.parse(localStorage.getItem("pf-effekte")||"{}");
   effekte.forEach(e=>e.aktiv=!!status[e.name]);
   const benutzer=JSON.parse(localStorage.getItem("pf-benutzer-effekte")||"[]"); effekte=effekte.concat(benutzer); baueEffektliste();
 }catch(fehler){
   console.error("Fehler beim Laden:",fehler);
 }
}


function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 const suche=document.getElementById("suche");
 if(!liste) return;
 const status=JSON.parse(localStorage.getItem("pf-effekte")||"{}");
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
      localStorage.setItem("pf-effekte",JSON.stringify(status));
      effekt.aktiv=cb.checked;
      if(typeof berechneWerte==="function") berechneWerte();
   });
   const label=document.createElement("label");
   label.appendChild(cb);
   const info=document.createElement("div");
   info.className="effekt-info";
   info.innerHTML=`<div class="effekt-name">${effekt.name}</div><div class="effekt-kategorie">${effekt.kategorie}</div>`;
   eintrag.append(label,info);
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
   const daten={
    name:effektName.value,
    kategorie:effektKategorie.value,
    beschreibung:effektBeschreibung.value,
    quelle:effektQuelle.value
   };
   let benutzer=JSON.parse(localStorage.getItem("pf-benutzer-effekte")||"[]");
   daten.aktiv=false;
   benutzer.push(daten);
   localStorage.setItem("pf-benutzer-effekte",JSON.stringify(benutzer));
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

function normalisiereEffekt(effekt){
    if(!Array.isArray(effekt.boni)){
        effekt.boni=[];
    }
    return effekt;
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
