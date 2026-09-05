// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
// ─────────────────────────────────────────────────────────────

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" }
  ];

  // ชื่อไฟล์ของหน้าที่กำลังเปิดอยู่ เอาไว้ขีดเส้นใต้เมนูที่ตรงกัน
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = m.href === หน้าปัจจุบัน ? ' class="active"' : "";
    html += '<a href="' + m.href + '"' + active + ">" + m.ชื่อ + "</a>";
  });
  // ช่องว่างสำหรับแสดงชื่อคนที่ล็อกอินอยู่ (เติมค่าในสัปดาห์ที่ 7)
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;

  // แสดงชื่อคนที่ล็อกอินอยู่ + ปุ่มออกจากระบบ (หรือลิงก์เข้าสู่ระบบถ้ายังไม่ได้ล็อกอิน)
  // เมนู "ประเภทการลา" โชว์เฉพาะฝ่ายบุคคล (hr) ตาม ACL.md
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (ผู้ใช้) {
      var กล่องผู้ใช้ = document.getElementById("navUser");
      var ลิงก์ประเภทการลา = document.querySelector('#nav a[href="leave-types.html"]');
      if (!กล่องผู้ใช้) return;
      กล่องผู้ใช้.innerHTML = "";

      if (ผู้ใช้) {
        var ป้ายชื่อ = document.createElement("span");
        ป้ายชื่อ.textContent = "👤 " + (ผู้ใช้.displayName || ผู้ใช้.email);

        var ปุ่มออก = document.createElement("a");
        ปุ่มออก.href = "#";
        ปุ่มออก.textContent = "ออกจากระบบ";
        ปุ่มออก.addEventListener("click", function (e) {
          e.preventDefault();
          firebase.auth().signOut().then(function () { location.href = "login.html"; });
        });

        กล่องผู้ใช้.appendChild(ป้ายชื่อ);
        กล่องผู้ใช้.appendChild(document.createTextNode(" · "));
        กล่องผู้ใช้.appendChild(ปุ่มออก);

        if (ลิงก์ประเภทการลา && typeof db !== "undefined") {
          db.collection("users").doc(ผู้ใช้.uid).get().then(function (สแนปช็อต) {
            var บทบาท = สแนปช็อต.exists ? สแนปช็อต.data().role : "employee";
            ลิงก์ประเภทการลา.classList.toggle("hidden", บทบาท !== "hr");
          });
        }
      } else {
        var ลิงก์เข้าสู่ระบบ = document.createElement("a");
        ลิงก์เข้าสู่ระบบ.href = "login.html";
        ลิงก์เข้าสู่ระบบ.textContent = "เข้าสู่ระบบ";
        กล่องผู้ใช้.appendChild(ลิงก์เข้าสู่ระบบ);

        if (ลิงก์ประเภทการลา) ลิงก์ประเภทการลา.classList.add("hidden");
      }
    });
  }
})();

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ SETUP.md ขั้นที่ 4";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}
