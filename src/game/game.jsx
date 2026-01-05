import { useState, useEffect } from "react";
import { getWords, addCoins, getCoins } from "../services/wordService";
import "../App.css";

function Game() {
  const [allWords, setAllWords] = useState([]);
  const [WordToDescribe, setWordToDescribe] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const fetchWordsAndCoins = async () => {
      const data = await getWords();
      setAllWords(data);
      if (data.length > 0) setWordToDescribe(data[Math.floor(Math.random()*data.length)]);
      const currentCoins = await getCoins();
      setCoins(currentCoins);
    };
    fetchWordsAndCoins();
  }, []);

  const nextWord = () => {
    if (allWords.length === 0) return;
    const word = allWords[Math.floor(Math.random()*allWords.length)];
    setWordToDescribe(word);
  };

  const CheckIfCorrect = async (e) => {
    e.preventDefault();
    if (!WordToDescribe || !Array.isArray(WordToDescribe.Descriptions)) return;

    const guess = e.target.chosenWord.value.toLowerCase();
    const descriptions = WordToDescribe.Descriptions.map(d => d.toLowerCase());

    if (descriptions.includes(guess)) {
      alert("Goed!");
      await addCoins(10); // 10 coins toevoegen
      const updatedCoins = await getCoins();
      setCoins(updatedCoins);
      nextWord(); // volgend woord
    } else {
      alert("Helaas, probeer nog eens!");
    }

    e.target.chosenWord.value = "";
  };

  if (!WordToDescribe) return <p>Laden...</p>;

  return (
    <div id="GameContainer">
      <div id="WordContainer">
        <p id="WordToDescribe">{WordToDescribe.Word}</p>
      </div>
      <p>Coins: {coins}</p>
      <form onSubmit={CheckIfCorrect}>
        <input type="text" name="chosenWord" id="WordInput" autoComplete="off"/>
        <button type="submit">Guess</button>
      </form>
    </div>
  );
}

export default Game;
