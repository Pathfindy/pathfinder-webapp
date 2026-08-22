// Commit 25: Komfortfunktionen, Bonusdetails und globaler Charakterwechsel
(() => {
  "use strict";

  const LONG_PRESS_MS = 550;
  let detailDialog = null;

  function formatWert(wert) {
    const zahl = Number(wert) || 0;
    return zahl > 0 ? `+${zahl}` : String(zahl);
  }

  function aktiveBoniFuerZiel(ziel) {
    if (typeof sammleAktiveBoni !== "function") return [];
    const alle = sammleAktiveBoni(typeof effekte !== "undefined" ? effekte : []);
    const ziele = ziel === "Schaden Nah" || ziel === "Schaden Fern"
      ? new Set([ziel, "Schaden"])
      : new Set([ziel]);
    return alle.filter(bonus => ziele.has(bonus.ziel));
  }

  function aktiveBoniFuerAngriff(ziel, angriffsIndex) {
    if (typeof sammleAktiveBoni !== "function") return [];
    const angriffsZiel = `A${Number(angriffsIndex) + 1}`;
    const ziele = ziel === "Schaden Nah" || ziel === "Schaden Fern"
      ? new Set([ziel, "Schaden"])
      : new Set([ziel]);

    return sammleAktiveBoni(typeof effekte !== "undefined" ? effekte : [])
      .filter(bonus => {
        if (!ziele.has(bonus.ziel)) return false;
        if (!bonus.angriffZuweisbar) return true;
        if (bonus.angriffsModus === "alle") return true;
        const ausgewaehlt = Array.isArray(bonus.angriffZiele)
          ? bonus.angriffZiele
          : (bonus.angriffZiel && bonus.angriffZiel !== "-" ? [bonus.angriffZiel] : []);
        return ausgewaehlt.includes(angriffsZiel);
      });
  }

  function bewerteBoniFuerAngriff(ziel, angriffsIndex) {
    const boni = aktiveBoniFuerAngriff(ziel, angriffsIndex);
    const stapelbar = typeof STAPELBARE_BONUSARTEN !== "undefined"
      ? STAPELBARE_BONUSARTEN
      : new Set();

    const gruppen = new Map();
    boni.forEach(bonus => {
      if (!gruppen.has(bonus.bonusart)) gruppen.set(bonus.bonusart, []);
      gruppen.get(bonus.bonusart).push(bonus);
    });

    return boni.map(bonus => {
      if (stapelbar.has(bonus.bonusart)) return { ...bonus, beruecksichtigt: true };
      const gruppe = gruppen.get(bonus.bonusart) || [];
      if (bonus.wert > 0) {
        const max = Math.max(0, ...gruppe.filter(e => e.wert > 0).map(e => e.wert));
        return { ...bonus, beruecksichtigt: bonus.wert === max };
      }
      const min = Math.min(0, ...gruppe.filter(e => e.wert < 0).map(e => e.wert));
      return { ...bonus, beruecksichtigt: bonus.wert === min };
    });
  }

  function bewerteBoni(ziel) {
    const boni = aktiveBoniFuerZiel(ziel);
    const stapelbar = typeof STAPELBARE_BONUSARTEN !== "undefined"
      ? STAPELBARE_BONUSARTEN
      : new Set();

    const gruppen = new Map();
    boni.forEach(bonus => {
      if (!gruppen.has(bonus.bonusart)) gruppen.set(bonus.bonusart, []);
      gruppen.get(bonus.bonusart).push(bonus);
    });

    return boni.map(bonus => {
      if (stapelbar.has(bonus.bonusart)) return { ...bonus, beruecksichtigt: true };
      const gruppe = gruppen.get(bonus.bonusart) || [];
      if (bonus.wert > 0) {
        const max = Math.max(0, ...gruppe.filter(e => e.wert > 0).map(e => e.wert));
        return { ...bonus, beruecksichtigt: bonus.wert === max };
      }
      const min = Math.min(0, ...gruppe.filter(e => e.wert < 0).map(e => e.wert));
      return { ...bonus, beruecksichtigt: bonus.wert === min };
    });
  }

  function erstelleDetailDialog() {
    if (detailDialog) return detailDialog;
    detailDialog = document.createElement("dialog");
    detailDialog.id = "bonusDetailDialog";
    detailDialog.className = "bonus-detail-dialog";
    detailDialog.innerHTML = `
      <div class="bonus-detail-kopf">
        <h3 id="bonusDetailTitel">Bonusdetails</h3>
        <button type="button" id="bonusDetailSchliessen" aria-label="Schließen">×</button>
      </div>
      <div id="bonusDetailInhalt"></div>
    `;
    document.body.appendChild(detailDialog);
    detailDialog.querySelector("#bonusDetailSchliessen")
      .addEventListener("click", () => detailDialog.close());
    detailDialog.addEventListener("click", event => {
      if (event.target === detailDialog) detailDialog.close();
    });
    return detailDialog;
  }

  function zeigeBonusDetailsFuerAngriff(titel, ziel, grundwert, angriffsIndex, angriff = null) {
    const dialog = erstelleDetailDialog();
    const boni = bewerteBoniFuerAngriff(ziel, angriffsIndex);
    const ergebnis = typeof berechneBonusErgebnisFuerAngriff === "function"
      ? berechneBonusErgebnisFuerAngriff(
          typeof effekte !== "undefined" ? effekte : [],
          angriffsIndex
        )
      : {};

    let bonusGesamt = Number(ergebnis[ziel] ?? 0);
    if (ziel === "Schaden Nah" || ziel === "Schaden Fern") {
      bonusGesamt += Number(ergebnis.Schaden ?? 0);
    }

    const charakter = typeof aktiverCharakter === "function" ? aktiverCharakter() : null;
    let attributKey = "";
    let attributWert = 0;
    let attributText = "";

    if (angriff && charakter && typeof attributModifikator === "function") {
      if (ziel === "Angriff Nah" || ziel === "Angriff Fern") {
        attributKey = typeof window.angriffsAttributKey46==="function"
          ?window.angriffsAttributKey46(angriff)
          :(angriff.waffenfinesse ? "GE" : (angriff.art === "Fern" ? "GE" : "ST"));
        attributWert = Number(attributModifikator(charakter, attributKey) || 0);
        attributText = angriff.waffenfinesse && angriff.art !== "Fern"
          ? "GE-Modifikator (Waffenfinesse)"
          : `${attributKey}-Modifikator`;
      } else if (ziel === "Schaden Nah") {
        attributKey = "ST";
        attributWert = typeof window.staerkeSchadenModifikator46==="function"
          ?Number(window.staerkeSchadenModifikator46(angriff,charakter)||0)
          :Number(attributModifikator(charakter, "ST") || 0);
        if(angriff.modus==="zweithand" && !angriff.doppelschnitt){
          attributText="½ ST-Modifikator (Zweithand)";
        }else if(angriff.modus==="sekundaer"){
          attributText="½ ST-Modifikator (Sekundärangriff)";
        }else if(
          (angriff.modus==="haupthand" || angriff.modus==="haupthand_zusatz") &&
          angriff.waffeZweihand
        ){
          attributText="1,5 × ST-Modifikator (zweihändig)";
        }else if(angriff.modus==="primaer" && angriff.einzigerNatuerlicherAngriff){
          attributText="1,5 × ST-Modifikator (einziger natürlicher Angriff)";
        }else{
          attributText="ST-Modifikator";
        }
      }
    }

    const groesseWert = angriff && charakter &&
      (ziel === "Angriff Nah" || ziel === "Angriff Fern") &&
      typeof groessenModifikatorAngriffRk === "function"
        ? Number(groessenModifikatorAngriffRk(charakter) || 0)
        : 0;
    const modusMalus = angriff &&
      (ziel === "Angriff Nah" || ziel === "Angriff Fern") &&
      typeof window.angriffsGrundMalus46==="function"
        ?Number(window.angriffsGrundMalus46(angriff)||0)
        :0;
    const gesamt = Number(grundwert) + attributWert + groesseWert + modusMalus + bonusGesamt;

    dialog.querySelector("#bonusDetailTitel").textContent = titel;
    const inhalt = dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML = "";

    const summe = document.createElement("p");
    summe.className = "bonus-detail-summe";
    summe.textContent = attributText
      ? `Grundwert ${formatWert(grundwert)} + ${attributText} ${formatWert(attributWert)} + Größe ${formatWert(groesseWert)} + Modus ${formatWert(modusMalus)} + sonstige Boni ${formatWert(bonusGesamt)} = ${formatWert(gesamt)}`
      : `Grundwert ${formatWert(grundwert)} + Boni ${formatWert(bonusGesamt)} = ${formatWert(gesamt)}`;
    inhalt.appendChild(summe);

    if (attributText) {
      const attributZeile = document.createElement("div");
      attributZeile.className = "bonus-detail-zeile";
      attributZeile.innerHTML = `
        <strong>${formatWert(attributWert)}</strong>
        <span>Modifikator Attribut</span>
        <span>${attributText}</span>
        <small>Grundkomponente – immer berücksichtigt</small>
      `;
      inhalt.appendChild(attributZeile);
    }

    if (groesseWert !== 0 || (angriff && (ziel === "Angriff Nah" || ziel === "Angriff Fern"))) {
      const groesseZeile = document.createElement("div");
      groesseZeile.className = "bonus-detail-zeile";
      const groesseName = charakter && typeof charakterGroesse === "function"
        ? charakterGroesse(charakter)
        : "Mittelgroß";
      groesseZeile.innerHTML = `
        <strong>${formatWert(groesseWert)}</strong>
        <span>Größe</span>
        <span>${groesseName}</span>
        <small>Größenmodifikator – immer berücksichtigt</small>
      `;
      inhalt.appendChild(groesseZeile);
    }

    if (!boni.length) {
      const leer = document.createElement("p");
      leer.textContent = attributText
        ? "Keine weiteren aktiven Boni für diesen Wert."
        : "Keine aktiven Boni für diesen Angriff.";
      inhalt.appendChild(leer);
    } else {
      const liste = document.createElement("div");
      liste.className = "bonus-detail-liste";
      boni.forEach(bonus => {
        const zeile = document.createElement("div");
        zeile.className = "bonus-detail-zeile";
        if (!bonus.beruecksichtigt) zeile.classList.add("nicht-beruecksichtigt");
        zeile.innerHTML = `
          <strong>${formatWert(bonus.wert)}</strong>
          <span>${bonus.bonusart}</span>
          <span>${bonus.effektName || "Unbenannter Effekt"}</span>
          <small>${bonus.beruecksichtigt ? "berücksichtigt" : "nicht stapelbar – nicht berücksichtigt"}</small>
        `;
        liste.appendChild(zeile);
      });
      inhalt.appendChild(liste);
    }

    dialog.showModal();
  }

  function zeigeBonusDetails(titel, ziel, grundwert = null) {
    const dialog = erstelleDetailDialog();
    const boni = bewerteBoni(ziel);
    const ergebnis = typeof berechneBonusErgebnis === "function"
      ? berechneBonusErgebnis(typeof effekte !== "undefined" ? effekte : [])
      : {};
    let bonusGesamt = Number(ergebnis[ziel] ?? 0);
    if (ziel === "Schaden Nah" || ziel === "Schaden Fern") {
      bonusGesamt += Number(ergebnis.Schaden ?? 0);
    }

    dialog.querySelector("#bonusDetailTitel").textContent = titel;
    const inhalt = dialog.querySelector("#bonusDetailInhalt");
    inhalt.innerHTML = "";

    const summe = document.createElement("p");
    summe.className = "bonus-detail-summe";
    summe.textContent = grundwert === null
      ? `Berechneter Bonus: ${formatWert(bonusGesamt)}`
      : `Grundwert ${formatWert(grundwert)} + Boni ${formatWert(bonusGesamt)} = ${formatWert(Number(grundwert) + bonusGesamt)}`;
    inhalt.appendChild(summe);

    if (!boni.length) {
      const leer = document.createElement("p");
      leer.textContent = "Keine aktiven Boni für diesen Wert.";
      inhalt.appendChild(leer);
    } else {
      const liste = document.createElement("div");
      liste.className = "bonus-detail-liste";
      boni.forEach(bonus => {
        const zeile = document.createElement("div");
        zeile.className = "bonus-detail-zeile";
        if (!bonus.beruecksichtigt) zeile.classList.add("nicht-beruecksichtigt");
        zeile.innerHTML = `
          <strong>${formatWert(bonus.wert)}</strong>
          <span>${bonus.bonusart}</span>
          <span>${bonus.effektName || "Unbenannter Effekt"}</span>
          <small>${bonus.beruecksichtigt ? "berücksichtigt" : "nicht stapelbar – nicht berücksichtigt"}</small>
        `;
        liste.appendChild(zeile);
      });
      inhalt.appendChild(liste);
    }

    dialog.showModal();
  }

  function installiereDashboardDetails() {
    const zuordnung = typeof DASHBOARD_ZIELE !== "undefined" ? DASHBOARD_ZIELE : {};
    Object.entries(zuordnung).forEach(([ziel, id]) => {
      const wert = document.getElementById(id);
      const karte = wert?.closest(".karte");
      if (!karte || karte.dataset.details25) return;
      karte.dataset.details25 = "1";
      karte.tabIndex = 0;
      karte.setAttribute("role", "button");
      karte.setAttribute("aria-label", `${karte.querySelector("h3")?.textContent || ziel}: Bonusdetails anzeigen`);
      const oeffnen = () => zeigeBonusDetails(karte.querySelector("h3")?.textContent || ziel, ziel);
      karte.addEventListener("click", oeffnen);
      karte.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          oeffnen();
        }
      });
    });
  }

  function installiereAngriffsDetails() {
    document.querySelectorAll("#angriffeListe .angriff-karte").forEach((karte, index) => {
      if (karte.dataset.details25) return;
      karte.dataset.details25 = "1";
      const charakter = typeof aktiverCharakter === "function" ? aktiverCharakter() : null;
      const angriff = charakter?.kampfwerte?.angriffe?.[index];
      if (!angriff) return;

      const felder = karte.querySelectorAll(".angriff-ergebnis > div");
      if (felder[0]) {
        felder[0].classList.add("bonus-klickbar");
        felder[0].addEventListener("click", () => {
          const ziel = angriff.art === "Fern" ? "Angriff Fern" : "Angriff Nah";
          zeigeBonusDetailsFuerAngriff(`${angriff.name}: Angriff`, ziel, angriff.grundAngriff, index, angriff);
        });
      }
      if (felder[1]) {
        felder[1].classList.add("bonus-klickbar");
        felder[1].addEventListener("click", () => {
          const ziel = angriff.art === "Fern" ? "Schaden Fern" : "Schaden Nah";
          const grund = angriff.schadenModifikator === null ? 0 : angriff.schadenModifikator;
          zeigeBonusDetailsFuerAngriff(`${angriff.name}: Schaden`, ziel, grund, index, angriff);
        });
      }
    });
  }

  function findeEffektZuKarte(karte) {
    const name = karte.querySelector(".effekt-name")?.textContent || "";
    return (typeof effekte !== "undefined" ? effekte : [])
      .find(effekt => effekt.name === name) || null;
  }

  function oeffneEffektBeschreibung(karte, effekt) {
    let beschreibung = karte.querySelector(".effekt-beschreibung-25");
    if (!beschreibung) {
      beschreibung = document.createElement("div");
      beschreibung.className = "effekt-beschreibung-25";
      beschreibung.innerHTML = `
        <div>${(effekt.beschreibung || "Keine Beschreibung vorhanden.")
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>")}</div>
        ${effekt.quelle ? `<small>Quelle: ${String(effekt.quelle)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</small>` : ""}
      `;
      karte.appendChild(beschreibung);
    } else {
      beschreibung.remove();
    }
  }

  function installiereEffektkarten() {
    document.querySelectorAll("#boniListe .effekt").forEach(karte => {
      const effekt = findeEffektZuKarte(karte);
      if (!effekt) return;

      const stern = karte.querySelector(".effekt-favorit");
      if (stern) karte.appendChild(stern);

      if (karte.dataset.longpress25) return;
      karte.dataset.longpress25 = "1";

      let timer = null;
      let lang = false;
      const start = event => {
        if (event.target.closest("button,input,label,.effekt-aktionen")) return;
        lang = false;
        timer = setTimeout(() => {
          lang = true;
          oeffneEffektBeschreibung(karte, effekt);
        }, LONG_PRESS_MS);
      };
      const ende = () => {
        if (timer) clearTimeout(timer);
        timer = null;
      };

      karte.addEventListener("pointerdown", start);
      karte.addEventListener("pointerup", ende);
      karte.addEventListener("pointercancel", ende);
      karte.addEventListener("pointerleave", ende);
      karte.addEventListener("contextmenu", event => {
        if (lang) event.preventDefault();
      });
    });
  }

  function erstelleCharakterleiste() {
    if (document.getElementById("globaleCharakterleiste")) return;
    const nav = document.querySelector("nav");
    if (!nav) return;

    const leiste = document.createElement("div");
    leiste.id = "globaleCharakterleiste";
    leiste.className = "globale-charakterleiste";
    leiste.innerHTML = `
      <label for="globaleCharakterAuswahl">Aktiv:</label>
      <select id="globaleCharakterAuswahl" aria-label="Aktiven Charakter wechseln"></select>
    `;
    nav.after(leiste);

    leiste.querySelector("#globaleCharakterAuswahl").addEventListener("change", event => {
      if (typeof waehleCharakter === "function") waehleCharakter(event.target.value);
      aktualisiereCharakterauswahl();
      setTimeout(aktualisiereErweiterungen, 0);
    });
    aktualisiereCharakterauswahl();
  }

  function aktualisiereCharakterauswahl() {
    const select = document.getElementById("globaleCharakterAuswahl");
    if (!select || typeof charaktere === "undefined") return;

    const aktive = typeof aktiveKampagne === "function" ? aktiveKampagne() : "Standard";

    select.innerHTML = "";
    charaktere
      .filter(charakter => (charakter.kampagne || "Standard") === aktive)
      .forEach(charakter => {
        const option = document.createElement("option");
        option.value = charakter.id;
        option.textContent = charakter.name;
        option.selected = charakter.id === aktiverCharakterId;
        select.appendChild(option);
      });

    if ([...select.options].some(option => option.value === aktiverCharakterId)) {
      select.value = aktiverCharakterId;
    }
  }

  window.aktualisiereGlobaleCharakterauswahl = aktualisiereCharakterauswahl;

  function erstelleFixierteFilterleiste() {
    const seite = document.getElementById("effekte");
    const suche = document.getElementById("suche");
    const filter = seite?.querySelector(".effekt-filter");
    const neu = document.getElementById("btnNeuerEffekt");
    const ergebnis = document.getElementById("filterErgebnis");
    if (!seite || !suche || !filter || document.getElementById("effektWerkzeugleiste25")) return;

    const leiste = document.createElement("div");
    leiste.id = "effektWerkzeugleiste25";
    leiste.className = "effekt-werkzeugleiste-25";
    seite.insertBefore(leiste, neu);
    leiste.append(neu, suche, filter, ergebnis);
  }

  function aktualisiereErweiterungen() {
    aktualisiereCharakterauswahl();
    installiereDashboardDetails();
    installiereEffektkarten();
    installiereAngriffsDetails();
  }

  function initialisiereCommit25() {
    erstelleCharakterleiste();
    erstelleFixierteFilterleiste();
    erstelleDetailDialog();
    aktualisiereErweiterungen();

    const observer = new MutationObserver(() => {
      requestAnimationFrame(aktualisiereErweiterungen);
    });
    const boniListe = document.getElementById("boniListe");
    const angriffeListe = document.getElementById("angriffeListe");
    if (boniListe) observer.observe(boniListe, { childList: true });
    if (angriffeListe) observer.observe(angriffeListe, { childList: true });

    const alteWahl = typeof waehleCharakter === "function" ? waehleCharakter : null;
    if (alteWahl) {
      waehleCharakter = function (id) {
        const ergebnis = alteWahl(id);
        if (ergebnis) {
          aktualisiereCharakterauswahl();
          setTimeout(aktualisiereErweiterungen, 0);
        }
        return ergebnis;
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit25, { once: true });
  } else {
    initialisiereCommit25();
  }
})();
