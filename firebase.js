// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
