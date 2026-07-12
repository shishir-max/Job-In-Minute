// auth-ui.js - Shared header session display, built on existing firebase.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function updateHeaderUI(user, role, profileData) {
    const loggedOutBtn = document.getElementById("logged-out-btn");
    const loggedInDropdown = document.getElementById("logged-in-dropdown");
    const displayName = document.getElementById("header-display-name");
    const popoverName = document.getElementById("popover-user-name");
    const popoverEmail = document.getElementById("popover-user-email");

    if (!loggedOutBtn || !loggedInDropdown) return;

    if (user) {
        loggedOutBtn.classList.add("hidden");
        loggedInDropdown.classList.remove("hidden");

        const nameToShow = profileData?.name || "My Account";
        if (displayName) displayName.innerText = nameToShow;
        if (popoverName) popoverName.innerText = nameToShow;
        if (popoverEmail) popoverEmail.innerText = user.email;

        const settingsLink = loggedInDropdown.querySelector('a[href*="dashboard.html"], a[href*="account-settings.html"]');
        if (settingsLink && role) {
            settingsLink.href = role === "employer" ? "employer-dashboard.html?openSettings=true" : "employee-dashboard.html?openSettings=true";
        }

    } else {
        loggedOutBtn.classList.remove("hidden");
        loggedInDropdown.classList.add("hidden");
    }
}

async function initAuthUI() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const employerRef = doc(db, "employers", user.uid);
            const employeeRef = doc(db, "employees", user.uid);

            const [employerSnap, employeeSnap] = await Promise.all([
                getDoc(employerRef),
                getDoc(employeeRef)
            ]);

            if (employerSnap.exists()) {
                updateHeaderUI(user, "employer", employerSnap.data());
            } else if (employeeSnap.exists()) {
                updateHeaderUI(user, "employee", employeeSnap.data());
            } else {
                updateHeaderUI(user, null, null);
            }
        } else {
            updateHeaderUI(null, null, null);
        }
    });
}

function setupDropdownToggle() {
    const menuButton = document.getElementById("user-menu-button");
    const dropdownMenu = document.getElementById("logged-in-dropdown-menu");

    if (!menuButton || !dropdownMenu) return;

    menuButton.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!dropdownMenu.contains(e.target) && !menuButton.contains(e.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
}

function setupSignOut() {
    const disconnectBtn = document.getElementById("disconnect-account-btn");
    if (!disconnectBtn) return;

    disconnectBtn.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                localStorage.clear();
                window.location.href = "index.html";
            })
            .catch((err) => {
                alert("Sign out failed: " + err.message);
            });
    });
}

if (document.getElementById("logged-out-btn")) {
    initAuthUI();
    setupDropdownToggle();
    setupSignOut();
} else {
    document.addEventListener("headerLoaded", () => {
        initAuthUI();
        setupDropdownToggle();
        setupSignOut();
    });
}
