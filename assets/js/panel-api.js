/* =========================================================
   Panel · capa de datos
   ---------------------------------------------------------
   Todo lo que el panel le pide a Supabase pasa por aquí. La
   interfaz (panel.js, acceso.js) solo llama a estas funciones,
   así se puede probar con una base de datos simulada.
   La seguridad NO está aquí: está en la base de datos (RLS).
   ========================================================= */
(function (raiz) {
  'use strict';

  function error(e) {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e || 'Error desconocido');
    if (/Invalid login credentials/i.test(m)) return new Error('Correo o contraseña incorrectos.');
    if (/Email not confirmed/i.test(m)) return new Error('Falta confirmar el correo: abre el enlace que te enviamos al registrarte.');
    if (/User already registered/i.test(m)) return new Error('Ya hay una cuenta con ese correo. Prueba a entrar o a recuperar la contraseña.');
    if (/Password should be at least/i.test(m)) return new Error('La contraseña es demasiado corta.');
    if (/rate limit|too many/i.test(m)) return new Error('Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.');
    if (/row-level security|permission denied/i.test(m)) return new Error('No tienes permiso para hacer esto.');
    if (/Failed to fetch|NetworkError/i.test(m)) return new Error('Sin conexión con el servidor. Revisa tu conexión a internet.');
    return new Error(m);
  }
  const ok = (r) => { if (r.error) throw error(r.error); return r.data; };

  function crearApi(cliente, origen) {
    const sb = cliente;
    const base = origen || location.origin;
    return {
      // ── Sesión ──
      async sesion() { return ok(await sb.auth.getSession()).session; },
      alCambiarSesion(fn) { return sb.auth.onAuthStateChange((evento, sesion) => fn(evento, sesion)); },
      async entrar(email, clave) { return ok(await sb.auth.signInWithPassword({ email: email.trim(), password: clave })); },
      async salir() { await sb.auth.signOut(); },
      async solicitar(d) {
        const r = ok(await sb.auth.signUp({
          email: d.email.trim(), password: d.clave,
          options: {
            emailRedirectTo: base + '/acceso?confirmado=1',
            data: { nombre: d.nombre.trim(), cargo: (d.cargo || '').trim(), ambito: d.ambito || '', motivo: (d.motivo || '').trim() }
          }
        }));
        // Supabase no avisa de correos repetidos (para no revelar cuentas):
        // devuelve un usuario sin identidades.
        if (r.user && Array.isArray(r.user.identities) && !r.user.identities.length) {
          throw new Error('Ya hay una cuenta con ese correo. Prueba a entrar o a recuperar la contraseña.');
        }
        return { necesitaConfirmar: !r.session };
      },
      async recuperar(email) { ok(await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: base + '/acceso/nueva-clave' })); },
      async cambiarClave(clave) { ok(await sb.auth.updateUser({ password: clave })); },

      // ── Perfil ──
      async miPerfil() { return ok(await sb.rpc('mi_perfil')); },
      async actualizarMiPerfil(nombre, cargo) { ok(await sb.rpc('actualizar_mi_perfil', { p_nombre: nombre, p_cargo: cargo })); },

      // ── Contenido ──
      async ambitos() { return ok(await sb.from('ambitos').select('id,nombre,tipo,grupo,esquema,orden').order('orden')); },
      async contenidos(ambitos) {
        let q = sb.from('contenidos').select('ambito_id,clave,valor,actualizado_en');
        if (ambitos) q = q.in('ambito_id', ambitos);
        const filas = ok(await q);
        const out = {};
        filas.forEach((f) => { (out[f.ambito_id] = out[f.ambito_id] || {})[f.clave] = { valor: f.valor, fecha: f.actualizado_en }; });
        return out;
      },
      async guardar(ambito, cambios) {
        const filas = Object.keys(cambios).filter((k) => cambios[k] !== undefined && cambios[k] !== null).map((k) => ({ ambito_id: ambito, clave: k, valor: cambios[k] }));
        const borrar = Object.keys(cambios).filter((k) => cambios[k] === null);
        if (filas.length) ok(await sb.from('contenidos').upsert(filas, { onConflict: 'ambito_id,clave' }));
        for (const k of borrar) ok(await sb.from('contenidos').delete().eq('ambito_id', ambito).eq('clave', k));
      },
      async subirPdf(ambito, archivo) {
        if (archivo.type !== 'application/pdf') throw new Error('Solo se pueden subir archivos PDF.');
        if (archivo.size > 10 * 1024 * 1024) throw new Error('El PDF pasa de 10 MB. Redúcelo antes de subirlo.');
        const limpio = archivo.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\.pdf$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'documento';
        const ruta = `${ambito}/${Date.now()}-${limpio}.pdf`;
        ok(await sb.storage.from('documentos').upload(ruta, archivo, { contentType: 'application/pdf', upsert: false }));
        return sb.storage.from('documentos').getPublicUrl(ruta).data.publicUrl;
      },

      // ── Cuentas (dirección) ──
      async usuarios() { return ok(await sb.rpc('listar_usuarios')); },
      async aprobar(id, rol, ambitos) { ok(await sb.rpc('aprobar_usuario', { p_id: id, p_rol: rol, p_ambitos: ambitos })); },
      async rechazar(id) { ok(await sb.rpc('rechazar_usuario', { p_id: id })); },
      async cambiarEstado(id, estado) { ok(await sb.rpc('cambiar_estado_usuario', { p_id: id, p_estado: estado })); },
      async cambiarRol(id, rol) { ok(await sb.rpc('cambiar_rol_usuario', { p_id: id, p_rol: rol })); },
      async fijarPermisos(id, ambitos) { ok(await sb.rpc('fijar_permisos_usuario', { p_id: id, p_ambitos: ambitos })); },

      // ── Historial ──
      async historial(limite) {
        return ok(await sb.from('historial').select('id,fecha,autor_email,accion,ambito_id,clave,valor_anterior,valor_nuevo,detalle').order('fecha', { ascending: false }).limit(limite || 100));
      },

      // ── Canal interno ──
      async canalListar() {
        return ok(await sb.from('canal_comunicaciones').select('id,creado_en,categoria,relato,anonima,nombre,contacto,estado,acuse_en,respuesta,respondido_en,cerrado_en,notas_internas').order('creado_en', { ascending: false }));
      },
      async canalActualizar(id, estado, respuesta, notas) { ok(await sb.rpc('canal_actualizar', { p_id: id, p_estado: estado, p_respuesta: respuesta, p_notas: notas })); },
      async canalEnviar(d) { return ok(await sb.rpc('canal_enviar', { p_categoria: d.categoria, p_relato: d.relato, p_anonima: d.anonima, p_nombre: d.nombre || null, p_contacto: d.contacto || null })); },
      async canalConsultar(codigo) { return ok(await sb.rpc('canal_consultar', { p_codigo: codigo })); }
    };
  }

  // Cliente real, si la web está conectada a Supabase
  function apiReal() {
    const C = raiz.NSD_CMS_CONFIG || {};
    if (!C.url || !C.anonKey || !raiz.supabase) return null;
    const cliente = raiz.supabase.createClient(C.url, C.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'nsd-panel' }
    });
    return crearApi(cliente);
  }

  // Las pruebas pueden dejar una API simulada en window.NSD_API_PRUEBAS
  raiz.NSD_PANEL_API = { crearApi, obtener: () => raiz.NSD_API_PRUEBAS || apiReal() };
})(window);
