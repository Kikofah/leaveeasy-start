// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — เชื่อมต่อ Firebase / Firestore
//
// ต้องโหลดหลัง <script> ของ firebase-app-compat.js และ
// firebase-firestore-compat.js เสมอ (ดูตัวอย่างใน leave-requests.html)
//
// apiKey ของ Firebase web config ไม่ใช่ความลับ — ฝั่งเบราว์เซอร์เห็นได้เสมอ
// ความปลอดภัยจริงมาจาก Security Rules (จะเขียนสัปดาห์ที่ 8)
// ─────────────────────────────────────────────────────────────

var firebaseConfig = {
  apiKey: "AIzaSyAp_Z5RIad500ihCo9HZ2vHpmDs87Q7qu8",
  authDomain: "leaveeasy-witchudakhamsom.firebaseapp.com",
  projectId: "leaveeasy-witchudakhamsom",
  storageBucket: "leaveeasy-witchudakhamsom.firebasestorage.app",
  messagingSenderId: "940858551147",
  appId: "1:940858551147:web:18e8799fd33668d97cba2e",
  measurementId: "G-FETR1PWLR8"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
