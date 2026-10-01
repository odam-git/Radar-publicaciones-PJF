# CAUSAS PENALES PPL

Sistema de consulta y seguimiento de **personas en prisión preventiva oficiosa sin sentencia firme** — prototipo funcional con datos 100 % ficticios.

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
│   ├── datos_ppl_ficticios.csv   Fuente principal (150 en seguimiento + 2 ejecutoriadas de prueba)
│   ├── datos_ppl_ficticios.xlsx  Misma información en Excel
│   └── datos_ppl_ficticios.js    Copia para el modo doble clic (generada)
├── herramientas/
│   ├── generar_datos_ficticios.py  Genera los registros ficticios
│   ├── csv_a_js.py                 Convierte un CSV/Excel en la copia embebida
│   └── empaquetar_un_archivo.py    Genera CAUSAS_PENALES_PPL.html (versión de un solo archivo)
├── pruebas/
│   ├── pruebas_logica.js        36 pruebas de datos y lógica (Node)
│   └── pruebas_interfaz.js      30 pruebas en navegador real (Playwright)
└── iniciar_servidor_local.bat
```

Flujo: **fuente de datos → `datos.js` (lectura y normalización) → `logica.js` (filtros/búsqueda) → `interfaz.js` (tarjetas y tabla) → ficha emergente.**

---

## 3. Reglas de funcionamiento

**Universo:** personas en prisión preventiva oficiosa **sin sentencia firme**.

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

**Sentencia ejecutoriada:** si la etapa dice "ejecutoriada" o la columna *Fecha de ejecutoria* tiene dato, el registro **sale del seguimiento** (no aparece en tabla ni conteos) y se **lista en un aviso rojo** para darlo de baja de la hoja.

**Etapas procesales (catálogo):** Instrucción · Cierre de instrucción / conclusiones · Sentencia de primera instancia · Apelación (Tribunal de Alzada) · Amparo directo · Reposición del procedimiento. Una etapa fuera del catálogo se señala en el aviso de revisión.

**Pena:** no aparece en tabla, filtros ni colores. Solo se muestra como **dato informativo** en la ficha cuando hay sentencia de primera instancia no firme (se puede quitar con `mostrarPenaNoFirme: false` en `config.js`).

**Exportar vista:** descarga en la computadora un CSV con lo que esté filtrado (no sube nada).

**Buscador:** no distingue mayúsculas ni acentos ("nuevo leon" = "Nuevo León"). Si la frase escrita aparece completa en algún campo, muestra exactamente esas coincidencias; si no, combina palabras ("lopez jalisco" encuentra a López en Jalisco). Funciona junto con los filtros.

**Filtros dependientes:** Entidad → Circuito → Juzgado → (sugerencias de Causa y Nombre).

---

## 4. Sustituir los datos ficticios por un Excel/CSV

La hoja debe conservar los encabezados (se toleran diferencias de acentos y mayúsculas):

`ID · Nombre completo · Expediente · Causa penal · Delito(s) · Entidad Federativa · Circuito · Juzgado de Distrito · Lugar de reclusión · Situación de reclusión · Fecha de auto de formal prisión · Etapa procesal · Instancia actual · Último acto procesal · Fecha de sentencia de primera instancia · Pena impuesta (no firme) · Fecha de ejecutoria · Observaciones`

- Las tres columnas de sentencia, pena y ejecutoria son opcionales y normalmente van vacías.
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

Cubren: 150 registros en seguimiento; nombres, expedientes y causas ficticios; exclusión y aviso de ejecutoriadas; aviso de datos por revisar; semáforo con límites exactos de 2/5/10/20/30 años, más de 30, sin fecha y 29 de febrero; tarjetas-botón (uno o varios niveles); buscador por cada campo; filtros individuales, dependientes y combinados; pena solo informativa; exportar vista; ojo → registro correcto (incluidas homonimias); cierre con X, CERRAR, clic fuera y Esc; contador; LIMPIAR FILTROS; orden; encabezado fijo; carga de CSV; ejecución por `file://` y por servidor local; y ausencia de solicitudes externas.

---

## MEJORAS FUTURAS SUGERIDAS

- **Importar Excel directamente** desde el botón (hoy se usa CSV o el script `csv_a_js.py`).
- **Google Sheets / actualización automática**, preferentemente mediante un servicio restringido al dominio institucional.
- **Control de usuarios y permisos** (por ejemplo, ver solo el propio circuito), lo que exige un servidor institucional con autenticación.
- **Auditoría:** bitácora de quién consultó qué registro y cuándo.
- **Seudonimización por defecto** para perfiles que no necesiten el nombre.
- **Cifrado** de los archivos de datos y del equipo; **respaldos** cifrados y periódicos.
- **Exportación** a Excel/PDF de los resultados filtrados, con marca de agua.
- **Alerta por inactividad:** fecha del último acto procesal para detectar asuntos sin movimiento.
- **Histórico:** comparar cortes mensuales para ver qué asuntos subieron de nivel.
