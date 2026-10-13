"""Pruebas del menú del comedor (supabase/09_comedor.sql): permisos por ámbito, lectura pública e historial.
Contra un PostgreSQL local, nunca contra el Supabase real. Mismo montaje que seguridad.py:
  psql -d nsd -f supabase/pruebas/simulacion-supabase.sql, luego 01..07 y 09, y python3 supabase/pruebas/comedor.py
"""
import psycopg2, json, uuid
cx = psycopg2.connect(host='127.0.0.1', dbname='nsd', user='postgres', password='pg'); cx.autocommit = True
cur = cx.cursor(); fallos = total = 0
def sql(q, a=None):
    cur.execute(q, a)
    try: return cur.fetchall()
    except psycopg2.ProgrammingError: return None
def ok(n, c):
    global fallos, total; total += 1; print('ok  ' if c else 'FALLO', n); fallos += (not c)
def intenta(f):
    try: return ('ok', f())
    except Exception as e: return ('error', str(e).split('\n')[0])
def como(uid, rol='authenticated'):
    sql('reset role')
    if uid: sql("select set_config('request.jwt.claims', %s, false)", (json.dumps({'sub': uid, 'role': rol}),))
    sql('set role ' + rol)
def alta(email):
    u = str(uuid.uuid4())
    sql("insert into auth.users (id,email,raw_user_meta_data,raw_app_meta_data,email_confirmed_at) values (%s,%s,'{}','{\"provider\":\"email\"}','now')", (u, email)); return u
sql('reset role')
for t in ['public.historial','public.contenidos','public.permisos','public.perfiles','auth.users']: sql('delete from ' + t)
cocina = alta('cocina@gmail.com'); otro = alta('otro@gmail.com'); sin = alta('sin@gmail.com')
for u, amb in ((cocina, ['comedor']), (otro, ['dep-matematicas'])):
    sql("update public.perfiles set estado='aprobado', rol='editor' where id=%s", (u,))
    for a in amb: sql("insert into public.permisos (perfil_id, ambito_id) values (%s,%s)", (u, a))
sql("update public.perfiles set estado='aprobado', rol='editor' where id=%s", (sin,))
mes = {'mes': 'Septiembre de 2026', 'archivo': 'https://x/y.pdf', 'dias': [{'fecha': '2026-09-01', 'primero': 'A', 'segundo': 'B'}]}
ins = "insert into public.contenidos (ambito_id, clave, valor) values (%s,%s,%s)"
como(cocina)
ok('con el ámbito comedor puede publicar un mes', intenta(lambda: sql(ins, ('comedor', 'mes_2026_09', json.dumps(mes))))[0] == 'ok')
ok('puede sustituirlo', intenta(lambda: sql("update public.contenidos set valor=%s where ambito_id='comedor' and clave='mes_2026_09'", (json.dumps(mes),)))[0] == 'ok')
ok('no puede escribir en otro ámbito', intenta(lambda: sql(ins, ('dep-matematicas', 'x', '{}')))[0] == 'error')
ok('no puede publicar en el blog', intenta(lambda: sql("insert into public.entradas (ambito_id,titulo,resumen,cuerpo,categoria,etiquetas,fecha,publicado) values ('dep-matematicas','t','','',null,'{}','2026-10-01',false)"))[0] == 'error')
como(otro)
ok('otro editor no toca el comedor', intenta(lambda: sql(ins, ('comedor', 'mes_2026_10', json.dumps(mes))))[0] == 'error')
n = intenta(lambda: sql("delete from public.contenidos where ambito_id='comedor'"))
sql('reset role'); ok('otro editor no borra el menú', sql("select count(*) from public.contenidos where ambito_id='comedor'")[0][0] == 1)
como(sin)
ok('editor sin ámbitos no puede', intenta(lambda: sql(ins, ('comedor', 'mes_2026_11', json.dumps(mes))))[0] == 'error')
como(None, 'anon')
ok('la web pública (anon) lee los menús', sql("select count(*) from public.contenidos where ambito_id='comedor' and clave like 'mes_%'")[0][0] == 1)
ok('anon no puede escribir', intenta(lambda: sql(ins, ('comedor', 'mes_2026_12', json.dumps(mes))))[0] == 'error')
sql('reset role')
h = sql("select accion, ambito_id, clave from public.historial where ambito_id='comedor' order by fecha")
ok('queda en el historial', len(h) >= 1 and h[0][2] == 'mes_2026_09')
como(cocina)
ok('quien tiene el ámbito puede quitar un mes', intenta(lambda: sql("delete from public.contenidos where ambito_id='comedor' and clave='mes_2026_09'"))[0] == 'ok')
big = dict(mes, dias=[{'fecha': '2026-09-01', 'primero': 'A' * 190, 'segundo': 'B'} for _ in range(31)])
ok('un mes completo cabe de sobra en una fila', len(json.dumps(big)) < 200000)
print(f'\n{total - fallos}/{total} correctas'); raise SystemExit(1 if fallos else 0)
