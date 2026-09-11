# Radar de Normativa PJF/OAJ

Tablero cronológico de reformas y publicaciones que inciden **directamente** en el Poder Judicial de la Federación (PJF) y el Órgano de Administración Judicial (OAJ).

## Alcance

Solo se incluye normativa que reforma directamente:

- Ley Orgánica del Poder Judicial de la Federación (LOPJF)
- Ley de Amparo
- Código Nacional de Procedimientos Civiles y Familiares (CNPCF)
- Código Nacional de Procedimientos Penales (CNPP)
- Reglamentos y acuerdos generales del OAJ/CJF
- Reformas constitucionales en materia de justicia

No incluye avisos genéricos del DOF ni normativa de otras materias, aunque haya aparecido en alertas de Google u otras fuentes no oficiales.

## Fuentes

Toda la información proviene de fuentes oficiales:

- [Diario Oficial de la Federación](https://www.dof.gob.mx)
- [Cámara de Diputados — LeyesBiblio (reformas por ordenamiento)](https://www.diputados.gob.mx/LeyesBiblio/)
- [Consejo de la Judicatura Federal — normativa OAJ](https://apps.cjf.gob.mx/normativa/)

Cada tarjeta del tablero enlaza al documento oficial correspondiente. Donde el alcance exacto de un decreto no pudo verificarse contra el texto íntegro en el momento de la investigación, se marcó explícitamente con `[DATO FALTANTE]` o `[VERIFICAR]` en el resumen — **no se inventó ningún dato**.

Una entrada (Reglamento Interior del OAJ) está marcada como **no confirmado en DOF**: solo se localizó una nota periodística sobre su presentación al Pleno, sin evidencia de publicación oficial. Verificar en dof.gob.mx antes de tratarla como vigente.

## Estructura

```
radar-normativo-pjf/
├── index.html          # Tablero interactivo (autocontenido)
├── data/
│   └── eventos.json    # Dataset canónico — edítalo para agregar/actualizar publicaciones
└── README.md
```

`index.html` intenta cargar `data/eventos.json` por `fetch` (funciona al servirlo con GitHub Pages o cualquier servidor local). Si el archivo se abre directamente con doble clic (`file://`), algunos navegadores bloquean ese `fetch` por CORS; en ese caso el tablero usa una copia embebida del mismo dataset dentro del propio `index.html`, para que nunca se rompa la vista.

**Importante:** si editas `data/eventos.json`, actualiza también la copia embebida en `index.html` (constante `EVENTOS_EMBEBIDOS`, al inicio del `<script>`) para que ambas fuentes coincidan.

## Cómo verlo

- **Local:** abre `index.html` con doble clic, o corre `python3 -m http.server` dentro de la carpeta y visita `http://localhost:8000`.
- **GitHub Pages:** sube el repositorio a GitHub, activa Pages sobre la rama `main` (carpeta raíz) y el tablero queda disponible en `https://<usuario>.github.io/<repo>/`.

## Cómo agregar una publicación nueva

Agrega un objeto al arreglo en `data/eventos.json` (y a `EVENTOS_EMBEBIDOS` en `index.html`) con esta forma:

```json
{
  "id": "identificador-unico",
  "fecha": "YYYY-MM-DD",
  "instrumentos": ["LOPJF"],
  "tipo": "Reforma (decreto N)",
  "titulo": "Título breve del decreto",
  "resumen": "Qué cambia, en una o dos oraciones.",
  "liga": "https://enlace-al-documento-oficial",
  "fuente": "DOF",
  "confirmado": true
}
```

Si aún no hay fecha oficial de publicación, usa `"fecha": null` y `"confirmado": false`, y describe en `resumen` lo que falta verificar.

## Estado de la investigación (11-sep-2026)

17 publicaciones registradas, de septiembre de 2024 a julio de 2026. No se investigaron reformas anteriores a 2024 de forma exhaustiva (el radar parte de la reforma constitucional que crea el OAJ). Pendiente de verificación periódica contra el DOF para mantenerlo al día.
