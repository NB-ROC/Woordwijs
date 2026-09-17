// words.jsx — woorden toevoegen, bewerken en verwijderen (voorheen admin.jsx)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWords,
  addWord,
  deleteWord,
  updateWord,
} from "../services/wordService";

function Words() {
  const [allWords, setAllWords] = useState([]);
  const [editedWords, setEditedWords] = useState({});
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [descriptionCount, setDescriptionCount] = useState(1);

  // Woorden ophalen
  const loadWords = async () => {
    const data = await getWords();
    setAllWords(data);
  };

  useEffect(() => {
    loadWords();
  }, []);

  // Nieuw woord toevoegen
  const addItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const word = form.Word.value.trim();
    const descriptions = Array.from(form.elements)
      .filter((el) => el.name.includes("description") && el.value.trim() !== "")
      .map((el) => el.value.trim());

    if (!word || descriptions.length === 0) return;

    await addWord(word, descriptions); // Voeg toe via service
    form.reset();
    setDescriptionCount(1);
    loadWords();
  };

  // Woord verwijderen
  const deleteItemHandler = async (id) => {
    await deleteWord(id);
    loadWords();
  };

  // Woord updaten
  const updateItemHandler = async (id) => {
    const original = allWords.find((w) => w.id === id);
    const newWord = editedWords[id] ?? original.word;
    const newDescriptions = editedDescriptions[id] ?? original.descriptions;

    await updateWord(id, { word: newWord, descriptions: newDescriptions });
    alert("Woord bijgewerkt!");
    loadWords();
  };

  return (
    <main className="pagina">
      <div className="admin__balk" style={{ width: "min(740px, 100%)" }}>
        <Link to="/admin" className="link-knop">← Terug naar admin</Link>
      </div>

      <h1 className="pagina-titel">Nieuw woord toevoegen</h1>

      <form className="kaart invoerkaart" onSubmit={addItem}>
        <label className="invoerkaart__kop" htmlFor="nieuwWoord">Woord</label>
        <input id="nieuwWoord" type="text" name="Word" autoComplete="off" />

        <label className="invoerkaart__kop">Beschrijvingen</label>
        {[...Array(descriptionCount)].map((_, i) => (
          <input
            key={i}
            name={`description${i}`}
            placeholder={`Beschrijving ${i + 1}`}
            autoComplete="off"
          />
        ))}

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", padding: "1rem" }}>
          <button
            type="button"
            className="knop knop--licht"
            onClick={() => setDescriptionCount((n) => n + 1)}
          >
            + Beschrijving
          </button>
          <button type="submit" className="knop">Voeg woord toe</button>
        </div>
      </form>

      <h2 className="pagina-titel">Bestaande woorden</h2>

      {allWords.map((w) => (
        <div key={w.id} className="kaart invoerkaart">
          <input
            type="text"
            aria-label="Woord"
            value={editedWords[w.id] ?? w.word}
            onChange={(e) =>
              setEditedWords({ ...editedWords, [w.id]: e.target.value })
            }
            className="invoerkaart__kop"
          />

          {(w.descriptions || []).map((desc, i) => (
            <input
              key={i}
              type="text"
              aria-label={`Beschrijving ${i + 1}`}
              value={editedDescriptions[w.id]?.[i] ?? desc}
              onChange={(e) => {
                const newDesc = [
                  ...(editedDescriptions[w.id] || w.descriptions),
                ];
                newDesc[i] = e.target.value;
                setEditedDescriptions({
                  ...editedDescriptions,
                  [w.id]: newDesc,
                });
              }}
            />
          ))}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", padding: "1rem" }}>
            <button className="knop" onClick={() => updateItemHandler(w.id)}>Update</button>
            <button className="knop knop--licht" onClick={() => deleteItemHandler(w.id)}>
              Verwijder
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}

export default Words;
