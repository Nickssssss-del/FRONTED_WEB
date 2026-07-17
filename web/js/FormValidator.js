
class FormValidator {

    /**
     * @param {string} selectorFormulario
     * @param {Modal} instanciaModal  Instancia de la clase Modal para confirmar el envío
     */
    constructor(selectorFormulario, instanciaModal, instanciaToast) {
        this.formulario = document.querySelector(selectorFormulario);
        this.modal = instanciaModal;
        this.toast = instanciaToast;
        this.claveAlmacenamiento = "brumacafe_usuarios_registrados";

        if (!this.formulario) {
            console.warn("FormValidator: no se encontró el formulario.");
            return;
        }

        // Reglas de validación por campo: cada una devuelve un mensaje de error o null si es válido
        this.reglas = {
            nombre: (valor) => {
                if (!valor.trim()) return "Ingresa tu nombre.";
                if (valor.trim().length < 2) return "El nombre debe tener al menos 2 letras.";
                if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) return "El nombre solo puede contener letras.";
                return null;
            },
            apellido: (valor) => {
                if (!valor.trim()) return "Ingresa tu apellido.";
                if (valor.trim().length < 2) return "El apellido debe tener al menos 2 letras.";
                if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) return "El apellido solo puede contener letras.";
                return null;
            },
            correo: (valor) => {
                if (!valor.trim()) return "Ingresa tu correo electrónico.";
                const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!patronCorreo.test(valor)) return "Ingresa un correo electrónico válido (ejemplo: nombre@correo.com).";
                return null;
            },
            telefono: (valor) => {
                if (!valor.trim()) return "Ingresa tu número de teléfono.";
                const soloDigitos = valor.replace(/\D/g, "");
                if (soloDigitos.length !== 9) return "El teléfono debe tener exactamente 9 dígitos.";
                return null;
            },
            fecha: (valor) => {
                if (!valor) return "Selecciona tu fecha de nacimiento.";
                const fechaIngresada = new Date(valor);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaIngresada.getFullYear();
                if (fechaIngresada > hoy) return "La fecha no puede ser futura.";
                if (edad < 13) return "Debes tener al menos 13 años para registrarte.";
                return null;
            }
        };

        this.inicializar();
    }

    inicializar() {
        // Mapea cada campo del formulario con su bloque .campo contenedor
        this.campos = {
            nombre: this.formulario.querySelector('[data-campo="nombre"]'),
            apellido: this.formulario.querySelector('[data-campo="apellido"]'),
            correo: this.formulario.querySelector('[data-campo="correo"]'),
            telefono: this.formulario.querySelector('[data-campo="telefono"]'),
            fecha: this.formulario.querySelector('[data-campo="fecha"]')
        };

        // Validación en tiempo real: al salir del campo (evento blur)
        Object.keys(this.campos).forEach((nombreCampo) => {
            const input = this.campos[nombreCampo];
            if (!input) return;
            input.addEventListener("blur", () => this.validarCampo(nombreCampo));
            input.addEventListener("input", () => {
                // Si el campo ya tenía error, revalida mientras el usuario corrige
                if (input.classList.contains("input-form--error")) {
                    this.validarCampo(nombreCampo);
                }
            });
        });

        // Validación completa al enviar
        this.formulario.addEventListener("submit", (evento) => this.manejarEnvio(evento));

        /* BUG CORREGIDO: el campo de teléfono no limitaba la cantidad de
           dígitos que se podían escribir (se podía pegar o teclear un
           número de cualquier longitud). Ahora, igual que en el formulario
           de compra del carrito, solo admite dígitos y como máximo 9. */
        const inputTelefono = this.campos.telefono;
        if (inputTelefono) {
            inputTelefono.addEventListener("input", () => {
                const soloDigitos = inputTelefono.value.replace(/\D/g, "").slice(0, 9);
                if (inputTelefono.value !== soloDigitos) inputTelefono.value = soloDigitos;
            });
            inputTelefono.addEventListener("keydown", (evento) => {
                const permitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End"];
                if (!/^\d$/.test(evento.key) && !permitidas.includes(evento.key) && !evento.ctrlKey && !evento.metaKey) {
                    evento.preventDefault();
                }
            });
        }
    }

    /* Valida un campo individual y actualiza su UI (borde + mensaje) */
    validarCampo(nombreCampo) {
        const input = this.campos[nombreCampo];
        const contenedor = input.closest(".campo");
        const elMensaje = contenedor.querySelector(".mensaje-error");
        const error = this.reglas[nombreCampo](input.value);

        if (error) {
            input.classList.add("input-form--error");
            input.classList.remove("input-form--valido");
            elMensaje.textContent = error;
            elMensaje.classList.add("mensaje-error--visible");
            input.setAttribute("aria-invalid", "true");
        } else {
            input.classList.remove("input-form--error");
            input.classList.add("input-form--valido");
            elMensaje.textContent = "";
            elMensaje.classList.remove("mensaje-error--visible");
            input.setAttribute("aria-invalid", "false");
        }

        return !error;
    }

    /* Valida todos los campos a la vez, devuelve true si todo es válido */
    validarTodo() {
        // Variable: acumula el resultado de cada campo
        let formularioValido = true;

        Object.keys(this.campos).forEach((nombreCampo) => {
            const campoValido = this.validarCampo(nombreCampo);
            if (!campoValido) formularioValido = false;
        });

        return formularioValido;
    }

    /* Obtiene la lista de clientes ya registrados desde el almacenamiento local */
    obtenerUsuariosRegistrados() {
        try {
            const datos = localStorage.getItem(this.claveAlmacenamiento);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.warn("FormValidator: no se pudo leer el almacenamiento local.", error);
            return [];
        }
    }

    /* Comprueba si el correo ingresado ya pertenece a un cliente registrado */
    clienteYaRegistrado(correo) {
        const usuarios = this.obtenerUsuariosRegistrados();
        const correoNormalizado = correo.trim().toLowerCase();
        return usuarios.some((usuario) => usuario.correo === correoNormalizado);
    }

    /* Guarda un nuevo cliente en el almacenamiento local */
    guardarUsuarioRegistrado(datosFormulario) {
        const usuarios = this.obtenerUsuariosRegistrados();
        usuarios.push({
            nombre: datosFormulario.nombre.trim(),
            apellido: datosFormulario.apellido.trim(),
            correo: datosFormulario.correo.trim().toLowerCase(),
            telefono: datosFormulario.telefono.trim()
        });

        try {
            localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(usuarios));
        } catch (error) {
            console.warn("FormValidator: no se pudo guardar en el almacenamiento local.", error);
        }
    }

    manejarEnvio(evento) {
        evento.preventDefault(); // Evita el envío real (aún no hay backend)

        const esValido = this.validarTodo();

        if (!esValido) {
            // Enfoca el primer campo con error, para accesibilidad
            const primerError = this.formulario.querySelector(".input-form--error");
            if (primerError) primerError.focus();

            this.modal.mostrar({
                tipo: "error",
                titulo: "Revisa el formulario",
                mensaje: "Hay campos incompletos o con errores. Corrígelos antes de continuar.",
                textoBoton: "Entendido"
            });
            return;
        }

        const correoIngresado = this.campos.correo.value;

        // CASO 1: el cliente ya existe en el sistema (verificación por correo)
        if (this.clienteYaRegistrado(correoIngresado)) {
            this.campos.correo.classList.add("input-form--error");
            this.campos.correo.focus();

            this.toast.mostrar({
                tipo: "advertencia",
                titulo: "Cliente ya registrado",
                mensaje: "El cliente ya esta registrado",
                duracion: 6000
            });
            return;
        }

        // Simula el envío exitoso (sin backend todavía)
        const botonEnviar = this.formulario.querySelector(".boton-enviar");
        botonEnviar.classList.add("boton-enviar--cargando");
        botonEnviar.disabled = true;

        setTimeout(() => {
            botonEnviar.classList.remove("boton-enviar--cargando");
            botonEnviar.disabled = false;

            // CASO 2: registro exitoso -> se guarda el cliente y se notifica
            this.guardarUsuarioRegistrado({
                nombre: this.campos.nombre.value,
                apellido: this.campos.apellido.value,
                correo: this.campos.correo.value,
                telefono: this.campos.telefono.value
            });

            this.toast.mostrar({
                tipo: "exito",
                titulo: "Registro exitoso",
                mensaje: "El usuario se ha registrado correctamente",
                duracion: 4500
            });

            this.formulario.reset();
            // Limpia los estados visuales de validación tras el reset
            Object.values(this.campos).forEach((input) => {
                if (!input) return;
                input.classList.remove("input-form--valido", "input-form--error");
            });
        }, 900);
    }
}

/* Inicializa el validador cuando el DOM está listo (solo existe en Registrarse.html) */
document.addEventListener("DOMContentLoaded", () => {
    const formularioExiste = document.querySelector(".formulario-cafe");
    if (formularioExiste) {
        const modalRegistro = new Modal("modal-generico");
        const toastRegistro = new Toast("toast-contenedor");
        new FormValidator(".formulario-cafe", modalRegistro, toastRegistro);
    }
});
