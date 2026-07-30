// Commit 19: Charakterwerte und Trefferpunkte
(() => {
  const TP_MAX = 9999;

  function ganzeZahl(wert, minimum = 0, maximum = TP_MAX) {
    const zahl = Number(wert);
    if (!Number.isFinite(zahl)) return minimum;
    return Math.min(maximum, Math.max(minimum, Math.trunc(zahl)));
  }

  function normalisiereKampfwerte(kampfwerte = {}) {
    const rw = kampfwerte && typeof kampfwerte.rw === "object" ? kampfwerte.rw : {};
    return {
      angriffe: Array.isArray(kampfwerte?.angriffe) ? kampfwerte.angriffe : [],
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
  const temporaereTpFeld = document.getElementById("temporaereTp");
  const schadenFeld = document.getElementById("schadenEingabe");
  const heilungFeld = document.getElementById("heilungEingabe");
  const meldung = document.getElementById("tpMeldung");

  if (!seite || !btnSeite) return;

  seiten.charakterwerte = seite;

  function zeigeMeldung(text = "", fehler = false) {
    meldung.textContent = text;
    meldung.classList.toggle("fehler", fehler);
  }

  function tpFarbklasse(charakter) {
    if (charakter.aktuelleTp <= 0 || charakter.maxTp <= 0) return "tp-rot";
    const prozent = charakter.aktuelleTp / charakter.maxTp * 100;
    if (prozent > 50) return "tp-gruen";
    if (prozent >= 25) return "tp-gelb";
    return "tp-orange";
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
      return;
    }

    maxTpFeld.value = charakter.maxTp;
    temporaereTpFeld.value = charakter.temporaereTp;
    aktuelleTpAusgabe.value = charakter.aktuelleTp;
    aktuelleTpAusgabe.textContent = String(charakter.aktuelleTp);
    aktuelleTpAusgabe.className = tpFarbklasse(charakter);
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

  btnSeite.addEventListener("click", () => {
    zeigeSeite("charakterwerte");
    aktualisiereTrefferpunkteAnsicht();
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
      aktualisiereTrefferpunkteAnsicht();
    }
    return ergebnis;
  };

  const bisherigesLoeschen = loescheCharakter;
  loescheCharakter = function (id) {
    const ergebnis = bisherigesLoeschen(id);
    if (ergebnis) aktualisiereTrefferpunkteAnsicht();
    return ergebnis;
  };

  aktualisiereTrefferpunkteAnsicht();
})();
