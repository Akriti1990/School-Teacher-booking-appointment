/********************************************
 * Student–Teacher Booking App (Frontend JS)
 * Handles:
 *  - Register (Email/Pass)
 *  - Login
 *  - Google Sign-in
 *  - Forgot Password
 *  - Logging to Firestore
 ********************************************/

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase_config.js";

/* -------------------------------
   Helpers
--------------------------------*/
async function logAction(action, details = {}) {
  console.log(`[LOG] ${action}`, details);
  try {
    await addDoc(collection(db, "logs"), {
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn("Log write failed:", err.message);
  }
}

function toast(msg, type = "info") {
  if (window.showToast) {
    window.showToast(msg, type);
  } else {
    alert(msg);
  }
}

/* -------------------------------
   Register
--------------------------------*/
const regForm = document.getElementById("panel-register");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const role = document.getElementById("regRole").value;
    const dept = document.getElementById("regDept").value.trim();
    const subject = document.getElementById("regSubject").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const password2 = document.getElementById("regPassword2").value;

    if (password !== password2) {
      toast("Passwords do not match ❌", "error");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        department: dept || null,
        subject: subject || null,
        createdAt: serverTimestamp()
      });

      logAction("User Registered", { email, role });
      toast("🎉 Account created successfully!", "success");

      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast("This email is already registered. Try logging in.", "error");
      } else {
        toast(err.message, "error");
      }
    }
  });
}

/* -------------------------------
   Login
--------------------------------*/
const loginForm = document.getElementById("panel-login");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      logAction("User Login", { email });
      toast("✅ Logged in successfully!", "success");

      // Redirect
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      toast(err.message, "error");
    }
  });
}

/* -------------------------------
   Google Sign-In
--------------------------------*/
const googleBtn = document.getElementById("btnGoogle");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save/update Firestore profile
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        role: "student", // default role
        createdAt: serverTimestamp()
      }, { merge: true });

      logAction("User Login (Google)", { email: user.email });
      toast("🎯 Signed in with Google!", "success");

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      toast(err.message, "error");
    }
  });
}

/* -------------------------------
   Forgot Password
--------------------------------*/
const forgotLink = document.getElementById("forgotPasswordLink");
if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt("Enter your registered email:");
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      toast("📩 Password reset email sent!", "success");
      logAction("Password Reset Requested", { email });
    } catch (err) {
      console.error(err);
      toast(err.message, "error");
    }
  });
}

/* -------------------------------
   Logout (used in dashboard)
--------------------------------*/
export async function logout() {
  try {
    await signOut(auth);
    logAction("User Logout");
    toast("👋 Logged out successfully!", "success");
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    toast(err.message, "error");
  }
}
