// Das azlantische Helferlein der Boni
// app.js
// Version 0.32
const APP_VERSION="0.32";

const seiten={
 dashboard:document.getElementById("dashboard"),
 effekte:document.getElementById("effekte"),
 charaktere:document.getElementById("charaktere"),
 admin:document.getElementById("admin")
};

function zeigeSeite(name){
 Object.values(seiten).forEach(s=>s.style.display="none");
 if(seiten[name]) seiten[name].style.display="block";
}

document.getElementById("btnDashboard").onclick=()=>zeigeSeite("dashboard");
document.getElementById("btnEffekte").onclick=()=>zeigeSeite("effekte");
document.getElementById("btnCharaktere").onclick=()=>zeigeSeite("charaktere");
document.getElementById("btnAdmin").onclick=()=>{ zeigeSeite("admin"); aktualisiereAdminAnsicht(); };
zeigeSeite("dashboard");

let effekte=[];

const STORAGE_KEYS={
 status:"pf-effekte",
 benutzerEffekte:"pf-benutzer-effekte",
 charaktere:"pf-charaktere",
 aktiverCharakter:"pf-aktiver-charakter",
 charakterEffekte:"pf-charakter-effekte",
 charakterEffektAngriffe:"pf-charakter-effekt-angriffe",
 adminPinHash:"pf-admin-pin-hash",
 adminStandardAenderungen:"pf-admin-standard-aenderungen",
 adminStandardNeu:"pf-admin-standard-neu"
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
 ladeStatusFuerCharakter(aktiverCharakterId);
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
 baueEffektliste();
 if(typeof berechneWerte==="function") berechneWerte();
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
 loescheCharakterStatus(id);
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

   const kopieren=document.createElement("button");
   kopieren.type="button";
   kopieren.className="icon-button";
   kopieren.textContent="📋";
   kopieren.disabled=charakter.id===aktiverCharakterId;
   kopieren.setAttribute(
     "aria-label",
     `Effekte von ${charakter.name} auf den aktiven Charakter kopieren`
   );
   kopieren.title=charakter.id===aktiverCharakterId
     ?"Dieser Charakter ist bereits aktiv."
     :"Effektaktivierungen auf den aktiven Charakter kopieren";
   kopieren.addEventListener("click",()=>{
     const ziel=aktiverCharakter();
     if(!ziel || charakter.id===ziel.id) return;

     const bestaetigt=confirm(
       `Die Effektaktivierungen von "${charakter.name}" werden auf "${ziel.name}" kopiert. `+
       `Die bisherigen Aktivierungen von "${ziel.name}" werden ersetzt. Fortfahren?`
     );

     if(bestaetigt && kopiereEffektstatus(charakter.id,ziel.id)){
       alert(`Effektaktivierungen von "${charakter.name}" wurden auf "${ziel.name}" kopiert.`);
     }
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

   aktionen.append(umbenennen,kopieren,loeschen);
   eintrag.append(auswahl,aktionen);
   liste.appendChild(eintrag);
 });
}

function ladeAlleCharakterStatus(){
 const gespeichert=ladeJson(STORAGE_KEYS.charakterEffekte,{});
 return gespeichert && typeof gespeichert==="object" && !Array.isArray(gespeichert)
   ?gespeichert
   :{};
}

function speichereAlleCharakterStatus(statusNachCharakter){
 speichereJson(STORAGE_KEYS.charakterEffekte,statusNachCharakter);
}

function normalisiereStatus(status){
 return status && typeof status==="object" && !Array.isArray(status)?status:{};
}

function ladeStatusFuerCharakter(charakterId){
 if(!charakterId) return {};

 const statusNachCharakter=ladeAlleCharakterStatus();
 if(Object.prototype.hasOwnProperty.call(statusNachCharakter,charakterId)){
   return normalisiereStatus(statusNachCharakter[charakterId]);
 }

 // Einmalige Migration des bisherigen globalen Effektstatus auf den aktiven Charakter.
 const alterGlobalerStatus=normalisiereStatus(ladeJson(STORAGE_KEYS.status,{}));
 statusNachCharakter[charakterId]={...alterGlobalerStatus};
 speichereAlleCharakterStatus(statusNachCharakter);
 return statusNachCharakter[charakterId];
}

function ladeStatus(){
 return ladeStatusFuerCharakter(aktiverCharakterId);
}

function speichereStatus(status){
 if(!aktiverCharakterId) return;
 const statusNachCharakter=ladeAlleCharakterStatus();
 statusNachCharakter[aktiverCharakterId]={...normalisiereStatus(status)};
 speichereAlleCharakterStatus(statusNachCharakter);
}

function ladeAlleEffektAngriffsziele(){
 const gespeichert=ladeJson(STORAGE_KEYS.charakterEffektAngriffe,{});
 return gespeichert && typeof gespeichert==="object" && !Array.isArray(gespeichert)
   ?gespeichert
   :{};
}

function speichereAlleEffektAngriffsziele(zieleNachCharakter){
 speichereJson(STORAGE_KEYS.charakterEffektAngriffe,zieleNachCharakter);
}

function normalisiereAngriffsziel(wert){
 const ziel=String(wert||"-");
 return ["-","A1","A2","A3","A4","A5","A6"].includes(ziel)?ziel:"-";
}

function ladeEffektAngriffszieleFuerCharakter(charakterId=aktiverCharakterId){
 if(!charakterId) return {};
 const alle=ladeAlleEffektAngriffsziele();
 const ziele=alle[charakterId];
 return ziele && typeof ziele==="object" && !Array.isArray(ziele)?ziele:{};
}

function speichereEffektAngriffszieleFuerCharakter(charakterId,ziele){
 if(!charakterId) return;
 const alle=ladeAlleEffektAngriffsziele();
 alle[charakterId]={};
 Object.entries(ziele||{}).forEach(([effektId,ziel])=>{
   alle[charakterId][String(effektId)]=normalisiereAngriffsziel(ziel);
 });
 speichereAlleEffektAngriffsziele(alle);
}

function angriffszielFuerEffekt(effekt,charakterId=aktiverCharakterId){
 if(!effekt?.angriffZuweisbar) return "-";
 const ziele=ladeEffektAngriffszieleFuerCharakter(charakterId);
 return normalisiereAngriffsziel(ziele[String(effekt.id)]);
}

function setzeAngriffszielFuerEffekt(effekt,ziel,charakterId=aktiverCharakterId){
 if(!effekt?.angriffZuweisbar || !charakterId) return false;
 const ziele=ladeEffektAngriffszieleFuerCharakter(charakterId);
 ziele[String(effekt.id)]=normalisiereAngriffsziel(ziel);
 speichereEffektAngriffszieleFuerCharakter(charakterId,ziele);
 return true;
}

function kopiereEffektstatus(quelleId,zielId){
 const quelle=findeCharakter(quelleId);
 const ziel=findeCharakter(zielId);
 if(!quelle || !ziel || quelleId===zielId) return false;

 const statusNachCharakter=ladeAlleCharakterStatus();
 const quellStatus=ladeStatusFuerCharakter(quelleId);
 statusNachCharakter[zielId]={...quellStatus};
 speichereAlleCharakterStatus(statusNachCharakter);

 const quellZiele=ladeEffektAngriffszieleFuerCharakter(quelleId);
 speichereEffektAngriffszieleFuerCharakter(zielId,{...quellZiele});

 if(zielId===aktiverCharakterId){
   baueEffektliste();
   if(typeof berechneWerte==="function") berechneWerte();
 }

 return true;
}

function loescheCharakterStatus(charakterId){
 const statusNachCharakter=ladeAlleCharakterStatus();
 if(Object.prototype.hasOwnProperty.call(statusNachCharakter,charakterId)){
   delete statusNachCharakter[charakterId];
   speichereAlleCharakterStatus(statusNachCharakter);
 }

 const zieleNachCharakter=ladeAlleEffektAngriffsziele();
 if(Object.prototype.hasOwnProperty.call(zieleNachCharakter,charakterId)){
   delete zieleNachCharakter[charakterId];
   speichereAlleEffektAngriffsziele(zieleNachCharakter);
 }
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

function normalisiereBonusart(bonusart){
 const wert=String(bonusart||"").trim();
 const alteBezeichnungen={
   Unbenannt:"Namenlos",
   Unbekannt:"Namenlos",
   Umstand:"Situation"
 };
 return alteBezeichnungen[wert]||wert;
}

function normalisiereBonus(bonus={}){
 const wert=Number(bonus.wert);
 return {
   ziel:typeof bonus.ziel==="string"?bonus.ziel:"",
   bonusart:normalisiereBonusart(bonus.bonusart),
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
   kategorie:normalisiereKategorie(effekt.kategorie),
   beschreibung:effekt.beschreibung||"",
   quelle:effekt.quelle||"",
   angriffZuweisbar:!!effekt.angriffZuweisbar,
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
 if(!effekt || (effekt.standard && !istAdminEntsperrt())) return false;

 effekte=effekte.filter(eintrag=>eintrag.id!==id);
 speichereAktuelleBenutzerEffekte();
 return true;
}


function ladeAdminStandardNeu(){
 const daten=ladeJson(STORAGE_KEYS.adminStandardNeu,[]);
 return Array.isArray(daten)
   ?daten.map(effekt=>normalisiereEffekt({...effekt,standard:true,aktiv:false}))
   :[];
}

function speichereAdminStandardNeu(neueStandardEffekte){
 speichereJson(
   STORAGE_KEYS.adminStandardNeu,
   neueStandardEffekte.map(effekt=>({...normalisiereEffekt({...effekt,standard:true}),aktiv:false}))
 );
}

function neueStandardEffektId(){
 if(typeof crypto!=="undefined" && typeof crypto.randomUUID==="function"){
   return `standard-admin-${crypto.randomUUID()}`;
 }
 return "standard-admin-"+Date.now()+"-"+Math.random().toString(36).slice(2);
}

function istNeuerStandardEffekt(id){
 return ladeAdminStandardNeu().some(effekt=>effekt.id===id);
}

function erstelleStandardEffekt(daten={}){
 if(!istAdminEntsperrt()) return null;

 const effekt=normalisiereEffekt({
   ...daten,
   id:neueStandardEffektId(),
   standard:true,
   aktiv:false
 });

 const neueStandardEffekte=ladeAdminStandardNeu();
 neueStandardEffekte.push(effekt);
 speichereAdminStandardNeu(neueStandardEffekte);
 effekte.push(effekt);
 aktualisiereAdminStatistik();
 return effekt;
}

function ladeAdminStandardAenderungen(){
 const daten=ladeJson(STORAGE_KEYS.adminStandardAenderungen,{});
 return daten && typeof daten==="object" && !Array.isArray(daten)?daten:{};
}

function speichereAdminStandardAenderungen(aenderungen){
 speichereJson(STORAGE_KEYS.adminStandardAenderungen,aenderungen);
}

function angewendeterStandardEffekt(effekt){
 if(!istAdminEntsperrt()) return effekt;
 const aenderungen=ladeAdminStandardAenderungen();
 const entwurf=aenderungen[effekt.id];
 return entwurf?normalisiereEffekt({...effekt,...entwurf,id:effekt.id,standard:true}):effekt;
}

function aktualisiereStandardEffekt(id,daten={}){
 if(!istAdminEntsperrt()) return null;
 const effekt=findeEffekt(id);
 if(!effekt || !effekt.standard) return null;

 const aktualisiert=normalisiereEffekt({
   ...effekt,
   ...daten,
   id:effekt.id,
   standard:true,
   aktiv:effekt.aktiv
 });

 if(istNeuerStandardEffekt(id)){
   const neueStandardEffekte=ladeAdminStandardNeu();
   const indexNeu=neueStandardEffekte.findIndex(eintrag=>eintrag.id===id);
   if(indexNeu>=0){
     neueStandardEffekte[indexNeu]={...aktualisiert,aktiv:false};
     speichereAdminStandardNeu(neueStandardEffekte);
   }
 }else{
   const aenderungen=ladeAdminStandardAenderungen();
   aenderungen[id]={...aktualisiert,aktiv:false};
   speichereAdminStandardAenderungen(aenderungen);
 }

 const index=effekte.findIndex(eintrag=>eintrag.id===id);
 if(index>=0) effekte[index]=aktualisiert;
 aktualisiereAdminStatistik();
 return aktualisiert;
}


function loescheNeuenStandardEffekt(id){
 if(!istAdminEntsperrt() || !istNeuerStandardEffekt(id)) return false;
 const neue=ladeAdminStandardNeu().filter(e=>e.id!==id);
 speichereAdminStandardNeu(neue);
 effekte=effekte.filter(e=>e.id!==id);
 aktualisiereAdminStatistik();
 return true;
}


// Commit 31: Effekt-Duplikate dauerhaft verhindern.
function normalisiereEffektVergleichstext31(wert){
 return String(wert||"")
   .trim()
   .toLocaleLowerCase("de-DE")
   .replace(/\s+/g," ");
}

function effektBonusSignatur31(bonus={}){
 const wert=Number(bonus.wert);
 return [
   normalisiereEffektVergleichstext31(bonus.ziel),
   normalisiereEffektVergleichstext31(bonus.bonusart),
   Number.isFinite(wert)?String(wert):"0"
 ].join(":");
}

function effektSignatur31(effekt={}){
 const boni=Array.isArray(effekt.boni)
   ?effekt.boni.map(effektBonusSignatur31).sort().join(";")
   :"";
 return [
   normalisiereEffektVergleichstext31(effekt.name),
   normalisiereEffektVergleichstext31(effekt.kategorie),
   normalisiereEffektVergleichstext31(effekt.quelle),
   effekt.angriffZuweisbar?"angriff-zuweisbar":"global",
   boni
 ].join("|");
}

function dedupliziereEffekte31(liste=[]){
 const ids=new Set();
 const signaturen=new Set();
 const ergebnis=[];

 (Array.isArray(liste)?liste:[]).forEach(effekt=>{
   if(!effekt || typeof effekt!=="object") return;

   const id=String(effekt.id??"").trim();
   const signatur=effektSignatur31(effekt);

   if((id && ids.has(id)) || (signatur && signaturen.has(signatur))) return;

   if(id) ids.add(id);
   if(signatur) signaturen.add(signatur);
   ergebnis.push(effekt);
 });

 return ergebnis;
}

function entferneDuplikateGegenBasis31(liste=[],basis=[]){
 const basisIds=new Set(
   (Array.isArray(basis)?basis:[])
     .map(effekt=>String(effekt?.id??"").trim())
     .filter(Boolean)
 );
 const basisSignaturen=new Set(
   (Array.isArray(basis)?basis:[])
     .map(effekt=>effektSignatur31(effekt))
     .filter(Boolean)
 );

 return dedupliziereEffekte31(liste).filter(effekt=>{
   const id=String(effekt?.id??"").trim();
   const signatur=effektSignatur31(effekt);
   return !(id && basisIds.has(id)) && !(signatur && basisSignaturen.has(signatur));
 });
}

async function ladeEffekte(){
 try{
   const antwort=await fetch(
     `data/effekte.json?v=${encodeURIComponent(APP_VERSION)}`,
     {cache:"no-store"}
   );
   const standardEffekte=await antwort.json();
   const status=ladeStatus();

   // Reihenfolge der Priorität:
   // 1. Repository-Standardeffekte, 2. neue Admin-Standardeffekte,
   // 3. Benutzereffekte. Bei gleicher ID ODER gleicher Effekt-Signatur
   // bleibt der zuerst vorhandene Eintrag erhalten.
   const standardBasis=dedupliziereEffekte31(
     standardEffekte.map(effekt=>
       angewendeterStandardEffekt(
         normalisiereEffekt({...effekt,standard:true})
       )
     )
   );

   const neueStandardEffekte=entferneDuplikateGegenBasis31(
     ladeAdminStandardNeu(),
     standardBasis
   );
   speichereAdminStandardNeu(neueStandardEffekte);

   const standardGesamt=[...standardBasis,...neueStandardEffekte];

   const benutzerRohdaten=ladeBenutzerEffekte();
   const benutzerNormalisiert=benutzerRohdaten.map(effekt=>
     normalisiereEffekt({...effekt,standard:false})
   );
   const benutzer=entferneDuplikateGegenBasis31(
     benutzerNormalisiert,
     standardGesamt
   );

   // Bereinigten Benutzerbestand zurückschreiben, damit ein beim Import
   // erkanntes Standard-Duplikat nicht beim nächsten Export erneut auftaucht.
   speichereBenutzerEffekte(benutzer);

   effekte=dedupliziereEffekte31([...standardGesamt,...benutzer]);
   effekte.forEach(effekt=>effekt.aktiv=!!status[effekt.name]);

   console.log("Effekte geladen:",effekte.length);
   baueKategorieFilter();
   baueEffektliste();
 }catch(fehler){
   console.error("Fehler beim Laden:",fehler);
 }
}


const PF_EFFEKT_KATEGORIEN=[
 "Ausrüstung",
 "Kampf",
 "Klassenmerkmale",
 "Sonstige",
 "Talente",
 "Volksmerkmale",
 "Zauber",
 "Zustände"
];

function normalisiereKategorie(kategorie){
 const wert=String(kategorie||"").trim();
 const alteBezeichnungen={
   Gegenstand:"Ausrüstung",
   Talent:"Talente",
   Sonstiges:"Sonstige"
 };
 return alteBezeichnungen[wert]||wert;
}

function effektKategorien(){
 const vorhandene=effekte
   .map(effekt=>normalisiereKategorie(effekt.kategorie))
   .filter(Boolean);
 return [...new Set([...PF_EFFEKT_KATEGORIEN,...vorhandene])]
   .sort((a,b)=>a.localeCompare(b,"de"));
}

function baueKategorieFilter(){
 const auswahl=document.getElementById("filterKategorie");
 if(!auswahl) return;

 const bisherigerWert=auswahl.value;
 auswahl.innerHTML="";

 const alle=document.createElement("option");
 alle.value="";
 alle.textContent="Alle Kategorien";
 auswahl.appendChild(alle);

 effektKategorien().forEach(kategorie=>{
   const option=document.createElement("option");
   option.value=kategorie;
   option.textContent=kategorie;
   auswahl.appendChild(option);
 });

 if([...auswahl.options].some(option=>option.value===bisherigerWert)){
   auswahl.value=bisherigerWert;
 }
}

function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 const suche=document.getElementById("suche");
 const kategorieFilter=document.getElementById("filterKategorie");
 const nurAktivFilter=document.getElementById("filterNurAktiv");
 const ergebnis=document.getElementById("filterErgebnis");
 if(!liste) return;

 const status=ladeStatus();
 const suchtext=(suche?.value||"").trim().toLowerCase();
 const kategorie=kategorieFilter?.value||"";
 const nurAktiv=!!nurAktivFilter?.checked;

 liste.innerHTML="";
 effekte.sort((a,b)=>a.name.localeCompare(b.name,"de"));

 const gefilterteEffekte=effekte.filter(effekt=>{
   effekt.aktiv=!!status[effekt.name];

   const passtZurSuche=!suchtext ||
     effekt.name.toLowerCase().includes(suchtext) ||
     String(effekt.beschreibung||"").toLowerCase().includes(suchtext) ||
     String(effekt.quelle||"").toLowerCase().includes(suchtext);

   const passtZurKategorie=!kategorie || effekt.kategorie===kategorie;
   const passtZumAktivFilter=!nurAktiv || effekt.aktiv;

   return passtZurSuche && passtZurKategorie && passtZumAktivFilter;
 });

 if(ergebnis){
   ergebnis.textContent=`${gefilterteEffekte.length} von ${effekte.length} Effekten angezeigt`;
 }

 gefilterteEffekte.forEach(effekt=>{
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

   let angriffsAuswahl=null;
   if(effekt.angriffZuweisbar){
     const zuweisung=document.createElement("label");
     zuweisung.className="effekt-angriffsziel-30";
     const beschriftung=document.createElement("span");
     beschriftung.textContent="Angriff";
     angriffsAuswahl=document.createElement("select");
     angriffsAuswahl.setAttribute("aria-label",`${effekt.name}: betroffenen Angriff wählen`);
     ["-","A1","A2","A3","A4","A5","A6"].forEach(wert=>{
       const option=document.createElement("option");
       option.value=wert;
       option.textContent=wert;
       angriffsAuswahl.appendChild(option);
     });
     angriffsAuswahl.value=angriffszielFuerEffekt(effekt);
     angriffsAuswahl.addEventListener("click",event=>event.stopPropagation());
     angriffsAuswahl.addEventListener("change",event=>{
       event.stopPropagation();
       setzeAngriffszielFuerEffekt(effekt,angriffsAuswahl.value);
       if(typeof berechneWerte==="function") berechneWerte();
     });
     zuweisung.append(beschriftung,angriffsAuswahl);
     info.appendChild(zuweisung);
   }

   const darfBearbeiten=!effekt.standard || istAdminEntsperrt();
   if(darfBearbeiten){
      const aktionen=document.createElement("div");
      aktionen.className="effekt-aktionen";

      const bearbeiten=document.createElement("button");
      bearbeiten.type="button";
      bearbeiten.className="icon-button";
      bearbeiten.textContent="✏️";
      bearbeiten.setAttribute("aria-label",`${effekt.name} bearbeiten`);
      bearbeiten.onclick=()=>oeffneEffektEditor(effekt.id);
      aktionen.appendChild(bearbeiten);

      if(!effekt.standard || (effekt.standard && istNeuerStandardEffekt(effekt.id))){
        const del=document.createElement("button");
        del.type="button";
        del.className="icon-button";
        del.textContent="🗑";
        del.setAttribute("aria-label",`${effekt.name} löschen`);
        del.onclick=()=>{
          if(confirm("Effekt wirklich löschen?")){
            const geloescht=effekt.standard
              ?loescheNeuenStandardEffekt(effekt.id)
              :loescheBenutzerEffekt(effekt.id);
            if(geloescht){
              baueEffektliste();
              if(typeof berechneWerte==="function") berechneWerte();
            }
          }
        };
        aktionen.appendChild(del);
      }

      eintrag.append(label,info,aktionen);
   } else {
      eintrag.append(label,info);
   }
   liste.appendChild(eintrag);
 });

 if(gefilterteEffekte.length===0){
   const hinweis=document.createElement("p");
   hinweis.className="filter-leer";
   hinweis.textContent="Keine Effekte entsprechen den gewählten Filtern.";
   liste.appendChild(hinweis);
 }

 if(suche && !suche.dataset.bound){
    suche.dataset.bound="1";
    suche.addEventListener("input",baueEffektliste);
 }

 if(kategorieFilter && !kategorieFilter.dataset.bound){
    kategorieFilter.dataset.bound="1";
    kategorieFilter.addEventListener("change",baueEffektliste);
 }

 if(nurAktivFilter && !nurAktivFilter.dataset.bound){
    nurAktivFilter.dataset.bound="1";
    nurAktivFilter.addEventListener("change",baueEffektliste);
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
 "Ablenkung",
 "Alchemistisch",
 "Ausweich",
 "Erkenntnis",
 "Glück",
 "Heilig",
 "Kompetenz",
 "Moral",
 "Namenlos",
 "Natürlich",
 "Profan",
 "Resistenz",
 "Rüstung",
 "Schild",
 "Situation",
 "Verbesserung"
];

const PF_BONUSWERTE=[...Array.from({length:20},(_,index)=>20-index),0,...Array.from({length:20},(_,index)=>-(index+1))];

function neuerLeererBonus(){
 return {
   ziel:PF_BONUS_ZIELE[0],
   bonusart:PF_BONUSARTEN[0],
   wert:0
 };
}

const editorState={
 effektId:null,
 entwurf:null,
 standardNeu:false
};

function editorZuruecksetzen(){
 editorState.effektId=null;
 editorState.standardNeu=false;
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
   angriffZuweisbar:!!document.getElementById("effektAngriffZuweisbar")?.checked,
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
 const angriffZuweisbar=document.getElementById("effektAngriffZuweisbar");
 const titel=document.querySelector("#effektDialog h3");

 if(name) name.value=editorState.entwurf.name;
 if(kategorie) kategorie.value=editorState.entwurf.kategorie;
 if(beschreibung) beschreibung.value=editorState.entwurf.beschreibung;
 if(quelle) quelle.value=editorState.entwurf.quelle;
 if(angriffZuweisbar) angriffZuweisbar.checked=!!editorState.entwurf.angriffZuweisbar;
 if(titel){
   titel.textContent=editorState.effektId
     ?"Effekt bearbeiten"
     :(editorState.standardNeu?"Neuen Standardeffekt anlegen":"Neuen Effekt anlegen");
 }

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

function oeffneNeuenStandardEffekt(){
 if(!istAdminEntsperrt()) return false;
 editorZuruecksetzen();
 editorState.standardNeu=true;
 editorState.entwurf=normalisiereEffekt({
   ...editorState.entwurf,
   standard:true,
   boni:[neuerLeererBonus()]
 });
 schreibeEditorFormular();
 document.getElementById("effektDialog")?.showModal();
 return true;
}

function oeffneEffektEditor(effektId){
 const effekt=findeEffekt(effektId);
 if(!effekt || (effekt.standard && !istAdminEntsperrt())) return false;

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
   const effekt=findeEffekt(editorState.effektId);
   if(effekt?.standard){
     aktualisiereStandardEffekt(editorState.effektId,daten);
   }else{
     aktualisiereBenutzerEffekt(editorState.effektId,daten);
   }
 }else if(editorState.standardNeu){
   erstelleStandardEffekt(daten);
 }else{
   erstelleBenutzerEffekt(daten);
 }

 baueEffektliste();
 schliesseEffektEditor();
}


// ==========================
// Admin-Modus mit 4-stelliger PIN
// ==========================

const ADMIN_SESSION_KEY="pf-admin-entsperrt";
const ADMIN_TIMEOUT_MS=15*60*1000;
const ADMIN_MAX_FEHLVERSUCHE=5;
const ADMIN_SPERRE_MS=30*1000;
let adminTimeoutId=null;
let adminFehlversuche=0;
let adminGesperrtBis=0;

function hatAdminPin(){
  return Boolean(localStorage.getItem(STORAGE_KEYS.adminPinHash));
}

function istAdminEntsperrt(){
  return sessionStorage.getItem(ADMIN_SESSION_KEY)==="1";
}

async function bildePinHash(pin){
  const daten=new TextEncoder().encode(pin);
  const hash=await crypto.subtle.digest("SHA-256",daten);
  return Array.from(new Uint8Array(hash)).map(byte=>byte.toString(16).padStart(2,"0")).join("");
}

function istGueltigeAdminPin(pin){
  return /^\d{4}$/.test(pin);
}

function planeAdminSperre(){
  clearTimeout(adminTimeoutId);
  if(!istAdminEntsperrt()) return;
  adminTimeoutId=setTimeout(()=>sperreAdminModus(true),ADMIN_TIMEOUT_MS);
}

function entsperreAdminModus(){
  sessionStorage.setItem(ADMIN_SESSION_KEY,"1");
  adminFehlversuche=0;
  planeAdminSperre();
  aktualisiereAdminAnsicht();
}

function sperreAdminModus(automatisch=false){
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  clearTimeout(adminTimeoutId);
  aktualisiereAdminAnsicht();
  if(automatisch && seiten.admin?.style.display!=="none") alert("Der Admin-Modus wurde nach 15 Minuten automatisch gesperrt.");
}

function bereiteStandardEffektFuerExportVor(effekt){
 return {
   id:effekt.id,
   name:effekt.name,
   kategorie:normalisiereKategorie(effekt.kategorie),
   aktiv:false,
   beschreibung:effekt.beschreibung||"",
   quelle:effekt.quelle||"",
   angriffZuweisbar:!!effekt.angriffZuweisbar,
   boni:Array.isArray(effekt.boni)?effekt.boni.map(normalisiereBonus):[]
 };
}

function erstelleZusammengefuehrteStandardDatenbank(){
 return effekte
   .filter(effekt=>effekt.standard)
   .map(bereiteStandardEffektFuerExportVor)
   .sort((a,b)=>a.name.localeCompare(b.name,"de"));
}

function exportiereStandardDatenbank(){
 if(!istAdminEntsperrt()) return false;

 const daten=erstelleZusammengefuehrteStandardDatenbank();
 const json=JSON.stringify(daten,null,2)+"\n";
 const datei=new Blob([json],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(datei);
 const link=document.createElement("a");

 link.href=url;
 link.download="effekte.json";
 document.body.appendChild(link);
 link.click();
 link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),0);

 alert(
   `${daten.length} Standardeffekte wurden als effekte.json exportiert. `+
   `Die Datei enthält originale, bearbeitete und neu angelegte Standardeffekte.`
 );
 return true;
}

function aktualisiereAdminStatistik(){
 const standardAnzahl=effekte.filter(effekt=>effekt.standard).length;
 const geaendertAnzahl=Object.keys(ladeAdminStandardAenderungen()).length;
 const neuAnzahl=ladeAdminStandardNeu().length;
 const standardEl=document.getElementById("adminStandardAnzahl");
 const geaendertEl=document.getElementById("adminGeaendertAnzahl");
 const neuEl=document.getElementById("adminNeuAnzahl");
 if(standardEl) standardEl.textContent=String(standardAnzahl);
 if(geaendertEl) geaendertEl.textContent=String(geaendertAnzahl);
 if(neuEl) neuEl.textContent=String(neuAnzahl);
}

function stelleAdminWerkzeugeBereit(){
 const werkzeuge=document.getElementById("adminWerkzeuge");
 if(!werkzeuge) return;

 if(!document.getElementById("btnNeuerStandardEffekt")){
   const button=document.createElement("button");
   button.type="button";
   button.id="btnNeuerStandardEffekt";
   button.textContent="➕ Neuer Standardeffekt";
   button.addEventListener("click",oeffneNeuenStandardEffekt);
   werkzeuge.appendChild(button);
 }

 if(!document.getElementById("btnExportStandardEffekte")){
   const exportButton=document.createElement("button");
   exportButton.type="button";
   exportButton.id="btnExportStandardEffekte";
   exportButton.textContent="⬇️ effekte.json exportieren";
   exportButton.addEventListener("click",exportiereStandardDatenbank);
   werkzeuge.appendChild(exportButton);
 }

 if(!document.getElementById("adminNeuAnzahl")){
   const statistik=document.createElement("p");
   statistik.className="admin-statistik-neu";
   statistik.innerHTML='Neu: <strong id="adminNeuAnzahl">0</strong>';
   werkzeuge.appendChild(statistik);
 }
}

function aktualisiereAdminAnsicht(){
  stelleAdminWerkzeugeBereit();
  const aktiv=istAdminEntsperrt();
  const status=document.getElementById("adminStatus");
  const gesperrt=document.getElementById("adminGesperrt");
  const werkzeuge=document.getElementById("adminWerkzeuge");
  const sperren=document.getElementById("btnAdminSperren");
  if(status){
    status.textContent=aktiv?"Entsperrt":"Gesperrt";
    status.classList.toggle("aktiv",aktiv);
  }
  if(gesperrt) gesperrt.hidden=aktiv;
  if(werkzeuge) werkzeuge.hidden=!aktiv;
  if(sperren) sperren.hidden=!aktiv;
  aktualisiereAdminStatistik();
  if(typeof baueEffektliste==="function") baueEffektliste();
}

function oeffneAdminPinDialog(){
  const dialog=document.getElementById("adminPinDialog");
  const erstmalig=!hatAdminPin();
  const titel=document.getElementById("adminPinTitel");
  const hinweis=document.getElementById("adminPinHinweis");
  const bestaetigung=document.getElementById("adminPinBestaetigen");
  const bestaetigungLabel=document.getElementById("adminPinBestaetigenLabel");
  const fehler=document.getElementById("adminPinFehler");
  document.getElementById("adminPinForm")?.reset();
  if(titel) titel.textContent=erstmalig?"Admin-PIN festlegen":"Admin-Modus öffnen";
  if(hinweis) hinweis.textContent=erstmalig?"Lege eine vierstellige PIN fest.":"Bitte vierstellige PIN eingeben.";
  if(bestaetigung){ bestaetigung.hidden=!erstmalig; bestaetigung.required=erstmalig; }
  if(bestaetigungLabel) bestaetigungLabel.hidden=!erstmalig;
  if(fehler) fehler.textContent="";
  dialog?.showModal();
  setTimeout(()=>document.getElementById("adminPin")?.focus(),0);
}

async function verarbeiteAdminPin(event){
  event.preventDefault();
  const fehler=document.getElementById("adminPinFehler");
  const pin=document.getElementById("adminPin")?.value||"";
  const bestaetigung=document.getElementById("adminPinBestaetigen")?.value||"";
  const restzeit=adminGesperrtBis-Date.now();
  if(restzeit>0){
    if(fehler) fehler.textContent=`Zu viele Fehlversuche. Bitte in ${Math.ceil(restzeit/1000)} Sekunden erneut versuchen.`;
    return;
  }
  if(!istGueltigeAdminPin(pin)){
    if(fehler) fehler.textContent="Die PIN muss genau aus vier Ziffern bestehen.";
    return;
  }
  if(!hatAdminPin()){
    if(pin!==bestaetigung){
      if(fehler) fehler.textContent="Die beiden PIN-Eingaben stimmen nicht überein.";
      return;
    }
    localStorage.setItem(STORAGE_KEYS.adminPinHash,await bildePinHash(pin));
    entsperreAdminModus();
    document.getElementById("adminPinDialog")?.close();
    return;
  }
  const stimmt=(await bildePinHash(pin))===localStorage.getItem(STORAGE_KEYS.adminPinHash);
  if(stimmt){
    entsperreAdminModus();
    document.getElementById("adminPinDialog")?.close();
    return;
  }
  adminFehlversuche+=1;
  if(adminFehlversuche>=ADMIN_MAX_FEHLVERSUCHE){
    adminGesperrtBis=Date.now()+ADMIN_SPERRE_MS;
    adminFehlversuche=0;
    if(fehler) fehler.textContent="Zu viele Fehlversuche. Die Eingabe ist für 30 Sekunden gesperrt.";
  }else if(fehler){
    fehler.textContent=`PIN falsch. Noch ${ADMIN_MAX_FEHLVERSUCHE-adminFehlversuche} Versuch(e).`;
  }
}

function initialisiereAdminModus(){
  aktualisiereAdminAnsicht();
  if(istAdminEntsperrt()) planeAdminSperre();
  document.getElementById("btnAdminEntsperren")?.addEventListener("click",oeffneAdminPinDialog);
  document.getElementById("btnAdminSperren")?.addEventListener("click",()=>sperreAdminModus(false));
  document.getElementById("adminPinForm")?.addEventListener("submit",verarbeiteAdminPin);
  document.getElementById("btnAdminPinAbbrechen")?.addEventListener("click",()=>document.getElementById("adminPinDialog")?.close());
  ["pointerdown","keydown","touchstart"].forEach(ereignis=>document.addEventListener(ereignis,()=>{
    if(istAdminEntsperrt()) planeAdminSperre();
  },{passive:true}));
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
  initialisiereAdminModus();
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",initialisiereApp,{once:true});
}else{
  initialisiereApp();
}

ladeEffekte();
