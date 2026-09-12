// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// อ่านใบลาและความเห็นจริงจาก Firestore
// ปุ่มอนุมัติ/ไม่อนุมัติเขียนสถานะกลับ Firestore จริง (ส่งความเห็นยังเปลี่ยนแค่ในหน่วยความจำ)
// ผู้ขอลาที่เป็น employee เปิดใบลาของคนอื่นไม่ได้ (ผู้อนุมัติ/ฝ่ายบุคคลเปิดได้ทุกใบ)
// ─────────────────────────────────────────────────────────────

(function () {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");
  var ใบ, ความเห็น, ผู้ใช้ปัจจุบัน, บทบาทปัจจุบัน;

  var เอกสารใบลา = db.collection("leaveRequests").doc(รหัสใบลา);

  firebase.auth().onAuthStateChanged(function (ผู้ใช้) {
    if (!ผู้ใช้) {
      location.href = "login.html";
      return;
    }
    ผู้ใช้ปัจจุบัน = ผู้ใช้;

    Promise.all([
      เอกสารใบลา.get(),
      เอกสารใบลา.collection("approvals").get(),
      db.collection("users").doc(ผู้ใช้.uid).get()
    ]).then(function (ผลลัพธ์) {
      var สแนปช็อตใบลา = ผลลัพธ์[0];
      var สแนปช็อตความเห็น = ผลลัพธ์[1];
      var สแนปช็อตผู้ใช้ = ผลลัพธ์[2];

      if (!สแนปช็อตใบลา.exists) {
        กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
        return;
      }

      ใบ = Object.assign({ id: สแนปช็อตใบลา.id }, สแนปช็อตใบลา.data());

      บทบาทปัจจุบัน = สแนปช็อตผู้ใช้.exists ? สแนปช็อตผู้ใช้.data().role : "employee";
      if (บทบาทปัจจุบัน === "employee" && ใบ.requesterId !== ผู้ใช้.uid) {
        กล่องใบลา.innerHTML = "<p>ไม่มีสิทธิ์ดูใบลานี้ — ใบนี้ไม่ใช่ของคุณ</p>";
        return;
      }

      ความเห็น = สแนปช็อตความเห็น.docs.map(function (เอกสาร) {
        return Object.assign({ id: เอกสาร.id }, เอกสาร.data());
      });

      วาดใบลา();
      วาดความเห็น();
      กล่องความเห็น.classList.remove("hidden");

      document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);
    }).catch(function (ข้อผิดพลาด) {
      กล่องใบลา.innerHTML = "<p>โหลดข้อมูลจาก Firestore ไม่สำเร็จ: " + esc(ข้อผิดพลาด.message) + "</p>";
    });
  });

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // สิทธิ์ตาม ACL.md: employee เปลี่ยนสถานะไม่ได้เลย · ห้ามอนุมัติใบลาของตัวเอง (manager/hr)
    // · manager ลบได้เฉพาะใบตัวเอง · hr ลบได้ทุกใบ
    var เป็นเจ้าของใบเอง = ใบ.requesterId === ผู้ใช้ปัจจุบัน.uid;
    var อนุมัติได้ = (บทบาทปัจจุบัน === "manager" || บทบาทปัจจุบัน === "hr") && !เป็นเจ้าของใบเอง;
    var ลบได้ = บทบาทปัจจุบัน === "hr" || เป็นเจ้าของใบเอง;

    // ให้หัวหน้าอ่านสรุปจาก AI ก่อนกดอนุมัติ — เห็นเฉพาะคนที่อนุมัติใบนี้ได้จริง
    if (ใบ.status === "รอพิจารณา" && อนุมัติได้) {
      html += '<div id="กล่องสรุปAI">' +
        (ใบ.aiSuggestion
          ? '<div class="alert alert-ai"><b>สรุปโดย AI:</b> ' + esc(ใบ.aiSuggestion) + '</div>' +
            '<div class="btn-row"><button type="button" class="btn-ghost" id="ปุ่มสรุปAI">สรุปใหม่</button></div>'
          : '<div class="btn-row"><button type="button" class="btn-ghost" id="ปุ่มสรุปAI">🤖 ให้ AI สรุปใบลานี้</button></div>') +
        '<div id="เตือนสรุปAI" class="alert alert-error hidden"></div>' +
        '</div>';
    }

    if (ใบ.status === "รอพิจารณา") {
      var ปุ่มทั้งหมด = "";
      if (อนุมัติได้) {
        ปุ่มทั้งหมด +=
          '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
          '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>';
      }
      if (ลบได้) {
        ปุ่มทั้งหมด += '<button type="button" class="btn-danger" id="ปุ่มลบ">ลบใบลานี้</button>';
      }
      if (ปุ่มทั้งหมด) {
        html += '<div class="btn-row">' + ปุ่มทั้งหมด + "</div>";
      }
      if (!อนุมัติได้) {
        html += '<p class="hint">' + (เป็นเจ้าของใบเอง
          ? "ไม่สามารถอนุมัติใบลาของตัวเองได้ ต้องให้ผู้อนุมัติคนอื่นพิจารณาแทน"
          : "คุณไม่มีสิทธิ์อนุมัติใบลานี้") + "</p>";
      }
    } else {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะและลบต่อไม่ได้</p>';
    }

    กล่องใบลา.innerHTML = html;

    if (ใบ.status === "รอพิจารณา") {
      if (อนุมัติได้) {
        document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
        document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
        document.getElementById("ปุ่มสรุปAI").addEventListener("click", สรุปด้วยAI);
      }
      if (ลบได้) {
        document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
      }
    }
  }

  // ── เปลี่ยนสถานะ ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    document.getElementById("ปุ่มอนุมัติ").disabled = true;
    document.getElementById("ปุ่มไม่อนุมัติ").disabled = true;

    // .update() แก้เฉพาะช่องที่ระบุเท่านั้น ช่องอื่นในเอกสารเดิมไม่ถูกแตะ
    เอกสารใบลา.update({ status: สถานะใหม่ }).then(function () {
      ใบ.status = สถานะใหม่;
      วาดใบลา();
    }).catch(function (ข้อผิดพลาด) {
      alert("เปลี่ยนสถานะไม่สำเร็จ: " + ข้อผิดพลาด.message);
      document.getElementById("ปุ่มอนุมัติ").disabled = false;
      document.getElementById("ปุ่มไม่อนุมัติ").disabled = false;
    });
  }

  // ── สรุปใบลาด้วย AI แล้วเขียนสรุปกลับลง Firestore ──
  // เขียนได้แค่ aiSuggestion กับ aiLog เท่านั้น ห้ามแตะ status เด็ดขาด —
  // สถานะจริงเปลี่ยนได้ทางเดียวคือคนกด ปุ่มอนุมัติ/ปุ่มไม่อนุมัติ ผ่าน เปลี่ยนสถานะ() เท่านั้น
  function สรุปด้วยAI() {
    var ปุ่ม = document.getElementById("ปุ่มสรุปAI");
    var เตือน = document.getElementById("เตือนสรุปAI");

    var คีย์ = window.OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key");
    if (!คีย์) {
      คีย์ = prompt("ใส่ OpenRouter API Key (จะถูกเก็บไว้ในเบราว์เซอร์นี้เท่านั้น ไม่ถูกบันทึกลงไฟล์)");
      if (!คีย์) return;
      localStorage.setItem("openrouter_api_key", คีย์);
    }

    เตือน.classList.add("hidden");
    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังสรุป…";

    var ข้อมูลนำเข้า = {
      title: ใบ.title,
      reason: ใบ.reason,
      leaveTypeName: ใบ.leaveTypeName,
      startDate: ใบ.startDate,
      endDate: ใบ.endDate,
      requesterName: ใบ.requesterName
    };

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
              "คุณคือผู้ช่วยสรุปใบลาให้หัวหน้าอ่านก่อนตัดสินใจอนุมัติหรือไม่อนุมัติ " +
              "เขียนสรุปสั้น ๆ 2-3 ประโยค เป็นภาษาไทยล้วน ห้ามใช้ markdown โดยอิงจากข้อมูลที่ได้รับเท่านั้น"
          },
          {
            role: "user",
            content: JSON.stringify(ข้อมูลนำเข้า)
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
      var สรุป = ((data.choices && data.choices[0] && data.choices[0].message.content) || "").trim();
      if (!สรุป) {
        throw new Error("AI ไม่ได้ตอบข้อความกลับมา");
      }
      return บันทึกaiLog(ข้อมูลนำเข้า, สรุป).then(function () {
        return เอกสารใบลา.update({ aiSuggestion: สรุป });
      }).then(function () {
        ใบ.aiSuggestion = สรุป;
        วาดใบลา();
      });
    }).catch(function (ข้อผิดพลาด) {
      บันทึกaiLog(ข้อมูลนำเข้า, "เกิดข้อผิดพลาด: " + ข้อผิดพลาด.message);
      เตือน.textContent = "⚠️ สรุปไม่สำเร็จ: " + ข้อผิดพลาด.message;
      เตือน.classList.remove("hidden");
      ปุ่ม.disabled = false;
      ปุ่ม.textContent = ใบ.aiSuggestion ? "สรุปใหม่" : "🤖 ให้ AI สรุปใบลานี้";
    });
  }

  // ── เก็บ log ทุกครั้งที่เรียก AI ไว้ในโฟลเดอร์ย่อย aiLog ใต้ใบลานี้ ──
  function บันทึกaiLog(input, output) {
    return เอกสารใบลา.collection("aiLog").add({
      input: input,
      output: output,
      createdAt: เวลาตอนนี้()
    });
  }

  // ── ลบใบลานี้ ──
  function ลบใบลา() {
    if (!confirm("ยืนยันลบใบลานี้ใช่ไหม? ลบแล้วกู้คืนไม่ได้")) return;

    document.getElementById("ปุ่มลบ").disabled = true;

    เอกสารใบลา.delete().then(function () {
      location.href = "leave-requests.html";
    }).catch(function (ข้อผิดพลาด) {
      alert("ลบไม่สำเร็จ: " + ข้อผิดพลาด.message);
      document.getElementById("ปุ่มลบ").disabled = false;
    });
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    ความเห็น.push({
      id: "ap-ใหม่-" + Date.now(),
      authorId: ผู้ใช้ปัจจุบัน.uid,
      authorName: ผู้ใช้ปัจจุบัน.displayName || ผู้ใช้ปัจจุบัน.email,
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    });
    ช่อง.value = "";
    วาดความเห็น();
  }
})();
