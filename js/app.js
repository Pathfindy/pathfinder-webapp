// Das azlantische Helferlein der Boni
// app.js
// Version 0.3.2

// ==============================
// Seitenverwaltung
// ==============================

const seiten = {
    dashboard: document.getElementById("dashboard"),
    effekte: document.getElementById("effekte"),
    charaktere: document.getElementById("charaktere")
};

function zeigeSeite(name) {

    Object.values(seiten).forEach(seite => {
        seite.style.display = "none";
    });

    if (seiten[name]) {
        seiten[name].style.display = "block";
    }

}

// ==============================
// Navigation
// ==============================

document.getElementById("btnDashboard").onclick = () => {
    zeigeSeite("dashboard");
};

document.getElementById("btnEffekte").onclick = () => {
    zeigeSeite("effekte");
};

document.getElementById("btnCharaktere").onclick = () => {
    zeigeSeite("charaktere");
};

// Startseite
zeigeSeite("dashboard");

// ==============================
// Effekte
// ==============================

let effekte = [];

// Daten laden
async function ladeEffekte() {

    try {

        const antwort = await fetch("data/effekte.json");

        effekte = await antwort.json();

        console.log("Effekte geladen:", effekte.length);

        if (typeof baueEffektliste === "function") {
            baueEffektliste();
        }

    } catch (fehler) {

        console.error("Fehler beim Laden:", fehler);

    }

}

ladeEffekte();

function baueEffektliste() {

    const liste = document.getElementById("boniListe");

    liste.innerHTML = "";

    effekte.sort((a, b) => a.name.localeCompare(b.name, "de"));

    effekte.forEach(effekt => {

        const eintrag = document.createElement("div");
        eintrag.className = "effekt";

        eintrag.innerHTML = `
            <input type="checkbox" ${effekt.aktiv ? "checked" : ""}>

            <div class="effekt-info">
                <div class="effekt-name">${effekt.name}</div>
                <div class="effekt-kategorie">${effekt.kategorie}</div>
            </div>
        `;

        liste.appendChild(eintrag);

    });
