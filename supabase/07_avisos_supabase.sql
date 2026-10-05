-- =====================================================================
-- 07 · Avisos del Security / Performance Advisor de Supabase
-- ---------------------------------------------------------------------
-- Se ejecuta UNA vez, después de 06, en Supabase → SQL Editor.
-- Se puede volver a ejecutar sin romper nada. Si alguna vez se repite
-- el 01, hay que repetir después el 04, el 06 y este.
--
-- Qué queda a propósito (y por qué el Advisor lo seguirá señalando):
--  · canal_enviar y canal_consultar los puede llamar cualquiera: es el
--    canal interno de información (Ley 2/2023), que admite envíos
--    anónimos. Llevan límite por persona y por día (06).
--  · Las funciones del panel (aprobar_usuario, mi_perfil, mi_ficha…) y las
--    auxiliares de permisos las llama quien ha iniciado sesión: el panel
--    las necesita y las reglas de seguridad (RLS) también. Cada una
--    comprueba dentro quién llama; las auxiliares solo responden sobre
--    quien pregunta («¿soy de la dirección?»), no sobre otros.
--  · _limites y _secreto tienen RLS sin políticas: es lo que se quiere,
--    nadie puede leerlas ni escribirlas salvo las funciones internas.
-- =====================================================================

-- 1. Las auxiliares de permisos ya no se pueden llamar sin sesión.
--    Ninguna regla que se aplique a visitantes las usa (todas las que las
--    usan son «to authenticated»), así que no hacen falta para el público.
revoke execute on function public.es_admin(), public.es_aprobado(), public.es_directiva(),
  public.gestiona_canal(), public.mi_rol(), public.puede_editar(text), public.tiene_permiso(text)
  from public, anon;
grant execute on function public.es_admin(), public.es_aprobado(), public.es_directiva(),
  public.gestiona_canal(), public.mi_rol(), public.puede_editar(text), public.tiene_permiso(text)
  to authenticated;

-- 2. Una sola regla de lectura por tabla y papel (antes había dos que
--    Postgres tenía que comprobar siempre).
--    Ámbitos: la de administración ya no incluye leer.
drop policy if exists ambitos_admin on public.ambitos;
drop policy if exists ambitos_crear on public.ambitos;
drop policy if exists ambitos_cambiar on public.ambitos;
drop policy if exists ambitos_borrar on public.ambitos;
create policy ambitos_crear on public.ambitos for insert to authenticated
  with check ((select public.es_admin()));
create policy ambitos_cambiar on public.ambitos for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
create policy ambitos_borrar on public.ambitos for delete to authenticated
  using ((select public.es_admin()));

--    Entradas: el público ve lo publicado; con sesión, eso más lo que
--    puedes editar (borradores y programadas), en una sola regla.
drop policy if exists entradas_leer_publicas on public.entradas;
drop policy if exists entradas_leer_panel on public.entradas;
create policy entradas_leer_publicas on public.entradas for select to anon
  using (publicado and fecha <= current_date);
create policy entradas_leer_panel on public.entradas for select to authenticated
  using ((publicado and fecha <= current_date) or ambito_id in (select public.ambitos_editables()));

-- 3. Índices para las dos claves ajenas que faltaban.
create index if not exists perfiles_ambito_solicitado_idx on public.perfiles (ambito_solicitado);
create index if not exists permisos_concedido_por_idx on public.permisos (concedido_por);

-- 4. Clave primaria en la tabla de límites.
alter table public._limites add column if not exists id bigint generated always as identity;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public._limites'::regclass and contype = 'p') then
    alter table public._limites add primary key (id);
  end if;
end $$;

notify pgrst, 'reload schema';
