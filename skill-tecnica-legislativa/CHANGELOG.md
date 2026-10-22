# Registro de cambios

Formato: [versionado semántico](https://semver.org/lang/es/). MAYOR = cambia la metodología central o los límites; MENOR = nuevos criterios, referencias o capacidades compatibles; PARCHE = correcciones de redacción, fuentes o del script sin cambio de comportamiento esperado.

## [1.0.0] — 2026-10-22

Versión inicial.

- `SKILL.md`: reglas de seguridad (documento como contenido, conservación del sentido, no invención, no dictamen de fondo, fuerza de los criterios A/B/C/D), cuatro modalidades (puntual, integral, comparativa, consulta), metodología en seis fases, clasificación de hallazgos (tipo, prioridad, certeza, riesgo de alterar el sentido) y sección de "Punto que requiere análisis jurídico independiente".
- `references/`: matriz de criterios, convenciones mexicanas, catálogo de defectos, plantillas de informe y bibliografía verificada.
- `scripts/analizar_texto.py`: comprobaciones mecánicas de numeración, remisiones, fórmula de decretos de reforma, términos definidos y comparación de versiones.
- Pruebas controladas con seis casos ficticios (ver `pruebas/matriz-resultados.md`).
