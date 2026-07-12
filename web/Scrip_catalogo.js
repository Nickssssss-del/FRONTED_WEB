/* =============================================
   Scrip_catalogo.js
   Lógica de filtros, búsqueda, favoritos, modal
   y agregar al carrito en CATALOGO.html.
   ============================================= */

const chips         = document.querySelectorAll(".chip");
const buscador      = document.getElementById("buscador");
const ordenar       = document.getElementById("ordenar");
const estacion      = document.getElementById("estacion");
const toggleOrden   = document.getElementById("toggleOrden");
const sinResultados = document.getElementById("sin-resultados");

let ascendente        = true;
let categoriaActiva   = "all";
let mostrandoFavoritos = false;

/* SVG del ícono de carrito para usar en botones dinámicos */
const SVG_CARRITO_BTN = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
</svg>`;

/* SVG íconos de corazón — reemplazan los emojis de favoritos */
const SVG_CORAZON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const SVG_CORAZON_ACTIVO = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

/* FAVORITOS desde localStorage */
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

/* Alterna el estado de favorito de un producto y sincroniza
   TODOS los lugares donde se muestra (tarjeta del grid + modal si está abierto). */
function toggleFavorito(id) {
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    const esFavorito = favoritos.includes(id);

    /* Sincroniza el botón dentro de la tarjeta del grid */
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
        const btnGrid = card.querySelector(".fav-btn");
        btnGrid.classList.toggle("activo", esFavorito);
        btnGrid.innerHTML = esFavorito ? SVG_CORAZON_ACTIVO : SVG_CORAZON;
        btnGrid.setAttribute("aria-pressed", String(esFavorito));

        btnGrid.classList.remove("pop");
        void btnGrid.offsetWidth;
        btnGrid.classList.add("pop");
        btnGrid.addEventListener("animationend", () => btnGrid.classList.remove("pop"), { once: true });
    }

    /* Sincroniza el botón dentro del modal, si está abierto para este mismo producto */
    const btnModal = document.querySelector(".modal-fav-btn");
    if (btnModal && btnModal.dataset.id === id) {
        btnModal.classList.toggle("activo", esFavorito);
        btnModal.innerHTML = esFavorito ? `${SVG_CORAZON_ACTIVO} Quitar de favoritos` : `${SVG_CORAZON} Agregar a favoritos`;
        btnModal.setAttribute("aria-pressed", String(esFavorito));
        btnModal.classList.remove("pop");
        void btnModal.offsetWidth;
        btnModal.classList.add("pop");
        btnModal.addEventListener("animationend", () => btnModal.classList.remove("pop"), { once: true });
    }

    /* Si estamos mostrando solo favoritos, vuelve a filtrar para ocultar el producto si se quitó */
    if (mostrandoFavoritos) filtrar();
}

/* MARCAR favoritos al cargar */
document.querySelectorAll(".card").forEach(card => {
    const id  = card.dataset.id;
    const btn = card.querySelector(".fav-btn");
    if (favoritos.includes(id)) {
        btn.classList.add("activo");
        btn.innerHTML = SVG_CORAZON_ACTIVO;
        btn.setAttribute("aria-pressed", "true");
    }
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorito(id);
    });
});

/* AGREGAR AL CARRITO (desde la tarjeta del grid) */
function agregarProductoAlCarrito(card, boton) {
    if (!window.carrito) return;

    const producto = {
        id:     card.dataset.id,
        nombre: card.dataset.nombre,
        precio: card.dataset.precio,
        imagen: card.querySelector("img").getAttribute("src")
    };
    window.carrito.agregar(producto);

    if (boton) {
        boton.classList.remove("click-anim");
        void boton.offsetWidth;
        boton.classList.add("click-anim");
    }

    /* Anima el contador del header */
    const contador = document.getElementById("carrito-contador");
    if (contador) {
        contador.classList.remove("pop");
        void contador.offsetWidth;
        contador.classList.add("pop");
    }
}

document.querySelectorAll(".card").forEach(card => {
    const btnCarrito = card.querySelector(".btn-agregar-carrito");
    if (!btnCarrito) return;
    btnCarrito.addEventListener("click", (e) => {
        e.stopPropagation();
        agregarProductoAlCarrito(card, btnCarrito);
    });
});

/* VER FAVORITOS */
document.getElementById("verFavoritos").addEventListener("click", () => {
    mostrandoFavoritos = !mostrandoFavoritos;
    const btn = document.getElementById("verFavoritos");
    btn.classList.toggle("activo", mostrandoFavoritos);
    btn.setAttribute("aria-pressed", String(mostrandoFavoritos));
    filtrar();
});

/* CAMBIO DE CATEGORÍA */
chips.forEach(btn => {
    if (btn.id === "verFavoritos") return;
    btn.addEventListener("click", () => {
        chips.forEach(b => {
            if (b.id === "verFavoritos") return;
            b.classList.remove("activo");
            b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("activo");
        btn.setAttribute("aria-pressed", "true");
        categoriaActiva = btn.dataset.cat;
        mostrandoFavoritos = false;
        const favBtn = document.getElementById("verFavoritos");
        favBtn.classList.remove("activo");
        favBtn.setAttribute("aria-pressed", "false");
        filtrar();
    });
});

/* TOGGLE ORDEN */
toggleOrden.addEventListener("click", () => {
    ascendente = !ascendente;
    toggleOrden.textContent = ascendente ? "↑" : "↓";
    ordenarProductos();
});

/* Debounce para el buscador: espera 200ms antes de filtrar */
let debounceTimer;
buscador.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filtrar, 200);
});

estacion.addEventListener("change", filtrar);
ordenar.addEventListener("change", ordenarProductos);

/* FILTRAR */
function filtrar() {
    const texto         = buscador.value.toLowerCase();
    const filtroEstacion = estacion.value;
    let visibles = 0;

    document.querySelectorAll(".card").forEach(p => {
        const nombre    = (p.dataset.nombre   || "").toLowerCase();
        const categoria = p.dataset.categoria || "";
        const est       = p.dataset.estacion  || "";
        const id        = p.dataset.id;

        const okTexto   = nombre.includes(texto);
        const okCat     = categoriaActiva === "all" || categoria === categoriaActiva;
        const okEstacion = filtroEstacion === "all" || est === filtroEstacion || est === "all";
        const okFav     = !mostrandoFavoritos || favoritos.includes(id);

        const visible = okTexto && okCat && okEstacion && okFav;
        p.style.display = visible ? "" : "none";
        if (visible) visibles++;
    });

    if (sinResultados) sinResultados.hidden = visibles !== 0;

    ordenarProductos();
}

/* ORDENAR */
function ordenarProductos() {
    const contenedor = document.querySelector(".contenedor-productos");
    if (!contenedor) return;
    const productos = Array.from(contenedor.children);

    productos.sort((a, b) => {
        const tipo = ordenar.value;
        let resultado = 0;
        if (tipo === "nombre-asc") resultado = a.dataset.nombre.localeCompare(b.dataset.nombre);
        if (tipo === "precio-asc") resultado = parseFloat(a.dataset.precio) - parseFloat(b.dataset.precio);
        if (tipo === "fecha-desc") resultado = new Date(b.dataset.fecha) - new Date(a.dataset.fecha);
        return ascendente ? resultado : -resultado;
    });

    contenedor.innerHTML = "";
    productos.forEach(p => contenedor.appendChild(p));
}

/* VENTANA EMERGENTE (MODAL) DE PRODUCTO */
const modal         = document.getElementById("modalProducto");
const modalBox      = modal ? modal.querySelector(".modal-box") : null;
const modalContenido = modal ? modal.querySelector(".modal-contenido") : null;
const modalCerrar   = modal ? modal.querySelector(".modal-cerrar") : null;

const NOMBRES_CATEGORIA = {
    clasicos:    "Clásicos",
    frio:        "Frío",
    especiales:  "Especiales",
    infusiones:  "Infusiones",
    refrescante: "Bebidas sin gas",
    postres:     "Postres",
    extras:      "Extras",
};

function abrirModal(card) {
    if (!modal || !modalContenido) return;

    const id          = card.dataset.id;
    const nombre      = card.dataset.nombre;
    const categoria   = card.dataset.categoria;
    const precio      = card.dataset.precio;
    const imgSrc      = card.querySelector("img").src;
    const descripcion = card.querySelector(".text-card")?.textContent || "";
    const esFavorito  = favoritos.includes(id);

    modalContenido.innerHTML = `
        <span class="modal-categoria">${NOMBRES_CATEGORIA[categoria] || categoria}</span>
        <img src="${imgSrc}" alt="${nombre}">
        <h3 id="modalTitulo">${nombre}</h3>
        <p class="modal-descripcion">${descripcion}</p>
        <p class="precio">S/ ${parseFloat(precio).toFixed(2)}</p>
        <button type="button" class="modal-agregar-carrito" data-id="${id}">
            ${SVG_CARRITO_BTN} Agregar al carrito
        </button>
        <button type="button" class="modal-fav-btn${esFavorito ? " activo" : ""}" data-id="${id}" aria-pressed="${esFavorito}">
            ${esFavorito ? `${SVG_CORAZON_ACTIVO} Quitar de favoritos` : `${SVG_CORAZON} Agregar a favoritos`}
        </button>
    `;

    modalContenido.querySelector(".modal-fav-btn").addEventListener("click", () => {
        toggleFavorito(id);
    });

    modalContenido.querySelector(".modal-agregar-carrito").addEventListener("click", () => {
        agregarProductoAlCarrito(card, null);
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (modalCerrar) modalCerrar.focus();
}

function cerrarModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
}

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => abrirModal(card));
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirModal(card);
        }
    });
});

if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) cerrarModal();
});
