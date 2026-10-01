/*
 * PROCESAMIENTO — CAUSAS PENALES PPL
 * Funciones puras: clasificación, búsqueda, filtros, orden y formato.
 * No tocan la pantalla ni la fuente de datos (se prueban con Node).
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.LogicaPPL = fabrica();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- Clasificación por pena ------------------------------------
   *   < 10           → amarillo
   *   >= 10 y <= 20  → naranja
   *   > 20           → rojo
   */
  const RANGOS = {
    amarillo: { clave: "amarillo", etiqueta: "Amarillo", descripcion: "Menos de 10 años", emoji: "🟡" },
    naranja:  { clave: "naranja",  etiqueta: "Naranja",  descripcion: "De 10 a 20 años",  emoji: "🟠" },
    rojo:     { clave: "rojo",     etiqueta: "Rojo",     descripcion: "Más de 20 años",   emoji: "🔴" },
  };

  function clasificarPena(anios) {
    if (anios < 10) return "amarillo";
    if (anios <= 20) return "naranja";
    return "rojo";
  }

  /* ---------- Texto ----------------------------------------------------- */
  const normalizar = (t) =>
    String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

  const CAMPOS_BUSQUEDA = ["nombre", "expediente", "causa", "entidad", "circuito", "juzgado", "delito", "lugar"];

  /*
   * Búsqueda sin distinguir mayúsculas ni acentos:
   *  1) Si la frase completa aparece en algún campo de algún registro
   *     (p. ej. "Décimo Segundo Circuito"), se muestran solo esas coincidencias exactas.
   *  2) Si no, cada palabra debe aparecer en algún campo (p. ej. "lopez jalisco").
   */
  const camposNormalizados = (r) => CAMPOS_BUSQUEDA.map((c) => normalizar(r[c]));

  function coincideFrase(registro, frase) {
    return camposNormalizados(registro).some((v) => v.includes(frase));
  }

  function coincideBusqueda(registro, texto) {
    const palabras = normalizar(texto).split(" ").filter(Boolean);
    if (!palabras.length) return true;
    const pajar = camposNormalizados(registro).join(" | ");
    return palabras.every((p) => pajar.includes(p));
  }

  function buscar(registros, texto) {
    const frase = normalizar(texto);
    if (!frase) return registros;
    const exactos = registros.filter((r) => coincideFrase(r, frase));
    return exactos.length ? exactos : registros.filter((r) => coincideBusqueda(r, frase));
  }

  /* ---------- Filtros --------------------------------------------------- */
  const FILTROS_VACIOS = Object.freeze({
    texto: "", entidad: "", circuito: "", juzgado: "", causa: "", nombre: "", rango: "",
  });

  function filtrar(registros, f) {
    const causa = normalizar(f.causa);
    const nombre = normalizar(f.nombre);
    const porFiltros = registros.filter((r) =>
      (!f.entidad || r.entidad === f.entidad) &&
      (!f.circuito || r.circuito === f.circuito) &&
      (!f.juzgado || r.juzgado === f.juzgado) &&
      (!causa || normalizar(r.causa).includes(causa)) &&
      (!nombre || normalizar(r.nombre).includes(nombre)) &&
      (!f.rango || clasificarPena(r.pena) === f.rango)
    );
    return buscar(porFiltros, f.texto);
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
    };
  }

  function contarPorRango(registros) {
    const c = { amarillo: 0, naranja: 0, rojo: 0 };
    for (const r of registros) c[clasificarPena(r.pena)]++;
    return c;
  }

  /* ---------- Orden ----------------------------------------------------- */
  const colador = new Intl.Collator("es", { sensitivity: "base", numeric: true });
  const compararTexto = (a, b) => colador.compare(String(a), String(b));

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

  function ordenar(registros, clave, direccion) {
    const signo = direccion === "desc" ? -1 : 1;
    const cmp =
      clave === "pena" ? (a, b) => a.pena - b.pena :
      clave === "circuito" ? (a, b) => compararCircuito(a.circuito, b.circuito) :
      (a, b) => compararTexto(a[clave], b[clave]);
    // Orden estable: en empate se respeta el ID.
    return [...registros].sort((a, b) => signo * cmp(a, b) || compararTexto(a.id, b.id));
  }

  /* ---------- Formato --------------------------------------------------- */
  function formatearPena(anios) {
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

  return {
    RANGOS, FILTROS_VACIOS, CAMPOS_BUSQUEDA,
    clasificarPena, normalizar, coincideBusqueda, buscar, filtrar, opcionesDependientes,
    contarPorRango, ordenar, numeroCircuito, formatearPena, formatearFecha,
  };
});
