/* Escribe el curso escolar en vigor (de septiembre a agosto) en los
   [data-curso-actual]. Si el panel ha fijado otro, cms.js lo sustituye. */
(function () {
  'use strict';
  const d = new Date();
  const a = d.getFullYear();
  const curso = d.getMonth() >= 7 ? `${a}-${a + 1}` : `${a - 1}-${a}`;
  document.querySelectorAll('[data-curso-actual]').forEach((el) => {
    if (!el.classList.contains('cms-publicado')) el.textContent = curso;
  });
})();
