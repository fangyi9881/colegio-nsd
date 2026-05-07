// =========================================================
// Partials reutilizables: header, drawer móvil y footer
// =========================================================
(function () {
  'use strict';

  const PAGE = document.documentElement.dataset.page || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inyecta CSS de animaciones si no está
  if (!document.querySelector('link[href*="animations.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/animations.css';
    document.head.appendChild(link);
  }

  const TOPBAR = `
  <div class="topbar">
    <div class="container topbar__inner">
      <div class="topbar__contact">
        <a href="tel:+34911234567" aria-label="Teléfono"><i class="bi bi-telephone-fill"></i> <span>91 123 45 67</span></a>
        <a href="mailto:secretaria@colegionsdolores.com" aria-label="Email"><i class="bi bi-envelope-fill"></i> <span>secretaria@colegionsdolores.com</span></a>
        <span class="topbar__addr d-none-mobile"><i class="bi bi-geo-alt-fill"></i> C/ Tordo, 9-15 · 28019 Madrid</span>
      </div>
      <div class="topbar__quick">
        <a href="https://web2.alexiaedu.com/ACWeb/LogOn.aspx" target="_blank" rel="noopener" class="quick-link"><i class="bi bi-person-badge"></i> Alexia</a>
        <a href="https://raices.madrid.org/" target="_blank" rel="noopener" class="quick-link"><i class="bi bi-tree"></i> Raíces</a>
        <a href="https://twitter.com/colegio_nsd" target="_blank" rel="noopener" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
        <a href="https://www.facebook.com/colegioNSD" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
      </div>
    </div>
  </div>`;

  const NAV = `
  <header class="navbar" id="navbar">
    <div class="container navbar__inner">
      <a href="/" class="brand">
        <img src="/assets/img/logo.svg" alt="Logo NSD" class="brand__logo" />
        <span class="brand__text">
          <strong>Colegio NSD</strong>
          <small>Nuestra Señora de los Dolores</small>
        </span>
      </a>

      <nav class="nav" id="primaryNav" aria-label="Principal">
        <ul>
          <li><a href="/" data-link="home">Inicio</a></li>
          <li class="has-dropdown">
            <a href="/centro/sobre-nosotros.html" data-link="centro">El Centro <i class="bi bi-chevron-down"></i></a>
            <ul class="dropdown">
              <li><a href="/centro/sobre-nosotros.html">Sobre Nosotros</a></li>
              <li><a href="/centro/sobre-nosotros.html#valores">Misión y Valores</a></li>
              <li><a href="/centro/departamentos.html">Departamentos</a></li>
            </ul>
          </li>
          <li class="has-dropdown">
            <a href="/etapas/infantil-0-3.html" data-link="etapas">Etapas <i class="bi bi-chevron-down"></i></a>
            <ul class="dropdown">
              <li><a href="/etapas/infantil-0-3.html">Infantil 0–3</a></li>
              <li><a href="/etapas/infantil-3-6.html">Infantil 3–6</a></li>
              <li><a href="/etapas/primaria.html">Primaria</a></li>
              <li><a href="/etapas/eso.html">ESO</a></li>
            </ul>
          </li>
          <li><a href="/#servicios" data-link="servicios">Servicios</a></li>
          <li><a href="/blog/" data-link="blog">Blog</a></li>
          <li><a href="/contacto.html" data-link="contacto">Contacto</a></li>
          <li><a class="nav-cta magnetic" href="/admision.html"><i class="bi bi-mortarboard-fill"></i> Admisión</a></li>
        </ul>
      </nav>

      <button class="hamburger-x" id="hamburger" aria-label="Abrir menú" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <aside class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer__bg" aria-hidden="true">
      <span class="morph-blob"></span>
      <span class="morph-blob"></span>
    </div>
    <ul>
      <li><a href="/">Inicio <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/centro/sobre-nosotros.html">Sobre Nosotros <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/etapas/primaria.html">Etapas <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/centro/departamentos.html">Departamentos <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/blog/">Blog <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/admision.html">Admisión <i class="bi bi-arrow-right"></i></a></li>
      <li><a href="/contacto.html">Contacto <i class="bi bi-arrow-right"></i></a></li>
    </ul>
    <div class="drawer__footer">
      <a href="https://twitter.com/colegio_nsd" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
      <a href="https://www.facebook.com/colegioNSD" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
      <a href="tel:+34911234567" aria-label="Llamar"><i class="bi bi-telephone-fill"></i></a>
      <a href="mailto:secretaria@colegionsdolores.com" aria-label="Email"><i class="bi bi-envelope-fill"></i></a>
    </div>
  </aside>`;

  const FOOTER = `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="/" class="brand">
          <img src="/assets/img/logo.svg" alt="Logo NSD" class="brand__logo brand__logo--lg" />
          <span class="brand__text">
            <strong>Colegio NSD</strong>
            <small>Nuestra Señora de los Dolores</small>
          </span>
        </a>
        <p>Centro concertado bilingüe en Carabanchel. Educamos personas desde 1958.</p>
      </div>

      <div>
        <h5>Centro</h5>
        <ul>
          <li><a href="/centro/sobre-nosotros.html">Sobre nosotros</a></li>
          <li><a href="/centro/sobre-nosotros.html#valores">Misión y valores</a></li>
          <li><a href="/etapas/primaria.html">Etapas educativas</a></li>
          <li><a href="/centro/departamentos.html">Departamentos</a></li>
        </ul>
      </div>

      <div>
        <h5>Familias</h5>
        <ul>
          <li><a href="/admision.html">Admisión</a></li>
          <li><a href="/blog/">Comunicados</a></li>
          <li><a href="/blog/">Becas y ayudas</a></li>
          <li><a href="/contacto.html">Contacto</a></li>
        </ul>
      </div>

      <div>
        <h5>Accesos</h5>
        <ul>
          <li><a href="https://web2.alexiaedu.com/" target="_blank" rel="noopener">Alexia</a></li>
          <li><a href="https://raices.madrid.org/" target="_blank" rel="noopener">Raíces</a></li>
          <li><a href="#">Secretaría virtual</a></li>
          <li><a href="#">Acceso profesores</a></li>
        </ul>
      </div>

      <div>
        <h5>Contacto</h5>
        <ul class="footer__contact">
          <li><i class="bi bi-geo-alt"></i> C/ Tordo, 9-15<br/>28019 Madrid</li>
          <li><i class="bi bi-telephone"></i> 91 123 45 67</li>
          <li><i class="bi bi-envelope"></i> secretaria@colegionsdolores.com</li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>© <span id="year"></span> Colegio Nuestra Señora de los Dolores. Todos los derechos reservados.</p>
        <ul>
          <li><a href="#">Aviso legal</a></li>
          <li><a href="#">Política de privacidad</a></li>
          <li><a href="#">Cookies</a></li>
        </ul>
      </div>
    </div>

    <a href="#top" class="to-top magnetic" aria-label="Volver arriba"><i class="bi bi-arrow-up"></i></a>
  </footer>

  <div class="mobile-cta-bar" id="mobileCta" aria-hidden="true">
    <a href="tel:+34911234567" class="cta-call"><i class="bi bi-telephone-fill"></i> Llamar</a>
    <a href="/contacto.html" class="cta-visit"><i class="bi bi-calendar-check"></i> Reservar visita</a>
  </div>

  <div class="cursor-ring" aria-hidden="true"></div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>`;

  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.innerHTML = TOPBAR + NAV;
  if (footerSlot) footerSlot.innerHTML = FOOTER;

  if (PAGE) {
    document.querySelectorAll(`[data-link="${PAGE}"]`).forEach(a => {
      a.classList.add('is-active');
      a.style.background = 'var(--green-100)';
      a.style.color = 'var(--green-900)';
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const nav = document.getElementById('navbar');
  const onScroll = () => { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12); };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll progress
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Drawer
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false); });
  }

  // Mobile CTA
  const mobileCta = document.getElementById('mobileCta');
  if (mobileCta) {
    let visible = false;
    const checkCta = () => {
      const should = window.scrollY > 400;
      if (should !== visible) {
        visible = should;
        mobileCta.classList.toggle('is-visible', visible);
      }
    };
    document.addEventListener('scroll', checkCta, { passive: true });
    checkCta();
  }

  // Reveal global (también para páginas internas que no marquen [data-reveal] explícito)
  const autoReveal = document.querySelectorAll(
    '.section, .stage, .value, .service, .news__item, .dept, .highlight, .teacher, .form-card'
  );
  autoReveal.forEach(el => { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // Magnetic
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

    // Cursor ring
    const ring = document.querySelector('.cursor-ring');
    if (ring) {
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
      document.querySelectorAll('a, button, .stage, .value, .service, .news__item, .dept, .magnetic, .teacher')
        .forEach(el => {
          el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
          el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
        });
    }
  }
})();
