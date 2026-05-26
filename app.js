// Firebase Web SDK Version 10 Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. YOUR FIREBASE CONFIGURATION CONFIG
// ==========================================
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

// ==========================================
// 2. DOM INTERACTIVE UI SELECTORS
// ==========================================
const authModal = document.getElementById('authModal');
const loginNavBtn = document.getElementById('loginNavBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');

// Dynamic Dashboard Elements
const mainDashboard = document.getElementById('mainDashboard');
const userDisplayEmail = document.getElementById('userDisplayEmail');
const logoutBtn = document.getElementById('logoutBtn');
const heroHomeSection = document.getElementById('home');

console.log("Job-In-Minute application script is successfully active and running!");

// ==========================================
// 3. MODAL POPUP VISUAL WINDOW CONTROLS
// ==========================================
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

// ==========================================
// 4. FIREBASE AUTHENTICATION PIPELINES
// ==========================================

// Handle Login Submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (authMessage) {
            authMessage.style.color = "#635BFF";
            authMessage.textContent = "Verifying account details...";
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Success Responses
            if (authMessage) {
                authMessage.style.color = "#00D4B2";
                authMessage.textContent = "Access Granted! Welcome back.";
            }
            
            alert("Login Successful! Welcome back.");
            
            // Close the Popup Modal Window
            if (authModal) authModal.classList.remove('open');
            
            // TRANSFORMATION ENGINE: Force Dashboard layout visible, hide hero section
            if (mainDashboard) mainDashboard.classList.remove('hidden');
            if (userDisplayEmail) userDisplayEmail.textContent = email;
            if (heroHomeSection) heroHomeSection.style.display = 'none';
            if (loginNavBtn) loginNavBtn.style.display = 'none';

        } catch (error) {
            if (authMessage) {
                authMessage.style.color = "#EF4444";
                authMessage.textContent = `Login failed: ${error.message}`;
            }
            alert(`Login Error: ${error.message}`);
        }
    });
}

// Handle Sign Up Registration Submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (authMessage) {
            authMessage.style.color = "#635BFF";
            authMessage.textContent = "Building profile workspace...";
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            if (authMessage) {
                authMessage.style.color = "#00D4B2";
                authMessage.textContent = "Account generated successfully!";
            }
            
            alert("Registration Successful! Your account has been created.");
            if (authModal) authModal.classList.remove('open');
            
            // Automatically log them into the visual dashboard upon registering
            if (mainDashboard) mainDashboard.classList.remove('hidden');
            if (userDisplayEmail) userDisplayEmail.textContent = email;
            if (heroHomeSection) heroHomeSection.style.display = 'none';
            if (loginNavBtn) loginNavBtn.style.display = 'none';

        } catch (error) {
            if (authMessage) {
                authMessage.style.color = "#EF4444";
                authMessage.textContent = `Registration failed: ${error.message}`;
            }
            alert(`Registration Error: ${error.message}`);
        }
    });
}

// ==========================================
// 5. SECURE APPLICATION LOGOUT PIPELINE
// ==========================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (mainDashboard) mainDashboard.classList.add('hidden');
        if (heroHomeSection) heroHomeSection.style.display = 'flex';
        if (loginNavBtn) loginNavBtn.style.display = 'block';
        alert("You have logged out safely.");
    });
}
