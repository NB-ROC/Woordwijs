// popup.js — menu onder het werkbalkpictogram.
//
// Gebruikt dezelfde Firebase-auth en dezelfde services als de website, zodat
// login, coins en geschiedenis altijd gelijk zijn aan woordwijs.nl.
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../src/firebase.js";
import {
  getCoins,
  getHistory,
  getStreak,
  saveUserProfile,
} from "../../src/services/wordService.js";
import logo from "../../src/img/roc-nijmegen-logo-2024.jpg";

const $ = (id) => document.getElementById(id);
$("logo").src = logo;
const loginView = $("loginView");
const menuView = $("menuView");

async function stuur(bericht) {
  try {
    return await chrome.runtime.sendMessage(bericht);
  } catch {
    return { ok: false };
  }
}

function toonGeschiedenis(history) {
  const lijst = $("lijst");
  lijst.replaceChildren();
  const recent = history.slice(0, 5);

  if (!recent.length) {
    const li = document.createElement("li");
    li.className = "leeg";
    li.textContent = "Nog geen woorden geoefend.";
    lijst.appendChild(li);
    return;
  }

  for (const item of recent) {
    const li = document.createElement("li");
    const b = document.createElement("strong");
    b.textContent = item.word;
    li.appendChild(b);
    li.appendChild(
      document.createTextNode(` — ${item.answer}`)
    );
    lijst.appendChild(li);
  }
}

async function toonMenu() {
  loginView.hidden = true;
  menuView.hidden = false;

  const [coins, streak, history, opgeslagen] = await Promise.all([
    getCoins(),
    getStreak(),
    getHistory(),
    chrome.storage.local.get("intervalMinuten"),
  ]);

  $("coins").textContent = coins;
  $("streak").textContent = `${streak} ${streak === 1 ? "dag" : "dagen"}`;
  $("interval").value = String(opgeslagen.intervalMinuten ?? 10);
  toonGeschiedenis(history);
}

function toonLogin() {
  loginView.hidden = false;
  menuView.hidden = true;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    saveUserProfile(user);
    toonMenu();
  }
  else toonLogin();
});

async function inloggen() {
  $("loginFout").hidden = true;
  const email = $("email").value.trim();
  const password = $("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    $("loginFout").textContent = "Inloggen mislukt. Controleer je gegevens.";
    $("loginFout").hidden = false;
  }
}

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  inloggen();
});

$("oefenNu").addEventListener("click", async () => {
  await stuur({ type: "nu-oefenen" });
  window.close();
});

$("interval").addEventListener("change", async (e) => {
  await stuur({ type: "zet-interval", minuten: Number(e.target.value) });
});

$("uitlogBtn").addEventListener("click", async () => {
  await signOut(auth);
});
