// Firebase SDK Version 10 Web App Initialization Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Config Configuration Block
const firebaseConfig = {
    apiKey: "", 
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Initialize Active Services Execution Pipe
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* DOM UI Interactive Elements Target Selectors */
const authModal = document.getElementById('authModal');
const loginNavBtn = document.getElementById('loginNavBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');

/* UI Modal Window Click Controls */
loginNavBtn.addEventListener('click', () => {
    authModal.classList.add('open');
    authMessage.textContent = "";
});

closeModalBtn.addEventListener('click', () => {
    authModal.classList.remove('open');
});

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

/* Interactive Submission Pipelines */
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    authMessage.style.color = "#635BFF";
    authMessage.textContent = "Registering profile security path...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        authMessage.style.color = "#00D4B2";
        authMessage.textContent = "Registration Successful! Account created.";
        setTimeout(() => authModal.classList.remove('open'), 2000);
    } catch (error) {
        authMessage.style.color = "#EF4444";
        authMessage.textContent = `Registration Error: ${error.message}`;
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    authMessage.style.color = "#635BFF";
    authMessage.textContent = "Verifying credentials...";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        authMessage.style.color = "#00D4B2";
        authMessage.textContent = "Access Granted! Logging in...";
        setTimeout(() => authModal.classList.remove('open'), 2000);
    } catch (error) {
        authMessage.style.color = "#EF4444";
        authMessage.textContent = `Login Error: ${error.message}`;
    }
});
