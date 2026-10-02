// punten.jsx — "Mijn punten": totaal aan punten, streak, aantal goede en
// foute antwoorden en de laatste antwoorden van de ingelogde student.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getCoins,
  getStreak,
  getHistory,
  PUNTEN_PER_GOED,
} from "../services/wordService";

const dagen = (n) => `${n} ${n === 1 ? "dag" : "dagen"}`;

function Punten() {
  const [gegevens, setGegevens] = useState(null);
  const [fout, setFout] = useState("");

  useEffect(() => {
    Promise.all([getCoins(), getStreak(), getHistory()])
      .then(([punten, streak, history]) =>
        setGegevens({ punten, streak, history })
      )
      .catch((err) => {
        console.error(err);
        setFout("Je punten konden niet geladen worden.");
      });
  }, []);

  if (fout || !gegevens) {
    return (
      <main className="pagina">
        <h1 className="pagina-titel">Mijn punten</h1>
        <p className="tabel__leeg">{fout || "Laden..."}</p>
      </main>
    );
  }

  const { punten, streak, history } = gegevens;
  const goed = history.filter((item) => item.correct).length;

  return (
    <main className="pagina">
      <h1 className="pagina-titel">Mijn punten</h1>

      <div className="kaart puntenkaart">
        <span className="puntenkaart__getal">{punten}</span>
        <span>punten</span>
      </div>

      <div className="stats">
        <div className="kaart stats__vak">
          <span className="stats__getal">{goed}</span>
          <span>goed</span>
        </div>
        <div className="kaart stats__vak">
          <span className="stats__getal">{history.length - goed}</span>
          <span>fout</span>
        </div>
        <div className="kaart stats__vak">
          <span className="stats__getal">{dagen(streak)}</span>
          <span>streak</span>
        </div>
      </div>

      <p>Je krijgt {PUNTEN_PER_GOED} punten voor elk goed antwoord.</p>

      <section className="admin">
        <div className="tabel__kop tabel__kop--los">
          <span>Woord</span>
          <span>Antwoord</span>
        </div>
        <div className="tabel tabel--laag">
          {history.length === 0 && (
            <p className="tabel__leeg">Nog geen antwoorden.</p>
          )}
          {history.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className={`tabel__rij tabel__rij--antwoord ${
                item.correct ? "tabel__rij--goed" : "tabel__rij--fout"
              }`}
              title={item.correct ? "Goed" : "Fout"}
            >
              <span>{item.word}</span>
              <span>{item.answer}</span>
            </div>
          ))}
        </div>
      </section>

      <Link to="/game" className="knop">
        Verder oefenen
      </Link>
    </main>
  );
}

export default Punten;
