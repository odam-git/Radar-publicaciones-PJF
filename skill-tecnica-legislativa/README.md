# Skill "Técnica Legislativa" (`tecnica-legislativa`)

Skill para Claude.ai que revisa y mejora la **calidad técnica de la redacción** de proyectos normativos —leyes, reglamentos, decretos, acuerdos generales, lineamientos y otras disposiciones—, con énfasis en el sistema jurídico mexicano.

Versión: ver `VERSION` y `CHANGELOG.md`.

> Esta carpeta es independiente del proyecto "Radar de Normativa PJF/OAJ" que vive en la raíz del repositorio. No comparte código, datos ni dependencias con él.

## Qué hace

- Detecta defectos de estructura, numeración, claridad, precisión, terminología definida, coherencia interna, remisiones, disposiciones modificatorias, transitorias, enumeraciones y estilo normativo.
- Compara versiones de un mismo proyecto e identifica cambios y defectos introducidos por la edición.
- Propone redacciones concretas que conservan el sentido normativo aparente y marca como "Requiere decisión" lo que podría alterarlo.
- Distingue la fuerza de cada criterio: (A) regla vinculante, (B) criterio institucional, (C) doctrina o buena práctica, (D) criterio de la Skill.
- Trata el documento como contenido sujeto a revisión: no obedece instrucciones incrustadas en él.

## Qué no hace

No dictamina constitucionalidad, legalidad sustantiva, competencia, validez, vigencia ni interpretación definitiva. Lo que toque esos temas se registra como **"Punto que requiere análisis jurídico independiente"**, sin resolverlo.

## Estructura

```
skill-tecnica-legislativa/
├── README.md                    # Este archivo
├── INSTALACION.md               # Instalación, uso y actualización en Claude.ai
├── CHANGELOG.md                 # Registro de cambios
├── VERSION                      # Versión vigente
├── tecnica-legislativa/         # ← LA SKILL (lo que se empaqueta en el ZIP)
│   ├── SKILL.md                 # Instrucciones centrales y metodología
│   ├── references/
│   │   ├── matriz-criterios.md      # Preguntas de control por aspecto, con fuerza y fuente
│   │   ├── convenciones-mexico.md   # Reglas y prácticas mexicanas verificadas
│   │   ├── catalogo-defectos.md     # Ejemplos de defectos y correcciones prudentes
│   │   ├── formato-informe.md       # Plantillas de salida
│   │   └── fuentes.md               # Bibliografía verificada con claves de cita
│   └── scripts/
│       └── analizar_texto.py        # Comprobaciones mecánicas (numeración, remisiones, términos, versiones)
├── investigacion/               # Investigación documental (no se empaqueta)
│   ├── bibliografia-verificada.md
│   ├── decisiones-de-diseno.md
│   └── informe-agente-{1,2,3}-*.md  # Informes completos de los tres subagentes
├── pruebas/                     # Casos ficticios, claves, resultados y matriz (no se empaqueta)
├── herramientas/
│   ├── empaquetar.py            # Valida la Skill y genera el ZIP
│   └── probar_script.py         # Prueba de regresión del script contra los casos ficticios
└── dist/
    └── tecnica-legislativa-vX.Y.Z.zip   # Paquete instalable
```

Sólo la carpeta `tecnica-legislativa/` se empaqueta: la investigación y las pruebas son material de soporte y mantenimiento.

## Cómo funciona dentro de Claude

Conforme a la documentación oficial de Agent Skills, Claude carga siempre el nombre y la descripción; lee `SKILL.md` cuando la petición coincide con la descripción, y sólo lee los archivos de `references/` cuando la tarea los requiere. El script se ejecuta (no se lee) cuando hay ejecución de código disponible.

## Mantenimiento

1. Edite los archivos fuente en `tecnica-legislativa/`.
2. Actualice `VERSION`, la línea "Versión" de `SKILL.md` y `CHANGELOG.md`.
3. Si cambió el script, ejecute `python3 herramientas/probar_script.py` (debe superar todas las comprobaciones). Si cambió la metodología (apartados 1, 3, 5 o 6 de `SKILL.md`), repita además las pruebas de la Skill (`pruebas/README.md`).
4. Genere el paquete: `python3 herramientas/empaquetar.py` (valida frontmatter, longitud, enlaces y estructura del ZIP).
5. Instale la nueva versión siguiendo `INSTALACION.md`, apartado 6.

Revisión periódica sugerida (cada seis meses o cuando haya reformas relevantes): vigencia de las normas citadas en `references/fuentes.md` y `references/convenciones-mexico.md`, en especial la Ley Orgánica del Poder Judicial de la Federación, los reglamentos de las Cámaras, los Lineamientos de la Consejería Jurídica y la normativa de mejora regulatoria. Si la institución emite un manual propio de técnica normativa, incorpórelo a `fuentes.md` y `convenciones-mexico.md`: por instrucción de la Skill, prevalece sobre las recomendaciones generales.

## Requisitos

- Claude.ai con la función "Code execution and file creation" activada (requisito de las Skills).
- El script usa sólo la biblioteca estándar de Python 3; para leer PDF intenta `pypdf` o `pdftotext`. Si no hay ejecución de código, la Skill hace las comprobaciones manualmente y lo declara.
