// Commit 26: Grundwerte für RK, Rettungswürfe, KMB und KMV
(() => {
  "use strict";

  const WERTE = [
    { key: "rk", ziel: "Rüstungsklasse", label: "Rüstungsklasse", gruppe: "Rüstungsklasse" },
    { key: "rw.reflex", ziel: "RW-Reflex", label: "RW-Reflex", gruppe: "Rettungswürfe" },
    { key: "rw.wille", ziel: "RW-Wille", label: "RW-Wille", gruppe: "Rettungswürfe" },
    { key: "rw.zaehigkeit", ziel: "RW-Zähigkeit", label: "RW-Zähigkeit", gruppe: "Rettungswürfe" },
    { key: "rw.furcht", ziel: "RW-Furcht", label: "RW-Furcht", gruppe: "Rettungswürfe" },
    { key: "rw.gift", ziel: "RW-Gift", label: "RW-Gift", gruppe: "Rettungswürfe" },
    { key: "rw.bezauberung", ziel: "RW-Bezauberung", label: "RW-Bezauberung", gruppe: "Rettungswürfe" },
    { key: "rw.verzauberung", ziel: "RW-Verzauberung", label: "RW-Verzauberung", gruppe: "Rettungswürfe" },
    { key: "kmb", ziel: "KMB", label: "KMB", gruppe: "Kampfmanöver" },
    { key: "kmv", ziel: "KMV", label: "KMV", gruppe: "Kampfmanöver" }
  ];

  function ganzeZahlOderNull(wert) {
    if (wert === "" || wert === null || typeof wert === "undefined") return 0;
    const zahl = Number(wert);
    return Number.isFinite(zahl) ? Math.trunc(zahl) : 0;
  }

  function lesePfad(objekt, pfad) {
    return pfad.split(".").reduce((wert, teil) => wert?.[teil], objekt);
  }

  function schreibePfad(objekt, pfad, wert) {
    const teile = pfad.split(".");
    let ziel = objekt;
    teile.slice(0, -1).forEach(teil => {
      if (!ziel[teil] || typeof ziel[teil] !== "object") ziel[teil] = {};
      ziel = ziel[teil];
    });
    ziel[teile.at(-1)] = wert;
  }

  function formatiereWert(wert) {
    const zahl = ganzeZahlOderNull(wert);
    return zahl > 0 ? `+${zahl}` : String(zahl);
  }

  function formatiereGesamtwert(wert) {
    return String(ganzeZahlOderNull(wert));
  }

  const bisherigeNormalisierung = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = bisherigeNormalisierung(charakter);
    const kampfwerteQuelle =
      charakter.kampfwerte && typeof charakter.kampfwerte === "object"
        ? charakter.kampfwerte
        : {};
    const rwQuelle =
      kampfwerteQuelle.rw && typeof kampfwerteQuelle.rw === "object"
        ? kampfwerteQuelle.rw
        : {};

    return {
      ...basis,
      kampfwerte: {
        ...basis.kampfwerte,
        rk: ganzeZahlOderNull(kampfwerteQuelle.rk ?? basis.kampfwerte?.rk),
        kmb: ganzeZahlOderNull(kampfwerteQuelle.kmb ?? basis.kampfwerte?.kmb),
        kmv: ganzeZahlOderNull(kampfwerteQuelle.kmv ?? basis.kampfwerte?.kmv),
        rw: {
          ...(basis.kampfwerte?.rw || {}),
          reflex: ganzeZahlOderNull(rwQuelle.reflex ?? basis.kampfwerte?.rw?.reflex),
          wille: ganzeZahlOderNull(rwQuelle.wille ?? basis.kampfwerte?.rw?.wille),
          zaehigkeit: ganzeZahlOderNull(rwQuelle.zaehigkeit ?? basis.kampfwerte?.rw?.zaehigkeit),
          furcht: ganzeZahlOderNull(rwQuelle.furcht),
          gift: ganzeZahlOderNull(rwQuelle.gift),
          bezauberung: ganzeZahlOderNull(rwQuelle.bezauberung),
          verzauberung: ganzeZahlOderNull(rwQuelle.verzauberung)
        }
      }
    };
  };

  function aktuelleBoni() {
    if (typeof berechneBonusErgebnis !== "function") return {};
    const ergebnis = berechneBonusErgebnis(
      typeof effekte !== "undefined" ? effekte : []
    );
    const altSchaden = Number(ergebnis.Schaden || 0);
    ergebnis["Schaden Nah"] = Number(ergebnis["Schaden Nah"] || 0) + altSchaden;
    ergebnis["Schaden Fern"] = Number(ergebnis["Schaden Fern"] || 0) + altSchaden;
    return ergebnis;
  }

  function erstelleBereich() {
    if (document.getElementById("grundwerte26")) return;

    const angriffe = document.querySelector("#charakterwerte .angriffe-bereich");
    if (!angriffe) return;

    const bereich = document.createElement("div");
    bereich.id = "grundwerte26";
    bereich.className = "grundwerte-26";

    ["Rüstungsklasse", "Rettungswürfe", "Kampfmanöver"].forEach(gruppenname => {
      const gruppe = document.createElement("section");
      gruppe.className = "grundwerte-gruppe-26";
      gruppe.innerHTML = `<h3>${gruppenname}</h3>`;

      const kopf = document.createElement("div");
      kopf.className = "grundwerte-kopf-26";
      kopf.innerHTML = "<span>Wert</span><span>Grundwert</span><span>Gesamt</span>";
      gruppe.appendChild(kopf);

      WERTE.filter(eintrag => eintrag.gruppe === gruppenname).forEach(eintrag => {
        const zeile = document.createElement("div");
        zeile.className = "grundwert-zeile-26";
        zeile.dataset.wertKey = eintrag.key;
        zeile.dataset.bonusZiel = eintrag.ziel;

        const label = document.createElement("label");
        label.textContent = eintrag.label;
        label.htmlFor = `grundwert26-${eintrag.key.replace(".", "-")}`;

        const input = document.createElement("input");
        input.id = `grundwert26-${eintrag.key.replace(".", "-")}`;
        input.type = "number";
        input.step = "1";
        input.min = "-999";
        input.max = "999";
        input.inputMode = "numeric";
        input.setAttribute("aria-label", `${eintrag.label} Grundwert`);

        const gesamt = document.createElement("button");
        gesamt.type = "button";
        gesamt.className = "grundwert-gesamt-26";
        gesamt.setAttribute("aria-label", `${eintrag.label} Bonusdetails anzeigen`);
        gesamt.addEventListener("click", () =>
          zeigeDetails(eintrag, ganzeZahlOderNull(input.value))
        );

        input.addEventListener("change", () => {
          const charakter = aktiverCharakter();
          if (!charakter) return;
          const wert = ganzeZahlOderNull(input.value);
          input.value = String(wert);
          schreibePfad(charakter.kampfwerte, eintrag.key, wert);
          speichereCharaktere();
          aktualisiereAnsicht();
        });

        zeile.append(label, input, gesamt);
        gruppe.appendChild(zeile);
      });

      bereich.appendChild(gruppe);
    });

    angriffe.after(bereich);
  }

  function bewerteteBoni(ziel) {
    if (typeof sammleAktiveBoni !== "function") return [];
    const boni = sammleAktiveBoni(typeof effekte !== "undefined" ? effekte : [])
      .filter(bonus => bonus.ziel === ziel);

    const stapelbar =
      typeof STAPELBARE_BONUSARTEN !== "undefined"
        ? STAPELBARE_BONUSARTEN
        : new Set();

    const nachArt = new Map();
    boni.forEach(bonus => {
      if (!nachArt.has(bonus.bonusart)) nachArt.set(bonus.bonusart, []);
      nachArt.get(bonus.bonusart).push(bonus);
    });

    return boni.map(bonus => {
      if (stapelbar.has(bonus.bonusart)) {
        return { ...bonus, beruecksichtigt: true };
      }

      const gruppe = nachArt.get(bonus.bonusart) || [];
      if (bonus.wert > 0) {
        const maximum = Math.max(
          0,
          ...gruppe.filter(e => e.wert > 0).map(e => e.wert)
        );
        return { ...bonus, beruecksichtigt: bonus.wert === maximum };
      }

      const minimum = Math.min(
        0,
        ...gruppe.filter(e => e.wert < 0).map(e => e.wert)
      );
      return { ...bonus, beruecksichtigt: bonus.wert === minimum };
    });
  }

  function detailDialog() {
    let dialog = document.getElementById("bonusDetailDialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "bonusDetailDialog";
    dialog.className = "bonus-detail-dialog";
    dialog.innerHTML = `
      <div class="bonus-detail-kopf">
        <h3 id="bonusDetailTitel">Bonusdetails</h3>
        <button type="button" id="bonusDetailSchliessen" aria-label="Schließen">×</button>
      </div>
      <div id="bonusDetailInhalt"></div>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector("#bonusDetailSchliessen")
      .addEventListener("click", () => dialog.close());
    return dialog;
  }

  function zeigeDetails(eintrag, grundwert) {
    const dialog = detailDialog();
    const boni = bewerteteBoni(eintrag.ziel);
    const bonusGesamt = Number(aktuelleBoni()[eintrag.ziel] || 0);

    dialog.querySelector("#bonusDetailTitel").textContent = eintrag.label;
    const inhalt = dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML = "";

    const summe = document.createElement("p");
    summe.className = "bonus-detail-summe";
    summe.textContent =
      `Grundwert ${formatiereWert(grundwert)} + Boni ${formatiereWert(bonusGesamt)}` +
      ` = ${formatiereGesamtwert(grundwert + bonusGesamt)}`;
    inhalt.appendChild(summe);

    if (boni.length === 0) {
      const leer = document.createElement("p");
      leer.textContent = "Keine aktiven Boni für diesen Wert.";
      inhalt.appendChild(leer);
    } else {
      const liste = document.createElement("div");
      liste.className = "bonus-detail-liste";
      boni.forEach(bonus => {
        const zeile = document.createElement("div");
        zeile.className = "bonus-detail-zeile";
        if (!bonus.beruecksichtigt) {
          zeile.classList.add("nicht-beruecksichtigt");
        }
        zeile.innerHTML = `
          <strong>${formatiereWert(bonus.wert)}</strong>
          <span>${bonus.bonusart}</span>
          <span>${bonus.effektName || "Unbenannter Effekt"}</span>
          <small>${bonus.beruecksichtigt
            ? "berücksichtigt"
            : "nicht stapelbar – nicht berücksichtigt"}</small>
        `;
        liste.appendChild(zeile);
      });
      inhalt.appendChild(liste);
    }

    dialog.showModal();
  }

  function aktualisiereAnsicht() {
    erstelleBereich();

    const charakter = aktiverCharakter();
    const boni = aktuelleBoni();

    document.querySelectorAll(".grundwert-zeile-26").forEach(zeile => {
      const key = zeile.dataset.wertKey;
      const ziel = zeile.dataset.bonusZiel;
      const input = zeile.querySelector("input");
      const gesamt = zeile.querySelector(".grundwert-gesamt-26");

      if (!charakter) {
        input.disabled = true;
        input.value = "0";
        gesamt.textContent = "0";
        gesamt.disabled = true;
        return;
      }

      input.disabled = false;
      gesamt.disabled = false;
      const grundwert = ganzeZahlOderNull(lesePfad(charakter.kampfwerte, key));
      input.value = String(grundwert);
      gesamt.textContent = formatiereGesamtwert(
        grundwert + Number(boni[ziel] || 0)
      );
    });
  }

  function initialisiereCommit26() {
    erstelleBereich();
    aktualisiereAnsicht();

    const alteWahl = typeof waehleCharakter === "function" ? waehleCharakter : null;
    if (alteWahl) {
      waehleCharakter = function (id) {
        const ergebnis = alteWahl(id);
        if (ergebnis) aktualisiereAnsicht();
        return ergebnis;
      };
    }

    const alteBerechnung =
      typeof berechneWerte === "function" ? berechneWerte : null;
    if (alteBerechnung) {
      berechneWerte = function (...argumente) {
        const ergebnis = alteBerechnung(...argumente);
        aktualisiereAnsicht();
        return ergebnis;
      };
      window.berechneWerte = berechneWerte;
    }

    document.addEventListener("pf-charakter-importiert", aktualisiereAnsicht);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit26, {
      once: true
    });
  } else {
    initialisiereCommit26();
  }
})();
