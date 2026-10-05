/* =========================================================
   Conexión con el panel de edición (Supabase)
   ---------------------------------------------------------
   Pega aquí los dos datos de Supabase → Project Settings → API:
     url      "Project URL"   (https://xxxxxxxx.supabase.co)
     anonKey  "anon public"   (la clave PÚBLICA; nunca la service_role)

   La clave anon es pública por diseño: lo que protege los datos
   son las reglas de la base de datos (supabase/01_esquema.sql).

   Mientras los dos estén vacíos, la web funciona igual que
   siempre con su contenido de serie y el panel avisa de que
   falta configurarlo.
   ========================================================= */
window.NSD_CMS_CONFIG = {
  // Cloudflare Turnstile (CAPTCHA del acceso): la «Site Key», que es
  // pública. Vacía = sin CAPTCHA. Activarla en Supabase (Authentication →
  // Attack Protection) SOLO después de publicar la web con esta clave.
  turnstile: '0x4AAAAAAFOoDk_3uCI2wTes',
  url: 'https://onhqkrmwwaclzwbckpzj.supabase.co',
  anonKey: 'sb_publishable_ciTfSnSwo0G7buvBjBVKcw_Bq6Ot-NZ'
};
