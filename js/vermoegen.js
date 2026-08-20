// Commit 42: Vermögen
(() => {
  "use strict";

  const KUPFER_PRO_GOLD = 100;
  const MUENZEN = [
    { key: "platin", label: "Platinmünzen", kupfer: 1000 },
    { key: "gold", label: "Goldmünzen", kupfer: 100 },
    { key: "silber", label: "Silbermünzen", kupfer: 10 },
    { key: "kupfer", label: "Kupfermünzen", kupfer: 1 }
  ];

  function ganzzahl(wert, minimum = 0, maximum = 999999999) {
    const zahl = Number(wert);
    if (!Number.isFinite(zahl)) return minimum;
    return Math.min(maximum, Math.max(minimum, Math.trunc(zahl)));
  }

  function normalisiereVermoegen(vermoegen = {}) {
    return {
      kupferGesamt: ganzzahl(vermoegen.kupferGesamt, 0),
      notiz: typeof vermoegen.notiz === "string" ? vermoegen.notiz : ""
    };
  }

  const alteNormalisierung = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = alteNormalisierung(charakter);
    return {
      ...basis,
      vermoegen: normalisiereVermoegen(charakter.vermoegen || basis.vermoegen)
    };
  };

  function daten(charakter = aktiverCharakter()) {
    if (!charakter) return null;
    charakter.vermoegen = normalisiereVermoegen(charakter.vermoegen);
    return charakter.vermoegen;
  }

  function formatGold(kupfer) {
    const gold = Math.max(0, Number(kupfer) || 0) / KUPFER_PRO_GOLD;
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(gold);
  }

  function formatMuenzen(kupfer) {
    let rest = ganzzahl(kupfer, 0);
    const teile = [];
    for (const muenze of MUENZEN) {
      const anzahl = Math.floor(rest / muenze.kupfer);
      rest %= muenze.kupfer;
      if (anzahl || teile.length) teile.push(`${anzahl} ${muenze.key === "platin" ? "PM" : muenze.key === "gold" ? "GM" : muenze.key === "silber" ? "SM" : "KM"}`);
    }
    return teile.length ? teile.join(" · ") : "0 GM";
  }

  function speichere() {
    if (typeof speichereCharaktere === "function") speichereCharaktere();
  }

  function aktualisiereAnzeige() {
    const charakter = aktiverCharakter();
    const vermoegen = daten(charakter);
    const gesamt = document.getElementById("vermoegenGesamt");
    const detail = document.getElementById("vermoegenGesamtDetail");
    const notiz = document.getElementById("vermoegenNotiz");
    if (!vermoegen) {
      if (gesamt) { gesamt.value = "0"; gesamt.textContent = "0"; }
      if (detail) detail.textContent = "0 GM";
      if (notiz) notiz.value = "";
      return;
    }
    if (gesamt) {
      const wert = formatGold(vermoegen.kupferGesamt);
      gesamt.value = wert;
      gesamt.textContent = wert;
    }
    if (detail) detail.textContent = formatMuenzen(vermoegen.kupferGesamt);
    if (notiz && document.activeElement !== notiz) notiz.value = vermoegen.notiz;
  }

  function buche(key, richtung) {
    const muenze = MUENZEN.find(eintrag => eintrag.key === key);
    const feld = document.querySelector(`[data-vermoegen-eingabe="${key}"]`);
    const charakter = aktiverCharakter();
    const vermoegen = daten(charakter);
    if (!muenze || !feld || !vermoegen) return;
    const anzahl = ganzzahl(feld.value, 0);
    if (!anzahl) return;
    const delta = anzahl * muenze.kupfer * (richtung > 0 ? 1 : -1);
    vermoegen.kupferGesamt = Math.max(0, vermoegen.kupferGesamt + delta);
    feld.value = "";
    speichere();
    aktualisiereAnzeige();
  }

  function rechnerZeile(wert = {}) {
    const zeile = document.createElement("div");
    zeile.className = "vermoegen-rechner-zeile";
    zeile.innerHTML = `
      <select aria-label="Rechenart">
        <option value="1">+</option>
        <option value="-1">−</option>
      </select>
      <input type="number" min="0" step="1" inputmode="numeric" placeholder="Betrag">
      <select aria-label="Münzart">
        ${MUENZEN.map(m => `<option value="${m.key}">${m.label}</option>`).join("")}
      </select>
      <button type="button" class="vermoegen-rechner-entfernen" aria-label="Zeile entfernen">×</button>
    `;
    zeile.querySelector("select").value = String(wert.richtung || 1);
    zeile.querySelector("input").value = wert.anzahl || "";
    zeile.querySelectorAll("select")[1].value = wert.muenze || "gold";
    zeile.querySelector("button").addEventListener("click", () => {
      zeile.remove();
      aktualisiereRechner();
    });
    zeile.querySelectorAll("input,select").forEach(element => element.addEventListener("input", aktualisiereRechner));
    return zeile;
  }

  function rechnerKupfer() {
    const container = document.getElementById("vermoegenRechnerZeilen");
    if (!container) return 0;
    return [...container.querySelectorAll(".vermoegen-rechner-zeile")].reduce((summe, zeile) => {
      const selects = zeile.querySelectorAll("select");
      const richtung = Number(selects[0]?.value) || 1;
      const anzahl = ganzzahl(zeile.querySelector("input")?.value, 0);
      const muenze = MUENZEN.find(e => e.key === selects[1]?.value) || MUENZEN[1];
      return summe + richtung * anzahl * muenze.kupfer;
    }, 0);
  }

  function rechnerErgebnis() {
    const teiler = Math.max(1, ganzzahl(document.getElementById("vermoegenRechnerTeiler")?.value, 1, 999));
    return Math.trunc(rechnerKupfer() / teiler);
  }

  function aktualisiereRechner() {
    const ausgabe = document.getElementById("vermoegenRechnerErgebnis");
    if (!ausgabe) return;
    const wert = rechnerErgebnis();
    const vorzeichen = wert > 0 ? "+" : wert < 0 ? "−" : "";
    ausgabe.textContent = `${vorzeichen}${formatGold(Math.abs(wert))} GM`;
  }

  function uebernehmeRechner(richtung) {
    const vermoegen = daten();
    if (!vermoegen) return;
    const wert = Math.abs(rechnerErgebnis());
    if (!wert) return;
    vermoegen.kupferGesamt = Math.max(0, vermoegen.kupferGesamt + (richtung > 0 ? wert : -wert));
    speichere();
    aktualisiereAnzeige();
  }

  function initialisiere() {
    document.querySelectorAll("[data-vermoegen-plus]").forEach(button => {
      button.addEventListener("click", () => buche(button.dataset.vermoegenPlus, 1));
    });
    document.querySelectorAll("[data-vermoegen-minus]").forEach(button => {
      button.addEventListener("click", () => buche(button.dataset.vermoegenMinus, -1));
    });

    const notiz = document.getElementById("vermoegenNotiz");
    notiz?.addEventListener("input", () => {
      const vermoegen = daten();
      if (!vermoegen) return;
      vermoegen.notiz = notiz.value;
      speichere();
    });

    const zeilen = document.getElementById("vermoegenRechnerZeilen");
    zeilen?.appendChild(rechnerZeile({muenze:"gold"}));
    document.getElementById("btnVermoegenRechnerZeile")?.addEventListener("click", () => {
      zeilen?.appendChild(rechnerZeile({muenze:"gold"}));
      aktualisiereRechner();
    });
    document.getElementById("vermoegenRechnerTeiler")?.addEventListener("input", aktualisiereRechner);
    document.getElementById("btnVermoegenRechnerPlus")?.addEventListener("click", () => uebernehmeRechner(1));
    document.getElementById("btnVermoegenRechnerMinus")?.addEventListener("click", () => uebernehmeRechner(-1));

    const alteWahl = typeof waehleCharakter === "function" ? waehleCharakter : null;
    if (alteWahl) {
      waehleCharakter = function (id) {
        const ergebnis = alteWahl(id);
        if (ergebnis) aktualisiereAnzeige();
        return ergebnis;
      };
    }

    const altAlle = typeof window.aktualisiereAlleAnsichten === "function" ? window.aktualisiereAlleAnsichten : null;
    if (altAlle) {
      window.aktualisiereAlleAnsichten = function (...args) {
        const ergebnis = altAlle(...args);
        aktualisiereAnzeige();
        return ergebnis;
      };
    }

    document.getElementById("btnVermoegen")?.addEventListener("click", aktualisiereAnzeige);
    aktualisiereAnzeige();
    aktualisiereRechner();
  }

  window.aktualisiereVermoegenAnsicht = aktualisiereAnzeige;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiere, { once: true });
  } else {
    initialisiere();
  }
})();
