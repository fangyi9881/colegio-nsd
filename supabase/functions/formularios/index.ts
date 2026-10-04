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

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
};

const responder = (cuerpo: unknown, estado = 200, cache = 'no-store') =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!FORMULARIOS.has(id)) return responder({ error: 'formulario no permitido' }, 404);

  let r: Response;
  try {
    r = await fetch(`https://docs.google.com/forms/d/e/${id}/viewform?hl=es`, { redirect: 'manual' });
  } catch {
    return responder({ error: 'Google no responde' }, 502);
  }
  // Un formulario que obliga a iniciar sesión redirige a accounts.google.com.
  if (r.status >= 300 && r.status < 400) return responder({ login: true }, 200, 'public, max-age=300');
  if (!r.ok) return responder({ error: 'Google respondió ' + r.status }, 502);

  const html = await r.text();
  const m = html.match(/FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);<\/script>/);
  if (!m) return responder({ error: 'no se encontró la estructura del formulario' }, 502);
  let d;
  try { d = JSON.parse(m[1]); } catch { return responder({ error: 'estructura ilegible' }, 502); }

  const f = d[1] || [];
  return responder({
    t: f[8] ?? '', ds: f[0] ?? '', e: f[10] ?? [],
    p: (f[1] ?? []).map((q: unknown[]) => q.slice(0, 5)),
  }, 200, 'public, max-age=120, s-maxage=120');
});
