// ================================================
// SXL.ML - MAIN DEVELOPER SCRIPT
// Version: 1.0
// Author: MarkMellon / Developer
// Purpose: system + Security + Performance
// Last Updated: April 2026
// ================================================

console.log('%c🚀 SXL.ML Developer Script Loaded Successfully', 'color: #ffd700; font-size: 14px; font-weight: bold');

// ====================== CONFIGURATION ======================
const CONFIG = {
 siteUrl: 'https://sxl.ml',
 firebaseNode: 'quoteRequests',
 formCooldown: 30000, // 30 seconds between submissions
 minFillTime: 5000, // Minimum 5 seconds to fill form
 maxRequestsPerMinute: 60,
 debugMode: true // Set to false in production
};

// ====================== SESSION TRACKING ======================
let pageLoadTime = Date.now();
let lastFormSubmission = 0;
let requestCount = 0;
let lastRequestReset = Date.now();
let mouseActivity = 0;
let keyboardActivity = 0;

// ====================== SECURITY HELPERS ======================
function isRateLimited() {
 const now = Date.now();
 if (now - lastRequestReset > 60000) {
  requestCount = 0;
  lastRequestReset = now;
 }
 requestCount++;
 return requestCount > CONFIG.maxRequestsPerMinute;
}

function containsSuspiciousContent(text) {
 if (!text) return false;
 const lower = text.toLowerCase();
 const spamKeywords = /viagra|casino|porn|crypto|investment|buy now|cheap offer/i;
 return spamKeywords.test(lower) || /<script|javascript:|onerror/i.test(text);
}

// ====================== QUOTE MODAL FUNCTIONS ======================

// Show Modal
window.showQuoteModal = function() {
 const modal = document.getElementById('quoteModal');
 if (modal) {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  pageLoadTime = Date.now(); // Reset fill timer
  console.log('%cQuote modal opened', 'color: #4ade80');
 }
};

// Hide Modal
window.hideQuoteModal = function() {
 const modal = document.getElementById('quoteModal');
 if (modal) {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
 }
 const form = document.getElementById('quoteForm');
 if (form) form.reset();
};

// Handle Quote Submission with full security
window.handleQuoteSubmit = function(e) {
 e.preventDefault();
 
 const submitBtn = document.getElementById('submitBtn');
 if (!submitBtn) return;
 
 const originalText = submitBtn.textContent;
 submitBtn.textContent = "Submitting...";
 submitBtn.disabled = true;
 
 // === SECURITY CHECKS ===
 if (isRateLimited()) {
  alert("Too many requests. Please try again later.");
  resetButton();
  return;
 }
 
 const timeTaken = Date.now() - pageLoadTime;
 if (timeTaken < CONFIG.minFillTime) {
  alert("Please take a moment to fill the form properly.");
  resetButton();
  return;
 }
 
 const honeypot = document.getElementById('honeypot');
 if (honeypot && honeypot.value.trim() !== '') {
  console.warn("Honeypot triggered - possible bot");
  resetButton();
  return;
 }
 
 // Collect data
 const quoteData = {
  name: document.getElementById('name')?.value.trim() || '',
  email: document.getElementById('email')?.value.trim() || '',
  phone: document.getElementById('phone')?.value.trim() || '',
  service: document.getElementById('service')?.value || '',
  description: document.getElementById('description')?.value.trim() || '',
  timestamp: firebase.database.ServerValue.TIMESTAMP || Date.now(),
  status: "new",
  fillTimeMs: timeTaken,
  clientInfo: navigator.userAgent.substring(0, 100)
 };
 
 // Final validation
 if (!quoteData.name || !quoteData.email || !quoteData.service || !quoteData.description) {
  alert("Please fill in all required fields.");
  resetButton();
  return;
 }
 
 if (containsSuspiciousContent(quoteData.description)) {
  alert("Your submission contains disallowed content.");
  resetButton();
  return;
 }
 
 if (CONFIG.debugMode) console.log("Saving quote data:", quoteData);
 
 // Save to Firebase
 firebase.database().ref(CONFIG.firebaseNode)
  .push(quoteData)
  .then((snapshot) => {
   lastFormSubmission = Date.now();
   console.log(`✅ Quote saved successfully! Key: ${snapshot.key}`);
   alert("✅ Thank you! Your quote request has been submitted.");
   hideQuoteModal();
  })
  .catch((error) => {
   console.error("Firebase Error:", error);
   alert("❌ Failed to submit. Please try again.");
  })
  .finally(() => {
   resetButton();
  });
};

function resetButton() {
 const btn = document.getElementById('submitBtn');
 if (btn) {
  btn.textContent = "Submit Request";
  btn.disabled = false;
 }
}

// ====================== INITIALIZATION ======================
function initDeveloperScript() {
 // Initialize quote form
 const quoteForm = document.getElementById('quoteForm');
 if (quoteForm) {
  quoteForm.addEventListener('submit', handleQuoteSubmit);
 }
 
 // Add honeypot dynamically if missing
 if (quoteForm && !document.getElementById('honeypot')) {
  const hp = document.createElement('input');
  hp.type = 'text';
  hp.id = 'honeypot';
  hp.style.cssText = 'position:absolute; left:-9999px; opacity:0;';
  hp.tabIndex = -1;
  quoteForm.appendChild(hp);
 }
 
 // Track basic human behavior (anti-bot)
 document.addEventListener('mousemove', () => { mouseActivity++; }, { once: true });
 document.addEventListener('keydown', () => { keyboardActivity++; }, { once: true });
 
 console.log('%c✅ All systems initialized for sxl.ml', 'color: #60a5fa; font-weight: bold');
}

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', initDeveloperScript);

// Expose globally for easy debugging in console
window.SXL = {
 showQuoteModal: window.showQuoteModal,
 hideQuoteModal: window.hideQuoteModal,
 config: CONFIG,
 version: "1.0"
};