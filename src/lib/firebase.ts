
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "freesia-finds-pos-82fbs",
  "appId": "1:483817634516:web:c436e4c6354f95aab6d941",
  "storageBucket": "freesia-finds-pos-82fbs.firebasestorage.app",
  "apiKey": "AIzaSyA-uxh4gPyKrwiEhr8szzbJTxQor33n6sI",
  "authDomain": "freesia-finds-pos-82fbs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "483817634516"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
