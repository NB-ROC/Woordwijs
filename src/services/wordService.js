// src/services/wordService.js
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

// Woorden
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

// Coins
export const getCoins = async () => {
  const coinsDocRef = doc(db, "Coins", "default"); // <-- definitie binnen functie
  const snap = await getDoc(coinsDocRef);
  if (!snap.exists()) return 0;
  return snap.data().coins;
};

export const addCoins = async (amount) => {
  try {
    const coinsDocRef = doc(db, "Coins", "default"); // <-- definitie binnen functie
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
