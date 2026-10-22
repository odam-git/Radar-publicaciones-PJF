# Notas de ejecución (caso-02, sonnet)

## Archivos de la Skill leídos
- SKILL.md
- references/matriz-criterios.md
- references/convenciones-mexico.md
- references/catalogo-defectos.md
- references/formato-informe.md
- references/fuentes.md
- (no se leyó scripts/analizar_texto.py; sólo se ejecutó)
- Adjunto: entrada/documento.md

## Comandos ejecutados (desde la carpeta de la Skill)
1. `python3 scripts/analizar_texto.py estructura documento.md --desde "PROYECTO QUE SE REVISA"`
   - Modo decreto detectado. Fórmula: arts. 3, 9, 15. Cuerpo: 3, 10, 15, 22.
   - DISCORDANCIAS: art. 9 en fórmula sin texto; art. 10 y art. 22 en cuerpo sin estar en fórmula.
   - Remisión no resuelta: "transitorio Quinto no existe" (línea 30).
   - Sin avisos de numeración.
2. `python3 scripts/analizar_texto.py terminos documento.md --desde "PROYECTO QUE SE REVISA"`
   - No detectó definiciones con "se entenderá por" (la Ley usa "se entiende por"). Sólo lista de mayúsculas (Centros de Lectura, Secretaría, etc.); sin hallazgos.
3. `python3 scripts/analizar_texto.py estructura documento.md --desde "ANEXO DE REFERENCIA" --hasta "(Fin del texto vigente"`
   - Saltos de numeración esperables en un extracto (3-8, 10-15, 15-21); sin remisiones.

## Hallazgos que el script no detectó (por lectura)
- Art. 3, fr. III: cambio de puntuación "." -> ", y" no enunciado (H-04).
- Título omite "derogan" (H-06).
- Plazo de 90 días sin tipo de días (H-07); definición IV vs I no paralela (H-08); faltan reglas de transición (H-09); orden de definiciones y ubicación del art. 22 (H-10, H-11).
