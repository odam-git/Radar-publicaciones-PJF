# Notas del caso 05 (corrección puntual), con Skill

## Archivos de la Skill que leí
- SKILL.md (completo). Con la tabla del apartado 2 elegí la modalidad **Puntual**: texto corregido y lista breve de cambios, sin informe.
- references/formato-informe.md: usé la plantilla B, "Corrección puntual".
- references/catalogo-defectos.md: consulté el apartado 6 (la redundancia "a más tardar… dentro del plazo") y el 11 (la coma entre sujeto y verbo, "deberá de", "mismo que").

No leí matriz-criterios.md, convenciones-mexico.md ni fuentes.md. SKILL.md sólo pide la matriz en las revisiones integrales, y para una corrección de estilo de un solo artículo no hacía falta consultar convenciones ni citar fuentes.

## Comandos que ejecuté
- `ls -la` de la carpeta de salida y `find ... -type f` de la carpeta de la Skill, para ver qué archivos había.
- `cat SKILL.md`
- `cat references/formato-informe.md; cat references/catalogo-defectos.md`
- Usé un heredoc (`cat > ...`) para escribir respuesta.md y notas.md.

No ejecuté scripts/analizar_texto.py. Es un paso de la Fase 2 de las modalidades integral y comparativa, y con un único artículo sin remisiones, numeración interna ni términos definidos no aportaba nada.
