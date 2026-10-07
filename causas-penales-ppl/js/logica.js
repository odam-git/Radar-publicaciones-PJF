/*
 * PROCESAMIENTO — CAUSAS PENALES PPL
 * Funciones puras: antigüedad, semáforo, búsqueda, filtros, orden, revisión y formato.
 * No tocan la pantalla ni la fuente de datos (se prueban con Node).
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.LogicaPPL = fabrica();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- Semáforo de antigüedad -------------------------------------
   * Antigüedad = tiempo transcurrido desde la Fecha de auto de formal prisión
   * hasta hoy. Cada rango incluye su límite superior:
   *   N1 hasta 2 años · N2 más de 2 y hasta 5 · N3 más de 5 y hasta 10
   *   N4 más de 10 y hasta 20 · N5 más de 20 (incluye más de 30 años)
   */
  const NIVELES = [
    { clave: "n1", numero: 1, hasta: 2,  color: "Amarillo claro",  descripcion: "Hasta 2 años" },
    { clave: "n2", numero: 2, hasta: 5,  color: "Amarillo fuerte", descripcion: "De 2 a 5 años" },
    { clave: "n3", numero: 3, hasta: 10, color: "Naranja claro",   descripcion: "De 5 a 10 años" },
    { clave: "n4", numero: 4, hasta: 20, color: "Naranja fuerte",  descripcion: "De 10 a 20 años" },
    { clave: "n5", numero: 5, hasta: 30, color: "Rojo",            descripcion: "De 20 a 30 años" },
  ];
  const SIN_DATO = { clave: "sd", numero: 0, color: "Gris", descripcion: "Sin fecha de auto de formal prisión" };
  const POR_CLAVE = Object.fromEntries([...NIVELES, SIN_DATO].map((n) => [n.clave, n]));

  const MOTIVOS = [
    "Solo por esta causa federal",
    "Por esta causa y por otra causa federal",
    "Por esta causa y por causa del fuero común",
    "Solo por causa del fuero común",
    "Compurga pena por otra causa",
  ];
  // Etiqueta visible cuando la persona no está privada de la libertad solo por esta causa.
  const ETIQUETA_MOTIVO = {
    "Por esta causa y por otra causa federal": "También por otra causa federal",
    "Por esta causa y por causa del fuero común": "También por proceso local",
    "Solo por causa del fuero común": "Reclusión por proceso local",
    "Compurga pena por otra causa": "Compurga pena por otra causa",
  };

  // Catálogo literal del Código Federal de Procedimientos Penales (CFPP).
  const ETAPAS = [
    "Instrucción",                                        // arts. 1o fracc. III y 147
    "Instrucción agotada / cerrada",                      // art. 150
    "Conclusiones",                                       // art. 291
    "Audiencia de vista / citado para sentencia",         // art. 305
    "Sentencia de primera instancia (plazo para apelar)", // arts. 360 y 368
    "Segunda instancia (apelación)",                      // arts. 4o, 363 y 364
    "Reposición del procedimiento",                       // arts. 386 a 388
    "Procedimiento suspendido (art. 468)",                // art. 468
  ];
  const TIPOS_PROCEDIMIENTO = ["Ordinario", "Sumario"];
  const RESULTADOS_REVISION = ["Pendiente de resolver", "Se mantuvo la prisión preventiva", "Se sustituyó la medida", "Cesó la medida"];
  const MOTIVOS_BAJA = [
    "Sentencia ejecutoriada (art. 360 CFPP)",
    "Libertad provisional bajo caución (art. 399 CFPP)",
    "Libertad por desvanecimiento de datos (art. 422 CFPP)",
    "Sobreseimiento (art. 298 CFPP)",
    "Conclusiones no acusatorias / inmediata libertad (art. 291 CFPP)",
    "Cese o sustitución de la medida (quinto transitorio, DOF 17-06-2016)",
    "Amparo directo promovido (art. 170 Ley de Amparo)",
    "Otro (especificar en observaciones)",
  ];

  /* ---------- Declaratorias de entrada en vigor del CNPP (ámbito federal) ----
   * Emitidas por el Congreso de la Unión conforme al artículo segundo transitorio del CNPP.
   * [fecha de entrada en vigor, fecha de publicación en el DOF, entidades]
   */
  const DECLARATORIAS = [
    ["2014-11-24", "2014-09-24", ["Durango", "Puebla"]],
    ["2015-03-16", "2014-12-12", ["Yucatán", "Zacatecas"]],
    ["2015-08-01", "2015-04-29", ["Baja California Sur", "Guanajuato", "Querétaro", "San Luis Potosí"]],
    ["2015-11-30", "2015-09-25", ["Chiapas", "Chihuahua", "Coahuila", "Coahuila de Zaragoza", "Nayarit", "Oaxaca", "Sinaloa", "Tlaxcala"]],
    ["2016-02-29", "2015-09-25", ["Aguascalientes", "Colima", "Estado de México", "México", "Hidalgo", "Morelos", "Nuevo León",
      "Quintana Roo", "Tabasco", "Ciudad de México", "Distrito Federal"]],
    ["2016-04-29", "2016-02-26", ["Campeche", "Michoacán", "Michoacán de Ocampo", "Sonora", "Veracruz", "Veracruz de Ignacio de la Llave"]],
    ["2016-06-14", "2016-02-26", ["Baja California", "Guerrero", "Jalisco", "Tamaulipas"]],
  ];

  /* ---------- Fechas ---------------------------------------------------- */
  const iso = (d) => d.toISOString().slice(0, 10);
  const aFecha = (iso) => {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  };
  const hoyUTC = (hoy) => {
    const d = hoy || new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  };
  function sumarAnios(fecha, anios) {
    const d = new Date(fecha);
    d.setUTCFullYear(d.getUTCFullYear() + anios);
    if (d.getUTCDate() !== fecha.getUTCDate()) d.setUTCDate(0); // 29 de febrero
    return d;
  }

  // Años y meses completos entre dos fechas.
  function diferencia(desde, hasta) {
    let meses = (hasta.getUTCFullYear() - desde.getUTCFullYear()) * 12 + hasta.getUTCMonth() - desde.getUTCMonth();
    if (hasta.getUTCDate() < desde.getUTCDate()) meses--;
    return { anios: Math.floor(meses / 12), meses: meses % 12 };
  }

  /*
   * Devuelve { nivel, anios, meses, dias, mas30 } o nivel "sd" si la fecha falta,
   * no es válida o es posterior a hoy.
   */
  function antiguedad(fechaAFP, hoy) {
    const afp = aFecha(fechaAFP);
    const h = hoyUTC(hoy);
    if (!afp || afp > h) return { nivel: "sd", anios: null, meses: null, dias: null, mas30: false };
    const nivel = NIVELES.find((n) => sumarAnios(afp, n.hasta) >= h) || NIVELES[4];
    const mas30 = sumarAnios(afp, 30) < h;
    return { nivel: nivel.clave, ...diferencia(afp, h), dias: Math.round((h - afp) / 864e5), mas30 };
  }

  const nivelDe = (r, hoy) => antiguedad(r.fechaAFP, hoy).nivel;

  function contarPorNivel(registros, hoy) {
    const c = { n1: 0, n2: 0, n3: 0, n4: 0, n5: 0, sd: 0 };
    for (const r of registros) c[nivelDe(r, hoy)]++;
    return c;
  }

  /* ---------- Alertas con fundamento ------------------------------------ */
  let porDeclaratoria = null; // se construye al primer uso
  function declaratoriaDe(entidad) {
    if (!porDeclaratoria) {
      porDeclaratoria = new Map();
      for (const [vigor, dof, entidades] of DECLARATORIAS) for (const e of entidades) porDeclaratoria.set(normalizar(e), { vigor, dof });
    }
    return porDeclaratoria.get(normalizar(entidad)) || null;
  }

  function sumarMeses(fecha, meses) {
    const d = new Date(fecha);
    d.setUTCMonth(d.getUTCMonth() + meses);
    if (d.getUTCDate() !== fecha.getUTCDate()) d.setUTCDate(0);
    return d;
  }
  // Días de lunes a viernes después de `desde` y hasta `hasta` (no descuenta días inhábiles oficiales).
  // Días de lunes a viernes después de «desde» y hasta «hasta» inclusive (no descuenta días inhábiles oficiales).
  function diasHabiles(desde, hasta) {
    const dias = Math.round((hasta - desde) / 86400000);
    if (!(dias > 0)) return 0;
    let n = Math.floor(dias / 7) * 5;
    const d = new Date(desde.getTime() + Math.floor(dias / 7) * 7 * 86400000);
    for (let i = 0; i < dias % 7; i++) {
      d.setUTCDate(d.getUTCDate() + 1);
      const s = d.getUTCDay();
      if (s !== 0 && s !== 6) n++;
    }
    return n;
  }

  /*
   * Alertas objetivas de un registro: plazos del CFPP y sistema procesal aplicable.
   * Devuelve [{ tipo: "plazo" | "sistema", texto, fundamento }].
   */
  function alertas(r, hoy) {
    const h = hoyUTC(hoy);
    const lista = [];
    const afp = aFecha(r.fechaAFP);
    const fc = (iso) => formatearFechaCorta(iso);
    if (r.etapa === ETAPAS[0] && afp) {
      if (normalizar(r.tipoProcedimiento) === "sumario") {
        const limite = new Date(afp); limite.setUTCDate(limite.getUTCDate() + 30);
        if (h > limite) lista.push({ tipo: "plazo", texto: "Procedimiento sumario con más de 30 días sin cerrar la instrucción.", fundamento: "CFPP, art. 152, inciso b)" });
      } else if (h > sumarMeses(afp, 10)) {
        lista.push({ tipo: "plazo", texto: "La instrucción supera 10 meses desde el auto de formal prisión.", fundamento: "CFPP, art. 147 (delito con pena máxima mayor de dos años)" });
      }
    }
    const cierre = aFecha(r.fechaCierre);
    if (r.etapa === ETAPAS[2] && cierre && diasHabiles(cierre, h) > 60) {
      lista.push({ tipo: "plazo", texto: "Más de 60 días hábiles desde el cierre de instrucción: rebasa los plazos máximos para formular conclusiones.", fundamento: "CFPP, art. 291" });
    }
    const audiencia = aFecha(r.fechaAudiencia);
    if (r.etapa === ETAPAS[3] && audiencia && diasHabiles(audiencia, h) > 30) {
      lista.push({ tipo: "plazo", texto: "Más de 30 días hábiles desde la audiencia de vista sin sentencia.", fundamento: "CFPP, art. 97" });
    }
    const sentencia = aFecha(r.fechaSentencia);
    if (r.etapa === ETAPAS[4] && sentencia && diasHabiles(sentencia, h) > 5) {
      lista.push({ tipo: "plazo", texto: "Más de 5 días hábiles desde la sentencia: verificar si se apeló o si causó ejecutoria.", fundamento: "CFPP, arts. 368 y 360, fracc. I" });
    }
    const ap = aFecha(r.fechaInicioAP);
    const decl = declaratoriaDe(r.entidad);
    if (ap && decl && iso(ap) >= decl.vigor) {
      lista.push({
        tipo: "sistema",
        texto: `La averiguación previa inició el ${fc(iso(ap))}, en o después de la entrada en vigor del CNPP en ${r.entidad} (${fc(decl.vigor)}): verificar que la causa corresponda al sistema tradicional.`,
        fundamento: `CPEUM, transitorio Cuarto del decreto DOF 18-06-2008; declaratoria DOF ${fc(decl.dof)}`,
      });
    }
    return lista;
  }

  /* ---------- Revisión de calidad de datos ------------------------------ */
  function revisar(registros, hoy) {
    const h = hoyUTC(hoy);
    const problemas = [];
    for (const r of registros) {
      const afp = aFecha(r.fechaAFP);
      if (!afp) problemas.push({ registro: r, motivo: "Sin fecha de auto de formal prisión (o con formato no válido)" });
      else if (afp > h) problemas.push({ registro: r, motivo: "Fecha de auto de formal prisión posterior a hoy" });
      if (!ETAPAS.includes(r.etapa)) {
        problemas.push({ registro: r, motivo: r.etapa ? `Etapa procesal fuera del catálogo: "${r.etapa}"` : "Sin etapa procesal" });
      }
      const i = ETAPAS.indexOf(r.etapa);
      if (i >= 2 && i <= 5 && !aFecha(r.fechaCierre)) problemas.push({ registro: r, motivo: "Falta la fecha de cierre de instrucción" });
      if (i >= 3 && i <= 5 && !aFecha(r.fechaAudiencia)) problemas.push({ registro: r, motivo: "Falta la fecha de la audiencia de vista" });
      if ((i === 4 || i === 5) && !aFecha(r.fechaSentencia)) problemas.push({ registro: r, motivo: "Falta la fecha de sentencia de primera instancia" });
    }
    return problemas;
  }

  /* ---------- Texto ----------------------------------------------------- */
  const normalizar = (t) =>
    String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

  const CAMPOS_BUSQUEDA = ["nombre", "expediente", "causa", "entidad", "circuito", "juzgado", "delito", "lugar", "etapa", "instancia"];
  const camposNormalizados = (r) => CAMPOS_BUSQUEDA.map((c) => normalizar(r[c]));

  /*
   * Búsqueda sin distinguir mayúsculas ni acentos:
   *  1) Si la frase completa aparece en algún campo de algún registro
   *     (p. ej. "Décimo Segundo Circuito"), se muestran solo esas coincidencias exactas.
   *  2) Si no, cada palabra debe aparecer en algún campo (p. ej. "lopez jalisco").
   */
  function coincideBusqueda(registro, texto) {
    const palabras = normalizar(texto).split(" ").filter(Boolean);
    if (!palabras.length) return true;
    const pajar = camposNormalizados(registro).join(" | ");
    return palabras.every((p) => pajar.includes(p));
  }

  function buscar(registros, texto) {
    const frase = normalizar(texto);
    if (!frase) return registros;
    const exactos = registros.filter((r) => camposNormalizados(r).some((v) => v.includes(frase)));
    return exactos.length ? exactos : registros.filter((r) => coincideBusqueda(r, frase));
  }

  /* ---------- Filtros --------------------------------------------------- */
  const FILTROS_VACIOS = Object.freeze({
    texto: "", entidad: "", circuito: "", juzgado: "", causa: "", nombre: "", etapa: "", motivo: "", alerta: "",
    niveles: [], proximos: 0,
  });

  // Todos los filtros excepto los niveles (sirve para los conteos de las tarjetas).
  function filtrarSinNivel(registros, f, hoy) {
    const causa = normalizar(f.causa);
    const nombre = normalizar(f.nombre);
    const porFiltros = registros.filter((r) =>
      (!f.entidad || r.entidad === f.entidad) &&
      (!f.circuito || r.circuito === f.circuito) &&
      (!f.juzgado || r.juzgado === f.juzgado) &&
      (!causa || normalizar(r.causa).includes(causa)) &&
      (!nombre || normalizar(r.nombre).includes(nombre)) &&
      (!f.etapa || r.etapa === f.etapa) &&
      (!f.motivo || r.motivoPrivacion === f.motivo) &&
      (!f.proximos || !!proximoCambio(r.fechaAFP, hoy, f.proximos)) &&
      (!f.alerta || alertas(r, hoy).some((a) => f.alerta === "cualquiera" || a.tipo === f.alerta))
    );
    return buscar(porFiltros, f.texto);
  }

  function filtrar(registros, f, hoy) {
    const base = filtrarSinNivel(registros, f, hoy);
    const niveles = f.niveles || [];
    return niveles.length ? base.filter((r) => niveles.includes(nivelDe(r, hoy))) : base;
  }

  const unicos = (lista) => [...new Set(lista.filter(Boolean))];

  /*
   * Opciones de cada filtro según los filtros superiores
   * (Entidad → Circuito → Juzgado → Causa / Nombre).
   */
  function opcionesDependientes(registros, f) {
    const porEntidad = registros.filter((r) => !f.entidad || r.entidad === f.entidad);
    const porCircuito = porEntidad.filter((r) => !f.circuito || r.circuito === f.circuito);
    const porJuzgado = porCircuito.filter((r) => !f.juzgado || r.juzgado === f.juzgado);
    return {
      entidades: unicos(registros.map((r) => r.entidad)).sort(compararTexto),
      circuitos: unicos(porEntidad.map((r) => r.circuito)).sort(compararCircuito),
      juzgados: unicos(porCircuito.map((r) => r.juzgado)).sort(compararTexto),
      causas: unicos(porJuzgado.map((r) => r.causa)).sort(compararTexto),
      nombres: unicos(porJuzgado.map((r) => r.nombre)).sort(compararTexto),
      etapas: ETAPAS.filter((e) => registros.some((r) => r.etapa === e)),
    };
  }

  /* ---------- Orden ----------------------------------------------------- */
  const colador = new Intl.Collator("es", { sensitivity: "base", numeric: true });
  const compararTexto = (a, b) => colador.compare(String(a == null ? "" : a), String(b == null ? "" : b));

  // "Décimo Segundo Circuito" → 12, para ordenar circuitos por número.
  const ORDINALES = {
    primer: 1, primero: 1, segundo: 2, tercer: 3, tercero: 3, cuarto: 4, quinto: 5,
    sexto: 6, septimo: 7, octavo: 8, noveno: 9, decimo: 10, vigesimo: 20, trigesimo: 30,
  };
  function numeroCircuito(texto) {
    const digitos = String(texto).match(/\d+/);
    if (digitos) return parseInt(digitos[0], 10);
    let n = 0;
    for (const palabra of normalizar(texto).split(" ")) n += ORDINALES[palabra] || 0;
    return n || Infinity;
  }
  const compararCircuito = (a, b) => numeroCircuito(a) - numeroCircuito(b) || compararTexto(a, b);

  // Para ordenar por antigüedad: la fecha más antigua es la de mayor antigüedad.
  // Los registros sin fecha válida quedan siempre al final.
  const valorAntiguedad = (r) => {
    const f = aFecha(r.fechaAFP);
    return f ? -f.getTime() : null;
  };

  function ordenar(registros, clave, direccion) {
    const signo = direccion === "desc" ? -1 : 1;
    let cmp;
    if (clave === "antiguedad") {
      cmp = (a, b) => {
        const va = valorAntiguedad(a), vb = valorAntiguedad(b);
        if (va === null || vb === null) return 0;
        return va - vb;
      };
    } else if (clave === "circuito") cmp = (a, b) => compararCircuito(a.circuito, b.circuito);
    else if (clave === "etapa") cmp = (a, b) => ETAPAS.indexOf(a.etapa) - ETAPAS.indexOf(b.etapa);
    else cmp = (a, b) => compararTexto(a[clave], b[clave]);

    return [...registros].sort((a, b) => {
      if (clave === "antiguedad") {
        const sa = valorAntiguedad(a) === null, sb = valorAntiguedad(b) === null;
        if (sa !== sb) return sa ? 1 : -1;
      }
      return signo * cmp(a, b) || compararTexto(a.id, b.id);
    });
  }

  /* ---------- Próximos a cambiar de nivel ------------------------------
   * Como cada rango incluye su límite superior, el nivel cambia el día
   * siguiente a cumplir 2, 5, 10, 20 o 30 años desde el auto de formal prisión.
   */
  const UMBRALES = [2, 5, 10, 20, 30];
  function proximoCambio(fechaAFP, hoy, dias) {
    const afp = aFecha(fechaAFP);
    const h = hoyUTC(hoy);
    if (!afp || afp > h) return null;
    for (const anios of UMBRALES) {
      const cambio = sumarAnios(afp, anios);
      cambio.setUTCDate(cambio.getUTCDate() + 1);
      if (cambio > h) {
        const faltan = Math.round((cambio - h) / 864e5);
        if (faltan > dias) return null;
        const destino = anios === 30 ? "n5" : NIVELES[UMBRALES.indexOf(anios) + 1].clave;
        return { anios, fecha: cambio.toISOString().slice(0, 10), faltan, destino, mas30: anios === 30 };
      }
    }
    return null;
  }

  /* ---------- Personas y coimputados ----------------------------------- */
  const llavePersona = (r) => r.idPersona || normalizar(r.nombre);
  const personas = (registros) => new Set(registros.map(llavePersona)).size;
  const mismaCausa = (a, b) => normalizar(a.causa) === normalizar(b.causa) && a.juzgado === b.juzgado;
  const coimputados = (registros, r) => registros.filter((x) => x !== r && mismaCausa(x, r));

  /* ---------- Resumen por entidad o por juzgado ------------------------ */
  function resumen(registros, hoy, por) {
    const grupos = new Map();
    for (const r of registros) {
      const clave = por === "juzgado" ? r.juzgado : r.entidad;
      if (!grupos.has(clave)) {
        grupos.set(clave, { clave, entidad: r.entidad, total: 0, n1: 0, n2: 0, n3: 0, n4: 0, n5: 0, sd: 0, mas10: 0 });
      }
      const g = grupos.get(clave);
      const n = nivelDe(r, hoy);
      g[n]++; g.total++;
      if (n === "n4" || n === "n5") g.mas10++;
    }
    // Orden por casos de 10 años o más; la cifra visible ("12 de 15") coincide con el orden.
    return [...grupos.values()].sort((a, b) => b.mas10 - a.mas10 || b.total - a.total || compararTexto(a.clave, b.clave));
  }

  function concentracion(filas, top) {
    const total = filas.reduce((s, g) => s + g.mas10, 0);
    const primeros = filas.slice(0, top).filter((g) => g.mas10 > 0);
    const suma = primeros.reduce((s, g) => s + g.mas10, 0);
    return { grupos: primeros.length, suma, total, porcentaje: total ? Math.round((suma / total) * 100) : 0 };
  }

  /* ---------- Comparativo contra el corte anterior ---------------------- */
  const llaveCausa = (r) => [llavePersona(r), normalizar(r.causa), r.juzgado].join("|");

  // `salidas`: { bajas, amparos } del corte actual, para explicar por qué salió cada registro.
  function comparar(actuales, anteriores, corteActual, corteAnterior, salidas) {
    const fa = aFecha(corteActual), fp = aFecha(corteAnterior);
    const mapaAnt = new Map(anteriores.map((r) => [llaveCausa(r), r]));
    const mapaAct = new Map(actuales.map((r) => [llaveCausa(r), r]));
    const motivoSalida = new Map();
    for (const r of (salidas && salidas.bajas) || []) motivoSalida.set(llaveCausa(r), r.motivoBaja || "Baja");
    for (const r of (salidas && salidas.amparos) || []) motivoSalida.set(llaveCausa(r), "Sentencia definitiva: amparo directo en trámite");
    const altas = [], cambiosEtapa = [], subieron = [], bajas = [];
    for (const r of actuales) {
      const a = mapaAnt.get(llaveCausa(r));
      if (!a) { altas.push(r); continue; }
      if (a.etapa !== r.etapa) cambiosEtapa.push({ registro: r, antes: a.etapa, ahora: r.etapa });
      const nA = antiguedad(a.fechaAFP, fp).nivel, nR = antiguedad(r.fechaAFP, fa).nivel;
      if (nA !== nR && nA !== "sd" && nR !== "sd") subieron.push({ registro: r, antes: nA, ahora: nR });
    }
    for (const a of anteriores) {
      if (!mapaAct.has(llaveCausa(a))) bajas.push({ registro: a, motivo: motivoSalida.get(llaveCausa(a)) || "Ya no aparece en el corte actual" });
    }
    return { altas, bajas, cambiosEtapa, subieron };
  }

  /* ---------- Formato --------------------------------------------------- */
  function formatearAntiguedad(a) {
    if (a.anios === null) return "Sin dato";
    const partes = [];
    if (a.anios) partes.push(a.anios + (a.anios === 1 ? " año" : " años"));
    if (a.meses) partes.push(a.meses + (a.meses === 1 ? " mes" : " meses"));
    return partes.join(" ") || "Menos de 1 mes";
  }

  function formatearAnios(anios) {
    const totalMeses = Math.round(anios * 12);
    const a = Math.floor(totalMeses / 12), m = totalMeses % 12;
    const partes = [];
    if (a) partes.push(a + (a === 1 ? " año" : " años"));
    if (m) partes.push(m + (m === 1 ? " mes" : " meses"));
    return partes.join(" ") || "0 años";
  }

  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function formatearFecha(iso) {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "Sin dato";
    return `${parseInt(m[3], 10)} de ${MESES[parseInt(m[2], 10) - 1]} de ${m[1]}`;
  }
  function formatearFechaCorta(iso) {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : "Sin dato";
  }

  return {
    NIVELES, SIN_DATO, POR_CLAVE, ETAPAS, MOTIVOS, ETIQUETA_MOTIVO, UMBRALES, FILTROS_VACIOS, CAMPOS_BUSQUEDA,
    TIPOS_PROCEDIMIENTO, RESULTADOS_REVISION, MOTIVOS_BAJA, DECLARATORIAS, declaratoriaDe, alertas, diasHabiles,
    proximoCambio, personas, coimputados, resumen, concentracion, comparar,
    antiguedad, nivelDe, contarPorNivel, revisar,
    normalizar, coincideBusqueda, buscar, filtrar, filtrarSinNivel, opcionesDependientes,
    ordenar, numeroCircuito, formatearAntiguedad, formatearAnios, formatearFecha, formatearFechaCorta,
  };
});
