document.addEventListener('DOMContentLoaded', function () {
  // --- Sidebar toggle ---
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });
  }

  // --- Route Modal ---
  const addRouteBtn = document.getElementById('addRouteBtn');
  const addRouteModal = document.getElementById('addRouteModal');
  const closeBtn = addRouteModal.querySelector('.close-btn');
  const addRouteForm = document.getElementById('addRouteForm');
  const routesGrid = document.getElementById('routesGrid');
  const modalTitle = document.getElementById('modalTitle');
  const submitRouteBtn = document.getElementById('submitRouteBtn');

  let editingRoute = null;

  // Open modal for adding new route
  addRouteBtn.addEventListener('click', function () {
    modalTitle.textContent = "Add New Route";
    submitRouteBtn.textContent = "Add Route";
    addRouteForm.reset();
    addRouteModal.style.display = 'flex';
    editingRoute = null;
  });

  // Close modal
  closeBtn.addEventListener('click', function () {
    addRouteModal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', function (e) {
    if (e.target === addRouteModal) addRouteModal.style.display = 'none';
  });

  // --- Function to create/edit route card ---
  function createOrUpdateRouteCard(data, card = null) {
    if (card) {
      // Update existing card
      card.querySelector('.route-title span').textContent = data.name;
      const statusSpan = card.querySelector('.route-title .route-status');
      statusSpan.textContent = data.status.toLowerCase();
      statusSpan.className = 'route-status ' + (data.status.toLowerCase() === 'active' ? 'active' : data.status.toLowerCase() === 'suspended' ? 'suspended' : 'maintenance');
      card.querySelector('.route-desc').textContent = `${data.start} → ${data.end}`;
      card.querySelector('.route-riders').textContent = data.riders || '0 daily riders';
    } else {
      // Create new card
      const newCard = document.createElement('div');
      newCard.className = 'route-card';
      newCard.innerHTML = `
        <div class="route-title">
          <span>${data.name}</span>
          <span class="route-status ${data.status.toLowerCase() === 'active' ? 'active' : data.status.toLowerCase() === 'suspended' ? 'suspended' : 'maintenance'}">${data.status.toLowerCase()}</span>
        </div>
        <div class="route-desc">${data.start} → ${data.end}</div>
        <div class="route-riders">${data.riders || '0 daily riders'}</div>
        <div class="route-actions">
          <button class="view"><i class="fa-solid fa-eye"></i> view</button>
          <button class="edit"><i class="fa-solid fa-pen"></i> edit</button>
          <button class="delete"><i class="fa-solid fa-trash"></i> delete</button>
        </div>
      `;
      routesGrid.appendChild(newCard);
      attachCardEvents(newCard);
    }
  }

  // Attach edit/delete events to a card
  function attachCardEvents(card) {
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');

    editBtn.addEventListener('click', function () {
      editingRoute = card;
      const name = card.querySelector('.route-title span').textContent;
      const status = card.querySelector('.route-title .route-status').textContent;
      const desc = card.querySelector('.route-desc').textContent.split(' → ');
      addRouteForm.querySelector('#newRouteName').value = name;
      addRouteForm.querySelector('#newRouteStart').value = desc[0];
      addRouteForm.querySelector('#newRouteEnd').value = desc[1];
      addRouteForm.querySelector('#newRouteStatus').value = status.toLowerCase();
      modalTitle.textContent = "Edit Route";
      submitRouteBtn.textContent = "Save Changes";
      addRouteModal.style.display = 'flex';
    });

    deleteBtn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this route?')) {
        card.remove();
      }
    });
  }

  // Attach events to pre-existing routes
  const existingCards = document.querySelectorAll('.routes-grid .route-card');
  existingCards.forEach(card => attachCardEvents(card));

  // Handle form submission (add/edit)
  addRouteForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
      name: addRouteForm.querySelector('#newRouteName').value,
      start: addRouteForm.querySelector('#newRouteStart').value,
      end: addRouteForm.querySelector('#newRouteEnd').value,
      status: addRouteForm.querySelector('#newRouteStatus').value
    };

    createOrUpdateRouteCard(data, editingRoute);

    addRouteForm.reset();
    addRouteModal.style.display = 'none';
  });
});

