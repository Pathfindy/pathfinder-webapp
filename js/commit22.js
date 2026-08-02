// Commit 22: Charakter-Import und -Export (JSON)
(() => {
  const EXPORT_FORMAT = "pathfinder-charakter";
  const EXPORT_VERSION = 1;

  function sichereKopie(wert) {
    return JSON.parse(JSON.stringify(wert));
  }

  function dateinameTeil(text) {
    return String(text || "charakter")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "charakter";
  }

  function herunterLaden(dateiname, inhalt) {
    const blob = new Blob([inhalt], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = dateiname;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportiereAktivenCharakter() {
    const charakter = aktiverCharakter();
    if (!charakter) {
      alert("Es ist kein aktiver Charakter vorhanden.");
      return;
    }

    const status = sichereKopie(ladeStatusFuerCharakter(charakter.id));
    const aktiveBenutzerEffektIds = new Set(
      Object.entries(status)
        .filter(([, aktiv]) => !!aktiv)
        .map(([id]) => id)
    );

    const benutzerEffekte = typeof listeBenutzerEffekte === "function"
      ? listeBenutzerEffekte()
          .filter(effekt => aktiveBenutzerEffektIds.has(effekt.id))
          .map(sichereKopie)
      : [];

    const exportDaten = {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      exportiertAm: new Date().toISOString(),
      appVersion: typeof APP_VERSION === "string" ? APP_VERSION : null,
      charakter: sichereKopie(charakter),
      effektStatus: status,
      benutzerEffekte
    };

    const datum = new Date().toISOString().slice(0, 10);
    herunterLaden(
      `${dateinameTeil(charakter.name)}-${datum}.json`,
      JSON.stringify(exportDaten, null, 2)
    );
  }

  function validiereImport(daten) {
    if (!daten || typeof daten !== "object" || Array.isArray(daten)) {
      throw new Error("Die Datei enthält kein gültiges JSON-Objekt.");
    }
    if (daten.format !== EXPORT_FORMAT) {
      throw new Error("Die Datei ist kein Pathfinder-Charakterexport.");
    }
    if (![1, 2].includes(Number(daten.version))) {
      throw new Error(`Die Exportversion ${daten.version ?? "?"} wird nicht unterstützt.`);
    }
    if (!daten.charakter || typeof daten.charakter !== "object") {
      throw new Error("Im Export fehlen die Charakterdaten.");
    }
    if (typeof daten.charakter.name !== "string" || !daten.charakter.name.trim()) {
      throw new Error("Der importierte Charakter hat keinen gültigen Namen.");
    }

    return {
      charakter: daten.charakter,
      effektStatus:
        daten.effektStatus &&
        typeof daten.effektStatus === "object" &&
        !Array.isArray(daten.effektStatus)
          ? daten.effektStatus
          : {},
      benutzerEffekte: Array.isArray(daten.benutzerEffekte)
        ? daten.benutzerEffekte
        : [],
      favoriten: Array.isArray(daten.favoriten)
        ? daten.favoriten.map(String)
        : []
    };
  }

  function normalisiereVergleichstext(wert) {
    return String(wert || "")
      .trim()
      .toLocaleLowerCase("de-DE")
      .replace(/\s+/g, " ");
  }

  function effektSignatur(effekt = {}) {
    return [
      normalisiereVergleichstext(effekt.name),
      normalisiereVergleichstext(effekt.kategorie),
      normalisiereVergleichstext(effekt.quelle)
    ].join("|");
  }

  function ladeAlleFavoriten25_2() {
    try {
      const daten = JSON.parse(
        localStorage.getItem("pf-charakter-favoriten") || "{}"
      );
      return daten && typeof daten === "object" && !Array.isArray(daten)
        ? daten
        : {};
    } catch {
      return {};
    }
  }

  function migriereFavoritenIds(idZuBehalten) {
    if (!(idZuBehalten instanceof Map) || idZuBehalten.size === 0) return;

    const alleFavoriten = ladeAlleFavoriten25_2();
    let geaendert = false;

    Object.keys(alleFavoriten).forEach(charakterId => {
      if (!Array.isArray(alleFavoriten[charakterId])) return;

      const ersetzt = alleFavoriten[charakterId].map(id =>
        idZuBehalten.get(String(id)) || String(id)
      );
      const eindeutig = [...new Set(ersetzt)];

      if (
        eindeutig.length !== alleFavoriten[charakterId].length ||
        eindeutig.some((id, index) => id !== alleFavoriten[charakterId][index])
      ) {
        alleFavoriten[charakterId] = eindeutig;
        geaendert = true;
      }
    });

    if (geaendert) {
      localStorage.setItem(
        "pf-charakter-favoriten",
        JSON.stringify(alleFavoriten)
      );
    }
  }

  function bereinigeDoppelteBenutzerEffekte() {
    if (typeof ladeBenutzerEffekte !== "function") return false;

    const roh = ladeBenutzerEffekte();
    if (!Array.isArray(roh) || roh.length < 2) return false;

    const nachId = new Map();
    const nachSignatur = new Map();
    const bereinigt = [];
    const idZuBehalten = new Map();
    let geaendert = false;

    roh.forEach(roheffekt => {
      if (!roheffekt || typeof roheffekt !== "object") return;

      const effekt = normalisiereEffekt({
        ...roheffekt,
        standard: false,
        aktiv: false
      });
      const id = String(effekt.id || "");
      const signatur = effektSignatur(effekt);

      let vorhandenerIndex = id && nachId.has(id)
        ? nachId.get(id)
        : nachSignatur.get(signatur);

      if (typeof vorhandenerIndex === "number") {
        const vorhanden = bereinigt[vorhandenerIndex];
        idZuBehalten.set(id, vorhanden.id);

        bereinigt[vorhandenerIndex] = normalisiereEffekt({
          ...effekt,
          ...vorhanden,
          id: vorhanden.id,
          standard: false,
          aktiv: false,
          beschreibung: vorhanden.beschreibung || effekt.beschreibung || "",
          quelle: vorhanden.quelle || effekt.quelle || "",
          gebiet: vorhanden.gebiet || effekt.gebiet || "",
          dauer: vorhanden.dauer || effekt.dauer || "",
          boni:
            Array.isArray(vorhanden.boni) && vorhanden.boni.length
              ? vorhanden.boni
              : effekt.boni
        });
        geaendert = true;
        return;
      }

      const neuerIndex = bereinigt.length;
      bereinigt.push(effekt);
      if (id) nachId.set(id, neuerIndex);
      nachSignatur.set(signatur, neuerIndex);
    });

    if (!geaendert) return false;

    speichereBenutzerEffekte(bereinigt);
    migriereFavoritenIds(idZuBehalten);
    return true;
  }

  function importiereBenutzerEffekte(importierteEffekte) {
    const idZuBehalten = new Map();
    if (!Array.isArray(importierteEffekte) || importierteEffekte.length === 0) {
      return idZuBehalten;
    }

    bereinigeDoppelteBenutzerEffekte();

    importierteEffekte.forEach(roheffekt => {
      if (!roheffekt || typeof roheffekt !== "object") return;

      const importId =
        typeof roheffekt.id === "string" && roheffekt.id
          ? roheffekt.id
          : neueEffektId();

      const importiert = normalisiereEffekt({
        ...roheffekt,
        id: importId,
        standard: false,
        aktiv: false
      });

      const signatur = effektSignatur(importiert);
      const indexAlle = effekte.findIndex(eintrag =>
        !eintrag.standard &&
        (
          String(eintrag.id) === String(importId) ||
          effektSignatur(eintrag) === signatur
        )
      );

      if (indexAlle >= 0) {
        const bestehendeId = effekte[indexAlle].id;
        effekte[indexAlle] = normalisiereEffekt({
          ...effekte[indexAlle],
          ...importiert,
          id: bestehendeId,
          standard: false,
          aktiv: false
        });
        idZuBehalten.set(String(importId), String(bestehendeId));
      } else {
        effekte.push(importiert);
        idZuBehalten.set(String(importId), String(importiert.id));
      }
    });

    speichereAktuelleBenutzerEffekte();
    migriereFavoritenIds(idZuBehalten);
    return idZuBehalten;
  }

  function speichereImportStatus(charakterId, status) {
    const alleStatus = ladeAlleCharakterStatus();
    alleStatus[charakterId] = { ...normalisiereStatus(status) };
    speichereAlleCharakterStatus(alleStatus);
  }

  function mappeImportFavoriten(favoriten, idZuBehalten) {
    if (!Array.isArray(favoriten)) return [];
    return [...new Set(
      favoriten.map(id =>
        idZuBehalten instanceof Map
          ? idZuBehalten.get(String(id)) || String(id)
          : String(id)
      )
    )];
  }

  function speichereImportFavoriten(charakterId, favoriten) {
    if (!Array.isArray(favoriten)) return;
    if (window.pfFavoriten && typeof window.pfFavoriten.speichern === "function") {
      window.pfFavoriten.speichern(charakterId, favoriten.map(String));
      return;
    }
    const schluessel = "pf-charakter-favoriten";
    const alle = JSON.parse(localStorage.getItem(schluessel) || "{}");
    alle[charakterId] = [...new Set(favoriten.map(String))];
    localStorage.setItem(schluessel, JSON.stringify(alle));
  }

  function aktualisiereNachImport() {
    speichereCharaktere();
    rendereCharaktere();
    aktualisiereAktivenCharakterHinweis();
    baueEffektliste();
    if (typeof berechneWerte === "function") berechneWerte();
    document.dispatchEvent(new CustomEvent("pf-charakter-importiert"));
  }

  function alsNeuenCharakterImportieren(importDaten) {
    const idZuBehalten = importiereBenutzerEffekte(importDaten.benutzerEffekte);

    const charakter = normalisiereCharakter({
      ...sichereKopie(importDaten.charakter),
      id: neueCharakterId()
    });

    charaktere.push(charakter);
    aktiverCharakterId = charakter.id;
    speichereImportStatus(charakter.id, importDaten.effektStatus);
    speichereImportFavoriten(
      charakter.id,
      mappeImportFavoriten(importDaten.favoriten, idZuBehalten)
    );
    aktualisiereNachImport();
    alert(`„${charakter.name}“ wurde als neuer Charakter importiert.`);
  }

  function aktivenCharakterUeberschreiben(importDaten) {
    const ziel = aktiverCharakter();
    if (!ziel) {
      alert("Es ist kein aktiver Charakter zum Überschreiben vorhanden.");
      return;
    }

    const idZuBehalten = importiereBenutzerEffekte(importDaten.benutzerEffekte);

    const index = charaktere.findIndex(charakter => charakter.id === ziel.id);
    if (index < 0) return;

    const importiert = normalisiereCharakter({
      ...sichereKopie(importDaten.charakter),
      id: ziel.id
    });

    charaktere[index] = importiert;
    speichereImportStatus(ziel.id, importDaten.effektStatus);
    speichereImportFavoriten(
      ziel.id,
      mappeImportFavoriten(importDaten.favoriten, idZuBehalten)
    );
    aktualisiereNachImport();
    alert(`Der aktive Charakter wurde durch „${importiert.name}“ ersetzt.`);
  }

  function erstelleImportDialog() {
    if (document.getElementById("charakterImportDialog")) {
      return document.getElementById("charakterImportDialog");
    }

    const dialog = document.createElement("dialog");
    dialog.id = "charakterImportDialog";
    dialog.className = "charakter-import-dialog";
    dialog.innerHTML = `
      <form method="dialog">
        <h3>Charakter importieren</h3>
        <p id="charakterImportHinweis"></p>
        <div class="dialog-aktionen charakter-import-aktionen">
          <button type="button" id="btnImportNeu">Als neuen Charakter anlegen</button>
          <button type="button" id="btnImportUeberschreiben">Aktiven Charakter überschreiben</button>
          <button type="button" id="btnImportAbbrechen">Abbrechen</button>
        </div>
      </form>
    `;
    document.body.appendChild(dialog);
    return dialog;
  }

  function frageImportZiel(importDaten) {
    const dialog = erstelleImportDialog();
    const importName = importDaten.charakter.name.trim();
    const aktivName = aktiverCharakter()?.name || "Kein Charakter";

    dialog.querySelector("#charakterImportHinweis").textContent =
      `Import: „${importName}“. Der aktuell aktive Charakter ist „${aktivName}“.`;

    dialog.querySelector("#btnImportNeu").onclick = () => {
      dialog.close();
      alsNeuenCharakterImportieren(importDaten);
    };

    dialog.querySelector("#btnImportUeberschreiben").onclick = () => {
      const bestaetigt = confirm(
        `„${aktivName}“ wirklich vollständig durch „${importName}“ ersetzen?`
      );
      if (!bestaetigt) return;
      dialog.close();
      aktivenCharakterUeberschreiben(importDaten);
    };

    dialog.querySelector("#btnImportAbbrechen").onclick = () => dialog.close();
    dialog.showModal();
  }

  async function liesImportDatei(datei) {
    if (!datei) return;
    try {
      if (datei.size > 2 * 1024 * 1024) {
        throw new Error("Die Datei ist größer als 2 MB.");
      }
      const text = await datei.text();
      const daten = validiereImport(JSON.parse(text));
      frageImportZiel(daten);
    } catch (fehler) {
      console.error("Charakterimport fehlgeschlagen:", fehler);
      alert(`Import fehlgeschlagen: ${fehler.message || "Unbekannter Fehler"}`);
    }
  }

  function initialisiereCommit22() {
    const wurdeBereinigt = bereinigeDoppelteBenutzerEffekte();
    if (wurdeBereinigt && typeof ladeEffekte === "function") {
      ladeEffekte();
    }

    const seitenkopf = document.querySelector("#charaktere .seitenkopf");
    const neuerCharakter = document.getElementById("btnNeuerCharakter");
    if (!seitenkopf || !neuerCharakter || document.getElementById("btnCharakterExport")) return;

    const aktionen = document.createElement("div");
    aktionen.className = "charakter-datei-aktionen";

    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.id = "btnCharakterExport";
    exportButton.textContent = "Exportieren";
    exportButton.addEventListener("click", exportiereAktivenCharakter);

    const importButton = document.createElement("button");
    importButton.type = "button";
    importButton.id = "btnCharakterImport";
    importButton.textContent = "Importieren";

    const dateiFeld = document.createElement("input");
    dateiFeld.type = "file";
    dateiFeld.id = "charakterImportDatei";
    dateiFeld.accept = ".json,application/json";
    dateiFeld.hidden = true;
    dateiFeld.addEventListener("change", async () => {
      const datei = dateiFeld.files?.[0];
      dateiFeld.value = "";
      await liesImportDatei(datei);
    });

    importButton.addEventListener("click", () => dateiFeld.click());

    aktionen.append(exportButton, importButton, neuerCharakter, dateiFeld);
    seitenkopf.appendChild(aktionen);
    erstelleImportDialog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit22, { once: true });
  } else {
    initialisiereCommit22();
  }
})();
