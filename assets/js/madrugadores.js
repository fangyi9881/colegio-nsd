// Calculadora de Madrugadores: 12 € por día de uso.
// El precio sale de la tabla de tarifas del curso (extraescolares).
(function () {
  'use strict';
  const PRECIO_DIA = 12;
  const grupo = document.querySelector('.madru-dias');
  const res = document.getElementById('madruRes');
  const mes = document.getElementById('madruMes');
  if (!grupo || !res) return;

  const euros = (n) => n.toLocaleString('es-ES') + ' €';
  const pintar = (dias) => {
    grupo.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.dias) === dias)));
    res.innerHTML = `${dias} ${dias === 1 ? 'día' : 'días'}: <strong>${euros(dias * PRECIO_DIA)}</strong> a la semana`;
    if (mes) mes.textContent = euros(dias * PRECIO_DIA * 4);
  };
  grupo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-dias]');
    if (b) pintar(Number(b.dataset.dias));
  });
})();
