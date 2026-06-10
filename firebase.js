// firebase.js - Core SDK Initialization & Platform Streams
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
