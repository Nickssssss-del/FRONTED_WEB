
const chips = document.querySelectorAll(".chip");            /* BOTONES DE CATEGORÍA */
const buscador = document.getElementById("buscador");        /* BUSCADOR */
const ordenar = document.getElementById("ordenar");          /* SELECT DE ORDEN */
const estacion = document.getElementById("estacion");        /* SELECT DE ESTACIÓN */
const toggleOrden = document.getElementById("toggleOrden");  /* BOTÓN DE TOGGLE ORDEN */
const sinResultados = document.getElementById("sin-resultados"); /* MENSAJE SIN RESULTADOS */
let ascendente = true;           /* ORDEN INICIAL */
let categoriaActiva = "all";     /* CATEGORÍA INICIAL */
let mostrandoFavoritos = false;  /* ESTADO DE FAVORITOS */

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
        btnGrid.textContent = esFavorito ? "❤" : "♡";
        btnGrid.setAttribute("aria-pressed", String(esFavorito));

        btnGrid.classList.remove("pop");
        void btnGrid.offsetWidth; // fuerza el re-render para que funcione si se hace click rápido
        btnGrid.classList.add("pop");
        btnGrid.addEventListener("animationend", () => btnGrid.classList.remove("pop"), { once: true });
    }

    /* Sincroniza el botón dentro del modal, si está abierto para este mismo producto */
    const btnModal = document.querySelector(".modal-fav-btn");
    if (btnModal && btnModal.dataset.id === id) {
        btnModal.classList.toggle("activo", esFavorito);
        btnModal.innerHTML = esFavorito ? "❤ Quitar de favoritos" : "♡ Agregar a favoritos";
        btnModal.setAttribute("aria-pressed", String(esFavorito));
        /* Animación de pop en el modal */
        btnModal.classList.remove("pop");
        void btnModal.offsetWidth; // fuerza el re-render para que funcione si se hace click rápido
    }
    /* Si estamos mostrando solo favoritos, vuelve a filtrar para ocultar el producto si se quitó de favoritos */
    if (mostrandoFavoritos) filtrar();
}

/* MARCAR favoritos al cargar */
document.querySelectorAll(".card").forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector(".fav-btn");
    if (favoritos.includes(id)) {
        btn.classList.add("activo");
        btn.textContent = "❤";
        btn.setAttribute("aria-pressed", "true");
    }
    /* Agrega el evento de clic al botón de favorito dentro de la tarjeta */
    btn.addEventListener("click", (e) => {
        e.stopPropagation(); // evita que el clic en el corazón también abra el modal
        toggleFavorito(id);
    });
});

/* VER FAVORITOS */
document.getElementById("verFavoritos").addEventListener("click", () => {
    mostrandoFavoritos = !mostrandoFavoritos;
    const btn = document.getElementById("verFavoritos");
    btn.classList.toggle("activo", mostrandoFavoritos);
    btn.setAttribute("aria-pressed", String(mostrandoFavoritos));
    /* Si se activa "ver favoritos", desactiva cualquier categoría activa */
    filtrar();
});

/* CAMBIO DE CATEGORÍA */
chips.forEach(btn => {
    if (btn.id === "verFavoritos") return;
    btn.addEventListener("click", () => {
        chips.forEach(b => {
            if (b.id === "verFavoritos") return;
            b.classList.remove("activo");
            /* Actualiza aria-pressed para accesibilidad */
            b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("activo");
        /* Actualiza aria-pressed para accesibilidad */
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

/* Debounce: evita ejecutar filtrar() en cada tecla presionada,
   espera 200ms de pausa antes de filtrar (mejor rendimiento). */
let debounceTimer;
buscador.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filtrar, 200);
});

estacion.addEventListener("change", filtrar);
ordenar.addEventListener("change", ordenarProductos);

/* FILTRAR */
function filtrar() {
    const texto = buscador.value.toLowerCase();
    const filtroEstacion = estacion.value;
    let visibles = 0;
/* Recorre todas las tarjetas y decide si se muestran o no según los filtros activos */
    document.querySelectorAll(".card").forEach(p => {
        const nombre = (p.dataset.nombre || "").toLowerCase();
        const categoria = p.dataset.categoria || "";
        const est = p.dataset.estacion || "";
        const id = p.dataset.id;

        const okTexto = nombre.includes(texto);
        const okCat = categoriaActiva === "all" || categoria === categoriaActiva;
        const okEstacion = filtroEstacion === "all" || est === filtroEstacion || est === "all";
        const okFav = !mostrandoFavoritos || favoritos.includes(id);

        const visible = okTexto && okCat && okEstacion && okFav;
        p.style.display = visible ? "" : "none";
        if (visible) visibles++;
    });

    /* Muestra un mensaje amigable si el filtro no encontró nada */
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
const modal = document.getElementById("modalProducto");
const modalBox = modal ? modal.querySelector(".modal-box") : null;
const modalContenido = modal ? modal.querySelector(".modal-contenido") : null;
const modalCerrar = modal ? modal.querySelector(".modal-cerrar") : null;

/* Nombres legibles para las categorías (para mostrar en la insignia del modal) */
const NOMBRES_CATEGORIA = {
    clasicos: "Clásicos",
    frio: "Frío",
    especiales: "Especiales",
    infusiones: "Infusiones",
    refrescante: "Bebidas sin gas",
    postres: "Postres",
    extras: "Extras",
};
/* Abre el modal con la información del producto al hacer clic en la tarjeta */
function abrirModal(card) {
    if (!modal || !modalContenido) return;

    const id = card.dataset.id;
    const nombre = card.dataset.nombre;
    const categoria = card.dataset.categoria;
    const precio = card.dataset.precio;
    const imgSrc = card.querySelector("img").src;
    const descripcion = card.querySelector(".text-card")?.textContent || "";
    const esFavorito = favoritos.includes(id);

    modalContenido.innerHTML = `
        <span class="modal-categoria">${NOMBRES_CATEGORIA[categoria] || categoria}</span>
        <img src="${imgSrc}" alt="${nombre}">
        <h3 id="modalTitulo">${nombre}</h3>
        <p class="modal-descripcion">${descripcion}</p>
        <p class="precio">S/ ${parseFloat(precio).toFixed(2)}</p>
        <button type="button" class="modal-fav-btn${esFavorito ? " activo" : ""}" data-id="${id}" aria-pressed="${esFavorito}">
            ${esFavorito ? "❤ Quitar de favoritos" : "♡ Agregar a favoritos"}
        </button>
    `;

    modalContenido.querySelector(".modal-fav-btn").addEventListener("click", () => {
        toggleFavorito(id);
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden"; // bloquea el scroll de fondo, igual que el menú móvil
    modalCerrar.focus(); // mueve el foco al botón de cerrar (accesibilidad de teclado)
}

function cerrarModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
}

/* Abrir modal al hacer clic en cualquier tarjeta (excepto el corazón, que ya hace stopPropagation) */
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => abrirModal(card));

    /* Accesibilidad: permite abrir el modal con teclado (Enter o Espacio),
       ya que las tarjetas tienen role="button" tabindex="0" en el HTML. */
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirModal(card);
        }
    });
});

if (modalCerrar) modalCerrar.addEventListener("click", cerrarModal);

/* Cerrar al hacer clic en el fondo oscuro (fuera de la caja del modal) */
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });
}

/* Cerrar con la tecla ESC */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) cerrarModal();
});
