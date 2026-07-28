// Das azlantische Helferlein der Boni
// berechnung.js
// Version 0.3.0

const STAPELBARE_BONUSARTEN = new Set([
    "Ausweich",
    "Umstand",
    "Unbenannt"
]);

function normalisiereBerechnungsBonus(bonus = {}) {
    const wert = Number(bonus.wert);

    return {
        ziel: typeof bonus.ziel === "string" ? bonus.ziel.trim() : "",
        bonusart: typeof bonus.bonusart === "string"
            ? bonus.bonusart.trim()
            : "Unbenannt",
        wert: Number.isFinite(wert) ? wert : 0
    };
}

function sammleAktiveBoni(effektListe = []) {
    if (!Array.isArray(effektListe)) {
        return [];
    }

    return effektListe
        .filter(effekt => effekt && effekt.aktiv)
        .flatMap(effekt => {
            if (!Array.isArray(effekt.boni)) {
                return [];
            }

            return effekt.boni.map(bonus => ({
                ...normalisiereBerechnungsBonus(bonus),
                effektId: effekt.id || null,
                effektName: effekt.name || ""
            }));
        })
        .filter(bonus => bonus.ziel && bonus.wert !== 0);
}

function berechneBonusErgebnis(effektListe = []) {
    const gruppen = new Map();

    sammleAktiveBoni(effektListe).forEach(bonus => {
        if (!gruppen.has(bonus.ziel)) {
            gruppen.set(bonus.ziel, {
                stapelbar: 0,
                nachBonusart: new Map()
            });
        }

        const zielGruppe = gruppen.get(bonus.ziel);

        if (STAPELBARE_BONUSARTEN.has(bonus.bonusart)) {
            zielGruppe.stapelbar += bonus.wert;
            return;
        }

        if (!zielGruppe.nachBonusart.has(bonus.bonusart)) {
            zielGruppe.nachBonusart.set(bonus.bonusart, {
                hoechsterBonus: 0,
                mali: 0
            });
        }

        const artGruppe = zielGruppe.nachBonusart.get(bonus.bonusart);

        if (bonus.wert > 0) {
            artGruppe.hoechsterBonus = Math.max(
                artGruppe.hoechsterBonus,
                bonus.wert
            );
        } else {
            artGruppe.mali += bonus.wert;
        }
    });

    const ergebnis = {};

    gruppen.forEach((zielGruppe, ziel) => {
        let gesamt = zielGruppe.stapelbar;

        zielGruppe.nachBonusart.forEach(artGruppe => {
            gesamt += artGruppe.hoechsterBonus + artGruppe.mali;
        });

        ergebnis[ziel] = gesamt;
    });

    return ergebnis;
}

const DASHBOARD_ZIELE = {
    "Angriff Nah": "angriffNah",
    "Angriff Fern": "angriffFern",
    "Schaden": "schaden",
    "Rüstungsklasse": "rk",
    "RW-Zähigkeit": "zaehigkeit",
    "RW-Reflex": "reflex",
    "RW-Wille": "wille",
    "RW-Furcht": "furcht",
    "RW-Verzauberung": "verzauberung",
    "RW-Bezauberung": "bezauberung"
};

function formatiereDashboardWert(wert) {
    const zahl = Number(wert);
    const sichererWert = Number.isFinite(zahl) ? zahl : 0;
    return sichererWert > 0 ? `+${sichererWert}` : String(sichererWert);
}

function aktualisiereDashboard(ergebnis = {}) {
    if (typeof document === "undefined") {
        return ergebnis;
    }

    Object.entries(DASHBOARD_ZIELE).forEach(([ziel, elementId]) => {
        const element = document.getElementById(elementId);

        if (element) {
            element.textContent = formatiereDashboardWert(ergebnis[ziel] ?? 0);
        }
    });

    return ergebnis;
}

function berechneWerte() {
    const effektListe = typeof effekte !== "undefined" ? effekte : [];
    const ergebnis = berechneBonusErgebnis(effektListe);
    aktualisiereDashboard(ergebnis);
    return ergebnis;
}

// Erlaubt einfache Tests in der Browser-Konsole und die spätere Nutzung durch die UI.
if (typeof window !== "undefined") {
    window.STAPELBARE_BONUSARTEN = STAPELBARE_BONUSARTEN;
    window.DASHBOARD_ZIELE = DASHBOARD_ZIELE;
    window.sammleAktiveBoni = sammleAktiveBoni;
    window.berechneBonusErgebnis = berechneBonusErgebnis;
    window.aktualisiereDashboard = aktualisiereDashboard;
    window.berechneWerte = berechneWerte;
}
