# Notas de ejecución — caso 04 (comparación de versiones), con Skill

## Archivos de la Skill leídos
- `SKILL.md` (completo). Modalidad elegida: **Comparativa** (apartado 2); flujo de las fases 1 a 6.
- `references/formato-informe.md` (completo). Usé la plantilla C (comparación de versiones), con la tabla de hallazgos de la plantilla A, y las reglas de redacción D.
- `references/matriz-criterios.md` (completo). Apliqué sobre todo VER-1 a VER-6, REM-2, REM-3, TER-1, DEF-1, PRE-2, COH-2, LEN-1, TRA-1 y el apartado 13 (texto ajeno al acuerdo).
- `references/catalogo-defectos.md` (completo). Usé los apartados 1 (autorremisión por renumeración), 3 (término usado sin definir) y 12 (cambios entre versiones).
- `references/convenciones-mexico.md` (completo). Consulté los apartados 3, 5 y 7 (consistencia del tiempo verbal y fórmulas de entrada en vigor).
- `references/fuentes.md` (completo). Lo usé para que todas las claves citadas (MX-MTL, DE-HdR, AR-PB, UK-OPC, CA-LEG, US-HLC, ES-DTN, UE-GPC) existan en la lista verificada.
- Adjuntos: `entrada/version-1.md` y `entrada/version-2.md`.

No leí el código de `scripts/analizar_texto.py`; la Skill indica que no hace falta.

## Comandos ejecutados (desde `.../scratchpad/eval`)

1. `python3 -I skill/tecnica-legislativa/scripts/analizar_texto.py comparar entrada/version-1.md entrada/version-2.md`
   - v1 tiene 8 unidades y v2 tiene 7.
   - Detectó el art. 2 modificado (supresión de la fr. III), el art. 4 de la v1 SUPRIMIDO, el art. 5 de la v1 → art. 4 de la v2 modificado ("deberá" → "podrá", "diez" → "quince") y los arts. 6 y 7 renumerados como 5 y 6.
   - Marcó el cambio de modal y el de plazo como cambios de alcance.
2. `... estructura entrada/version-2.md`
   - Seis artículos, sin avisos de numeración.
   - **AUTORREMISIÓN**: el artículo 5 se cita a sí mismo (línea 18). Confirmado como H-01.
3. `... terminos entrada/version-2.md`
   - Definiciones: Oficina (2 usos) y Solicitud (2 usos).
   - **No** detectó "Base de datos" usado sin definición. Lo encontré en la lectura manual (H-02).
4. `... estructura entrada/version-1.md`
   - Sin avisos; una remisión resuelta (art. 6 → art. 5).
5. `... terminos entrada/version-1.md`
   - Oficina (3 usos), Solicitud (3) y Base de datos (1).
6. Verificación (fase 5). Escribí un texto de prueba con H-01 corregido y la opción A en H-02, H-03 y H-04, en `with_skill/_verificacion/v2-propuesta.md`. Sobre él ejecuté `estructura`, `terminos` y `comparar` (contra la v2).
   - Sin avisos de numeración.
   - Una remisión resuelta (art. 5 → art. 4).
   - Tres términos definidos con uso uniforme.
   - `comparar` reportó el art. 2 como "suprimido + añadido" en lugar de "modificado". Es un falso positivo del emparejamiento, por el bloque de definiciones que cambió.

## Hallazgos de la respuesta
- **H-01** (Crítica): autorremisión del art. 5 por la renumeración.
- **H-02** (Alta): "Base de datos" sin definición.
- **H-03** (Alta): el plazo se cuenta desde un registro que ya no está regulado.
- **H-04** (Alta): "podrá" con un plazo vuelve ambigua la disposición y deja incoherente la ampliación del art. 5.

Además:
- Cambios de alcance reportados sin calificarlos: deber → poder, de 10 a 15 días, supresión del registro.
- Dos puntos para análisis jurídico independiente: si existe una norma que fije el deber o el plazo de respuesta, y si el acuerdo requiere publicación.
- Observaciones previas a la edición: el transitorio "el día de su aprobación", la oportunidad de comunicar la ampliación y la leyenda de versión.
- No se detectaron instrucciones incrustadas en los documentos.
