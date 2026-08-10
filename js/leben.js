// Version 0.37: zentrale Schadenseingabe, Steinhaut und Energieschutz
(() => {
  "use strict";

  const ENERGIEN = ["Elektro", "Feuer", "Kälte", "Säure", "Schall"];
  const WIDERSTAND_WERTE = [10, 20, 30];
  const SCHUTZ_WERTE = Array.from({ length: 10 }, (_, i) => (i + 1) * 12);
  const STEINHAUT_WERTE = Array.from({ length: 15 }, (_, i) => (i + 1) * 10);

  const seite = document.getElementById("leben");
  const btnSeite = document.getElementById("btnLeben");
  const widerstehenListe = document.getElementById("energieWiderstehenListe");
  const schutzListe = document.getElementById("energieSchutzListe");
  const steinhautListe = document.getElementById("steinhautListe");
  const widerstehenMeldung = document.getElementById("energieWiderstehenMeldung");
  const schutzMeldung = document.getElementById("energieSchutzMeldung");
  const steinhautMeldung = document.getElementById("steinhautMeldung");
  const energieSchadenEingaben = document.getElementById("energieSchadenEingaben");
  const energieSchadenMeldung = document.getElementById("energieSchadenMeldung");
  if (!seite || !btnSeite || !widerstehenListe || !schutzListe || !steinhautListe || !energieSchadenEingaben) return;

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
      reduktionFrei: "",
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

  function standardSteinhaut() {
    return {
      aktiv: false,
      maximum: 10,
      rest: 10,
      schaden: "",
      notiz: ""
    };
  }

  function normalisiereWiderstand(daten = {}) {
    const basis = standardWiderstand();
    ENERGIEN.forEach(typ => {
      const eintrag = daten?.[typ] || {};
      const reduktion = WIDERSTAND_WERTE.includes(Number(eintrag.reduktion)) ? Number(eintrag.reduktion) : 10;
      const reduktionFrei =
        eintrag.reduktionFrei === "" ||
        eintrag.reduktionFrei === null ||
        typeof eintrag.reduktionFrei === "undefined"
          ? ""
          : ganzeZahl(eintrag.reduktionFrei, 0, 9999);
      basis[typ] = {
        aktiv: !!eintrag.aktiv,
        reduktion,
        reduktionFrei,
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


  function normalisiereSteinhaut(daten = {}) {
    const maximum = STEINHAUT_WERTE.includes(Number(daten.maximum)) ? Number(daten.maximum) : 10;
    const restVorhanden =
      daten.rest !== null &&
      typeof daten.rest !== "undefined" &&
      daten.rest !== "";
    return {
      aktiv: !!daten.aktiv,
      maximum,
      rest: restVorhanden
        ? Math.min(maximum, ganzeZahl(daten.rest, 0, maximum))
        : maximum,
      schaden: "",
      notiz: typeof daten.notiz === "string" ? daten.notiz : ""
    };
  }

  const bisherigeNormalisierung = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = bisherigeNormalisierung(charakter);
    return {
      ...basis,
      energieWiderstand: normalisiereWiderstand(charakter.energieWiderstand),
      energieSchutz: normalisiereSchutz(charakter.energieSchutz),
      steinhaut: normalisiereSteinhaut(charakter.steinhaut)
    };
  };

  function stelleEnergieDatenSicher(charakter) {
    if (!charakter) return;
    charakter.energieWiderstand = normalisiereWiderstand(charakter.energieWiderstand);
    charakter.energieSchutz = normalisiereSchutz(charakter.energieSchutz);
    charakter.steinhaut = normalisiereSteinhaut(charakter.steinhaut);
  }

  function zeigeMeldung(element, text = "", fehler = false) {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("fehler", fehler);
  }

  function effektiveEnergieReduktion(daten) {
    if (!daten?.aktiv) return 0;
    const frei = daten.reduktionFrei;
    if (frei !== "" && frei !== null && typeof frei !== "undefined") {
      return ganzeZahl(frei, 0, 9999);
    }
    return ganzeZahl(daten.reduktion, 0, 9999);
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

  function verarbeiteNormalenSchaden(charakter, schaden) {
    stelleEnergieDatenSicher(charakter);
    const eingabe = ganzeZahl(schaden, 0, 9999);
    const steinhaut = charakter.steinhaut;

    // Steinhaut gilt nur für normalen Schaden, niemals für Energieschaden.
    const moeglicheReduktion =
      steinhaut?.aktiv ? Math.min(10, ganzeZahl(steinhaut.rest, 0, 9999)) : 0;
    const reduziert = Math.min(eingabe, moeglicheReduktion);

    if (steinhaut?.aktiv && reduziert > 0) {
      steinhaut.rest -= reduziert;
    }

    const restschaden = eingabe - reduziert;
    const verteilt = applyTrefferpunktSchaden(charakter, restschaden);

    return {
      eingabe,
      reduziert,
      restschaden,
      verteilt,
      meldung:
        reduziert > 0
          ? `Steinhaut reduziert ${reduziert}. ${restschaden} Restschaden` +
            (restschaden ? ` (${verteilt.temp} Temp-TP, ${verteilt.tp} TP).` : ".")
          : `${eingabe} Schaden angewendet` +
            (eingabe ? ` (${verteilt.temp} Temp-TP, ${verteilt.tp} TP).` : ".")
    };
  }

  function verarbeiteEnergieschaden(charakter, typ, schaden) {
    stelleEnergieDatenSicher(charakter);
    const eingabe = ganzeZahl(schaden, 0, 9999);

    // 1. Aktiver Widerstand desselben Energietyps.
    const widerstandDaten = charakter.energieWiderstand?.[typ];
    const widerstand = effektiveEnergieReduktion(widerstandDaten);
    const nachWiderstand = Math.max(0, eingabe - widerstand);

    // 2. Aktiver Schutz vor Energien desselben Energietyps.
    const schutzDaten = charakter.energieSchutz?.[typ];
    const absorbierbar = schutzDaten?.aktiv
      ? ganzeZahl(schutzDaten.rest, 0, 9999)
      : 0;
    const absorbiert = Math.min(absorbierbar, nachWiderstand);

    if (schutzDaten?.aktiv && absorbiert > 0) {
      schutzDaten.rest -= absorbiert;
    }

    // 3. Nur der Überschuss trifft Temp-TP und danach aktuelle TP.
    // Steinhaut wird bei Energieschaden absichtlich nicht berücksichtigt.
    const restschaden = nachWiderstand - absorbiert;
    const verteilt = applyTrefferpunktSchaden(charakter, restschaden);

    return {
      eingabe,
      widerstand,
      nachWiderstand,
      absorbiert,
      restschaden,
      verteilt
    };
  }

  window.verarbeiteLebensSchaden = verarbeiteNormalenSchaden;

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
    widerstehenListe.appendChild(
      erstelleKopf(["Aktiv", "Energie", "Reduktion", "Notiz"], "energie-widerstehen-zeile")
    );

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

      const reduktionFeld = document.createElement("div");
      reduktionFeld.className = "energie-reduktion-stack";

      const reduktion = selectMitWerten(
        WIDERSTAND_WERTE,
        daten.reduktion,
        `${typ}: Schadensreduzierung`
      );
      reduktion.addEventListener("change", () => {
        daten.reduktion = Number(reduktion.value);
        speichereCharaktere();
      });

      const reduktionFrei = zahlenfeld(`${typ}: freie Schadensreduzierung`);
      reduktionFrei.className = "energie-reduktion-frei";
      reduktionFrei.placeholder = "frei";
      reduktionFrei.value =
        daten.reduktionFrei === "" ? "" : String(daten.reduktionFrei);
      reduktionFrei.addEventListener("input", () => {
        daten.reduktionFrei =
          reduktionFrei.value === ""
            ? ""
            : ganzeZahl(reduktionFrei.value, 0, 9999);
        speichereCharaktere();
      });

      reduktionFeld.append(reduktion, reduktionFrei);

      const notiz = notizfeld(daten.notiz, `${typ}: Notiz`, wert => {
        daten.notiz = wert;
        speichereCharaktere();
      });

      zeile.append(aktiv, name, reduktionFeld, notiz);
      widerstehenListe.appendChild(zeile);
    });
  }

  function rendereSchutz(charakter) {
    schutzListe.innerHTML = "";
    schutzListe.appendChild(
      erstelleKopf(["Aktiv", "Energie", "Maximum", "Rest", "Notiz"], "energie-schutz-zeile")
    );

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

      const maximum = selectMitWerten(
        SCHUTZ_WERTE,
        daten.maximum,
        `${typ}: absorbierbarer Energieschaden`
      );
      maximum.addEventListener("change", () => {
        daten.maximum = Number(maximum.value);
        daten.rest = daten.maximum;
        speichereUndAktualisiere();
      });

      const rest = document.createElement("output");
      rest.className = "energie-restwert";
      rest.textContent = String(daten.rest);
      rest.setAttribute(
        "aria-label",
        `${typ}: verbleibender absorbierbarer Energieschaden`
      );

      const notiz = notizfeld(daten.notiz, `${typ}: Notiz`, wert => {
        daten.notiz = wert;
        speichereCharaktere();
      });

      zeile.append(aktiv, name, maximum, rest, notiz);
      schutzListe.appendChild(zeile);
    });
  }


  function rendereSteinhaut(charakter) {
    steinhautListe.innerHTML = "";
    steinhautListe.appendChild(
      erstelleKopf(["Aktiv", "Effekt", "Maximum", "Rest", "Notiz"], "steinhaut-zeile")
    );

    const daten = charakter.steinhaut;
    const zeile = document.createElement("div");
    zeile.className = "energie-zeile steinhaut-zeile";

    const aktiv = document.createElement("input");
    aktiv.type = "checkbox";
    aktiv.checked = daten.aktiv;
    aktiv.setAttribute("aria-label", "Steinhaut aktiv");
    aktiv.addEventListener("change", () => {
      daten.aktiv = aktiv.checked;
      speichereCharaktere();
    });

    const name = document.createElement("strong");
    name.textContent = "Steinhaut";

    const maximum = selectMitWerten(
      STEINHAUT_WERTE,
      daten.maximum,
      "Steinhaut: Gesamtpunkte"
    );
    maximum.addEventListener("change", () => {
      daten.maximum = Number(maximum.value);
      daten.rest = daten.maximum;
      speichereUndAktualisiere();
    });

    const rest = document.createElement("output");
    rest.className = "energie-restwert";
    rest.textContent = String(daten.rest);
    rest.setAttribute("aria-label", "Steinhaut: verbleibende Punkte");

    const notiz = notizfeld(daten.notiz, "Steinhaut: Notiz", wert => {
      daten.notiz = wert;
      speichereCharaktere();
    });

    zeile.append(aktiv, name, maximum, rest, notiz);
    steinhautListe.appendChild(zeile);
  }

  function rendereEnergieSchadenEingaben() {
    energieSchadenEingaben.innerHTML = "";

    ENERGIEN.forEach(typ => {
      const zeile = document.createElement("div");
      zeile.className = "energie-schaden-zeile";

      const label = document.createElement("label");
      label.textContent = typ;
      label.htmlFor = `energieSchaden-${typ}`;

      const gruppe = document.createElement("div");
      gruppe.className = "energie-schaden-eingabe";

      const feld = zahlenfeld(`${typ}: Energieschaden`);
      feld.id = `energieSchaden-${typ}`;

      const anwenden = document.createElement("button");
      anwenden.type = "button";
      anwenden.textContent = "✓";
      anwenden.className = "energie-anwenden";
      anwenden.setAttribute("aria-label", `${typ}: Energieschaden anwenden`);

      const ausfuehren = () => {
        const charakter = aktiverCharakter();
        const eingabe = Number(feld.value);

        if (!charakter || !Number.isInteger(eingabe) || eingabe < 1) {
          zeigeMeldung(
            energieSchadenMeldung,
            "Bitte einen gültigen Energieschaden eingeben.",
            true
          );
          feld.focus();
          return;
        }

        const ergebnis = verarbeiteEnergieschaden(charakter, typ, eingabe);
        feld.value = "";

        const teile = [`${typ}: ${ergebnis.eingabe} Schaden`];
        if (ergebnis.widerstand > 0) {
          teile.push(`${ergebnis.widerstand} widerstanden`);
        }
        if (ergebnis.absorbiert > 0) {
          teile.push(`${ergebnis.absorbiert} durch Schutz absorbiert`);
        }
        teile.push(`${ergebnis.restschaden} Restschaden`);

        zeigeMeldung(
          energieSchadenMeldung,
          teile.join(" · ") +
            (ergebnis.restschaden
              ? ` (${ergebnis.verteilt.temp} Temp-TP, ${ergebnis.verteilt.tp} TP).`
              : ".")
        );

        speichereUndAktualisiere();
      };

      anwenden.addEventListener("click", ausfuehren);
      feld.addEventListener("keydown", event => {
        if (event.key === "Enter") ausfuehren();
      });

      gruppe.append(feld, anwenden);
      zeile.append(label, gruppe);
      energieSchadenEingaben.appendChild(zeile);
    });
  }

  function rendereEnergieAnsicht() {
    const charakter = aktiverCharakter();
    widerstehenListe.innerHTML = "";
    schutzListe.innerHTML = "";
    steinhautListe.innerHTML = "";
    if (!charakter) {
      widerstehenListe.textContent = "Kein aktiver Charakter.";
      schutzListe.textContent = "Kein aktiver Charakter.";
      steinhautListe.textContent = "Kein aktiver Charakter.";
      return;
    }
    stelleEnergieDatenSicher(charakter);
    rendereSteinhaut(charakter);
    rendereWiderstehen(charakter);
    rendereSchutz(charakter);
    if (!energieSchadenEingaben.children.length) {
      rendereEnergieSchadenEingaben();
    }
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
  rendereEnergieSchadenEingaben();
  rendereEnergieAnsicht();
})();
