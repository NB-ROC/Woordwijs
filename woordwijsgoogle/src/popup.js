console.log("🔥 popup.js geladen");

// --- VIEW ELEMENTS ---
const loginView = document.getElementById("loginView");
const quizView = document.getElementById("quizView");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const coinsElement = document.getElementById("coins");
const wordElement = document.getElementById("word");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const submitButton = document.getElementById("submit");
const logoutBtn = document.getElementById("logoutBtn");

let words = [];
let coins = 0;
let currentIndex = 0;

// --- LOGIN ---
document.getElementById("loginBtn").onclick = () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  chrome.runtime.sendMessage({ action: "login", email, password }, (response) => {
    if (response.success) {
      loginView.hidden = true;
      quizView.hidden = false;
      loadWords();
      loadCoins(response.uid);
    } else {
      loginError.textContent = response.error;
    }
  });
};

// --- REGISTER ---
document.getElementById("registerBtn").onclick = () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  chrome.runtime.sendMessage({ action: "register", email, password }, (response) => {
    if (response.success) {
      loginView.hidden = true;
      quizView.hidden = false;
      loadWords();
      loadCoins(response.uid);
    } else {
      loginError.textContent = response.error;
    }
  });
};

// --- LOGOUT ---
logoutBtn.onclick = () => {
  chrome.runtime.sendMessage({ action: "logout" }, (response) => {
    if (response.success) {
      loginView.hidden = false;
      quizView.hidden = true;
    }
  });
};

// --- WORDS ---
async function loadWords() {
  // hier kun je Firestore woorden ophalen via message of fetch
  words = [
    { word: "appel", meaning: "fruit" },
    { word: "boek", meaning: "lezen" }
  ];
  showWord();
}

function showWord() {
  if (!words.length) { wordElement.textContent = "Geen woorden gevonden"; return; }
  currentIndex = Math.floor(Math.random() * words.length);
  wordElement.textContent = words[currentIndex].word;
  answerInput.value = "";
  feedback.textContent = "";
}

// --- COINS (simulatie) ---
async function loadCoins(uid) {
  coins = 0; // placeholder, je kan Firestore ophalen via message
  coinsElement.textContent = coins;
}

// --- QUIZ SUBMIT ---
submitButton.onclick = () => {
  const answer = answerInput.value.trim().toLowerCase();
  const correct = words[currentIndex].meaning.toLowerCase();
  if (answer === correct) {
    coins += 10;
    coinsElement.textContent = coins;
    feedback.textContent = "Goed!";
    setTimeout(showWord, 800);
  } else {
    feedback.textContent = "Fout!";
  }
};
