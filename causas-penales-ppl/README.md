# CAUSAS PENALES PPL

Sistema de consulta y seguimiento — **prototipo funcional con datos 100 % ficticios**.

Aplicación web estática que se ejecuta en la propia computadora. No requiere Internet, no instala nada, no usa servicios externos (ni fuentes tipográficas, ni analítica, ni IA) y no envía información a ningún servidor.

---

## 1. Cómo abrirla

### Opción A — Doble clic (la más sencilla)
1. Descargue la carpeta `causas-penales-ppl` completa.
2. Abra `index.html` con doble clic (Chrome, Edge o Firefox).

Funciona sin Internet. Los datos se leen de `datos/datos_ppl_ficticios.js`, una copia del CSV.

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
├── index.html                  Interfaz (estructura de la pantalla)
├── css/estilos.css             Diseño accesible (texto grande, alto contraste)
├── js/
│   ├── config.js               ÚNICO archivo a editar: fuente de datos y privacidad
│   ├── datos.js                Capa de datos: lee CSV/copia embebida, normaliza, seudonimiza
│   ├── logica.js               Procesamiento: clasificación, búsqueda, filtros, orden
│   └── interfaz.js             Pinta la tabla, filtros y tarjeta (no contiene registros)
├── datos/
│   ├── datos_ppl_ficticios.csv   Fuente principal (150 registros ficticios)
│   ├── datos_ppl_ficticios.xlsx  Misma información en Excel
│   └── datos_ppl_ficticios.js    Copia para el modo doble clic (generada)
├── herramientas/
│   ├── generar_datos_ficticios.py  Genera los 150 registros ficticios
│   └── csv_a_js.py                 Convierte un CSV/Excel en la copia embebida
├── pruebas/
│   ├── pruebas_logica.js        27 pruebas de datos y lógica (Node)
│   └── pruebas_interfaz.js      23 pruebas en navegador real (Playwright)
└── iniciar_servidor_local.bat
```

Flujo: **fuente de datos → `datos.js` (lectura y normalización) → `logica.js` (filtros/búsqueda) → `interfaz.js` (tabla) → tarjeta de detalle.**

---

## 3. Reglas de funcionamiento

| Pena | Clasificación |
|---|---|
| menos de 10 años | 🟡 Amarillo |
| de 10 a 20 años (incluye 10 y 20) | 🟠 Naranja |
| más de 20 años | 🔴 Rojo |

Comprobado: 9 → amarillo · 10 → naranja · 15 → naranja · 20 → naranja · 21 → rojo · 9.5 → amarillo · 20.5 → rojo.

**Buscador:** no distingue mayúsculas ni acentos ("nuevo leon" = "Nuevo León"). Si la frase escrita aparece completa en algún campo, muestra exactamente esas coincidencias; si no, combina palabras ("lopez jalisco" encuentra a López en Jalisco). Funciona junto con los filtros.

**Filtros dependientes:** Entidad → Circuito → Juzgado → (sugerencias de Causa y Nombre).

---

## 4. Sustituir los datos ficticios por un Excel/CSV

La hoja debe conservar los encabezados (se toleran diferencias de acentos y mayúsculas):

`ID · Nombre completo · Expediente · Causa penal · Delito · Entidad Federativa · Circuito · Juzgado de Distrito · Lugar donde se encuentra · Pena en años · Fecha de sentencia · Fecha de inicio · Fecha de cumplimiento · Observaciones`

- *Pena en años:* número (`15`, `12.5` o `12,5`).
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

Cubren: 150 registros exactos; nombres, expedientes y causas ficticios; buscador por cada campo; filtros individuales, dependientes y combinados; rangos de pena; colores en los límites 9/10/15/20/21; ojo → registro correcto (incluidas homonimias); cierre con X, CERRAR, clic fuera y Esc; contador; LIMPIAR FILTROS; orden; encabezado fijo; carga de CSV; ejecución por `file://` y por servidor local; y ausencia de solicitudes externas.

---

## MEJORAS FUTURAS SUGERIDAS

- **Importar Excel directamente** desde el botón (hoy se usa CSV o el script `csv_a_js.py`).
- **Google Sheets / actualización automática**, preferentemente mediante un servicio restringido al dominio institucional.
- **Control de usuarios y permisos** (por ejemplo, ver solo el propio circuito), lo que exige un servidor institucional con autenticación.
- **Auditoría:** bitácora de quién consultó qué registro y cuándo.
- **Seudonimización por defecto** para perfiles que no necesiten el nombre.
- **Cifrado** de los archivos de datos y del equipo; **respaldos** cifrados y periódicos.
- **Exportación** a Excel/PDF de los resultados filtrados, con marca de agua.
- **Indicadores adicionales** (p. ej., penas próximas a cumplirse), si el área lo requiere.
