-- =====================================================================
-- Colegio NSD · 05 · Fichas del personal
-- ---------------------------------------------------------------------
-- Cada persona que aparece en la web (dirección, coordinaciones,
-- profesorado de cada departamento) tiene una ficha pública: foto,
-- frase, biografía, formación, desde cuándo está en el centro y un
-- correo del colegio opcional.
--
-- · La ficha se identifica por el nombre convertido en «slug»
--   (laura-ruiz-yerpes). Así la misma persona es la misma tarjeta en
--   todas las páginas aunque su nombre lleve o no tilde.
-- · Quien tiene cuenta en el panel edita SOLO su ficha. La dirección
--   y la administración editan cualquiera y deciden qué cuenta es de
--   quién.
-- · La primera vez que alguien con la cuenta aprobada abre «Mi ficha»,
--   se enlaza con la ficha de su mismo nombre si nadie la tiene; si no
--   existe, se crea.
-- · Las entradas del blog guardan la ficha de quien las escribe, para
--   poner su tarjeta al pie.
--
-- Ejecutar después de 01, 02 y 03. Se puede repetir sin romper nada.
-- =====================================================================

create or replace function public._slug_persona(p text)
returns text language sql immutable set search_path = public as $$
  select left(trim(both '-' from regexp_replace(public._plano(p), '[^a-z0-9]+', '-', 'g')), 80)
$$;

create table if not exists public.fichas (
  slug          text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre        text not null check (char_length(nombre) between 3 and 120),
  perfil_id     uuid unique references public.perfiles (id) on delete set null,
  foto          text check (foto is null or foto ~ '^https://[^\s"''<>]+$'),
  frase         text check (frase is null or char_length(frase) <= 160),
  bio           text check (bio is null or char_length(bio) <= 1500),
  formacion     text check (formacion is null or char_length(formacion) <= 400),
  desde         smallint check (desde is null or desde between 1957 and 2100),
  correo        text check (correo is null or correo ~* '^[a-z0-9._%+-]+@colegionsdolores\.es$'),
  actualizado_en timestamptz not null default now(),
  actualizado_por uuid references public.perfiles (id) on delete set null
);

-- Quien no es de la dirección no puede cambiar a quién pertenece la
-- ficha ni el nombre que la identifica.
create or replace function public.fichas_preparar()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_desde_sql boolean := auth.uid() is null and session_user not in ('anon', 'authenticated', 'authenticator');
begin
  new.nombre := left(regexp_replace(trim(new.nombre), '\s+', ' ', 'g'), 120);
  if tg_op = 'INSERT' then
    new.slug := public._slug_persona(new.nombre);
  elsif not v_desde_sql and not public.es_directiva()
        and coalesce(current_setting('nsd.enlazando', true), '') <> '1' then
    new.slug := old.slug; new.nombre := old.nombre; new.perfil_id := old.perfil_id;
  end if;
  new.foto := nullif(trim(coalesce(new.foto, '')), '');
  new.frase := nullif(left(trim(coalesce(new.frase, '')), 160), '');
  new.bio := nullif(left(replace(trim(coalesce(new.bio, '')), E'\r', ''), 1500), '');
  new.formacion := nullif(left(trim(coalesce(new.formacion, '')), 400), '');
  new.correo := nullif(lower(trim(coalesce(new.correo, ''))), '');
  new.actualizado_en := now();
  new.actualizado_por := auth.uid();
  return new;
end $$;

drop trigger if exists fichas_preparar on public.fichas;
create trigger fichas_preparar before insert or update on public.fichas
  for each row execute function public.fichas_preparar();

alter table public.fichas enable row level security;

drop policy if exists fichas_leer on public.fichas;
create policy fichas_leer on public.fichas for select using (true);
drop policy if exists fichas_crear on public.fichas;
create policy fichas_crear on public.fichas for insert to authenticated
  with check (public.es_directiva());
drop policy if exists fichas_cambiar on public.fichas;
create policy fichas_cambiar on public.fichas for update to authenticated
  using (public.es_directiva() or (public.es_aprobado() and perfil_id = auth.uid()))
  with check (public.es_directiva() or (public.es_aprobado() and perfil_id = auth.uid()));
drop policy if exists fichas_borrar on public.fichas;
create policy fichas_borrar on public.fichas for delete to authenticated
  using (public.es_admin());

-- Lo público, columna a columna: a quién pertenece la ficha no sale.
revoke all on public.fichas from anon, authenticated;
grant select (slug, nombre, foto, frase, bio, formacion, desde, correo, actualizado_en) on public.fichas to anon, authenticated;
grant select (perfil_id) on public.fichas to authenticated;
grant insert, update on public.fichas to authenticated;
grant delete on public.fichas to authenticated;

-- ---------------------------------------------------------------------
-- Mi ficha: la busca o la crea, siempre a nombre de quien la pide.
-- ---------------------------------------------------------------------
create or replace function public.mi_ficha()
returns json language plpgsql security definer set search_path = public as $$
declare
  v_nombre text;
  v_slug text;
begin
  if not public.es_aprobado() then raise exception 'Tu cuenta aún no está aprobada'; end if;
  if not exists (select 1 from public.fichas where perfil_id = auth.uid()) then
    select nombre into v_nombre from public.perfiles where id = auth.uid();
    v_slug := public._slug_persona(v_nombre);
    if v_slug is null or char_length(v_slug) < 3 then raise exception 'Pon tu nombre completo en «Mi cuenta» antes de crear tu ficha'; end if;
    if exists (select 1 from public.fichas where slug = v_slug and perfil_id is not null) then
      raise exception 'Ya hay una ficha con tu nombre enlazada a otra cuenta. Habla con la dirección.';
    end if;
    perform set_config('nsd.enlazando', '1', true);
    insert into public.fichas (slug, nombre, perfil_id) values (v_slug, v_nombre, auth.uid())
      on conflict (slug) do update set perfil_id = auth.uid() where public.fichas.perfil_id is null;
    perform set_config('nsd.enlazando', '', true);
  end if;
  return (select row_to_json(f) from (select slug, nombre, foto, frase, bio, formacion, desde, correo, actualizado_en
    from public.fichas where perfil_id = auth.uid()) f);
end $$;

-- La dirección crea fichas para quien aún no tiene cuenta y decide
-- qué cuenta es de quién (o la desenlaza con p_perfil = null).
create or replace function public.crear_ficha(p_nombre text)
returns text language plpgsql security definer set search_path = public as $$
declare v_slug text := public._slug_persona(p_nombre);
begin
  if not public.es_directiva() then raise exception 'Solo la dirección puede crear fichas'; end if;
  if v_slug is null or char_length(v_slug) < 3 then raise exception 'Escribe el nombre completo'; end if;
  insert into public.fichas (slug, nombre) values (v_slug, p_nombre) on conflict (slug) do nothing;
  return v_slug;
end $$;

create or replace function public.enlazar_ficha(p_slug text, p_perfil uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.es_directiva() then raise exception 'Solo la dirección puede enlazar fichas'; end if;
  update public.fichas set perfil_id = null where perfil_id = p_perfil and slug <> p_slug;
  update public.fichas set perfil_id = p_perfil where slug = p_slug;
  if not found then raise exception 'No existe esa ficha'; end if;
end $$;

revoke execute on function public.mi_ficha(), public.crear_ficha(text), public.enlazar_ficha(text, uuid), public.fichas_preparar() from public, anon;
grant execute on function public.mi_ficha(), public.crear_ficha(text), public.enlazar_ficha(text, uuid) to authenticated;
grant execute on function public._slug_persona(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Autor de cada entrada del blog
-- ---------------------------------------------------------------------
alter table public.entradas add column if not exists ficha text references public.fichas (slug) on delete set null on update cascade;

create or replace function public.entradas_ficha()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.ficha := (select slug from public.fichas where perfil_id = coalesce(auth.uid(), new.autor));
  else
    new.ficha := old.ficha;
  end if;
  return new;
end $$;
drop trigger if exists entradas_ficha on public.entradas;
create trigger entradas_ficha before insert or update on public.entradas
  for each row execute function public.entradas_ficha();
revoke execute on function public.entradas_ficha() from public, anon;

-- Entradas ya escritas por quien ahora tiene ficha
update public.entradas e set ficha = f.slug
  from public.fichas f where f.perfil_id = e.autor and e.ficha is null;

-- ---------------------------------------------------------------------
-- Fotos: carpeta = slug de la ficha. Las sube su dueño o la dirección.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('personas', 'personas', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create or replace function public.puede_editar_ficha(p_slug text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_directiva() or (public.es_aprobado() and exists (
    select 1 from public.fichas where slug = p_slug and perfil_id = auth.uid()))
$$;
revoke execute on function public.puede_editar_ficha(text) from public, anon;
grant execute on function public.puede_editar_ficha(text) to authenticated;

drop policy if exists personas_leer on storage.objects;
create policy personas_leer on storage.objects for select
  using (bucket_id = 'personas');
drop policy if exists personas_subir on storage.objects;
create policy personas_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'personas' and public.puede_editar_ficha((storage.foldername(name))[1]));
drop policy if exists personas_cambiar on storage.objects;
create policy personas_cambiar on storage.objects for update to authenticated
  using (bucket_id = 'personas' and public.puede_editar_ficha((storage.foldername(name))[1]))
  with check (bucket_id = 'personas' and public.puede_editar_ficha((storage.foldername(name))[1]));
drop policy if exists personas_borrar on storage.objects;
create policy personas_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'personas' and public.puede_editar_ficha((storage.foldername(name))[1]));
