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

  const ETAPAS = [
    "Instrucción",
    "Cierre de instrucción / conclusiones",
    "Sentencia de primera instancia",
    "Apelación (Tribunal de Alzada)",
    "Amparo directo",
    "Reposición del procedimiento",
  ];

  /* ---------- Fechas ---------------------------------------------------- */
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
    texto: "", entidad: "", circuito: "", juzgado: "", causa: "", nombre: "", etapa: "", niveles: [],
  });

  // Todos los filtros excepto los niveles (sirve para los conteos de las tarjetas).
  function filtrarSinNivel(registros, f) {
    const causa = normalizar(f.causa);
    const nombre = normalizar(f.nombre);
    const porFiltros = registros.filter((r) =>
      (!f.entidad || r.entidad === f.entidad) &&
      (!f.circuito || r.circuito === f.circuito) &&
      (!f.juzgado || r.juzgado === f.juzgado) &&
      (!causa || normalizar(r.causa).includes(causa)) &&
      (!nombre || normalizar(r.nombre).includes(nombre)) &&
      (!f.etapa || r.etapa === f.etapa)
    );
    return buscar(porFiltros, f.texto);
  }

  function filtrar(registros, f, hoy) {
    const base = filtrarSinNivel(registros, f);
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
    NIVELES, SIN_DATO, POR_CLAVE, ETAPAS, FILTROS_VACIOS, CAMPOS_BUSQUEDA,
    antiguedad, nivelDe, contarPorNivel, revisar,
    normalizar, coincideBusqueda, buscar, filtrar, filtrarSinNivel, opcionesDependientes,
    ordenar, numeroCircuito, formatearAntiguedad, formatearAnios, formatearFecha, formatearFechaCorta,
  };
});
