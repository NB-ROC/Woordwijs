import { useState, useEffect } from "react";
import "./admin.css";
import { db } from "../config/firebase";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import logo from "../img/roc-nijmegen-logo-2024.jpg";

function Admin() {
  const [allWords, setAllWords] = useState([]);
  const [editedWords, setEditedWords] = useState({});
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [descriptionCount, setDescriptionCount] = useState(1);

  // Firestore ophalen
  const getWords = async () => {
    try {
      const snapshot = await getDocs(collection(db, "Words"));
      const words = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllWords(words);
    } catch (err) {
      console.error("Fout bij ophalen van woorden uit Firestore:", err);
    }
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
    const descriptions = Array.from(form.elements)
      .filter((el) => el.name.includes("description") && el.value.trim() !== "")
      .map((el) => el.value.trim());

    if (!word || descriptions.length === 0) return;

    try {
      await addDoc(collection(db, "Words"), { Word: word, Descriptions: descriptions });
      form.reset();
      setDescriptionCount(1);
      getWords();
    } catch (err) {
      console.error("Fout bij toevoegen:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "Words", id));
      getWords();
    } catch (err) {
      console.error("Fout bij verwijderen:", err);
    }
  };

  const updateItem = async (id) => {
    const originalItem = allWords.find((w) => w.id === id);
    if (!originalItem) return;

    const updatedWord = editedWords[id] ?? originalItem.Word;
    const updatedDescriptions = editedDescriptions[id] ?? originalItem.Descriptions;

    try {
      await updateDoc(doc(db, "Words", id), {
        Word: updatedWord,
        Descriptions: updatedDescriptions,
      });

      // Clear edited state
      setEditedWords((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      setEditedDescriptions((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });

      getWords();
      alert("Woord succesvol bijgewerkt!");
    } catch (err) {
      console.error("Fout bij updaten:", err);
    }
  };

  return (
    <>
      <div className="headers bg-white w-screen">
        <img src={logo} alt="ROC Nijmegen logo"/>
      </div>

      <div className="diagonal-split">
        <h1 className="roct">Nieuw woord toevoegen</h1>

        <form onSubmit={ChangeDescAmount} className="form-aantallen">
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
          {allWords.map((wordItem) => (
            <div key={wordItem.id} className="wordkaart flex flex-col items-center p-4">
              <input
                type="text"
                value={editedWords[wordItem.id] ?? wordItem.Word}
                onChange={(e) =>
                  setEditedWords({ ...editedWords, [wordItem.id]: e.target.value })
                }
                className="font-semibold text-lg mb-2 border-b border-gray-300 w-full text-center focus:outline-none text-[#3c2a4d]"
              />
              {(wordItem.Descriptions || []).map((desc, i) => (
                <input
                  key={i}
                  type="text"
                  value={editedDescriptions[wordItem.id]?.[i] ?? desc}
                  onChange={(e) => {
                    const newDesc = [
                      ...(editedDescriptions[wordItem.id] || wordItem.Descriptions),
                    ];
                    newDesc[i] = e.target.value;
                    setEditedDescriptions({
                      ...editedDescriptions,
                      [wordItem.id]: newDesc,
                    });
                  }}
                  className="text-sm mb-1 border-b border-gray-300 w-full text-center focus:outline-none text-[#3c2a4d]"
                />
              ))}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateItem(wordItem.id)}
                  className="px-4 py-1 rounded-2xl bg-[#4e4eb8] text-white font-bold hover:bg-[#3b3b92]"
                >
                  Update
                </button>
                <button
                  onClick={() => deleteItem(wordItem.id)}
                  className="px-4 py-1 rounded-2xl bg-[#c94c4c] text-white font-bold hover:bg-[#a03939]"
                >
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
