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

        const nameToShow = profileData?.fullName || profileData?.executiveName || "My Account";
        if (displayName) displayName.innerText = nameToShow;
        if (popoverName) popoverName.innerText = nameToShow;
        if (popoverEmail) popoverEmail.innerText = user.email;

        const corporateLink = loggedInDropdown.querySelector('a[href*="employer-dashboard.html"]');
        const workspaceLink = loggedInDropdown.querySelector('a[href*="employee-dashboard.html"]');

        // Show only the link relevant to this user's actual role
        if (role === "employer") {
            if (corporateLink) corporateLink.classList.remove("hidden");
            if (workspaceLink) workspaceLink.classList.add("hidden");
        } else if (role === "employee") {
            if (workspaceLink) workspaceLink.classList.remove("hidden");
            if (corporateLink) corporateLink.classList.add("hidden");
        }

    } else {
        loggedOutBtn.classList.remove("hidden");
        loggedInDropdown.classList.add("hidden");
    }
}

async function initAuthUI() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const employerRef = doc(db, "profiles_employer", user.uid);
            const employeeRef = doc(db, "profiles_employee", user.uid);

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

// Wait for the header to actually be present in the DOM before wiring anything up
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
