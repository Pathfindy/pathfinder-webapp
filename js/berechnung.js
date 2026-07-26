// Das azlantische Helferlein der Boni
// berechnung.js
// Version 0.2.0

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

function berechneWerte() {
    const effektListe = typeof effekte !== "undefined" ? effekte : [];
    return berechneBonusErgebnis(effektListe);
}

// Erlaubt einfache Tests in der Browser-Konsole und die spätere Nutzung durch die UI.
if (typeof window !== "undefined") {
    window.STAPELBARE_BONUSARTEN = STAPELBARE_BONUSARTEN;
    window.sammleAktiveBoni = sammleAktiveBoni;
    window.berechneBonusErgebnis = berechneBonusErgebnis;
    window.berechneWerte = berechneWerte;
}
