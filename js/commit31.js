// Commit 31: Spezial-Rettungswürfe typgerecht aus Basis-RW ableiten
(() => {
  "use strict";

  const SPEZIAL_RW = [
    { ziel: "RW-Furcht", basisZiel: "RW-Wille", basisKey: "rw.wille" },
    { ziel: "RW-Verzauberung", basisZiel: "RW-Wille", basisKey: "rw.wille" },
    { ziel: "RW-Bezauberung", basisZiel: "RW-Wille", basisKey: "rw.wille" },
    { ziel: "RW-Gift", basisZiel: "RW-Zähigkeit", basisKey: "rw.zaehigkeit" }
  ];

  function ganzeZahl31(wert) {
    const zahl = Number(wert);
    return Number.isFinite(zahl) ? Math.trunc(zahl) : 0;
  }

  function lesePfad31(objekt, pfad) {
    return pfad.split(".").reduce((wert, teil) => wert?.[teil], objekt);
  }

  function gruppiereBoni31(boni) {
    const gruppen = new Map();
    boni.forEach(bonus => {
      const art = bonus.bonusart || "Namenlos";
      if (!gruppen.has(art)) gruppen.set(art, []);
      gruppen.get(art).push(bonus);
    });
    return gruppen;
  }

  function effektiveBoniNachArt31(ziel) {
    if (typeof sammleAktiveBoni !== "function") return new Map();
    const stapelbar = typeof STAPELBARE_BONUSARTEN !== "undefined"
      ? STAPELBARE_BONUSARTEN
      : new Set();
    const boni = sammleAktiveBoni(typeof effekte !== "undefined" ? effekte : [])
      .filter(bonus => bonus.ziel === ziel);
    const gruppen = gruppiereBoni31(boni);
    const result = new Map();

    gruppen.forEach((eintraege, art) => {
      if (stapelbar.has(art)) {
        result.set(art, eintraege.reduce((summe, bonus) => summe + ganzeZahl31(bonus.wert), 0));
        return;
      }
      const positive = eintraege.filter(b => b.wert > 0).map(b => b.wert);
      const negative = eintraege.filter(b => b.wert < 0).map(b => b.wert);
      result.set(
        art,
        (positive.length ? Math.max(...positive) : 0) +
        (negative.length ? Math.min(...negative) : 0)
      );
    });

    return result;
  }

  function kombiniereBasisUndSpezial31(basisZiel, spezialZiel) {
    const basis = effektiveBoniNachArt31(basisZiel);
    const spezial = effektiveBoniNachArt31(spezialZiel);
    const arten = new Set([...basis.keys(), ...spezial.keys()]);
    let gesamt = 0;

    arten.forEach(art => {
      const basisWert = ganzeZahl31(basis.get(art) || 0);
      const spezialWert = ganzeZahl31(spezial.get(art) || 0);
      const stapelbar = typeof STAPELBARE_BONUSARTEN !== "undefined" &&
        STAPELBARE_BONUSARTEN.has(art);

      if (stapelbar) {
        gesamt += basisWert + spezialWert;
      } else {
        const positive = Math.max(0, basisWert, spezialWert);
        const negative = Math.min(0, basisWert, spezialWert);
        gesamt += positive + negative;
      }
    });

    return gesamt;
  }

  function spezialGesamt31(definition, charakter) {
    const grundwert = ganzeZahl31(lesePfad31(charakter?.kampfwerte, definition.basisKey));
    return grundwert + kombiniereBasisUndSpezial31(definition.basisZiel, definition.ziel);
  }

  function aktualisiereSpezialwerte31() {
    const charakter = typeof aktiverCharakter === "function" ? aktiverCharakter() : null;
    if (!charakter) return;

    SPEZIAL_RW.forEach(definition => {
      const wert = spezialGesamt31(definition, charakter);
      const zeile = document.querySelector(`.grundwert-zeile-26[data-bonus-ziel="${definition.ziel}"]`);
      const gesamt = zeile?.querySelector(".grundwert-gesamt-26");
      if (gesamt) gesamt.textContent = String(wert);
    });
  }

  function installiereBerechnungsHook31() {
    const alt = typeof berechneWerte === "function" ? berechneWerte : null;
    if (!alt || alt.__commit31) return;
    const neu = function (...argumente) {
      const ergebnis = alt(...argumente);
      setTimeout(aktualisiereSpezialwerte31, 0);
      return ergebnis;
    };
    neu.__commit31 = true;
    berechneWerte = neu;
    window.berechneWerte = neu;
  }

  function initialisiere31() {
    document.querySelectorAll("#effekte .effekt-charakter-hinweis").forEach(element => element.remove());
    installiereBerechnungsHook31();
    aktualisiereSpezialwerte31();

    const observer = new MutationObserver(() => aktualisiereSpezialwerte31());
    const bereich = document.getElementById("charakterwerte");
    if (bereich) observer.observe(bereich, { childList: true, subtree: true });

    document.addEventListener("pf-charakter-importiert", aktualisiereSpezialwerte31);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiere31, { once: true });
  } else {
    initialisiere31();
  }
})();
