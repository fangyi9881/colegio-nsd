"""Pruebas del blindaje y del rendimiento (supabase/06_rendimiento_y_seguridad.sql).

Contra un PostgreSQL local, NUNCA contra el Supabase real:
  psql -d nsd -f supabase/pruebas/simulacion-supabase.sql
  psql -d nsd -f supabase/01_esquema.sql -f supabase/02_ambitos.sql -f supabase/03_blog.sql \
              -f supabase/05_personas.sql -f supabase/06_rendimiento_y_seguridad.sql
  python3 supabase/pruebas/seguridad.py
"""
import psycopg2, json, uuid, time
cx = psycopg2.connect(host='127.0.0.1', dbname='nsd', user='postgres', password='pg'); cx.autocommit = True
cur = cx.cursor()
fallos = 0; total = 0
def sql(q, a=None):
    cur.execute(q, a)
    try: return cur.fetchall()
    except psycopg2.ProgrammingError: return None
def usuario(email, nombre, rol, estado, ambitos):
    uid = str(uuid.uuid4())
    sql("insert into auth.users (id,email,raw_user_meta_data) values (%s,%s,%s)", (uid, email, json.dumps({'nombre': nombre})))
    sql("update public.perfiles set rol=%s, estado=%s, nombre=%s where id=%s", (rol, estado, nombre, uid))
    for a in ambitos: sql("insert into public.permisos (perfil_id, ambito_id) values (%s,%s)", (uid, a))
    return uid
def como(uid, ip=None):
    sql("reset role")
    sql("select set_config('request.headers', %s, false)", (json.dumps({'x-forwarded-for': ip}) if ip else '',))
    if uid is None:
        sql("select set_config('request.jwt.claims','',false)"); sql("set role anon")
    else:
        sql("select set_config('request.jwt.claims', %s, false)", (json.dumps({'sub': uid, 'role': 'authenticated'}),)); sql("set role authenticated")
def comprobar(nombre, cond):
    global fallos, total
    total += 1
    print(('ok  ' if cond else 'FALLO'), nombre)
    if not cond: fallos += 1
def intenta(f):
    try: return ('ok', f())
    except Exception as e: return ('error', str(e).split('\n')[0])

sql("reset role")
for t in ['public.entradas', 'public.fichas', 'storage.objects', 'public.contenidos', 'public.canal_comunicaciones', 'public._limites', 'auth.users']:
    sql(f"delete from {t}")
sql("delete from public.historial")
DIR = usuario('dir@x.es', 'Directora', 'directiva', 'aprobado', [])
MAT = usuario('mat@x.es', 'Profe Mates', 'editor', 'aprobado', ['dep-matematicas'])
OTR = usuario('otr@x.es', 'Profe Ciencias', 'editor', 'aprobado', ['dep-ciencias'])
PEN = usuario('pen@x.es', 'Pendiente', 'editor', 'pendiente', ['dep-matematicas'])

# ── Contenido y su historial ──
como(MAT); sql("insert into public.contenidos (ambito_id, clave, valor, actualizado_por) values ('dep-matematicas','intro','\"hola\"', %s)", (MAT,))
como(OTR); sql("insert into public.contenidos (ambito_id, clave, valor) values ('dep-ciencias','intro','\"ciencia\"')")
r = intenta(lambda: sql("insert into public.contenidos (ambito_id, clave, valor) values ('dep-matematicas','otra','\"x\"')"))
comprobar('un departamento no escribe en otro', r[0] == 'error')
como(PEN); r = intenta(lambda: sql("insert into public.contenidos (ambito_id, clave, valor) values ('dep-matematicas','otra','\"x\"')"))
comprobar('una cuenta pendiente no escribe aunque tenga permiso', r[0] == 'error')
como(DIR); r = intenta(lambda: sql("insert into public.contenidos (ambito_id, clave, valor) values ('canal-gestion','x','\"x\"')"))
comprobar('nadie escribe en un ámbito especial', r[0] == 'error')

como(MAT); h = sql("select distinct ambito_id from public.historial where ambito_id is not null")
comprobar('el historial de un profesor solo trae lo suyo', [x[0] for x in h] == ['dep-matematicas'])
como(DIR); h = sql("select count(distinct ambito_id) from public.historial where ambito_id is not null")[0][0]
comprobar('la dirección ve todo el historial', h == 2)
como(PEN); comprobar('una cuenta pendiente no ve historial', sql("select count(*) from public.historial")[0][0] == 0)

# ── Lo público, columna a columna ──
como(None)
comprobar('anónimo lee el contenido publicado', sql("select valor from public.contenidos where ambito_id='dep-matematicas'") == [('hola',)])
r = intenta(lambda: sql("select actualizado_por from public.contenidos"))
comprobar('anónimo no ve quién editó un contenido', r[0] == 'error')
como(MAT); sql("insert into public.entradas (slug, ambito_id, categoria, titulo, autor) values ('una-noticia','dep-matematicas','comunicados','Una noticia', %s)", (MAT,))
como(None)
comprobar('anónimo lee las entradas publicadas', sql("select slug from public.entradas") == [('una-noticia',)])
r = intenta(lambda: sql("select autor from public.entradas"))
comprobar('anónimo no ve el id de quien escribió', r[0] == 'error')
r = intenta(lambda: sql("select slug from public.entradas order by fecha desc, creado_en desc limit 5"))
comprobar('anónimo puede ordenar como la web (fecha, creado_en)', r[0] == 'ok')

# ── Archivos: sin listado público ──
sql("reset role")
sql("insert into storage.objects (bucket_id, name) values ('documentos','dep-matematicas/prog.pdf'), ('documentos','dep-ciencias/prog.pdf'), ('personas','profe-mates/1.webp')")
como(None)
comprobar('anónimo no puede listar archivos', sql("select count(*) from storage.objects")[0][0] == 0)
como(MAT)
comprobar('un profesor ve solo los archivos de su carpeta', sql("select name from storage.objects where bucket_id='documentos'") == [('dep-matematicas/prog.pdf',)])
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('documentos','dep-ciencias/colado.pdf')"))
comprobar('un profesor no sube a la carpeta de otro', r[0] == 'error')
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('documentos','dep-matematicas/nuevo.pdf')"))
comprobar('un profesor sube a la suya', r[0] == 'ok')
como(DIR)
comprobar('la dirección ve todas las carpetas', sql("select count(*) from storage.objects where bucket_id='documentos'")[0][0] == 3)

# ── Canal: límite por persona y huella sin IP ──
como(None, ip='198.51.100.7')
envios = [intenta(lambda: sql("select public.canal_enviar('otra', 'Hechos de prueba suficientemente largos', true)")) for _ in range(4)]
comprobar('el canal admite 3 envíos seguidos', all(e[0] == 'ok' for e in envios[:3]))
comprobar('el cuarto seguido se frena', envios[3][0] == 'error' and 'Espera' in envios[3][1])
como(None, ip='198.51.100.8')
comprobar('otra persona sí puede enviar', intenta(lambda: sql("select public.canal_enviar('otra', 'Hechos de prueba suficientemente largos', true)"))[0] == 'ok')
sql("reset role")
huellas = [x[0] for x in sql("select huella from public._limites")]
comprobar('no se guarda la IP, solo una huella', huellas and not any('198.51' in h for h in huellas) and all(len(h) == 64 for h in huellas))
como(None)
r = intenta(lambda: sql("select * from public._limites"))
comprobar('nadie lee la tabla de límites', r[0] == 'error')
r = intenta(lambda: sql("select * from public._secreto"))
comprobar('nadie lee el secreto', r[0] == 'error')
r = intenta(lambda: sql("select public._limitar('canal', 999, interval '1 second', 99999)"))
comprobar('anónimo no puede llamar a _limitar', r[0] == 'error')
codigo = envios[0][1][0][0]
como(None, ip='198.51.100.9')
comprobar('consultar con el código funciona', json.loads(json.dumps(sql("select public.canal_consultar(%s)", (codigo,))[0][0]))['estado'] == 'recibida')
como(None, ip='198.51.100.10')
consultas = [intenta(lambda: sql("select public.canal_consultar('AAAA-BBBB-CCCC-DDDD')")) for _ in range(21)]
comprobar('probar códigos a ciegas se frena a los 20 intentos', consultas[19][0] == 'ok' and consultas[20][0] == 'error')

# ── Altas de cuenta en masa ──
sql("reset role")
r = [intenta(lambda: usuario(f'spam{uuid.uuid4().hex[:8]}@x.es', 'Spam', 'editor', 'pendiente', [])) for _ in range(35)]
comprobar('más de 30 solicitudes en una hora se paran', sum(1 for x in r if x[0] == 'error') >= 4)
sql("delete from auth.users where email like 'spam%'")

# ── Rendimiento de las políticas: la lista se calcula una vez ──
sql("reset role")
sql("insert into public.historial (autor_email, accion, ambito_id, clave) select 'x', 'editar', 'dep-ciencias', 'k' from generate_series(1, 20000)")
sql("analyze public.historial")
como(MAT)
t = time.time(); sql("select id from public.historial order by fecha desc limit 100"); ms = (time.time() - t) * 1000
comprobar(f'historial de un profesor con 20.000 filas ajenas en {ms:.0f} ms (< 500)', ms < 500)
plan = '\n'.join(x[0] for x in sql("explain select id from public.historial order by fecha desc limit 100"))
comprobar('la política usa InitPlan/SubPlan (no una función por fila)', 'SubPlan' in plan or 'InitPlan' in plan)
sql("reset role"); sql("delete from public.historial where autor_email = 'x'")

print(f'\n{total - fallos}/{total} correctas')
raise SystemExit(1 if fallos else 0)
