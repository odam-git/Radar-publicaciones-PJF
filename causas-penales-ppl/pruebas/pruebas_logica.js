/*
 * Pruebas de datos y lógica (sin navegador).
 * Ejecutar:  node pruebas/pruebas_logica.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const D = require("../js/datos.js");
const L = require("../js/logica.js");

const RAIZ = path.join(__dirname, "..");
let ok = 0;
function prueba(nombre, fn) {
  try { fn(); ok++; console.log("  ✔ " + nombre); }
  catch (e) { console.error("  ✘ " + nombre + "\n    " + e.message); process.exitCode = 1; }
}

const csv = fs.readFileSync(path.join(RAIZ, "datos/datos_ppl_ficticios.csv"), "utf8");
const { registros: R, avisos } = D.normalizarFilas(D.parsearCSV(csv));

// Copia embebida: se evalúa en un contexto aislado.
const vm = require("vm");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, "datos/datos_ppl_ficticios.js"), "utf8"), ctx);
const E = D.normalizarFilas(ctx.window.FUENTE_PPL_EMBEBIDA).registros;

console.log("\nDATOS");
prueba("1. Existen exactamente 150 registros (CSV y copia embebida)", () => {
  assert.strictEqual(R.length, 150);
  assert.strictEqual(E.length, 150);
  assert.deepStrictEqual(avisos, []);
});
prueba("CSV y copia embebida contienen la misma información", () => {
  assert.deepStrictEqual(R.map((r) => [r.id, r.nombre, r.causa, r.pena]), E.map((r) => [r.id, r.nombre, r.causa, r.pena]));
});
prueba("Las 14 columnas requeridas están presentes", () => {
  const enc = D.parsearCSV(csv)[0];
  assert.deepStrictEqual(Object.keys(enc), D.MAPA_COLUMNAS.map((c) => c.columna));
});
prueba("2. Los nombres provienen de las listas ficticias del generador", () => {
  const gen = fs.readFileSync(path.join(RAIZ, "herramientas/generar_datos_ficticios.py"), "utf8");
  for (const r of R) {
    assert.ok(r.nombre.split(" ").length >= 3, r.nombre);
    // Cada palabra del nombre debe figurar en el código del generador (no hay nombres externos).
    for (const palabra of r.nombre.split(" ")) assert.ok(gen.includes(palabra), "Palabra no generada: " + palabra);
  }
});
prueba("3. Expedientes y causas son ficticios (prefijo FIC) y únicos", () => {
  assert.ok(R.every((r) => /^EXP-FIC-\d+\/\d{4}$/.test(r.expediente)));
  assert.ok(R.every((r) => /^CP-FIC-\d+\/\d{4}$/.test(r.causa)));
  assert.strictEqual(new Set(R.map((r) => r.expediente)).size, 150);
  assert.strictEqual(new Set(R.map((r) => r.causa)).size, 150);
});
prueba("Hay homonimias y nombres similares para pruebas", () => {
  const cuenta = {};
  R.forEach((r) => { cuenta[r.nombre] = (cuenta[r.nombre] || 0) + 1; });
  assert.ok(Object.values(cuenta).filter((n) => n > 1).length >= 3);
});
prueba("Variedad: ≥10 entidades, ≥20 juzgados, ≥10 delitos, los 3 rangos con ≥30 registros", () => {
  assert.ok(new Set(R.map((r) => r.entidad)).size >= 10);
  assert.ok(new Set(R.map((r) => r.juzgado)).size >= 20);
  assert.ok(new Set(R.map((r) => r.delito)).size >= 10);
  const c = L.contarPorRango(R);
  assert.ok(c.amarillo >= 30 && c.naranja >= 30 && c.rojo >= 30, JSON.stringify(c));
});
prueba("Fechas válidas y coherentes (inicio < cumplimiento)", () => {
  for (const r of R) {
    assert.ok(r.fechaSentencia && r.fechaInicio && r.fechaCumplimiento, r.id);
    assert.ok(r.fechaInicio < r.fechaCumplimiento, r.id);
  }
});

console.log("\nCLASIFICACIÓN POR COLORES");
prueba("8. 9→amarillo, 10→naranja, 15→naranja, 20→naranja, 21→rojo", () => {
  assert.strictEqual(L.clasificarPena(9), "amarillo");
  assert.strictEqual(L.clasificarPena(10), "naranja");
  assert.strictEqual(L.clasificarPena(15), "naranja");
  assert.strictEqual(L.clasificarPena(20), "naranja");
  assert.strictEqual(L.clasificarPena(21), "rojo");
});
prueba("Fracciones en los límites: 9.5→amarillo, 9.99→amarillo, 20.5→rojo", () => {
  assert.strictEqual(L.clasificarPena(9.5), "amarillo");
  assert.strictEqual(L.clasificarPena(9.99), "amarillo");
  assert.strictEqual(L.clasificarPena(20.5), "rojo");
});
prueba("Los casos límite existen en los datos ficticios", () => {
  for (const p of [9, 10, 15, 20, 21]) assert.ok(R.some((r) => r.pena === p), "falta pena " + p);
});

console.log("\nBUSCADOR");
const buscar = (texto) => L.filtrar(R, { ...L.FILTROS_VACIOS, texto });
prueba("4. Encuentra por nombre (sin importar acentos ni mayúsculas)", () => {
  const res = buscar("jose luis hernandez");
  assert.ok(res.length >= 3);
  assert.ok(res.every((r) => L.normalizar(r.nombre).includes("jose luis hernandez")));
});
prueba("Encuentra por expediente", () => {
  const exp = R[40].expediente;
  assert.deepStrictEqual(buscar(exp).map((r) => r.id), [R[40].id]);
});
prueba("Encuentra por causa penal", () => {
  assert.deepStrictEqual(buscar(R[77].causa).map((r) => r.id), [R[77].id]);
});
prueba("Encuentra por juzgado, entidad, circuito, delito y lugar", () => {
  assert.strictEqual(buscar("Juzgado Segundo de Distrito en Sonora").length,
    R.filter((r) => r.juzgado === "Juzgado Segundo de Distrito en Sonora").length);
  assert.strictEqual(buscar("michoacan").length, R.filter((r) => r.entidad === "Michoacán").length);
  assert.strictEqual(buscar("Décimo Segundo Circuito").length, R.filter((r) => r.circuito === "Décimo Segundo Circuito").length);
  assert.ok(buscar("hidrocarburos").length > 0);
  assert.ok(buscar("Tierra Caliente").every((r) => r.lugar.includes("Tierra Caliente")));
});
prueba("Varias palabras combinan campos (nombre + entidad)", () => {
  const r = R.find((x) => x.nombre === "José Luis Hernández Ruiz");
  const res = buscar("hernandez ruiz " + r.entidad);
  assert.ok(res.some((x) => x.id === r.id));
  assert.ok(res.every((x) => x.entidad === r.entidad));
});
prueba("Búsqueda sin coincidencias devuelve 0", () => assert.strictEqual(buscar("zzzz inexistente").length, 0));

console.log("\nFILTROS");
const F = (f) => L.filtrar(R, { ...L.FILTROS_VACIOS, ...f });
prueba("5. Filtro por entidad", () => {
  const res = F({ entidad: "Jalisco" });
  assert.strictEqual(res.length, 15);
  assert.ok(res.every((r) => r.entidad === "Jalisco"));
});
prueba("6. Filtros combinados (entidad + juzgado + rango + texto)", () => {
  const juz = "Juzgado Primero de Distrito en Materia Penal en Jalisco";
  const res = F({ entidad: "Jalisco", juzgado: juz, rango: "rojo" });
  assert.ok(res.every((r) => r.entidad === "Jalisco" && r.juzgado === juz && r.pena > 20));
  assert.strictEqual(res.length, R.filter((r) => r.juzgado === juz && r.pena > 20).length);
  const conTexto = F({ entidad: "Jalisco", texto: "secuestro" });
  assert.ok(conTexto.every((r) => r.entidad === "Jalisco" && r.delito === "Secuestro"));
});
prueba("Filtro por causa penal y por nombre (parcial)", () => {
  assert.strictEqual(F({ causa: R[5].causa }).length, 1);
  assert.strictEqual(F({ nombre: "María Fernanda López Castro" }).length, 2);
  assert.strictEqual(F({ nombre: "María Fernanda López Cast" }).length, 3);
});
prueba("7. Rango de pena", () => {
  assert.ok(F({ rango: "amarillo" }).every((r) => r.pena < 10));
  assert.ok(F({ rango: "naranja" }).every((r) => r.pena >= 10 && r.pena <= 20));
  assert.ok(F({ rango: "rojo" }).every((r) => r.pena > 20));
  const c = L.contarPorRango(R);
  assert.strictEqual(c.amarillo + c.naranja + c.rojo, 150);
  assert.strictEqual(F({ rango: "naranja" }).length, c.naranja);
});
prueba("Filtros dependientes: Entidad → Circuito → Juzgado", () => {
  const op = L.opcionesDependientes(R, { ...L.FILTROS_VACIOS, entidad: "Veracruz" });
  assert.deepStrictEqual(op.circuitos, ["Séptimo Circuito"]);
  assert.strictEqual(op.juzgados.length, 3);
  assert.ok(op.juzgados.every((j) => j.includes("Veracruz")));
  assert.ok(op.causas.length === 15);
  const todos = L.opcionesDependientes(R, L.FILTROS_VACIOS);
  assert.strictEqual(todos.circuitos[0], "Primer Circuito");
  assert.strictEqual(todos.circuitos[todos.circuitos.length - 1], "Décimo Séptimo Circuito");
});

console.log("\nORDEN, FORMATO Y CSV");
prueba("Ordena por pena (asc/desc) y por texto", () => {
  const asc = L.ordenar(R, "pena", "asc");
  const desc = L.ordenar(R, "pena", "desc");
  assert.ok(asc.every((r, i) => i === 0 || asc[i - 1].pena <= r.pena));
  assert.ok(desc.every((r, i) => i === 0 || desc[i - 1].pena >= r.pena));
  const nom = L.ordenar(R, "nombre", "asc").map((r) => r.nombre);
  assert.ok(nom.every((n, i) => i === 0 || nom[i - 1].localeCompare(n, "es", { sensitivity: "base" }) <= 0));
});
prueba("Formato de pena y fecha", () => {
  assert.strictEqual(L.formatearPena(9.5), "9 años 6 meses");
  assert.strictEqual(L.formatearPena(1), "1 año");
  assert.strictEqual(L.formatearFecha("2023-02-17"), "17 de febrero de 2023");
});
prueba("CSV con punto y coma, comillas y fechas DD/MM/AAAA (Excel en español)", () => {
  const texto = '﻿ID;Nombre completo;Causa penal;Pena en años;Fecha de inicio\r\n1;"Prueba, Ficticia";CP-1;"12,5";05/03/2020\r\n';
  const { registros } = D.normalizarFilas(D.parsearCSV(texto));
  assert.strictEqual(registros[0].nombre, "Prueba, Ficticia");
  assert.strictEqual(registros[0].pena, 12.5);
  assert.strictEqual(registros[0].fechaInicio, "2020-03-05");
});
prueba("Seudonimización y campos ocultos (preparación de privacidad)", () => {
  const p = D.aplicarPrivacidad(R.slice(0, 2), { seudonimizarNombres: true, prefijoSeudonimo: "PPL-", camposOcultos: ["observaciones"] });
  assert.strictEqual(p[0].nombre, "PPL-0001");
  assert.ok(!("observaciones" in p[0]));
  assert.ok(R[0].nombre !== "PPL-0001", "No debe modificar los datos originales");
});

console.log("\nSIN CONEXIONES EXTERNAS");
prueba("13. Ningún archivo de la app hace referencia a dominios externos", () => {
  const archivos = ["index.html", "css/estilos.css", "js/config.js", "js/datos.js", "js/logica.js", "js/interfaz.js"];
  for (const a of archivos) {
    const t = fs.readFileSync(path.join(RAIZ, a), "utf8");
    const urls = t.match(/https?:\/\/[^\s"')]+/g) || [];
    assert.deepStrictEqual(urls, [], a + " contiene: " + urls.join(", "));
  }
});

console.log(`\n${ok} pruebas superadas${process.exitCode ? " — HAY FALLAS" : ""}\n`);
