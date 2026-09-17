// oefening.js — het oefenvenster.
//
// Zelfde spel als op de website (src/game/game.jsx): een woord uit Firestore
// tonen, één poging om het uit te leggen, daarna het juiste antwoord tonen en
// automatisch door naar het volgende woord. Antwoorden, coins en streak lopen
// via dezelfde services als de website, dus alles is gedeeld met je
// Woordwijs-account en zichtbaar op de admin-pagina.
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../src/firebase.js";
import {
  getWords,
  addCoins,
  saveAnswer,
  checkAnswer,
  saveUserProfile,
} from "../../src/services/wordService.js";
import logo from "../../src/img/roc-nijmegen-logo-2024.jpg";

const $ = (id) => document.getElementById(id);
$("logo").src = logo;

let allWords = [];
let huidigWoord = null;
let bezig = false;

function toonWoord() {
  $("woord").textContent = huidigWoord.word;
  $("antwoord").value = "";
  $("antwoord").focus();
}

// Kies volgend woord (niet hetzelfde woord twee keer achter elkaar)
function volgendWoord() {
  if (allWords.length === 0) return;
  let woord = allWords[Math.floor(Math.random() * allWords.length)];
  if (allWords.length > 1) {
    while (woord.id === huidigWoord?.id) {
      woord = allWords[Math.floor(Math.random() * allWords.length)];
    }
  }
  huidigWoord = woord;
  toonWoord();
}

async function initOefening() {
  allWords = await getWords();
  if (!allWords.length) {
    $("woord").textContent = "Geen woorden gevonden";
    return;
  }
  volgendWoord();
}

async function verstuur() {
  const antwoord = $("antwoord").value.trim();
  if (!huidigWoord || bezig || antwoord === "") return;

  bezig = true;
  $("verstuur").disabled = true;
  const isJuist = checkAnswer(huidigWoord, antwoord);

  // Sla antwoord op in Firebase (zelfde geschiedenis en streak als de website)
  await saveAnswer(huidigWoord.word, antwoord, isJuist);
  if (isJuist) await addCoins(10);

  const feedback = $("feedback");
  feedback.className = `feedback ${isJuist ? "feedback--goed" : "feedback--fout"}`;
  feedback.textContent = `${isJuist ? "Goed!" : "Helaas!"} Het woord "${
    huidigWoord.word
  }" betekent: ${huidigWoord.descriptions.join(", ")}`;

  // Altijd door naar het volgende woord
  volgendWoord();
  bezig = false;
  $("verstuur").disabled = false;
}

$("invoer").addEventListener("submit", (e) => {
  e.preventDefault();
  verstuur();
});

// Enter = versturen, Shift+Enter = nieuwe regel
$("antwoord").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    verstuur();
  }
});

$("sluiten").addEventListener("click", async () => {
  try {
    const venster = await chrome.windows.getCurrent();
    await chrome.windows.remove(venster.id);
  } catch {
    window.close();
  }
});

onAuthStateChanged(auth, (user) => {
  const ingelogd = Boolean(user);
  $("uitgelogd").hidden = ingelogd;
  $("invoer").hidden = !ingelogd;
  $("verstuur").hidden = !ingelogd;

  if (ingelogd) {
    saveUserProfile(user);
    initOefening();
  } else {
    $("woord").textContent = "—";
  }
});
