#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const appPath = path.resolve(process.cwd(), "js/app.js");

if (!fs.existsSync(appPath)) {
  console.error("Fehler: js/app.js wurde nicht gefunden. Starte das Skript im Hauptordner des Repositories.");
  process.exit(1);
}

let source = fs.readFileSync(appPath, "utf8");
const original = source;

source = source.replace("// Version 0.16.0", "// Version 0.16.1");

const oldNormalizer = `function normalisiereBonus(bonus={}){
 const wert=Number(bonus.wert);
 return {
   ziel:typeof bonus.ziel==="string"?bonus.ziel:"",
   bonusart:typeof bonus.bonusart==="string"?bonus.bonusart:"",
   wert:Number.isFinite(wert)?wert:0
 };
}`;

const newNormalizer = `function normalisiereBonusart(bonusart){
 const wert=String(bonusart||"").trim();
 const alteBezeichnungen={
   Unbekannt:"Namenlos",
   Unbenannt:"Namenlos",
   Umstand:"Situation"
 };
 return alteBezeichnungen[wert]||wert;
}

function normalisiereBonus(bonus={}){
 const wert=Number(bonus.wert);
 return {
   ziel:typeof bonus.ziel==="string"?bonus.ziel:"",
   bonusart:normalisiereBonusart(bonus.bonusart),
   wert:Number.isFinite(wert)?wert:0
 };
}`;

if (!source.includes(oldNormalizer)) {
  console.error("Fehler: Die erwartete Funktion normalisiereBonus() wurde nicht gefunden. Hotfix nicht angewendet.");
  process.exit(1);
}
source = source.replace(oldNormalizer, newNormalizer);

const oldTypes = `const PF_BONUSARTEN=[
 "Unbenannt",
 "Ablenkung",
 "Alchemistisch",
 "Ausweich",
 "Erkenntnis",
 "Heilig",
 "Kompetenz",
 "Moral",
 "Natürlich",
 "Profan",
 "Resistenz",
 "Rüstung",
 "Schild",
 "Umstand",
 "Verbesserung"
];`;

const newTypes = `const PF_BONUSARTEN=[
 "Namenlos",
 "Ablenkung",
 "Alchemistisch",
 "Ausweich",
 "Erkenntnis",
 "Glück",
 "Heilig",
 "Kompetenz",
 "Moral",
 "Natürlich",
 "Profan",
 "Resistenz",
 "Rüstung",
 "Schild",
 "Situation",
 "Verbesserung"
];`;

if (!source.includes(oldTypes)) {
  console.error("Fehler: Die erwartete Liste PF_BONUSARTEN wurde nicht gefunden. Hotfix nicht angewendet.");
  process.exit(1);
}
source = source.replace(oldTypes, newTypes);

if (source === original) {
  console.error("Keine Änderungen vorgenommen.");
  process.exit(1);
}

fs.writeFileSync(appPath, source, "utf8");
console.log("Hotfix erfolgreich auf js/app.js angewendet.");
