-- =====================================================================
-- 06 · Rendimiento y blindaje
-- ---------------------------------------------------------------------
-- Se ejecuta UNA vez, después de 01-05, en Supabase → SQL Editor.
-- Se puede volver a ejecutar sin romper nada.
--
-- Qué arregla:
--  1. Políticas de RLS que llamaban a funciones FILA A FILA. Con 200.000
--     filas de historial, un profesor tardaba 67 s en abrir «Historial»
--     (Supabase corta a los 8 s). Ahora cada política calcula una sola vez
--     «qué ámbitos puedo editar» y compara contra esa lista: 67 s → ms.
--  2. Índices que faltaban (entradas por ficha, claves ajenas).
--  3. Lo público, columna a columna: ni el id de quien escribió una
--     entrada ni el de quien editó un contenido salen a la web.
--  4. Los buckets públicos ya no se pueden LISTAR sin sesión (cada archivo
--     se sigue abriendo con su enlace; lo que no se puede es enumerarlos).
--  5. Límite de envíos en el canal interno y de solicitudes de cuenta,
--     para que nadie lo llene de basura con un script.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Listas de ámbitos, calculadas una vez por consulta
-- ---------------------------------------------------------------------

-- Ámbitos cuyo contenido puede editar quien consulta (misma regla que
-- puede_editar(): la dirección todo menos lo especial; el resto, los
-- suyos, y solo con la cuenta aprobada).
create or replace function public.ambitos_editables()
returns setof text language sql stable security definer set search_path = public as $$
  select a.id from public.ambitos a
   where a.tipo <> 'especial'
     and (public.es_directiva()
          or (public.es_aprobado() and exists (
                select 1 from public.permisos p where p.perfil_id = auth.uid() and p.ambito_id = a.id)))
$$;

-- Ámbitos sobre los que tiene permiso explícito (para el historial).
create or replace function public.mis_ambitos()
returns setof text language sql stable security definer set search_path = public as $$
  select p.ambito_id from public.permisos p
   where p.perfil_id = auth.uid() and public.es_aprobado()
$$;

-- Fichas cuyas fotos puede tocar quien consulta.
create or replace function public.fichas_editables()
returns setof text language sql stable security definer set search_path = public as $$
  select f.slug from public.fichas f
   where public.es_directiva() or (public.es_aprobado() and f.perfil_id = auth.uid())
$$;

revoke execute on function public.ambitos_editables(), public.mis_ambitos(), public.fichas_editables() from public, anon;
grant execute on function public.ambitos_editables(), public.mis_ambitos(), public.fichas_editables() to authenticated;

-- ---------------------------------------------------------------------
-- 2. Políticas reescritas: «(select …)» hace que Postgres lo evalúe una
--    vez (InitPlan) en vez de una vez por fila.
-- ---------------------------------------------------------------------

drop policy if exists ambitos_admin on public.ambitos;
create policy ambitos_admin on public.ambitos for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_directiva()));

drop policy if exists permisos_leer on public.permisos;
create policy permisos_leer on public.permisos for select to authenticated
  using (perfil_id = (select auth.uid()) or (select public.es_directiva()));

drop policy if exists contenidos_crear on public.contenidos;
create policy contenidos_crear on public.contenidos for insert to authenticated
  with check (ambito_id in (select public.ambitos_editables()));
drop policy if exists contenidos_cambiar on public.contenidos;
create policy contenidos_cambiar on public.contenidos for update to authenticated
  using (ambito_id in (select public.ambitos_editables()))
  with check (ambito_id in (select public.ambitos_editables()));
drop policy if exists contenidos_borrar on public.contenidos;
create policy contenidos_borrar on public.contenidos for delete to authenticated
  using (ambito_id in (select public.ambitos_editables()));

drop policy if exists historial_leer on public.historial;
create policy historial_leer on public.historial for select to authenticated
  using ((select public.es_directiva()) or ambito_id in (select public.mis_ambitos()));

drop policy if exists canal_gestion_leer on public.canal_comunicaciones;
create policy canal_gestion_leer on public.canal_comunicaciones for select to authenticated
  using ((select public.gestiona_canal()));

drop policy if exists entradas_leer_panel on public.entradas;
create policy entradas_leer_panel on public.entradas for select to authenticated
  using (ambito_id in (select public.ambitos_editables()));
drop policy if exists entradas_crear on public.entradas;
create policy entradas_crear on public.entradas for insert to authenticated
  with check (ambito_id in (select public.ambitos_editables()) and autor = (select auth.uid()));
drop policy if exists entradas_cambiar on public.entradas;
create policy entradas_cambiar on public.entradas for update to authenticated
  using (ambito_id in (select public.ambitos_editables()))
  with check (ambito_id in (select public.ambitos_editables()));
drop policy if exists entradas_borrar on public.entradas;
create policy entradas_borrar on public.entradas for delete to authenticated
  using (ambito_id in (select public.ambitos_editables()));

drop policy if exists fichas_crear on public.fichas;
create policy fichas_crear on public.fichas for insert to authenticated
  with check ((select public.es_directiva()));
drop policy if exists fichas_cambiar on public.fichas;
create policy fichas_cambiar on public.fichas for update to authenticated
  using ((select public.es_directiva()) or ((select public.es_aprobado()) and perfil_id = (select auth.uid())))
  with check ((select public.es_directiva()) or ((select public.es_aprobado()) and perfil_id = (select auth.uid())));
drop policy if exists fichas_borrar on public.fichas;
create policy fichas_borrar on public.fichas for delete to authenticated
  using ((select public.es_admin()));

-- ---------------------------------------------------------------------
-- 3. Archivos: subir/cambiar/borrar con la misma lista; y SIN listado
--    público. Los buckets siguen siendo públicos: cada enlace funciona,
--    pero ya no se puede pedir «dame todos los archivos del bucket».
--    Quien edita sí ve los de sus carpetas.
-- ---------------------------------------------------------------------

drop policy if exists documentos_leer on storage.objects;
create policy documentos_leer on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists documentos_subir on storage.objects;
create policy documentos_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists documentos_cambiar on storage.objects;
create policy documentos_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] in (select public.ambitos_editables()))
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists documentos_borrar on storage.objects;
create policy documentos_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] in (select public.ambitos_editables()));

drop policy if exists imagenes_leer on storage.objects;
create policy imagenes_leer on storage.objects for select to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists imagenes_subir on storage.objects;
create policy imagenes_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists imagenes_cambiar on storage.objects;
create policy imagenes_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] in (select public.ambitos_editables()))
  with check (bucket_id = 'imagenes' and (storage.foldername(name))[1] in (select public.ambitos_editables()));
drop policy if exists imagenes_borrar on storage.objects;
create policy imagenes_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and (storage.foldername(name))[1] in (select public.ambitos_editables()));

drop policy if exists personas_leer on storage.objects;
create policy personas_leer on storage.objects for select to authenticated
  using (bucket_id = 'personas' and (storage.foldername(name))[1] in (select public.fichas_editables()));
drop policy if exists personas_subir on storage.objects;
create policy personas_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'personas' and (storage.foldername(name))[1] in (select public.fichas_editables()));
drop policy if exists personas_cambiar on storage.objects;
create policy personas_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'personas' and (storage.foldername(name))[1] in (select public.fichas_editables()))
  with check (bucket_id = 'personas' and (storage.foldername(name))[1] in (select public.fichas_editables()));
drop policy if exists personas_borrar on storage.objects;
create policy personas_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'personas' and (storage.foldername(name))[1] in (select public.fichas_editables()));

-- ---------------------------------------------------------------------
-- 4. Índices
-- ---------------------------------------------------------------------

-- Portada y blog: «lo publicado, de lo más nuevo a lo más viejo».
create index if not exists entradas_publicas_idx on public.entradas (fecha desc, creado_en desc) where publicado;
-- Blog de un departamento.
create index if not exists entradas_ambito_pub_idx on public.entradas (ambito_id, fecha desc, creado_en desc) where publicado;
-- «Lo que ha escrito» en la ficha de cada persona.
create index if not exists entradas_ficha_idx on public.entradas (ficha, fecha desc) where publicado and ficha is not null;
-- Claves ajenas: sin índice, borrar un perfil recorre tablas enteras.
create index if not exists entradas_autor_idx        on public.entradas (autor);
create index if not exists entradas_actualizado_idx  on public.entradas (actualizado_por);
create index if not exists contenidos_actualizado_idx on public.contenidos (actualizado_por);
create index if not exists perfiles_revisado_idx     on public.perfiles (revisado_por);
create index if not exists perfiles_estado_idx       on public.perfiles (estado, creado_en desc);
create index if not exists permisos_ambito_idx       on public.permisos (ambito_id);
create index if not exists fichas_actualizado_idx    on public.fichas (actualizado_por);

-- ---------------------------------------------------------------------
-- 5. Lo que ve la web pública, columna a columna
-- ---------------------------------------------------------------------

revoke select on public.contenidos from anon;
grant select (ambito_id, clave, valor, actualizado_en) on public.contenidos to anon;

revoke select on public.entradas from anon;
grant select (id, slug, ambito_id, firma, categoria, etiquetas, titulo, resumen, cuerpo, imagen, imagen_alt,
              documento, fecha, publicado, creado_en, actualizado_en, ficha) on public.entradas to anon;

-- ---------------------------------------------------------------------
-- 6. Límites contra el envío masivo
-- ---------------------------------------------------------------------

-- Tabla interna: nadie la lee ni la escribe salvo las funciones.
-- Guarda una huella (no la IP) que cambia cada día y se borra a las 24 h,
-- para que el canal siga siendo anónimo de verdad.
create table if not exists public._limites (
  tipo   text not null,
  huella text not null,
  en     timestamptz not null default now()
);
create index if not exists _limites_idx on public._limites (tipo, huella, en desc);
alter table public._limites enable row level security;
revoke all on public._limites from public, anon, authenticated;

create table if not exists public._secreto (id int primary key default 1 check (id = 1), valor text not null);
alter table public._secreto enable row level security;
revoke all on public._secreto from public, anon, authenticated;
insert into public._secreto (valor) values (replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')) on conflict (id) do nothing;

-- IP de quien llama, tal como la pasa la pasarela de Supabase.
create or replace function public._ip_cliente()
returns text language sql stable set search_path = public as $$
  select nullif(trim(coalesce(
    (nullif(current_setting('request.headers', true), '')::json ->> 'cf-connecting-ip'),
    (nullif(current_setting('request.headers', true), '')::json ->> 'x-real-ip'),
    split_part((nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for'), ',', 1)
  )), '')
$$;

-- Lanza un error si se supera el límite. p_por_ip: envíos por persona en
-- p_ventana; p_total: envíos de todo el mundo en un día.
create or replace function public._limitar(p_tipo text, p_por_ip int, p_ventana interval, p_total int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_ip text := public._ip_cliente();
  v_huella text;
begin
  delete from public._limites where en < now() - interval '1 day';
  if (select count(*) from public._limites where tipo = p_tipo) >= p_total then
    raise exception 'Hay demasiados envíos ahora mismo. Inténtalo dentro de un rato.' using errcode = 'P0001';
  end if;
  if v_ip is not null then
    v_huella := encode(sha256(convert_to(v_ip || current_date::text || (select valor from public._secreto), 'UTF8')), 'hex');
    if (select count(*) from public._limites where tipo = p_tipo and huella = v_huella and en > now() - p_ventana) >= p_por_ip then
      raise exception 'Has enviado varias seguidas. Espera unos minutos y vuelve a intentarlo.' using errcode = 'P0001';
    end if;
  end if;
  insert into public._limites (tipo, huella) values (p_tipo, coalesce(v_huella, '-'));
end $$;

revoke execute on function public._ip_cliente(), public._limitar(text, int, interval, int) from public, anon, authenticated;

-- Canal: 3 envíos cada 10 minutos por persona y 300 al día en total.
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
  perform public._limitar('canal', 3, interval '10 minutes', 300);
  v_codigo := substr(v_crudo, 1, 4) || '-' || substr(v_crudo, 9, 4) || '-' || substr(v_crudo, 17, 4) || '-' || substr(v_crudo, 41, 4);
  insert into public.canal_comunicaciones (codigo_huella, categoria, relato, anonima, nombre, contacto)
  values (public._huella(v_codigo), p_categoria, trim(p_relato), coalesce(p_anonima, true),
          case when coalesce(p_anonima, true) then null else nullif(left(trim(coalesce(p_nombre, '')), 120), '') end,
          case when coalesce(p_anonima, true) then null else nullif(left(trim(coalesce(p_contacto, '')), 200), '') end);
  return v_codigo;
end $$;

-- Consultar con código: 20 intentos cada 10 minutos por persona (el código
-- tiene 64 bits, pero así ni siquiera se puede intentar adivinarlo).
create or replace function public.canal_consultar(p_codigo text)
returns json language plpgsql security definer set search_path = public as $$
begin
  perform public._limitar('consulta', 20, interval '10 minutes', 5000);
  return (select json_build_object('estado', estado, 'creado_en', creado_en, 'acuse_en', acuse_en,
                                   'respuesta', respuesta, 'respondido_en', respondido_en, 'cerrado_en', cerrado_en)
            from public.canal_comunicaciones where codigo_huella = public._huella(p_codigo));
end $$;

revoke execute on function public.canal_enviar(text, text, boolean, text, text), public.canal_consultar(text) from public;
grant execute on function public.canal_enviar(text, text, boolean, text, text), public.canal_consultar(text) to anon, authenticated;

-- Solicitudes de cuenta: si en una hora llegan más de 30, se paran las
-- nuevas (un colegio no recibe 30 altas de personal en una hora).
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ambito text := nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'ambito', '')), 60), '');
begin
  if (select count(*) from public.perfiles where estado = 'pendiente' and creado_en > now() - interval '1 hour') >= 30 then
    raise exception 'Demasiadas solicitudes de cuenta en poco tiempo. Inténtalo más tarde.';
  end if;
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
revoke execute on function public.crear_perfil() from public, anon, authenticated;

analyze public.entradas, public.historial, public.contenidos, public.fichas, public.perfiles, public.permisos;
