// Das azlantische Helferlein der Boni
// app.js
// Version 0.5.0

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
   baueEffektliste();
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
      document.getElementById("effektDialog")?.showModal();
   });
 }
});


function updateDebugStorage(extra=""){
 const el=document.getElementById("debugStorage");
 if(!el) return;
 let txt="";
 txt+="UA: "+navigator.userAgent+"\n";
 try{
   localStorage.setItem("pf-debug","ok");
   txt+="localStorage: OK\n";
 }catch(e){
   txt+="localStorage ERROR: "+e+"\n";
 }
 txt+='pf-effekte: '+localStorage.getItem("pf-effekte")+"\n";
 if(extra) txt+=extra;
 el.textContent=txt;
}
window.addEventListener("load",()=>setTimeout(updateDebugStorage,300));

document.addEventListener("change",(e)=>{
 if(e.target && e.target.type==="checkbox"){
   setTimeout(()=>updateDebugStorage("\nCheckbox geändert."),50);
 }
});

document.addEventListener("click",e=>{if(e.target?.id==="btnDialogSchliessen")document.getElementById("effektDialog").close();});