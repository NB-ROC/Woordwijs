// src/services/wordService.js
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// ==================== Woorden ====================
const wordsCol = collection(db, "Words");

export const getWords = async () => {
  const snapshot = await getDocs(wordsCol);
  return snapshot.docs.map(d => {
    const data = d.data();
    // Documenten in Firestore gebruiken door elkaar `word`/`Word` en
    // `descriptions`/`Descriptions`. Normaliseer naar kleine letters.
    return {
      id: d.id,
      ...data,
      word: data.word ?? data.Word ?? "",
      descriptions: data.descriptions ?? data.Descriptions ?? [],
    };
  });
};

export const addWord = async (word, descriptions) => {
  await addDoc(wordsCol, { word, descriptions });
};

export const deleteWord = async (id) => {
  await deleteDoc(doc(db, "Words", id));
};

export const updateWord = async (id, data) => {
  await updateDoc(doc(db, "Words", id), data);
};

// ==================== Coins (per gebruiker) ====================
// Coins worden opgeslagen op het document van de ingelogde gebruiker
// (users/{uid}.coins), zodat iedere speler zijn eigen saldo heeft.
export const getCoins = async () => {
  const user = auth.currentUser;
  if (!user) return 0;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return 0;
  return snap.data().coins || 0;
};

export const addCoins = async (amount) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const current = snap.exists() ? snap.data().coins || 0 : 0;
    await setDoc(userRef, { coins: current + amount }, { merge: true });
  } catch (err) {
    console.error("Fout bij updaten coins:", err);
  }
};

// ==================== Gebruikersprofiel ====================
// Naam en email op users/{uid}, zodat de admin-pagina een lijst van
// studenten kan tonen (de Firebase Auth-gebruikerslijst is niet uit te
// lezen vanuit de browser).
export const saveUserProfile = async (user) => {
  if (!user) return;
  try {
    await setDoc(
      doc(db, "users", user.uid),
      { email: user.email ?? null, name: user.displayName || user.email || "" },
      { merge: true }
    );
  } catch (err) {
    console.error("Fout bij opslaan profiel:", err);
  }
};

// ==================== Streak ====================
// Datum als "YYYY-MM-DD" in lokale tijd.
const dagString = (date = new Date()) => date.toLocaleDateString("sv-SE");

const gisteren = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dagString(d);
};

// Streak zoals hij nu geldt: een reeks die gisteren of vandaag nog is
// bijgewerkt telt, anders is hij verbroken (0).
export const currentStreak = (userData) => {
  const { streak = 0, lastPlayed } = userData ?? {};
  return lastPlayed === dagString() || lastPlayed === gisteren() ? streak : 0;
};

// Streak van de ingelogde gebruiker
export const getStreak = async () => {
  const user = auth.currentUser;
  if (!user) return 0;
  const snap = await getDoc(doc(db, "users", user.uid));
  return currentStreak(snap.exists() ? snap.data() : null);
};

const updateStreak = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};
  const vandaag = dagString();
  if (data.lastPlayed === vandaag) return;

  const streak = data.lastPlayed === gisteren() ? (data.streak || 0) + 1 : 1;
  await setDoc(userRef, { streak, lastPlayed: vandaag }, { merge: true });
};

// ==================== User Antwoorden ====================

// Een beschrijving is goed als hij een van de opgegeven beschrijvingen bevat.
export const checkAnswer = (word, answer) => {
  const antwoord = answer.trim().toLowerCase();
  if (!antwoord || !Array.isArray(word?.descriptions)) return false;
  return word.descriptions.some((d) => {
    const beschrijving = String(d).trim().toLowerCase();
    return beschrijving !== "" && antwoord.includes(beschrijving);
  });
};

// Antwoord opslaan (werkt ook de streak bij)
export const saveAnswer = async (word, answer, correct) => {
  const user = auth.currentUser;
  if (!user) return;

  const historyRef = collection(db, "users", user.uid, "history");

  await addDoc(historyRef, {
    word,
    answer,
    correct,
    createdAt: serverTimestamp(),
  });

  try {
    await updateStreak(user.uid);
  } catch (err) {
    console.error("Fout bij updaten streak:", err);
  }
};

// Geschiedenis van een gebruiker ophalen
export const getHistoryForUser = async (uid) => {
  const historyRef = collection(db, "users", uid, "history");
  const q = query(historyRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Geschiedenis van de ingelogde gebruiker ophalen
export const getHistory = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  return getHistoryForUser(user.uid);
};

// ==================== Admin ====================

// Alle studenten met hun huidige streak, gesorteerd op naam
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || data.email || d.id,
        streak: currentStreak(data),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
};
