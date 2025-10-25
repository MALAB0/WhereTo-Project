document.addEventListener('DOMContentLoaded', function () {
  // --- Sidebar toggle ---
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });

      // Close sidebar when clicking outside of it
    document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuBtn = menuBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnMenuBtn) {
      sidebar.classList.remove('active');
    }
  });

  }

  // --- Button actions ---
  document.querySelectorAll('.view').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Viewing details...');
    });
  });

  document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Editing...');
    });
  });

  document.querySelectorAll('.verify').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Verified!');
    });
  });

  document.querySelectorAll('.reject').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Rejected!');
    });
  });

  document.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this?')) {
        alert('Deleted!');
        // Optionally remove the element from DOM here
      }
    });
  });

  document.querySelectorAll('.suspend').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Suspended!');
    });
  });

// --- Chart.js: Most Used Routes ---
const routesData = [
  { route: 'Pasay to Cubao', users: 200 },
  { route: 'Dagupan to Tarlac', users: 156 },
  { route: 'Quezon to Makati', users: 120 },
  { route: 'Manila to BGC', users: 95 }
];

const ctx = document.getElementById('mostUsedRoutesChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: routesData.map(r => r.route),
    datasets: [{
      label: 'Number of Users',
      data: routesData.map(r => r.users),
      backgroundColor: ['#2d6cdf', '#6fb1fc', '#1a4a9d', '#4d8bfd'],
      borderRadius: 6,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: false // <-- Disabled chart title
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 50 }
      }
    }
  }
});
});
