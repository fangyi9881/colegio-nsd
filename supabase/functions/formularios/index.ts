// Supabase Edge Function «formularios».
// Devuelve la estructura actual de un Google Form de secretaría para que la
// web lo pinte siempre igual que está en Google (ver assets/js/formularios-google.js).
//
// Despliegue: Supabase → Edge Functions → Deploy a new function → «Via Editor»,
// nombre «formularios», pegar este archivo y Deploy. Después, en los ajustes de
// la función, DESACTIVAR «Verify JWT» (Enforce JWT verification): es una lectura
// pública y las claves nuevas de Supabase (sb_publishable_…) no son JWT.
//
// Solo responde para los formularios de la lista (no es un proxy abierto).
// Para añadir uno: su ID (lo que va entre /d/e/ y /viewform) en FORMULARIOS,
// o en la variable de entorno FORMULARIOS_EXTRA separados por comas.

const FORMULARIOS = new Set([
  '1FAIpQLSfWPC4Ge-xvPgfLqojVjP08qJqZYSjzkaMzdnScrYpjljpsGg', // Altas y bajas de actividades y servicios
  '1FAIpQLSeX5Lw-aM5uNq36RXF_Q_XDuh7KolfETyuz8J7RSojSGT-8oA', // Ofertas de extraescolares
  '1FAIpQLSd3Lr1lkpFm5QrnctvyeAMuuCnIszPjEWmRegdjmIE5G-OtoQ', // Actualización de datos
  '1FAIpQLSfdNrd0MEjwujgE07oi9MPiQRE4XVnxjsWl2tu996PWgpcvrQ', // Certificados
  '1FAIpQLSfYr2MMEZ-Tz2NysefFTaerJYeAh5HF0MVXxRP08qIIUEDkGQ', // Recogida de títulos
  ...(Deno.env.get('FORMULARIOS_EXTRA') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
]);

// Solo las webs del colegio (y pruebas en local) pueden pedirlo desde el
// navegador. No es un secreto, pero así nadie lo usa de proxy gratis.
const ORIGENES = new Set([
  'https://colegio-nsd.vercel.app', 'https://www.colegionsdolores.es', 'https://colegionsdolores.es',
  ...(Deno.env.get('ORIGENES_EXTRA') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
]);
const cors = (origen: string | null) => ({
  'Access-Control-Allow-Origin': origen && (ORIGENES.has(origen) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen)) ? origen : 'https://colegio-nsd.vercel.app',
  'Vary': 'Origin',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
});

// ── Caché en memoria (stale-while-revalidate) ──
// Antes, cada visita a un formulario era una petición a Google. Ahora:
//  · < 2 min: se responde con lo guardado;
//  · < 1 h:   se responde con lo guardado y se renueva por detrás;
//  · si Google falla, se sirve lo último que se tuvo (hasta 1 día).
// Varias peticiones a la vez del mismo formulario comparten una sola
// llamada a Google.
type Entrada = { t: number; cuerpo: unknown; estado: number };
const CACHE = new Map<string, Entrada>();
const EN_VUELO = new Map<string, Promise<Entrada>>();
const FRESCO = 120_000, SERVIBLE = 3_600_000, ULTIMO_RECURSO = 86_400_000;

async function deGoogle(id: string): Promise<Entrada> {
  const t = Date.now();
  let r: Response;
  try {
    r = await fetch(`https://docs.google.com/forms/d/e/${id}/viewform?hl=es`, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
  } catch {
    return { t, estado: 502, cuerpo: { error: 'Google no responde' } };
  }
  // Un formulario que obliga a iniciar sesión redirige a accounts.google.com.
  if (r.status >= 300 && r.status < 400) return { t, estado: 200, cuerpo: { login: true } };
  if (!r.ok) return { t, estado: 502, cuerpo: { error: 'Google respondió ' + r.status } };
  const html = await r.text();
  const m = html.match(/FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/);
  if (!m) return { t, estado: 502, cuerpo: { error: 'no se encontró la estructura del formulario' } };
  let d;
  try { d = JSON.parse(m[1]); } catch { return { t, estado: 502, cuerpo: { error: 'estructura ilegible' } }; }
  const f = d[1] || [];
  return { t, estado: 200, cuerpo: { t: f[8] ?? '', ds: f[0] ?? '', e: f[10] ?? [], p: (f[1] ?? []).map((q: unknown[]) => q.slice(0, 5)) } };
}

function renovar(id: string): Promise<Entrada> {
  let p = EN_VUELO.get(id);
  if (!p) {
    p = deGoogle(id).then((e) => {
      const viejo = CACHE.get(id);
      // Un fallo no pisa una copia buena todavía usable.
      if (e.estado === 200 || !viejo || Date.now() - viejo.t > ULTIMO_RECURSO) CACHE.set(id, e);
      return e.estado === 200 || !viejo ? e : viejo;
    }).finally(() => EN_VUELO.delete(id));
    EN_VUELO.set(id, p);
  }
  return p;
}

Deno.serve(async (req) => {
  const CORS = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'GET') return new Response(null, { status: 405, headers: CORS });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  const responder = (cuerpo: unknown, estado: number, cache: string) =>
    new Response(JSON.stringify(cuerpo), {
      status: estado,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
    });
  if (!FORMULARIOS.has(id)) return responder({ error: 'formulario no permitido' }, 404, 'public, max-age=3600');

  const guardado = CACHE.get(id);
  const edad = guardado ? Date.now() - guardado.t : Infinity;
  let e: Entrada;
  if (guardado && edad < FRESCO) e = guardado;
  else if (guardado && edad < SERVIBLE && guardado.estado === 200) {
    const p = renovar(id);
    // @ts-ignore: EdgeRuntime existe en Supabase
    if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(p);
    e = guardado;
  } else e = await renovar(id);

  return e.estado === 200
    ? responder(e.cuerpo, 200, 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')
    : responder(e.cuerpo, e.estado, 'no-store');
});
