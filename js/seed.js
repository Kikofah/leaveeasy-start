// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างลง Firestore ครั้งเดียว
// ข้อมูลชุดนี้คัดลอกมาจาก leaveeasy-spec.md หัวข้อ 7 เป๊ะ ๆ
// (ชื่อไฟล์เอกสารเป็นรหัสเดียวกับที่สเปกกำหนด เช่น u001, lr001, ap001)
// ─────────────────────────────────────────────────────────────

(function () {
  var ปุ่ม = document.getElementById("ปุ่มใส่ข้อมูล");
  var กล่องสถานะ = document.getElementById("สถานะ");

  var users = {
    u001: { name: "สมชาย ใจดี",   email: "somchai@example.com", role: "employee" },
    u002: { name: "สมหญิง รักงาน", email: "somying@example.com", role: "manager" },
    u003: { name: "สมศรี ตั้งใจ",  email: "somsri@example.com",  role: "hr" }
  };

  var leaveTypes = {
    lt001: { name: "ลาพักร้อน" },
    lt002: { name: "ลาป่วย" },
    lt003: { name: "ลากิจ" }
  };

  var leaveRequests = {
    lr001: {
      title: "ลาพักร้อนไปเที่ยวกับครอบครัว",
      reason: "วางแผนเดินทางไปต่างจังหวัดกับครอบครัว จองที่พักไว้ล่วงหน้าแล้ว",
      status: "รอพิจารณา",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
      startDate: "2026-09-07", endDate: "2026-09-09",
      createdAt: "2026-09-01 09:15",
      approvals: [
        { id: "ap001", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "รับเรื่องแล้ว ขอดูตารางงานของทีมช่วงนั้นก่อนนะครับ", createdAt: "2026-09-01 13:40" },
        { id: "ap002", authorId: "u003", authorName: "สมศรี ตั้งใจ",
          message: "ตรวจแล้ว วันลาพักร้อนคงเหลือครอบคลุมช่วงที่ขอ ไม่ติดขัดฝั่งฝ่ายบุคคล", createdAt: "2026-09-02 10:05" }
      ]
    },
    lr002: {
      title: "ลาป่วยไข้หวัดใหญ่",
      reason: "มีไข้สูงและไอมาก แพทย์แนะนำให้พักอยู่บ้าน 2 วัน",
      status: "อนุมัติ",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
      startDate: "2026-08-24", endDate: "2026-08-25",
      createdAt: "2026-08-24 08:05",
      approvals: [
        { id: "ap003", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "อนุมัติแล้ว พักผ่อนให้เต็มที่ งานที่ค้างไว้เดี๋ยวทีมช่วยดูให้", createdAt: "2026-08-24 09:20" }
      ]
    },
    lr003: {
      title: "ลากิจไปทำบัตรประชาชน",
      reason: "บัตรประชาชนหมดอายุ ต้องไปทำที่สำนักงานเขตในวันทำการ",
      status: "รอพิจารณา",
      requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
      approverId: "",      approverName: "",
      leaveTypeId: "lt003", leaveTypeName: "ลากิจ",
      startDate: "2026-09-15", endDate: "2026-09-15",
      createdAt: "2026-09-10 16:30",
      approvals: []
    },
    lr004: {
      title: "ลาพักร้อนช่วงวันหยุดยาว",
      reason: "อยากต่อวันหยุดยาวไปพักผ่อนกับครอบครัวอีก 3 วัน",
      status: "ไม่อนุมัติ",
      requesterId: "u003", requesterName: "สมศรี ตั้งใจ",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt001", leaveTypeName: "ลาพักร้อน",
      startDate: "2026-10-12", endDate: "2026-10-16",
      createdAt: "2026-09-20 11:00",
      approvals: [
        { id: "ap004", authorId: "u002", authorName: "สมหญิง รักงาน",
          message: "ช่วงนั้นทีมมีงานส่งมอบพอดี ขอเลื่อนเป็นสัปดาห์ถัดไปได้ไหมครับ", createdAt: "2026-09-20 15:10" }
      ]
    },
    lr005: {
      title: "ลาป่วยไปพบแพทย์ตามนัด",
      reason: "มีนัดตรวจติดตามอาการกับแพทย์ในช่วงเช้า",
      status: "รอพิจารณา",
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "u002",  approverName: "สมหญิง รักงาน",
      leaveTypeId: "lt002", leaveTypeName: "ลาป่วย",
      startDate: "2026-09-22", endDate: "2026-09-22",
      createdAt: "2026-09-18 14:45",
      approvals: []
    }
  };

  ปุ่ม.addEventListener("click", function () {
    ปุ่ม.disabled = true;
    กล่องสถานะ.innerHTML = "<p>กำลังใส่ข้อมูล…</p>";

    ใส่ผู้ใช้()
      .then(ใส่ประเภทการลา)
      .then(ใส่ใบลา)
      .then(function () {
        กล่องสถานะ.innerHTML = "<p>เสร็จแล้ว — เปิด Firebase Console เพื่อตรวจสอบข้อมูลได้เลย</p>";
        ปุ่ม.disabled = false;
      })
      .catch(function (ข้อผิดพลาด) {
        กล่องสถานะ.innerHTML = "<p>ใส่ข้อมูลไม่สำเร็จ: " + esc(ข้อผิดพลาด.message) + "</p>";
        ปุ่ม.disabled = false;
      });
  });

  function ใส่ผู้ใช้() {
    var งานทั้งหมด = Object.keys(users).map(function (รหัส) {
      return db.collection("users").doc(รหัส).set(users[รหัส]);
    });
    return Promise.all(งานทั้งหมด);
  }

  function ใส่ประเภทการลา() {
    var งานทั้งหมด = Object.keys(leaveTypes).map(function (รหัส) {
      return db.collection("leaveTypes").doc(รหัส).set(leaveTypes[รหัส]);
    });
    return Promise.all(งานทั้งหมด);
  }

  function ใส่ใบลา() {
    var งานทั้งหมด = Object.keys(leaveRequests).map(function (รหัส) {
      var ใบ = leaveRequests[รหัส];
      var ความเห็นทั้งหมด = ใบ.approvals;
      var ข้อมูลใบลา = Object.assign({}, ใบ);
      delete ข้อมูลใบลา.approvals;

      return db.collection("leaveRequests").doc(รหัส).set(ข้อมูลใบลา).then(function () {
        var งานความเห็น = ความเห็นทั้งหมด.map(function (ความเห็น) {
          var รหัสความเห็น = ความเห็น.id;
          var ข้อมูลความเห็น = Object.assign({}, ความเห็น);
          delete ข้อมูลความเห็น.id;
          return db.collection("leaveRequests").doc(รหัส)
            .collection("approvals").doc(รหัสความเห็น).set(ข้อมูลความเห็น);
        });
        return Promise.all(งานความเห็น);
      });
    });
    return Promise.all(งานทั้งหมด);
  }
})();
