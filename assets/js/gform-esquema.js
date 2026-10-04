/* Lee la estructura de un Google Form (la que devuelve la función
   «formularios» de Supabase: {t, ds, e, p}) y la convierte en bloques que
   la web sabe pintar. Se usa en el navegador y en los scripts de Node.
   p = FB_PUBLIC_LOAD_DATA_[1][1] recortado: [id, título, descripción, tipo, campos]. */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.NSD_GFORM = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TIPOS = { 0: 'texto', 1: 'parrafo', 2: 'radio', 3: 'desplegable', 4: 'casillas', 5: 'escala', 6: 'seccion', 7: 'rejilla', 8: 'pagina', 9: 'fecha', 10: 'hora', 11: 'imagen', 12: 'video', 13: 'archivo' };

  // Huella de las preguntas: si cambia algo en Google (texto, opciones,
  // obligatorias, orden), cambia la huella. FNV-1a de 32 bits.
  function huella(p) {
    const canon = (p || []).map((q) => [q[1] || '', q[2] || '', q[3], (q[4] || []).map((c) => [
      c[0], c[1] ? c[1].map((o) => [o[0], o[4] ? 1 : 0]) : null, c[2] ? 1 : 0, c[3] || null, c[7] || null, c[11] || null,
    ])]);
    const s = JSON.stringify(canon);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  function normalizar(raw) {
    const ajustes = raw.e || [];
    const email = ajustes[6] === 3 ? 'campo' : ajustes[6] === 2 ? 'verificado' : null;
    let paginas = 1;
    const bloques = [];
    (raw.p || []).forEach((q) => {
      const tipo = TIPOS[q[3]] || 'desconocido';
      const titulo = (q[1] || '').trim();
      const desc = (q[2] || '').trim();
      const campos = q[4] || [];
      const c = campos[0] || [];
      const base = { tipo, titulo, desc };
      switch (tipo) {
        case 'seccion': if (titulo || desc) bloques.push(base); break;
        case 'pagina': paginas++; if (titulo || desc) bloques.push(Object.assign(base, { tipo: 'seccion' })); break;
        case 'imagen': case 'video': break;
        case 'texto': case 'parrafo': case 'hora':
          bloques.push(Object.assign(base, { entry: c[0], req: !!c[2] })); break;
        case 'fecha':
          bloques.push(Object.assign(base, { entry: c[0], req: !!c[2], conHora: !!(c[7] && c[7][0]), conAnio: !(c[7] && c[7][1] === 0) })); break;
        case 'radio': case 'desplegable': case 'casillas':
          bloques.push(Object.assign(base, {
            entry: c[0], req: !!c[2],
            ops: (c[1] || []).filter((o) => o[0] !== '' || o[4]).map((o) => (o[4] ? { otro: true } : { valor: o[0] })),
          }));
          break;
        case 'escala':
          bloques.push(Object.assign(base, { entry: c[0], req: !!c[2], ops: (c[1] || []).map((o) => ({ valor: o[0] })), extremos: c[3] || [] }));
          break;
        case 'rejilla':
          bloques.push(Object.assign(base, {
            multiple: !!(c[11] && c[11][0]), req: !!c[2],
            cols: (c[1] || []).map((o) => o[0]),
            filas: campos.map((f) => ({ entry: f[0], nombre: (f[3] && f[3][0]) || '' })),
          }));
          break;
        default:
          bloques.push(Object.assign(base, { tipo: 'noSoportado' }));
      }
    });
    return {
      titulo: (raw.t || '').trim(), descripcion: (raw.ds || '').trim(), email, paginas, bloques,
      soportado: email !== 'verificado' && !bloques.some((b) => b.tipo === 'noSoportado'),
    };
  }

  return { huella, normalizar, TIPOS };
});
