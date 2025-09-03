/********************************************
 * Dashboard Page Logic (Fixed)
 ********************************************/
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* -------------------------------
   Toast Helper (local to dashboard)
--------------------------------*/
const toastEl = document.getElementById("toast");
window.showToast = (msg, type = "info") => {
  if (!toastEl) {
    alert(msg);
    return;
  }
  toastEl.textContent = msg;
  toastEl.dataset.type = type;
  toastEl.hidden = false;
  clearTimeout(window.__t);
  window.__t = setTimeout(() => (toastEl.hidden = true), 3000);
};

/* Elements */
const logoutBtn = document.getElementById("logoutBtn");
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const newBookingBtn = document.getElementById("newBookingBtn");
const appointmentsList = document.getElementById("appointmentsList");

let currentUser = null;
let currentRole = null;

/* Load Appointments */
async function loadAppointments(uid, email, role) {
  appointmentsList.innerHTML = "<p class='muted'>Loading appointments…</p>";

  try {
    let q;
    if (role === "student") {
      q = query(collection(db, "appointments"), where("studentId", "==", uid));
    } else if (role === "teacher") {
      q = query(collection(db, "appointments"), where("teacherEmail", "==", email));
    }

    const snap = await getDocs(q);
    appointmentsList.innerHTML = "";

    if (snap.empty) {
      appointmentsList.innerHTML = "<p class='muted'>No appointments found.</p>";
      return;
    }

    snap.forEach((docSnap) => {
      const appt = docSnap.data();
      const div = document.createElement("div");
      div.className = "appointment";
      div.innerHTML = `
        <strong>${appt.date} @ ${appt.time}</strong><br>
        <span>👨‍🎓 ${appt.studentEmail}</span><br>
        <span>👨‍🏫 ${appt.teacherEmail}</span><br>
        Status: <span class="badge ${appt.status}">${appt.status}</span>
      `;
      appointmentsList.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading appointments:", err);
    appointmentsList.innerHTML = "<p class='muted'>⚠️ Unable to load appointments.</p>";
  }
}

/* Auth Listener */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  try {
    // Get Firestore profile
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      // ✅ Fix: if no Firestore doc, create one
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName || "Unknown User",
        email: user.email,
        role: "student",
        createdAt: serverTimestamp()
      });
      currentRole = "student";
    } else {
      currentRole = snap.data().role || "student";
    }

    currentUser = user;
    loadAppointments(user.uid, user.email, currentRole);

  } catch (err) {
    console.error("Profile load error:", err);
    window.showToast("⚠️ Could not load profile", "error");
  }
});

/* Booking modal for students */
if (newBookingBtn && bookingForm && bookingModal) {
  newBookingBtn.addEventListener("click", () => bookingModal.showModal());

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const teacherEmail = document.getElementById("teacherEmail").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    try {
      await addDoc(collection(db, "appointments"), {
        studentId: currentUser.uid,
        studentEmail: currentUser.email,
        teacherEmail,
        date,
        time,
        status: "pending",
        createdAt: serverTimestamp()
      });

      window.showToast("📅 Booking request sent!", "success");
      bookingModal.close();
      bookingForm.reset();

      // Redirect to appointments page
      setTimeout(() => {
        window.location.href = "./appointments.html";
      }, 800);

    } catch (err) {
      console.error("Booking Error:", err);
      window.showToast("⚠️ Failed to create booking", "error");
    }
  });
}

/* Logout */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  });
}
