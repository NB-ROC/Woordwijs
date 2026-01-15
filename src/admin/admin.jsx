// Admin.jsx
import { useState, useEffect } from "react";
import {
  getWords,
  addWord,
  deleteWord,
  updateWord,
} from "../services/wordService";
import "./admin.css";
import logo from "../img/roc-nijmegen-logo-2024.jpg";

function Admin() {
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

  // Aantal beschrijvingen aanpassen bij toevoegen nieuw woord
  const ChangeDescAmount = (e) => {
    e.preventDefault();
    setDescriptionCount(Number(e.target.DescAmount.value) || 1);
  };

  const renderNewWordDescriptions = () =>
    [...Array(descriptionCount)].map((_, i) => (
      <input
        key={i}
        name={`description${i}`}
        placeholder={`Beschrijving ${i + 1}`}
        className="text-white bg-[#6c6bc4] border-none rounded-2xl m-2 p-4 w-50 text-center font-bold"
      />
    ));

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
    <>
      <div className="headers bg-white w-screen">
        <img src={logo} alt="ROC Nijmegen logo" className="roclogo" />
      </div>

      <div className="diagonal-split">
        <h1 className="roct">Nieuw woord toevoegen</h1>

        {/* Form om aantal beschrijvingen te kiezen */}
        <form onSubmit={ChangeDescAmount}>
          <input
            className="text-white bg-[#6c6bc4] border-none rounded-2xl p-4 w-60 text-center font-bold"
            placeholder="Aantal beschrijvingen"
            name="DescAmount"
            type="number"
          />
          <div className="margintop">
            <button type="submit">Bevestig aantal</button>
          </div>
        </form>

        {/* Form om nieuw woord toe te voegen */}
        <form onSubmit={addItem}>
          <input
            className="text-white bg-[#6c6bc4] border-none rounded-2xl p-4 w-50 text-center font-bold m-2"
            placeholder="Woord"
            type="text"
            name="Word"
          />
          {renderNewWordDescriptions()}
          <div className="margintop">
            <button type="submit">Voeg woord toe</button>
          </div>
        </form>

        {/* Bestaande woorden beheren */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {allWords.map((w) => (
            <div key={w.id} className="wordkaart">
              {/* Word input */}
              <input
                type="text"
                value={editedWords[w.id] ?? w.word}
                onChange={(e) =>
                  setEditedWords({ ...editedWords, [w.id]: e.target.value })
                }
                className="font-semibold text-lg mb-2 border-b border-gray-300 w-full text-center focus:outline-none"
              />

              {/* Beschrijvingen */}
              {(w.descriptions || []).map((desc, i) => (
                <input
                  key={i}
                  type="text"
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
                  className="text-sm mb-1 border-b border-gray-300 w-full text-center focus:outline-none"
                />
              ))}

              {/* Update & Delete knoppen */}
              <div className="flex gap-2 mt-2 justify-center">
                <button onClick={() => updateItemHandler(w.id)}>Update</button>
                <button onClick={() => deleteItemHandler(w.id)}>
                  Verwijder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Admin;
