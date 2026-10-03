-- =====================================================================
--  Colegio NSD · Panel de edición de la web
--  Esquema de base de datos para Supabase (PostgreSQL 15+)
--
--  Cómo se usa: Supabase → SQL Editor → pegar este archivo entero → Run.
--  Después, 02_ambitos.sql (lista de ámbitos editables).
--  Se puede volver a ejecutar sin romper nada: todo es "if not exists"
--  o "create or replace".
--
--  Modelo de permisos
--  ------------------
--  · Cualquiera puede SOLICITAR una cuenta (registro con correo y
--    contraseña). La cuenta nace "pendiente" y no puede tocar nada.
--  · La dirección (rol directiva) o la administración (rol admin) la
--    revisa en el panel: la aprueba, le da un rol y le asigna los ámbitos
--    que puede editar (por ejemplo, solo su departamento), o la rechaza.
--  · editor     → edita solo los ámbitos que tiene concedidos.
--  · directiva  → edita todo, aprueba cuentas y concede permisos.
--  · admin      → lo mismo que directiva y además nombra a otros admin y
--                 concede la gestión del canal interno de información.
--  · El canal interno (Ley 2/2023) NO lo ve la dirección por defecto:
--    solo quien tenga concedido el ámbito especial "canal-gestion", que
--    únicamente puede conceder un admin.
--
--  Toda la seguridad está en la base de datos (Row Level Security y
--  funciones con comprobaciones). El panel web solo es la interfaz: aunque
--  alguien manipulara el JavaScript, la base de datos no le dejaría.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------

create table if not exists public.ambitos (
  id      text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  nombre  text not null,
  tipo    text not null check (tipo in ('departamento', 'seccion', 'especial')),
  grupo   text,
  esquema text not null default 'seccion',
  orden   int  not null default 0
);

create table if not exists public.perfiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text not null,
  nombre            text not null,
  cargo             text,
  rol               text not null default 'editor' check (rol in ('admin', 'directiva', 'editor')),
  estado            text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado', 'suspendido')),
  ambito_solicitado text references public.ambitos (id) on delete set null,
  motivo            text,
  creado_en         timestamptz not null default now(),
  revisado_por      uuid references public.perfiles (id) on delete set null,
  revisado_en       timestamptz
);

create table if not exists public.permisos (
  perfil_id     uuid not null references public.perfiles (id) on delete cascade,
  ambito_id     text not null references public.ambitos (id) on delete cascade,
  concedido_por uuid references public.perfiles (id) on delete set null,
  concedido_en  timestamptz not null default now(),
  primary key (perfil_id, ambito_id)
);

create table if not exists public.contenidos (
  ambito_id       text not null references public.ambitos (id) on delete cascade,
  clave           text not null check (clave ~ '^[a-z0-9_]{1,60}$'),
  valor           jsonb not null,
  actualizado_por uuid references public.perfiles (id) on delete set null,
  actualizado_en  timestamptz not null default now(),
  primary key (ambito_id, clave),
  -- Ningún campo puede pasar de 200 KB: es texto de una web, no un archivo.
  constraint contenidos_tamano check (octet_length(valor::text) <= 200000)
);

create table if not exists public.historial (
  id             bigint generated always as identity primary key,
  fecha          timestamptz not null default now(),
  autor          uuid,
  autor_email    text,
  accion         text not null,
  ambito_id      text,
  clave          text,
  valor_anterior jsonb,
  valor_nuevo    jsonb,
  detalle        text
);
create index if not exists historial_fecha_idx on public.historial (fecha desc);
create index if not exists historial_ambito_idx on public.historial (ambito_id, clave, fecha desc);

-- Canal interno de información (Ley 2/2023, de protección del informante).
-- El código de seguimiento que recibe quien informa NO se guarda: solo su
-- huella (SHA-256). Ni quien administra la base de datos puede saber qué
-- código tiene cada comunicación.
create table if not exists public.canal_comunicaciones (
  id             uuid primary key default gen_random_uuid(),
  codigo_huella  text not null unique,
  creado_en      timestamptz not null default now(),
  categoria      text not null,
  relato         text not null check (char_length(relato) between 20 and 10000),
  anonima        boolean not null default true,
  nombre         text,
  contacto       text,
  estado         text not null default 'recibida' check (estado in ('recibida', 'acusada', 'en_tramite', 'cerrada')),
  acuse_en       timestamptz,
  respuesta      text,
  respondido_en  timestamptz,
  cerrado_en     timestamptz,
  notas_internas text
);

-- ---------------------------------------------------------------------
-- 2. Funciones auxiliares de permisos (security definer: se ejecutan con
--    los permisos del propietario para poder leer perfiles sin abrir la
--    tabla a todo el mundo, y con search_path fijo).
-- ---------------------------------------------------------------------

create or replace function public.mi_rol()
returns text language sql stable security definer set search_path = public as $$
  select rol from public.perfiles where id = auth.uid() and estado = 'aprobado'
$$;

create or replace function public.es_aprobado()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and estado = 'aprobado')
$$;

create or replace function public.es_directiva()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.mi_rol() in ('admin', 'directiva'), false)
$$;

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.mi_rol() = 'admin', false)
$$;

create or replace function public.tiene_permiso(p_ambito text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_aprobado() and exists (
    select 1 from public.permisos where perfil_id = auth.uid() and ambito_id = p_ambito
  )
$$;

-- ¿Puede editar el contenido de este ámbito? La dirección edita todo menos
-- los ámbitos especiales (canal-gestion no tiene contenido editable).
create or replace function public.puede_editar(p_ambito text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when not exists (select 1 from public.ambitos where id = p_ambito) then false
    when (select tipo from public.ambitos where id = p_ambito) = 'especial' then false
    when public.es_directiva() then true
    else public.tiene_permiso(p_ambito)
  end
$$;

create or replace function public.gestiona_canal()
returns boolean language sql stable security definer set search_path = public as $$
  select public.tiene_permiso('canal-gestion')
$$;

-- ---------------------------------------------------------------------
-- 3. Alta automática del perfil al registrarse (siempre pendiente).
--    Los datos que manda el formulario de solicitud llegan en los
--    metadatos del usuario; se recortan y se validan aquí, y el rol y el
--    estado NUNCA se toman de lo que mande el navegador.
-- ---------------------------------------------------------------------

create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ambito text := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'ambito', '')), 60), '');
begin
  if v_ambito is not null and not exists (select 1 from public.ambitos where id = v_ambito and tipo <> 'especial') then
    v_ambito := null;
  end if;
  insert into public.perfiles (id, email, nombre, cargo, ambito_solicitado, motivo)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'nombre', '')), 120), ''), split_part(new.email, '@', 1)),
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'cargo', '')), 120), ''),
    v_ambito,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'motivo', '')), 500), '')
  )
  on conflict (id) do nothing;
  insert into public.historial (autor, autor_email, accion, detalle)
  values (new.id, lower(new.email), 'solicitud', 'Nueva solicitud de cuenta');
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------------------------------------------------------------------
-- 4. Historial de cambios del contenido (quién cambió qué y cuándo).
--    Permite deshacer desde el panel.
-- ---------------------------------------------------------------------

create or replace function public.registrar_cambio()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_email text := (select email from public.perfiles where id = auth.uid());
begin
  if tg_op = 'DELETE' then
    insert into public.historial (autor, autor_email, accion, ambito_id, clave, valor_anterior)
    values (auth.uid(), v_email, 'borrar', old.ambito_id, old.clave, old.valor);
    return old;
  end if;
  if tg_op = 'UPDATE' and old.valor = new.valor then
    return new;
  end if;
  new.actualizado_por := auth.uid();
  new.actualizado_en := now();
  insert into public.historial (autor, autor_email, accion, ambito_id, clave, valor_anterior, valor_nuevo)
  values (auth.uid(), v_email, lower(tg_op), new.ambito_id, new.clave,
          case when tg_op = 'UPDATE' then old.valor end, new.valor);
  return new;
end $$;

drop trigger if exists contenidos_historial on public.contenidos;
create trigger contenidos_historial
  before insert or update or delete on public.contenidos
  for each row execute function public.registrar_cambio();

-- ---------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------

alter table public.ambitos              enable row level security;
alter table public.perfiles             enable row level security;
alter table public.permisos             enable row level security;
alter table public.contenidos           enable row level security;
alter table public.historial            enable row level security;
alter table public.canal_comunicaciones enable row level security;

-- Ámbitos: los lee cualquiera (el formulario de solicitud los muestra).
-- Solo un admin los crea o cambia.
drop policy if exists ambitos_leer on public.ambitos;
create policy ambitos_leer on public.ambitos for select using (true);
drop policy if exists ambitos_admin on public.ambitos;
create policy ambitos_admin on public.ambitos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Perfiles: cada uno ve el suyo; la dirección ve todos. Nadie los modifica
-- directamente: los cambios van por las funciones de la sección 6.
drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_directiva());

-- Permisos: cada uno ve los suyos; la dirección, todos.
drop policy if exists permisos_leer on public.permisos;
create policy permisos_leer on public.permisos for select to authenticated
  using (perfil_id = auth.uid() or public.es_directiva());

-- Contenidos: la web pública los lee sin iniciar sesión. Escribir solo
-- puede quien tenga permiso sobre ese ámbito.
drop policy if exists contenidos_leer on public.contenidos;
create policy contenidos_leer on public.contenidos for select using (true);
drop policy if exists contenidos_crear on public.contenidos;
create policy contenidos_crear on public.contenidos for insert to authenticated
  with check (public.puede_editar(ambito_id));
drop policy if exists contenidos_cambiar on public.contenidos;
create policy contenidos_cambiar on public.contenidos for update to authenticated
  using (public.puede_editar(ambito_id)) with check (public.puede_editar(ambito_id));
drop policy if exists contenidos_borrar on public.contenidos;
create policy contenidos_borrar on public.contenidos for delete to authenticated
  using (public.puede_editar(ambito_id));

-- Historial: la dirección ve todo; cada editor, el de sus ámbitos.
-- Nadie lo escribe a mano (lo escriben los disparadores).
drop policy if exists historial_leer on public.historial;
create policy historial_leer on public.historial for select to authenticated
  using (public.es_directiva() or (ambito_id is not null and public.tiene_permiso(ambito_id)));

-- Canal: ningún acceso directo. Se envía y se consulta con funciones; solo
-- quien gestiona el canal lo lee.
drop policy if exists canal_gestion_leer on public.canal_comunicaciones;
create policy canal_gestion_leer on public.canal_comunicaciones for select to authenticated
  using (public.gestiona_canal());

-- Privilegios de tabla (RLS filtra filas; esto limita operaciones).
revoke all on public.perfiles, public.permisos, public.historial, public.canal_comunicaciones from anon;
revoke insert, update, delete on public.perfiles, public.permisos, public.historial, public.canal_comunicaciones from authenticated;
revoke insert, update, delete on public.ambitos from anon;
revoke insert, update, delete on public.contenidos from anon;
grant select on public.ambitos, public.contenidos to anon, authenticated;
grant insert, update, delete on public.contenidos to authenticated;
grant insert, update, delete on public.ambitos to authenticated;
grant select on public.perfiles, public.permisos, public.historial, public.canal_comunicaciones to authenticated;

-- ---------------------------------------------------------------------
-- 6. Funciones del panel
-- ---------------------------------------------------------------------

-- Lo que el panel necesita saber de quien ha entrado.
create or replace function public.mi_perfil()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', p.id, 'email', p.email, 'nombre', p.nombre, 'cargo', p.cargo,
    'rol', p.rol, 'estado', p.estado, 'ambito_solicitado', p.ambito_solicitado,
    'ambitos', coalesce((select json_agg(ambito_id order by ambito_id) from public.permisos where perfil_id = p.id), '[]'::json),
    'es_directiva', p.estado = 'aprobado' and p.rol in ('admin', 'directiva'),
    'es_admin', p.estado = 'aprobado' and p.rol = 'admin',
    'gestiona_canal', p.estado = 'aprobado' and exists (select 1 from public.permisos where perfil_id = p.id and ambito_id = 'canal-gestion')
  )
  from public.perfiles p where p.id = auth.uid()
$$;

create or replace function public.actualizar_mi_perfil(p_nombre text, p_cargo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Hay que iniciar sesión'; end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 then raise exception 'El nombre es obligatorio'; end if;
  update public.perfiles
     set nombre = left(trim(p_nombre), 120), cargo = nullif(left(trim(coalesce(p_cargo, '')), 120), '')
   where id = auth.uid();
end $$;

-- Lista de cuentas para la dirección, con si han confirmado el correo y
-- su último acceso (datos que solo están en auth.users).
create or replace function public.listar_usuarios()
returns table (
  id uuid, email text, nombre text, cargo text, rol text, estado text,
  ambito_solicitado text, motivo text, creado_en timestamptz, revisado_en timestamptz,
  revisado_por_email text, email_confirmado boolean, ultimo_acceso timestamptz, ambitos text[]
) language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_directiva() then raise exception 'Solo la dirección puede ver las cuentas'; end if;
  return query
    select p.id, p.email, p.nombre, p.cargo, p.rol, p.estado, p.ambito_solicitado, p.motivo,
           p.creado_en, p.revisado_en, r.email,
           u.email_confirmed_at is not null, u.last_sign_in_at,
           coalesce(array(select pe.ambito_id from public.permisos pe where pe.perfil_id = p.id order by 1), '{}')
      from public.perfiles p
      join auth.users u on u.id = p.id
      left join public.perfiles r on r.id = p.revisado_por
     order by (p.estado = 'pendiente') desc, p.creado_en desc;
end $$;

-- Comprobaciones comunes a todas las acciones de la dirección sobre una cuenta.
create or replace function public._comprobar_gestion(p_id uuid, p_rol_nuevo text default null)
returns public.perfiles language plpgsql security definer set search_path = public as $$
declare
  v public.perfiles;
begin
  if not public.es_directiva() then raise exception 'Solo la dirección puede gestionar cuentas'; end if;
  if p_id = auth.uid() then raise exception 'No puedes cambiar tu propia cuenta desde aquí'; end if;
  select * into v from public.perfiles where id = p_id;
  if not found then raise exception 'La cuenta no existe'; end if;
  if v.rol = 'admin' and not public.es_admin() then raise exception 'Solo un administrador puede cambiar otra cuenta de administración'; end if;
  if p_rol_nuevo is not null then
    if p_rol_nuevo not in ('admin', 'directiva', 'editor') then raise exception 'Rol no válido'; end if;
    if p_rol_nuevo = 'admin' and not public.es_admin() then raise exception 'Solo un administrador puede nombrar a otro'; end if;
  end if;
  return v;
end $$;

create or replace function public._fijar_permisos(p_id uuid, p_ambitos text[])
returns void language plpgsql security definer set search_path = public as $$
declare
  a text;
begin
  if p_ambitos is null then return; end if;
  foreach a in array p_ambitos loop
    if not exists (select 1 from public.ambitos where id = a) then raise exception 'Ámbito desconocido: %', a; end if;
    if a = 'canal-gestion' and not public.es_admin() then raise exception 'Solo un administrador puede dar acceso al canal interno'; end if;
  end loop;
  -- Un admin puede quitar canal-gestion; la dirección no lo toca aunque no lo vea.
  delete from public.permisos
   where perfil_id = p_id and not (ambito_id = any (p_ambitos))
     and (ambito_id <> 'canal-gestion' or public.es_admin());
  insert into public.permisos (perfil_id, ambito_id, concedido_por)
  select p_id, x, auth.uid() from unnest(p_ambitos) as x
  on conflict do nothing;
end $$;

create or replace function public.aprobar_usuario(p_id uuid, p_rol text, p_ambitos text[])
returns void language plpgsql security definer set search_path = public as $$
declare v public.perfiles;
begin
  v := public._comprobar_gestion(p_id, p_rol);
  update public.perfiles set estado = 'aprobado', rol = p_rol, revisado_por = auth.uid(), revisado_en = now() where id = p_id;
  perform public._fijar_permisos(p_id, coalesce(p_ambitos, '{}'));
  insert into public.historial (autor, autor_email, accion, detalle)
  values (auth.uid(), (select email from public.perfiles where id = auth.uid()), 'aprobar',
          format('%s aprobada como %s; ámbitos: %s', v.email, p_rol, coalesce(array_to_string(p_ambitos, ', '), '—')));
end $$;

create or replace function public.rechazar_usuario(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v public.perfiles;
begin
  v := public._comprobar_gestion(p_id);
  update public.perfiles set estado = 'rechazado', revisado_por = auth.uid(), revisado_en = now() where id = p_id;
  delete from public.permisos where perfil_id = p_id;
  insert into public.historial (autor, autor_email, accion, detalle)
  values (auth.uid(), (select email from public.perfiles where id = auth.uid()), 'rechazar', format('%s rechazada', v.email));
end $$;

create or replace function public.cambiar_estado_usuario(p_id uuid, p_estado text)
returns void language plpgsql security definer set search_path = public as $$
declare v public.perfiles;
begin
  if p_estado not in ('aprobado', 'suspendido') then raise exception 'Estado no válido'; end if;
  v := public._comprobar_gestion(p_id);
  if v.estado in ('pendiente', 'rechazado') and p_estado = 'aprobado' then
    raise exception 'Para dar acceso a una solicitud, apruébala con su rol y sus ámbitos';
  end if;
  update public.perfiles set estado = p_estado, revisado_por = auth.uid(), revisado_en = now() where id = p_id;
  insert into public.historial (autor, autor_email, accion, detalle)
  values (auth.uid(), (select email from public.perfiles where id = auth.uid()),
          case p_estado when 'suspendido' then 'suspender' else 'reactivar' end, v.email);
end $$;

create or replace function public.cambiar_rol_usuario(p_id uuid, p_rol text)
returns void language plpgsql security definer set search_path = public as $$
declare v public.perfiles;
begin
  v := public._comprobar_gestion(p_id, p_rol);
  update public.perfiles set rol = p_rol, revisado_por = auth.uid(), revisado_en = now() where id = p_id;
  insert into public.historial (autor, autor_email, accion, detalle)
  values (auth.uid(), (select email from public.perfiles where id = auth.uid()), 'cambiar rol', format('%s → %s', v.email, p_rol));
end $$;

create or replace function public.fijar_permisos_usuario(p_id uuid, p_ambitos text[])
returns void language plpgsql security definer set search_path = public as $$
declare v public.perfiles;
begin
  v := public._comprobar_gestion(p_id);
  perform public._fijar_permisos(p_id, coalesce(p_ambitos, '{}'));
  insert into public.historial (autor, autor_email, accion, detalle)
  values (auth.uid(), (select email from public.perfiles where id = auth.uid()), 'permisos',
          format('%s: %s', v.email, coalesce(nullif(array_to_string(p_ambitos, ', '), ''), 'sin ámbitos')));
end $$;

-- ---------------------------------------------------------------------
-- 7. Canal interno de información
-- ---------------------------------------------------------------------

create or replace function public._huella(p_codigo text)
returns text language sql immutable set search_path = public as $$
  select encode(sha256(convert_to(upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex')
$$;

-- Envía una comunicación. Devuelve el código de seguimiento, que solo ve
-- quien la envía.
create or replace function public.canal_enviar(
  p_categoria text, p_relato text, p_anonima boolean, p_nombre text default null, p_contacto text default null
) returns text language plpgsql security definer set search_path = public as $$
declare
  v_crudo text := upper(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''));
  v_codigo text;
begin
  if char_length(trim(coalesce(p_relato, ''))) < 20 then raise exception 'Describe los hechos con algo más de detalle (mínimo 20 caracteres)'; end if;
  if char_length(p_relato) > 10000 then raise exception 'El texto es demasiado largo (máximo 10.000 caracteres)'; end if;
  if p_categoria is null or p_categoria not in ('laboral', 'proteccion-datos', 'fraude-economico', 'seguridad-salud', 'acoso', 'otra') then
    raise exception 'Elige una categoría';
  end if;
  v_codigo := substr(v_crudo, 1, 4) || '-' || substr(v_crudo, 9, 4) || '-' || substr(v_crudo, 17, 4) || '-' || substr(v_crudo, 41, 4);
  insert into public.canal_comunicaciones (codigo_huella, categoria, relato, anonima, nombre, contacto)
  values (public._huella(v_codigo), p_categoria, trim(p_relato), coalesce(p_anonima, true),
          case when coalesce(p_anonima, true) then null else nullif(left(trim(coalesce(p_nombre, '')), 120), '') end,
          case when coalesce(p_anonima, true) then null else nullif(left(trim(coalesce(p_contacto, '')), 200), '') end);
  return v_codigo;
end $$;

-- Consulta el estado con el código. No devuelve el relato.
create or replace function public.canal_consultar(p_codigo text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('estado', estado, 'creado_en', creado_en, 'acuse_en', acuse_en,
                           'respuesta', respuesta, 'respondido_en', respondido_en, 'cerrado_en', cerrado_en)
    from public.canal_comunicaciones where codigo_huella = public._huella(p_codigo)
$$;

create or replace function public.canal_actualizar(p_id uuid, p_estado text, p_respuesta text, p_notas text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.gestiona_canal() then raise exception 'No tienes acceso al canal interno'; end if;
  if p_estado not in ('recibida', 'acusada', 'en_tramite', 'cerrada') then raise exception 'Estado no válido'; end if;
  update public.canal_comunicaciones set
    estado = p_estado,
    acuse_en = case when p_estado <> 'recibida' and acuse_en is null then now() else acuse_en end,
    respuesta = nullif(trim(coalesce(p_respuesta, '')), ''),
    respondido_en = case when nullif(trim(coalesce(p_respuesta, '')), '') is distinct from respuesta then now() else respondido_en end,
    cerrado_en = case when p_estado = 'cerrada' and cerrado_en is null then now() when p_estado <> 'cerrada' then null else cerrado_en end,
    notas_internas = nullif(trim(coalesce(p_notas, '')), '')
  where id = p_id;
  if not found then raise exception 'La comunicación no existe'; end if;
end $$;

-- ---------------------------------------------------------------------
-- 8. Quién puede ejecutar cada función
-- ---------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon;
grant execute on function public.canal_enviar(text, text, boolean, text, text) to anon, authenticated;
grant execute on function public.canal_consultar(text) to anon, authenticated;
grant execute on function public.mi_perfil(), public.actualizar_mi_perfil(text, text), public.listar_usuarios(),
  public.aprobar_usuario(uuid, text, text[]), public.rechazar_usuario(uuid), public.cambiar_estado_usuario(uuid, text),
  public.cambiar_rol_usuario(uuid, text), public.fijar_permisos_usuario(uuid, text[]), public.canal_actualizar(uuid, text, text, text)
  to authenticated;
-- Las auxiliares las usan las políticas de RLS, que se evalúan con el rol
-- de quien consulta: tienen que poder ejecutarse.
grant execute on function public.mi_rol(), public.es_aprobado(), public.es_directiva(), public.es_admin(),
  public.tiene_permiso(text), public.puede_editar(text), public.gestiona_canal()
  to anon, authenticated;
revoke execute on function public._comprobar_gestion(uuid, text), public._fijar_permisos(uuid, text[]),
  public.crear_perfil(), public.registrar_cambio() from anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. Archivos (PDF de programaciones, documentos de cada ámbito)
--    Carpeta = id del ámbito. Solo PDF, 10 MB como máximo.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', true, 10485760, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

drop policy if exists documentos_leer on storage.objects;
create policy documentos_leer on storage.objects for select
  using (bucket_id = 'documentos');
drop policy if exists documentos_subir on storage.objects;
create policy documentos_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and public.puede_editar((storage.foldername(name))[1]));
drop policy if exists documentos_cambiar on storage.objects;
create policy documentos_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'documentos' and public.puede_editar((storage.foldername(name))[1]))
  with check (bucket_id = 'documentos' and public.puede_editar((storage.foldername(name))[1]));
drop policy if exists documentos_borrar on storage.objects;
create policy documentos_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'documentos' and public.puede_editar((storage.foldername(name))[1]));

-- ---------------------------------------------------------------------
-- 10. Nombrar la primera cuenta de administración
--     (se ejecuta UNA vez, a mano, después de registrarse en /acceso):
--
--     update public.perfiles set rol = 'admin', estado = 'aprobado', revisado_en = now()
--      where email = 'CORREO-DE-LA-CUENTA-ADMIN';
-- ---------------------------------------------------------------------
