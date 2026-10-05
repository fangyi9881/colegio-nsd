/* =========================================================
   Preparar imágenes fuera del hilo principal (panel).
   Decodificar una foto de móvil de 12 MP y reducirla bloqueaba la página
   uno o dos segundos; aquí se hace en segundo plano y el panel sigue
   respondiendo. Lo usa panel-api.js (prepararImagen) cuando el navegador
   tiene OffscreenCanvas; si no, lo hace él mismo como antes.

   Entrada:  { archivo: Blob, max: número, cuadrado: bool, calidad: 0-1 }
   Salida:   { blob, ancho, alto }  o  { error: 'leer' | 'preparar' }
   ========================================================= */
self.onmessage = async (e) => {
  const { archivo, max, cuadrado, calidad } = e.data || {};
  let mapa;
  try { mapa = await createImageBitmap(archivo); } catch (err) { self.postMessage({ error: 'leer' }); return; }
  try {
    let sx = 0, sy = 0, sw = mapa.width, sh = mapa.height, ancho, alto;
    if (cuadrado) {
      const lado = Math.min(mapa.width, mapa.height);
      sx = (mapa.width - lado) / 2; sy = (mapa.height - lado) / 2; sw = sh = lado;
      ancho = alto = Math.min(max, lado);
    } else {
      const escala = Math.min(1, max / Math.max(mapa.width, mapa.height));
      ancho = Math.round(mapa.width * escala); alto = Math.round(mapa.height * escala);
    }
    const lienzo = new OffscreenCanvas(ancho, alto);
    lienzo.getContext('2d').drawImage(mapa, sx, sy, sw, sh, 0, 0, ancho, alto);
    if (mapa.close) mapa.close();
    let blob = await lienzo.convertToBlob({ type: 'image/webp', quality: calidad });
    if (!blob || blob.type !== 'image/webp') blob = await lienzo.convertToBlob({ type: 'image/jpeg', quality: calidad });
    self.postMessage({ blob, ancho, alto });
  } catch (err) {
    self.postMessage({ error: 'preparar' });
  }
};
