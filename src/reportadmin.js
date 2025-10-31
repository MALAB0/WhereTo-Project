// ✅ Sidebar Toggle
document.getElementById("menuBtn").addEventListener("click", function() {
  document.getElementById("sidebar").classList.toggle("active");
});

// ✅ Report Data (with user images)
const reports = {
  "Juan Dela Cruz": {
    report: "Bus 101 route changed due to construction at EDSA-Ortigas",
    status: "pending",
    image: "juan.jpg"
  },
  "Maria Santos": {
    report: "Jeepney stop relocated near SM Dagupan",
    status: "verified",
    image: "maria.jpg"
  },
  "Carlos Reyes": {
    report: "Taxi overcharging at downtown terminal",
    status: "rejected",
    image: "carlos.jpg"
  }
};

// ✅ Filter Function
document.getElementById("statusFilter").addEventListener("change", function() {
  const value = this.value;
  document.querySelectorAll("#reportTableBody tr").forEach(row => {
    row.style.display = (value === "all" || row.dataset.status === value) ? "" : "none";
  });
});

// ✅ Modal Functions
const modal = document.getElementById("viewModal");
const closeModal = document.querySelector(".close");
const reportDetails = document.getElementById("reportDetails");

function openModal(user, reportText, status, image) {
  reportDetails.innerHTML = `
    <strong>User:</strong> ${user}<br>
    <strong>Report:</strong> ${reportText}<br>
    <strong>Status:</strong> ${status}<br><br>
    <strong>Image Provided:</strong><br>
    <img src="${image}" alt="Report Image" style="width:100%;max-width:400px;border-radius:6px;margin-top:10px;">
  `;
  modal.style.display = "flex";
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ✅ Button Actions
document.getElementById("reportTableBody").addEventListener("click", function(e) {
  const row = e.target.closest("tr");
  const user = row.children[0].textContent.trim();

  if (e.target.classList.contains("view")) {
    const reportText = row.children[1].textContent.trim();
    const status = row.dataset.status;
    const image = reports[user]?.image || "default.jpg";
    openModal(user, reportText, status, image);
  }

  if (e.target.classList.contains("verify")) {
    row.dataset.status = "verified";
    row.querySelector(".status").textContent = "Verified";
    row.querySelector(".status").className = "status verified";
    e.target.remove();
    row.querySelector(".reject").remove();

    const viewBtn = document.createElement("button");
    viewBtn.className = "view";
    viewBtn.textContent = "View";
    row.querySelector("td:last-child").appendChild(viewBtn);
    reports[user].status = "verified";
  }

  if (e.target.classList.contains("reject")) {
    row.dataset.status = "rejected";
    row.querySelector(".status").textContent = "Rejected";
    row.querySelector(".status").className = "status rejected";
    e.target.remove();
    row.querySelector(".verify").remove();

    const viewBtn = document.createElement("button");
    viewBtn.className = "view";
    viewBtn.textContent = "View";
    row.querySelector("td:last-child").appendChild(viewBtn);
    reports[user].status = "rejected";
  }
});
