// Prepara las cuentas del panel para el profesorado, a partir de las listas
// de assets/js/departamentos-datos.js.
//
//   node scripts/cuentas-profesorado.mjs [carpeta-de-salida]
//
// Genera, FUERA del repositorio (por defecto ../../_privado):
//   · alta-profesorado.sql      → pegar en Supabase › SQL Editor › Run
//   · credenciales-profesorado.csv
//   · credenciales-profesorado.html (una tarjeta por persona, para imprimir)
// Llevan contraseñas: no se suben a git ni se envían por WhatsApp en grupo.
//
// Requiere haber ejecutado antes supabase/10_cuentas_profesorado.sql.
// Cada persona entra con su correo provisional y su contraseña provisional;
// el panel le obliga a cambiar la contraseña y le deja cambiar el correo.
// Si una cuenta ya existe, el SQL no toca su contraseña: solo añade permisos.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = path.resolve(process.argv[2] || path.join(RAIZ, '..', '..', '_privado'));
const { DEPARTAMENTOS } = createRequire(import.meta.url)(path.join(RAIZ, 'assets/js/departamentos-datos.js'));
const DOMINIO = 'colegionsdolores.es';

const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const limpio = (s) => sinTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, '');

// «Nombre Apellido1 Apellido2» (con «del», «de la»...): el nombre es lo que
// queda delante de los dos últimos apellidos.
function partes(nombre) {
  const t = nombre.replace(/\s+/g, ' ').trim().split(' ');
  const ap = [];
  let i = t.length - 1, cuenta = 0;
  while (i > 0 && cuenta < 2) {
    let trozo = [t[i]]; i--;
    while (i > 0 && PARTICULAS.has(t[i].toLowerCase())) { trozo.unshift(t[i]); i--; }
    ap.unshift(trozo.join(' ')); cuenta++;
  }
  return { nombre: t.slice(0, i + 1).join(' '), apellidos: ap };
}
function correoDe(nombre) {
  const { nombre: n, apellidos } = partes(nombre);
  const t = n.split(' ');
  // «M.ª Carmen» → mcarmen; el resto, solo el primer nombre
  const pila = /^M\.?ª?$/.test(t[0]) || t[0] === 'M.ª' ? 'm' + limpio(t[1] || '') : limpio(t[0]);
  const ap = limpio(apellidos[0].split(' ').filter((x) => !PARTICULAS.has(x.toLowerCase())).join(''));
  return `${pila}.${ap}@${DOMINIO}`;
}
const LETRAS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const trozo = (n) => Array.from(crypto.randomBytes(n), (b) => LETRAS[b % LETRAS.length]).join('');
const clave = () => `Nsd-${trozo(4)}-${trozo(4)}`;

// ── Quién va a cada ámbito ─────────────────────────────────────────────
const personas = new Map(); // nombre -> { ambitos:Set, cargos:[] }
const alta = (nombre, ambito, cargo) => {
  nombre = nombre.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  if (!personas.has(nombre)) personas.set(nombre, { ambitos: new Set(), cargos: [] });
  const p = personas.get(nombre);
  p.ambitos.add(ambito);
  if (cargo && /coordinador|coordinadora|jef[ea]|orientador|pedagog|audici/i.test(cargo)) p.cargos.push(cargo);
};
for (const d of DEPARTAMENTOS) {
  for (const linea of (d.defecto && d.defecto.profesorado) || []) {
    if (d.id === 'dep-bilinguismo') {
      const [etapa, resto] = linea.split(' · ');
      if (/auxiliar/i.test(etapa)) continue; // los auxiliares no publican programaciones
      const nombre = resto.replace(/\s*\(.*?\)/, '');
      const coord = /\(coordinador/i.test(resto);
      if (etapa === 'Primaria') alta(nombre, 'etapa-primaria');
      if (etapa === 'Infantil') alta(nombre, 'etapa-infantil');
      if (coord) alta(nombre, 'dep-bilinguismo', `coordinación bilingüe de ${etapa}`);
      continue;
    }
    const [nombre, cargo] = linea.split(' · ');
    alta(nombre, d.id, cargo ? `${cargo}${/jef[ea] del departamento/.test(cargo) ? ` (${d.corto || d.nombre})` : ''}` : '');
  }
}

const filas = [...personas.entries()].map(([nombre, p]) => ({
  nombre, correo: correoDe(nombre), clave: clave(),
  cargo: p.cargos.length ? p.cargos.join(', ').replace(/^./, (c) => c.toUpperCase()) : 'Profesorado',
  ambitos: [...p.ambitos].sort()
})).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const repes = filas.map((f) => f.correo).filter((c, i, a) => a.indexOf(c) !== i);
if (repes.length) { console.error('Correos repetidos:', repes); process.exit(1); }

const nombreAmbito = Object.fromEntries(DEPARTAMENTOS.map((d) => [d.id, d.nombre]));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

// ── SQL ───────────────────────────────────────────────────────────────
let sql = `-- Alta del profesorado en el panel (${new Date().toISOString().slice(0, 10)})
-- Pegar entero en Supabase › SQL Editor › Run. Requiere 10_cuentas_profesorado.sql.
-- Lleva contraseñas provisionales: borrar este archivo cuando se hayan repartido.
begin;
create temporary table _alta (correo text, clave text, nombre text, cargo text, ambitos text[]) on commit drop;
insert into _alta values
${filas.map((f) => `  (${q(f.correo)}, ${q(f.clave)}, ${q(f.nombre)}, ${q(f.cargo)}, array[${f.ambitos.map(q).join(', ')}])`).join(',\n')};

create temporary table _resultado (correo text, nombre text, estado text) on commit drop;

do $$
declare r record; v_id uuid; v_nueva boolean;
begin
  for r in select * from _alta loop
    select id into v_id from auth.users where lower(email) = r.correo;
    v_nueva := v_id is null;
    if v_nueva then
      v_id := gen_random_uuid();
      insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, reauthentication_token)
      values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', r.correo,
        extensions.crypt(r.clave, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('nombre', r.nombre, 'cargo', r.cargo), now(), now(), '', '', '', '', '', '');
      insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), v_id::text, v_id,
        jsonb_build_object('sub', v_id::text, 'email', r.correo, 'email_verified', true), 'email', now(), now(), now());
    end if;
    -- Aprobada al momento (así no salta el límite de 30 solicitudes por hora)
    update public.perfiles
       set estado = 'aprobado',
           rol = case when rol in ('admin', 'directiva') then rol else 'editor' end,
           nombre = case when v_nueva then r.nombre else nombre end,
           cargo = coalesce(cargo, r.cargo),
           revisado_en = now(),
           clave_provisional = case when v_nueva then true else clave_provisional end
     where id = v_id;
    insert into public.permisos (perfil_id, ambito_id)
    select v_id, a from unnest(r.ambitos) a where exists (select 1 from public.ambitos where id = a)
    on conflict do nothing;
    insert into _resultado values (r.correo, r.nombre, case when v_nueva then 'creada' else 'ya existía: solo permisos' end);
  end loop;
end $$;

select * from _resultado order by nombre;
commit;
`;

// ── CSV y tarjetas ─────────────────────────────────────────────────────
const csvq = (s) => `"${String(s).replace(/"/g, '""')}"`;
const csv = ['Nombre;Correo provisional;Contraseña provisional;Puede editar']
  .concat(filas.map((f) => [f.nombre, f.correo, f.clave, f.ambitos.map((a) => nombreAmbito[a] || a).join(', ')].map(csvq).join(';')))
  .join('\r\n');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accesos del profesorado · Panel de la web</title>
<style>
  :root { --tinta:#14231a; --verde:#0b3a18; --gris:#5a6b60; --borde:#cfd8d2; }
  body { font: 15px/1.5 system-ui, sans-serif; color: var(--tinta); margin: 24px; background: #fff; }
  h1 { font-size: 1.3rem; margin: 0 0 4px; } .nota { color: var(--gris); margin: 0 0 20px; max-width: 70ch; }
  .rejilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  .tarjeta { border: 1px dashed var(--borde); border-radius: 10px; padding: 14px 16px; break-inside: avoid; }
  .tarjeta h2 { font-size: 1.02rem; margin: 0 0 8px; color: var(--verde); }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 3px 10px; margin: 0 0 8px; }
  dt { color: var(--gris); } dd { margin: 0; font-family: ui-monospace, monospace; word-break: break-all; }
  ol { margin: 6px 0 0; padding-left: 1.1rem; color: var(--gris); font-size: .88rem; }
  @media print { body { margin: 10mm; } .nota { display: none; } }
</style></head><body>
<h1>Accesos al panel de la web · profesorado</h1>
<p class="nota">Una tarjeta por persona: recortar y entregar en mano. La contraseña es provisional; el panel pide cambiarla la primera vez. Cada uno puede poner después su propio correo en «Mi cuenta». Borrar este archivo cuando estén repartidas.</p>
<div class="rejilla">
${filas.map((f) => `<section class="tarjeta"><h2>${esc(f.nombre)}</h2><dl>
<dt>Entrar en</dt><dd>colegionsdolores.es/acceso</dd>
<dt>Correo</dt><dd>${esc(f.correo)}</dd>
<dt>Contraseña</dt><dd>${esc(f.clave)}</dd>
<dt>Puede editar</dt><dd style="font-family:inherit">${esc(f.ambitos.map((a) => nombreAmbito[a] || a).join(', '))}</dd></dl>
<ol><li>Entra con estos datos.</li><li>Cambia la contraseña (te lo pide al entrar).</li><li>Si quieres, en «Mi cuenta» cambia el correo por el tuyo.</li><li>En «Mis contenidos», abre tu departamento y sube la programación (PDF).</li></ol></section>`).join('\n')}
</div></body></html>`;

fs.mkdirSync(SALIDA, { recursive: true });
fs.writeFileSync(path.join(SALIDA, 'alta-profesorado.sql'), sql);
fs.writeFileSync(path.join(SALIDA, 'credenciales-profesorado.csv'), '﻿' + csv);
fs.writeFileSync(path.join(SALIDA, 'credenciales-profesorado.html'), html);
console.log(`${filas.length} cuentas → ${SALIDA}`);
for (const f of filas) console.log(`  ${f.nombre.padEnd(34)} ${f.correo.padEnd(44)} ${f.ambitos.join(',')}`);
