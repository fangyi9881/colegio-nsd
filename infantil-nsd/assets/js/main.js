/* =========================================================
   INFANTIL NSD — main.js
   ========================================================= */

// ── SCROLL PROGRESS ──────────────────────────────────────
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
}, { passive: true });

// ── CURSOR RING ───────────────────────────────────────────
const ring = document.getElementById('cursor-ring');
if (ring && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .pilar, .servicio, .edad-card, .testimonio').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'var(--melocoton)'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'var(--lavanda)'; });
  });
}

// ── NAVBAR SCROLL ─────────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── MOBILE DRAWER ─────────────────────────────────────────
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawer-close');
const drawerOverlay = document.getElementById('drawer-overlay');

function openDrawer() { drawer?.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeDrawer() { drawer?.classList.remove('open'); document.body.style.overflow = ''; }

burger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerOverlay?.addEventListener('click', closeDrawer);
document.querySelectorAll('.drawer__links a').forEach(a => a.addEventListener('click', closeDrawer));

// ── REVEAL ON SCROLL ──────────────────────────────────────
const reveals = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });
reveals.forEach(el => revealObserver.observe(el));

// ── ANIMATED COUNTERS ─────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  const isFloat = String(target).includes('.');

  function tick(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const val = easeOutCubic(elapsed) * target;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (elapsed < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = 'true';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── SMOOTH SCROLL ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── FORM SUBMIT ───────────────────────────────────────────
const form = document.getElementById('form-inscripcion');
const formSuccess = document.getElementById('form-success');
form?.addEventListener('submit', e => {
  e.preventDefault();
  // Aquí se conectará con backend/Formspree/etc.
  form.style.display = 'none';
  formSuccess?.classList.add('show');
  formSuccess?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
