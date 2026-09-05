// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มล็อกอิน");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มเข้าสู่ระบบ = document.getElementById("ปุ่มเข้าสู่ระบบ");

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกอีเมลและรหัสผ่านก่อนกดเข้าสู่ระบบ");
      return;
    }

    กล่องเตือน.classList.add("hidden");
    ปุ่มเข้าสู่ระบบ.disabled = true;
    ปุ่มเข้าสู่ระบบ.textContent = "กำลังเข้าสู่ระบบ…";

    firebase.auth().signInWithEmailAndPassword(อีเมล, รหัสผ่าน).then(function () {
      location.href = "leave-requests.html";
    }).catch(function (ข้อผิดพลาด) {
      เตือน("เข้าสู่ระบบไม่สำเร็จ: " + ข้อผิดพลาด.message);
      ปุ่มเข้าสู่ระบบ.disabled = false;
      ปุ่มเข้าสู่ระบบ.textContent = "เข้าสู่ระบบ";
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
