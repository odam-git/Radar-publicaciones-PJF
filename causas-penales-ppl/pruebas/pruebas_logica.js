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
prueba("Las columnas de la hoja coinciden, en orden, con las que lee la aplicación", () => {
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
prueba("3. Expedientes y causas ficticios (prefijo FIC); persona + causa es único", () => {
  const todos = [...R, ...EJ];
  assert.ok(todos.every((r) => /^EXP-FIC-\d+\/\d{4}$/.test(r.expediente)));
  assert.ok(todos.every((r) => /^CP-FIC-\d+\/\d{4}$/.test(r.causa)));
  assert.strictEqual(new Set(todos.map((r) => r.idPersona + "|" + r.causa)).size, todos.length);
});
prueba("ID de persona: 149 personas en 150 causas (una persona con dos causas)", () => {
  assert.strictEqual(L.personas(R), 149);
  const r12 = R.find((r) => r.id === "13"), r139 = R.find((r) => r.id === "140");
  assert.strictEqual(r12.idPersona, r139.idPersona);
  assert.notStrictEqual(r12.causa, r139.causa);
});
prueba("Coimputados: dos causas con varias PPL en el mismo juzgado", () => {
  const r = R.find((x) => x.id === "41");
  assert.strictEqual(L.coimputados(R, r).length, 2);
  assert.ok(L.coimputados(R, r).every((x) => x.causa === r.causa && x.juzgado === r.juzgado && x.fechaAFP === r.fechaAFP));
  assert.strictEqual(L.coimputados(R, R.find((x) => x.id === "50")).length, 1);
  assert.strictEqual(L.coimputados(R, R.find((x) => x.id === "2")).length, 0);
});
prueba("Motivo de la privación de libertad: catálogo completo y datos de la otra causa coherentes", () => {
  assert.ok(R.every((r) => L.MOTIVOS.includes(r.motivoPrivacion)));
  for (const m of L.MOTIVOS) assert.ok(R.some((r) => r.motivoPrivacion === m), "Sin casos: " + m);
  for (const r of R) assert.strictEqual(!!r.otraAutoridad, r.motivoPrivacion !== "Solo por esta causa federal", r.id);
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
prueba("Fecha de corte y fecha del último acto se leen de la hoja", () => {
  assert.ok(R.every((r) => r.fechaCorte === "2026-10-01"));
  assert.ok(R.every((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.fechaUltimoActo) && r.fechaUltimoActo >= (r.fechaAFP || "")));
  assert.strictEqual(D.cargarDesdeTextoCSV(csv, "x.csv", { privacidad: {}, fuente: {} }).fechaCorte, "2026-10-01");
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
  assert.deepStrictEqual(buscar(R[5].expediente).map((r) => r.id), [R[5].id]);
  assert.strictEqual(buscar(R[40].expediente).length, 3); // causa con coimputados
  assert.deepStrictEqual(buscar(R[77].causa).map((r) => r.id), [R[77].id]);
});
prueba("Encuentra por juzgado, entidad, circuito, delito, lugar y etapa", () => {
  const juz = "Juzgado Segundo de Distrito en Sonora";
  assert.strictEqual(buscar(juz).length, R.filter((r) => r.juzgado === juz).length);
  assert.strictEqual(buscar("michoacan").length, R.filter((r) => r.entidad === "Michoacán").length);
  assert.strictEqual(buscar("Décimo Segundo Circuito").length, R.filter((r) => r.circuito === "Décimo Segundo Circuito").length);
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

prueba("Filtro por motivo de la privación de libertad", () => {
  const res = F({ motivo: "Solo por causa del fuero común" });
  assert.ok(res.length > 0 && res.every((r) => r.motivoPrivacion === "Solo por causa del fuero común"));
});

console.log("\nPRÓXIMOS A CAMBIAR DE NIVEL");
prueba("Cambia el día siguiente a cumplir el umbral (límite inclusivo)", () => {
  const p = L.proximoCambio("2024-10-01", HOY, 30);
  assert.deepStrictEqual([p.anios, p.fecha, p.faltan, p.destino], [2, "2026-10-02", 1, "n2"]);
  const p2 = L.proximoCambio("2016-12-15", HOY, 90);
  assert.deepStrictEqual([p2.anios, p2.fecha, p2.destino], [10, "2026-12-16", "n4"]);
});
prueba("Cumplir 30 años se informa, aunque sigue en Nivel 5", () => {
  const p = L.proximoCambio("1996-10-01", HOY, 30);
  assert.ok(p.mas30 && p.destino === "n5");
});
prueba("Fuera del horizonte, sin fecha o fecha futura → sin aviso", () => {
  assert.strictEqual(L.proximoCambio("2016-12-15", HOY, 30), null);
  assert.strictEqual(L.proximoCambio("", HOY, 90), null);
  assert.strictEqual(L.proximoCambio("2027-01-01", HOY, 90), null);
  assert.strictEqual(L.proximoCambio("2010-01-01", HOY, 90), null); // ya pasó 10 y faltan años para 20
});
prueba("Filtro de próximos: coincide con el cálculo individual", () => {
  const n = R.filter((r) => L.proximoCambio(r.fechaAFP, HOY, 90)).length;
  assert.ok(n > 0);
  assert.strictEqual(F({ proximos: 90 }).length, n);
  assert.ok(F({ proximos: 30 }).length <= n);
});

console.log("\nRESUMEN Y COMPARATIVO");
prueba("Resumen por entidad y por juzgado suma el total y ordena por casos de 10 años o más", () => {
  for (const por of ["entidad", "juzgado"]) {
    const filas = L.resumen(R, HOY, por);
    assert.strictEqual(filas.reduce((s, g) => s + g.total, 0), 150);
    assert.ok(filas.every((g, i) => i === 0 || filas[i - 1].mas10 >= g.mas10));
    assert.ok(filas.every((g) => g.n1 + g.n2 + g.n3 + g.n4 + g.n5 + g.sd === g.total && g.mas10 === g.n4 + g.n5));
  }
  assert.strictEqual(L.resumen(R, HOY, "entidad").length, 10);
});
prueba("Concentración: los 5 primeros grupos y su porcentaje", () => {
  const c = L.concentracion(L.resumen(R, HOY, "juzgado"), 5);
  assert.strictEqual(c.total, 59);
  assert.ok(c.grupos === 5 && c.suma <= c.total && c.porcentaje === Math.round((c.suma / c.total) * 100));
});
const ANT = D.normalizarFilas(D.parsearCSV(fs.readFileSync(path.join(RAIZ, "datos/corte_anterior_ficticio.csv"), "utf8")));
const CMP = L.comparar(R, ANT.registros, "2026-10-01", "2026-09-01", EJ);
prueba("Comparativo: 3 altas y 4 bajas (2 por ejecutoria, 2 que ya no aparecen)", () => {
  assert.strictEqual(CMP.altas.length, 3);
  assert.strictEqual(CMP.bajas.length, 4);
  assert.strictEqual(CMP.bajas.filter((b) => b.motivo === "Sentencia ejecutoriada").length, 2);
});
prueba("Comparativo: 5 cambios de etapa, cada uno a la etapa siguiente", () => {
  assert.strictEqual(CMP.cambiosEtapa.length, 5);
  assert.ok(CMP.cambiosEtapa.every((c) => L.ETAPAS.indexOf(c.ahora) === L.ETAPAS.indexOf(c.antes) + 1));
});
prueba("Comparativo: quienes subieron de nivel lo hicieron por el paso del tiempo", () => {
  assert.ok(CMP.subieron.length > 0);
  assert.ok(CMP.subieron.every((c) => L.POR_CLAVE[c.ahora].numero === L.POR_CLAVE[c.antes].numero + 1));
});
prueba("Comparar un corte consigo mismo no reporta cambios", () => {
  const c = L.comparar(R, R, "2026-10-01", "2026-10-01", []);
  assert.deepStrictEqual([c.altas.length, c.bajas.length, c.cambiosEtapa.length, c.subieron.length], [0, 0, 0, 0]);
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
