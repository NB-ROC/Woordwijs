import { useState, useEffect } from "react";
import "../App.css";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

function Game() {
  const [AllWords, setAllWords] = useState([]);
  const [WordToDescribe, setWordToDescribe] = useState(null);

  useEffect(() => {
    const getWords = async () => {
      try {
        // Firestore collection ophalen
        const snapshot = await getDocs(collection(db, "Words"));

        const words = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllWords(words);

        if (words.length > 0) {
          const random = words[Math.floor(Math.random() * words.length)];
          setWordToDescribe(random);
        }
      } catch (err) {
        console.error("Fout bij ophalen van woorden uit Firestore:", err);
      }
    };

    getWords();
  }, []);

  const CheckIfCorrect = (e) => {
    e.preventDefault();
    if (!WordToDescribe) return;

    const guess = e.target.chosenWord.value.toLowerCase();
    const descriptions = WordToDescribe.Descriptions.map((d) =>
      d.toLowerCase()
    );

    if (descriptions.includes(guess)) {
      alert("Goed!");

      const nextWord =
        AllWords[Math.floor(Math.random() * AllWords.length)];

      setWordToDescribe(nextWord);
    } else {
      alert("Helaas, probeer opnieuw!");
    }

    e.target.chosenWord.value = "";
  };

  if (!WordToDescribe) return <p>Laden...</p>;

  return (
    <div id="GameContainer">
      <div id="WordContainer">
        <p id="WordToDescribe">{WordToDescribe.Word}</p>
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
