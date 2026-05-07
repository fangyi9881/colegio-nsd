// =========================================
// Colegio NSD - Interacciones de la web
// =========================================
(function () {
  'use strict';

  // Año en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Navbar con sombra al hacer scroll
  const nav = document.getElementById('navbar');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú hamburguesa
  const burger = document.getElementById('hamburger');
  const navMenu = document.getElementById('primaryNav');
  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    // Cerrar al hacer click en un enlace (móvil)
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 980) {
          navMenu.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Contadores animados
  const counters = document.querySelectorAll('.stat__num');
  const animateCounter = (el) => {
    const end = parseInt(el.dataset.count, 10) || 0;
    const duration = 1600;
    const start = performance.now();
    const fmt = new Intl.NumberFormat('es-ES');

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt.format(Math.floor(end * eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmt.format(end);
    }
    requestAnimationFrame(step);
  };

  // IntersectionObserver para revelar y contar
  const reveals = document.querySelectorAll(
    '.section, .stage, .value, .service, .news__item, .hero__content, .hero__card, .stat, .img-stack, .form-card'
  );
  reveals.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');

      // Si contiene contadores no animados, lánzalos
      el.querySelectorAll?.('.stat__num').forEach(c => {
        if (!c.dataset.done) {
          c.dataset.done = '1';
          animateCounter(c);
        }
      });

      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => io.observe(el));

  // Si los stats están visibles desde el inicio, dispara igualmente
  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      counters.forEach(c => {
        if (!c.dataset.done) {
          c.dataset.done = '1';
          animateCounter(c);
        }
      });
    }
  }

  // Smooth scroll con offset para el sticky navbar
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
