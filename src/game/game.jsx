import { useState, useEffect } from "react";
import "../App.css";


function Game() {
  const [AllWords, setAllWords] = useState([]);
  const [WordToDescribe, setWordToDescribe] = useState(null);

  useEffect(() => {
    const getWords = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/words");
        const data = await res.json();
        setAllWords(data);
        if (data.length > 0) {
          setWordToDescribe(data[Math.floor(Math.random() * data.length)]);
        }
      } catch (err) {
        console.error("Fout bij ophalen van woorden:", err);
      }
    };
    getWords();
  }, []);

  const CheckIfCorrect = (e) => {
    e.preventDefault();

    if (!Array.isArray(WordToDescribe.description)) {
      alert("Beschrijving is niet beschikbaar");
      return;
    }

    const guess = e.target.chosenWord.value.toLowerCase();
    const descriptions = WordToDescribe.description.map((d) => d.toLowerCase());

    if (descriptions.includes(guess)) {
      alert("Goed!");
      const nextWord = AllWords[Math.floor(Math.random() * AllWords.length)];
      setWordToDescribe(nextWord);
    } else {
      alert("Helaas, probeer nog eens!");
      console.log("Foute gok:", guess);
      console.log("Beschrijvingen:", descriptions);
    }

    e.target.chosenWord.value = "";
  };

  if (!WordToDescribe) return <p>Laden...</p>;

  return (
    <div id="GameContainer">
      <div id="WordContainer">
        <p id="WordToDescribe">{WordToDescribe.word}</p>
      </div>
      <form onSubmit={CheckIfCorrect}>
        <input
          type="text"
          name="chosenWord"
          id="WordInput"
          autoComplete="off"
        />
        <button type="submit">Guess</button>
      </form>
    </div>
  );
}

export default Game;
