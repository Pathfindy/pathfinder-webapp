// Pathfinder Boni 2.0
// Grundfunktionen

const seiten = {
    dashboard: document.getElementById("dashboard"),
    boni: document.getElementById("boni"),
    filter: document.getElementById("filter"),
    charakter: document.getElementById("charakter")
};

function zeigeSeite(name){

    Object.values(seiten).forEach(seite=>{
        seite.style.display="none";
    });

    seiten[name].style.display="block";

}

document.getElementById("btnDashboard").onclick=()=>{
    zeigeSeite("dashboard");
};

document.getElementById("btnBoni").onclick=()=>{
    zeigeSeite("boni");
};

document.getElementById("btnFilter").onclick=()=>{
    zeigeSeite("filter");
};

document.getElementById("btnCharakter").onclick=()=>{
    zeigeSeite("charakter");
};

// Startseite
zeigeSeite("dashboard");

// Hier werden später alle Boni gespeichert
let boni = [];

// Daten laden
async function ladeBoni(){

    try{

        const antwort = await fetch("data/boni.json");

        boni = await antwort.json();

        console.log("Boni geladen:", boni.length);

        if(typeof baueBoniliste==="function"){
            baueBoniliste();
        }

    }catch(fehler){

        console.error("Fehler beim Laden:",fehler);

    }

}

ladeBoni();
