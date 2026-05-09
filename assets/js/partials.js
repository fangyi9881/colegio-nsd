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
        <a href="tel:+34914719959" aria-label="Teléfono"><i class="bi bi-telephone-fill"></i> <span>91 471 99 59</span></a>
        <a href="mailto:secretaria@colegionsdolores.es" aria-label="Email"><i class="bi bi-envelope-fill"></i> <span>secretaria@colegionsdolores.es</span></a>
      </div>
      <div class="topbar__quick">
        <a href="https://web2.alexiaedu.com/ACWeb/LogOn.aspx" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-person-badge"></i> Alexia</a>
        <a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-tree"></i> Raíces</a>
        <a href="https://www.instagram.com/colegionsdolores/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
        <a href="https://www.youtube.com/@colegionsd6473" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
        <a href="https://www.facebook.com/colegioNSD" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
      </div>
    </div>
  </div>`;

  const NAV = `
  <header class="navbar" id="navbar">
    <div class="container navbar__inner">
      <a href="/" class="brand">
        <img src="/assets/img/logo.png" alt="Logo Colegio NSD" class="brand__logo" />
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
            <a href="/infantil-nsd/" data-link="etapas">Etapas <i class="bi bi-chevron-down"></i></a>
            <ul class="dropdown">
              <li><a href="/infantil-nsd/">Infantil 0–3 🍼</a></li>
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

  <div class="drawer-backdrop" id="drawerBackdrop" aria-hidden="true"></div>
  <aside class="drawer" id="drawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Menú de navegación">
    <div class="drawer__header">
      <a href="/" class="brand" tabindex="-1">
        <img src="/assets/img/logo-white.png" alt="Logo Colegio NSD" class="brand__logo" style="width:44px;height:44px;" />
        <span class="brand__text">
          <strong style="color:#fff;">Colegio NSD</strong>
          <small style="color:rgba(255,255,255,.6);">Nuestra Señora de los Dolores</small>
        </span>
      </a>
      <button class="drawer__close" id="drawerClose" aria-label="Cerrar menú">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <nav class="drawer__nav">
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/centro/sobre-nosotros.html">El Centro</a></li>
        <li><a href="/etapas/primaria.html">Etapas</a></li>
        <li><a href="/centro/departamentos.html">Departamentos</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/contacto.html">Contacto</a></li>
      </ul>
      <a href="/admision.html" class="drawer__cta">
        <i class="bi bi-mortarboard-fill"></i> Solicitar Admisión
      </a>
    </nav>

    <div class="drawer__footer">
      <div class="drawer__contact">
        <a href="tel:+34914719959"><i class="bi bi-telephone-fill"></i> 91 471 99 59</a>
        <a href="mailto:secretaria@colegionsdolores.es"><i class="bi bi-envelope-fill"></i> secretaria@colegionsdolores.es</a>
      </div>
      <div class="drawer__social">
        <a href="https://www.instagram.com/colegionsdolores/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
        <a href="https://www.youtube.com/@colegionsd6473" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
        <a href="https://www.facebook.com/colegioNSD" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
      </div>
    </div>
  </aside>`;

  const FOOTER = `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="/" class="brand">
          <img src="/assets/img/logo-white.png" alt="Logo Colegio NSD" class="brand__logo brand__logo--lg" />
          <span class="brand__text">
            <strong>Colegio NSD</strong>
            <small>Nuestra Señora de los Dolores</small>
          </span>
        </a>
        <p>Centro concertado bilingüe en Carabanchel. Educamos personas desde 1957.</p>
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
        <h5>Accesos directos</h5>
        <ul>
          <li><a href="https://web2.alexiaedu.com/" target="_blank" rel="noopener noreferrer">Alexia (familias)</a></li>
          <li><a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer">Raíces</a></li>
          <li><a href="/campamento-nsd/">Campamento NSD</a></li>
          <li><a href="/infantil-nsd/">Escuela Infantil 0–3</a></li>
        </ul>
      </div>

      <div>
        <h5>Contacto</h5>
        <ul class="footer__contact">
          <li><i class="bi bi-geo-alt"></i> C/ Nuestra Señora de los Dolores, s/n<br/>Carabanchel, 28019 Madrid</li>
          <li><i class="bi bi-telephone"></i> <a href="tel:+34914719959">91 471 99 59</a> · <a href="tel:+34914718954">91 471 89 54</a></li>
          <li><i class="bi bi-envelope"></i> <a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>© <span id="year"></span> Colegio Nuestra Señora de los Dolores. Todos los derechos reservados.</p>
        <ul>
          <li><a href="/aviso-legal.html">Aviso legal</a></li>
          <li><a href="/privacidad.html">Política de privacidad</a></li>
          <li><a href="/cookies.html">Cookies</a></li>
        </ul>
      </div>
    </div>

    <a href="#top" class="to-top" aria-label="Volver arriba"><i class="bi bi-arrow-up"></i></a>
  </footer>

  <div class="mobile-cta-bar" id="mobileCta" aria-hidden="true">
    <a href="tel:+34914719959" class="cta-call"><i class="bi bi-telephone-fill"></i><span>Llamar</span></a>
    <a href="/contacto.html" class="cta-visit"><i class="bi bi-calendar-check"></i><span>Reservar visita</span></a>
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

  // ── Scroll handler unificado con rAF (un solo listener, todos los efectos)
  const nav = document.getElementById('navbar');
  const progress = document.getElementById('scrollProgress');
  let scrollTicking = false;
  let lastNavScrolled = false;
  let lastCtaVisible  = false;
  function onScrollFrame() {
    const y = window.scrollY;
    // navbar shadow
    const navScrolled = y > 12;
    if (nav && navScrolled !== lastNavScrolled) {
      nav.classList.toggle('is-scrolled', navScrolled);
      lastNavScrolled = navScrolled;
    }
    // progress bar
    if (progress) {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      progress.style.width = denom > 0 ? (y / denom) * 100 + '%' : '0%';
    }
    // mobile CTA
    if (mobileCtaEl) {
      const ctaVisible = y > 400;
      if (ctaVisible !== lastCtaVisible) {
        mobileCtaEl.classList.toggle('is-visible', ctaVisible);
        lastCtaVisible = ctaVisible;
      }
    }
    // to-top button
    if (toTopBtn && toTopTrigger) {
      const r = toTopTrigger.getBoundingClientRect();
      const should = r.top < window.innerHeight * 0.5;
      if (should !== lastToTopVisible) {
        toTopBtn.classList.toggle('is-visible', should);
        lastToTopVisible = should;
      }
    }
    scrollTicking = false;
  }
  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(onScrollFrame);
      scrollTicking = true;
    }
  }
  // Variables que se rellenan más abajo (mobileCta y to-top usan este mismo handler)
  let mobileCtaEl = null;
  let toTopBtn = null, toTopTrigger = null, lastToTopVisible = false;

  // Drawer
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const drawerClose = document.getElementById('drawerClose');
  if (burger && drawer) {
    const toggle = (open) => {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      if (backdrop) backdrop.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && drawerClose) drawerClose.focus();
    };
    burger.addEventListener('click', () => toggle(!drawer.classList.contains('is-open')));
    if (drawerClose) drawerClose.addEventListener('click', () => toggle(false));
    if (backdrop) backdrop.addEventListener('click', () => toggle(false));
    drawer.querySelectorAll('.drawer__nav a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false); });
  }

  // Mobile CTA: simplemente referenciar el elemento, el handler unificado se ocupa
  mobileCtaEl = document.getElementById('mobileCta');

  // ── Contadores animados ─────────────────────────────────
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
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt.format(Math.floor(end * eased));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = fmt.format(end);
    }
    requestAnimationFrame(step);
  }

  // Reveal global
  const autoReveal = document.querySelectorAll(
    '.section, .stage, .value, .service, .news__item, .dept, .highlight, .teacher, .form-card'
  );
  autoReveal.forEach(el => { if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', ''); });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Lanzar contadores que estén dentro
          const counters = entry.target.querySelectorAll?.('[data-count]');
          counters?.forEach(c => animateCounter(c));
          if (entry.target.matches?.('[data-count]')) animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }
  // Contadores ya en pantalla al cargar
  document.querySelectorAll('[data-count]').forEach(c => {
    const r = c.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) animateCounter(c);
  });

  // ── BOTÓN "SUBIR ARRIBA" inteligente ─────────────────────
  // Aparece a partir de la 3ª sección si la página tiene >2 secciones
  const sections = document.querySelectorAll('section, .section');
  toTopBtn = document.querySelector('.to-top');
  if (toTopBtn && sections.length > 2) {
    toTopTrigger = sections[2]; // 3ª sección, controlada por handler unificado
    toTopBtn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  } else if (toTopBtn) {
    toTopBtn.style.display = 'none';
  }

  // Registrar el handler unificado UNA sola vez al final
  document.addEventListener('scroll', onScroll, { passive: true });
  onScrollFrame();

  // ══════════════════════════════════════════════════════════
  // BANNER DE COOKIES — RGPD / LSSI compliant
  // Categorías: necesarias (siempre), analíticas, marketing
  // ══════════════════════════════════════════════════════════
  const CONSENT_KEY   = 'nsd_cookie_consent_v2';
  const CONSENT_EXPIRY = 365; // días

  function saveConsent(prefs) {
    const exp = new Date();
    exp.setDate(exp.getDate() + CONSENT_EXPIRY);
    const val = JSON.stringify({ ...prefs, ts: Date.now() });
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(val)};expires=${exp.toUTCString()};path=/;SameSite=Lax`;
  }

  function getConsent() {
    const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(CONSENT_KEY + '='));
    if (!match) return null;
    try { return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('='))); } catch { return null; }
  }

  function applyConsent(prefs) {
    // Aquí se activarían analytics/marketing si se aceptan
    if (prefs.analytics) {
      // gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (prefs.marketing) {
      // gtag('consent', 'update', { ad_storage: 'granted' });
    }
  }

  const existingConsent = getConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  } else {
    // Inyectar estilos del banner — tarjeta flotante elegante
    const style = document.createElement('style');
    style.textContent = `
      #ck-overlay{
        position:fixed;inset:0;z-index:99998;
        background:rgba(15,23,42,.35);
        backdrop-filter:blur(2px);
        -webkit-backdrop-filter:blur(2px);
        animation:ckFadeIn .4s ease;
      }
      @keyframes ckFadeIn{from{opacity:0}to{opacity:1}}
      #ck-banner *{box-sizing:border-box;font-family:'Nunito','Inter',sans-serif}
      #ck-banner{
        position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
        z-index:99999;
        width:calc(100% - 40px);max-width:920px;
        background:#fff;color:#1e293b;
        border-radius:24px;
        box-shadow:0 24px 60px rgba(15,94,22,.18), 0 8px 24px rgba(0,0,0,.08);
        animation:ckPop .5s cubic-bezier(.22,1,.36,1);
        overflow:hidden;
        border:1px solid rgba(15,94,22,.08);
      }
      @keyframes ckPop{
        0%{transform:translateX(-50%) translateY(40px) scale(.96);opacity:0}
        100%{transform:translateX(-50%) translateY(0) scale(1);opacity:1}
      }
      .ck-banner-deco{
        position:absolute;top:0;left:0;right:0;height:5px;
        background:linear-gradient(90deg, #1FA42C 0%, #34C84A 30%, #FFD500 70%, #FFA63D 100%);
        background-size:200% 100%;
        animation:ckGradient 6s ease infinite;
      }
      @keyframes ckGradient{
        0%,100%{background-position:0% 50%}
        50%{background-position:100% 50%}
      }
      .ck-wrap{padding:28px 30px 24px}
      .ck-top{display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap}
      .ck-info{flex:1;min-width:240px}
      .ck-info-head{display:flex;align-items:center;gap:12px;margin-bottom:8px}
      .ck-info-emoji{
        width:44px;height:44px;border-radius:14px;
        background:linear-gradient(135deg,#FFF8DC,#FFE9A8);
        display:grid;place-items:center;font-size:1.4rem;
        box-shadow:0 4px 12px rgba(255,191,0,.2);
      }
      .ck-info h3{margin:0;font-size:1.15rem;font-weight:800;color:#0E5E16;line-height:1.2}
      .ck-info p{margin:0;font-size:.86rem;line-height:1.65;color:#475569}
      .ck-info a{color:#1FA42C;text-decoration:underline;font-weight:700}
      .ck-info a:hover{color:#0E5E16}
      .ck-btns{display:flex;gap:10px;flex-shrink:0;align-items:center;flex-wrap:wrap;margin-top:4px}
      .ck-btn{
        padding:11px 22px;border-radius:999px;border:2px solid transparent;
        font-size:.85rem;font-weight:700;cursor:pointer;white-space:nowrap;
        transition:all .25s cubic-bezier(.22,1,.36,1);
        font-family:inherit;line-height:1;letter-spacing:.01em;
      }
      .ck-btn-accept{
        background:linear-gradient(135deg,#1FA42C,#34C84A);
        color:#fff;border-color:transparent;
        box-shadow:0 4px 14px rgba(31,164,44,.3);
      }
      .ck-btn-accept:hover{
        transform:translateY(-2px);
        box-shadow:0 8px 22px rgba(31,164,44,.45);
      }
      .ck-btn-save{
        background:#0E5E16;color:#fff;border-color:#0E5E16;
      }
      .ck-btn-save:hover{background:#0a4612;border-color:#0a4612}
      .ck-btn-reject{
        background:transparent;color:#64748b;border-color:#cbd5e1;
      }
      .ck-btn-reject:hover{color:#0E5E16;border-color:#0E5E16;background:#f0fdf4}
      .ck-btn-detail{
        background:transparent;color:#1FA42C;border:none;
        padding:11px 10px;font-size:.85rem;font-weight:700;cursor:pointer;
        font-family:inherit;
      }
      .ck-btn-detail:hover{color:#0E5E16;text-decoration:underline}
      #ck-detail{display:none;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:22px}
      #ck-banner.is-expanded #ck-detail{display:block;animation:ckExpand .4s ease}
      @keyframes ckExpand{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
      .ck-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
      .ck-cat{
        background:#f8fafc;border:1.5px solid #e2e8f0;
        border-radius:14px;padding:14px 16px;
        display:flex;justify-content:space-between;align-items:flex-start;gap:12px;
        transition:border-color .2s, background .2s;
      }
      .ck-cat:has(input:checked){border-color:#1FA42C;background:#f0fdf4}
      .ck-cat:has(input:disabled){background:#fef9c3;border-color:#fde047}
      .ck-cat-info{flex:1;min-width:0}
      .ck-cat-info h4{
        margin:0 0 4px;font-size:.88rem;font-weight:800;color:#0E5E16;
        display:flex;align-items:center;gap:6px;
      }
      .ck-cat-info h4 i{font-size:.95rem;color:#1FA42C}
      .ck-cat-info p{margin:0;font-size:.74rem;color:#64748b;line-height:1.5}
      .ck-cat-info .ck-badge{
        display:inline-block;margin-top:6px;font-size:.66rem;font-weight:800;
        padding:3px 9px;border-radius:999px;background:#fef3c7;color:#92400e;
        text-transform:uppercase;letter-spacing:.05em;
      }
      /* Toggle switch */
      .ck-switch{position:relative;flex-shrink:0;width:42px;height:24px;margin-top:2px}
      .ck-switch input{opacity:0;width:0;height:0;position:absolute}
      .ck-slider{
        position:absolute;inset:0;border-radius:999px;background:#cbd5e1;
        cursor:pointer;transition:background .3s;
      }
      .ck-slider::before{
        content:'';position:absolute;width:18px;height:18px;
        left:3px;top:3px;border-radius:50%;background:#fff;
        transition:transform .3s cubic-bezier(.22,1,.36,1);
        box-shadow:0 2px 4px rgba(0,0,0,.2);
      }
      .ck-switch input:checked + .ck-slider{background:#1FA42C}
      .ck-switch input:checked + .ck-slider::before{transform:translateX(18px)}
      .ck-switch input:disabled + .ck-slider{background:#fde047;cursor:not-allowed}
      .ck-switch input:disabled + .ck-slider::before{background:#fff}
      .ck-save-row{margin-top:18px;display:flex;justify-content:flex-end;gap:10px}
      @media(max-width:680px){
        #ck-banner{bottom:0;left:0;right:0;width:100%;max-width:none;
          border-radius:24px 24px 0 0;transform:none}
        @keyframes ckPop{
          0%{transform:translateY(40px);opacity:0}
          100%{transform:translateY(0);opacity:1}
        }
        .ck-wrap{padding:22px 20px}
        .ck-top{flex-direction:column;gap:18px}
        .ck-btns{width:100%}
        .ck-btn,.ck-btn-detail{flex:1;text-align:center}
        .ck-cats{grid-template-columns:1fr}
        .ck-info h3{font-size:1rem}
      }`;
    document.head.appendChild(style);

    // Overlay sutil para enfocar atención
    const overlay = document.createElement('div');
    overlay.id = 'ck-overlay';
    document.body.appendChild(overlay);

    const banner = document.createElement('div');
    banner.id = 'ck-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Configuración de cookies');
    banner.innerHTML = `
      <span class="ck-banner-deco" aria-hidden="true"></span>
      <div class="ck-wrap">
        <div class="ck-top">
          <div class="ck-info">
            <div class="ck-info-head">
              <span class="ck-info-emoji" aria-hidden="true">🍪</span>
              <h3>Tu privacidad nos importa</h3>
            </div>
            <p>
              Usamos cookies propias <strong>estrictamente necesarias</strong> para que el sitio funcione.
              Con tu permiso también usaríamos cookies <strong>analíticas</strong> y de <strong>preferencias</strong>
              para mejorar tu experiencia. Puedes personalizar tu elección o aceptar todas.
              <a href="/cookies.html" target="_blank" rel="noopener">Política de cookies</a>.
            </p>
          </div>
          <div class="ck-btns">
            <button id="ck-btn-reject" class="ck-btn ck-btn-reject" type="button">Solo necesarias</button>
            <button id="ck-btn-config" class="ck-btn-detail" type="button">Personalizar ▾</button>
            <button id="ck-btn-accept" class="ck-btn ck-btn-accept" type="button">Aceptar todas</button>
          </div>
        </div>

        <div id="ck-detail">
          <div class="ck-cats">
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4><i class="bi bi-shield-check"></i> Necesarias</h4>
                <p>Imprescindibles para el funcionamiento básico del sitio.</p>
                <span class="ck-badge">Siempre activas</span>
              </div>
              <label class="ck-switch" aria-label="Cookies necesarias">
                <input type="checkbox" checked disabled />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4><i class="bi bi-graph-up-arrow"></i> Analíticas</h4>
                <p>Medimos visitas de forma anónima para mejorar el sitio.</p>
              </div>
              <label class="ck-switch" aria-label="Cookies analíticas">
                <input type="checkbox" id="ck-chk-analytics" />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4><i class="bi bi-sliders"></i> Preferencias</h4>
                <p>Recuerdan tus ajustes (idioma, formularios…).</p>
              </div>
              <label class="ck-switch" aria-label="Cookies de preferencias">
                <input type="checkbox" id="ck-chk-prefs" />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4><i class="bi bi-megaphone"></i> Marketing</h4>
                <p>Permitirían mostrar contenido relevante. No las usamos.</p>
              </div>
              <label class="ck-switch" aria-label="Cookies de marketing">
                <input type="checkbox" id="ck-chk-marketing" />
                <span class="ck-slider"></span>
              </label>
            </div>
          </div>
          <div class="ck-save-row">
            <button id="ck-btn-save" class="ck-btn ck-btn-save" type="button">Guardar preferencias</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(banner);

    const closeAll = () => {
      banner.style.transition = 'opacity .3s, transform .3s';
      banner.style.opacity = '0';
      banner.style.transform = (window.innerWidth <= 680) ? 'translateY(20px)' : 'translateX(-50%) translateY(20px)';
      overlay.style.transition = 'opacity .3s';
      overlay.style.opacity = '0';
      setTimeout(() => { banner.remove(); overlay.remove(); }, 320);
    };
    const acceptAll = () => {
      saveConsent({ necessary: true, analytics: true, prefs: true, marketing: true });
      applyConsent({ analytics: true, prefs: true, marketing: true });
      closeAll();
    };
    const rejectAll = () => {
      saveConsent({ necessary: true, analytics: false, prefs: false, marketing: false });
      closeAll();
    };
    const saveCustom = () => {
      const prefs = {
        necessary: true,
        analytics:  document.getElementById('ck-chk-analytics').checked,
        prefs:      document.getElementById('ck-chk-prefs').checked,
        marketing:  document.getElementById('ck-chk-marketing').checked,
      };
      saveConsent(prefs);
      applyConsent(prefs);
      closeAll();
    };
    const toggleDetail = () => {
      banner.classList.toggle('is-expanded');
      const btn = document.getElementById('ck-btn-config');
      btn.textContent = banner.classList.contains('is-expanded') ? 'Personalizar ▴' : 'Personalizar ▾';
    };

    document.getElementById('ck-btn-accept').addEventListener('click', acceptAll);
    document.getElementById('ck-btn-reject').addEventListener('click', rejectAll);
    document.getElementById('ck-btn-config').addEventListener('click', toggleDetail);
    document.getElementById('ck-btn-save').addEventListener('click', saveCustom);

    // Trampa de foco accesible
    banner.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusable = [...banner.querySelectorAll('button, input, a[href]')].filter(el => !el.disabled);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    // Poner foco al primer botón
    setTimeout(() => { const b = document.getElementById('ck-btn-reject'); if (b) b.focus(); }, 100);
  }

  // ── Magnetic + Cursor ring ──────────────────────────────
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

    const ring = document.querySelector('.cursor-ring');
    if (ring) {
      let mx = 0, my = 0, rx = 0, ry = 0;
      document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; ring.classList.add('is-visible'); });
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
