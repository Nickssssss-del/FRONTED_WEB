/* =============================================================
   PagoModales.js
   Gestiona las ventanas emergentes que se muestran según el
   método de pago elegido en el checkout de carrito.html:
     - Yape / Plin  -> QR + monto + temporizador de 5 minutos.
     - Transferencia bancaria -> datos de cuenta + código de operación.
     - Tarjeta / POS -> aviso para pagar en caja.
     - Efectivo -> confirmación de pedido registrado.

   Se usa desde js/CarritoPagina.js, que sigue siendo el único
   responsable de generar la boleta y vaciar el carrito: este
   archivo solo se encarga de la interacción visual del pago y
   avisa mediante un callback ("alConfirmar") cuando el flujo debe
   continuar.
   ============================================================= */

class GestorPagoModales {

    constructor() {
        this.overlayYape          = document.getElementById("modal-pago-yape");
        this.overlayTransferencia = document.getElementById("modal-pago-transferencia");
        this.overlayPos           = document.getElementById("modal-pago-pos");
        this.overlayEfectivo      = document.getElementById("modal-pago-efectivo");

        this.timerYape = null;
        this.segundosRestantesYape = 0;
        this.qrYapeInstancia = null; // instancia de QRCode.js reutilizada al regenerar

        this._inicializarCierres();
    }

    /* ---------- Cierre común (X, clic fuera, tecla ESC) ---------- */
    _inicializarCierres() {
        const overlays = [this.overlayYape, this.overlayTransferencia, this.overlayPos, this.overlayEfectivo];

        overlays.forEach((overlay) => {
            if (!overlay) return;

            const botonX = overlay.querySelector(".pago-modal-cerrar-x");
            if (botonX) {
                botonX.addEventListener("click", () => this._cerrarTodos());
            }

            overlay.addEventListener("click", (evento) => {
                if (evento.target === overlay) this._cerrarTodos();
            });
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") this._cerrarTodos();
        });
    }

    _mostrar(overlay) {
        if (!overlay) return;
        overlay.classList.add("pago-modal-visible");
        document.body.style.overflow = "hidden";
    }

    _ocultar(overlay) {
        if (!overlay) return;
        overlay.classList.remove("pago-modal-visible");
        document.body.style.overflow = "";
    }

    _cerrarTodos() {
        [this.overlayYape, this.overlayTransferencia, this.overlayPos, this.overlayEfectivo]
            .forEach((overlay) => this._ocultar(overlay));

        if (this.timerYape) {
            clearInterval(this.timerYape);
            this.timerYape = null;
        }
    }

    /**
     * Punto de entrada único: según el método de pago elegido en el
     * checkout, abre la ventana emergente correspondiente.
     * @param {string} metodoPago  Texto tal como viene del <select> del checkout.
     * @param {number} montoTotal  Total de la compra (para mostrarlo en el modal).
     * @param {Function} alConfirmar  Callback que continúa el flujo (genera la
     *                                boleta y vacía el carrito).
     */
    iniciarPago(metodoPago, montoTotal, alConfirmar) {
        const metodo = (metodoPago || "").toLowerCase();

        if (metodo.includes("yape") || metodo.includes("plin")) {
            this._iniciarYape(montoTotal, alConfirmar);
        } else if (metodo.includes("transferencia")) {
            this._iniciarTransferencia(montoTotal, alConfirmar);
        } else if (metodo.includes("tarjeta") || metodo.includes("pos")) {
            this._iniciarPos(alConfirmar);
        } else if (metodo.includes("efectivo")) {
            this._iniciarEfectivo(alConfirmar);
        } else {
            // Método desconocido: no bloquea la compra, continúa directo.
            alConfirmar();
        }
    }

    /* =============================================================
       YAPE
       ============================================================= */
    _iniciarYape(montoTotal, alConfirmar) {
        const overlay = this.overlayYape;
        if (!overlay) { alConfirmar(); return; }

        const elMonto   = overlay.querySelector("[data-yape-monto]");
        const elQr      = overlay.querySelector("[data-yape-qr]");
        const elTimer   = overlay.querySelector("[data-yape-timer]");
        const elEstado  = overlay.querySelector("[data-yape-estado]");
        const btnPagado = overlay.querySelector("[data-yape-confirmar]");
        const btnCancelar = overlay.querySelector("[data-yape-cancelar]");

        if (elMonto) elMonto.textContent = (typeof Carrito !== "undefined")
            ? Carrito.formatearMoneda(montoTotal)
            : `S/ ${montoTotal.toFixed(2)}`;

        if (elEstado) {
            elEstado.textContent = "";
            elEstado.classList.remove("pago-estado--verificando");
        }

        this._generarQrYape(elQr);
        this._iniciarTemporizadorYape(elTimer, elEstado, elQr);

        if (btnPagado) {
            btnPagado.disabled = false;
            btnPagado.textContent = "He realizado el pago";

            const manejarClicPagado = () => {
                btnPagado.disabled = true;
                btnPagado.textContent = "Verificando...";
                if (elEstado) {
                    elEstado.textContent = "Estamos verificando tu pago...";
                    elEstado.classList.add("pago-estado--verificando");
                }

                setTimeout(() => {
                    if (this.timerYape) {
                        clearInterval(this.timerYape);
                        this.timerYape = null;
                    }
                    this._ocultar(overlay);
                    alConfirmar();
                }, 2200);
            };

            btnPagado.addEventListener("click", manejarClicPagado, { once: true });
        }

        if (btnCancelar) {
            const manejarClicCancelar = () => this._cerrarTodos();
            btnCancelar.addEventListener("click", manejarClicCancelar, { once: true });
        }

        this._mostrar(overlay);
    }

    /* Genera un identificador aleatorio corto para el token de demo del QR */
    _tokenDemo() {
        return Math.random().toString(36).slice(2, 10).toUpperCase();
    }

    /* ---------------------------------------------------------------
       Genera un código QR REAL (escaneable con cualquier lector) pero
       puramente de demostración: no representa un pago real ni datos
       bancarios reales. El contenido es una URL/token ficticios propios
       de este proyecto (ver README / prompt de mejoras), nunca un enlace
       de pago verdadero. Se dibuja con QRCode.js (canvas) dentro de
       [data-yape-qr]; cada vez que el temporizador expira (cada 5 min,
       ver _iniciarTemporizadorYape) se vuelve a llamar con un token/
       timestamp nuevo para que el QR "cambie" visualmente, tal como
       pediría un QR real que expira.
       --------------------------------------------------------------- */
    _generarQrYape(elQr) {
        if (!elQr) return;

        const payload = `https://brumacafe.demo/pago?token=${this._tokenDemo()}&ts=${Date.now()}`;

        if (typeof QRCode === "undefined") {
            // Si la librería no llegó a cargar (ej. sin conexión al CDN),
            // no dejamos el modal roto: mostramos un aviso claro en vez
            // de un QR a medio dibujar.
            elQr.innerHTML = "";
            elQr.textContent = "QR no disponible";
            return;
        }

        if (!this.qrYapeInstancia) {
            // Primera vez: se crea la instancia dentro del contenedor.
            elQr.innerHTML = "";
            this.qrYapeInstancia = new QRCode(elQr, {
                text: payload,
                width: 176,
                height: 176,
                colorDark: "#1b2d29",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        } else {
            // Regeneraciones siguientes: makeCode() reutiliza el mismo
            // <canvas> y evita parpadeos al redibujar.
            this.qrYapeInstancia.makeCode(payload);
        }
    }

    _iniciarTemporizadorYape(elTimer, elEstado, elQr) {
        if (this.timerYape) clearInterval(this.timerYape);

        this.segundosRestantesYape = 5 * 60;
        this._actualizarTextoTimer(elTimer);

        this.timerYape = setInterval(() => {
            this.segundosRestantesYape--;
            this._actualizarTextoTimer(elTimer);

            if (this.segundosRestantesYape <= 0) {
                this.segundosRestantesYape = 5 * 60;
                this._generarQrYape(elQr);
                if (elEstado) {
                    elEstado.textContent = "El código QR expiró. Se generó uno nuevo automáticamente.";
                    elEstado.classList.remove("pago-estado--verificando");
                }
            }
        }, 1000);
    }

    _actualizarTextoTimer(elTimer) {
        if (!elTimer) return;
        const minutos = Math.floor(this.segundosRestantesYape / 60);
        const segundos = this.segundosRestantesYape % 60;
        elTimer.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }

    /* =============================================================
       TRANSFERENCIA BANCARIA
       ============================================================= */
    _iniciarTransferencia(montoTotal, alConfirmar) {
        const overlay = this.overlayTransferencia;
        if (!overlay) { alConfirmar(); return; }

        const elMonto      = overlay.querySelector("[data-transf-monto]");
        const elCodigo     = overlay.querySelector("[data-transf-codigo]");
        const elEstado     = overlay.querySelector("[data-transf-estado]");
        const btnConfirmar = overlay.querySelector("[data-transf-confirmar]");

        if (elMonto) elMonto.textContent = (typeof Carrito !== "undefined")
            ? Carrito.formatearMoneda(montoTotal)
            : `S/ ${montoTotal.toFixed(2)}`;

        if (elCodigo) elCodigo.textContent = "OP-" + Math.floor(100000 + Math.random() * 900000);
        if (elEstado) elEstado.textContent = "";

        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = "He realizado la transferencia";

            const manejarClic = () => {
                btnConfirmar.disabled = true;
                if (elEstado) elEstado.textContent = "Tu transferencia será validada en unos minutos.";

                setTimeout(() => {
                    this._ocultar(overlay);
                    alConfirmar();
                }, 1800);
            };

            btnConfirmar.addEventListener("click", manejarClic, { once: true });
        }

        this._mostrar(overlay);
    }

    /* =============================================================
       POS (tarjeta de crédito/débito)
       ============================================================= */
    _iniciarPos(alConfirmar) {
        const overlay = this.overlayPos;
        if (!overlay) { alConfirmar(); return; }

        const btnEntendido = overlay.querySelector("[data-pos-entendido]");
        if (btnEntendido) {
            const manejarClic = () => {
                this._ocultar(overlay);
                alConfirmar();
            };
            btnEntendido.addEventListener("click", manejarClic, { once: true });
        }

        this._mostrar(overlay);
    }

    /* =============================================================
       EFECTIVO
       ============================================================= */
    _iniciarEfectivo(alConfirmar) {
        const overlay = this.overlayEfectivo;
        if (!overlay) { alConfirmar(); return; }

        const btnAceptar = overlay.querySelector("[data-efectivo-aceptar]");
        if (btnAceptar) {
            const manejarClic = () => {
                this._ocultar(overlay);
                alConfirmar();
            };
            btnAceptar.addEventListener("click", manejarClic, { once: true });
        }

        this._mostrar(overlay);
    }
}

/* Instancia global única, reutilizada por CarritoPagina.js */
window.gestorPagoModales = null;
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("modal-pago-yape")) {
        window.gestorPagoModales = new GestorPagoModales();
    }
});
