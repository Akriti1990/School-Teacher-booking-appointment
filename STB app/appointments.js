/********************************************
 * Appointments Page Logic
 ********************************************/
import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  doc, getDoc, collection, query, where, getDocs, updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { logout } from "./script.js";

/* Elements */
const appointmentsContainer = document.getElementById("appointmentsContainer");
const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");

/* Role-based Appointment Loader */
async function loadAppointments(uid, email, role) {
  appointmentsContainer.innerHTML = "<p class='muted'>Loading…</p>";

  try {
    let q;
    if (role === "student") {
      q = query(collection(db, "appointments"), where("studentId", "==", uid));
    } else if (role === "teacher") {
      q = query(collection(db, "appointments"), where("teacherEmail", "==", email));
    }

    const snap = await getDocs(q);
    appointmentsContainer.innerHTML = "";

    snap.forEach((docSnap) => {
      const appt = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "appointment";
      div.innerHTML = `
        <strong>${appt.date} @ ${appt.time}</strong><br>
        <span>👨‍🎓 ${appt.studentEmail}</span><br>
        <span>👨‍🏫 ${appt.teacherEmail}</span><br>
        Status: <span class="badge">${appt.status}</span>
        ${appt.notes ? `<br><small>📝 ${appt.notes}</small>` : ""}
      `;

      // Teacher-only controls
      if (role === "teacher" && appt.teacherEmail === email && appt.status === "pending") {
        const btnApprove = document.createElement("button");
        btnApprove.className = "btn btn--primary";
        btnApprove.textContent = "Approve";
        btnApprove.onclick = async () => {
          await updateDoc(doc(db, "appointments", id), { status: "approved" });
          window.showToast("✅ Booking approved", "success");
          loadAppointments(uid, email, role);
        };

        const btnReject = document.createElement("button");
        btnReject.className = "btn btn--ghost";
        btnReject.textContent = "Reject";
        btnReject.onclick = async () => {
          await updateDoc(doc(db, "appointments", id), { status: "rejected" });
          window.showToast("❌ Booking rejected", "error");
          loadAppointments(uid, email, role);
        };

        div.appendChild(btnApprove);
        div.appendChild(btnReject);
      }

      appointmentsContainer.appendChild(div);
    });

    if (appointmentsContainer.innerHTML === "") {
      appointmentsContainer.innerHTML = "<p class='muted'>No appointments found.</p>";
    }
  } catch (err) {
    console.error("Error loading appointments:", err);
    appointmentsContainer.innerHTML = "<p class='muted'>⚠️ Unable to load appointments.</p>";
  }
}

/* Auth Listener */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const profile = snap.data();
  const role = profile?.role || "student";

  loadAppointments(user.uid, user.email, role);
});

/* Back to Dashboard */
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

/* Logout */
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

/* Footer Year */
document.getElementById("year").textContent = new Date().getFullYear();
const statusClass =
  appt.status === "approved" ? "approved" :
  appt.status === "rejected" ? "rejected" : "pending";

div.innerHTML = `
  <strong>${appt.date} @ ${appt.time}</strong><br>
  <span>👨‍🎓 ${appt.studentEmail}</span><br>
  <span>👨‍🏫 ${appt.teacherEmail}</span><br>
  Status: <span class="badge ${statusClass}">${appt.status}</span>
  ${appt.notes ? `<br><small>📝 ${appt.notes}</small>` : ""}
`;
