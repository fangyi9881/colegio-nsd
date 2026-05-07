/* =========================================================
   Campamento Urbano NSD · Main JS
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Año footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Navbar scroll
  const nav = document.getElementById('navbar');
  document.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });

  // Scroll progress
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    document.addEventListener('scroll', () => {
      const h = document.documentElement;
      progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
    }, { passive: true });
  }

  // To-top button
  const toTop = document.querySelector('.to-top');
  if (toTop) {
    document.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
  }

  // Drawer móvil
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  if (burger && drawer) {
    const toggle = (open) => {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(!drawer.classList.contains('is-open')));
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false);
    });
  }

  // Mobile CTA
  const mobileCta = document.getElementById('mobileCta');
  if (mobileCta) {
    let vis = false;
    document.addEventListener('scroll', () => {
      const should = window.scrollY > 400;
      if (should !== vis) { vis = should; mobileCta.classList.toggle('is-visible', vis); mobileCta.setAttribute('aria-hidden', String(!vis)); }
    }, { passive: true });
  }

  // Reveal con IntersectionObserver
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(c => animateCounter(c));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // También observar stats directamente
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); io2.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(c => io2.observe(c));
  }

  // Contadores animados
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = parseInt(el.dataset.count, 10) || 0;
    const dur = reduceMotion ? 0 : 1600;
    const start = performance.now();
    if (dur === 0) { el.textContent = end; return; }
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(end * eased);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = end;
    };
    requestAnimationFrame(step);
  }

  // Magnetic buttons
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width * 16;
        const y = (e.clientY - r.top - r.height / 2) / r.height * 16;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Cursor ring
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const ring = document.querySelector('.cursor-ring');
    if (ring) {
      let mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; ring.classList.add('is-visible'); });
      document.addEventListener('mouseleave', () => ring.classList.remove('is-visible'));
      const loop = () => {
        rx += (mx - rx) * .18;
        ry += (my - ry) * .18;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
      };
      loop();
      document.querySelectorAll('a,button,.act-card,.porque-item,.horario-card')
        .forEach(el => {
          el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
          el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
        });
    }
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight : 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 8, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // Form submit (simulado)
  const form = document.getElementById('inscripcionForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> ¡Solicitud enviada! Te contactamos pronto 🎉';
      btn.style.background = 'var(--green-mid)';
      btn.disabled = true;
    });
  }

})();
