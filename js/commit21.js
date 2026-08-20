// Commit 21: Navigation, Bonusarten und zusätzliche Effektdetails
(() => {
  const BONUSARTEN = [
    "Ablenkung", "Alchemistisch", "Ausweichen", "Erkenntnis", "Glück",
    "Größe", "Heilig", "Innewohnend", "Kompetenz", "Malus", "Moral",
    "Namenlos", "Natürliche Rüstung", "Profan", "Resistenz", "Rüstung",
    "Schild", "Situation", "Unheilig", "Verbesserung", "Verständnis"
  ];

  const GEBIETE = [
    "", "Hören", "Reichweite Eidolon", "selbst", "Sicht",
    "Umkreis 1,5m/ 5 Foot/ 1 Felder",
    "Umkreis 3m/ 10 Foot/ 2 Felder",
    "Umkreis 4,5m/ 15 Foot/ 3 Felder",
    "Umkreis 6m/ 20 Foot/ 4 Felder",
    "Umkreis 7,5m/ 25Foot/ 5 Felder",
    "Umkreis 9m/ 30 Foot/ 6 Felder",
    "Umkreis 10,5m/ 35Foot/ 7 Felder",
    "Umkreis 12m/ 40Foot/ 8 Felder",
    "Umkreis 13,5m/ 45 Foot/ 9 Felder",
    "Umkreis 15m/ 50 Foot/ 10 Felder",
    "Umkreis 16,5m/ 55 Foot/ 11 Felder",
    "Umkreis 18m/ 60 Foot/ 12 Felder",
    "unbegrenzt"
  ];

  const DAUERN = [
    "", "1 Min./Stufe", "1 Runde", "1 Runde/Stufe", "1 Std./Stufe",
    "10 Min./Stufe", "10 Runden/Stufe", "12 Stunden", "bis gebannt",
    "getragen", "in Reichweite", "Nach Angabe SL", "so lange Kampfrausch",
    "so lange vorgetragen", "unbegrenzt"
  ];

  const alteNormalisiereBonusart = normalisiereBonusart;
  normalisiereBonusart = function (bonusart) {
    const wert = alteNormalisiereBonusart(bonusart);
    const migration = {
      "Ausweich": "Ausweichen",
      "Natürlich": "Natürliche Rüstung",
      "Natürliche": "Natürliche Rüstung",
      "Natür. Rüstung": "Natürliche Rüstung"
    };
    return migration[wert] || wert;
  };

  const alteNormalisiereEffekt = normalisiereEffekt;
  normalisiereEffekt = function (effekt = {}) {
    const basis = alteNormalisiereEffekt(effekt);
    return {
      ...basis,
      gebiet: typeof effekt.gebiet === "string" ? effekt.gebiet : "",
      dauer: typeof effekt.dauer === "string" ? effekt.dauer : "",
      boni: Array.isArray(basis.boni)
        ? basis.boni.map(bonus => ({ ...bonus, bonusart: normalisiereBonusart(bonus.bonusart) }))
        : []
    };
  };

  function optionen(werte, auswahl, leertext) {
    return werte.map((wert, index) => {
      const option = document.createElement("option");
      option.value = wert;
      option.textContent = index === 0 && !wert ? leertext : wert;
      option.selected = wert === auswahl;
      return option;
    });
  }

  function ergaenzeEditorFelder() {
    const dialog = document.getElementById("effektDialog");
    const bonusEditor = document.getElementById("bonusEditor");
    if (!dialog || !bonusEditor || document.getElementById("effektMetadaten")) return;

    const bereich = document.createElement("div");
    bereich.id = "effektMetadaten";
    bereich.className = "effekt-metadaten-editor";
    bereich.innerHTML = `
      <label>Bereich<br><select id="effektGebiet"></select></label>
      <label>Dauer<br><select id="effektDauer"></select></label>
    `;
    bonusEditor.before(bereich);

    document.getElementById("effektGebiet")
      .append(...optionen(GEBIETE, "", "– nicht angegeben –"));
    document.getElementById("effektDauer")
      .append(...optionen(DAUERN, "", "– nicht angegeben –"));
  }

  const alteLeseEditorFormular = leseEditorFormular;
  leseEditorFormular = function () {
    const daten = alteLeseEditorFormular();
    daten.gebiet = document.getElementById("effektGebiet")?.value || "";
    daten.dauer = document.getElementById("effektDauer")?.value || "";
    daten.boni = daten.boni.map(bonus => ({
      ...bonus,
      bonusart: normalisiereBonusart(bonus.bonusart)
    }));
    return daten;
  };

  const alteSchreibeEditorFormular = schreibeEditorFormular;
  schreibeEditorFormular = function () {
    ergaenzeEditorFelder();
    alteSchreibeEditorFormular();
    const gebiet = document.getElementById("effektGebiet");
    const dauer = document.getElementById("effektDauer");
    if (gebiet) gebiet.value = editorState.entwurf?.gebiet || "";
    if (dauer) dauer.value = editorState.entwurf?.dauer || "";
  };

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
      ziel.append(...erzeugeOptionen(PF_BONUS_ZIELE, bonus.ziel));
      ziel.addEventListener("change", event =>
        aktualisiereBonus(index, "ziel", event.target.value));

      const bonusart = document.createElement("select");
      bonusart.setAttribute("aria-label", `Bonusart der Bonuszeile ${index + 1}`);
      bonusart.append(...erzeugeOptionen(
        BONUSARTEN, normalisiereBonusart(bonus.bonusart)));
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
  };

  const zielKurz = {
    "Angriff Nah": "ANG Nah", "Angriff Fern": "ANG Fern", "Schaden": "SCH",
    "Rüstungsklasse": "RK", "RW-Zähigkeit": "ZÄH", "RW-Reflex": "REF",
    "RW-Wille": "WIL", "RW-Furcht": "Furcht",
    "RW-Verzauberung": "Verz.", "RW-Bezauberung": "Bez."
  };

  function bonusKurztext(effekt) {
    return (effekt.boni || [])
      .filter(bonus => Number(bonus.wert) !== 0)
      .map(bonus => {
        const wert = Number(bonus.wert);
        const zahl = wert > 0 ? `+${wert}` : String(wert);
        return `${zielKurz[bonus.ziel] || bonus.ziel} ${zahl} (${normalisiereBonusart(bonus.bonusart)})`;
      })
      .join(" • ");
  }

  function ergaenzeEffektkarten() {
    document.querySelectorAll("#boniListe .effekt").forEach(karte => {
      const name = karte.querySelector(".effekt-name")?.textContent || "";
      const effekt = effekte.find(eintrag => eintrag.name === name);
      const info = karte.querySelector(".effekt-info");
      if (!effekt || !info) return;

      info.querySelectorAll(".effekt-boni-kurz, .effekt-meta-kurz")
        .forEach(element => element.remove());

      const boni = bonusKurztext(effekt);
      if (boni) {
        const bonusZeile = document.createElement("div");
        bonusZeile.className = "effekt-boni-kurz";
        bonusZeile.textContent = boni;
        info.appendChild(bonusZeile);
      }

      const meta = [effekt.gebiet, effekt.dauer].filter(Boolean).join(" • ");
      if (meta) {
        const metaZeile = document.createElement("div");
        metaZeile.className = "effekt-meta-kurz";
        metaZeile.textContent = meta;
        info.appendChild(metaZeile);
      }
    });
  }

  const alteBaueEffektliste = baueEffektliste;
  baueEffektliste = function () {
    alteBaueEffektliste();
    ergaenzeEffektkarten();
  };

  const alteExportVorbereitung = bereiteStandardEffektFuerExportVor;
  bereiteStandardEffektFuerExportVor = function (effekt) {
    return {
      ...alteExportVorbereitung(effekt),
      gebiet: effekt.gebiet || "",
      dauer: effekt.dauer || ""
    };
  };

  const alteZeigeSeite = zeigeSeite;
  zeigeSeite = function (name) {
    alteZeigeSeite(name);
    document.querySelectorAll("nav button")
      .forEach(button => button.classList.remove("active"));
    const zuordnung = {
      charaktere: "btnCharaktere",
      charakterwerte: "btnCharakterwerte",
      leben: "btnLeben",
      vermoegen: "btnVermoegen",
      effekte: "btnEffekte",
      dashboard: "btnDashboard",
      admin: "btnAdmin"
    };
    document.getElementById(zuordnung[name])?.classList.add("active");
  };

  function initialisiereCommit21() {
    const nav = document.querySelector("nav");
    ["btnCharaktere", "btnCharakterwerte", "btnLeben", "btnEffekte", "btnDashboard", "btnVermoegen", "btnAdmin"]
      .map(id => document.getElementById(id))
      .filter(Boolean)
      .forEach(button => nav?.appendChild(button));


    ergaenzeEditorFelder();
    aktualisiereAktivenCharakterHinweis();

    document.getElementById("btnCharaktere").onclick =
      () => zeigeSeite("charaktere");
    document.getElementById("btnCharakterwerte").onclick =
      () => zeigeSeite("charakterwerte");
    document.getElementById("btnLeben").onclick =
      () => zeigeSeite("leben");
    document.getElementById("btnVermoegen").onclick =
      () => zeigeSeite("vermoegen");
    document.getElementById("btnEffekte").onclick =
      () => zeigeSeite("effekte");
    document.getElementById("btnDashboard").onclick =
      () => zeigeSeite("dashboard");
    document.getElementById("btnAdmin").onclick = () => {
      zeigeSeite("admin");
      aktualisiereAdminAnsicht();
    };

    zeigeSeite("dashboard");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit21, { once: true });
  } else {
    initialisiereCommit21();
  }
})();
