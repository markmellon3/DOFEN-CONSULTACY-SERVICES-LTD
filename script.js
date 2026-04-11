// script.js
// Tailwind configuration (dark navy + gold theme)
function initializeTailwind() {
    tailwind.config = {
        content: [],
        theme: {
            extend: {
                colors: {
                    navy: '#001f3f',
                    gold: '#ffd700'
                }
            }
        }
    }
}

// Firebase Configuration - REPLACE WITH YOUR OWN FIREBASE PROJECT DETAILS
let firebaseApp, db, storage

function initializeFirebase() {
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

    // Initialize only if config is filled
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebaseApp = firebase.initializeApp(firebaseConfig)
        db = firebase.database()
        storage = firebase.storage()
        console.log('%c✅ Firebase connected successfully', 'color:#ffd700;font-weight:bold')
        loadProjectsFromFirebase()
        loadDynamicAssets()
    } else {
        console.log('%c⚠️ Firebase not configured yet – using demo data', 'color:#ffd700')
        loadProjectsDemo()
        loadDynamicAssetsDemo()
    }
}

// Load logo + hero background dynamically from Firebase Storage
async function loadDynamicAssets() {
    if (!storage) return
    try {
        // Logo
        const logoRef = storage.ref('assets/logo.png')
        const logoURL = await logoRef.getDownloadURL()
        document.getElementById('dynamic-logo').src = logoURL

        // Hero background
        const heroRef = storage.ref('assets/hero-bg.jpg')
        const heroURL = await heroRef.getDownloadURL()
        document.getElementById('hero-background').style.backgroundImage = 
            `linear-gradient(rgba(0, 31, 63, 0.75), rgba(0, 31, 63, 0.75)), url('${heroURL}')`
    } catch (e) {
        console.log('Using default assets')
    }
}

function loadDynamicAssetsDemo() {
    // Demo already uses picsum – no action needed
}

// Services data
const servicesData = [
    {
        id: 0,
        icon: "fa-user-shield",
        title: "Security Guards",
        short: "Residential & Commercial",
        full: `<h3 class="text-4xl font-bold mb-6">Security Guards</h3>
               <p class="text-white/80 mb-8">Highly trained, uniformed officers for 24/7 protection of homes, offices, factories, and retail spaces. Background-checked and continuously trained.</p>
               <ul class="space-y-4 text-white/70"><li class="flex gap-3"><i class="fas fa-check text-gold"></i>Armed / Unarmed options</li><li class="flex gap-3"><i class="fas fa-check text-gold"></i>Access control &amp; visitor management</li><li class="flex gap-3"><i class="fas fa-check text-gold"></i>Patrol logging via mobile app</li></ul>`
    },
    {
        id: 1,
        icon: "fa-video",
        title: "CCTV Installation & Monitoring",
        short: "Smart surveillance systems",
        full: `<h3 class="text-4xl font-bold mb-6">CCTV Installation &amp; Monitoring</h3>
               <p class="text-white/80 mb-8">State-of-the-art cameras, AI motion detection, and 24/7 remote monitoring from our Kampala control room.</p>`
    },
    {
        id: 2,
        icon: "fa-bell",
        title: "Alarm Systems",
        short: "Intruder &amp; panic alerts",
        full: `<h3 class="text-4xl font-bold mb-6">Alarm Systems</h3><p>Instant alerts to our response team and your phone. Integrated with police and medical services.</p>`
    },
    {
        id: 3,
        icon: "fa-users-rectangle",
        title: "Event Security",
        short: "Concerts, conferences &amp; weddings",
        full: `<h3 class="text-4xl font-bold mb-6">Event Security</h3><p>Full crowd management, bag checks, VIP lanes, and emergency medical standby.</p>`
    },
    {
        id: 4,
        icon: "fa-user-secret",
        title: "VIP Protection",
        short: "Executive &amp; dignitary detail",
        full: `<h3 class="text-4xl font-bold mb-6">VIP &amp; Executive Protection</h3><p>Close protection officers, advance route surveys, and discreet surveillance.</p>`
    },
    {
        id: 5,
        icon: "fa-car",
        title: "Patrol & Response Services",
        short: "Mobile rapid response",
        full: `<h3 class="text-4xl font-bold mb-6">Patrol &amp; Rapid Response</h3><p>GPS-tracked patrol vehicles with average 4.8-minute response time across Greater Kampala.</p>`
    }
]
// ====================== QUOTE MODAL & FIREBASE SUBMISSION ======================

// Show Quote Modal
function showQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        console.error("Quote modal element not found!");
    }
}

// Hide Quote Modal
function hideQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    const form = document.getElementById('quoteForm');
    if (form) form.reset();
}

// Handle Quote Form Submission
function handleQuoteSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = "Submitting...";
    submitBtn.disabled = true;
    
    // Collect form data with validation
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const service = document.getElementById('service')?.value;
    const description = document.getElementById('description')?.value.trim();
    
    if (!name || !email || !service || !description) {
        alert("Please fill in all required fields.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    const quoteData = {
        name,
        email,
        phone: phone || null,
        service,
        description,
        timestamp: firebase.database.ServerValue.TIMESTAMP || Date.now(), // Fallback
        status: "new",
        userAgent: navigator.userAgent.substring(0, 200) // Optional: helps debugging
    };
    
    console.log("Attempting to save quote:", quoteData);
    
    // Save to Firebase
    firebase.database().ref('quoteRequests')
        .push(quoteData)
        .then((snapshot) => {
            console.log("Quote saved successfully! Key:", snapshot.key);
            alert("✅ Thank you! Your quote request has been submitted successfully.");
            hideQuoteModal();
        })
        .catch((error) => {
            console.error("Firebase save error:", error.code, error.message);
            let msg = "❌ Failed to submit. Please try again.";
            
            if (error.code === 'PERMISSION_DENIED') {
                msg = "❌ Permission denied. Please check your Firebase Database Rules.";
            } else if (error.message.includes('database')) {
                msg = "❌ Firebase connection issue. Make sure Firebase is properly initialized.";
            }
            
            alert(msg);
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Initialize everything safely
function initQuoteSystem() {
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
        console.log("Quote form initialized successfully.");
    } else {
        console.warn("Quote form not found in DOM yet.");
    }
}

// Run initialization when DOM is ready + small delay for Firebase
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Firebase SDK is loaded from your other script
    setTimeout(initQuoteSystem, 300);
});

// Expose functions globally for onclick in HTML
window.showQuoteModal = showQuoteModal;
window.hideQuoteModal = hideQuoteModal;

// Render services
function renderServices() {
    const container = document.getElementById('services-grid')
    container.innerHTML = ''
    servicesData.forEach(service => {
        const cardHTML = `
        <div onclick="showServiceDetail(${service.id})" 
             class="glass-card rounded-3xl p-8 cursor-pointer hover:scale-[1.03] group">
            <i class="fas ${service.icon} text-5xl text-[#ffd700] mb-6 group-active:scale-110"></i>
            <h3 class="text-2xl font-semibold mb-2">${service.title}</h3>
            <p class="text-white/70">${service.short}</p>
            <div class="mt-8 text-[#ffd700] text-sm flex items-center gap-2">
                LEARN MORE 
                <i class="fas fa-arrow-right group-hover:translate-x-1"></i>
            </div>
        </div>`
        container.innerHTML += cardHTML
    })
}

// Show service modal
function showServiceDetail(id) {
    const service = servicesData.find(s => s.id === id)
    if (!service) return
    const modal = document.getElementById('service-modal')
    document.getElementById('modal-content').innerHTML = service.full
    modal.classList.remove('hidden')
    modal.classList.add('flex')
}

function hideServiceModal() {
    const modal = document.getElementById('service-modal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
}

// Projects
let projectsDemo = [
    { title: "Kampala Serena Hotel", desc: "Full CCTV + 40 guards for 2025 AU Summit", image: "https://picsum.photos/id/1015/600/400" },
    { title: "MTN Uganda HQ", desc: "Perimeter patrol &amp; alarm integration", image: "https://picsum.photos/id/201/600/400" },
    { title: "Private Residence – Kololo", desc: "24/7 residential security package", image: "https://picsum.photos/id/866/600/400" }
]

function loadProjectsDemo() {
    renderProjects(projectsDemo)
}

function loadProjectsFromFirebase() {
    if (!db) return
    db.ref('projects').on('value', (snapshot) => {
        const data = snapshot.val()
        if (data) {
            const arr = Object.values(data)
            renderProjects(arr)
        }
    })
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid')
    container.innerHTML = projects.map(p => `
        <div class="glass-card rounded-3xl overflow-hidden">
            <img src="${p.image}" class="w-full h-56 object-cover">
            <div class="p-6">
                <h4 class="font-semibold text-xl">${p.title}</h4>
                <p class="text-white/70 text-sm mt-2">${p.desc}</p>
            </div>
        </div>
    `).join('')
}

// Team data (static)
const teamMembers = [
    { name: "Col. --------", role: "Founder &amp; CEO", img: "https://picsum.photos/id/64/140/140" },
    { name: "Capt. -------", role: "Operations Director", img: "https://picsum.photos/id/1009/140/140" },
    { name: "Eng. --------", role: "Technical Director", img: "https://picsum.photos/id/201/140/140" },
    { name: "Lt. --------", role: "Training Manager", img: "https://picsum.photos/id/1005/140/140" }
]

function renderTeam() {
    const container = document.getElementById('team-grid')
    container.innerHTML = teamMembers.map(member => `
        <div class="glass-card rounded-3xl p-4 text-center">
            <img src="${member.img}" alt="" class="mx-auto rounded-2xl mb-4 w-20 h-20 object-cover">
            <p class="font-semibold">${member.name}</p>
            <p class="text-xs text-[#ffd700]">${member.role}</p>
        </div>
    `).join('')
}

// Careers data
const careersData = [
    { title: "Security Guard", location: "Kampala", salary: "UGX 850,000 / month", desc: "Uniform provided • Training included" },
    { title: "CCTV Control Room Operator", location: "Kampala", salary: "UGX 1,200,000 / month", desc: "Night shift available" },
    { title: "VIP Protection Officer", location: "Nationwide", salary: "Competitive + allowances", desc: "Advanced tactical training required" }
]

function renderCareers() {
    const container = document.getElementById('careers-grid')
    container.innerHTML = careersData.map(job => `
        <div class="glass-card rounded-3xl p-8 flex flex-col">
            <div class="flex-1">
                <h3 class="text-2xl font-bold">${job.title}</h3>
                <p class="text-[#ffd700]">${job.location}</p>
                <p class="text-sm mt-6">${job.desc}</p>
                <p class="mt-6 text-xs uppercase">${job.salary}</p>
            </div>
            <button onclick="showApplicationModal()" 
                    class="mt-8 w-full py-4 bg-white/10 hover:bg-[#ffd700] hover:text-black rounded-3xl text-sm font-medium">APPLY NOW</button>
        </div>
    `).join('')
}
// ====================== WEBSITE-WIDE ANTI-ABUSE & SECURITY LAYER ======================

// Configuration
const SECURITY_CONFIG = {
    maxRequestsPerMinute: 60, // Global rate limit per browser session
    formCooldown: 30000, // 30 seconds between form submissions
    minPageInteractionTime: 3000, // Minimum time on page before allowing sensitive actions
    suspiciousKeywords: [
        /viagra|casino|porn|buy now|cheap offer|crypto|investment/i,
        /<script|javascript:|onerror|onload|eval\(/i
    ]
};

// Session tracking
let requestCount = 0;
let lastRequestReset = Date.now();
let lastFormSubmission = 0;
let pageLoadTime = Date.now();
let mouseActivity = 0;
let keyboardActivity = 0;

// Simple device fingerprint (for session uniqueness)
let sessionFingerprint = '';

// Generate basic fingerprint
function generateFingerprint() {
    return btoa(navigator.userAgent + screen.width + screen.height + navigator.language).substring(0, 20);
}

// Track human-like behavior
function trackHumanBehavior() {
    document.addEventListener('mousemove', () => { mouseActivity++; }, { once: true });
    document.addEventListener('keydown', () => { keyboardActivity++; }, { once: true });
    document.addEventListener('scroll', () => { mouseActivity++; }, { once: true });
}

// Rate limiting check
function isRateLimited() {
    const now = Date.now();
    if (now - lastRequestReset > 60000) { // Reset every minute
        requestCount = 0;
        lastRequestReset = now;
    }
    requestCount++;
    return requestCount > SECURITY_CONFIG.maxRequestsPerMinute;
}

// Check for suspicious content
function containsSuspiciousContent(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return SECURITY_CONFIG.suspiciousKeywords.some(pattern => pattern.test(lowerText));
}

// Global form protection (applies to all forms automatically)
function protectAllForms() {
    document.querySelectorAll('form').forEach(form => {
        // Add honeypot if not present
        if (!form.querySelector('.anti-bot-honeypot')) {
            const honeypot = document.createElement('input');
            honeypot.type = 'text';
            honeypot.name = 'website';
            honeypot.className = 'anti-bot-honeypot';
            honeypot.style.cssText = 'position:absolute; left:-9999px; opacity:0;';
            honeypot.tabIndex = -1;
            honeypot.autocomplete = 'off';
            form.appendChild(honeypot);
        }
        
        // Override submit if needed
        form.addEventListener('submit', function(e) {
            const honeypot = form.querySelector('.anti-bot-honeypot');
            if (honeypot && honeypot.value.trim() !== '') {
                console.warn('Honeypot triggered - possible bot');
                e.preventDefault();
                return false;
            }
            
            // Rate limit forms
            const now = Date.now();
            if (now - lastFormSubmission < SECURITY_CONFIG.formCooldown) {
                e.preventDefault();
                alert('Please wait a moment before submitting another request.');
                return false;
            }
        });
    });
}

// Block common bad behaviors
function blockSuspiciousActions() {
    // Disable right-click on sensitive areas (optional - can be annoying)
    // document.addEventListener('contextmenu', e => {
    //     if (e.target.tagName === 'IMG' || e.target.closest('input[type="password"]')) {
    //         e.preventDefault();
    //     }
    // });
    
    // Prevent excessive rapid clicks (clickjacking / spam)
    let clickCount = 0;
    document.addEventListener('click', () => {
        clickCount++;
        if (clickCount > 50) { // Very high click rate
            console.warn('Excessive clicking detected');
        }
    });
}

// Initialize security
function initWebsiteSecurity() {
    sessionFingerprint = generateFingerprint();
    pageLoadTime = Date.now();
    trackHumanBehavior();
    protectAllForms();
    blockSuspiciousActions();
    
    console.log('%cWebsite security layer initialized', 'color: green; font-weight: bold');
    
    // Periodic cleanup / monitoring
    setInterval(() => {
        if (mouseActivity === 0 && keyboardActivity === 0 && (Date.now() - pageLoadTime > 10000)) {
            console.warn('Low human activity detected - possible headless browser');
        }
    }, 30000);
}

// Enhanced quote submit (integrates with your existing function)
window.enhancedHandleQuoteSubmit = function(e) {
    // Add your original handleQuoteSubmit logic here, plus extra checks:
    
    if (isRateLimited()) {
        alert('Too many requests. Please try again later.');
        e.preventDefault();
        return false;
    }
    
    // Example: Check description field for spam
    const description = document.getElementById('description')?.value || '';
    if (containsSuspiciousContent(description)) {
        alert('Your message contains disallowed content. Please review it.');
        e.preventDefault();
        return false;
    }
    
    // Check human interaction
    if (mouseActivity < 2 && keyboardActivity < 1) {
        console.warn('Low interaction - possible bot');
        // You can still allow but log it, or block for stricter mode
    }
    
    // Call your original submission after checks
    // handleQuoteSubmit(e);  // Uncomment and use your real function
};

// Auto start
document.addEventListener('DOMContentLoaded', initWebsiteSecurity);

// Expose key functions if needed
window.showQuoteModal = window.showQuoteModal || function() { /* your modal function */ };

// Counter animation for stats
function animateStats() {
    function countUp(el, target, suffix = '') {
        let count = 0
        const increment = Math.ceil(target / 60)
        const timer = setInterval(() => {
            count += increment
            if (count >= target) {
                count = target
                clearInterval(timer)
            }
            el.textContent = count + suffix
        }, 20)
    }
    countUp(document.getElementById('stat-years'), 5)
    countUp(document.getElementById('stat-clients'), 520)
    countUp(document.getElementById('stat-guards'), 1050)
    countUp(document.getElementById('stat-response'), 4.8, 's')
}

// Quote modal
function showQuoteModal() {
    document.getElementById('quote-modal').classList.remove('hidden')
    document.getElementById('quote-modal').classList.add('flex')
}

function hideQuoteModal() {
    const modal = document.getElementById('quote-modal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
}

async function handleQuoteSubmit(e) {
    e.preventDefault()
    hideQuoteModal()
    alert("✅ Quote request received! Our team will call you within 30 minutes.")
    // Optional: save to Firebase 'quotes' node if you want
}

// Application modal
function showApplicationModal() {
    document.getElementById('application-modal').classList.remove('hidden')
    document.getElementById('application-modal').classList.add('flex')
}

function hideApplicationModal() {
    const modal = document.getElementById('application-modal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
}

async function handleApplicationSubmit(e) {
    e.preventDefault()
    const name = document.getElementById('app-name').value
    const phone = document.getElementById('app-phone').value
    const email = document.getElementById('app-email').value
    const position = document.getElementById('app-position').value
    const fileInput = document.getElementById('app-cv')

    let cvUrl = 'no-cv-uploaded'
    if (fileInput.files.length > 0 && storage) {
        const file = fileInput.files[0]
        const storageRef = storage.ref('applications/' + Date.now() + '-' + file.name)
        await storageRef.put(file)
        cvUrl = await storageRef.getDownloadURL()
    }

    if (db) {
        await db.ref('applications').push({
            name, phone, email, position, cvUrl,
            timestamp: Date.now()
        })
    }

    hideApplicationModal()
    alert("✅ Application submitted! We will contact you shortly.")
}

// Contact form
async function handleContactSubmit(e) {
    e.preventDefault()
    const name = document.getElementById('contact-name').value
    const email = document.getElementById('contact-email').value
    const message = document.getElementById('contact-message').value

    if (db) {
        await db.ref('messages').push({
            name, email, message,
            timestamp: Date.now()
        })
    }

    e.target.reset()
    alert("✅ Thank you! Your message has been received.")
}

// Optimized Mobile Menu with Click Outside to Close
let isMenuOpen = false;

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('hamburger-icon');
    
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        // Open menu
        menu.classList.remove('hidden');
        menu.style.display = 'block';
        icon.classList.replace('fa-bars', 'fa-xmark');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside, { once: true });
        }, 10); // Small delay to prevent immediate trigger
    } else {
        // Close menu
        closeMobileMenu();
    }
}

// Separate function to close menu cleanly
function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('hamburger-icon');
    
    isMenuOpen = false;
    menu.style.display = 'none';
    icon.classList.replace('fa-xmark', 'fa-bars');
    document.body.style.overflow = 'visible';
}

// Handle clicks outside the mobile menu
function handleClickOutside(event) {
    const menu = document.getElementById('mobile-menu');
    const hamburgerBtn = document.getElementById('mobile-menu-btn'); // Make sure your button has this ID
    
    // If click is NOT inside the menu AND NOT on the hamburger button → close menu
    if (!menu.contains(event.target) && !hamburgerBtn.contains(event.target)) {
        closeMobileMenu();
    }
}

// ====================== SMART LIVE CHAT WITH ENHANCED KEYWORDS + GEMINI AI ======================

let chatOpen = false;
let chatListener = null;

// Add your Gemini API key here (get it from https://aistudio.google.com/)
const GEMINI_API_KEY = "AIzaSyAs-Kava5bQh8PKXTxlbCTJGWAMbnYpLtc"; // ←←← CHANGE THIS

const botResponses = {
    "security guard": "We provide highly trained armed and unarmed security guards for residential, commercial, and industrial properties in Kampala. Would you like a custom quote?",
    "cctv": "Our CCTV systems include high-resolution cameras, AI motion detection, night vision, and 24/7 remote monitoring from our Kampala control room.",
    "alarm": "Our alarm systems deliver instant alerts to your phone and our rapid response team. They integrate with police and emergency services.",
    "event security": "We offer professional event security for concerts, weddings, conferences, and corporate functions — including crowd control and VIP lanes.",
    "vip protection": "Our executive & VIP protection service includes close protection officers, advance route surveys, and discreet surveillance.",
    "patrol": "We run GPS-tracked mobile patrols with an average response time of under 5 minutes across Greater Kampala.",
    "price": "Pricing depends on your specific needs and location. Tell me more details and we can prepare a tailored quote quickly.",
    "cost": "Our rates are competitive. Would you like a free quote for security guards, CCTV, or another service?",
    "quote": "Excellent! What service interests you most? (Security Guards, CCTV, Alarm Systems, Event Security, or VIP Protection?)",
    "contact us": "You can reach our team directly on +256 788 443524 or email info@dofenconsultancyserviceltd.com. We usually reply within 30 minutes.",
    "phone": "Call us anytime on +256 788 443 524 during business hours. Our control room operates 24/7.",
    "email": "Send us an email at info@dofenconsultancyserviceltd.com or use the quote form on our website.",
    "location": "We are based in Kampala and serve the entire Greater Kampala area, including Entebbe, Mukono, and Wakiso.",
    "kampala": "Yes, we are a local Kampala-based security company with rapid response across the city.",
    "how much": "Costs vary by service type and duration. Fill our quick quote form or tell me your requirements for an accurate estimate.",
    "response time": "Our average rapid response time is 4.8 minutes in Greater Kampala thanks to GPS-tracked vehicles.",
    "hello": "Hello! How can Dofen Consultacy services ltd help protect you today?",
    "hi": "Hi there! Looking for reliable security services in Kampala?"
};

const quickSuggestions = [
    "Security Guards",
    "CCTV Installation",
    "Alarm Systems",
    "Event Security",
    "VIP Protection",
    "Get a Quote",
    "Contact Us",
    "Response Time"
];

// Toggle chat window
function toggleLiveChat() {
    const win = document.getElementById('live-chat-window');
    if (!win) return;
    
    chatOpen = !chatOpen;
    win.classList.toggle('hidden', !chatOpen);
    
    const messagesContainer = document.getElementById('chat-messages');
    
    if (chatOpen && messagesContainer.children.length === 0) {
        addBotMessage("Hello! How can our security team assist you today?");
        showQuickSuggestions(messagesContainer);
    }
    
    if (chatOpen) startChatListener();
    else stopChatListener();
}

// Add bot message to UI
function addBotMessage(text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'text-left';
    div.innerHTML = `<span class="inline-block bg-white/10 px-5 py-3 rounded-3xl rounded-bl-none text-sm">${text}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    
    setTimeout(() => showQuickSuggestions(container), 700);
}

// Show quick reply buttons
function showQuickSuggestions(container) {
    let row = container.querySelector('.suggestions-row');
    if (row) row.remove();
    
    row = document.createElement('div');
    row.className = 'suggestions-row flex flex-wrap gap-2 mt-3 px-2';
    
    quickSuggestions.forEach(sug => {
        const btn = document.createElement('button');
        btn.className = 'text-xs bg-white/10 hover:bg-[#ffd700] hover:text-black px-4 py-2 rounded-3xl transition-all';
        btn.textContent = sug;
        btn.onclick = () => sendSuggestedMessage(sug);
        row.appendChild(btn);
    });
    
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
}

// Send message from suggestion button
function sendSuggestedMessage(text) {
    const messages = document.getElementById('chat-messages');
    const userDiv = document.createElement('div');
    userDiv.className = 'text-right';
    userDiv.innerHTML = `<span class="inline-block bg-[#ffd700] text-black px-5 py-2 rounded-3xl rounded-br-none text-sm">${text}</span>`;
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;
    
    saveMessageToFirebase(text, false);
    
    // Generate reply
    getBotReply(text);
}

// Send typed message
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    const messages = document.getElementById('chat-messages');
    const userDiv = document.createElement('div');
    userDiv.className = 'text-right';
    userDiv.innerHTML = `<span class="inline-block bg-[#ffd700] text-black px-5 py-2 rounded-3xl rounded-br-none text-sm">${text}</span>`;
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;
    
    saveMessageToFirebase(text, false);
    input.value = '';
    
    getBotReply(text);
}

// Decide between keyword reply or AI reply
async function getBotReply(userText) {
    const lower = userText.toLowerCase();
    
    // First try keyword matching (fast)
    for (let key in botResponses) {
        if (lower.includes(key)) {
            setTimeout(() => addBotMessage(botResponses[key]), 600);
            return;
        }
    }
    
    // No keyword match → use Gemini AI
    addBotMessage("Thinking..."); // temporary message
    
    try {
        const aiReply = await getGeminiReply(userText);
        // Remove "Thinking..." and show real reply
        const container = document.getElementById('chat-messages');
        container.removeChild(container.lastChild);
        addBotMessage(aiReply);
    } catch (e) {
        console.error(e);
        const container = document.getElementById('chat-messages');
        container.removeChild(container.lastChild);
        addBotMessage("Thank you. Our team will contact you shortly with more information.");
    }
}

// Call Google Gemini API
async function getGeminiReply(prompt) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "AIzaSyAs-Kava5bQh8PKXTxlbCTJGWAMbnYpLtc") {
        return "Thank you for your message. One of our security experts will reply soon.";
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const systemPrompt = `You are a helpful customer support agent for dofenconsultancyserviceltd Services in Kampala, Uganda. 
    We specialize in security guards, CCTV installation & monitoring, alarm systems, event security, VIP protection, and rapid response patrols. 
    Be professional, friendly, and concise. Always offer to provide a quote or direct them to contact us.`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: systemPrompt },
                    { text: "User question: " + prompt }
                ]
            }]
        })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Thank you. Our team will get back to you shortly.";
}

// Save to Firebase (for records / possible admin view)
function saveMessageToFirebase(text, isAdmin) {
    if (!db) return;
    db.ref('liveChat/messages').push({
        text: text,
        isAdmin: isAdmin,
        timestamp: firebase.database.ServerValue.TIMESTAMP || Date.now()
    });
}

// Real-time listener (for future admin replies)
function startChatListener() {
    if (!db || chatListener) return;
    const messagesRef = db.ref('liveChat/messages');
    const container = document.getElementById('chat-messages');
    
    chatListener = messagesRef.orderByChild('timestamp').limitToLast(30).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.isAdmin) return;
        
        const div = document.createElement('div');
        div.className = 'text-left';
        div.innerHTML = `<span class="inline-block bg-white/10 px-5 py-3 rounded-3xl rounded-bl-none text-sm">${data.text}</span>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    });
}

function stopChatListener() {
    if (chatListener && db) {
        db.ref('liveChat/messages').off('child_added', chatListener);
        chatListener = null;
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeTailwind()
    initializeFirebase()
    renderServices()
    renderTeam()
    renderCareers()
    animateStats()

    // Make logo clickable (demo)
    console.log('%c🚀 dofenconsultancyserviceltd Services website ready!', 'background:#ffd700;color:#001f3f;font-size:13px;padding:2px 6px;border-radius:4px')
})
