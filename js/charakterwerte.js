// Commit 24: Angriffe mit Notizen und getrenntem Schaden
(() => {
  const TP_MAX = 9999;
  const ANGRIFF_MAX = 12;
  const WUERFELSEITEN = [0, 3, 4, 6, 8, 10, 12, 20];

  function ganzeZahl(wert, minimum = 0, maximum = TP_MAX) {
    const zahl = Number(wert);
    if (!Number.isFinite(zahl)) return minimum;
    return Math.min(maximum, Math.max(minimum, Math.trunc(zahl)));
  }

  function optionaleGanzeZahl(wert, minimum = -999, maximum = 999) {
    if (wert === "" || wert === null || typeof wert === "undefined") return null;
    const zahl = Number(wert);
    if (!Number.isFinite(zahl)) return null;
    return Math.min(maximum, Math.max(minimum, Math.trunc(zahl)));
  }

  function vorzeichen(wert) {
    const zahl = Number(wert);
    const sicher = Number.isFinite(zahl) ? Math.trunc(zahl) : 0;
    return sicher >= 0 ? `+${sicher}` : String(sicher);
  }

  function normalisiereAngriff(angriff = {}, index = 0) {
    const wuerfelSeiten = WUERFELSEITEN.includes(Number(angriff.wuerfelSeiten))
      ? Number(angriff.wuerfelSeiten)
      : 8;

    return {
      id: typeof angriff.id === "string" && angriff.id
        ? angriff.id
        : `angriff-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      name: typeof angriff.name === "string" && angriff.name.trim()
        ? angriff.name.trim()
        : `Angriff ${index + 1}`,
      art: angriff.art === "Fern" ? "Fern" : "Nah",
      modus:angriff.modus==="iterativ"?"iterativ":"einzeln",
      grundAngriff: ganzeZahl(angriff.grundAngriff, -999, 999),
      waffenfinesse: !!angriff.waffenfinesse,
      wuerfelAnzahl: ganzeZahl(angriff.wuerfelAnzahl, 0, 20),
      wuerfelSeiten,
      schadenModifikator: optionaleGanzeZahl(angriff.schadenModifikator, -999, 999),
      notiz: typeof angriff.notiz === "string" ? angriff.notiz : "",
      detailsOffen: !!angriff.detailsOffen
    };
  }

  function normalisiereKampfwerte(kampfwerte = {}) {
    const rw = kampfwerte && typeof kampfwerte.rw === "object" ? kampfwerte.rw : {};
    const angriffe = Array.isArray(kampfwerte?.angriffe)
      ? kampfwerte.angriffe.slice(0, ANGRIFF_MAX).map(normalisiereAngriff)
      : [];

    return {
      angriffe,
      kmb: Number.isFinite(Number(kampfwerte?.kmb)) ? Number(kampfwerte.kmb) : 0,
      kmv: Number.isFinite(Number(kampfwerte?.kmv)) ? Number(kampfwerte.kmv) : 0,
      rk: Number.isFinite(Number(kampfwerte?.rk)) ? Number(kampfwerte.rk) : 0,
      rw: {
        zaehigkeit: Number.isFinite(Number(rw.zaehigkeit)) ? Number(rw.zaehigkeit) : 0,
        reflex: Number.isFinite(Number(rw.reflex)) ? Number(rw.reflex) : 0,
        wille: Number.isFinite(Number(rw.wille)) ? Number(rw.wille) : 0
      }
    };
  }

  const bisherigeNormalisierung = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = bisherigeNormalisierung(charakter);
    const maxTp = ganzeZahl(charakter.maxTp);
    const aktuelleTpRoh = Number(charakter.aktuelleTp);
    const aktuelleTp = Number.isFinite(aktuelleTpRoh) ? Math.trunc(aktuelleTpRoh) : 0;

    return {
      ...basis,
      maxTp,
      aktuelleTp: Math.min(aktuelleTp, maxTp),
      temporaereTp: ganzeZahl(charakter.temporaereTp),
      kampfwerte: normalisiereKampfwerte(charakter.kampfwerte)
    };
  };

  const seite = document.getElementById("charakterwerte");
  const btnSeite = document.getElementById("btnCharakterwerte");
  const maxTpFeld = document.getElementById("maxTp");
  const aktuelleTpAusgabe = document.getElementById("aktuelleTp");
  const erlittenerSchadenAusgabe = document.getElementById("erlittenerSchaden");
  const temporaereTpFeld = document.getElementById("temporaereTp");
  const schadenFeld = document.getElementById("schadenEingabe");
  const heilungFeld = document.getElementById("heilungEingabe");
  const meldung = document.getElementById("tpMeldung");
  const angriffeListe = document.getElementById("angriffeListe");
  const angriffeMeldung = document.getElementById("angriffeMeldung");
  const btnAngriffHinzufuegen = document.getElementById("btnAngriffHinzufuegen");

  if (!seite || !btnSeite) return;
  seiten.charakterwerte = seite;

  function zeigeMeldung(text = "", fehler = false) {
    meldung.textContent = text;
    meldung.classList.toggle("fehler", fehler);
  }

  function zeigeAngriffeMeldung(text = "", fehler = false) {
    if (!angriffeMeldung) return;
    angriffeMeldung.textContent = text;
    angriffeMeldung.classList.toggle("fehler", fehler);
  }

  function tpFarbklasse(charakter) {
    if (charakter.aktuelleTp <= 0 || charakter.maxTp <= 0) return "tp-rot";
    const prozent = charakter.aktuelleTp / charakter.maxTp * 100;
    if (prozent > 50) return "tp-gruen";
    if (prozent >= 25) return "tp-gelb";
    return "tp-orange";
  }

  function aktuelleBonuswerte() {
    return typeof berechneBonusErgebnis === "function"
      ? berechneBonusErgebnis(typeof effekte !== "undefined" ? effekte : [])
      : {};
  }

  function istAttributEffekt(effekt, name) {
    return !!effekt && effekt.aktiv && String(effekt.name || "").trim() === name;
  }

  function attributAngriffsBonus(effektName, ziel, angriffsIndex) {
    if (typeof effekte === "undefined" || typeof berechneBonusErgebnisFuerAngriff !== "function") return 0;
    const ausgewaehlt = effekte.filter(effekt => istAttributEffekt(effekt, effektName));
    if (!ausgewaehlt.length) return 0;
    const ergebnis = berechneBonusErgebnisFuerAngriff(ausgewaehlt, angriffsIndex);
    return Number(ergebnis[ziel] ?? 0);
  }

  function angriffsBonus(angriff, boni = aktuelleBonuswerte(), angriffsIndex = 0) {
    const ziel = angriff.art === "Fern" ? "Angriff Fern" : "Angriff Nah";
    let gesamt = Number(boni[ziel] ?? 0);

    if (angriff.waffenfinesse) {
      const staerkeNah = attributAngriffsBonus("ST: Stärke (Attribut)", "Angriff Nah", angriffsIndex);
      const geschickFern = attributAngriffsBonus("GE: Geschicklichkeit (Attribut)", "Angriff Fern", angriffsIndex);
      gesamt = gesamt - staerkeNah + geschickFern;
    }
    return gesamt;
  }

  function schadenBonus(angriff, boni = aktuelleBonuswerte()) {
    const ziel = angriff.art === "Fern" ? "Schaden Fern" : "Schaden Nah";
    return Number(boni[ziel] ?? 0) + Number(boni.Schaden ?? 0);
  }

  function formatiereSchaden(angriff, boni = aktuelleBonuswerte()) {
    const grundwert = angriff.schadenModifikator === null ? 0 : angriff.schadenModifikator;
    const modifikator = grundwert + schadenBonus(angriff, boni);
    const wuerfel = angriff.wuerfelAnzahl > 0 && angriff.wuerfelSeiten > 0
      ? `${angriff.wuerfelAnzahl}W${angriff.wuerfelSeiten}`
      : "";

    if (!wuerfel) return String(modifikator);
    if (modifikator === 0) return wuerfel;
    return `${wuerfel}${vorzeichen(modifikator)}`;
  }

  function aktualisiereTrefferpunkteAnsicht() {
    const charakter = aktiverCharakter();
    const deaktiviert = !charakter;

    maxTpFeld.disabled = deaktiviert;
    temporaereTpFeld.disabled = deaktiviert;
    schadenFeld.disabled = deaktiviert;
    heilungFeld.disabled = deaktiviert;
    document.getElementById("btnSchadenAnwenden").disabled = deaktiviert;
    document.getElementById("btnHeilungAnwenden").disabled = deaktiviert;

    if (!charakter) {
      maxTpFeld.value = 0;
      temporaereTpFeld.value = 0;
      aktuelleTpAusgabe.value = 0;
      aktuelleTpAusgabe.textContent = "0";
      if (erlittenerSchadenAusgabe) {
        erlittenerSchadenAusgabe.value = 0;
        erlittenerSchadenAusgabe.textContent = "0";
      }
      return;
    }

    maxTpFeld.value = charakter.maxTp;
    temporaereTpFeld.value = charakter.temporaereTp;
    aktuelleTpAusgabe.value = charakter.aktuelleTp;
    aktuelleTpAusgabe.textContent = String(charakter.aktuelleTp);
    aktuelleTpAusgabe.className = tpFarbklasse(charakter);
    if (erlittenerSchadenAusgabe) {
      const schaden = Math.max(0, charakter.maxTp - charakter.aktuelleTp);
      erlittenerSchadenAusgabe.value = schaden;
      erlittenerSchadenAusgabe.textContent = String(schaden);
    }
  }

  function speichereTpAenderung() {
    speichereCharaktere();
    aktualisiereTrefferpunkteAnsicht();
  }

  function liesAktionswert(feld) {
    const wert = Number(feld.value);
    if (!Number.isInteger(wert) || wert < 1 || wert > TP_MAX) {
      zeigeMeldung("Bitte eine ganze Zahl zwischen 1 und 9999 eingeben.", true);
      feld.focus();
      return null;
    }
    return wert;
  }

  function anwendenSchaden() {
    const charakter = aktiverCharakter();
    const schaden = liesAktionswert(schadenFeld);
    if (!charakter || schaden === null) return;

    // Commit 37: Normaler Schaden läuft über die zentrale Lebenslogik.
    // Dort wird ggf. Steinhaut berücksichtigt. Energieschaden hat eigene Felder.
    if (typeof window.verarbeiteLebensSchaden === "function") {
      const ergebnis = window.verarbeiteLebensSchaden(charakter, schaden);
      schadenFeld.value = "";
      zeigeMeldung(ergebnis?.meldung || `${schaden} Schaden angewendet.`);
      speichereTpAenderung();
      if (typeof window.rendereEnergieAnsicht === "function") {
        window.rendereEnergieAnsicht();
      }
      return;
    }

    const vonTemp = Math.min(charakter.temporaereTp, schaden);
    charakter.temporaereTp -= vonTemp;
    charakter.aktuelleTp -= schaden - vonTemp;
    schadenFeld.value = "";
    zeigeMeldung(`${schaden} Schaden angewendet.`);
    speichereTpAenderung();
  }

  function anwendenHeilung() {
    const charakter = aktiverCharakter();
    const heilung = liesAktionswert(heilungFeld);
    if (!charakter || heilung === null) return;

    charakter.aktuelleTp = Math.min(charakter.maxTp, charakter.aktuelleTp + heilung);
    heilungFeld.value = "";
    zeigeMeldung(`${heilung} Heilung angewendet.`);
    speichereTpAenderung();
  }

  function speichereAngriffsfeld(angriff, feld, eigenschaft, minimum, maximum) {
    const wert = ganzeZahl(feld.value, minimum, maximum);
    angriff[eigenschaft] = wert;
    feld.value = wert;
    speichereCharaktere();
    aktualisiereAngriffeAnsicht();
  }

  function erstelleZahlenfeld(wert, beschriftung, minimum, maximum) {
    const feld = document.createElement("input");
    feld.type = "number";
    feld.value = wert;
    feld.min = String(minimum);
    feld.max = String(maximum);
    feld.step = "1";
    feld.inputMode = "numeric";
    feld.setAttribute("aria-label", beschriftung);
    return feld;
  }

  function anzahlIterativeAngriffe(charakter){
    const gab=typeof charakterGAB==="function"
      ?charakterGAB(charakter)
      :Number(charakter?.gab||0);
    if(gab>=16) return 4;
    if(gab>=11) return 3;
    if(gab>=6) return 2;
    return 1;
  }

  function angriffsfolge(angriff,charakter,gesamtAngriff){
    if(angriff.modus!=="iterativ") return [gesamtAngriff];
    const anzahl=anzahlIterativeAngriffe(charakter);
    return Array.from({length:anzahl},(_,index)=>gesamtAngriff-(index*5));
  }

  function formatiereAngriffsfolge(werte){
    return werte.map(vorzeichen).join(" / ");
  }

  function aktualisiereAngriffeAnsicht() {
    if (!angriffeListe || !btnAngriffHinzufuegen) return;

    const charakter = aktiverCharakter();
    angriffeListe.innerHTML = "";
    btnAngriffHinzufuegen.disabled = !charakter || charakter.kampfwerte.angriffe.length >= ANGRIFF_MAX;

    if (!charakter) {
      angriffeListe.innerHTML = '<p class="angriffe-leer">Kein aktiver Charakter.</p>';
      return;
    }

    const angriffe = charakter.kampfwerte.angriffe;
    if (angriffe.length === 0) {
      angriffeListe.innerHTML = '<p class="angriffe-leer">Noch keine Angriffe angelegt.</p>';
      return;
    }

    const globaleBoni = aktuelleBonuswerte();

    angriffe.forEach((angriff, index) => {
      const boni = typeof berechneBonusErgebnisFuerAngriff === "function"
        ? berechneBonusErgebnisFuerAngriff(
            typeof effekte !== "undefined" ? effekte : [],
            index
          )
        : globaleBoni;
      const karte = document.createElement("article");
      karte.className = "angriff-karte";

      const kopf = document.createElement("div");
      kopf.className = "angriff-kopf";

      const name = document.createElement("input");
      name.type = "text";
      name.className = "angriff-name";
      name.value = angriff.name;
      name.maxLength = 60;
      name.setAttribute("aria-label", `Name von Angriff ${index + 1}`);
      name.addEventListener("change", () => {
        angriff.name = name.value.trim() || `Angriff ${index + 1}`;
        name.value = angriff.name;
        speichereCharaktere();
      });

      const umschalten = document.createElement("button");
      umschalten.type = "button";
      umschalten.className = "angriff-toggle";
      umschalten.textContent = "▾";
      umschalten.setAttribute("aria-label", `${angriff.name} Details anzeigen`);
      umschalten.setAttribute("aria-expanded", "false");

      kopf.append(name, umschalten);

      const ergebnis = document.createElement("div");
      ergebnis.className = "angriff-ergebnis";
      const gesamtAngriff = angriff.grundAngriff + angriffsBonus(angriff, boni, index);
      const folge=angriffsfolge(angriff,charakter,gesamtAngriff);
      const angriffsText=formatiereAngriffsfolge(folge);
      ergebnis.innerHTML = `
        <div><span>Angriff</span><strong>${angriffsText}</strong></div>
        <div><span>Schaden</span><strong>${formatiereSchaden(angriff, boni)}</strong></div>
      `;

      const notiz = document.createElement("textarea");
      notiz.className = "angriff-notiz";
      notiz.value = angriff.notiz;
      notiz.rows = 2;
      notiz.placeholder = "Notiz zum Angriff";
      notiz.setAttribute("aria-label", `Notiz zu ${angriff.name}`);
      notiz.addEventListener("input", () => {
        angriff.notiz = notiz.value;
        speichereCharaktere();
      });

      const details = document.createElement("div");
      details.className = "angriff-details";
      details.hidden = !angriff.detailsOffen;
      umschalten.textContent = angriff.detailsOffen ? "▴" : "▾";
      umschalten.setAttribute("aria-expanded", String(angriff.detailsOffen));

      const felder = document.createElement("div");
      felder.className = "angriff-felder";

      const modusLabel=document.createElement("label");
      modusLabel.innerHTML="<span>Angriffsmodus</span>";
      const modus=document.createElement("select");
      [
        ["einzeln","Einzelangriff"],
        ["iterativ","Einzel- + Zusatzangriffe"]
      ].forEach(([wert,text])=>{
        const option=document.createElement("option");
        option.value=wert;
        option.textContent=text;
        option.selected=angriff.modus===wert;
        modus.appendChild(option);
      });
      modus.addEventListener("change",()=>{
        angriff.modus=modus.value;
        speichereCharaktere();
        aktualisiereAngriffeAnsicht();
      });
      modusLabel.appendChild(modus);

      const artLabel = document.createElement("label");
      artLabel.innerHTML = "<span>Art</span>";
      const art = document.createElement("select");
      ["Nah", "Fern"].forEach(optionWert => {
        const option = document.createElement("option");
        option.value = optionWert;
        option.textContent = optionWert;
        option.selected = angriff.art === optionWert;
        art.appendChild(option);
      });
      art.addEventListener("change", () => {
        angriff.art = art.value === "Fern" ? "Fern" : "Nah";
        speichereCharaktere();
        aktualisiereAngriffeAnsicht();
      });
      artLabel.appendChild(art);

      const grundLabel = document.createElement("label");
      grundLabel.innerHTML = "<span>Grund-Angriff</span>";
      const grund = erstelleZahlenfeld(angriff.grundAngriff, "Grund-Angriff", -999, 999);
      grund.addEventListener("change", () => speichereAngriffsfeld(angriff, grund, "grundAngriff", -999, 999));
      grundLabel.appendChild(grund);

      const wuerfelLabel = document.createElement("label");
      wuerfelLabel.innerHTML = "<span>Schadenswürfel</span>";
      const wuerfelZeile = document.createElement("div");
      wuerfelZeile.className = "wuerfel-zeile";
      const anzahl = erstelleZahlenfeld(angriff.wuerfelAnzahl, "Anzahl Schadenswürfel", 0, 20);
      const seiten = document.createElement("select");
      WUERFELSEITEN.forEach(wert => {
        const option = document.createElement("option");
        option.value = String(wert);
        option.textContent = wert === 0 ? "–" : `W${wert}`;
        option.selected = angriff.wuerfelSeiten === wert;
        seiten.appendChild(option);
      });
      anzahl.addEventListener("change", () => speichereAngriffsfeld(angriff, anzahl, "wuerfelAnzahl", 0, 20));
      seiten.addEventListener("change", () => {
        angriff.wuerfelSeiten = Number(seiten.value);
        speichereCharaktere();
        aktualisiereAngriffeAnsicht();
      });
      wuerfelZeile.append(anzahl, seiten);
      wuerfelLabel.appendChild(wuerfelZeile);

      const schadenLabel = document.createElement("label");
      schadenLabel.innerHTML = "<span>Grund-Schaden</span>";
      const schaden = erstelleZahlenfeld(
        angriff.schadenModifikator === null ? "" : angriff.schadenModifikator,
        "Grund-Schadensmodifikator",
        -999,
        999
      );
      schaden.placeholder = "";
      schaden.addEventListener("change", () => {
        angriff.schadenModifikator = optionaleGanzeZahl(schaden.value, -999, 999);
        schaden.value = angriff.schadenModifikator === null ? "" : angriff.schadenModifikator;
        speichereCharaktere();
        aktualisiereAngriffeAnsicht();
      });
      schadenLabel.appendChild(schaden);

      felder.append(modusLabel, artLabel, grundLabel, wuerfelLabel, schadenLabel);

      const finesseLabel=document.createElement("label");
      finesseLabel.className="angriff-waffenfinesse-43";
      const finesse=document.createElement("input");
      finesse.type="checkbox";
      finesse.checked=!!angriff.waffenfinesse;
      const finesseText=document.createElement("span");
      finesseText.textContent="Waffenfinesse – GE statt ST für Angriff";
      finesseLabel.append(finesse,finesseText);
      finesse.addEventListener("change",()=>{
        angriff.waffenfinesse=finesse.checked;
        speichereCharaktere();
        aktualisiereAngriffeAnsicht();
      });
      felder.appendChild(finesseLabel);

      if(angriff.modus==="iterativ"){
        const folgeInfo=document.createElement("div");
        folgeInfo.className="angriff-iterativ-info-41";
        const gab=typeof charakterGAB==="function"?charakterGAB(charakter):Number(charakter.gab||0);
        const anzahlIter=anzahlIterativeAngriffe(charakter);
        folgeInfo.textContent=anzahlIter===1
          ?`GAB ${vorzeichen(gab)} → 1 Angriff`
          :`GAB ${vorzeichen(gab)} → ${anzahlIter} Angriffe mit −5-Schritten`;
        felder.appendChild(folgeInfo);
      }



      const loeschen = document.createElement("button");
      loeschen.type = "button";
      loeschen.className = "angriff-loeschen";
      loeschen.textContent = "🗑 Löschen";
      loeschen.setAttribute("aria-label", `${angriff.name} löschen`);
      loeschen.addEventListener("click", () => {
        charakter.kampfwerte.angriffe.splice(index, 1);
        speichereCharaktere();
        zeigeAngriffeMeldung("Angriff gelöscht.");
        aktualisiereAngriffeAnsicht();
      });

      details.append(felder, loeschen);

      umschalten.addEventListener("click", () => {
        const oeffnen = details.hidden;
        angriff.detailsOffen = oeffnen;
        details.hidden = !oeffnen;
        umschalten.textContent = oeffnen ? "▴" : "▾";
        umschalten.setAttribute("aria-expanded", String(oeffnen));
        speichereCharaktere();
      });

      karte.append(kopf, ergebnis, notiz, details);
      angriffeListe.appendChild(karte);
    });
  }

  function fuegeAngriffHinzu() {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    if (charakter.kampfwerte.angriffe.length >= ANGRIFF_MAX) {
      zeigeAngriffeMeldung(`Es können höchstens ${ANGRIFF_MAX} Angriffe angelegt werden.`, true);
      return;
    }

    charakter.kampfwerte.angriffe.push(normalisiereAngriff({}, charakter.kampfwerte.angriffe.length));
    speichereCharaktere();
    zeigeAngriffeMeldung();
    aktualisiereAngriffeAnsicht();
  }

  btnSeite.addEventListener("click", () => {
    zeigeSeite("charakterwerte");
    aktualisiereAngriffeAnsicht();
  });

  maxTpFeld.addEventListener("change", () => {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    const bisherigesMaximum = charakter.maxTp;
    const neuesMaximum = ganzeZahl(maxTpFeld.value);
    charakter.maxTp = neuesMaximum;

    if (bisherigesMaximum === 0 && charakter.aktuelleTp === 0 && neuesMaximum > 0) {
      charakter.aktuelleTp = neuesMaximum;
    } else if (charakter.aktuelleTp > neuesMaximum) {
      charakter.aktuelleTp = neuesMaximum;
    }

    maxTpFeld.value = neuesMaximum;
    zeigeMeldung();
    speichereTpAenderung();
  });

  temporaereTpFeld.addEventListener("change", () => {
    const charakter = aktiverCharakter();
    if (!charakter) return;
    charakter.temporaereTp = ganzeZahl(temporaereTpFeld.value);
    temporaereTpFeld.value = charakter.temporaereTp;
    zeigeMeldung();
    speichereTpAenderung();
  });

  document.getElementById("btnSchadenAnwenden").addEventListener("click", anwendenSchaden);
  document.getElementById("btnHeilungAnwenden").addEventListener("click", anwendenHeilung);
  btnAngriffHinzufuegen?.addEventListener("click", fuegeAngriffHinzu);

  schadenFeld.addEventListener("keydown", event => {
    if (event.key === "Enter") anwendenSchaden();
  });
  heilungFeld.addEventListener("keydown", event => {
    if (event.key === "Enter") anwendenHeilung();
  });

  const bisherigeCharakterwahl = waehleCharakter;
  waehleCharakter = function (id) {
    const ergebnis = bisherigeCharakterwahl(id);
    if (ergebnis) {
      zeigeMeldung();
      zeigeAngriffeMeldung();
      aktualisiereTrefferpunkteAnsicht();
      aktualisiereAngriffeAnsicht();
    }
    return ergebnis;
  };

  const bisherigesLoeschen = loescheCharakter;
  loescheCharakter = function (id) {
    const ergebnis = bisherigesLoeschen(id);
    if (ergebnis) {
      aktualisiereTrefferpunkteAnsicht();
      aktualisiereAngriffeAnsicht();
    }
    return ergebnis;
  };

  if (typeof berechneWerte === "function") {
    const bisherigeBerechnung = berechneWerte;
    berechneWerte = function (...argumente) {
      const ergebnis = bisherigeBerechnung(...argumente);
      aktualisiereAngriffeAnsicht();
      return ergebnis;
    };
    window.berechneWerte = berechneWerte;
  }

  window.aktualisiereAngriffeAnsicht = aktualisiereAngriffeAnsicht;
  window.aktualisiereTrefferpunkteAnsicht = aktualisiereTrefferpunkteAnsicht;
  aktualisiereTrefferpunkteAnsicht();
  aktualisiereAngriffeAnsicht();
})();
