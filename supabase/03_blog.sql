-- =====================================================================
--  Colegio NSD · Entradas del blog desde el panel
--  Ejecutar DESPUÉS de 01_esquema.sql y 02_ambitos.sql.
--  Se puede volver a ejecutar sin romper nada.
--
--  Quién publica y cómo se clasifica
--  ---------------------------------
--  · Cualquier cuenta aprobada publica en nombre de un ámbito que pueda
--    editar (su departamento o sección). La entrada lleva su firma.
--  · Categoría y etiquetas:
--      - Dirección (admin, directiva) y quien tenga el ámbito
--        «secretaria» las ELIGEN. Si las dejan vacías, se ponen solas.
--      - El resto NO las elige: la base de datos pone la categoría de su
--        ámbito y las etiquetas de su departamento, más la etapa si el
--        texto la nombra (Infantil, Primaria, ESO).
--    Todo se decide aquí, en la base de datos: aunque alguien manipulara
--    el panel, no podría cambiar la clasificación.
--  · Una entrada con fecha futura no se ve hasta ese día. Sin marcar
--    «publicada» es un borrador: solo la ve quien puede editarla.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Categorías del blog y clasificación de cada ámbito
--    (las categorías son las mismas claves que NSD_CATEGORIAS en
--    assets/js/noticias-datos.js)
-- ---------------------------------------------------------------------

create or replace function public.blog_categorias()
returns text[] language sql immutable set search_path = public as $$
  select array['comunicados', 'familias', 'infantil', 'primaria', 'eso', 'orientacion', 'bilinguismo',
               'cultura', 'deporte', 'salud', 'servicios', 'academia']
$$;

alter table public.ambitos add column if not exists blog_categoria text;
alter table public.ambitos add column if not exists blog_etiquetas text[] not null default '{}';

update public.ambitos a set blog_categoria = v.categoria, blog_etiquetas = v.etiquetas
from (values
  ('etapa-infantil',         'infantil',    array['Infantil']),
  ('etapa-primaria',         'primaria',    array['Primaria']),
  ('dep-matematicas',        'eso',         array['ESO', 'Matemáticas']),
  ('dep-lengua',             'eso',         array['ESO', 'Lengua']),
  ('dep-geografia-historia', 'eso',         array['ESO', 'Geografía e Historia']),
  ('dep-ciencias',           'eso',         array['ESO', 'Ciencias']),
  ('dep-tecnologia',         'eso',         array['ESO', 'Tecnología']),
  ('dep-ingles',             'eso',         array['ESO', 'Inglés']),
  ('dep-frances',            'eso',         array['ESO', 'Francés']),
  ('dep-educacion-fisica',   'eso',         array['ESO', 'Educación Física']),
  ('dep-artistico',          'eso',         array['ESO', 'Música y Plástica']),
  ('dep-religion-valores',   'eso',         array['ESO', 'Religión y Valores']),
  ('dep-diversificacion',    'eso',         array['ESO', 'Diversificación']),
  ('dep-orientacion',        'orientacion', array['Orientación']),
  ('dep-bilinguismo',        'bilinguismo', array['Bilingüismo', 'Inglés']),
  ('noticias',               'comunicados', array[]::text[]),
  ('secretaria',             'comunicados', array['Secretaría']),
  ('formularios',            'familias',    array['Secretaría']),
  ('informacion-familias',   'familias',    array[]::text[]),
  ('evaluacion',             'familias',    array['Evaluación']),
  ('legal',                  'comunicados', array[]::text[])
) as v(id, categoria, etiquetas)
where a.id = v.id;

-- Un ámbito nuevo sin clasificar publica como «comunicados».
update public.ambitos set blog_categoria = 'comunicados' where blog_categoria is null and tipo <> 'especial';

-- ---------------------------------------------------------------------
-- 2. Tabla de entradas
-- ---------------------------------------------------------------------

create table if not exists public.entradas (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90),
  ambito_id      text not null references public.ambitos (id) on delete restrict,
  firma          text,
  categoria      text not null,
  etiquetas      text[] not null default '{}',
  titulo         text not null check (char_length(titulo) between 3 and 160),
  resumen        text not null default '' check (char_length(resumen) <= 400),
  cuerpo         text not null default '' check (char_length(cuerpo) <= 40000),
  imagen         text check (imagen is null or imagen ~ '^https://[^\s"''<>]+$'),
  imagen_alt     text check (imagen_alt is null or char_length(imagen_alt) <= 200),
  documento      jsonb check (documento is null or (jsonb_typeof(documento) = 'object' and octet_length(documento::text) <= 2000)),
  fecha          date not null default current_date,
  publicado      boolean not null default true,
  autor          uuid references public.perfiles (id) on delete set null,
  creado_en      timestamptz not null default now(),
  actualizado_por uuid references public.perfiles (id) on delete set null,
  actualizado_en timestamptz not null default now()
);
create index if not exists entradas_fecha_idx on public.entradas (fecha desc);
create index if not exists entradas_ambito_idx on public.entradas (ambito_id, fecha desc);

-- ---------------------------------------------------------------------
-- 3. Clasificación automática
-- ---------------------------------------------------------------------

-- ¿Puede elegir categoría y etiquetas? Dirección y secretaría.
create or replace function public.elige_clasificacion()
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_directiva() or public.tiene_permiso('secretaria')
$$;

-- Texto en minúsculas y sin tildes, para buscar palabras y hacer el slug.
create or replace function public._plano(p text)
returns text language sql immutable set search_path = public as $$
  select translate(lower(coalesce(p, '')), 'áàäâéèëêíìïîóòöôúùüûñç', 'aaaaeeeeiiiioooouuuunc')
$$;

-- Etiquetas que se ponen solas: las del ámbito y la etapa que nombre el texto.
create or replace function public._etiquetas_auto(p_ambito text, p_titulo text, p_resumen text, p_cuerpo text)
returns text[] language plpgsql stable security definer set search_path = public as $$
declare
  t text := public._plano(concat_ws(' ', p_titulo, p_resumen, p_cuerpo));
  v text[] := coalesce((select blog_etiquetas from public.ambitos where id = p_ambito), '{}');
begin
  if t ~ '\minfantil\M' and not ('Infantil' = any (v)) then v := array_append(v, 'Infantil'); end if;
  if t ~ '\mprimaria\M' and not ('Primaria' = any (v)) then v := array_append(v, 'Primaria'); end if;
  if (t ~ '\meso\M' or t ~ '\msecundaria\M') and not ('ESO' = any (v)) then v := array_append(v, 'ESO'); end if;
  return v[1:8];
end $$;

-- Limpia la lista de etiquetas que escribe quien sí puede elegirlas.
create or replace function public._limpiar_etiquetas(p text[])
returns text[] language sql immutable set search_path = public as $$
  select coalesce(array_agg(e order by o), '{}') from (
    select distinct on (lower(e)) e, o from (
      select left(regexp_replace(trim(x), '\s+', ' ', 'g'), 40) as e, o
        from unnest(coalesce(p, '{}')) with ordinality as u(x, o)
    ) s where e <> '' and e !~ '[<>"]' order by lower(e), o
  ) d where o <= 50
$$;

-- Lo que el panel enseña antes de guardar: cómo quedará clasificada.
create or replace function public.clasificacion_sugerida(p_ambito text, p_titulo text, p_resumen text, p_cuerpo text)
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if not public.puede_editar(p_ambito) then raise exception 'No puedes publicar en nombre de este ámbito'; end if;
  return json_build_object(
    'categoria', coalesce((select blog_categoria from public.ambitos where id = p_ambito), 'comunicados'),
    'etiquetas', to_json(public._etiquetas_auto(p_ambito, p_titulo, p_resumen, left(p_cuerpo, 40000))),
    'elige', public.elige_clasificacion()
  );
end $$;

-- Antes de guardar: autor, firma, slug y clasificación.
create or replace function public.entradas_preparar()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_base text;
  v_slug text;
  n int := 1;
  v_libre boolean := public.elige_clasificacion();
  v_desde_sql boolean := auth.uid() is null and session_user not in ('anon', 'authenticated', 'authenticator');
begin
  if auth.uid() is null and not v_desde_sql then raise exception 'Hay que iniciar sesión'; end if;
  if not v_desde_sql and not public.puede_editar(new.ambito_id) then
    raise exception 'No puedes publicar en nombre de este ámbito';
  end if;

  new.titulo := left(regexp_replace(trim(new.titulo), '\s+', ' ', 'g'), 160);
  new.resumen := left(trim(coalesce(new.resumen, '')), 400);
  new.cuerpo := left(replace(coalesce(new.cuerpo, ''), E'\r', ''), 40000);
  new.imagen := nullif(trim(coalesce(new.imagen, '')), '');
  new.imagen_alt := nullif(left(trim(coalesce(new.imagen_alt, '')), 200), '');
  new.firma := (select nombre from public.ambitos where id = new.ambito_id);

  if tg_op = 'INSERT' then
    new.autor := coalesce(auth.uid(), new.autor);
    new.creado_en := now();
    v_base := trim(both '-' from regexp_replace(public._plano(new.titulo), '[^a-z0-9]+', '-', 'g'));
    v_base := left(coalesce(nullif(v_base, ''), 'entrada'), 80);
    v_base := trim(both '-' from v_base);
    v_slug := v_base;
    while exists (select 1 from public.entradas where slug = v_slug) loop
      n := n + 1;
      v_slug := v_base || '-' || n;
    end loop;
    new.slug := v_slug;
  else
    -- La dirección de la entrada y su autor no cambian al editarla.
    new.slug := old.slug;
    new.autor := old.autor;
    new.creado_en := old.creado_en;
  end if;

  if v_libre or v_desde_sql then
    if new.categoria is null or not (new.categoria = any (public.blog_categorias())) then
      new.categoria := coalesce((select blog_categoria from public.ambitos where id = new.ambito_id), 'comunicados');
    end if;
    new.etiquetas := public._limpiar_etiquetas(new.etiquetas);
    if cardinality(new.etiquetas) = 0 then
      new.etiquetas := public._etiquetas_auto(new.ambito_id, new.titulo, new.resumen, new.cuerpo);
    end if;
    new.etiquetas := new.etiquetas[1:8];
  else
    new.categoria := coalesce((select blog_categoria from public.ambitos where id = new.ambito_id), 'comunicados');
    new.etiquetas := public._etiquetas_auto(new.ambito_id, new.titulo, new.resumen, new.cuerpo);
  end if;

  new.actualizado_por := auth.uid();
  new.actualizado_en := now();
  return new;
end $$;

drop trigger if exists entradas_preparar on public.entradas;
create trigger entradas_preparar
  before insert or update on public.entradas
  for each row execute function public.entradas_preparar();

-- Historial: queda quién publicó, cambió o borró cada entrada. Sin
-- «valor anterior», para que el botón de recuperar del historial no
-- intente escribirla como si fuera un campo de una página.
create or replace function public.entradas_historial()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_email text := (select email from public.perfiles where id = auth.uid());
  r public.entradas := case when tg_op = 'DELETE' then old else new end;
begin
  insert into public.historial (autor, autor_email, accion, ambito_id, clave, detalle)
  values (auth.uid(), v_email,
          case tg_op when 'INSERT' then 'blog-publicar' when 'UPDATE' then 'blog-cambiar' else 'blog-borrar' end,
          r.ambito_id, 'blog', left(r.titulo, 160));
  return null;
end $$;

drop trigger if exists entradas_historial on public.entradas;
create trigger entradas_historial
  after insert or update or delete on public.entradas
  for each row execute function public.entradas_historial();

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------

alter table public.entradas enable row level security;

-- La web pública ve lo publicado y con fecha de hoy o anterior.
drop policy if exists entradas_leer_publicas on public.entradas;
create policy entradas_leer_publicas on public.entradas for select
  using (publicado and fecha <= current_date);
-- En el panel, además, los borradores y las programadas que puedes editar.
drop policy if exists entradas_leer_panel on public.entradas;
create policy entradas_leer_panel on public.entradas for select to authenticated
  using (public.puede_editar(ambito_id));
drop policy if exists entradas_crear on public.entradas;
create policy entradas_crear on public.entradas for insert to authenticated
  with check (public.puede_editar(ambito_id) and autor = auth.uid());
drop policy if exists entradas_cambiar on public.entradas;
create policy entradas_cambiar on public.entradas for update to authenticated
  using (public.puede_editar(ambito_id)) with check (public.puede_editar(ambito_id));
drop policy if exists entradas_borrar on public.entradas;
create policy entradas_borrar on public.entradas for delete to authenticated
  using (public.puede_editar(ambito_id));

revoke all on public.entradas from anon;
grant select on public.entradas to anon, authenticated;
grant insert, update, delete on public.entradas to authenticated;

revoke execute on function public.elige_clasificacion(), public._plano(text), public._etiquetas_auto(text, text, text, text),
  public._limpiar_etiquetas(text[]), public.clasificacion_sugerida(text, text, text, text),
  public.entradas_preparar(), public.entradas_historial(), public.blog_categorias() from public, anon;
grant execute on function public.clasificacion_sugerida(text, text, text, text), public.elige_clasificacion(),
  public.blog_categorias() to authenticated;

-- ---------------------------------------------------------------------
-- 5. Imágenes de las entradas
--    Carpeta = id del ámbito. JPG, PNG o WebP, 5 MB como máximo
--    (el panel las reduce antes de subirlas).
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists imagenes_leer on storage.objects;
create policy imagenes_leer on storage.objects for select
  using (bucket_id = 'imagenes');
drop policy if exists imagenes_subir on storage.objects;
create policy imagenes_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.puede_editar((storage.foldername(name))[1]));
drop policy if exists imagenes_cambiar on storage.objects;
create policy imagenes_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'imagenes' and public.puede_editar((storage.foldername(name))[1]))
  with check (bucket_id = 'imagenes' and public.puede_editar((storage.foldername(name))[1]));
drop policy if exists imagenes_borrar on storage.objects;
create policy imagenes_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.puede_editar((storage.foldername(name))[1]));
