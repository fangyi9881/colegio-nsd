// =========================================================
// Colegio NSD · Interacciones premium
// - Reveal con stagger (Intersection Observer)
// - Contadores con easing
// - Magnetic buttons
// - 3D tilt cards
// - Parallax
// - Cursor ring
// - Drawer móvil + sticky CTA
// - Scroll progress
// - Smooth scroll con offset
// =========================================================
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Año en footer ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar sombra al scroll ----------
  const nav = document.getElementById('navbar');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Scroll progress bar ----------
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = scrolled + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ---------- Drawer móvil ----------
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    const toggleDrawer = (open) => {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('is-open')));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleDrawer(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggleDrawer(false); });
  }

  // ---------- Sticky CTA mobile (aparece después del hero) ----------
  const mobileCta = document.getElementById('mobileCta');
  if (mobileCta) {
    let visible = false;
    const checkCta = () => {
      const shouldShow = window.scrollY > window.innerHeight * 0.6;
      if (shouldShow !== visible) {
        visible = shouldShow;
        mobileCta.classList.toggle('is-visible', visible);
      }
    };
    document.addEventListener('scroll', checkCta, { passive: true });
    checkCta();
  }

  // ---------- Reveal con IntersectionObserver ----------
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        // Si es un .stat con contador, lánzalo
        const counters = entry.target.querySelectorAll?.('[data-count]');
        counters?.forEach(c => animateCounter(c));
        if (entry.target.matches('.stat')) {
          entry.target.classList.add('is-visible');
        }
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // ---------- Contadores animados ----------
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseInt(el.dataset.count, 10) || 0;
    const duration = reduceMotion ? 0 : 1800;
    const start = performance.now();
    const fmt = new Intl.NumberFormat('es-ES');
    if (duration === 0) { el.textContent = fmt.format(end); return; }
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = fmt.format(Math.floor(end * eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmt.format(end);
    }
    requestAnimationFrame(step);
  }

  // Contadores que ya están en pantalla al cargar
  document.querySelectorAll('[data-count]').forEach(c => {
    const r = c.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) animateCounter(c);
  });

  // ---------- Magnetic buttons ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = 18;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- 3D tilt cards ----------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = 8; // grados
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * -max;
        const ry = (px - 0.5) * max;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => { el.style.transform = ''; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  // ---------- Parallax suave ----------
  if (!reduceMotion) {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length) {
      let ticking = false;
      const update = () => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.speed) || 0.1;
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = center - window.innerHeight / 2;
          el.style.transform = `translate3d(0, ${distance * speed * -0.3}px, 0)`;
        });
        ticking = false;
      };
      document.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
      update();
    }
  }

  // ---------- Cursor ring (desktop) ----------
  const ring = document.querySelector('.cursor-ring');
  if (ring && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      ring.classList.add('is-visible');
    });
    document.addEventListener('mouseleave', () => ring.classList.remove('is-visible'));
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    // Hover cursor en interactivos
    document.querySelectorAll('a, button, .tilt, .stage, .value, .service, .news__item, .gallery-tile, .magnetic')
      .forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
      });
  }

  // ---------- Smooth scroll con offset ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

})();
