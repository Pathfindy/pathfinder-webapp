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
          rendereCharaktere();
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
          rendereCharaktere();
        }
      });
      bereich.appendChild(entfernen);
    }

    return bereich;
  }

  rendereCharaktere = function () {
    const liste = document.getElementById("charakterListe");
    if (!liste) return;

    liste.innerHTML = "";
    charaktere.forEach(charakter => {
      const eintrag = document.createElement("article");
      eintrag.className = "charakter-eintrag charakter-eintrag-29";
      if (charakter.id === aktiverCharakterId) eintrag.classList.add("aktiv");
      if (charakter.portraet) eintrag.classList.add("mit-portraet");

      const kopf = document.createElement("div");
      kopf.className = "charakter-kopf-29";

      if (charakter.portraet) {
        kopf.appendChild(erstellePortraetBereich(charakter));
      }

      const auswahl = document.createElement("button");
      auswahl.type = "button";
      auswahl.className = "charakter-auswahl";
      auswahl.setAttribute("aria-pressed", String(charakter.id === aktiverCharakterId));
      auswahl.innerHTML = `<strong>${charakter.name}</strong><span>${
        charakter.id === aktiverCharakterId ? "Aktiv" : "Auswählen"
      }</span>`;
      auswahl.addEventListener("click", () => waehleCharakter(charakter.id));

      const aktionen = document.createElement("div");
      aktionen.className = "charakter-aktionen";

      if (!charakter.portraet) {
        const portraetHinzufuegen = document.createElement("button");
        portraetHinzufuegen.type = "button";
        portraetHinzufuegen.className = "icon-button";
        portraetHinzufuegen.textContent = "📷";
        portraetHinzufuegen.title = "Porträt hinzufügen";
        portraetHinzufuegen.setAttribute(
          "aria-label",
          `Porträt für ${charakter.name} hinzufügen`
        );
        const versteckterBereich = erstellePortraetBereich(charakter);
        const dateiFeld = versteckterBereich.querySelector('input[type="file"]');
        portraetHinzufuegen.addEventListener("click", () => dateiFeld?.click());
        aktionen.append(portraetHinzufuegen, versteckterBereich);
        versteckterBereich.classList.add("nur-dateifeld-29");
      }

      const umbenennen = document.createElement("button");
      umbenennen.type = "button";
      umbenennen.className = "icon-button";
      umbenennen.textContent = "✏️";
      umbenennen.setAttribute("aria-label", `${charakter.name} umbenennen`);
      umbenennen.addEventListener("click", () => {
        const name = prompt("Neuer Charaktername:", charakter.name);
        if (name !== null) benenneCharakterUm(charakter.id, name);
      });

      const kopieren = document.createElement("button");
      kopieren.type = "button";
      kopieren.className = "icon-button";
      kopieren.textContent = "📋";
      kopieren.disabled = charakter.id === aktiverCharakterId;
      kopieren.setAttribute(
        "aria-label",
        `Effekte von ${charakter.name} auf den aktiven Charakter kopieren`
      );
      kopieren.title = charakter.id === aktiverCharakterId
        ? "Dieser Charakter ist bereits aktiv."
        : "Effektaktivierungen auf den aktiven Charakter kopieren";
      kopieren.addEventListener("click", () => {
        const ziel = aktiverCharakter();
        if (!ziel || charakter.id === ziel.id) return;
        const bestaetigt = confirm(
          `Die Effektaktivierungen von "${charakter.name}" werden auf "${ziel.name}" kopiert. ` +
          `Die bisherigen Aktivierungen von "${ziel.name}" werden ersetzt. Fortfahren?`
        );
        if (bestaetigt && kopiereEffektstatus(charakter.id, ziel.id)) {
          alert(`Effektaktivierungen von "${charakter.name}" wurden auf "${ziel.name}" kopiert.`);
        }
      });

      const loeschen = document.createElement("button");
      loeschen.type = "button";
      loeschen.className = "icon-button";
      loeschen.textContent = "🗑";
      loeschen.disabled = charaktere.length <= 1;
      loeschen.setAttribute("aria-label", `${charakter.name} löschen`);
      loeschen.addEventListener("click", () => {
        if (charaktere.length <= 1) {
          alert("Mindestens ein Charakter muss erhalten bleiben.");
          return;
        }
        if (confirm(`Charakter "${charakter.name}" wirklich löschen?`)) {
          loescheCharakter(charakter.id);
        }
      });

      aktionen.append(umbenennen, kopieren, loeschen);
      kopf.append(auswahl, aktionen);

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
        try {
          speichereCharaktere();
        } catch (fehler) {
          console.error("Charakternotiz konnte nicht gespeichert werden:", fehler);
        }
      });

      requestAnimationFrame(passeNotizHoeheAn);

      eintrag.append(kopf, notiz);
      liste.appendChild(eintrag);
    });
  };
})();
