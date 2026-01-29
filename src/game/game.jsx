import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getWords,
  addCoins,
  getCoins,
  saveAnswer,
  getHistory,
} from "../services/wordService";
import { auth } from "../firebase";
import "../App.css";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import logo from "../img/roc-nijmegen-logo-2024.jpg";

function Game() {
  const [allWords, setAllWords] = useState([]);
  const [WordToDescribe, setWordToDescribe] = useState(null);
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // Check of de user is ingelogd
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login"); // redirect naar login als niet ingelogd
    }
  }, [navigate]);

  // Woorden ophalen, coins en geschiedenis
  useEffect(() => {
    const fetchData = async () => {
      const wordsData = await getWords();
      setAllWords(wordsData);
      if (wordsData.length > 0)
        setWordToDescribe(wordsData[Math.floor(Math.random() * wordsData.length)]);
      const currentCoins = await getCoins();
      setCoins(currentCoins);

      const historyData = await getHistory();
      setHistory(historyData);
    };
    fetchData();
  }, []);

  // Kies volgend woord
  const nextWord = () => {
    if (allWords.length === 0) return;
    const word = allWords[Math.floor(Math.random() * allWords.length)];
    setWordToDescribe(word);
  };

  // Check het antwoord en sla op
  const CheckIfCorrect = async (e) => {
    e.preventDefault();
    if (!WordToDescribe || !Array.isArray(WordToDescribe.Descriptions)) return;

    const guess = e.target.chosenWord.value.trim().toLowerCase();
    const descriptions = WordToDescribe.Descriptions.map((d) => d.toLowerCase());
    const isCorrect = descriptions.includes(guess);

    // Sla antwoord op in Firebase
    await saveAnswer(WordToDescribe.Word, guess, isCorrect);

    // Update geschiedenis
    const historyData = await getHistory();
    setHistory(historyData);

    if (isCorrect) {
      alert("Goed!");
      await addCoins(10); // 10 coins toevoegen
      const updatedCoins = await getCoins();
      setCoins(updatedCoins);
      nextWord();
    } else {
      alert("Helaas, probeer nog eens!");
    }

    e.target.chosenWord.value = "";
  };

  if (!WordToDescribe) return <p>Laden...</p>;

  return (
      <>
    <div id="Header">
        <img src={logo} alt="ROC Nijmegen logo" />
    </div>
    <div id="GameContainer">
      <div id="WordContainer">
        <p id="WordToDescribe">{WordToDescribe.Word}</p>
      </div>
      <p>Coins: {coins}</p>

      <form onSubmit={CheckIfCorrect}>
        <input
          type="text"
          name="chosenWord"
          id="WordInput"
          autoComplete="off"
        />
        <button type="submit">Guess</button>
      </form>

      <h2>Jouw antwoorden</h2>
      {history.length === 0 ? (
        <p>Je hebt nog geen woorden geraden.</p>
      ) : (
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              <strong>{item.word}</strong> — {item.answer}{" "}
              {item.correct ? "✅" : "❌"}
            </li>
          ))}
        </ul>
      )}
    </div>
      </>
  );
}

export default Game;
