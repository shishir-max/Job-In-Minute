// firebase.js - Complete Multi-Tenant Identity Verification Engine
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc 
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

// GLOBAL ENTRY WINDOW INTERCEPT FOR PASSWORD RESETS
window.triggerPasswordResetLink = function() {
    const emailTarget = document.getElementById('login-email').value;
    if (!emailTarget) {
        alert("Please type your registered account email ID into the input field first.");
        return;
    }
    
    sendPasswordResetEmail(auth, emailTarget)
        .then(() => {
            alert(`A secure password modification link has been sent to: ${emailTarget}. Please open your email inbox to proceed.`);
        })
        .catch((err) => {
            alert("Reset Request Dropped: " + err.message);
        });
};

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. LIVE DIRECT ACCOUNT LOGIN LISTENER
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const selectedRole = document.getElementById('login-role').value;
            const emailInput = document.getElementById('login-email').value;
            const passwordInput = document.getElementById('login-password').value;

            signInWithEmailAndPassword(auth, emailInput, passwordInput)
                .then((userCredential) => {
                    console.log("Session initialization complete:", userCredential.user.uid);
                    alert("Identity validated successfully! Opening secure app workspace dashboard.");
                })
                .catch((err) => {
                    alert("Access Denied: Invalid credentials pattern or profile node not matching. " + err.message);
                });
        });
    }

    // 2. LIVE PROFILE DATA PROVISIONING & ACCOUNT CREATION
    const regForm = document.getElementById('auth-registration-form');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const targetRole = window.getCurrentSelectedRegistrationRole();
            const emailValue = document.getElementById('reg-core-email').value;
            const passwordValue = document.getElementById('reg-core-password').value;

            // Compile Data Object Based on Selected Role Mode
            let profilePayload = {
                accountRole: targetRole,
                emailId: emailValue,
                creationTimestamp: new Date().toISOString()
            };

            if (targetRole === 'employee') {
                const name = document.getElementById('emp-name').value;
                const phone = document.getElementById('emp-phone').value;
                const sector = document.getElementById('emp-sector').value;
                const addr = document.getElementById('emp-address').value;

                if (!name || !phone || !sector) {
                    alert("Please fill in all mandatory Employee registration fields.");
                    return;
                }

                profilePayload.fullName = name;
                profilePayload.phoneNumber = phone;
                profilePayload.jobSector = sector;
                profilePayload.address = addr || "Not Listed";

            } else if (targetRole === 'employer') {
                const execName = document.getElementById('org-exec-name').value;
                const phone = document.getElementById('org-phone').value;
                const brand = document.getElementById('org-brand-name').value;
                const webUrl = document.getElementById('org-website').value;
                const address = document.getElementById('org-address').value;
                const sector = document.getElementById('org-sector').value;
                const gst = document.getElementById('org-gst').value;
                const idVerify = document.getElementById('org-id-verify').value;

                if (!execName || !phone || !brand || !webUrl || !address) {
                    alert("Please fill in all mandatory Employer registration fields.");
                    return;
                }

                profilePayload.executiveName = execName;
                profilePayload.contactPhone = phone;
                profilePayload.companyBrandingName = brand;
                profilePayload.officialWebsiteUrl = webUrl;
                profilePayload.headquartersAddress = address;
                profilePayload.sourcingSector = sector || "General Sourcing";
                profilePayload.gstInNumber = gst || "Omitted";
                profilePayload.businessVerificationId = idVerify || "Omitted";
            }

            // Create Authenticated Profile and Secure Firestore Document Storage
            createUserWithEmailAndPassword(auth, emailValue, passwordValue)
                .then((userCredential) => {
                    const dynamicCollectionName = targetRole === 'employee' ? "profiles_employee" : "profiles_employer";
                    
                    // Secure data mapping: Document ID matches the individual User's Unique ID
                    return setDoc(doc(db, dynamicCollectionName, userCredential.user.uid), profilePayload);
                })
                .then(() => {
                    alert("Account configuration initialized safely. Profile parameter node active!");
                    window.switchAppView('home');
                })
                .catch((err) => {
                    alert("Identity Allocation Error Exception: " + err.message);
                });
        });
    }

    // 3. PERSISTENT WORKSPACE HANDSHAKE LISTENER
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Isolated user session handshake live:", user.email);
        } else {
            console.log("No active validation routing session active.");
        }
    });
});
