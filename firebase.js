// firebase.js - Core SDK initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// FUNCTION FOR EMPLOYEES TO SUBMIT AN APPLICATION
export async function submitApplication(jobId, employerId, candidateDetails) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to apply.");
        return;
    }

    try {
        // Creates a bridge document in a global 'applications' collection
        await addDoc(collection(db, "applications"), {
            jobId: jobId,
            employerId: employerId, // Links it directly to the creator of the job
            applicantId: user.uid,  // Employee's Firebase Auth UID
            candidateName: candidateDetails.name,
            candidateEmail: user.email,
            resumeDetails: candidateDetails.resumeText, 
            appliedAt: serverTimestamp()
        });

        alert("Application submitted successfully!");
    } catch (error) {
        console.error("Error submitting application: ", error);
        alert("Failed to submit application: " + error.message);
    }
}
