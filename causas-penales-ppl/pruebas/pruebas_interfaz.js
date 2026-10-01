/*
 * Pruebas de la interfaz en un navegador real (Chromium vía Playwright).
 * Requiere:  npm install playwright   (solo para desarrollo; la app no lo necesita)
 * Ejecutar:  node pruebas/pruebas_interfaz.js [url]
 *   Sin url, abre index.html directamente desde el disco (file://).
 */
"use strict";
const path = require("path");
const assert = require("assert");
const { chromium } = require("playwright");

const URL_APP = process.argv[2] || "file://" + path.join(__dirname, "..", "index.html");
const CAPTURAS = process.env.CAPTURAS || "";

(async () => {
  const navegador = await chromium.launch(
    process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });

  const solicitudes = [];
  const errores = [];
  pagina.on("request", (r) => solicitudes.push(r.url()));
  pagina.on("pageerror", (e) => errores.push(e.message));
  pagina.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });

  let ok = 0;
  async function prueba(nombre, fn) {
    try { await fn(); ok++; console.log("  ✔ " + nombre); }
    catch (e) { console.error("  ✘ " + nombre + "\n    " + e.message.split("\n")[0]); process.exitCode = 1; }
  }
  const total = async () => Number(await pagina.textContent("#total"));
  const filas = () => pagina.locator("#cuerpo-tabla tr");
  const limpiar = () => pagina.click("#btn-limpiar");
  const escribir = async (texto) => { await pagina.fill("#buscador", texto); await pagina.click("#btn-buscar"); };

  console.log("\nAbriendo " + URL_APP);
  await pagina.goto(URL_APP);
  await pagina.waitForFunction(() => document.querySelectorAll("#cuerpo-tabla tr").length > 0);

  await prueba("12. La aplicación carga localmente con 150 registros y sin errores", async () => {
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await filas().count(), 150);
    assert.match(await pagina.textContent("#contador"), /Resultados encontrados: 150 PPL/);
    assert.deepStrictEqual(errores, []);
  });
  await prueba("Título, subtítulo y columnas en el orden solicitado", async () => {
    assert.strictEqual(await pagina.textContent("h1"), "CAUSAS PENALES PPL");
    const enc = (await pagina.locator("thead th").allTextContents()).map((t) => t.replace(/[▲▼⇅]/g, "").trim());
    assert.deepStrictEqual(enc, ["Entidad Federativa", "Circuito", "Juzgado de Distrito", "Causa Penal",
      "Nombre de la Persona", "Lugar donde se encuentra", "Pena", "Ver"]);
  });
  await prueba("Tipografía: tabla ≥16 px, títulos ≥24 px, botones ≥16 px; ojo ≥48 px", async () => {
    const m = await pagina.evaluate(() => {
      const fs = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
      const ojo = document.querySelector(".boton-ojo").getBoundingClientRect();
      return { td: fs(".tabla td"), th: fs(".tabla th"), h1: fs("h1"), boton: fs("#btn-buscar"),
        buscador: fs("#buscador"), ojoW: ojo.width, ojoH: ojo.height };
    });
    assert.ok(m.td >= 16 && m.th >= 16 && m.h1 >= 24 && m.boton >= 16 && m.buscador >= 16, JSON.stringify(m));
    assert.ok(m.ojoW >= 48 && m.ojoH >= 48, JSON.stringify(m));
  });

  console.log("\nBUSCADOR");
  await prueba("4. Busca por nombre, expediente, causa, juzgado, entidad y lugar", async () => {
    await escribir("jose luis hernandez ruiz");
    assert.strictEqual(await total(), 2);
    await escribir("EXP-FIC-1280/");
    assert.strictEqual(await total(), 1);
    await escribir("CP-FIC-177");
    assert.strictEqual(await total(), 1);
    assert.match(await filas().first().textContent(), /CP-FIC-177/);
    await escribir("Juzgado Segundo de Distrito en Sonora");
    const n = await total();
    assert.ok(n > 0 && n < 15);
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-juzgado").allTextContents()).every((t) => t === "Juzgado Segundo de Distrito en Sonora"));
    await escribir("nuevo leon");
    assert.strictEqual(await total(), 15);
    await escribir("Barrancas");
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-lugar").allTextContents()).every((t) => t.includes("Barrancas")));
    await limpiar();
  });
  await prueba("El buscador filtra mientras se escribe (sin pulsar BUSCAR)", async () => {
    await pagina.fill("#buscador", "Sinaloa");
    await pagina.waitForFunction(() => document.getElementById("total").textContent === "15");
    await limpiar();
  });

  console.log("\nFILTROS");
  await prueba("5. Filtro por entidad y dependencia Entidad → Circuito → Juzgado", async () => {
    await pagina.selectOption("#f-entidad", "Veracruz");
    assert.strictEqual(await total(), 15);
    const circuitos = await pagina.locator("#f-circuito option").allTextContents();
    assert.deepStrictEqual(circuitos, ["Todos", "Séptimo Circuito"]);
    const juzgados = await pagina.locator("#f-juzgado option").allTextContents();
    assert.strictEqual(juzgados.length, 4);
    assert.ok(juzgados.slice(1).every((j) => j.includes("Veracruz")));
    await pagina.selectOption("#f-juzgado", juzgados[1]);
    assert.strictEqual(await total(), 5);
  });
  await prueba("Cambiar de entidad reinicia circuito y juzgado incompatibles", async () => {
    await pagina.selectOption("#f-entidad", "Sonora");
    assert.strictEqual(await pagina.inputValue("#f-juzgado"), "");
    assert.strictEqual(await total(), 15);
    await limpiar();
  });
  await prueba("6. Filtros combinados (entidad + rango + búsqueda + nombre)", async () => {
    await pagina.selectOption("#f-entidad", "Jalisco");
    await pagina.selectOption("#f-rango", "rojo");
    const n = await total();
    assert.ok(n > 0 && n < 15);
    const penas = await pagina.locator("#cuerpo-tabla .chip").evaluateAll((cs) => cs.map((c) => c.dataset.rango));
    assert.ok(penas.every((p) => p === "rojo"));
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-entidad").allTextContents()).every((t) => t === "Jalisco"));
    await limpiar();
    await pagina.fill("#f-nombre", "María Fernanda López");
    await pagina.waitForFunction(() => document.getElementById("total").textContent === "3");
    await pagina.fill("#buscador", "castillo");
    await pagina.click("#btn-buscar");
    assert.strictEqual(await total(), 1);
    await limpiar();
  });
  await prueba("Filtro de causa penal", async () => {
    await pagina.fill("#f-causa", "CP-FIC-150");
    await pagina.click("#btn-buscar");
    assert.strictEqual(await total(), 1);
    await limpiar();
  });
  await prueba("7. Rango de pena y conteo 🟡 | 🟠 | 🔴", async () => {
    const conteo = await pagina.locator("#conteo-rangos span[data-rango]").evaluateAll((s) =>
      Object.fromEntries(s.map((x) => [x.dataset.rango, Number(x.textContent.replace(/\D/g, ""))])));
    assert.strictEqual(conteo.amarillo + conteo.naranja + conteo.rojo, 150);
    for (const rango of ["amarillo", "naranja", "rojo"]) {
      await pagina.selectOption("#f-rango", rango);
      assert.strictEqual(await total(), conteo[rango]);
    }
    await limpiar();
  });
  await prueba("11. LIMPIAR FILTROS restablece todo y el contador vuelve a 150", async () => {
    await pagina.selectOption("#f-entidad", "Puebla");
    await pagina.fill("#buscador", "secuestro");
    await pagina.click("#btn-buscar");
    assert.ok((await total()) < 150);
    await limpiar();
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await pagina.inputValue("#buscador"), "");
    assert.strictEqual(await pagina.inputValue("#f-entidad"), "");
  });
  await prueba("Sin resultados: mensaje y botón para limpiar", async () => {
    await escribir("zzzz-no-existe");
    assert.strictEqual(await total(), 0);
    assert.ok(await pagina.isVisible("#vacio"));
    await pagina.click("#btn-limpiar-vacio");
    assert.strictEqual(await total(), 150);
  });

  console.log("\nCOLORES Y ORDEN");
  await prueba("8. Chips: 9→amarillo, 10/15/20→naranja, 21→rojo (sin colorear la fila)", async () => {
    const mapa = await pagina.locator("#cuerpo-tabla .chip").evaluateAll((cs) =>
      cs.map((c) => [c.firstChild.textContent, c.dataset.rango, getComputedStyle(c).backgroundColor]));
    const buscarChip = (t) => mapa.find(([txt]) => txt === t);
    assert.strictEqual(buscarChip("9 años")[1], "amarillo");
    assert.strictEqual(buscarChip("10 años")[1], "naranja");
    assert.strictEqual(buscarChip("15 años")[1], "naranja");
    assert.strictEqual(buscarChip("20 años")[1], "naranja");
    assert.strictEqual(buscarChip("21 años")[1], "rojo");
    assert.strictEqual(buscarChip("9 años 6 meses")[1], "amarillo");
    assert.strictEqual(buscarChip("20 años 6 meses")[1], "rojo");
    assert.strictEqual(buscarChip("9 años")[2], "rgb(255, 212, 59)");
    assert.strictEqual(buscarChip("15 años")[2], "rgb(240, 140, 0)");
    assert.strictEqual(buscarChip("21 años")[2], "rgb(179, 19, 27)");
    const fondoFila = await pagina.evaluate(() => getComputedStyle(document.querySelector("#cuerpo-tabla td")).backgroundColor);
    assert.ok(!["rgb(255, 212, 59)", "rgb(240, 140, 0)", "rgb(179, 19, 27)"].includes(fondoFila));
  });
  await prueba("Ordenar por Pena (ascendente y descendente) y por Nombre", async () => {
    await pagina.click("th[data-clave=pena] button");
    assert.strictEqual(await pagina.getAttribute("th[data-clave=pena]", "aria-sort"), "ascending");
    const leerPenas = () => pagina.locator("#cuerpo-tabla .chip").evaluateAll((cs) => cs.map((c) => c.firstChild.textContent));
    let p = await leerPenas();
    assert.match(p[0], /^[2-9] años$/);
    await pagina.click("th[data-clave=pena] button");
    assert.strictEqual(await pagina.getAttribute("th[data-clave=pena]", "aria-sort"), "descending");
    p = await leerPenas();
    assert.match(p[0], /^(4\d|50) años$/);
    await pagina.click("th[data-clave=nombre] button");
    const nombres = await pagina.locator("#cuerpo-tabla td.col-nombre").allTextContents();
    const ordenados = [...nombres].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    assert.deepStrictEqual(nombres, ordenados);
  });
  await prueba("Encabezados fijos al desplazar la tabla", async () => {
    await pagina.evaluate(() => { document.getElementById("tabla-contenedor").scrollTop = 2500; });
    const pos = await pagina.evaluate(() => {
      const c = document.getElementById("tabla-contenedor").getBoundingClientRect();
      const th = document.querySelector("thead th").getBoundingClientRect();
      return Math.abs(th.top - c.top);
    });
    assert.ok(pos < 3, "El encabezado se desplazó: " + pos);
    await pagina.evaluate(() => { document.getElementById("tabla-contenedor").scrollTop = 0; });
  });

  console.log("\nTARJETA DE DETALLE");
  await prueba("9. El ojo abre el registro correcto", async () => {
    await escribir("CP-FIC-133");
    const nombre = await pagina.textContent("#cuerpo-tabla td.col-nombre");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    assert.ok(await pagina.isVisible("#detalle"));
    const texto = await pagina.textContent("#detalle-cuerpo");
    assert.ok(texto.includes(nombre) && texto.includes("CP-FIC-133"), texto.slice(0, 120));
    for (const etq of ["Nombre completo", "Expediente", "Causa penal", "Delito", "Entidad Federativa", "Circuito",
      "Juzgado de Distrito", "Lugar donde se encuentra", "Pena", "Clasificación", "Fecha de sentencia",
      "Fecha de inicio", "Fecha estimada de cumplimiento", "Observaciones"]) {
      assert.ok(texto.includes(etq), "Falta " + etq);
    }
    const dd = await pagina.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".datos dd")).fontSize));
    assert.ok(dd >= 18, "dd " + dd);
    if (CAPTURAS) await pagina.screenshot({ path: path.join(CAPTURAS, "detalle.png") });
  });
  await prueba("10. Se cierra con la X", async () => {
    await pagina.click("#btn-x");
    assert.ok(!(await pagina.isVisible("#detalle")));
  });
  await prueba("10. Se cierra con el botón CERRAR", async () => {
    await pagina.click("#cuerpo-tabla .boton-ojo");
    await pagina.click("#btn-cerrar");
    assert.ok(!(await pagina.isVisible("#detalle")));
  });
  await prueba("10. Se cierra con clic fuera de la tarjeta y con Esc", async () => {
    await pagina.click("#cuerpo-tabla .boton-ojo");
    await pagina.mouse.click(10, 10);
    assert.ok(!(await pagina.isVisible("#detalle")));
    await pagina.click("#cuerpo-tabla .boton-ojo");
    await pagina.keyboard.press("Escape");
    assert.ok(!(await pagina.isVisible("#detalle")));
    await limpiar();
  });
  await prueba("Homonimias: dos ojos del mismo nombre abren causas distintas", async () => {
    await escribir("Juan Pablo Ramírez Soto");
    assert.strictEqual(await total(), 2);
    const causas = [];
    for (let i = 0; i < 2; i++) {
      await pagina.locator("#cuerpo-tabla .boton-ojo").nth(i).click();
      causas.push((await pagina.textContent("#detalle-cuerpo")).match(/CP-FIC-\d+\/\d{4}/)[0]);
      await pagina.click("#btn-cerrar");
    }
    assert.notStrictEqual(causas[0], causas[1]);
    await limpiar();
  });
  await prueba("Se ven los 150 registros y cada ojo abre su propio registro", async () => {
    const n = await pagina.locator("#cuerpo-tabla .boton-ojo").count();
    assert.strictEqual(n, 150);
    for (const i of [0, 49, 99, 149]) {
      const causa = await filas().nth(i).locator("td.col-causa").textContent();
      await filas().nth(i).locator(".boton-ojo").click();
      assert.ok((await pagina.textContent("#detalle-cuerpo")).includes(causa));
      await pagina.click("#btn-x");
    }
  });

  console.log("\nCARGA DE CSV Y PRIVACIDAD");
  await prueba("Cargar archivo CSV desde la computadora (sin subirlo a Internet)", async () => {
    await pagina.setInputFiles("#archivo-csv", {
      name: "prueba.csv", mimeType: "text/csv",
      buffer: Buffer.from("ID;Nombre completo;Causa penal;Pena en años;Entidad Federativa\n1;Persona Ficticia Uno;CP-X-1;9;Sonora\n2;Persona Ficticia Dos;CP-X-2;21;Sonora\n"),
    });
    await pagina.waitForFunction(() => document.getElementById("total").textContent === "2");
    assert.match(await pagina.textContent("#fuente-texto"), /prueba\.csv · 2 registros/);
    await pagina.click("#btn-recargar");
    await pagina.waitForFunction(() => document.getElementById("total").textContent === "150");
  });
  await prueba("13. Ninguna solicitud a servicios externos", async () => {
    const externas = solicitudes.filter((u) => !/^(file:|data:|blob:|about:)/.test(u) && !u.startsWith(new URL(URL_APP).origin));
    assert.deepStrictEqual(externas, []);
    assert.deepStrictEqual(errores, []);
  });

  if (CAPTURAS) {
    await pagina.screenshot({ path: path.join(CAPTURAS, "inicio.png") });
    await pagina.setViewportSize({ width: 390, height: 844 });
    await pagina.screenshot({ path: path.join(CAPTURAS, "movil.png"), fullPage: false });
  }
  console.log(`\n${ok} pruebas superadas${process.exitCode ? " — HAY FALLAS" : ""}\n`);
  await navegador.close();
})();
