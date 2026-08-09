// Commit 24: Bonusarten, Favoriten, Export und Effekt-Erweiterungen
(() => {
  "use strict";

  const FAVORITEN_KEY = "pf-charakter-favoriten";
  const BONUSARTEN_24 = [
    "Ablenkung", "Alchemistisch", "Ausweichen", "Erkenntnis", "Glück",
    "Größe", "Heilig", "Innewohnend", "Kompetenz", "Malus",
    "Modifikator Attribut", "Moral", "Namenlos", "Natürliche Rüstung",
    "Profan", "Resistenz", "Rüstung", "Schild", "Situation",
    "Unheilig", "Verbesserung", "Verständnis"
  ];
  const ZIELE_24 = [
    "Angriff Nah", "Angriff Fern", "Schaden Nah", "Schaden Fern",
    "Rüstungsklasse", "KMB", "KMV", "RW-Zähigkeit", "RW-Gift",
    "RW-Reflex", "RW-Wille", "RW-Furcht", "RW-Verzauberung",
    "RW-Bezauberung"
  ];

  function ladeAlleFavoriten() {
    try {
      const daten = JSON.parse(localStorage.getItem(FAVORITEN_KEY) || "{}");
      return daten && typeof daten === "object" && !Array.isArray(daten) ? daten : {};
    } catch {
      return {};
    }
  }

  function favoritenFuerCharakter(charakterId = aktiverCharakterId) {
    const alle = ladeAlleFavoriten();
    return Array.isArray(alle[charakterId]) ? alle[charakterId] : [];
  }

  function speichereFavoriten(charakterId, favoriten) {
    const alle = ladeAlleFavoriten();
    alle[charakterId] = [...new Set(favoriten)];
    localStorage.setItem(FAVORITEN_KEY, JSON.stringify(alle));
  }

  function istFavorit(effektId) {
    return favoritenFuerCharakter().includes(String(effektId));
  }

  function schalteFavorit(effektId) {
    const id = String(effektId);
    const favoriten = favoritenFuerCharakter();
    const neu = favoriten.includes(id)
      ? favoriten.filter(eintrag => eintrag !== id)
      : [...favoriten, id];
    speichereFavoriten(aktiverCharakterId, neu);
    baueEffektliste();
  }

  function findeEffektZuKarte(karte) {
    const name = karte.querySelector(".effekt-name")?.textContent || "";
    return effekte.find(effekt => effekt.name === name) || null;
  }

  function ergaenzeFavoritenAnKarten() {
    document.querySelectorAll("#boniListe .effekt").forEach(karte => {
      const effekt = findeEffektZuKarte(karte);
      if (!effekt || karte.querySelector(".effekt-favorit")) return;

      const stern = document.createElement("button");
      stern.type = "button";
      stern.className = "effekt-favorit";
      const favorit = istFavorit(effekt.id);
      stern.classList.toggle("aktiv", favorit);
      stern.textContent = favorit ? "★" : "☆";
      stern.title = favorit ? "Aus Favoriten entfernen" : "Als Favorit markieren";
      stern.setAttribute("aria-label", stern.title);
      stern.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        schalteFavorit(effekt.id);
      });
      karte.insertBefore(stern, karte.firstChild);
    });
  }

  function filtereFavoriten() {
    const nurFavoriten = document.getElementById("filterNurFavoriten")?.checked;
    if (!nurFavoriten) return;
    document.querySelectorAll("#boniListe .effekt").forEach(karte => {
      const effekt = findeEffektZuKarte(karte);
      if (!effekt || !istFavorit(effekt.id)) karte.remove();
    });
  }

  function aktualisiereFilterErgebnis() {
    const anzeige = document.getElementById("filterErgebnis");
    if (!anzeige) return;
    const anzahl = document.querySelectorAll("#boniListe .effekt").length;
    anzeige.textContent = `${anzahl} ${anzahl === 1 ? "Effekt" : "Effekte"} angezeigt`;
  }

  const alteBaueEffektliste24 = baueEffektliste;
  baueEffektliste = function () {
    alteBaueEffektliste24();
    ergaenzeFavoritenAnKarten();
    filtereFavoriten();
    aktualisiereFilterErgebnis();
  };

  function ergaenzeBeruehrung() {
    const select = document.getElementById("effektGebiet");
    if (!select || [...select.options].some(option => option.value === "Berührung")) return;
    const option = document.createElement("option");
    option.value = "Berührung";
    option.textContent = "Berührung";
    const selbst = [...select.options].find(option => option.value === "selbst");
    if (selbst) selbst.before(option);
    else select.appendChild(option);
  }

  function erzeugeOptionen24(werte, auswahl) {
    return werte.map(wert => {
      const option = document.createElement("option");
      option.value = wert;
      option.textContent = wert;
      option.selected = String(wert) === String(auswahl);
      return option;
    });
  }

  rendereBonusEditor = function () {
    const container = document.getElementById("bonusContainer");
    if (!container || !editorState.entwurf) return;
    container.innerHTML = "";

    if (editorState.entwurf.boni.length === 0) {
      const hinweis = document.createElement("p");
      hinweis.className = "bonus-leer";
      hinweis.textContent = "Noch keine Bonuszeile angelegt.";
      container.appendChild(hinweis);
      return;
    }

    editorState.entwurf.boni.forEach((bonus, index) => {
      const zeile = document.createElement("div");
      zeile.className = "bonus-zeile";

      const ziel = document.createElement("select");
      ziel.setAttribute("aria-label", `Ziel der Bonuszeile ${index + 1}`);
      ziel.append(...erzeugeOptionen24(ZIELE_24, bonus.ziel));
      ziel.addEventListener("change", event =>
        aktualisiereBonus(index, "ziel", event.target.value));

      const bonusart = document.createElement("select");
      bonusart.setAttribute("aria-label", `Bonusart der Bonuszeile ${index + 1}`);
      bonusart.append(...erzeugeOptionen24(BONUSARTEN_24, normalisiereBonusart(bonus.bonusart)));
      bonusart.addEventListener("change", event =>
        aktualisiereBonus(index, "bonusart", event.target.value));

      const wert = document.createElement("select");
      wert.setAttribute("aria-label", `Wert der Bonuszeile ${index + 1}`);
      wert.append(...erzeugeOptionen(PF_BONUSWERTE, bonus.wert));
      wert.addEventListener("change", event =>
        aktualisiereBonus(index, "wert", event.target.value));

      const entfernen = document.createElement("button");
      entfernen.type = "button";
      entfernen.className = "icon-button bonus-entfernen";
      entfernen.textContent = "🗑";
      entfernen.setAttribute("aria-label", `Bonuszeile ${index + 1} löschen`);
      entfernen.addEventListener("click", () => entferneBonuszeile(index));

      zeile.append(ziel, bonusart, wert, entfernen);
      container.appendChild(zeile);
    });

    ergaenzeBeruehrung();
  };

  function exportiereCharakter24() {
    const charakter = aktiverCharakter();
    if (!charakter) return alert("Es ist kein aktiver Charakter vorhanden.");

    const daten = {
      format: "pathfinder-charakter",
      version: 2,
      exportiertAm: new Date().toISOString(),
      charakter: JSON.parse(JSON.stringify(charakter)),
      effektStatus: JSON.parse(JSON.stringify(ladeStatusFuerCharakter(charakter.id))),
      effektAngriffsziele: typeof ladeEffektAngriffszieleFuerCharakter === "function"
        ? JSON.parse(JSON.stringify(ladeEffektAngriffszieleFuerCharakter(charakter.id)))
        : {},
      favoriten: favoritenFuerCharakter(charakter.id),
      benutzerEffekte: listeBenutzerEffekte().map(effekt => JSON.parse(JSON.stringify(effekt)))
    };

    const blob = new Blob([JSON.stringify(daten, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${charakter.name.replace(/[^\wäöüÄÖÜß-]+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function installiereExport24() {
    const alt = document.getElementById("btnCharakterExport");
    if (!alt) return;
    const neu = alt.cloneNode(true);
    alt.replaceWith(neu);
    neu.addEventListener("click", exportiereCharakter24);
  }

  function installiereFavoritenFilter() {
    const filter = document.getElementById("filterNurFavoriten");
    if (filter && !filter.dataset.commit24) {
      filter.dataset.commit24 = "1";
      filter.addEventListener("change", baueEffektliste);
    }
  }

  function initialisiereCommit24() {
    if (Array.isArray(PF_BONUS_ZIELE)) {
      ZIELE_24.forEach(ziel => {
        if (!PF_BONUS_ZIELE.includes(ziel)) PF_BONUS_ZIELE.push(ziel);
      });
    }
    ergaenzeBeruehrung();
    installiereFavoritenFilter();
    installiereExport24();
    baueEffektliste();

    const dialog = document.getElementById("effektDialog");
    dialog?.addEventListener("toggle", ergaenzeBeruehrung);
    document.getElementById("btnNeuerEffekt")?.addEventListener("click", () =>
      setTimeout(ergaenzeBeruehrung, 0)
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit24, { once: true });
  } else {
    initialisiereCommit24();
  }

  window.pfFavoriten = {
    laden: favoritenFuerCharakter,
    speichern: speichereFavoriten
  };
})();
