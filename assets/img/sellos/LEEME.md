# Logos de programas y certificaciones

La tira de sellos sale al final de todas las páginas del colegio, encima de la
banda de contacto. Cada sello enseña su nombre escrito hasta que aparezca aquí
el archivo con su logo; en cuanto el archivo existe, el logo lo sustituye solo,
sin tocar el código.

## Lo que ya está puesto

Descargado de la web oficial de cada organización, en PNG con fondo
transparente:

| Archivo       | Sello                                        | De dónde sale                                                        |
|---------------|----------------------------------------------|----------------------------------------------------------------------|
| `beda.png`    | Programa BEDA                                | `ecmadrid.org` (Escuelas Católicas de Madrid, que dirige el programa) |
| `concee.png`  | CONCEE · Confederación de Centros Educativos | `concee.es`                                                          |
| `facepm.png`  | FACEPM                                       | `facepm.es`                                                          |

FACEPM es la **Federación Autonómica de Centros de Enseñanza Privada de
Madrid**; el nombre completo ya está puesto en el sello.

## Lo que falta

Estos cuatro siguen saliendo con el nombre escrito. Para que aparezca el logo
hay que hacer dos cosas: dejar el archivo aquí con el nombre exacto de la
tabla, y poner `true` en su línea de `assets/js/partials.js` (constante
`SELLOS`). Lo segundo hace falta porque, si se pide un archivo que no está,
queda un error 404 en la consola de todas las páginas.

| Archivo               | Sello                                                 | Por qué no está |
|-----------------------|-------------------------------------------------------|-----------------|
| `beda-kids.png`       | Programa BEDA Kids                                    | Escuelas Católicas no publica el logo suelto en su web. Lo tendrá secretaría en el material de BEDA. |
| `cambridge.png`       | Cambridge Assessment English · Authorised Exam Centre | Cambridge no da este logo por descarga: entrega a cada centro examinador su propio archivo. Hay que pedirlo al contacto de Cambridge del colegio. **No vale el logo genérico de Cambridge English**: es una marca distinta y su uso está licenciado. |
| `cardioprotegido.png` | Centro cardioprotegido                                | No hay un logo único: cada certificadora (la empresa del desfibrilador, Cruz Roja, la Comunidad…) tiene el suyo. Hay que usar el de quien certificó el centro. |
| `bilingue.png`        | Centro bilingüe                                       | Falta saber a qué programa se refiere. Si es el programa bilingüe de la Comunidad de Madrid tiene logo oficial propio; si es el bilingüismo de BEDA, sobra el sello porque BEDA ya está arriba. |

## Cómo deben venir los archivos

- PNG con fondo transparente (o SVG, cambiando la extensión en `partials.js`).
- Unos 400 px de ancho como mínimo, para que se vean bien en pantallas retina.
- Se muestran con 60 px de alto y 76 % de ancho como máximo, lo que ocurra
  antes: así un logo apaisado no pesa el triple que uno compacto.
- La baldosa se pone blanca en cuanto hay logo, en los dos temas, porque los
  logos oficiales vienen pensados para fondo claro.

## Añadir o quitar un sello

La lista está en `assets/js/partials.js`, en la constante `SELLOS`: cada línea
es `['nombre-del-archivo', 'Texto que se ve si no hay logo']`.

## Marcas de terceros

Estos logos son marcas registradas de sus organizaciones. El colegio puede
mostrarlos porque participa en esos programas, pero conviene usar siempre el
archivo que la propia organización le haya entregado: algunas tienen normas de
uso (tamaño mínimo, espacio alrededor, versiones permitidas).
