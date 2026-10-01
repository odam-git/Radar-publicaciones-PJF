/*
 * CONFIGURACIÓN — CAUSAS PENALES PPL
 * Único archivo que se edita para cambiar la fuente de datos o activar
 * medidas de privacidad. La interfaz no necesita modificarse.
 */
window.CONFIG_PPL = {
  fuente: {
    /*
     * "auto"          → Si la app se abre con un servidor local, lee el CSV de `rutaCSV`;
     *                    si se abre con doble clic, usa la copia embebida (datos/*.js).
     * "embebida"      → Siempre usa la copia embebida (datos_ppl_ficticios.js).
     * "csv"           → Siempre lee el CSV de `rutaCSV` (requiere servidor local).
     * "google-sheets" → PREPARADO, NO ACTIVO. Ver README, sección Google Sheets.
     */
    tipo: "auto",
    rutaCSV: "datos/datos_ppl_ficticios.csv",
    urlGoogleSheets: "", // Vacío a propósito: esta versión no se conecta a Google Sheets.
    esFicticia: true,    // Muestra la etiqueta "Datos ficticios" en el encabezado.
  },

  privacidad: {
    /*
     * Seudonimización: si es true, en lugar del nombre se muestra un
     * identificador (p. ej. "PPL-0042") en tabla, filtros, buscador y detalle.
     */
    seudonimizarNombres: false,
    prefijoSeudonimo: "PPL-",
    /*
     * Campos que la interfaz NO mostrará en la tarjeta de detalle
     * (minimización). Usar las claves internas: ver MAPA_COLUMNAS en datos.js.
     */
    camposOcultos: [],
    /*
     * Pena impuesta en primera instancia (no firme): solo se muestra como dato
     * informativo dentro de la ficha. Para eliminarla por completo: false.
     */
    mostrarPenaNoFirme: true,
  },
};
