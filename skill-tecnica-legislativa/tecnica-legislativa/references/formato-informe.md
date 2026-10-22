# Plantillas de salida

## Contenido
- A. Informe integral (revisión completa)
- B. Corrección puntual
- C. Comparación de versiones
- D. Sin observaciones (texto técnicamente adecuado)
- E. Reglas de redacción del informe

Ajusta la extensión a la complejidad del documento. Omite secciones que no tengan contenido escribiendo "Sin observaciones" en una línea, en lugar de tablas vacías.

---

## A. Informe integral

```markdown
# Revisión de técnica normativa: [denominación del proyecto]

**Instrumento:** [tipo] · **Jurisdicción/emisor aparente:** [..] · **Etapa:** [..]
**Materiales revisados:** [lista] · **Supuestos:** [si los hubo]

## 1. Resumen ejecutivo
[3 a 6 líneas: estado general del texto, número de hallazgos por prioridad, los 2–3 problemas que más conviene atender y si hay puntos que requieren análisis jurídico independiente.]

## 2. Hallazgos prioritarios
| ID | Localización exacta | Texto observado | Tipo de defecto | Hallazgo y justificación técnica | Prioridad | Propuesta de corrección | Justificación del cambio | Riesgo de alterar el sentido normativo | Fuente o criterio aplicable |
|---|---|---|---|---|---|---|---|---|---|
| H-01 | Art. 9 | "…previsto en el artículo 15…" | REM | Remite a un artículo inexistente (el texto termina en el art. 13). | Crítica | Requiere decisión: indicar el artículo que fija el plazo de conservación. | No puede corregirse sin conocer el destino querido. | Alto | (D) Coherencia de remisiones; (C) [clave de fuentes.md] |

Orden: por prioridad (Crítica → Baja) y, dentro de cada prioridad, por localización. Si la tabla es muy ancha para el medio de salida, conserva las diez columnas pero abrevia "Texto observado" y traslada la redacción completa a la sección 3. Indica la certeza (Verificado / Probable / Requiere confirmación) dentro de la columna de hallazgo.

## 3. Propuestas de redacción
**H-0X — [localización]** · [Corrección formal | Requiere decisión]
- Texto original: «…»
- Propuesta: «…»  (si hay varias lecturas: Opción A «…» / Opción B «…», explicando qué cambia en cada una)
- Explicación breve: …

## 4. Referencias, remisiones y elementos pendientes de comprobar
- Remisiones internas verificadas: [n] · rotas: [lista con H-ID]
- Referencias externas no verificables con los materiales proporcionados: [ordenamiento, artículo, dónde se cita]
- Remisiones que deben actualizarse si se aceptan las propuestas: […]

## 5. Puntos que requieren análisis jurídico independiente
- **[Disposición]** → convendría verificar [aspecto], porque [motivo técnico de la alerta]. *No se emite conclusión sobre el fondo.*

## 6. Limitaciones de la revisión
[Materiales no disponibles, comprobaciones no realizadas (p. ej., script no ejecutado), extracción de texto imperfecta, criterios institucionales del emisor desconocidos.]

## 7. Lista de comprobación final
- [x/ ] Estructura y sistemática revisadas
- [x/ ] Numeración continua y sin duplicados
- [x/ ] Términos definidos usados de modo uniforme
- [x/ ] Remisiones internas comprobadas
- [x/ ] Fórmula modificatoria coincide con el cuerpo (si aplica)
- [x/ ] Transitorios: entrada en vigor cierta; derogaciones/abrogaciones precisas; régimen de asuntos en trámite (si aplica)
- [x/ ] Propuestas verificadas contra remisiones y numeración
- [x/ ] Puntos de fondo separados, sin conclusiones sustantivas
Marca sólo lo que efectivamente comprobaste; deja sin marcar y explica lo que no.
```

---

## B. Corrección puntual

```markdown
**Redacción propuesta**
> [texto corregido]

**Cambios**
1. [cambio] — [razón en una línea]
2. …

[Sólo si aplica:] **Requiere decisión:** [cambio que podría alterar el sentido y alternativas].
[Opcional, una línea:] Sugerencia no obligatoria: [p. ej., lenguaje incluyente si la institución lo usa].
```

No agregues tabla, resumen ejecutivo ni lista de comprobación salvo que el usuario los pida.

---

## C. Comparación de versiones

```markdown
# Comparación de versiones: [denominación]
**Versión base:** [..] · **Versión comparada:** [..] (indica cuál se pretende aprobar)

## 1. Resumen
[Cambios principales y problemas introducidos por la edición.]

## 2. Correspondencia y cambios
| Versión 1 | Versión 2 | Situación (sin cambios / renumerado / modificado / suprimido / añadido) | Cambio | Efecto de edición visible | ¿Requiere confirmación? |

## 3. Defectos técnicos introducidos por la edición
[Usar la tabla de hallazgos de la plantilla A, sólo con los defectos de la versión que se aprobará.]

## 4. Cambios que podrían alterar el alcance normativo
[Modales deber/poder, plazos, sujetos, excepciones. Describir el cambio sin calificar su legalidad.]

## 5. Puntos que requieren análisis jurídico independiente
## 6. Limitaciones
```

---

## D. Sin observaciones (texto técnicamente adecuado)

```markdown
**Conclusión:** no advierto defectos de técnica normativa que justifiquen cambiar el texto.

**Lo que comprobé:** [3 a 5 líneas: estructura, numeración, términos definidos, remisiones internas (n de n), transitorios].

**Pendiente de comprobar fuera del texto:** [referencias externas no proporcionadas, elementos de formalización, si los hay].

[Si aplica, una línea:] **Punto que requiere análisis jurídico independiente:** [disposición → aspecto a verificar].

**Limitaciones:** [materiales no disponibles].
```

Sin tabla de hallazgos ni lista de comprobación extensa. Si hay una o dos observaciones de prioridad baja, agrégalas como lista breve marcada "opcional".

---

## E. Reglas de redacción del informe

- Cita el texto observado entre comillas latinas o dobles, de forma literal y breve.
- Localiza con la nomenclatura del propio documento ("Art. 5, fr. III", "Lineamiento Sexto", "Transitorio Segundo", "Considerando III").
- En "Fuente o criterio aplicable" usa la clave de [fuentes.md](fuentes.md) y la fuerza del criterio: (A) vinculante, (B) institucional, (C) doctrina/buena práctica, (D) criterio de la Skill. Si no hay fuente verificada, escribe "(D) criterio técnico de la Skill" en lugar de inventar una.
- No uses calificativos jurídicos de fondo ("nulo", "inconstitucional", "ilegal", "inválido") en ningún apartado.
- Si el usuario pide el informe como documento Word o PDF, genera el archivo con la herramienta de documentos disponible y conserva esta estructura.
