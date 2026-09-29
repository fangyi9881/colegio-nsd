// =========================================================
// Partials reutilizables: header, drawer móvil y footer
// =========================================================
(function () {
  'use strict';

  const PAGE = document.documentElement.dataset.page || '';
  // Dentro de la vista previa del centro de documentación la página se
  // muestra como miniatura: sin banner de cookies ni botones flotantes.
  const EN_VISTA_PREVIA = window.self !== window.top;
  if (EN_VISTA_PREVIA) document.documentElement.classList.add('en-vista-previa');

  // Desde el centro de documentación se puede pedir una página «para
  // llevar»: llega con ?imprimir=1 y abre sola el diálogo de impresión,
  // que es como se guarda en PDF una página que no es un PDF.
  if (!EN_VISTA_PREVIA && /[?&]imprimir=1/.test(location.search)) {
    window.addEventListener('load', () => {
      // Un respiro para que acaben las fuentes y las imágenes diferidas
      setTimeout(() => window.print(), 600);
    });
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Estado oculto del cajón, en línea y antes de inyectar su marcado.
  //
  // El cajón se pinta desde aquí, pero su posición vivía solo en
  // animations.css, que además se cargaba con este <link>. Mientras esa hoja
  // viajaba, el cajón existía en el documento sin `position: fixed` ni
  // `translateX(100%)`: se dibujaba como un bloque normal a ancho completo y,
  // al llegar la hoja, se iba a la derecha. Eso es el destello que se veía al
  // entrar en cualquier página. Estas reglas van en un <style> escrito antes
  // que el marcado, así que no hay un solo fotograma en el que se pueda ver.
  //
  // En escritorio no se oculta: directamente no existe. La barra superior ya
  // lleva las mismas secciones, así que un cajón ahí no pinta nada.
  (function estadoInicialDelCajon() {
    const css = document.createElement('style');
    css.id = 'cajon-estado-inicial';
    css.textContent =
      '.drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,100vw);' +
      'transform:translateX(100%);visibility:hidden;z-index:200}' +
      '.drawer-backdrop{position:fixed;inset:0;z-index:199;opacity:0;visibility:hidden}' +
      '@media (min-width:981px){.drawer,.drawer-backdrop{display:none!important}}';
    document.head.appendChild(css);
  })();

  // Inyecta CSS de animaciones si no está
  if (!document.querySelector('link[href*="animations.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/animations.css';
    document.head.appendChild(link);
  }

  // Selector de tema: claro / sistema / oscuro.
  // El tema real lo aplica theme-init.js antes del primer pintado;
  // aquí solo se dibuja el control y se sincroniza su estado.
  const THEME_SWITCH = `
  <div class="theme-switch" id="themeSwitch" role="radiogroup" aria-label="Apariencia de la web">
    <span class="theme-switch__thumb" aria-hidden="true"></span>
    <button type="button" class="theme-switch__opt" data-theme-choice="light" role="radio" aria-checked="false" title="Tema claro">
      <i class="bi bi-sun-fill" aria-hidden="true"></i><span class="sr-only">Claro</span>
    </button>
    <button type="button" class="theme-switch__opt" data-theme-choice="system" role="radio" aria-checked="true" title="Igual que el sistema">
      <i class="bi bi-circle-half" aria-hidden="true"></i><span class="sr-only">Sistema</span>
    </button>
    <button type="button" class="theme-switch__opt" data-theme-choice="dark" role="radio" aria-checked="false" title="Tema oscuro">
      <i class="bi bi-moon-stars-fill" aria-hidden="true"></i><span class="sr-only">Oscuro</span>
    </button>
  </div>`;

  const TOPBAR = `
  <aside class="topbar" aria-label="Contacto y accesos rápidos">
    <div class="container topbar__inner">
      <div class="topbar__contact">
        <a href="tel:+34914719959" aria-label="Teléfono"><i class="bi bi-telephone-fill"></i> <span>91 471 99 59</span></a>
        <a href="mailto:secretaria@colegionsdolores.es" aria-label="Email"><i class="bi bi-envelope-fill"></i> <span>secretaria@colegionsdolores.es</span></a>
      </div>
      <div class="topbar__quick">
        <a href="/contacto" class="quick-link quick-link--sv" title="Secretaría Virtual"><i class="bi bi-person-lines-fill"></i> <span>Secretaría Virtual</span></a>
        <a href="https://web2.alexiaedu.com/ACWeb/LogOn.aspx" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-person-badge"></i> Alexia</a>
        <a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer" class="quick-link"><i class="bi bi-tree"></i> Raíces</a>
        <a href="https://www.instagram.com/colegionsdolores/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
        <a href="https://www.youtube.com/@colegionsd6473" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
        <a href="https://www.facebook.com/colegioNSD" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
        ${THEME_SWITCH}
      </div>
    </div>
  </aside>`;

  // ── Mapa del sitio ───────────────────────────────────────────────────
  // Una sola fuente para el menú, el cajón móvil, el pie, las migas de pan
  // y la barra de páginas de cada sección. Antes eran tres listas copiadas a
  // mano que se desincronizaban, y algunas entradas llevaban a una sección
  // dentro de otra página (#valores, #madrugadores) en vez de a su página.
  //
  // Cada entrada del menú lleva a la página resumen de su sección (/centro,
  // /etapas…); el desplegable lleva a las páginas de dentro.
  const SECCIONES = [
    {
      id: 'centro', titulo: 'El Centro', url: '/centro', icono: 'bi-building',
      paginas: [
        { titulo: 'Sobre nosotros',   url: '/centro/sobre-nosotros',   icono: 'bi-clock-history' },
        { titulo: 'Misión y valores', url: '/centro/mision-valores',   icono: 'bi-heart' },
        { titulo: 'Equipo directivo', url: '/centro/equipo-directivo', icono: 'bi-person-badge' },
        { titulo: 'Departamentos',    url: '/centro/departamentos',    icono: 'bi-people' }
      ]
    },
    {
      id: 'etapas', titulo: 'Etapas', url: '/etapas', icono: 'bi-mortarboard',
      paginas: [
        { titulo: 'Infantil 0–3',       url: 'https://infantil-nsd.vercel.app', icono: 'bi-balloon-heart', externa: true },
        { titulo: 'Infantil 3–6',       url: '/etapas/infantil-3-6', icono: 'bi-stars' },
        { titulo: 'Educación Primaria', url: '/etapas/primaria',     icono: 'bi-book' },
        { titulo: 'E.S.O.',             url: '/etapas/eso',          icono: 'bi-laptop' }
      ]
    },
    {
      id: 'servicios', titulo: 'Servicios', url: '/servicios', icono: 'bi-grid',
      paginas: [
        { titulo: 'Comedor escolar', url: '/servicios/comedor',        icono: 'bi-egg-fried' },
        { titulo: 'Extraescolares',  url: '/servicios/extraescolares', icono: 'bi-trophy' },
        { titulo: 'Madrugadores',    url: '/servicios/madrugadores',   icono: 'bi-sunrise' }
      ]
    },
    {
      id: 'familias', titulo: 'Familias', url: '/familias', icono: 'bi-house-heart',
      paginas: [
        { titulo: 'Documentación', url: '/familias/documentacion', icono: 'bi-folder2-open' },
        { titulo: 'Admisión',      url: '/admision',               icono: 'bi-mortarboard' },
        { titulo: 'Contacto',      url: '/contacto',               icono: 'bi-envelope' }
      ]
    },
    {
      id: 'comunidad', titulo: 'Comunidad', url: '/comunidad', icono: 'bi-people-fill',
      paginas: [
        { titulo: 'Blog y noticias', url: '/blog', icono: 'bi-newspaper' }
      ],
      // Webs hermanas: cada una con su propio icono
      webs: [
        { titulo: 'Campamento de verano', url: 'https://campamento-nsd.vercel.app', clase: 'web-ico--campamento', insignia: 'bi-sun' },
        { titulo: 'Dolores Dragons',      url: 'https://dolores-dragons.vercel.app', clase: 'web-ico--dragons', imagen: '/assets/img/webs/dolores-dragons.png' }
      ]
    }
  ];

  // Sección y página en las que estamos, a partir de la ruta
  const RUTA = (location.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '')) || '/';
  const SECCION_DE_RUTA = { '/admision': 'familias', '/contacto': 'familias', '/blog': 'comunidad' };
  const SECCION = SECCIONES.find(s =>
    RUTA === s.url || RUTA.startsWith(s.url + '/') ||
    SECCION_DE_RUTA[RUTA] === s.id || (RUTA.startsWith('/blog/') && s.id === 'comunidad')
  ) || null;
  const PAGINA = SECCION ? SECCION.paginas.find(p => RUTA === p.url || (p.url === '/blog' && RUTA.startsWith('/blog'))) || null : null;

  const FUERA = '&nbsp;<span class="dd-fuera" aria-hidden="true">&#8599;</span>';

  // Una página de esta sección que en realidad vive en otra web no puede
  // parecer una entrada más de la lista: va como botón, con su marca.
  const paginaFuera = (p) => `<li class="dropdown__destacado">
                  <a href="${p.url}" class="dropdown__boton">
                    <span class="dropdown__boton-ico" aria-hidden="true"><i class="bi ${p.icono}"></i></span>
                    <span class="dropdown__boton-txt"><strong>${p.titulo}</strong><small>Tiene su propia web</small></span>
                    <i class="bi bi-arrow-up-right dropdown__boton-ir" aria-hidden="true"></i>
                  </a>
                </li>`;
  const iconoWeb = (w) => w.imagen
    ? `<span class="web-ico ${w.clase}" aria-hidden="true"><img src="${w.imagen}" alt="" width="22" height="22" /></span>`
    : `<span class="web-ico ${w.clase}" aria-hidden="true"><img src="/assets/img/logo-white-64.png" alt="" width="18" height="18" /><i class="bi ${w.insignia}"></i></span>`;

  const menuSeccion = (s) => `
          <li class="has-dropdown">
            <a href="${s.url}" data-seccion="${s.id}">${s.titulo} <i class="bi bi-chevron-down dd-arrow" aria-hidden="true"></i></a>
            <div class="dropdown">
              <a class="dropdown__hub" href="${s.url}"><span class="dropdown__hub-label">${s.titulo}</span><span class="dropdown__hub-ver">Ver todo <i class="bi bi-arrow-right" aria-hidden="true"></i></span></a>
              <ul>
                ${s.paginas.map(p => p.externa ? paginaFuera(p) : `<li><a href="${p.url}"><i class="bi ${p.icono} dd-icon" aria-hidden="true"></i>${p.titulo}</a></li>`).join('')}
                ${s.webs ? `<li><div class="dropdown-divider"></div></li><li class="dropdown__grupo">Nuestras webs</li>` +
                  s.webs.map(w => `<li><a href="${w.url}" class="dropdown__web">${iconoWeb(w)}${w.titulo}${FUERA}</a></li>`).join('') : ''}
              </ul>
            </div>
          </li>`;

  const cajonSeccion = (s) => `
        <li class="drawer__has-sub">
          <button class="drawer__sub-toggle" type="button" aria-expanded="false"><span><i class="bi ${s.icono}" aria-hidden="true" style="margin-right:8px;color:var(--green-400)"></i>${s.titulo}</span><i class="bi bi-chevron-down dd-arrow" aria-hidden="true"></i></button>
          <ul class="drawer__sub">
            <li><a href="${s.url}" class="drawer__sub-hub"><i class="bi bi-grid-1x2" aria-hidden="true"></i> Todo ${s.titulo === 'El Centro' ? 'el Centro' : s.titulo.toLowerCase()}</a></li>
            ${s.paginas.map(p => p.externa
              ? `<li><a href="${p.url}" class="drawer__boton">
                   <span class="drawer__boton-ico" aria-hidden="true"><i class="bi ${p.icono}"></i></span>
                   <span class="drawer__boton-txt"><strong>${p.titulo}</strong><small>Tiene su propia web</small></span>
                   <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
                 </a></li>`
              : `<li><a href="${p.url}"><i class="bi ${p.icono}" aria-hidden="true"></i> ${p.titulo}</a></li>`).join('')}
            ${s.webs ? s.webs.map(w => `<li><a href="${w.url}" class="drawer__web">${iconoWeb(w)} ${w.titulo}${FUERA}</a></li>`).join('') : ''}
          </ul>
        </li>`;

  const NAV = `
  <header class="navbar" id="navbar">
    <div class="container navbar__inner">
      <a href="/" class="brand">
        <img src="/assets/img/logo-128.png" srcset="/assets/img/logo-64.png 64w, /assets/img/logo-128.png 128w, /assets/img/logo-192.png 192w" sizes="58px" alt="Logo Colegio NSD" class="brand__logo" width="58" height="58" />
        <span class="brand__text">
          <strong>Colegio NSD</strong>
          <small>Nuestra Señora de los Dolores</small>
        </span>
      </a>

      <nav class="nav" id="primaryNav" aria-label="Principal">
        <ul>
          <li><a href="/" data-seccion="inicio">Inicio</a></li>
          ${SECCIONES.map(menuSeccion).join('')}
          <li><a class="nav-cta magnetic" href="/admision"><i class="bi bi-mortarboard-fill" aria-hidden="true"></i> Admisión</a></li>
        </ul>
      </nav>

      <button class="hamburger-x" id="hamburger" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="drawer">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="drawer-backdrop" id="drawerBackdrop" aria-hidden="true"></div>
  <aside class="drawer" id="drawer" aria-hidden="true" inert role="dialog" aria-modal="true" aria-label="Menú de navegación">
    <div class="drawer__header">
      <a href="/" class="brand" tabindex="-1">
        <img src="/assets/img/logo-white.png" alt="Logo Colegio NSD" class="brand__logo" width="44" height="44" style="width:44px;height:44px;" />
        <span class="brand__text">
          <strong style="color:#fff;">Colegio NSD</strong>
          <small style="color:rgba(255,255,255,.6);">Nuestra Señora de los Dolores</small>
        </span>
      </a>
      <button class="drawer__close" id="drawerClose" type="button" aria-label="Cerrar menú">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <nav class="drawer__nav">
      <ul style="list-style:none;padding:0;margin:0;">
        <li><a href="/" class="drawer__link"><i class="bi bi-house"></i> Inicio</a></li>
        ${SECCIONES.map(cajonSeccion).join('')}
      </ul>

      <div class="drawer__platforms" style="margin-top:12px;">
        <a href="https://web2.alexiaedu.com/ACWeb/LogOn.aspx" target="_blank" rel="noopener noreferrer" class="drawer__platform-btn">
          <i class="bi bi-person-badge"></i> Alexia
        </a>
        <a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer" class="drawer__platform-btn">
          <i class="bi bi-tree"></i> Raíces
        </a>
      </div>

      <div class="drawer__theme">
        <span class="drawer__theme-label">Apariencia</span>
        ${THEME_SWITCH.replace('themeSwitch"', 'themeSwitchDrawer"')}
      </div>

      <a href="/contacto" class="drawer__cta" style="background:linear-gradient(135deg,var(--brand-700),var(--brand-900));margin-bottom:10px;">
        <i class="bi bi-person-lines-fill"></i> Secretaría Virtual
      </a>
      <a href="/admision" class="drawer__cta" style="background:linear-gradient(135deg,var(--yellow-500),#b8882a);color:var(--brand-900);">
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

  // El pie repite el mapa del sitio, sección por sección y en el mismo orden
  // que el menú: el título de cada columna lleva a la página de la sección.
  const pieColumna = (s) => `
      <div>
        <h3 class="footer__col-title"><a href="${s.url}">${s.titulo}</a></h3>
        <ul>
          ${s.paginas.map(p => `<li><a href="${p.url}">${p.titulo}${p.externa ? FUERA : ''}</a></li>`).join('')}
        </ul>
      </div>`;


  // ── Llamada final: la misma banda verde en todas las páginas ──
  // Antes había dos bloques seguidos, la banda de contacto y esta: se
  // quedaban con la misma función y hacían el final de página larguísimo.
  // Ahora solo va esta, con los mismos dos botones en todo el sitio. En
  // /contacto y /admision no se pone: ya estás en el destino.
  const SIN_LLAMADA = ['/contacto', '/admision'];
  const LLAMADA = (SIN_LLAMADA.indexOf(RUTA) >= 0 || document.querySelector('section.cta')) ? '' : `
  <section class="cta" aria-labelledby="cta-final-titulo">
    <div class="container cta__inner">
      <div>
        <span class="eyebrow eyebrow--light">Admisión 2027–2028</span>
        <h2 id="cta-final-titulo">La mejor forma de conocernos es venir.</h2>
        <p>Secretaría resuelve dudas de admisión, etapas y servicios, y concierta la visita. Sin compromiso.</p>
      </div>
      <div class="cta__actions">
        <a href="/contacto" class="btn btn--primary btn--lg"><i class="bi bi-chat-dots" aria-hidden="true"></i> Contacto</a>
        <a href="/admision" class="btn btn--ghost btn--lg"><i class="bi bi-mortarboard" aria-hidden="true"></i> Admisión</a>
      </div>
    </div>
  </section>`;

  // ── Las webs del grupo, en botones, en todas las páginas ──
  const GRUPO = [
    { url: '/', titulo: 'Colegio NSD', sub: 'De 0 a 16 años', icono: 'bi-mortarboard', aqui: true },
    { url: 'https://infantil-nsd.vercel.app', titulo: 'Escuela Infantil', sub: '0 – 3 años', icono: 'bi-balloon-heart' },
    { url: 'https://campamento-nsd.vercel.app', titulo: 'Campamento', sub: 'Verano en el cole', icono: 'bi-sun' },
    { url: 'https://dolores-dragons.vercel.app', titulo: 'Dolores Dragons', sub: 'Baloncesto', icono: 'bi-dribbble' },
    { url: 'https://dragons-den-eight.vercel.app', titulo: 'Dragons Den', sub: 'Academia de basket', icono: 'bi-trophy' },
  ];
  const WEBS = `
  <section class="grupo-webs" aria-labelledby="grupo-webs-titulo">
    <div class="container">
      <h2 class="grupo-webs__titulo" id="grupo-webs-titulo">Todo el ecosistema NSD</h2>
      <ul class="grupo-webs__lista">
        ${GRUPO.map((w) => `<li><a class="grupo-web${w.aqui ? ' es-aqui' : ''}" href="${w.url}"${w.aqui ? ' aria-current="true"' : ''}>
          <span class="grupo-web__ico" aria-hidden="true"><i class="bi ${w.icono}"></i></span>
          <span class="grupo-web__txt"><strong>${w.titulo}</strong><span>${w.sub}</span></span>
          <i class="bi ${w.aqui ? 'bi-check-lg' : 'bi-arrow-up-right'} grupo-web__ir" aria-hidden="true"></i>
        </a></li>`).join('')}
      </ul>
    </div>
  </section>`;


  // ── Sellos y programas ──────────────────────────────
  // Los logos van en /assets/img/sellos/. Mientras un archivo no exista,
  // el sello enseña el nombre escrito: nada de imagenes rotas.
  // El tercer valor dice si el archivo del logo ya está en
  // /assets/img/sellos/. En false el sello enseña su nombre escrito; ponerlo
  // en true sin el archivo deja un 404 en la consola de todas las páginas.
  // El cuarto valor es el tamaño real del archivo (ancho, alto): con eso el
  // navegador reserva el hueco correcto antes de que cargue la imagen y no
  // hay salto de maquetación (CLS) al entrar en la página.
  const SELLOS = [
    ['beda', 'Programa BEDA', true, 435, 180],
    ['beda-kids', 'Programa BEDA Kids', true, 323, 200],
    ['cambridge', 'Cambridge Assessment English · Authorised Exam Centre', true, 716, 200],
    ['facepm', 'FACEPM · Federación Autonómica de Centros de Enseñanza Privada de Madrid', true, 810, 180],
    ['concee', 'CONCEE · Confederación de Centros Educativos', true, 819, 180],
    ['cardioprotegido', 'Centro cardioprotegido', true, 467, 200],
    ['bilingue', 'Programa Bilingüe de la Comunidad de Madrid', true, 242, 200],
  ];

  const SELLOS_HTML = `
  <section class="sellos" aria-labelledby="sellos-titulo">
    <div class="container">
      <h2 class="sellos__titulo" id="sellos-titulo">Programas y certificaciones</h2>
      <ul class="sellos__lista">
        ${SELLOS.map(([archivo, nombre, hayLogo, w, h]) => `
        <li class="sello${hayLogo ? ' sello--con-logo' : ''}">
          ${hayLogo ? `<img class="sello__logo" src="/assets/img/sellos/${archivo}.png" alt="${nombre}" width="${w}" height="${h}" loading="lazy" decoding="async" />` : ''}
          <span class="sello__nombre">${nombre}</span>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
  const FOOTER = `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="/" class="brand">
          <img src="/assets/img/logo-white.png" alt="Logo Colegio NSD" class="brand__logo brand__logo--lg" width="72" height="72" />
          <span class="brand__text">
            <strong>Colegio NSD</strong>
            <small>Nuestra Señora de los Dolores</small>
          </span>
        </a>
        <p>Centro concertado bilingüe en Carabanchel. Educamos personas desde 1957.</p>
        <ul class="footer__contact">
          <li><i class="bi bi-geo-alt" aria-hidden="true"></i><span>C/ Tordo, 15 · Carabanchel, 28019 Madrid</span></li>
          <li><i class="bi bi-telephone" aria-hidden="true"></i><span><a href="tel:+34914719959">91 471 99 59</a> · <a href="tel:+34914718954">91 471 89 54</a></span></li>
          <li><i class="bi bi-envelope" aria-hidden="true"></i><span><a href="mailto:secretaria@colegionsdolores.es">secretaria@colegionsdolores.es</a></span></li>
        </ul>
      </div>
      ${SECCIONES.map(pieColumna).join('')}
    </div>

    ${WEBS}

    <div class="footer__infancia">
      <div class="container">
        <p><strong>Protección de la infancia.</strong> El centro cuenta con una persona coordinadora de bienestar y protección del alumnado (Ley Orgánica 8/2021, art. 35). Se contacta a través de secretaría, en <a href="mailto:secretaria@colegionsdolores.es?subject=Coordinaci%C3%B3n%20de%20bienestar">secretaria@colegionsdolores.es</a> indicando «Coordinación de bienestar». Ante una urgencia: <a href="tel:112">112</a>. Fundación ANAR: <a href="tel:+34900202010">900 20 20 10</a>. <a href="/proteccion-infancia">Más información</a></p>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>© <span id="year"></span> Colegio Nuestra Señora de los Dolores. Todos los derechos reservados.</p>
        <ul>
          <li><a href="https://web2.alexiaedu.com/" target="_blank" rel="noopener noreferrer">Alexia${FUERA}</a></li>
          <li><a href="https://raices.madrid.org/" target="_blank" rel="noopener noreferrer">Raíces${FUERA}</a></li>
          <li><a href="/aviso-legal">Aviso legal</a></li>
          <li><a href="/privacidad">Política de privacidad</a></li>
          <li><a href="/cookies">Cookies</a></li>
          <li><a href="/accesibilidad">Accesibilidad</a></li>
          <li><a href="/proteccion-infancia">Protección de la infancia</a></li>
        </ul>
      </div>
    </div>

    <a href="#top" class="to-top" aria-label="Volver arriba"><i class="bi bi-arrow-up"></i></a>
  </footer>

  <div class="mobile-cta-bar" id="mobileCta" aria-hidden="true" inert>
    <a href="tel:+34914719959" class="cta-call"><i class="bi bi-telephone-fill"></i><span>Llamar</span></a>
    <a href="/contacto" class="cta-visit"><i class="bi bi-calendar-check"></i><span>Reservar visita</span></a>
  </div>

  <div class="cursor-ring" aria-hidden="true"></div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>`;

  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.innerHTML = TOPBAR + NAV;
  if (footerSlot) footerSlot.innerHTML = LLAMADA + FOOTER;

  // Los sellos van por encima de la llamada a la accion, no debajo: primero
  // se ve de que va el centro y despues se le pide la visita. En las paginas
  // que no tienen esa banda, al principio del pie.
  if (footerSlot) {
    const llamada = document.querySelector('main section.cta, body > section.cta, section.cta');
    if (llamada) llamada.insertAdjacentHTML('beforebegin', SELLOS_HTML);
    else footerSlot.insertAdjacentHTML('afterbegin', SELLOS_HTML);
  }

  // Red de seguridad: si un logo que se daba por puesto no llega a cargar,
  // el sello vuelve a su nombre escrito en vez de quedarse en blanco.
  document.querySelectorAll('.sello__logo').forEach((img) => {
    img.addEventListener('error', () => {
      img.closest('.sello').classList.remove('sello--con-logo');
      img.remove();
    });
  });

  // Alturas reales de la cabecera, para que el CSS no las adivine.
  //
  // --topbar-h la usa #site-header como desplazamiento negativo del pegado: la
  // barra de contacto sale de la pantalla al bajar y la navegación se queda.
  // --navbar-h la usa scroll-padding-top para que los enlaces a un ancla no
  // dejen el titular debajo de la barra.
  //
  // Ambas cambian con el ancho y con el tamaño de letra del sistema, así que se
  // miden en vez de escribirse.
  (function medirCabecera() {
    const topbar = headerSlot && headerSlot.querySelector('.topbar');
    const navbar = headerSlot && headerSlot.querySelector('.navbar');
    if (!topbar && !navbar) return;

    // La barra de hoy (solo en la portada) empuja el hero hacia abajo: se
    // mide igual que la cabecera para que --portada-h la tenga en cuenta.
    const barraHoy = document.querySelector('.barra-hoy');
    const raiz = document.documentElement;
    const publicar = () => {
      if (topbar) raiz.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
      if (navbar) raiz.style.setProperty('--navbar-h', navbar.offsetHeight + 'px');
      raiz.style.setProperty('--barra-hoy-h', (barraHoy && !barraHoy.hidden ? barraHoy.offsetHeight : 0) + 'px');
    };
    publicar();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(publicar);
      if (topbar) ro.observe(topbar);
      if (navbar) ro.observe(navbar);
      if (barraHoy) ro.observe(barraHoy);
    } else {
      window.addEventListener('resize', publicar, { passive: true });
    }
    if (barraHoy) setTimeout(publicar, 0);
  })();

  // ── Sección activa, migas de pan y barra de páginas de la sección ──────
  // Todo sale de SECCIONES y de la ruta, así ninguna página lo escribe a
  // mano (antes había migas que llevaban a "/#servicios", una sección de la
  // portada, en vez de a la página de Servicios).
  (function ubicacion() {
    const idActivo = RUTA === '/' ? 'inicio' : (SECCION ? SECCION.id : '');
    document.querySelectorAll(`#primaryNav [data-seccion="${idActivo}"]`).forEach(a => {
      a.classList.add('is-active');
      a.setAttribute('aria-current', RUTA === '/' || (SECCION && RUTA === SECCION.url) ? 'page' : 'true');
    });
    document.querySelectorAll('#primaryNav .dropdown a, .drawer__sub a, .footer a').forEach(a => {
      if (a.getAttribute('href') === RUTA) a.setAttribute('aria-current', 'page');
    });
    if (!SECCION) return;

  // Las mismas migas, en el formato que entiende Google. Se saca del HTML
    // ya pintado, asi que no hay dos listas que mantener.
    function publicarMigas(migas) {
      const pasos = [...migas.querySelectorAll('a, span[aria-current]')];
      if (pasos.length < 2) return;
      const datos = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: pasos.map((e, i) => {
          const paso = { '@type': 'ListItem', position: i + 1, name: e.textContent.trim() };
          const href = e.getAttribute('href');
          if (href) paso.item = new URL(href, location.origin).href;
          return paso;
        })
      };
      const et = document.createElement('script');
      et.type = 'application/ld+json';
      et.textContent = JSON.stringify(datos);
      document.head.appendChild(et);
    }

    // Migas: Inicio › Sección › Página (› artículo, en el blog)
    const migas = document.querySelector('.crumbs');
    if (migas) {
      const ultimo = migas.querySelector('span:last-of-type');
      const tituloActual = (ultimo && ultimo.textContent.trim()) || (document.querySelector('h1') || {}).textContent || '';
      const sep = ' <i class="bi bi-chevron-right" aria-hidden="true"></i> ';
      let html = '<a href="/">Inicio</a>' + sep;
      if (RUTA === SECCION.url) html += `<span aria-current="page">${SECCION.titulo}</span>`;
      else {
        html += `<a href="${SECCION.url}">${SECCION.titulo}</a>` + sep;
        if (PAGINA && RUTA !== PAGINA.url) html += `<a href="${PAGINA.url}">${PAGINA.titulo}</a>` + sep + `<span aria-current="page">${tituloActual}</span>`;
        else html += `<span aria-current="page">${PAGINA ? PAGINA.titulo : tituloActual}</span>`;
      }
      migas.innerHTML = html;
      publicarMigas(migas);
    }

    // Barra de páginas: justo debajo de la cabecera de la página, con la
    // página resumen primero y la actual marcada. En móvil se desliza.
    const cabecera = document.querySelector('.page-hero');
    if (!cabecera || document.querySelector('.subnav')) return;
    const enlace = (url, texto, icono, externa) => {
      const actual = RUTA === url || (url === '/blog' && RUTA.startsWith('/blog'));
      return `<li><a href="${url}"${actual ? ' aria-current="page"' : ''}><i class="bi ${icono}" aria-hidden="true"></i>${texto}${externa ? FUERA : ''}</a></li>`;
    };
    const barra = document.createElement('nav');
    barra.className = 'subnav';
    barra.setAttribute('aria-label', `Páginas de ${SECCION.titulo}`);
    barra.innerHTML = `<div class="container"><ul class="subnav__lista">
      ${enlace(SECCION.url, SECCION.id === 'centro' ? 'El Centro' : 'Visión general', 'bi-grid-1x2')}
      ${SECCION.paginas.map(p => enlace(p.url, p.titulo, p.icono, p.externa)).join('')}
    </ul></div>`;
    cabecera.after(barra);
    const actual = barra.querySelector('[aria-current]');
    if (actual && barra.scrollWidth > barra.clientWidth) {
      const lista = barra.querySelector('.subnav__lista');
      lista.scrollLeft = actual.offsetLeft - 24;
    }
  })();

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
        // Oculta también para teclado y lectores mientras no se ve
        mobileCtaEl.toggleAttribute('inert', !ctaVisible);
        mobileCtaEl.setAttribute('aria-hidden', String(!ctaVisible));
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
    // Con el cajón abierto, el resto de la página queda inerte (ni el
    // teclado ni un lector de pantalla pueden salir del menú) y el foco da
    // la vuelta dentro de él. Al cerrarlo se devuelve al botón que lo abrió.
    drawer.inert = true;
    let aislados = [];
    const aislar = (si) => {
      if (!si) { aislados.forEach(el => { el.inert = false; }); aislados = []; return; }
      for (let n = drawer; n && n.parentElement && n !== document.body; n = n.parentElement) {
        Array.prototype.forEach.call(n.parentElement.children, (h) => {
          if (h === n || h === backdrop || h.inert || /^(SCRIPT|STYLE|LINK)$/.test(h.tagName)) return;
          h.inert = true; aislados.push(h);
        });
      }
    };
    const toggle = (open, devolverFoco) => {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      drawer.inert = !open;
      aislar(open);
      if (backdrop) backdrop.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open && drawerClose) drawerClose.focus();
      if (!open && devolverFoco) burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => {
      toggle(!drawer.classList.contains('is-open'), true);
      burger.classList.add('is-burst');
      burger.addEventListener('animationend', () => burger.classList.remove('is-burst'), { once: true });
    });
    if (drawerClose) drawerClose.addEventListener('click', () => toggle(false, true));
    if (backdrop) backdrop.addEventListener('click', () => toggle(false, true));
    drawer.querySelectorAll('.drawer__nav a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) toggle(false, true); });
    drawer.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focables = Array.prototype.filter.call(
        drawer.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        (el) => el.offsetParent !== null || el === document.activeElement);
      if (!focables.length) return;
      const primero = focables[0], ultimo = focables[focables.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });
    // Si la ventana pasa a escritorio con el cajón abierto, se cierra
    const escritorio = window.matchMedia('(min-width: 981px)');
    const alCambiar = () => { if (escritorio.matches && drawer.classList.contains('is-open')) toggle(false); };
    if (escritorio.addEventListener) escritorio.addEventListener('change', alCambiar);
  }

  // ── Selector de tema ────────────────────────────────────────────────
  // "sistema" se resuelve a un valor concreto en <html data-theme>, para
  // que el CSS solo tenga que mirar [data-theme="dark"].
  (function theme() {
    const KEY = 'nsd-theme';
    const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)');
    const controles = [
      document.getElementById('themeSwitch'),
      document.getElementById('themeSwitchDrawer')
    ].filter(Boolean);
    if (!controles.length) return;

    const leer = () => {
      try {
        const v = localStorage.getItem(KEY);
        return (v === 'light' || v === 'dark') ? v : 'system';
      } catch (e) { return 'system'; }
    };

    const metaColor = document.querySelector('meta[name="theme-color"]');

    function aplicar(eleccion) {
      const oscuro = eleccion === 'dark' || (eleccion === 'system' && sistemaOscuro.matches);
      document.documentElement.setAttribute('data-theme', oscuro ? 'dark' : 'light');
      if (metaColor) metaColor.setAttribute('content', oscuro ? '#0F1814' : '#F5F1EA');

      controles.forEach(sw => {
        sw.dataset.choice = eleccion;
        sw.querySelectorAll('[data-theme-choice]').forEach(btn => {
          btn.setAttribute('aria-checked', String(btn.dataset.themeChoice === eleccion));
        });
      });
    }

    function fijar(eleccion) {
      try {
        if (eleccion === 'system') localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, eleccion);
      } catch (e) { /* modo privado: el tema dura solo esta sesión */ }
      aplicar(eleccion);
    }

    controles.forEach(sw => {
      sw.addEventListener('click', e => {
        const btn = e.target.closest('[data-theme-choice]');
        if (btn) fijar(btn.dataset.themeChoice);
      });
      // Flechas para moverse entre opciones, como un radiogroup nativo
      sw.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const opts = [...sw.querySelectorAll('[data-theme-choice]')];
        const i = opts.indexOf(document.activeElement);
        if (i === -1) return;
        e.preventDefault();
        const sig = opts[(i + (e.key === 'ArrowRight' ? 1 : opts.length - 1)) % opts.length];
        sig.focus();
        fijar(sig.dataset.themeChoice);
      });
    });

    // Si sigue al sistema, reaccionar cuando el sistema cambie
    const alCambiarSistema = () => { if (leer() === 'system') aplicar('system'); };
    if (sistemaOscuro.addEventListener) sistemaOscuro.addEventListener('change', alCambiarSistema);
    else sistemaOscuro.addListener(alCambiarSistema);

    aplicar(leer());
  })();

  // Mobile CTA: simplemente referenciar el elemento, el handler unificado se ocupa
  mobileCtaEl = document.getElementById('mobileCta');

  // ── Dropdown hover delay (160ms grace period before close) ──────────────
  document.querySelectorAll('.has-dropdown').forEach(li => {
    let closeTimer;
    const open  = () => { clearTimeout(closeTimer); li.classList.add('is-open'); };
    const close = () => { closeTimer = setTimeout(() => li.classList.remove('is-open'), 160); };
    li.addEventListener('mouseenter', () => { li.classList.remove('dd-cerrado'); open(); });
    li.addEventListener('mouseleave', close);
    // Teclado: el desplegable se abre al entrar con Tab (:focus-within) y
    // Escape lo cierra y deja el foco en el enlace de la sección.
    li.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      li.classList.remove('is-open');
      li.classList.add('dd-cerrado');
      const cabeza = li.querySelector(':scope > a');
      if (cabeza) cabeza.focus();
    });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove('dd-cerrado'); });
  });

  // ── Pausa del contenido en movimiento (WCAG 2.2.2) ──────────────────
  // Cada cinta o carrusel que se mueve solo lleva un botón visible que lo
  // detiene (data-pausa="id1 id2"). aria-pressed="true" = en pausa.
  document.querySelectorAll('[data-pausa]').forEach((btn) => {
    const objetivos = btn.getAttribute('data-pausa').split(/\s+/)
      .map((id) => document.getElementById(id)).filter(Boolean);
    if (!objetivos.length) return;
    btn.addEventListener('click', () => {
      const pausar = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(pausar));
      objetivos.forEach((o) => o.classList.toggle('is-pausado', pausar));
    });
  });

  // ── Drawer accordion (expandable sections) ──────────────────────────────
  document.querySelectorAll('.drawer__sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.drawer__has-sub');
      const wasOpen = li.classList.contains('is-open');
      // close all
      document.querySelectorAll('.drawer__has-sub.is-open').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.drawer__sub-toggle').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { li.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

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
  // COOKIES
  // Desde septiembre de 2026 la web no instala cookies que necesiten
  // consentimiento: las fuentes y los iconos se sirven desde aquí y el mapa
  // de Google solo se carga si se pulsa su botón, que avisa antes (ver
  // nsd-mapa.js y /cookies). Por eso ya no hay banner: pedir permiso para
  // algo que no se usa confunde. Se borra la cookie del banner antiguo para
  // no dejar nada guardado sin necesidad.
  // ══════════════════════════════════════════════════════════
  try {
    if (document.cookie.indexOf('nsd_cookie_consent_v2=') > -1) {
      document.cookie = 'nsd_cookie_consent_v2=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    }
  } catch (e) { /* sin acceso a las cookies: nada que borrar */ }

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

/* =========================================================
   VENTANA EMERGENTE DE LOS POSTS
   ---------------------------------------------------------
   Un enlace a un post propio (/blog/algo) no navega: se trae con
   fetch y se muestra flotando encima de la página, sin crear una
   página nueva. La tarjeta (.post-card) es la misma pieza que si se
   entrara directamente por la url, así que no hace falta duplicar
   nada: solo se saca de la página traída y se planta encima.

   Un enlace a otra web (dolores-dragons.vercel.app, dragons-den…)
   no lo toca este script: sigue su camino normal y, como cada post
   apunta a su url concreta, se aterriza directo en el artículo, que
   en su web es su propia ventana o su propia página.
   ========================================================= */
(function () {
  'use strict';

  const esEnlaceDePost = (href) => {
    if (!href) return false;
    let url;
    try { url = new URL(href, location.href); } catch (e) { return false; }
    if (url.origin !== location.origin) return false;
    return /^\/blog\/[^/?#]+\/?$/.test(url.pathname);
  };

  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let capaActual = null;
  let devolverFoco = null;
  let tituloDeAntes = null;

  function quitarCapa(capa) {
    capa.classList.remove('is-abierta');
    const quitar = () => capa.remove();
    if (reducido()) quitar(); else setTimeout(quitar, 240);
  }

  function cerrar(conVolverAtras) {
    if (!capaActual) return;
    const capa = capaActual;
    capaActual = null;
    document.documentElement.classList.remove('con-post');
    quitarCapa(capa);
    if (tituloDeAntes) { document.title = tituloDeAntes; tituloDeAntes = null; }
    if (devolverFoco) { devolverFoco.focus({ preventScroll: true }); devolverFoco = null; }
    if (conVolverAtras) history.back();
  }

  async function abrir(href, disparador) {
    let html;
    try {
      const res = await fetch(href, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('respuesta no válida');
      html = await res.text();
    } catch (e) {
      location.href = href; // sin red o fallo del fetch: se navega de verdad
      return;
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tarjeta = doc.querySelector('.post-card');
    if (!tarjeta) { location.href = href; return; }

    // Si ya había un post abierto (se pulsó "más artículos" dentro), se
    // quita sin animar y sin tocar el historial: el nuevo añade su propia
    // entrada, así que el botón atrás recorre los posts uno a uno.
    if (capaActual) { capaActual.remove(); capaActual = null; }

    devolverFoco = disparador || null;
    if (tituloDeAntes === null) tituloDeAntes = document.title;
    document.title = doc.title;

    const capa = document.createElement('div');
    capa.className = 'nsd-post-overlay';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.innerHTML = '<div class="nsd-post-overlay__fondo" data-cerrar-fondo></div>';
    // El observador de "data-reveal" solo vio lo que había al cargar la
    // página: esto llega después, por fetch, así que se marca visible a
    // mano en vez de quedarse esperando un scroll que aquí no ocurre.
    tarjeta.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    capa.appendChild(tarjeta);
    document.body.appendChild(capa);
    // Si venimos de una seccion con scroll (noticias de portada, listado
    // filtrado...) el navegador puede heredar esa posicion en el propio
    // scroll interno de la capa (overflow-y: auto), abriendo la tarjeta
    // ya desplazada hacia abajo y cortada. Se fuerza a empezar arriba.
    capa.scrollTop = 0;
    capaActual = capa;
    document.documentElement.classList.add('con-post');
    history.pushState({ nsdPost: true }, '', href);

    requestAnimationFrame(() => { capa.scrollTop = 0; capa.classList.add('is-abierta'); });

    const h1 = tarjeta.querySelector('h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;

    if (esEnlaceDePost(a.getAttribute('href'))) {
      e.preventDefault();
      abrir(a.href, a);
      return;
    }
    if (capaActual && a.matches('[data-cerrar-post]')) {
      e.preventDefault();
      cerrar(true);
    }
  });

  document.addEventListener('click', (e) => {
    if (capaActual && e.target.matches('[data-cerrar-fondo]')) cerrar(true);
  });

  document.addEventListener('keydown', (e) => {
    if (capaActual && e.key === 'Escape') cerrar(true);
  });

  // El botón atrás del navegador cierra la ventana; la url ya la cambió
  // el propio navegador, así que aquí solo se limpia el marcado.
  window.addEventListener('popstate', () => { if (capaActual) cerrar(false); });
})();

// ── Tablas desplazables: alcanzables con el teclado (WCAG 2.1.1) ───────
(function () {
  'use strict';
  function marcar() {
    document.querySelectorAll('table, .tabla-marco, .table-wrap, .schedule, .menu-marco').forEach((el) => {
      const ox = getComputedStyle(el).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
        if (!el.hasAttribute('role') && el.tagName !== 'TABLE') el.setAttribute('role', 'region');
        if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Tabla desplazable');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', marcar); else marcar();
  window.addEventListener('resize', marcar, { passive: true });
})();

// ── Respuesta táctil (muelles) ──────────────────────────────────────────
// Mismo comportamiento que nsd-sitio.js en infantil/campamento: feedback
// al pulsar, no al soltar, con un muelle real e interrumpible.
(function () {
  'use strict';
  if (!window.NSDSpring) return;
  document.querySelectorAll('.btn, .topbar__pill, .card, .service, .step').forEach((el) => {
    window.NSDSpring.tacto(el, { escala: el.matches('.card, .service, .step') ? 0.985 : 0.96 });
  });
})();
