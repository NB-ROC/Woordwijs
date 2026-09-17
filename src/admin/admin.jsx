// Admin.jsx — overzicht van studenten met hun streak. Klik op een student
// om diens woorden en antwoorden te zien.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, getHistoryForUser } from "../services/wordService";

const dagen = (n) => `${n} ${n === 1 ? "dag" : "dagen"}`;

function Admin() {
  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [fout, setFout] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        setFout("Studenten konden niet geladen worden.");
        setUsers([]);
      });
  }, []);

  const openUser = async (user) => {
    setSelected(user);
    setHistory(null);
    try {
      setHistory(await getHistoryForUser(user.id));
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  const terug = () => {
    setSelected(null);
    setHistory(null);
  };

  return (
    <main className="pagina">
      <section className="admin">
        <h1 className="admin__titel">admin</h1>

        <div className="admin__balk">
          {selected ? (
            <button type="button" className="link-knop" onClick={terug}>
              ← Terug
            </button>
          ) : (
            <span />
          )}
          <Link to="/admin/woorden" className="link-knop">
            Woorden beheren
          </Link>
        </div>

        {selected ? (
          <div className="tabel">
            <div className="tabel__kop">
              <span>{selected.name}</span>
              <span>{dagen(selected.streak)}</span>
            </div>
            <div className="tabel__kop">
              <span>Woord</span>
              <span>Antwoord</span>
            </div>

            {history === null && <p className="tabel__leeg">Laden...</p>}
            {history?.length === 0 && (
              <p className="tabel__leeg">Nog geen antwoorden.</p>
            )}
            {history?.map((item) => (
              <div
                key={item.id}
                className="tabel__rij tabel__rij--antwoord"
                title={item.correct ? "Goed" : "Fout"}
              >
                <span>{item.word}</span>
                <span>{item.answer}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="tabel__kop tabel__kop--los">
              <span>Naam</span>
              <span>Streak</span>
            </div>
            <div className="tabel">
              {users === null && <p className="tabel__leeg">Laden...</p>}
              {fout && <p className="tabel__leeg">{fout}</p>}
              {users?.length === 0 && !fout && (
                <p className="tabel__leeg">Nog geen studenten.</p>
              )}
              {users?.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="tabel__rij"
                  onClick={() => openUser(user)}
                >
                  <span>{user.name}</span>
                  <span>{dagen(user.streak)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Admin;
