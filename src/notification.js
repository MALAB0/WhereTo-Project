// Storage keys
const PREF_KEY = 'notificationPreferences';
const NT_KEY = 'notificationsList';

// Default data
const defaultPrefs = {
  routeChanges: true,
  serviceDelays: true,
  fareUpdates: false,
  maintenanceUpdates: true,
};

const defaultNotifications = [
  {
    id: 'nt1',
    icon: 'fa-triangle-exclamation',
    title: 'Route Change Alert',
    desc: 'Bus 101 route has been modified...',
    time: '5 mins ago',
  },
  {
    id: 'nt2',
    icon: 'fa-bell',
    title: 'Fare Changes',
    desc: 'New fare rates...',
    time: '5 mins ago',
  },
  {
    id: 'nt3',
    icon: 'fa-clock',
    title: 'Service Delay',
    desc: 'Jeepney route 2 is...',
    time: '5 mins ago',
  },
];

function loadPrefs() {
  const data = JSON.parse(localStorage.getItem(PREF_KEY) || 'null') || defaultPrefs;
  // apply to toggles
  document.getElementById('pref-routeChanges').checked = !!data.routeChanges;
  document.getElementById('pref-serviceDelays').checked = !!data.serviceDelays;
  document.getElementById('pref-fareUpdates').checked = !!data.fareUpdates;
  document.getElementById('pref-maintenanceUpdates').checked = !!data.maintenanceUpdates;
}

function savePrefs() {
  const data = {
    routeChanges: document.getElementById('pref-routeChanges').checked,
    serviceDelays: document.getElementById('pref-serviceDelays').checked,
    fareUpdates: document.getElementById('pref-fareUpdates').checked,
    maintenanceUpdates: document.getElementById('pref-maintenanceUpdates').checked,
  };
  localStorage.setItem(PREF_KEY, JSON.stringify(data));
}

function bindPrefHandlers() {
  ['pref-routeChanges','pref-serviceDelays','pref-fareUpdates','pref-maintenanceUpdates']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', savePrefs);
    });
}

function loadNotifications() {
  const container = document.getElementById('notificationsContainer');
  container.innerHTML = '';
  const list = JSON.parse(localStorage.getItem(NT_KEY) || 'null') || defaultNotifications;
  list.forEach(addNotificationCard);
}

function addNotificationCard(item) {
  const container = document.getElementById('notificationsContainer');
  const card = document.createElement('div');
  card.className = 'nt-card';
  card.dataset.id = item.id;

  const left = document.createElement('div');
  left.innerHTML = `
    <div class="nt-title"><i class="fa-solid ${item.icon}"></i> ${item.title}</div>
    <div class="nt-desc">${item.desc}</div>
    <div class="nt-time">${item.time}</div>
  `;

  const right = document.createElement('div');
  right.className = 'nt-actions-row';
  const del = document.createElement('button');
  del.className = 'nt-delete';
  del.innerHTML = '<i class="fa-solid fa-trash"></i>';
  del.title = 'Delete';
  del.addEventListener('click', () => deleteNotification(item.id));
  right.appendChild(del);

  card.appendChild(left);
  card.appendChild(right);
  container.appendChild(card);
}

function deleteNotification(id) {
  const list = JSON.parse(localStorage.getItem(NT_KEY) || 'null') || defaultNotifications;
  const updated = list.filter(n => n.id !== id);
  localStorage.setItem(NT_KEY, JSON.stringify(updated));
  loadNotifications();
}

function ensureSeedData() {
  if (!localStorage.getItem(PREF_KEY)) localStorage.setItem(PREF_KEY, JSON.stringify(defaultPrefs));
  if (!localStorage.getItem(NT_KEY)) localStorage.setItem(NT_KEY, JSON.stringify(defaultNotifications));
}

function bindBottomActions() {
  document.getElementById('planTripBtn').addEventListener('click', () => {
    window.location.href = 'destination.html';
  });
  document.getElementById('reportIssueBtn').addEventListener('click', () => {
    window.location.href = 'report.html';
  });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  ensureSeedData();
  loadPrefs();
  bindPrefHandlers();
  loadNotifications();
  bindBottomActions();
});
