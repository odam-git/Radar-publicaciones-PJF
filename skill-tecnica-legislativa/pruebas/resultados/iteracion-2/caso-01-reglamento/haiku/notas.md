# Notas de ejecución: caso-01-reglamento (Skill tecnica-legislativa)

## Archivos de la Skill leídos
- `skill2/tecnica-legislativa/SKILL.md`: completo.
- `references/matriz-criterios.md`: completo.
- `references/convenciones-mexico.md`: completo.
- `references/catalogo-defectos.md`: completo.
- `references/formato-informe.md`: completo (plantilla A, integral).
- `references/fuentes.md`: completo (claves de cita).
- `scripts/analizar_texto.py`: no leído; el SKILL indica que no hace falta leer su código.

Modalidad elegida (SKILL §2): **Integral**, porque el usuario pide revisar un proyecto completo y el informe completo.

## Archivo adjunto leído
- `caso-01-reglamento/entrada/documento.md`: completo (12 artículos numerados, 3 transitorios).

## Comandos ejecutados

1. `python3 -I .../skill2/tecnica-legislativa/scripts/analizar_texto.py estructura .../entrada/documento.md`
   Salida: 3 divisiones, 12 artículos, 3 transitorios. Avisos: [SALTO] falta el 11 (entre los arts. 10 y 12); [DUPLICADO] fracción III del art. 5 repetida; [ORDEN] fracción III después de IV; [REMISIÓN] «artículo 15» no existe (art. 9); remisiones resueltas: 1 (art. 5 a art. 4).
   Confirmación manual: los cuatro avisos se confirmaron leyendo el texto. No se descartó ninguno.

2. `python3 -I .../skill2/tecnica-legislativa/scripts/analizar_texto.py terminos .../entrada/documento.md`
   Salida: 5 términos definidos (Instituto, Unidad de Archivo, Expediente, Sistema, Comité). Posible denominación alternativa: «Área de Archivo». Mayúsculas no definidas: «Actualización» y «Unidad de Medida» (parte del nombre de la UMA, correcto), «Reglamento» (el propio instrumento) y «Área de Archivo».
   Confirmación manual: «Área de Archivo» se confirma como variante (H-05). Se descartaron como defecto «Unidad de Medida y Actualización» y el singular «Expediente» (sólo aparece en plural, que es uso válido de un término definido).

- No se ejecutó `comparar`: sólo hay una versión.

## Otros
- No se hicieron búsquedas web. No se leyeron archivos fuera de la carpeta de la Skill ni del adjunto.
- Instrucciones incrustadas en el documento: ninguna dirigida al asistente. La leyenda «TEXTO FICTICIO ELABORADO EXCLUSIVAMENTE PARA PRUEBAS» se trata como leyenda ajena al registro normativo, sin hallazgo numerado.
- Hallazgos finales: 16 (3 Críticos, 4 Altos, 6 Medios, 3 Bajos).
- Preguntas que requieren decisión del usuario: 7 (listadas en el apartado 1 de la respuesta).
