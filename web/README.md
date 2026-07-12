# ☕ Bruma Café — Sitio Web

Sitio web estático para **Bruma Café**, una cafetería artesanal que ofrece granos de origen, bebidas especiales y promociones mensuales. El proyecto está compuesto por páginas HTML puras con CSS y JavaScript sin frameworks ni dependencias de servidor.

---

## 📂 Estructura del proyecto

```
FRONTED_WEB-CartaMejorado/web/
├── index.html              # Página de inicio
├── CATALOGO.html           # Carta de productos con filtros y carrito
├── Promociones.html        # Promociones mensuales con filtros
├── carrito.html            # Carrito, checkout y boleta PDF
├── Direccion.html          # Ubicación y horarios
├── Registrarse.html        # Formulario de registro
│
├── Style_Theme.css         # Variables de paleta (modo claro / oscuro)
├── Style_header.css        # Header común a todas las páginas
├── Style_Footer.css        # Footer común a todas las páginas
├── Style_1.css             # Estilos de la página de inicio
├── Style_3.css             # Estilos de la página de Promociones
├── Style_3_dinamico.css    # Estilos dinámicos de Promociones (controlados por JS)
├── Style_4.css             # Estilos de la página de Registro
├── Style_5.css             # Estilos de la página de Ubicación
├── Style_6.css             # Estilos de la página de Catálogo
│
├── css/
│   ├── carrito.css         # Carrito, checkout y boleta (compartido)
│   ├── menu-responsive.css # Menú hamburguesa responsivo
│   ├── toast.css           # Notificaciones toast
│   ├── modal.css           # Modal genérico
│   ├── promo-detalle.css   # Overlay de detalle de promoción
│   ├── formulario-validacion.css
│   └── custom-select.css   # Dropdown personalizado (tema claro/oscuro)
│
├── js/
│   ├── Carrito.js          # Clase Carrito (localStorage, singleton global)
│   ├── CarritoPagina.js    # Lógica exclusiva de carrito.html
│   ├── HamburgerMenu.js    # Menú hamburguesa responsivo
│   ├── Toast.js            # Clase Toast (notificaciones modernas)
│   ├── Modal.js            # Clase Modal genérico
│   ├── FormValidator.js    # Validación de formularios
│   ├── PromoDetalle.js     # Overlay de detalle de promo
│   └── CustomSelect.js     # Dropdown personalizado (reemplaza el <select> nativo)
│
├── Scrip_catalogo.js       # Filtros, modal y carrito del Catálogo
├── Scrip_3.js              # Filtros y ordenamiento de Promociones
├── theme-toggle.js         # Alternancia modo claro / oscuro
├── intro.js                # Preloader y modal de bienvenida
│
├── Imagenes/               # Imágenes y SVG del sitio
│   ├── icono-carrito.svg       # Ícono carrito (nav, modo oscuro)
│   ├── icono-carrito-oscuro.svg# Ícono carrito (fondo claro)
│   ├── icono-ubicacion.svg     # Ícono de pin de ubicación
│   └── icono-eliminar.svg      # Ícono de basura/eliminar
├── Clasicos/               # Imágenes de cafés clásicos
├── Especiales/             # Imágenes de bebidas especiales
├── Bebidas refrescantes/   # Imágenes de bebidas frías
├── Calientes/              # Imágenes de bebidas calientes
├── Infusiones/             # Imágenes de tés e infusiones
├── Postres/                # Imágenes de postres
└── Extras/                 # Imágenes de extras
```

---

## 🚀 Cómo ejecutar el proyecto

El sitio es **100% estático** — no requiere Node.js, Python ni ningún servidor especial.

### Opción 1 — Abrir directamente en el navegador
1. Descarga o descomprime la carpeta del proyecto.
2. Abre `index.html` con cualquier navegador moderno (Chrome, Firefox, Edge, Safari).

### Opción 2 — Servidor local (recomendado para desarrollo)
Con Python instalado:
```bash
cd FRONTED_WEB-CartaMejorado/web
python -m http.server 8080
```
Luego visita `http://localhost:8080` en tu navegador.

Con Node.js y npx:
```bash
npx serve FRONTED_WEB-CartaMejorado/web
```

> **Nota sobre el PDF:** La generación de la boleta en PDF requiere que los scripts de CDN (html2canvas y jsPDF) se carguen correctamente. Con un servidor local funcionará sin problemas; abrir el archivo directamente en el sistema de archivos puede limitar la carga de recursos CORS.

---

## 🎨 Stack tecnológico

| Tecnología | Uso |
|---|---|
| HTML5 semántico | Estructura de todas las páginas |
| CSS3 (variables, grid, flexbox, media queries) | Estilos y modo claro/oscuro |
| JavaScript ES6+ (clases, async/await, template literals) | Interactividad sin frameworks |
| localStorage | Persistencia del carrito y favoritos |
| [html2canvas](https://html2canvas.hertzen.com/) (CDN) | Captura de pantalla de la boleta |
| [jsPDF](https://github.com/parallax/jsPDF) (CDN) | Generación de PDF de la boleta |
| Google Fonts (Playfair Display, Poppins) | Tipografía |

---

## ✅ Funcionalidades principales

- **Catálogo interactivo:** filtrado por categoría, estación y búsqueda en tiempo real; ordenamiento por nombre, precio y fecha.
- **Favoritos:** persisten en localStorage; se pueden filtrar con el botón "Ver favoritos".
- **Carrito:** agregar, eliminar, ajustar cantidades, vaciar; persiste entre páginas vía localStorage.
- **Checkout:** formulario con validación de nombre, apellido, DNI (8 dígitos), teléfono, correo, dirección y método de pago.
- **Boleta virtual:** se genera automáticamente al confirmar la compra, con datos del cliente y desglose de IGV.
- **Descarga de PDF:** la boleta se puede descargar como PDF con un solo clic.
- **Modo oscuro / claro:** alternancia persistente vía localStorage.
- **Responsive:** adaptado para móvil, tablet y escritorio.
- **Accesibilidad:** roles ARIA, aria-label, navegación con teclado, ESC para cerrar modales.

---

## 🐛 Bugs corregidos

1. **CSS roto en `Style_3.css` línea 5** — Un comentario de CSS malformado dejaba sin aplicar la propiedad `color` en el `body`. Corregido.
2. **Toggle de tema siempre leía mal el estado** — `theme-toggle.js` leía la variable `actual` con una expresión redundante que podía producir resultados incorrectos en ciertos navegadores. Simplificado y corregido.
3. **PDF de boleta no detectaba jsPDF correctamente** — La verificación de disponibilidad solo comprobaba `window.jspdf` (objeto contenedor) pero no `window.jspdf.jsPDF` (clase real). Corregido para verificar ambos.
4. **html2canvas sin soporte CORS** — Se añadió `useCORS: true` para que imágenes locales se capturen correctamente incluso cuando el sitio se sirve con un servidor.
5. **Botón eliminar usaba emoji `🗑`** — Reemplazado por SVG accesible con `aria-label` descriptivo.
6. **Evento de clic en eliminar fallaba si se cliqueaba el SVG interno** — Se usó `.closest()` en lugar de `.classList.contains()` directo para detectar el botón contenedor correctamente.
7. **`Scrip_3.js` usaba `window.onload`** — Reemplazado por `DOMContentLoaded` para evitar conflictos con otros listeners.
8. **`Scrip_3.js` tenía múltiples `console.log` de depuración** — Eliminados del código de producción.
9. **Atributo `lang` faltaba en `Direccion.html` y `Registrarse.html`** — Añadido `lang="es"` en el `<html>` para accesibilidad y SEO.
10. **Promo cards con fondo `background: white` hardcodeado** — Reemplazado por `var(--bg-surface)` para compatibilidad con modo oscuro.

---

## 🖼️ Íconos SVG añadidos

| Archivo | Uso |
|---|---|
| `Imagenes/icono-carrito.svg` | Carrito en la navegación (fondo oscuro) |
| `Imagenes/icono-carrito-oscuro.svg` | Carrito para fondos claros |
| `Imagenes/icono-ubicacion.svg` | Pin de ubicación en Direccion.html y footer |
| `Imagenes/icono-eliminar.svg` | Botón eliminar en el carrito |

---

© 2026 Bruma Café. Todos los derechos reservados.

---

## Últimas correcciones

**Fecha de actualización:** 12 de julio de 2026

### 1. Corrección en la descarga del PDF de boleta

- **Problema:** El PDF fallaba al capturar imágenes locales y el tamaño del documento era incorrecto en distintos navegadores.
- **Corrección en `js/CarritoPagina.js`:**
  - Cambiado `allowTaint: false` → `allowTaint: true` para permitir renderizar imágenes locales sin restricciones CORS innecesarias.
  - Añadidos `scrollX: -window.scrollX` y `scrollY: -window.scrollY` para corregir el offset de scroll en el momento de la captura.
  - Convertidas las dimensiones de `unit: "px"` a `unit: "mm"` (usando 96 DPI como referencia), resolviendo el problema de escala del PDF en distintas resoluciones.
  - Imagen exportada como JPEG (`quality: 0.95`) en lugar de PNG para mayor compatibilidad y menor tamaño de archivo.
  - Nombre del archivo generado ahora elimina caracteres especiales para mayor compatibilidad entre sistemas operativos.

### 2. Validación del teléfono — exactamente 9 dígitos

- **Archivos modificados:** `carrito.html`, `js/CarritoPagina.js`
- El campo acepta **únicamente dígitos del 0 al 9**.
- Se bloquean letras, símbolos y espacios mediante listeners `keydown` e `input`.
- Se limita automáticamente a 9 caracteres.
- El mensaje de error ahora indica con precisión: *"Debe tener exactamente 9 dígitos numéricos."*
- Atributos HTML añadidos: `maxlength="9"`, `pattern="[0-9]{9}"`, `inputmode="numeric"`.

### 3. Sustitución completa de emojis por íconos SVG

No quedan emojis visibles en ninguna página. Cada uno fue reemplazado por un ícono SVG profesional:

| Emoji eliminado | Reemplazado por | Ubicación |
|-----------------|-----------------|-----------|
| 🌙 | SVG luna (inline en JS) | Botón de tema (todas las páginas) |
| ☀️ | SVG sol (inline en JS) | Botón de tema al activar modo oscuro |
| 🔍 | `icono-buscar.svg` | Buscador en `CATALOGO.html` |
| ❤️ / ♡ | `icono-corazon.svg` / `icono-corazon-activo.svg` | Botones de favoritos en catálogo |
| 🏛️ | `icono-edificio.svg` | Pestañas de `Direccion.html` |
| ☕ | `icono-taza-cafe.svg` | Pestañas de `Direccion.html` |
| 🌿 | `icono-hoja.svg` | Pestañas de `Direccion.html` |
| 🕐 | `icono-horario.svg` | Sección horarios en `Direccion.html` |
| ☕ | *(eliminado del texto)* | Pseudo-elemento CSS en `Style_4.css` |
| ⚠ | `!` (CSS content) | `css/formulario-validacion.css` |
| ✓ / ✕ / ⚠ | Íconos SVG inline | `js/Toast.js` (notificaciones) |

**Nuevos archivos SVG en `Imagenes/`:** `icono-buscar.svg`, `icono-corazon.svg`, `icono-corazon-activo.svg`, `icono-edificio.svg`, `icono-taza-cafe.svg`, `icono-hoja.svg`, `icono-horario.svg`

### 4. Adaptación del modal de promociones al modo oscuro

- **Archivos modificados:** `css/promo-detalle.css`, `css/modal.css`
- Todos los colores hardcodeados (`#F5F1E9`, `#26382E`, `#667E6B`, `#fff`) reemplazados por variables CSS (`var(--bg-surface)`, `var(--text-primary)`, etc.).
- Añadidas reglas `[data-theme="dark"]` para sombras, fondo del overlay, colores de error/éxito y bordes.
- El botón de cerrar (esquina) ahora usa color y borde de las variables del tema.
- El campo de e-mail del formulario del modal adapta fondo, texto y borde al tema activo.
- El badge de descuento usa `var(--bg-header)` y `var(--text-on-dark)` para contraste óptimo en ambos modos.

### Archivos modificados en esta actualización

```
js/CarritoPagina.js          — PDF + validación teléfono
carrito.html                 — campo teléfono + botones cierre SVG
Scrip_catalogo.js            — íconos corazón SVG
theme-toggle.js              — íconos luna/sol SVG
js/Toast.js                  — íconos toast SVG
Scrip_3.js                   — mensaje sin emoji
Style_4.css                  — pseudo-elemento sin emoji
css/formulario-validacion.css — content sin emoji
css/promo-detalle.css         — modo oscuro completo
css/modal.css                 — modo oscuro completo
Style_5.css                  — regla .tab-icono
CATALOGO.html                — íconos SVG (35 corazones, buscador, chip)
Direccion.html               — íconos SVG en pestañas y sección horarios
Promociones.html             — botón tema SVG
index.html                   — botón tema SVG
Registrarse.html             — botón tema SVG
```

---

## Últimas mejoras

**Fecha de actualización:** 12 de julio de 2026

### 1. Rediseño visual completo del carrito

**Archivo modificado:** `css/carrito.css`

- Tarjetas de producto con borde izquierdo de acento en color marca, sombras en capas e imagen con contenedor dedicado (`.carrito-item-img-wrap`) con efecto zoom en hover.
- Selector de cantidad en forma de píldora (pill) con botones redondeados y efecto scale.
- Botón eliminar con hover en rojo translúcido.
- Estado vacío con animación de flotación continua.
- Panel de resumen con cabecera verde oscuro, total resaltado en color de marca y borde punteado entre filas.
- Formulario de checkout con header de color, etiquetas de sección, inputs con fondo adaptativo en focus.
- Boleta tipo ticket con efecto troquelado/perforado, cabecera de tabla verde, filas alternas y fila TOTAL destacada.
- Responsive: breakpoints a 920px y 600px.

### 2. Corrección definitiva de la descarga del PDF

**Archivo modificado:** `js/CarritoPagina.js`

Eliminada completamente la dependencia de html2canvas. La generación del PDF ahora usa **jsPDF directo** (API de texto y dibujo), resolviendo:
- Imágenes que no cargaban por restricciones de origen.
- Tamaño y escala incorrectos en distintos navegadores.
- Fallas al capturar overlays `position: fixed`.
- Incompatibilidades entre Chrome, Edge y Firefox.

La librería html2canvas también fue eliminada de `carrito.html`.

### 3. Nuevo diseño profesional de la boleta PDF

El PDF se genera en formato A4 e incluye:

| Sección | Contenido |
|---------|-----------|
| Cabecera | Fondo verde oscuro, logo, nombre del negocio |
| Info | N° de boleta, fecha y hora |
| Cliente | Nombre completo, DNI, teléfono, correo, dirección |
| Detalle | Tabla con cabecera verde, filas alternas y subtotales |
| Totales | Subtotal, IGV 18%, TOTAL (fila destacada) |
| Pago | Método de pago y observaciones |
| Agradecimiento | Mensaje en cursiva centrado |
| Pie de página | Dirección, teléfono y correo del café |

Compatible con Chrome, Edge y Firefox, sin errores de consola.

### 4. Mejoras en la validación del formulario

**Archivo modificado:** `js/CarritoPagina.js`

Validaciones antes de generar el PDF:
- Al menos 1 producto en el carrito.
- Total mayor a S/ 0.00.
- Teléfono exactamente 9 dígitos numéricos.
- Correo electrónico con formato válido.
- jsPDF disponible (mensaje amigable si no lo está).

Validaciones adicionales en el formulario:
- DNI: filtro automático solo dígitos + máximo 8 caracteres.
- Teléfono: filtro automático solo dígitos + máximo 9 + bloqueo keydown.
- Mensajes de error más claros y específicos.

### Archivos modificados en esta actualización

```
css/carrito.css          — rediseño visual completo
js/CarritoPagina.js      — PDF directo jsPDF + validaciones pre-PDF
carrito.html             — nueva estructura HTML boleta + checkout mejorado
README.md                — esta sección
```

---

## 🆕 Actualización v3 — Dropdowns, ícono de carrito y responsive

### 1. Dropdowns (`<select>`) totalmente tematizados

El menú desplegable nativo de un `<select>` lo dibuja el sistema operativo/navegador,
por lo que no se puede tematizar de forma consistente entre Chrome, Firefox, Safari,
etc. Para resolverlo de raíz se creó un **select personalizado** con HTML, CSS y
JavaScript que reemplaza visualmente al `<select>` nativo sin tocar la lógica
existente:

- **`js/CustomSelect.js`** (nuevo): progressive enhancement — busca todos los
  `<select>` de la página y les agrega un panel desplegable propio (`role="listbox"`),
  totalmente navegable con teclado (flechas, Home/End, Enter, Esc) y con foco
  visible. El `<select>` original se mantiene oculto pero **funcional** en el DOM:
  - `select.value`, `select.addEventListener("change", ...)`, `select.selectedIndex`
    y `select.disabled` siguen funcionando exactamente igual, así que
    `Scrip_catalogo.js`, `Scrip_3.js`, `CarritoPagina.js` y `FormValidator.js`
    **no necesitaron ninguna modificación**.
  - Si otro script asigna `select.value = "x"` directamente (como hace el botón
    "Restablecer" de Promociones), el panel visual se sincroniza solo.
  - Si `FormValidator`/`CarritoPagina` marcan el `<select>` con la clase
    `campo-error`, el dropdown personalizado refleja automáticamente el estado
    de error (borde rojo), gracias a un `MutationObserver`.
- **`css/custom-select.css`** (nuevo): usa las variables de `Style_Theme.css`
  (`--bg-surface`, `--bg-page`, `--border-color`, `--text-primary`,
  `--burnt-orange`, `--tan`) para que el panel se vea correctamente tanto en modo
  claro como oscuro, con buen contraste texto/fondo, hover e ítem seleccionado
  resaltado con el color de marca. Incluye 3 variantes visuales (`data-cs-skin`)
  que respetan el diseño original de cada sección:
  - `pill` → filtros "Ordenar por" / "Estación" de `CATALOGO.html`.
  - `underline` → filtros "Categoría" / "Ordenar por" de `Promociones.html`.
  - `boxed` → campo "Método de pago" del checkout en `carrito.html`.

**Archivos modificados:** `CATALOGO.html`, `Promociones.html`, `carrito.html`
(se añadió `data-cs-skin` a cada `<select>` y los `<link>`/`<script>` nuevos).

### 2. Ícono de carrito sin texto

Se eliminó la palabra "Carrito" del `<nav>` en las 6 páginas del sitio
(`index.html`, `CATALOGO.html`, `Promociones.html`, `Direccion.html`,
`Registrarse.html`, `carrito.html`). El enlace ahora muestra solo el ícono SVG
con su badge contador, manteniendo accesibilidad porque el `<a>` conserva
`aria-label="Ver carrito de compras"`.

**`css/carrito.css`:** el ícono ahora se ve como un botón circular con hover
suave (fondo `--tan`, ligero desplazamiento) y el contador pasó a mostrarse
como una insignia (badge) sobre la esquina del ícono, con transición "pop" al
agregar productos. En menú móvil (≤768px) el enlace vuelve a ocupar todo el
ancho de la fila, igual que el resto de enlaces del menú hamburguesa.

### 3. Mejoras responsive

- **`Style_3.css`** (Promociones): en pantallas ≤480px los selects "Categoría"
  y "Ordenar por" ahora se apilan en una columna a ancho completo (antes podían
  verse apretados en dos columnas), se oculta el separador vertical decorativo
  y los botones "Ver promoción del mes" / "Restablecer" también se apilan.
- El resto de breakpoints existentes (grid de productos, tarjetas, buscador,
  categorías con scroll horizontal, formularios) se revisaron y ya cubrían
  correctamente tablets y móviles; no requirieron cambios.

### Archivos nuevos

```
js/CustomSelect.js         — componente de select personalizado (reutilizable)
css/custom-select.css      — estilos del dropdown, con soporte modo claro/oscuro
```

### Archivos modificados

```
CATALOGO.html       — data-cs-skin en selects, <link>/<script> nuevos, sin texto "Carrito"
Promociones.html    — data-cs-skin en selects, <link>/<script> nuevos, sin texto "Carrito"
carrito.html         — data-cs-skin en select de pago, <link>/<script> nuevos, sin texto "Carrito"
index.html           — sin texto "Carrito" en el nav
Direccion.html        — sin texto "Carrito" en el nav
Registrarse.html      — sin texto "Carrito" en el nav
css/carrito.css       — ícono de carrito rediseñado (botón circular + badge)
Style_3.css            — filtros de Promociones apilados en móvil (≤480px)
```
