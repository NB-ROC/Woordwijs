// login.js — gedeeld inlogformulier voor popup.html en oefening.html.
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/firebase.js";

function foutmelding(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email of wachtwoord klopt niet.";
    case "auth/invalid-email":
      return "Dit is geen geldig emailadres.";
    case "auth/too-many-requests":
      return "Te veel pogingen. Probeer het later opnieuw.";
    case "auth/network-request-failed":
      return "Geen verbinding. Controleer je internet.";
    default:
      return `Inloggen mislukt (${code ?? "onbekende fout"}).`;
  }
}

// Koppelt een <form> met #email, #password, #loginFout en #inlogBtn.
export function koppelLogin(form) {
  const email = form.querySelector("#email");
  const wachtwoord = form.querySelector("#password");
  const fout = form.querySelector("#loginFout");
  const knop = form.querySelector("#inlogBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    fout.hidden = true;
    knop.disabled = true;
    knop.textContent = "Bezig...";

    try {
      await signInWithEmailAndPassword(auth, email.value.trim(), wachtwoord.value);
    } catch (err) {
      console.error(err);
      fout.textContent = foutmelding(err?.code);
      fout.hidden = false;
    } finally {
      knop.disabled = false;
      knop.textContent = "Inloggen";
    }
  });
}
