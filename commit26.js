// Commit 27: Spezial-Rettungswürfe auf fertig berechneten Basis-RW aufbauen
(() => {
  "use strict";

  const WERTE = [
    {
      key: "rk",
      ziel: "Rüstungsklasse",
      label: "Rüstungsklasse",
      gruppe: "Rüstungsklasse",
      eingabe: true,
      notizKey: "notizen.rk"
    },
    {
      key: "rw.reflex",
      ziel: "RW-Reflex",
      label: "RW-Reflex",
      gruppe: "Rettungswürfe",
      eingabe: true
    },
    {
      key: "rw.wille",
      ziel: "RW-Wille",
      label: "RW-Wille",
      gruppe: "Rettungswürfe",
      eingabe: true
    },
    {
      ziel: "RW-Furcht",
      label: "RW-Furcht",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    {
      ziel: "RW-Bezauberung",
      label: "RW-Bezauberung",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    {
      ziel: "RW-Verzauberung",
      label: "RW-Verzauberung",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.wille",
      basisZiel: "RW-Wille"
    },
    {
      key: "rw.zaehigkeit",
      ziel: "RW-Zähigkeit",
      label: "RW-Zähigkeit",
      gruppe: "Rettungswürfe",
      eingabe: true
    },
    {
      ziel: "RW-Gift",
      label: "RW-Gift",
      gruppe: "Rettungswürfe",
      eingabe: false,
      basisKey: "rw.zaehigkeit",
      basisZiel: "RW-Zähigkeit"
    },
    {
      key: "kmb",
      ziel: "KMB",
      label: "KMB",
      gruppe: "Kampfmanöver",
      eingabe: true,
      notizKey: "notizen.kmb"
    },
    {
      key: "kmv",
      ziel: "KMV",
      label: "KMV",
      gruppe: "Kampfmanöver",
      eingabe: true,
      notizKey: "notizen.kmv"
    }
  ];

  function ganzeZahl(wert) {
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
        notizen: {
          ...(basis.kampfwerte?.notizen || {}),
          rk:
            typeof kampfwerteQuelle.notizen?.rk === "string"
              ? kampfwerteQuelle.notizen.rk
              : "",
          kmb:
            typeof kampfwerteQuelle.notizen?.kmb === "string"
              ? kampfwerteQuelle.notizen.kmb
              : "",
          kmv:
            typeof kampfwerteQuelle.notizen?.kmv === "string"
              ? kampfwerteQuelle.notizen.kmv
              : ""
        },
        rw: {
          ...(basis.kampfwerte?.rw || {}),
          reflex: ganzeZahl(rwQuelle.reflex ?? basis.kampfwerte?.rw?.reflex),
          wille: ganzeZahl(rwQuelle.wille ?? basis.kampfwerte?.rw?.wille),
          zaehigkeit: ganzeZahl(
            rwQuelle.zaehigkeit ?? basis.kampfwerte?.rw?.zaehigkeit
          )
        }
      }
    };
  };

  function bonusErgebnis() {
    if (typeof berechneBonusErgebnis !== "function") return {};

    const ergebnis = berechneBonusErgebnis(
      typeof effekte !== "undefined" ? effekte : []
    );

    const altSchaden = Number(ergebnis.Schaden || 0);
    ergebnis["Schaden Nah"] =
      Number(ergebnis["Schaden Nah"] || 0) + altSchaden;
    ergebnis["Schaden Fern"] =
      Number(ergebnis["Schaden Fern"] || 0) + altSchaden;

    return ergebnis;
  }

  function bonusFuerZiel(ziel, ergebnis = bonusErgebnis()) {
    return ganzeZahl(ergebnis[ziel] || 0);
  }

  function grundwertFuer(eintrag, charakter) {
    const pfad = eintrag.eingabe ? eintrag.key : eintrag.basisKey;
    return ganzeZahl(lesePfad(charakter?.kampfwerte, pfad));
  }

  function basisGesamtFuer(eintrag, charakter, ergebnis) {
    const grundwert = grundwertFuer(eintrag, charakter);
    const basisZiel = eintrag.eingabe ? eintrag.ziel : eintrag.basisZiel;
    return grundwert + bonusFuerZiel(basisZiel, ergebnis);
  }

  function gesamtwertFuer(eintrag, charakter, ergebnis) {
    const basisGesamt = basisGesamtFuer(eintrag, charakter, ergebnis);

    if (eintrag.eingabe) return basisGesamt;

    // Der Spezialbonus wird erst auf den bereits fertig berechneten Basis-RW
    // aufgeschlagen. Die Stapelung des Basiswerts und des Spezialwerts bleibt
    // dadurch bewusst voneinander getrennt.
    return basisGesamt + bonusFuerZiel(eintrag.ziel, ergebnis);
  }

  function aktiveBoniFuerZiel(ziel) {
    if (typeof sammleAktiveBoni !== "function") return [];

    return sammleAktiveBoni(
      typeof effekte !== "undefined" ? effekte : []
    ).filter(bonus => bonus.ziel === ziel);
  }

  function bewerteteBoni(ziel) {
    const boni = aktiveBoniFuerZiel(ziel);
    const stapelbar =
      typeof STAPELBARE_BONUSARTEN !== "undefined"
        ? STAPELBARE_BONUSARTEN
        : new Set();

    const gruppen = new Map();
    boni.forEach(bonus => {
      if (!gruppen.has(bonus.bonusart)) gruppen.set(bonus.bonusart, []);
      gruppen.get(bonus.bonusart).push(bonus);
    });

    return boni.map(bonus => {
      if (stapelbar.has(bonus.bonusart)) {
        return { ...bonus, beruecksichtigt: true };
      }

      const gruppe = gruppen.get(bonus.bonusart) || [];

      if (bonus.wert > 0) {
        const maximum = Math.max(
          0,
          ...gruppe.filter(eintrag => eintrag.wert > 0)
            .map(eintrag => eintrag.wert)
        );
        return {
          ...bonus,
          beruecksichtigt: bonus.wert === maximum
        };
      }

      const minimum = Math.min(
        0,
        ...gruppe.filter(eintrag => eintrag.wert < 0)
          .map(eintrag => eintrag.wert)
      );
      return {
        ...bonus,
        beruecksichtigt: bonus.wert === minimum
      };
    });
  }

  function erstelleBereich() {
    document.getElementById("grundwerte26")?.remove();

    const angriffe = document.querySelector(
      "#charakterwerte .angriffe-bereich"
    );
    if (!angriffe) return;

    const bereich = document.createElement("div");
    bereich.id = "grundwerte26";
    bereich.className = "grundwerte-26";

    ["Rüstungsklasse", "Rettungswürfe", "Kampfmanöver"].forEach(
      gruppenname => {
        const gruppe = document.createElement("section");
        gruppe.className = "grundwerte-gruppe-26";
        gruppe.innerHTML = `<h3>${gruppenname}</h3>`;

        const kopf = document.createElement("div");
        kopf.className = "grundwerte-kopf-26";
        kopf.innerHTML =
          "<span>Wert</span><span>Grundwert</span><span>Gesamt</span>";
        gruppe.appendChild(kopf);

        WERTE.filter(eintrag => eintrag.gruppe === gruppenname)
          .forEach(eintrag => {
            const zeile = document.createElement("div");
            zeile.className = "grundwert-zeile-26";
            zeile.dataset.bonusZiel = eintrag.ziel;

            if (!eintrag.eingabe) {
              zeile.classList.add("spezial-rw-27");
            }

            const label = document.createElement("label");
            label.textContent = eintrag.label;

            let mitte;

            if (eintrag.eingabe) {
              const input = document.createElement("input");
              input.id =
                `grundwert26-${eintrag.key.replace(".", "-")}`;
              input.type = "number";
              input.step = "1";
              input.min = "-999";
              input.max = "999";
              input.inputMode = "numeric";
              input.setAttribute(
                "aria-label",
                `${eintrag.label} Grundwert`
              );
              label.htmlFor = input.id;

              input.addEventListener("change", () => {
                const charakter = aktiverCharakter();
                if (!charakter) return;

                const wert = ganzeZahl(input.value);
                input.value = String(wert);
                schreibePfad(charakter.kampfwerte, eintrag.key, wert);
                speichereCharaktere();
                aktualisiereAnsicht();
              });

              mitte = input;
            } else {
              const basis = document.createElement("span");
              basis.className = "spezial-rw-basis-27";
              basis.textContent = `aus ${eintrag.basisZiel}`;
              mitte = basis;
            }

            const gesamt = document.createElement("button");
            gesamt.type = "button";
            gesamt.className = "grundwert-gesamt-26";
            gesamt.setAttribute(
              "aria-label",
              `${eintrag.label} Bonusdetails anzeigen`
            );
            gesamt.addEventListener("click", () =>
              zeigeDetails(eintrag)
            );

            zeile.append(label, mitte, gesamt);
            gruppe.appendChild(zeile);

            if (eintrag.notizKey) {
              const notizFeld = document.createElement("textarea");
              notizFeld.className = "grundwert-notiz-28";
              notizFeld.rows = 3;
              notizFeld.placeholder = "Freitext …";
              notizFeld.dataset.notizKey = eintrag.notizKey;
              notizFeld.setAttribute(
                "aria-label",
                `Freitext zu ${eintrag.label}`
              );

              notizFeld.addEventListener("input", () => {
                const charakter = aktiverCharakter();
                if (!charakter) return;

                schreibePfad(
                  charakter.kampfwerte,
                  eintrag.notizKey,
                  notizFeld.value
                );
                speichereCharaktere();
              });

              gruppe.appendChild(notizFeld);
            }
          });

        bereich.appendChild(gruppe);
      }
    );

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

  function fuegeBonusListeHinzu(inhalt, titel, ziel) {
    const ueberschrift = document.createElement("h4");
    ueberschrift.className = "bonus-detail-untertitel-27";
    ueberschrift.textContent = titel;
    inhalt.appendChild(ueberschrift);

    const boni = bewerteteBoni(ziel);

    if (!boni.length) {
      const leer = document.createElement("p");
      leer.textContent = "Keine aktiven Boni.";
      inhalt.appendChild(leer);
      return;
    }

    const liste = document.createElement("div");
    liste.className = "bonus-detail-liste";

    boni.forEach(bonus => {
      const zeile = document.createElement("div");
      zeile.className = "bonus-detail-zeile";

      if (!bonus.beruecksichtigt) {
        zeile.classList.add("nicht-beruecksichtigt");
      }

      zeile.innerHTML = `
        <strong>${formatiereBonus(bonus.wert)}</strong>
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

  function zeigeDetails(eintrag) {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    const ergebnis = bonusErgebnis();
    const grundwert = grundwertFuer(eintrag, charakter);
    const basisBonus = bonusFuerZiel(
      eintrag.eingabe ? eintrag.ziel : eintrag.basisZiel,
      ergebnis
    );
    const basisGesamt = grundwert + basisBonus;
    const spezialBonus = eintrag.eingabe
      ? 0
      : bonusFuerZiel(eintrag.ziel, ergebnis);
    const gesamt = eintrag.eingabe
      ? basisGesamt
      : basisGesamt + spezialBonus;

    const dialog = detailDialog();
    dialog.querySelector("#bonusDetailTitel").textContent =
      eintrag.label;

    const inhalt = dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML = "";

    const summe = document.createElement("p");
    summe.className = "bonus-detail-summe";

    if (eintrag.eingabe) {
      summe.textContent =
        `Grundwert ${formatiereGesamt(grundwert)} ` +
        `+ Boni ${formatiereBonus(basisBonus)} ` +
        `= ${formatiereGesamt(gesamt)}`;
    } else {
      summe.textContent =
        `Fertiger ${eintrag.basisZiel} ${formatiereGesamt(basisGesamt)} ` +
        `+ ${eintrag.label}-Boni ${formatiereBonus(spezialBonus)} ` +
        `= ${formatiereGesamt(gesamt)}`;
    }

    inhalt.appendChild(summe);

    if (eintrag.eingabe) {
      fuegeBonusListeHinzu(
        inhalt,
        `Boni auf ${eintrag.label}`,
        eintrag.ziel
      );
    } else {
      fuegeBonusListeHinzu(
        inhalt,
        `Boni im fertigen ${eintrag.basisZiel}`,
        eintrag.basisZiel
      );
      fuegeBonusListeHinzu(
        inhalt,
        `Zusätzliche Boni auf ${eintrag.label}`,
        eintrag.ziel
      );
    }

    dialog.showModal();
  }

  function aktualisiereAnsicht() {
    if (!document.getElementById("grundwerte26")) {
      erstelleBereich();
    }

    const charakter = aktiverCharakter();
    const ergebnis = bonusErgebnis();

    document.querySelectorAll(".grundwert-zeile-26")
      .forEach(zeile => {
        const eintrag = WERTE.find(
          wert => wert.ziel === zeile.dataset.bonusZiel
        );
        if (!eintrag) return;

        const input = zeile.querySelector("input");
        const gesamt = zeile.querySelector(
          ".grundwert-gesamt-26"
        );

        if (!charakter) {
          if (input) {
            input.disabled = true;
            input.value = "0";
          }
          gesamt.disabled = true;
          gesamt.textContent = "0";
          return;
        }

        if (input) {
          input.disabled = false;
          input.value = String(
            grundwertFuer(eintrag, charakter)
          );
        }

        gesamt.disabled = false;
        gesamt.textContent = formatiereGesamt(
          gesamtwertFuer(eintrag, charakter, ergebnis)
        );
      });

    document.querySelectorAll(".grundwert-notiz-28").forEach(notizFeld => {
      if (!charakter) {
        notizFeld.disabled = true;
        notizFeld.value = "";
        return;
      }

      notizFeld.disabled = false;
      notizFeld.value = String(
        lesePfad(charakter.kampfwerte, notizFeld.dataset.notizKey) || ""
      );
    });
  }

  function initialisiereCommit27() {
    erstelleBereich();
    aktualisiereAnsicht();

    const alteWahl =
      typeof waehleCharakter === "function"
        ? waehleCharakter
        : null;

    if (alteWahl) {
      waehleCharakter = function (id) {
        const ergebnis = alteWahl(id);
        if (ergebnis) aktualisiereAnsicht();
        return ergebnis;
      };
    }

    // Das ursprüngliche berechneWerte aktualisiert weiterhin ausschließlich
    // das Dashboard mit Effektboni. Danach aktualisieren wir separat die
    // Charakterwerte-Seite. Dashboard-Grundwerte werden niemals überschrieben.
    const alteBerechnung =
      typeof berechneWerte === "function"
        ? berechneWerte
        : null;

    if (alteBerechnung) {
      berechneWerte = function (...argumente) {
        const ergebnis = alteBerechnung(...argumente);
        aktualisiereAnsicht();
        return ergebnis;
      };
      window.berechneWerte = berechneWerte;
    }

    document.addEventListener(
      "pf-charakter-importiert",
      aktualisiereAnsicht
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialisiereCommit27,
      { once: true }
    );
  } else {
    initialisiereCommit27();
  }
})();
