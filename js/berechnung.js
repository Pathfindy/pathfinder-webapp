// Das azlantische Helferlein der Boni
// berechnung.js
// Commit 36: Spezial-Rettungswürfe erben Haupt-RW-Boni mit gemeinsamer Stapelregel

const STAPELBARE_BONUSARTEN = new Set([
    "Ausweichen",
    "Situation",
    "Namenlos",
    "Malus",
    "Modifikator Attribut",
    "Natürliche Rüstung"
]);

function normalisiereBerechnungsBonusart(bonusart) {
    const wert = typeof bonusart === "string" ? bonusart.trim() : "Namenlos";
    const migration = {
        "Ausweich": "Ausweichen",
        "Umstand": "Situation",
        "Unbenannt": "Namenlos",
        "Unbekannt": "Namenlos",
        "Natürlich": "Natürliche Rüstung",
        "Natürliche": "Natürliche Rüstung",
        "Natür. Rüstung": "Natürliche Rüstung"
    };
    return migration[wert] || wert;
}

function normalisiereBerechnungsBonus(bonus = {}) {
    const wert = Number(bonus.wert);

    return {
        ziel: typeof bonus.ziel === "string" ? bonus.ziel.trim() : "",
        bonusart: normalisiereBerechnungsBonusart(bonus.bonusart),
        wert: Number.isFinite(wert) ? wert : 0,
        wertQuelle: ["stufenwert","nutzerwert"].includes(bonus.wertQuelle) ? bonus.wertQuelle : "fest",
        stufenFaktor: Number.isFinite(Number(bonus.stufenFaktor)) ? Number(bonus.stufenFaktor) : 1,
        wirktGegenKoerperloseBeruehrung: !!bonus.wirktGegenKoerperloseBeruehrung
    };
}

function effektOptionenBerechnung(effekt){
    return typeof effektOptionenFuerCharakter === "function"
        ? effektOptionenFuerCharakter(effekt?.id)
        : {};
}

function dynamischerBonuswert(effekt, bonus, normalisiert) {
    if (!effekt || !bonus) return normalisiert.wert;

    // Commit 40.2:
    // "Boni nach Nutzereingabe" ist eine globale Effekt-Einstellung.
    // Ist sie aktiv, ersetzt der im Effektbanner gewählte Wert den
    // Grundwert ALLER Bonuszeilen des Effekts. Dadurch genügt es,
    // die Bonuszeilen normal mit +1 anzulegen.
    if (effekt?.nutzerBonus?.aktiv) {
        if (Number.isFinite(Number(effekt.nutzerBonusWertAktuell))) {
            return Number(effekt.nutzerBonusWertAktuell);
        }
        if (typeof nutzerBonusWertFuerEffekt === "function") {
            return nutzerBonusWertFuerEffekt(effekt);
        }
        return 1;
    }

    if (effekt.sonderlogik === "heftiger-angriff") {
        const stufe = typeof effektStufenwert === "function" ? effektStufenwert(effekt) : 0;
        const optionen = effektOptionenBerechnung(effekt);
        if (bonus.ziel === "Angriff Nah" || bonus.ziel === "KMB") return -stufe;
        if (bonus.ziel === "Schaden Nah") {
            const faktor = optionen.schadensart === "zweihand"
                ? 3
                : optionen.schadensart === "zweithand"
                    ? 1
                    : 2;
            return stufe * faktor;
        }
    }

    if (effekt.sonderlogik === "maechtige-magische-faenge") {
        const optionen = effektOptionenBerechnung(effekt);
        if (optionen.modus === "einzeln") {
            return typeof effektStufenwert === "function" ? effektStufenwert(effekt) : 1;
        }
        return 1;
    }

    if (
        normalisiert.wertQuelle === "stufenwert" &&
        effekt?.stufenlogik?.aktiv &&
        typeof effektStufenwert === "function"
    ) {
        const faktor = Number.isFinite(Number(bonus.stufenFaktor))
            ? Number(bonus.stufenFaktor)
            : 1;

        // Commit 40.3: Stufenwert bestimmt die Höhe; das Vorzeichen
        // bleibt vom angelegten Grundwert der Bonuszeile erhalten.
        const grundwert = Number(normalisiert.wert);
        const vorzeichen = Number.isFinite(grundwert) && grundwert < 0 ? -1 : 1;
        return effektStufenwert(effekt) * faktor * vorzeichen;
    }

    return normalisiert.wert;
}

function effektiverAngriffsModusBerechnung(effekt){
    if(effekt?.sonderlogik==="maechtige-magische-faenge"){
        const optionen=effektOptionenBerechnung(effekt);
        return optionen.modus==="einzeln"?"einer":"alle";
    }
    return effekt?.angriffZuweisbar?"einer":"alle";
}

function sammleAktiveBoni(effektListe = []) {
    if (!Array.isArray(effektListe)) return [];

    return effektListe
        .filter(effekt => effekt && effekt.aktiv)
        .flatMap(effekt => {
            if (!Array.isArray(effekt.boni)) return [];

            const angriffZiele = typeof angriffszieleFuerEffekt === "function"
                ? angriffszieleFuerEffekt(effekt)
                : (typeof angriffszielFuerEffekt === "function"
                    ? [angriffszielFuerEffekt(effekt)].filter(ziel => ziel && ziel !== "-")
                    : []);

            return effekt.boni.map(bonus => {
                const normalisiert = normalisiereBerechnungsBonus(bonus);
                const dynamischerWert =
                    dynamischerBonuswert(effekt, bonus, normalisiert);

                return {
                    ...normalisiert,
                    wert: Number(dynamischerWert) || 0,
                    effektId: effekt.id || null,
                    effektName: effekt.name || "",
                    angriffZuweisbar: !!effekt.angriffZuweisbar,
                    angriffsModus: effektiverAngriffsModusBerechnung(effekt),
                    angriffZiele,
                    angriffZiel: angriffZiele[0] || "-"
                };
            });
        })
        .filter(bonus => bonus.ziel && bonus.wert !== 0);
}

const ANGRIFFSGEBUNDENE_ZIELE = new Set([
    "Angriff Nah",
    "Angriff Fern",
    "Schaden Nah",
    "Schaden Fern"
]);

function berechneBonusErgebnisAusBoni(bonusListe = []) {
    const gruppen = new Map();

    bonusListe.forEach(bonus => {
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
                niedrigsterMalus: 0
            });
        }

        const artGruppe = zielGruppe.nachBonusart.get(bonus.bonusart);

        if (bonus.wert > 0) {
            artGruppe.hoechsterBonus = Math.max(
                artGruppe.hoechsterBonus,
                bonus.wert
            );
        } else {
            artGruppe.niedrigsterMalus = Math.min(
                artGruppe.niedrigsterMalus,
                bonus.wert
            );
        }
    });

    const ergebnis = {};

    gruppen.forEach((zielGruppe, ziel) => {
        let gesamt = zielGruppe.stapelbar;

        zielGruppe.nachBonusart.forEach(artGruppe => {
            gesamt += artGruppe.hoechsterBonus + artGruppe.niedrigsterMalus;
        });

        ergebnis[ziel] = gesamt;
    });

    return ergebnis;
}

function berechneBonusErgebnis(effektListe = []) {
    return berechneBonusErgebnisAusBoni(sammleAktiveBoni(effektListe));
}


const SPEZIAL_RW_BASIS = {
    "RW-Furcht": "RW-Wille",
    "RW-Verzauberung": "RW-Wille",
    "RW-Bezauberung": "RW-Wille",
    "RW-Gift": "RW-Zähigkeit"
};

function berechneSpezialRettungswurfBoni(effektListe = []) {
    const alleBoni = sammleAktiveBoni(effektListe);
    const ergebnis = {};

    Object.entries(SPEZIAL_RW_BASIS).forEach(([spezialZiel, hauptZiel]) => {
        // Für den Spezial-RW werden Boni des Haupt-RW und des Spezial-RW
        // gemeinsam gestapelt. Dadurch gilt die Stapelregel über beide Ziele hinweg.
        const kombiniert = alleBoni
            .filter(bonus => bonus.ziel === hauptZiel || bonus.ziel === spezialZiel)
            .map(bonus => ({ ...bonus, ziel: spezialZiel }));

        const kombiniertErgebnis = berechneBonusErgebnisAusBoni(kombiniert);
        ergebnis[spezialZiel] = Number(kombiniertErgebnis[spezialZiel] ?? 0);
    });

    return ergebnis;
}

function berechneBonusErgebnisFuerAngriff(effektListe = [], angriffsIndex = 0) {
    const angriffsZiel = `A${Number(angriffsIndex) + 1}`;
    const boni = sammleAktiveBoni(effektListe).filter(bonus => {
        if (!ANGRIFFSGEBUNDENE_ZIELE.has(bonus.ziel)) return true;
        if (!bonus.angriffZuweisbar) return true;
        if (bonus.angriffsModus === "alle") return true;

        const ziele=Array.isArray(bonus.angriffZiele)
            ?bonus.angriffZiele
            :(bonus.angriffZiel && bonus.angriffZiel!=="-"?[bonus.angriffZiel]:[]);

        // Ein zuweisbarer Effekt im Einzelmodus wirkt nur auf explizit gewählte Ziele.
        return ziele.includes(angriffsZiel);
    });
    return berechneBonusErgebnisAusBoni(boni);
}

const DASHBOARD_ZIELE = {
    "Angriff Nah": "angriffNah",
    "Angriff Fern": "angriffFern",
    "Schaden Nah": "schadenNah",
    "Schaden Fern": "schadenFern",
    "Rüstungsklasse": "rk",
    "RW-Zähigkeit": "zaehigkeit",
    "RW-Gift": "gift",
    "KMB": "kmb",
    "KMV": "kmv",
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
    if (typeof document === "undefined") return ergebnis;

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
    const spezialRw = berechneSpezialRettungswurfBoni(effektListe);

    Object.assign(ergebnis, spezialRw);

    const altSchaden = Number(ergebnis.Schaden ?? 0);
    ergebnis["Schaden Nah"] = Number(ergebnis["Schaden Nah"] ?? 0) + altSchaden;
    ergebnis["Schaden Fern"] = Number(ergebnis["Schaden Fern"] ?? 0) + altSchaden;
    aktualisiereDashboard(ergebnis);
    if (typeof window !== "undefined" &&
        typeof window.aktualisiereAttributeAnsicht44 === "function") {
        window.aktualisiereAttributeAnsicht44();
    }
    return ergebnis;
}

if (typeof window !== "undefined") {
    window.STAPELBARE_BONUSARTEN = STAPELBARE_BONUSARTEN;
    window.DASHBOARD_ZIELE = DASHBOARD_ZIELE;
    window.sammleAktiveBoni = sammleAktiveBoni;
    window.berechneBonusErgebnis = berechneBonusErgebnis;
    window.berechneSpezialRettungswurfBoni = berechneSpezialRettungswurfBoni;
    window.berechneBonusErgebnisFuerAngriff = berechneBonusErgebnisFuerAngriff;
    window.aktualisiereDashboard = aktualisiereDashboard;
    window.berechneWerte = berechneWerte;
}
