-- =====================================================================
--  Ámbitos editables de la web (qué se puede conceder a cada cuenta)
--  Ejecutar después de 01_esquema.sql. Se puede repetir sin problema.
--  El "esquema" dice qué campos tiene el editor (ver assets/js/cms-esquema.js).
-- =====================================================================

insert into public.ambitos (id, nombre, tipo, grupo, esquema, orden) values
  -- Etapas (equipos docentes de Infantil y Primaria)
  ('etapa-infantil',         'Educación Infantil',                         'departamento', 'Infantil y Primaria', 'etapa',        10),
  ('etapa-primaria',         'Educación Primaria',                         'departamento', 'Infantil y Primaria', 'etapa',        11),
  -- Departamentos de la ESO
  ('dep-matematicas',        'Matemáticas',                                'departamento', 'ESO', 'departamento', 20),
  ('dep-lengua',             'Lengua Castellana y Literatura',             'departamento', 'ESO', 'departamento', 21),
  ('dep-geografia-historia', 'Geografía e Historia',                       'departamento', 'ESO', 'departamento', 22),
  ('dep-ciencias',           'Ciencias (Biología, Geología, Física y Química)', 'departamento', 'ESO', 'departamento', 23),
  ('dep-tecnologia',         'Tecnología y Digitalización',                'departamento', 'ESO', 'departamento', 24),
  ('dep-ingles',             'Inglés',                                     'departamento', 'ESO', 'departamento', 25),
  ('dep-frances',            'Francés',                                    'departamento', 'ESO', 'departamento', 26),
  ('dep-educacion-fisica',   'Educación Física',                           'departamento', 'ESO', 'departamento', 27),
  ('dep-artistico',          'Departamento Artístico (Música y Plástica)', 'departamento', 'ESO', 'departamento', 28),
  ('dep-religion-valores',   'Religión y Atención Educativa',              'departamento', 'ESO', 'departamento', 29),
  ('dep-diversificacion',    'Diversificación Curricular',                 'departamento', 'ESO', 'departamento', 30),
  -- Orientación y bilingüismo
  ('dep-orientacion',        'Orientación',                                'departamento', 'Orientación y apoyo', 'orientacion', 40),
  ('dep-bilinguismo',        'Bilingüismo',                                'departamento', 'Bilingüismo', 'bilinguismo', 41),
  -- Secciones de la web que gestiona dirección o secretaría
  ('noticias',               'Noticias y comunicados',                     'seccion', 'Web', 'noticias', 60),
  ('secretaria',             'Secretaría y avisos a familias',             'seccion', 'Web', 'secretaria', 61),
  ('formularios',            'Formularios para familias',                  'seccion', 'Web', 'formularios', 62),
  ('informacion-familias',   'Información a las familias (obligatoria)',   'seccion', 'Web', 'informacion-familias', 63),
  ('evaluacion',             'Evaluación y promoción',                     'seccion', 'Web', 'evaluacion', 64),
  ('legal',                  'Datos legales (DPD, registro, canal)',       'seccion', 'Web', 'legal', 65),
  -- Acceso al buzón del canal interno (Ley 2/2023): solo lo concede un admin
  ('canal-gestion',          'Gestión del canal interno de información',   'especial', 'Especial', 'ninguno', 90)
on conflict (id) do update set
  nombre = excluded.nombre, tipo = excluded.tipo, grupo = excluded.grupo,
  esquema = excluded.esquema, orden = excluded.orden;
