// Commit 23: Festes Admin-Passwort
(() => {
  "use strict";

  const FESTES_ADMIN_PASSWORT = "7536";
  const ALTER_PIN_SPEICHERSCHLUESSEL = "pf-admin-pin-hash";

  function bereinigeAltePinDaten() {
    localStorage.removeItem(ALTER_PIN_SPEICHERSCHLUESSEL);
  }

  function oeffneFestesAdminPasswortDialog() {
    const dialog = document.getElementById("adminPinDialog");
    const titel = document.getElementById("adminPinTitel");
    const hinweis = document.getElementById("adminPinHinweis");
    const passwort = document.getElementById("adminPin");
    const bestaetigung = document.getElementById("adminPinBestaetigen");
    const bestaetigungLabel = document.getElementById("adminPinBestaetigenLabel");
    const fehler = document.getElementById("adminPinFehler");

    document.getElementById("adminPinForm")?.reset();

    if (titel) titel.textContent = "Admin-Modus öffnen";
    if (hinweis) hinweis.textContent = "Bitte Admin-Passwort eingeben.";
    if (passwort) {
      passwort.setAttribute("aria-label", "Admin-Passwort");
      passwort.setAttribute("autocomplete", "current-password");
    }
    if (bestaetigung) {
      bestaetigung.hidden = true;
      bestaetigung.required = false;
    }
    if (bestaetigungLabel) bestaetigungLabel.hidden = true;
    if (fehler) fehler.textContent = "";

    dialog?.showModal();
    setTimeout(() => passwort?.focus(), 0);
  }

  function verarbeiteFestesAdminPasswort(event) {
    event.preventDefault();

    const fehler = document.getElementById("adminPinFehler");
    const passwort = document.getElementById("adminPin")?.value || "";
    const restzeit = adminGesperrtBis - Date.now();

    if (restzeit > 0) {
      if (fehler) {
        fehler.textContent =
          `Zu viele Fehlversuche. Bitte in ${Math.ceil(restzeit / 1000)} Sekunden erneut versuchen.`;
      }
      return;
    }

    if (passwort === FESTES_ADMIN_PASSWORT) {
      adminFehlversuche = 0;
      entsperreAdminModus();
      document.getElementById("adminPinDialog")?.close();
      return;
    }

    adminFehlversuche += 1;

    if (adminFehlversuche >= ADMIN_MAX_FEHLVERSUCHE) {
      adminGesperrtBis = Date.now() + ADMIN_SPERRE_MS;
      adminFehlversuche = 0;
      if (fehler) {
        fehler.textContent =
          `Zu viele Fehlversuche. Bitte in ${Math.ceil(ADMIN_SPERRE_MS / 1000)} Sekunden erneut versuchen.`;
      }
      return;
    }

    if (fehler) {
      const verbleibend = ADMIN_MAX_FEHLVERSUCHE - adminFehlversuche;
      fehler.textContent =
        `Falsches Passwort. Noch ${verbleibend} ${verbleibend === 1 ? "Versuch" : "Versuche"}.`;
    }
  }

  function ersetzeBestehendeAdminListener() {
    const alterButton = document.getElementById("btnAdminEntsperren");
    if (alterButton) {
      const neuerButton = alterButton.cloneNode(true);
      alterButton.replaceWith(neuerButton);
      neuerButton.addEventListener("click", oeffneFestesAdminPasswortDialog);
    }

    const altesFormular = document.getElementById("adminPinForm");
    if (altesFormular) {
      const neuesFormular = altesFormular.cloneNode(true);
      altesFormular.replaceWith(neuesFormular);
      neuesFormular.addEventListener("submit", verarbeiteFestesAdminPasswort);

      document
        .getElementById("btnAdminPinAbbrechen")
        ?.addEventListener("click", () =>
          document.getElementById("adminPinDialog")?.close()
        );
    }
  }

  function aktualisiereAdminTexte() {
    const hinweis = document.querySelector("#adminGesperrt p");
    if (hinweis) {
      hinweis.textContent =
        "Der Admin-Bereich ist durch ein festes vierstelliges Passwort geschützt.";
    }

    const passwortLabel = document.querySelector('label[for="adminPin"]');
    if (passwortLabel) passwortLabel.textContent = "Passwort";
  }

  function initialisiereCommit23() {
    bereinigeAltePinDaten();
    aktualisiereAdminTexte();
    ersetzeBestehendeAdminListener();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereCommit23, {
      once: true
    });
  } else {
    initialisiereCommit23();
  }
})();
