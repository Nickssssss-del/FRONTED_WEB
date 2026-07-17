/* =============================================================
   TerminosCondiciones.js
   Controla el checkbox obligatorio de "Términos y Condiciones"
   del formulario de Registrarse.html:
     - Habilita/deshabilita el botón "Enviar" según el checkbox.
     - Bloquea el envío del formulario si no está marcado (aunque
       el botón esté deshabilitado, se protege también el submit
       por si se activa desde el teclado u otra vía).
     - Abre un modal con el contenido de los Términos y Condiciones
       o la Política de Privacidad al hacer clic en sus enlaces.
   No modifica ni depende de la lógica de validación de los demás
   campos (FormValidator.js sigue funcionando igual).
   ============================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector(".formulario-cafe");
    if (!formulario) return;

    const checkboxTerminos = document.getElementById("campo-terminos");
    const botonEnviar      = formulario.querySelector(".boton-enviar");
    const errorTerminos    = document.getElementById("error-terminos");
    const linkTerminos     = document.getElementById("link-terminos");
    const linkPrivacidad   = document.getElementById("link-privacidad");

    const modalLegal       = document.getElementById("modal-legal");
    const modalLegalTitulo = document.getElementById("modal-legal-titulo");
    const modalLegalCuerpo = document.getElementById("modal-legal-cuerpo");
    const modalLegalCerrar = document.getElementById("modal-legal-cerrar");
    const modalLegalCerrarX = document.getElementById("modal-legal-cerrar-x");

    if (!checkboxTerminos || !botonEnviar) return;

    /* ---------- Habilitar/deshabilitar el botón según el checkbox ---------- */
    function actualizarEstadoBoton() {
        botonEnviar.disabled = !checkboxTerminos.checked;
        if (checkboxTerminos.checked && errorTerminos) {
            errorTerminos.textContent = "";
            errorTerminos.classList.remove("mensaje-error--visible");
            checkboxTerminos.setAttribute("aria-invalid", "false");
        }
    }

    checkboxTerminos.addEventListener("change", actualizarEstadoBoton);
    actualizarEstadoBoton(); // Estado inicial: botón deshabilitado

    /* ---------- Bloqueo de envío en fase de captura ----------
       Se registra con { capture: true } para ejecutarse ANTES que el
       listener de submit de FormValidator.js, sin importar el orden
       de carga de los scripts. Si el checkbox no está marcado, se
       detiene la propagación para que FormValidator no continúe. */
    formulario.addEventListener("submit", (evento) => {
        if (!checkboxTerminos.checked) {
            evento.preventDefault();
            evento.stopImmediatePropagation();

            if (errorTerminos) {
                errorTerminos.textContent = "Debes aceptar los Términos y Condiciones y la Política de Privacidad para registrarte.";
                errorTerminos.classList.add("mensaje-error--visible");
            }
            checkboxTerminos.setAttribute("aria-invalid", "true");
            checkboxTerminos.focus();
        }
    }, true);

    /* ---------- Contenido del modal legal ---------- */
    const contenidoLegal = {
        terminos: {
            titulo: "Términos y Condiciones",
            html: `
                <p>Bienvenido a Bruma Café. Al registrarte y utilizar nuestros servicios aceptas
                los siguientes términos:</p>
                <ol>
                    <li>La información proporcionada en el formulario de registro debe ser veraz
                    y corresponder a datos reales del titular de la cuenta.</li>
                    <li>Bruma Café utiliza los datos de registro únicamente para gestionar pedidos,
                    promociones y comunicaciones relacionadas con el servicio.</li>
                    <li>El usuario debe tener al menos 13 años de edad para poder registrarse.</li>
                    <li>Bruma Café se reserva el derecho de suspender cuentas que incumplan estos
                    términos o que hagan un uso indebido de la plataforma.</li>
                    <li>Los precios, promociones y disponibilidad de productos pueden variar sin
                    previo aviso.</li>
                    <li>El uso continuado del sitio implica la aceptación de futuras actualizaciones
                    de estos términos.</li>
                </ol>
                <p>Para cualquier consulta sobre estos términos puedes escribirnos a
                brumacafe@ejemplo.com.</p>
            `
        },
        privacidad: {
            titulo: "Política de Privacidad",
            html: `
                <p>En Bruma Café respetamos tu privacidad. Esta política explica cómo tratamos
                los datos personales que nos proporcionas al registrarte:</p>
                <ol>
                    <li><strong>Datos recopilados:</strong> nombre, apellido, correo electrónico,
                    teléfono y fecha de nacimiento.</li>
                    <li><strong>Finalidad:</strong> gestionar tu cuenta, procesar pedidos, enviarte
                    promociones y mejorar tu experiencia en el sitio.</li>
                    <li><strong>Almacenamiento:</strong> tus datos se guardan de forma local en tu
                    navegador y/o en nuestros sistemas internos, con medidas razonables de
                    seguridad.</li>
                    <li><strong>No cesión a terceros:</strong> no vendemos ni compartimos tus datos
                    personales con terceros ajenos a la operación del negocio.</li>
                    <li><strong>Derechos del usuario:</strong> puedes solicitar la actualización o
                    eliminación de tus datos personales en cualquier momento escribiéndonos a
                    brumacafe@ejemplo.com.</li>
                    <li><strong>Cambios:</strong> esta política puede actualizarse periódicamente;
                    te recomendamos revisarla de vez en cuando.</li>
                </ol>
            `
        }
    };

    function abrirModalLegal(tipo) {
        if (!modalLegal) return;
        const datos = contenidoLegal[tipo];
        if (!datos) return;

        modalLegalTitulo.textContent = datos.titulo;
        modalLegalCuerpo.innerHTML = datos.html;

        modalLegal.classList.add("modal-overlay--visible");
        document.body.style.overflow = "hidden";
        modalLegalCerrarX.focus();
    }

    function cerrarModalLegal() {
        if (!modalLegal) return;
        modalLegal.classList.remove("modal-overlay--visible");
        document.body.style.overflow = "";
    }

    if (linkTerminos) {
        linkTerminos.addEventListener("click", (evento) => {
            evento.preventDefault();
            abrirModalLegal("terminos");
        });
    }

    if (linkPrivacidad) {
        linkPrivacidad.addEventListener("click", (evento) => {
            evento.preventDefault();
            abrirModalLegal("privacidad");
        });
    }

    if (modalLegalCerrar) modalLegalCerrar.addEventListener("click", cerrarModalLegal);
    if (modalLegalCerrarX) modalLegalCerrarX.addEventListener("click", cerrarModalLegal);

    if (modalLegal) {
        modalLegal.addEventListener("click", (evento) => {
            if (evento.target === modalLegal) cerrarModalLegal();
        });
    }

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && modalLegal && modalLegal.classList.contains("modal-overlay--visible")) {
            cerrarModalLegal();
        }
    });
});
