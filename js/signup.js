// ─────────────────────────────────────────────────────────────
// js/signup.js — หน้าสมัครสมาชิก
// สมัครสำเร็จแล้วสร้างไฟล์ใหม่ในโฟลเดอร์ users พร้อม role เริ่มต้นเป็น employee
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มสมัคร = document.getElementById("ปุ่มสมัคร");

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var ชื่อ = document.getElementById("name").value.trim();
    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดสมัคร");
      return;
    }

    กล่องเตือน.classList.add("hidden");
    ปุ่มสมัคร.disabled = true;
    ปุ่มสมัคร.textContent = "กำลังสมัคร…";

    firebase.auth().createUserWithEmailAndPassword(อีเมล, รหัสผ่าน).then(function (ข้อมูลผู้ใช้) {
      return ข้อมูลผู้ใช้.user.updateProfile({ displayName: ชื่อ }).then(function () {
        return db.collection("users").doc(ข้อมูลผู้ใช้.user.uid).set({
          name: ชื่อ,
          email: อีเมล,
          role: "employee"
        });
      });
    }).then(function () {
      location.href = "leave-requests.html";
    }).catch(function (ข้อผิดพลาด) {
      เตือน("สมัครสมาชิกไม่สำเร็จ: " + ข้อผิดพลาด.message);
      ปุ่มสมัคร.disabled = false;
      ปุ่มสมัคร.textContent = "สมัครสมาชิก";
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
