/* =========================================================
   Barra de hoy: va justo debajo de la navegación y dice en qué día
   estamos y qué hora es. Es la misma pieza en las tres webs; lo que
   cambia es de dónde saca los mensajes cada una.
   ---------------------------------------------------------
   Contenedor:
     <section class="barra-hoy" data-barra-hoy hidden
       data-web="colegio|infantil|campamento"
       data-agenda-href="/familias#agenda" data-agenda-label="Agenda"
       data-extra-icono="bi-calendar-check" data-extra-rotulo="Plazas abiertas"
       data-extra-texto="..." data-extra-url="#inscripcion"></section>

   Orden de lo que enseña:
     1. Eventos de hoy y la próxima fecha (solo si existe
        window.NSD_CALENDARIO, que hoy solo tiene la web del colegio).
     2. El mensaje propio de la web (data-extra-*), si lo hay.
     3. Última hora: comunicados de las últimas dos semanas, de las
        noticias que le tocan a esta web (window.NSD_NOTICIAS).
     4. Avisos recurrentes que vencen pronto (solo con NSD_CALENDARIO).
     5. Citas, para que la barra nunca se quede en un solo mensaje.

   Los mensajes pasan solos, deslizándose de derecha a izquierda, y se
   pueden parar con el botón (y se paran solos al pasar el ratón).
   ========================================================= */
(function () {
  'use strict';
  const caja = document.querySelector('[data-barra-hoy]');
  if (!caja) return;

  const C = window.NSD_CALENDARIO || null;
  const N = window.NSD_NOTICIAS || null;
  const web = caja.dataset.web || 'colegio';

  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Citas de personas reales, con la frase que de verdad dijeron o
  // escribieron. Si alguna vez se añade una, que sea comprobable.
  const CITAS = [
    { texto: 'La educación es el arma más poderosa que puedes usar para cambiar el mundo.', autor: 'Nelson Mandela' },
    { texto: 'Nada en la vida debe temerse, solo comprenderse. Ahora es el momento de comprender más, para temer menos.', autor: 'Marie Curie' },
    { texto: 'La imaginación es más importante que el conocimiento.', autor: 'Albert Einstein' },
    { texto: 'Un niño, un maestro, un libro y un lápiz pueden cambiar el mundo.', autor: 'Malala Yousafzai' },
    { texto: 'El futuro de los niños es siempre hoy. Mañana será tarde.', autor: 'Gabriela Mistral' },
    { texto: 'La mayor señal del éxito de un maestro es poder decir: «los niños están trabajando como si yo no existiera».', autor: 'María Montessori' },
    { texto: 'Nadie educa a nadie, nadie se educa a sí mismo: las personas se educan entre sí.', autor: 'Paulo Freire' },
    { texto: 'Solo se ve bien con el corazón; lo esencial es invisible a los ojos.', autor: 'Antoine de Saint-Exupéry' },
  ];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const aFecha = (s) => { const [a, m, d] = String(s).split('-').map(Number); return new Date(a, m - 1, d); };
  const dias = (f) => Math.round((f - hoy) / 86400000);

  // ── Los mensajes que van a girar ──
  const mensajes = [];
  const pon = (clase, icono, rotulo, texto, url) => mensajes.push({ clase, icono, rotulo, texto, url });

  // 1. Lo del calendario del centro (hoy solo lo tiene la web del colegio)
  if (C && C.eventos) {
    const conFecha = C.eventos.map((e) => ({ ...e, n: dias(aFecha(e.fecha)) }));
    conFecha.filter((e) => e.n === 0).forEach((e) => pon('es-hoy', 'bi-stars', 'Hoy', e.titulo + (e.detalle ? ' · ' + e.detalle : ''), e.url));
    const prox = conFecha.filter((e) => e.n > 0).sort((a, b) => a.n - b.n)[0];
    if (prox) {
      const cuando = prox.n === 1 ? 'mañana' : prox.n <= 21 ? `en ${prox.n} días` : `el ${aFecha(prox.fecha).getDate()} de ${MESES[aFecha(prox.fecha).getMonth()]}`;
      pon('', 'bi-calendar-event', 'Próxima fecha', `${prox.titulo}, ${cuando}`, prox.url);
    }
  }

  // 2. El mensaje propio de esta web, si lo lleva
  if (caja.dataset.extraTexto) {
    pon('es-promo', caja.dataset.extraIcono || 'bi-star', caja.dataset.extraRotulo || 'Destacado', caja.dataset.extraTexto, caja.dataset.extraUrl || null);
  }

  // 3. Última hora: comunicados recientes de las noticias que le tocan a
  // esta web, que es lo que corre prisa
  if (N && N.length) {
    N.filter((x) => (x.webs || ['colegio']).indexOf(web) >= 0)
      .filter((x) => x.tipo === 'comunicado' && dias(aFecha(x.fecha)) >= -14)
      .slice(0, 2)
      .forEach((x) => pon('es-urgente', 'bi-megaphone', 'Última hora', x.titulo, x.url || '/blog'));
  }

  // 4. Avisos recurrentes que vencen pronto (solo con calendario propio)
  if (C && C.recurrentes) {
    const d = hoy.getDate();
    C.recurrentes.filter((r) => r.dia - d >= 0 && r.dia - d <= 3).forEach((r) => {
      const q = r.dia - d;
      pon('es-aviso', 'bi-cash-coin', q === 0 ? 'Es hoy' : `Quedan ${q} ${q === 1 ? 'día' : 'días'}`, r.titulo + ' · ' + r.detalle, r.url);
    });
  }

  // 5. Siempre dos citas, para que la barra nunca se quede en un solo mensaje
  CITAS.slice().sort(() => Math.random() - 0.5).slice(0, 2).forEach((c) => {
    mensajes.push({ clase: 'es-cita', icono: 'bi-quote', rotulo: 'Para pensar', texto: `«${c.texto}»`, url: null, autor: c.autor });
  });

  // ── Marcado ──
  // La barra llega oculta en el HTML: si no hubiera nada que decir, se
  // queda oculta en vez de dejar una franja vacía bajo la navegación.
  if (!mensajes.length) return;
  caja.hidden = false;
  const fechaTexto = () => `${DIAS[hoy.getDay()]}, ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
  const horaTexto = () => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; };

  const agendaHref = caja.dataset.agendaHref || '/familias#agenda';
  const agendaLabel = caja.dataset.agendaLabel || 'Agenda';

  caja.innerHTML = `
    <div class="barra-hoy__in">
      <p class="barra-hoy__fecha">
        <i class="bi bi-calendar3" aria-hidden="true"></i>
        <span class="barra-hoy__dia">${esc(fechaTexto())}</span>
        <time class="barra-hoy__reloj" data-reloj>${horaTexto()}</time>
      </p>
      <ul class="barra-hoy__rueda">
        ${mensajes.map((m, i) => `<li class="barra-hoy__msg ${m.clase}${i === 0 ? ' is-activa' : ''}"${i === 0 ? '' : ' aria-hidden="true" inert'}>
          <i class="bi ${m.icono}" aria-hidden="true"></i>
          <span class="barra-hoy__rotulo">${esc(m.rotulo)}</span>
          <span class="barra-hoy__texto">${m.url ? `<a href="${esc(m.url)}">${esc(m.texto)}</a>` : esc(m.texto)}${m.autor ? ` <b>${esc(m.autor)}</b>` : ''}</span>
        </li>`).join('')}
      </ul>
      <div class="barra-hoy__mandos">
        ${mensajes.length > 1 ? `<button type="button" class="barra-hoy__pausa" data-pausa aria-pressed="false"><i class="bi bi-pause-fill" aria-hidden="true"></i><span class="sr-only">Parar los mensajes</span></button>` : ''}
        <a class="barra-hoy__agenda" href="${esc(agendaHref)}">${esc(agendaLabel)} <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
      </div>
    </div>`;

  // ── El reloj ──
  const reloj = caja.querySelector('[data-reloj]');
  const ponHora = () => {
    const t = horaTexto();
    if (reloj.textContent !== t) reloj.textContent = t;
    reloj.setAttribute('datetime', new Date().toISOString());
  };
  ponHora();
  setInterval(ponHora, 10000);

  // ── El giro de los mensajes ──
  const laminas = [...caja.querySelectorAll('.barra-hoy__msg')];
  if (laminas.length < 2) return;
  const lento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let actual = 0, parado = lento, temporizador = null;

  function pasar() {
    const sale = laminas[actual];
    actual = (actual + 1) % laminas.length;
    const entra = laminas[actual];
    sale.classList.remove('is-activa');
    sale.classList.add('is-saliendo');
    sale.setAttribute('aria-hidden', 'true');
    sale.setAttribute('inert', '');
    // El que entra espera a que el que sale haya terminado del todo su
    // transicion de salida (.barra-hoy__msg dura .3s en opacity) antes de
    // empezar la suya: si no, los dos se leen superpuestos un instante.
    setTimeout(() => {
      entra.classList.add('is-activa');
      entra.removeAttribute('aria-hidden');
      entra.removeAttribute('inert');
    }, 320);
    setTimeout(() => sale.classList.remove('is-saliendo'), 700);
  }
  const arrancar = () => { if (!parado && !temporizador) temporizador = setInterval(pasar, 7000); };
  const frenar = () => { clearInterval(temporizador); temporizador = null; };

  const boton = caja.querySelector('[data-pausa]');
  if (boton) boton.addEventListener('click', () => {
    parado = !parado;
    boton.setAttribute('aria-pressed', String(parado));
    boton.innerHTML = `<i class="bi ${parado ? 'bi-play-fill' : 'bi-pause-fill'}" aria-hidden="true"></i><span class="sr-only">${parado ? 'Seguir con los mensajes' : 'Parar los mensajes'}</span>`;
    parado ? frenar() : arrancar();
  });
  // Al leer o al pasar el ratón, la barra se queda quieta
  caja.addEventListener('mouseenter', frenar);
  caja.addEventListener('mouseleave', arrancar);
  caja.addEventListener('focusin', frenar);
  caja.addEventListener('focusout', arrancar);
  document.addEventListener('visibilitychange', () => (document.hidden ? frenar() : arrancar()));
  arrancar();
})();
