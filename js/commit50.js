// Commit 50: Effekt-Schnellauswahl und Kampf-Symbole
(() => {
  "use strict";

  const QUICK_KEY = "pf-charakter-effekt-schnellleisten";
  const COLLAPSE_KEY = "pf-charakter-schnellleisten-offen";
  const LONG_PRESS_MS = 560;

  const ICONS = {
    // Gekreuzte Schwerter – klar als Nahkampf erkennbar.
    sword: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.1 2.6 9 7.5 7.5 9 2.6 4.1 2 2l2.1.6Zm15.8 0L15 7.5 16.5 9l4.9-4.9L22 2l-2.1.6ZM8.4 10.6l5 5-1.7 1.7-5-5 1.7-1.7Zm7.2 0 1.7 1.7-5 5-1.7-1.7 5-5ZM5.4 14l4.6 4.6-1.5 1.5-1.4-1.4-2.2 2.2-1.8-1.8 2.2-2.2-1.4-1.4L5.4 14Zm13.2 0 1.5 1.5-1.4 1.4 2.2 2.2-1.8 1.8-2.2-2.2-1.4 1.4-1.5-1.5 4.6-4.6Z"/>
    </svg>`,
    // Deutlicher Bogen mit Sehne und Pfeil.
    bow: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 2.5c4.8 3 7.2 6.2 7.2 9.5S9.8 18.5 5 21.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 2.5 5 21.5" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <path d="M3 12h17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="m20 12-3-2v4l3-2Z"/>
    </svg>`,
    // Dezent gefüllter Schild.
    shield: `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.2 20 5v6.1c0 5.1-3.1 8.8-8 10.7-4.9-1.9-8-5.6-8-10.7V5l8-2.8Z" opacity=".28"/>
      <path d="M12 2.2 20 5v6.1c0 5.1-3.1 8.8-8 10.7-4.9-1.9-8-5.6-8-10.7V5l8-2.8Zm0 2.1L6 6.4v4.7c0 4 2.2 6.9 6 8.5 3.8-1.6 6-4.5 6-8.5V6.4l-6-2.1Z"/>
    </svg>`,
    star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 1.8 1.6 6.1 5.5-3.2-3.2 5.5 6.1 1.6-6.1 1.6 3.2 5.5-5.5-3.2-1.6 6.1-1.6-6.1-5.5 3.2 3.2-5.5L2 11.8l6.1-1.6-3.2-5.5 5.5 3.2L12 1.8Z"/></svg>`
  };

  function leseJson(key, standard = {}) {
    try {
      const wert = JSON.parse(localStorage.getItem(key) || "null");
      return wert && typeof wert === "object" && !Array.isArray(wert) ? wert : standard;
    } catch {
      return standard;
    }
  }

  function alleZuweisungen() { return leseJson(QUICK_KEY, {}); }
  function zuweisungenFuerCharakter(charakterId = aktiverCharakterId) {
    const alle = alleZuweisungen();
    const daten = alle[charakterId];
    return daten && typeof daten === "object" && !Array.isArray(daten) ? daten : {};
  }
  function speichereZuweisungen(charakterId, daten) {
    if (!charakterId) return;
    const alle = alleZuweisungen();
    alle[charakterId] = daten && typeof daten === "object" ? daten : {};
    localStorage.setItem(QUICK_KEY, JSON.stringify(alle));
  }
  function zuweisungFuerEffekt(effektId) {
    const daten = zuweisungenFuerCharakter();
    const z = daten[String(effektId)] || {};
    return { nah: !!z.nah, fern: !!z.fern };
  }
  function setzeZuweisung(effektId, feld, wert) {
    if (!aktiverCharakterId) return;

    // Eine Schnellleisten-Zuweisung macht den Effekt automatisch zum Favoriten.
    // Dadurch sind die Symbole in jedem Effektbanner nutzbar und die
    // Schnellleisten bleiben weiterhin reine Favoriten-Auswahlen.
    if (wert && !istFavorit50(effektId) &&
        window.pfFavoriten && typeof window.pfFavoriten.umschalten === "function") {
      window.pfFavoriten.umschalten(String(effektId));
    }

    const daten = zuweisungenFuerCharakter();
    const id = String(effektId);
    const aktuell = daten[id] || {};
    daten[id] = { nah: !!aktuell.nah, fern: !!aktuell.fern, [feld]: !!wert };
    if (!daten[id].nah && !daten[id].fern) delete daten[id];
    speichereZuweisungen(aktiverCharakterId, daten);
    rendereSchnellleisten50();
    ergaenzeSchnellzuweisungAnEffektkarten50();
  }

  function istFavorit50(effektId) {
    return !!(window.pfFavoriten && typeof window.pfFavoriten.laden === "function" &&
      window.pfFavoriten.laden().includes(String(effektId)));
  }

  function effektKurztitel(name) {
    return String(name || "Effekt")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s{2,}/g, " ")
      .trim() || String(name || "Effekt");
  }

  function findeEffekt(id) {
    return (typeof effekte !== "undefined" ? effekte : []).find(e => String(e.id) === String(id)) || null;
  }

  function setzeEffektAktiv50(effekt, aktiv) {
    if (!effekt || typeof ladeStatusFuerCharakter !== "function" || typeof speichereStatus !== "function") return;
    const status = ladeStatusFuerCharakter(aktiverCharakterId);
    status[effekt.name] = !!aktiv;
    effekt.aktiv = !!aktiv;
    speichereStatus(status);
    if (typeof baueEffektliste === "function") baueEffektliste();
    if (typeof berechneWerte === "function") berechneWerte();
    if (typeof window.aktualisiereAlleAnsichten === "function") window.aktualisiereAlleAnsichten();
    rendereSchnellleisten50();
  }

  function oeffneEffekt50(effekt) {
    if (!effekt) return;
    if (typeof zeigeSeite === "function") zeigeSeite("effekte");

    const suche = document.getElementById("suche");
    if (suche) {
      suche.value = effekt.name;
      suche.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const nurAktiv = document.getElementById("filterNurAktiv");
    if (nurAktiv?.checked) {
      nurAktiv.checked = false;
      nurAktiv.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const nurFavoriten = document.getElementById("filterNurFavoriten");
    if (nurFavoriten && !nurFavoriten.checked) {
      // Favorit ist Voraussetzung für die Schnellleiste; kein Eingriff nötig.
    }
    if (typeof baueEffektliste === "function") baueEffektliste();

    requestAnimationFrame(() => {
      const karte = [...document.querySelectorAll("#boniListe .effekt")].find(k =>
        (k.querySelector(".effekt-name")?.textContent || "") === effekt.name
      );
      if (karte) {
        karte.classList.add("effekt-sprungziel-50");
        karte.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => karte.classList.remove("effekt-sprungziel-50"), 1800);
      }
    });
  }

  function iconButton50(icon, titel, aktiv, click) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "effekt-schnellzuweisung-50";
    button.classList.toggle("aktiv", aktiv);
    button.innerHTML = ICONS[icon];
    button.title = titel;
    button.setAttribute("aria-label", titel);
    button.setAttribute("aria-pressed", String(aktiv));
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      click();
    });
    return button;
  }

  function findeEffektZuKarte50(karte) {
    const name = karte.querySelector(".effekt-name")?.textContent || "";
    return (typeof effekte !== "undefined" ? effekte : []).find(e => e.name === name) || null;
  }

  function ergaenzeSchnellzuweisungAnEffektkarten50() {
    document.querySelectorAll("#boniListe .effekt").forEach(karte => {
      const effekt = findeEffektZuKarte50(karte);
      if (!effekt) return;
      karte.querySelector(".effekt-schnellzuweisung-box-50")?.remove();

      const z = zuweisungFuerEffekt(effekt.id);
      const box = document.createElement("div");
      box.className = "effekt-schnellzuweisung-box-50";
      box.title = "Schnellauswahl auf Kampf / Werte";
      box.append(
        iconButton50("sword", "In Nahkampf-Schnellleiste anzeigen", z.nah,
          () => setzeZuweisung(effekt.id, "nah", !z.nah)),
        iconButton50("bow", "In Fernkampf-Schnellleiste anzeigen", z.fern,
          () => setzeZuweisung(effekt.id, "fern", !z.fern))
      );
      const stern = karte.querySelector(".effekt-favorit");
      if (stern) stern.before(box); else karte.appendChild(box);
    });
  }

  function leisteOffen50(art) {
    const alle = leseJson(COLLAPSE_KEY, {});
    const c = alle[aktiverCharakterId] || {};
    return c[art] !== false;
  }
  function setzeLeisteOffen50(art, offen) {
    const alle = leseJson(COLLAPSE_KEY, {});
    const c = alle[aktiverCharakterId] || {};
    alle[aktiverCharakterId] = { ...c, [art]: !!offen };
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(alle));
  }

  function erstelleSchnellbereich50() {
    const seite = document.getElementById("charakterwerte");
    const angriffe = seite?.querySelector(".angriffe-bereich");
    if (!seite || !angriffe) return null;
    let bereich = document.getElementById("effektSchnellleisten50");
    if (!bereich) {
      bereich = document.createElement("div");
      bereich.id = "effektSchnellleisten50";
      bereich.className = "effekt-schnellleisten-50";
    }
    angriffe.before(bereich);
    return bereich;
  }

  function baueEineSchnellleiste50(art, icon, titel, effekteListe) {
    const details = document.createElement("details");
    details.className = `effekt-schnellleiste-50 effekt-schnellleiste-${art}-50`;
    const hoverFaehig=window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
    details.open = hoverFaehig ? false : leisteOffen50(art);

    if(hoverFaehig){
      details.addEventListener("pointerenter",()=>{
        details.open=true;
      });
      details.addEventListener("pointerleave",event=>{
        // Beim Verlassen der gesamten Leiste automatisch wieder schließen.
        if(!details.contains(event.relatedTarget)) details.open=false;
      });
      // Auf Desktop soll ein Klick nicht versehentlich einen dauerhaften Zustand erzeugen.
      details.addEventListener("toggle",()=>{
        if(!details.matches(":hover") && details.open) details.open=false;
      });
    }else{
      details.addEventListener("toggle", () => setzeLeisteOffen50(art, details.open));
    }

    const aktiv = effekteListe.filter(e => e.aktiv).length;
    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="effekt-schnell-dreieck-501" aria-hidden="true">▸</span><span class="kampf-icon-50">${ICONS[icon]}</span><strong>${titel}</strong><small>${aktiv} aktiv</small>`;
    if(hoverFaehig){
      summary.addEventListener("click",event=>{
        event.preventDefault();
      });
    }
    details.appendChild(summary);

    const chips = document.createElement("div");
    chips.className = "effekt-schnellchips-50";
    if (!effekteListe.length) {
      const leer = document.createElement("span");
      leer.className = "effekt-schnellleer-50";
      leer.textContent = "Keine Favoriten zugewiesen";
      chips.appendChild(leer);
    }

    effekteListe.forEach(effekt => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "effekt-schnellchip-50";
      button.classList.toggle("aktiv", !!effekt.aktiv);
      button.textContent = effektKurztitel(effekt.name);
      button.title = `${effekt.name}\nTippen: ${effekt.aktiv ? "deaktivieren" : "aktivieren"} · lang drücken: Effekt öffnen`;
      button.setAttribute("aria-pressed", String(!!effekt.aktiv));

      let timer = null;
      let lang = false;
      const start = event => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        lang = false;
        timer = setTimeout(() => {
          lang = true;
          timer = null;
          oeffneEffekt50(effekt);
        }, LONG_PRESS_MS);
      };
      const ende = event => {
        if (timer) { clearTimeout(timer); timer = null; }
        if (lang) { event?.preventDefault?.(); event?.stopPropagation?.(); }
      };
      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", ende);
      button.addEventListener("pointercancel", ende);
      button.addEventListener("pointerleave", () => { if (timer) clearTimeout(timer); timer = null; });
      button.addEventListener("contextmenu", event => { if (lang) event.preventDefault(); });
      button.addEventListener("click", event => {
        if (lang) { lang = false; event.preventDefault(); return; }
        setzeEffektAktiv50(effekt, !effekt.aktiv);
      });
      chips.appendChild(button);
    });
    details.appendChild(chips);
    return details;
  }

  function rendereSchnellleisten50() {
    const bereich = erstelleSchnellbereich50();
    if (!bereich) return;
    const favs = window.pfFavoriten && typeof window.pfFavoriten.laden === "function"
      ? new Set(window.pfFavoriten.laden().map(String)) : new Set();
    const z = zuweisungenFuerCharakter();
    const alle = (typeof effekte !== "undefined" ? effekte : []).filter(e => favs.has(String(e.id)));
    const nah = alle.filter(e => z[String(e.id)]?.nah);
    const fern = alle.filter(e => z[String(e.id)]?.fern);
    bereich.innerHTML = "";
    bereich.append(
      baueEineSchnellleiste50("nah", "sword", "Nahkampf", nah),
      baueEineSchnellleiste50("fern", "bow", "Fernkampf", fern)
    );
  }

  function installiereKampfsymbole50() {
    // RK-Schild
    document.querySelectorAll(".rk-variante-47").forEach(button => {
      if (button.dataset.rkModus47 !== "normal" || button.querySelector(".kampf-icon-50")) return;
      const label = button.querySelector("span");
      if (!label) return;
      const icon = document.createElement("span");
      icon.className = "kampf-icon-50 kampf-icon-schild-50";
      icon.innerHTML = ICONS.shield;
      label.append(" ", icon);
    });

    // Rettungswurf-Zaubersterne
    const rwIcons = {
      "RW-Reflex": "reflex",
      "RW-Wille": "wille",
      "RW-Zähigkeit": "zaehigkeit"
    };
    document.querySelectorAll(".grundwert-zeile-26").forEach(zeile => {
      const klasse = rwIcons[zeile.dataset.bonusZiel];
      if (!klasse || zeile.querySelector(".kampf-icon-rw-50")) return;
      const haupt = zeile.querySelector(".grundwert-label-haupt-48") || zeile.querySelector("label");
      if (!haupt) return;
      const icon = document.createElement("span");
      icon.className = `kampf-icon-50 kampf-icon-rw-50 kampf-icon-rw-${klasse}-50`;
      icon.innerHTML = ICONS.star;
      haupt.append(" ", icon);
    });
  }

  function aktualisiereKampfsymbole50() {
    document.querySelectorAll("#angriffeListe .angriff-karte").forEach((karte, index) => {
      const charakter = typeof aktiverCharakter === "function" ? aktiverCharakter() : null;
      const angriff = charakter?.kampfwerte?.angriffe?.[index];
      const label = karte.querySelector(".angriff-ergebnis-haupt-48 span");
      if (!angriff || !label) return;
      label.querySelector(".kampf-icon-50")?.remove();
      const icon = document.createElement("span");
      icon.className = "kampf-icon-50 kampf-icon-angriff-50";
      icon.innerHTML = angriff.art === "Fern" ? ICONS.bow : ICONS.sword;
      label.append(" ", icon);
    });
    installiereKampfsymbole50();
  }

  function installiereSuchLoeschen502(){
    const suche=document.getElementById("suche");
    const button=document.getElementById("btnSucheLeeren502");
    if(!suche || !button || button.dataset.commit502) return;
    button.dataset.commit502="1";

    const aktualisiere=()=>{
      button.classList.toggle("sichtbar",String(suche.value||"").length>0);
    };

    button.addEventListener("click",event=>{
      event.preventDefault();
      suche.value="";
      suche.dispatchEvent(new Event("input",{bubbles:true}));
      suche.focus();
      aktualisiere();
    });
    suche.addEventListener("input",aktualisiere);
    aktualisiere();
  }

  function installiereHooks50() {
    if (typeof baueEffektliste === "function" && !baueEffektliste.__commit50) {
      const alt = baueEffektliste;
      const neu = function (...args) {
        const ergebnis = alt(...args);
        ergaenzeSchnellzuweisungAnEffektkarten50();
        rendereSchnellleisten50();
        return ergebnis;
      };
      neu.__commit50 = true;
      baueEffektliste = neu;
    }

    if (typeof window.aktualisiereAngriffeAnsicht === "function" && !window.aktualisiereAngriffeAnsicht.__commit50) {
      const alt = window.aktualisiereAngriffeAnsicht;
      const neu = function (...args) {
        const ergebnis = alt(...args);
        aktualisiereKampfsymbole50();
        return ergebnis;
      };
      neu.__commit50 = true;
      window.aktualisiereAngriffeAnsicht = neu;
    }

    if (typeof waehleCharakter === "function" && !waehleCharakter.__commit50) {
      const alt = waehleCharakter;
      const neu = function (id) {
        const ergebnis = alt(id);
        if (ergebnis) {
          rendereSchnellleisten50();
          ergaenzeSchnellzuweisungAnEffektkarten50();
          aktualisiereKampfsymbole50();
        }
        return ergebnis;
      };
      neu.__commit50 = true;
      waehleCharakter = neu;
    }

    // Favorit-API um Aktualisierung ergänzen, ohne bestehende Speicherung zu verändern.
    if (window.pfFavoriten && !window.pfFavoriten.__commit50) {
      const speichernAlt = window.pfFavoriten.speichern;
      window.pfFavoriten.speichern = function (...args) {
        const r = speichernAlt.apply(this, args);
        setTimeout(() => {
          rendereSchnellleisten50();
          ergaenzeSchnellzuweisungAnEffektkarten50();
        }, 0);
        return r;
      };
      window.pfFavoriten.__commit50 = true;
    }
  }

  function aktualisiereKopfhoehen504(){
    const nav=document.querySelector("nav");
    const aktiv=document.getElementById("globaleCharakterleiste");
    const navHoehe=nav ? Math.ceil(nav.getBoundingClientRect().height) : 48;
    const aktivHoehe=aktiv ? Math.ceil(aktiv.getBoundingClientRect().height) : 51;
    document.documentElement.style.setProperty("--pf-nav-hoehe",`${navHoehe}px`);
    document.documentElement.style.setProperty("--pf-aktiver-charakter-hoehe",`${aktivHoehe}px`);
    document.documentElement.style.setProperty(
      "--pf-kopf-sticky-hoehe",
      `${navHoehe+aktivHoehe}px`
    );
  }

  function aktualisiereAktiverCharakterHoehe503(){
    aktualisiereKopfhoehen504();
  }

  function setzeStartseite503(){
    if(typeof zeigeSeite==="function"){
      zeigeSeite("charaktere");
    }else{
      document.querySelectorAll(".page").forEach(seite=>seite.classList.remove("active"));
      document.getElementById("charaktere")?.classList.add("active");
    }
  }

  function initialisiere50() {
    setzeStartseite503();
    aktualisiereKopfhoehen504();
    requestAnimationFrame(aktualisiereKopfhoehen504);
    installiereHooks50();
    installiereSuchLoeschen502();
    rendereSchnellleisten50();
    ergaenzeSchnellzuweisungAnEffektkarten50();
    aktualisiereKampfsymbole50();

    const observer = new MutationObserver(() => requestAnimationFrame(() => {
      ergaenzeSchnellzuweisungAnEffektkarten50();
      aktualisiereKampfsymbole50();
    }));
    const boni = document.getElementById("boniListe");
    const angriffe = document.getElementById("angriffeListe");
    const grund = document.getElementById("grundwerte26");
    if (boni) observer.observe(boni, { childList: true });
    if (angriffe) observer.observe(angriffe, { childList: true });
    if (grund) observer.observe(grund, { childList: true, subtree: true });

    window.addEventListener("resize",aktualisiereKopfhoehen504);
    document.addEventListener("pf-charakter-importiert", () => setTimeout(() => {
      rendereSchnellleisten50();
      aktualisiereKampfsymbole50();
    }, 0));
  }

  window.pfSchnellleisten50 = {
    laden: zuweisungenFuerCharakter,
    speichern: speichereZuweisungen,
    rendern: rendereSchnellleisten50
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiere50, { once: true });
  } else {
    initialisiere50();
  }
})();
