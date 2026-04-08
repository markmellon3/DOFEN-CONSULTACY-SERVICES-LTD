// admin-script.js
// ====================== FIREBASE CONFIG ======================
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 apiKey: "AIzaSyBTbFRUWyPnzMUQwUHOu8qmRlCJxixDK9o",
 authDomain: "security-470ec.firebaseapp.com",
 databaseURL: "https://security-470ec-default-rtdb.firebaseio.com",
 projectId: "security-470ec",
 storageBucket: "security-470ec.firebasestorage.app",
 messagingSenderId: "396657433359",
 appId: "1:396657433359:web:cfef0b534c87a17b10fc7a",
 measurementId: "G-TP2TMB92HN"
};

// Initialize Firebase
let app, auth, db, storage;

function initFirebase() {
 app = firebase.initializeApp(firebaseConfig);
 auth = firebase.auth();
 db = firebase.database();
 storage = firebase.storage();
}

// ====================== AUTHENTICATION ======================
async function handleLogin(e) {
 e.preventDefault();
 const email = document.getElementById('login-email').value;
 const password = document.getElementById('login-password').value;
 const errorEl = document.getElementById('login-error');
 
 try {
  await auth.signInWithEmailAndPassword(email, password);
  showDashboard();
 } catch (error) {
  errorEl.textContent = "Invalid email or password";
  errorEl.classList.remove('hidden');
 }
}

function logout() {
 auth.signOut().then(() => {
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('login-page').classList.remove('hidden');
 });
}

// Check auth state
function checkAuth() {
 auth.onAuthStateChanged(user => {
  if (user) {
   showDashboard();
  } else {
   document.getElementById('dashboard-page').classList.add('hidden');
   document.getElementById('login-page').classList.remove('hidden');
  }
 });
}

// Show dashboard after login
function showDashboard() {
 document.getElementById('login-page').classList.add('hidden');
 document.getElementById('dashboard-page').classList.remove('hidden');
 showSection('dashboard');
 loadDashboardStats();
 listenForNewNotifications();
}

// ====================== SECTION SWITCHING ======================
function showSection(section) {
 // Remove active class from all nav items
 document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
 
 // Find and activate clicked item (simple way)
 const navItems = document.querySelectorAll('.nav-item');
 navItems.forEach(item => {
  if (item.getAttribute('onclick').includes(section)) {
   item.classList.add('active');
  }
 });
 
 document.getElementById('page-title').textContent =
  section === 'dashboard' ? 'Dashboard' :
  section === 'services' ? 'Services Management' :
  section === 'projects' ? 'Projects Management' :
  section === 'jobs' ? 'Job Listings' :
  section === 'messages' ? 'Contact Messages' : 'Job Applications';
 
 const content = document.getElementById('content-area');
 content.innerHTML = '';
 
 if (section === 'dashboard') renderDashboard(content);
 else if (section === 'services') renderServicesManagement(content);
 else if (section === 'projects') renderProjectsManagement(content);
 else if (section === 'jobs') renderJobsManagement(content);
 else if (section === 'messages') renderMessages(content);
 else if (section === 'applications') renderApplications(content);
}

// ====================== DASHBOARD ======================
function renderDashboard(container) {
 container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="admin-card p-6">
                <div class="flex justify-between">
                    <div>
                        <p class="text-zinc-400 text-sm">Total Services</p>
                        <p id="stat-services" class="text-4xl font-bold mt-2">0</p>
                    </div>
                    <i class="fas fa-shield-alt text-4xl text-amber-500"></i>
                </div>
            </div>
            <div class="admin-card p-6">
                <div class="flex justify-between">
                    <div>
                        <p class="text-zinc-400 text-sm">Projects</p>
                        <p id="stat-projects" class="text-4xl font-bold mt-2">0</p>
                    </div>
                    <i class="fas fa-briefcase text-4xl text-amber-500"></i>
                </div>
            </div>
            <div class="admin-card p-6">
                <div class="flex justify-between">
                    <div>
                        <p class="text-zinc-400 text-sm">Job Applications</p>
                        <p id="stat-applications" class="text-4xl font-bold mt-2">0</p>
                    </div>
                    <i class="fas fa-file-upload text-4xl text-amber-500"></i>
                </div>
            </div>
            <div class="admin-card p-6">
                <div class="flex justify-between">
                    <div>
                        <p class="text-zinc-400 text-sm">Unread Messages</p>
                        <p id="stat-messages" class="text-4xl font-bold mt-2">0</p>
                    </div>
                    <i class="fas fa-envelope text-4xl text-amber-500"></i>
                </div>
            </div>
        </div>
    `;
 loadDashboardStats();
}

// Load stats
function loadDashboardStats() {
 // Services
 db.ref('services').once('value', snap => {
  document.getElementById('stat-services').textContent = snap.numChildren();
 });
 // Projects
 db.ref('projects').once('value', snap => {
  document.getElementById('stat-projects').textContent = snap.numChildren();
 });
 // Applications
 db.ref('applications').once('value', snap => {
  document.getElementById('stat-applications').textContent = snap.numChildren();
 });
 // Messages
 db.ref('messages').once('value', snap => {
  document.getElementById('stat-messages').textContent = snap.numChildren();
 });
}

// ====================== NOTIFICATIONS ======================
let unreadNotifications = [];
let notificationSound = null;

// Initialize notification sound
function initNotificationSound() {
 notificationSound = new Audio('https://assets.mixkit.co/sfx/preview/2578/2578.wav'); // Soft chime sound
 notificationSound.volume = 0.6;
}

function listenForNewNotifications() {
 // Initialize sound once
 if (!notificationSound) initNotificationSound();
 
 // Listen for new messages
 db.ref('messages').on('child_added', (snap) => {
  const msg = snap.val();
  unreadNotifications.push({
   id: snap.key,
   type: 'message',
   title: 'New Contact Message',
   subtitle: msg.name || 'Anonymous',
   time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
   data: msg
  });
  
  // Play sound for new notification
  if (notificationSound) {
   notificationSound.currentTime = 0;
   notificationSound.play().catch(() => {});
  }
  
  updateNotificationBadge();
 });
 
 // Listen for new job applications
 db.ref('applications').on('child_added', (snap) => {
  const app = snap.val();
  unreadNotifications.push({
   id: snap.key,
   type: 'application',
   title: 'New Job Application',
   subtitle: app.name || 'Applicant',
   time: app.timestamp ? new Date(app.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
   data: app
  });
  
  // Play sound for new notification
  if (notificationSound) {
   notificationSound.currentTime = 0;
   notificationSound.play().catch(() => {});
  }
  
  updateNotificationBadge();
 });
}

function updateNotificationBadge() {
 const badge = document.getElementById('notification-badge');
 const count = unreadNotifications.length;
 
 if (badge) {
  badge.textContent = count > 0 ? count : '';
  badge.classList.toggle('hidden', count === 0);
 }
}

function toggleNotifications() {
 const count = unreadNotifications.length;
 
 if (count === 0) {
  alert("No new notifications at the moment.");
  return;
 }
 
 // Build notification panel
 let html = `
        <div id="notification-panel" class="fixed top-16 right-8 bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl w-96 max-h-[420px] overflow-hidden z-[9999]">
            <div class="p-5 border-b border-zinc-700 flex items-center justify-between bg-zinc-800 rounded-t-3xl">
                <h3 class="font-semibold text-white">New Notifications (${count})</h3>
                <button onclick="markAllAsRead()" 
                        class="text-xs text-amber-400 hover:text-amber-300 font-medium">Mark all as read</button>
            </div>
            
            <div class="max-h-[320px] overflow-y-auto p-2" id="notification-list">
    `;
 
 unreadNotifications.forEach((notif, index) => {
  const iconClass = notif.type === 'message' ?
   'bg-blue-500/20 text-blue-400' :
   'bg-emerald-500/20 text-emerald-400';
  
  const icon = notif.type === 'message' ? 'fa-envelope' : 'fa-file-upload';
  
  html += `
            <div onclick="viewNotification(${index}); event.stopImmediatePropagation()" 
                 class="flex gap-4 p-4 hover:bg-zinc-800 rounded-2xl mx-2 my-1 cursor-pointer">
                <div class="w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-white">${notif.title}</div>
                    <div class="text-zinc-400 text-sm truncate">${notif.subtitle}</div>
                    <div class="text-[10px] text-zinc-500 mt-1">${notif.time}</div>
                </div>
            </div>
        `;
 });
 
 html += `
            </div>
            
            <div class="p-4 border-t border-zinc-700 text-center rounded-b-3xl">
                <button onclick="markAllAsRead()" 
                        class="text-sm text-zinc-400 hover:text-white">Close</button>
            </div>
        </div>
    `;
 
 // Remove existing panel if any
 const existing = document.getElementById('notification-panel');
 if (existing) existing.remove();
 
 // Append new panel
 const tempDiv = document.createElement('div');
 tempDiv.innerHTML = html;
 document.body.appendChild(tempDiv.firstElementChild);
 
 // Close when clicking outside
 setTimeout(() => {
  document.addEventListener('click', function handler(e) {
   const panel = document.getElementById('notification-panel');
   if (panel && !panel.contains(e.target)) {
    panel.remove();
    document.removeEventListener('click', handler);
   }
  });
 }, 100);
}

function viewNotification(index) {
 const notif = unreadNotifications[index];
 if (!notif) return;
 
 let details = '';
 if (notif.type === 'message') {
  details = `From: ${notif.data.name || 'Anonymous'}\nEmail: ${notif.data.email || '-'}\n\nMessage:\n${notif.data.message || ''}`;
 } else {
  details = `Applicant: ${notif.data.name || 'N/A'}\nPosition: ${notif.data.position || 'General'}\nPhone: ${notif.data.phone || '-'}`;
 }
 
 alert(details);
}

function markAllAsRead() {
 // Clear only the currently shown unread notifications
 unreadNotifications = [];
 
 // Update badge
 updateNotificationBadge();
 
 // Remove panel
 const panel = document.getElementById('notification-panel');
 if (panel) panel.remove();
}
// ====================== QUOTE REQUESTS SECTION ======================
function renderQuotesManagement(container) {
 container.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-semibold">Security Quote Requests</h2>
        </div>
        <div id="quotes-table" class="admin-card overflow-hidden"></div>
    `;
 loadQuoteRequests();
}

function loadQuoteRequests() {
 const container = document.getElementById('quotes-table');
 
 db.ref('quoteRequests').on('value', (snapshot) => {
  let html = `<table><thead><tr>
            <th>Name / Company</th>
            <th>Phone</th>
            <th>Service Needed</th>
            <th>Date</th>
            <th>Actions</th>
        </tr></thead><tbody>`;
  
  let count = 0;
  
  snapshot.forEach(child => {
   const req = child.val();
   const key = child.key;
   const date = req.timestamp ? new Date(req.timestamp).toLocaleString() : 'N/A';
   count++;
   
   html += `
                <tr>
                    <td>${req.name || 'Anonymous'}</td>
                    <td>${req.phone || '-'}</td>
                    <td class="text-amber-400">${req.service || 'General Security'}</td>
                    <td class="text-sm text-zinc-400">${date}</td>
                    <td>
                        <button onclick="deleteItem('quoteRequests', '${key}')" 
                                class="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                </tr>`;
  });
  
  html += `</tbody></table>`;
  
  container.innerHTML = html || '<p class="p-8 text-center text-zinc-500">No quote requests yet</p>';
  
  // Update the badge count in sidebar
  updateQuoteCount(count);
 });
}

function updateQuoteCount(count) {
 const badge = document.getElementById('quote-count');
 if (badge) {
  badge.textContent = count > 0 ? count : '';
  badge.classList.toggle('hidden', count === 0);
 }
}

// ====================== CRUD FUNCTIONS ======================
// Services Management
function renderServicesManagement(container) {
 container.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-semibold">All Services</h2>
            <button onclick="showAddServiceModal()" 
                    class="px-6 py-3 bg-amber-500 text-black rounded-2xl font-medium flex items-center gap-2">
                <i class="fas fa-plus"></i> Add New Service
            </button>
        </div>
        <div id="services-table" class="admin-card overflow-hidden">
            <!-- Populated by loadServices() -->
        </div>
    `;
 loadServices();
}

function loadServices() {
 const container = document.getElementById('services-table');
 db.ref('services').on('value', (snapshot) => {
  let html = `<table><thead><tr><th>Title</th><th>Short Description</th><th>Actions</th></tr></thead><tbody>`;
  snapshot.forEach(child => {
   const service = child.val();
   const key = child.key;
   html += `
                <tr>
                    <td>${service.title || 'Untitled'}</td>
                    <td class="text-zinc-400">${(service.short || '').substring(0, 60)}...</td>
                    <td>
                        <button onclick="editService('${key}')" class="text-amber-400 hover:text-amber-300 mr-4">Edit</button>
                        <button onclick="deleteItem('services', '${key}')" class="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                </tr>`;
  });
  html += `</tbody></table>`;
  container.innerHTML = html || '<p class="p-8 text-center text-zinc-500">No services yet</p>';
 });
}

function showAddServiceModal() {
 // Simple prompt for demo (in production use a nice modal)
 const title = prompt("Service Title:");
 if (!title) return;
 const short = prompt("Short description:");
 db.ref('services').push({
  title: title,
  short: short || '',
  full: "Full description here...",
  icon: "fa-shield-alt"
 });
}

function editService(key) {
 alert(`Edit service with key: ${key}\n\n(In a full version this would open a rich form)`);
 // Extend with a proper modal in production
}

function deleteItem(node, key) {
 if (confirm("Delete this item permanently?")) {
  db.ref(`${node}/${key}`).remove();
 }
}

// ====================== MESSAGES SECTION ======================
function renderMessages(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-semibold">Contact Messages</h2>
        </div>
        <div id="messages-table" class="admin-card overflow-hidden"></div>
    `;
    loadMessages();
}

function loadMessages() {
    const container = document.getElementById('messages-table');
    db.ref('messages').on('value', (snapshot) => {
        let html = `<table><thead><tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
            <th>Actions</th>
        </tr></thead><tbody>`;

        snapshot.forEach(child => {
            const msg = child.val();
            const key = child.key;
            const date = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A';

            html += `
                <tr>
                    <td>${msg.name || 'Anonymous'}</td>
                    <td>${msg.email || '-'}</td>
                    <td class="max-w-xs truncate">${msg.message || ''}</td>
                    <td class="text-sm text-zinc-400">${date}</td>
                    <td>
                        <button onclick="deleteItem('messages', '${key}')" 
                                class="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html || '<p class="p-8 text-center text-zinc-500">No messages yet</p>';
    });
}

// ====================== APPLICATIONS SECTION ======================
function renderApplications(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-semibold">Job Applications</h2>
        </div>
        <div id="applications-table" class="admin-card overflow-hidden"></div>
    `;
    loadApplications();
}

function loadApplications() {
    const container = document.getElementById('applications-table');
    db.ref('applications').on('value', (snapshot) => {
        let html = `<table><thead><tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Date</th>
            <th>Actions</th>
        </tr></thead><tbody>`;

        snapshot.forEach(child => {
            const app = child.val();
            const key = child.key;
            const date = app.timestamp ? new Date(app.timestamp).toLocaleString() : 'N/A';

            html += `
                <tr>
                    <td>${app.name || 'N/A'}</td>
                    <td>${app.email || '-'}</td>
                    <td>${app.phone || '-'}</td>
                    <td>${app.position || 'General'}</td>
                    <td class="text-sm text-zinc-400">${date}</td>
                    <td>
                        ${app.cvUrl && app.cvUrl !== 'no-cv-uploaded' ? 
                            `<a href="${app.cvUrl}" target="_blank" class="text-amber-400 hover:text-amber-300 mr-3">View CV</a>` : ''}
                        <button onclick="deleteItem('applications', '${key}')" 
                                class="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html || '<p class="p-8 text-center text-zinc-500">No applications yet</p>';
    });
}

// Projects & Jobs remain as placeholders (as per your request)
function renderProjectsManagement(container) {
 container.innerHTML = `<p class="text-center py-20 text-zinc-400">Projects Management - Similar CRUD as Services</p>`;
}

function renderJobsManagement(container) {
 container.innerHTML = `<p class="text-center py-20 text-zinc-400">Job Listings Management</p>`;
}

// ====================== INITIALIZATION ======================
document.addEventListener('DOMContentLoaded', () => {
 initFirebase();
 checkAuth();
 
 console.log('%c✅ MarkMellon Admin Panel initialized', 'color:#fbbf24; font-weight:bold');
});