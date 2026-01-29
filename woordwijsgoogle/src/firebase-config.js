import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9jIp449_9hMjx3B-sExX-JdVoIbHx58o",
  authDomain: "woordwijs-d6bc0.firebaseapp.com",
  projectId: "woordwijs-d6bc0",
  storageBucket: "woordwijs-d6bc0.firebasestorage.app",
  messagingSenderId: "73099096499",
  appId: "1:73099096499:web:6fccad96821a02271edbc6",
  measurementId: "G-VNTNKDG2NV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ Firebase + Auth + Firestore klaar");
