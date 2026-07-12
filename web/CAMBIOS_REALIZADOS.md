# 📋 CAMBIOS REALIZADOS — Bruma Café

Registro detallado de todas las mejoras, correcciones y optimizaciones aplicadas al proyecto.

---

## 🆕 v3 — Dropdowns personalizados, ícono de carrito y responsive

### Nuevo: `js/CustomSelect.js` + `css/custom-select.css`
Reemplaza visualmente los `<select>` nativos por un dropdown propio (HTML/CSS/JS)
que respeta el tema claro/oscuro en todos los navegadores, con navegación por
teclado y foco visible. El `<select>` original permanece en el DOM (oculto) para
que `Scrip_catalogo.js`, `Scrip_3.js`, `CarritoPagina.js` y `FormValidator.js`
sigan funcionando sin ningún cambio: `.value`, `.addEventListener("change")`,
asignaciones directas (`select.value = "x"`) y clases de error (`campo-error`)
se mantienen sincronizadas automáticamente con el panel visual.

Aplicado a:
- `CATALOGO.html` → `#ordenar`, `#estacion` (variante `pill`)
- `Promociones.html` → `#sel-categoria`, `#sel-orden` (variante `underline`)
- `carrito.html` → `#chk-metodo-pago` (variante `boxed`)

### `index.html`, `CATALOGO.html`, `Promociones.html`, `Direccion.html`, `Registrarse.html`, `carrito.html`
- Eliminado el texto `"Carrito"` del enlace de navegación; ahora solo se muestra
  el ícono SVG con el contador. Se conserva `aria-label="Ver carrito de compras"`
  en el `<a>` para no perder accesibilidad.

### `css/carrito.css`
- `.nav-carrito` rediseñado como botón circular (40×40px) con hover suave y el
  contador convertido en badge sobre la esquina del ícono.
- Selector reforzado `.menu a.nav-carrito` para que estas reglas tengan prioridad
  sobre la regla genérica `.menu a` de `Style_header.css`.
- Ajuste específico en menú móvil (≤768px) para que la fila del carrito luzca
  igual que el resto de enlaces del menú hamburguesa.

### `Style_3.css`
- En pantallas ≤480px, los selects de "Categoría"/"Ordenar por" en Promociones
  ahora se apilan a ancho completo en vez de amontonarse en dos columnas; se
  oculta el separador vertical decorativo (pensado solo para la fila horizontal)
  y los botones de acción también pasan a una columna.

---

## `index.html`
- Añadido `lang="es"` al elemento `<html>` (accesibilidad y SEO).
- Reemplazado emoji `🛒` en el enlace de carrito de la navegación por `<img src="Imagenes/icono-carrito.svg">` con `alt=""` y `aria-hidden="true"`.

---

## `CATALOGO.html`
- Reemplazado emoji `🛒` en el enlace de carrito de la navegación por `<img src="Imagenes/icono-carrito.svg">`.
- Reemplazado el texto `🛒 Agregar al carrito` en los **35 botones** `.btn-agregar-carrito` por SVG inline + texto, eliminando la dependencia de emojis del sistema operativo y garantizando apariencia consistente en todos los dispositivos.

---

## `Promociones.html`
- Añadido `lang="es"` al elemento `<html>`.
- Reemplazado emoji `🛒` en la navegación por `<img>` SVG.
- Mejorado el marcado semántico (`aria-label` en `<section>`).

---

## `carrito.html`
- Añadido `lang="es"` al elemento `<html>`.
- Reemplazado emoji `🛒` en la navegación por `<img>` SVG.
- Reemplazado emoji `🛒` en el estado vacío del carrito por SVG inline (`<svg>`), lo que permite que herede el color del contexto (`currentColor`).
- Corregido el orden de carga de librerías (html2canvas y jsPDF se cargan antes de CarritoPagina.js).

---

## `Direccion.html`
- Añadido `lang="es"` al elemento `<html>`.
- Reemplazado emoji `🛒` en la navegación por `<img>` SVG.
- Reemplazado emoji `📍` en el subtítulo del banner por `<img src="Imagenes/icono-ubicacion.svg">` con `filter: brightness(0) invert(1)` para verlo sobre fondo oscuro.
- Reemplazado emoji `📍` en el encabezado de la columna de ubicación por `<img src="Imagenes/icono-ubicacion.svg">`.

---

## `Registrarse.html`
- Añadido `lang="es"` al elemento `<html>`.
- Reemplazado emoji `🛒` en la navegación por `<img>` SVG.

---

## `Style_3.css`
- **Bug crítico corregido:** línea 5 tenía un comentario CSS roto (`/* Elim  color: var(--text-primary);`) que impedía que la propiedad `color` del `body` se aplicara. Reescrito limpiamente.
- Reemplazados todos los valores de color hardcodeados (`background: white`, `background: #26382E`, `#E5D7CC`, `color: #333`) en `.promo-card`, `.promo-card thead`, `.promo-card tbody`, `.promo-card tfoot` por variables CSS (`var(--bg-surface)`, `var(--bg-header)`, `var(--text-primary)`, `var(--border-color)`, `var(--tan)`).
- `.promo-card tbody tr:hover td` ahora usa `var(--bg-page)` en vez de un color fijo.
- Añadidas clases de utilidad `.banner-icono-ubicacion` e `.icono-columna-ubicacion` para los SVG de ubicación en `Direccion.html`.

---

## `Style_3_dinamico.css`
- **`.descuento-badge`:** cambiado de `background: linear-gradient(135deg, #C41E3A, #e53935)` (rojo brillante) a `var(--burnt-orange)` con texto `var(--text-on-dark)`, integrando el badge a la paleta de la marca en lugar de usar rojo de alerta.
- **`.precio-descuento`:** color cambiado de `#C41E3A` (rojo duro) a `var(--tan)` (marrón-naranja de la marca) para mantener coherencia visual.
- **`.precio-original`:** usa `var(--text-secondary)` en vez de `#999` fijo (no cambiaba en modo oscuro).
- **Colores de `thead` por mes:** todos los 12 gradientes reemplazados por versiones más oscuras/profundas que son legibles tanto sobre fondo claro como oscuro. Los `tfoot` ya no tienen colores claros hardcodeados; ahora usan `var(--bg-surface)` para adaptarse al tema.
- **`#toast`:** colores cambiados a `var(--bg-header)` y `var(--text-on-dark)` para respetar el modo activo. Añadido `border-radius: 8px` y `box-shadow` para mayor legibilidad.
- Añadida regla `:focus-visible` en `.promo-card` para accesibilidad con teclado.

---

## `css/carrito.css`
Rediseño completo de los estilos (sin cambios de funcionalidad):
- **Layout del carrito:** aplicado CSS Grid (`grid-template-columns: 1fr 360px`) para la vista de dos columnas en escritorio.
- **`.carrito-item`:** nuevo diseño en grid de 3 columnas (imagen, info, derecha); bordes redondeados (`border-radius: 16px`); sombra suave; animaciones de entrada y salida.
- **Imagen del producto:** muestra fondo `var(--bg-page)` y `object-fit: contain`, con tamaño 96×96px.
- **`.carrito-cantidad`:** control de cantidad rediseñado con bordes, hover de color naranja en los botones ±.
- **`.carrito-eliminar`:** botón limpio con borde transparente que aparece al hover; usa el SVG de `currentColor`.
- **`.carrito-resumen`:** tarjeta `sticky` con separadores y fila de total diferenciada con font-weight 700 y borde superior.
- **`.btn-carrito`:** sistema de botones unificado con variantes `.primario`, `.secundario` y `.peligro`; todos usan variables CSS.
- **`.checkout-overlay` / `.checkout-caja`:** añadido `backdrop-filter: blur(3px)`, animación de entrada con `scale + translateY`, y campo de errores con highlight rojo.
- **`.boleta-overlay` / `.boleta-caja`:** rediseño con `background: #ffffff` fijo (necesario para html2canvas), animación de entrada, y estilos de tabla mejorados con celda total diferenciada.
- Todos los valores de color reemplazados por variables CSS para compatibilidad con modo oscuro, excepto en el interior de la boleta (que siempre es blanca, para PDF).

---

## `js/CarritoPagina.js`
- **Bug de PDF corregido (#1):** la verificación de disponibilidad de jsPDF ahora comprueba `typeof window.jspdf !== "undefined" && typeof window.jspdf.jsPDF === "function"` (antes solo comprobaba `!window.jspdf`, que podía fallar si el objeto existía pero el constructor no).
- **Bug de PDF corregido (#2):** añadido `useCORS: true` y `allowTaint: false` a las opciones de `html2canvas` para permitir captura de imágenes locales correctamente, y `logging: false` para suprimir mensajes de depuración en consola.
- **Emoji `🗑` eliminado:** el botón eliminar ahora usa un SVG inline (definido en la constante `SVG_ELIMINAR`) con `aria-label` descriptivo por producto.
- **Bug de evento corregido:** los event listeners de `btn-sumar`, `btn-restar` y `carrito-eliminar` ahora usan `evento.target.closest(...)` en vez de `classList.contains(...)`, lo que evita que el clic sobre el SVG hijo del botón no sea detectado.
- Texto del botón PDF cambiado de `"Generando..."` a `"Generando…"` (elipsis tipográfica correcta).
- Añadido listener de tecla ESC para cerrar la boleta.

---

## `Scrip_catalogo.js`
- **Emoji `🛒` eliminado del modal:** el botón `.modal-agregar-carrito` ahora usa un SVG inline (`SVG_CARRITO_BTN`), manteniendo la coherencia con el resto del sitio.
- Eliminado el `console.warn` informativo en `agregarProductoAlCarrito` (ruidoso en producción).
- Código de la función `abrirModal` limpiado; sin cambios de comportamiento.

---

## `Scrip_3.js`
- **`window.onload` eliminado:** reemplazado por `DOMContentLoaded` (ya usado en el resto del sitio). `window.onload` puede sobrescribir otros listeners y se dispara más tarde de lo necesario.
- **Todos los `console.log` de depuración eliminados** (había 9 llamadas); se conserva solo el `console.error` en `CarritoPagina.js` para errores reales de PDF.
- Añadido `parseInt(..., 10)` explícito en todas las comparaciones de mes para evitar conversiones implícitas.
- Añadido `return 0` al final del comparador de `ordenarTarjetas` para evitar `undefined` cuando el criterio no coincide.
- Añadido manejo de `null` en `document.getElementById("contador-resultado")` antes de asignar `textContent`.

---

## `theme-toggle.js`
- **Bug de lógica corregido:** la función `toggleTheme` leía el atributo `data-theme` y luego lo comparaba en una expresión ternaria redundante (`=== 'dark' ? 'dark' : 'light'`). Simplificado a lectura directa del atributo y toggle limpio.

---

## `Imagenes/` — Nuevos archivos SVG

| Archivo | Descripción |
|---|---|
| `icono-carrito.svg` | Ícono de carrito de compras (trazo blanco/crema `#E4DBD1`) para la barra de navegación sobre fondo oscuro. |
| `icono-carrito-oscuro.svg` | Variante del carrito (trazo oscuro `#322817`) para usar sobre fondos claros si fuera necesario. |
| `icono-ubicacion.svg` | Pin de ubicación (trazo naranja `#A86D49`) para reemplazar el emoji `📍`. |
| `icono-eliminar.svg` | Ícono de papelera (trazo rojo `#c0392b`) para reemplazar el emoji `🗑` en el carrito. |

---

## Archivos NO modificados

Los siguientes archivos se mantienen sin cambios porque su código es correcto y no presentan los problemas identificados:

- `Style_1.css` — Estilos del home, correctos.
- `Style_4.css` — Estilos de Registro, correctos.
- `Style_5.css` — Estilos de Ubicación, correctos.
- `Style_6.css` — Estilos del Catálogo, correctos.
- `Style_header.css` — Header, correcto.
- `Style_Footer.css` — Footer, correcto.
- `css/menu-responsive.css` — Menú hamburguesa, correcto.
- `css/toast.css` — Estilos de Toast, correctos.
- `css/modal.css` — Estilos del modal genérico, correctos.
- `css/promo-detalle.css` — Overlay de promo, correcto.
- `js/Carrito.js` — Lógica del carrito, correcta.
- `js/HamburgerMenu.js` — Menú hamburguesa, correcto.
- `js/Toast.js` — Clase Toast, correcta.
- `js/Modal.js` — Clase Modal, correcta.
- `js/FormValidator.js` — Validador, correcto.
- `js/PromoDetalle.js` — Overlay de promo, correcto.
- `intro.js` — Preloader y modal de bienvenida, correcto.

---

_Cambios realizados el 11 de julio de 2026._
