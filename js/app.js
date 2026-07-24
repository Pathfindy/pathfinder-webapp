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
   baueEffektliste();
 }catch(fehler){
   console.error("Fehler beim Laden:",fehler);
 }
}

function baueEffektliste(){
 const liste=document.getElementById("boniListe");
 if(!liste){
   console.error("Element #boniListe nicht gefunden.");
   return;
 }
 liste.innerHTML="";
 effekte.sort((a,b)=>a.name.localeCompare(b.name,"de"));
 effekte.forEach(effekt=>{
   const eintrag=document.createElement("div");
   eintrag.className="effekt";
   eintrag.innerHTML=`
<label>
<input type="checkbox" ${effekt.aktiv?"checked":""}>
</label>
<div class="effekt-info">
<div class="effekt-name">${effekt.name}</div>
<div class="effekt-kategorie">${effekt.kategorie}</div>
</div>`;
   liste.appendChild(eintrag);
 });
}

ladeEffekte();


document.addEventListener("DOMContentLoaded",()=>{
 const b=document.getElementById("btnNeuerEffekt");
 if(b){
   b.addEventListener("click",()=>{
      alert("Effekteditor folgt in Version 0.4.1");
   });
 }
});
