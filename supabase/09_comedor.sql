-- =====================================================================
-- Colegio NSD · 09 · Menú del comedor desde el panel
-- ---------------------------------------------------------------------
-- Crea el ámbito «comedor». Quien lo tenga asignado (en «Cuentas y
-- permisos») ve en el panel el apartado «Menú del comedor»: sube el PDF
-- (o el Excel) del mes y la web de /servicios/comedor se actualiza sola.
--
-- Cada mes se guarda como una fila de public.contenidos
-- (ambito_id = 'comedor', clave = 'mes_2026_09'), así que hereda sin
-- tocar nada más: permisos por ámbito, historial de cambios y lectura
-- pública. El PDF original va al almacén «documentos», carpeta comedor.
--
-- Ejecutar después de 02 y 04. Se puede repetir sin problema.
-- =====================================================================

insert into public.ambitos (id, nombre, tipo, grupo, esquema, orden) values
  ('comedor', 'Menú del comedor', 'seccion', 'Web', 'ninguno', 66)
on conflict (id) do update set
  nombre = excluded.nombre, tipo = excluded.tipo, grupo = excluded.grupo,
  esquema = excluded.esquema, orden = excluded.orden;

notify pgrst, 'reload schema';
