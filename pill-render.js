
function renderPills(mg) {
  let pills = "";
  let html = "<div>";
  while (mg >= 3) {
    pills += "<span class='pill pill-3'></span>";
    mg -= 3;
  }
  while (mg >= 2) {
    pills += "<span class='pill pill-2'></span>";
    mg -= 2;
  }
  if (mg === 1.5) {
    pills += "<span class='pill pill-3 half'></span><span class='pill pill-2 half'></span>";
  } else if (mg === 1) {
    pills += "<span class='pill pill-2 half'></span><span class='pill pill-2 half'></span>";
  } else if (mg === 0.5) {
    pills += "<span class='pill pill-2 half'></span>";
  }
  html += pills + "</div>";
  return html;
}
