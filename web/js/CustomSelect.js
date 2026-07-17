/* =============================================================
   CUSTOM SELECT — reemplaza visualmente el <select> nativo
   =============================================================
   El <select> original NO se elimina: se mantiene oculto en el DOM
   para que todo el JavaScript que ya existe en el proyecto
   (Scrip_catalogo.js, Scrip_3.js, CarritoPagina.js, FormValidator.js)
   siga funcionando exactamente igual, sin ninguna modificación:

     - document.getElementById("ordenar").value       -> sigue funcionando
     - select.addEventListener("change", ...)          -> sigue funcionando
     - select.value = "todas"                           -> sigue funcionando
       (el panel visual se sincroniza automáticamente)
     - select.classList.add("campo-error")              -> se refleja
       automáticamente en el dropdown personalizado

   Se activa agregando data-cs-skin="pill|underline|boxed" al <select>,
   o dejando el estilo por defecto si no se indica ninguno.
   ============================================================= */

(function () {
    "use strict";

    let contadorId = 0;

    function desplazarSiEsPosible(el) {
        if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ block: "nearest" });
        }
    }

    function crearCustomSelect(select) {
        if (!select || select.dataset.customSelectInit === "1") return;
        select.dataset.customSelectInit = "1";

        const skin = select.dataset.csSkin || "default";
        const idBase = select.id || ("cs-" + (++contadorId));

        /* --- Estructura --- */
        const wrapper = document.createElement("div");
        wrapper.className = "custom-select custom-select--" + skin;

        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        select.classList.add("custom-select__native");
        select.setAttribute("tabindex", "-1");
        select.setAttribute("aria-hidden", "true");

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "custom-select__trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        if (select.disabled) trigger.disabled = true;

        const valorSpan = document.createElement("span");
        valorSpan.className = "custom-select__valor";
        valorSpan.id = idBase + "-cs-valor";

        const flecha = document.createElement("span");
        flecha.className = "custom-select__flecha";
        flecha.setAttribute("aria-hidden", "true");

        trigger.appendChild(valorSpan);
        trigger.appendChild(flecha);
        wrapper.appendChild(trigger);

        /* Etiqueta asociada (label[for]) -> mejora accesibilidad y permite
           que un clic en la etiqueta abra el dropdown personalizado */
        let labelEl = null;
        if (select.id) {
            const labels = document.getElementsByTagName("label");
            for (let i = 0; i < labels.length; i++) {
                if (labels[i].htmlFor === select.id) { labelEl = labels[i]; break; }
            }
        }
        if (labelEl) {
            if (!labelEl.id) labelEl.id = idBase + "-cs-label";
            trigger.setAttribute("aria-labelledby", labelEl.id + " " + valorSpan.id);
            labelEl.addEventListener("click", function (e) {
                e.preventDefault();
                trigger.focus();
                abrir();
            });
        } else {
            trigger.setAttribute("aria-labelledby", valorSpan.id);
        }

        const panel = document.createElement("ul");
        panel.className = "custom-select__panel";
        panel.setAttribute("role", "listbox");
        panel.id = idBase + "-cs-panel";
        trigger.setAttribute("aria-controls", panel.id);
        wrapper.appendChild(panel);

        const opciones = Array.prototype.map.call(select.options, function (opt, i) {
            const li = document.createElement("li");
            li.className = "custom-select__opcion";
            li.setAttribute("role", "option");
            li.id = idBase + "-cs-opt-" + i;
            li.textContent = opt.textContent;
            if (opt.disabled) li.setAttribute("aria-disabled", "true");
            panel.appendChild(li);
            return li;
        });

        /* --- Estado --- */
        let abierto = false;
        let indiceActivo = Math.max(select.selectedIndex, 0);

        function sincronizarVisual() {
            const opt = select.options[select.selectedIndex];
            valorSpan.textContent = opt ? opt.textContent : "";
            opciones.forEach(function (li, i) {
                const sel = i === select.selectedIndex;
                li.classList.toggle("custom-select__opcion--seleccionada", sel);
                li.setAttribute("aria-selected", sel ? "true" : "false");
            });
            trigger.classList.toggle("custom-select__trigger--placeholder", select.value === "");
        }

        function marcarActiva(indice) {
            opciones.forEach(function (li) { li.classList.remove("custom-select__opcion--activa"); });
            const li = opciones[indice];
            if (li) {
                li.classList.add("custom-select__opcion--activa");
                trigger.setAttribute("aria-activedescendant", li.id);
            }
        }

        function abrir() {
            if (select.disabled || abierto) return;
            abierto = true;
            wrapper.classList.add("custom-select--abierto");
            trigger.setAttribute("aria-expanded", "true");
            indiceActivo = select.selectedIndex >= 0 ? select.selectedIndex : 0;
            marcarActiva(indiceActivo);
            const activa = opciones[indiceActivo];
            desplazarSiEsPosible(activa);
            document.addEventListener("click", manejarClickFuera, true);
            document.addEventListener("keydown", manejarEscapeGlobal, true);
        }

        function cerrar() {
            if (!abierto) return;
            abierto = false;
            wrapper.classList.remove("custom-select--abierto");
            trigger.setAttribute("aria-expanded", "false");
            trigger.removeAttribute("aria-activedescendant");
            document.removeEventListener("click", manejarClickFuera, true);
            document.removeEventListener("keydown", manejarEscapeGlobal, true);
        }

        function manejarClickFuera(e) {
            if (!wrapper.contains(e.target)) cerrar();
        }

        function manejarEscapeGlobal(e) {
            if (e.key === "Escape") { cerrar(); trigger.focus(); }
        }

        function elegir(indice) {
            const opt = select.options[indice];
            if (!opt || opt.disabled) return;
            const huboCambio = select.selectedIndex !== indice;
            select.selectedIndex = indice;
            sincronizarVisual();
            if (huboCambio) select.dispatchEvent(new Event("change", { bubbles: true }));
        }

        /* --- Eventos del botón disparador --- */
        trigger.addEventListener("click", function () {
            if (abierto) cerrar(); else abrir();
        });

        trigger.addEventListener("keydown", function (e) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    if (!abierto) { abrir(); break; }
                    indiceActivo = Math.min(indiceActivo + 1, opciones.length - 1);
                    marcarActiva(indiceActivo);
                    desplazarSiEsPosible(opciones[indiceActivo]);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    if (!abierto) { abrir(); break; }
                    indiceActivo = Math.max(indiceActivo - 1, 0);
                    marcarActiva(indiceActivo);
                    desplazarSiEsPosible(opciones[indiceActivo]);
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (abierto) { elegir(indiceActivo); cerrar(); }
                    else abrir();
                    break;
                case "Escape":
                    if (abierto) { e.preventDefault(); cerrar(); }
                    break;
                case "Home":
                    if (abierto) { e.preventDefault(); indiceActivo = 0; marcarActiva(0); desplazarSiEsPosible(opciones[0]); }
                    break;
                case "End":
                    if (abierto) { e.preventDefault(); indiceActivo = opciones.length - 1; marcarActiva(indiceActivo); desplazarSiEsPosible(opciones[indiceActivo]); }
                    break;
                case "Tab":
                    cerrar();
                    break;
                default:
                    break;
            }
        });

        opciones.forEach(function (li, i) {
            li.addEventListener("click", function () { elegir(i); cerrar(); trigger.focus(); });
            li.addEventListener("mouseenter", function () { indiceActivo = i; marcarActiva(i); });
        });

        /* Si algo externo cambia el valor con .value = "x" (p.ej. un botón
           "Restablecer filtros"), se mantiene sincronizado el panel visual. */
        const descriptorNativo = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
        if (descriptorNativo && descriptorNativo.configurable) {
            Object.defineProperty(select, "value", {
                get: function () { return descriptorNativo.get.call(select); },
                set: function (v) {
                    descriptorNativo.set.call(select, v);
                    sincronizarVisual();
                },
                configurable: true
            });
        }
        select.addEventListener("change", sincronizarVisual);

        /* Refleja en el dropdown personalizado los estados que otros scripts
           apliquen directamente al <select> nativo: disabled y clases de error
           de validación (campo-error / input-form--error). */
        const observer = new MutationObserver(function () {
            trigger.disabled = select.disabled;
            wrapper.classList.toggle("custom-select--disabled", select.disabled);
            wrapper.classList.toggle(
                "custom-select--error",
                select.classList.contains("campo-error") || select.classList.contains("input-form--error")
            );
        });
        observer.observe(select, { attributes: true, attributeFilter: ["class", "disabled"] });

        sincronizarVisual();
    }

    function iniciar(contenedor) {
        const raiz = contenedor || document;
        raiz.querySelectorAll("select:not([data-no-custom])").forEach(crearCustomSelect);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { iniciar(document); });
    } else {
        iniciar(document);
    }

    window.BrumaCustomSelect = { iniciar: iniciar, crearCustomSelect: crearCustomSelect };
})();
