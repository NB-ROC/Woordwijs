import { useState, useEffect } from "react";
import { getWords, addWord, deleteWord, updateWord } from "../services/wordService";
import "./Admin.css";

function Admin() {
  const [allWords, setAllWords] = useState([]);
  const [editedWords, setEditedWords] = useState({});
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [descriptionCount, setDescriptionCount] = useState(1);

  const loadWords = async () => {
    const data = await getWords();
    setAllWords(data);
  };

  useEffect(() => { loadWords(); }, []);

  const ChangeDescAmount = (e) => {
    e.preventDefault();
    setDescriptionCount(Number(e.target.DescAmount.value) || 1);
  };

  const renderNewWordDescriptions = () => [...Array(descriptionCount)].map((_, i) => (
    <input key={i} name={`description${i}`} placeholder={`Beschrijving ${i + 1}`}
      className="text-white bg-[#6c6bc4] border-none rounded-2xl m-2 p-4 w-50 text-center font-bold" />
  ));

  const addItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const Word = form.Word.value.trim();
    const Descriptions = Array.from(form.elements)
      .filter(el => el.name.includes("description") && el.value.trim() !== "")
      .map(el => el.value.trim());

    if (!Word || Descriptions.length === 0) return;
    await addWord(Word, Descriptions);
    form.reset();
    setDescriptionCount(1);
    loadWords();
  };

  const deleteItemHandler = async (id) => { await deleteWord(id); loadWords(); };
  const updateItemHandler = async (id) => {
    const original = allWords.find(w => w.id === id);
    const newWord = editedWords[id] ?? original.Word;
    const newDescriptions = editedDescriptions[id] ?? original.Descriptions;
    await updateWord(id, { Word: newWord, Descriptions: newDescriptions });
    alert("Woord bijgewerkt!");
    loadWords();
  };

  return (
    <>
      <div className="headers bg-white w-screen">
        <img src="src/img/Logo van ROC-Nijmegen.svg" alt="RocLogo" className="roclogo"/>
      </div>

      <div className="diagonal-split">
        <h1 className="roct">Nieuw woord toevoegen</h1>

        <form onSubmit={ChangeDescAmount}>
          <input className="text-white bg-[#6c6bc4] border-none rounded-2xl p-4 w-60 text-center font-bold" placeholder="Aantal beschrijvingen" name="DescAmount" type="number"/>
          <div className="margintop"><button type="submit">Bevestig aantal</button></div>
        </form>

        <form onSubmit={addItem}>
          <input className="text-white bg-[#6c6bc4] border-none rounded-2xl p-4 w-50 text-center font-bold m-2" placeholder="Woord" type="text" name="Word"/>
          {renderNewWordDescriptions()}
          <div className="margintop"><button type="submit">Voeg woord toe</button></div>
        </form>

        <div className="flex flex-wrap gap-4 justify-center">
          {allWords.map(w => (
            <div key={w.id} className="wordkaart">
              <input type="text" value={editedWords[w.id] ?? w.Word}
                onChange={e => setEditedWords({...editedWords, [w.id]: e.target.value})}
                className="font-semibold text-lg mb-2 border-b border-gray-300 w-full text-center focus:outline-none"/>
              {w.Descriptions.map((desc, i) => (
                <input key={i} type="text"
                  value={editedDescriptions[w.id]?.[i] ?? desc}
                  onChange={e => {
                    const newDesc = [...(editedDescriptions[w.id] || w.Descriptions)];
                    newDesc[i] = e.target.value;
                    setEditedDescriptions({...editedDescriptions, [w.id]: newDesc});
                  }}
                  className="text-sm mb-1 border-b border-gray-300 w-full text-center focus:outline-none"/>
              ))}
              <div className="flex gap-2 mt-2">
                <button onClick={() => updateItemHandler(w.id)}>Update</button>
                <button onClick={() => deleteItemHandler(w.id)}>Verwijder</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Admin;
