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

// 1. FIREBASE SETTING INSTANCES
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

// 2. ACCOUNT ACCESS GATE (LOGIN ACTION HANDLER)
document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInputValue = document.getElementById('login-email').value;

            // Save tracking string into client memory loop
            window.localStorage.setItem('emailForSignIn', emailInputValue);

            const actionCodeSettings = {
    // Point this back to your working custom domain
    url: 'https://www.jobinminute.com/',
    handleCodeInApp: true
};

            sendSignInLinkToEmail(auth, emailInputValue, actionCodeSettings)
                .then(() => {
                    alert("Security gateway link sent! Please check your email inbox.");
                })
                .catch((error) => {
                    alert("Error deploying transmission: " + error.message);
                });
        });
    }

    // 3. IDENTITY SEED NODE (REGISTRATION ACTION HANDLER)
    const registrationForm = document.getElementById('auth-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const empEmail = document.getElementById('emp-email')?.value;
            const orgEmail = document.getElementById('org-email')?.value;
            const registrationEmail = empEmail || orgEmail;

            if (!registrationEmail) {
                alert("Please provide a valid entry inside the core Email ID inputs.");
                return;
            }

            // Save tracking string into client memory loop
            window.localStorage.setItem('emailForSignIn', registrationEmail);

            const actionCodeSettings = {
    // Point this back to your working custom domain
    url: 'https://www.jobinminute.com/',
    handleCodeInApp: true
};

            sendSignInLinkToEmail(auth, registrationEmail, actionCodeSettings)
                .then(() => {
                    alert("Verification link deployed! Go directly to your mailbox container to authorize account creation.");
                })
                .catch((error) => {
                    alert("Registration stream aborted: " + error.message);
                });
        });
    }
});

// 4. LANDING INBOUND INTERCEPT HANDSHAKE
function handleIncomingAuthenticationLink() {
    console.log("Monitoring browser landing environment layer...");
    
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
            email = window.prompt('Identity Checkpoint: Enter your authorized security email address to unlock system nodes:');
        }
        
        if (email) {
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    // Flush the temporary storage item clean
                    window.localStorage.removeItem('emailForSignIn');
                    
                    // Clear tracking hashes from address window
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    alert("Identity verified successfully! Account parameters active on JobInMinute.");
                    
                    // If you have a custom dashboard switcher function ready, you can add it here.
                })
                .catch((error) => {
                    console.error("Handshake authorization loop dropped:", error);
                    alert("This secure validation parameters string has expired or was already evaluated.");
                });
        }
    }
}

// FORCE WAITING CYCLE FOR WINDOW INITIALIZATION 
if (document.readyState === 'complete') {
    handleIncomingAuthenticationLink();
} else {
    window.addEventListener('load', handleIncomingAuthenticationLink);
}
