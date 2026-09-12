// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: ประเภทการลาอ่านจาก Firestore จริง และบันทึกใบลาใหม่ลง Firestore จริง
// ผู้ขอลาคือคนที่ล็อกอินอยู่จริง (ต้องล็อกอินก่อนถึงเข้าหน้านี้ได้)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มบันทึก = document.getElementById("ปุ่มบันทึก");
  var ปุ่มAI = document.getElementById("ปุ่มAI");
  var กล่องAI = document.getElementById("กล่องAI");
  var ประเภทการลาทั้งหมด = [];
  var ผู้ใช้ปัจจุบัน = null;

  firebase.auth().onAuthStateChanged(function (ผู้ใช้) {
    if (!ผู้ใช้) {
      location.href = "login.html";
      return;
    }
    ผู้ใช้ปัจจุบัน = ผู้ใช้;
  });

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

  ปุ่มAI.addEventListener("click", จัดประเภทด้วยAI);

  function แจ้งAI(ข้อความ, ระดับ) {
    กล่องAI.className = "alert alert-" + (ระดับ || "ai");
    กล่องAI.textContent = ข้อความ;
  }

  function จัดประเภทด้วยAI() {
    var เหตุผล = document.getElementById("reason").value.trim();

    if (!เหตุผล) {
      แจ้งAI("พิมพ์เหตุผลการลาก่อน แล้วค่อยกดให้ AI ช่วยจัดประเภท", "warn");
      return;
    }
    if (ประเภทการลาทั้งหมด.length === 0) {
      แจ้งAI("ยังโหลดรายชื่อประเภทการลาจาก Firestore ไม่เสร็จ กรุณารอสักครู่แล้วลองใหม่", "warn");
      return;
    }

    var คีย์ = window.OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key");
    if (!คีย์) {
      คีย์ = prompt("ใส่ OpenRouter API Key (จะถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น ไม่ถูกบันทึกลงไฟล์)");
      if (!คีย์) return;
      localStorage.setItem("openrouter_api_key", คีย์);
    }

    ปุ่มAI.disabled = true;
    แจ้งAI("กำลังถาม AI…", "ai");

    var รายชื่อประเภท = ประเภทการลาทั้งหมด.map(function (t) {
      return { id: t.id, name: t.name };
    });

    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + คีย์,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "คุณคือผู้ช่วยจัดประเภทการลา จะได้รับเหตุผลการลาและรายชื่อประเภทการลาที่มีอยู่จริงในระบบเท่านั้น " +
              "ให้เลือกประเภทที่ตรงที่สุดหนึ่งประเภทจากรายการที่ให้มา แล้วตอบกลับด้วย id ของประเภทนั้นเพียงอย่างเดียว ห้ามตอบอย่างอื่นเพิ่ม " +
              "ถ้าไม่มีประเภทไหนตรงหรือไม่มั่นใจ ให้ตอบคำว่า ไม่แน่ใจ เท่านั้น"
          },
          {
            role: "user",
            content: JSON.stringify({ เหตุผลการลา: เหตุผล, ประเภทการลาที่มีอยู่จริง: รายชื่อประเภท })
          }
        ]
      })
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error((data.error && data.error.message) || ("HTTP " + response.status));
        }
        return data;
      });
    }).then(function (data) {
      var คำตอบ = ((data.choices && data.choices[0] && data.choices[0].message.content) || "").trim();
      var ที่ตรงกัน = ประเภทการลาทั้งหมด.find(function (t) { return t.id === คำตอบ; });

      if (!ที่ตรงกัน) {
        ที่ตรงกัน = ประเภทการลาทั้งหมด.find(function (t) { return t.name === คำตอบ; });
      }

      if (ที่ตรงกัน) {
        ช่องประเภท.value = ที่ตรงกัน.id;
        แจ้งAI("AI แนะนำ: " + ที่ตรงกัน.name + " — ตรวจสอบและกดบันทึกได้เลย", "ai");
      } else {
        แจ้งAI("AI ไม่สามารถจัดประเภทให้ได้ชัดเจน กรุณาเลือกเอง", "warn");
      }
    }).catch(function (ข้อผิดพลาด) {
      แจ้งAI("เรียก AI ไม่สำเร็จ: " + ข้อผิดพลาด.message, "error");
    }).finally(function () {
      ปุ่มAI.disabled = false;
    });
  }

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
    if (!ผู้ใช้ปัจจุบัน) {
      เตือน("ระบบยังตรวจสอบการล็อกอินไม่เสร็จ กรุณารอสักครู่แล้วลองกดบันทึกใหม่");
      return;
    }

    var ประเภท = ประเภทการลาทั้งหมด.find(function (t) { return t.id === ค่า.leaveTypeId; });

    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ใช้ปัจจุบัน.uid,
      requesterName: ผู้ใช้ปัจจุบัน.displayName || ผู้ใช้ปัจจุบัน.email,
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
