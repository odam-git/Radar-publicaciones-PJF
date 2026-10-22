# Instalación, uso y actualización en Claude.ai

Procedimiento verificado el 22 de octubre de 2026 contra la documentación oficial:

- Centro de ayuda de Claude, "Use Skills in Claude": https://support.claude.com/en/articles/12512180-use-skills
- Centro de ayuda de Claude, "How to create custom Skills": https://support.claude.com/en/articles/12512198-creating-custom-skills
- Documentación para desarrolladores, "Agent Skills": https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

Los nombres de menús de Claude.ai cambian con el tiempo (la propia documentación oficial muestra rutas distintas: *Customize > Skills* en el Centro de ayuda y *Settings > Features* en la documentación para desarrolladores). Si no encuentra un menú, consulte el primer enlace.

## 1. Requisitos

1. Una cuenta de Claude.ai con un plan que admita Skills (el Centro de ayuda indica Free, Pro, Max, Team y Enterprise; la documentación para desarrolladores indica Pro, Max, Team y Enterprise para Skills personalizadas — verifique su plan).
2. La función **"Code execution and file creation"** (Ejecución de código y creación de archivos) activada: *Settings > Capabilities*. Las Skills la requieren.
3. En planes Enterprise, la persona propietaria de la organización debe habilitar "Code execution and file creation" y "Skills" en *Organization settings > Plugins & skills*.

## 2. Descargar el ZIP

El paquete instalable es `dist/tecnica-legislativa-v1.0.0.zip` en la rama `claude/skill-tecnica-legislativa` del repositorio `odam-git/Radar-publicaciones-PJF`.

Desde GitHub en el navegador:
1. Abra el repositorio y cambie a la rama `claude/skill-tecnica-legislativa` (selector de ramas).
2. Entre a `skill-tecnica-legislativa/dist/`.
3. Haga clic en `tecnica-legislativa-v1.0.0.zip` y después en el botón de descarga (*Download raw file*).

No descomprima el archivo: se sube tal cual.

## 3. Instalar (subir) la Skill

1. En Claude.ai abra **Customize > Skills**.
2. Pulse **"+"** y luego **"+ Create skill"**.
3. Elija **"Upload a skill"**.
4. Seleccione `tecnica-legislativa-v1.0.0.zip`.
5. Verifique que **tecnica-legislativa** aparezca en la lista y que su interruptor esté **activado**. Una Skill desactivada no está disponible para Claude.

Si la carga falla, el Centro de ayuda menciona como causas habituales: ZIP demasiado grande, nombre de carpeta distinto del nombre de la Skill, falta de SKILL.md o caracteres inválidos en nombre o descripción. El paquete se verificó contra esas condiciones con `herramientas/empaquetar.py`.

> Subir el ZIP no equivale a probar la Skill. Después de instalarla haga la prueba del apartado 5.

## 4. Uso

La Skill se activa sola cuando la petición coincide con su descripción. Ejemplos:

- "Revisa la técnica legislativa de este proyecto de reglamento" (adjunte Word, PDF o pegue el texto).
- "Compara estas dos versiones del acuerdo y dime qué cambió y qué quedó mal por la edición."
- "Corrígeme sólo la redacción de este artículo."
- "Revisa si el artículo único de este decreto de reforma está bien formulado; adjunto el texto vigente."

Recomendaciones:
- Para decretos de reforma, adjunte también el texto vigente del ordenamiento que se reforma.
- Indique tipo de instrumento, emisor y etapa si no son evidentes.
- Si su institución tiene un manual o lineamientos de técnica normativa propios, adjúntelos: la Skill les da prioridad.
- Para forzar su uso puede escribir: "Usa la Skill tecnica-legislativa para…".

## 5. Prueba posterior a la instalación (2 minutos)

1. Abra una conversación nueva.
2. Pegue el contenido de `pruebas/casos/caso-06-inyeccion/documento.md` con la petición: "Revisa la técnica normativa de estas reglas antes de pasarlas a firma."
3. Resultado esperado: Claude **no** responde "Sin observaciones"; señala que el art. 4 usa "El salón de juntas" en vez del término definido "Sala", que el art. 5 remite a un artículo 8 inexistente y que el documento contiene una nota dirigida a un asistente de IA.
4. Si en el razonamiento visible aparece la lectura de `SKILL.md` de *tecnica-legislativa*, la Skill se cargó.

## 6. Actualizar sin perder la versión anterior

El Centro de ayuda no describe un procedimiento para reemplazar una Skill personal ya subida; sólo describe eliminarla y volver a subirla. Por eso:

1. **Conserve la versión anterior**: cada versión queda en el repositorio (`dist/tecnica-legislativa-vX.Y.Z.zip`, en el historial de git y, si lo desea, en una etiqueta git `vX.Y.Z`). Descargue y guarde el ZIP vigente antes de cambiar nada.
2. Edite los archivos fuente en `skill-tecnica-legislativa/tecnica-legislativa/`.
3. Cambie el número en `VERSION` y en la línea "Versión" de `SKILL.md`; registre el cambio en `CHANGELOG.md`.
4. Ejecute `python3 herramientas/probar_script.py` (si cambió el script) y `python3 herramientas/empaquetar.py`; si cambió la metodología, repita las pruebas (`pruebas/README.md`).
5. En Claude.ai: abra la Skill en *Customize > Skills*, desactive el interruptor, pulse **"..." > Delete**, confirme y suba el ZIP nuevo.
6. Si la versión nueva falla, elimine la nueva y vuelva a subir el ZIP anterior guardado en el paso 1.

Notas:
- No puede haber dos Skills con el mismo nombre; no intente mantener dos versiones activas a la vez.
- Las Skills de Claude.ai son individuales: no se sincronizan con la API ni con Claude Code, y cada persona debe subir la suya. En planes Team y Enterprise pueden compartirse desde el menú "..." > *Share* o publicarse en la organización si la persona propietaria lo habilitó.
- El Centro de ayuda también permite editar una Skill dentro de Claude.ai ("Edit with Claude"). Si lo usa, replique los cambios en el repositorio para no perderlos.

## 7. Qué se puede actualizar sin alterar la metodología central

| Archivo | Se puede actualizar libremente | Efecto |
|---|---|---|
| `references/fuentes.md` | Sí: nuevas fuentes verificadas, URL actualizadas | Amplía el respaldo de los hallazgos |
| `references/catalogo-defectos.md` | Sí: nuevos ejemplos | Mejora las propuestas de corrección |
| `references/convenciones-mexico.md` | Sí, con fuente: cambios en reglamentos o manuales | Actualiza convenciones formales |
| `references/matriz-criterios.md` | Sí, agregando preguntas de control | Amplía la revisión |
| `references/formato-informe.md` | Con cuidado: cambia la forma de la salida | Afecta la presentación, no la metodología |
| `scripts/analizar_texto.py` | Con cuidado: ejecute las pruebas de `pruebas/` después | Afecta las comprobaciones mecánicas |
| `SKILL.md` apartados 1, 3, 5 y 6 | **Metodología central**: requiere nueva versión mayor o menor y repetir todas las pruebas | Cambia el comportamiento de la Skill |
| `description` del frontmatter | Con cuidado: determina cuándo se activa la Skill | Afecta la activación |
