/* =============================================
   CLASE: Toast
   Responsabilidad única: mostrar notificaciones
   flotantes modernas (no bloqueantes) con
   transición fade-in / fade-out y auto-cierre.
   No depende de ninguna página en particular:
   cualquier script puede llamar a
   new Toast().mostrar({...})
   ============================================= */

class Toast {

    constructor(idContenedor = "toast-contenedor") {
        this.contenedor = document.getElementById(idContenedor);

        if (!this.contenedor) {
            this.contenedor = document.createElement("div");
            this.contenedor.id = idContenedor;
            document.body.appendChild(this.contenedor);
        }
    }

    /**
     * Muestra una notificación flotante.
     * @param {Object} opciones
     * @param {"exito"|"advertencia"|"error"} [opciones.tipo]
     * @param {string} [opciones.titulo]
     * @param {string} opciones.mensaje
     * @param {number} [opciones.duracion] Milisegundos antes del auto-cierre. 0 = no se cierra sola.
     */
    mostrar({ tipo = "exito", titulo, mensaje, duracion = 5000 }) {
        const iconos = {
            exito:       '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
            advertencia: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            error:       '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };

        const titulosPorDefecto = {
            exito: "Éxito",
            advertencia: "Advertencia",
            error: "Error"
        };

        const toastEl = document.createElement("div");
        toastEl.className = `toast toast--${tipo}`;
        toastEl.setAttribute("role", "status");
        toastEl.setAttribute("aria-live", "polite");

        toastEl.innerHTML = `
            <div class="toast-icono">${iconos[tipo] || iconos.exito}</div>
            <div class="toast-contenido">
                <p class="toast-titulo">${titulo || titulosPorDefecto[tipo] || ""}</p>
                <p class="toast-mensaje">${mensaje}</p>
            </div>
            <button type="button" class="toast-cerrar" aria-label="Cerrar notificación">&times;</button>
        `;

        this.contenedor.appendChild(toastEl);

        // Fuerza el reflow para que la transición de entrada se dispare correctamente
        requestAnimationFrame(() => {
            toastEl.classList.add("toast--visible");
        });

        let temporizador = null;

        const cerrar = () => {
            if (temporizador) clearTimeout(temporizador);
            toastEl.classList.remove("toast--visible");
            toastEl.classList.add("toast--saliendo");
            toastEl.addEventListener("transitionend", () => toastEl.remove(), { once: true });
        };

        toastEl.querySelector(".toast-cerrar").addEventListener("click", cerrar);

        if (duracion > 0) {
            const barraProgreso = document.createElement("div");
            barraProgreso.className = "toast-progreso";
            barraProgreso.style.animationDuration = `${duracion}ms`;
            toastEl.appendChild(barraProgreso);

            temporizador = setTimeout(cerrar, duracion);
        }

        return { elemento: toastEl, cerrar };
    }
}
