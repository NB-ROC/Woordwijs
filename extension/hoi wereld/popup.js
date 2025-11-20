const words = [
  {word: "1", meaning: "1"},
  {word: "2", meaning: "2"},
  {word: "3", meaning: "3"},
  {word: "4", meaning: "4"},
  {word: "5", meaning: "5"},
  {word: "6", meaning: "6"},
  {word: "7", meaning: "7"},
  {word: "8", meaning: "8"},
  {word: "9", meaning: "9"},
  {word: "10", meaning: "10"},
];

let coins = 0;
let currentIndex = 0;

const wordElement = document.getElementById("word");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const coinsElement = document.getElementById("coins");
const submitButton = document.getElementById("submit");
const nextButton = document.getElementById("next");

// 🔹 Load coins from localStorage (if available)
function loadCoins() {
  const savedCoins = localStorage.getItem("coins");
  if (savedCoins !== null) {
    coins = parseInt(savedCoins, 10);
    coinsElement.textContent = coins;
  }
}

// 🔹 Save coins to localStorage
function saveCoins() {
  localStorage.setItem("coins", coins);
}

function showWord() {
  currentIndex = Math.floor(Math.random() * words.length);
  wordElement.textContent = words[currentIndex].word;
  answerInput.value = "";
  feedback.textContent = "";
  submitButton.style.display = "inline-block";
  nextButton.style.display = "none";
}

submitButton.addEventListener("click", () => {
  const answer = answerInput.value.trim().toLowerCase();
  const correct = words[currentIndex].meaning.toLowerCase();

  if (answer === correct) {
    coins += 10;
    coinsElement.textContent = coins;
    feedback.textContent = "Goed gedaan! +10 munten";
    saveCoins(); // ✅ Save progress when coins change
  } else {
    feedback.textContent = `Fout! Correct: ${words[currentIndex].meaning}`;
  }

  submitButton.style.display = "none";
  nextButton.style.display = "inline-block";
});

nextButton.addEventListener("click", showWord);

// 🔹 Initialize game
loadCoins();
showWord();
