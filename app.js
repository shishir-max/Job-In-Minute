// Firebase Web SDK Version 10 Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase Config Block (Make sure to paste your real keys inside these quotes if you have them!)
const firebaseConfig = {
  apiKey: "AIzaSyAsgjVxoK6eJuWl-ofbL1VLEHXld13_wV0",
  authDomain: "job-in-minute.firebaseapp.com",
  projectId: "job-in-minute",
  storageBucket: "job-in-minute.firebasestorage.app",
  messagingSenderId: "507249342731",
  appId: "1:507249342731:web:0db15814ee9c454c8f0a0e"
};

// Initialize Core Application Pipeline
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* DOM UI Target Selectors */
const authModal = document.getElementById('authModal');
const loginNavBtn = document.getElementById('loginNavBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');

console.log("Job-In-Minute script with Firebase integration successfully loaded!");

/* Modal Visual Controls */
if (loginNavBtn && authModal) {
    loginNavBtn.addEventListener('click', () => {
        authModal.classList.add('open');
        if (authMessage) authMessage.textContent = "";
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        authModal.classList.remove('open');
    });
}

if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

/* Data Processing Execution Handlers */
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        authMessage.style.color = "#635BFF";
        authMessage.textContent = "Verifying account details...";

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            authMessage.style.color = "#00D4B2";
            authMessage.textContent = "Access Granted! Welcome back.";
            setTimeout(() => authModal.classList.remove('open'), 1500);
        } catch (error) {
            authMessage.style.color = "#EF4444";
            authMessage.textContent = `Login failed: ${error.message}`;
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        authMessage.style.color = "#635BFF";
        authMessage.textContent = "Building profile workspace...";

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            authMessage.style.color = "#00D4B2";
            authMessage.textContent = "Account generated successfully!";
            setTimeout(() => authModal.classList.remove('open'), 1500);
        } catch (error) {
            authMessage.style.color = "#EF4444";
            authMessage.textContent = `Registration failed: ${error.message}`;
        }
    });
}
