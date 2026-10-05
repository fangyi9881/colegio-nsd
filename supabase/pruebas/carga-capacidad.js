// Capacidad: lecturas públicas a ritmo fijo (RPS=…) contra la réplica local.
// NUNCA contra el Supabase real. Necesita datos.json (ver carga-trafico.js).
import http from 'k6/http';
const API = 'http://127.0.0.1:54323';
const D = JSON.parse(open('./datos.json'));
const DEPS = D.ambitos.filter((a) => a.startsWith('dep-'));
const S = 'slug,titulo,resumen,categoria,etiquetas,imagen,imagen_alt,documento,fecha,firma,ambito_id';
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const MIX = [
  () => `entradas?select=${S}&order=fecha.desc,creado_en.desc&limit=60`,
  () => 'contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(noticias)',
  () => `contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(${pick(DEPS)})`,
  () => 'fichas?select=slug,nombre,foto,frase,bio,formacion,desde,correo&limit=1000',
  () => `entradas?select=${S},cuerpo&slug=eq.${pick(D.slugs)}&limit=1`,
  () => `entradas?select=slug,titulo,fecha&ficha=eq.${pick(D.fichas)}&order=fecha.desc&limit=4`,
];
export const options = { discardResponseBodies: true, summaryTrendStats: ['p(50)', 'p(95)', 'p(99)'],
  scenarios: { c: { executor: 'constant-arrival-rate', rate: Number(__ENV.RPS), timeUnit: '1s', duration: '25s', preAllocatedVUs: 300, maxVUs: 1500 } } };
export default function () { http.get(`${API}/${pick(MIX)()}`); }
