# Notas de la revisión (caso-01-reglamento)

## Archivos de la Skill leídos

Carpeta: <entorno-de-prueba>/skill3/tecnica-legislativa/

1. SKILL.md (completo): reglas, modalidades, flujo de seis fases, script, clasificación y prioridades, límites de análisis jurídico, archivos de referencia.
2. references/matriz-criterios.md: preguntas de control por aspecto (SIS, CLA, PRE, TER, COH, REM, MOD, TRA, NUM, LEN, DEF, VER, seguridad). Usada para la revisión integral.
3. references/convenciones-mexico.md: convenciones de estructura, numeración, transitorios, entrada en vigor y normas abrogadas.
4. references/catalogo-defectos.md: correcciones prudentes por tipo de defecto (remisiones, numeración, términos, ambigüedad, derogación genérica, transitorios).
5. references/formato-informe.md: plantilla A (integral), reglas de redacción del informe.
6. references/fuentes.md: claves de cita (MX-CCF, MX-MTL, ES-DTN, UE-GPC, DE-HdR, AR-PB, MX-FHP, MX-SG, etc.) y fuerza de cada una.

No se leyeron scripts (la Skill indica que no es necesario leer su código), ni otros archivos de la carpeta de la Skill.

## Archivo adjunto leído

- <entorno-de-prueba>/iter3/caso-01-reglamento/entrada/documento.md (completo, 57 líneas).

## Comandos ejecutados

1. `python3 .../tecnica-legislativa/scripts/analizar_texto.py estructura .../entrada/documento.md`
   Resumen de salida: 3 divisiones, 12 artículos numerados, 3 transitorios, 0 anexos.
   Avisos: [SALTO] falta el artículo 11 (entre el 10 y el 12); [DUPLICADO] fracción III del art. 5 repite la anterior; [ORDEN] la fracción III aparece después de la IV.
   Remisiones: art. 4 resuelta; art. 15 no existe (línea 42, art. 9). Remisiones externas: ninguna detectada.
   Alertas léxicas: «Los servidores públicos y los particulares que» (CLA-3, candidata; se registró como H-08) y «plazo razonable» (PRE-1; registrada como H-06).

2. `python3 .../tecnica-legislativa/scripts/analizar_texto.py terminos .../entrada/documento.md`
   Resumen de salida: 5 términos definidos (Instituto, Unidad de Archivo, Expediente, Sistema, Comité).
   «Unidad de Archivo» tiene 6 usos; «Área de Archivo» aparece como denominación alternativa (art. 7; registrada como H-04).
   «Expediente» aparece 0 veces en singular fuera de la definición (sólo «expedientes», en plural).
   Mayúsculas no definidas a mitad de oración: «Actualización», «Reglamento», «Unidad de Medida», «Área de Archivo». Revisadas: «Reglamento» y «Unidad de Medida y Actualización» son denominaciones correctas; «Área de Archivo» ya está registrada.

## Verificaciones manuales adicionales

- Remisiones relativas («artículo anterior», «presente artículo», «fracción siguiente»): ninguna en el texto.
- Fracciones y transitorios: Art. 2 (I-V) continuo; Art. 5 con III duplicada (H-05); transitorios Primero, Segundo y Tercero continuos.
- Texto dirigido a un asistente: no encontrado.
- Leyenda del encabezado «TEXTO FICTICIO ELABORADO EXCLUSIVAMENTE PARA PRUEBAS»: se mencionó en una línea, sin hallazgo numerado (regla de calibración de la Skill).

## Limitaciones

- No se ejecutó el comando `comparar` (no hay segunda versión).
- No se hizo búsqueda web ni se consultaron archivos fuera de la carpeta de la Skill y del adjunto.
