#!/usr/bin/env python3
"""Genera el subconjunto de Bootstrap Icons que usa la web.

La librería completa son 2.050 iconos (130 KB de fuente + 86 KB de CSS);
la web usa menos de 200. Este script busca qué iconos aparecen en el HTML
y el JS (bi-nombre) y crea:

  assets/vendor/bootstrap-icons/fonts/iconos-nsd.woff2
  assets/vendor/bootstrap-icons/iconos-nsd.css

Uso (desde la raíz del repositorio, con fonttools y brotli instalados):
  pip install fonttools brotli
  python3 scripts/iconos.py

Vuelve a ejecutarlo si añades un icono nuevo. Si un nombre no existe en
Bootstrap Icons, el script avisa y para.
"""
import glob, hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
VENDOR = 'assets/vendor/bootstrap-icons'
css = open(f'{VENDOR}/bootstrap-icons.min.css', encoding='utf-8').read()
mapa = dict(re.findall(r'\.bi-([a-z0-9-]+)::before\{content:"\\([0-9a-f]+)"\}', css))

usados = set()
for f in glob.glob('**/*', recursive=True):
    if f.startswith(('assets/vendor', '.git', 'docs', 'supabase', 'node_modules', 'scripts')):
        continue
    if not f.endswith(('.html', '.js', '.mjs', '.json')):
        continue
    texto = open(f, encoding='utf-8', errors='ignore').read()
    # Solo nombres de icono: «bi bi-x», 'bi-x', icono: 'bi-x'…
    usados |= set(re.findall(r'(?<![a-z0-9-])bi-([a-z0-9]+(?:-[a-z0-9]+)*)', texto))

faltan = sorted(u for u in usados if u not in mapa)
# Palabras que contienen «bi-» y no son iconos
faltan = [u for u in faltan if u not in {'lingue', 'lingues'}]
if faltan:
    sys.exit('Iconos que no existen en Bootstrap Icons: ' + ', '.join(faltan))

usados = sorted(u for u in usados if u in mapa)
salida = f'{VENDOR}/fonts/iconos-nsd.woff2'
subprocess.run(['pyftsubset', f'{VENDOR}/fonts/bootstrap-icons.woff2',
                '--unicodes=' + ','.join('U+' + mapa[u] for u in usados),
                '--flavor=woff2', '--layout-features=', '--no-hinting',
                '--output-file=' + salida], check=True)
huella = hashlib.md5(open(salida, 'rb').read()).hexdigest()[:10]
base = re.search(r'\.bi::before,\[class\*=" bi-"\]::before,\[class\^=bi-\]::before\{[^}]*\}', css).group(0)
nuevo = ('/*! Bootstrap Icons v1.11.3 (MIT, https://icons.getbootstrap.com/). Subconjunto con los '
         f'{len(usados)} iconos que usa la web.\n   Lo genera scripts/iconos.py: si añades un icono, vuelve a ejecutarlo. */\n'
         f'@font-face{{font-display:block;font-family:bootstrap-icons;src:url("fonts/iconos-nsd.woff2?{huella}") format("woff2")}}'
         + base + ''.join(f'.bi-{u}::before{{content:"\\{mapa[u]}"}}' for u in usados) + '\n')
open(f'{VENDOR}/iconos-nsd.css', 'w', encoding='utf-8').write(nuevo)
print(f'{len(usados)} iconos · fuente {os.path.getsize(salida)} B · css {len(nuevo)} B')
