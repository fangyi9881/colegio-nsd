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
        <a href="mailto:secretaria@colegionsdolores.es" aria-label="Email"><i class="bi bi-envelope-fill"></i> <span>secretaria@colegionsdolores.es</span></a>
        <span class="topbar__addr d-none-mobile"><i class="bi bi-geo-alt-fill"></i> C/ Nuestra Señora de los Dolores, s/n · Carabanchel, Madrid</span>
      </div>
      <div class="topbar__quick">
        <a href="https://web2.alexiaedu.com/ACWeb/LogOn.aspx" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-person-badge"></i> Alexia</a>
        <a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-tree"></i> Raíces</a>
        <a href="https://twitter.com/colegio_nsd" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
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
      <a href="mailto:secretaria@colegionsdolores.es" aria-label="Email"><i class="bi bi-envelope-fill"></i></a>
    </div>
  </aside>`;

  const FOOTER = `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="/" class="brand">
          <img src="/assets/img/logo.png" alt="Logo Colegio NSD" class="brand__logo brand__logo--lg footer-logo" />
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
          <li><i class="bi bi-telephone"></i> <a href="tel:+34911234567">91 123 45 67</a></li>
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
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

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
    // Inyectar estilos del banner
    const style = document.createElement('style');
    style.textContent = `
      #ck-banner *{box-sizing:border-box;font-family:inherit}
      #ck-banner{
        position:fixed;bottom:0;left:0;right:0;z-index:99999;
        background:#0f172a;color:#e2e8f0;
        padding:0;
        box-shadow:0 -8px 40px rgba(0,0,0,.4);
        animation:ckSlideUp .4s cubic-bezier(.22,1,.36,1);
      }
      @keyframes ckSlideUp{from{transform:translateY(110%)}to{transform:translateY(0)}}
      #ck-banner.is-expanded #ck-detail{display:block}
      #ck-banner.is-expanded #ck-toggle-detail{display:none}
      .ck-wrap{max-width:1200px;margin:0 auto;padding:20px 24px}
      .ck-top{display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap}
      .ck-info{flex:1;min-width:220px}
      .ck-info h3{margin:0 0 6px;font-size:1rem;font-weight:700;color:#fff}
      .ck-info p{margin:0;font-size:.82rem;line-height:1.6;color:#94a3b8}
      .ck-info a{color:#4ade80;text-decoration:underline}
      .ck-btns{display:flex;gap:8px;flex-shrink:0;align-items:center;flex-wrap:wrap}
      .ck-btn{
        padding:10px 22px;border-radius:999px;border:2px solid transparent;
        font-size:.82rem;font-weight:700;cursor:pointer;white-space:nowrap;
        transition:all .2s;font-family:inherit;line-height:1;
      }
      .ck-btn-accept{background:#22c55e;color:#fff;border-color:#22c55e}
      .ck-btn-accept:hover{background:#16a34a;border-color:#16a34a}
      .ck-btn-save{background:#3b82f6;color:#fff;border-color:#3b82f6}
      .ck-btn-save:hover{background:#2563eb;border-color:#2563eb}
      .ck-btn-reject{background:transparent;color:#94a3b8;border-color:rgba(255,255,255,.2)}
      .ck-btn-reject:hover{color:#e2e8f0;border-color:rgba(255,255,255,.4)}
      .ck-btn-detail{background:transparent;color:#64748b;border:none;padding:10px 8px;font-size:.8rem;cursor:pointer;text-decoration:underline;font-family:inherit}
      .ck-btn-detail:hover{color:#94a3b8}
      #ck-detail{display:none;margin-top:20px;border-top:1px solid rgba(255,255,255,.08);padding-top:20px}
      .ck-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
      .ck-cat{
        background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
        border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;
      }
      .ck-cat-info h4{margin:0 0 4px;font-size:.85rem;font-weight:700;color:#f1f5f9}
      .ck-cat-info p{margin:0;font-size:.75rem;color:#64748b;line-height:1.5}
      .ck-cat-info .ck-badge{
        display:inline-block;margin-top:6px;font-size:.68rem;font-weight:700;
        padding:2px 8px;border-radius:999px;background:rgba(34,197,94,.15);color:#4ade80;
      }
      /* Toggle switch */
      .ck-switch{position:relative;flex-shrink:0;width:44px;height:24px;margin-top:2px}
      .ck-switch input{opacity:0;width:0;height:0;position:absolute}
      .ck-slider{
        position:absolute;inset:0;border-radius:999px;background:#334155;
        cursor:pointer;transition:background .25s;
      }
      .ck-slider::before{
        content:'';position:absolute;width:18px;height:18px;
        left:3px;top:3px;border-radius:50%;background:#fff;
        transition:transform .25s;
      }
      .ck-switch input:checked + .ck-slider{background:#22c55e}
      .ck-switch input:checked + .ck-slider::before{transform:translateX(20px)}
      .ck-switch input:disabled + .ck-slider{opacity:.5;cursor:not-allowed}
      @media(max-width:600px){
        .ck-top{flex-direction:column}
        .ck-btns{width:100%}
        .ck-btn{flex:1;text-align:center}
        .ck-cats{grid-template-columns:1fr}
      }`;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'ck-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Configuración de cookies');
    banner.innerHTML = `
      <div class="ck-wrap">
        <div class="ck-top">
          <div class="ck-info">
            <h3>🍪 Tu privacidad importa</h3>
            <p>
              Usamos cookies propias <strong>estrictamente necesarias</strong> para que el sitio funcione.
              Con tu permiso, también usaríamos cookies <strong>analíticas</strong> (medir visitas) y
              <strong>de preferencias</strong> (recordar tus opciones).
              Puedes personalizar tu elección o aceptar todo.
              <a href="/cookies.html" target="_blank" rel="noopener">Política de cookies</a>.
            </p>
          </div>
          <div class="ck-btns">
            <button id="ck-btn-reject"  class="ck-btn ck-btn-reject">Solo necesarias</button>
            <button id="ck-btn-config"  class="ck-btn-detail">Personalizar ▾</button>
            <button id="ck-btn-accept"  class="ck-btn ck-btn-accept">Aceptar todas</button>
          </div>
        </div>

        <div id="ck-detail">
          <div class="ck-cats">
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4>Necesarias</h4>
                <p>Imprescindibles para el funcionamiento del sitio. No pueden desactivarse.</p>
                <span class="ck-badge">Siempre activas</span>
              </div>
              <label class="ck-switch" aria-label="Cookies necesarias">
                <input type="checkbox" checked disabled />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4>Analíticas</h4>
                <p>Nos permiten medir visitas y mejorar el contenido del sitio de forma anónima.</p>
              </div>
              <label class="ck-switch" aria-label="Cookies analíticas">
                <input type="checkbox" id="ck-chk-analytics" />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4>Preferencias</h4>
                <p>Recuerdan tus ajustes (idioma, formularios) para mejorar tu experiencia.</p>
              </div>
              <label class="ck-switch" aria-label="Cookies de preferencias">
                <input type="checkbox" id="ck-chk-prefs" />
                <span class="ck-slider"></span>
              </label>
            </div>
            <div class="ck-cat">
              <div class="ck-cat-info">
                <h4>Marketing</h4>
                <p>Permiten mostrar contenido relevante. Actualmente no las usamos.</p>
              </div>
              <label class="ck-switch" aria-label="Cookies de marketing">
                <input type="checkbox" id="ck-chk-marketing" />
                <span class="ck-slider"></span>
              </label>
            </div>
          </div>
          <div style="margin-top:16px;display:flex;justify-content:flex-end">
            <button id="ck-btn-save" class="ck-btn ck-btn-save">Guardar preferencias</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(banner);

    const acceptAll = () => {
      saveConsent({ necessary: true, analytics: true, prefs: true, marketing: true });
      applyConsent({ analytics: true, prefs: true, marketing: true });
      banner.remove();
    };
    const rejectAll = () => {
      saveConsent({ necessary: true, analytics: false, prefs: false, marketing: false });
      banner.remove();
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
      banner.remove();
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
