// Resuelve el tema ANTES del primer pintado, para que no haya parpadeo.
// Va en fichero aparte (no inline) porque la cabecera CSP del sitio es
// "script-src 'self'": un <script> inline quedaría bloqueado en producción
// y el tema oscuro no llegaría a aplicarse.
// Debe cargarse de forma SÍNCRONA en el <head>: sin defer ni async.
(function () {
  // Marca que hay JavaScript: el CSS reserva el sitio de las piezas que
  // pinta JS (barra de hoy) para que la página no salte al aparecer.
  document.documentElement.classList.add('js');
  try {
    var guardado = localStorage.getItem('nsd-theme');
    var tema = (guardado === 'dark' || guardado === 'light')
      ? guardado
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', tema);
  } catch (e) {
    // Modo privado o almacenamiento bloqueado: no se marca nada y manda
    // la media query de respaldo que hay en el CSS.
  }
})();
