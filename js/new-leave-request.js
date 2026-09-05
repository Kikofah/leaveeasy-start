// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: ประเภทการลาอ่านจาก Firestore จริง และบันทึกใบลาใหม่ลง Firestore จริง
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มบันทึก = document.getElementById("ปุ่มบันทึก");
  var ประเภทการลาทั้งหมด = [];

  // เติมรายการเลื่อนลงด้วยประเภทการลาจริงจาก Firestore
  db.collection("leaveTypes").get().then(function (สแนปช็อต) {
    ประเภทการลาทั้งหมด = สแนปช็อต.docs.map(function (เอกสาร) {
      return { id: เอกสาร.id, name: เอกสาร.data().name };
    });
    ประเภทการลาทั้งหมด.forEach(function (ประเภท) {
      var ตัวเลือก = document.createElement("option");
      ตัวเลือก.value = ประเภท.id;
      ตัวเลือก.textContent = ประเภท.name;
      ช่องประเภท.appendChild(ตัวเลือก);
    });
  }).catch(function (ข้อผิดพลาด) {
    เตือน("โหลดประเภทการลาจาก Firestore ไม่สำเร็จ: " + ข้อผิดพลาด.message);
  });

  ฟอร์ม.addEventListener("submit", function (e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    var ประเภท = ประเภทการลาทั้งหมด.find(function (t) { return t.id === ค่า.leaveTypeId; });

    // สัปดาห์ที่ 7 ยังไม่มีล็อกอิน จึงสมมติว่าผู้ขอลาคือ สมชาย ใจดี
    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "",      approverName: "",
      leaveTypeId: ประเภท.id, leaveTypeName: ประเภท.name,
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    };

    กล่องเตือน.classList.add("hidden");
    ปุ่มบันทึก.disabled = true;
    ปุ่มบันทึก.textContent = "กำลังบันทึก…";

    db.collection("leaveRequests").add(ใบใหม่).then(function () {
      location.href = "leave-requests.html";
    }).catch(function (ข้อผิดพลาด) {
      เตือน("บันทึกลง Firestore ไม่สำเร็จ: " + ข้อผิดพลาด.message);
      ปุ่มบันทึก.disabled = false;
      ปุ่มบันทึก.textContent = "บันทึก";
    });
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();
