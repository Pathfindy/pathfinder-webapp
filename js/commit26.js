// Commit 36.1: Spezial-Rettungswürfe mit gemeinsamer Stapelregel auf der Werte-Seite
(() => {
  "use strict";

  const WERTE = [
    {
      key: "rk",
      ziel: "Rüstungsklasse",
      label: "Rüstungsklasse (GE)",
      gruppe: "Rüstungsklasse",
      eingabe: true,
      festerGrundwert: 10,
      notizKey: "notizen.rk"
    },
    {
      key: "rw.reflex",
      ziel: "RW-Reflex",
      label: "Reflex (GE)",
      gruppe: "Rettungswürfe",
      eingabe: true
    },
    {
      key: "rw.wille",
      ziel: "RW-Wille",
      label: "Wille (WE)",
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
      label: "Zähigkeit (KO)",
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
      label: "KMB (ST)",
      gruppe: "Kampfmanöver",
      eingabe: true,
      notizKey: "notizen.kmb"
    },
    {
      key: "kmv",
      ziel: "KMV",
      label: "KMV (ST + GE)",
      gruppe: "Kampfmanöver",
      eingabe: true,
      festerGrundwert: 10,
      notizKey: "notizen.kmv"
    }
  ];

  const RK_VARIANTEN_47=[
    {id:"rk-normal",label:"Rüstungsklasse",modus:"normal"},
    {id:"rk-falscher-fuss",label:"Auf dem falschen Fuß",modus:"falscherFuss"},
    {id:"rk-beruehrung",label:"Berührung",modus:"beruehrung"},
    {id:"rk-koerperlos",label:"Berührung gegen Körperlose",modus:"koerperlos"}
  ];

  function maxGeRk47(charakter){
    const wert=charakter?.kampfwerte?.maxGeRk;
    return wert===null || wert==="" || typeof wert==="undefined"
      ?null
      :Math.max(0,ganzeZahl(wert));
  }

  function begrenzterGeMod47(charakter,aufFalschemFuss=false){
    const ge=attributMod26(charakter,"GE");
    // Negative GE-Modifikatoren bleiben immer bestehen.
    if(ge<=0) return ge;
    if(aufFalschemFuss) return 0;
    const maximum=maxGeRk47(charakter);
    return maximum===null?ge:Math.min(ge,maximum);
  }

  function rkBoniBewertet47(modus="normal"){
    const alle=aktiveBoniFuerZiel("Rüstungsklasse");
    const erlaubt=alle.filter(bonus=>{
      const art=bonus.bonusart;
      if(modus==="falscherFuss" && art==="Ausweichen") return false;
      if(modus==="beruehrung"){
        return !["Rüstung","Schild","Natürliche Rüstung"].includes(art);
      }
      if(modus==="koerperlos"){
        if(art==="Natürliche Rüstung") return false;
        if(["Rüstung","Schild"].includes(art)){
          return !!bonus.wirktGegenKoerperloseBeruehrung;
        }
      }
      return true;
    });
    return bewerteBonusListe47(erlaubt);
  }

  function bewerteBonusListe47(boni=[]){
    const stapelbar=typeof STAPELBARE_BONUSARTEN!=="undefined"
      ?STAPELBARE_BONUSARTEN:new Set();
    const gruppen=new Map();
    boni.forEach(b=>{
      if(!gruppen.has(b.bonusart)) gruppen.set(b.bonusart,[]);
      gruppen.get(b.bonusart).push(b);
    });
    return boni.map(bonus=>{
      if(stapelbar.has(bonus.bonusart)) return {...bonus,beruecksichtigt:true};
      const gruppe=gruppen.get(bonus.bonusart)||[];
      if(bonus.wert>0){
        const max=Math.max(0,...gruppe.filter(x=>x.wert>0).map(x=>x.wert));
        return {...bonus,beruecksichtigt:bonus.wert===max};
      }
      const min=Math.min(0,...gruppe.filter(x=>x.wert<0).map(x=>x.wert));
      return {...bonus,beruecksichtigt:bonus.wert===min};
    });
  }

  function summeBewerteteBoni47(boni=[]){
    return boni.filter(b=>b.beruecksichtigt).reduce((sum,b)=>sum+ganzeZahl(b.wert),0);
  }

  function rkWert47(charakter,modus="normal"){
    if(!charakter) return 0;
    const grund=10;
    const ge=begrenzterGeMod47(charakter,modus==="falscherFuss");
    const groesse=typeof groessenModifikatorAngriffRk==="function"
      ?ganzeZahl(groessenModifikatorAngriffRk(charakter)):0;
    const boni=rkBoniBewertet47(modus);
    return grund+ge+groesse+summeBewerteteBoni47(boni);
  }

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
        maxGeRk: (kampfwerteQuelle.maxGeRk === "" ||
                  kampfwerteQuelle.maxGeRk === null ||
                  typeof kampfwerteQuelle.maxGeRk === "undefined")
          ? null
          : Math.max(0, ganzeZahl(kampfwerteQuelle.maxGeRk)),
        kmb: ganzeZahl(kampfwerteQuelle.kmb ?? basis.kampfwerte?.kmb),
        flinkeManoever: !!(kampfwerteQuelle.flinkeManoever ?? basis.kampfwerte?.flinkeManoever),
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

    const effektListe = typeof effekte !== "undefined" ? effekte : [];
    const ergebnis = berechneBonusErgebnis(effektListe);

    // Dieselbe Spezial-RW-Berechnung wie im Dashboard verwenden:
    // Haupt-RW-Boni + Spezial-RW-Boni werden VOR der Stapelprüfung kombiniert.
    if (typeof berechneSpezialRettungswurfBoni === "function") {
      Object.assign(
        ergebnis,
        berechneSpezialRettungswurfBoni(effektListe)
      );
    }

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

  function attributMod26(charakter,key) {
    return charakter && typeof attributModifikator==="function"
      ? ganzeZahl(attributModifikator(charakter,key))
      : 0;
  }

  function attributModFuerWert26(eintrag,charakter) {
    switch(eintrag.ziel) {
      case "Rüstungsklasse": return begrenzterGeMod47(charakter,false);
      case "RW-Reflex": return attributMod26(charakter,"GE");
      case "RW-Zähigkeit": return attributMod26(charakter,"KO");
      case "RW-Wille": return attributMod26(charakter,"WE");
      case "KMB":
        return (charakter?.kampfwerte?.flinkeManoever ||
                (typeof kmbVerwendetGeschickWegenGroesse==="function" &&
                 kmbVerwendetGeschickWegenGroesse(charakter)))
          ? attributMod26(charakter,"GE")
          : attributMod26(charakter,"ST");
      case "KMV":
        return attributMod26(charakter,"ST") + attributMod26(charakter,"GE");
      default: return 0;
    }
  }

  function groessenModFuerWert45(eintrag,charakter){
    if(eintrag.ziel==="Rüstungsklasse"){
      return typeof groessenModifikatorAngriffRk==="function"
        ?ganzeZahl(groessenModifikatorAngriffRk(charakter))
        :0;
    }
    if(eintrag.ziel==="KMB" || eintrag.ziel==="KMV"){
      return typeof groessenModifikatorKmbKmv==="function"
        ?ganzeZahl(groessenModifikatorKmbKmv(charakter))
        :0;
    }
    return 0;
  }


  function grundwertFuer(eintrag, charakter) {
    if (Number.isFinite(Number(eintrag.festerGrundwert))) {
      return ganzeZahl(eintrag.festerGrundwert);
    }
    const pfad = eintrag.eingabe ? eintrag.key : eintrag.basisKey;
    return ganzeZahl(lesePfad(charakter?.kampfwerte, pfad));
  }

  function basisGesamtFuer(eintrag, charakter, ergebnis) {
    const grundwert = grundwertFuer(eintrag, charakter);
    const basisZiel = eintrag.eingabe ? eintrag.ziel : eintrag.basisZiel;
    return grundwert + bonusFuerZiel(basisZiel, ergebnis);
  }

  function gesamtwertFuer(eintrag, charakter, ergebnis) {
    const grundwert = grundwertFuer(eintrag, charakter);

    if (eintrag.eingabe) {
      return grundwert +
        attributModFuerWert26(eintrag,charakter) +
        groessenModFuerWert45(eintrag,charakter) +
        bonusFuerZiel(eintrag.ziel, ergebnis);
    }

    // Spezial-RW erben den Attributsmodifikator ihres Haupt-RW genau einmal.
    const basisEintrag=WERTE.find(wert=>wert.ziel===eintrag.basisZiel);
    const attribut=basisEintrag ? attributModFuerWert26(basisEintrag,charakter) : 0;
    return grundwert + attribut + bonusFuerZiel(eintrag.ziel, ergebnis);
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

  function bewerteteBoniFuerSpezial(eintrag) {
    if (!eintrag || eintrag.eingabe || typeof sammleAktiveBoni !== "function") {
      return [];
    }

    const boni = sammleAktiveBoni(
      typeof effekte !== "undefined" ? effekte : []
    )
      .filter(bonus =>
        bonus.ziel === eintrag.basisZiel ||
        bonus.ziel === eintrag.ziel
      )
      .map(bonus => ({
        ...bonus,
        ursprungsZiel: bonus.ziel,
        ziel: eintrag.ziel
      }));

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
        return { ...bonus, beruecksichtigt: bonus.wert === maximum };
      }

      const minimum = Math.min(
        0,
        ...gruppe.filter(eintrag => eintrag.wert < 0)
          .map(eintrag => eintrag.wert)
      );
      return { ...bonus, beruecksichtigt: bonus.wert === minimum };
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

        if(gruppenname==="Rüstungsklasse"){
          const maxGeZeile=document.createElement("label");
          maxGeZeile.className="rk-max-ge-47";
          const maxGeText=document.createElement("span");
          maxGeText.textContent="Max. GE-Bonus durch Rüstung";
          const maxGeInput=document.createElement("input");
          maxGeInput.type="number";
          maxGeInput.min="0";
          maxGeInput.max="99";
          maxGeInput.step="1";
          maxGeInput.inputMode="numeric";
          maxGeInput.placeholder="–";
          maxGeInput.title="Leer = keine Begrenzung. Negative GE-Modifikatoren werden nie begrenzt.";
          maxGeInput.dataset.maxGeRk47="1";
          maxGeInput.addEventListener("change",()=>{
            const charakter=aktiverCharakter();
            if(!charakter) return;
            const roh=maxGeInput.value.trim();
            charakter.kampfwerte.maxGeRk=roh===""?null:Math.max(0,ganzeZahl(roh));
            maxGeInput.value=charakter.kampfwerte.maxGeRk===null
              ?""
              :String(charakter.kampfwerte.maxGeRk);
            speichereCharaktere();
            aktualisiereAnsicht();
          });
          maxGeZeile.append(maxGeText,maxGeInput);

          const rkRaster=document.createElement("div");
          rkRaster.className="rk-varianten-47";
          RK_VARIANTEN_47.forEach(variante=>{
            const karte=document.createElement("button");
            karte.type="button";
            karte.className="rk-variante-47";
            if(variante.modus==="normal") karte.classList.add("rk-variante-haupt-472");
            karte.dataset.rkModus47=variante.modus;
            karte.innerHTML=`<span>${variante.label}</span><strong>10</strong>`;
            karte.addEventListener("click",()=>zeigeRkDetails47(variante.modus,variante.label));
            rkRaster.appendChild(karte);
          });
          gruppe.appendChild(rkRaster);
          gruppe.appendChild(maxGeZeile);
          bereich.appendChild(gruppe);
          return;
        }

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
            const labelTreffer=String(eintrag.label).match(/^(.*?)\s*(\([^)]*\))$/);
            if(labelTreffer){
              const haupt=document.createElement("span");
              haupt.className="grundwert-label-haupt-48";
              haupt.textContent=labelTreffer[1].trim();
              const attribut=document.createElement("span");
              attribut.className="grundwert-label-attribut-48";
              attribut.textContent=labelTreffer[2];
              label.append(haupt,attribut);
            }else{
              label.textContent=eintrag.label;
            }

            let mitte;

            if (eintrag.eingabe && Number.isFinite(Number(eintrag.festerGrundwert))) {
              const basis=document.createElement("span");
              basis.className="fester-grundwert-442";
              basis.textContent=String(eintrag.festerGrundwert);
              basis.title="Fester Pathfinder-Grundwert";
              mitte=basis;
            } else if (eintrag.eingabe) {
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
            if(["RW-Reflex","RW-Wille","RW-Zähigkeit","KMB","KMV"].includes(eintrag.ziel)){
              gesamt.classList.add("grundwert-gesamt-haupt-48");
            }
            gesamt.setAttribute(
              "aria-label",
              `${eintrag.label} Bonusdetails anzeigen`
            );
            gesamt.addEventListener("click", () =>
              zeigeDetails(eintrag)
            );

            zeile.append(label, mitte, gesamt);
            gruppe.appendChild(zeile);

            if (eintrag.ziel === "KMB") {
              const flinkLabel=document.createElement("label");
              flinkLabel.className="flinke-manoever-431";
              const flink=document.createElement("input");
              flink.type="checkbox";
              flink.dataset.flinkeManoever="1";
              const flinkText=document.createElement("span");
              flinkText.textContent="Flinke Manöver – GE statt ST für KMB";
              flinkLabel.append(flink,flinkText);
              flink.addEventListener("change",()=>{
                const charakter=aktiverCharakter();
                if(!charakter) return;
                charakter.kampfwerte.flinkeManoever=flink.checked;
                speichereCharaktere();
                aktualisiereAnsicht();
              });
              gruppe.appendChild(flinkLabel);
            }

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

  function zeigeRkDetails47(modus,label){
    const charakter=aktiverCharakter();
    if(!charakter) return;
    const grund=10;
    const ge=begrenzterGeMod47(charakter,modus==="falscherFuss");
    const groesse=typeof groessenModifikatorAngriffRk==="function"
      ?ganzeZahl(groessenModifikatorAngriffRk(charakter)):0;
    const alle=aktiveBoniFuerZiel("Rüstungsklasse");
    const bewertet=rkBoniBewertet47(modus);
    const bonusSumme=summeBewerteteBoni47(bewertet);
    const gesamt=grund+ge+groesse+bonusSumme;

    const dialog=detailDialog();
    dialog.querySelector("#bonusDetailTitel").textContent=label;
    const inhalt=dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML="";

    const summe=document.createElement("p");
    summe.className="bonus-detail-summe";
    summe.textContent=`Grundwert 10 + GE ${formatiereBonus(ge)} + Größe ${formatiereBonus(groesse)} + sonstige Boni ${formatiereBonus(bonusSumme)} = ${gesamt}`;
    inhalt.appendChild(summe);

    const max=maxGeRk47(charakter);
    const geInfo=document.createElement("p");
    geInfo.className="rk-detail-hinweis-47";
    geInfo.textContent=modus==="falscherFuss"
      ?"Auf dem falschen Fuß: positiver GE-Bonus und Ausweichen-Boni entfallen; ein GE-Malus bleibt bestehen."
      :`Max. GE-Bonus: ${max===null?"keine Begrenzung":`+${max}`}.`;
    inhalt.appendChild(geInfo);

    const liste=document.createElement("div");
    liste.className="bonus-detail-liste";

    // Separate Schleife ohne Identitätsannahmen: gleiche Stapellogik anhand Reihenfolge/Art/Wert.
    const bewertetKopie=[...bewertet];
    alle.forEach(bonus=>{
      let ignoriert=false, status="";
      if(modus==="falscherFuss" && bonus.bonusart==="Ausweichen"){
        ignoriert=true; status="entfällt auf dem falschen Fuß";
      }else if(modus==="beruehrung" && ["Rüstung","Schild","Natürliche Rüstung"].includes(bonus.bonusart)){
        ignoriert=true; status="bei Berührung ignoriert";
      }else if(modus==="koerperlos" && bonus.bonusart==="Natürliche Rüstung"){
        ignoriert=true; status="bei körperloser Berührung ignoriert";
      }else if(modus==="koerperlos" && ["Rüstung","Schild"].includes(bonus.bonusart) && !bonus.wirktGegenKoerperloseBeruehrung){
        ignoriert=true; status="nicht gegen körperlose Berührung wirksam";
      }

      let beruecksichtigt=false;
      if(!ignoriert){
        const idx=bewertetKopie.findIndex(x=>
          x.effektId===bonus.effektId &&
          x.bonusart===bonus.bonusart &&
          x.wert===bonus.wert
        );
        if(idx>=0){
          beruecksichtigt=!!bewertetKopie[idx].beruecksichtigt;
          bewertetKopie.splice(idx,1);
        }
        status=beruecksichtigt?"berücksichtigt":"nicht stapelbar – nicht berücksichtigt";
      }

      const zeile=document.createElement("div");
      zeile.className="bonus-detail-zeile";
      if(ignoriert || !beruecksichtigt) zeile.classList.add("nicht-beruecksichtigt");
      zeile.innerHTML=`<strong>${formatiereBonus(bonus.wert)}</strong><span>${bonus.bonusart}</span><span>${bonus.effektName||"Unbenannter Effekt"}</span><small>${status}</small>`;
      liste.appendChild(zeile);
    });
    if(!alle.length){
      const leer=document.createElement("p");
      leer.textContent="Keine aktiven RK-Boni.";
      inhalt.appendChild(leer);
    }else{
      inhalt.appendChild(liste);
    }
    dialog.showModal();
  }

  function zeigeDetails(eintrag) {
    const charakter = aktiverCharakter();
    if (!charakter) return;

    const ergebnis = bonusErgebnis();
    const grundwert = grundwertFuer(eintrag, charakter);
    const attributGesamt = eintrag.eingabe
      ? attributModFuerWert26(eintrag,charakter)
      : (() => {
          const basisEintrag=WERTE.find(wert=>wert.ziel===eintrag.basisZiel);
          return basisEintrag ? attributModFuerWert26(basisEintrag,charakter) : 0;
        })();
    const groesseGesamt = eintrag.eingabe
      ? groessenModFuerWert45(eintrag,charakter)
      : 0;
    const bonusGesamt = bonusFuerZiel(eintrag.ziel, ergebnis);
    const gesamt = grundwert + attributGesamt + groesseGesamt + bonusGesamt;

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
        `+ Attribut ${formatiereBonus(attributGesamt)} ` +
        `+ Größe ${formatiereBonus(groesseGesamt)} ` +
        `+ sonstige Boni ${formatiereBonus(bonusGesamt)} ` +
        `= ${formatiereGesamt(gesamt)}`;
    } else {
      summe.textContent =
        `Grundwert ${formatiereGesamt(grundwert)} ` +
        `+ Attribut ${formatiereBonus(attributGesamt)} ` +
        `+ gemeinsam gestapelte Boni aus ${eintrag.basisZiel} und ${eintrag.label} ` +
        `${formatiereBonus(bonusGesamt)} ` +
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
      const ueberschrift = document.createElement("h4");
      ueberschrift.className = "bonus-detail-untertitel-27";
      ueberschrift.textContent =
        `Gemeinsame Stapelprüfung: ${eintrag.basisZiel} + ${eintrag.label}`;
      inhalt.appendChild(ueberschrift);

      const boni = bewerteteBoniFuerSpezial(eintrag);
      if (!boni.length) {
        const leer = document.createElement("p");
        leer.textContent = "Keine aktiven Boni.";
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
            <strong>${formatiereBonus(bonus.wert)}</strong>
            <span>${bonus.bonusart}</span>
            <span>${bonus.effektName || "Unbenannter Effekt"}</span>
            <small>${bonus.ursprungsZiel}: ${
              bonus.beruecksichtigt
                ? "berücksichtigt"
                : "nicht stapelbar – nicht berücksichtigt"
            }</small>
          `;
          liste.appendChild(zeile);
        });

        inhalt.appendChild(liste);
      }
    }

    dialog.showModal();
  }

  function aktualisiereAnsicht() {
    if (!document.getElementById("grundwerte26")) {
      erstelleBereich();
    }

    const charakter = aktiverCharakter();
    const ergebnis = bonusErgebnis();

    const maxGeInput47=document.querySelector("[data-max-ge-rk47]");
    if(maxGeInput47){
      maxGeInput47.disabled=!charakter;
      maxGeInput47.value=!charakter || maxGeRk47(charakter)===null
        ?""
        :String(maxGeRk47(charakter));
    }
    document.querySelectorAll(".rk-variante-47").forEach(karte=>{
      const stark=karte.querySelector("strong");
      if(!charakter){
        karte.disabled=true;
        if(stark) stark.textContent="0";
      }else{
        karte.disabled=false;
        if(stark) stark.textContent=String(rkWert47(charakter,karte.dataset.rkModus47||"normal"));
      }
    });

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

    const flink=document.querySelector('[data-flinke-manoever="1"]');
    if(flink){
      flink.disabled=!charakter;
      flink.checked=!!charakter?.kampfwerte?.flinkeManoever;
    }

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

    const dashboardRk=document.getElementById("rk");
    if(dashboardRk && charakter){
      dashboardRk.textContent=String(rkWert47(charakter,"normal"));
    }
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
