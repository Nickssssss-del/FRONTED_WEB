/* =============================================================
   Lógica exclusiva de carrito.html:
   - Renderiza los productos guardados en el carrito (window.carrito,
     definido en js/Carrito.js).
   - Maneja los botones +/-, eliminar y vaciar carrito.
   - Controla el formulario de "Finalizar compra".
   - Genera la boleta virtual y su descarga en PDF (jsPDF directo).
   ============================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(inicializarPaginaCarrito, 0);
});

/* SVG del ícono eliminar (inline) */
const SVG_ELIMINAR = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  <path d="M10 11v6"/><path d="M14 11v6"/>
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
</svg>`;

function inicializarPaginaCarrito() {
    if (!window.carrito) {
        console.warn("CarritoPagina: la instancia global 'carrito' no está disponible.");
        return;
    }

    const carritoVacioEl   = document.getElementById("carrito-vacio");
    const layoutEl         = document.getElementById("carrito-layout");
    const listaEl          = document.getElementById("carrito-lista");
    const resumenTextoEl   = document.getElementById("carrito-resumen-texto");

    const resumenSubtotalEl = document.getElementById("resumen-subtotal");
    const resumenIgvEl      = document.getElementById("resumen-igv");
    const resumenTotalEl    = document.getElementById("resumen-total");

    const btnVaciar    = document.getElementById("btn-vaciar-carrito");
    const btnFinalizar = document.getElementById("btn-finalizar-compra");

    /* ---------- RENDER PRINCIPAL DEL CARRITO ---------- */
    function render() {
        const resumen = window.carrito.obtenerResumen();

        if (resumen.items.length === 0) {
            carritoVacioEl.hidden = false;
            layoutEl.hidden = true;
            resumenTextoEl.textContent = "Tu carrito está vacío por ahora.";
            listaEl.innerHTML = "";
            resumenSubtotalEl.textContent = Carrito.formatearMoneda(0);
            resumenIgvEl.textContent      = Carrito.formatearMoneda(0);
            resumenTotalEl.textContent    = Carrito.formatearMoneda(0);
            return;
        }

        carritoVacioEl.hidden = true;
        layoutEl.hidden = false;
        resumenTextoEl.textContent = `Tienes ${resumen.cantidadTotal} producto(s) en tu carrito.`;

        listaEl.innerHTML = resumen.items.map(item => `
            <div class="carrito-item item-entrando" data-id="${item.id}">
                <div class="carrito-item-img-wrap">
                    <img src="${item.imagen}" alt="${item.nombre}" loading="lazy">
                </div>
                <div class="carrito-item-info">
                    <h3>${item.nombre}</h3>
                    <p class="carrito-item-precio">${Carrito.formatearMoneda(item.precio)} c/u</p>
                    <div class="carrito-cantidad">
                        <button type="button" class="btn-restar" aria-label="Disminuir cantidad">−</button>
                        <input type="number" min="1" value="${item.cantidad}" class="input-cantidad" aria-label="Cantidad">
                        <button type="button" class="btn-sumar" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
                <div class="carrito-item-derecha">
                    <span class="carrito-item-subtotal">${Carrito.formatearMoneda(item.precio * item.cantidad)}</span>
                    <button type="button" class="carrito-eliminar" aria-label="Eliminar ${item.nombre}">${SVG_ELIMINAR}</button>
                </div>
            </div>
        `).join("");

        resumenSubtotalEl.textContent = Carrito.formatearMoneda(resumen.subtotal);
        resumenIgvEl.textContent      = Carrito.formatearMoneda(resumen.igv);
        resumenTotalEl.textContent    = Carrito.formatearMoneda(resumen.total);
    }

    /* Delegación de eventos */
    listaEl.addEventListener("click", (evento) => {
        const fila = evento.target.closest(".carrito-item");
        if (!fila) return;
        const id = fila.dataset.id;

        if (evento.target.closest(".btn-sumar")) {
            window.carrito.incrementar(id);
        } else if (evento.target.closest(".btn-restar")) {
            window.carrito.decrementar(id);
        } else if (evento.target.closest(".carrito-eliminar")) {
            fila.classList.add("item-saliendo");
            setTimeout(() => window.carrito.eliminar(id), 220);
            return;
        }
    });

    listaEl.addEventListener("change", (evento) => {
        if (!evento.target.classList.contains("input-cantidad")) return;
        const fila = evento.target.closest(".carrito-item");
        window.carrito.actualizarCantidad(fila.dataset.id, evento.target.value);
    });

    btnVaciar.addEventListener("click", () => {
        if (window.carrito.obtenerCantidadTotal() === 0) return;
        listaEl.classList.add("vaciando");
        setTimeout(() => {
            window.carrito.vaciar();
            listaEl.classList.remove("vaciando");
        }, 280);
    });

    document.addEventListener("carrito:cambio", render);
    render();

    /* ---------- FORMULARIO DE COMPRA ---------- */
    const checkoutOverlay     = document.getElementById("checkout-overlay");
    const formCheckout        = document.getElementById("form-checkout");
    const btnCancelarCheckout = document.getElementById("btn-cancelar-checkout");
    const btnCerrarCheckout   = document.getElementById("checkout-cerrar");

    const reglasCheckout = {
        nombre:     (v) => (!v.trim() ? "Ingresa tu nombre."     : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(v) ? "Nombre inválido."                          : null)),
        apellido:   (v) => (!v.trim() ? "Ingresa tu apellido."   : (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(v) ? "Apellido inválido."                        : null)),
        dni:        (v) => (!v.trim() ? "Ingresa tu DNI."        : (!/^\d{8}$/.test(v)                        ? "El DNI debe tener exactamente 8 dígitos."   : null)),
        telefono:   (v) => (!v.trim() ? "Ingresa tu teléfono."   : (!/^\d{9}$/.test(v.trim())                 ? "Debe tener exactamente 9 dígitos numéricos." : null)),
        correo:     (v) => (!v.trim() ? "Ingresa tu correo."     : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)     ? "Ingresa un correo electrónico válido (ejemplo: nombre@correo.com)."      : null)),
        direccion:  (v) => (!v.trim() ? "Ingresa tu dirección."  : null),
        metodoPago: (v) => (!v        ? "Selecciona un método."  : null),
    };

    function validarCampoCheckout(nombreCampo) {
        const input     = formCheckout.querySelector(`[data-campo="${nombreCampo}"]`);
        const mensajeEl = formCheckout.querySelector(`[data-error-de="${nombreCampo}"]`);
        const regla     = reglasCheckout[nombreCampo];
        if (!input || !regla) return true;

        const error = regla(input.value);
        input.classList.toggle("campo-error", Boolean(error));
        input.setAttribute("aria-invalid", String(Boolean(error)));

        if (mensajeEl) {
            mensajeEl.textContent = error || "";
            /* Mismo mecanismo que el formulario de Registrarse.html
               (ver css/formulario-validacion.css: .mensaje-error--visible),
               así el mensaje de error se muestra/oculta igual en ambos
               formularios, con el mismo ícono "!". */
            mensajeEl.classList.toggle("mensaje-error--visible", Boolean(error));
        }
        return !error;
    }

    Object.keys(reglasCheckout).forEach((nombreCampo) => {
        const input = formCheckout.querySelector(`[data-campo="${nombreCampo}"]`);
        if (!input) return;
        input.addEventListener("blur", () => validarCampoCheckout(nombreCampo));
    });

    /* Teléfono: solo dígitos, máximo 9 */
    const inputTel = formCheckout.querySelector('[data-campo="telefono"]');
    if (inputTel) {
        inputTel.addEventListener("input", () => {
            const soloDigitos = inputTel.value.replace(/\D/g, "").slice(0, 9);
            if (inputTel.value !== soloDigitos) inputTel.value = soloDigitos;
        });
        inputTel.addEventListener("keydown", (e) => {
            const permitidas = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End"];
            if (!/^\d$/.test(e.key) && !permitidas.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
            }
        });
    }

    /* DNI: solo dígitos, máximo 8 */
    const inputDni = formCheckout.querySelector('[data-campo="dni"]');
    if (inputDni) {
        inputDni.addEventListener("input", () => {
            const soloDigitos = inputDni.value.replace(/\D/g, "").slice(0, 8);
            if (inputDni.value !== soloDigitos) inputDni.value = soloDigitos;
        });
    }

    function abrirCheckout() {
        if (window.carrito.obtenerCantidadTotal() === 0) return;
        checkoutOverlay.classList.add("visible");
        document.body.style.overflow = "hidden";
    }

    function cerrarCheckout() {
        checkoutOverlay.classList.remove("visible");
        document.body.style.overflow = "";
    }

    btnFinalizar.addEventListener("click", abrirCheckout);
    btnCancelarCheckout.addEventListener("click", cerrarCheckout);
    btnCerrarCheckout.addEventListener("click", cerrarCheckout);
    checkoutOverlay.addEventListener("click", (e) => { if (e.target === checkoutOverlay) cerrarCheckout(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && checkoutOverlay.classList.contains("visible")) cerrarCheckout();
    });

    formCheckout.addEventListener("submit", (evento) => {
        evento.preventDefault();

        /* --- Validación pre-compra completa --- */
        const resumenActual = window.carrito.obtenerResumen();

        // 1. Verificar que haya productos
        if (resumenActual.items.length === 0) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "error",
                    titulo: "Carrito vacío",
                    mensaje: "Agrega al menos un producto antes de continuar.",
                    duracion: 4000
                });
            }
            return;
        }

        // 2. Verificar que el total sea mayor a cero
        if (resumenActual.total <= 0) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "error",
                    titulo: "Total inválido",
                    mensaje: "El total de la compra debe ser mayor a S/ 0.00.",
                    duracion: 4000
                });
            }
            return;
        }

        // 3. Validar todos los campos del formulario
        const camposValidos = Object.keys(reglasCheckout)
            .map(validarCampoCheckout)
            .every(Boolean);

        if (!camposValidos) {
            const primerError = formCheckout.querySelector(".campo-error");
            if (primerError) primerError.focus();
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "error",
                    titulo: "Revisa el formulario",
                    mensaje: "Hay campos incompletos o con errores.",
                    duracion: 4500
                });
            }
            return;
        }

        const datosCliente = {
            nombre:        formCheckout.querySelector('[data-campo="nombre"]').value.trim(),
            apellido:      formCheckout.querySelector('[data-campo="apellido"]').value.trim(),
            dni:           formCheckout.querySelector('[data-campo="dni"]').value.trim(),
            telefono:      formCheckout.querySelector('[data-campo="telefono"]').value.trim(),
            correo:        formCheckout.querySelector('[data-campo="correo"]').value.trim(),
            direccion:     formCheckout.querySelector('[data-campo="direccion"]').value.trim(),
            metodoPago:    formCheckout.querySelector('[data-campo="metodoPago"]').value,
            observaciones: formCheckout.querySelector('[data-campo="observaciones"]').value.trim(),
        };

        cerrarCheckout();

        /* Función que limpia el carrito y el formulario una vez que el
           flujo de pago (ventana emergente) haya concluido con éxito. */
        function continuarLuegoDePago() {
            generarYMostrarBoleta(datosCliente);

            window.carrito.vaciar();
            formCheckout.reset();
            formCheckout.querySelectorAll(".campo-error").forEach(el => el.classList.remove("campo-error"));
            formCheckout.querySelectorAll(".mensaje-error--visible").forEach(el => {
                el.classList.remove("mensaje-error--visible");
                el.textContent = "";
            });
        }

        /* Según el método de pago elegido, se abre la ventana emergente
           correspondiente (Yape, Transferencia, POS o Efectivo). Solo al
           confirmar el pago en esa ventana se genera la boleta. Si por
           algún motivo el gestor de modales no está disponible, se
           continúa directamente para no bloquear la compra. */
        if (window.gestorPagoModales) {
            window.gestorPagoModales.iniciarPago(datosCliente.metodoPago, resumenActual.total, continuarLuegoDePago);
        } else {
            continuarLuegoDePago();
        }
    });

    /* ---------- GENERACIÓN DE BOLETA ---------- */
    const boletaOverlay   = document.getElementById("boleta-overlay");
    const btnCerrarBoleta = document.getElementById("btn-cerrar-boleta");
    const boletaCerrarX   = document.getElementById("boleta-cerrar");
    const btnDescargarPdf = document.getElementById("btn-descargar-pdf");

    /* Almacena los datos de la última compra para el PDF */
    let ultimaCompra = null;

    function generarNumeroBoleta() {
        const clave     = "bruma_ultimo_numero_boleta";
        const anterior  = parseInt(localStorage.getItem(clave) || "0", 10);
        const siguiente = anterior + 1;
        localStorage.setItem(clave, String(siguiente));
        return "B001-" + String(siguiente).padStart(6, "0");
    }

    function generarYMostrarBoleta(datosCliente) {
        const resumen = window.carrito.obtenerResumen();
        if (resumen.items.length === 0) return;

        const ahora        = new Date();
        const fecha        = ahora.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
        const hora         = ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
        const numeroBoleta = generarNumeroBoleta();

        /* Guardar para el PDF */
        ultimaCompra = { datosCliente, resumen, numeroBoleta, fecha, hora };

        /* --- Llenar el HTML de la boleta --- */

        // Info bloque: número, fecha, hora
        const elNumBoleta = document.getElementById("boleta-numero-val");
        const elFecha     = document.getElementById("boleta-fecha-val");
        const elHora      = document.getElementById("boleta-hora-val");
        if (elNumBoleta) elNumBoleta.textContent = numeroBoleta;
        if (elFecha)     elFecha.textContent     = fecha;
        if (elHora)      elHora.textContent      = hora;

        // También actualizar el elemento legacy por si existe
        const legacyNum = document.getElementById("boleta-numero");
        if (legacyNum) legacyNum.textContent = `Boleta N° ${numeroBoleta} · ${fecha} ${hora}`;

        // Datos del cliente
        document.getElementById("boleta-datos-cliente").innerHTML = `
            <strong>${datosCliente.nombre} ${datosCliente.apellido}</strong><br>
            <span>DNI: ${datosCliente.dni}</span> &nbsp;·&nbsp; <span>Tel: ${datosCliente.telefono}</span><br>
            <span>${datosCliente.correo}</span><br>
            <span>Entrega: ${datosCliente.direccion}</span>
        `;

        // Productos
        document.getElementById("boleta-productos").innerHTML = resumen.items.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td class="num">${item.cantidad}</td>
                <td class="num">${Carrito.formatearMoneda(item.precio)}</td>
                <td class="num">${Carrito.formatearMoneda(item.precio * item.cantidad)}</td>
            </tr>
        `).join("");

        // Totales
        document.getElementById("boleta-totales").innerHTML = `
            <div class="boleta-fila-total"><span>Subtotal</span><span>${Carrito.formatearMoneda(resumen.subtotal)}</span></div>
            <div class="boleta-fila-total"><span>IGV (18%)</span><span>${Carrito.formatearMoneda(resumen.igv)}</span></div>
            <div class="boleta-fila-total boleta-total-final"><span>TOTAL</span><span>${Carrito.formatearMoneda(resumen.total)}</span></div>
        `;

        // Método de pago
        let pagoTxt = `<strong>Método de pago:</strong> ${datosCliente.metodoPago}`;
        if (datosCliente.observaciones) pagoTxt += `<br><strong>Obs.:</strong> ${datosCliente.observaciones}`;
        document.getElementById("boleta-metodo-pago").innerHTML = pagoTxt;

        boletaOverlay.classList.add("visible");
        document.body.style.overflow = "hidden";

        if (window.carrito.toast) {
            window.carrito.toast.mostrar({
                tipo: "exito",
                titulo: "¡Compra realizada!",
                mensaje: `Tu boleta ${numeroBoleta} se generó correctamente.`,
                duracion: 5000
            });
        }
    }

    function cerrarBoleta() {
        boletaOverlay.classList.remove("visible");
        document.body.style.overflow = "";
    }

    btnCerrarBoleta.addEventListener("click", cerrarBoleta);
    boletaCerrarX.addEventListener("click",   cerrarBoleta);
    boletaOverlay.addEventListener("click", (e) => { if (e.target === boletaOverlay) cerrarBoleta(); });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && boletaOverlay.classList.contains("visible")) cerrarBoleta();
    });

    /* =============================================================
       GENERACIÓN DE PDF — jsPDF directo (sin html2canvas)
       Genera el PDF a partir de los datos en memoria, garantizando
       compatibilidad en Chrome, Edge y Firefox y layout A4 correcto.
       ============================================================= */
    btnDescargarPdf.addEventListener("click", async () => {

        /* --- Validaciones pre-PDF --- */
        if (!ultimaCompra) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "advertencia",
                    titulo: "Sin datos de boleta",
                    mensaje: "Completa una compra primero para generar la boleta.",
                    duracion: 4500
                });
            }
            return;
        }

        const { datosCliente, resumen, numeroBoleta, fecha, hora } = ultimaCompra;

        if (resumen.items.length === 0) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({ tipo: "error", titulo: "Sin productos", mensaje: "La boleta no tiene productos.", duracion: 4000 });
            }
            return;
        }
        if (resumen.total <= 0) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({ tipo: "error", titulo: "Total inválido", mensaje: "El total de la boleta debe ser mayor a S/ 0.00.", duracion: 4000 });
            }
            return;
        }
        if (!/^\d{9}$/.test(datosCliente.telefono)) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({ tipo: "error", titulo: "Teléfono inválido", mensaje: "El teléfono debe tener exactamente 9 dígitos.", duracion: 4000 });
            }
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.correo)) {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({ tipo: "error", titulo: "Correo inválido", mensaje: "El correo electrónico del cliente no es válido.", duracion: 4000 });
            }
            return;
        }

        /* Verificar que jsPDF esté disponible */
        if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF !== "function") {
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "error",
                    titulo: "Librería no cargada",
                    mensaje: "No se pudo cargar jsPDF. Verifica tu conexión a internet.",
                    duracion: 6000
                });
            }
            return;
        }

        /* Estado del botón durante la generación */
        btnDescargarPdf.disabled    = true;
        const textoOriginal         = btnDescargarPdf.textContent;
        btnDescargarPdf.textContent = "Generando…";

        try {
            await generarPDFDirecto(datosCliente, resumen, numeroBoleta, fecha, hora);
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            if (window.carrito.toast) {
                window.carrito.toast.mostrar({
                    tipo: "error",
                    titulo: "Error al generar el PDF",
                    mensaje: "Ocurrió un problema al exportar la boleta. Intenta nuevamente.",
                    duracion: 5000
                });
            }
        } finally {
            btnDescargarPdf.disabled    = false;
            btnDescargarPdf.textContent = textoOriginal;
        }
    });

    /* =============================================================
       FUNCIÓN: generarPDFDirecto
       Construye el PDF usando la API de texto/dibujo de jsPDF.
       No depende de html2canvas; funciona en cualquier navegador.
       ============================================================= */
    async function generarPDFDirecto(datosCliente, resumen, numeroBoleta, fecha, hora) {
        const { jsPDF } = window.jspdf;

        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

        const W  = doc.internal.pageSize.getWidth();   // 210 mm
        const H  = doc.internal.pageSize.getHeight();  // 297 mm
        const ML = 18;  // margen izquierdo
        const MR = 18;  // margen derecho
        const CW = W - ML - MR;  // ancho del contenido = 174 mm

        /* ─── Paleta de colores ─── */
        const C_VERDE   = [27,  45,  41];   // #1b2d29 — verde oscuro del header
        const C_CAFE    = [84,  71,  54];   // #544736 — burnt orange
        const C_TAN     = [168, 150, 130];  // #a89682
        const C_CREMA   = [239, 232, 223];  // #EFE8DF
        const C_TEXTO   = [50,  40,  23];   // #322817
        const C_GRIS    = [110, 100,  88];
        const C_GRIS_L  = [220, 210, 195];
        const C_BLANCO  = [255, 255, 255];
        const C_FILA_A  = [250, 248, 244];  // fila alterna de tabla

        /* ─── Helpers ─── */
        const setFont = (style, size) => {
            doc.setFont("helvetica", style);
            doc.setFontSize(size);
        };
        const setColor = (rgb) => doc.setTextColor(...rgb);
        const solidLine = (y, r = C_GRIS_L) => {
            doc.setDrawColor(...r);
            doc.setLineWidth(0.3);
            doc.setLineDashPattern([], 0);
            doc.line(ML, y, W - MR, y);
        };
        const dashedLine = (y) => {
            doc.setDrawColor(...C_GRIS_L);
            doc.setLineWidth(0.25);
            doc.setLineDashPattern([2, 2], 0);
            doc.line(ML, y, W - MR, y);
            doc.setLineDashPattern([], 0);
        };
        const fillRect = (x, y, w, h, rgb) => {
            doc.setFillColor(...rgb);
            doc.rect(x, y, w, h, "F");
        };

        let y = 0;

        /* ════════════════════════════════════════════
           CABECERA — fondo verde oscuro
           ════════════════════════════════════════════ */
        fillRect(0, 0, W, 46, C_VERDE);

        /* Logo — intentar incrustar si se puede convertir a canvas */
        let logoOk = false;
        try {
            const logoImg = document.querySelector("#boleta-contenido .boleta-header img");
            if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
                const cv = document.createElement("canvas");
                cv.width  = logoImg.naturalWidth;
                cv.height = logoImg.naturalHeight;
                cv.getContext("2d").drawImage(logoImg, 0, 0);
                const dataUrl = cv.toDataURL("image/png");
                // Logo centrado en el bloque izquierdo
                const logoH = 26;
                const logoW = 26;
                doc.addImage(dataUrl, "PNG", ML, 10, logoW, logoH);
                logoOk = true;
            }
        } catch (e) { /* Logo omitido por restricción de origen */ }

        /* Texto del header */
        const txtX = logoOk ? W / 2 + 10 : W / 2;
        setFont("bold", 20);
        setColor(C_BLANCO);
        doc.text("Bruma Café", txtX, 20, { align: "center" });

        setFont("normal", 8.5);
        setColor(C_TAN);
        doc.text("BOLETA DE VENTA", txtX, 29, { align: "center" });

        setFont("italic", 7.5);
        doc.text("Café artesanal  •  Granos de origen", txtX, 37, { align: "center" });

        y = 52;

        /* ════════════════════════════════════════════
           BLOQUE: Número, Fecha y Hora
           ════════════════════════════════════════════ */
        fillRect(ML, y - 5, CW, 20, C_CREMA);

        setFont("bold", 9.5);
        setColor(C_TEXTO);
        doc.text(`Boleta N° ${numeroBoleta}`, ML + 6, y + 3);

        setFont("normal", 8);
        setColor(C_GRIS);
        doc.text(`Fecha: ${fecha}`, ML + 6, y + 10);
        doc.text(`Hora: ${hora}`, ML + 75, y + 10);

        y += 22;

        /* ════════════════════════════════════════════
           DATOS DEL CLIENTE
           ════════════════════════════════════════════ */
        setFont("bold", 8);
        setColor(C_CAFE);
        doc.text("DATOS DEL CLIENTE", ML, y);
        dashedLine(y + 2);
        y += 7;

        const clienteRows = [
            ["Nombre",    `${datosCliente.nombre} ${datosCliente.apellido}`],
            ["DNI",       datosCliente.dni],
            ["Teléfono",  datosCliente.telefono],
            ["Correo",    datosCliente.correo],
            ["Dirección", datosCliente.direccion],
        ];

        const labelW = 28;
        clienteRows.forEach(([lbl, val]) => {
            setFont("bold", 8.5);
            setColor(C_TEXTO);
            doc.text(`${lbl}:`, ML, y);
            setFont("normal", 8.5);
            setColor(C_GRIS);
            // Dividir texto largo en líneas
            const maxValW = CW - labelW - 2;
            const lines = doc.splitTextToSize(val || "-", maxValW);
            doc.text(lines, ML + labelW, y);
            y += lines.length * 5.5;
        });

        y += 3;

        /* ════════════════════════════════════════════
           DETALLE DE LA COMPRA
           ════════════════════════════════════════════ */
        setFont("bold", 8);
        setColor(C_CAFE);
        doc.text("DETALLE DE LA COMPRA", ML, y);
        dashedLine(y + 2);
        y += 8;

        /* Cabecera de la tabla */
        fillRect(ML, y - 5, CW, 9, C_VERDE);
        setFont("bold", 7.5);
        setColor(C_BLANCO);
        doc.text("Producto",    ML + 2,         y);
        doc.text("Cant.",       ML + 95,         y, { align: "right" });
        doc.text("P. Unit.",    ML + 128,        y, { align: "right" });
        doc.text("Subtotal",    ML + CW - 2,     y, { align: "right" });

        y += 5;

        /* Filas de productos */
        resumen.items.forEach((item, i) => {
            const rowH = 7.5;
            if (i % 2 === 0) fillRect(ML, y - 3.5, CW, rowH, C_FILA_A);

            setFont("normal", 8);
            setColor(C_TEXTO);
            const nombre = item.nombre.length > 42 ? item.nombre.substring(0, 39) + "…" : item.nombre;
            doc.text(nombre,                                    ML + 2,     y);
            doc.text(String(item.cantidad),                     ML + 95,    y, { align: "right" });
            doc.text(Carrito.formatearMoneda(item.precio),      ML + 128,   y, { align: "right" });
            doc.text(Carrito.formatearMoneda(item.precio * item.cantidad), ML + CW - 2, y, { align: "right" });
            y += rowH;
        });

        solidLine(y, C_GRIS_L);
        y += 6;

        /* ════════════════════════════════════════════
           TOTALES
           ════════════════════════════════════════════ */
        const colValX = ML + CW - 2;
        const colLblX = ML + CW - 55;

        setFont("normal", 9);
        setColor(C_GRIS);
        doc.text("Subtotal:",  colLblX, y); doc.text(Carrito.formatearMoneda(resumen.subtotal), colValX, y, { align: "right" }); y += 6.5;
        doc.text("IGV (18%):", colLblX, y); doc.text(Carrito.formatearMoneda(resumen.igv),      colValX, y, { align: "right" }); y += 6.5;

        /* Fila TOTAL — destacada */
        fillRect(colLblX - 4, y - 4.5, CW - (colLblX - 4 - ML), 11, C_VERDE);
        setFont("bold", 10.5);
        setColor(C_BLANCO);
        doc.text("TOTAL:", colLblX, y + 2); doc.text(Carrito.formatearMoneda(resumen.total), colValX, y + 2, { align: "right" });
        y += 16;

        /* ════════════════════════════════════════════
           MÉTODO DE PAGO
           ════════════════════════════════════════════ */
        dashedLine(y - 3);
        setFont("bold", 8.5);
        setColor(C_TEXTO);
        doc.text("Método de pago:", ML, y);
        setFont("normal", 8.5);
        setColor(C_GRIS);
        doc.text(datosCliente.metodoPago, ML + 42, y);
        y += 7;

        if (datosCliente.observaciones) {
            setFont("bold", 8.5);
            setColor(C_TEXTO);
            doc.text("Observaciones:", ML, y);
            setFont("normal", 8.5);
            setColor(C_GRIS);
            const obsLines = doc.splitTextToSize(datosCliente.observaciones, CW - 42);
            doc.text(obsLines, ML + 42, y);
            y += obsLines.length * 5.5 + 3;
        }

        y += 6;

        /* ════════════════════════════════════════════
           MENSAJE DE AGRADECIMIENTO
           ════════════════════════════════════════════ */
        dashedLine(y - 3);
        setFont("bolditalic", 10.5);
        setColor(C_CAFE);
        doc.text("¡Gracias por su compra!", W / 2, y + 4, { align: "center" });
        setFont("italic", 9);
        setColor(C_GRIS);
        doc.text("Esperamos volver a atenderlo en Bruma Café.", W / 2, y + 11, { align: "center" });

        /* ════════════════════════════════════════════
           PIE DE PÁGINA — fondo verde oscuro
           ════════════════════════════════════════════ */
        const footerY = H - 20;
        fillRect(0, footerY, W, 20, C_VERDE);
        setFont("normal", 7.5);
        setColor(C_TAN);
        doc.text(
            "Bruma Café  •  Calle 7 # 6-56, Frente al Parque Central  •  +51 987 654 321",
            W / 2, footerY + 7, { align: "center" }
        );
        doc.text(
            "brumacafe@ejemplo.com  •  www.brumacafe.com",
            W / 2, footerY + 14, { align: "center" }
        );

        /* ─── Guardar el PDF ─── */
        const nombreArchivo = numeroBoleta.replace(/[^A-Za-z0-9_-]/g, "_");
        doc.save(`Boleta_${nombreArchivo}.pdf`);
    }
}
