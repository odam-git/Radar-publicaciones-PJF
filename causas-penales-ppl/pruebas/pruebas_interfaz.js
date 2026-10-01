/*
 * Pruebas de la interfaz en un navegador real (Chromium vía Playwright).
 * Requiere:  npm install playwright   (solo para desarrollo; la app no lo necesita)
 * Ejecutar:  node pruebas/pruebas_interfaz.js [url]
 *   Sin url, abre index.html directamente desde el disco (file://).
 * El reloj del navegador se fija al 1 de octubre de 2026 para que los niveles sean reproducibles.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { chromium } = require("playwright");

const URL_APP = process.argv[2] || "file://" + path.join(__dirname, "..", "index.html");
const CAPTURAS = process.env.CAPTURAS || "";
const COLORES = {
  n1: "rgb(255, 242, 168)", n2: "rgb(255, 210, 31)", n3: "rgb(255, 179, 107)",
  n4: "rgb(240, 106, 0)", n5: "rgb(192, 18, 30)",
};

(async () => {
  const navegador = await chromium.launch(
    process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const pagina = await contexto.newPage();
  await pagina.clock.setFixedTime(new Date("2026-10-01T12:00:00"));

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
  const nivelesVisibles = () => pagina.locator("#cuerpo-tabla .nivel").evaluateAll((n) => n.map((x) => x.dataset.nivel));
  const tarjeta = (n) => pagina.locator(`.tarjeta[data-nivel="${n}"]`);
  const numeroTarjeta = async (n) => Number(await tarjeta(n).locator(".tarjeta__numero").textContent());

  console.log("\nAbriendo " + URL_APP);
  await pagina.goto(URL_APP);
  await pagina.waitForFunction(() => document.querySelectorAll("#cuerpo-tabla tr").length > 0);

  await prueba("12. Carga local con 150 PPL en seguimiento y sin errores", async () => {
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await filas().count(), 150);
    assert.match(await pagina.textContent("#contador"), /Resultados encontrados: 150 de 150 PPL/);
    assert.deepStrictEqual(errores, []);
  });
  await prueba("Título y columnas en el orden acordado (sin columna de pena)", async () => {
    assert.strictEqual(await pagina.textContent("h1"), "CAUSAS PENALES PPL");
    const enc = (await pagina.locator("thead th").allTextContents()).map((t) => t.replace(/[▲▼⇅]/g, "").trim());
    assert.deepStrictEqual(enc, ["Alerta", "Circuito / Entidad", "Juzgado de Distrito", "Causa Penal / Expediente",
      "Persona Privada de la Libertad", "Etapa Procesal", "Antigüedad", "Acciones"]);
    const etiquetas = (await pagina.locator("form label").allTextContents()).join(" | ");
    assert.ok(!/\bpena\b/i.test(etiquetas), "Hay un filtro de pena: " + etiquetas);
  });
  await prueba("Tipografía: tabla ≥16 px, título ≥24 px, botones ≥16 px; ojo y tarjetas grandes", async () => {
    const m = await pagina.evaluate(() => {
      const fs = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
      const ojo = document.querySelector(".boton-ojo").getBoundingClientRect();
      const t = document.querySelector(".tarjeta").getBoundingClientRect();
      return { td: fs(".tabla td"), sec: fs(".tabla .secundario"), th: fs(".tabla th"), h1: fs("h1"),
        boton: fs("#btn-buscar"), num: fs(".tarjeta__numero"), ojoW: ojo.width, ojoH: ojo.height, tH: t.height };
    });
    assert.ok(m.td >= 16 && m.sec >= 16 && m.th >= 16 && m.h1 >= 24 && m.boton >= 16 && m.num >= 30, JSON.stringify(m));
    assert.ok(m.ojoW >= 48 && m.ojoH >= 48 && m.tH >= 100, JSON.stringify(m));
  });
  await prueba("Sin desbordes horizontales de la página (salvo la tabla, que se desplaza)", async () => {
    const ancho = await pagina.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(ancho <= 0, "La página desborda " + ancho + " px");
  });

  console.log("\nAVISOS DE DEPURACIÓN");
  await prueba("Aviso de 2 sentencias ejecutoriadas con lista para dar de baja", async () => {
    const aviso = pagina.locator("#aviso-ejecutoriadas");
    assert.match(await aviso.locator("summary").textContent(), /2 registros con sentencia ejecutoriada/);
    await aviso.locator("summary").click();
    const lista = await aviso.locator("li").allTextContents();
    assert.strictEqual(lista.length, 2);
    assert.ok(lista[0].includes("CP-FIC-900/2019") && lista[1].includes("CP-FIC-901/2019"));
    await aviso.locator("summary").click();
  });
  await prueba("Los ejecutoriados no aparecen en la tabla ni en el buscador", async () => {
    await escribir("CP-FIC-900");
    assert.strictEqual(await total(), 0);
    await limpiar();
  });
  await prueba("Aviso de revisión: 1 registro sin fecha de auto de formal prisión", async () => {
    const aviso = pagina.locator("#aviso-revision");
    assert.match(await aviso.locator("summary").textContent(), /1 dato requiere revisión/);
    await aviso.locator("summary").click();
    assert.match(await aviso.locator("li").first().textContent(), /Sin fecha de auto de formal prisión/);
    await aviso.locator("summary").click();
  });

  console.log("\nTARJETAS / BOTONES DE NIVEL");
  await prueba("Conteos 30 · 30 · 30 · 30 · 29 y Total 150", async () => {
    assert.deepStrictEqual(
      [await numeroTarjeta(""), await numeroTarjeta("n1"), await numeroTarjeta("n2"), await numeroTarjeta("n3"), await numeroTarjeta("n4"), await numeroTarjeta("n5")],
      [150, 30, 30, 30, 30, 29]);
  });
  await prueba("Pulsar Nivel 5 filtra solo rojos; pulsar Nivel 4 los suma; Total quita el filtro", async () => {
    await tarjeta("n5").click();
    assert.strictEqual(await total(), 29);
    assert.strictEqual(await tarjeta("n5").getAttribute("aria-pressed"), "true");
    assert.ok((await nivelesVisibles()).every((n) => n === "n5"));
    await tarjeta("n4").click();
    assert.strictEqual(await total(), 59);
    assert.strictEqual(await pagina.inputValue("#f-nivel"), "varios");
    await tarjeta("n5").click();
    assert.strictEqual(await total(), 30);
    assert.strictEqual(await pagina.inputValue("#f-nivel"), "n4");
    await tarjeta("").click();
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await tarjeta("").getAttribute("aria-pressed"), "true");
  });
  await prueba("El filtro 'Nivel de antigüedad' y las tarjetas están sincronizados", async () => {
    await pagina.selectOption("#f-nivel", "n1");
    assert.strictEqual(await total(), 30);
    assert.strictEqual(await tarjeta("n1").getAttribute("aria-pressed"), "true");
    await limpiar();
    assert.strictEqual(await tarjeta("n1").getAttribute("aria-pressed"), "false");
  });
  await prueba("Las tarjetas recalculan sus conteos con los demás filtros", async () => {
    await pagina.selectOption("#f-entidad", "Jalisco");
    const suma = (await Promise.all(["n1", "n2", "n3", "n4", "n5"].map(numeroTarjeta))).reduce((a, b) => a + b, 0);
    const sinDato = (await nivelesVisibles()).filter((n) => n === "sd").length;
    assert.strictEqual(await numeroTarjeta(""), 15);
    assert.strictEqual(suma + sinDato, 15);
    await limpiar();
  });

  console.log("\nCOLORES Y LÍMITES");
  await prueba("Colores de los 5 niveles", async () => {
    for (const [n, color] of Object.entries(COLORES)) {
      const c = await pagina.locator(`#cuerpo-tabla .nivel[data-nivel="${n}"]`).first()
        .evaluate((e) => getComputedStyle(e).backgroundColor);
      assert.strictEqual(c, color, n);
    }
  });
  await prueba("Límites exactos 2/5/10/20/30 años quedan en N1/N2/N3/N4/N5", async () => {
    const esperado = { "CP-FIC-100": "n1", "CP-FIC-101": "n2", "CP-FIC-102": "n3", "CP-FIC-103": "n4", "CP-FIC-104": "n5" };
    for (const [causa, n] of Object.entries(esperado)) {
      await escribir(causa + "/");
      assert.strictEqual(await total(), 1, causa);
      assert.deepStrictEqual(await nivelesVisibles(), [n], causa);
    }
    await limpiar();
  });
  await prueba("Sin fecha de AFP: indicador gris 'S/D' y al final de la lista", async () => {
    const ultimo = filas().last();
    assert.strictEqual(await ultimo.locator(".nivel").getAttribute("data-nivel"), "sd");
    assert.strictEqual((await ultimo.locator(".nivel").textContent()).trim(), "S/D");
  });

  console.log("\nORDEN");
  await prueba("Orden inicial: los que llevan más tiempo primero", async () => {
    assert.strictEqual(await pagina.getAttribute("th[data-clave=antiguedad]:not([data-nombre])", "aria-sort"), "descending");
    assert.match(await filas().first().locator("td.col-causa").textContent(), /CP-FIC-104\/1996/);
  });
  await prueba("Ordenar por Antigüedad ascendente y por Nombre", async () => {
    await pagina.click("th[data-clave=antiguedad]:not([data-nombre]) button");
    assert.strictEqual(await pagina.getAttribute("th[data-clave=antiguedad]:not([data-nombre])", "aria-sort"), "ascending");
    assert.strictEqual(await filas().first().locator(".nivel").getAttribute("data-nivel"), "n1");
    await pagina.click("th[data-clave=nombre] button");
    const nombres = await pagina.locator("#cuerpo-tabla td.col-nombre").allTextContents();
    assert.deepStrictEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })));
    await pagina.click("th[data-nombre=alerta] button");
    assert.strictEqual(await filas().first().locator(".nivel").getAttribute("data-nivel"), "n5");
  });
  await prueba("Encabezados fijos al desplazar la tabla", async () => {
    await pagina.evaluate(() => { document.getElementById("tabla-contenedor").scrollTop = 2500; });
    const d = await pagina.evaluate(() => Math.abs(document.querySelector("thead th").getBoundingClientRect().top -
      document.getElementById("tabla-contenedor").getBoundingClientRect().top));
    assert.ok(d < 3, "El encabezado se desplazó " + d);
    await pagina.evaluate(() => { document.getElementById("tabla-contenedor").scrollTop = 0; });
  });

  console.log("\nBUSCADOR Y FILTROS");
  await prueba("4. Busca por nombre, expediente, causa, juzgado, entidad, lugar y etapa", async () => {
    await escribir("jose luis hernandez ruiz");
    assert.strictEqual(await total(), 2);
    await escribir("EXP-FIC-1280/");
    assert.strictEqual(await total(), 1);
    await escribir("Juzgado Segundo de Distrito en Sonora");
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-juzgado").allTextContents()).every((t) => t === "Juzgado Segundo de Distrito en Sonora"));
    await escribir("nuevo leon");
    assert.strictEqual(await total(), 15);
    await escribir("reposicion del procedimiento");
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-etapa").allTextContents()).every((t) => t === "Reposición del procedimiento"));
    await limpiar();
  });
  await prueba("5. Dependencia Entidad → Circuito → Juzgado", async () => {
    await pagina.selectOption("#f-entidad", "Veracruz");
    assert.deepStrictEqual(await pagina.locator("#f-circuito option").allTextContents(), ["Todos", "Séptimo Circuito"]);
    const juzgados = await pagina.locator("#f-juzgado option").allTextContents();
    assert.strictEqual(juzgados.length, 4);
    await pagina.selectOption("#f-juzgado", juzgados[1]);
    assert.strictEqual(await total(), 5);
    await pagina.selectOption("#f-entidad", "Sonora");
    assert.strictEqual(await pagina.inputValue("#f-juzgado"), "");
    await limpiar();
  });
  await prueba("Filtro de etapa procesal", async () => {
    await pagina.selectOption("#f-etapa", "Amparo directo");
    const n = await total();
    assert.ok(n > 0 && n < 150);
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-etapa").allTextContents()).every((t) => t === "Amparo directo"));
    await limpiar();
  });
  await prueba("6. Combinados: nivel 5 + etapa + entidad + texto", async () => {
    await tarjeta("n5").click();
    await pagina.selectOption("#f-etapa", "Apelación (Tribunal de Alzada)");
    const n = await total();
    assert.ok(n > 0 && n < 29);
    assert.ok((await nivelesVisibles()).every((x) => x === "n5"));
    await pagina.fill("#f-nombre", "zzz");
    await pagina.click("#btn-buscar");
    assert.strictEqual(await total(), 0);
    assert.ok(await pagina.isVisible("#vacio"));
    await pagina.click("#btn-limpiar-vacio");
    assert.strictEqual(await total(), 150);
  });
  await prueba("11. LIMPIAR FILTROS restablece todo", async () => {
    await pagina.selectOption("#f-entidad", "Puebla");
    await tarjeta("n3").click();
    await pagina.fill("#buscador", "secuestro");
    await limpiar();
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await pagina.inputValue("#buscador"), "");
    assert.strictEqual(await pagina.inputValue("#f-entidad"), "");
    assert.strictEqual(await tarjeta("n3").getAttribute("aria-pressed"), "false");
  });

  console.log("\nFICHA EMERGENTE");
  const rubros = ["Nombre de la PPL", "Causa penal vigente", "Expediente", "Circuito judicial", "Entidad federativa",
    "Reclusión", "Juzgado de Distrito radicador", "Antigüedad y etapa procesal", "Fecha de auto de formal prisión",
    "Antigüedad", "Etapa procesal", "Delitos / materia del proceso", "Último acto procesal / reseña jurisdiccional",
    "Instancia actual", "Observaciones"];
  await prueba("9. El ojo abre la ficha correcta con todos los rubros", async () => {
    await escribir("CP-FIC-104/");
    const nombre = await pagina.textContent("#cuerpo-tabla td.col-nombre");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    assert.ok(await pagina.isVisible("#detalle"));
    const texto = await pagina.textContent("#detalle-cuerpo");
    assert.ok(texto.includes(nombre) && texto.includes("CP-FIC-104/1996"));
    for (const r of rubros) assert.ok(texto.toLowerCase().includes(r.toLowerCase()), "Falta " + r);
    assert.match(await pagina.textContent("#detalle-nivel"), /NIVEL 5 · DE 20 A 30 AÑOS/);
    assert.match(texto, /1 de octubre de 1996/);
    const tam = await pagina.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".ficha-dato .valor")).fontSize));
    assert.ok(tam >= 18, "valor " + tam);
    if (CAPTURAS) await pagina.screenshot({ path: path.join(CAPTURAS, "ficha.png") });
  });
  await prueba("La pena (no firme) solo aparece como dato informativo cuando hay sentencia", async () => {
    const texto = await pagina.textContent("#detalle-cuerpo");
    const etapa = await pagina.locator(".recuadro--antiguedad .ficha-dato").nth(2).locator(".valor").textContent();
    const conSentencia = ["Sentencia de primera instancia", "Apelación (Tribunal de Alzada)", "Amparo directo"].includes(etapa);
    assert.strictEqual(/Dato informativo:.*no firme/.test(texto), conSentencia, etapa);
    await pagina.click("#btn-x");
    await escribir("CP-FIC-100/");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    const t2 = await pagina.textContent("#detalle-cuerpo");
    assert.match(t2, /Instrucción|Cierre de instrucción/);
    assert.ok(!t2.includes("Dato informativo"), "No debería mostrar pena en instrucción");
  });
  await prueba("10. Se cierra con la X, con CERRAR, con clic fuera y con Esc", async () => {
    await pagina.click("#btn-x");
    assert.ok(!(await pagina.isVisible("#detalle")));
    await pagina.click("#cuerpo-tabla .boton-ojo");
    await pagina.click("#btn-cerrar");
    assert.ok(!(await pagina.isVisible("#detalle")));
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
  await prueba("Cada ojo abre su propio registro (muestra de 150)", async () => {
    for (const i of [0, 49, 99, 149]) {
      const causa = await filas().nth(i).locator("td.col-causa .principal").textContent();
      await filas().nth(i).locator(".boton-ojo").click();
      assert.ok((await pagina.textContent("#detalle-cuerpo")).includes(causa));
      await pagina.click("#btn-x");
    }
  });

  console.log("\nEXPORTAR, CARGA DE CSV Y PRIVACIDAD");
  await prueba("Exportar vista descarga un CSV local con lo filtrado", async () => {
    await tarjeta("n5").click();
    const [descarga] = await Promise.all([pagina.waitForEvent("download"), pagina.click("#btn-exportar")]);
    const contenido = fs.readFileSync(await descarga.path(), "utf8");
    const lineas = contenido.trim().split(/\r\n/);
    assert.match(lineas[0], /Nivel de antigüedad,Antigüedad,ID,Nombre completo/);
    assert.strictEqual(lineas.length, 30);
    assert.ok(lineas.slice(1).every((l) => l.startsWith("Nivel 5")));
    await limpiar();
  });
  await prueba("Cargar CSV propio: ejecutoriada al aviso y caso de más de 30 años en rojo", async () => {
    const csv = "ID;Nombre completo;Causa penal;Fecha de auto de formal prisión;Etapa procesal;Fecha de ejecutoria\n" +
      "1;Persona Ficticia Uno;CP-X-1;10/05/1990;Amparo directo;\n" +
      "2;Persona Ficticia Dos;CP-X-2;01/02/2025;Instrucción;\n" +
      "3;Persona Ficticia Tres;CP-X-3;01/02/2010;Sentencia ejecutoriada;15/09/2026\n";
    await pagina.setInputFiles("#archivo-csv", { name: "prueba.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await pagina.waitForFunction(() => document.getElementById("total").textContent === "2");
    assert.match(await pagina.textContent("#aviso-ejecutoriadas summary"), /1 registro con sentencia ejecutoriada/);
    assert.strictEqual((await filas().first().locator(".nivel").textContent()).trim(), "N5 +30");
    await filas().first().locator(".boton-ojo").click();
    assert.match(await pagina.textContent("#detalle-nivel"), /MÁS DE 30 AÑOS/);
    await pagina.click("#btn-x");
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
    await pagina.screenshot({ path: path.join(CAPTURAS, "movil.png") });
  }
  console.log(`\n${ok} pruebas superadas${process.exitCode ? " — HAY FALLAS" : ""}\n`);
  await navegador.close();
})();
