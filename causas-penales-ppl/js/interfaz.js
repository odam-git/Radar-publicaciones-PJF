/*
 * INTERFAZ — CAUSAS PENALES PPL
 *   datos (DatosPPL) → procesamiento (LogicaPPL) → tarjetas/filtros/búsqueda → listado o resumen → ficha
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
  const boton = (clase, texto, ...hijos) => {
    const b = crear("button", clase, texto);
    b.type = "button";
    if (hijos.length) b.prepend(...hijos);
    return b;
  };
  const hoyISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const TITULO = document.title;
  const SEG = CONFIG.seguimiento || { horizontesDias: [30, 90, 180], horizontePorDefecto: 90 };

  const estado = {
    todos: [],
    ejecutoriadas: [],
    fechaCorte: "",
    origen: "",
    claves: new WeakMap(),       // registro → clave interna (para abrir la ficha correcta)
    porClave: new Map(),
    filtros: { ...L.FILTROS_VACIOS, niveles: [] },
    orden: { clave: "antiguedad", direccion: "desc" },  // primero, los que llevan más tiempo
    visibles: [],
    vista: "listado",
    resumenPor: "entidad",
    horizonte: SEG.horizontePorDefecto,
    comparativo: null,
  };

  const el = {
    buscador: $("buscador"), entidad: $("f-entidad"), circuito: $("f-circuito"),
    juzgado: $("f-juzgado"), causa: $("f-causa"), nombre: $("f-nombre"),
    etapa: $("f-etapa"), nivel: $("f-nivel"), motivo: $("f-motivo"), horizonte: $("f-horizonte"),
    lCausas: $("l-causas"), lNombres: $("l-nombres"), masFiltros: $("mas-filtros"), btnMas: $("btn-mas-filtros"),
    tarjetas: $("tarjetas"), regla: $("regla"), total: $("total"), contador: $("contador"), cuerpo: $("cuerpo-tabla"),
    vacio: $("vacio"), tabla: $("tabla"), dialogo: $("detalle"), detalle: $("detalle-cuerpo"),
    detalleNivel: $("detalle-nivel"), fuente: $("fuente-texto"), avisos: $("avisos-datos"),
    depuracion: $("avisos-depuracion"), resultados: $("resultados"), resumen: $("resumen"),
    comparativo: $("comparativo"), proximosTotal: $("proximos-total"), btnProximos: $("btn-proximos"),
  };

  /* ---------- Nivel de antigüedad ---------- */
  const infoNivel = (r) => {
    const a = L.antiguedad(r.fechaAFP);
    return { ...a, def: L.POR_CLAVE[a.nivel] };
  };
  const rangoTexto = (a) => (a.mas30 ? "Más de 30 años" : a.def.descripcion);
  const proximo = (r) => L.proximoCambio(r.fechaAFP, undefined, estado.horizonte);
  const textoCambio = (p) => p.mas30
    ? `Cumple 30 años el ${L.formatearFechaCorta(p.fecha)}`
    : `Pasa a Nivel ${L.POR_CLAVE[p.destino].numero} el ${L.formatearFechaCorta(p.fecha)}`;

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

  function chipNivel(clave) {
    const n = L.POR_CLAVE[clave];
    const s = crear("span", `nivel nivel--chico t-${clave}`, `N${n.numero}`);
    s.title = `Nivel ${n.numero}: ${n.descripcion}`;
    return s;
  }

  /* ---------- Carga de datos ---------- */
  function recibirDatos(resultado) {
    estado.todos = resultado.registros;
    estado.ejecutoriadas = resultado.ejecutoriadas || [];
    estado.fechaCorte = resultado.fechaCorte || "";
    estado.origen = resultado.origen;
    estado.claves = new WeakMap();
    estado.porClave = new Map();
    resultado.registros.forEach((r, i) => {
      estado.claves.set(r, String(i));
      estado.porClave.set(String(i), r);
    });
    estado.comparativo = null;
    el.comparativo.hidden = true;
    el.fuente.textContent = `Fuente: ${resultado.origen} · ${resultado.registros.length} registros en seguimiento` +
      (estado.fechaCorte ? ` · corte al ${L.formatearFecha(estado.fechaCorte)}` : "");
    el.avisos.hidden = !resultado.avisos.length;
    el.avisos.textContent = resultado.avisos.join(" ");
    pintarCorte();
    pintarDepuracion();
    actualizar();
  }

  function mostrarError(e) {
    el.fuente.textContent = "No fue posible cargar los datos. Revise que el archivo tenga los encabezados de la plantilla.";
    el.avisos.hidden = false;
    el.avisos.textContent = e.message;
  }

  function cargar() {
    el.fuente.textContent = "Cargando datos…";
    window.DatosPPL.cargarDatos(CONFIG, window).then(recibirDatos).catch(mostrarError);
  }

  function pintarCorte() {
    const partes = [];
    partes.push(estado.fechaCorte ? `Corte de datos: ${L.formatearFecha(estado.fechaCorte)}` : "Corte de datos: sin fecha");
    partes.push(`Antigüedad calculada al ${L.formatearFecha(hoyISO())}`);
    $("texto-corte").textContent = partes.join(" · ");
  }

  /* ---------- Avisos ---------- */
  function bloqueAviso(clase, id, iconoId, titulo, elementos) {
    const det = crear("details", `depuracion ${clase}`);
    det.id = id;
    const sum = crear("summary");
    sum.append(icono(iconoId, "icono"), crear("span", "depuracion__texto", titulo), crear("span", "depuracion__ver", "VER LISTA"));
    const ul = crear("ul");
    for (const texto of elementos) ul.append(crear("li", null, texto));
    det.append(sum, ul);
    return det;
  }

  function pintarDepuracion() {
    const bloques = [];
    const n = estado.ejecutoriadas.length;
    if (n) {
      bloques.push(bloqueAviso("depuracion--baja", "aviso-ejecutoriadas", "i-alerta",
        `${n} ${n === 1 ? "registro" : "registros"} con sentencia ejecutoriada. ${n === 1 ? "Debe" : "Deben"} darse de baja del seguimiento.`,
        estado.ejecutoriadas.map((r) =>
          `ID ${r.id} · Causa ${r.causa || "sin dato"} · Expediente ${r.expediente || "sin dato"} · ${r.juzgado || ""}` +
          (r.fechaEjecutoria ? ` · Ejecutoria: ${L.formatearFechaCorta(r.fechaEjecutoria)}` : ""))));
    }
    const problemas = L.revisar(estado.todos);
    if (problemas.length) {
      bloques.push(bloqueAviso("depuracion--revision", "aviso-revision", "i-alerta",
        `${problemas.length} ${problemas.length === 1 ? "dato requiere" : "datos requieren"} revisión en la hoja de captura.`,
        problemas.map((p) => `ID ${p.registro.id} · Causa ${p.registro.causa || "sin dato"} · ${p.motivo}`)));
    }
    const locales = estado.todos.filter((r) => r.motivoPrivacion === "Solo por causa del fuero común").length;
    if (locales) {
      const caja = crear("div", "depuracion depuracion--info");
      caja.id = "aviso-local";
      const fila = crear("div", "depuracion__fila");
      const ver = boton("depuracion__ver", "VER ESTOS CASOS");
      ver.id = "btn-ver-locales";
      fila.append(icono("i-info", "icono"),
        crear("span", "depuracion__texto", `${locales} PPL en reclusión solo por un proceso local (fuero común).`),
        ver);
      caja.append(fila);
      bloques.push(caja);
    }
    el.depuracion.replaceChildren(...bloques);
  }

  /* ---------- Regla de años y tarjetas (botones de nivel) ---------- */
  function pintarRegla() {
    const titulo = crear("span", "regla__titulo", "Años desde el auto de formal prisión");
    const limites = [0, ...L.UMBRALES];
    const tramos = L.NIVELES.map((n, i) => {
      const t = crear("div", `regla__tramo t-${n.clave}`);
      const marcas = crear("span", "regla__marcas");
      marcas.append(crear("span", null, String(limites[i])), crear("span", null, i === 4 ? "30 +" : ""));
      t.append(crear("span", "regla__barra"), marcas);
      return t;
    });
    el.regla.replaceChildren(titulo, ...tramos);
  }

  function pintarTarjetas(base) {
    const conteo = L.contarPorNivel(base);
    const sel = estado.filtros.niveles;
    const total = boton("tarjeta tarjeta--total");
    total.dataset.nivel = "";
    total.setAttribute("aria-pressed", String(sel.length === 0));
    const per = L.personas(base);
    total.append(
      crear("span", "tarjeta__etiqueta", "Total en seguimiento"),
      crear("span", "tarjeta__numero", String(base.length)),
      crear("span", "tarjeta__rango", `causas · ${per} ${per === 1 ? "persona" : "personas"}`),
    );
    const mt = crear("span", "tarjeta__muestra");
    mt.append(icono("i-personas"));
    total.append(mt);

    const botones = L.NIVELES.map((n) => {
      const b = boton(`tarjeta t-${n.clave}`);
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

  function pintarProximos() {
    const sinProximos = { ...estado.filtros, proximos: 0 };
    const n = L.filtrar(estado.todos, sinProximos).filter((r) => proximo(r)).length;
    el.proximosTotal.textContent = n;
    const activo = !!estado.filtros.proximos;
    el.btnProximos.setAttribute("aria-pressed", String(activo));
    el.btnProximos.textContent = activo ? "QUITAR ESTE FILTRO" : "VER ESTOS CASOS";
  }

  /* ---------- Filtros ---------- */
  function llenarSelect(select, opciones, textoTodos, valor) {
    select.replaceChildren(...(textoTodos == null ? [] : [new Option(textoTodos, "")]), ...opciones.map((o) =>
      Array.isArray(o) ? new Option(o[1], o[0]) : new Option(o, o)));
    const valores = opciones.map((o) => (Array.isArray(o) ? o[0] : o));
    select.value = valores.includes(valor) ? valor : textoTodos == null ? valores[0] : "";
    return select.value;
  }
  const llenarLista = (datalist, opciones) => datalist.replaceChildren(...opciones.map((o) => new Option(o)));

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
    f.motivo = llenarSelect(el.motivo, L.MOTIVOS, "Todos", f.motivo);

    // El selector de nivel refleja las tarjetas (una sola o varias).
    const opNivel = L.NIVELES.map((n) => [n.clave, `Nivel ${n.numero} · ${n.descripcion}`]);
    if (f.niveles.length > 1) opNivel.push(["varios", `Varios niveles (${f.niveles.length})`]);
    llenarSelect(el.nivel, opNivel, "Todos", f.niveles.length > 1 ? "varios" : f.niveles[0] || "");

    // Indica cuántos filtros ocultos están activos.
    const ocultosActivos = [f.causa, f.nombre, f.etapa, f.motivo, f.niveles.length ? "x" : ""].filter(Boolean).length;
    el.btnMas.textContent = (el.masFiltros.hidden ? "MÁS FILTROS" : "MENOS FILTROS") + (ocultosActivos ? ` (${ocultosActivos} ACTIVOS)` : "");
  }

  function leerFormulario() {
    Object.assign(estado.filtros, {
      texto: el.buscador.value, entidad: el.entidad.value, circuito: el.circuito.value,
      juzgado: el.juzgado.value, causa: el.causa.value, nombre: el.nombre.value,
      etapa: el.etapa.value, motivo: el.motivo.value,
    });
  }

  function mostrarMasFiltros(mostrar) {
    el.masFiltros.hidden = !mostrar;
    el.btnMas.setAttribute("aria-expanded", String(mostrar));
  }

  /* ---------- Listado ---------- */
  function celda(clase, principal, secundario, extra) {
    const td = crear("td", clase);
    if (secundario === undefined) td.textContent = principal;
    else td.append(crear("span", "principal", principal), crear("span", "secundario", secundario));
    if (extra) td.append(extra);
    return td;
  }

  function marcaMotivo(r) {
    const etiqueta = L.ETIQUETA_MOTIVO[r.motivoPrivacion];
    if (!etiqueta) return null;
    const m = crear("span", "marca-motivo");
    m.dataset.motivo = r.motivoPrivacion;
    m.append(icono("i-bandera"), etiqueta);
    return m;
  }

  function celdaNombre(r) {
    const td = crear("td", "col-nombre");
    const marca = marcaMotivo(r);
    if (marca) td.append(crear("span", "principal", r.nombre), marca);
    else td.textContent = r.nombre;
    return td;
  }

  function botonOjo(r) {
    const ojo = boton("boton-ojo");
    ojo.dataset.clave = estado.claves.get(r);
    ojo.setAttribute("aria-label", `Ver ficha de ${r.nombre}, causa ${r.causa}`);
    ojo.title = "Ver ficha";
    ojo.append(icono("i-ojo"));
    return ojo;
  }

  function fila(r) {
    const a = infoNivel(r);
    const p = proximo(r);
    const tr = crear("tr");
    const tdAlerta = crear("td", "col-alerta");
    tdAlerta.append(indicadorNivel(a));
    tr.append(
      tdAlerta,
      celda("col-circuito", r.circuito, r.entidad),
      celda("col-juzgado", r.juzgado),
      celda("col-causa", r.causa, r.expediente),
      celdaNombre(r),
      celda("col-etapa", r.etapa || "Sin dato"),
      celda("col-antiguedad", L.formatearAntiguedad(a), "AFP: " + L.formatearFechaCorta(r.fechaAFP),
        p ? crear("span", "cambio", textoCambio(p)) : null),
    );
    const tdVer = crear("td", "col-ver");
    tdVer.append(botonOjo(r));
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

  /* ---------- Resumen ---------- */
  function pintarResumen() {
    const por = estado.resumenPor;
    const filas = L.resumen(estado.visibles, undefined, por);
    const c = L.concentracion(filas, 5);
    const sujeto = por === "juzgado" ? "juzgados" : "entidades";
    const singular = por === "juzgado" ? "juzgado" : "entidad";
    let titular;
    if (!c.total) titular = "No hay casos de 10 años o más con los filtros aplicados.";
    else if (c.suma === c.total) titular = `Todos los casos de 10 años o más (${c.total}) están en ${c.grupos} ${c.grupos === 1 ? singular : sujeto}.`;
    else titular = `${por === "juzgado" ? "Los" : "Las"} ${c.grupos} ${sujeto} con más casos de 10 años o más reúnen ${c.suma} de ${c.total} (${c.porcentaje} %).`;
    $("resumen-titular").textContent = titular;

    const cabeza = crear("tr");
    const thNombre = crear("th", null, por === "juzgado" ? "Juzgado de Distrito" : "Entidad federativa");
    thNombre.scope = "col";
    cabeza.append(thNombre);
    for (const n of L.NIVELES) {
      const th = crear("th", "num");
      th.scope = "col";
      th.append(chipNivel(n.clave));
      th.setAttribute("aria-label", `Nivel ${n.numero}, ${n.descripcion}`);
      cabeza.append(th);
    }
    for (const t of ["10 años o más", "Total", "Distribución", "Acciones"]) {
      const th = crear("th", t === "Total" || t === "10 años o más" ? "num" : null, t);
      th.scope = "col";
      cabeza.append(th);
    }
    $("cabeza-resumen").replaceChildren(cabeza);

    const cuerpo = filas.map((g) => {
      const tr = crear("tr");
      const tdN = crear("td", "col-nombre-resumen");
      if (por === "juzgado") tdN.append(crear("span", "principal", g.clave), crear("span", "secundario", g.entidad));
      else tdN.append(crear("span", "principal", g.clave));
      tr.append(tdN);
      for (const n of L.NIVELES) tr.append(crear("td", "num" + (g[n.clave] ? "" : " cero"), String(g[n.clave])));
      tr.append(crear("td", "num", `${g.mas10} de ${g.total}`), crear("td", "num", String(g.total)));
      const tdD = crear("td");
      const barra = crear("div", "distribucion");
      barra.setAttribute("role", "img");
      barra.setAttribute("aria-label", L.NIVELES.map((n) => `Nivel ${n.numero}: ${g[n.clave]}`).join(", ") +
        (g.sd ? `, sin fecha: ${g.sd}` : ""));
      for (const n of L.NIVELES) {
        if (!g[n.clave]) continue;
        const seg = crear("span", `t-${n.clave}`);
        seg.style.flexGrow = String(g[n.clave]);
        seg.title = `Nivel ${n.numero} (${n.descripcion}): ${g[n.clave]}`;
        barra.append(seg);
      }
      tdD.append(barra);
      const tdA = crear("td");
      const ver = boton("boton boton--terciario", "VER CAUSAS");
      ver.dataset.grupo = g.clave;
      ver.setAttribute("aria-label", `Ver causas de ${g.clave}`);
      tdA.append(ver);
      tr.append(tdD, tdA);
      return tr;
    });
    $("cuerpo-resumen").replaceChildren(...cuerpo);
  }

  /* ---------- Actualización general ---------- */
  function actualizar() {
    leerFormulario();
    refrescarOpciones();
    const base = L.filtrarSinNivel(estado.todos, estado.filtros);
    const filtrados = L.filtrar(estado.todos, estado.filtros);
    const ordenados = L.ordenar(filtrados, estado.orden.clave, estado.orden.direccion);
    estado.visibles = ordenados;
    pintarTarjetas(base);
    pintarProximos();
    el.total.textContent = ordenados.length;
    el.contador.lastChild.textContent = ` de ${estado.todos.length} PPL`;
    if (estado.vista === "listado") {
      el.cuerpo.replaceChildren(...ordenados.map(fila));
      el.vacio.hidden = ordenados.length > 0;
      el.tabla.hidden = ordenados.length === 0;
      pintarOrden();
    } else {
      pintarResumen();
    }
  }

  function cambiarVista(vista) {
    estado.vista = vista;
    $("vista-listado").setAttribute("aria-pressed", String(vista === "listado"));
    $("vista-resumen").setAttribute("aria-pressed", String(vista === "resumen"));
    el.resultados.hidden = vista !== "listado";
    el.resumen.hidden = vista !== "resumen";
    actualizar();
  }

  function limpiar() {
    $("formulario").reset();
    estado.filtros = { ...L.FILTROS_VACIOS, niveles: [] };
    actualizar();
    el.buscador.focus();
  }

  // Aplica filtros desde otras secciones (resumen, avisos, coimputados) y muestra el listado.
  function aplicarFiltros(nuevos) {
    $("formulario").reset();
    estado.filtros = { ...L.FILTROS_VACIOS, niveles: [], ...nuevos };
    el.causa.value = nuevos.causa || "";
    refrescarOpciones();  // coloca entidad, circuito, juzgado, etapa y motivo en sus selectores
    if (nuevos.causa || nuevos.motivo || nuevos.etapa) mostrarMasFiltros(true);
    cambiarVista("listado");
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
      dato("Nombre de la PPL", r.nombre, "valor--destacado", r.idPersona ? "ID de persona: " + r.idPersona : null),
      dato("Causa penal vigente", r.causa, "valor--causa", "Expediente: " + (r.expediente || "Sin dato")),
    );
    partes.push(principal);

    // 1 bis. Coimputados en la misma causa
    const coimp = L.coimputados(estado.todos, r);
    if (coimp.length) {
      const caja = crear("div", "coimputados");
      caja.append(crear("p", null, `Esta causa tiene ${coimp.length} ${coimp.length === 1 ? "PPL más" : "PPL más"} en seguimiento (coimputados).`));
      const ver = boton("boton boton--terciario", "VER COIMPUTADOS");
      ver.id = "btn-coimputados";
      ver.addEventListener("click", () => {
        cerrarDetalle();
        aplicarFiltros({ entidad: r.entidad, circuito: r.circuito, juzgado: r.juzgado, causa: r.causa });
      });
      caja.append(ver);
      partes.push(caja);
    }

    // 2. Ubicación y reclusión
    const ubicacion = crear("div", "ficha-fila");
    ubicacion.append(
      dato("Circuito judicial", r.circuito),
      dato("Entidad federativa", r.entidad),
      dato("Reclusión", r.lugar, null, null),
    );
    partes.push(ubicacion, dato("Juzgado de Distrito radicador", r.juzgado));

    // 3. Motivo de la privación de libertad
    const motivo = crear("div", "recuadro");
    motivo.append(crear("p", null, r.motivoPrivacion || "Sin dato"));
    if (r.otraAutoridad || r.otraSituacion) {
      motivo.append(crear("p", "fecha-acto", `Otra causa: ${r.otraAutoridad || "autoridad sin dato"}` +
        (r.otraSituacion ? ` · ${r.otraSituacion}` : "")));
    }
    partes.push(seccion("Motivo de la privación de libertad", motivo));

    // 4. Antigüedad y etapa procesal
    const ant = crear("div", "recuadro recuadro--antiguedad");
    ant.append(
      dato("Fecha de auto de formal prisión", L.formatearFecha(r.fechaAFP)),
      dato("Antigüedad", L.formatearAntiguedad(a), "valor--destacado",
        a.nivel === "sd" ? "Sin fecha válida: revisar captura" : `Nivel ${a.def.numero} · ${a.def.color} · ${rangoTexto(a)}`),
      dato("Etapa procesal", r.etapa || "Sin dato"),
    );
    const p = proximo(r);
    if (p) ant.append(crear("p", "nota-cambio", textoCambio(p) + "."));
    if ("penaNoFirme" in r && r.penaNoFirme != null) {
      const nota = crear("p", "nota-informativa");
      nota.append(crear("strong", null, "Dato informativo: "),
        `sentencia de primera instancia (no firme) del ${L.formatearFecha(r.fechaSentencia)}; pena impuesta: ${L.formatearAnios(r.penaNoFirme)}.`);
      ant.append(nota);
    }
    partes.push(seccion("Antigüedad y etapa procesal", ant));

    // 5. Delitos
    partes.push(seccion("Delitos / materia del proceso", crear("div", "recuadro", r.delito || "Sin dato")));

    // 6. Último acto procesal
    const acto = crear("div", "recuadro recuadro--acto");
    acto.append(crear("p", null, r.ultimoActo || "Sin dato"));
    if (r.fechaUltimoActo) acto.append(crear("p", "fecha-acto", "Fecha del último acto: " + L.formatearFecha(r.fechaUltimoActo)));
    if (r.instancia) acto.append(crear("span", "etiqueta-instancia", "Instancia actual: " + r.instancia));
    partes.push(seccion("Último acto procesal / reseña jurisdiccional", acto));

    // 7. Observaciones
    if ("observaciones" in r) partes.push(dato("Observaciones", r.observaciones));

    el.detalle.replaceChildren(...partes);
    el.dialogo.dataset.clave = clave;
    document.title = `Causa ${r.causa} · ${TITULO}`;
    el.dialogo.showModal();
    el.detalle.scrollTop = 0;
    $("btn-x").focus();
  }

  function cerrarDetalle() {
    if (el.dialogo.open) el.dialogo.close();
  }

  /* ---------- Comparativo contra el corte anterior ---------- */
  function lista(titulo, elementos, aRenglon) {
    const det = crear("details");
    det.append(crear("summary", null, `${titulo} (${elementos.length})`));
    const ul = crear("ul");
    for (const x of elementos) ul.append(aRenglon(x));
    if (!elementos.length) ul.append(crear("li", null, "Sin casos."));
    det.append(ul);
    return det;
  }

  function renglon(r, texto) {
    const li = crear("li");
    li.append(crear("span", null, `${r.causa} · ${r.nombre} · ${r.juzgado}` + (texto ? ` — ${texto}` : "")));
    if (estado.claves.has(r)) li.append(botonOjo(r));
    return li;
  }

  function pintarComparativo() {
    const c = estado.comparativo;
    if (!c) { el.comparativo.hidden = true; return; }
    const r = c.resultado;
    const h = crear("h2", null, `Comparativo contra el corte anterior`);
    h.id = "titulo-comparativo";
    const sub = crear("p", null, `Corte anterior: ${c.fechaAnterior ? L.formatearFecha(c.fechaAnterior) : "sin fecha"} (${c.nombre}) · ` +
      `Corte actual: ${estado.fechaCorte ? L.formatearFecha(estado.fechaCorte) : "sin fecha"}`);
    const cifras = crear("div", "comparativo__cifras");
    for (const [t, n] of [["Altas", r.altas.length], ["Bajas", r.bajas.length], ["Cambios de etapa", r.cambiosEtapa.length], ["Subieron de nivel", r.subieron.length]]) {
      const d = crear("div", "cifra");
      d.append(crear("strong", null, String(n)), crear("span", null, t));
      cifras.append(d);
    }
    const nivelTxt = (k) => `Nivel ${L.POR_CLAVE[k].numero}`;
    const pie = crear("div", "comparativo__pie");
    const quitar = boton("boton boton--terciario", "QUITAR COMPARATIVO");
    quitar.id = "btn-quitar-comparativo";
    pie.append(quitar);
    el.comparativo.replaceChildren(h, sub, cifras,
      lista("Altas: causas nuevas en este corte", r.altas, (x) => renglon(x)),
      lista("Bajas: ya no aparecen en seguimiento", r.bajas, (x) => renglon(x.registro, x.motivo)),
      lista("Cambios de etapa procesal", r.cambiosEtapa, (x) => renglon(x.registro, `${x.antes} → ${x.ahora}`)),
      lista("Subieron de nivel de antigüedad", r.subieron, (x) => renglon(x.registro, `${nivelTxt(x.antes)} → ${nivelTxt(x.ahora)}`)),
      pie);
    el.comparativo.hidden = false;
  }

  function cargarCorteAnterior(texto, archivo) {
    const ant = window.DatosPPL.cargarDesdeTextoCSV(texto, archivo.name, CONFIG);
    const fechaArchivo = archivo.lastModified ? new Date(archivo.lastModified).toISOString().slice(0, 10) : "";
    const fechaAnterior = ant.fechaCorte || fechaArchivo;
    estado.comparativo = {
      nombre: archivo.name,
      fechaAnterior,
      resultado: L.comparar(estado.todos, ant.registros, estado.fechaCorte || hoyISO(), fechaAnterior, estado.ejecutoriadas),
    };
    pintarComparativo();
    el.comparativo.scrollIntoView({ block: "start" });
  }

  /* ---------- Exportar vista (archivo CSV en la propia computadora) ---------- */
  function describirFiltros() {
    const f = estado.filtros;
    const partes = [];
    if (f.texto) partes.push(`búsqueda "${f.texto}"`);
    for (const [k, n] of [["entidad", "entidad"], ["circuito", "circuito"], ["juzgado", "juzgado"], ["causa", "causa"], ["nombre", "nombre"], ["etapa", "etapa"], ["motivo", "motivo"]]) {
      if (f[k]) partes.push(`${n}: ${f[k]}`);
    }
    if (f.niveles.length) partes.push("niveles: " + f.niveles.map((k) => "N" + L.POR_CLAVE[k].numero).join(", "));
    if (f.proximos) partes.push(`cambian de nivel en ${f.proximos} días`);
    return partes.length ? partes.join("; ") : "sin filtros";
  }

  function exportarVista() {
    const columnas = window.DatosPPL.MAPA_COLUMNAS.filter((c) => estado.visibles.some((r) => c.clave in r));
    const esc = (v) => {
      const t = v == null ? "" : String(v);
      return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    const filas = [];
    if (CONFIG.clasificacion) filas.push([CONFIG.clasificacion]);
    filas.push([`Corte de datos: ${estado.fechaCorte ? L.formatearFechaCorta(estado.fechaCorte) : "sin fecha"}; exportado: ${L.formatearFechaCorta(hoyISO())}; filtros: ${describirFiltros()}`]);
    filas.push([]);
    filas.push(["Nivel de antigüedad", "Antigüedad", "Próximo cambio de nivel", ...columnas.map((c) => c.columna)]);
    for (const r of estado.visibles) {
      const a = infoNivel(r);
      const p = proximo(r);
      filas.push([
        a.nivel === "sd" ? "Sin dato" : `Nivel ${a.def.numero} (${rangoTexto(a)})`,
        L.formatearAntiguedad(a),
        p ? textoCambio(p) : "",
        ...columnas.map((c) => r[c.clave]),
      ]);
    }
    const csv = "﻿" + filas.map((f) => f.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const enlace = crear("a");
    enlace.href = url;
    enlace.download = `causas_penales_ppl_vista_${hoyISO()}.csv`;
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
  [el.entidad, el.circuito, el.juzgado, el.etapa, el.motivo].forEach((s) => s.addEventListener("change", actualizar));
  el.nivel.addEventListener("change", () => {
    const v = el.nivel.value;
    if (v !== "varios") estado.filtros.niveles = v ? [v] : [];
    actualizar();
  });
  el.btnMas.addEventListener("click", () => { mostrarMasFiltros(el.masFiltros.hidden); refrescarOpciones(); });

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

  llenarSelect(el.horizonte, SEG.horizontesDias.map((d) => [String(d), String(d)]), null, String(estado.horizonte));
  el.horizonte.addEventListener("change", () => {
    estado.horizonte = Number(el.horizonte.value);
    if (estado.filtros.proximos) estado.filtros.proximos = estado.horizonte;
    actualizar();
  });
  el.btnProximos.addEventListener("click", () => {
    estado.filtros.proximos = estado.filtros.proximos ? 0 : estado.horizonte;
    actualizar();
  });

  el.depuracion.addEventListener("click", (e) => {
    if (e.target.closest("#btn-ver-locales")) aplicarFiltros({ motivo: "Solo por causa del fuero común" });
  });

  $("formulario").addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(espera);
    actualizar();
    const destino = estado.vista === "listado" ? el.resultados : el.resumen;
    destino.scrollIntoView({ block: "start" });
    if (estado.vista === "listado") el.resultados.focus({ preventScroll: true });
  });
  $("btn-limpiar").addEventListener("click", limpiar);
  $("btn-limpiar-vacio").addEventListener("click", limpiar);
  $("btn-exportar").addEventListener("click", exportarVista);
  $("vista-listado").addEventListener("click", () => cambiarVista("listado"));
  $("vista-resumen").addEventListener("click", () => cambiarVista("resumen"));
  for (const por of ["entidad", "juzgado"]) {
    $("resumen-" + por).addEventListener("click", () => {
      estado.resumenPor = por;
      $("resumen-entidad").setAttribute("aria-pressed", String(por === "entidad"));
      $("resumen-juzgado").setAttribute("aria-pressed", String(por === "juzgado"));
      pintarResumen();
    });
  }
  $("cuerpo-resumen").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-grupo]");
    if (!b) return;
    const g = b.dataset.grupo;
    const muestra = estado.todos.find((r) => (estado.resumenPor === "juzgado" ? r.juzgado : r.entidad) === g);
    const conservar = { niveles: [...estado.filtros.niveles], etapa: estado.filtros.etapa, motivo: estado.filtros.motivo, proximos: estado.filtros.proximos };
    aplicarFiltros(estado.resumenPor === "juzgado"
      ? { ...conservar, entidad: muestra.entidad, circuito: muestra.circuito, juzgado: g }
      : { ...conservar, entidad: g });
    el.resultados.scrollIntoView({ block: "start" });
  });

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

  // El ojo funciona igual en la tabla y en las listas del comparativo.
  document.addEventListener("click", (e) => {
    const ojo = e.target.closest(".boton-ojo");
    if (ojo) abrirDetalle(ojo.dataset.clave);
    if (e.target.closest("#btn-quitar-comparativo")) { estado.comparativo = null; pintarComparativo(); }
  });

  $("btn-x").addEventListener("click", cerrarDetalle);
  $("btn-cerrar").addEventListener("click", cerrarDetalle);
  // Clic fuera de la ficha (sobre el fondo oscuro) la cierra.
  el.dialogo.addEventListener("click", (e) => { if (e.target === el.dialogo) cerrarDetalle(); });
  // Al cerrar, el foco vuelve al ojo que abrió la ficha.
  el.dialogo.addEventListener("close", () => {
    document.title = TITULO;
    const ojo = document.querySelector(`.boton-ojo[data-clave="${el.dialogo.dataset.clave}"]`);
    if (ojo) ojo.focus();
  });

  // Con doble clic (file://) la copia embebida solo se vuelve a leer recargando la página.
  $("btn-recargar").addEventListener("click", () => {
    if (location.protocol === "file:") location.reload();
    else cargar();
  });
  function leerArchivo(input, alCargar) {
    input.addEventListener("change", (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;
      // El archivo se lee en la propia computadora; no se sube a ningún servidor.
      const lector = new FileReader();
      lector.onload = () => {
        try { alCargar(lector.result, archivo); }
        catch (err) { mostrarError(err); }
        e.target.value = "";
      };
      lector.readAsText(archivo, "utf-8");
    });
  }
  leerArchivo($("archivo-csv"), (texto, archivo) => recibirDatos(window.DatosPPL.cargarDesdeTextoCSV(texto, archivo.name, CONFIG)));
  leerArchivo($("archivo-anterior"), cargarCorteAnterior);

  $("aviso-ficticio").hidden = !CONFIG.fuente.esFicticia;
  if (CONFIG.clasificacion) {
    $("clasificacion").textContent = CONFIG.clasificacion;
    $("clasificacion").hidden = false;
  }
  pintarRegla();
  cargar();
})();
