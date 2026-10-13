/* =========================================================
   Colegio NSD · Lector del menú del comedor
   ---------------------------------------------------------
   Convierte el archivo del menú (PDF o Excel) en los días que
   pinta la web: fecha, primero, segundo, guarnición, postre,
   postre 2 (guardería), bebida, pan y energía.

   No «adivina» a partir de un texto suelto: lee la posición de
   cada palabra. Cada día es una columna con las etiquetas
   «Primero:», «Segundo:», «Guarniciones:», «Postre 1:»,
   «Postre 2:», «Bebida:» y «Pan:», y debajo la fila «Kcal.
   Prot. Lip. H.C.» con sus cuatro números. Los valores que ocupan
   dos líneas se unen. Lo que no se pueda leer queda vacío y se
   avisa: el panel siempre enseña el resultado para revisarlo antes
   de publicarlo.

   Sirve en el navegador (panel) y en Node (pruebas).
   ========================================================= */
(function (raiz) {
  'use strict';

  const ETIQUETAS = [
    ['primero', /^primer[oa]s?$/i],
    ['segundo', /^segund[oa]s?$/i],
    ['guarnicion', /^guarnici[oó]n(?:es)?$/i],
    ['postre', /^postre\s*1?$/i],
    ['postre2', /^postre\s*2$/i],
    ['bebida', /^bebida$/i],
    ['pan', /^pan$/i]
  ];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const RE_FECHA = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/;
  const RE_NUM = /^\d+(?:[.,]\d+)?$/;
  const RE_ENERGIA = /^(kcal|prot|lip|h\.?\s?c)\.?(\s.*)?$/i;
  const RE_AVISO_GUARDERIA = /s[oó]lo para alumnos|solo para alumnos/i;

  const limpiar = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const pad = (n) => String(n).padStart(2, '0');

  function claveEtiqueta(texto) {
    const t = limpiar(texto).replace(/:$/, '').trim();
    for (const [k, re] of ETIQUETAS) if (re.test(t)) return k;
    return null;
  }

  // ── De palabras sueltas (con posición) a días ────────────────────────
  // items: [{ s: texto, x, y, w }]  con y creciendo hacia abajo.
  // opciones.tolBanda: separación mínima entre dos filas de fechas;
  // opciones.tolX: lo que se tolera al agrupar etiquetas de una columna.
  function leerItems(entrada, opciones) {
    const o = Object.assign({ tolBanda: 6, tolX: 4, tolLinea: 3 }, opciones || {});
    const avisos = [];
    const items = [];
    entrada.forEach((it) => {
      const s = limpiar(it.s);
      if (!s) return;
      if (/^\d+(?:[.,]\d+)?(?:\s+\d+(?:[.,]\d+)?){3}$/.test(s)) { s.split(' ').forEach((n, i) => items.push({ s: n, x: it.x + i * 0.001, y: it.y, w: 0 })); return; }
      // «Primero: Macarrones» en una sola celda → etiqueta + valor
      const m = /^([A-Za-zÁÉÍÓÚáéíóúñÑ]+(?:\s*[12])?)\s*:\s*(.+)$/.exec(s);
      if (m && claveEtiqueta(m[1])) {
        items.push({ s: m[1] + ':', x: it.x, y: it.y, w: 0 });
        items.push({ s: limpiar(m[2]), x: it.x + 0.01, y: it.y, w: it.w || 0 });
      } else items.push({ s, x: it.x, y: it.y, w: it.w || 0 });
    });

    const fechas = [];
    items.forEach((it) => {
      const f = RE_FECHA.exec(it.s);
      if (!f) return;
      const d = +f[1], mes = +f[2], a = +f[3];
      if (mes < 1 || mes > 12 || d < 1 || d > 31) return;
      fechas.push({ iso: `${a}-${pad(mes)}-${pad(d)}`, cx: it.x + (it.w || 0) / 2, y: it.y, it });
    });
    if (!fechas.length) return { dias: [], avisos: ['No he encontrado fechas con el formato 01/09/2026. ¿Es el menú mensual del comedor?'] };

    // Filas de fechas (cada fila de días de la semana es una «banda»)
    fechas.sort((p, q) => p.y - q.y || p.cx - q.cx);
    const bandas = [];
    fechas.forEach((f) => {
      const b = bandas.find((z) => Math.abs(z.y - f.y) <= o.tolBanda);
      if (b) b.fechas.push(f); else bandas.push({ y: f.y, fechas: [f] });
    });
    bandas.sort((p, q) => p.y - q.y);

    const dias = [];
    bandas.forEach((banda, bi) => {
      const y0 = banda.y, y1 = bi + 1 < bandas.length ? bandas[bi + 1].y : Infinity;
      const dentro = items.filter((it) => it.y > y0 + 0.01 && it.y < y1 - 0.01 && !RE_FECHA.test(it.s));
      // Columnas: el x de las etiquetas («Primero:», «Segundo:»…)
      const xs = dentro.filter((it) => claveEtiqueta(it.s) && /:$/.test(it.s)).map((it) => it.x).sort((p, q) => p - q);
      const anclas = [];
      xs.forEach((x) => { if (!anclas.length || x - anclas[anclas.length - 1] > o.tolX) anclas.push(x); });
      if (!anclas.length) { avisos.push(`Fila del ${banda.fechas[0].iso}: no he encontrado «Primero:», «Segundo:»… debajo de las fechas.`); return; }
      const columnaDe = (x) => { let k = 0; anclas.forEach((a, i) => { if (x >= a - o.tolX) k = i; }); return k; };
      const col = anclas.map(() => ({ items: [], fecha: null }));
      dentro.forEach((it) => col[columnaDe(it.x)].items.push(it));
      banda.fechas.forEach((f) => {
        const c = columnaDe(f.cx);
        if (col[c].fecha) avisos.push(`Dos fechas (${col[c].fecha} y ${f.iso}) caen en la misma columna: revisa ese día.`);
        else col[c].fecha = f.iso;
      });
      col.forEach((c, ci) => {
        if (!c.fecha) { if (c.items.some((it) => claveEtiqueta(it.s))) avisos.push('Hay una columna con platos pero sin fecha encima; no la he usado.'); return; }
        dias.push(diaDeColumna(c.fecha, c.items, o, avisos));
      });
    });

    dias.sort((p, q) => p.fecha.localeCompare(q.fecha));
    // Un día repetido (por ejemplo, un PDF con dos páginas iguales): el último gana
    const unicos = [];
    dias.forEach((d) => { const i = unicos.findIndex((z) => z.fecha === d.fecha); if (i >= 0) { avisos.push(`El ${d.fecha} sale dos veces; me quedo con la última.`); unicos[i] = d; } else unicos.push(d); });
    return { dias: unicos, avisos };
  }

  function diaDeColumna(fecha, its, o, avisos) {
    const dia = { fecha };
    const etiquetas = its.filter((it) => claveEtiqueta(it.s) && /:$/.test(it.s)).sort((p, q) => p.y - q.y);

    // Energía: los cuatro números de debajo de «Kcal. Prot. Lip. H.C.»
    const cab = its.filter((it) => RE_ENERGIA.test(it.s)).sort((p, q) => p.y - q.y);
    let usados = new Set(cab);
    if (cab.length) {
      const yCab = Math.max.apply(null, cab.map((it) => it.y));
      const nums = its.filter((it) => RE_NUM.test(it.s) && it.y > yCab - 0.01 && !usados.has(it)).sort((p, q) => p.y - q.y || p.x - q.x);
      if (nums.length >= 4) {
        const linea = nums.filter((it) => Math.abs(it.y - nums[0].y) <= o.tolLinea).sort((p, q) => p.x - q.x);
        const v = (linea.length >= 4 ? linea : nums).slice(0, 4).map((it) => it);
        v.forEach((it) => usados.add(it));
        const n = v.map((it) => Number(it.s.replace(',', '.')));
        dia.kcal = n[0]; dia.prot = n[1]; dia.lip = n[2]; dia.hc = n[3];
      }
    }

    // Platos: cada palabra pertenece a la etiqueta más cercana por altura
    const textos = its.filter((it) => !usados.has(it) && !(claveEtiqueta(it.s) && /:$/.test(it.s)) && !RE_AVISO_GUARDERIA.test(it.s) && !RE_ENERGIA.test(it.s));
    const trozos = {};
    etiquetas.forEach((e) => { trozos[e.s] = trozos[e.s] || []; });
    textos.forEach((it) => {
      if (!etiquetas.length) return;
      let k = etiquetas.length - 1;
      for (let i = 0; i < etiquetas.length - 1; i++) {
        if (it.y <= (etiquetas[i].y + etiquetas[i + 1].y) / 2) { k = i; break; }
      }
      (etiquetas[k].items = etiquetas[k].items || []).push(it);
    });
    etiquetas.forEach((e) => {
      const lineas = [];
      (e.items || []).sort((p, q) => p.y - q.y || p.x - q.x).forEach((it) => {
        const l = lineas.find((z) => Math.abs(z.y - it.y) <= o.tolLinea);
        if (l) l.t.push(it); else lineas.push({ y: it.y, t: [it] });
      });
      const k0 = claveEtiqueta(e.s);
      if (k0 === 'pan' || k0 === 'bebida') lineas.splice(1);   // debajo de «Pan» solo hay notas al pie
      const valor = lineas.map((l) => l.t.sort((p, q) => p.x - q.x).map((it) => it.s).join(' ')).join(' ');
      const k = claveEtiqueta(e.s);
      const v = limpiar(valor).replace(/\s+([,.;:)])/g, '$1').replace(/\(\s+/g, '(').replace(/,(?=\S)/g, ', ');
      if (v) dia[k] = dia[k] ? dia[k] + ' ' + v : v;
    });
    if (dia.guarnicion == null) dia.guarnicion = '';
    ['primero', 'segundo'].forEach((k) => { if (!dia[k]) avisos.push(`El ${fecha} no tiene «${k === 'primero' ? 'primer' : 'segundo'} plato»: revísalo.`); });
    if (dia.kcal == null) avisos.push(`El ${fecha} no tiene la energía (kcal, proteínas, lípidos, hidratos): puedes dejarla vacía.`);
    return dia;
  }

  // ── Agrupar por meses y preparar los datos para la web ───────────────
  function agruparMeses(dias) {
    const meses = {};
    dias.forEach((d) => { (meses[d.fecha.slice(0, 7)] = meses[d.fecha.slice(0, 7)] || []).push(d); });
    return meses;
  }
  function nombreMes(clave) {
    const [a, m] = clave.split('-').map(Number);
    return MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1) + ' de ' + a;
  }
  function revisar(dias) {
    const avisos = [];
    dias.forEach((d) => {
      const [a, m, dd] = d.fecha.split('-').map(Number);
      const dow = new Date(a, m - 1, dd).getDay();
      if (dow === 0 || dow === 6) avisos.push(`El ${d.fecha} es fin de semana.`);
    });
    return avisos;
  }

  // ── PDF: palabras con posición desde pdf.js ──────────────────────────
  async function itemsDePdf(buffer, pdfjsLib) {
    const doc = await pdfjsLib.getDocument({ data: buffer, isEvalSupported: false, useWorkerFetch: false }).promise;
    const paginas = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const pag = await doc.getPage(n);
      const alto = pag.view[3];
      const tc = await pag.getTextContent();
      paginas.push(tc.items.filter((it) => it.str != null && String(it.str).trim()).map((it) => ({ s: it.str, x: it.transform[4], y: alto - it.transform[5], w: it.width || 0 })));
    }
    return { paginas, numPaginas: doc.numPages };
  }
  async function leerPdf(buffer, pdfjsLib) {
    const { paginas, numPaginas } = await itemsDePdf(buffer, pdfjsLib);
    const dias = []; let avisos = [];
    paginas.forEach((p) => { const r = leerItems(p, { tolBanda: 6, tolX: 4, tolLinea: 3 }); dias.push.apply(dias, r.dias); if (r.dias.length || !p.length) avisos = avisos.concat(r.avisos); else if (!paginas.some((q) => q !== p)) avisos = avisos.concat(r.avisos); });
    if (!dias.length && paginas.some((p) => p.length) && !avisos.length) avisos.push('No he encontrado fechas con el formato 01/09/2026. ¿Es el menú mensual del comedor?');
    if (!paginas.some((p) => p.length)) avisos.unshift('Este PDF no tiene texto (parece una foto o un escaneo). Súbelo desde el original en PDF o Excel, o escribe los días a mano.');
    dias.sort((p, q) => p.fecha.localeCompare(q.fecha));
    return { dias, avisos: avisos.concat(revisar(dias)), paginas: numPaginas };
  }

  // ── Excel (.xlsx): celdas como palabras con posición ─────────────────
  async function descomprimir(buffer) {
    const u8 = new Uint8Array(buffer), dv = new DataView(buffer);
    let e = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Ese archivo no es un Excel (.xlsx).');
    const total = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
    const archivos = {};
    const td = new TextDecoder();
    for (let k = 0; k < total; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const metodo = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
      const nombre = td.decode(u8.subarray(p + 46, p + 46 + nl));
      p += 46 + nl + el + cl;
      if (!/^xl\/(sharedStrings\.xml|worksheets\/sheet\d+\.xml)$/.test(nombre)) continue;
      const lnl = dv.getUint16(off + 26, true), lel = dv.getUint16(off + 28, true);
      const datos = u8.subarray(off + 30 + lnl + lel, off + 30 + lnl + lel + csize);
      let bytes;
      if (metodo === 0) bytes = datos;
      else if (metodo === 8) bytes = new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
      else continue;
      archivos[nombre] = td.decode(bytes);
    }
    return archivos;
  }
  const sinXml = (t) => String(t).replace(/<[^>]+>/g, '').replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  const colNum = (ref) => { const l = /^([A-Z]+)/.exec(ref)[1]; let n = 0; for (const c of l) n = n * 26 + (c.charCodeAt(0) - 64); return n - 1; };
  function serieAFecha(n) {
    const d = new Date(Math.round((n - 25569) * 86400000));
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  }
  function itemsDeHoja(xml, compartidas) {
    const unidas = {};
    (xml.match(/<mergeCell\s+ref="[^"]+"/g) || []).forEach((m) => {
      const r = /ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"/.exec(m);
      if (r) unidas[r[1] + r[2]] = colNum(r[3] + '1') - colNum(r[1] + '1');
    });
    const items = [];
    const re = /<c\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g; let m;
    while ((m = re.exec(xml))) {
      const attr = m[1], cuerpo = m[2] || '';
      const ref = /\br="([A-Z]+)(\d+)"/.exec(attr); if (!ref) continue;
      const tipo = (/\bt="([a-zA-Z]+)"/.exec(attr) || [])[1];
      let texto = '';
      if (tipo === 's') { const v = /<v>(\d+)<\/v>/.exec(cuerpo); texto = v ? compartidas[+v[1]] : ''; }
      else if (tipo === 'inlineStr') texto = sinXml((/<is>([\s\S]*?)<\/is>/.exec(cuerpo) || [])[1] || '');
      else { const v = /<v>([^<]*)<\/v>/.exec(cuerpo); texto = v ? sinXml(v[1]) : ''; if (tipo !== 'str' && /^\d+(\.\d+)?$/.test(texto)) { const n = Number(texto); if (n >= 40000 && n <= 70000) texto = serieAFecha(n); } }
      texto = limpiar(texto); if (!texto) continue;
      items.push({ s: texto, x: colNum(ref[1] + '1'), y: Number(ref[2]), w: unidas[ref[1] + ref[2]] || 0 });
    }
    return items;
  }
  async function leerXlsx(buffer) {
    const a = await descomprimir(buffer);
    const compartidas = [];
    (a['xl/sharedStrings.xml'] || '').replace(/<si>([\s\S]*?)<\/si>/g, (_, s) => { compartidas.push(sinXml((s.match(/<t[^>]*>[\s\S]*?<\/t>/g) || []).join(''))); return ''; });
    const hojas = Object.keys(a).filter((k) => /worksheets\//.test(k)).sort();
    const dias = []; let avisos = [];
    hojas.forEach((h) => { const r = leerItems(itemsDeHoja(a[h], compartidas), { tolBanda: 0.5, tolX: 0.5, tolLinea: 0.5 }); dias.push.apply(dias, r.dias); avisos = avisos.concat(r.avisos); });
    dias.sort((p, q) => p.fecha.localeCompare(q.fecha));
    return { dias, avisos: avisos.concat(revisar(dias)), paginas: hojas.length };
  }

  const api = { leerItems, leerPdf, leerXlsx, agruparMeses, nombreMes, MESES };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.NSD_MENU_LECTOR = api;
})(typeof window !== 'undefined' ? window : globalThis);
