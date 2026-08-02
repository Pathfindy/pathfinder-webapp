// Commit 27.1: Unterrettungswürfe strikt getrennt berechnen
(() => {
  "use strict";

  const WERTE = [
    { key: "rk", ziel: "Rüstungsklasse", label: "Rüstungsklasse", gruppe: "Rüstungsklasse", eingabe: true },
    { key: "rw.reflex", ziel: "RW-Reflex", label: "RW-Reflex", gruppe: "Rettungswürfe", eingabe: true },
    { key: "rw.wille", ziel: "RW-Wille", label: "RW-Wille", gruppe: "Rettungswürfe", eingabe: true },
    {
      key: "rw.furcht",
      ziel: "RW-Furcht",
      label: "RW-Furcht",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    {
      key: "rw.bezauberung",
      ziel: "RW-Bezauberung",
      label: "RW-Bezauberung",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    {
      key: "rw.verzauberung",
      ziel: "RW-Verzauberung",
      label: "RW-Verzauberung",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    { key: "rw.zaehigkeit", ziel: "RW-Zähigkeit", label: "RW-Zähigkeit", gruppe: "Rettungswürfe", eingabe: true },
    {
      key: "rw.gift",
      ziel: "RW-Gift",
      label: "RW-Gift",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.zaehigkeit",
      basisZiel: "RW-Zähigkeit"
    },
    { key: "kmb", ziel: "KMB", label: "KMB", gruppe: "Kampfmanöver", eingabe: true },
    { key: "kmv", ziel: "KMV", label: "KMV", gruppe: "Kampfmanöver", eingabe: true }
  ];

  const SPEZIAL_ZIELE = new Map(
    WERTE.filter(eintrag => !eintrag.eingabe)
      .map(eintrag => [eintrag.ziel, eintrag])
  );

  function ganzeZahl(wert) {
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

  function formatiereBonus(wert) {
    const zahl = ganzeZahl(wert);
    return zahl > 0 ? `+${zahl}` : String(zahl);
  }

  function formatiereGesamt(wert) {
    return String(ganzeZahl(wert));
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
        rk: ganzeZahl(kampfwerteQuelle.rk ?? basis.kampfwerte?.rk),
        kmb: ganzeZahl(kampfwerteQuelle.kmb ?? basis.kampfwerte?.kmb),
        kmv: ganzeZahl(kampfwerteQuelle.kmv ?? basis.kampfwerte?.kmv),
        rw: {
          ...(basis.kampfwerte?.rw || {}),
          reflex: ganzeZahl(rwQuelle.reflex ?? basis.kampfwerte?.rw?.reflex),
          wille: ganzeZahl(rwQuelle.wille ?? basis.kampfwerte?.rw?.wille),
          zaehigkeit: ganzeZahl(rwQuelle.zaehigkeit ?? basis.kampfwerte?.rw?.zaehigkeit)
        }
      }
    };
  };

  function aktiveBoni() {
    return typeof sammleAktiveBoni === "function"
      ? sammleAktiveBoni(typeof effekte !== "undefined" ? effekte : [])
      : [];
  }

  function bewerteBonusListe(boni) {
    const stapelbar =
      typeof STAPELBARE_BONUSARTEN !== "undefined"
        ? STAPELBARE_BONUSARTEN
        : new Set();

    const gruppen = new Map();
    boni.forEach((bonus, index) => {
      const art = bonus.bonusart || "Namenlos";
      if (!gruppen.has(art)) gruppen.set(art, []);
      gruppen.get(art).push({ bonus, index });
    });

    const bewertet = boni.map(bonus => ({ ...bonus, beruecksichtigt: false }));

    gruppen.forEach((eintraege, art) => {
      if (stapelbar.has(art)) {
        eintraege.forEach(({ index }) => {
          bewertet[index].beruecksichtigt = true;
        });
        return;
      }

      const positive = eintraege.filter(({ bonus }) => bonus.wert > 0);
      const negative = eintraege.filter(({ bonus }) => bonus.wert < 0);

      if (positive.length) {
        const max = Math.max(...positive.map(({ bonus }) => bonus.wert));
        const erster = positive.find(({ bonus }) => bonus.wert === max);
        if (erster) bewertet[erster.index].beruecksichtigt = true;
      }

      if (negative.length) {
        const min = Math.min(...negative.map(({ bonus }) => bonus.wert));
        const erster = negative.find(({ bonus }) => bonus.wert === min);
        if (erster) bewertet[erster.index].beruecksichtigt = true;
      }
    });

    return bewertet;
  }

  function bonusBerechnung(eintrag) {
    if (!eintrag) return { gesamt: 0, boni: [] };

    const alleBoni = aktiveBoni();

    // Basis-Rettungswürfe und andere normale Werte:
    // ausschließlich Boni, deren Ziel exakt diesem Wert entspricht.
    if (eintrag.eingabe || !eintrag.basisZiel) {
      const eigeneBoni = alleBoni.filter(
        bonus => bonus.ziel === eintrag.ziel
      );
      const bewertet = bewerteBonusListe(eigeneBoni);
      const gesamt = bewertet
        .filter(bonus => bonus.beruecksichtigt)
        .reduce((summe, bonus) => summe + ganzeZahl(bonus.wert), 0);

      return { gesamt, boni: bewertet };
    }

    // Spezial-Rettungswurf:
    // nur Boni des Basis-Rettungswurfs plus Boni dieses einen Spezialziels.
    // Boni anderer Spezial-Rettungswürfe werden ausdrücklich ausgeschlossen.
    const basisBoni = alleBoni.filter(
      bonus => bonus.ziel === eintrag.basisZiel
    );
    const spezialBoni = alleBoni.filter(
      bonus => bonus.ziel === eintrag.ziel
    );

    const bewertet = bewerteBonusListe([
      ...basisBoni,
      ...spezialBoni
    ]);
    const gesamt = bewertet
      .filter(bonus => bonus.beruecksichtigt)
      .reduce((summe, bonus) => summe + ganzeZahl(bonus.wert), 0);

    return { gesamt, boni: bewertet };
  }

  function grundwertFuer(eintrag, charakter) {
    const pfad = eintrag.eingabe ? eintrag.key : eintrag.basisKey;
    return ganzeZahl(lesePfad(charakter?.kampfwerte, pfad));
  }

  function gesamtwertFuer(eintrag, charakter) {
    return grundwertFuer(eintrag, charakter) + bonusBerechnung(eintrag).gesamt;
  }

  function erstelleBereich() {
    document.getElementById("grundwerte26")?.remove();

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
        if (!eintrag.eingabe) zeile.classList.add("spezial-rw-27");
        zeile.dataset.wertKey = eintrag.key;
        zeile.dataset.bonusZiel = eintrag.ziel;

        const label = document.createElement("label");
        label.textContent = eintrag.label;

        let mittelteil;
        if (eintrag.eingabe) {
          const input = document.createElement("input");
          input.id = `grundwert26-${eintrag.key.replace(".", "-")}`;
          label.htmlFor = input.id;
          input.type = "number";
          input.step = "1";
          input.min = "-999";
          input.max = "999";
          input.inputMode = "numeric";
          input.setAttribute("aria-label", `${eintrag.label} Grundwert`);
          input.addEventListener("change", () => {
            const charakter = aktiverCharakter();
            if (!charakter) return;
            const wert = ganzeZahl(input.value);
            input.value = String(wert);
            schreibePfad(charakter.kampfwerte, eintrag.key, wert);
            speichereCharaktere();
            aktualisiereAnsicht();
          });
          mittelteil = input;
        } else {
          const basis = document.createElement("span");
          basis.className = "spezial-rw-basis-27";
          basis.textContent = `aus ${eintrag.basisZiel}`;
          mittelteil = basis;
        }

        const gesamt = document.createElement("button");
        gesamt.type = "button";
        gesamt.className = "grundwert-gesamt-26";
        gesamt.setAttribute("aria-label", `${eintrag.label} Bonusdetails anzeigen`);
        gesamt.addEventListener("click", () => zeigeDetails(eintrag));

        zeile.append(label, mittelteil, gesamt);
        gruppe.appendChild(zeile);
      });

      bereich.appendChild(gruppe);
    });

    angriffe.after(bereich);
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

  function zeigeDetails(eintrag) {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    const dialog = detailDialog();
    const grundwert = grundwertFuer(eintrag, charakter);
    const berechnung = bonusBerechnung(eintrag);
    const gesamt = grundwert + berechnung.gesamt;

    dialog.querySelector("#bonusDetailTitel").textContent = eintrag.label;
    const inhalt = dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML = "";

    const summe = document.createElement("p");
    summe.className = "bonus-detail-summe";
    summe.textContent = eintrag.eingabe
      ? `Grundwert ${formatiereGesamt(grundwert)} + Boni ${formatiereBonus(berechnung.gesamt)} = ${formatiereGesamt(gesamt)}`
      : `Basis ${eintrag.basisZiel} ${formatiereGesamt(grundwert)} + anwendbare Boni ${formatiereBonus(berechnung.gesamt)} = ${formatiereGesamt(gesamt)}`;
    inhalt.appendChild(summe);

    if (!berechnung.boni.length) {
      const leer = document.createElement("p");
      leer.textContent = "Keine aktiven Boni für diesen Wert.";
      inhalt.appendChild(leer);
    } else {
      const liste = document.createElement("div");
      liste.className = "bonus-detail-liste";
      berechnung.boni.forEach(bonus => {
        const zeile = document.createElement("div");
        zeile.className = "bonus-detail-zeile";
        if (!bonus.beruecksichtigt) zeile.classList.add("nicht-beruecksichtigt");
        zeile.innerHTML = `
          <strong>${formatiereBonus(bonus.wert)}</strong>
          <span>${bonus.bonusart}</span>
          <span>${bonus.effektName || "Unbenannter Effekt"}</span>
          <small>${bonus.ziel}${bonus.beruecksichtigt
            ? " · berücksichtigt"
            : " · gleicher Bonustyp – nicht berücksichtigt"}</small>
        `;
        liste.appendChild(zeile);
      });
      inhalt.appendChild(liste);
    }

    dialog.showModal();
  }

  function aktualisiereDashboardSpezialwerte() {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    const ids = {
      "RW-Furcht": "furcht",
      "RW-Gift": "gift",
      "RW-Bezauberung": "bezauberung",
      "RW-Verzauberung": "verzauberung"
    };

    SPEZIAL_ZIELE.forEach((eintrag, ziel) => {
      const element = document.getElementById(ids[ziel]);
      if (element) element.textContent = formatiereGesamt(gesamtwertFuer(eintrag, charakter));
    });
  }

  function aktualisiereAnsicht() {
    const charakter = aktiverCharakter();
    const bereich = document.getElementById("grundwerte26");
    if (!bereich) erstelleBereich();

    document.querySelectorAll(".grundwert-zeile-26").forEach(zeile => {
      const eintrag = WERTE.find(wert => wert.ziel === zeile.dataset.bonusZiel);
      if (!eintrag) return;

      const input = zeile.querySelector("input");
      const gesamt = zeile.querySelector(".grundwert-gesamt-26");

      if (!charakter) {
        if (input) {
          input.disabled = true;
          input.value = "0";
        }
        gesamt.textContent = "0";
        gesamt.disabled = true;
        return;
      }

      if (input) {
        input.disabled = false;
        input.value = String(grundwertFuer(eintrag, charakter));
      }
      gesamt.disabled = false;
      gesamt.textContent = formatiereGesamt(gesamtwertFuer(eintrag, charakter));
    });

    aktualisiereDashboardSpezialwerte();
  }

  function initialisiereCommit27() {
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
    document.addEventListener("DOMContentLoaded", initialisiereCommit27, {
      once: true
    });
  } else {
    initialisiereCommit27();
  }
})();
