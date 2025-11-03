import { useState, useEffect } from "react";
import "./Admin.css";

function Admin() {
  const [allWords, setAllWords] = useState([]);
  const [editedWords, setEditedWords] = useState({});
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [descriptionCount, setDescriptionCount] = useState(1);

  const getWords = async () => {
    const res = await fetch("http://localhost:5000/api/words");
    const data = await res.json();
    setAllWords(data);
  };

  useEffect(() => {
    getWords();
  }, []);

  const ChangeDescAmount = (e) => {
    e.preventDefault();
    setDescriptionCount(Number(e.target.DescAmount.value) || 1);
  };

  const renderNewWordDescriptions = () => {
    const inputs = [];
    for (let i = 0; i < descriptionCount; i++) {
      inputs.push(
        <input
          key={i}
          name={`description${i}`}
          placeholder={`Beschrijving ${i + 1}`}
          className="text-white bg-[#6c6bc4] border-none rounded-2xl m-2 p-4 w-50 text-center font-bold"
        />
      );
    }
    return inputs;
  };

  const addItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const word = form.Word.value.trim();
    const descriptions = [];
    for (let el of form.elements) {
      if (el.name.includes("description") && el.value.trim() !== "") {
        descriptions.push(el.value.trim());
      }
    }
    if (!word || descriptions.length === 0) return;

    await fetch("http://localhost:5000/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, description: descriptions }),
    });

    form.reset();
    setDescriptionCount(1);
    getWords();
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:5000/api/words/${id}`, { method: "DELETE" });
    getWords();
  };

  const updateItem = async (id) => {
    const word = editedWords[id] ?? allWords.find((w) => w.id === id).word;
    const description =
      editedDescriptions[id] ??
      (() => {
        const original = allWords.find((w) => w.id === id).description;
        return Array.isArray(original) ? original : JSON.parse(original);
      })();

    await fetch(`http://localhost:5000/api/words/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, description }),
    });

    getWords();
    alert("Woord succesvol bijgewerkt!");
  };

  return (
    <>
      <div className="headers bg-white w-screen">
        <img
          src="src/img/Logo van ROC-Nijmegen.svg"
          alt="RocLogo"
          className="roclogo"
        />
      </div>

      <div className="diagonal-split">
        <h1 className="roct">Nieuw woord toevoegen</h1>

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

        <div className="flex flex-wrap gap-4 justify-center">
          {allWords.map((wordItem) => {
            let descriptions = [];
            try {
              descriptions = Array.isArray(wordItem.description)
                ? wordItem.description
                : JSON.parse(wordItem.description);
            } catch (err) {
              console.error(err);
            }

            return (
              <div key={wordItem.id} className="wordkaart">
                <input
                  type="text"
                  value={editedWords[wordItem.id] ?? wordItem.word}
                  onChange={(e) =>
                    setEditedWords({
                      ...editedWords,
                      [wordItem.id]: e.target.value,
                    })
                  }
                  className="font-semibold text-lg mb-2 border-b border-gray-300 w-full text-center focus:outline-none"
                />

                {descriptions.map((desc, i) => (
                  <input
                    key={i}
                    type="text"
                    value={editedDescriptions[wordItem.id]?.[i] ?? desc}
                    onChange={(e) => {
                      const newDesc = [
                        ...(editedDescriptions[wordItem.id] || descriptions),
                      ];
                      newDesc[i] = e.target.value;
                      setEditedDescriptions({
                        ...editedDescriptions,
                        [wordItem.id]: newDesc,
                      });
                    }}
                    className="text-sm mb-1 border-b border-gray-300 w-full text-center focus:outline-none"
                  />
                ))}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateItem(wordItem.id)}>
                    Update
                  </button>
                  <button onClick={() => deleteItem(wordItem.id)}>
                    Verwijder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Admin;
