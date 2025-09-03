/********************************************
 * Firebase Config & Initialization (v12+)
 * Exports: app, auth, db
 ********************************************/

// Import SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOdNx5BPOL3w47iHekrPq0hagEmtSLfoQ",
  authDomain: "stbapp-22d32.firebaseapp.com",
  projectId: "stbapp-22d32",
  storageBucket: "stbapp-22d32.firebasestorage.app",
  messagingSenderId: "935950695197",
  appId: "1:935950695197:web:a2296484bf5aca67db7ff4"
};

// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ✅ Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
