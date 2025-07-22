
function calculateDose() {
  const skipDays = Array.from(document.querySelectorAll("#skipDaysCheckboxes input:checked")).map(cb => parseInt(cb.value));
  const inr = parseFloat(document.getElementById("inr").value);
  const weeklyDose = parseFloat(document.getElementById("weeklyDose").value);
  const hasBleeding = document.getElementById("hasBleeding").checked;
  const mode = document.getElementById("mode").value;
  const manualPercent = parseInt(document.getElementById("manualPercent").value);
  const startDay = parseInt(document.getElementById("startDay").value);
  const pillOption = document.getElementById("pillOption").value;

  let percentChange = 0;
  let advice = "";

  if (mode === "manual") {
    percentChange = manualPercent;
    advice = `ปรับขนาดยา ${percentChange > 0 ? "+" : ""}${percentChange}% ตามที่เลือก`;
  } else {
    if (hasBleeding) {
      advice = "หยุดยาและให้ Vitamin K พิจารณาส่งโรงพยาบาล";
      showResult(advice, 0, startDay, pillOption);
      return;
    }
    if (inr < 1.5) { percentChange = 20; advice = "เพิ่มขนาดยา 10–20%"; }
    else if (inr < 2) { percentChange = 10; advice = "เพิ่มขนาดยาเล็กน้อย"; }
    else if (inr <= 3) { percentChange = 0; advice = "คงขนาดยาเดิม"; }
    else if (inr <= 3.5) { percentChange = -10; advice = "ลดขนาดยาเล็กน้อย"; }
    else if (inr <= 4) { percentChange = -15; advice = "ลดขนาดยา 10–15%"; }
    else { percentChange = -20; advice = "หยุดยา 1 วัน และลดขนาดยา 15–20%"; }
  }

  const newWeekly = Math.round(weeklyDose * (1 + percentChange / 100));
  showResult(advice, newWeekly, startDay, pillOption, skipDays);
}

function showResult(advice, totalMg, startDay, pillOption, skipDays) {
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  let html = `<div class='box'><strong>คำแนะนำ:</strong> ${advice}</div>`;
  html += `<div><strong>ขนาดยาใหม่:</strong> ${totalMg} mg/สัปดาห์</div>`;
  const daily = distributeDose(totalMg, pillOption, skipDays);

  html += "<div class='day-grid'>";
  for (let i = 0; i < 7; i++) {
    const dayIndex = (startDay + i) % 7;
    const mg = daily[i];
    const pillText = mg === 0 ? "หยุดยา" : `${mg} mg`;
    const pillCount = Math.round(mg / 0.5);
    const doseText = mg === 0 ? "" : `(${pillCount / 2} เม็ด)`;
    html += `<div class='day-card'><strong>${dayNames[dayIndex]}</strong><br>${pillText}<br>${doseText}<br>${renderPills(mg)}</div>`;
  }
  html += "</div>";
  html += `<div style="margin-top:10px;"><strong>รวม:</strong> ${daily.reduce((a,b) => a+b, 0)} mg</div>`;
  document.getElementById("result").innerHTML = html;
}


function distributeDose(total, option, skipDays) {
  const daily = Array(7).fill(0);
  const availableDays = [...Array(7).keys()].filter(d => !skipDays.includes(d));
  const pills = {
    "2": [2],
    "3": [3],
    "2,3": [2, 3],
    "3,2": [2, 3]
  }[option];

  let bestPlan = null;
  function tryPlan(remaining, combo = [], count = 0) {
    if (count > availableDays.length) return;
    if (remaining < 0) return;
    if (remaining === 0 && combo.length <= availableDays.length) {
      if (!bestPlan || combo.length > bestPlan.length) bestPlan = [...combo];
      return;
    }
    for (let p of pills) {
      tryPlan(remaining - p, [...combo, p], count + 1);
    }
  }

  tryPlan(total);

  if (!bestPlan) return daily;

  for (let i = 0; i < bestPlan.length; i++) {
    daily[availableDays[i]] = bestPlan[i];
  }
  return daily;
}


// Toggle theme
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.createElement("button");
  toggle.id = "themeToggle";
  toggle.innerText = "🌓 เปลี่ยนธีม";
  toggle.onclick = () => document.body.classList.toggle("dark");
  document.body.prepend(toggle);
});

function suggestBestSkipDays(total, option) {
  const plans = [];
  for (let mask = 0; mask < 128; mask++) { // 2^7
    const skip = [];
    for (let i = 0; i < 7; i++) {
      if ((mask >> i) & 1) skip.push(i);
    }
    const available = 7 - skip.length;
    if (available < 3) continue; // อย่างน้อย 3 วัน
    const dailyPlan = distributeDose(total, option, skip);
    const variance = Math.sqrt(dailyPlan.reduce((sum, x) => sum + Math.pow(x - total / available, 2), 0));
    plans.push({ skip, plan: dailyPlan, variance });
  }
  plans.sort((a, b) => a.variance - b.variance);
  return plans[0];
}
function applySuggestedSkipDays(total, option) {
  const best = suggestBestSkipDays(total, option);
  document.querySelectorAll("#skipDaysCheckboxes input").forEach(cb => {
    cb.checked = best.skip.includes(parseInt(cb.value));
  });
}
function savePlan(planText) {
  const container = document.getElementById("savedPlans");
  const el = document.createElement("div");
  el.className = "border p-2 rounded bg-gray-100 dark:bg-gray-800 my-1";
  el.textContent = planText;
  container.appendChild(el);
}
