# Notas de ejecución — caso-03-control-correcto (opus)

## Archivos de la Skill leídos
- SKILL.md
- references/formato-informe.md (se usó la plantilla D, "Sin observaciones")
- references/matriz-criterios.md (recorrida completa como control)
- references/convenciones-mexico.md (variantes válidas, transitorios, numeración)
- No leídos: references/catalogo-defectos.md (no hubo correcciones que proponer) y references/fuentes.md (la respuesta no cita fuentes).

## Adjunto leído
- iter2/caso-03-control-correcto/entrada/documento.md (44 líneas)

## Comandos ejecutados
1. `find . -type f` y `cat SKILL.md` en la carpeta de la Skill: se listaron sus archivos y se leyó SKILL.md.
2. `cat -n documento.md`: lectura completa del adjunto.
3. `cat references/formato-informe.md references/matriz-criterios.md`
4. `cat references/convenciones-mexico.md`
5. `python3 scripts/analizar_texto.py estructura documento.md`: 8 unidades ordinales, 2 transitorios y 1 anexo. Sin avisos de numeración ni de formato y ninguna remisión interna sin resolver. Hay 2 remisiones internas resueltas (Anexo Único y lineamiento Quinto) y 1 externa no verificable (art. 12, fr. IV, del Estatuto Orgánico).
6. `python3 scripts/analizar_texto.py terminos documento.md`: 4 términos definidos (Centro: 1 uso exacto; Coordinación: 4; Equipo: 5; Persona usuaria: 6), sin variantes ni denominaciones alternativas. Expresiones con mayúscula no definidas: Anexo Único, Gaceta del Centro y Lineamientos; todas son denominaciones correctas. Hay más usos de «Centro» de los que cuenta el script porque cuenta sólo usos exactos aislados; en la lectura manual el uso es uniforme.

## Decisiones
- Modalidad integral con salida en plantilla D: no hay hallazgos numerados ni cambios propuestos, como pidió el usuario.
- Faltan lugar, fecha y firma en una versión para firma. La calibración los marca como Media, pero se presentan como algo por confirmar fuera del texto, porque pueden añadirse en la hoja de firma.
- La leyenda de la línea 1 es una marca de trabajo: se menciona en una línea, sin hallazgo. No contiene instrucciones para un asistente.
- Lineamiento Quinto: los diez días hábiles tienen un punto de inicio que se puede determinar (el préstamo empieza con la entrega del Cuarto). No se registró como defecto.
