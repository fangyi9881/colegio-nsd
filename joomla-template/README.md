# Plantilla Joomla – Colegio NSD

Plantilla **frontend** para Joomla 4 / 5, basada en el rediseño visual de la web del Colegio Nuestra Señora de los Dolores.

## Estructura

```
joomla-template/
├── templateDetails.xml      ← Manifiesto de la plantilla
├── index.php                ← Layout principal (jdoc:include)
├── error.php                ← Página de error
├── offline.php              ← Página de mantenimiento
├── component.php            ← Vista sin chrome (modales, impresión)
├── css/
│   ├── template.css         ← Sistema de diseño
│   └── pages.css            ← Páginas internas
├── js/
│   └── template.js          ← Interacciones
├── images/
│   ├── logo.svg
│   └── og-cover.svg
├── html/
│   └── mod_menu/default.php ← Override del menú principal
└── language/
    ├── es-ES/
    └── en-GB/
```

## Posiciones de módulos

- `topbar` `menu` `quick-access`
- `banner` `features` (home)
- `news` `secretaria` `servicios` (home)
- `footer-1` … `footer-4`
- `copyright` `debug`

## Instalación

1. Comprime la carpeta `joomla-template` en un ZIP llamado `tpl_colegio_nsd.zip`.
2. En Joomla: Sistema → Extensiones → Instalar → Subir paquete.
3. Plantillas de sitio → marca **Colegio NSD** como predeterminada.
4. Configura los parámetros (logo, colores, teléfono, email).
5. Asigna módulos a cada posición.

## Compatibilidad

- Joomla **4.x** y **5.x**
- PHP 8.1+
- Necesita Internet para Google Fonts y Bootstrap Icons (puedes alojarlos en local si quieres).

## Personalización rápida

En el panel de la plantilla:
- **Color principal** → cambia el verde institucional
- **Color de acento** → cambia el amarillo
- **Logo** → archivo SVG/PNG
