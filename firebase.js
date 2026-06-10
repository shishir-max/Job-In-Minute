// firebase.js - Core SDK Initialization & Platform Streams
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

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * FUNCTION FOR EMPLOYEES TO SEE THEIR OWN APPLIED JOBS AND RESUMES
 * Establishes real-time listener filtering by candidateId matching authentication tokens.
 */
export function listenToMyApplications(containerId) {
    const authInstance = getAuth();
    
    authInstance.onAuthStateChanged((user) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!user) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #64748b;">
                    <p>Please log in to view your application history matrix.</p>
                </div>`;
            return;
        }

        // Standardized query linking explicitly with candidateId
        const q = query(
            collection(db, "applications"),
            where("candidateId", "==", user.uid)
        );

        // Listen for live database dashboard updates
        onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #64748b;">
                        <p>You haven't applied to any positions yet.</p>
                    </div>`;
                return;
            }

            let htmlArray = [];
            querySnapshot.forEach((docSnap) => {
                const appData = docSnap.data();
                const applyDate = appData.appliedAt ? new Date(appData.appliedAt.seconds * 1000).toLocaleDateString() : "Pending...";

                htmlArray.push(`
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <h4 style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 700;">Application Status Tracker</h4>
                            <span style="background: #ebf8ff; color: #2b6cb0; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 12px;">Applied on ${applyDate}</span>
                        </div>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #4a5568;"><strong>Job Token Ref:</strong> <code style="background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${appData.jobId}</code></p>
                        <p style="margin: 0 0 5px 0; font-size: 13px; color: #4a5568;"><strong>Submitted Email:</strong> ${appData.candidateEmail || "N/A"}</p>
                        
                        <div style="margin-top: 12px; background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 0 4px 4px 0;">
                            <strong style="font-size: 12px; color: #475569; display: block; margin-bottom: 4px; uppercase tracking-wider">Your Uploaded Resume / Profile Details:</strong>
                            <p style="margin: 0; font-size: 13px; color: #334155; white-space: pre-wrap; font-family: monospace; line-height: 1.5;">${appData.resumeInfo || "No structural text details provided."}</p>
                        </div>
                    </div>
                `);
            });

            container.innerHTML = htmlArray.join("");
        }, (error) => {
            console.error("Error streaming personalized applications: ", error);
            container.innerHTML = `<p style="color: #ef4444; font-size: 12px;">Failed to secure data transmission stream.</p>`;
        });
    });
}
