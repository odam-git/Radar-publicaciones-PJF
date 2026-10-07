# CAUSAS PENALES PPL

Sistema de consulta y seguimiento de **personas en prisión preventiva en causas del sistema penal tradicional federal (Código Federal de Procedimientos Penales) sin sentencia ejecutoriada** — prototipo funcional con datos 100 % ficticios. Versión 4.

Aplicación web estática que se ejecuta en la propia computadora. No requiere Internet, no instala nada, no usa servicios externos (ni fuentes tipográficas, ni analítica, ni IA) y no envía información a ningún servidor.

---

## 1. Cómo abrirla

### Opción A — Doble clic (la más sencilla)
1. Descargue la carpeta `causas-penales-ppl` completa.
2. Abra `index.html` con doble clic (Chrome, Edge o Firefox).

Funciona sin Internet. Los datos se leen de `datos/datos_ppl_ficticios.js`, una copia del CSV.

### Para compartir: un solo archivo
`CAUSAS_PENALES_PPL.html` contiene la aplicación completa (diseño, código y los datos ficticios). Se envía por correo o WhatsApp y quien lo recibe solo lo descarga y le da doble clic. Se recomienda abrirlo en computadora. Para regenerarlo tras cambiar datos o código:
```
python herramientas/empaquetar_un_archivo.py
```

### Opción B — Servidor local (lee el CSV directamente)
Útil cuando se quiera actualizar la hoja y pulsar **Recargar datos** sin regenerar nada.

- **Windows:** doble clic en `iniciar_servidor_local.bat` (requiere Python).
- **Cualquier sistema:** en una terminal, dentro de la carpeta:
  ```
  python -m http.server 8000 --bind 127.0.0.1
  ```
  y abrir `http://127.0.0.1:8000/`.

`--bind 127.0.0.1` hace que el servidor solo sea visible desde esa computadora.

---

## 2. Estructura

```
causas-penales-ppl/
├── CAUSAS_PENALES_PPL.html     Versión de un solo archivo, para compartir
├── index.html                  Interfaz (estructura de la pantalla)
├── css/estilos.css             Diseño accesible (texto grande, alto contraste)
├── js/
│   ├── config.js               ÚNICO archivo a editar: fuente de datos y privacidad
│   ├── datos.js                Capa de datos: lee CSV/copia embebida, normaliza, seudonimiza
│   ├── logica.js               Procesamiento: semáforo de antigüedad, búsqueda, filtros, orden, revisión
│   └── interfaz.js             Pinta tarjetas, filtros, tabla, avisos y ficha (no contiene registros)
├── datos/
│   ├── datos_ppl_ficticios.csv   Fuente principal (150 en seguimiento + 4 bajas + 3 amparos directos de prueba)
│   ├── corte_anterior_ficticio.csv  Corte del mes anterior, para probar el comparativo
│   ├── datos_ppl_ficticios.xlsx  Misma información en Excel
│   └── datos_ppl_ficticios.js    Copia para el modo doble clic (generada)
├── herramientas/
│   ├── generar_datos_ficticios.py  Genera los registros ficticios
│   ├── csv_a_js.py                 Convierte un CSV/Excel en la copia embebida
│   ├── empaquetar_un_archivo.py    Genera CAUSAS_PENALES_PPL.html (versión de un solo archivo)
│   └── generar_plantilla.py        Genera la plantilla de captura en Excel
├── plantillas/
│   └── plantilla_captura_ppl.xlsx  Hoja para los juzgados, con listas desplegables e instrucciones
├── pruebas/
│   ├── pruebas_logica.js        62 pruebas de datos y lógica (Node)
│   └── pruebas_interfaz.js      43 pruebas en navegador real (Playwright)
└── iniciar_servidor_local.bat
```

Flujo: **fuente de datos → `datos.js` (lectura y normalización) → `logica.js` (filtros/búsqueda) → `interfaz.js` (tarjetas y tabla) → ficha emergente.**

---

## 3. Reglas de funcionamiento

**Universo:** personas en prisión preventiva en causas tramitadas conforme al **CFPP** (sistema tradicional) **sin sentencia ejecutoriada**. Fundamento: el proceso penal federal comprende la primera y la segunda instancia (art. 4o CFPP); la sentencia de segunda instancia es irrevocable (art. 360, fracc. II); los procedimientos iniciados antes del sistema acusatorio se concluyen conforme a las disposiciones anteriores (transitorio Cuarto del decreto constitucional DOF 18-06-2008).

**Semáforo de antigüedad**, contado desde la **Fecha de auto de formal prisión** hasta hoy (se calcula solo). Cada rango incluye su límite superior:

| Nivel | Antigüedad | Color |
|---|---|---|
| 1 | Hasta 2 años | Amarillo claro |
| 2 | Más de 2 y hasta 5 años | Amarillo fuerte |
| 3 | Más de 5 y hasta 10 años | Naranja claro |
| 4 | Más de 10 y hasta 20 años | Naranja fuerte |
| 5 | Más de 20 y hasta 30 años | Rojo |

- **Más de 30 años:** se queda en Rojo con la leyenda "Más de 30 años" (preparado; hoy no hay casos).
- **Sin fecha, fecha inválida o futura:** indicador gris "S/D", al final de la lista y en el aviso de revisión.
- Cada indicador lleva número de nivel y texto, no solo color.
- Las **tarjetas superiores** son botones: se pueden activar uno o varios niveles y se combinan con los demás filtros.

**Fuera del seguimiento** (no aparecen en tabla ni conteos; cada grupo tiene su propio aviso con la lista):
- **Bajas** (aviso rojo): etapa "Sentencia ejecutoriada", *Fecha de ejecutoria* capturada o *Motivo de baja* capturado. Catálogo de motivos: sentencia ejecutoriada (art. 360 CFPP), libertad provisional bajo caución (art. 399), desvanecimiento de datos (art. 422), sobreseimiento (art. 298), conclusiones no acusatorias (art. 291), cese o sustitución de la medida (quinto transitorio, DOF 17-06-2016), amparo directo promovido (art. 170 Ley de Amparo) y otro.
- **Amparo directo** (aviso morado): la sentencia definitiva ya existe y la persona queda a disposición del Tribunal Colegiado (arts. 170 y 191 Ley de Amparo; art. 107, fracc. V, CPEUM).

**Etapas procesales (catálogo literal del CFPP):** Instrucción · Instrucción agotada / cerrada · Conclusiones · Audiencia de vista / citado para sentencia · Sentencia de primera instancia (plazo para apelar) · Segunda instancia (apelación) · Reposición del procedimiento · Procedimiento suspendido (art. 468). Una etapa fuera del catálogo se señala en el aviso de revisión.

**Alertas de plazo** (indican qué verificar; no sustituyen la revisión del expediente; los días hábiles excluyen sábados y domingos, no los inhábiles oficiales). Se apoyan en el art. 17, segundo párrafo, de la CPEUM (justicia pronta):

| Alerta | Condición | Fundamento |
|---|---|---|
| Instrucción ordinaria | Más de 10 meses desde el auto de formal prisión | CFPP, art. 147 |
| Instrucción sumaria | Más de 30 días desde el auto de formal prisión | CFPP, art. 152, inciso b) |
| Conclusiones | Más de 60 días hábiles desde el cierre de instrucción | CFPP, art. 291 |
| Audiencia de vista | Más de 30 días hábiles sin sentencia | CFPP, art. 97 |
| Sentencia de primera instancia | Más de 5 días hábiles: verificar si se apeló o causó ejecutoria | CFPP, arts. 368 y 360, fracc. I |

**Verificar sistema aplicable:** si la *Fecha de inicio de la averiguación previa* es igual o posterior a la entrada en vigor del Código Nacional en la entidad del juzgado, la causa se marca para verificar que corresponda al sistema tradicional. Fechas tomadas de las declaratorias publicadas en el DOF:

| Declaratoria (DOF) | Entrada en vigor | Entidades |
|---|---|---|
| 24/09/2014 | 24/11/2014 | Durango, Puebla |
| 12/12/2014 | 16/03/2015 | Yucatán, Zacatecas |
| 29/04/2015 | 01/08/2015 | Baja California Sur, Guanajuato, Querétaro, San Luis Potosí |
| 25/09/2015 | 30/11/2015 | Chiapas, Chihuahua, Coahuila, Nayarit, Oaxaca, Sinaloa, Tlaxcala |
| 25/09/2015 | 29/02/2016 | Aguascalientes, Colima, Estado de México, Hidalgo, Morelos, Nuevo León, Quintana Roo, Tabasco, Ciudad de México |
| 26/02/2016 | 29/04/2016 | Campeche, Michoacán, Sonora, Veracruz |
| 26/02/2016 | 14/06/2016 | Baja California, Guerrero, Jalisco, Tamaulipas y el resto del territorio |

La tabla muestra una marca ⚠ con el número de alertas; la ficha las enlista con su fundamento; el filtro *Alerta* (en MÁS FILTROS) y los botones *VER ESTOS CASOS* de los avisos las filtran.

**Revisión de la prisión preventiva:** la ficha muestra si se solicitó, la fecha y el resultado (quinto transitorio del decreto DOF 17-06-2016).

**Pena:** no aparece en tabla, filtros ni colores. Solo se muestra como **dato informativo** en la ficha cuando hay sentencia de primera instancia no firme (etapas de sentencia de primera instancia o segunda instancia) (se puede quitar con `mostrarPenaNoFirme: false` en `config.js`).

**Exportar vista:** descarga en la computadora un CSV con lo que esté filtrado, incluida la columna *Alertas* con su fundamento (no sube nada). Los textos que empiezan con `=`, `+`, `-` o `@` se anteponen con un apóstrofo para que Excel no los ejecute como fórmula.

**Buscador:** no distingue mayúsculas ni acentos ("nuevo leon" = "Nuevo León"). Si la frase escrita aparece completa en algún campo, muestra exactamente esas coincidencias; si no, combina palabras ("lopez jalisco" encuentra a López en Jalisco). Funciona junto con los filtros.

**Filtros dependientes:** Entidad → Circuito → Juzgado → (sugerencias de Causa y Nombre).

**Motivo de la privación de libertad:** catálogo de 5 opciones (solo por esta causa federal; también por otra causa federal; también por proceso local; solo por proceso local; compurga pena por otra causa). Cuando no es "solo por esta causa", la fila muestra una etiqueta (p. ej. "Reclusión por proceso local") y un aviso azul cuenta los casos de reclusión solo por proceso local.

**Próximos a cambiar de nivel:** cuenta y filtra a quienes cumplirán 2, 5, 10, 20 o 30 años en los próximos 30, 90 o 180 días. Como cada rango incluye su límite, el cambio ocurre el día siguiente al aniversario.

**Comparativo contra el corte anterior:** botón *COMPARAR CON CORTE ANTERIOR* → elegir el CSV del mes pasado. Muestra altas, bajas (con su motivo: el capturado en *Motivo de baja*, amparo directo en trámite o "ya no aparece en el corte actual"), cambios de etapa y quienes subieron de nivel. La llave de comparación es *ID de persona + causa + juzgado*.

**Resumen por entidad y juzgado:** tabla con los casos por nivel, "X de Y" con 10 años o más (la cifra que define el orden), total y una barra de distribución; la frase superior indica cuánto concentran los 5 primeros. *VER CAUSAS* lleva al listado filtrado. Respeta los filtros aplicados.

**Personas y causas:** cada renglón es una causa por persona; la tarjeta Total muestra causas y personas (por *ID de persona*). La ficha avisa si la causa tiene coimputados y permite verlos.

**Fecha de corte y clasificación:** la fecha de corte se toma de la columna *Fecha de corte* (o de `config.js`). La leyenda de clasificación (`clasificacion` en `config.js`) aparece en el encabezado, la impresión y los archivos exportados.

**Diseño y accesibilidad (revisión con las habilidades *apple-design* e *impeccable-design*):** escala tipográfica de 4 tamaños, espaciado en retícula de 8 px, transiciones breves que se desactivan con "reducir movimiento", texto base en porcentaje (crece con la letra del navegador), anillo de foco doble visible en fondo claro y oscuro, modo oscuro automático según el sistema (contraste de texto ≥ 7:1), ficha a pantalla completa en pantallas angostas o con zoom alto, filtros secundarios en *MÁS FILTROS*, filas alternadas y botones en mayúsculas.

---

## 4. Sustituir los datos ficticios por un Excel/CSV

**Plantilla para los juzgados:** `plantillas/plantilla_captura_ppl.xlsx` trae los encabezados exactos, listas desplegables (entidad, tipo de procedimiento, etapa, motivo, situación de la otra causa, revisión de la medida y motivo de baja), validación de fechas y pena, una hoja de instrucciones y un renglón de ejemplo. Al terminar, se guarda como *CSV UTF-8* y se carga en la aplicación.

La hoja debe conservar los encabezados (se toleran diferencias de acentos y mayúsculas):

`ID · ID de persona · Nombre completo · Expediente · Causa penal · Delito(s) · Entidad Federativa · Circuito · Juzgado de Distrito · Lugar de reclusión · Motivo de la privación de libertad · Otra causa: autoridad · Otra causa: situación · Fecha de inicio de la averiguación previa · Fecha de auto de formal prisión · Tipo de procedimiento · Etapa procesal · Instancia actual · Fecha de cierre de instrucción · Fecha de la audiencia de vista · Último acto procesal · Fecha del último acto procesal · Fecha de sentencia de primera instancia · Pena impuesta (no firme) · Revisión de la medida: solicitada · Revisión de la medida: fecha · Revisión de la medida: resultado · Fecha de ejecutoria · Motivo de baja · Fecha de corte · Observaciones`

- Son opcionales: *ID de persona* (recomendado), los datos de la otra causa, las fechas procesales (inicio de la averiguación previa, cierre, audiencia, último acto, sentencia), pena, revisión de la medida, ejecutoria, motivo de baja y fecha de corte. Sin ellas, la app funciona y simplemente no calcula la alerta correspondiente.
- Un archivo vacío o sin las columnas indispensables (*Causa penal* y *Fecha de auto de formal prisión*) **se rechaza** con un aviso y se conservan los datos que ya estaban en pantalla.
- *Fechas:* `AAAA-MM-DD` o `DD/MM/AAAA`.

Tres formas, de la más rápida a la más permanente:

1. **Prueba inmediata:** botón **Cargar archivo CSV** → elegir el archivo. Se lee en el navegador, no se sube a ningún lugar y no se guarda (al recargar vuelven los datos configurados). En Excel: *Archivo → Guardar como → CSV UTF-8*. Se aceptan CSV con coma o con punto y coma.
2. **Con servidor local (opción B):** sustituir `datos/datos_ppl_ficticios.csv` (o cambiar `rutaCSV` en `js/config.js`) y pulsar **Recargar datos**. Cada vez que se actualice el Excel, basta con volver a guardar el CSV y recargar.
3. **Con doble clic (opción A):** regenerar la copia embebida:
   ```
   python herramientas/csv_a_js.py ruta/archivo.csv
   python herramientas/csv_a_js.py ruta/archivo.xlsx    (requiere: pip install openpyxl)
   ```
   y recargar la página.

Al pasar a datos reales, cambie `esFicticia: false` en `js/config.js` y ajuste nombres de archivo.

---

## 5. Futura conexión con Google Sheets (no activa)

La capa de datos ya tiene el punto de entrada `leerGoogleSheets()` y la opción `tipo: "google-sheets"` en `config.js`; hoy está **deshabilitada a propósito**. Como `datos.js` ya sabe leer CSV, conectar Sheets consistiría en obtener la hoja en formato CSV y pasarla por el mismo proceso. Caminos posibles:

- **Exportación CSV de una hoja publicada** — la más sencilla, pero **no recomendable con datos personales**: "Publicar en la web" deja la hoja accesible para cualquiera que tenga el enlace.
- **Apps Script como servicio web restringido** a cuentas del dominio institucional, que entregue solo las columnas necesarias.
- **API de Google Sheets con inicio de sesión (OAuth)** — control por usuario, pero requiere registrar la aplicación y deja de ser 100 % local.

**¿Es mejor Google Sheets para la actualización automática?** Sí en comodidad: varias personas editan una hoja y la app ve los cambios al recargar, sin copiar archivos. A cambio, los datos quedan en un servicio de terceros y la app necesita Internet. Con información de PPL, el Excel/CSV local (o un servidor institucional interno) es la opción más conservadora; la decisión debe tomarla el área competente.

---

## 6. Privacidad y seguridad

**Ya implementado en este prototipo**
- Datos 100 % ficticios. Expedientes y causas con prefijo `FIC`; nombres armados al azar a partir de listas del generador; lugares marcados "(ficticio)". Cualquier coincidencia con una persona real sería fortuita.
- Política de seguridad de contenido (CSP) en `index.html`: el navegador **bloquea** cualquier conexión a dominios externos.
- Sin CDN, sin fuentes de Internet, sin analítica, sin cookies, sin almacenamiento en el navegador.
- Datos separados de la interfaz; un solo punto de carga (`DatosPPL.cargarDatos`).
- Los archivos elegidos con "Cargar archivo CSV" se leen en memoria y no se envían a nadie.
- Servidor local restringido a `127.0.0.1`.
- `noindex`, `no-referrer`.

**Preparado (se activa en `config.js`)**
- **Seudonimización:** `seudonimizarNombres: true` sustituye el nombre por `PPL-0001`, etc., en tabla, buscador y detalle.
- **Minimización:** `camposOcultos: ["observaciones", ...]` elimina campos antes de que lleguen a la interfaz.
- **Separación de datos identificativos y operativos:** `MAPA_COLUMNAS` (en `datos.js`) marca qué columnas son identificativas; base para guardarlos en archivos distintos unidos por ID.

**Medidas técnicas que podrían implementarse con datos reales** (ver Mejoras futuras): control de acceso y perfiles por usuario, restricción por órgano o circuito, registro de accesos, cifrado de los archivos, equipos y carpetas con permisos restringidos, respaldos cifrados.

> Este prototipo **no determina** que una futura base real cumpla la normativa aplicable en materia de protección de datos personales. La configuración definitiva (qué datos se incorporan, quién accede, dónde se almacenan y por cuánto tiempo) deberá validarse conforme a la normativa aplicable y por el área competente.

---

## 7. Pruebas automáticas

```
node pruebas/pruebas_logica.js                         (sin dependencias)
npm install playwright && node pruebas/pruebas_interfaz.js   (navegador real; solo desarrollo)
```

Cubren: 150 registros en seguimiento; nombres, expedientes y causas ficticios; bajas con motivo y amparos directos fuera del seguimiento con sus avisos; alertas de plazo (arts. 147, 152, 291, 97, 368/360) con límites exactos y días hábiles; declaratorias por entidad y alerta de sistema aplicable; ficha con alertas, datos procesales y revisión de la medida; columna Alertas en la exportación; rechazo de archivos vacíos o sin columnas indispensables; texto con etiquetas HTML mostrado como texto (sin inyección); aviso de datos por revisar; semáforo con límites exactos de 2/5/10/20/30 años, más de 30, sin fecha y 29 de febrero; tarjetas-botón (uno o varios niveles); buscador por cada campo; filtros individuales, dependientes y combinados; pena solo informativa; motivo de la privación de libertad y aviso de proceso local; próximos a cambiar de nivel; comparativo contra el corte anterior; resumen por entidad y juzgado; coimputados; personas y causas; fecha de corte y clasificación; exportar vista; botones en mayúsculas; foco visible; modo oscuro; zoom al 200 % con ficha a pantalla completa; ojo → registro correcto (incluidas homonimias); cierre con X, CERRAR, clic fuera y Esc; contador; LIMPIAR FILTROS; orden; encabezado fijo; carga de CSV; ejecución por `file://` y por servidor local; y ausencia de solicitudes externas.

---

## MEJORAS FUTURAS SUGERIDAS

- **Importar Excel directamente** desde el botón (hoy se usa CSV o el script `csv_a_js.py`).
- **Google Sheets / actualización automática**, preferentemente mediante un servicio restringido al dominio institucional.
- **Control de usuarios y permisos** (por ejemplo, ver solo el propio circuito), lo que exige un servidor institucional con autenticación.
- **Auditoría:** bitácora de quién consultó qué registro y cuándo.
- **Seudonimización por defecto** para perfiles que no necesiten el nombre.
- **Cifrado** de los archivos de datos y del equipo; **respaldos** cifrados y periódicos.
- **Exportación** a Excel/PDF de los resultados filtrados, con marca de agua.
- **Alerta por inactividad:** ya se captura la fecha del último acto procesal; falta el aviso de asuntos sin movimiento.
- **Días inhábiles oficiales** en el cómputo de plazos (hoy solo se excluyen sábados y domingos).
- **MODO PRESENTACIÓN** (oculta nombres al instante para proyectar) y **cifrado del archivo de datos con contraseña** (AES-256 con la criptografía del propio navegador, sin Internet).
- **Tarjetas en lugar de tabla en celulares**, enlace que conserve los filtros e impresión con mejor formato.
