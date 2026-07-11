// auth-ui.js - Shared header session display, built on existing firebase.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function updateHeaderUI(user, role, profileData) {
    const loggedOutBtn = document.getElementById("logged-out-btn");
    const loggedInDropdown = document.getElementById("logged-in-dropdown");
    const displayName = document.getElementById("header-display-name");
    const popoverName = document.getElementById("popover-user-name");
    const popoverEmail = document.getElementById("popover-user-email");

    if (!loggedOutBtn || !loggedInDropdown) return; // header not present on this page

    if (user) {
        loggedOutBtn.classList.add("hidden");
        loggedInDropdown.classList.remove("hidden");

        const nameToShow = profileData?.fullName || profileData?.executiveName || "My Account";
        if (displayName) displayName.innerText = nameToShow;
        if (popoverName) popoverName.innerText = nameToShow;
        if (popoverEmail) popoverEmail.innerText = user.email;

        const corporateLink = loggedInDropdown.querySelector('a[href*="employer-dashboard.html"], a[href*="employer.html"]');
        const workspaceLink = loggedInDropdown.querySelector('a[href*="employee-dashboard.html"], a[href*="workspace.html"]');

        if (role === "employer" && corporateLink) {
            corporateLink.href = "employer-dashboard.html";
        }
        if (role === "employee" && workspaceLink) {
            workspaceLink.href = "employee-dashboard.html";
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

    // Close the dropdown if the user clicks anywhere else on the page
    document.addEventListener("click", (e) => {
        if (!dropdownMenu.contains(e.target) && !menuButton.contains(e.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
}

// Wait for the header to actually be present in the DOM before wiring anything up
if (document.getElementById("logged-out-btn")) {
    initAuthUI();
    setupDropdownToggle();
} else {
    document.addEventListener("headerLoaded", () => {
        initAuthUI();
        setupDropdownToggle();
    });
}
