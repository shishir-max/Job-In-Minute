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
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInputValue = document.getElementById('login-email').value;

    // --- ADD THIS CRITICAL LINE HERE ---
    window.localStorage.setItem('emailForSignIn', emailInputValue);
    // ------------------------------------

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
// 3. INSIDE YOUR REGISTRATION FORM SUBMIT LISTENER
document.getElementById('auth-registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check whichever email input is active (Employee or Employer)
    const empEmail = document.getElementById('emp-email')?.value;
    const orgEmail = document.getElementById('org-email')?.value;
    const registrationEmail = empEmail || orgEmail;

    // --- ADD THIS CRITICAL LINE HERE ---
    window.localStorage.setItem('emailForSignIn', registrationEmail);
    // ------------------------------------

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

// 4. PASTE THIS AT THE ABSOLUTE BOTTOM OF YOUR FILE

function handleIncomingAuthenticationLink() {
    // Check if the current URL has the secure tracking link parameters from Firebase
    if (isSignInWithEmailLink(auth, window.location.href)) {
        
        // Pull the email address out of the browser memory that we saved in Step 2
        let email = window.localStorage.getItem('emailForSignIn');
        
        // Fallback: If they clicked the link on a different browser/device, ask them to type it in
        if (!email) {
            email = window.prompt('Security Check: Please confirm your registered email address to complete sign in:');
        }
        
        if (email) {
            // Send the email and URL details to Firebase to clear the login check
            signInWithEmailLink(auth, email, window.location.href)
                .then((result) => {
                    // Success! Remove the temporary email from storage
                    window.localStorage.removeItem('emailForSignIn');
                    
                    // Clean up the address bar so the long text string disappears
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    alert("Identity verified successfully! Welcome back to JobInMinute.");
                    
                    // (Optional) If you have a function to change screens after login, call it here:
                    // e.g., showDashboardView();
                })
                .catch((error) => {
                    console.error("Link handling error:", error);
                    alert("This verification link has expired or is invalid. Please request a new access link.");
                });
        }
    }
}

// RUN THIS IMMEDIATELY ON EVERY PAGE LOAD
handleIncomingAuthenticationLink();
/**
 * STREAM EMPLOYEES' OWN APPLICATIONS WITH LIVE STATUS AND TOGGLE DROPDOWNS
 */
export function listenToMyApplications(containerId) {
    const authInstance = getAuth();
    
    authInstance.onAuthStateChanged((user) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!user) {
            container.innerHTML = `<p class="text-slate-500 text-xs italic">Please log in to view your history.</p>`;
            return;
        }

        const q = query(collection(db, "applications"), where("candidateId", "==", user.uid));

        onSnapshot(q, async (querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = `<p class="text-slate-400 text-xs italic">You haven't applied to any positions yet.</p>`;
                return;
            }

            container.innerHTML = `<p class="text-slate-400 text-xs animate-pulse">Resolving job titles...</p>`;
            let htmlCards = [];

            for (const docSnap of querySnapshot.docs) {
                const appData = docSnap.data();
                const appId = docSnap.id;
                const applyDate = appData.appliedAt ? new Date(appData.appliedAt.seconds * 1000).toLocaleDateString() : "Pending";
                
                // Live Status Styling Switcher
                const status = appData.status || "Under Review";
                let statusClass = "bg-amber-50 text-amber-700 border-amber-200";
                if (status === "Selected") statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                if (status === "Rejected") statusClass = "bg-rose-50 text-rose-700 border-rose-200";

                // Fetch job title dynamically to replace the raw ID string
                let displayJobTitle = "Loading Position...";
                try {
                    const jobDocRef = doc(db, "jobs", appData.jobId);
                    const jobDocSnap = await getDoc(jobDocRef);
                    if (jobDocSnap.exists()) {
                        displayJobTitle = jobDocSnap.data().title;
                    } else {
                        displayJobTitle = "Archived Position";
                    }
                } catch (e) {
                    displayJobTitle = "Unknown Position Slot";
                }

                htmlCards.push(`
                    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:border-slate-300">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                            <div>
                                <h5 class="text-sm font-bold text-slate-900">${displayJobTitle}</h5>
                                <p class="text-[10px] text-slate-400 font-mono mt-0.5">Ref ID: ${appData.jobId}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${statusClass}">${status}</span>
                                <span class="text-[10px] font-medium text-slate-400">${applyDate}</span>
                            </div>
                        </div>
                        
                        <button onclick="document.getElementById('body-emp-${appId}').classList.toggle('hidden')" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 transition">
                            <span>Toggle Application Data View</span>
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        <div id="body-emp-${appId}" class="hidden mt-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                            <strong class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Your Submitted Resume Payload:</strong>
                            <p class="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">${appData.resumeInfo || "No structural text profile metrics found."}</p>
                        </div>
                    </div>
                `);
            }

            container.innerHTML = htmlCards.join("");
        }, (error) => {
            console.error(error);
            container.innerHTML = `<p class="text-rose-500 text-xs">Stream synchronization fault.</p>`;
        });
    });
}

// =========================================================================
// NEW RUNTIME PLATFORM ENGINE LOGIC
// =========================================================================

// --- 1. DYNAMIC INPUT VIEW FIELD SWITCHER ---
// --- 1. SEPARATED REGISTRATION PANEL TOGGLE ---
const regRoleSelector = document.getElementById('input-auth-role');
regRoleSelector?.addEventListener('change', (e) => {
    const role = e.target.value;
    const empFields = document.getElementById('employee-only-fields');
    const employerFields = document.getElementById('employer-only-fields');
    
    if (role === 'employer') {
        empFields.classList.add('hidden');
        employerFields.classList.remove('hidden');
        // Set Employer Mandates
        document.getElementById('orgName').required = true;
        document.getElementById('orgPhone').required = true;
        document.getElementById('orgEmail').required = true;
        document.getElementById('orgCorporateName').required = true;
        document.getElementById('orgAddress').required = true;
        document.getElementById('orgWebsite').required = true;
        // Turn off Employee Mandates
        document.getElementById('emp-name').required = false;
        document.getElementById('emp-phone').required = false;
        document.getElementById('emp-email').required = false;
        document.getElementById('empSector').required = false;
    } else {
        empFields.classList.remove('hidden');
        employerFields.classList.add('hidden');
        // Set Employee Mandates
        document.getElementById('emp-name').required = true;
        document.getElementById('emp-phone').required = true;
        document.getElementById('emp-email').required = true;
        document.getElementById('empSector').required = true;
        // Turn off Employer Mandates
        document.getElementById('orgName').required = false;
        document.getElementById('orgPhone').required = false;
        document.getElementById('orgEmail').required = false;
        document.getElementById('orgCorporateName').required = false;
        document.getElementById('orgAddress').required = false;
        document.getElementById('orgWebsite').required = false;
    }
});

// Initialize form requirement attributes on initial page mount load
if (regRoleSelector && regRoleSelector.value === 'employee') {
    document.getElementById('emp-name').required = true;
    document.getElementById('emp-phone').required = true;
    document.getElementById('emp-email').required = true;
    document.getElementById('empSector').required = true;
}

// --- 2. SEPARATED REGISTRATION DATA ENGINE ---
document.getElementById('auth-registration-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = regRoleSelector ? regRoleSelector.value : 'employee';
    const email = (role === 'employee') ? document.getElementById('emp-email').value : document.getElementById('org-email').value;

    const registrationDetails = {
        role: role,
        timestamp: new Date().getTime()
    };

    if (role === 'employee') {
        registrationDetails.name = document.getElementById('emp-name').value;
        registrationDetails.phone = document.getElementById('emp-phone').value;
        registrationDetails.email = email;
        registrationDetails.sector = document.getElementById('empSector').value;
        registrationDetails.address = document.getElementById('empAddress').value || "";
    } else {
        registrationDetails.contactPersonName = document.getElementById('orgName').value;
        registrationDetails.phone = document.getElementById('orgPhone').value;
        registrationDetails.businessEmail = email;
        registrationDetails.organisationName = document.getElementById('orgCorporateName').value;
        registrationDetails.organisationAddress = document.getElementById('orgAddress').value;
        registrationDetails.website = document.getElementById('orgWebsite').value;
        registrationDetails.sector = document.getElementById('orgSector').value || "";
        registrationDetails.gstNo = document.getElementById('orgGST').value.toUpperCase() || "";
        registrationDetails.registrationNo = document.getElementById('orgRegNo').value || "";
        registrationDetails.businessIdentity = document.getElementById('orgIdentity').value || "";
    }

    localStorage.setItem('pendingRegistrationEmail', email);
    localStorage.setItem('pendingRegistrationPayload', JSON.stringify(registrationDetails));

    const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
    };

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        alert("Verification Link Sent! Go check your email inbox to activate your account configuration profile.");
    } catch (error) {
        alert("Registration Refused: " + error.message);
    }
});

// --- 3. SEPARATED ACCESS GATE SIGN IN ENGINE ---
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const chosenRole = document.getElementById('login-role').value;

    const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
    };

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        localStorage.setItem('emailForSignIn', email);
        localStorage.setItem('loginRole', chosenRole);
        alert("Access Code Token Shipped! Open your email inbox to verify identification credentials and access the dashboard.");
    } catch (error) {
        alert("Authorization Denied: " + error.message);
    }
});

// --- 4. SECURE RECOVERY COMPLIANCE: SYSTEM PASSWORD MUTATION HANDLER ---
document.getElementById('btn-forgot-password')?.addEventListener('click', () => {
    const userMail = prompt("Please input your registered structural email address identifier:");
    if (!userMail) return;
    sendPasswordResetEmail(auth, userMail)
        .then(() => alert("A secure account recovery link has been dispatched to your email address."))
        .catch(err => alert("Recovery Refused: " + err.message));
});

// --- 5. CRYPTOGRAPHIC ACCESS TOKEN INTERCEPTOR AND ROUTER ---
async function processIncomingSecureEmailHandshake() {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn') || localStorage.getItem('pendingRegistrationEmail');
        
        if (!email) {
            email = prompt('Security Challenge: Re-confirm the exact email address used to request this link authorization:');
        }

        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            const user = result.user;
            
            localStorage.removeItem('emailForSignIn');
            localStorage.removeItem('pendingRegistrationEmail');

            // Determine if landing event maps to a new account creation commitment sequence
            const cachedPayload = localStorage.getItem('pendingRegistrationPayload');
            if (cachedPayload) {
                const data = JSON.parse(cachedPayload);
                localStorage.removeItem('pendingRegistrationPayload');

                const collectionTargetNode = data.role === 'employee' ? 'employees' : 'employers';
                await setDoc(doc(db, collectionTargetNode, user.uid), data);
                alert("Identity registration checks passed successfully!");
            }

            // Remove verification hashes from browser address path cleaner row
            window.history.replaceState({}, document.title, window.location.pathname);
            evaluateSessionAndUIRender(user);
        } catch (error) {
            alert("Security Link Handshake Failed or Session Timeout: " + error.message);
        }
    }
}
processIncomingSecureEmailHandshake();

// --- 6. ISOLATED DASHBOARD FIELD FILTER ENGINE ---
function evaluateSessionAndUIRender(user) {
    const authBox = document.getElementById('auth-panel');
    const dashboardBox = document.getElementById('dashboard-panel');

    if (user) {
        if (authBox) authBox.classList.add('hidden');
        if (dashboardBox) {
            dashboardBox.classList.remove('hidden');
            loadEmployerDashboardList(user.uid);
        }
    } else {
        if (authBox) authBox.classList.remove('hidden');
        if (dashboardBox) dashboardBox.classList.add('hidden');
    }
}

onAuthStateChanged(auth, (user) => {
    evaluateSessionAndUIRender(user);
});

document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));

async function loadEmployerDashboardList(currentUserId) {
    const listContainer = document.getElementById("employerJobsList");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    // Dashboard Shield: Explicit client-side logic to filter database pulls to matching user ID strings only
    const isolatedQuery = query(collection(db, "jobs"), where("postedById", "==", currentUserId));

    try {
        const querySnapshot = await getDocs(isolatedQuery);
        if (querySnapshot.empty) {
            listContainer.innerHTML = `<p class='text-xs text-slate-400 italic font-mono'>No job records managed by this profile owner key identifier.</p>`;
            return;
        }

        querySnapshot.forEach((jobDoc) => {
            const job = jobDoc.data();
            const jobId = jobDoc.id;
            const currentStatus = job.status === "Closed" ? "Closed" : "Active";
            
            const isClosed = currentStatus === "Closed";
            const badgeClass = isClosed ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-600 border-emerald-200";
            const actionLabel = isClosed ? "Set to Active" : "Close Job Listing";
            const buttonClass = isClosed ? "bg-slate-700 hover:bg-slate-800" : "bg-rose-600 hover:bg-rose-700";

            listContainer.innerHTML += `
                <div class="border border-slate-200 p-4 rounded-xl flex items-center justify-between bg-slate-50 shadow-sm">
                    <div>
                        <h4 class="font-bold text-sm text-slate-900">${job.title || 'Untitled Listing Position'}</h4>
                        <span class="inline-block mt-1 text-[10px] font-bold uppercase border px-2 py-0.5 rounded-md ${badgeClass}">
                            ${currentStatus}
                        </span>
                    </div>
                    <button data-id="${jobId}" data-status="${currentStatus}" class="btn-toggle-visibility text-xs text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${buttonClass}">
                        ${actionLabel}
                    </button>
                </div>
            `;
        });

        // Bind active listeners back dynamically to runtime toggle elements
        document.querySelectorAll('.btn-toggle-visibility').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const targetId = e.target.getAttribute('data-id');
                const stateFlag = e.target.getAttribute('data-status');
                const resolvedNextState = stateFlag === "Active" ? "Closed" : "Active";
                
                try {
                    await updateDoc(doc(db, "jobs", targetId), { status: resolvedNextState });
                    alert(`Job visibility updated: ${resolvedNextState}`);
                    loadEmployerDashboardList(currentUserId);
                } catch (err) {
                    alert("Write Access Denied by Server Firewalls: " + err.message);
                }
            });
        });

    } catch (err) {
        console.error("Dashboard extraction intercepted by firewall logic parameters: ", err.message);
    }
}
