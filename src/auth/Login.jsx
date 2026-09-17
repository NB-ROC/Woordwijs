import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFout("");
    setBezig(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch {
      setFout("Inloggen mislukt. Controleer je gegevens.");
      setBezig(false);
    }
  };

  return (
    <main className="pagina pagina--midden">
      <form className="kaart login" onSubmit={handleLogin}>
        <div className="login__kop">
          <h1 className="login__titel">Welkom bij Woordwijs</h1>
          <p className="login__sub">Log in met je ROC-account</p>
        </div>

        <label className="veld">
          <span className="veld__label">Email</span>
          <input
            type="email"
            autoComplete="username"
            placeholder="naam@roc-nijmegen.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="veld">
          <span className="veld__label">Wachtwoord</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {fout && <p className="login__fout">{fout}</p>}

        <button type="submit" className="knop login__knop" disabled={bezig}>
          {bezig ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </main>
  );
}

export default Login;
