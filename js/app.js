// Das azlantische Helferlein der Boni
// app.js
// Version 0.9.0

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
 benutzerEffekte:"pf-benutzer-effekte",
 charaktere:"pf-charaktere",
 aktiverCharakter:"pf-aktiver-charakter"
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

let charaktere=[];
let aktiverCharakterId=null;

function neueCharakterId(){
 if(typeof crypto!=="undefined" && typeof crypto.randomUUID==="function"){
   return crypto.randomUUID();
 }
 return "charakter-"+Date.now()+"-"+Math.random().toString(36).slice(2);
}

function normalisiereCharakter(charakter={}){
 return {
   id:charakter.id||neueCharakterId(),
   name:typeof charakter.name==="string" && charakter.name.trim()
     ?charakter.name.trim()
     :"Unbenannter Charakter"
 };
}

function speichereCharaktere(){
 speichereJson(STORAGE_KEYS.charaktere,charaktere);
 if(aktiverCharakterId){
   localStorage.setItem(STORAGE_KEYS.aktiverCharakter,aktiverCharakterId);
 }
}

function findeCharakter(id){
 return charaktere.find(charakter=>charakter.id===id)||null;
}

function aktiverCharakter(){
 return findeCharakter(aktiverCharakterId);
}

function ladeCharaktere(){
 const gespeichert=ladeJson(STORAGE_KEYS.charaktere,[]);
 charaktere=Array.isArray(gespeichert)
   ?gespeichert.map(normalisiereCharakter)
   :[];

 if(charaktere.length===0){
   charaktere=[normalisiereCharakter({name:"Mein Charakter"})];
 }

 const gespeicherteAuswahl=localStorage.getItem(STORAGE_KEYS.aktiverCharakter);
 aktiverCharakterId=findeCharakter(gespeicherteAuswahl)
   ?gespeicherteAuswahl
   :charaktere[0].id;

 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
}

function erstelleCharakter(name){
 const bereinigterName=String(name||"").trim();
 if(!bereinigterName) return null;

 const charakter=normalisiereCharakter({name:bereinigterName});
 charaktere.push(charakter);
 aktiverCharakterId=charakter.id;
 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 return charakter;
}

function waehleCharakter(id){
 if(!findeCharakter(id)) return false;
 aktiverCharakterId=id;
 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 return true;
}

function benenneCharakterUm(id,name){
 const charakter=findeCharakter(id);
 const bereinigterName=String(name||"").trim();
 if(!charakter || !bereinigterName) return false;

 charakter.name=bereinigterName;
 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 return true;
}

function loescheCharakter(id){
 if(charaktere.length<=1) return false;

 const index=charaktere.findIndex(charakter=>charakter.id===id);
 if(index<0) return false;

 charaktere.splice(index,1);
 if(aktiverCharakterId===id){
   aktiverCharakterId=charaktere[Math.min(index,charaktere.length-1)].id;
 }

 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 return true;
}

function aktualisiereAktivenCharakterHinweis(){
 const charakter=aktiverCharakter();
 document.querySelectorAll("[data-aktiver-charakter]").forEach(element=>{
   element.textContent=charakter?.name||"Kein Charakter";
 });
}

function rendereCharaktere(){
 const liste=document.getElementById("charakterListe");
 if(!liste) return;

 liste.innerHTML="";
 charaktere.forEach(charakter=>{
   const eintrag=document.createElement("article");
   eintrag.className="charakter-eintrag";
   if(charakter.id===aktiverCharakterId){
     eintrag.classList.add("aktiv");
   }

   const auswahl=document.createElement("button");
   auswahl.type="button";
   auswahl.className="charakter-auswahl";
   auswahl.setAttribute("aria-pressed",String(charakter.id===aktiverCharakterId));
   auswahl.innerHTML=`<strong>${charakter.name}</strong><span>${charakter.id===aktiverCharakterId?"Aktiv":"Auswählen"}</span>`;
   auswahl.addEventListener("click",()=>waehleCharakter(charakter.id));

   const aktionen=document.createElement("div");
   aktionen.className="charakter-aktionen";

   const umbenennen=document.createElement("button");
   umbenennen.type="button";
   umbenennen.className="icon-button";
   umbenennen.textContent="✏️";
   umbenennen.setAttribute("aria-label",`${charakter.name} umbenennen`);
   umbenennen.addEventListener("click",()=>{
     const name=prompt("Neuer Charaktername:",charakter.name);
     if(name!==null) benenneCharakterUm(charakter.id,name);
   });

   const loeschen=document.createElement("button");
   loeschen.type="button";
   loeschen.className="icon-button";
   loeschen.textContent="🗑";
   loeschen.disabled=charaktere.length<=1;
   loeschen.setAttribute("aria-label",`${charakter.name} löschen`);
   loeschen.addEventListener("click",()=>{
     if(charaktere.length<=1){
       alert("Mindestens ein Charakter muss erhalten bleiben.");
       return;
     }
     if(confirm(`Charakter "${charakter.name}" wirklich löschen?`)){
       loescheCharakter(charakter.id);
     }
   });

   aktionen.append(umbenennen,loeschen);
   eintrag.append(auswahl,aktionen);
   liste.appendChild(eintrag);
 });
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

function normalisiereBonus(bonus={}){
 const wert=Number(bonus.wert);
 return {
   ziel:typeof bonus.ziel==="string"?bonus.ziel:"",
   bonusart:typeof bonus.bonusart==="string"?bonus.bonusart:"",
   wert:Number.isFinite(wert)?wert:0
 };
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
   boni:Array.isArray(effekt.boni)?effekt.boni.map(normalisiereBonus):[]
 };
}

function erzeugeEffekt(daten={}){
 return normalisiereEffekt({
   ...daten,
   standard:false,
   aktiv:false
 });
}

function listeBenutzerEffekte(){
 return effekte.filter(effekt=>!effekt.standard);
}

function speichereAktuelleBenutzerEffekte(){
 speichereBenutzerEffekte(listeBenutzerEffekte());
}

function findeEffekt(id){
 return effekte.find(effekt=>effekt.id===id)||null;
}

function erstelleBenutzerEffekt(daten={}){
 const effekt=erzeugeEffekt(daten);
 effekte.push(effekt);
 speichereAktuelleBenutzerEffekte();
 return effekt;
}

function aktualisiereBenutzerEffekt(id,daten={}){
 const effekt=findeEffekt(id);
 if(!effekt || effekt.standard) return null;

 const aktualisiert=normalisiereEffekt({
   ...effekt,
   ...daten,
   id:effekt.id,
   standard:false
 });

 const index=effekte.findIndex(eintrag=>eintrag.id===id);
 effekte[index]=aktualisiert;
 speichereAktuelleBenutzerEffekte();
 return aktualisiert;
}

function loescheBenutzerEffekt(id){
 const effekt=findeEffekt(id);
 if(!effekt || effekt.standard) return false;

 effekte=effekte.filter(eintrag=>eintrag.id!==id);
 speichereAktuelleBenutzerEffekte();
 return true;
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
   label.className="effekt-aktiv";
   label.appendChild(cb);

   const info=document.createElement("div");
   info.className="effekt-info";
   info.innerHTML=`<div class="effekt-name">${effekt.name}</div><div class="effekt-kategorie">${effekt.kategorie}</div>`;

   if(!effekt.standard){
      const aktionen=document.createElement("div");
      aktionen.className="effekt-aktionen";

      const bearbeiten=document.createElement("button");
      bearbeiten.type="button";
      bearbeiten.className="icon-button";
      bearbeiten.textContent="✏️";
      bearbeiten.setAttribute("aria-label",`${effekt.name} bearbeiten`);
      bearbeiten.onclick=()=>oeffneEffektEditor(effekt.id);

      const del=document.createElement("button");
      del.type="button";
      del.className="icon-button";
      del.textContent="🗑";
      del.setAttribute("aria-label",`${effekt.name} löschen`);
      del.onclick=()=>{
        if(confirm("Effekt wirklich löschen?") && loescheBenutzerEffekt(effekt.id)){
          baueEffektliste();
          if(typeof berechneWerte==="function") berechneWerte();
        }
      };

      aktionen.append(bearbeiten,del);
      eintrag.append(label,info,aktionen);
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

const PF_BONUS_ZIELE=[
 "Angriff Nah",
 "Angriff Fern",
 "Schaden",
 "Rüstungsklasse",
 "RW-Zähigkeit",
 "RW-Reflex",
 "RW-Wille",
 "RW-Furcht",
 "RW-Verzauberung",
 "RW-Bezauberung"
];

const PF_BONUSARTEN=[
 "Unbenannt",
 "Ablenkung",
 "Alchemistisch",
 "Ausweich",
 "Erkenntnis",
 "Heilig",
 "Kompetenz",
 "Moral",
 "Natürlich",
 "Profan",
 "Resistenz",
 "Rüstung",
 "Schild",
 "Umstand",
 "Verbesserung"
];

const PF_BONUSWERTE=[1,2,3,4,5,6,7,8,0,-1,-2,-3,-4,-5,-6,-7,-8];

function neuerLeererBonus(){
 return {
   ziel:PF_BONUS_ZIELE[0],
   bonusart:PF_BONUSARTEN[0],
   wert:0
 };
}

const editorState={
 effektId:null,
 entwurf:null
};

function editorZuruecksetzen(){
 editorState.effektId=null;
 editorState.entwurf=erzeugeEffekt({boni:[neuerLeererBonus()]});
}

function leseEditorFormular(){
 if(!editorState.entwurf) editorZuruecksetzen();

 editorState.entwurf={
   ...editorState.entwurf,
   name:document.getElementById("effektName")?.value.trim()||"",
   kategorie:document.getElementById("effektKategorie")?.value||"",
   beschreibung:document.getElementById("effektBeschreibung")?.value.trim()||"",
   quelle:document.getElementById("effektQuelle")?.value.trim()||"",
   boni:editorState.entwurf.boni.map(normalisiereBonus)
 };

 return editorState.entwurf;
}

function schreibeEditorFormular(){
 if(!editorState.entwurf) editorZuruecksetzen();

 const name=document.getElementById("effektName");
 const kategorie=document.getElementById("effektKategorie");
 const beschreibung=document.getElementById("effektBeschreibung");
 const quelle=document.getElementById("effektQuelle");
 const titel=document.querySelector("#effektDialog h3");

 if(name) name.value=editorState.entwurf.name;
 if(kategorie) kategorie.value=editorState.entwurf.kategorie;
 if(beschreibung) beschreibung.value=editorState.entwurf.beschreibung;
 if(quelle) quelle.value=editorState.entwurf.quelle;
 if(titel) titel.textContent=editorState.effektId?"Effekt bearbeiten":"Neuen Effekt anlegen";

 rendereBonusEditor();
}

function erzeugeOptionen(werte,auswahl){
 return werte.map(wert=>{
   const option=document.createElement("option");
   option.value=String(wert);
   option.textContent=wert>0 && typeof wert==="number"?`+${wert}`:String(wert);
   option.selected=String(wert)===String(auswahl);
   return option;
 });
}

function aktualisiereBonus(index,feld,wert){
 if(!editorState.entwurf?.boni[index]) return;
 editorState.entwurf.boni[index]={
   ...editorState.entwurf.boni[index],
   [feld]:feld==="wert"?Number(wert):wert
 };
}

function entferneBonuszeile(index){
 if(!editorState.entwurf) return;
 editorState.entwurf.boni.splice(index,1);
 rendereBonusEditor();
}

function fuegeBonuszeileHinzu(){
 if(!editorState.entwurf) editorZuruecksetzen();
 editorState.entwurf.boni.push(neuerLeererBonus());
 rendereBonusEditor();
}

function rendereBonusEditor(){
 const container=document.getElementById("bonusContainer");
 if(!container || !editorState.entwurf) return;

 container.innerHTML="";

 if(editorState.entwurf.boni.length===0){
   const hinweis=document.createElement("p");
   hinweis.className="bonus-leer";
   hinweis.textContent="Noch keine Bonuszeile angelegt.";
   container.appendChild(hinweis);
   return;
 }

 editorState.entwurf.boni.forEach((bonus,index)=>{
   const zeile=document.createElement("div");
   zeile.className="bonus-zeile";

   const ziel=document.createElement("select");
   ziel.setAttribute("aria-label",`Ziel der Bonuszeile ${index+1}`);
   ziel.append(...erzeugeOptionen(PF_BONUS_ZIELE,bonus.ziel));
   ziel.addEventListener("change",event=>aktualisiereBonus(index,"ziel",event.target.value));

   const bonusart=document.createElement("select");
   bonusart.setAttribute("aria-label",`Bonusart der Bonuszeile ${index+1}`);
   bonusart.append(...erzeugeOptionen(PF_BONUSARTEN,bonus.bonusart));
   bonusart.addEventListener("change",event=>aktualisiereBonus(index,"bonusart",event.target.value));

   const wert=document.createElement("select");
   wert.setAttribute("aria-label",`Wert der Bonuszeile ${index+1}`);
   wert.append(...erzeugeOptionen(PF_BONUSWERTE,bonus.wert));
   wert.addEventListener("change",event=>aktualisiereBonus(index,"wert",event.target.value));

   const entfernen=document.createElement("button");
   entfernen.type="button";
   entfernen.className="icon-button bonus-entfernen";
   entfernen.textContent="🗑";
   entfernen.setAttribute("aria-label",`Bonuszeile ${index+1} löschen`);
   entfernen.addEventListener("click",()=>entferneBonuszeile(index));

   zeile.append(ziel,bonusart,wert,entfernen);
   container.appendChild(zeile);
 });
}

function oeffneNeuenEffekt(){
 editorZuruecksetzen();
 schreibeEditorFormular();
 document.getElementById("effektDialog")?.showModal();
}

function oeffneEffektEditor(effektId){
 const effekt=findeEffekt(effektId);
 if(!effekt || effekt.standard) return false;

 editorState.effektId=effekt.id;
 editorState.entwurf=normalisiereEffekt({
   ...effekt,
   boni:effekt.boni.map(bonus=>({...bonus}))
 });

 schreibeEditorFormular();
 document.getElementById("effektDialog")?.showModal();
 return true;
}

function schliesseEffektEditor(){
 document.getElementById("effektDialog")?.close();
 editorZuruecksetzen();
}

function speichereEditor(){
 const daten=leseEditorFormular();

 if(!daten.name){
   alert("Bitte gib einen Namen für den Effekt ein.");
   document.getElementById("effektName")?.focus();
   return;
 }

 if(editorState.effektId){
   aktualisiereBenutzerEffekt(editorState.effektId,daten);
 }else{
   erstelleBenutzerEffekt(daten);
 }

 baueEffektliste();
 schliesseEffektEditor();
}

function initialisiereApp(){
  editorZuruecksetzen();
  document.getElementById("btnNeuerEffekt")?.addEventListener("click",oeffneNeuenEffekt);
  document.getElementById("btnSchliessenDialog")?.addEventListener("click",schliesseEffektEditor);
  document.getElementById("btnSpeichernEffekt")?.addEventListener("click",speichereEditor);
  document.getElementById("btnBonusHinzufuegen")?.addEventListener("click",fuegeBonuszeileHinzu);

  const neuerCharakterButton=document.getElementById("btnNeuerCharakter");
  if(neuerCharakterButton && !neuerCharakterButton.dataset.bound){
    neuerCharakterButton.dataset.bound="1";
    neuerCharakterButton.addEventListener("click",()=>{
      const name=prompt("Name des neuen Charakters:","Neuer Charakter");
      if(name!==null) erstelleCharakter(name);
    });
  }

  ladeCharaktere();
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",initialisiereApp,{once:true});
}else{
  initialisiereApp();
}

ladeEffekte();
