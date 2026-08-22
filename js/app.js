// Das azlantische Helferlein der Boni
// app.js
// Version 0.32
const APP_VERSION="0.44.4";

const seiten={
 dashboard:document.getElementById("dashboard"),
 effekte:document.getElementById("effekte"),
 charakterwerte:document.getElementById("charakterwerte"),
 leben:document.getElementById("leben"),
 vermoegen:document.getElementById("vermoegen"),
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
 charakterEffektStufen:"pf-charakter-effekt-stufen",
 charakterEffektOptionen:"pf-charakter-effekt-optionen",
 charakterEffektFilter:"pf-charakter-effekt-filter",
 aktiveKampagne:"pf-aktive-kampagne",
 kampagnen:"pf-kampagnen",
 adminPinHash:"pf-admin-pin-hash",
 adminStandardAenderungen:"pf-admin-standard-aenderungen",
 adminStandardNeu:"pf-admin-standard-neu",
 adminStandardGeloescht:"pf-admin-standard-geloescht"
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

function normalisiereKlassen(klassen){
 const quelle=Array.isArray(klassen)?klassen:[];
 return quelle
   .map(eintrag=>({
     name:typeof eintrag?.name==="string"?eintrag.name.trim():"",
     stufe:Number.isFinite(Number(eintrag?.stufe))
       ?Math.max(0,Math.min(99,Math.trunc(Number(eintrag.stufe))))
       :0
   }))
   .filter(eintrag=>eintrag.name || eintrag.stufe>0);
}


const PF_ATTRIBUTE=["ST","GE","KO","IN","WE","CH"];

function normalisiereAttribute(attribute){
 const quelle=attribute && typeof attribute==="object" && !Array.isArray(attribute)
   ?attribute
   :{};
 const ergebnis={};
 PF_ATTRIBUTE.forEach(key=>{
   const wert=Number(quelle[key]);
   ergebnis[key]=Number.isFinite(wert)
     ?Math.max(1,Math.min(40,Math.trunc(wert)))
     :10;
 });
 return ergebnis;
}

function attributGrundwert(charakter,key){
 const attribute=normalisiereAttribute(charakter?.attribute);
 return attribute[key] ?? 10;
}

function attributBonusZiel(key){
 return `Attribut ${key}`;
}

function attributAktuellerWert(charakter,key){
 const grund=attributGrundwert(charakter,key);
 if(typeof berechneBonusErgebnis!=="function") return grund;
 const ergebnis=berechneBonusErgebnis(typeof effekte!=="undefined"?effekte:[]);
 return grund + Number(ergebnis[attributBonusZiel(key)]||0);
}

function attributModifikatorAusWert(wert){
 const zahl=Number(wert);
 const sicher=Number.isFinite(zahl)?Math.trunc(zahl):10;
 return Math.floor((sicher-10)/2);
}

function attributModifikator(charakter,key){
 return attributModifikatorAusWert(attributAktuellerWert(charakter,key));
}

function setzeCharakterAttribut(id,key,wert){
 if(!PF_ATTRIBUTE.includes(key)) return false;
 const charakter=findeCharakter(id);
 if(!charakter) return false;
 charakter.attribute=normalisiereAttribute(charakter.attribute);
 charakter.attribute[key]=Math.max(1,Math.min(40,Math.trunc(Number(wert)||10)));
 speichereCharaktere();
 if(typeof berechneWerte==="function") berechneWerte();
 if(typeof window.aktualisiereAttributeAnsicht44==="function"){
   window.aktualisiereAttributeAnsicht44(id);
 }
 return true;
}

function normalisiereCharakter(charakter={}){
 return {
   id:charakter.id||neueCharakterId(),
   name:typeof charakter.name==="string" && charakter.name.trim()
     ?charakter.name.trim()
     :"Unbenannter Charakter",
   kampagne:typeof charakter.kampagne==="string" && charakter.kampagne.trim()
     ?charakter.kampagne.trim()
     :"Charakter ohne Kampagnenzuordnung",
   klassen:normalisiereKlassen(charakter.klassen),
   attribute:normalisiereAttribute(charakter.attribute),
   gab:Number.isFinite(Number(charakter.gab))
     ?Math.max(0,Math.min(99,Math.trunc(Number(charakter.gab))))
     :0,
   vermoegen:charakter.vermoegen && typeof charakter.vermoegen==="object"
     ?charakter.vermoegen
     :undefined
 };
}

function charakterGesamtstufe(charakter=aktiverCharakter()){
 if(!charakter) return 0;
 return normalisiereKlassen(charakter.klassen)
   .reduce((summe,eintrag)=>summe+Number(eintrag.stufe||0),0);
}

function charakterGAB(charakter=aktiverCharakter()){
 if(!charakter) return 0;
 const wert=Number(charakter.gab);
 return Number.isFinite(wert)?Math.max(0,Math.trunc(wert)):0;
}

function setzeCharakterGAB(id,wert){
 const charakter=findeCharakter(id);
 if(!charakter) return false;
 charakter.gab=Math.max(0,Math.min(99,Math.trunc(Number(wert)||0)));
 speichereCharaktere();
 if(id===aktiverCharakterId && typeof baueEffektliste==="function") baueEffektliste();
 if(typeof berechneWerte==="function") berechneWerte();
 if(typeof window.aktualisiereAlleAnsichten==="function") window.aktualisiereAlleAnsichten();
 return true;
}


function charakterKlassenstufe(charakter,klasse){
 const name=String(klasse||"").trim().toLocaleLowerCase("de");
 if(!charakter || !name) return 0;
 return normalisiereKlassen(charakter.klassen)
   .filter(eintrag=>eintrag.name.toLocaleLowerCase("de")===name)
   .reduce((summe,eintrag)=>summe+Number(eintrag.stufe||0),0);
}

function setzeCharakterKlassen(id,klassen){
 const charakter=findeCharakter(id);
 if(!charakter) return false;
 charakter.klassen=normalisiereKlassen(klassen);
 speichereCharaktere();
 if(typeof window.rendereKampagnenBaum==="function") window.rendereKampagnenBaum();
 if(id===aktiverCharakterId && typeof baueEffektliste==="function") baueEffektliste();
 if(typeof window.aktualisiereAlleAnsichten==="function") window.aktualisiereAlleAnsichten();
 return true;
}

function speichereCharaktere(){
 speichereJson(STORAGE_KEYS.charaktere,charaktere);
 if(aktiverCharakterId){
   localStorage.setItem(STORAGE_KEYS.aktiverCharakter,aktiverCharakterId);
 }
}

function speichereCharaktereSofort(){
 speichereCharaktere();
}

window.addEventListener("pagehide",speichereCharaktereSofort);
window.addEventListener("beforeunload",speichereCharaktereSofort);


function findeCharakter(id){
 return charaktere.find(charakter=>charakter.id===id)||null;
}

function aktiverCharakter(){
 return findeCharakter(aktiverCharakterId);
}

function kampagnenListe(){
 const gespeichert=ladeJson(STORAGE_KEYS.kampagnen,[]);
 const vorhanden=new Set();
 const liste=[];

 (Array.isArray(gespeichert)?gespeichert:[]).forEach(name=>{
   const bereinigt=String(name||"").trim();
   if(bereinigt && !vorhanden.has(bereinigt)){
     vorhanden.add(bereinigt);
     liste.push(bereinigt);
   }
 });

 charaktere.forEach(charakter=>{
   const name=String(charakter.kampagne||"Charakter ohne Kampagnenzuordnung").trim()||"Charakter ohne Kampagnenzuordnung";
   if(!vorhanden.has(name)){
     vorhanden.add(name);
     liste.push(name);
   }
 });

 if(!vorhanden.has("Charakter ohne Kampagnenzuordnung")) liste.push("Charakter ohne Kampagnenzuordnung");
 return liste;
}

function speichereKampagnen(namen){
 const liste=[...new Set((namen||[]).map(name=>String(name||"").trim()).filter(Boolean))];
 speichereJson(STORAGE_KEYS.kampagnen,liste);
}

function erstelleKampagne(name){
 const neu=String(name||"").trim();
 if(!neu) return false;
 const kampagnen=kampagnenListe();
 if(!kampagnen.includes(neu)){
   kampagnen.unshift(neu);
   speichereKampagnen(kampagnen);
 }
 if(typeof window.rendereKampagnenBaum==="function") window.rendereKampagnenBaum();
 return true;
}

function verschiebeKampagne(name,richtung){
 const kampagne=String(name||"").trim();
 const liste=kampagnenListe();
 const index=liste.indexOf(kampagne);
 if(index<0) return false;

 const zielIndex=richtung==="hoch" ? index-1 : index+1;
 if(zielIndex<0 || zielIndex>=liste.length) return false;

 [liste[index],liste[zielIndex]]=[liste[zielIndex],liste[index]];
 speichereKampagnen(liste);
 if(typeof window.rendereKampagnenBaum==="function") window.rendereKampagnenBaum();
 return true;
}


function loescheKampagne(name){
 const kampagne=String(name||"").trim();
 if(!kampagne || kampagne==="Charakter ohne Kampagnenzuordnung") return false;

 const standard="Charakter ohne Kampagnenzuordnung";
 charaktere.forEach(charakter=>{
   if((charakter.kampagne||standard)===kampagne) charakter.kampagne=standard;
 });

 const verbleibend=kampagnenListe().filter(eintrag=>eintrag!==kampagne);
 speichereKampagnen(verbleibend);
 speichereCharaktere();

 if(aktiveKampagne()===kampagne){
   localStorage.setItem(STORAGE_KEYS.aktiveKampagne,standard);
   const kandidat=charaktere.find(c=>(c.kampagne||standard)===standard);
   if(kandidat) aktiverCharakterId=kandidat.id;
 }

 rendereCharaktere();
 if(typeof window.aktualisiereGlobaleCharakterauswahl==="function") window.aktualisiereGlobaleCharakterauswahl();
 if(typeof window.rendereKampagnenBaum==="function") window.rendereKampagnenBaum();
 if(typeof window.aktualisiereAlleAnsichten==="function") window.aktualisiereAlleAnsichten();
 return true;
}

function aktiveKampagne(){
 const gespeichert=localStorage.getItem(STORAGE_KEYS.aktiveKampagne);
 const kampagnen=kampagnenListe();
 if(gespeichert && kampagnen.includes(gespeichert)) return gespeichert;
 return aktiverCharakter()?.kampagne || kampagnen[0] || "Charakter ohne Kampagnenzuordnung";
}

function setzeAktiveKampagne(name){
 const kampagne=String(name||"").trim()||"Charakter ohne Kampagnenzuordnung";
 localStorage.setItem(STORAGE_KEYS.aktiveKampagne,kampagne);
 const kandidaten=charaktere.filter(charakter=>charakter.kampagne===kampagne);
 if(kandidaten.length && !kandidaten.some(charakter=>charakter.id===aktiverCharakterId)){
   aktiverCharakterId=kandidaten[0].id;
   speichereCharaktere();
   setzeStandardEffektFilterFuerCharakter(aktiverCharakterId);
   ladeStatusFuerCharakter(aktiverCharakterId);
   baueEffektliste();
 }
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 if(typeof window.aktualisiereGlobaleCharakterauswahl==="function") {
   window.aktualisiereGlobaleCharakterauswahl();
 }
 if(typeof window.aktualisiereAlleAnsichten==="function") {
   window.aktualisiereAlleAnsichten();
 }
 return kampagne;
}

function setzeCharakterKampagne(id,name){
 const charakter=findeCharakter(id);
 if(!charakter) return false;
 const kampagne=String(name||"").trim()||"Charakter ohne Kampagnenzuordnung";
 charakter.kampagne=kampagne;
 erstelleKampagne(kampagne);
 speichereCharaktere();
 rendereCharaktere();
 if(typeof window.aktualisiereGlobaleCharakterauswahl==="function") {
   window.aktualisiereGlobaleCharakterauswahl();
 }
 if(typeof window.rendereKampagnenBaum==="function") window.rendereKampagnenBaum();
 return true;
}

function aktualisiereAlleAnsichten(){
 if(typeof berechneWerte==="function") berechneWerte();
 if(typeof window.aktualisiereTrefferpunkteAnsicht==="function") window.aktualisiereTrefferpunkteAnsicht();
 if(typeof window.aktualisiereAngriffeAnsicht==="function") window.aktualisiereAngriffeAnsicht();
 if(typeof window.rendereEnergieAnsicht==="function") window.rendereEnergieAnsicht();
 if(typeof window.aktualisiereGlobaleCharakterauswahl==="function") window.aktualisiereGlobaleCharakterauswahl();
}
window.aktualisiereAlleAnsichten=aktualisiereAlleAnsichten;

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

 const charakter=normalisiereCharakter({name:bereinigterName,kampagne:aktiveKampagne()});
 charaktere.push(charakter);
 aktiverCharakterId=charakter.id;
 speichereCharaktere();
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 return charakter;
}

function waehleCharakter(id){
 if(!findeCharakter(id)) return false;
 speichereCharaktere();
 aktiverCharakterId=id;
 speichereCharaktere();
 setzeStandardEffektFilterFuerCharakter(id);
 rendereCharaktere();
 aktualisiereAktivenCharakterHinweis();
 baueEffektliste();
 aktualisiereAlleAnsichten();
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

 let datalist=document.getElementById("kampagnenVorschlaege");
 if(!datalist){
   datalist=document.createElement("datalist");
   datalist.id="kampagnenVorschlaege";
   document.body.appendChild(datalist);
 }
 datalist.innerHTML="";
 kampagnenListe().forEach(name=>{
   const option=document.createElement("option");
   option.value=name;
   datalist.appendChild(option);
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

function migriereEffektStatus39_8(status){
 const neu={...normalisiereStatus(status)};

 if(!Object.prototype.hasOwnProperty.call(neu,"Heftiger Angriff")){
   const alte=Object.keys(neu).filter(name=>name.startsWith("Heftiger Angriff ("));
   if(alte.some(name=>!!neu[name])) neu["Heftiger Angriff"]=true;
 }

 if(!Object.prototype.hasOwnProperty.call(neu,"Mächtige magische Fänge")){
   const alte=Object.keys(neu).filter(name=>name.startsWith("Mächtige magische Fänge ("));
   if(alte.some(name=>!!neu[name])) neu["Mächtige magische Fänge"]=true;
 }

 return neu;
}

function ladeStatusFuerCharakter(charakterId){
 if(!charakterId) return {};

 const statusNachCharakter=ladeAlleCharakterStatus();
 if(Object.prototype.hasOwnProperty.call(statusNachCharakter,charakterId)){
   const migriert=migriereEffektStatus39_8(statusNachCharakter[charakterId]);
   statusNachCharakter[charakterId]=migriert;
   speichereAlleCharakterStatus(statusNachCharakter);
   return migriert;
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

const EFFEKT_ANGRIFFSZIELE=["A1","A2","A3","A4","A5","A6"];
const EFFEKT_ANGRIFFSZIELE_MAX=3;

function normalisiereAngriffsziel(wert){
 const ziel=String(wert||"-");
 return ["-",...EFFEKT_ANGRIFFSZIELE].includes(ziel)?ziel:"-";
}

function normalisiereAngriffsziele(wert,maximal=EFFEKT_ANGRIFFSZIELE_MAX){
 const quelle=Array.isArray(wert)?wert:[wert];
 const ergebnis=[];
 quelle.forEach(eintrag=>{
   const ziel=normalisiereAngriffsziel(eintrag);
   if(ziel!=="-" && !ergebnis.includes(ziel) && ergebnis.length<maximal){
     ergebnis.push(ziel);
   }
 });
 return ergebnis;
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
 Object.entries(ziele||{}).forEach(([effektId,wert])=>{
   alle[charakterId][String(effektId)]=normalisiereAngriffsziele(wert);
 });
 speichereAlleEffektAngriffsziele(alle);
}

function angriffszieleFuerEffekt(effekt,charakterId=aktiverCharakterId){
 if(!effekt?.angriffZuweisbar) return [];
 const ziele=ladeEffektAngriffszieleFuerCharakter(charakterId);
 const maximal=effekt?.sonderlogik==="maechtige-magische-faenge"?1:EFFEKT_ANGRIFFSZIELE_MAX;
 return normalisiereAngriffsziele(ziele[String(effekt.id)],maximal);
}

function angriffszielFuerEffekt(effekt,charakterId=aktiverCharakterId){
 return angriffszieleFuerEffekt(effekt,charakterId)[0]||"-";
}

function setzeAngriffszieleFuerEffekt(effekt,neueZiele,charakterId=aktiverCharakterId){
 if(!effekt?.angriffZuweisbar || !charakterId) return false;
 const maximal=effekt?.sonderlogik==="maechtige-magische-faenge"?1:EFFEKT_ANGRIFFSZIELE_MAX;
 const ziele=ladeEffektAngriffszieleFuerCharakter(charakterId);
 ziele[String(effekt.id)]=normalisiereAngriffsziele(neueZiele,maximal);
 speichereEffektAngriffszieleFuerCharakter(charakterId,ziele);
 return true;
}

function setzeAngriffszielFuerEffekt(effekt,ziel,charakterId=aktiverCharakterId){
 return setzeAngriffszieleFuerEffekt(effekt,ziel==="-"?[]:[ziel],charakterId);
}

function ladeAlleEffektOptionen(){
 const gespeichert=ladeJson(STORAGE_KEYS.charakterEffektOptionen,{});
 return gespeichert && typeof gespeichert==="object" && !Array.isArray(gespeichert)
   ?gespeichert
   :{};
}

function effektOptionenFuerCharakter(effektId,charakterId=aktiverCharakterId){
 if(!effektId || !charakterId) return {};
 const alle=ladeAlleEffektOptionen();
 const optionen=alle?.[charakterId]?.[String(effektId)];
 return optionen && typeof optionen==="object" && !Array.isArray(optionen)
   ?{...optionen}
   :{};
}

function setzeEffektOptionenFuerCharakter(effektId,optionen,charakterId=aktiverCharakterId){
 if(!effektId || !charakterId) return false;
 const alle=ladeAlleEffektOptionen();
 if(!alle[charakterId]) alle[charakterId]={};
 alle[charakterId][String(effektId)]={
   ...(alle[charakterId][String(effektId)]||{}),
   ...(optionen||{})
 };
 speichereJson(STORAGE_KEYS.charakterEffektOptionen,alle);
 return true;
}

function ladeAlleEffektFilter(){
 const gespeichert=ladeJson(STORAGE_KEYS.charakterEffektFilter,{});
 return gespeichert && typeof gespeichert==="object" && !Array.isArray(gespeichert)
   ?gespeichert
   :{};
}

function effektFilterFuerCharakter(charakterId=aktiverCharakterId){
 if(!charakterId) return {kategorien:null,suche:"",nurAktiv:false,nurFavoriten:false};
 const alle=ladeAlleEffektFilter();
 const wert=alle[charakterId];
 if(!wert || typeof wert!=="object" || Array.isArray(wert)){
   return {kategorien:null,suche:"",nurAktiv:false,nurFavoriten:false};
 }
 return {
   kategorien:Array.isArray(wert.kategorien)?wert.kategorien.map(String):null,
   suche:typeof wert.suche==="string"?wert.suche:"",
   nurAktiv:!!wert.nurAktiv,
   nurFavoriten:!!wert.nurFavoriten
 };
}

function speichereEffektFilterFuerCharakter(filter,charakterId=aktiverCharakterId){
 if(!charakterId) return false;
 const alle=ladeAlleEffektFilter();
 alle[charakterId]={
   kategorien:Array.isArray(filter?.kategorien)?[...new Set(filter.kategorien.map(String))]:null,
   suche:typeof filter?.suche==="string"?filter.suche:"",
   nurAktiv:!!filter?.nurAktiv,
   nurFavoriten:!!filter?.nurFavoriten
 };
 speichereJson(STORAGE_KEYS.charakterEffektFilter,alle);
 return true;
}

function setzeStandardEffektFilterFuerCharakter(charakterId=aktiverCharakterId){
 if(!charakterId) return false;
 return speichereEffektFilterFuerCharakter({
   kategorien:null,
   suche:"",
   nurAktiv:false,
   nurFavoriten:false
 },charakterId);
}

function ladeAlleEffektStufen(){
 const gespeichert=ladeJson(STORAGE_KEYS.charakterEffektStufen,{});
 return gespeichert && typeof gespeichert==="object" && !Array.isArray(gespeichert)
   ?gespeichert
   :{};
}

function effektStufeFuerCharakter(effektId,charakterId=aktiverCharakterId){
 if(!effektId || !charakterId) return "";
 const alle=ladeAlleEffektStufen();
 const wert=alle?.[charakterId]?.[String(effektId)];
 return Number.isFinite(Number(wert))?Math.max(0,Math.trunc(Number(wert))):"";
}

function setzeEffektStufeFuerCharakter(effektId,wert,charakterId=aktiverCharakterId){
 if(!effektId || !charakterId) return false;
 const alle=ladeAlleEffektStufen();
 if(!alle[charakterId]) alle[charakterId]={};
 if(wert==="" || wert===null || typeof wert==="undefined"){
   delete alle[charakterId][String(effektId)];
 }else{
   alle[charakterId][String(effektId)]=Math.max(0,Math.min(99,Math.trunc(Number(wert)||0)));
 }
 speichereJson(STORAGE_KEYS.charakterEffektStufen,alle);
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

 const alleStufen=ladeAlleEffektStufen();
 if(alleStufen[quelleId]){
   alleStufen[zielId]={...alleStufen[quelleId]};
   speichereJson(STORAGE_KEYS.charakterEffektStufen,alleStufen);
 }

 const alleOptionen=ladeAlleEffektOptionen();
 if(alleOptionen[quelleId]){
   alleOptionen[zielId]=JSON.parse(JSON.stringify(alleOptionen[quelleId]));
   speichereJson(STORAGE_KEYS.charakterEffektOptionen,alleOptionen);
 }

 const alleFilter=ladeAlleEffektFilter();
 if(alleFilter[quelleId]){
   alleFilter[zielId]=JSON.parse(JSON.stringify(alleFilter[quelleId]));
   speichereJson(STORAGE_KEYS.charakterEffektFilter,alleFilter);
 }

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

 const stufenNachCharakter=ladeAlleEffektStufen();
 if(Object.prototype.hasOwnProperty.call(stufenNachCharakter,charakterId)){
   delete stufenNachCharakter[charakterId];
   speichereJson(STORAGE_KEYS.charakterEffektStufen,stufenNachCharakter);
 }

 const optionenNachCharakter=ladeAlleEffektOptionen();
 if(Object.prototype.hasOwnProperty.call(optionenNachCharakter,charakterId)){
   delete optionenNachCharakter[charakterId];
   speichereJson(STORAGE_KEYS.charakterEffektOptionen,optionenNachCharakter);
 }

 const filterNachCharakter=ladeAlleEffektFilter();
 if(Object.prototype.hasOwnProperty.call(filterNachCharakter,charakterId)){
   delete filterNachCharakter[charakterId];
   speichereJson(STORAGE_KEYS.charakterEffektFilter,filterNachCharakter);
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
   wert:Number.isFinite(wert)?wert:0,
   wertQuelle:["stufenwert","nutzerwert"].includes(bonus.wertQuelle)?bonus.wertQuelle:"fest",
   stufenFaktor:Number.isFinite(Number(bonus.stufenFaktor))
     ?Math.max(-10,Math.min(10,Math.trunc(Number(bonus.stufenFaktor))))
     :1
 };
}

function normalisiereStufenlogik(logik={}){
 const bezug=["charakter","klasse","zauberstufe","manuell","gab"].includes(logik?.bezug)
   ?logik.bezug
   :"charakter";
 const bereiche=Array.isArray(logik?.bereiche)
   ?logik.bereiche.map(bereich=>({
       min:Math.max(0,Math.min(99,Math.trunc(Number(bereich?.min)||0))),
       max:Math.max(0,Math.min(99,Math.trunc(Number(bereich?.max)||0))),
       wert:Math.max(-99,Math.min(99,Math.trunc(Number(bereich?.wert)||0)))
     })).filter(bereich=>bereich.max>=bereich.min)
   :[];
 return {
   aktiv:!!logik?.aktiv,
   bezug,
   klasse:typeof logik?.klasse==="string"?logik.klasse.trim():"",
   bereiche
 };
}

function normalisiereEffekt(effekt={}){
 const standard=!!effekt.standard;
 const effektName=String(effekt.name||"").trim();
 const erzwungeneSonderlogik=
   effektName==="Mächtige magische Fänge"
     ?"maechtige-magische-faenge"
     :effektName==="Heftiger Angriff"
       ?"heftiger-angriff"
       :"";
 const effektKategorie=normalisiereKategorie(effekt.kategorie);
 const istCharakterwerte=effektKategorie==="Charakterwerte";
 const nutzerBonusMin=istCharakterwerte?-5:1;
 const nutzerBonusMax=istCharakterwerte?17:20;
 const nutzerBonusStandard=istCharakterwerte?0:1;
 const stufenlogik=normalisiereStufenlogik(effekt.stufenlogik);
 const roheBoni=Array.isArray(effekt.boni)?effekt.boni:[];
 let boni=roheBoni.map(bonus=>{
   const normalisiert=normalisiereBonus(bonus);
   const hatQuelle=bonus && Object.prototype.hasOwnProperty.call(bonus,"wertQuelle");
   if(stufenlogik.aktiv && !hatQuelle) normalisiert.wertQuelle="stufenwert";
   return normalisiert;
 });

 return {
   id:effekt.id||(standard?standardEffektId(effekt):neueEffektId()),
   standard,
   aktiv:!!effekt.aktiv,
   name:effektName,
   kategorie:effektKategorie,
   beschreibung:effekt.beschreibung||"",
   quelle:effekt.quelle||"",
   angriffZuweisbar:!!effekt.angriffZuweisbar,
   sonderlogik:erzwungeneSonderlogik ||
     (["heftiger-angriff","maechtige-magische-faenge"].includes(effekt.sonderlogik)?effekt.sonderlogik:""),
   nutzerBonus:{
     aktiv:!!effekt?.nutzerBonus?.aktiv,
     min:nutzerBonusMin,
     max:nutzerBonusMax,
     // Charakterwerte starten immer bei 0; sonstige Kategorien weiterhin bei +1.
     standard:nutzerBonusStandard
   },
   stufenlogik,
   boni
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
 const aenderungen=ladeAdminStandardAenderungen();
 const entwurf=aenderungen[effekt.id];
 return entwurf
   ?normalisiereEffekt({...effekt,...entwurf,id:effekt.id,standard:true})
   :effekt;
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


function ladeAdminStandardGeloescht(){
 const daten=ladeJson(STORAGE_KEYS.adminStandardGeloescht,[]);
 return Array.isArray(daten)?daten.map(String):[];
}

function speichereAdminStandardGeloescht(ids){
 speichereJson(STORAGE_KEYS.adminStandardGeloescht,[...new Set((ids||[]).map(String))]);
}

function loescheStandardEffektAlsAdmin(id){
 if(!istAdminEntsperrt()) return false;
 const effekt=findeEffekt(id);
 if(!effekt || !effekt.standard) return false;

 if(istNeuerStandardEffekt(id)){
   speichereAdminStandardNeu(ladeAdminStandardNeu().filter(e=>e.id!==id));
 }else{
   const geloescht=ladeAdminStandardGeloescht();
   if(!geloescht.includes(String(id))) geloescht.push(String(id));
   speichereAdminStandardGeloescht(geloescht);

   const aenderungen=ladeAdminStandardAenderungen();
   if(Object.prototype.hasOwnProperty.call(aenderungen,id)){
     delete aenderungen[id];
     speichereAdminStandardAenderungen(aenderungen);
   }
 }
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


const ENTFALLENE_ATTRIBUT_EFFEKTE_44=new Set(["CH: Charisma (Attribut)", "GE: Geschicklichkeit (Attribut)", "IN: Intelligenz (Attribut)", "KO: Konstitution (Attribut)", "ST: Stärke (Attribut)", "WE: Weisheit (Attribut)"]);
const ENTFALLENE_ATTRIBUT_EFFEKT_IDS_44=new Set(["standard-admin-435e60e4-812c-4124-8da8-ff8ea32b9010", "standard-admin-5b781d77-ec60-4aa1-9eb5-3e54427b957d", "standard-admin-5d6e3dc4-6926-4df3-8fdc-f4d7f8182cf5", "standard-admin-6d4e5031-fe33-4136-8b58-b38cc7d60ed5", "standard-admin-ecb36aca-0f07-4e85-a616-cce6541ce286", "standard-admin-f4d458c3-e477-42f6-8f04-a35920f473ba"]);

function istEntfallenerAttributEffekt44(effekt){
 return ENTFALLENE_ATTRIBUT_EFFEKTE_44.has(String(effekt?.name||"").trim());
}

function bereinigeAlteAttributEffekte44(){
 const aenderungen=ladeAdminStandardAenderungen();
 let aenderungenGeaendert=false;
 Object.entries(aenderungen).forEach(([id,effekt])=>{
   if(istEntfallenerAttributEffekt44(effekt) || ENTFALLENE_ATTRIBUT_EFFEKT_IDS_44.has(String(id))){
     delete aenderungen[id];
     aenderungenGeaendert=true;
   }
 });
 if(aenderungenGeaendert) speichereAdminStandardAenderungen(aenderungen);

 const neue=ladeAdminStandardNeu().filter(effekt=>!istEntfallenerAttributEffekt44(effekt));
 speichereAdminStandardNeu(neue);

 const benutzer=ladeBenutzerEffekte().filter(effekt=>!istEntfallenerAttributEffekt44(effekt));
 speichereBenutzerEffekte(benutzer);
}

async function ladeEffekte(){
 try{
   bereinigeAlteAttributEffekte44();
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
   const geloeschteStandardIds=new Set(ladeAdminStandardGeloescht());
   const standardBasis=dedupliziereEffekte31(
     standardEffekte
       .map(effekt=>normalisiereEffekt({...effekt,standard:true}))
       .filter(effekt=>!geloeschteStandardIds.has(String(effekt.id)))
       .map(effekt=>angewendeterStandardEffekt(effekt))
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

   effekte=dedupliziereEffekte31([...standardGesamt,...benutzer])
     .filter(effekt=>!istEntfallenerAttributEffekt44(effekt));
   effekte.forEach(effekt=>{
     effekt.aktiv=istCharakterwerteEffekt(effekt)?true:!!status[effekt.name];
     if(istCharakterwerteEffekt(effekt)) status[effekt.name]=true;
   });
   speichereStatus(status);

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

function istCharakterwerteEffekt(effekt){
 return normalisiereKategorie(effekt?.kategorie)==="Charakterwerte";
}

function normalisiereKategorie(kategorie){
 const wert=String(kategorie||"").trim();
 const alteBezeichnungen={
   Gegenstand:"Ausrüstung",
   Talent:"Talente",
   Sonstiges:"Sonstige"
 };
 return alteBezeichnungen[wert]||wert;
}

function kategorieFilterBezeichnung(kategorie){
 const kurz={
   "Klassenmerkmale":"Klassenmerk.",
   "Volksmerkmale":"Volksmerk."
 };
 return kurz[kategorie]||kategorie;
}

function effektKategorien(){
 const vorhandene=effekte
   .map(effekt=>normalisiereKategorie(effekt.kategorie))
   .filter(kategorie=>!!kategorie && kategorie!=="Charakterwerte");
 return [...new Set([...PF_EFFEKT_KATEGORIEN,...vorhandene])]
   .sort((a,b)=>a.localeCompare(b,"de"));
}

function baueKategorieFilter(){
 const container=document.getElementById("filterKategorie");
 if(!container) return;

 const kategorien=effektKategorien();
 const gespeichert=effektFilterFuerCharakter();
 const aktiveKategorien=Array.isArray(gespeichert.kategorien)
   ?new Set(gespeichert.kategorien)
   :new Set(kategorien);

 container.innerHTML="";

 const alleLabel=document.createElement("label");
 alleLabel.className="filter-kategorie-option filter-kategorie-alle";
 const alle=document.createElement("input");
 alle.type="checkbox";
 alle.checked=kategorien.length>0 && kategorien.every(k=>aktiveKategorien.has(k));
 const alleText=document.createElement("span");
 alleText.textContent="Alle";
 alleLabel.append(alle,alleText);
 container.appendChild(alleLabel);

 kategorien.forEach(kategorie=>{
   const label=document.createElement("label");
   label.className="filter-kategorie-option";
   const checkbox=document.createElement("input");
   checkbox.type="checkbox";
   checkbox.value=kategorie;
   checkbox.checked=aktiveKategorien.has(kategorie);
   const text=document.createElement("span");
   text.textContent=kategorieFilterBezeichnung(kategorie);
   text.title=kategorie;
   label.append(checkbox,text);
   container.appendChild(label);
 });

 const speichereAuswahl=()=>{
   const checkboxen=[...container.querySelectorAll('input[type="checkbox"][value]')];
   const aktiv=checkboxen.filter(cb=>cb.checked).map(cb=>cb.value);
   const bisher=effektFilterFuerCharakter();
   speichereEffektFilterFuerCharakter({...bisher,kategorien:aktiv});
   alle.checked=checkboxen.length>0 && checkboxen.every(cb=>cb.checked);
   baueEffektliste();
 };

 alle.addEventListener("change",()=>{
   container.querySelectorAll('input[type="checkbox"][value]').forEach(cb=>cb.checked=alle.checked);
   speichereAuswahl();
 });

 container.querySelectorAll('input[type="checkbox"][value]').forEach(cb=>{
   cb.addEventListener("change",speichereAuswahl);
 });
}

function synchronisiereEffektFilterUI(){
 const filter=effektFilterFuerCharakter();
 const suche=document.getElementById("suche");
 const nurAktiv=document.getElementById("filterNurAktiv");
 const nurFavoriten=document.getElementById("filterNurFavoriten");
 if(suche && document.activeElement!==suche) suche.value=filter.suche||"";
 if(nurAktiv) nurAktiv.checked=!!filter.nurAktiv;
 if(nurFavoriten) nurFavoriten.checked=!!filter.nurFavoriten;

 const container=document.getElementById("filterKategorie");
 if(container){
   const kategorien=effektKategorien();
   const aktiv=Array.isArray(filter.kategorien)?new Set(filter.kategorien):new Set(kategorien);
   container.querySelectorAll('input[type="checkbox"][value]').forEach(cb=>{
     cb.checked=aktiv.has(cb.value);
   });
   const alle=container.querySelector(".filter-kategorie-alle input");
   if(alle) alle.checked=kategorien.length>0 && kategorien.every(k=>aktiv.has(k));
 }
}

function effektBezugsstufe(effekt,charakter=aktiverCharakter()){
 const logik=effekt?.stufenlogik;
 if(!logik?.aktiv) return 0;
 if(logik.bezug==="klasse") return charakterKlassenstufe(charakter,logik.klasse);
 if(logik.bezug==="gab") return charakterGAB(charakter);
 if(logik.bezug==="zauberstufe" || logik.bezug==="manuell"){
   return Number(effektStufeFuerCharakter(effekt.id,charakter?.id))||0;
 }
 return charakterGesamtstufe(charakter);
}

function effektStufenwert(effekt,charakter=aktiverCharakter()){
 const stufe=effektBezugsstufe(effekt,charakter);
 const bereiche=Array.isArray(effekt?.stufenlogik?.bereiche)?effekt.stufenlogik.bereiche:[];
 const passend=bereiche.find(bereich=>stufe>=Number(bereich.min) && stufe<=Number(bereich.max));
 return passend?Number(passend.wert)||0:0;
}

function aktualisiereEffektStufenAnzeige(effekt,container){
 const ausgabe=container?.querySelector(".effekt-stufenwert-aktuell");
 if(!ausgabe) return;
 const stufe=effektBezugsstufe(effekt);
 const wert=effektStufenwert(effekt);
 ausgabe.textContent=`Stufe ${stufe} → ${wert>=0?"+":""}${wert}`;
}

function nutzerBonusWertFuerEffekt(effekt){
 const konfig=effekt?.nutzerBonus||{};
 const optionen=effektOptionenFuerCharakter(effekt?.id);
 const istCharakterwerte=normalisiereKategorie(effekt?.kategorie)==="Charakterwerte";
 const min=istCharakterwerte?-5:1;
 const max=istCharakterwerte?17:20;
 const standard=istCharakterwerte?0:1;
 const roh=optionen.nutzerBonusWert;
 const zahl=roh==="" || roh===null || typeof roh==="undefined"
   ?standard
   :Number(roh);
 const wert=Number.isFinite(zahl)?zahl:standard;
 return Math.max(min,Math.min(max,Math.trunc(wert)));
}

function setzeNutzerBonusWertFuerEffekt(effektId,wert){
 const effekt=findeEffekt(effektId);
 if(!effekt?.nutzerBonus?.aktiv) return false;
 const istCharakterwerte=normalisiereKategorie(effekt.kategorie)==="Charakterwerte";
 const min=istCharakterwerte?-5:1;
 const max=istCharakterwerte?17:20;
 const standard=istCharakterwerte?0:1;
 const zahl=Number(wert);
 const sicher=Math.max(min,Math.min(max,Math.trunc(Number.isFinite(zahl)?zahl:standard)));
 if(!setzeEffektOptionenFuerCharakter(effektId,{nutzerBonusWert:sicher})) return false;

 effekt.nutzerBonusWertAktuell=sicher;
 if(typeof berechneWerte==="function") berechneWerte();
 if(typeof window.aktualisiereAlleAnsichten==="function") window.aktualisiereAlleAnsichten();
 return true;
}


function maechtigeMagischeFaengeModus(effekt,charakterId=aktiverCharakterId){
 if(effekt?.sonderlogik!=="maechtige-magische-faenge") return "";
 const optionen=effektOptionenFuerCharakter(effekt.id,charakterId);
 return optionen.modus==="einzeln"?"einzeln":"alle";
}

function effektAngriffsModus(effekt){
 if(effekt?.sonderlogik==="maechtige-magische-faenge"){
   return maechtigeMagischeFaengeModus(effekt)==="einzeln"?"einer":"alle";
 }
 return effekt?.angriffZuweisbar?"einer":"alle";
}

function rendereSonderoptionenFuerEffekt(effekt,info){
 if(!effekt?.sonderlogik || !info) return;

 const box=document.createElement("div");
 box.className="effekt-sonderoptionen";
 box.hidden=false;

 if(effekt.sonderlogik==="maechtige-magische-faenge"){
   const optionen=effektOptionenFuerCharakter(effekt.id);
   const modusAktuell=maechtigeMagischeFaengeModus(effekt);
   const label=document.createElement("label");
   label.appendChild(document.createTextNode("Anwendung "));
   const select=document.createElement("select");
   [
     ["alle","Alle natürlichen Angriffe +1"],
     ["einzeln","Ein Angriff nach Zauberstufe (+1 bis +5)"]
   ].forEach(([wert,text])=>{
     const option=document.createElement("option");
     option.value=wert;
     option.textContent=text;
     select.appendChild(option);
   });
   select.value=modusAktuell;
   select.addEventListener("click",event=>event.stopPropagation());
   select.addEventListener("change",event=>{
     event.stopPropagation();
     setzeEffektOptionenFuerCharakter(effekt.id,{modus:select.value});

     // Commit 41.2: Sondereffekt beibehalten.
     // "Alle" braucht keine Angriffsauswahl; "Einzeln" darf genau ein Ziel verwenden.
     if(effekt.sonderlogik==="maechtige-magische-faenge"){
       if(select.value==="alle"){
         setzeAngriffszieleFuerEffekt(effekt,[]);
       }else{
         const aktuell=angriffszieleFuerEffekt(effekt);
         if(aktuell.length>1){
           setzeAngriffszieleFuerEffekt(effekt,[aktuell[0]]);
         }else if(aktuell.length===0){
           setzeAngriffszieleFuerEffekt(effekt,["A1"]);
         }
       }
     }

     baueEffektliste();
     if(typeof berechneWerte==="function") berechneWerte();
   });
   label.appendChild(select);
   box.appendChild(label);
 }

 if(effekt.sonderlogik==="heftiger-angriff"){
   const optionen=effektOptionenFuerCharakter(effekt.id);
   const label=document.createElement("label");
   label.appendChild(document.createTextNode("Schadensart "));
   const select=document.createElement("select");
   [
     ["normal","Normal / einhändig (+2 je Stufe)"],
     ["zweihand","Zweihändig / 1½× ST (+3 je Stufe)"],
     ["zweithand","Zweithand / sekundär (+1 je Stufe)"]
   ].forEach(([wert,text])=>{
     const option=document.createElement("option");
     option.value=wert;
     option.textContent=text;
     select.appendChild(option);
   });
   select.value=["normal","zweihand","zweithand"].includes(optionen.schadensart)
     ?optionen.schadensart
     :"normal";
   select.addEventListener("click",event=>event.stopPropagation());
   select.addEventListener("change",event=>{
     event.stopPropagation();
     setzeEffektOptionenFuerCharakter(effekt.id,{schadensart:select.value});
     if(typeof berechneWerte==="function") berechneWerte();
   });
   label.appendChild(select);
   box.appendChild(label);
 }

 if(box.childNodes.length) info.appendChild(box);
}

function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 const suche=document.getElementById("suche");
 const kategorieFilter=document.getElementById("filterKategorie");
 const nurAktivFilter=document.getElementById("filterNurAktiv");
 const nurFavoritenFilter=document.getElementById("filterNurFavoriten");
 const ergebnis=document.getElementById("filterErgebnis");
 if(!liste) return;

 synchronisiereEffektFilterUI();

 const status=ladeStatus();

 effekte.forEach(effekt=>{
   if(effekt?.nutzerBonus?.aktiv){
     effekt.nutzerBonusWertAktuell=nutzerBonusWertFuerEffekt(effekt);
   }else{
     delete effekt.nutzerBonusWertAktuell;
   }
 });

 const filterEinstellungen=effektFilterFuerCharakter();
 const suchtext=(suche?.value||filterEinstellungen.suche||"").trim().toLowerCase();
 const aktiveKategorien=new Set(
   Array.isArray(filterEinstellungen.kategorien)
     ?filterEinstellungen.kategorien
     :effektKategorien()
 );
 const nurAktiv=!!nurAktivFilter?.checked;

 liste.innerHTML="";
 effekte.sort((a,b)=>a.name.localeCompare(b.name,"de"));

 const gefilterteEffekte=effekte.filter(effekt=>{
   effekt.aktiv=istCharakterwerteEffekt(effekt)?true:!!status[effekt.name];
   if(istCharakterwerteEffekt(effekt)) status[effekt.name]=true;

   const passtZurSuche=!suchtext ||
     effekt.name.toLowerCase().includes(suchtext) ||
     String(effekt.beschreibung||"").toLowerCase().includes(suchtext) ||
     String(effekt.quelle||"").toLowerCase().includes(suchtext);

   const sichtbareKategorien=effektKategorien();
   const alleKategorienAktiv=sichtbareKategorien.length>0 &&
     sichtbareKategorien.every(kategorie=>aktiveKategorien.has(kategorie));
   const istInternerCharakterwert=normalisiereKategorie(effekt.kategorie)==="Charakterwerte";
   const passtZurKategorie=istInternerCharakterwert
     ?alleKategorienAktiv
     :aktiveKategorien.has(normalisiereKategorie(effekt.kategorie));
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
   const immerAktiv=istCharakterwerteEffekt(effekt);
   cb.checked=immerAktiv?true:effekt.aktiv;
   cb.disabled=immerAktiv;
   if(immerAktiv){
     cb.title="Effekte der Kategorie Charakterwerte sind immer aktiv.";
   }
   cb.addEventListener("change",()=>{
      if(immerAktiv){
        cb.checked=true;
        status[effekt.name]=true;
        effekt.aktiv=true;
        speichereStatus(status);
        return;
      }
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

   // Commit 41.4: Sondereinstellungen direkt im Effektbanner anzeigen.
   rendereSonderoptionenFuerEffekt(effekt,info);

   if(effekt.stufenlogik?.aktiv){
     const stufenBox=document.createElement("div");
     stufenBox.className="effekt-stufenbox";
     if(
       effekt.sonderlogik==="maechtige-magische-faenge" &&
       effektOptionenFuerCharakter(effekt.id).modus!=="einzeln"
     ){
       stufenBox.hidden=true;
     }
     let bezugText="Charakterstufe";
     if(effekt.stufenlogik.bezug==="klasse"){
       bezugText=`Klassenstufe${effekt.stufenlogik.klasse?` (${effekt.stufenlogik.klasse})`:""}`;
     }else if(effekt.stufenlogik.bezug==="zauberstufe"){
       bezugText="Zauberstufe";
     }else if(effekt.stufenlogik.bezug==="manuell"){
       bezugText="Manuelle Stufe";
     }else if(effekt.stufenlogik.bezug==="gab"){
       bezugText="GAB";
     }
     const labelStufe=document.createElement("span");
     labelStufe.textContent=bezugText;
     stufenBox.appendChild(labelStufe);

     if(["zauberstufe","manuell"].includes(effekt.stufenlogik.bezug)){
       const eingabe=document.createElement("input");
       eingabe.type="number"; eingabe.min="0"; eingabe.max="99"; eingabe.step="1";
       const gespeichert=effektStufeFuerCharakter(effekt.id);
       eingabe.value=gespeichert===""?"":String(gespeichert);
       eingabe.addEventListener("click",event=>event.stopPropagation());
       eingabe.addEventListener("input",event=>{
         event.stopPropagation();
         setzeEffektStufeFuerCharakter(effekt.id,eingabe.value);
         if(typeof berechneWerte==="function") berechneWerte();
         aktualisiereEffektStufenAnzeige(effekt,stufenBox);
       });
       stufenBox.appendChild(eingabe);
     }
     const aktuell=document.createElement("strong");
     aktuell.className="effekt-stufenwert-aktuell";
     stufenBox.appendChild(aktuell);
     info.appendChild(stufenBox);
     aktualisiereEffektStufenAnzeige(effekt,stufenBox);
   }

   if(effekt.nutzerBonus?.aktiv){
     const box=document.createElement("div");
     box.className="effekt-nutzerbonus";
     const label=document.createElement("label");
     label.appendChild(document.createTextNode("Bonus "));
     const select=document.createElement("select");
     const istCharakterwerte=normalisiereKategorie(effekt.kategorie)==="Charakterwerte";
     const min=istCharakterwerte?-5:1;
     const max=istCharakterwerte?17:20;
     for(let wert=min;wert<=max;wert++){
       const option=document.createElement("option");
       option.value=String(wert);
       option.textContent=wert>0?`+${wert}`:String(wert);
       select.appendChild(option);
     }
     select.value=String(nutzerBonusWertFuerEffekt(effekt));
     select.addEventListener("click",event=>event.stopPropagation());
     select.addEventListener("change",event=>{
       event.stopPropagation();
       setzeNutzerBonusWertFuerEffekt(effekt.id,Number(select.value));
     });
     label.appendChild(select);
     box.appendChild(label);
     info.appendChild(box);
   }

   const angriffsModus=effektAngriffsModus(effekt);
   if(effekt.angriffZuweisbar && angriffsModus==="einer"){
     const zuweisung=document.createElement("div");
     zuweisung.className="effekt-angriffsziel-30 effekt-angriffsziele-41";

     if(effekt.sonderlogik==="maechtige-magische-faenge"){
       const beschriftung=document.createElement("span");
       beschriftung.textContent="Angriff";
       const selectZiel=document.createElement("select");
       selectZiel.setAttribute("aria-label",`${effekt.name}: betroffenen Angriff wählen`);
       ["-",...EFFEKT_ANGRIFFSZIELE].forEach(wert=>{
         const option=document.createElement("option");
         option.value=wert;
         option.textContent=wert;
         selectZiel.appendChild(option);
       });
       selectZiel.value=angriffszielFuerEffekt(effekt);
       selectZiel.addEventListener("click",event=>event.stopPropagation());
       selectZiel.addEventListener("change",event=>{
         event.stopPropagation();
         setzeAngriffszielFuerEffekt(effekt,selectZiel.value);
         if(typeof berechneWerte==="function") berechneWerte();
       });
       zuweisung.append(beschriftung,selectZiel);
     }else{
       const beschriftung=document.createElement("span");
       beschriftung.textContent="Angriffe (max. 3)";
       zuweisung.appendChild(beschriftung);

       const auswahl=document.createElement("div");
       auswahl.className="effekt-angriffsziele-auswahl-41";
       const aktiv=new Set(angriffszieleFuerEffekt(effekt));

       EFFEKT_ANGRIFFSZIELE.forEach(wert=>{
         const labelZiel=document.createElement("label");
         labelZiel.className="effekt-angriffsziel-option-41";
         const checkbox=document.createElement("input");
         checkbox.type="checkbox";
         checkbox.value=wert;
         checkbox.checked=aktiv.has(wert);
         checkbox.setAttribute("aria-label",`${effekt.name}: ${wert}`);
         checkbox.addEventListener("click",event=>event.stopPropagation());
         checkbox.addEventListener("change",event=>{
           event.stopPropagation();
           const neu=new Set(angriffszieleFuerEffekt(effekt));
           if(checkbox.checked){
             if(neu.size<EFFEKT_ANGRIFFSZIELE_MAX) neu.add(wert);
             else checkbox.checked=false;
           }else{
             neu.delete(wert);
           }
           setzeAngriffszieleFuerEffekt(effekt,[...neu]);
           baueEffektliste();
           if(typeof berechneWerte==="function") berechneWerte();
         });
         const text=document.createElement("span");
         text.textContent=wert;
         labelZiel.append(checkbox,text);
         auswahl.appendChild(labelZiel);
       });

       zuweisung.appendChild(auswahl);
     }

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

      if(!effekt.standard || (effekt.standard && istAdminEntsperrt())){
        const del=document.createElement("button");
        del.type="button";
        del.className="icon-button";
        del.textContent="🗑";
        del.setAttribute("aria-label",`${effekt.name} löschen`);
        del.onclick=()=>{
          if(confirm("Effekt wirklich löschen?")){
            const geloescht=effekt.standard
              ?loescheStandardEffektAlsAdmin(effekt.id)
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
    suche.addEventListener("input",()=>{
      const bisher=effektFilterFuerCharakter();
      speichereEffektFilterFuerCharakter({...bisher,suche:suche.value});
      baueEffektliste();
    });
 }

 if(nurAktivFilter && !nurAktivFilter.dataset.bound){
    nurAktivFilter.dataset.bound="1";
    nurAktivFilter.addEventListener("change",()=>{
      const bisher=effektFilterFuerCharakter();
      speichereEffektFilterFuerCharakter({...bisher,nurAktiv:nurAktivFilter.checked});
      baueEffektliste();
    });
 }

 if(nurFavoritenFilter && !nurFavoritenFilter.dataset.bound){
    nurFavoritenFilter.dataset.bound="1";
    nurFavoritenFilter.addEventListener("change",()=>{
      const bisher=effektFilterFuerCharakter();
      speichereEffektFilterFuerCharakter({...bisher,nurFavoriten:nurFavoritenFilter.checked});
      baueEffektliste();
    });
 }
}

const PF_BONUS_ZIELE=[
 "Attribut ST",
 "Attribut GE",
 "Attribut KO",
 "Attribut IN",
 "Attribut WE",
 "Attribut CH",
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

const PF_KLASSEN=["Alchemist","Antipaladin","Arkanist","Attentäter","Barbar","Barde","Blutwüter","Draufgänger","Druide","Eidolon","Ermittler","Gestaltwandler","Hexe","Hexenmeister","Inquisitor","Jäger","Kampfmagus","Kämpfer","Kinetiker","Kleriker","Kriegspriester","Magier","Medium","Mönch","Mystiker","Ninja","Okkultist","Paladin","Paktmagier","Raufbold","Ritter","Schamane","Schütze","Schurke","Skalde","Tiergefährte","Vertrauter","Waldläufer"];

function erzeugeKlassenOptionen(aktuell="",mitAndere=true){
 const fragment=document.createDocumentFragment();
 PF_KLASSEN.forEach(name=>{
   const option=document.createElement("option");
   option.value=name;
   option.textContent=name;
   option.selected=name===aktuell;
   fragment.appendChild(option);
 });
 if(mitAndere){
   const option=document.createElement("option");
   option.value="__andere__";
   option.textContent="Andere Klasse…";
   option.selected=!!aktuell && !PF_KLASSEN.includes(aktuell);
   fragment.appendChild(option);
 }
 return fragment;
}

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
   nutzerBonus:{
     aktiv:!!document.getElementById("effektNutzerBonusAktiv")?.checked,
     min:(document.getElementById("effektKategorie")?.value==="Charakterwerte"?-5:1),
     max:(document.getElementById("effektKategorie")?.value==="Charakterwerte"?17:20),
     standard:(document.getElementById("effektKategorie")?.value==="Charakterwerte"?0:1)
   },
   stufenlogik:normalisiereStufenlogik(editorState.entwurf.stufenlogik),
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
 const nutzerBonusAktiv=document.getElementById("effektNutzerBonusAktiv");
 const titel=document.querySelector("#effektDialog h3");

 if(name) name.value=editorState.entwurf.name;
 if(kategorie) kategorie.value=editorState.entwurf.kategorie;
 if(beschreibung) beschreibung.value=editorState.entwurf.beschreibung;
 if(quelle) quelle.value=editorState.entwurf.quelle;
 if(angriffZuweisbar) angriffZuweisbar.checked=!!editorState.entwurf.angriffZuweisbar;
 if(nutzerBonusAktiv) nutzerBonusAktiv.checked=!!editorState.entwurf.nutzerBonus?.aktiv;
 if(titel){
   titel.textContent=editorState.effektId
     ?"Effekt bearbeiten"
     :(editorState.standardNeu?"Neuen Standardeffekt anlegen":"Neuen Effekt anlegen");
 }

 rendereStufenEditor();
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

function rendereStufenEditor(){
 const bereich=document.getElementById("stufenEditor");
 if(!bereich || !editorState.entwurf) return;
 editorState.entwurf.stufenlogik=normalisiereStufenlogik(editorState.entwurf.stufenlogik);
 const logik=editorState.entwurf.stufenlogik;

 const aktiv=document.getElementById("effektStufenabhaengig");
 const bezug=document.getElementById("effektStufenbezug");
 const klasse=document.getElementById("effektStufenklasse");
 const klasseAndere=document.getElementById("effektStufenklasseAndere");
 const bereiche=document.getElementById("stufenBereiche");
 const hinzufuegen=document.getElementById("btnStufenbereichHinzufuegen");

 if(aktiv){
   aktiv.checked=!!logik.aktiv;
   aktiv.onchange=()=>{
     const warAktiv=!!editorState.entwurf.stufenlogik.aktiv;
     editorState.entwurf.stufenlogik.aktiv=aktiv.checked;

     if(aktiv.checked && !warAktiv && Array.isArray(editorState.entwurf.boni)){
       editorState.entwurf.boni=editorState.entwurf.boni.map(bonus=>({
         ...bonus,
         wertQuelle:"stufenwert"
       }));
     }

     rendereStufenEditor();
     rendereBonusEditor();
   };
 }
 bereich.classList.toggle("inaktiv",!logik.aktiv);

 if(bezug){
   bezug.value=logik.bezug||"charakter";
   bezug.onchange=()=>{
     editorState.entwurf.stufenlogik.bezug=bezug.value;
     rendereStufenEditor();
   };
 }

 const labelKlasse=klasse?.closest("label");
 if(labelKlasse) labelKlasse.classList.toggle("versteckt",(logik.bezug||"charakter")!=="klasse");

 if(klasse){
   const aktuell=String(logik.klasse||"");
   klasse.innerHTML="";
   klasse.appendChild(erzeugeKlassenOptionen(aktuell,true));
   const bekannt=PF_KLASSEN.includes(aktuell);
   klasse.value=bekannt?aktuell:"__andere__";
   if(klasseAndere){
     klasseAndere.hidden=bekannt;
     klasseAndere.value=bekannt?"":aktuell;
     klasseAndere.oninput=()=>{
       if(klasse.value==="__andere__") editorState.entwurf.stufenlogik.klasse=klasseAndere.value;
     };
   }
   klasse.onchange=()=>{
     const andere=klasse.value==="__andere__";
     if(klasseAndere) klasseAndere.hidden=!andere;
     editorState.entwurf.stufenlogik.klasse=andere?(klasseAndere?.value||""):klasse.value;
   };
 }

 if(bereiche){
   bereiche.innerHTML="";
   logik.bereiche.forEach((eintrag,index)=>{
     const zeile=document.createElement("div");
     zeile.className="stufenbereich-zeile";
     [["min","Von"],["max","Bis"],["wert","Wert"]].forEach(([feld,label])=>{
       const input=document.createElement("input");
       input.type="number";
       input.step="1";
       input.min=feld==="wert"?"-99":"0";
       input.max="99";
       input.value=String(eintrag[feld]??0);
       input.setAttribute("aria-label",`${label} Bereich ${index+1}`);
       input.onchange=()=>{editorState.entwurf.stufenlogik.bereiche[index][feld]=Number(input.value)||0;};
       zeile.appendChild(input);
     });
     const del=document.createElement("button");
     del.type="button";
     del.className="icon-button";
     del.textContent="🗑";
     del.onclick=()=>{
       editorState.entwurf.stufenlogik.bereiche.splice(index,1);
       rendereStufenEditor();
     };
     zeile.appendChild(del);
     bereiche.appendChild(zeile);
   });
 }

 if(hinzufuegen){
   hinzufuegen.disabled=!logik.aktiv;
   hinzufuegen.onclick=()=>{
     if(!editorState.entwurf.stufenlogik.aktiv) return;
     const liste=editorState.entwurf.stufenlogik.bereiche;
     const letzte=liste.at(-1);
     const min=letzte?Math.min(99,(Number(letzte.max)||0)+1):1;
     liste.push({min:min,max:min,wert:0});
     rendereStufenEditor();
   };
 }
}

function rendereBonusEditor(){
 const container=document.getElementById("bonusContainer");
 if(!container || !editorState.entwurf) return;

 container.innerHTML="";

 const kopf=document.createElement("div");
 kopf.className="bonus-zeile bonus-zeile-kopf-425";
 ["Ziel","Bonusart","Wertquelle","Faktor","Wert",""].forEach(text=>{
   const span=document.createElement("span");
   span.textContent=text;
   kopf.appendChild(span);
 });
 container.appendChild(kopf);

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

   const wertQuelle=document.createElement("select");
   wertQuelle.className="bonus-wertquelle";
   wertQuelle.title="Fest = eingetragener Wert; Stufenwert = Wert aus der Stufen-/GAB-Logik";
   wertQuelle.setAttribute("aria-label",`Wertquelle der Bonuszeile ${index+1}`);
   [["fest","Fest"],["stufenwert","Stufenwert"]].forEach(([value,text])=>{
     const option=document.createElement("option");
     option.value=value;
     option.textContent=text;
     option.selected=(bonus.wertQuelle||"fest")===value;
     if(value==="stufenwert" && !editorState.entwurf.stufenlogik?.aktiv) option.disabled=true;
     wertQuelle.appendChild(option);
   });
   wertQuelle.addEventListener("change",event=>{
     const neueQuelle=event.target.value;
     aktualisiereBonus(index,"wertQuelle",neueQuelle);
     if(neueQuelle==="stufenwert" && Number(editorState.entwurf.boni[index].wert)===0){
       aktualisiereBonus(index,"wert",1);
     }
     rendereBonusEditor();
   });

   const faktor=document.createElement("input");
   faktor.type="number";
   faktor.min="-10";
   faktor.max="10";
   faktor.step="1";
   faktor.className="bonus-stufenfaktor";
   faktor.value=String(Number.isFinite(Number(bonus.stufenFaktor))?bonus.stufenFaktor:1);
   faktor.title="Faktor für den Stufenwert, z. B. -1, +1, +2 oder +3";
   faktor.setAttribute("aria-label",`Stufenfaktor der Bonuszeile ${index+1}`);
   faktor.disabled=bonus.wertQuelle!=="stufenwert";
   faktor.addEventListener("change",event=>{
     const faktorWert=Math.max(-10,Math.min(10,Math.trunc(Number(event.target.value)||0)));
     event.target.value=String(faktorWert);
     aktualisiereBonus(index,"stufenFaktor",faktorWert);
   });

   const wert=document.createElement("select");
   wert.setAttribute("aria-label",`Wert der Bonuszeile ${index+1}`);
   if(bonus.wertQuelle==="stufenwert"){
     const option=document.createElement("option");
     option.value=String(bonus.wert ?? 1);
     option.textContent=Number(bonus.wert)<0?"Stufenwert (−)":"Stufenwert (+)";
     wert.appendChild(option);
     wert.disabled=true;
     wert.title="Die Höhe kommt aus der Stufen-/GAB-Logik. Das Vorzeichen richtet sich nach dem gespeicherten Grundwert.";
   }else{
     wert.append(...erzeugeOptionen(PF_BONUSWERTE,bonus.wert));
     wert.addEventListener("change",event=>aktualisiereBonus(index,"wert",event.target.value));
   }

   const entfernen=document.createElement("button");
   entfernen.type="button";
   entfernen.className="icon-button bonus-entfernen";
   entfernen.textContent="🗑";
   entfernen.setAttribute("aria-label",`Bonuszeile ${index+1} löschen`);
   entfernen.addEventListener("click",()=>entferneBonuszeile(index));

   zeile.append(ziel,bonusart,wertQuelle,faktor,wert,entfernen);
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
 if(typeof berechneWerte==="function") berechneWerte();
 if(typeof window.aktualisiereAlleAnsichten==="function") window.aktualisiereAlleAnsichten();
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
   nutzerBonus:{...(effekt.nutzerBonus||{})},
   stufenlogik:normalisiereStufenlogik(effekt.stufenlogik),
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
  requestAnimationFrame(()=>aktualisiereAlleAnsichten());
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",initialisiereApp,{once:true});
}else{
  initialisiereApp();
}

ladeEffekte().then(()=>{
  requestAnimationFrame(()=>aktualisiereAlleAnsichten());
});
