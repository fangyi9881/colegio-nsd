"""Pruebas de permisos y clasificación del blog (supabase/03_blog.sql).

Se ejecutan contra un PostgreSQL local, NUNCA contra el Supabase real:
  createdb nsd
  psql -d nsd -f supabase/pruebas/simulacion-supabase.sql
  psql -d nsd -f supabase/01_esquema.sql -f supabase/02_ambitos.sql -f supabase/03_blog.sql
  python3 supabase/pruebas/blog.py
"""
import psycopg2, json, uuid, sys
cx = psycopg2.connect(host='127.0.0.1', dbname='nsd', user='postgres', password='pg'); cx.autocommit = True
cur = cx.cursor()
fallos = 0; total = 0
def sql(q, a=None):
    cur.execute(q, a);
    try: return cur.fetchall()
    except psycopg2.ProgrammingError: return None
def usuario(email, rol, estado, ambitos):
    uid = str(uuid.uuid4())
    sql("insert into auth.users (id,email,raw_user_meta_data) values (%s,%s,%s)", (uid, email, json.dumps({'nombre': email.split('@')[0]})))
    sql("update public.perfiles set rol=%s, estado=%s where id=%s", (rol, estado, uid))
    for a in ambitos: sql("insert into public.permisos (perfil_id, ambito_id) values (%s,%s)", (uid, a))
    return uid
def como(uid):
    sql("reset role")
    if uid is None:
        sql("select set_config('request.jwt.claims','',false)"); sql("set role anon")
    else:
        sql("select set_config('request.jwt.claims', %s, false)", (json.dumps({'sub': uid, 'role': 'authenticated'}),)); sql("set role authenticated")
def comprobar(nombre, cond):
    global fallos, total
    total += 1
    if not cond: fallos += 1; print('FALLO', nombre)
    else: print('ok  ', nombre)
def intenta(f):
    try: return ('ok', f())
    except Exception as e: return ('error', str(e).split('\n')[0])

sql("reset role"); sql("delete from public.entradas"); sql("delete from storage.objects"); sql("delete from public.contenidos"); sql("delete from auth.users")
ADM = usuario('admin@x.es', 'admin', 'aprobado', [])
DIR = usuario('dir@x.es', 'directiva', 'aprobado', [])
MAT = usuario('mat@x.es', 'editor', 'aprobado', ['dep-matematicas'])
DOS = usuario('dos@x.es', 'editor', 'aprobado', ['dep-lengua', 'etapa-primaria'])
SEC = usuario('sec@x.es', 'editor', 'aprobado', ['secretaria'])
PEN = usuario('pen@x.es', 'editor', 'pendiente', ['dep-matematicas'])
SUS = usuario('sus@x.es', 'editor', 'suspendido', ['dep-matematicas'])

ins = "insert into public.entradas (ambito_id, titulo, resumen, cuerpo, categoria, etiquetas, fecha, publicado) values (%s,%s,%s,%s,%s,%s,%s,%s) returning id, slug, categoria, etiquetas, autor, firma"

# 1. Editor de Matemáticas: clasificación forzada
como(MAT)
r = intenta(lambda: sql(ins, ('dep-matematicas', 'Olimpiada de Matemáticas', 'Los de 3.º ganan', 'Texto con alumnos de primaria invitados', 'deporte', ['Hackeo', 'Lo que sea'], '2026-10-01', True))[0])
comprobar('editor publica en su departamento', r[0] == 'ok')
_, slug, cat, et, autor, firma = r[1]
comprobar('slug sin tildes', slug == 'olimpiada-de-matematicas')
comprobar('categoría forzada a eso', cat == 'eso')
comprobar('etiquetas del departamento + etapa detectada', et == ['ESO', 'Matemáticas', 'Primaria'])
comprobar('autor = quien publica', autor == MAT)
comprobar('firma = nombre del ámbito', firma == 'Matemáticas')
id_mat = r[1][0]
r = intenta(lambda: sql(ins, ('dep-matematicas', 'Olimpiada de Matemáticas', '', '', None, [], '2026-10-02', True))[0])
comprobar('slug repetido lleva -2', r[0] == 'ok' and r[1][1] == 'olimpiada-de-matematicas-2')
r = intenta(lambda: sql(ins, ('dep-lengua', 'Intruso', '', '', None, [], '2026-10-01', True)))
comprobar('editor NO publica en otro departamento', r[0] == 'error')
r = intenta(lambda: sql("update public.entradas set categoria='deporte', etiquetas=array['X'], slug='otro' where id=%s returning categoria, etiquetas, slug", (id_mat,)))
comprobar('editor no cambia categoría/etiquetas/slug al editar', r[0] == 'ok' and r[1][0][0] == 'eso' and r[1][0][1] == ['ESO', 'Matemáticas', 'Primaria'] and r[1][0][2] == 'olimpiada-de-matematicas')
r = intenta(lambda: sql("update public.entradas set ambito_id='dep-lengua' where id=%s returning 1", (id_mat,)))
comprobar('editor no mueve su entrada a otro departamento', r[0] == 'error')
r = intenta(lambda: sql("update public.entradas set autor=%s where id=%s returning autor", (DIR, id_mat)))
comprobar('el autor no se cambia', r[0] == 'ok' and r[1][0][0] == MAT)

# 2. Editor con dos ámbitos
como(DOS)
r = intenta(lambda: sql(ins, ('etapa-primaria', 'Excursión al zoo', 'Salida de 2.º', '', None, [], '2026-10-01', True))[0])
comprobar('editor con dos ámbitos elige firma', r[0] == 'ok' and r[1][2] == 'primaria' and r[1][3] == ['Primaria'] and r[1][5] == 'Educación Primaria')
r = intenta(lambda: sql("select count(*) from public.entradas where ambito_id='dep-matematicas'"))
comprobar('ve las publicadas de otros (web pública)', r[1][0][0] == 2)

# 3. Secretaría y dirección eligen
como(SEC)
r = intenta(lambda: sql(ins, ('secretaria', 'Plazo de becas de comedor', 'Hasta el 15', '', 'servicios', ['Comedor', ' Becas ', 'comedor', '<b>'], '2026-10-01', True))[0])
comprobar('secretaría elige categoría', r[0] == 'ok' and r[1][2] == 'servicios')
comprobar('secretaría elige etiquetas (limpias, sin repetidas)', r[1][3] == ['Comedor', 'Becas'])
r = intenta(lambda: sql(ins, ('secretaria', 'Aviso general', '', '', 'inventada', [], '2026-10-01', True))[0])
comprobar('categoría no válida → la del ámbito; sin etiquetas → automáticas', r[0] == 'ok' and r[1][2] == 'comunicados' and r[1][3] == ['Secretaría'])
como(DIR)
r = intenta(lambda: sql(ins, ('dep-ciencias', 'Feria de la ciencia', 'En el patio', '', 'cultura', ['Ciencia', 'Feria'], '2026-10-01', True))[0])
comprobar('dirección publica en cualquier ámbito y elige', r[0] == 'ok' and r[1][2] == 'cultura' and r[1][3] == ['Ciencia', 'Feria'] and r[1][5].startswith('Ciencias'))
r = intenta(lambda: sql("update public.entradas set categoria='familias' where id=%s returning categoria", (id_mat,)))
comprobar('dirección recategoriza la de un departamento', r[0] == 'ok' and r[1][0][0] == 'familias')
como(MAT)
r = intenta(lambda: sql("update public.entradas set titulo='Olimpiada matemática' where id=%s returning categoria", (id_mat,)))
comprobar('si el departamento la vuelve a editar, vuelve a su categoría', r[0] == 'ok' and r[1][0][0] == 'eso')

# 4. Borradores, programadas y lectura pública
como(MAT)
sql(ins, ('dep-matematicas', 'Borrador secreto', '', '', None, [], '2026-10-01', False))
sql(ins, ('dep-matematicas', 'Programada', '', '', None, [], '2099-01-01', True))
como(None)
r = intenta(lambda: sql("select titulo from public.entradas"))
titulos = [x[0] for x in r[1]] if r[0] == 'ok' else []
comprobar('anónimo lee lo publicado', 'Feria de la ciencia' in titulos)
comprobar('anónimo NO ve borradores', 'Borrador secreto' not in titulos)
comprobar('anónimo NO ve programadas', 'Programada' not in titulos)
r = intenta(lambda: sql(ins, ('noticias', 'Anon', '', '', None, [], '2026-10-01', True)))
comprobar('anónimo no publica', r[0] == 'error')
r = intenta(lambda: sql("delete from public.entradas returning 1"))
comprobar('anónimo no borra', r[0] == 'error' or not r[1])
como(MAT)
r = sql("select titulo from public.entradas where not publicado or fecha > current_date")
comprobar('el departamento ve sus borradores y programadas', sorted(x[0] for x in r) == ['Borrador secreto', 'Programada'])
como(DOS)
r = sql("select titulo from public.entradas where not publicado or fecha > current_date")
comprobar('otro departamento NO ve borradores ajenos', r == [])
como(DIR)
r = sql("select count(*) from public.entradas where not publicado or fecha > current_date")
comprobar('dirección ve todos los borradores', r[0][0] == 2)

# 5. Cuentas sin acceso
for nombre, u in (('pendiente', PEN), ('suspendida', SUS)):
    como(u)
    r = intenta(lambda: sql(ins, ('dep-matematicas', 'Cuenta ' + nombre, '', '', None, [], '2026-10-01', True)))
    comprobar(f'cuenta {nombre} no publica', r[0] == 'error')
    r = intenta(lambda: sql("update public.entradas set titulo='x' where ambito_id='dep-matematicas' returning 1"))
    comprobar(f'cuenta {nombre} no edita', r[0] == 'error' or not r[1])

# 6. Borrar
como(DOS)
r = intenta(lambda: sql("delete from public.entradas where ambito_id='dep-matematicas' returning 1"))
comprobar('no borra entradas de otro departamento', r[0] == 'ok' and not r[1])
como(MAT)
r = intenta(lambda: sql("delete from public.entradas where titulo='Borrador secreto' returning 1"))
comprobar('borra las suyas', r[0] == 'ok' and len(r[1]) == 1)

# 7. Sugerencia de clasificación y validaciones
como(MAT)
r = intenta(lambda: sql("select public.clasificacion_sugerida('dep-matematicas','Taller','para infantil','')"))
comprobar('sugerencia para el panel', r[0] == 'ok' and r[1][0][0] == {'categoria': 'eso', 'etiquetas': ['ESO', 'Matemáticas', 'Infantil'], 'elige': False})
r = intenta(lambda: sql("select public.clasificacion_sugerida('dep-lengua','x','','')"))
comprobar('sugerencia solo para tus ámbitos', r[0] == 'error')
como(SEC)
r = sql("select public.clasificacion_sugerida('secretaria','x','','')")
comprobar('secretaría: elige = true', r[0][0]['elige'] is True)
como(MAT)
r = intenta(lambda: sql(ins, ('dep-matematicas', 'Con imagen mala', '', '', None, [], '2026-10-01', True)) and sql("update public.entradas set imagen='javascript:alert(1)' where titulo='Con imagen mala' returning 1"))
comprobar('imagen solo https', r[0] == 'error')
r = intenta(lambda: sql(ins, ('dep-matematicas', 'x', '', '', None, [], '2026-10-01', True)))
comprobar('título demasiado corto', r[0] == 'error')

# 8. Historial e imágenes
como(DIR)
r = sql("select accion, clave, valor_anterior from public.historial where clave='blog' order by id")
comprobar('historial registra entradas sin valor recuperable', len(r) >= 5 and all(x[2] is None for x in r) and {'blog-publicar', 'blog-cambiar', 'blog-borrar'} <= {x[0] for x in r})
como(MAT)
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('imagenes','dep-matematicas/foto.webp') returning 1"))
comprobar('sube imagen a su carpeta', r[0] == 'ok')
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('imagenes','dep-lengua/foto.webp') returning 1"))
comprobar('no sube imagen a carpeta ajena', r[0] == 'error')
como(None)
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('imagenes','noticias/x.webp') returning 1"))
comprobar('anónimo no sube imágenes', r[0] == 'error')

# 9. Contenidos de siempre siguen igual
como(MAT)
r = intenta(lambda: sql("insert into public.contenidos (ambito_id, clave, valor) values ('dep-matematicas','objetivos','[\"a\"]') returning 1"))
comprobar('contenidos: el departamento edita lo suyo', r[0] == 'ok')
r = intenta(lambda: sql("insert into public.contenidos (ambito_id, clave, valor) values ('legal','dpd_nombre','\"x\"') returning 1"))
comprobar('contenidos: no edita lo ajeno', r[0] == 'error')
sql("reset role")
print(f'\n{total - fallos}/{total} pruebas superadas')
sys.exit(1 if fallos else 0)
