// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านข้อมูลจริงจาก Firestore (โฟลเดอร์ leaveRequests)
// employee เห็นเฉพาะใบลาของตัวเอง · manager/hr เห็นทุกใบ (ตาม ACL.md)
// ─────────────────────────────────────────────────────────────

(function () {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น
  var สถานะที่กรอง = ค่าจากURL("status");
  if (สถานะที่กรอง) {
    document.querySelector(".subtitle").textContent =
      "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
  }

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
      if (สถานะที่กรอง) {
        คำสั่งดึงข้อมูล = คำสั่งดึงข้อมูล.where("status", "==", สถานะที่กรอง);
      }

      return คำสั่งดึงข้อมูล.get();
    }).then(function (สแนปช็อต) {
      var รายการ = สแนปช็อต.docs.map(function (เอกสาร) {
        var ข้อมูล = เอกสาร.data();
        ข้อมูล.id = เอกสาร.id;
        return ข้อมูล;
      });
      แสดงตาราง(รายการ);
    }).catch(function (ข้อผิดพลาด) {
      กล่อง.innerHTML = "<p>โหลดข้อมูลจาก Firestore ไม่สำเร็จ: " + esc(ข้อผิดพลาด.message) + "</p>";
    });
  });

  function แสดงตาราง(รายการ) {
    document.getElementById("จำนวนทั้งหมด").textContent = "ทั้งหมด " + รายการ.length + " ใบ";

    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();
