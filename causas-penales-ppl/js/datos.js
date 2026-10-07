/*
 * CAPA DE DATOS — CAUSAS PENALES PPL
 *
 *   FUENTE (CSV / Excel→CSV / copia embebida / futuro Google Sheets)
 *     → lectura → normalización → privacidad → registros para la interfaz
 *
 * Este módulo no sabe nada de la interfaz. Para cambiar la fuente de datos
 * basta con editar js/config.js o sustituir el archivo de datos.
 * Ninguna función de este archivo envía información a servidores externos.
 */
(function (raiz, fabrica) {
  if (typeof module === "object" && module.exports) module.exports = fabrica();
  else raiz.DatosPPL = fabrica();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /*
   * Columnas de la hoja → claves internas. Se aceptan variantes con o sin
   * acentos y mayúsculas, para tolerar pequeñas diferencias en el Excel.
   * `identificativo: true` marca los datos que identifican a la persona
   * (base para separar datos identificativos de datos operativos).
   */
  const MAPA_COLUMNAS = [
    { clave: "id",            columna: "ID",                         alias: ["id", "folio"] },
    { clave: "idPersona",     columna: "ID de persona",              alias: ["id persona", "persona"], opcional: true },
    { clave: "nombre",        columna: "Nombre completo",            alias: ["nombre", "nombre de la persona", "nombre de la ppl"], identificativo: true },
    { clave: "expediente",    columna: "Expediente",                 alias: [] },
    { clave: "causa",         columna: "Causa penal",                alias: ["causa", "causa penal vigente"] },
    { clave: "delito",        columna: "Delito(s)",                  alias: ["delito", "delitos"] },
    { clave: "entidad",       columna: "Entidad Federativa",         alias: ["entidad", "estado"] },
    { clave: "circuito",      columna: "Circuito",                   alias: ["circuito judicial"] },
    { clave: "juzgado",       columna: "Juzgado de Distrito",        alias: ["juzgado", "organo jurisdiccional"] },
    { clave: "lugar",         columna: "Lugar de reclusión",         alias: ["lugar", "lugar donde se encuentra", "centro penitenciario"] },
    { clave: "motivoPrivacion", columna: "Motivo de la privación de libertad", alias: ["motivo de privacion", "situacion de reclusion", "situacion"] },
    { clave: "otraAutoridad", columna: "Otra causa: autoridad",      alias: ["otra causa autoridad"], opcional: true },
    { clave: "otraSituacion", columna: "Otra causa: situación",      alias: ["otra causa situacion"], opcional: true },
    { clave: "fechaInicioAP", columna: "Fecha de inicio de la averiguación previa", alias: ["inicio de la averiguacion previa", "fecha de inicio del procedimiento"], opcional: true },
    { clave: "fechaAFP",      columna: "Fecha de auto de formal prisión", alias: ["fecha de afp", "fecha auto de formal prision", "auto de formal prision"] },
    { clave: "tipoProcedimiento", columna: "Tipo de procedimiento",  alias: ["procedimiento"], opcional: true },
    { clave: "etapa",         columna: "Etapa procesal",             alias: ["etapa"] },
    { clave: "instancia",     columna: "Instancia actual",           alias: ["instancia"] },
    { clave: "fechaCierre",   columna: "Fecha de cierre de instrucción", alias: ["cierre de instruccion"], opcional: true },
    { clave: "fechaAudiencia", columna: "Fecha de la audiencia de vista", alias: ["audiencia de vista"], opcional: true },
    { clave: "ultimoActo",    columna: "Último acto procesal",       alias: ["ultimo acto", "resena jurisdiccional"] },
    { clave: "fechaUltimoActo", columna: "Fecha del último acto procesal", alias: ["fecha ultimo acto"], opcional: true },
    { clave: "fechaSentencia", columna: "Fecha de sentencia de primera instancia", alias: ["fecha de sentencia"], opcional: true },
    { clave: "penaNoFirme",   columna: "Pena impuesta (no firme)",   alias: ["pena", "pena impuesta"], opcional: true },
    { clave: "revisionSolicitada", columna: "Revisión de la medida: solicitada", alias: ["revision solicitada"], opcional: true },
    { clave: "revisionFecha", columna: "Revisión de la medida: fecha", alias: ["revision fecha"], opcional: true },
    { clave: "revisionResultado", columna: "Revisión de la medida: resultado", alias: ["revision resultado"], opcional: true },
    { clave: "fechaEjecutoria", columna: "Fecha de ejecutoria",      alias: ["ejecutoria"], opcional: true },
    { clave: "motivoBaja",    columna: "Motivo de baja",             alias: ["baja"], opcional: true },
    { clave: "fechaCorte",    columna: "Fecha de corte",             alias: ["corte"], opcional: true },
    { clave: "observaciones", columna: "Observaciones",              alias: [] },
  ];


  const sinAcentos = (t) =>
    String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

  /* ---------- Lectura de CSV (coma o punto y coma; comillas; BOM) -------- */
  function parsearCSV(texto) {
    texto = String(texto).replace(/^﻿/, "");
    const primeraLinea = texto.split(/\r?\n/, 1)[0];
    const sep = (primeraLinea.match(/;/g) || []).length > (primeraLinea.match(/,/g) || []).length ? ";" : ",";
    const filas = [];
    let fila = [], campo = "", comillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (comillas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') comillas = false;
        else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === sep) { fila.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        fila.push(campo); filas.push(fila); fila = []; campo = "";
      } else campo += c;
    }
    if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
    if (!filas.length) return [];
    const encabezados = filas[0].map((h) => h.trim());
    return filas.slice(1)
      .filter((f) => f.some((v) => String(v).trim() !== ""))
      .map((f) => Object.fromEntries(encabezados.map((h, i) => [h, f[i] == null ? "" : f[i]])));
  }

  /* ---------- Normalización de valores ---------------------------------- */
  function aNumeroPena(v) {
    if (typeof v === "number") return v;
    const m = String(v).replace(",", ".").match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }

  // Acepta AAAA-MM-DD o DD/MM/AAAA. Devuelve AAAA-MM-DD o "" si no es válida.
  function aFechaISO(v) {
    const t = String(v == null ? "" : v).trim();
    let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return "";
  }

  function resolverColumnas(encabezados) {
    const normal = encabezados.map((h) => [sinAcentos(h), h]);
    const mapa = {};
    for (const def of MAPA_COLUMNAS) {
      const buscados = [sinAcentos(def.columna), ...def.alias.map(sinAcentos)];
      const hallado = normal.find(([n]) => buscados.includes(n));
      if (hallado) mapa[def.clave] = hallado[1];
    }
    return mapa;
  }

  /*
   * Salida del universo (personas en prisión preventiva sin sentencia ejecutoriada):
   *  - Amparo directo: se promueve contra sentencia definitiva (CPEUM art. 107 fracc. V;
   *    Ley de Amparo art. 170) y la persona queda a disposición del tribunal de amparo (art. 191).
   *  - Baja: sentencia ejecutoriada (CFPP art. 360), fecha de ejecutoria o cualquier motivo de baja.
   */
  const esAmparoDirecto = (r) => sinAcentos(r.etapa).includes("amparo directo") || sinAcentos(r.motivoBaja).includes("amparo directo");
  const esBaja = (r) => !esAmparoDirecto(r) && (sinAcentos(r.etapa).includes("ejecutori") || !!r.fechaEjecutoria || !!r.motivoBaja);
  const motivoDeBaja = (r) => r.motivoBaja || ((sinAcentos(r.etapa).includes("ejecutori") || r.fechaEjecutoria) ? "Sentencia ejecutoriada (art. 360 CFPP)" : "");

  /*
   * Convierte filas "tal como vienen de la hoja" en registros internos.
   * Devuelve { registros, bajas, amparos, avisos }:
   *   registros → en seguimiento (se muestran)
   *   bajas     → deben darse de baja (solo se listan en el aviso)
   *   amparos   → sentencia definitiva con amparo directo en trámite (aviso propio)
   *   avisos    → problemas de estructura de la hoja
   */
  function normalizarFilas(filas) {
    const avisos = [];
    const vacio = { registros: [], bajas: [], amparos: [], avisos };
    if (!filas.length) { avisos.push("La fuente no contiene filas."); return vacio; }
    const mapa = resolverColumnas(Object.keys(filas[0]));
    const faltantes = MAPA_COLUMNAS.filter((d) => !mapa[d.clave] && !d.opcional).map((d) => d.columna);
    if (faltantes.length) avisos.push("Columnas no encontradas: " + faltantes.join(", ") + ".");

    const registros = [], bajas = [], amparos = [];
    filas.forEach((fila, i) => {
      const r = {};
      for (const def of MAPA_COLUMNAS) {
        const v = mapa[def.clave] ? fila[mapa[def.clave]] : "";
        r[def.clave] = typeof v === "string" ? v.trim() : v == null ? "" : String(v);
      }
      r.id = String(r.id || i + 1);
      for (const f of ["fechaInicioAP", "fechaAFP", "fechaCierre", "fechaAudiencia", "fechaSentencia",
        "fechaUltimoActo", "revisionFecha", "fechaCorte"]) r[f] = aFechaISO(r[f]);
      r.fechaEjecutoria = aFechaISO(r.fechaEjecutoria) || r.fechaEjecutoria;
      const pena = aNumeroPena(r.penaNoFirme);
      r.penaNoFirme = Number.isNaN(pena) ? null : pena;
      if (esAmparoDirecto(r)) amparos.push(r);
      else if (esBaja(r)) { r.motivoBaja = motivoDeBaja(r); bajas.push(r); }
      else registros.push(r);
    });
    return { registros, bajas, amparos, avisos };
  }

  /* ---------- Privacidad (minimización / seudonimización) ---------------- */
  function aplicarPrivacidad(registros, privacidad) {
    const p = privacidad || {};
    return registros.map((r) => {
      const copia = { ...r };
      if (p.seudonimizarNombres) {
        copia.nombre = (p.prefijoSeudonimo || "PPL-") + String(r.id).padStart(4, "0");
      }
      if (p.mostrarPenaNoFirme === false) { delete copia.penaNoFirme; delete copia.fechaSentencia; }
      for (const campo of p.camposOcultos || []) delete copia[campo];
      return Object.freeze(copia);
    });
  }

  /* ---------- Fuentes --------------------------------------------------- */
  async function leerCSVLocal(ruta) {
    const resp = await fetch(ruta, { cache: "no-store" });
    if (!resp.ok) throw new Error(`No se pudo leer ${ruta} (${resp.status})`);
    return parsearCSV(await resp.text());
  }

  function leerEmbebida(global) {
    const datos = global && global.FUENTE_PPL_EMBEBIDA;
    if (!Array.isArray(datos)) throw new Error("No se encontró la copia embebida de datos (datos/datos_ppl_ficticios.js).");
    return datos;
  }

  // PREPARADO PARA EL FUTURO — deliberadamente desactivado en esta versión.
  async function leerGoogleSheets(/* url */) {
    throw new Error("La conexión con Google Sheets no está habilitada en esta versión.");
  }

  /*
   * Punto de entrada único. La interfaz solo llama a esta función.
   * `global` es window en el navegador.
   */
  async function cargarDatos(config, global) {
    const f = config.fuente;
    let filas, origen;
    const conServidor = global && global.location && /^https?:$/.test(global.location.protocol);
    if (f.tipo === "csv" || (f.tipo === "auto" && conServidor)) {
      try {
        filas = await leerCSVLocal(f.rutaCSV);
        origen = "Archivo " + f.rutaCSV.split("/").pop();
      } catch (e) {
        if (f.tipo === "csv") throw e;
      }
    } else if (f.tipo === "google-sheets") {
      filas = await leerGoogleSheets(f.urlGoogleSheets);
      origen = "Google Sheets";
    }
    if (!filas) {
      filas = leerEmbebida(global);
      origen = "Copia local embebida";
    }
    return prepararRegistros(filas, origen, config);
  }

  // Para archivos que la persona usuaria elige con "Cargar archivo CSV".
  // Se leen en el navegador; no se suben a ningún lugar.
  // Columnas sin las cuales un archivo elegido por el usuario no se carga (se conservan los datos actuales).
  const INDISPENSABLES = ["causa", "fechaAFP"];

  function cargarDesdeTextoCSV(texto, nombreArchivo, config) {
    const filas = parsearCSV(texto);
    if (!filas.length) throw new Error(`El archivo «${nombreArchivo}» no contiene filas. Se conservan los datos actuales.`);
    const mapa = resolverColumnas(Object.keys(filas[0]));
    const faltan = MAPA_COLUMNAS.filter((d) => INDISPENSABLES.includes(d.clave) && !mapa[d.clave]).map((d) => d.columna);
    if (faltan.length) {
      throw new Error(`El archivo «${nombreArchivo}» no tiene las columnas indispensables (${faltan.join(", ")}). Se conservan los datos actuales.`);
    }
    return prepararRegistros(filas, "Archivo " + nombreArchivo, config);
  }

  function prepararRegistros(filas, origen, config) {
    const { registros, bajas, amparos, avisos } = normalizarFilas(filas);
    // Fecha de corte: la más reciente que traiga la hoja; si no trae, la de la configuración.
    const fechaCorte = [...registros, ...bajas, ...amparos].map((r) => r.fechaCorte).filter(Boolean).sort().pop()
      || (config.fuente && config.fuente.fechaCorte) || "";
    return {
      fechaCorte,
      registros: aplicarPrivacidad(registros, config.privacidad),
      bajas: aplicarPrivacidad(bajas, config.privacidad),
      amparos: aplicarPrivacidad(amparos, config.privacidad),
      origen, avisos,
    };
  }

  return {
    MAPA_COLUMNAS, parsearCSV, normalizarFilas, esAmparoDirecto, esBaja, aplicarPrivacidad,
    cargarDatos, cargarDesdeTextoCSV, aFechaISO, aNumeroPena,
  };
});
