/********************************************
 * Teacher Directory
 * - Load teachers from Firestore
 * - Search + filter
 * - Book directly
 ********************************************/
import { auth } from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase_config.js";
import { openBookingForTeacher } from "./appointments.js"; // ✅ import modal opener
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* -------------------------------
   Toast
--------------------------------*/
function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.dataset.type = type;
  el.hidden = false;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => (el.hidden = true), 3000);
}

/* -------------------------------
   Elements
--------------------------------*/
const teacherSearch = document.getElementById("teacherSearch");
const teacherList = document.getElementById("teacherList");

let teachers = [];
let currentUser = null;

/* -------------------------------
   Load Teachers
--------------------------------*/
async function loadTeachers() {
  const q = query(collection(db, "users"), where("role", "==", "teacher"));
  const snap = await getDocs(q);
  teachers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTeachers(teachers);
}

/* -------------------------------
   Render Teachers
--------------------------------*/
function renderTeachers(list) {
  teacherList.innerHTML = "";
  if (list.length === 0) {
    teacherList.innerHTML = "<p class='muted'>No teachers found.</p>";
    return;
  }

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "teacher-card";
    div.innerHTML = `
      <h3>${t.name}</h3>
      <div class="teacher-meta">
        <span>${t.department || "—"}</span> • 
        <span>${t.subject || "—"}</span><br>
        <small>${t.email}</small>
      </div>
    `;

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.textContent = "Book Appointment";
    btn.onclick = () => quickBook(t);

    div.appendChild(btn);
    teacherList.appendChild(div);
  });
}

/* -------------------------------
   Quick Book
--------------------------------*/
async function quickBook(teacher) {
  if (!currentUser) return;

  const date = prompt("Enter date (YYYY-MM-DD):");
  const time = prompt("Enter time (HH:MM):");
  if (!date || !time) return;

  try {
    await addDoc(collection(db, "appointments"), {
      studentId: currentUser.uid,
      studentEmail: currentUser.email,
      teacherEmail: teacher.email,
      date,
      time,
      notes: "",
      status: "pending",
      createdAt: serverTimestamp()
    });

    toast(`📩 Booking request sent to ${teacher.name}`, "success");
  } catch (err) {
    console.error(err);
    toast("Failed to book", "error");
  }
}

/* -------------------------------
   Search Filter
--------------------------------*/
if (teacherSearch) {
  teacherSearch.addEventListener("input", () => {
    const term = teacherSearch.value.toLowerCase();
    const filtered = teachers.filter(t =>
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.department && t.department.toLowerCase().includes(term)) ||
      (t.subject && t.subject.toLowerCase().includes(term))
    );
    renderTeachers(filtered);
  });
}

/* -------------------------------
   Init
--------------------------------*/
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadTeachers();
  }
});
function renderTeachers(list) {
  teacherList.innerHTML = "";
  if (list.length === 0) {
    teacherList.innerHTML = "<p class='muted'>No teachers found.</p>";
    return;
  }

  list.forEach(t => {
    const div = document.createElement("div");
    div.className = "teacher-card";

    // Avatar initials if no profile photo
    const initials = t.name ? t.name.charAt(0).toUpperCase() : "T";

    div.innerHTML = `
      <div class="teacher-header">
        <div class="teacher-avatar">${initials}</div>
        <div>
          <h3>${t.name}</h3>
          <div class="teacher-meta">${t.email}</div>
        </div>
      </div>
      <div class="badges">
        ${t.department ? `<span class="badge badge--dept">${t.department}</span>` : ""}
        ${t.subject ? `<span class="badge badge--subject">${t.subject}</span>` : ""}
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "teacher-actions";

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.textContent = "Book Appointment";
    btn.onclick = () => openBookingForTeacher(t.email);

    actions.appendChild(btn);
    div.appendChild(actions);
    teacherList.appendChild(div);
  });
}
