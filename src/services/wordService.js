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
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addWord = async (Word, Descriptions) => {
  await addDoc(wordsCol, { Word, Descriptions });
};

export const deleteWord = async (id) => {
  await deleteDoc(doc(db, "Words", id));
};

export const updateWord = async (id, data) => {
  await updateDoc(doc(db, "Words", id), data);
};

// ==================== Coins ====================
export const getCoins = async () => {
  const coinsDocRef = doc(db, "Coins", "default");
  const snap = await getDoc(coinsDocRef);
  if (!snap.exists()) return 0;
  return snap.data().coins;
};

export const addCoins = async (amount) => {
  try {
    const coinsDocRef = doc(db, "Coins", "default");
    const snap = await getDoc(coinsDocRef);
    if (!snap.exists()) {
      await setDoc(coinsDocRef, { coins: amount });
    } else {
      const current = snap.data().coins || 0;
      await setDoc(coinsDocRef, { coins: current + amount });
    }
  } catch (err) {
    console.error("Fout bij updaten coins:", err);
  }
};

// ==================== User Antwoorden ====================

// Antwoord opslaan
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
};

// Geschiedenis ophalen
export const getHistory = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const historyRef = collection(db, "users", user.uid, "history");
  const q = query(historyRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
