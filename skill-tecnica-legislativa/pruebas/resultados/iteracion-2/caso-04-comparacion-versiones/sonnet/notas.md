# Notas de la prueba (caso 04, comparacion de versiones)

## Archivos de la Skill leidos
- SKILL.md
- references/convenciones-mexico.md (secciones de transitorios, variantes, normas vigentes)
- references/catalogo-defectos.md (secciones 1, 3, 8, 12)
- references/formato-informe.md (plantilla C comparacion, plantilla A hallazgos, reglas E), leido via cat
- references/fuentes.md: solo grep de MX-FHP y MX-CCF (verificar claves citadas)
- No lei matriz-criterios.md (la Skill la pide en revision integral; esto fue modalidad comparativa)
- No lei el codigo del script (SKILL.md indica que no hace falta)

## Modalidad elegida
Comparativa (SKILL.md apdo. 2), plantilla C.

## Comandos ejecutados (cwd = carpeta de la Skill)
1. python3 scripts/analizar_texto.py comparar version-1.md version-2.md
   Salida: 8 unidades v1, 7 v2. Art.1 igual; Art.2 modificado (fr. III suprimida, puntuacion); Art.3 igual; Art.4 "modificado" (emparejado por ordinal: registro -> podra responder 15 dias); Art.5 v1 SUPRIMIDO; Art.6->5 y 7->6 renumerados sin cambios; Transitorio igual. Cambios de alcance: modal 'podrá', plazo quince dias habiles.
   Lectura propia: el art. 4 v2 corresponde por contenido al art. 5 v1, y el art. 4 v1 (registro) esta suprimido; el script emparejo por ordinal.
2. python3 scripts/analizar_texto.py estructura version-2.md
   Salida: 6 articulos, 1 transitorio, sin avisos de numeracion; 1 AUTORREMISION: art. 5 cita el art. 5 (linea 18). Confirmado leyendo (H-01).
3. python3 scripts/analizar_texto.py terminos version-2.md
   Salida: definidos Oficina y Solicitud; mayuscula no definida: "Base de datos" (1), "Acuerdo" (1). Confirmado "Base de datos" (H-02); "Acuerdo" es autodenominacion, correcto.

## Decisiones
- No calificar legalidad; modal/plazo/registro remitidos a analisis juridico independiente.
- Transitorio (vigor el dia de aprobacion) tratado como defecto previo comun a ambas versiones, solo en punto de analisis independiente.
- Se reporto la inferencia de correspondencia como inferencia.
