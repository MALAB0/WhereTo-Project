// Toggle sidebar menu (example functionality)
document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.querySelector('.menu-btn');
  menuBtn.addEventListener('click', function () {
    alert('Sidebar menu toggled!'); // Replace with actual sidebar logic
  });

  // Example: Button actions for report cards
  document.querySelectorAll('.verify').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Report verified!');
    });
  });

  document.querySelectorAll('.reject').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Report rejected!');
    });
  });

  document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Edit report!');
    });
  });

  document.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('Report deleted!');
    });
  });
});