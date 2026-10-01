/*
 * INTERFAZ — CAUSAS PENALES PPL
 *   datos (DatosPPL) → procesamiento (LogicaPPL) → filtros/búsqueda → tabla → detalle
 * Este archivo solo pinta y responde a la persona usuaria; no contiene registros.
 */
(function () {
  "use strict";

  const CONFIG = window.CONFIG_PPL;
  const L = window.LogicaPPL;
  const $ = (id) => document.getElementById(id);

  const estado = {
    todos: [],
    claves: new WeakMap(),       // registro → clave interna (para abrir el detalle correcto)
    porClave: new Map(),
    filtros: { ...L.FILTROS_VACIOS },
    orden: { clave: "entidad", direccion: "asc" },
  };

  const el = {
    buscador: $("buscador"), entidad: $("f-entidad"), circuito: $("f-circuito"),
    juzgado: $("f-juzgado"), causa: $("f-causa"), nombre: $("f-nombre"), rango: $("f-rango"),
    lCausas: $("l-causas"), lNombres: $("l-nombres"),
    total: $("total"), conteo: $("conteo-rangos"), cuerpo: $("cuerpo-tabla"),
    vacio: $("vacio"), tabla: $("tabla"), dialogo: $("detalle"), detalle: $("detalle-cuerpo"),
    fuente: $("fuente-texto"), avisos: $("avisos-datos"),
  };

  /* ---------- Carga de datos ---------- */
  function recibirDatos(resultado) {
    estado.todos = resultado.registros;
    estado.claves = new WeakMap();
    estado.porClave = new Map();
    resultado.registros.forEach((r, i) => {
      estado.claves.set(r, String(i));
      estado.porClave.set(String(i), r);
    });
    el.fuente.textContent = `Fuente: ${resultado.origen} · ${resultado.registros.length} registros`;
    el.avisos.hidden = !resultado.avisos.length;
    el.avisos.textContent = resultado.avisos.join(" ");
    actualizar();
  }

  function mostrarError(e) {
    el.fuente.textContent = "No fue posible cargar los datos.";
    el.avisos.hidden = false;
    el.avisos.textContent = e.message;
  }

  function cargar() {
    el.fuente.textContent = "Cargando datos…";
    window.DatosPPL.cargarDatos(CONFIG, window).then(recibirDatos).catch(mostrarError);
  }

  /* ---------- Filtros dependientes ---------- */
  function llenarSelect(select, opciones, textoTodos, valor) {
    select.replaceChildren(new Option(textoTodos, ""), ...opciones.map((o) => new Option(o, o)));
    select.value = opciones.includes(valor) ? valor : "";
    return select.value;
  }

  function llenarLista(datalist, opciones) {
    datalist.replaceChildren(...opciones.map((o) => new Option(o)));
  }

  function refrescarOpciones() {
    const f = estado.filtros;
    // Cada nivel se recalcula con el valor ya validado del nivel superior.
    let op = L.opcionesDependientes(estado.todos, f);
    f.entidad = llenarSelect(el.entidad, op.entidades, "Todas", f.entidad);
    op = L.opcionesDependientes(estado.todos, f);
    f.circuito = llenarSelect(el.circuito, op.circuitos, "Todos", f.circuito);
    op = L.opcionesDependientes(estado.todos, f);
    f.juzgado = llenarSelect(el.juzgado, op.juzgados, "Todos", f.juzgado);
    op = L.opcionesDependientes(estado.todos, f);
    llenarLista(el.lCausas, op.causas);
    llenarLista(el.lNombres, op.nombres);
  }

  function leerFormulario() {
    Object.assign(estado.filtros, {
      texto: el.buscador.value, entidad: el.entidad.value, circuito: el.circuito.value,
      juzgado: el.juzgado.value, causa: el.causa.value, nombre: el.nombre.value, rango: el.rango.value,
    });
  }

  /* ---------- Resultados ---------- */
  function celda(texto, clase) {
    const td = document.createElement("td");
    td.className = clase;
    td.textContent = texto;
    return td;
  }

  function chipPena(pena, grande) {
    const rango = L.RANGOS[L.clasificarPena(pena)];
    const chip = document.createElement("span");
    chip.className = `chip chip--${rango.clave}` + (grande ? " chip--grande" : "");
    chip.textContent = L.formatearPena(pena);
    chip.title = `${rango.etiqueta}: ${rango.descripcion}`;
    chip.dataset.rango = rango.clave;
    const lector = document.createElement("span");
    lector.className = "oculto-visual";
    lector.textContent = ` (clasificación ${rango.etiqueta.toLowerCase()})`;
    chip.append(lector);
    return chip;
  }

  function fila(r) {
    const tr = document.createElement("tr");
    tr.append(
      celda(r.entidad, "col-entidad"), celda(r.circuito, "col-circuito"),
      celda(r.juzgado, "col-juzgado"), celda(r.causa, "col-causa"),
      celda(r.nombre, "col-nombre"), celda(r.lugar, "col-lugar"),
    );
    const tdPena = celda("", "col-pena");
    tdPena.append(chipPena(r.pena));
    const tdVer = celda("", "col-ver");
    const ojo = document.createElement("button");
    ojo.type = "button";
    ojo.className = "boton-ojo";
    ojo.dataset.clave = estado.claves.get(r);
    ojo.setAttribute("aria-label", `Ver detalle de ${r.nombre}, causa ${r.causa}`);
    ojo.title = "Ver detalle";
    ojo.innerHTML = '<svg aria-hidden="true"><use href="#i-ojo"/></svg>';
    tdVer.append(ojo);
    tr.append(tdPena, tdVer);
    return tr;
  }

  function pintarConteo(c) {
    const partes = ["amarillo", "naranja", "rojo"].map((k) => {
      const s = document.createElement("span");
      s.dataset.rango = k;
      s.title = L.RANGOS[k].descripcion;
      s.setAttribute("aria-label", `${L.RANGOS[k].descripcion}: ${c[k]}`);
      s.textContent = `${L.RANGOS[k].emoji} ${c[k]}`;
      return s;
    });
    const sep = () => Object.assign(document.createElement("span"), { className: "separador", textContent: "|" });
    el.conteo.replaceChildren(partes[0], sep(), partes[1], sep(), partes[2]);
  }

  function pintarOrden() {
    el.tabla.querySelectorAll("th[data-clave]").forEach((th) => {
      if (th.dataset.clave === estado.orden.clave) {
        th.setAttribute("aria-sort", estado.orden.direccion === "asc" ? "ascending" : "descending");
      } else th.removeAttribute("aria-sort");
    });
  }

  function actualizar() {
    leerFormulario();
    refrescarOpciones();
    const filtrados = L.filtrar(estado.todos, estado.filtros);
    const ordenados = L.ordenar(filtrados, estado.orden.clave, estado.orden.direccion);
    el.cuerpo.replaceChildren(...ordenados.map(fila));
    el.total.textContent = ordenados.length;
    el.vacio.hidden = ordenados.length > 0;
    el.tabla.hidden = ordenados.length === 0;
    pintarConteo(L.contarPorRango(ordenados));
    pintarOrden();
  }

  function limpiar() {
    $("formulario").reset();
    estado.filtros = { ...L.FILTROS_VACIOS };
    actualizar();
    el.buscador.focus();
  }

  /* ---------- Detalle ---------- */
  function dato(etiqueta, valor, completo, destacado) {
    const div = document.createElement("div");
    div.className = [completo && "completo", destacado && "destacado"].filter(Boolean).join(" ");
    const dt = document.createElement("dt");
    dt.textContent = etiqueta;
    const dd = document.createElement("dd");
    if (valor instanceof Node) dd.append(valor);
    else dd.textContent = valor === "" || valor == null ? "Sin dato" : valor;
    div.append(dt, dd);
    return div;
  }

  function abrirDetalle(clave) {
    const r = estado.porClave.get(clave);
    if (!r) return;
    const rango = L.RANGOS[L.clasificarPena(r.pena)];
    const clasif = document.createElement("span");
    clasif.className = `chip chip--grande chip--${rango.clave}`;
    clasif.dataset.rango = rango.clave;
    clasif.textContent = `${rango.etiqueta.toUpperCase()} · ${rango.descripcion}`;

    const dl = document.createElement("dl");
    dl.className = "datos";
    const campos = [
      ["Nombre completo", r.nombre, true, "nombre"],
      ["Expediente", r.expediente, false, "expediente"],
      ["Causa penal", r.causa, false, "causa"],
      ["Delito", r.delito, true, "delito"],
      ["Entidad Federativa", r.entidad, false, "entidad"],
      ["Circuito", r.circuito, false, "circuito"],
      ["Juzgado de Distrito", r.juzgado, true, "juzgado"],
      ["Lugar donde se encuentra", r.lugar, true, "lugar"],
      ["Pena", chipPena(r.pena, true), false, "pena"],
      ["Clasificación", clasif, false, "pena"],
      ["Fecha de sentencia", L.formatearFecha(r.fechaSentencia), false, "fechaSentencia"],
      ["Fecha de inicio", L.formatearFecha(r.fechaInicio), false, "fechaInicio"],
      ["Fecha estimada de cumplimiento", L.formatearFecha(r.fechaCumplimiento), true, "fechaCumplimiento"],
      ["Observaciones", r.observaciones, true, "observaciones"],
    ];
    // Los campos ocultos por configuración de privacidad no se muestran.
    for (const [etq, val, completo, campo] of campos) {
      if (campo in r) dl.append(dato(etq, val, completo, campo === "nombre"));
    }
    el.detalle.replaceChildren(dl);
    el.dialogo.dataset.clave = clave;
    el.dialogo.showModal();
    el.detalle.scrollTop = 0;
    $("btn-x").focus();
  }

  function cerrarDetalle() {
    if (el.dialogo.open) el.dialogo.close();
  }

  /* ---------- Eventos ---------- */
  let espera;
  el.buscador.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(actualizar, 180);
  });
  [el.entidad, el.circuito, el.juzgado, el.rango].forEach((s) => s.addEventListener("change", actualizar));
  [el.causa, el.nombre].forEach((i) => i.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(actualizar, 180);
  }));

  $("formulario").addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(espera);
    actualizar();
    $("resultados").scrollIntoView({ block: "start" });
    $("resultados").focus({ preventScroll: true });
  });
  $("btn-limpiar").addEventListener("click", limpiar);
  $("btn-limpiar-vacio").addEventListener("click", limpiar);

  el.tabla.querySelector("thead").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-clave]");
    if (!th) return;
    const clave = th.dataset.clave;
    estado.orden = {
      clave,
      direccion: estado.orden.clave === clave && estado.orden.direccion === "asc" ? "desc" : "asc",
    };
    actualizar();
  });

  el.cuerpo.addEventListener("click", (e) => {
    const ojo = e.target.closest(".boton-ojo");
    if (ojo) abrirDetalle(ojo.dataset.clave);
  });

  $("btn-x").addEventListener("click", cerrarDetalle);
  $("btn-cerrar").addEventListener("click", cerrarDetalle);
  // Clic fuera de la tarjeta (sobre el fondo oscuro) la cierra.
  el.dialogo.addEventListener("click", (e) => { if (e.target === el.dialogo) cerrarDetalle(); });
  // Al cerrar, el foco vuelve al ojo que abrió la tarjeta.
  el.dialogo.addEventListener("close", () => {
    const ojo = el.cuerpo.querySelector(`.boton-ojo[data-clave="${el.dialogo.dataset.clave}"]`);
    if (ojo) ojo.focus();
  });

  // Con doble clic (file://) la copia embebida solo se vuelve a leer recargando la página.
  $("btn-recargar").addEventListener("click", () => {
    if (location.protocol === "file:") location.reload();
    else cargar();
  });
  $("archivo-csv").addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    // El archivo se lee en la propia computadora; no se sube a ningún servidor.
    const lector = new FileReader();
    lector.onload = () => {
      try { recibirDatos(window.DatosPPL.cargarDesdeTextoCSV(lector.result, archivo.name, CONFIG)); }
      catch (err) { mostrarError(err); }
      e.target.value = "";
    };
    lector.readAsText(archivo, "utf-8");
  });

  $("aviso-ficticio").hidden = !CONFIG.fuente.esFicticia;
  cargar();
})();
