// Commit 41.5: stabile Wisch-Navigation in sichtbarer Menü-Reihenfolge
(() => {
  "use strict";

  // Commit 21 ordnet die Menübuttons genau in dieser sichtbaren Reihenfolge an.
  const REIHENFOLGE = [
    { seite: "charaktere", button: "btnCharaktere" },
    { seite: "charakterwerte", button: "btnCharakterwerte" },
    { seite: "leben", button: "btnLeben" },
    { seite: "effekte", button: "btnEffekte" },
    { seite: "dashboard", button: "btnDashboard" },
    { seite: "admin", button: "btnAdmin" }
  ];

  const MIN_DISTANZ = 70;
  const MAX_DAUER = 900;
  const HORIZONTAL_FAKTOR = 1.4;

  let startX = 0;
  let startY = 0;
  let startZeit = 0;
  let startIndex = -1;
  let gestureAktiv = false;

  function istSichtbar(element) {
    if (!element) return false;
    const stil = getComputedStyle(element);
    return stil.display !== "none" && stil.visibility !== "hidden";
  }

  function aktuellerIndex() {
    // Nicht "seiten" aus app.js benutzen: Kampf und Leben werden von
    // späteren Commit-Dateien ergänzt und fehlen dort.
    return REIHENFOLGE.findIndex(eintrag =>
      istSichtbar(document.getElementById(eintrag.seite))
    );
  }

  function istBedienbereich(element) {
    return !!element?.closest?.(
      "input, textarea, select, option, button, a, label, dialog, " +
      "[contenteditable='true'], .bonus-klickbar, .angriff-karte"
    );
  }

  function hatHorizontalenScroll(element) {
    let aktuell = element;
    while (aktuell && aktuell !== document.body) {
      const stil = getComputedStyle(aktuell);
      if (
        ["auto","scroll"].includes(stil.overflowX) &&
        aktuell.scrollWidth > aktuell.clientWidth + 4
      ) return true;
      aktuell = aktuell.parentElement;
    }
    return false;
  }

  function wechsleZu(index) {
    if (index < 0 || index >= REIHENFOLGE.length) return;
    const eintrag = REIHENFOLGE[index];
    const button = document.getElementById(eintrag.button);

    // Genau denselben Handler wie bei einem echten Klick auf den Menübutton verwenden.
    if (button) {
      button.click();
    } else if (typeof zeigeSeite === "function") {
      zeigeSeite(eintrag.seite);
    }
  }

  function initialisiere() {
    const main = document.querySelector("main");
    if (!main || main.dataset.swipe415) return;
    main.dataset.swipe415 = "1";

    main.addEventListener("touchstart", event => {
      gestureAktiv = false;
      startIndex = -1;

      if (event.touches.length !== 1) return;
      const ziel = event.target;
      if (istBedienbereich(ziel) || hatHorizontalenScroll(ziel)) return;

      const index = aktuellerIndex();
      if (index < 0) return;

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startZeit = Date.now();
      startIndex = index;
      gestureAktiv = true;
    }, { passive: true });

    main.addEventListener("touchcancel", () => {
      gestureAktiv = false;
      startIndex = -1;
    }, { passive: true });

    main.addEventListener("touchend", event => {
      if (!gestureAktiv || startIndex < 0 || event.changedTouches.length !== 1) {
        gestureAktiv = false;
        return;
      }

      gestureAktiv = false;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dauer = Date.now() - startZeit;

      if (dauer > MAX_DAUER) return;
      if (Math.abs(dx) < MIN_DISTANZ) return;
      if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_FAKTOR) return;

      // Finger nach links -> nächster Button rechts in der sichtbaren Menüleiste.
      // Finger nach rechts -> vorheriger Button links in der sichtbaren Menüleiste.
      const zielIndex = dx < 0 ? startIndex + 1 : startIndex - 1;
      wechsleZu(zielIndex);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiere, { once: true });
  } else {
    initialisiere();
  }
})();
