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

const RAIZ = path.join(__dirname, "..");
const URL_APP = process.argv[2] || "file://" + path.join(RAIZ, "index.html");
const CAPTURAS = process.env.CAPTURAS || "";
const RELOJ = new Date("2026-10-01T12:00:00");
const COLORES = {
  n1: "rgb(255, 242, 168)", n2: "rgb(255, 210, 31)", n3: "rgb(255, 179, 107)",
  n4: "rgb(240, 106, 0)", n5: "rgb(192, 18, 30)",
};

// Datos esperados calculados a partir del propio CSV (no cifras fijas).
const D = require("../js/datos.js");
const L = require("../js/logica.js");
const R = D.normalizarFilas(D.parsearCSV(fs.readFileSync(path.join(RAIZ, "datos/datos_ppl_ficticios.csv"), "utf8"))).registros;
const cuenta = (fn) => R.filter(fn).length;
const PROX90 = cuenta((r) => L.proximoCambio(r.fechaAFP, RELOJ, 90));
const PROX30 = cuenta((r) => L.proximoCambio(r.fechaAFP, RELOJ, 30));
const LOCALES = cuenta((r) => r.motivoPrivacion === "Solo por causa del fuero común");
const PLAZO = cuenta((r) => L.alertas(r, RELOJ).some((a) => a.tipo === "plazo"));
const SISTEMA = cuenta((r) => L.alertas(r, RELOJ).some((a) => a.tipo === "sistema"));

(async () => {
  const navegador = await chromium.launch(
    process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, colorScheme: "light" });
  const pagina = await contexto.newPage();
  await pagina.clock.setFixedTime(RELOJ);

  const solicitudes = [];
  const errores = [];
  const vigilar = (p) => {
    p.on("request", (r) => solicitudes.push(r.url()));
    p.on("pageerror", (e) => errores.push(e.message));
    p.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  };
  vigilar(pagina);

  let ok = 0;
  async function prueba(nombre, fn) {
    try { await fn(); ok++; console.log("  ✔ " + nombre); }
    catch (e) {
      const linea = (e.stack || "").split("\n").find((l) => l.includes("pruebas_interfaz.js")) || "";
      console.error("  ✘ " + nombre + "\n    " + e.message.split("\n")[0] + "\n    " + linea.trim());
      process.exitCode = 1;
    }
  }
  const total = async () => Number(await pagina.textContent("#total"));
  const esperarTotal = (n) => pagina.waitForFunction((x) => document.getElementById("total").textContent === String(x), n);
  const filas = () => pagina.locator("#cuerpo-tabla tr");
  const limpiar = () => pagina.click("#btn-limpiar");
  const escribir = async (texto) => { await pagina.fill("#buscador", texto); await pagina.click("#btn-buscar"); };
  const nivelesVisibles = () => pagina.locator("#cuerpo-tabla .nivel").evaluateAll((n) => n.map((x) => x.dataset.nivel));
  const tarjeta = (n) => pagina.locator(`.tarjeta[data-nivel="${n}"]`);
  const numeroTarjeta = async (n) => Number(await tarjeta(n).locator(".tarjeta__numero").textContent());
  const abrirMas = async () => { if (await pagina.isHidden("#mas-filtros")) await pagina.click("#btn-mas-filtros"); };

  console.log("\nAbriendo " + URL_APP);
  await pagina.goto(URL_APP);
  await pagina.waitForFunction(() => document.querySelectorAll("#cuerpo-tabla tr").length > 0);

  console.log("\nCARGA, ENCABEZADO Y ACCESIBILIDAD");
  await prueba("12. Carga local con 150 PPL en seguimiento y sin errores", async () => {
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await filas().count(), 150);
    assert.match(await pagina.textContent("#contador"), /Resultados encontrados: 150 de 150 PPL/);
    assert.deepStrictEqual(errores, []);
  });
  await prueba("Fecha de corte, leyenda de clasificación y datos ficticios visibles", async () => {
    assert.match(await pagina.textContent("#texto-corte"), /Corte de datos: 1 de octubre de 2026 · Antigüedad calculada al 1 de octubre de 2026/);
    assert.match(await pagina.textContent("#clasificacion"), /Información confidencial/);
    assert.ok(await pagina.isVisible("#aviso-ficticio"));
  });
  await prueba("Columnas en el orden acordado y etiquetas sin mayúsculas forzadas", async () => {
    const enc = (await pagina.locator("#tabla thead th").allTextContents()).map((t) => t.replace(/[▲▼⇅]/g, "").trim());
    assert.deepStrictEqual(enc, ["Alerta", "Circuito / Entidad", "Juzgado de Distrito", "Causa penal / Expediente",
      "Persona privada de la libertad", "Etapa procesal", "Antigüedad", "Acciones"]);
    const tt = await pagina.evaluate(() => [getComputedStyle(document.querySelector(".etiqueta")).textTransform,
      getComputedStyle(document.querySelector("#tabla thead th")).textTransform]);
    assert.deepStrictEqual(tt, ["none", "none"]);
  });
  await prueba("Botones de acción en mayúsculas", async () => {
    for (const id of ["#btn-buscar", "#btn-limpiar", "#btn-mas-filtros", "#btn-exportar", "#btn-recargar", "#btn-proximos", "#btn-cerrar"]) {
      const t = (await pagina.locator(id).innerText()).trim();
      assert.strictEqual(t, t.toUpperCase(), id + ": " + t);
    }
  });
  await prueba("Texto base de 18 px expresado en % (crece con la letra del navegador); tabla ≥16 px", async () => {
    const m = await pagina.evaluate(() => {
      const fs = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
      return { html: fs("html"), td: fs(".tabla td"), sec: fs(".tabla .secundario"), h1: fs("h1"),
        ojo: document.querySelector(".boton-ojo").getBoundingClientRect().height };
    });
    assert.strictEqual(m.html, 18);
    // Se declara en porcentaje para respetar el tamaño de letra elegido en el navegador.
    const css = fs.readFileSync(path.join(RAIZ, "css/estilos.css"), "utf8");
    assert.match(css, /html \{ font-size: 112\.5%; \}/);
    assert.ok(m.td >= 16 && m.sec >= 16 && m.h1 >= 24 && m.ojo >= 48, JSON.stringify(m));
  });
  await prueba("Anillo de foco doble: oscuro (≥3:1 sobre blanco) más amarillo", async () => {
    await pagina.focus("#btn-buscar");
    await pagina.keyboard.press("Tab");
    const f = await pagina.evaluate(() => {
      const s = getComputedStyle(document.activeElement);
      return { color: s.outlineColor, ancho: s.outlineWidth, sombra: s.boxShadow };
    });
    assert.strictEqual(f.color, "rgb(15, 30, 51)");
    assert.strictEqual(f.ancho, "3px");
    assert.match(f.sombra, /rgb\(255, 191, 0\)/);
  });
  await prueba("La tabla cabe completa a 1440 px (antigüedad y ojo visibles sin desplazar)", async () => {
    const d = await pagina.evaluate(() => document.getElementById("tabla").scrollWidth - document.getElementById("tabla-contenedor").clientWidth);
    assert.ok(d <= 2, "Sobra " + d + " px");
    const ancho = await pagina.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(ancho <= 0, "La página desborda " + ancho + " px");
  });

  console.log("\nAVISOS");
  await prueba("Aviso de 4 bajas con su motivo (ejecutoria, desvanecimiento, cese de la medida)", async () => {
    const aviso = pagina.locator("#aviso-bajas");
    assert.match(await aviso.locator("summary").textContent(), /4 registros deben darse de baja/);
    await aviso.locator("summary").click();
    const lista = await aviso.locator("li").allTextContents();
    assert.strictEqual(lista.length, 4);
    assert.ok(lista[0].includes("CP-FIC-900/2019") && /Sentencia ejecutoriada \(art\. 360 CFPP\).*Ejecutoria: \d\d\/\d\d\/2026/.test(lista[0]));
    assert.ok(lista[2].includes("desvanecimiento de datos (art. 422 CFPP)"));
    assert.ok(lista[3].includes("quinto transitorio"));
    await aviso.locator("summary").click();
    await escribir("CP-FIC-900");
    assert.strictEqual(await total(), 0);
    await limpiar();
  });
  await prueba("Aviso aparte de 3 amparos directos: fuera de la tabla y de los conteos", async () => {
    const aviso = pagina.locator("#aviso-amparos");
    assert.match(await aviso.locator("summary").textContent(), /3 causas tienen sentencia definitiva con amparo directo en trámite.*art\. 191 Ley de Amparo/);
    await aviso.locator("summary").click();
    const lista = await aviso.locator("li").allTextContents();
    assert.ok(lista.length === 3 && lista.every((t) => /CP-FIC-90[456]\/2019.*Tribunal Colegiado/.test(t)));
    await aviso.locator("summary").click();
    await escribir("CP-FIC-905");
    assert.strictEqual(await total(), 0);
    await limpiar();
  });
  await prueba(`Aviso de plazos del CFPP (${PLAZO}) y de sistema aplicable (${SISTEMA}) con botón que filtra`, async () => {
    assert.match(await pagina.textContent("#aviso-plazos"), new RegExp(`${PLAZO} causas rebasan un plazo del Código Federal`));
    assert.match(await pagina.textContent("#aviso-sistema"), new RegExp(`${SISTEMA} causas deben verificarse`));
    await pagina.click("#btn-ver-plazos");
    assert.strictEqual(await total(), PLAZO);
    assert.strictEqual(await pagina.inputValue("#f-alerta"), "plazo");
    assert.ok(await pagina.isVisible("#f-alerta"), "MÁS FILTROS se abre para mostrar el filtro activo");
    assert.strictEqual(await pagina.locator("#cuerpo-tabla .marca-alerta").count(), PLAZO);
    await pagina.click("#btn-ver-sistema");
    assert.strictEqual(await total(), SISTEMA);
    const etiqueta = await pagina.locator("#cuerpo-tabla .marca-alerta").first().getAttribute("aria-label");
    assert.match(etiqueta, /Código Nacional|sistema/i);
    await limpiar();
  });
  await prueba("Aviso de revisión: 1 registro sin fecha de auto de formal prisión", async () => {
    const aviso = pagina.locator("#aviso-revision");
    assert.match(await aviso.locator("summary").textContent(), /1 dato requiere revisión/);
  });
  await prueba(`Aviso de reclusión por proceso local (${LOCALES}) y botón que filtra esos casos`, async () => {
    assert.match(await pagina.textContent("#aviso-local"), new RegExp(`${LOCALES} PPL en reclusión solo por un proceso local`));
    await pagina.click("#btn-ver-locales");
    assert.strictEqual(await total(), LOCALES);
    assert.strictEqual(await pagina.inputValue("#f-motivo"), "Solo por causa del fuero común");
    const marcas = await pagina.locator("#cuerpo-tabla .marca-motivo").allTextContents();
    assert.ok(marcas.length === LOCALES && marcas.every((t) => t.includes("Reclusión por proceso local")));
    await limpiar();
  });

  console.log("\nSEMÁFORO Y TARJETAS");
  await prueba("Regla de años 0 · 2 · 5 · 10 · 20 · 30 + sobre las tarjetas", async () => {
    const t = (await pagina.textContent("#regla")).replace(/\s+/g, " ");
    assert.match(t, /0.*2.*5.*10.*20.*30 \+/);
  });
  await prueba("Conteos 30 · 30 · 30 · 30 · 29; Total 150 causas · 149 personas", async () => {
    assert.deepStrictEqual(await Promise.all(["", "n1", "n2", "n3", "n4", "n5"].map(numeroTarjeta)), [150, 30, 30, 30, 30, 29]);
    assert.match(await tarjeta("").textContent(), /causas · 149 personas/);
  });
  await prueba("Tarjetas como botones: uno, varios y Total", async () => {
    await tarjeta("n5").click();
    assert.strictEqual(await total(), 29);
    assert.ok((await nivelesVisibles()).every((n) => n === "n5"));
    await tarjeta("n4").click();
    assert.strictEqual(await total(), 59);
    assert.strictEqual(await pagina.inputValue("#f-nivel"), "varios");
    await tarjeta("").click();
    assert.strictEqual(await total(), 150);
  });
  await prueba("Franja de cada tarjeta con el tono oscuro de su nivel (visible sobre blanco)", async () => {
    const borde = await tarjeta("n1").evaluate((e) => getComputedStyle(e, "::before").borderRightColor);
    assert.strictEqual(borde, "rgb(143, 122, 0)");
  });
  await prueba("Colores de los 5 niveles y límites exactos 2/5/10/20/30 años", async () => {
    for (const [n, color] of Object.entries(COLORES)) {
      const c = await pagina.locator(`#cuerpo-tabla .nivel[data-nivel="${n}"]`).first().evaluate((e) => getComputedStyle(e).backgroundColor);
      assert.strictEqual(c, color, n);
    }
    const esperado = { "CP-FIC-100": "n1", "CP-FIC-101": "n2", "CP-FIC-102": "n3", "CP-FIC-103": "n4", "CP-FIC-104": "n5" };
    for (const [causa, n] of Object.entries(esperado)) {
      await escribir(causa + "/");
      assert.deepStrictEqual(await nivelesVisibles(), [n], causa);
    }
    await limpiar();
  });
  await prueba("Sin fecha de AFP: indicador gris 'S/D' al final de la lista", async () => {
    assert.strictEqual(await filas().last().locator(".nivel").getAttribute("data-nivel"), "sd");
  });

  console.log("\nPRÓXIMOS A CAMBIAR DE NIVEL");
  await prueba(`Cuenta ${PROX90} casos a 90 días y ${PROX30} a 30 días`, async () => {
    assert.strictEqual(Number(await pagina.textContent("#proximos-total")), PROX90);
    await pagina.selectOption("#f-horizonte", "30");
    assert.strictEqual(Number(await pagina.textContent("#proximos-total")), PROX30);
    await pagina.selectOption("#f-horizonte", "90");
  });
  await prueba("VER ESTOS CASOS filtra la tabla y cada fila dice cuándo cambia", async () => {
    await pagina.click("#btn-proximos");
    assert.strictEqual(await total(), PROX90);
    assert.strictEqual(await pagina.getAttribute("#btn-proximos", "aria-pressed"), "true");
    const cambios = await pagina.locator("#cuerpo-tabla .cambio").allTextContents();
    assert.ok(cambios.length === PROX90 && cambios.every((t) => /^(Pasa a Nivel \d|Cumple 30 años) el \d\d\/\d\d\/\d{4}$/.test(t)));
    await pagina.click("#btn-proximos");
    assert.strictEqual(await total(), 150);
  });

  console.log("\nBUSCADOR Y FILTROS");
  await prueba("4. Busca por nombre, expediente, causa, juzgado, entidad, lugar y etapa", async () => {
    await escribir("jose luis hernandez ruiz");
    assert.strictEqual(await total(), 2);
    await escribir(R[5].expediente);
    assert.strictEqual(await total(), 1);
    await escribir("nuevo leon");
    assert.strictEqual(await total(), cuenta((r) => r.entidad === "Nuevo León"));
    await escribir("reposicion del procedimiento");
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-etapa").allTextContents()).every((t) => t === "Reposición del procedimiento"));
    await limpiar();
  });
  await prueba("MÁS FILTROS muestra los filtros secundarios e indica cuántos están activos", async () => {
    if (await pagina.isVisible("#f-etapa")) await pagina.click("#btn-mas-filtros");
    assert.ok(await pagina.isHidden("#f-etapa"));
    await pagina.click("#btn-mas-filtros");
    assert.ok(await pagina.isVisible("#f-etapa"));
    assert.strictEqual(await pagina.getAttribute("#btn-mas-filtros", "aria-expanded"), "true");
    const etapas = await pagina.locator("#f-etapa option").allTextContents();
    assert.deepStrictEqual(etapas.slice(1), L.ETAPAS);
    await pagina.selectOption("#f-etapa", "Conclusiones");
    assert.match(await pagina.textContent("#btn-mas-filtros"), /\(1 ACTIVOS\)/);
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-etapa").allTextContents()).every((t) => t === "Conclusiones"));
    await limpiar();
  });
  await prueba("5. Dependencia Entidad → Circuito → Juzgado", async () => {
    await pagina.selectOption("#f-entidad", "Veracruz");
    assert.deepStrictEqual(await pagina.locator("#f-circuito option").allTextContents(), ["Todos", "Séptimo Circuito"]);
    assert.strictEqual(await pagina.locator("#f-juzgado option").count(), 4);
    await pagina.selectOption("#f-entidad", "Sonora");
    assert.strictEqual(await pagina.inputValue("#f-juzgado"), "");
    await limpiar();
  });
  await prueba("6. Combinados: nivel + etapa + motivo + texto; LIMPIAR restablece todo", async () => {
    await tarjeta("n5").click();
    await abrirMas();
    await pagina.selectOption("#f-etapa", L.ETAPAS[5]);
    const n = await total();
    assert.ok(n > 0 && n < 29);
    await pagina.selectOption("#f-motivo", "Solo por esta causa federal");
    assert.ok((await total()) <= n);
    await pagina.fill("#f-nombre", "zzz");
    await pagina.click("#btn-buscar");
    assert.strictEqual(await total(), 0);
    assert.ok(await pagina.isVisible("#vacio"));
    await pagina.click("#btn-limpiar-vacio");
    assert.strictEqual(await total(), 150);
    assert.strictEqual(await tarjeta("n5").getAttribute("aria-pressed"), "false");
  });

  console.log("\nORDEN");
  await prueba("Orden inicial: más antiguos primero; ordenar por nombre", async () => {
    assert.strictEqual(await pagina.getAttribute("th[data-clave=antiguedad]:not([data-nombre])", "aria-sort"), "descending");
    assert.match(await filas().first().locator("td.col-causa").textContent(), /CP-FIC-104\/1996/);
    await pagina.click("th[data-clave=nombre] button");
    const nombres = (await pagina.locator("#cuerpo-tabla td.col-nombre").evaluateAll((t) => t.map((x) => x.firstChild.textContent)));
    assert.deepStrictEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })));
    await pagina.click("th[data-clave=antiguedad]:not([data-nombre]) button");
  });

  console.log("\nFICHA EMERGENTE");
  const rubros = ["Nombre de la PPL", "ID de persona", "Causa penal vigente", "Expediente", "Circuito judicial", "Entidad federativa",
    "Reclusión", "Juzgado de Distrito radicador", "Motivo de la privación de libertad", "Antigüedad y etapa procesal",
    "Fecha de auto de formal prisión", "Etapa procesal", "Delitos / materia del proceso",
    "Último acto procesal / reseña jurisdiccional", "Fecha del último acto", "Instancia actual", "Observaciones"];
  await prueba("9. El ojo abre la ficha correcta con todos los rubros y título de pestaña", async () => {
    await escribir("CP-FIC-104/");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    const texto = await pagina.textContent("#detalle-cuerpo");
    for (const r of rubros) assert.ok(texto.includes(r), "Falta " + r);
    assert.match(await pagina.textContent("#detalle-nivel"), /NIVEL 5 · DE 20 A 30 AÑOS/);
    assert.match(texto, /Cumple 30 años el 02\/10\/2026/);
    assert.match(await pagina.title(), /^Causa CP-FIC-104\/1996/);
    if (CAPTURAS) await pagina.screenshot({ path: path.join(CAPTURAS, "ficha.png") });
    await pagina.click("#btn-x");
    await pagina.waitForFunction(() => document.title === "CAUSAS PENALES PPL");
  });
  await prueba("Ficha v4: alertas con fundamento, datos procesales y revisión de la medida", async () => {
    await escribir("CP-FIC-105/2024");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    const alertas = await pagina.locator("#ficha-alertas li").allTextContents();
    assert.ok(alertas.length === 1 && /5 días hábiles.*Fundamento: CFPP, arts\. 368 y 360, fracc\. I/.test(alertas[0]), alertas.join(" | "));
    const texto = await pagina.textContent("#detalle-cuerpo");
    for (const r of ["Datos procesales", "Tipo de procedimiento", "Inicio de la averiguación previa",
      "Revisión de la prisión preventiva (quinto transitorio, DOF 17-06-2016)"]) assert.ok(texto.includes(r), "Falta " + r);
    await pagina.click("#btn-cerrar");
    await escribir("CP-FIC-101/2021");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    assert.strictEqual(await pagina.locator("#ficha-alertas").count(), L.alertas(R.find((r) => r.causa === "CP-FIC-101/2021"), RELOJ).length ? 1 : 0);
    await pagina.click("#btn-cerrar");
    await limpiar();
  });
  await prueba("Coimputados: la ficha los indica y VER COIMPUTADOS filtra la causa", async () => {
    await escribir("CP-FIC-140/1997");
    assert.strictEqual(await total(), 3);
    await limpiar();
    await escribir("CP-FIC-140/1997");
    await pagina.locator("#cuerpo-tabla .boton-ojo").first().click();
    assert.match(await pagina.textContent("#detalle-cuerpo"), /Esta causa tiene 2 PPL más en seguimiento/);
    await pagina.click("#btn-coimputados");
    assert.ok(!(await pagina.isVisible("#detalle")));
    assert.strictEqual(await total(), 3);
    assert.strictEqual(await pagina.inputValue("#f-causa"), "CP-FIC-140/1997");
    await limpiar();
  });
  await prueba("La pena (no firme) solo aparece como dato informativo cuando hay sentencia", async () => {
    await escribir("CP-FIC-100/");
    await pagina.click("#cuerpo-tabla .boton-ojo");
    assert.ok(!(await pagina.textContent("#detalle-cuerpo")).includes("Dato informativo"));
    await pagina.click("#btn-cerrar");
    await limpiar();
    await abrirMas();
    await pagina.selectOption("#f-etapa", L.ETAPAS[5]);
    await pagina.locator("#cuerpo-tabla .boton-ojo").first().click();
    assert.match(await pagina.textContent("#detalle-cuerpo"), /Dato informativo:.*no firme/);
    await pagina.click("#btn-cerrar");
    await limpiar();
  });
  await prueba("10. Se cierra con la X, con CERRAR, con clic fuera y con Esc", async () => {
    const ojo = pagina.locator("#cuerpo-tabla .boton-ojo").first();
    await ojo.click(); await pagina.click("#btn-x");
    assert.ok(!(await pagina.isVisible("#detalle")));
    await ojo.click(); await pagina.click("#btn-cerrar");
    assert.ok(!(await pagina.isVisible("#detalle")));
    await ojo.click(); await pagina.mouse.click(10, 10);
    assert.ok(!(await pagina.isVisible("#detalle")));
    await ojo.click(); await pagina.keyboard.press("Escape");
    assert.ok(!(await pagina.isVisible("#detalle")));
  });
  await prueba("Homonimias: dos ojos del mismo nombre abren causas distintas", async () => {
    await escribir("Juan Pablo Ramírez Soto");
    const causas = [];
    for (let i = 0; i < 2; i++) {
      await pagina.locator("#cuerpo-tabla .boton-ojo").nth(i).click();
      causas.push((await pagina.textContent("#detalle-cuerpo")).match(/CP-FIC-\d+\/\d{4}/)[0]);
      await pagina.click("#btn-cerrar");
    }
    assert.notStrictEqual(causas[0], causas[1]);
    await limpiar();
  });

  console.log("\nRESUMEN POR ENTIDAD Y JUZGADO");
  await prueba("Resumen por entidad: 10 renglones, suma 150 y frase de concentración", async () => {
    await pagina.click("#vista-resumen");
    assert.ok(await pagina.isHidden("#resultados"));
    assert.strictEqual(await pagina.locator("#cuerpo-resumen tr").count(), 10);
    const totales = await pagina.locator("#cuerpo-resumen tr").evaluateAll((t) => t.map((r) => Number(r.children[7].textContent)));
    assert.strictEqual(totales.reduce((a, b) => a + b, 0), 150);
    assert.match(await pagina.textContent("#resumen-titular"), /^Las 5 entidades con más casos de 10 años o más reúnen \d+ de 59 \(\d+ %\)\.$/);
    const etiqueta = await pagina.locator("#cuerpo-resumen .distribucion").first().getAttribute("aria-label");
    assert.match(etiqueta, /Nivel 1: \d+, Nivel 2: \d+, Nivel 3: \d+, Nivel 4: \d+, Nivel 5: \d+/);
  });
  await prueba("La cifra visible '10 años o más' coincide con el orden", async () => {
    const v = await pagina.locator("#cuerpo-resumen tr").evaluateAll((t) => t.map((r) => Number(r.children[6].textContent.split(" ")[0])));
    assert.ok(v.every((x, i) => i === 0 || v[i - 1] >= x));
  });
  await prueba("Por juzgado y VER CAUSAS lleva al listado filtrado", async () => {
    await pagina.click("#resumen-juzgado");
    assert.match(await pagina.textContent("#resumen-titular"), /^Los 5 juzgados/);
    const juzgado = await pagina.locator("#cuerpo-resumen tr").first().locator(".principal").textContent();
    const n = Number(await pagina.locator("#cuerpo-resumen tr").first().locator("td").nth(7).textContent());
    await pagina.locator("#cuerpo-resumen tr").first().locator("button").click();
    assert.ok(await pagina.isVisible("#resultados"));
    assert.strictEqual(await total(), n);
    assert.ok((await pagina.locator("#cuerpo-tabla td.col-juzgado").allTextContents()).every((t) => t === juzgado));
    await limpiar();
  });

  console.log("\nCOMPARATIVO CONTRA EL CORTE ANTERIOR");
  await prueba("Cargar el corte anterior: 3 altas, 9 bajas con motivo, 5 cambios de etapa y niveles", async () => {
    await pagina.setInputFiles("#archivo-anterior", path.join(RAIZ, "datos/corte_anterior_ficticio.csv"));
    await pagina.waitForSelector("#comparativo:not([hidden])");
    const cifras = await pagina.locator("#comparativo .cifra strong").allTextContents();
    assert.deepStrictEqual(cifras.slice(0, 3), ["3", "9", "5"]);
    assert.ok(Number(cifras[3]) > 0);
    assert.match(await pagina.textContent("#comparativo"), /Corte anterior: 1 de septiembre de 2026/);
    const bajas = pagina.locator("#comparativo details").nth(1);
    await bajas.locator("summary").click();
    const lista = await bajas.locator("li").allTextContents();
    assert.strictEqual(lista.filter((t) => t.includes("Sentencia ejecutoriada")).length, 2);
    assert.strictEqual(lista.filter((t) => t.includes("amparo directo en trámite")).length, 3);
    assert.strictEqual(lista.filter((t) => t.includes("Ya no aparece en el corte actual")).length, 2);
  });
  await prueba("El ojo de una alta abre su ficha; QUITAR COMPARATIVO lo oculta", async () => {
    const altas = pagina.locator("#comparativo details").first();
    await altas.locator("summary").click();
    await altas.locator(".boton-ojo").first().click();
    assert.ok(await pagina.isVisible("#detalle"));
    await pagina.click("#btn-cerrar");
    await pagina.click("#btn-quitar-comparativo");
    assert.ok(await pagina.isHidden("#comparativo"));
  });

  console.log("\nEXPORTAR, CARGA DE CSV Y PRIVACIDAD");
  await prueba("Exportar vista: clasificación, corte y filtros al inicio; luego la tabla", async () => {
    await tarjeta("n5").click();
    const [descarga] = await Promise.all([pagina.waitForEvent("download"), pagina.click("#btn-exportar")]);
    const lineas = fs.readFileSync(await descarga.path(), "utf8").replace(/^﻿/, "").split(/\r\n/);
    assert.match(lineas[0], /Información confidencial/);
    assert.match(lineas[1], /Corte de datos: 01\/10\/2026.*filtros: niveles: N5/);
    assert.match(lineas[3], /^Nivel de antigüedad,Antigüedad,Próximo cambio de nivel,Alertas,ID,ID de persona,Nombre completo/);
    assert.strictEqual(lineas.length - 4, 29);
    await limpiar();
  });
  await prueba("Cargar CSV propio (columnas mínimas): baja y amparo a sus avisos, más de 30 años en rojo", async () => {
    const csv = "ID;Nombre completo;Causa penal;Fecha de auto de formal prisión;Etapa procesal;Fecha de ejecutoria;Fecha de corte\n" +
      "1;Persona Ficticia Uno;CP-X-1;10/05/1990;Segunda instancia (apelación);;15/09/2026\n" +
      "2;Persona Ficticia Dos;CP-X-2;01/02/2025;Instrucción;;15/09/2026\n" +
      "3;Persona Ficticia Tres;CP-X-3;01/02/2010;Sentencia ejecutoriada;15/09/2026;15/09/2026\n" +
      "4;=HIPERVINCULO(\"x\");CP-X-4;01/02/2012;Amparo directo;;15/09/2026\n";
    await pagina.setInputFiles("#archivo-csv", { name: "prueba.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await esperarTotal(2);
    assert.match(await pagina.textContent("#aviso-bajas summary"), /1 registro debe darse de baja/);
    assert.match(await pagina.textContent("#aviso-amparos summary"), /1 causa tiene sentencia definitiva/);
    assert.deepStrictEqual(errores, []);
    assert.match(await pagina.textContent("#texto-corte"), /15 de septiembre de 2026/);
    assert.strictEqual((await filas().first().locator(".nivel").textContent()).trim(), "N5 +30");
    await pagina.click("#btn-recargar");
    await esperarTotal(150);
  });
  await prueba("Robustez: un CSV vacío o sin columnas indispensables se rechaza y se conservan los datos", async () => {
    await pagina.setInputFiles("#archivo-csv", { name: "vacio.csv", mimeType: "text/csv", buffer: Buffer.from("") });
    await pagina.waitForFunction(() => /vacio\.csv.*no contiene filas/.test(document.getElementById("avisos-datos").textContent));
    assert.strictEqual(await total(), 150);
    await pagina.setInputFiles("#archivo-csv", { name: "otra.csv", mimeType: "text/csv", buffer: Buffer.from("A;B\n1;2\n") });
    await pagina.waitForFunction(() => /otra\.csv.*Causa penal.*Se conservan los datos actuales/.test(document.getElementById("avisos-datos").textContent));
    assert.strictEqual(await total(), 150);
    await pagina.setInputFiles("#archivo-anterior", { name: "mal.csv", mimeType: "text/csv", buffer: Buffer.from("A;B\n1;2\n") });
    await pagina.waitForFunction(() => /mal\.csv/.test(document.getElementById("avisos-datos").textContent));
    assert.ok(await pagina.isHidden("#comparativo"));
    assert.deepStrictEqual(errores, []);
    await pagina.click("#btn-recargar");
    await esperarTotal(150);
  });
  await prueba("Texto capturado con etiquetas HTML se muestra como texto (sin inyección)", async () => {
    const csv = "ID;Nombre completo;Causa penal;Fecha de auto de formal prisión;Etapa procesal\n" +
      '1;<img src=x onerror="window.__xss=1">;CP-X-9;01/02/2020;Instrucción\n';
    await pagina.setInputFiles("#archivo-csv", { name: "xss.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await esperarTotal(1);
    assert.strictEqual(await pagina.locator("#cuerpo-tabla img").count(), 0);
    assert.strictEqual(await pagina.evaluate(() => window.__xss), undefined);
    assert.match(await pagina.textContent("#cuerpo-tabla"), /<img src=x/);
    await pagina.click("#btn-recargar");
    await esperarTotal(150);
  });

  console.log("\nMODO OSCURO, ZOOM Y RED");
  await prueba("Modo oscuro automático según el sistema (sin botón propio)", async () => {
    const p = await contexto.newPage();
    vigilar(p);
    await p.emulateMedia({ colorScheme: "dark" });
    await p.goto(URL_APP);
    await p.waitForSelector("#cuerpo-tabla tr");
    const c = await p.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.body).color]);
    assert.deepStrictEqual(c, ["rgb(14, 20, 32)", "rgb(242, 245, 249)"]);
    if (CAPTURAS) await p.screenshot({ path: path.join(CAPTURAS, "oscuro.png") });
    await p.close();
  });
  await prueba("Zoom al 200 % (720 px): sin desborde y ficha a pantalla completa", async () => {
    const p = await contexto.newPage();
    vigilar(p);
    await p.setViewportSize({ width: 720, height: 500 });
    await p.goto(URL_APP);
    await p.waitForSelector("#cuerpo-tabla tr");
    assert.ok((await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    await p.locator("#cuerpo-tabla .boton-ojo").first().click();
    const caja = await p.locator("#detalle").boundingBox();
    assert.ok(caja.width >= 719 && caja.height >= 499, JSON.stringify(caja));
    await p.close();
  });
  await prueba("13. Ninguna solicitud a servicios externos", async () => {
    const externas = solicitudes.filter((u) => !/^(file:|data:|blob:|about:)/.test(u) && !u.startsWith(new URL(URL_APP).origin));
    assert.deepStrictEqual(externas, []);
    assert.deepStrictEqual(errores, []);
  });

  if (CAPTURAS) await pagina.screenshot({ path: path.join(CAPTURAS, "inicio.png") });
  console.log(`\n${ok} pruebas superadas${process.exitCode ? " — HAY FALLAS" : ""}\n`);
  await navegador.close();
})();
