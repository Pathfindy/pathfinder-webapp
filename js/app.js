// Das azlantische Helferlein der Boni
// app.js
// Version 0.3.4

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
 const antwort=await fetch("data/effekte.json");
 effekte=await antwort.json();
 if(typeof ladeEffektStatus==="function") ladeEffektStatus(effekte);
 baueEffektliste();
}

function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 const suche=(document.getElementById("suche")?.value||"").toLowerCase();
 liste.innerHTML="";
 effekte
 .slice()
 .sort((a,b)=>a.name.localeCompare(b.name,"de"))
 .filter(e=>e.name.toLowerCase().includes(suche))
 .forEach(effekt=>{
   const eintrag=document.createElement("div");
   eintrag.className="effekt";
   const cb=document.createElement("input");
   cb.type="checkbox";
   cb.checked=!!effekt.aktiv;
   cb.addEventListener("change",()=>{
      effekt.aktiv=cb.checked;
      if(typeof speichereEffektStatus==="function") speichereEffektStatus(effekte);
      if(typeof berechneWerte==="function") berechneWerte();
   });
   const info=document.createElement("div");
   info.className="effekt-info";
   info.innerHTML=`<div class="effekt-name">${effekt.name}</div><div class="effekt-kategorie">${effekt.kategorie}</div>`;
   eintrag.append(cb,info);
   liste.appendChild(eintrag);
 });
}

document.getElementById("suche").addEventListener("input",baueEffektliste);

ladeEffekte();
