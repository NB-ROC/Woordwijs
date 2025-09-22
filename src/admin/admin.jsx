import { useState } from 'react'
import './Admin.css'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

function Admin() {
  const [descriptionCount, setDescriptionCount] = useState(1);
  const [allWords, setAllWords] = useState([]);

  const getWords = async () => {
    const res = await fetch("http://localhost:5000/api/words");
    const data = await res.json();
    setAllWords(data);
  };

  useEffect(() => {
    getWords();
  }, []);

  const handleChangeCount = (e) => {
    const value = Number(e.target.value);
    setDescriptionCount(value > 0 ? value : 1);
  };

  const addItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const word = form.Word.value.trim();
    const descriptions = [];

    for (let i = 0; i < descriptionCount; i++) {
      const desc = form[`description${i}`]?.value.trim();
      if (desc) descriptions.push(desc);
    }

    if (!word) {
      alert("Vul een woord in");
      return;
    }

    if (descriptions.length === 0) {
      alert("Vul minstens één beschrijving in");
      return;
    }

    await fetch("http://localhost:5000/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, description: descriptions }), // consistent met DB
    });

    form.reset();
    setDescriptionCount(1);
    getWords();
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:5000/api/words/${id}`, {
      method: "DELETE",
    });
    getWords();
  };

  const renderDescriptions = () => {
    const inputs = [];
    for (let i = 0; i < descriptionCount; i++) {
      inputs.push(
        <input key={i} name={`description${i}`} placeholder="Beschrijving" />
      );
    }
    return inputs;
  };

  return (
    <div className="admin-page">
      <h2>Admin pagina</h2>
      <input
        type="number"
        value={descriptionCount}
        onChange={handleChangeCount}
        placeholder="Aantal beschrijvingen"
        min={1}
      />
      <form onSubmit={addItem}>
        <input placeholder="Woord" type="text" name="Word" />
        {renderDescriptions()}
        <button type="submit">Voeg woord toe</button>
      </form>

      <div className="word-list">
        {allWords.map((word) => (
          <div key={word.id} className="word-item">
            <div className="word-title">{word.word}</div>
            <ul>
              {(() => {
                let descriptions = [];
                try {
                  descriptions = Array.isArray(word.description)
                    ? word.description
                    : JSON.parse(word.description);
                } catch (err) {
                  console.error("Kon descriptions niet parsen", err);
                }
                return descriptions.map((desc, i) => <li key={i}>{desc}</li>);
              })()}
            </ul>

            <button onClick={() => deleteItem(word.id)}>Verwijder</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin
