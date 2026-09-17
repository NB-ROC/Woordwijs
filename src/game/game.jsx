import { useState, useEffect } from "react";
import {
  getWords,
  addCoins,
  saveAnswer,
  checkAnswer,
} from "../services/wordService";

function Game() {
  const [allWords, setAllWords] = useState([]);
  const [WordToDescribe, setWordToDescribe] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [bezig, setBezig] = useState(false);
  const [geladen, setGeladen] = useState(false);

  // Woorden ophalen
  useEffect(() => {
    const fetchData = async () => {
      const wordsData = await getWords();
      setAllWords(wordsData);
      if (wordsData.length > 0)
        setWordToDescribe(
          wordsData[Math.floor(Math.random() * wordsData.length)]
        );
      setGeladen(true);
    };
    fetchData();
  }, []);

  // Kies volgend woord (niet hetzelfde woord twee keer achter elkaar)
  const nextWord = () => {
    if (allWords.length === 0) return;
    let word = allWords[Math.floor(Math.random() * allWords.length)];
    if (allWords.length > 1) {
      while (word.id === WordToDescribe?.id) {
        word = allWords[Math.floor(Math.random() * allWords.length)];
      }
    }
    setWordToDescribe(word);
  };

  // Check het antwoord en sla op. Je hebt één poging per woord;
  // daarna wordt het juiste antwoord getoond en komt het volgende woord.
  const CheckIfCorrect = async (e) => {
    e.preventDefault();
    if (!WordToDescribe || bezig || answer.trim() === "") return;

    setBezig(true);
    const isCorrect = checkAnswer(WordToDescribe, answer);

    // Sla antwoord op in Firebase (werkt ook de streak bij)
    await saveAnswer(WordToDescribe.word, answer.trim(), isCorrect);
    if (isCorrect) await addCoins(10);

    // Toon feedback met het juiste antwoord van het huidige woord
    setFeedback({
      correct: isCorrect,
      word: WordToDescribe.word,
      answers: WordToDescribe.descriptions,
    });

    // Altijd door naar het volgende woord
    nextWord();
    setAnswer("");
    setBezig(false);
  };

  // Enter = versturen, Shift+Enter = nieuwe regel
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) CheckIfCorrect(e);
  };

  return (
    <main className="pagina">
      <h1 className="pagina-titel">Leg het volgende woord uit:</h1>

      <div className="kaart woordkaart">
        {WordToDescribe
          ? WordToDescribe.word
          : geladen ? "Geen woorden gevonden" : "Laden..."}
      </div>

      <form className="kaart invoerkaart" onSubmit={CheckIfCorrect}>
        <label className="invoerkaart__kop" htmlFor="beschrijving">
          type uw woord beschrijving
        </label>
        <textarea
          id="beschrijving"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
        />
      </form>

      <button
        type="button"
        className="knop"
        onClick={CheckIfCorrect}
        disabled={bezig || !WordToDescribe || answer.trim() === ""}
      >
        Verstuur
      </button>

      {feedback && (
        <p className={`feedback ${feedback.correct ? "feedback--goed" : "feedback--fout"}`}>
          {feedback.correct ? "Goed!" : "Helaas!"} Het woord{" "}
          <strong>{feedback.word}</strong> betekent:{" "}
          {feedback.answers.join(", ")}
        </p>
      )}
    </main>
  );
}

export default Game;
