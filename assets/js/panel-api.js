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

      // Cualquier archivo para ponerlo como botón (04_archivos.sql)
      async subirArchivo(ambito, archivo) {
        const TIPOS = {
          pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          odt: 'application/vnd.oasis.opendocument.text', ods: 'application/vnd.oasis.opendocument.spreadsheet', odp: 'application/vnd.oasis.opendocument.presentation',
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
        };
        const ext = (/\.([a-z0-9]+)$/i.exec(archivo.name) || [])[1];
        const tipo = ext && TIPOS[ext.toLowerCase()];
        if (!tipo) throw new Error('Ese tipo de archivo no se puede subir. Usa PDF, Word, Excel, PowerPoint, LibreOffice o una foto.');
        if (archivo.size > 15 * 1024 * 1024) throw new Error('El archivo pasa de 15 MB. Redúcelo o súbelo a Drive y pon el enlace.');
        const limpio = archivo.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'archivo';
        const ruta = `${ambito}/${Date.now()}-${limpio}.${ext.toLowerCase()}`;
        const r = await sb.storage.from('documentos').upload(ruta, archivo, { contentType: tipo, upsert: false });
        if (r.error && /mime|type|not allowed/i.test(r.error.message || '') && tipo !== 'application/pdf') {
          throw new Error('Por ahora solo se pueden subir PDF. Quien administra la web tiene que ejecutar supabase/04_archivos.sql para admitir más tipos.');
        }
        ok(r);
        return sb.storage.from('documentos').getPublicUrl(ruta).data.publicUrl;
      },

      // ── Blog ──
      async entradas() {
        return ok(await sb.from('entradas').select('id,slug,ambito_id,firma,categoria,etiquetas,titulo,resumen,fecha,publicado,imagen,actualizado_en').order('fecha', { ascending: false }).order('creado_en', { ascending: false }).limit(300));
      },
      async entrada(id) {
        return ok(await sb.from('entradas').select('id,slug,ambito_id,firma,categoria,etiquetas,titulo,resumen,cuerpo,imagen,imagen_alt,documento,fecha,publicado').eq('id', id).maybeSingle());
      },
      // La base de datos pone slug, autor, firma y (salvo a dirección y
      // secretaría) la categoría y las etiquetas: lo que mande el panel
      // para esos campos se ignora.
      async guardarEntrada(id, datos) {
        const q = id ? sb.from('entradas').update(datos).eq('id', id) : sb.from('entradas').insert(datos);
        return ok(await q.select('id,slug,categoria,etiquetas,firma').single());
      },
      async borrarEntrada(id) { ok(await sb.from('entradas').delete().eq('id', id)); },
      async clasificacion(ambito, titulo, resumen, cuerpo) {
        return ok(await sb.rpc('clasificacion_sugerida', { p_ambito: ambito, p_titulo: titulo || '', p_resumen: resumen || '', p_cuerpo: cuerpo || '' }));
      },
      // Reduce la foto a 1600 px como mucho (WebP, o JPEG si el navegador
      // no sabe hacer WebP) antes de subirla: las fotos del móvil pesan
      // varios MB y la web tiene que cargar rápido.
      async subirImagen(ambito, archivo) {
        if (!/^image\//.test(archivo.type)) throw new Error('Elige una imagen (JPG, PNG o WebP).');
        if (archivo.size > 25 * 1024 * 1024) throw new Error('La imagen pasa de 25 MB. Elige otra o redúcela antes.');
        let mapa;
        try { mapa = await createImageBitmap(archivo); } catch (e) { throw new Error('No se puede leer esa imagen. Prueba con una foto JPG o PNG.'); }
        const escala = Math.min(1, 1600 / Math.max(mapa.width, mapa.height));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(mapa.width * escala);
        lienzo.height = Math.round(mapa.height * escala);
        lienzo.getContext('2d').drawImage(mapa, 0, 0, lienzo.width, lienzo.height);
        if (mapa.close) mapa.close();
        const aBlob = (tipo) => new Promise((res) => lienzo.toBlob(res, tipo, 0.84));
        let blob = await aBlob('image/webp');
        if (!blob || blob.type !== 'image/webp') blob = await aBlob('image/jpeg');
        if (!blob) throw new Error('No se ha podido preparar la imagen.');
        if (blob.size > 5 * 1024 * 1024) throw new Error('La imagen sigue pesando demasiado. Prueba con otra.');
        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const limpio = archivo.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'foto';
        const ruta = `${ambito}/${Date.now()}-${limpio}.${ext}`;
        ok(await sb.storage.from('imagenes').upload(ruta, blob, { contentType: blob.type, upsert: false }));
        return { url: sb.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl, ancho: lienzo.width, alto: lienzo.height };
      },

      // ── Fichas del personal (05_personas.sql) ──
      async miFicha() { return ok(await sb.rpc('mi_ficha')); },
      async fichas() { return ok(await sb.from('fichas').select('slug,nombre,perfil_id,foto,frase,bio,formacion,desde,correo,actualizado_en').order('nombre')); },
      async guardarFicha(slug, d) {
        const r = ok(await sb.from('fichas').update({
          foto: d.foto || null, frase: d.frase || null, bio: d.bio || null, formacion: d.formacion || null,
          desde: d.desde ? Number(d.desde) : null, correo: d.correo || null
        }).eq('slug', slug).select('slug'));
        if (!r || !r.length) throw new Error('No tienes permiso para editar esta ficha.');
      },
      async crearFicha(nombre) { return ok(await sb.rpc('crear_ficha', { p_nombre: nombre })); },
      async enlazarFicha(slug, perfil) { ok(await sb.rpc('enlazar_ficha', { p_slug: slug, p_perfil: perfil || null })); },
      // Foto cuadrada de 640 px, recortada al centro
      async subirFoto(slug, archivo) {
        if (!/^image\//.test(archivo.type)) throw new Error('Elige una imagen (JPG, PNG o WebP).');
        if (archivo.size > 25 * 1024 * 1024) throw new Error('La imagen pasa de 25 MB. Elige otra.');
        let mapa;
        try { mapa = await createImageBitmap(archivo); } catch (e) { throw new Error('No se puede leer esa imagen. Prueba con una foto JPG o PNG.'); }
        const lado = Math.min(mapa.width, mapa.height);
        const sal = Math.min(640, lado);
        const lienzo = document.createElement('canvas');
        lienzo.width = sal; lienzo.height = sal;
        lienzo.getContext('2d').drawImage(mapa, (mapa.width - lado) / 2, (mapa.height - lado) / 2, lado, lado, 0, 0, sal, sal);
        if (mapa.close) mapa.close();
        const aBlob = (tipo) => new Promise((res) => lienzo.toBlob(res, tipo, 0.86));
        let blob = await aBlob('image/webp');
        if (!blob || blob.type !== 'image/webp') blob = await aBlob('image/jpeg');
        if (!blob) throw new Error('No se ha podido preparar la foto.');
        const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const ruta = `${slug}/${Date.now()}.${ext}`;
        ok(await sb.storage.from('personas').upload(ruta, blob, { contentType: blob.type, upsert: false }));
        return sb.storage.from('personas').getPublicUrl(ruta).data.publicUrl;
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
