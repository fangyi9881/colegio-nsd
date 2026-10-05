// Tráfico simulado del Colegio NSD contra la réplica local (PostgREST + Postgres
// con 5 años de datos). NUNCA contra el Supabase real.
//   MODO=antes   → cada página repite sus lecturas (web sin caché)
//   MODO=despues → caché del navegador: cada lectura, una vez por visita
//   datos.json: ámbitos, fichas, slugs y tokens de prueba firmados con el
//   secreto de la réplica local (no se sube al repositorio).
import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

const API = __ENV.API || 'http://127.0.0.1:54323';
const MODO = __ENV.MODO || 'despues';
const PRISA = Number(__ENV.PRISA || 1); // divide las pausas para comprimir el tiempo
const D = JSON.parse(open('./datos.json'));
const DEPS = D.ambitos.filter((a) => a.startsWith('dep-'));

const tPublica = new Trend('lectura_publica', true);
const tPanel = new Trend('panel', true);
const tGuardar = new Trend('guardar', true);
const peticiones = new Counter('peticiones_api');
const frenados = new Counter('canal_frenados');
const errores = new Rate('errores');

const SELECT_ENTRADAS = 'slug,titulo,resumen,categoria,etiquetas,imagen,imagen_alt,documento,fecha,firma,ambito_id';
const R = {
  noticias: () => `entradas?select=${SELECT_ENTRADAS}&order=fecha.desc,creado_en.desc&limit=60`,
  portada: () => 'contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(noticias)',
  dep: (d) => `contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(${d})`,
  blogDep: (d) => `entradas?select=${SELECT_ENTRADAS}&ambito_id=eq.${d}&order=fecha.desc,creado_en.desc&limit=60`,
  fichas: () => 'fichas?select=slug,nombre,foto,frase,bio,formacion,desde,correo&limit=1000',
  organigrama: () => `contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(${DEPS.join(',')})`,
  secretaria: () => 'contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(secretaria)',
  entrada: (s) => `entradas?select=${SELECT_ENTRADAS},cuerpo&slug=eq.${s}&limit=1`,
  deFicha: (f) => `entradas?select=slug,titulo,fecha&ficha=eq.${f}&order=fecha.desc&limit=4`,
};
// Qué pide cada página (lo medido con el navegador)
const PAGINAS = {
  portada: () => [R.noticias(), R.portada()],
  blog: () => [R.noticias(), R.portada()],
  departamento: () => { const d = pick(DEPS); return [R.dep(d), R.blogDep(d), R.fichas()]; },
  organigrama: () => [R.organigrama(), R.fichas()],
  familias: () => [R.secretaria()],
  entrada: () => [R.entrada(pick(D.slugs)), R.fichas()],
  persona: () => { const f = pick(D.fichas); return [R.fichas(), R.deFicha(f)]; },
  estatica: () => [],
};
const RECORRIDOS = [
  ['portada', 'blog', 'entrada', 'portada'],
  ['portada', 'familias', 'estatica', 'familias'],
  ['portada', 'organigrama', 'persona', 'departamento', 'organigrama'],
  ['departamento', 'departamento', 'departamento', 'persona'],
  ['portada', 'estatica', 'estatica', 'familias', 'blog', 'entrada'],
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const anon = { headers: { 'Accept': 'application/json' }, tags: { tipo: 'publica' } };

const SANO = Number(__ENV.SANO || 2), PICO = Number(__ENV.PICO || 15), ESTRES = Number(__ENV.ESTRES || 40);
export const options = {
  discardResponseBodies: true,
  scenarios: {
    familias: {
      executor: 'ramping-arrival-rate', exec: 'familia', timeUnit: '1s', startRate: SANO,
      preAllocatedVUs: 1200, maxVUs: 4000,
      stages: [
        { target: SANO, duration: '45s' },   // día normal
        { target: PICO, duration: '15s' },   // llega la circular a todas las familias
        { target: PICO, duration: '60s' },
        { target: ESTRES, duration: '15s' }, // estrés: el doble y pico de lo creíble
        { target: ESTRES, duration: '45s' },
        { target: 0, duration: '10s' },
      ],
    },
    profesorado: { executor: 'constant-vus', exec: 'profe', vus: 15, duration: '190s' },
    abuso_canal: { executor: 'constant-arrival-rate', exec: 'atacante', rate: 10, timeUnit: '1s', duration: '60s', startTime: '60s', preAllocatedVUs: 20 },
  },
  thresholds: {
    'lectura_publica': ['p(95)<800'],
    'panel': ['p(95)<1500'],
    'errores': ['rate<0.01'],
  },
};

function leer(url, cache) {
  if (cache) { if (cache.has(url)) return; cache.add(url); }
  const r = http.get(`${API}/${url}`, anon);
  peticiones.add(1); tPublica.add(r.timings.duration);
  errores.add(r.status !== 200);
}

export function familia() {
  const cache = MODO === 'despues' ? new Set() : null;
  for (const p of pick(RECORRIDOS)) {
    for (const u of PAGINAS[p]()) leer(u, cache);
    sleep((3 + Math.random() * 12) / PRISA); // leer la página
  }
}

export function profe() {
  const e = D.editores[(__VU - 1) % D.editores.length];
  const h = { headers: { Authorization: `Bearer ${e.token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }, tags: { tipo: 'panel' } };
  const g = (u) => { const r = http.get(`${API}/${u}`, Object.assign({ responseType: 'text' }, h)); peticiones.add(1); tPanel.add(r.timings.duration); errores.add(r.status !== 200); return r; };
  const mios = g('permisos?select=ambito_id');
  const lista = (mios.json() || []).map((x) => x.ambito_id).filter((a) => a.startsWith('dep-'));
  g('ambitos?select=id,nombre,tipo,grupo,esquema,orden&order=orden');
  if (lista.length) g(`contenidos?select=ambito_id,clave,valor,actualizado_en&ambito_id=in.(${lista.join(',')})`);
  g('entradas?select=id,slug,ambito_id,titulo,fecha,publicado,actualizado_en&order=fecha.desc&limit=200');
  g('historial?select=id,fecha,autor_email,accion,ambito_id,clave,detalle&order=fecha.desc&limit=100');
  sleep(10 / PRISA);
  if (lista.length) {
    const r = http.post(`${API}/contenidos?on_conflict=ambito_id,clave`, JSON.stringify([{ ambito_id: lista[0], clave: 'campo_1', valor: `Texto revisado ${Date.now()}` }]), h);
    peticiones.add(1); tGuardar.add(r.timings.duration);
    errores.add(!check(r, { 'guardar 2xx': (x) => x.status >= 200 && x.status < 300 }));
  }
  sleep(20 / PRISA);
}

// Un script que intenta llenar el canal interno desde una sola IP.
export function atacante() {
  const r = http.post(`${API}/rpc/canal_enviar`, JSON.stringify({ p_categoria: 'otra', p_relato: 'Spam automático para llenar el canal interno', p_anonima: true }),
    { headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.66' }, tags: { tipo: 'ataque' } });
  if (r.status === 400) frenados.add(1);
}
