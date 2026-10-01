/*
 * Pruebas de datos y lógica (sin navegador).
 * Ejecutar:  node pruebas/pruebas_logica.js
 * Fecha de referencia fija: 1 de octubre de 2026 (con ella se generaron los datos ficticios).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");
const D = require("../js/datos.js");
const L = require("../js/logica.js");

const RAIZ = path.join(__dirname, "..");
const HOY = new Date(2026, 9, 1);
let ok = 0;
function prueba(nombre, fn) {
  try { fn(); ok++; console.log("  ✔ " + nombre); }
  catch (e) { console.error("  ✘ " + nombre + "\n    " + e.message); process.exitCode = 1; }
}

const csv = fs.readFileSync(path.join(RAIZ, "datos/datos_ppl_ficticios.csv"), "utf8");
const { registros: R, ejecutoriadas: EJ, avisos } = D.normalizarFilas(D.parsearCSV(csv));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, "datos/datos_ppl_ficticios.js"), "utf8"), ctx);
const E = D.normalizarFilas(ctx.window.FUENTE_PPL_EMBEBIDA);
const nivel = (iso) => L.antiguedad(iso, HOY).nivel;

console.log("\nDATOS");
prueba("1. Exactamente 150 registros en seguimiento (CSV y copia embebida)", () => {
  assert.strictEqual(R.length, 150);
  assert.strictEqual(E.registros.length, 150);
  assert.deepStrictEqual(avisos, []);
});
prueba("CSV y copia embebida contienen la misma información", () => {
  const llave = (r) => [r.id, r.nombre, r.causa, r.fechaAFP, r.etapa];
  assert.deepStrictEqual(R.map(llave), E.registros.map(llave));
});
prueba("Las 18 columnas de la nueva estructura están presentes y en orden", () => {
  assert.deepStrictEqual(Object.keys(D.parsearCSV(csv)[0]), D.MAPA_COLUMNAS.map((c) => c.columna));
});
prueba("Sin alias ni columnas de pena firme, inicio o cumplimiento", () => {
  const enc = Object.keys(D.parsearCSV(csv)[0]).map(L.normalizar);
  assert.ok(!enc.some((c) => /alias|cumplimiento|fecha de inicio|pena en anos/.test(c)), enc.join(" | "));
});
prueba("2. Los nombres provienen de las listas ficticias del generador", () => {
  const gen = fs.readFileSync(path.join(RAIZ, "herramientas/generar_datos_ficticios.py"), "utf8");
  for (const r of [...R, ...EJ]) for (const p of r.nombre.split(" ")) assert.ok(gen.includes(p), "Palabra no generada: " + p);
});
prueba("3. Expedientes y causas ficticios (prefijo FIC) y únicos", () => {
  const todos = [...R, ...EJ];
  assert.ok(todos.every((r) => /^EXP-FIC-\d+\/\d{4}$/.test(r.expediente)));
  assert.ok(todos.every((r) => /^CP-FIC-\d+\/\d{4}$/.test(r.causa)));
  assert.strictEqual(new Set(todos.map((r) => r.causa)).size, todos.length);
});
prueba("Homonimias y nombres similares para pruebas", () => {
  const cuenta = {};
  R.forEach((r) => { cuenta[r.nombre] = (cuenta[r.nombre] || 0) + 1; });
  assert.ok(Object.values(cuenta).filter((n) => n > 1).length >= 3);
});
prueba("Todas las etapas de los registros activos pertenecen al catálogo (salvo vacías)", () => {
  assert.ok(R.every((r) => L.ETAPAS.includes(r.etapa)));
  for (const e of L.ETAPAS) assert.ok(R.some((r) => r.etapa === e), "Sin registros en " + e);
});
prueba("Pena no firme solo existe con sentencia de primera instancia, apelación o amparo", () => {
  for (const r of R) {
    const debe = ["Sentencia de primera instancia", "Apelación (Tribunal de Alzada)", "Amparo directo"].includes(r.etapa);
    assert.strictEqual(r.penaNoFirme != null, debe, `ID ${r.id} ${r.etapa}`);
    if (debe) assert.ok(r.fechaSentencia > r.fechaAFP, "sentencia anterior al AFP en ID " + r.id);
  }
});

console.log("\nSENTENCIAS EJECUTORIADAS");
prueba("Los 2 registros ejecutoriados salen del seguimiento", () => {
  assert.deepStrictEqual(EJ.map((r) => r.id), ["151", "152"]);
  assert.ok(!R.some((r) => r.etapa.includes("ejecutoriada") || r.fechaEjecutoria));
});
prueba("Se detecta por etapa 'ejecutoriada' o por fecha de ejecutoria aunque la etapa no esté actualizada", () => {
  assert.strictEqual(EJ[0].etapa, "Sentencia ejecutoriada");
  assert.strictEqual(EJ[1].etapa, "Apelación (Tribunal de Alzada)");
  assert.ok(EJ[1].fechaEjecutoria);
  assert.ok(D.esEjecutoriada({ etapa: "SENTENCIA EJECUTORIADA", fechaEjecutoria: "" }));
  assert.ok(D.esEjecutoriada({ etapa: "Instrucción", fechaEjecutoria: "2026-01-01" }));
  assert.ok(!D.esEjecutoriada({ etapa: "Instrucción", fechaEjecutoria: "" }));
});

console.log("\nSEMÁFORO DE ANTIGÜEDAD (desde el auto de formal prisión)");
prueba("Límites inclusivos: exactamente 2→N1, 5→N2, 10→N3, 20→N4, 30→N5", () => {
  assert.strictEqual(nivel("2024-10-01"), "n1");
  assert.strictEqual(nivel("2021-10-01"), "n2");
  assert.strictEqual(nivel("2016-10-01"), "n3");
  assert.strictEqual(nivel("2006-10-01"), "n4");
  assert.strictEqual(nivel("1996-10-01"), "n5");
});
prueba("Un día más allá del límite pasa al siguiente nivel", () => {
  assert.strictEqual(nivel("2024-09-30"), "n2");
  assert.strictEqual(nivel("2021-09-30"), "n3");
  assert.strictEqual(nivel("2016-09-30"), "n4");
  assert.strictEqual(nivel("2006-09-30"), "n5");
});
prueba("Casos intermedios y recientes", () => {
  assert.strictEqual(nivel("2026-09-30"), "n1");
  assert.strictEqual(nivel("2026-10-01"), "n1");
  assert.strictEqual(nivel("2023-03-15"), "n2");
  assert.strictEqual(nivel("2019-01-01"), "n3");
  assert.strictEqual(nivel("2012-06-01"), "n4");
  assert.strictEqual(nivel("2001-06-01"), "n5");
});
prueba("Preparado para más de 30 años: se queda en Rojo (N5) y se marca", () => {
  const a = L.antiguedad("1996-09-30", HOY);
  assert.strictEqual(a.nivel, "n5");
  assert.strictEqual(a.mas30, true);
  assert.strictEqual(L.antiguedad("1985-01-01", HOY).nivel, "n5");
  assert.strictEqual(L.antiguedad("1996-10-01", HOY).mas30, false);
});
prueba("Sin fecha, fecha inválida o futura → 'sd' (sin dato)", () => {
  assert.strictEqual(nivel(""), "sd");
  assert.strictEqual(nivel("no-es-fecha"), "sd");
  assert.strictEqual(nivel("2026-10-02"), "sd");
});
prueba("29 de febrero se maneja sin error", () => {
  assert.strictEqual(L.antiguedad("2024-02-29", new Date(2026, 1, 28)).nivel, "n1");
  assert.strictEqual(L.antiguedad("2024-02-29", new Date(2026, 2, 1)).nivel, "n2");
  assert.strictEqual(nivel("2004-02-29"), "n5");
});
prueba("Años y meses transcurridos", () => {
  const a = L.antiguedad("2014-06-15", HOY);
  assert.strictEqual(L.formatearAntiguedad(a), "12 años 3 meses");
  assert.strictEqual(L.formatearAntiguedad(L.antiguedad("2026-09-20", HOY)), "Menos de 1 mes");
});
prueba("Cada entidad tiene registros en los 5 niveles", () => {
  for (const e of new Set(R.map((r) => r.entidad))) {
    const c = L.contarPorNivel(R.filter((r) => r.entidad === e), HOY);
    assert.ok(["n1", "n2", "n3", "n4", "n5"].every((k) => c[k] > 0), e + " " + JSON.stringify(c));
  }
});
prueba("Los datos ficticios cubren los 5 niveles (30-30-30-30-29) + 1 sin fecha", () => {
  assert.deepStrictEqual(L.contarPorNivel(R, HOY), { n1: 30, n2: 30, n3: 30, n4: 30, n5: 29, sd: 1 });
  assert.ok(!R.some((r) => L.antiguedad(r.fechaAFP, HOY).mas30), "No debe haber casos de más de 30 años");
});
prueba("Revisión de calidad detecta registro sin fecha y etapas fuera de catálogo", () => {
  const p = L.revisar(R, HOY);
  assert.strictEqual(p.length, 1);
  assert.match(p[0].motivo, /Sin fecha de auto de formal prisión/);
  const extra = L.revisar([{ id: "x", fechaAFP: "2030-01-01", etapa: "Otra" }], HOY);
  assert.strictEqual(extra.length, 2);
});

console.log("\nBUSCADOR");
const buscar = (texto) => L.filtrar(R, { ...L.FILTROS_VACIOS, texto }, HOY);
prueba("4. Encuentra por nombre (sin acentos ni mayúsculas)", () => {
  assert.strictEqual(buscar("jose luis hernandez ruiz").length, 2);
});
prueba("Encuentra por expediente y por causa penal", () => {
  assert.deepStrictEqual(buscar(R[40].expediente).map((r) => r.id), [R[40].id]);
  assert.deepStrictEqual(buscar(R[77].causa).map((r) => r.id), [R[77].id]);
});
prueba("Encuentra por juzgado, entidad, circuito, delito, lugar y etapa", () => {
  const juz = "Juzgado Segundo de Distrito en Sonora";
  assert.strictEqual(buscar(juz).length, R.filter((r) => r.juzgado === juz).length);
  assert.strictEqual(buscar("michoacan").length, 15);
  assert.strictEqual(buscar("Décimo Segundo Circuito").length, 15);
  assert.ok(buscar("hidrocarburos").every((r) => r.delito.includes("hidrocarburos")));
  assert.ok(buscar("Tierra Caliente").every((r) => r.lugar.includes("Tierra Caliente")));
  assert.strictEqual(buscar("amparo directo").length, R.filter((r) => r.etapa === "Amparo directo").length);
});
prueba("Búsqueda sin coincidencias devuelve 0", () => assert.strictEqual(buscar("zzzz inexistente").length, 0));

console.log("\nFILTROS");
const F = (f) => L.filtrar(R, { ...L.FILTROS_VACIOS, ...f }, HOY);
prueba("5. Filtro por entidad", () => {
  assert.strictEqual(F({ entidad: "Jalisco" }).length, 15);
});
prueba("Filtro por etapa procesal", () => {
  const res = F({ etapa: "Reposición del procedimiento" });
  assert.ok(res.length > 0 && res.every((r) => r.etapa === "Reposición del procedimiento"));
});
prueba("Filtro por uno o varios niveles", () => {
  assert.strictEqual(F({ niveles: ["n5"] }).length, 29);
  assert.strictEqual(F({ niveles: ["n4", "n5"] }).length, 59);
  assert.ok(F({ niveles: ["n1"] }).every((r) => L.antiguedad(r.fechaAFP, HOY).nivel === "n1"));
});
prueba("6. Filtros combinados (entidad + nivel + etapa + texto)", () => {
  const res = F({ entidad: "Jalisco", niveles: ["n4", "n5"] });
  assert.ok(res.length > 0 && res.every((r) => r.entidad === "Jalisco" && ["n4", "n5"].includes(nivel(r.fechaAFP))));
  const res2 = F({ niveles: ["n5"], etapa: "Apelación (Tribunal de Alzada)", texto: "sonora" });
  assert.ok(res2.every((r) => r.entidad === "Sonora" && r.etapa.startsWith("Apelación")));
});
prueba("Conteo de tarjetas: ignora el nivel seleccionado pero respeta los demás filtros", () => {
  const base = L.filtrarSinNivel(R, { ...L.FILTROS_VACIOS, entidad: "Puebla", niveles: ["n1"] });
  assert.strictEqual(base.length, 15);
  const c = L.contarPorNivel(base, HOY);
  assert.strictEqual(c.n1 + c.n2 + c.n3 + c.n4 + c.n5 + c.sd, 15);
});
prueba("Filtros dependientes: Entidad → Circuito → Juzgado", () => {
  const op = L.opcionesDependientes(R, { ...L.FILTROS_VACIOS, entidad: "Veracruz" });
  assert.deepStrictEqual(op.circuitos, ["Séptimo Circuito"]);
  assert.strictEqual(op.juzgados.length, 3);
  assert.strictEqual(op.causas.length, 15);
});

console.log("\nORDEN Y CSV");
prueba("Orden por antigüedad: más antiguos primero; sin fecha siempre al final", () => {
  const desc = L.ordenar(R, "antiguedad", "desc");
  assert.strictEqual(desc[0].fechaAFP, "1996-10-01");
  assert.strictEqual(desc[desc.length - 1].fechaAFP, "");
  const asc = L.ordenar(R, "antiguedad", "asc");
  assert.strictEqual(asc[asc.length - 1].fechaAFP, "");
  const f = desc.slice(0, -1).map((r) => r.fechaAFP);
  assert.ok(f.every((x, i) => i === 0 || f[i - 1] <= x));
});
prueba("Orden por etapa sigue el catálogo procesal", () => {
  const o = L.ordenar(R, "etapa", "asc").map((r) => L.ETAPAS.indexOf(r.etapa));
  assert.ok(o.every((x, i) => i === 0 || o[i - 1] <= x));
});
prueba("CSV de Excel en español (punto y coma, comillas, DD/MM/AAAA)", () => {
  const t = '﻿ID;Nombre completo;Causa penal;Fecha de auto de formal prisión;Etapa procesal\r\n1;"Prueba, Ficticia";CP-1;05/03/2020;Instrucción\r\n';
  const { registros } = D.normalizarFilas(D.parsearCSV(t));
  assert.strictEqual(registros[0].nombre, "Prueba, Ficticia");
  assert.strictEqual(registros[0].fechaAFP, "2020-03-05");
});
prueba("Privacidad: seudonimización, campos ocultos y pena desactivable", () => {
  const p = D.aplicarPrivacidad(R.slice(0, 1), { seudonimizarNombres: true, camposOcultos: ["observaciones"], mostrarPenaNoFirme: false });
  assert.strictEqual(p[0].nombre, "PPL-0001");
  assert.ok(!("observaciones" in p[0]) && !("penaNoFirme" in p[0]));
});

console.log("\nSIN CONEXIONES EXTERNAS");
prueba("13. Ningún archivo de la app hace referencia a dominios externos", () => {
  for (const a of ["index.html", "css/estilos.css", "js/config.js", "js/datos.js", "js/logica.js", "js/interfaz.js"]) {
    const t = fs.readFileSync(path.join(RAIZ, a), "utf8").replaceAll("http://www.w3.org/2000/svg", "");
    const urls = t.match(/https?:\/\/[^\s"')]+/g) || [];
    assert.deepStrictEqual(urls, [], a + " contiene: " + urls.join(", "));
  }
});

console.log(`\n${ok} pruebas superadas${process.exitCode ? " — HAY FALLAS" : ""}\n`);
