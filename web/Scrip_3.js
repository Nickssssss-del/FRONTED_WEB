/* =============================================
   Scrip_3.js
   Lógica de filtros, ordenamiento y resaltado
   de la página de Promociones.
   ============================================= */

/* ── CONSTANTES ── */
const NOMBRE_CAFETERIA = "Bruma Café";
const TOTAL_MESES      = 12;
const MESES_NOMBRES    = [
    "", "Enero","Febrero","Marzo","Abril",
    "Mayo","Junio","Julio","Agosto",
    "Setiembre","Octubre","Noviembre","Diciembre"
];

/* ── ESTADO ── */
let categoriaActual = "todas";
let ordenActual     = "original";

/* ── Resalta la promo del mes actual en el grid ── */
function resaltarMesActual() {
    const mesActual  = new Date().getMonth() + 1;
    const nombreMes  = MESES_NOMBRES[mesActual];
    const tarjetas   = document.querySelectorAll(".promo-card");

    tarjetas.forEach(function(tarjeta) {
        const mesTarjeta = parseInt(tarjeta.getAttribute("data-mes"), 10);

        /* Limpia badges y clases anteriores */
        const badgeAnterior = tarjeta.querySelector(".badge-mes");
        if (badgeAnterior) badgeAnterior.remove();
        tarjeta.classList.remove("destacada");

        if (mesTarjeta === mesActual) {
            tarjeta.classList.add("destacada");

            const badge = document.createElement("span");
            badge.className   = "badge-mes";
            badge.textContent = "Promo de " + nombreMes;
            tarjeta.appendChild(badge);

            setTimeout(function() {
                tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
        }
    });

    mostrarToast("Mostrando la promo de " + nombreMes);
}


function filtrarPorCategoria(valor) {
    categoriaActual = valor;

    const tarjetas = document.querySelectorAll(".promo-card");
    let visibles   = 0;

    tarjetas.forEach(function(tarjeta) {
        const catTarjeta = tarjeta.getAttribute("data-categoria");

        if (categoriaActual === "todas" || catTarjeta === categoriaActual) {
            tarjeta.classList.remove("oculta");
            visibles++;
        } else {
            tarjeta.classList.add("oculta");
        }
    });

    actualizarContador();
    mostrarToast("Mostrando " + visibles + " promoción(es) de «" + etiquetaCategoria(categoriaActual) + "»");
}


function ordenarTarjetas(criterio) {
    ordenActual = criterio;

    const grid     = document.getElementById("grid-promos");
    const tarjetas = Array.from(grid.querySelectorAll(".promo-card"));

    tarjetas.sort(function(a, b) {
        if (ordenActual === "original") {
            return parseInt(a.getAttribute("data-mes"), 10) - parseInt(b.getAttribute("data-mes"), 10);
        }
        const nombreA = a.getAttribute("data-nombre");
        const nombreB = b.getAttribute("data-nombre");
        if (ordenActual === "az") return nombreA.localeCompare(nombreB);
        if (ordenActual === "za") return nombreB.localeCompare(nombreA);

        const precioA = parseFloat(a.getAttribute("data-precio"));
        const precioB = parseFloat(b.getAttribute("data-precio"));
        if (ordenActual === "precio-asc")  return precioA - precioB;
        if (ordenActual === "precio-desc") return precioB - precioA;

        const descA = parseFloat(a.getAttribute("data-descuento") || "0");
        const descB = parseFloat(b.getAttribute("data-descuento") || "0");
        if (ordenActual === "descuento") return descB - descA;

        return 0;
    });

    tarjetas.forEach(function(tarjeta) {
        grid.appendChild(tarjeta);
    });

    mostrarToast("Orden actualizado");
}


function restablecerFiltros() {
    categoriaActual = "todas";
    ordenActual     = "original";

    const selCat   = document.getElementById("sel-categoria");
    const selOrden = document.getElementById("sel-orden");
    if (selCat)   selCat.value   = "todas";
    if (selOrden) selOrden.value = "original";

    filtrarPorCategoria("todas");
    ordenarTarjetas("original");

    mostrarToast("Filtros restablecidos");
}


function actualizarContador() {
    const visibles   = document.querySelectorAll(".promo-card:not(.oculta)").length;
    const etiqueta   = etiquetaCategoria(categoriaActual);
    let textoContador = "Mostrando " + visibles + " de " + TOTAL_MESES + " promociones";
    if (categoriaActual !== "todas") textoContador += " · Categoría: " + etiqueta;

    const el = document.getElementById("contador-resultado");
    if (el) el.textContent = textoContador;
}


function etiquetaCategoria(valor) {
    const etiquetas = {
        todas:  "Todas",
        cafe:   "Café",
        bebida: "Bebidas",
        postre: "Postres",
        te:     "Tés"
    };
    return etiquetas[valor] || valor;
}


function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.classList.add("visible");
    setTimeout(function() {
        toast.classList.remove("visible");
    }, 2500);
}


document.addEventListener("DOMContentLoaded", function() {
    /* Inicializa el contador */
    actualizarContador();

    const btnMesActual   = document.getElementById("btn-mes-actual");
    const btnRestablecer = document.getElementById("btn-restablecer");
    const selCategoria   = document.getElementById("sel-categoria");
    const selOrden       = document.getElementById("sel-orden");

    if (btnMesActual)   btnMesActual.addEventListener("click",  resaltarMesActual);
    if (btnRestablecer) btnRestablecer.addEventListener("click", restablecerFiltros);
    if (selCategoria)   selCategoria.addEventListener("change", function() { filtrarPorCategoria(this.value); });
    if (selOrden)       selOrden.addEventListener("change",     function() { ordenarTarjetas(this.value); });
});
