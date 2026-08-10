// Version 0.32.1: Korrektur Restwert Schutz vor Energien
(() => {
  "use strict";

  const ENERGIEN = ["Elektro", "Feuer", "Kälte", "Säure", "Schall"];
  const WIDERSTAND_WERTE = [10, 20, 30];
  const SCHUTZ_WERTE = Array.from({ length: 10 }, (_, i) => (i + 1) * 12);

  const seite = document.getElementById("leben");
  const btnSeite = document.getElementById("btnLeben");
  const widerstehenListe = document.getElementById("energieWiderstehenListe");
  const schutzListe = document.getElementById("energieSchutzListe");
  const widerstehenMeldung = document.getElementById("energieWiderstehenMeldung");
  const schutzMeldung = document.getElementById("energieSchutzMeldung");
  if (!seite || !btnSeite || !widerstehenListe || !schutzListe) return;

  seiten.leben = seite;

  function ganzeZahl(wert, minimum = 0, maximum = 9999) {
    const zahl = Number(wert);
    if (!Number.isFinite(zahl)) return minimum;
    return Math.min(maximum, Math.max(minimum, Math.trunc(zahl)));
  }

  function standardWiderstand() {
    return Object.fromEntries(ENERGIEN.map(typ => [typ, {
      aktiv: false,
      reduktion: 10,
      schaden: "",
      notiz: ""
    }]));
  }

  function standardSchutz() {
    return Object.fromEntries(ENERGIEN.map(typ => [typ, {
      aktiv: false,
      maximum: 12,
      rest: 12,
      schaden: "",
      notiz: ""
    }]));
  }

  function normalisiereWiderstand(daten = {}) {
    const basis = standardWiderstand();
    ENERGIEN.forEach(typ => {
      const eintrag = daten?.[typ] || {};
      const reduktion = WIDERSTAND_WERTE.includes(Number(eintrag.reduktion)) ? Number(eintrag.reduktion) : 10;
      basis[typ] = {
        aktiv: !!eintrag.aktiv,
        reduktion,
        schaden: "",
        notiz: typeof eintrag.notiz === "string" ? eintrag.notiz : ""
      };
    });
    return basis;
  }

  function normalisiereSchutz(daten = {}) {
    const basis = standardSchutz();
    ENERGIEN.forEach(typ => {
      const eintrag = daten?.[typ] || {};
      const maximum = SCHUTZ_WERTE.includes(Number(eintrag.maximum)) ? Number(eintrag.maximum) : 12;
      const restVorhanden =
        eintrag.rest !== null &&
        typeof eintrag.rest !== "undefined" &&
        eintrag.rest !== "";
      basis[typ] = {
        aktiv: !!eintrag.aktiv,
        maximum,
        // Beim ersten Anlegen entspricht der Restwert immer dem gewählten Maximum.
        rest: restVorhanden
          ? Math.min(maximum, ganzeZahl(eintrag.rest, 0, maximum))
          : maximum,
        schaden: "",
        notiz: typeof eintrag.notiz === "string" ? eintrag.notiz : ""
      };
    });
    return basis;
  }

  const bisherigeNormalisierung = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = bisherigeNormalisierung(charakter);
    return {
      ...basis,
      energieWiderstand: normalisiereWiderstand(charakter.energieWiderstand),
      energieSchutz: normalisiereSchutz(charakter.energieSchutz)
    };
  };

  function stelleEnergieDatenSicher(charakter) {
    if (!charakter) return;
    charakter.energieWiderstand = normalisiereWiderstand(charakter.energieWiderstand);
    charakter.energieSchutz = normalisiereSchutz(charakter.energieSchutz);
  }

  function zeigeMeldung(element, text = "", fehler = false) {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("fehler", fehler);
  }

  function applyTrefferpunktSchaden(charakter, schaden) {
    const rest = ganzeZahl(schaden, 0, 9999);
    if (rest <= 0) return { temp: 0, tp: 0 };
    const vonTemp = Math.min(ganzeZahl(charakter.temporaereTp), rest);
    charakter.temporaereTp -= vonTemp;
    const vonTp = rest - vonTemp;
    charakter.aktuelleTp -= vonTp;
    return { temp: vonTemp, tp: vonTp };
  }

  function speichereUndAktualisiere() {
    speichereCharaktere();
    if (typeof window.aktualisiereTrefferpunkteAnsicht === "function") {
      window.aktualisiereTrefferpunkteAnsicht();
    }
    rendereEnergieAnsicht();
  }

  function erstelleKopf(texte, klasse) {
    const kopf = document.createElement("div");
    kopf.className = `energie-zeile energie-kopf ${klasse}`;
    texte.forEach(text => {
      const feld = document.createElement("span");
      feld.textContent = text;
      kopf.appendChild(feld);
    });
    return kopf;
  }

  function selectMitWerten(werte, aktuellerWert, aria) {
    const select = document.createElement("select");
    select.setAttribute("aria-label", aria);
    werte.forEach(wert => {
      const option = document.createElement("option");
      option.value = String(wert);
      option.textContent = String(wert);
      option.selected = Number(aktuellerWert) === wert;
      select.appendChild(option);
    });
    return select;
  }

  function zahlenfeld(aria) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "9999";
    input.step = "1";
    input.inputMode = "numeric";
    input.placeholder = "0";
    input.setAttribute("aria-label", aria);
    return input;
  }

  function notizfeld(wert, aria, speichern) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = wert || "";
    input.placeholder = "Notiz";
    input.setAttribute("aria-label", aria);
    input.addEventListener("input", () => speichern(input.value));
    return input;
  }

  function rendereWiderstehen(charakter) {
    widerstehenListe.innerHTML = "";
    widerstehenListe.appendChild(erstelleKopf(["Aktiv", "Energie", "Reduktion", "Schaden", "", "Notiz"], "energie-widerstehen-zeile"));

    ENERGIEN.forEach(typ => {
      const daten = charakter.energieWiderstand[typ];
      const zeile = document.createElement("div");
      zeile.className = "energie-zeile energie-widerstehen-zeile";

      const aktiv = document.createElement("input");
      aktiv.type = "checkbox";
      aktiv.checked = daten.aktiv;
      aktiv.setAttribute("aria-label", `${typ}: Energiewiderstand aktiv`);
      aktiv.addEventListener("change", () => {
        daten.aktiv = aktiv.checked;
        speichereCharaktere();
      });

      const name = document.createElement("strong");
      name.textContent = typ;

      const reduktion = selectMitWerten(WIDERSTAND_WERTE, daten.reduktion, `${typ}: Schadensreduzierung`);
      reduktion.addEventListener("change", () => {
        daten.reduktion = Number(reduktion.value);
        speichereCharaktere();
      });

      const schaden = zahlenfeld(`${typ}: Energieschaden`);
      const anwenden = document.createElement("button");
      anwenden.type = "button";
      anwenden.textContent = "✓";
      anwenden.className = "energie-anwenden";
      anwenden.setAttribute("aria-label", `${typ}: Energieschaden anwenden`);

      const ausfuehren = () => {
        const eingabe = Number(schaden.value);
        if (!Number.isInteger(eingabe) || eingabe < 1) {
          zeigeMeldung(widerstehenMeldung, "Bitte einen gültigen Energieschaden eingeben.", true);
          schaden.focus();
          return;
        }
        const reduktionWert = daten.aktiv ? daten.reduktion : 0;
        const rest = Math.max(0, eingabe - reduktionWert);
        const verteilt = applyTrefferpunktSchaden(charakter, rest);
        schaden.value = "";
        zeigeMeldung(widerstehenMeldung,
          `${typ}: ${eingabe} Schaden − ${reduktionWert} Widerstand = ${rest} Restschaden` +
          (rest ? ` (${verteilt.temp} Temp-TP, ${verteilt.tp} TP).` : "."));
        speichereUndAktualisiere();
      };
      anwenden.addEventListener("click", ausfuehren);
      schaden.addEventListener("keydown", event => { if (event.key === "Enter") ausfuehren(); });

      const notiz = notizfeld(daten.notiz, `${typ}: Notiz`, wert => {
        daten.notiz = wert;
        speichereCharaktere();
      });

      zeile.append(aktiv, name, reduktion, schaden, anwenden, notiz);
      widerstehenListe.appendChild(zeile);
    });
  }

  function rendereSchutz(charakter) {
    schutzListe.innerHTML = "";
    schutzListe.appendChild(erstelleKopf(["Aktiv", "Energie", "Maximum", "Rest", "Schaden", "✓", "Notiz"], "energie-schutz-zeile"));

    ENERGIEN.forEach(typ => {
      const daten = charakter.energieSchutz[typ];
      const zeile = document.createElement("div");
      zeile.className = "energie-zeile energie-schutz-zeile";

      const aktiv = document.createElement("input");
      aktiv.type = "checkbox";
      aktiv.checked = daten.aktiv;
      aktiv.setAttribute("aria-label", `${typ}: Schutz vor Energien aktiv`);
      aktiv.addEventListener("change", () => {
        daten.aktiv = aktiv.checked;
        speichereCharaktere();
      });

      const name = document.createElement("strong");
      name.textContent = typ;

      const maximum = selectMitWerten(SCHUTZ_WERTE, daten.maximum, `${typ}: absorbierbarer Energieschaden`);
      maximum.addEventListener("change", () => {
        daten.maximum = Number(maximum.value);
        // Eine neue Auswahl setzt den Schutzpool auf den gewählten Gesamtwert.
        daten.rest = daten.maximum;
        speichereUndAktualisiere();
      });

      const rest = document.createElement("output");
      rest.className = "energie-restwert";
      rest.textContent = String(daten.rest);
      rest.setAttribute("aria-label", `${typ}: verbleibender absorbierbarer Energieschaden`);

      const schaden = zahlenfeld(`${typ}: erlittener Energieschaden`);
      const anwenden = document.createElement("button");
      anwenden.type = "button";
      anwenden.textContent = "✓";
      anwenden.className = "energie-anwenden";
      anwenden.setAttribute("aria-label", `${typ}: Schutz anwenden`);

      const ausfuehren = () => {
        const eingabe = Number(schaden.value);
        if (!Number.isInteger(eingabe) || eingabe < 1) {
          zeigeMeldung(schutzMeldung, "Bitte einen gültigen Energieschaden eingeben.", true);
          schaden.focus();
          return;
        }
        const absorbierbar = daten.aktiv ? daten.rest : 0;
        const absorbiert = Math.min(absorbierbar, eingabe);
        if (daten.aktiv) daten.rest -= absorbiert;
        const restschaden = eingabe - absorbiert;
        const verteilt = applyTrefferpunktSchaden(charakter, restschaden);
        schaden.value = "";
        zeigeMeldung(schutzMeldung,
          `${typ}: ${absorbiert} absorbiert, ${restschaden} Restschaden` +
          (restschaden ? ` (${verteilt.temp} Temp-TP, ${verteilt.tp} TP).` : "."));
        speichereUndAktualisiere();
      };
      anwenden.addEventListener("click", ausfuehren);
      schaden.addEventListener("keydown", event => { if (event.key === "Enter") ausfuehren(); });

      const notiz = notizfeld(daten.notiz, `${typ}: Notiz`, wert => {
        daten.notiz = wert;
        speichereCharaktere();
      });

      zeile.append(aktiv, name, maximum, rest, schaden, anwenden, notiz);
      schutzListe.appendChild(zeile);
    });
  }

  function rendereEnergieAnsicht() {
    const charakter = aktiverCharakter();
    widerstehenListe.innerHTML = "";
    schutzListe.innerHTML = "";
    if (!charakter) {
      widerstehenListe.textContent = "Kein aktiver Charakter.";
      schutzListe.textContent = "Kein aktiver Charakter.";
      return;
    }
    stelleEnergieDatenSicher(charakter);
    rendereWiderstehen(charakter);
    rendereSchutz(charakter);
  }

  btnSeite.addEventListener("click", () => {
    zeigeSeite("leben");
    if (typeof window.aktualisiereTrefferpunkteAnsicht === "function") window.aktualisiereTrefferpunkteAnsicht();
    rendereEnergieAnsicht();
  });

  const alteWahl = waehleCharakter;
  waehleCharakter = function (id) {
    const ergebnis = alteWahl(id);
    if (ergebnis) rendereEnergieAnsicht();
    return ergebnis;
  };

  window.rendereEnergieAnsicht = rendereEnergieAnsicht;
  rendereEnergieAnsicht();
})();
