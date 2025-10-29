document.addEventListener('DOMContentLoaded', function () {
  // Burger icon toggles sidebar
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });
  }

  // View button
  document.querySelectorAll('.view').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Viewing details...');
    });
  });

  // Edit button
  document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Editing...');
    });
  });

  // Verify button
  document.querySelectorAll('.verify').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Verified!');
    });
  });

  // Reject button
  document.querySelectorAll('.reject').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Rejected!');
    });
  });

  // Delete button
  document.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this?')) {
        alert('Deleted!');
        // Optionally remove the element from DOM here
      }
    });
  });

  // Suspend button
  document.querySelectorAll('.suspend').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Suspended!');
    });
  });
});