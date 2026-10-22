# Notas de ejecución — caso-02-decreto-reforma (with_skill)

## Archivos de la Skill leídos
- `SKILL.md`
- `references/convenciones-mexico.md` (decretos de reforma, transitorios, variantes válidas)
- `references/formato-informe.md` (plantilla A, informe integral)
- `references/matriz-criterios.md` (MOD, TRA, REM, CLA, PRE, SIS, DEF, COH)
- `references/catalogo-defectos.md` (correcciones típicas de modificatorias y transitorios)
- `references/fuentes.md` (claves de cita)
- No leí el código de `scripts/analizar_texto.py`; sólo lo ejecuté.

Adjunto leído: `entrada/documento.md`.

## Comandos ejecutados (desde la carpeta de la Skill)
1. `python3 scripts/analizar_texto.py estructura documento.md --desde "DECRETO POR EL QUE"`
   - Detectó el modo decreto de reforma y la fórmula del Artículo Único.
   - Discordancias: el art. 9 está en la fórmula sin texto; los arts. 10 y 22 tienen texto pero no están en la fórmula.
   - Remisión no resuelta: "transitorio Quinto no existe".
   - Sin avisos de numeración.
2. `python3 scripts/analizar_texto.py terminos documento.md --desde "DECRETO POR EL QUE"`
   - No detectó un bloque de definiciones con "se entenderá por" (el texto usa "se entiende por" y el art. 3 aparece con puntos suspensivos). La terminología la revisé manualmente.
3. `python3 scripts/analizar_texto.py estructura documento.md --hasta "(Fin del texto vigente"`
   - Sobre el extracto vigente: sólo saltos de numeración (4-7, 11-14, 16-20), esperables en un extracto. Sin remisiones rotas.
4. Escribí el texto integrado propuesto en `scratchpad/tmp_caso02_with_skill/propuesta.txt` y ejecuté `python3 scripts/analizar_texto.py estructura .../propuesta.txt`
   - La fórmula y el cuerpo coinciden (3, 10, 15 y 22), sin avisos de numeración y sin remisiones internas rotas.

## Hallazgos manuales adicionales (no detectados por el script)
- La fr. III del art. 3 cambia su puntuación ("." → ", y") y no se enuncia como reformada.
- El título omite "derogan".
- La obligación de inscripción (art. 22) es exigible antes de que se emitan los lineamientos (transitorio Segundo).
- El plazo de 90 días no indica si son naturales o hábiles.
- El transitorio Tercero no precisa a qué convenios se refiere ni el régimen que los rige.
- Falta una regla de transición para el informe anual del art. 15 derogado.
- La Red cambia de denominación sin una regla operativa de integración de los Centros de Lectura.
- El art. 22 no identifica a la persona obligada y queda ubicado después del artículo de sanciones.
- No hay fórmula de expedición.
- La fr. IV rompe el orden alfabético de las definiciones.
- No encontré instrucciones incrustadas dirigidas al asistente en el documento.
