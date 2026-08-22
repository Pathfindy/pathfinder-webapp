// Commit 29: Charakterporträts, Charakternotizen und vollständiger Effektexport
(() => {
  "use strict";

  const PORTRAET_GROESSE = 320;
  const MAX_BILDDATEI = 10 * 1024 * 1024;

  function textOderLeer(wert) {
    return typeof wert === "string" ? wert : "";
  }

  const bisherigeNormalisierung29 = normalisiereCharakter;
  normalisiereCharakter = function (charakter = {}) {
    const basis = bisherigeNormalisierung29(charakter);
    return {
      ...basis,
      portraet: textOderLeer(charakter.portraet || basis.portraet),
      notizen: textOderLeer(charakter.notizen || basis.notizen)
    };
  };

  function ladeBilddatei(datei) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(datei);
      const bild = new Image();
      bild.onload = () => {
        URL.revokeObjectURL(url);
        resolve(bild);
      };
      bild.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Das ausgewählte Bild konnte nicht gelesen werden."));
      };
      bild.src = url;
    });
  }

  async function skalierePortraet(datei) {
    if (!datei || !String(datei.type || "").startsWith("image/")) {
      throw new Error("Bitte eine gültige Bilddatei auswählen.");
    }
    if (datei.size > MAX_BILDDATEI) {
      throw new Error("Das Bild ist größer als 10 MB.");
    }

    const bild = await ladeBilddatei(datei);
    const quellBreite = bild.naturalWidth || bild.width;
    const quellHoehe = bild.naturalHeight || bild.height;
    if (!quellBreite || !quellHoehe) {
      throw new Error("Das Bild besitzt keine gültigen Abmessungen.");
    }

    const quadrat = Math.min(quellBreite, quellHoehe);
    const quelleX = Math.max(0, (quellBreite - quadrat) / 2);
    const quelleY = Math.max(0, (quellHoehe - quadrat) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = PORTRAET_GROESSE;
    canvas.height = PORTRAET_GROESSE;
    const kontext = canvas.getContext("2d", { alpha: false });
    if (!kontext) throw new Error("Das Bild konnte nicht verarbeitet werden.");

    kontext.fillStyle = "#ffffff";
    kontext.fillRect(0, 0, canvas.width, canvas.height);
    kontext.drawImage(
      bild,
      quelleX,
      quelleY,
      quadrat,
      quadrat,
      0,
      0,
      PORTRAET_GROESSE,
      PORTRAET_GROESSE
    );

    return canvas.toDataURL("image/jpeg", 0.82);
  }

  function speichereCharakterAenderung(charakter, feld, wert) {
    const vorher = charakter[feld];
    charakter[feld] = wert;
    try {
      speichereCharaktere();
      return true;
    } catch (fehler) {
      charakter[feld] = vorher;
      console.error("Charakterdaten konnten nicht gespeichert werden:", fehler);
      alert(
        "Die Änderung konnte nicht gespeichert werden. " +
        "Möglicherweise ist der lokale Speicher des Browsers voll."
      );
      return false;
    }
  }

  function erstellePortraetBereich(charakter) {
    const bereich = document.createElement("div");
    bereich.className = "charakter-portraet-bereich-29";

    const dateiFeld = document.createElement("input");
    dateiFeld.type = "file";
    dateiFeld.accept = "image/*";
    dateiFeld.hidden = true;
    dateiFeld.setAttribute("aria-label", `Porträt für ${charakter.name} auswählen`);

    const bildButton = document.createElement("button");
    bildButton.type = "button";
    bildButton.className = "charakter-portraet-button-29";
    bildButton.title = charakter.portraet ? "Porträt ersetzen" : "Porträt hinzufügen";
    bildButton.setAttribute("aria-label", bildButton.title);

    if (charakter.portraet) {
      const bild = document.createElement("img");
      bild.className = "charakter-portraet-29";
      bild.src = charakter.portraet;
      bild.alt = `Porträt von ${charakter.name}`;
      bildButton.appendChild(bild);
    } else {
      const platzhalter = document.createElement("span");
      platzhalter.className = "charakter-portraet-platzhalter-29";
      platzhalter.textContent = "📷";
      platzhalter.setAttribute("aria-hidden", "true");
      bildButton.appendChild(platzhalter);
    }

    bildButton.addEventListener("click", () => dateiFeld.click());
    dateiFeld.addEventListener("change", async () => {
      const datei = dateiFeld.files?.[0];
      dateiFeld.value = "";
      if (!datei) return;

      bildButton.disabled = true;
      try {
        const portraet = await skalierePortraet(datei);
        if (speichereCharakterAenderung(charakter, "portraet", portraet)) {
          if (typeof window.rendereKampagnenBaum === "function") window.rendereKampagnenBaum();
        }
      } catch (fehler) {
        console.error("Porträt konnte nicht verarbeitet werden:", fehler);
        alert(fehler.message || "Das Porträt konnte nicht verarbeitet werden.");
      } finally {
        bildButton.disabled = false;
      }
    });

    bereich.append(bildButton, dateiFeld);

    if (charakter.portraet) {
      const entfernen = document.createElement("button");
      entfernen.type = "button";
      entfernen.className = "charakter-portraet-entfernen-29";
      entfernen.textContent = "×";
      entfernen.title = "Porträt entfernen";
      entfernen.setAttribute("aria-label", `Porträt von ${charakter.name} entfernen`);
      entfernen.addEventListener("click", () => {
        if (!confirm(`Porträt von "${charakter.name}" entfernen?`)) return;
        if (speichereCharakterAenderung(charakter, "portraet", "")) {
          if (typeof window.rendereKampagnenBaum === "function") window.rendereKampagnenBaum();
        }
      });
      bereich.appendChild(entfernen);
    }

    return bereich;
  }

  rendereCharaktere = function () {
    if (typeof window.rendereKampagnenBaum === "function") {
      window.rendereKampagnenBaum();
    }
  };

  const KAMPAGNEN_OFFEN_KEY = "pf-kampagnen-offen";

  function ladeOffeneKampagnen() {
    try {
      const roh = localStorage.getItem(KAMPAGNEN_OFFEN_KEY);
      const wert = roh ? JSON.parse(roh) : [];
      return new Set(Array.isArray(wert) ? wert : []);
    } catch {
      return new Set();
    }
  }

  function speichereOffeneKampagnen(set) {
    localStorage.setItem(KAMPAGNEN_OFFEN_KEY, JSON.stringify([...set]));
  }

  function attributDetailDialog442(){
    let dialog=document.getElementById("attributDetailDialog442");
    if(dialog) return dialog;
    dialog=document.createElement("dialog");
    dialog.id="attributDetailDialog442";
    dialog.className="bonus-detail-dialog";
    dialog.innerHTML=`<div class="bonus-detail-kopf">
      <h3 id="attributDetailTitel442">Attribut</h3>
      <button type="button" aria-label="Schließen">×</button>
    </div><div id="attributDetailInhalt442"></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector("button").addEventListener("click",()=>dialog.close());
    return dialog;
  }

  function zeigeAttributDetails442(charakter,key){
    if(!charakter) return;
    const lang={ST:"Stärke",GE:"Geschicklichkeit",KO:"Konstitution",IN:"Intelligenz",WE:"Weisheit",CH:"Charisma"};
    const grund=typeof attributGrundwert==="function"?attributGrundwert(charakter,key):10;
    const aktuell=typeof attributAktuellerWert==="function"?attributAktuellerWert(charakter,key):grund;
    const mod=typeof attributModifikatorAusWert==="function"?attributModifikatorAusWert(aktuell):Math.floor((aktuell-10)/2);
    const ziel=`Attribut ${key}`;
    const boni=typeof sammleAktiveBoni==="function"
      ?sammleAktiveBoni(typeof effekte!=="undefined"?effekte:[]).filter(b=>b.ziel===ziel)
      :[];

    const dialog=attributDetailDialog442();
    dialog.querySelector("#attributDetailTitel442").textContent=`${key}: ${lang[key]||key}`;
    const inhalt=dialog.querySelector("#attributDetailInhalt442");
    inhalt.innerHTML="";
    const summe=document.createElement("p");
    summe.className="bonus-detail-summe";
    const bonusSumme=aktuell-grund;
    const fmt=n=>Number(n)>=0?`+${Number(n)}`:String(Number(n));
    summe.textContent=`Grundwert ${grund} + Boni ${fmt(bonusSumme)} = ${aktuell} · Modifikator ${fmt(mod)}`;
    inhalt.appendChild(summe);

    if(!boni.length){
      const leer=document.createElement("p");
      leer.textContent="Keine aktiven Boni auf dieses Attribut.";
      inhalt.appendChild(leer);
    }else{
      const liste=document.createElement("div");
      liste.className="bonus-detail-liste";
      boni.forEach(b=>{
        const zeile=document.createElement("div");
        zeile.className="bonus-detail-zeile";
        zeile.innerHTML=`<strong>${fmt(b.wert)}</strong><span>${b.bonusart}</span><span>${b.effektName||"Unbenannter Effekt"}</span>`;
        liste.appendChild(zeile);
      });
      inhalt.appendChild(liste);
    }
    dialog.showModal();
  }

  function aktualisiereGroesseAnsicht45(charakterId = aktiverCharakterId) {
    const charakter = typeof findeCharakter === "function"
      ? findeCharakter(charakterId)
      : null;
    if (!charakter) return;
    document.querySelectorAll(".charakter-groesse-select-45").forEach(select=>{
      if(String(select.dataset.charakterId)!==String(charakter.id)) return;
      const wert=typeof charakterGroesse==="function"
        ?charakterGroesse(charakter)
        :(charakter.groesse||"Mittelgroß");
      if(document.activeElement!==select) select.value=wert;
    });
  }

  window.aktualisiereGroesseAnsicht45 = aktualisiereGroesseAnsicht45;

  function aktualisiereAttributeAnsicht44(charakterId = aktiverCharakterId) {
    const charakter = typeof findeCharakter === "function"
      ? findeCharakter(charakterId)
      : null;
    if (!charakter) return;

    document.querySelectorAll(
      `.charakter-attribut-zeile-44[data-charakter-id="${CSS.escape(String(charakter.id))}"][data-attribut-key]`
    ).forEach(zeile => {
      const key = zeile.dataset.attributKey;
      const grund = zeile.querySelector(".charakter-attribut-grund-44");
      const aktuell = zeile.querySelector(".charakter-attribut-aktuell-44");
      const mod = zeile.querySelector(".charakter-attribut-mod-44");

      const grundwert = typeof attributGrundwert === "function"
        ? attributGrundwert(charakter, key)
        : Number(charakter.attribute?.[key] || 10);
      const aktuellerWert = typeof attributAktuellerWert === "function"
        ? attributAktuellerWert(charakter, key)
        : grundwert;
      const modWert = typeof attributModifikatorAusWert === "function"
        ? attributModifikatorAusWert(aktuellerWert)
        : Math.floor((aktuellerWert - 10) / 2);

      if (grund && document.activeElement !== grund) {
        grund.value = String(grundwert);
      }
      if (aktuell) {
        aktuell.value = String(aktuellerWert);
        aktuell.textContent = String(aktuellerWert);
      }
      if (mod) {
        mod.value = String(modWert);
        mod.textContent = modWert >= 0 ? `+${modWert}` : String(modWert);
      }
    });
  }

  window.aktualisiereAttributeAnsicht44 = aktualisiereAttributeAnsicht44;

  function rendereKampagnenBaum() {
    const container = document.getElementById("kampagnenBaum");
    if (!container || typeof charaktere === "undefined") return;

    container.innerHTML = "";
    const kampagnen = typeof kampagnenListe === "function" ? kampagnenListe() : ["Charakter ohne Kampagnenzuordnung"];
    const aktive = typeof aktiveKampagne === "function" ? aktiveKampagne() : "Charakter ohne Kampagnenzuordnung";
    const offeneKampagnen = ladeOffeneKampagnen();

    if (!localStorage.getItem(KAMPAGNEN_OFFEN_KEY)) {
      offeneKampagnen.add(aktive);
      speichereOffeneKampagnen(offeneKampagnen);
    }

    kampagnen.forEach((kampagnenName, kampagnenIndex) => {
      const gruppe = document.createElement("section");
      gruppe.className = "kampagnen-gruppe";
      if (kampagnenName === aktive) gruppe.classList.add("aktiv");

      const kopfZeileKampagne = document.createElement("div");
      kopfZeileKampagne.className = "kampagnen-gruppe-kopfzeile";

      const kopf = document.createElement("button");
      kopf.type = "button";
      kopf.className = "kampagnen-gruppe-kopf";
      const istOffen = offeneKampagnen.has(kampagnenName);
      kopf.setAttribute("aria-expanded", String(istOffen));
      kopf.innerHTML = `<strong><span class="kampagnen-pfeil">${istOffen ? "▾" : "▸"}</span>${kampagnenName}</strong><span>${kampagnenName === aktive ? "Aktive Kampagne" : "Inaktiv"}</span>`;
      kopf.addEventListener("click", () => {
        if (offeneKampagnen.has(kampagnenName)) {
          offeneKampagnen.delete(kampagnenName);
        } else {
          offeneKampagnen.add(kampagnenName);
        }
        speichereOffeneKampagnen(offeneKampagnen);
        rendereKampagnenBaum();
      });
      kopfZeileKampagne.appendChild(kopf);

      const kampagnenAktionen = document.createElement("div");
      kampagnenAktionen.className = "kampagnen-aktionen";

      const aktivieren = document.createElement("button");
      aktivieren.type = "button";
      aktivieren.className = "kampagne-aktivieren";
      aktivieren.textContent = kampagnenName === aktive ? "✓" : "●";
      aktivieren.title = kampagnenName === aktive ? "Aktive Kampagne" : "Kampagne aktivieren";
      aktivieren.disabled = kampagnenName === aktive;
      aktivieren.addEventListener("click", () => {
        if (typeof setzeAktiveKampagne === "function") setzeAktiveKampagne(kampagnenName);
        offeneKampagnen.add(kampagnenName);
        speichereOffeneKampagnen(offeneKampagnen);
        rendereKampagnenBaum();
      });
      kampagnenAktionen.appendChild(aktivieren);

      const hoch = document.createElement("button");
      hoch.type = "button";
      hoch.className = "kampagne-verschieben";
      hoch.textContent = "↑";
      hoch.title = "Kampagne nach oben verschieben";
      hoch.disabled = kampagnenIndex === 0;
      hoch.addEventListener("click", () => {
        if (typeof verschiebeKampagne === "function") verschiebeKampagne(kampagnenName, "hoch");
      });
      kampagnenAktionen.appendChild(hoch);

      const runter = document.createElement("button");
      runter.type = "button";
      runter.className = "kampagne-verschieben";
      runter.textContent = "↓";
      runter.title = "Kampagne nach unten verschieben";
      runter.disabled = kampagnenIndex === kampagnen.length - 1;
      runter.addEventListener("click", () => {
        if (typeof verschiebeKampagne === "function") verschiebeKampagne(kampagnenName, "runter");
      });
      kampagnenAktionen.appendChild(runter);

      if (kampagnenName !== "Charakter ohne Kampagnenzuordnung") {
        const kampagneLoeschen = document.createElement("button");
        kampagneLoeschen.type = "button";
        kampagneLoeschen.className = "kampagne-loeschen";
        kampagneLoeschen.textContent = "🗑";
        kampagneLoeschen.title = "Kampagne löschen";
        kampagneLoeschen.addEventListener("click", () => {
          if (confirm(`Kampagne "${kampagnenName}" löschen? Zugeordnete Charaktere werden nach "Charakter ohne Kampagnenzuordnung" verschoben.`)) {
            if (typeof loescheKampagne === "function") loescheKampagne(kampagnenName);
            offeneKampagnen.delete(kampagnenName);
            speichereOffeneKampagnen(offeneKampagnen);
            rendereKampagnenBaum();
          }
        });
        kampagnenAktionen.appendChild(kampagneLoeschen);
      }

      kopfZeileKampagne.appendChild(kampagnenAktionen);
      gruppe.appendChild(kopfZeileKampagne);

      const liste = document.createElement("div");
      liste.className = "kampagnen-charaktere";
      liste.hidden = !offeneKampagnen.has(kampagnenName);
      const zugeordnet = charaktere.filter(c => (c.kampagne || "Charakter ohne Kampagnenzuordnung") === kampagnenName);

      if (!zugeordnet.length) {
        const leer = document.createElement("p");
        leer.className = "kampagnen-leer";
        leer.textContent = "Noch keine Charaktere zugeordnet.";
        liste.appendChild(leer);
      }

      zugeordnet.forEach(charakter => {
        const karte = document.createElement("article");
        karte.className = "kampagnen-charakter";
        if (charakter.id === aktiverCharakterId) karte.classList.add("aktiv");

        const kopfZeile = document.createElement("div");
        kopfZeile.className = "kampagnen-charakter-kopf";

        const portraet = erstellePortraetBereich(charakter);
        const info = document.createElement("div");
        info.className = "kampagnen-charakter-info";

        const name = document.createElement("button");
        name.type = "button";
        name.className = "kampagnen-charakter-name";
        name.textContent = charakter.name;
        name.addEventListener("click", () => {
          if (typeof setzeAktiveKampagne === "function") setzeAktiveKampagne(kampagnenName);
          if (typeof waehleCharakter === "function") waehleCharakter(charakter.id);
          rendereKampagnenBaum();
        });

        const status = document.createElement("small");
        status.textContent = charakter.id === aktiverCharakterId ? "Aktiv" : "Charakter";

        const aktionen = document.createElement("div");
        aktionen.className = "kampagnen-charakter-aktionen";

        const bearbeiten = document.createElement("button");
        bearbeiten.type = "button";
        bearbeiten.className = "icon-button";
        bearbeiten.textContent = "✏️";
        bearbeiten.title = "Charakter umbenennen";
        bearbeiten.setAttribute("aria-label", `${charakter.name} umbenennen`);
        bearbeiten.addEventListener("click", () => {
          const neuerName = prompt("Neuer Charaktername:", charakter.name);
          if (neuerName !== null && typeof benenneCharakterUm === "function") {
            benenneCharakterUm(charakter.id, neuerName);
            rendereKampagnenBaum();
          }
        });

        const kopieren = document.createElement("button");
        kopieren.type = "button";
        kopieren.className = "icon-button";
        kopieren.textContent = "📋";
        kopieren.title = "Effektaktivierungen auf aktiven Charakter kopieren";
        kopieren.disabled = charakter.id === aktiverCharakterId;
        kopieren.addEventListener("click", () => {
          const ziel = typeof aktiverCharakter === "function" ? aktiverCharakter() : null;
          if (!ziel || charakter.id === ziel.id) return;
          if (confirm(`Die Effektaktivierungen von "${charakter.name}" werden auf "${ziel.name}" kopiert. Fortfahren?`)) {
            if (typeof kopiereEffektstatus === "function" && kopiereEffektstatus(charakter.id, ziel.id)) {
              alert(`Effektaktivierungen von "${charakter.name}" wurden auf "${ziel.name}" kopiert.`);
            }
          }
        });

        const loeschen = document.createElement("button");
        loeschen.type = "button";
        loeschen.className = "icon-button";
        loeschen.textContent = "🗑";
        loeschen.title = "Charakter löschen";
        loeschen.disabled = charaktere.length <= 1;
        loeschen.addEventListener("click", () => {
          if (charaktere.length <= 1) {
            alert("Mindestens ein Charakter muss erhalten bleiben.");
            return;
          }
          if (confirm(`Charakter "${charakter.name}" wirklich löschen?`)) {
            if (typeof loescheCharakter === "function") loescheCharakter(charakter.id);
            rendereKampagnenBaum();
          }
        });

        aktionen.append(bearbeiten, kopieren, loeschen);
        info.append(name, status, aktionen);

        const zuweisung = document.createElement("label");
        zuweisung.className = "kampagnen-zuweisung";
        zuweisung.innerHTML = "<span>Kampagne</span>";
        const select = document.createElement("select");
        kampagnenListe().forEach(k => {
          const option = document.createElement("option");
          option.value = k;
          option.textContent = k;
          option.selected = k === kampagnenName;
          select.appendChild(option);
        });
        select.addEventListener("change", () => {
          if (typeof setzeCharakterKampagne === "function") setzeCharakterKampagne(charakter.id, select.value);
          rendereKampagnenBaum();
        });
        zuweisung.appendChild(select);

        kopfZeile.append(portraet, info, zuweisung);

        const klassenBereich = document.createElement("div");
        klassenBereich.className = "charakter-klassen";
        const klassenTitel = document.createElement("div");
        klassenTitel.className = "charakter-klassen-kopf";
        const klassenName = document.createElement("strong");
        klassenName.textContent = "Klassen & Stufen";
        const gesamt = document.createElement("span");
        gesamt.textContent = `Gesamtstufe: ${typeof charakterGesamtstufe === "function" ? charakterGesamtstufe(charakter) : 0}`;
        klassenTitel.append(klassenName, gesamt);
        klassenBereich.appendChild(klassenTitel);

        const klassenListe = document.createElement("div");
        klassenListe.className = "charakter-klassen-liste";

        const speichereKlassen = () => {
          const neueKlassen = [...klassenListe.querySelectorAll(".charakter-klasse-zeile")].map(zeile => ({
            name: (() => {
              const auswahl=zeile.querySelector(".charakter-klasse-name");
              return auswahl?.value==="__andere__"
                ? (zeile.querySelector(".charakter-klasse-andere")?.value || "")
                : (auswahl?.value || "");
            })(),
            stufe: Number(zeile.querySelector(".charakter-klasse-stufe")?.value || 0)
          }));
          if (typeof setzeCharakterKlassen === "function") setzeCharakterKlassen(charakter.id, neueKlassen);
        };

        const fuegeKlassenZeileHinzu = (eintrag = { name: "", stufe: 1 }) => {
          const zeile = document.createElement("div");
          zeile.className = "charakter-klasse-zeile";

          const nameWrap = document.createElement("div");
          nameWrap.className = "charakter-klasse-name-wrap";

          const nameFeld = document.createElement("select");
          nameFeld.className = "charakter-klasse-name";
          const aktuellerName = eintrag.name || "";
          if (typeof erzeugeKlassenOptionen === "function") {
            nameFeld.appendChild(erzeugeKlassenOptionen(aktuellerName, true));
          }
          nameFeld.value = PF_KLASSEN.includes(aktuellerName) ? aktuellerName : "__andere__";

          const andereKlasse = document.createElement("input");
          andereKlasse.type = "text";
          andereKlasse.className = "charakter-klasse-andere";
          andereKlasse.placeholder = "Andere Klasse";
          andereKlasse.value = PF_KLASSEN.includes(aktuellerName) ? "" : aktuellerName;
          andereKlasse.hidden = nameFeld.value !== "__andere__";
          nameFeld.addEventListener("change", () => {
            andereKlasse.hidden = nameFeld.value !== "__andere__";
            speichereKlassen();
          });
          andereKlasse.addEventListener("change", speichereKlassen);
          nameWrap.append(nameFeld, andereKlasse);

          const stufeFeld = document.createElement("input");
          stufeFeld.type = "number";
          stufeFeld.min = "0";
          stufeFeld.max = "99";
          stufeFeld.step = "1";
          stufeFeld.inputMode = "numeric";
          stufeFeld.className = "charakter-klasse-stufe";
          stufeFeld.value = String(eintrag.stufe ?? 0);

          const entfernen = document.createElement("button");
          entfernen.type = "button";
          entfernen.className = "icon-button";
          entfernen.textContent = "🗑";
          entfernen.addEventListener("click", () => {
            zeile.remove();
            speichereKlassen();
          });

          stufeFeld.addEventListener("input", speichereKlassen);
          stufeFeld.addEventListener("change", speichereKlassen);
          zeile.append(nameWrap, stufeFeld, entfernen);
          klassenListe.appendChild(zeile);
        };

        const klassen = Array.isArray(charakter.klassen) ? charakter.klassen : [];
        klassen.forEach(fuegeKlassenZeileHinzu);
        if (!klassen.length) fuegeKlassenZeileHinzu();

        const klasseNeu = document.createElement("button");
        klasseNeu.type = "button";
        klasseNeu.className = "charakter-klasse-neu";
        klasseNeu.textContent = "+ Klasse";
        klasseNeu.addEventListener("click", () => fuegeKlassenZeileHinzu());

        klassenBereich.append(klassenListe, klasseNeu);

        const attributeBereich=document.createElement("details");
        attributeBereich.className="charakter-attribute-44";
        const attributeTitel=document.createElement("summary");
        attributeTitel.textContent="Attribute";
        attributeBereich.appendChild(attributeTitel);

        const attributeTabelle=document.createElement("div");
        attributeTabelle.className="charakter-attribute-tabelle-44";

        const attributeKopf=document.createElement("div");
        attributeKopf.className="charakter-attribut-zeile-44 charakter-attribut-kopf-44";
        ["Attribut","Grundwert","Aktueller Wert","Modifikator"].forEach(text=>{
          const span=document.createElement("span");
          span.textContent=text;
          attributeKopf.appendChild(span);
        });
        attributeTabelle.appendChild(attributeKopf);

        const attributLangnamen={
          ST:"Stärke",GE:"Geschicklichkeit",KO:"Konstitution",
          IN:"Intelligenz",WE:"Weisheit",CH:"Charisma"
        };

        (typeof PF_ATTRIBUTE!=="undefined"?PF_ATTRIBUTE:["ST","GE","KO","IN","WE","CH"]).forEach(key=>{
          const zeile=document.createElement("div");
          zeile.className="charakter-attribut-zeile-44";
          zeile.dataset.attributKey=key;
          zeile.dataset.charakterId=charakter.id;

          const name=document.createElement("strong");
          name.textContent=key;
          name.title=attributLangnamen[key]||key;

          const grund=document.createElement("select");
          grund.className="charakter-attribut-grund-44";
          grund.setAttribute("aria-label",`${name.title} Grundwert`);
          for(let wert=1;wert<=40;wert++){
            const option=document.createElement("option");
            option.value=String(wert);
            option.textContent=String(wert);
            grund.appendChild(option);
          }
          grund.value=String(
            typeof attributGrundwert==="function"
              ?attributGrundwert(charakter,key)
              :Number(charakter.attribute?.[key]||10)
          );

          const aktuell=document.createElement("button");
          aktuell.type="button";
          aktuell.className="charakter-attribut-aktuell-44";
          aktuell.title="Berechnung des aktuellen Attributswerts anzeigen";
          const aktuellerWert=typeof attributAktuellerWert==="function"
            ?attributAktuellerWert(charakter,key)
            :Number(grund.value);
          aktuell.value=String(aktuellerWert);
          aktuell.textContent=String(aktuellerWert);

          const mod=document.createElement("output");
          mod.className="charakter-attribut-mod-44";
          const modWert=typeof attributModifikatorAusWert==="function"
            ?attributModifikatorAusWert(aktuellerWert)
            :Math.floor((aktuellerWert-10)/2);
          mod.value=String(modWert);
          mod.textContent=modWert>=0?`+${modWert}`:String(modWert);

          grund.addEventListener("change",()=>{
            if(typeof setzeCharakterAttribut==="function"){
              setzeCharakterAttribut(charakter.id,key,grund.value);
            }
          });

          aktuell.addEventListener("click",()=>zeigeAttributDetails442(charakter,key));

          zeile.append(name,grund,aktuell,mod);
          attributeTabelle.appendChild(zeile);
        });

        attributeBereich.appendChild(attributeTabelle);
        klassenBereich.appendChild(attributeBereich);

        const gabZeile = document.createElement("label");
        gabZeile.className = "charakter-gab-zeile";
        const gabText = document.createElement("span");
        gabText.textContent = "GAB";
        const gabFeld = document.createElement("input");
        gabFeld.type = "number";
        gabFeld.min = "0";
        gabFeld.max = "99";
        gabFeld.step = "1";
        gabFeld.inputMode = "numeric";
        gabFeld.value = String(Number(charakter.gab) || 0);
        gabFeld.setAttribute("aria-label", `GAB für ${charakter.name}`);
        const speichereGab = () => {
          if (typeof setzeCharakterGAB === "function") {
            setzeCharakterGAB(charakter.id, gabFeld.value);
          }
        };
        gabFeld.addEventListener("input", speichereGab);
        gabFeld.addEventListener("change", speichereGab);
        gabZeile.append(gabText, gabFeld);
        const groesseZeile45=document.createElement("label");
        groesseZeile45.className="charakter-groesse-zeile-45";

        const groesseText45=document.createElement("span");
        groesseText45.textContent="Größe";

        const groesseSelect45=document.createElement("select");
        groesseSelect45.className="charakter-groesse-select-45";
        groesseSelect45.dataset.charakterId=charakter.id;

        const groessenListe45=typeof PF_GROESSEN!=="undefined"
          ?PF_GROESSEN
          :["Mini","Winzig","Sehr klein","Klein","Mittelgroß","Groß","Riesig","Gigantisch","Kolossal"];

        groessenListe45.forEach(groesse=>{
          const option=document.createElement("option");
          option.value=groesse;
          option.textContent=groesse;
          groesseSelect45.appendChild(option);
        });

        groesseSelect45.value=typeof charakterGroesse==="function"
          ?charakterGroesse(charakter)
          :(charakter.groesse||"Mittelgroß");

        groesseSelect45.addEventListener("change",()=>{
          if(typeof setzeCharakterGroesse==="function"){
            setzeCharakterGroesse(charakter.id,groesseSelect45.value);
          }
        });

        groesseZeile45.append(groesseText45,groesseSelect45);

        const gabGroesseZeile45=document.createElement("div");
        gabGroesseZeile45.className="charakter-gab-groesse-zeile-45";
        gabGroesseZeile45.append(gabZeile,groesseZeile45);
        klassenBereich.appendChild(gabGroesseZeile45);

        const groesseHinweis45=document.createElement("p");
        groesseHinweis45.className="charakter-groesse-hinweis-45";
        groesseHinweis45.textContent="Größe beeinflusst Angriff Nah/Fern, Rüstungsklasse, KMB und KMV.";
        klassenBereich.appendChild(groesseHinweis45);

        const gabHinweis = document.createElement("p");
        gabHinweis.className = "charakter-gab-hinweis";
        gabHinweis.textContent = "GAB-Wert hat Einfluss auf GAB-abhängige Effekte und beeinflusst deine Angriffswerte.";
        klassenBereich.appendChild(gabHinweis);

        const notiz = document.createElement("textarea");
        notiz.className = "charakter-notiz-29";
        notiz.rows = 1;
        notiz.placeholder = "Freitext …";
        notiz.value = charakter.notizen || "";
        notiz.setAttribute("aria-label", `Freitext für ${charakter.name}`);
        const passeNotizHoeheAn = () => {
          notiz.style.height = "42px";
          notiz.style.height = `${Math.min(240, Math.max(42, notiz.scrollHeight))}px`;
          notiz.style.overflowY = notiz.scrollHeight > 240 ? "auto" : "hidden";
        };
        notiz.addEventListener("input", () => {
          passeNotizHoeheAn();
          charakter.notizen = notiz.value;
          if (typeof speichereCharaktere === "function") speichereCharaktere();
        });
        requestAnimationFrame(passeNotizHoeheAn);

        karte.append(kopfZeile, klassenBereich, notiz);
        liste.appendChild(karte);
      });

      gruppe.appendChild(liste);
      container.appendChild(gruppe);
    });
  }

  window.rendereKampagnenBaum = rendereKampagnenBaum;

  function initialisiereKampagnenVerwaltung() {
    const input = document.getElementById("neueKampagneName");
    const button = document.getElementById("btnKampagneHinzufuegen");
    if (button && !button.dataset.bound) {
      button.dataset.bound = "1";
      const anlegen = () => {
        const name = String(input?.value || "").trim();
        if (!name) {
          input?.focus();
          return;
        }
        if (typeof erstelleKampagne === "function") {
          erstelleKampagne(name);
          if (input) input.value = "";
          rendereKampagnenBaum();
        }
      };
      button.addEventListener("click", anlegen);
      input?.addEventListener("keydown", event => {
        if (event.key === "Enter") anlegen();
      });
    }
    rendereKampagnenBaum();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereKampagnenVerwaltung, { once: true });
  } else {
    initialisiereKampagnenVerwaltung();
  }

})();
