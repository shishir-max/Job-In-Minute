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
// ========================================================
// PLACE 1: INSIDE YOUR LOGIN FORM SUBMIT LISTENER
// ========================================================
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInputValue = document.getElementById('login-email').value;

    // --- SAVE EMAIL FOR SECURITY HANDSHAKE ---
    window.localStorage.setItem('emailForSignIn', emailInputValue);

    // CHANGE THIS URL RIGHT HERE:
    const actionCodeSettings = {
        url: 'https://job-in-minute.firebaseapp.com/',
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

// ========================================================
// PLACE 2: INSIDE YOUR REGISTRATION FORM SUBMIT LISTENER
// ========================================================
document.getElementById('auth-registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check whichever email input is active (Employee or Employer)
    const empEmail = document.getElementById('emp-email')?.value;
    const orgEmail = document.getElementById('org-email')?.value;
    const registrationEmail = empEmail || orgEmail;

    // --- SAVE EMAIL FOR SECURITY HANDSHAKE ---
    window.localStorage.setItem('emailForSignIn', registrationEmail);

    // CHANGE THIS URL HERE AS WELL:
    const actionCodeSettings = {
        url: 'https://job-in-minute.firebaseapp.com/',
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
// 4. INCOMING LINK INTERCEPTOR (Wrapped in a window load listener)
function handleIncomingAuthenticationLink() {
    console.log("Checking for incoming Firebase authentication link...");
    
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
            email = window.prompt('Security Check: Please confirm your registered email address to complete sign in:');
        }
        
        if (email) {
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn');
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    alert("Identity verified successfully! Welcome back to JobInMinute.");
                    
                    // If you have a dashboard function, trigger it here:
                    // showDashboardView();
                })
                .catch((error) => {
                    console.error("Link handling error details:", error);
                    alert("Verification failed: " + error.message);
                });
        }
    }
}

// WAIT FOR THE WINDOW TO FULLY LOAD BEFORE RUNNING
if (document.readyState === 'complete') {
    handleIncomingAuthenticationLink();
} else {
    window.addEventListener('load', handleIncomingAuthenticationLink);
}

// EXECUTE THE INTERCEPTOR AUTOMATICALLY ON EVERY PAGE LOAD
handleIncomingAuthenticationLink();
