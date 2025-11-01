// ✅ Sidebar Toggle (unchanged)
document.getElementById("menuBtn").addEventListener("click", function() {
  document.getElementById("sidebar").classList.toggle("active");
});

// ✅ Fetch and Display Reports from DB
let reports = [];  // Store fetched reports

async function loadReports() {
  try {
    const response = await fetch('/api/admin/reports');
    reports = await response.json();
    renderTable();
  } catch (err) {
    console.error('Error loading reports:', err);
  }
}

// Render table based on current reports and filter
function renderTable() {
  const tbody = document.getElementById('reportTableBody');
  const filterValue = document.getElementById('statusFilter').value;
  tbody.innerHTML = '';

  reports.forEach(report => {
    if (filterValue !== 'all' && report.status !== filterValue) return;

    const row = document.createElement('tr');
    row.setAttribute('data-status', report.status);
    row.innerHTML = `
      <td>${report.user}</td>  <!-- New: Show user -->
      <td>${report.description} (${report.issueType} at ${report.location})</td>
      <td><span class="status ${report.status}">${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span></td>
      <td>
        ${report.status === 'pending' ? '<button class="verify">Verify</button><button class="reject">Reject</button>' : '<button class="view">View</button>'}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ✅ Filter Function (updated to re-render)
document.getElementById("statusFilter").addEventListener("change", renderTable);

// ✅ Modal Functions (updated to show user)
const modal = document.getElementById("viewModal");
const closeModal = document.querySelector(".close");
const reportDetails = document.getElementById("reportDetails");

function openModal(report) {
  reportDetails.innerHTML = `
    <strong>User:</strong> ${report.user}<br>
    <strong>Issue Type:</strong> ${report.issueType}<br>
    <strong>Location:</strong> ${report.location}<br>
    <strong>Affected Route:</strong> ${report.affectedRoute || 'N/A'}<br>
    <strong>Description:</strong> ${report.description}<br>
    <strong>Status:</strong> ${report.status}<br>
    <strong>Timestamp:</strong> ${new Date(report.timestamp).toLocaleString()}<br><br>
    <strong>Image Provided:</strong> N/A (not implemented yet)  <!-- Placeholder; add photo support later -->
  `;
  modal.style.display = "flex";
}

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// ✅ Button Actions (updated to update DB and refresh)
document.getElementById("reportTableBody").addEventListener("click", async function(e) {
  const row = e.target.closest("tr");
  const index = Array.from(row.parentNode.children).indexOf(row);
  const report = reports[index];

  if (e.target.classList.contains("view")) {
    openModal(report);
  } else if (e.target.classList.contains("verify")) {
    await updateReportStatus(report._id, 'verified');
  } else if (e.target.classList.contains("reject")) {
    await updateReportStatus(report._id, 'rejected');
  }
});

async function updateReportStatus(id, status) {
  try {
    await fetch(`/api/admin/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadReports();  // Refresh table
  } catch (err) {
    console.error('Error updating report:', err);
  }
}

// Load reports on page load
document.addEventListener('DOMContentLoaded', loadReports);