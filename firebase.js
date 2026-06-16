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

// 2. LOGIN FORM SUBMIT LISTENER
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInputValue = document.getElementById('login-email').value;
            
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
    }

    // 3. REGISTRATION FORM SUBMIT LISTENER
    const registrationForm = document.getElementById('auth-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const empEmail = document.getElementById('emp-email')?.value;
            const orgEmail = document.getElementById('org-email')?.value;
            const registrationEmail = empEmail || orgEmail;

            if (!registrationEmail) {
                alert("Please provide a valid email address.");
                return;
            }

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
    }
});

// 4. INCOMING LINK INTERCEPTOR
function handleIncomingAuthenticationLink() {
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
                })
                .catch((error) => {
                    console.error("Link handling error:", error);
                    alert("This verification link has expired or is invalid. Please request a new access link.");
                });
        }
    }
}

// Check link immediately on script execution
handleIncomingAuthenticationLink();
