function speichern() {
    localStorage.setItem("pathfinder", JSON.stringify(boni));
}

function laden() {
    const daten = localStorage.getItem("pathfinder");
    if (daten) {
        boni = JSON.parse(daten);
    }
}
