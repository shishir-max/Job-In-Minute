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

// FUNCTION FOR EMPLOYEES TO SEE THEIR OWN APPLIED JOBS AND RESUMES
export function listenToMyApplications(containerId) {
    const auth = getAuth();
    
    // Wait for the user's authentication state to resolve
    auth.onAuthStateChanged((user) => {
        if (!user) {
            document.getElementById(containerId).innerHTML = `<p style="color: #718096;">Please log in to view your application history.</p>`;
            return;
        }

        const container = document.getElementById(containerId);
        
        // Query applications matching ONLY this logged-in applicant's UID
        const q = query(
            collection(db, "applications"),
            where("applicantId", "==", user.uid)
        );

        // Listen for live updates
        onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #718096;">
                        <p>You haven't applied to any positions yet.</p>
                    </div>`;
                return;
            }

            let htmlArray = [];
            querySnapshot.forEach((doc) => {
                const app = doc.data();
                
                // Format the timestamp nicely if it exists
                const applyDate = app.appliedAt ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : "Pending...";

                htmlArray.push(`
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <h4 style="margin: 0; color: #2d3748; font-size: 18px;">Application Status</h4>
                            <span style="background: #ebf8ff; color: #2b6cb0; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 12px;">Applied on ${applyDate}</span>
                        </div>
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #4a5568;"><strong>Job Reference Code:</strong> <code style="background: #edf2f7; padding: 2px 4px; border-radius: 4px;">${app.jobId}</code></p>
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #4a5568;"><strong>Submitted Email:</strong> ${app.candidateEmail}</p>
                        
                        <div style="margin-top: 12px; background: #f7fafc; border-left: 4px solid #4299e1; padding: 12px; border-radius: 0 4px 4px 0;">
                            <strong style="font-size: 13px; color: #4a5568; display: block; margin-bottom: 4px;">Your Uploaded Resume / Profile Details:</strong>
                            <p style="margin: 0; font-size: 14px; color: #4a5568; white-space: pre-wrap;">${app.resumeDetails || app.resumeInfo || "No text details provided."}</p>
                        </div>
                    </div>
                `);
            });

            container.innerHTML = htmlArray.join("");
        });
    });
}
