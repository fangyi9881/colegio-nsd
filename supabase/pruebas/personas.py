"""Pruebas de las fichas del personal (supabase/05_personas.sql).

Contra un PostgreSQL local, NUNCA contra el Supabase real:
  psql -d nsd -f supabase/pruebas/simulacion-supabase.sql
  psql -d nsd -f supabase/01_esquema.sql -f supabase/02_ambitos.sql -f supabase/03_blog.sql -f supabase/05_personas.sql
  python3 supabase/pruebas/personas.py
"""
import psycopg2, json, uuid
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
def como(uid):
    sql("reset role")
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

sql("reset role"); sql("delete from public.entradas"); sql("delete from public.fichas"); sql("delete from storage.objects"); sql("delete from public.contenidos"); sql("delete from auth.users")
DIR = usuario('dir@x.es', 'Jesús Romero Domínguez', 'directiva', 'aprobado', [])
MAT = usuario('mat@x.es', 'Marga Orell Cernuda', 'editor', 'aprobado', ['dep-matematicas'])
OTR = usuario('otr@x.es', 'Pablo Martínez Carreño', 'editor', 'aprobado', ['dep-ciencias'])
PEN = usuario('pen@x.es', 'Tamara Villa Piña', 'editor', 'pendiente', [])
CLON = usuario('clon@x.es', 'Marga Orell Cernuda', 'editor', 'aprobado', [])

# Dirección crea fichas del personal sin cuenta
como(DIR)
r = intenta(lambda: sql("select public.crear_ficha('Marga Orell Cernuda')")[0][0])
comprobar('dirección crea ficha', r == ('ok', 'marga-orell-cernuda'))
r = intenta(lambda: sql("select public.crear_ficha('Yésica Horcajada Domingo')")[0][0])
comprobar('slug sin tildes', r == ('ok', 'yesica-horcajada-domingo'))
como(MAT)
r = intenta(lambda: sql("select public.crear_ficha('Alguien Más')"))
comprobar('editor no crea fichas ajenas', r[0] == 'error')
r = intenta(lambda: sql("insert into public.fichas (slug, nombre) values ('x-y-z','X Y Z')"))
comprobar('editor no inserta directamente', r[0] == 'error')

# Mi ficha: se enlaza a la de su nombre
r = intenta(lambda: sql("select public.mi_ficha()")[0][0])
comprobar('mi_ficha enlaza la ficha existente', r[0] == 'ok' and r[1]['slug'] == 'marga-orell-cernuda')
como(None); r = sql("select perfil_id from public.fichas where slug='marga-orell-cernuda'") if False else None
sql("reset role"); comprobar('queda enlazada a su cuenta', sql("select perfil_id from public.fichas where slug='marga-orell-cernuda'")[0][0] == MAT)

# Otra cuenta con el mismo nombre no se la puede quedar
como(CLON)
r = intenta(lambda: sql("select public.mi_ficha()"))
comprobar('otra cuenta con el mismo nombre no la roba', r[0] == 'error' and 'otra cuenta' in r[1])

# Pendiente no tiene ficha
como(PEN)
comprobar('cuenta pendiente no crea ficha', intenta(lambda: sql("select public.mi_ficha()"))[0] == 'error')

# Editar su ficha
como(MAT)
r = intenta(lambda: sql("update public.fichas set bio='Profe de mates', frase='Las mates se viven', foto='https://x.supabase.co/a.webp', desde=2010, correo='marga@colegionsdolores.es' where slug='marga-orell-cernuda' returning bio"))
comprobar('edita su propia ficha', r[0] == 'ok' and r[1] == [('Profe de mates',)])
r = intenta(lambda: sql("update public.fichas set nombre='Otra Persona', perfil_id=null where slug='marga-orell-cernuda' returning nombre, slug"))
comprobar('no cambia su nombre ni su enlace', r[0] == 'ok' and r[1] == [('Marga Orell Cernuda', 'marga-orell-cernuda')])
r = intenta(lambda: sql("update public.fichas set bio='hackeado' where slug='yesica-horcajada-domingo' returning slug"))
comprobar('no edita fichas ajenas (0 filas)', r == ('ok', []))
r = intenta(lambda: sql("update public.fichas set correo='marga@gmail.com' where slug='marga-orell-cernuda'"))
comprobar('correo solo del colegio', r[0] == 'error')
r = intenta(lambda: sql("update public.fichas set foto='javascript:alert(1)' where slug='marga-orell-cernuda'"))
comprobar('foto solo https', r[0] == 'error')
r = intenta(lambda: sql("update public.fichas set desde=1900 where slug='marga-orell-cernuda'"))
comprobar('año imposible rechazado', r[0] == 'error')

# Dirección edita cualquiera y enlaza cuentas
como(DIR)
r = intenta(lambda: sql("update public.fichas set bio='Bilingüe' where slug='yesica-horcajada-domingo' returning bio"))
comprobar('dirección edita cualquiera', r == ('ok', [('Bilingüe',)]))
r = intenta(lambda: sql("select public.enlazar_ficha('yesica-horcajada-domingo', %s)", (OTR,)))
comprobar('dirección enlaza una cuenta', r[0] == 'ok')
como(OTR)
r = intenta(lambda: sql("update public.fichas set frase='Hola' where slug='yesica-horcajada-domingo' returning frase"))
comprobar('la cuenta enlazada ya puede editarla', r == ('ok', [('Hola',)]))
como(MAT)
comprobar('editor no enlaza', intenta(lambda: sql("select public.enlazar_ficha('marga-orell-cernuda', %s)", (OTR,)))[0] == 'error')
comprobar('editor no borra', intenta(lambda: sql("delete from public.fichas where slug='marga-orell-cernuda' returning slug")) == ('ok', []))

# Lectura pública sin el enlace a la cuenta
como(None)
r = intenta(lambda: sql("select slug, nombre, foto, bio from public.fichas order by slug"))
comprobar('público lee las fichas', r[0] == 'ok' and len(r[1]) == 2)
comprobar('público no ve a qué cuenta pertenece', intenta(lambda: sql("select perfil_id from public.fichas"))[0] == 'error')
comprobar('público no escribe', intenta(lambda: sql("update public.fichas set bio='x'"))[0] == 'error')
comprobar('público no llama a mi_ficha', intenta(lambda: sql("select public.mi_ficha()"))[0] == 'error')

# Blog: la entrada guarda la ficha del autor
como(MAT)
r = intenta(lambda: sql("insert into public.entradas (ambito_id, titulo, categoria, fecha) values ('dep-matematicas','Concurso de problemas','eso','2026-10-01') returning ficha")[0][0])
comprobar('entrada nueva lleva la ficha del autor', r == ('ok', 'marga-orell-cernuda'))
r = intenta(lambda: sql("update public.entradas set ficha='yesica-horcajada-domingo' where titulo='Concurso de problemas' returning ficha")[0][0])
comprobar('la ficha de una entrada no se cambia a mano', r == ('ok', 'marga-orell-cernuda'))

# Fotos: carpeta = slug
como(MAT)
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('personas', 'marga-orell-cernuda/foto.webp')"))
comprobar('sube foto a su carpeta', r[0] == 'ok')
r = intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('personas', 'yesica-horcajada-domingo/foto.webp')"))
comprobar('no sube foto a carpeta ajena', r[0] == 'error')
como(DIR)
comprobar('dirección sube a cualquier carpeta', intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('personas', 'yesica-horcajada-domingo/f.webp')"))[0] == 'ok')
como(None)
comprobar('anónimo no sube', intenta(lambda: sql("insert into storage.objects (bucket_id, name) values ('personas', 'marga-orell-cernuda/x.webp')"))[0] == 'error')

sql("reset role")
print(f'\n{total - fallos}/{total} correctas')
raise SystemExit(1 if fallos else 0)
