-- =====================================================================
-- 10 · Cuentas del profesorado creadas por la dirección
-- ---------------------------------------------------------------------
-- Para dar de alta al profesorado de golpe, con una contraseña
-- provisional que cada uno cambia al entrar por primera vez, y para que
-- cualquiera pueda cambiar su correo desde «Mi cuenta» sin depender de
-- que llegue un correo de confirmación.
--
--   · perfiles.clave_provisional: mientras sea true, el panel solo deja
--     entrar en «Mi cuenta» hasta que se cambie la contraseña.
--   · Al cambiar la contraseña (auth.users.encrypted_password) se pone a
--     false sola, con un disparador.
--   · cambiar_mi_correo(nuevo, clave_actual): cambia el correo de acceso
--     pidiendo la contraseña actual.
--
-- Se puede ejecutar más de una vez. Las altas en sí van aparte, en el
-- archivo privado que genera scripts/cuentas-profesorado.mjs (lleva las
-- contraseñas y NO se sube a git).
-- =====================================================================

alter table public.perfiles add column if not exists clave_provisional boolean not null default false;

-- mi_perfil devuelve también si la contraseña es provisional
create or replace function public.mi_perfil()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', p.id, 'email', p.email, 'nombre', p.nombre, 'cargo', p.cargo,
    'rol', p.rol, 'estado', p.estado, 'ambito_solicitado', p.ambito_solicitado,
    'ambitos', coalesce((select json_agg(ambito_id order by ambito_id) from public.permisos where perfil_id = p.id), '[]'::json),
    'es_directiva', p.estado = 'aprobado' and p.rol in ('admin', 'directiva'),
    'es_admin', p.estado = 'aprobado' and p.rol = 'admin',
    'gestiona_canal', p.estado = 'aprobado' and exists (select 1 from public.permisos where perfil_id = p.id and ambito_id = 'canal-gestion'),
    'clave_provisional', p.clave_provisional
  )
  from public.perfiles p where p.id = auth.uid()
$$;

-- Al cambiar la contraseña deja de ser provisional
create or replace function public.clave_cambiada()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.perfiles set clave_provisional = false where id = new.id and clave_provisional;
  end if;
  return new;
end $$;
revoke execute on function public.clave_cambiada() from public, anon, authenticated;

drop trigger if exists al_cambiar_clave on auth.users;
create trigger al_cambiar_clave
  after update of encrypted_password on auth.users
  for each row execute function public.clave_cambiada();

-- Cambiar el correo de acceso (pide la contraseña actual)
create or replace function public.cambiar_mi_correo(p_nuevo text, p_clave text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := auth.uid();
  v_nuevo text := lower(trim(coalesce(p_nuevo, '')));
  v_hash text;
  v_antes text;
begin
  if v_uid is null then raise exception 'Hay que iniciar sesión'; end if;
  if v_nuevo !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' or char_length(v_nuevo) > 120 then
    raise exception 'Ese correo no es válido';
  end if;
  select encrypted_password, email into v_hash, v_antes from auth.users where id = v_uid;
  if v_hash is null or extensions.crypt(coalesce(p_clave, ''), v_hash) <> v_hash then
    raise exception 'La contraseña actual no es correcta';
  end if;
  if lower(v_antes) = v_nuevo then return; end if;
  if exists (select 1 from auth.users where lower(email) = v_nuevo and id <> v_uid) then
    raise exception 'Ya hay otra cuenta con ese correo';
  end if;
  update auth.users
     set email = v_nuevo, email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
   where id = v_uid;
  update auth.identities
     set identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(v_nuevo)), updated_at = now()
   where user_id = v_uid and provider = 'email';
  update public.perfiles set email = v_nuevo where id = v_uid;
  insert into public.historial (autor, autor_email, accion, detalle)
  values (v_uid, v_nuevo, 'cuenta', 'Cambio de correo de acceso (antes: ' || coalesce(v_antes, '') || ')');
end $$;
revoke execute on function public.cambiar_mi_correo(text, text) from public, anon;
grant execute on function public.cambiar_mi_correo(text, text) to authenticated;
grant execute on function public.mi_perfil() to authenticated;
