# Notas del caso 01 (con Skill)

## Archivos de la Skill leídos (completos)
- `skill/tecnica-legislativa/SKILL.md`
- `references/formato-informe.md` (se usó la plantilla A, informe integral)
- `references/catalogo-defectos.md`
- `references/matriz-criterios.md` (se recorrieron todos los apartados; el 13 se usó para la leyenda inicial)
- `references/convenciones-mexico.md`
- `references/fuentes.md` (para citar sólo claves verificadas)
- No leí el código de `scripts/analizar_texto.py` (la Skill dice que no hace falta); sólo vi su `--help`.

Adjunto leído: `iter1/caso-01-reglamento/entrada/documento.md`.

## Comandos ejecutados
1. `python3 -I analizar_texto.py documento.md` (sin subcomando): error de uso (exit 2). Mostró la ayuda con los subcomandos `estructura | terminos | comparar`.
2. `python3 -I analizar_texto.py estructura documento.md`: 3 divisiones, 12 artículos numerados, 3 transitorios. Avisos: [SALTO] falta el art. 11 (entre el 10 y el 12); [DUPLICADO] fr. III del art. 5 (línea 31); [ORDEN] fr. III después de la IV; [REMISIÓN] el art. 15 no existe (art. 9). Remisiones resueltas: 1 (art. 4, desde el art. 5). Remisiones externas detectadas: ninguna.
3. `python3 -I analizar_texto.py terminos documento.md`: 5 términos definidos. "Expediente" con 0 usos exactos y la variante "expedientes"; "Unidad de Archivo" con 6 usos y la denominación alternativa "Área de Archivo"; Instituto 1, Sistema 3 y Comité 4 usos.
4. Escribí una versión de prueba con las propuestas aplicadas (opciones A de H-01 y H-02, opción B de H-03 y de H-15, y la Unidad de Archivo como sujeto en H-10) en `scratchpad/verif-caso01/propuesta.md` y corrí sobre ella `estructura` y `terminos`. Resultado: "Sin avisos" de numeración, ninguna remisión rota, 3 remisiones resueltas (art. 4, art. 8 y art. 4) y "Unidad de Archivo" sin alternativas. Sólo queda la variante "expedientes" en el rubro del capítulo propuesto, lo cual es aceptable.
5. Comandos auxiliares: `ls`/`find`/`wc` sobre la carpeta del caso y de la Skill, y `cat` de los archivos de referencia. Creé y borré un directorio vacío `eval/work` que no se usó.

## Confirmación manual de los resultados del script
Confirmé todos los avisos del script leyendo el texto. Además, a mano, encontré: la contradicción entre los arts. 10 y 12, la entrada en vigor indeterminada, el "plazo razonable", el art. 6 sin referente, la redundancia del art. 8, la variación en la denominación del dictamen, la falta de exordio, el desajuste del rubro del capítulo II y la leyenda inicial. No hay remisiones relativas.

## Decisiones de modalidad
Modalidad integral, porque se pidió el informe completo con propuestas de redacción. No hice preguntas: las decisiones pendientes se listan dentro de la respuesta (apartado 5).
