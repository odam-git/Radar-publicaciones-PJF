/*
 * INTERFAZ — CAUSAS PENALES PPL
 *   datos (DatosPPL) → procesamiento (LogicaPPL) → tarjetas/filtros/búsqueda → tabla → ficha
 * Este archivo solo pinta y responde a la persona usuaria; no contiene registros.
 */
(function () {
  "use strict";

  const CONFIG = window.CONFIG_PPL;
  const L = window.LogicaPPL;
  const $ = (id) => document.getElementById(id);
  const crear = (etiqueta, clase, texto) => {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  };
  const icono = (id, clase) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("aria-hidden", "true");
    if (clase) s.setAttribute("class", clase);
    const u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#" + id);
    s.append(u);
    return s;
  };

  const estado = {
    todos: [],
    ejecutoriadas: [],
    claves: new WeakMap(),       // registro → clave interna (para abrir la ficha correcta)
    porClave: new Map(),
    filtros: { ...L.FILTROS_VACIOS, niveles: [] },
    orden: { clave: "antiguedad", direccion: "desc" },  // primero, los que llevan más tiempo
    visibles: [],
  };

  const el = {
    buscador: $("buscador"), entidad: $("f-entidad"), circuito: $("f-circuito"),
    juzgado: $("f-juzgado"), causa: $("f-causa"), nombre: $("f-nombre"),
    etapa: $("f-etapa"), nivel: $("f-nivel"),
    lCausas: $("l-causas"), lNombres: $("l-nombres"),
    tarjetas: $("tarjetas"), total: $("total"), contador: $("contador"), cuerpo: $("cuerpo-tabla"),
    vacio: $("vacio"), tabla: $("tabla"), dialogo: $("detalle"), detalle: $("detalle-cuerpo"),
    detalleNivel: $("detalle-nivel"), fuente: $("fuente-texto"), avisos: $("avisos-datos"),
    depuracion: $("avisos-depuracion"),
  };

  /* ---------- Nivel de antigüedad ---------- */
  const infoNivel = (r) => {
    const a = L.antiguedad(r.fechaAFP);
    return { ...a, def: L.POR_CLAVE[a.nivel] };
  };
  const rangoTexto = (a) => (a.mas30 ? "Más de 30 años" : a.def.descripcion);

  function indicadorNivel(a, grande) {
    const span = crear("span", `nivel t-${a.nivel}` + (grande ? " nivel--grande" : ""));
    span.dataset.nivel = a.nivel;
    if (a.nivel === "sd") span.textContent = grande ? "SIN FECHA DE AFP" : "S/D";
    else span.textContent = grande
      ? `NIVEL ${a.def.numero} · ${rangoTexto(a).toUpperCase()}`
      : `N${a.def.numero}` + (a.mas30 ? " +30" : "");
    span.title = a.nivel === "sd" ? L.SIN_DATO.descripcion : `Nivel ${a.def.numero} (${a.def.color}): ${rangoTexto(a)}`;
    if (!grande) span.setAttribute("aria-label", span.title);
    return span;
  }

  /* ---------- Carga de datos ---------- */
  function recibirDatos(resultado) {
    estado.todos = resultado.registros;
    estado.ejecutoriadas = resultado.ejecutoriadas || [];
    estado.claves = new WeakMap();
    estado.porClave = new Map();
    resultado.registros.forEach((r, i) => {
      estado.claves.set(r, String(i));
      estado.porClave.set(String(i), r);
    });
    el.fuente.textContent = `Fuente: ${resultado.origen} · ${resultado.registros.length} registros en seguimiento`;
    el.avisos.hidden = !resultado.avisos.length;
    el.avisos.textContent = resultado.avisos.join(" ");
    pintarDepuracion();
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

  /* ---------- Avisos de depuración ---------- */
  function bloqueAviso(clase, id, titulo, elementos) {
    const det = crear("details", `depuracion ${clase}`);
    det.id = id;
    const sum = crear("summary");
    sum.append(icono("i-alerta", "icono"), crear("span", null, titulo), crear("span", "depuracion__ver", "Ver lista"));
    const ul = crear("ul");
    for (const texto of elementos) ul.append(crear("li", null, texto));
    det.append(sum, ul);
    return det;
  }

  function pintarDepuracion() {
    const bloques = [];
    const n = estado.ejecutoriadas.length;
    if (n) {
      bloques.push(bloqueAviso("depuracion--baja", "aviso-ejecutoriadas",
        `${n} ${n === 1 ? "registro" : "registros"} con sentencia ejecutoriada. ${n === 1 ? "Debe" : "Deben"} darse de baja del seguimiento.`,
        estado.ejecutoriadas.map((r) =>
          `ID ${r.id} · Causa ${r.causa || "sin dato"} · Expediente ${r.expediente || "sin dato"} · ${r.juzgado || ""}` +
          (r.fechaEjecutoria ? ` · Ejecutoria: ${L.formatearFechaCorta(r.fechaEjecutoria)}` : ""))));
    }
    const problemas = L.revisar(estado.todos);
    if (problemas.length) {
      bloques.push(bloqueAviso("depuracion--revision", "aviso-revision",
        `${problemas.length} ${problemas.length === 1 ? "dato requiere" : "datos requieren"} revisión en la hoja de captura.`,
        problemas.map((p) => `ID ${p.registro.id} · Causa ${p.registro.causa || "sin dato"} · ${p.motivo}`)));
    }
    el.depuracion.replaceChildren(...bloques);
  }

  /* ---------- Tarjetas (botones de nivel) ---------- */
  function pintarTarjetas(base) {
    const conteo = L.contarPorNivel(base);
    const sel = estado.filtros.niveles;
    const total = crear("button", "tarjeta tarjeta--total");
    total.type = "button";
    total.dataset.nivel = "";
    total.setAttribute("aria-pressed", String(sel.length === 0));
    total.append(
      crear("span", "tarjeta__etiqueta", "Total en seguimiento"),
      crear("span", "tarjeta__numero", String(base.length)),
      crear("span", "tarjeta__rango", "PPL en prisión preventiva"),
    );
    const mt = crear("span", "tarjeta__muestra");
    mt.append(icono("i-personas"));
    total.append(mt);

    const botones = L.NIVELES.map((n) => {
      const b = crear("button", `tarjeta t-${n.clave}`);
      b.type = "button";
      b.dataset.nivel = n.clave;
      b.setAttribute("aria-pressed", String(sel.includes(n.clave)));
      b.setAttribute("aria-label", `Nivel ${n.numero}, ${n.color}: ${n.descripcion}. ${conteo[n.clave]} PPL.`);
      const muestra = crear("span", "tarjeta__muestra");
      muestra.append(crear("span", "tarjeta__num-nivel", String(n.numero)), icono("i-check", "tarjeta__check"));
      b.append(
        crear("span", "tarjeta__etiqueta", `Nivel ${n.numero}`),
        crear("span", "tarjeta__numero", String(conteo[n.clave])),
        crear("span", "tarjeta__rango", n.descripcion),
        crear("span", "tarjeta__color", n.color),
        muestra,
      );
      return b;
    });
    el.tarjetas.replaceChildren(total, ...botones);
  }

  /* ---------- Filtros dependientes ---------- */
  function llenarSelect(select, opciones, textoTodos, valor) {
    select.replaceChildren(new Option(textoTodos, ""), ...opciones.map((o) =>
      Array.isArray(o) ? new Option(o[1], o[0]) : new Option(o, o)));
    const valores = opciones.map((o) => (Array.isArray(o) ? o[0] : o));
    select.value = valores.includes(valor) ? valor : "";
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
    f.etapa = llenarSelect(el.etapa, L.ETAPAS, "Todas", f.etapa);

    // El selector de nivel refleja las tarjetas (una sola o varias).
    const opNivel = L.NIVELES.map((n) => [n.clave, `Nivel ${n.numero} · ${n.descripcion}`]);
    if (f.niveles.length > 1) opNivel.push(["varios", `Varios niveles (${f.niveles.length})`]);
    llenarSelect(el.nivel, opNivel, "Todos", f.niveles.length > 1 ? "varios" : f.niveles[0] || "");
  }

  function leerFormulario() {
    Object.assign(estado.filtros, {
      texto: el.buscador.value, entidad: el.entidad.value, circuito: el.circuito.value,
      juzgado: el.juzgado.value, causa: el.causa.value, nombre: el.nombre.value, etapa: el.etapa.value,
    });
  }

  /* ---------- Resultados ---------- */
  function celda(clase, principal, secundario) {
    const td = crear("td", clase);
    if (secundario === undefined) td.textContent = principal;
    else td.append(crear("span", "principal", principal), crear("span", "secundario", secundario));
    return td;
  }

  function fila(r) {
    const a = infoNivel(r);
    const tr = crear("tr");
    const tdAlerta = crear("td", "col-alerta");
    tdAlerta.append(indicadorNivel(a));
    tr.append(
      tdAlerta,
      celda("col-circuito", r.circuito, r.entidad),
      celda("col-juzgado", r.juzgado),
      celda("col-causa", r.causa, r.expediente),
      celda("col-nombre", r.nombre),
      celda("col-etapa", r.etapa || "Sin dato"),
      celda("col-antiguedad", L.formatearAntiguedad(a), "AFP: " + L.formatearFechaCorta(r.fechaAFP)),
    );
    const tdVer = crear("td", "col-ver");
    const ojo = crear("button", "boton-ojo");
    ojo.type = "button";
    ojo.dataset.clave = estado.claves.get(r);
    ojo.setAttribute("aria-label", `Ver ficha de ${r.nombre}, causa ${r.causa}`);
    ojo.title = "Ver ficha";
    ojo.append(icono("i-ojo"));
    tdVer.append(ojo);
    tr.append(tdVer);
    return tr;
  }

  function pintarOrden() {
    el.tabla.querySelectorAll("th[data-clave]").forEach((th) => {
      const activo = th.dataset.clave === estado.orden.clave &&
        (th.dataset.nombre || th.dataset.clave) === (estado.orden.columna || estado.orden.clave);
      if (activo) th.setAttribute("aria-sort", estado.orden.direccion === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
  }

  function actualizar() {
    leerFormulario();
    refrescarOpciones();
    const base = L.filtrarSinNivel(estado.todos, estado.filtros);
    const filtrados = L.filtrar(estado.todos, estado.filtros);
    const ordenados = L.ordenar(filtrados, estado.orden.clave, estado.orden.direccion);
    estado.visibles = ordenados;
    pintarTarjetas(base);
    el.cuerpo.replaceChildren(...ordenados.map(fila));
    el.total.textContent = ordenados.length;
    el.contador.lastChild.textContent = ` de ${estado.todos.length} PPL`;
    el.vacio.hidden = ordenados.length > 0;
    el.tabla.hidden = ordenados.length === 0;
    pintarOrden();
  }

  function limpiar() {
    $("formulario").reset();
    estado.filtros = { ...L.FILTROS_VACIOS, niveles: [] };
    actualizar();
    el.buscador.focus();
  }

  /* ---------- Ficha emergente ---------- */
  function dato(rotulo, valor, claseValor, complemento) {
    const d = crear("div", "ficha-dato");
    d.append(crear("span", "rotulo", rotulo));
    const v = crear("span", "valor" + (claseValor ? " " + claseValor : ""));
    if (valor instanceof Node) v.append(valor);
    else v.textContent = valor === "" || valor == null ? "Sin dato" : valor;
    d.append(v);
    if (complemento) d.append(crear("span", "complemento", complemento));
    return d;
  }

  function seccion(rotulo, contenido) {
    const s = crear("section", "ficha-seccion");
    s.append(crear("span", "rotulo", rotulo), contenido);
    return s;
  }

  function abrirDetalle(clave) {
    const r = estado.porClave.get(clave);
    if (!r) return;
    const a = infoNivel(r);
    el.detalleNivel.replaceWith(Object.assign(indicadorNivel(a, true), { id: "detalle-nivel" }));
    el.detalleNivel = $("detalle-nivel");

    const partes = [];

    // 1. Persona y causa
    const principal = crear("div", "ficha-bloque");
    principal.append(
      dato("Nombre de la PPL", r.nombre, "valor--destacado"),
      dato("Causa penal vigente", r.causa, "valor--causa", "Expediente: " + (r.expediente || "Sin dato")),
    );
    partes.push(principal);

    // 2. Ubicación
    const ubicacion = crear("div", "ficha-fila");
    ubicacion.append(
      dato("Circuito judicial", r.circuito),
      dato("Entidad federativa", r.entidad),
      dato("Reclusión", r.lugar, null, r.situacion),
    );
    partes.push(ubicacion, dato("Juzgado de Distrito radicador", r.juzgado));

    // 3. Rubro: antigüedad y etapa procesal
    const ant = crear("div", "recuadro recuadro--antiguedad");
    ant.append(
      dato("Fecha de auto de formal prisión", L.formatearFecha(r.fechaAFP)),
      dato("Antigüedad", L.formatearAntiguedad(a), "valor--destacado",
        a.nivel === "sd" ? "Sin fecha válida: revisar captura" : `Nivel ${a.def.numero} · ${a.def.color} · ${rangoTexto(a)}`),
      dato("Etapa procesal", r.etapa || "Sin dato"),
    );
    if ("penaNoFirme" in r && r.penaNoFirme != null) {
      const nota = crear("p", "nota-informativa");
      nota.append(crear("strong", null, "Dato informativo: "),
        `sentencia de primera instancia (no firme) del ${L.formatearFecha(r.fechaSentencia)}; pena impuesta: ${L.formatearAnios(r.penaNoFirme)}.`);
      ant.append(nota);
    }
    partes.push(seccion("Antigüedad y etapa procesal", ant));

    // 4. Delitos
    partes.push(seccion("Delitos / materia del proceso", crear("div", "recuadro", r.delito || "Sin dato")));

    // 5. Último acto procesal
    const acto = crear("div", "recuadro recuadro--acto");
    acto.append(crear("p", null, r.ultimoActo || "Sin dato"));
    if (r.instancia) acto.append(crear("span", "etiqueta-instancia", "Instancia actual: " + r.instancia));
    partes.push(seccion("Último acto procesal / reseña jurisdiccional", acto));

    // 6. Observaciones
    if ("observaciones" in r) partes.push(dato("Observaciones", r.observaciones));

    el.detalle.replaceChildren(...partes);
    el.dialogo.dataset.clave = clave;
    el.dialogo.showModal();
    el.detalle.scrollTop = 0;
    $("btn-x").focus();
  }

  function cerrarDetalle() {
    if (el.dialogo.open) el.dialogo.close();
  }

  /* ---------- Exportar vista (archivo CSV en la propia computadora) ---------- */
  function exportarVista() {
    const columnas = window.DatosPPL.MAPA_COLUMNAS.filter((c) => estado.visibles.some((r) => c.clave in r));
    const esc = (v) => {
      const t = v == null ? "" : String(v);
      return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    const filas = [["Nivel de antigüedad", "Antigüedad", ...columnas.map((c) => c.columna)]];
    for (const r of estado.visibles) {
      const a = infoNivel(r);
      filas.push([
        a.nivel === "sd" ? "Sin dato" : `Nivel ${a.def.numero} (${rangoTexto(a)})`,
        L.formatearAntiguedad(a),
        ...columnas.map((c) => r[c.clave]),
      ]);
    }
    const csv = "﻿" + filas.map((f) => f.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const enlace = crear("a");
    enlace.href = url;
    enlace.download = `causas_penales_ppl_vista_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Eventos ---------- */
  let espera;
  const enEspera = () => { clearTimeout(espera); espera = setTimeout(actualizar, 180); };
  el.buscador.addEventListener("input", enEspera);
  [el.causa, el.nombre].forEach((i) => i.addEventListener("input", enEspera));
  [el.entidad, el.circuito, el.juzgado, el.etapa].forEach((s) => s.addEventListener("change", actualizar));
  el.nivel.addEventListener("change", () => {
    const v = el.nivel.value;
    if (v !== "varios") estado.filtros.niveles = v ? [v] : [];
    actualizar();
  });

  el.tarjetas.addEventListener("click", (e) => {
    const t = e.target.closest(".tarjeta");
    if (!t) return;
    const n = t.dataset.nivel;
    const sel = estado.filtros.niveles;
    estado.filtros.niveles = !n ? [] : sel.includes(n) ? sel.filter((x) => x !== n) : [...sel, n];
    actualizar();
    const nuevo = el.tarjetas.querySelector(`.tarjeta[data-nivel="${n}"]`);
    if (nuevo) nuevo.focus();
  });

  $("formulario").addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(espera);
    actualizar();
    $("resultados").scrollIntoView({ block: "start" });
    $("resultados").focus({ preventScroll: true });
  });
  $("btn-limpiar").addEventListener("click", limpiar);
  $("btn-limpiar-vacio").addEventListener("click", limpiar);
  $("btn-exportar").addEventListener("click", exportarVista);

  el.tabla.querySelector("thead").addEventListener("click", (e) => {
    const th = e.target.closest("th[data-clave]");
    if (!th) return;
    const clave = th.dataset.clave;
    const columna = th.dataset.nombre || clave;
    const misma = (estado.orden.columna || estado.orden.clave) === columna;
    // La antigüedad se ordena primero de mayor a menor; el texto, de la A a la Z.
    const inicial = clave === "antiguedad" ? "desc" : "asc";
    estado.orden = {
      clave, columna,
      direccion: misma ? (estado.orden.direccion === "asc" ? "desc" : "asc") : inicial,
    };
    actualizar();
  });

  el.cuerpo.addEventListener("click", (e) => {
    const ojo = e.target.closest(".boton-ojo");
    if (ojo) abrirDetalle(ojo.dataset.clave);
  });

  $("btn-x").addEventListener("click", cerrarDetalle);
  $("btn-cerrar").addEventListener("click", cerrarDetalle);
  // Clic fuera de la ficha (sobre el fondo oscuro) la cierra.
  el.dialogo.addEventListener("click", (e) => { if (e.target === el.dialogo) cerrarDetalle(); });
  // Al cerrar, el foco vuelve al ojo que abrió la ficha.
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
