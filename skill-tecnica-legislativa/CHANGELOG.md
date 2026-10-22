# Registro de cambios

Formato: [versionado semántico](https://semver.org/lang/es/). MAYOR = cambia la metodología central o los límites; MENOR = nuevos criterios, referencias o capacidades compatibles; PARCHE = correcciones de redacción, fuentes o del script sin cambio de comportamiento esperado.

## [1.0.0] — 2026-10-22

Versión inicial.

- `SKILL.md`: reglas de seguridad (documento como contenido, conservación del sentido, no invención, no dictamen de fondo, fuerza de los criterios A/B/C/D), cuatro modalidades (puntual, integral, comparativa, consulta), metodología en seis fases, clasificación de hallazgos (tipo, prioridad, certeza, riesgo de alterar el sentido) y sección de "Punto que requiere análisis jurídico independiente".
- `references/`: matriz de criterios, convenciones mexicanas, catálogo de defectos, plantillas de informe y bibliografía verificada.
- `scripts/analizar_texto.py`: comprobaciones mecánicas de numeración, remisiones, fórmula de decretos de reforma, términos definidos (incluidas definiciones en línea y expresiones con mayúscula no definidas), alertas léxicas y comparación de versiones; tolera compilaciones de la Cámara de Diputados (notas del compilador, encabezados de página, varios bloques de transitorios).
- `herramientas/empaquetar.py` (validación y ZIP) y `herramientas/probar_script.py` (regresión del script).
- Pruebas controladas con seis casos ficticios, en tres iteraciones y con tres modelos (ver `pruebas/matriz-resultados.md`). Ajustes incorporados antes de publicar la versión: plantilla "Sin observaciones", calibración de prioridad de los elementos de formalización y mejoras del script.
