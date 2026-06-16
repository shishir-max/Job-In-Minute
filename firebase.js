// firebase.js - Core SDK Initialization & Platform Streams
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc,
  getDocs,
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsgjVxoK6eJuWl-ofbL1VLEHXld13_wV0",
  authDomain: "job-in-minute.firebaseapp.com",
  projectId: "job-in-minute",
  storageBucket: "job-in-minute.firebasestorage.app",
  messagingSenderId: "507249342731",
  appId: "1:507249342731:web:0db15814ee9c454c8f0a0e"
};

const app = initializeApp(firebaseConfig);

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 2. INSIDE YOUR LOGIN FORM SUBMIT LISTENER
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInputValue = document.getElementById('login-email').value;

    // --- SAVE EMAIL FOR SECURITY HANDSHAKE ---
    window.localStorage.setItem('emailForSignIn', emailInputValue);

    const actionCodeSettings = {
        url: 'https://www.jobinminute.com/',
        handleCodeInApp: true
    };

    sendSignInLinkToEmail(auth, emailInputValue, actionCodeSettings)
        .then(() => {
            alert("Security link sent! Please check your inbox.");
        })
        .catch((error) => {
            alert("Error sending link: " + error.message);
        });
});

// 3. INSIDE YOUR REGISTRATION FORM SUBMIT LISTENER
document.getElementById('auth-registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check whichever email input is active (Employee or Employer)
    const empEmail = document.getElementById('emp-email')?.value;
    const orgEmail = document.getElementById('org-email')?.value;
    const registrationEmail = empEmail || orgEmail;

    // --- SAVE EMAIL FOR SECURITY HANDSHAKE ---
    window.localStorage.setItem('emailForSignIn', registrationEmail);

    const actionCodeSettings = {
        url: 'https://www.jobinminute.com/',
        handleCodeInApp: true
    };

    sendSignInLinkToEmail(auth, registrationEmail, actionCodeSettings)
        .then(() => {
            alert("Verification link sent! Please check your inbox.");
        })
        .catch((error) => {
            alert("Registration link error: " + error.message);
        });
});

// 4. INCOMING LINK INTERCEPTOR (Fixed missing syntax at bottom)
function handleIncomingAuthenticationLink() {
    // Check if the current URL has the secure tracking link parameters from Firebase
    if (isSignInWithEmailLink(auth, window.location.href)) {
        
        // Pull the email address out of the browser memory
        let email = window.localStorage.getItem('emailForSignIn');
        
        // Fallback: If they clicked the link on a different browser/device, ask them to type it in
        if (!email) {
            email = window.prompt('Security Check: Please confirm your registered email address to complete sign in:');
        }
        
        if (email) {
            // Send the email and URL details to Firebase to clear the login check
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    // Success! Remove the temporary email from storage
                    window.localStorage.removeItem('emailForSignIn');
                    
                    // Clean up the address bar so the long text string disappears
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    alert("Identity verified successfully! Welcome back to JobInMinute.");
                })
                .catch((error) => {
                    console.error("Link handling error:", error);
                    alert("This verification link has expired or is invalid. Please request a new access link.");
                });
        }
    }
}

// EXECUTE THE INTERCEPTOR AUTOMATICALLY ON EVERY PAGE LOAD
handleIncomingAuthenticationLink();
