/* /familias/formularios: tarjetas con los formularios en línea que
   secretaría publica desde el panel (sección «Formularios»). */
(function () {
  'use strict';
  const caja = document.querySelector('[data-formularios]');
  const CMS = window.NSD_CMS;
  if (!caja || !CMS || !CMS.activo) return;
  const { el } = CMS.render;
  CMS.leer(['formularios']).then((d) => {
    const lista = ((d.formularios || {}).lista || []).filter((f) => f && f.titulo && CMS.urlSegura(f.url));
    if (!lista.length) return;
    const ul = el('ul', 'formularios');
    lista.forEach((f) => {
      const li = el('li');
      const art = el('article', 'formulario');
      art.appendChild(el('h3', null, f.titulo));
      if (f.para) art.appendChild(el('p', null, f.para));
      if (f.plazo) art.appendChild(el('p', 'formulario__plazo', 'Plazo: ' + f.plazo));
      const a = el('a', 'btn btn--primary btn--sm');
      a.href = CMS.urlSegura(f.url);
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      const ico = el('i', 'bi bi-box-arrow-up-right'); ico.setAttribute('aria-hidden', 'true');
      a.appendChild(ico);
      a.appendChild(document.createTextNode(' Rellenar'));
      a.appendChild(el('span', 'sr-only', ' ' + f.titulo + ' (se abre en otra pestaña)'));
      art.appendChild(a);
      li.appendChild(art);
      ul.appendChild(li);
    });
    caja.textContent = '';
    caja.appendChild(ul);
  });
})();
