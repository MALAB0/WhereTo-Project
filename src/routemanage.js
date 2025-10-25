document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const addRouteBtn = document.getElementById('addRouteBtn');
  const addRouteModal = document.getElementById('addRouteModal');
  const closeBtn = addRouteModal.querySelector('.close-btn');
  const addRouteForm = document.getElementById('addRouteForm');
  const routesGrid = document.getElementById('routesGrid');
  const modalTitle = document.getElementById('modalTitle');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const routeStepsModal = document.getElementById('routeStepsModal');
  const closeStepsBtn = routeStepsModal.querySelector('.close-steps-btn');
  const routeStepsForm = document.getElementById('routeStepsForm');
  const saveRouteBtn = document.getElementById('saveRouteBtn');
  const routeViewModal = document.getElementById('routeViewModal');
  const closeViewBtn = routeViewModal.querySelector('.close-view-btn');
  const routeViewContent = document.getElementById('routeViewContent');

  let editingRoute = null;
  let tempRouteData = {};

  // sidebar toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
      // Close sidebar when clicking outside of it
  document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuBtn = menuBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnMenuBtn) {
      sidebar.classList.remove('active');
    }
  });

  }

  // --- Initialization: load saved or keep defaults ---
  function initRoutes() {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      // clear existing DOM cards (defaults) and render saved
      routesGrid.innerHTML = '';
      const routes = JSON.parse(saved);
      routes.forEach(r => createOrUpdateRouteCard(r));
    } else {
      // No saved routes: read existing DOM cards and store them
      const initialCards = Array.from(routesGrid.querySelectorAll('.route-card')).map(card => {
        return {
          name: card.querySelector('.route-title span').textContent,
          status: card.querySelector('.route-title .route-status').textContent,
          start: card.querySelector('.route-desc').textContent.split(' → ')[0],
          end: card.querySelector('.route-desc').textContent.split(' → ')[1],
          steps: [] // default empty
        };
      });
      localStorage.setItem('savedRoutes', JSON.stringify(initialCards));
      // re-render from saved (ensures consistent dataset)
      routesGrid.innerHTML = '';
      initialCards.forEach(r => createOrUpdateRouteCard(r));
    }
  }

  // save all routes to localStorage
  function saveAllRoutes() {
    const routeCards = document.querySelectorAll('.routes-grid .route-card');
    const routes = Array.from(routeCards).map(card => ({
      name: card.querySelector('.route-title span').textContent,
      status: card.querySelector('.route-title .route-status').textContent,
      start: card.querySelector('.route-desc').textContent.split(' → ')[0],
      end: card.querySelector('.route-desc').textContent.split(' → ')[1],
      steps: card.dataset.steps ? JSON.parse(card.dataset.steps) : []
    }));
    localStorage.setItem('savedRoutes', JSON.stringify(routes));
  }

  // create or update card
  function createOrUpdateRouteCard(data, card = null) {
    if (card) {
      // update
      card.querySelector('.route-title span').textContent = data.name;
      const statusSpan = card.querySelector('.route-title .route-status');
      statusSpan.textContent = data.status;
      statusSpan.className = 'route-status ' + data.status.toLowerCase();
      card.querySelector('.route-desc').textContent = `${data.start} → ${data.end}`;
      card.dataset.steps = JSON.stringify(data.steps || []);
    } else {
      // create
      const newCard = document.createElement('div');
      newCard.className = 'route-card';
      newCard.dataset.steps = JSON.stringify(data.steps || []);
      newCard.innerHTML = `
        <div class="route-title">
          <span>${escapeHtml(data.name)}</span>
          <span class="route-status ${data.status.toLowerCase()}">${escapeHtml(data.status)}</span>
        </div>
        <div class="route-desc">${escapeHtml(data.start)} → ${escapeHtml(data.end)}</div>
        <div class="route-riders">${(data.steps && data.steps.length) ? data.steps.length + ' steps' : '0 steps'}</div>
        <div class="route-actions">
          <button class="view"><i class="fa-solid fa-eye"></i> view</button>
          <button class="edit"><i class="fa-solid fa-pen"></i> edit</button>
          <button class="delete"><i class="fa-solid fa-trash"></i> delete</button>
        </div>
      `;
      routesGrid.appendChild(newCard);
      attachCardEvents(newCard);
    }
    saveAllRoutes();
  }

  // attach view/edit/delete events
  function attachCardEvents(card) {
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');
    const viewBtn = card.querySelector('.view');

    editBtn.addEventListener('click', () => {
      editingRoute = card;
      const name = card.querySelector('.route-title span').textContent;
      const status = card.querySelector('.route-title .route-status').textContent;
      const [start, end] = card.querySelector('.route-desc').textContent.split(' → ');
      const steps = card.dataset.steps ? JSON.parse(card.dataset.steps) : [];

      document.getElementById('newRouteName').value = name;
      document.getElementById('newRouteStart').value = start;
      document.getElementById('newRouteEnd').value = end;
      document.getElementById('newRouteStatus').value = status.toLowerCase();

      tempRouteData = { name, start, end, status, steps };
      modalTitle.textContent = "Edit Route";
      addRouteModal.style.display = 'flex';
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this route?')) {
        card.remove();
        saveAllRoutes();
      }
    });

    viewBtn.addEventListener('click', () => {
      const name = card.querySelector('.route-title span').textContent;
      const status = card.querySelector('.route-title .route-status').textContent;
      const [start, end] = card.querySelector('.route-desc').textContent.split(' → ');
      const steps = card.dataset.steps ? JSON.parse(card.dataset.steps) : [];

      // Build view content (up to 5 steps)
      let stepsList = steps.length ? steps.slice(0,5).map((s, i) => `<li>${escapeHtml(s)}</li>`).join('') : '<li>No steps added</li>';

      routeViewContent.innerHTML = `
        <p><strong>Route Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Status:</strong> ${escapeHtml(status)}</p>
        <p><strong>Start Point:</strong> ${escapeHtml(start)}</p>
        <p><strong>End Point:</strong> ${escapeHtml(end)}</p>
        <h4>Steps:</h4>
        <ul>${stepsList}</ul>
      `;
      routeViewModal.style.display = 'flex';
    });
  }

  // helpers: escape to avoid HTML injection
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // initialize from saved or defaults
  initRoutes();

  // attach events to modals
  addRouteBtn.addEventListener('click', () => {
    modalTitle.textContent = "Add New Route";
    addRouteForm.reset();
    tempRouteData = {};
    editingRoute = null;
    addRouteModal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => addRouteModal.style.display = 'none');
  closeStepsBtn.addEventListener('click', () => routeStepsModal.style.display = 'none');
  if (closeViewBtn) closeViewBtn.addEventListener('click', () => routeViewModal.style.display = 'none');

  window.addEventListener('click', e => {
    if (e.target === addRouteModal) addRouteModal.style.display = 'none';
    if (e.target === routeStepsModal) routeStepsModal.style.display = 'none';
    if (e.target === routeViewModal) routeViewModal.style.display = 'none';
  });

  // Next button: go to steps modal (prefill steps if editing)
  nextStepBtn.addEventListener('click', () => {
    tempRouteData = {
      name: document.getElementById('newRouteName').value,
      start: document.getElementById('newRouteStart').value,
      end: document.getElementById('newRouteEnd').value,
      status: document.getElementById('newRouteStatus').value
    };
    addRouteModal.style.display = 'none';
    // prefill steps if we are editing and have them
    const oldSteps = (tempRouteData && tempRouteData.steps) ? tempRouteData.steps : (editingRoute ? (JSON.parse(editingRoute.dataset.steps || '[]')) : []);
    ['step1','step2','step3','step4','step5'].forEach((id, i) => {
      document.getElementById(id).value = (oldSteps && oldSteps[i]) ? oldSteps[i] : '';
    });
    routeStepsModal.style.display = 'flex';
  });

  // Save route from steps modal
  routeStepsForm.addEventListener('submit', e => {
    e.preventDefault();
    const steps = [
      document.getElementById('step1').value.trim(),
      document.getElementById('step2').value.trim(),
      document.getElementById('step3').value.trim(),
      document.getElementById('step4').value.trim(),
      document.getElementById('step5').value.trim()
    ];
    tempRouteData.steps = steps;
    // if editingRoute exists, update it, else create new
    createOrUpdateRouteCard(tempRouteData, editingRoute);
    routeStepsModal.style.display = 'none';
    addRouteForm.reset();
    routeStepsForm.reset();
    editingRoute = null;
    saveAllRoutes();
  });

});
