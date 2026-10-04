-- =====================================================================
-- Colegio NSD · 04 · Archivos de los departamentos
-- ---------------------------------------------------------------------
-- Hasta ahora el almacén «documentos» solo admitía PDF de 10 MB. Desde
-- el panel ya se pueden subir también documentos de Office y de
-- LibreOffice y fotos, hasta 15 MB, para ponerlos como botón.
-- Los permisos no cambian: cada ámbito sube a su propia carpeta.
--
-- Ejecutar después de 01. Si algún día se vuelve a ejecutar 01, hay que
-- ejecutar este otra vez (01 deja el almacén solo para PDF).
-- =====================================================================

update storage.buckets
   set file_size_limit = 15728640,
       allowed_mime_types = array[
         'application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
         'application/vnd.ms-powerpoint',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
         'application/vnd.oasis.opendocument.text',
         'application/vnd.oasis.opendocument.spreadsheet',
         'application/vnd.oasis.opendocument.presentation',
         'image/jpeg', 'image/png', 'image/webp'
       ]
 where id = 'documentos';
