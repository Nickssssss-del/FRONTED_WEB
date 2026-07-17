/* =============================================================
   CLASE: Carrito
   Responsabilidad única: manejar el estado del carrito de compras
   (agregar, eliminar, aumentar/disminuir cantidad, vaciar) y
   persistirlo en LocalStorage para que se recupere automáticamente
   al volver a ingresar a cualquier página del sitio.

   No depende de ninguna página en particular: se incluye en TODAS
   las páginas (index.html, CATALOGO.html, Promociones.html,
   Direccion.html, Registrarse.html y carrito.html) para que el
   contador del header y los datos del carrito estén siempre
   sincronizados, sin importar desde qué página se navegue.

   Se apoya en la clase Toast ya existente en el proyecto (si está
   cargada en la página) para mostrar notificaciones no bloqueantes,
   reutilizando código en vez de duplicarlo.
   ============================================================= */

const IGV_PORCENTAJE = 0.18; // 18% — mismo valor usado en toda la app

class Carrito {

    constructor(claveAlmacenamiento = "bruma_carrito") {
        this.clave = claveAlmacenamiento;
        this.items = this.cargar();

        /* Instancia de Toast reutilizada si la clase está disponible en la página */
        this.toast = (typeof Toast !== "undefined") ? new Toast("toast-contenedor") : null;

        this.actualizarContadorHeader();
    }

    /* ---------- PERSISTENCIA (LocalStorage) ---------- */

    cargar() {
        try {
            const datos = localStorage.getItem(this.clave);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.warn("Carrito: no se pudo leer el almacenamiento local.", error);
            return [];
        }
    }

    guardar() {
        try {
            localStorage.setItem(this.clave, JSON.stringify(this.items));
        } catch (error) {
            console.warn("Carrito: no se pudo guardar en el almacenamiento local.", error);
        }
        this.actualizarContadorHeader();
        this.emitirCambio();
    }

    /* Notifica a la página actual (ej. carrito.html) que el estado cambió,
       para que pueda re-renderizar sin necesidad de recargar. */
    emitirCambio() {
        document.dispatchEvent(new CustomEvent("carrito:cambio", {
            detail: this.obtenerResumen()
        }));
    }

    /* ---------- OPERACIONES DEL CARRITO ---------- */

    /**
     * Agrega un producto al carrito. Si ya existe, incrementa su cantidad.
     * @param {Object} producto {id, nombre, precio, imagen}
     * @param {number} cantidad
     */
    agregar(producto, cantidad = 1) {
        if (!producto || !producto.id) {
            console.warn("Carrito.agregar: producto inválido.", producto);
            return;
        }
        const existente = this.items.find(item => item.id === producto.id);

        if (existente) {
            existente.cantidad += cantidad;
        } else {
            this.items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio) || 0,
                imagen: producto.imagen || "",
                cantidad: cantidad
            });
        }

        this.guardar();

        if (this.toast) {
            this.toast.mostrar({
                tipo: "exito",
                titulo: "Agregado al carrito",
                mensaje: `${producto.nombre} se agregó correctamente.`,
                duracion: 3000
            });
        }
    }

    eliminar(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardar();
    }

    /* Fija una cantidad exacta (usada por el input numérico de carrito.html) */
    actualizarCantidad(id, cantidad) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;

        const cantidadEntera = Math.floor(Number(cantidad));
        if (!Number.isFinite(cantidadEntera) || cantidadEntera < 1) {
            this.eliminar(id);
            return;
        }
        item.cantidad = cantidadEntera;
        this.guardar();
    }

    incrementar(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        item.cantidad += 1;
        this.guardar();
    }

    decrementar(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        item.cantidad -= 1;
        if (item.cantidad <= 0) {
            this.eliminar(id);
            return;
        }
        this.guardar();
    }

    vaciar() {
        this.items = [];
        this.guardar();
    }

    /* ---------- CÁLCULOS ---------- */

    obtenerSubtotal() {
        return this.items.reduce((acumulado, item) => acumulado + (item.precio * item.cantidad), 0);
    }

    obtenerIGV() {
        return this.obtenerSubtotal() * IGV_PORCENTAJE;
    }

    obtenerTotal() {
        return this.obtenerSubtotal() + this.obtenerIGV();
    }

    obtenerCantidadTotal() {
        return this.items.reduce((acumulado, item) => acumulado + item.cantidad, 0);
    }

    obtenerResumen() {
        return {
            items: this.items,
            subtotal: this.obtenerSubtotal(),
            igv: this.obtenerIGV(),
            total: this.obtenerTotal(),
            cantidadTotal: this.obtenerCantidadTotal()
        };
    }

    /* ---------- UI COMPARTIDA (header de todas las páginas) ---------- */

    /* Actualiza el contador numérico del ícono del carrito en el header.
       Existe en todas las páginas gracias a que el <nav> se repite igual
       en index.html, CATALOGO.html, Promociones.html, Direccion.html y
       Registrarse.html (mismo patrón que ya usaba HamburgerMenu). */
    actualizarContadorHeader() {
        const contador = document.getElementById("carrito-contador");
        if (!contador) return;

        const total = this.obtenerCantidadTotal();
        contador.textContent = total;
        contador.classList.toggle("carrito-contador--visible", total > 0);
    }

    /* ---------- FORMATO ---------- */

    static formatearMoneda(valor) {
        return "S/ " + (Number(valor) || 0).toFixed(2);
    }
}

/* Instancia única compartida por toda la aplicación (patrón singleton simple).
   Se crea de inmediato (no dentro de DOMContentLoaded) porque Carrito.js
   siempre se incluye cerca del final del <body>, cuando el header y su
   contador ya existen en el DOM. Así, cualquier script cargado justo después
   (Scrip_catalogo.js, CarritoPagina.js) puede usar `window.carrito` de forma
   síncrona, sin tener que esperar a que se dispare DOMContentLoaded. */
window.carrito = new Carrito();
