// ─────────────────────────────────────────────────────────────
// js/dashboard.js — หน้าที่ 5 แดชบอร์ดสรุป
// นับตัวเลขจากข้อมูลจริงใน Firestore (นอกสเปกของ Module 2 — ทำเพิ่มตามที่ขอ)
// employee เห็นแค่ตัวเลข/รายการของใบลาตัวเอง เหมือนหน้ารายการใบลา
// ─────────────────────────────────────────────────────────────

(function () {
  var กล่องสรุป = document.getElementById("กล่องสรุปสถานะ");
  var กล่องล่าสุด = document.getElementById("ตารางล่าสุด");
  var ลำดับสถานะ = ["รอพิจารณา", "อนุมัติ", "ไม่อนุมัติ"];

  firebase.auth().onAuthStateChanged(function (ผู้ใช้) {
    if (!ผู้ใช้) {
      location.href = "login.html";
      return;
    }

    db.collection("users").doc(ผู้ใช้.uid).get().then(function (สแนปช็อตผู้ใช้) {
      var บทบาท = สแนปช็อตผู้ใช้.exists ? สแนปช็อตผู้ใช้.data().role : "employee";

      var คำสั่งดึงข้อมูล = db.collection("leaveRequests");
      if (บทบาท === "employee") {
        คำสั่งดึงข้อมูล = คำสั่งดึงข้อมูล.where("requesterId", "==", ผู้ใช้.uid);
      }
      return คำสั่งดึงข้อมูล.get();
    }).then(function (สแนปช็อต) {
      var รายการ = สแนปช็อต.docs.map(function (เอกสาร) {
        var ข้อมูล = เอกสาร.data();
        ข้อมูล.id = เอกสาร.id;
        return ข้อมูล;
      });
      แสดงสรุปสถานะ(รายการ);
      แสดงล่าสุด(รายการ);
    }).catch(function (ข้อผิดพลาด) {
      กล่องสรุป.innerHTML = "<p>โหลดข้อมูลจาก Firestore ไม่สำเร็จ: " + esc(ข้อผิดพลาด.message) + "</p>";
      กล่องล่าสุด.innerHTML = "";
    });
  });

  // ── กล่องตัวเลข 3 กล่องตามสถานะ กดแล้วไปหน้ารายการพร้อมกรองสถานะนั้น ──
  function แสดงสรุปสถานะ(รายการ) {
    var html = "";
    ลำดับสถานะ.forEach(function (สถานะ) {
      var จำนวน = รายการ.filter(function (ใบ) { return ใบ.status === สถานะ; }).length;
      html +=
        '<a class="stat" href="leave-requests.html?status=' + encodeURIComponent(สถานะ) + '">' +
        '<div class="number">' + จำนวน + "</div>" +
        "<div>" + esc(สถานะ) + "</div>" +
        "</a>";
    });
    กล่องสรุป.innerHTML = html;
  }

  // ── ใบลาล่าสุด 5 รายการ เรียงตามวันที่ยื่นใหม่ไปเก่า ──
  function แสดงล่าสุด(รายการ) {
    if (รายการ.length === 0) {
      กล่องล่าสุด.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var ล่าสุด5ใบ = รายการ.slice().sort(function (a, b) {
      return a.createdAt < b.createdAt ? 1 : -1;
    }).slice(0, 5);

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ยื่น</th>' +
      "</tr></thead><tbody>";

    ล่าสุด5ใบ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.createdAt) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่องล่าสุด.innerHTML = html;

    กล่องล่าสุด.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
