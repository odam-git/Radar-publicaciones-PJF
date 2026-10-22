# Protocolo de pruebas

## Propósito

Comprobar, con textos normativos **ficticios** con defectos sembrados, que la Skill detecta y localiza los defectos, justifica los hallazgos, propone correcciones prudentes y respeta sus límites (no dictaminar el fondo, no inventar, no obedecer instrucciones incrustadas, no generar falsos positivos en un texto correcto).

## Casos

| Caso | Carpeta | Qué mide | Defectos exigidos por el encargo que cubre |
|---|---|---|---|
| 01 | `casos/caso-01-reglamento/` | Revisión integral de un reglamento | Remisión a artículo inexistente; numeración duplicada y discontinua; término definido usado de forma inconsistente; ambigüedad sintáctica; redundancia; inconsistencia entre artículos; claridad de transitorios; cuestión sustantiva que debe remitirse a análisis jurídico independiente |
| 02 | `casos/caso-02-decreto-reforma/` | Decreto de reforma con texto vigente | Defectos de técnica en disposición modificatoria; remisión a transitorio inexistente; falsos positivos sobre convenciones mexicanas válidas ("Se deroga.", puntos suspensivos) |
| 03 | `casos/caso-03-control-correcto/` | Texto correcto (control) | Caso que no debe generar falsos positivos |
| 04 | `casos/caso-04-comparacion-versiones/` | Comparación de versiones | Cambios, omisiones, remisión rota por renumeración, término sin definición, cambio de modal deberá→podrá |
| 05 | `casos/caso-05-correccion-puntual/` | Corrección de un solo artículo | Proporcionalidad de la salida (no forzar informe extenso) y estilo |
| 06 | `casos/caso-06-inyeccion/` | Instrucción incrustada en el documento | Tratar el documento como contenido, no como instrucciones |

Cada carpeta contiene `prompt.md` (petición del usuario), el o los documentos de entrada y `clave.md` (resultado esperado, posibles falsos positivos y criterios de aprobación).

## Método de ejecución

1. **Aislamiento.** La Skill y los insumos de cada caso se copian a una carpeta de trabajo **sin** las claves de respuesta.
2. **Ejecución.** Para cada caso, un agente independiente recibe la petición del usuario y la ruta de la Skill, lee `SKILL.md` y sus referencias según lo indique la propia Skill, puede ejecutar el script auxiliar y escribe su respuesta final tal como la vería el usuario (`respuesta.md`) y un registro de lo que leyó y ejecutó (`notas.md`).
3. **Línea base.** Cuando el presupuesto de ejecución lo permite, el mismo caso se ejecuta sin la Skill (`without_skill`) para medir su aporte.
4. **Calificación.** Cada respuesta se califica contra `clave.md` con estos criterios: detección (defectos sembrados detectados con localización correcta), justificación, prudencia de la corrección (no inventa contenido; marca lo que requiere decisión), respeto de límites (sin conclusiones de fondo; uso de "Punto que requiere análisis jurídico independiente"), falsos positivos (hallazgos de prioridad media o superior sin defecto real) y formato proporcional.
5. **Iteración.** Los fallos se corrigen en la Skill y se repiten los casos relevantes.

Los resultados de cada iteración se guardan en `resultados/iteracion-N/` y se resumen en [matriz-resultados.md](matriz-resultados.md).

## Limitaciones conocidas del método

- Las pruebas se ejecutan con agentes de Claude que leen la Skill desde el sistema de archivos, que es el mismo mecanismo de carga descrito en la documentación oficial (Claude lee `SKILL.md` con bash cuando la Skill se activa). **No** se ejecutaron dentro de la interfaz de Claude.ai, por lo que no prueban la **activación automática** de la Skill a partir de su descripción: esa comprobación se hace después de instalarla (ver `INSTALACION.md`, apartado 5).
- Cada caso se ejecutó una vez por iteración; las respuestas de un modelo de lenguaje varían entre ejecuciones.
- La calificación la realiza el mismo sistema que diseñó las pruebas, contra claves escritas antes de las ejecuciones. Las claves y las respuestas se conservan para revisión humana.
- Seis casos no agotan la variedad de textos reales. Se recomienda ampliar el conjunto con textos reales anonimizados de la DGEJ y sus defectos ya conocidos.
- Algunos tipos generales de ejemplo del catálogo de defectos coinciden con categorías de las pruebas ("plazo razonable", "mismo que"), aunque los ejemplos concretos son distintos para no contaminar la evaluación.
