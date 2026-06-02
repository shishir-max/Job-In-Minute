// firebase.js - Core SDK initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsgjVxoK6eJuWl-ofbL1VLEHXld13_wV0",
  authDomain: "job-in-minute.firebaseapp.com",
  projectId: "job-in-minute",
  storageBucket: "job-in-minute.firebasestorage.app",
  messagingSenderId: "507249342731",
  appId: "1:507249342731:web:0db15814ee9c454c8f0a0e"
};

// Initialize Firebase App Instance
const app = initializeApp(firebaseConfig);

// Export instances to be imported by our app logic
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
