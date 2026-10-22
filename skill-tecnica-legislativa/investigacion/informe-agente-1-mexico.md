# Técnica legislativa / técnica normativa en México — investigación documental

Corte de la investigación: 22 de octubre de 2026.
Propósito: insumo para una Skill que revise la calidad técnica de redacción de leyes, reglamentos, decretos, acuerdos, lineamientos y acuerdos generales del Poder Judicial de la Federación (PJF) / Órgano de Administración Judicial (OAJ).

## 0. Notas de método

- Los textos legales se descargaron de las versiones compiladas de la Cámara de Diputados (`diputados.gob.mx/LeyesBiblio`) y se extrajeron con `pdftotext`. Cada uno trae en su encabezado su "Última reforma". Las notas marginales de esas compilaciones ("Fracción adicionada DOF…", "Artículo reformado DOF…") son del compilador, no forman parte del texto normativo.
- El manual de la Cámara de Diputados (fuente 1) es un PDF escaneado: sólo trae imagen y tiene la copia bloqueada. Se pasó por OCR con `tesseract -l spa`. Las citas textuales que se transcriben de él se cotejaron contra la página renderizada cuando había duda (por ejemplo, p. 40). La paginación se cita como **p. impresa** (el número de folio del libro), no la del PDF, porque no coinciden: hay saltos de +1 a +5.
- Los acuerdos de la Consejería Jurídica (CJEF) se leyeron en el texto HTML del DOF (`dof.gob.mx/nota_detalle.php`).
- Los acuerdos generales del OAJ se leyeron en los PDF de la edición del DOF que hospeda `apps.cjf.gob.mx/normativa`.
- Categorías: **(A)** regla jurídica vinculante o requisito formal aplicable; **(B)** criterio institucional o manual de uso; **(C)** recomendación doctrinal o buena práctica; **(D)** idea útil para una metodología propia (inferencia mía o práctica observada, no prescrita por una fuente).

---

## 1. Tabla de fuentes

| # | Título | Autor / institución | Fecha | URL | Estado de verificación | Utilidad concreta |
|---|---|---|---|---|---|---|
| 1 | *Manual de técnica legislativa* (serie "Conocer para decidir") | José Rafael **Minor Molina** y José **Roldán Xopa**. Coedición H. Cámara de Diputados, LIX Legislatura, con Miguel Ángel Porrúa. ISBN 970-701-670-1 | 1a. ed., enero de 2006 (créditos y colofón) | https://www.diputados.gob.mx/sedia/biblio/virtual/dip/matecleg/matecleg.pdf | **VERIFICADA**. PDF descargado (HTTP 200, 9.6 MB, 95 páginas escaneadas) y leído íntegro por OCR. Índice en pp. impresas 89-91 | Es el manual mexicano más operativo. Cubre estructura (título, división temática, exposición de motivos, disposiciones preliminares, principales y finales), división en títulos, capítulos, secciones, artículos, fracciones, incisos, subincisos y párrafos, redacción (tiempo verbal, brevedad, voz pasiva, sinónimos, definiciones, remisiones, "y/o"), lógica normativa y un **cuestionario de control** (R1 a R5) |
| 2 | "Recomendaciones de técnica legislativa para la redacción de iniciativas", *Nota* núm. 34 (según el buscador) | Instituto Belisario Domínguez (IBD), Senado. Autor según el buscador: César Alejandro Giles Navarro | Noviembre de 2018 (según el buscador) | https://bibliodigitalibd.senado.gob.mx/handle/123456789/4211 (archivo: `…/bitstream/handle/123456789/4211/Nota34_TécnicaLegislativa_.pdf`) | **PARCIAL**. La ficha y el PDF devuelven HTTP 403 (cortafuegos Incapsula) por curl, y por WebFetch entran en un bucle de redirección https→http. El título, el autor, la fecha y el nombre del archivo sólo se conocen por el resultado del buscador, que mostró el PDF del handle 4211. **No se leyó el contenido** y no se usa como fundamento | Probablemente guía de redacción de iniciativas conforme al Reglamento del Senado. Hay que revisarla manualmente desde un navegador |
| 3 | Reglamento de la Cámara de Diputados | Cámara de Diputados | DOF 24-12-2010; última reforma DOF 07-05-2025 | https://www.diputados.gob.mx/LeyesBiblio/pdf/Reg_Diputados.pdf | **VERIFICADA** (texto leído: arts. 77, 78, 85, 93) | Requisitos (A) de iniciativas y dictámenes en Diputados |
| 4 | Reglamento del Senado de la República | Senado | Última reforma DOF 06-12-2024 | https://www.diputados.gob.mx/LeyesBiblio/pdf/Reg_Senado.pdf | **VERIFICADA** (arts. 164-172, 190-193, 211) | Requisitos (A) de iniciativas (art. 169, incluida la estructura en libros, títulos, capítulos…) y de dictámenes (art. 190) |
| 5 | Constitución Política de los Estados Unidos Mexicanos | Congreso | Última reforma DOF 07-10-2026 | https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf | **VERIFICADA** (arts. 70, 72 F y 100; decreto de 07-10-2026 como ejemplo de fórmula) | Fórmula de promulgación; principio de paralelismo de formas; facultad del OAJ para expedir acuerdos generales |
| 6 | Código Civil Federal | Congreso | Última reforma DOF 14-11-2025 | https://www.diputados.gob.mx/LeyesBiblio/pdf/CCF.pdf | **VERIFICADA** (arts. 3o., 4o., 5o., 9o.) | Vigencia supletoria (*vacatio* de 3 días); abrogación o derogación expresa o tácita |
| 7 | Ley Federal de Procedimiento Administrativo (LFPA) | Congreso | Última reforma DOF 14-11-2025 | https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPA.pdf | **VERIFICADA** (arts. 1, 3, 4; Título Tercero A) | Publicación en el DOF de los actos administrativos de carácter general de la Administración Pública Federal (APF) |
| 8 | Ley del Diario Oficial de la Federación y Gacetas Gubernamentales | Congreso | DOF 24-12-1986; última reforma DOF 31-05-2019 | https://www.diputados.gob.mx/LeyesBiblio/pdf/75_100619.pdf | **VERIFICADA** (arts. 1o.-4o. y decretos de reforma de 2012 y 2019) | Qué se publica en el DOF (incluye acuerdos de interés general del Consejo de la Judicatura Federal, CJF); ejemplos reales de fórmulas de decretos |
| 9 | Ley Nacional para Eliminar Trámites Burocráticos (LNETB) | Congreso | DOF 16-07-2025 (ley nueva) | https://www.diputados.gob.mx/LeyesBiblio/pdf/LNETB.pdf | **VERIFICADA** (arts. 3, 5, 6, 18, 33-40; transitorio Segundo) | **Abroga la Ley General de Mejora Regulatoria** (LGMR) de 18-05-2018. Regula hoy el Análisis de Impacto Regulatorio (AIR) |
| 10 | Ley General de Mejora Regulatoria | — | DOF 18-05-2018 | (ya no aparece en el índice de LeyesBiblio; `pdf/LGMR.pdf` devuelve 404) | **ABROGADA** (verificado con el transitorio Segundo de la LNETB) | Sólo tiene valor histórico. No usarla como fundamento vigente |
| 11 | Ley Orgánica del Poder Judicial de la Federación (LOPJF) | Congreso | DOF 20-12-2024; última reforma DOF 28-11-2025 | https://www.diputados.gob.mx/LeyesBiblio/pdf/LOPJF.pdf | **VERIFICADA** (arts. 80 fr. I-II, 89, 91 y transitorio Décimo Noveno) | Base de los acuerdos generales del OAJ y de su publicación en el DOF; vigencia de los acuerdos del extinto CJF |
| 12 | Ley Federal de Presupuesto y Responsabilidad Hacendaria (LFPRH) | Congreso | Última reforma DOF 09-04-2026 | https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPRH.pdf | **VERIFICADA** (art. 18) | Valoración de impacto presupuestario de iniciativas |
| 13 | Acuerdo por el que se expiden los Lineamientos para la Elaboración y Presentación de Proyectos de **Iniciativas de Ley** Expedidas por el Poder Ejecutivo Federal | Consejería Jurídica del Ejecutivo Federal (María Estela Ríos González) | DOF 25-05-2022 | https://dof.gob.mx/nota_detalle.php?codigo=5653245&fecha=25/05/2022 | **VERIFICADA** (texto íntegro leído en el DOF) | Requisitos (B, vinculantes sólo para la APF) del proyecto: artículo descriptivo, "Artículo único", "para quedar como sigue:", puntos suspensivos, transitorios y cuadro comparativo de 3 columnas. Abrogó los lineamientos de 11-09-2020 |
| 14 | Acuerdo por el que se expiden los Lineamientos para la Elaboración y Presentación de Proyectos de **Reglamentos** Expedidos por el Poder Ejecutivo Federal | CJEF | DOF 25-05-2022 | https://dof.gob.mx/nota_detalle.php?codigo=5653246&fecha=25/05/2022 | **VERIFICADA** (texto íntegro) | Exordio, denominación, artículo descriptivo, reglas de puntos suspensivos, transitorios, cuadro comparativo (tachado y negritas) y formato de impresión. Abrogó los lineamientos de 11-10-2019 |
| 15 | *Teoría de la legislación y técnica legislativa (Una forma nueva de entender y ejercer la función legislativa)* | Cecilia **Mora-Donatto** (1a. parte) y Elia **Sánchez Gómez** (2a. parte, "Técnica Legislativa. Algunas directrices lingüísticas para la redacción de enunciados normativos") | UNAM-IIJ y H. Congreso del Estado de Tamaulipas, 1a. ed. 20-10-2012, Serie Estudios Jurídicos núm. 209 | https://archivos.juridicas.unam.mx/www/bjv/libros/7/3201/5.pdf (capítulo de Sánchez Gómez); `…/7/3201/1.pdf` (portada y legales); `…/4.pdf` (Mora-Donatto) | **VERIFICADA** (PDF descargados; capítulo de Sánchez Gómez leído, pp. 71-120) | Directrices lingüísticas: modalidad y valoración de verbos, formulación positiva, voz pasiva y "se" impersonal, adverbios ociosos, conectores, y un **cuestionario de validación lingüística** con lector experto y lego |
| 16 | *Perspectiva de género y técnica legislativa en México* (Opiniones Técnicas sobre Temas de Relevancia Nacional, núm. 43) | Roxana **Rosas Fregoso**, UNAM-IIJ | 2021 | https://archivos.juridicas.unam.mx/www/bjv/libros/14/6540/1.pdf | **VERIFICADA** (PDF de 74 pp. leído en la sección de lenguaje incluyente, pp. impresas 51-61) | Recursos de lenguaje incluyente en normas (perífrasis, colectivos, metonimia, desdoblamiento moderado); sustituir "hombre" por "persona" |
| 17 | *Manual de Técnica Legislativa* | Fundación Humanismo Político, A. C. | Sin fecha expresa. El PDF se creó el 26-03-2003 y la bibliografía llega a 2001 | https://www.agora-parl.org/sites/default/files/agora-documents/FHP%20-%20Manual%20de%20Tecnica%20legislativa%20-%20ES%20-%20PI.pdf | **VERIFICADA** (23 pp. leídas). Documento con apartados incompletos (por ejemplo, signos de puntuación sin desarrollo) | Reglas muy operativas sobre decretos modificatorios, numeración de transitorios ("Único"), números, edades, citas y siglas. Es documento privado de una fundación ligada a un partido, sin carácter oficial |
| 18 | *Apuntes Legislativos* núm. 7, "Técnica legislativa: nociones generales" (incluye "Elementos de la técnica legislativa" de Fabiola Gómez Coss y León y la presentación del *Manual de Técnica Legislativa* coordinado por Salvador O. Nava Gomar) | Instituto de Investigaciones Legislativas, H. Congreso del Estado de Guanajuato, LIX Legislatura. ISBN 970-9784-00-5 | 1a. ed. 15-01-2006 | https://congreso-gto.s3.amazonaws.com/uploads/contenido_estudio/archivo/11/7tecnica.pdf | **VERIFICADA** (49 pp.; se leyeron pp. 23-25 de la paginación interna) | Criterio de un congreso local: mínimo dos unidades por división, romanos para libros, títulos y capítulos, fracciones antes que incisos, contenido de los transitorios |
| 19 | Acuerdo General del Pleno del OAJ que regula la integración y trámite del expediente electrónico y el uso de videoconferencias… (AG-POAJ-006/2026) | Órgano de Administración Judicial | DOF (ed. vespertina) 17-04-2026 | https://apps.cjf.gob.mx/normativa/Recursos/2026-6-11-OAJ_V01.PDF | **VERIFICADA** (leídos exordio, considerandos, arts. 1-2, transitorios y certificación) | **Práctica observada** de redacción de acuerdos generales del OAJ (formato, transitorios, cláusula derogatoria genérica, certificación) |
| 20 | Acuerdo General del Pleno del OAJ en materia de adquisiciones, arrendamiento de bienes y prestación de servicios del PJF (AG-POAJ-023/2025) | OAJ | DOF 04-12-2025 | https://apps.cjf.gob.mx/Normativa/Recursos/2025-0-20-OAJ_V01.PDF | **VERIFICADA** (sólo el exordio) | Práctica observada: cita de la LOPJF como "1o, fracción VIII" (inconsistente con la fuente 19, que usa "1, fracción VIII") |
| 21 | *Elementos de técnica legislativa* (coords. Miguel Carbonell y Susana Thalía Pedroza de la Llave), con los capítulos "Técnica legislativa y proyectos de ley" (M. A. López Olvera) y "Los objetos de las leyes, los reenvíos legislativos y las derogaciones tácitas" | UNAM-IIJ (y Porrúa en ediciones posteriores) | 1a. ed. 2000 (Serie Doctrina Jurídica 44); los catálogos registran también 2002 y 3a. ed. 2004 | Fichas en humanindex.unam.mx y catálogos (no se encontró el PDF de texto completo en la Biblioteca Jurídica Virtual) | **PARCIAL**. Existencia y datos bibliográficos confirmados por catálogos; contenido **no leído** directamente, sólo citado en la fuente 1 | Doctrina base; la fuente 1 cita a Carbonell contra la derogación tácita (pp. 209 y ss.) y a López Olvera sobre títulos (p. 127) |
| 22 | *Lenguaje Ciudadano. Un manual para quien escribe en la Administración Pública Federal* | Secretaría de la Función Pública (SFP) | Programa iniciado en 2004 según fuentes secundarias | No se localizó el original en gob.mx | **NO VERIFICADA**. Sólo hay referencias secundarias; no se usa como fundamento | Guía de lenguaje claro; conviene obtener el original |
| 23 | EC1816 "Elaboración práctica de iniciativas de ley" (estándar de competencia CONOCER) | CONOCER | 2026 (según el resultado de búsqueda) | https://www.conocer.gob.mx/contenido/publicaciones_dof/2026/segunda_so/EC1816.pdf | **NO VERIFICADA** (la URL redirige a la portada de CONOCER) | Posible referencia de perfil de competencias; queda pendiente |
| 24 | Criterios del CJF o del OAJ sobre técnica normativa o lenguaje incluyente en acuerdos generales | — | — | — | **NO LOCALIZADOS**. No se encontró ningún acuerdo, manual ni lineamiento público del CJF o del OAJ que regule la técnica de redacción de sus acuerdos generales | Ver Advertencias |

---

## 2. Reglas y criterios extraídos

Abreviaturas de fuente: **MTL** = Minor y Roldán, *Manual de técnica legislativa* (2006); **RCD** = Reglamento de la Cámara de Diputados; **RS** = Reglamento del Senado; **LinInic** = Lineamientos CJEF de iniciativas (DOF 25-05-2022); **LinReg** = Lineamientos CJEF de reglamentos (DOF 25-05-2022); **SG** = Sánchez Gómez (2012); **FHP** = Manual de la Fundación Humanismo Político; **GTO** = Apuntes Legislativos 7, Guanajuato; **RF** = Rosas Fregoso (2021).

### 2.1 Requisitos jurídicos vinculantes (A)

| Regla | Norma y artículo exacto | A qué instrumentos aplica |
|---|---|---|
| Elementos indispensables de la iniciativa: I. Encabezado o título; II. Planteamiento del problema; III. Problemática desde la perspectiva de género, en su caso; IV. Argumentos que la sustenten; V. Fundamento legal; VI. Denominación del proyecto de ley o decreto; VII. Ordenamientos a modificar; VIII. Texto normativo propuesto; IX. Artículos transitorios; X. Lugar; XI. Fecha; XII. Nombre y rúbrica del iniciador | RCD art. 78.1 | Iniciativas que se presentan en la Cámara de Diputados |
| Las iniciativas de reforma constitucional se presentan por separado de las de legislación secundaria; si están correlacionadas, la relación se señala en los argumentos de ambas | RCD art. 77.5 (adicionado DOF 07-03-2023); en el Senado, RS art. 171.1 | Iniciativas (ambas Cámaras) |
| Elementos del dictamen: encabezado con el ordenamiento a crear o modificar; comisión; fundamento; contenido y planteamiento del problema; antecedentes; iniciador; proceso de análisis; "en su caso, valoración de impacto presupuestal, regulatorio u otro"; análisis de los textos propuestos; si es positivo: proyecto de decreto, denominación, texto normativo y **artículos transitorios**; firmas; lugar y fecha | RCD art. 85.1, fr. I-XV | Dictámenes de comisiones de Diputados |
| Toda iniciativa contiene al menos: I. encabezado o título con el señalamiento preciso del o de los ordenamientos; II. fundamento legal; III. exposición de motivos (razones, alcance y competencia constitucional, descripción del proyecto y, en su caso, relación con los ODS de la Agenda 2030); IV. texto normativo, señalando denominación, naturaleza y ámbito de aplicación; **V. régimen transitorio y, en su caso, el señalamiento de la legislación a derogar o abrogar**; VI. lugar y fecha; VII. nombre y firma | RS art. 169.1 | Iniciativas en el Senado |
| En ordenamientos nuevos "se procurará que el texto normativo se estructure en libros; los libros en títulos; los títulos en capítulos; los capítulos en secciones; las secciones en artículos; los artículos en fracciones y las fracciones en incisos". El artículo primero establece el alcance y la competencia constitucional. La división en libros sólo procede en textos muy extensos. La denominación debe coincidir con la naturaleza, el objeto y los ámbitos de validez: "General" para competencia concurrente y "Federal" para la aplicada por autoridades federales | RS art. 169.2 | Iniciativas de ordenamientos nuevos en el Senado. Como criterio orientador sirve para cualquier norma (D) |
| Elementos del dictamen en el Senado, incluido "en su caso, texto normativo y régimen transitorio" | RS art. 190.1, fr. I-X | Dictámenes del Senado |
| Una vez aprobado, el proyecto sólo puede modificarse para hacer "las correcciones que demanden el buen uso del lenguaje y la claridad de las leyes o decretos", sin cambiar el sentido | RCD art. 93.1; RS art. 211.1 | Proyectos aprobados (corrección de estilo) |
| Fórmula de promulgación: "El Congreso de los Estados Unidos Mexicanos decreta: (texto de la ley o decreto)" | CPEUM art. 70 | Leyes y decretos del Congreso |
| "En la interpretación, reforma o derogación de las leyes o decretos, se observarán los mismos trámites establecidos para su formación" (paralelismo de formas) | CPEUM art. 72, apartado F | Leyes y decretos del Congreso. Por analogía, sirve para que un acuerdo general sólo se modifique por otro acuerdo del mismo órgano (D) |
| Vigencia supletoria: las disposiciones de observancia general "obligan y surten sus efectos tres días después de su publicación en el Periódico Oficial" (más un día por cada 40 km en otros lugares). Si la disposición fija el día en que debe comenzar a regir, obliga desde ese día, "con tal de que su publicación haya sido anterior" | CCF arts. 3o. y 4o. | Leyes, reglamentos, circulares y disposiciones de observancia general (federal y supletorio). Consecuencia práctica: el transitorio de entrada en vigor no debe fijar una fecha anterior a la publicación |
| No retroactividad en perjuicio | CCF art. 5o. (y CPEUM art. 14) | Todas |
| "La ley sólo queda abrogada o derogada por otra posterior que así lo declare expresamente o que contenga disposiciones total o parcialmente incompatibles con la ley anterior" | CCF art. 9o. | Base legal de la distinción entre derogación expresa y tácita |
| Los actos administrativos de carácter general (reglamentos, decretos, acuerdos, NOM, circulares, formatos, lineamientos, criterios, metodologías, instructivos, directivas, reglas, manuales…) que expidan las dependencias y los organismos descentralizados de la APF "deberán publicarse en el Diario Oficial de la Federación para que produzcan efectos jurídicos" | LFPA art. 4 | **Sólo la APF** (LFPA art. 1). No aplica al PJF |
| Se publican en el DOF, entre otros: fr. II, los decretos, reglamentos, acuerdos y órdenes del Ejecutivo Federal de interés general; fr. III, los acuerdos, circulares y órdenes de las dependencias del Ejecutivo de interés general; **fr. V, "Los acuerdos y resoluciones de interés general emitidos por el Pleno de la Suprema Corte de Justicia de la Nación, el Consejo de la Judicatura Federal y el Tribunal Electoral del Poder Judicial de la Federación"**; fr. IX, las fe de erratas | Ley del DOF art. 3o. (texto vigente con reforma de 31-05-2019) | Publicación oficial. Nota: la fracción V sigue nombrando al CJF |
| Cuando el Pleno del OAJ estime que sus reglamentos, acuerdos o resoluciones pudieran resultar de interés general, **deberá ordenar su publicación en el DOF** | LOPJF art. 91, párr. tercero | Acuerdos y reglamentos del OAJ |
| El OAJ puede "Establecer mediante acuerdo general las Comisiones y áreas administrativas…" (fr. I) y "Expedir los reglamentos interiores… y todos aquellos acuerdos generales que fueren necesarios…" (fr. II) | LOPJF art. 80, fr. I y II; CPEUM art. 100 ("De conformidad con lo que establezca la ley, el órgano de administración judicial estará facultado para expedir acuerdos generales para el adecuado ejercicio de sus funciones") | Fundamento competencial que debe aparecer en el exordio de los acuerdos generales del OAJ |
| Los acuerdos generales del CJF "continuarán vigentes en todo lo que no se oponga a la Constitución… y a la presente Ley hasta en tanto el Órgano de Administración Judicial y el Tribunal de Disciplina Judicial emitan sus propios Acuerdos" | LOPJF, transitorio Décimo Noveno (DOF 20-12-2024) | Control de vigencia: un acuerdo nuevo del OAJ debe identificar con precisión el acuerdo del CJF que sustituye o abroga |
| Las comisiones, al dictaminar, valoran el impacto presupuestario de las iniciativas; el Ejecutivo evalúa el impacto presupuestario de las iniciativas que presenta | LFPRH art. 18, párrs. tercero y cuarto | Iniciativas y dictámenes |
| "Regulación" incluye "acuerdos, normas, reglamentos, circulares, lineamientos, reglas, manuales o cualquier otra disposición de naturaleza análoga". Para producir efectos jurídicos, las regulaciones deben publicarse en el "Medio de Difusión Oficial que corresponda". El AIR debe contener problemática y objetivos, alternativas regulatorias y no regulatorias, costos y beneficios, cumplimiento de los principios de simplificación y digitalización, indicadores y consulta pública. La consulta pública dura al menos 20 días. Quedan exentos los decretos, acuerdos y reglamentos del titular del Ejecutivo y sus iniciativas, entre otros | LNETB arts. 3 fr. XXVIII, 5, 35-39 | Sujetos obligados: APF de los tres órdenes. Los Poderes Legislativo y Judicial y los organismos autónomos son sujetos obligados "en los términos de esta Ley" (art. 3 fr. XXXIV), y su art. 18 los obliga a designar una instancia de coordinación y a implementar simplificación, digitalización y registro de trámites mediante convenios. **Que el AIR sea exigible a los acuerdos generales del OAJ es dudoso** (ver §4) |
| Principios de la regulación: certeza jurídica (regulaciones "claras y transparentes"), proporcionalidad y **armonización regulatoria** ("se deben evitar contradicciones y duplicidades entre Regulaciones"); el AIR busca "Crear Regulaciones claras y simples" | LNETB arts. 6 fr. II, IV y V, y 34 fr. III | Parámetros con base legal para criticar duplicidades y oscuridad en regulaciones administrativas |

### 2.2 Proyectos del Ejecutivo Federal: criterios de la CJEF (B; vinculantes para la APF)

| Regla | Fuente |
|---|---|
| El proyecto de iniciativa contiene: I. encabezado o título (legislación a modificar y materia); II. fundamento de la competencia del Congreso; III. exposición de motivos dividida en a) objeto cualitativo, b) diagnóstico con datos y su fuente, y c) descripción; IV. **artículo descriptivo**; V. decreto con el texto normativo; VI. transitorios | LinInic art. 4 |
| **Artículo descriptivo**: indica "los artículos, bases, apartados, párrafos, fracciones, incisos, subincisos, numerales y cualquier otra división…", así como el título, capítulo o sección cuya denominación se modifica, "seguido del nombre de la disposición normativa correspondiente" | LinInic art. 4 fr. IV; LinReg art. 8 fr. III |
| Se llama "**Artículo único**" cuando se expide, reforma, adiciona o deroga una sola ley o reglamento. Si el decreto abarca varios ordenamientos, lleva "un artículo por cada uno de ellos" con **números ordinales** progresivos | LinInic art. 4 fr. IV, párr. 2; LinReg art. 8 fr. III, párr. 2 |
| El artículo descriptivo termina con la frase "**para quedar como sigue:**" | LinInic art. 4 fr. IV, párr. 3; LinReg art. 8 fr. III, párr. 3 |
| Organización del texto: capítulos, secciones, artículos, apartados, fracciones, incisos y subincisos; "Excepcionalmente, si el texto es muy extenso, la división estructural puede iniciar con títulos" | LinInic art. 4 fr. V; LinReg art. 8 fr. IV |
| En reformas, "se deben sustituir con **puntos suspensivos** las porciones normativas que subsistan sin cambios en aquellos artículos modificados parcialmente" | LinInic art. 4 fr. V, párr. 2; LinReg art. 8 fr. IV, párr. 2 |
| "Los artículos deben organizarse progresivamente en **números cardinales** y redactarse de forma ordenada, clara, breve y sencilla, sistemática y congruente con el orden jurídico nacional" | LinInic art. 4 fr. V, párr. 3; LinReg art. 8 fr. IV, párr. 3 |
| Si se abroga una ley o un reglamento, después de su denominación se indica **la fecha de su publicación en el DOF** | LinInic art. 4 fr. V, párr. 4; LinReg art. 8 fr. V |
| Los transitorios indican: a) entrada en vigor; b) normas que se derogan o abrogan; c) reglas que den certidumbre en la transición; d) demás circunstancias de tiempo, modo y lugar | LinInic art. 4 fr. VI; LinReg art. 8 fr. VI |
| Exordio de los decretos reglamentarios, en este orden: nombre y cargo del titular del Ejecutivo; fundamento constitucional; fundamento legal; la frase "he tenido a bien expedir el siguiente", **sin signos de puntuación al final** | LinReg art. 8 fr. I |
| Denominación del decreto: breve, indica el tipo de cuerpo normativo y lo que regula | LinReg art. 8 fr. II |
| **Cuadro comparativo** en tres columnas (texto vigente, texto propuesto, justificación), con una fila por cada artículo, párrafo, fracción, inciso o subinciso | LinInic art. 5 fr. III |
| Cuadro comparativo de reglamentos: en la 1a. columna se transcribe íntegro el artículo modificado aunque el cambio sea parcial, sin notas como "sin texto" o "se suprime"; las diferencias se marcan con **tachado** en la 1a. columna y **negritas** en la 2a.; la confrontación es párrafo a párrafo; si no hay antecedente, el cuadro lleva dos columnas | LinReg art. 9 fr. V |
| Formato de impresión de reglamentos: Arial 12, interlineado 1.15, márgenes 6.5/2.5/3/3 cm, sin logotipos | LinReg art. 12 (sólo para el papel oficial de Presidencia; dato de forma, no de técnica) |
| Plazos legales para expedir reglamentos: presentar el proyecto al menos 15 días hábiles antes del vencimiento | LinReg art. 7 |

### 2.3 Estructura del texto normativo

| Regla | Cat. | Fuente |
|---|---|---|
| La estructura debe permitir identificar claramente las partes fundamentales; conviene ordenarla según el objeto: secuencia procesal en leyes procesales; órganos y funciones en leyes orgánicas | C | MTL p. 13 |
| No crear un cuerpo normativo autónomo para lo que pertenece a otro ordenamiento (ejemplo: Ley contra la usura de Tlaxcala, que reitera soluciones ya previstas en otras normas) | C | MTL pp. 13-15 |
| **Título del ordenamiento**: corto, preciso, único, completo, precedido por la categoría de la norma (ley, reglamento…) y sin nada innecesario para identificarlo. Ejemplos correctos: "Ley del Mercado de Valores", "Reglamento de la Ley General de Población" | C | MTL p. 16 |
| División temática: la exposición de motivos (no obligatoria) y las disposiciones obligatorias (preliminares, principales y finales) | C | MTL pp. 16-17 |
| La exposición de motivos **no forma parte de la ley**; se recomienda que contenga: fundamento de la competencia para legislar, motivación, antecedentes y criterios jurisprudenciales, objetivos, y valoración del impacto normativo con las innovaciones | C (B, A en lo que la exigen RCD art. 78 y RS art. 169) | MTL pp. 17-18 |
| Las normas no deben contener razonamientos persuasivos, fundamentos o aclaraciones didácticas, políticas o éticas; su lugar es la exposición de motivos. "La ley sólo ordena, no da explicaciones, ni teoriza, ni enseña" | C | MTL pp. 18, 55, 57 |
| Las disposiciones preliminares o generales precisan el objeto y la finalidad (sin frases meramente declarativas), los ámbitos de validez espacial, personal, material y, excepcionalmente, temporal; las definiciones, eventualmente; y las reglas de supletoriedad, si las hay | C | MTL pp. 23-25 |
| Las definiciones sólo se recomiendan cuando son estrictamente necesarias para entender las normas o precisar términos técnicos | C | MTL p. 27 |
| Disposiciones principales: competencias y órganos aplicadores, obligaciones, prohibiciones o permisiones, y sanciones | C | MTL pp. 30-32; cuestionario p. 89 |
| División en libros sólo para códigos o leyes muy voluminosas; títulos sólo en proyectos extensos | C (A en el Senado: RS art. 169.2) | MTL p. 37; RS art. 169.2 |
| En la práctica mexicana el orden es título, capítulo, sección, subsección; "La tendencia actual es la de colocar las secciones después de los capítulos y no viceversa" | B/C | MTL p. 38 |
| Tabla de niveles de división según la complejidad, de una a cinco divisiones: Título o Capítulo; Título y Capítulo o Capítulo y Sección; … hasta Parte-Título-Capítulo-Sección-Subsección o Título-Capítulo-Sección-Subsección-apartado | C | MTL p. 38 |
| "Toda agrupación… sigue a la denominación del número cardinal correspondiente (en el caso de los títulos) o de un número romano (en los capítulos) y poseen su propia denominación clasificatoria" (sic) | C | MTL p. 36. Ver §4: los ejemplos del propio manual usan títulos en ordinal ("TÍTULO PRIMERO") |
| **Regla de las dos unidades**: "nunca puedo poner libro primero, título primero y no un título segundo, ya que siempre, los elementos mínimos de división de una unidad son dos". Libros, títulos y capítulos van en números romanos, o con letra ("capítulo primero"), siempre que haya una diferenciación | B (congreso local) | GTO p. 24 |
| Caso contrario aceptado en la práctica: "CAPÍTULO ÚNICO" (LFPA, Título Primero) | D | MTL pp. 25, 37 (ejemplos) |
| Cada capítulo, título y libro debe tener un nombre que identifique su tema; "LIBRO X" y "TÍTULO X" en mayúsculas; capítulos y secciones con su nombre en minúsculas (salvo la inicial); centrados | C | FHP p. 12 |
| Al agregar un nivel superior (por ejemplo, títulos), todo el ordenamiento pasa a ese nivel de agregación | C | FHP p. 12, inciso d) |
| Epígrafes de artículos (no es práctica mexicana): si se usan, todos los artículos los llevan; deben ser breves, con la terminología del artículo, y no sustituyen texto del artículo | C | MTL p. 37, nota |
| Recomendación opuesta: "Los artículos no llevan nombre que precise su contenido" | C | FHP p. 14 |

### 2.4 El artículo y sus divisiones; numeración

| Regla | Cat. | Fuente |
|---|---|---|
| El artículo es la unidad básica; se estructura de lo general a lo particular y de la regla a la excepción | C | MTL p. 40 |
| Cada artículo contiene una sola disposición o, si son varias, guardan unidad temática | C | MTL p. 40 |
| "Cada artículo, un tema. Cada párrafo, una oración. Cada oración, una idea"; artículos breves de frases cortas | C | FHP p. 14 |
| "Artículo" se escribe con "A" mayúscula y se numera con arábigos. "En México, existe la práctica legislativa de numerar los primeros 10 artículos con números ordinales" (sic), práctica que el manual califica de "anacrónica" | C | MTL p. 40 (cotejado con la imagen). **Precisión verificada:** en el texto vigente se usan ordinales del 1o. al 9o. y cardinales desde el 10 ("Artículo 9o." y "Artículo 10." en la CPEUM; "Artículo 9o.-" y "Artículo 10.-" en el CCF) |
| Leyes recientes numeran todos los artículos en cardinal ("Artículo 1." en la LOPJF de 2024 y en la LNETB de 2025). La CJEF exige "números cardinales" en los proyectos del Ejecutivo | B (A para la APF) / D | LinInic art. 4 fr. V; LinReg art. 8 fr. IV; texto de la LOPJF y la LNETB |
| **Fracciones** en números romanos, sin paréntesis, seguidos de punto; luego **incisos** con letra minúscula y paréntesis de cierre "a)"; luego **subincisos** o numerales en arábigo con paréntesis de cierre ("1.") | B/C | MTL pp. 41, 43-44; FHP p. 15; GTO p. 25 |
| "Después de las fracciones, necesariamente van siempre los incisos"; los artículos que usan incisos en lugar de fracciones muestran "falta de sistemática" | B (congreso local) | GTO p. 25 |
| El inciso no debe contener una nueva disposición normativa en sí mismo; puede ser una enumeración taxativa o enunciativa. Va precedido de una cabeza que termina en dos puntos, cada elemento cierra con punto y coma y el último con punto | C | MTL p. 41 |
| Precisar si una enumeración es ejemplificativa o taxativa | C | FHP p. 21 |
| Los párrafos no se numeran, empiezan con mayúscula y terminan en punto y aparte. Conviene no multiplicarlos | C | MTL p. 44; FHP p. 15 |
| Las fracciones pueden agruparse en apartados o bases si el contenido es muy grande. "No es necesario colmar una división anterior para proceder a la siguiente" | C | FHP p. 15 |
| Variante de párrafos numerados con incisos y luego fracciones (modelo del COFIPE y de España): facilita la cita ("artículo 35.2"). Es innovación, no regla mexicana general | C | MTL pp. 46-48. Reglamentos de las Cámaras usan "numeral" (RCD art. 78.1 se cita "numeral 1") |
| La numeración de artículos es progresiva y sin interrupciones | C | FHP p. 14, citando a Aguiló |
| Al citar, se escribe el título completo de la ley, no se abrevia "artículo", los números van en arábigos y la cita va de la parte más pequeña al artículo ("fracción II del artículo 5") | C | FHP pp. 22-23 |

### 2.5 Disposiciones finales y transitorios

| Regla | Cat. | Fuente |
|---|---|---|
| Objeto de las disposiciones finales: el tránsito de la situación jurídica anterior a la nueva. Tipos: puesta en vigor; límites de eficacia; disposiciones de coordinación, que modifican otros textos; abrogatorias (supresión total) o derogatorias (parcial); y propiamente transitorias | C | MTL pp. 33-34 |
| Si la norma no fija su entrada en vigor, ésta se resuelve supletoriamente con el CCF art. 3o. (tres días) | A (CCF) / C | MTL p. 34, nota; CCF arts. 3o. y 4o. |
| **Contra la derogación tácita genérica**: la fórmula "se derogan todas las disposiciones legales, reglamentarias y administrativas de carácter general que se opongan a la presente" "introduce al sistema diversos problemas en cuanto a la identificación de las disposiciones vigentes y las no vigentes" | C | MTL p. 34, nota (remite a Carbonell, *Elementos de técnica legislativa*, pp. 209 y ss.) |
| Postura contraria: el FHP recomienda "Incorporar una leyenda que establezca la derogación de todas las disposiciones que se opongan a la ley…", aunque también dice que "Es mejor la derogación expresa que la implícita" | C | FHP pp. 15 y 17 |
| Se recomienda que los transitorios precisen el régimen aplicable a las situaciones nacidas antes de la nueva ley: ley nueva, ley antigua o regulación específica | C | MTL p. 35 |
| Los transitorios forman parte del texto normativo y "es práctica en técnica legislativa que posean su propia numeración", independiente de la del articulado | B/C | MTL p. 35 |
| Transitorios numerados con **ordinales en letra**; si hay uno solo, "Único"; sin la palabra "artículo" | C | FHP p. 15. Contraste: el MTL p. 35 reproduce transitorios con "Artículo Primero.", "Artículo Segundo." (LFPA de 1994 y Ley Federal de Sanidad Animal), y la práctica vigente usa ambas formas (§3) |
| Contenidos posibles: entrada en vigor; abrogaciones expresas **con la fecha de publicación en el DOF** de la ley abrogada; derogaciones; ultraactividad de la ley anterior para situaciones en trámite; aplicación inmediata o retroactiva (en beneficio); regímenes provisionales; habilitaciones reglamentarias | C (B y A para la APF por LinInic y LinReg) | FHP pp. 15-16; LinInic art. 4 fr. VI; LinReg art. 8 fr. VI |
| Transitorios: entrada en vigor; pérdida de vigencia de leyes anteriores; reformas a otras leyes; disposiciones provisionales | B | GTO p. 25 |
| Los transitorios con plazo para que el Congreso expida una ley activan la coordinación bicamaral | A (Senado) | RS art. 170 |
| Las disposiciones transitorias deben perder vigencia al cumplirse la transición o en el plazo que ellas fijen | C | MTL p. 33 |

### 2.6 Decretos de reforma (modificatorios)

| Regla | Cat. | Fuente |
|---|---|---|
| La disposición modificatoria tiene forma de decreto de reforma, adición o derogación. Su título contiene la palabra "decreto", la modalidad o modalidades (reforma, adición, derogación) y el título de la ley o leyes modificadas | C | FHP p. 16 |
| Los artículos del decreto van en ordinales en letra; si hay uno solo, "Único" | C (B para la APF) | FHP p. 16; LinInic art. 4 fr. IV |
| Para modificar una palabra o expresión de un párrafo se redacta de nuevo el párrafo completo | C | FHP p. 16 |
| Se prefiere la derogación expresa, en un artículo específico del decreto | C | FHP p. 17 |
| Excepciones, suspensiones y prórrogas de vigencia deben ser explícitas | C | FHP p. 17 |
| Para sustituir un término repetido en muchos preceptos puede usarse una fórmula general de sustitución | C | FHP p. 18 |
| La recuperación de un texto derogado debe ser expresa: no basta derogar la norma derogatoria | C | FHP p. 18 |
| Si un texto se ha modificado muchas veces, conviene reformularlo íntegro | C | FHP p. 18 |
| Los artículos derogados se conservan con la leyenda "Se deroga." para no alterar la numeración (por ejemplo, "Artículo 69-A.- Se deroga."). Las adiciones intercaladas usan "Bis" ("Artículo 69 C Bis", "XXIII Bis.") | D (práctica observada) | LFPA arts. 69-A y 69 C Bis; CPEUM art. 73 fr. XXIII Bis; ejemplo de "TL. Derogada;" en MTL p. 44 |

### 2.7 Redacción y lenguaje

| Regla | Cat. | Fuente |
|---|---|---|
| El estilo legislativo debe ser íntegro, unívoco y certero; prima la claridad sobre la elegancia | C | MTL p. 55 |
| **"Es regla fundamental de la técnica legislativa que todo precepto legal debe formularse en tiempo presente del modo indicativo"**, salvo que sea imprescindible el futuro o el pasado. El pretérito es correcto para actos anteriores a la ley | C | MTL pp. 55-56 |
| Es práctica común redactar derechos o facultades potestativas en futuro ("podrán"). Según el manual, "No pierde fuerza expresiva el término 'podrán' si se conjuga en presente indicativo: 'pueden'" | C | MTL p. 56 |
| Postura más laxa: "De preferencia usar el tiempo presente en modo indicativo. Con frecuencia también se usa el futuro". Usar verbos que indiquen la acción deóntica: estar obligado, estar permitido, prohibir | C | FHP p. 19 |
| Frases breves y simples; con todo, es preferible una expresión larga y clara a una breve de difícil comprensión | C | MTL p. 57 |
| Lenguaje directo; preferir la formulación positiva a la negativa | C | MTL p. 58; SG pp. 88-89 (ejemplo del art. 9o. constitucional); FHP p. 20 ("Evitar la doble negación") |
| Identificar los sujetos activos y pasivos. "Es recomendable evitar la forma pasiva de los verbos cuando de su empleo no resulte claro el agente o el destinatario" | C | MTL p. 59; FHP p. 19 ("Precisar claramente los sujetos… Evitar el uso de pronombres"; "No usar la forma pasiva si provoca confusión") |
| Uso excesivo del pronombre "se" (pasiva refleja e impersonal) y su efecto en la identificación del agente | C | SG pp. 109-112, art. 5o. constitucional como ejemplo |
| **Homogeneidad terminológica**: los mismos conceptos se expresan siempre con los mismos términos, también entre textos afines; "no es correcto el uso de sinónimos" | C | MTL p. 60; FHP pp. 19-20 |
| Los términos jurídicos se usan con su significado técnico, en este orden: definición legal, jurisprudencia, doctrina | C | MTL p. 61; FHP p. 21 |
| Definir un término cuando no es unívoco o se usa en una acepción no habitual. Si ya está definido en otra ley, es ocioso repetir la definición | C | MTL pp. 62-63 |
| Las definiciones son estipulativas; al definir no se usa el término definido ni un sinónimo; puede concentrarse en un artículo de definiciones | C | FHP p. 21 |
| Evitar términos extranjeros y neologismos; si son imprescindibles, definirlos | C | MTL p. 63; FHP p. 20 |
| Siglas sólo si son de uso corriente, definidas, en mayúsculas y sin puntos | C | FHP p. 21 |
| **Remisiones**: evaluar si la referencia interna es necesaria o si conviene una formulación completa; **evitar referencias en cadena** (X remite a Y, que remite a Z) | C | MTL p. 64 |
| Remitir a una división superior al artículo sólo si se aplican todos sus enunciados (contraejemplo: el art. 107 de la Ley Agraria, "en lo que no contravengan…") | C | MTL p. 65 |
| La referencia indica con precisión el artículo y, si no es al artículo completo, las divisiones inferiores | C | MTL p. 65 |
| Distinguir el reenvío formal o dinámico (incluye las reformas posteriores del texto remitido) del material o estático (texto congelado, inusual y que debe evitarse; si se usa, advertirlo expresamente). En la remisión a reglamentos hay que cuidar la reserva de ley | C | MTL pp. 65-67 |
| Preferir remisiones expresas y específicas a las tácitas y genéricas | C | FHP p. 20 |
| Disyunción inclusiva con "o"; evitar "y/o" salvo necesidad sin ambigüedad; "y" queda para la copulativa | C | MTL pp. 67-68 |
| Evitar ambigüedad (polisemia) y vaguedad; los términos abiertos ("en breve término") son admisibles en una constitución, no en una ley de procedimiento | C | MTL pp. 53-54 |
| Cuidar los rasgos de modalidad y valoración de los verbos (por ejemplo, "poner", "colocar" y "acomodar" imponen exigencias distintas); elegir el verbo menos exigente que cumpla el fin | C | SG pp. 86-87 |
| Evitar adverbios y frases adverbiales ociosas ("a la vez") | C | SG p. 106 |
| Revisar los conectores ("así como", "y", "para") en artículos de objeto: su mal uso confunde objeto y finalidad (ejemplo: art. 1 de la Ley General de Acceso de las Mujeres a una Vida Libre de Violencia, LGAMVLV) | C | SG pp. 113-117 |
| Edades: "18 años cumplidos", no "más de 18 años"; rangos inequívocos | C | FHP p. 22 |
| Números con letra; fechas en arábigo con el mes en letra; horas en formato de 24 horas | C | FHP p. 22 (criterio editorial; la práctica DOF varía) |
| No usar ejemplos en la norma salvo que ayuden sin restar generalidad | C | FHP p. 20; MTL p. 57 |

### 2.8 Lenguaje incluyente

| Regla | Cat. | Fuente |
|---|---|---|
| Lenguaje incluyente: preferir sustantivos colectivos ("población", "comunidad"), perífrasis ("la población mexicana"), metonimia ("personal de enfermería", "autoría mexicana") y desdoblamiento "con medida". Sustituir "hombre" genérico por "persona". Combinar estrategias | C | RF pp. 51-61 |
| La autora registra la posición contraria de la RAE (masculino genérico, desdoblamiento sólo cuando su ausencia induzca a error) y discrepa de ella | C | RF pp. 52-55 |
| Postura moderada: el desdoblamiento "es adecuado pero no necesariamente mejor"; conviene buscar expresiones de género neutro si se conserva la precisión y la claridad | C | FHP p. 22 |
| La "Problemática desde la perspectiva de género, en su caso" es elemento de la iniciativa en Diputados, y la perspectiva de género debe aparecer en el contenido del dictamen | A (Diputados) | RCD arts. 78.1 fr. III y 85.1 fr. IV |
| Práctica observada en el PJF/OAJ: "personas servidoras públicas", "las personas titulares de los órganos jurisdiccionales", "La o el integrante", "Ministras y Ministros" | D | LOPJF (por ejemplo, art. 79 "La o el integrante que disintiere…" y art. 90 "personas servidoras públicas"); AG-POAJ-006/2026 |

### 2.9 Lógica normativa y sistema

| Regla | Cat. | Fuente |
|---|---|---|
| **Coherencia**: cada caso tiene una sola solución. Las antinomias internas o externas pueden incluso llevar a la inconstitucionalidad por violar la seguridad jurídica (tesis I.3o.C.377 C, Semanario Judicial de la Federación y su Gaceta, enero de 2003, citada por el manual) | C | MTL pp. 72-75. La tesis no se verificó por separado |
| **Completitud**: prever los casos relevantes mediante categorías genéricas. Las lagunas técnicas aparecen cuando falta una norma indispensable para aplicar otra | C | MTL pp. 75-76, 85 |
| **No redundancia**: no repetir soluciones ya previstas, porque modificar una norma redundante produce contradicción. Ejemplo: el art. 12 de la Ley de Asistencia Social, que transcribe el art. 168 de la Ley General de Salud, y el plazo de la Ley de Ingresos de Tlaxcala en dos ordenamientos. Se admite repetir conceptos para contextualizar y evitar remisiones complejas | C | MTL pp. 76-79 |
| Confusión de sujetos que genera contradicción de competencias: el art. 9o. de la Ley de Asistencia Social faculta al DIF para emitir NOM, contra el art. 44 de la Ley Federal sobre Metrología y Normalización (LFMN) | C | MTL pp. 59-60 |
| Base legal moderna equivalente para regulaciones administrativas: "Armonización regulatoria: se deben evitar contradicciones y duplicidades entre Regulaciones" | A | LNETB art. 6 fr. V |

### 2.10 Racionalidades y cuestionario de control (base para una checklist)

| Regla | Cat. | Fuente |
|---|---|---|
| Cinco niveles de racionalidad (Atienza): lingüística (R1), jurídico-formal (R2), pragmática (R3, con la económica como subespecie), teleológica (R4) y ética (R5) | C | MTL pp. 83-88 |
| **Cuestionario R1** (lingüística): ¿la estructura permite identificar las partes?, ¿las agrupaciones tienen elementos comunes?, ¿hay homogeneidad de extensión?, ¿el título corresponde al contenido y es breve, preciso y completo?, ¿la exposición de motivos funda, motiva y valora el impacto?, ¿las disposiciones generales tienen objeto, ámbitos y definiciones?, ¿las principales tienen competencias, obligaciones y sanciones?, ¿las finales regulan vigencia, eficacia, coordinación, abrogación y transición?, ¿la división es equilibrada y la numeración y denominaciones son correctas?, ¿incisos y párrafos justificados?, ¿se evitan términos ambiguos o vagos?, ¿presente de indicativo?, ¿enunciados breves, directos y claros?, ¿terminología constante?, ¿definiciones precisas?, ¿referencias útiles? | C | MTL pp. 88-89 |
| **Cuestionario R2** (formal): coherencia, lagunas, antinomias, supletoriedad, constitucionalidad, reserva de ley, desarrollo reglamentario, reenvíos y remisiones, legalidad de las sanciones, competencias, "¿Se precisan adecuadamente las derogaciones expresas o tácitas?" | C | MTL p. 90 |
| **R3 a R5**: estudios empíricos, costos a particulares, manifestación de impacto regulatorio, impacto presupuestal, alternativas menos costosas, incentivos, intereses, fines sociales, seguimiento, impactos sociales, aceptación, dignidad y autonomía | C | MTL pp. 90-91 |
| **Cuestionario de validación lingüística** para lectores experto y lego: 1) ¿qué dice el enunciado?; 2) ¿el mensaje está claro?; 3) ¿hay una forma más simple?; 4) ¿en qué basa su interpretación (léxico, sintaxis, contexto)?; 5) ¿cómo clarificarlo? | C | SG pp. 117-119 |

---

## 3. Convenciones mexicanas de formato de decretos y transitorios (con ejemplos textuales)

### 3.1 Decreto del Congreso (promulgación)

- Fórmula constitucional (CPEUM art. 70): **"El Congreso de los Estados Unidos Mexicanos decreta: (texto de la ley o decreto)"**.
- Ejemplo real (Ley del DOF, texto original): `DECRETO` / `"El Congreso de los Estados Unidos Mexicanos, Decreta:` / `LEY DEL DIARIO OFICIAL DE LA FEDERACION Y GACETAS GUBERNAMENTALES`.
- Ejemplo de expedición de una ley nueva (LNETB, DOF 16-07-2025): `SE EXPIDE LA LEY NACIONAL PARA ELIMINAR TRÁMITES BUROCRÁTICOS` / `Artículo Único.- Se expide la Ley Nacional para Eliminar Trámites Burocráticos, para quedar como sigue:`.
- Cierre con promulgación (decreto constitucional de 07-10-2026): `En cumplimiento de lo dispuesto por la fracción I del Artículo 89 de la Constitución Política de los Estados Unidos Mexicanos, y para su debida publicación y observancia, expido el presente Decreto en la Residencia del Poder Ejecutivo Federal, en la Ciudad de México, a 07 de octubre de 2026.- Claudia Sheinbaum Pardo, Presidenta de los Estados Unidos Mexicanos.- Rúbrica.- …Secretaria de Gobernación.- Rúbrica.`

### 3.2 Artículo descriptivo de los decretos de reforma (fórmula "Se reforman…, se adicionan… y se derogan…")

Ejemplos textuales verificados:

- Ley del DOF, DOF 05-06-2012: `ARTÍCULO ÚNICO. Se reforman los artículos 4o.; 5o., 6o., 7o., 8o., 9o. y 11; se adicionan los artículos 3o., con una fracción VIII; 7o. Bis y 10. Bis; y se deroga el artículo 12 de la Ley del Diario Oficial de la Federación y Gacetas Gubernamentales para quedar como sigue:` seguido de `……….`
- Ley del DOF, DOF 31-05-2019: `Artículo Único. Se reforman los artículos 1o.; 2o.; 3o., fracciones I, V y VI; 4o.; 5o.; 7o. Bis, fracciones I, III y V; 8o.; 9o. y 10; se adicionan una fracción VII al artículo 3o., pasando las actuales VII y VIII a ser VIII y IX, y una fracción IV al artículo 6o.; y se derogan los artículos 10 Bis y 11, de la Ley del Diario Oficial de la Federación y Gacetas Gubernamentales, para quedar como sigue:`
- CPEUM, DOF 07-10-2026: `Artículo Único.- Se reforman los artículos 82, párrafo primero y su fracción I, párrafo primero; 116, párrafo segundo, fracción I, párrafo quinto, y 122, Apartado A, fracción III, párrafo segundo, y se adicionan a los artículos 82, fracción I, los párrafos segundo y tercero; 116, párrafo segundo, fracción I, un párrafo sexto; 122, Apartado A, fracción III, un párrafo tercero, y se recorre el subsecuente en su orden, de la Constitución Política de los Estados Unidos Mexicanos, para quedar como sigue:`
- Decreto con varios ordenamientos: un artículo por ordenamiento, con ordinales (LinInic art. 4 fr. IV). Ejemplo en la LFPA: `ARTÍCULO QUINTO.- Se adiciona un artículo 69 C Bis a la Ley Federal de Procedimiento…`
- Reforma de un reglamento interno de la Cámara, con denominación temática: `DECRETO por el que se reforman, adicionan y derogan diversas disposiciones del Reglamento de la Cámara de Diputados, en materia de lenguaje inclusivo y optimización de trámites y procedimientos parlamentarios.` (DOF 07-05-2025)

Convenciones que se desprenden (D, salvo lo marcado):

1. El orden de los verbos es **reforman → adicionan → derogan**, con punto y coma entre bloques y "y" antes del último.
2. La precisión baja hasta la porción exacta (artículo, párrafo, fracción, inciso, apartado).
3. Las adiciones se describen como "se adiciona [una fracción VII] al artículo 3o." o "se adiciona un artículo 69 C Bis".
4. Si hay corrimientos, se dice "pasando las actuales VII y VIII a ser VIII y IX" o "se recorre el subsecuente en su orden".
5. Se cierra con "para quedar como sigue:" (B: LinInic y LinReg).
6. Las porciones sin cambio se sustituyen por puntos suspensivos (B: LinInic y LinReg; en los DOF compilados aparece "……….").
7. La cita de artículos respeta la numeración del ordenamiento citado: "3o.", "7o. Bis", "10" (sin "o.").

### 3.3 Transitorios (ejemplos textuales)

Encabezado: `TRANSITORIOS` o `Transitorios`. Numeración: ordinales en letra ("Primero.", "Segundo.", o "PRIMERO.") o "Artículo Primero." en textos más antiguos.

- Entrada en vigor al día siguiente: `Primero. El presente Decreto entrará en vigor el día siguiente al de su publicación en el Diario Oficial de la Federación.` (CPEUM, 07-10-2026). También: `Primero.- El presente Decreto entrará en vigor al día siguiente de su publicación en el Diario Oficial de la Federación.` (LNETB, LOPJF).
- *Vacatio* en días: `Primero. El presente decreto entrará en vigor a los treinta días siguientes al de su publicación en el Diario Oficial de la Federación.` (Ley del DOF, 2012).
- Fecha cierta: `Primero. El presente Decreto entrará en vigor el 1o. de julio de 2019.` (Ley del DOF, 2019); `Artículo Primero. Esta ley entrará en vigor el 1o. de junio de 1995.` (LFPA original, citado en MTL p. 36).
- **Abrogación expresa con fecha de publicación**: `Segundo.- Se abroga la Ley General de Mejora Regulatoria, publicada en el Diario Oficial de la Federación el 18 de mayo de 2018.` (LNETB); `Segundo.- Se abroga la Ley Orgánica del Poder Judicial de la Federación, publicada en el Diario Oficial de la Federación el 7 de junio de 2021.` (LOPJF); `Segundo. Se abrogan los Lineamientos para la Elaboración y Revisión de los Reglamentos que Expida el Presidente de los Estados Unidos Mexicanos, publicados en el Diario Oficial de la Federación el 11 de octubre de 2019.` (LinReg).
- **Derogación genérica** (desaconsejada por MTL p. 34, pero frecuente): `Segundo. Se derogan todas aquellas disposiciones que se opongan a las contenidas en el presente decreto.` (Ley del DOF, 2012); `Artículo Segundo. Se derogan todas las disposiciones que se opongan a lo establecido en esta Ley, en particular los diversos recursos administrativos…` (LFPA, MTL p. 36).
- Régimen de asuntos en trámite: `Tercero. Los proyectos de iniciativas que se encuentren en trámite a la entrada en vigor de los presentes lineamientos se deben tramitar, en lo conducente, conforme a éstos.` (LinInic); `Artículo Tercero. En los procedimientos administrativos que se encuentren en trámite, el interesado podrá optar por su continuación conforme al procedimiento vigente durante su iniciación o por la aplicación de esta Ley.` (LFPA, MTL p. 36).
- Ultraactividad o continuidad de normas anteriores: `Décimo Noveno.- Los Acuerdos Generales emitidos por el Consejo de la Judicatura Federal continuarán vigentes en todo lo que no se oponga a la Constitución… y a la presente Ley hasta en tanto el Órgano de Administración Judicial y el Tribunal de Disciplina Judicial emitan sus propios Acuerdos.` (LOPJF).
- Aplicación diferida: `Segundo. Lo dispuesto en este Decreto será aplicable a partir del proceso electoral correspondiente al año 2028.` (CPEUM, 07-10-2026).
- Mandato de armonización con plazo: `Cuarto. El Congreso de la Unión realizará las adecuaciones a la Ley de Nacionalidad y a la legislación electoral dentro de los noventa días naturales siguientes a la entrada en vigor del presente Decreto.` (CPEUM, 07-10-2026).
- Cláusula presupuestal: `Tercero. La Secretaría de Gobernación realizará las acciones necesarias para que la implementación del presente Decreto se realice con los recursos aprobados a dicha dependencia… por lo que no requerirán recursos adicionales…` (Ley del DOF, 2012).
- Derogación de transitorios anteriores identificados por decreto y fecha: `Artículo Quinto. Se deroga el artículo primero transitorio de la Ley Federal de Sanidad Animal, reformado mediante decreto publicado en el Diario Oficial de la Federación de fecha 28 de diciembre del año dos mil uno.` (MTL p. 36).

### 3.4 Acuerdos generales del OAJ (práctica observada; categoría D)

Estructura observada en AG-POAJ-006/2026 (DOF 17-04-2026):

1. Rubro: "ACUERDO General del Pleno del Órgano de Administración Judicial que regula…".
2. Sello y clave: "Al margen un sello… Órgano de Administración Judicial.- AG-POAJ-006/2026."
3. **Exordio con fundamento**: "El Pleno del Órgano de Administración Judicial del Poder Judicial de la Federación, con fundamento en los artículos 94, párrafo segundo, y 100, párrafos décimo segundo, décimo tercero y décimo octavo, de la Constitución…; así como 1, fracción VIII, 70, 71, 79, párrafo primero, 80, fracciones II, III y XLIV, y 91, párrafo tercero, de la Ley Orgánica del Poder Judicial de la Federación…, y".
4. `CONSIDERANDO` con numerales arábigos y redacción "Que…".
5. Fórmula de paso: "Por lo anterior, se expide el siguiente:".
6. Denominación en mayúsculas; `CAPÍTULO PRIMERO` / `Disposiciones Generales`.
7. Artículos en cardinal: "Artículo 1.".
8. Artículo de definiciones con fracciones en romano, en orden alfabético.
9. `TRANSITORIOS` en mayúsculas con ordinales: "PRIMERO. El presente Acuerdo entrará en vigor el día siguiente de su publicación en el Diario Oficial de la Federación."; "SEGUNDO. Publíquese en el Diario Oficial de la Federación, en el Semanario Judicial de la Federación y su Gaceta…"; "TERCERO. Se abroga el Acuerdo General 12/2020 del Pleno del Consejo de la Judicatura Federal, que regula… y se derogan todas las disposiciones que se opongan al presente Acuerdo General."
10. Certificación final: "EL MAESTRO …, SECRETARIO EJECUTIVO DEL PLENO DEL ÓRGANO DE ADMINISTRACIÓN JUDICIAL, CERTIFICA: Que este Acuerdo General… fue aprobado por el Pleno del propio Órgano, en sesión celebrada el 15 de abril de 2026, por unanimidad de votos… Ciudad de México, a 15 de abril de 2026.- Conste.- Rúbrica."

Defectos u oportunidades de revisión observados en ese mismo acuerdo, útiles como casos de prueba de la Skill:

- El art. 1 divide el contenido directamente en incisos "a) … b) … y, c)", sin fracciones. Va contra la práctica mexicana de fracciones antes que incisos (MTL p. 41; GTO p. 25) y usa la secuencia "; y," en lugar de ", y".
- La cláusula derogatoria es genérica, junto a una abrogación expresa (MTL p. 34 la desaconseja).
- Hay mandatos en futuro ("se emitirán", "deberá") y un plazo para lineamientos fijado en días naturales a partir de la **publicación**, no de la entrada en vigor (transitorio SEXTO), lo que puede inducir confusión.
- La cita de la LOPJF es inconsistente entre acuerdos: "1, fracción VIII" en AG-POAJ-006/2026 y "1o, fracción VIII" (sin punto) en AG-POAJ-023/2025, cuando la LOPJF de 2024 numera "Artículo 1.".

---

## 4. Advertencias: qué NO está respaldado o es dudoso

1. **Ley General de Mejora Regulatoria**: fue abrogada por la LNETB (DOF 16-07-2025, transitorio Segundo). La CONAMER se extinguió a los treinta días hábiles de la entrada en vigor, y las menciones a ella "se entenderán hechas a la Agencia de Transformación Digital y Telecomunicaciones" (LNETB, transitorio Cuarto). La propia LNETB incluye además una derogación genérica (transitorio Tercero). Toda regla que cite "LGMR", "CONAMER" o "Manifestación de Impacto Regulatorio" como derecho vigente está desactualizada. Esto afecta: a) al MTL (2006), que además cita el Título Tercero A de la LFPA y a la COFEMER (los artículos 69-A y siguientes de la LFPA están en buena parte derogados desde 2018); b) a los Lineamientos CJEF de 2022, que definen el "Dictamen del Análisis de Impacto Regulatorio" con base en el art. 75 de la LGMR. **No se confirmó si la CJEF emitió lineamientos nuevos después de julio de 2025**; los de 2022 no aparecen abrogados en las búsquedas, pero su referencia a la LGMR quedó sin sustento.
2. **AIR para acuerdos del OAJ**: la LNETB incluye al Poder Judicial como "Sujeto Obligado… en los términos de esta Ley" (art. 3 fr. XXXIV), pero su art. 18 limita sus obligaciones expresas a designar una instancia de coordinación y a la simplificación, digitalización y registro de trámites mediante convenios. **No hay base clara para afirmar que un acuerdo general del OAJ requiera AIR**. Una Skill debería, como mucho, sugerir que se valore, no exigirlo.
3. **LFPA art. 4** sólo aplica a la APF (art. 1). La publicación de los acuerdos del OAJ se funda en la **LOPJF art. 91** (interés general) y en la Ley del DOF art. 3o. fr. V (que todavía dice "Consejo de la Judicatura Federal"). Que la fr. V cubra al OAJ es una interpretación sistemática, no un texto expreso.
4. **Lineamientos CJEF (2022)**: son criterio vinculante sólo para dependencias y entidades de la APF que tramitan proyectos que firma la persona titular del Ejecutivo. Para el Congreso, los estados o el PJF son **buena práctica (B/C)**, no requisito.
5. **Nota 34 del IBD-Senado (fuente 2)**: título, autor y fecha se conocen sólo por el buscador. Su contenido no se leyó por el bloqueo del sitio. No atribuirle reglas.
6. **Manual SFP de "Lenguaje Ciudadano"** y **estándar CONOCER EC1816**: NO VERIFICADOS. No usarlos como fundamento.
7. **Carbonell y Pedroza (coords.), *Elementos de técnica legislativa***: no se tuvo acceso al texto. Las afirmaciones atribuidas a Carbonell (derogación tácita) y a López Olvera (títulos) vienen de las citas del MTL. Hay discrepancia en la autoría del capítulo sobre derogaciones tácitas: el MTL lo atribuye a Miguel Carbonell; la ficha de Humanindex, a Pedroza de la Llave y Carbonell. También en la edición y el año (2000, 2002 o 2004 según el catálogo).
8. **"Primeros 10 artículos en ordinal"** (MTL p. 40): es impreciso. La práctica verificable usa ordinales del 1o. al 9o. y cardinales desde el 10 (CPEUM y CCF). Además, las leyes nuevas (LOPJF 2024, LNETB 2025) y los proyectos de la CJEF usan cardinales para todos los artículos. Ninguna norma vinculante impone una u otra numeración en leyes. La CJEF exige cardinales sólo para los proyectos del Ejecutivo.
9. **Títulos en cardinal y capítulos en romano** (MTL p. 36): el texto lo afirma, pero los ejemplos del propio manual usan "TÍTULO PRIMERO" (ordinal en letra) y "CAPÍTULO IV" o "CAPÍTULO ÚNICO". El GTO admite romanos o letra como "cuestión de estilo". **No hay una regla única**; lo verificable es la consistencia interna.
10. **Transitorios: "Artículo Primero" o "Primero"**: ambas formas existen en textos vigentes. FHP recomienda omitir "artículo"; no hay norma vinculante.
11. **Derogación genérica** ("se derogan todas las disposiciones que se opongan"): el MTL (C) la critica; el FHP (C) la recomienda; la práctica del Congreso, la CJEF y el OAJ la sigue usando. El CCF art. 9o. reconoce la derogación tácita. Es una **recomendación doctrinal**, no una prohibición jurídica: la Skill debe tratarla como observación de calidad, no como error de legalidad.
12. **"Deberá"/"podrá" en futuro frente a presente**: el MTL (C) dice que el presente es "regla fundamental", pero la práctica mexicana (CPEUM, LNETB, LOPJF, acuerdos del OAJ) usa sistemáticamente "deberá" y "podrá", y el FHP lo acepta. No hay norma que lo imponga. Conviene tratarlo como una sugerencia de estilo de baja severidad.
13. **Tesis citadas en el MTL** (1a. VI/2001 sobre fines extrafiscales; I.3o.C.377 C; I.12o.A.23 A según OCR): **no se verificaron** en el Semanario. El OCR del rubro y de los datos de localización puede tener errores.
14. **OCR del MTL**: las citas textuales tomadas del manual pueden tener erratas de OCR menores; los pasajes clave se transcribieron corrigiendo las erratas evidentes. La página 40 se cotejó contra la imagen.
15. **Criterios del CJF o del OAJ sobre técnica normativa o lenguaje incluyente**: **no se localizó** ningún acuerdo, manual ni lineamiento público que regule cómo deben redactarse los acuerdos generales del PJF. Tampoco se verificó si existe un procedimiento interno de dictamen jurídico de proyectos normativos en el OAJ (una nota de búsqueda menciona "dictamen jurídico" de la Dirección General de Asuntos Jurídicos, sin texto verificado). La sección 3.4 es **práctica observada (D)**, no regla.
16. RCD art. 85.1 repite el mismo contenido en las fracciones IV y VII ("Contenido del asunto o asuntos, destacando los elementos más importantes… planteamiento del problema"): es una redundancia en la propia norma. Es útil como ejemplo, pero indica que los requisitos formales no siempre están depurados.
17. El MTL cita a autores y leyes de su época (COFIPE, LFTAIPG, Ley Federal de Responsabilidades de los Servidores Públicos, Secretaría de Programación y Presupuesto). Los **ejemplos normativos del MTL no son derecho vigente**; sirven para ilustrar la técnica, no como cita.

---

## 5. Ideas para una metodología propia de revisión (D)

1. **Triage por tipo de instrumento**: ley o decreto del Congreso (RCD/RS, CPEUM 70-72); reglamento o decreto del Ejecutivo (LinReg); iniciativa del Ejecutivo (LinInic); disposición administrativa de la APF (LFPA 4, LNETB); acuerdo general del OAJ o del PJF (CPEUM 100, LOPJF 80 y 91, transitorio Décimo Noveno). Para cada tipo hay que separar las reglas A de las B y C antes de emitir observaciones.
2. **Severidad sugerida**:
   - *Crítico*: requisito A faltante, o fundamento competencial ausente o erróneo.
   - *Alto*: abrogación sin identificación precisa; entrada en vigor ambigua o anterior a la publicación; antinomia; remisión a una norma abrogada (por ejemplo, la LGMR o un acuerdo CJF sustituido).
   - *Medio*: derogación genérica sin abrogación expresa; definiciones duplicadas o no usadas; numeración inconsistente; incisos sin fracciones.
   - *Bajo*: futuro en lugar de presente; "y/o"; sinónimos; puntuación de enumeraciones.
3. **Checks automatizables**:
   - Secuencia de numeración: artículos progresivos sin saltos salvo "Bis" o "Ter"; fracciones romanas consecutivas; incisos a), b), c)…; regla de las dos unidades por división.
   - Consistencia del estilo ordinal o cardinal y del formato de los encabezados de transitorios.
   - Presencia de "para quedar como sigue:" y de puntos suspensivos en las reformas parciales.
   - Concordancia entre el artículo descriptivo y el texto reformado: cada porción listada aparece y no aparecen porciones no listadas.
   - Detección de "y/o", "y,", dobles negaciones y cadenas de remisiones.
   - Términos definidos que no se usan, y términos usados en mayúscula inicial que no están definidos.
   - Siglas sin definición.
   - Cita de ordenamientos con su fecha de publicación cuando se abrogan.
   - Detección de normas abrogadas citadas (lista: LGMR 2018; LOPJF 2021; acuerdos CJF sustituidos).
4. **Cuestionario final** basado en MTL pp. 88-91 (R1 y R2) y SG pp. 117-119 (validación con lector lego), adaptado a acuerdos administrativos y judiciales.
5. **Vigencia**: toda cita normativa del dictamen de la Skill debe indicar la fecha de la última reforma consultada. Las fuentes de esta investigación están fechadas al 22-10-2026.
