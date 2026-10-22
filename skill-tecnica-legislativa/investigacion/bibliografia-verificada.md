# Bibliografía verificada

Corte: 22 de octubre de 2026. Esta bibliografía consolida la investigación de tres subagentes (México; referentes internacionales; metodología y evaluación) y las comprobaciones directas hechas por el agente principal. Los informes completos, con la cita precisa de cada regla, están en `informe-agente-1-mexico.md`, `informe-agente-2-internacional.md` e `informe-agente-3-metodologia.md`.

## 1. Método de verificación

- **Verificada**: se descargó y leyó el texto de la fuente (PDF, HTML oficial o copia íntegra identificable) y se comprobó que respalda lo atribuido.
- **Verificación cruzada del agente principal**: además de la verificación de los subagentes, el agente principal comprobó directamente en los textos descargados estas afirmaciones críticas:
  - Autoría del manual de la Cámara de Diputados (Minor Molina y Roldán Xopa).
  - Puntos suspensivos y fórmula "para quedar como sigue:" en los Lineamientos CJEF de iniciativas (DOF 25/05/2022).
  - Art. 91, párr. tercero, de la LOPJF (publicación en el DOF de acuerdos de interés general).
  - Art. 169.2 del Reglamento del Senado.
  - Transitorios Segundo de la LOPJF (abroga la LOPJF de 2021) y Décimo Noveno (vigencia de acuerdos del CJF).
  - Transitorios Segundo y Cuarto de la LNETB (abrogación de la LGMR y extinción de la CONAMER).
  - Art. 68 de los Lineamientos de la ATDT.
  - Directriz 41 de las Directrices españolas (cláusulas genéricas de derogación).
  - Fórmulas de entrada en vigor en los decretos constitucionales recientes.
- **Parcial / no verificada**: se registra y **no** se usa como fundamento.

## 2. Clasificación de la fuerza de los criterios

| Categoría | Significado | Ejemplos |
|---|---|---|
| (A) Regla jurídica vinculante / requisito formal | Obliga en su ámbito de aplicación | CPEUM art. 70; Reglamento de la Cámara de Diputados art. 78; Reglamento del Senado art. 169; CCF arts. 3o., 4o. y 9o.; LOPJF art. 91 |
| (B) Criterio institucional / manual de uso | Obliga sólo a su destinatario institucional u orienta | Lineamientos de la CJEF (obligatorios para la APF); criterios del Congreso de Guanajuato |
| (C) Doctrina / buena práctica | No obliga | Manual de Minor y Roldán (2006); todas las fuentes extranjeras para México |
| (D) Propuesta metodológica de la Skill | Criterio técnico propio | Comprobación de concordancia entre artículo descriptivo y cuerpo; "consistencia antes que preferencia" |

## 3. Fuentes que fundamentan la Skill

La lista operativa, con claves de cita, URL y artículos verificados, está en `../tecnica-legislativa/references/fuentes.md`. Resumen:

### México
| Clave | Fuente | Categoría |
|---|---|---|
| MX-CPEUM | Constitución Política de los Estados Unidos Mexicanos (última reforma DOF 07/10/2026) | A |
| MX-RCD | Reglamento de la Cámara de Diputados (última reforma DOF 07/05/2025) | A |
| MX-RS | Reglamento del Senado de la República (última reforma DOF 06/12/2024) | A |
| MX-CCF | Código Civil Federal (última reforma DOF 14/11/2025) | A |
| MX-LFPA | Ley Federal de Procedimiento Administrativo (última reforma DOF 14/11/2025) | A (sólo APF) |
| MX-LDOF | Ley del Diario Oficial de la Federación y Gacetas Gubernamentales (última reforma DOF 31/05/2019) | A |
| MX-LOPJF | Ley Orgánica del Poder Judicial de la Federación (DOF 20/12/2024; última reforma DOF 28/11/2025) | A |
| MX-LNETB | Ley Nacional para Eliminar Trámites Burocráticos (DOF 16/07/2025) | A (en su ámbito) |
| MX-ATDT | Lineamientos para la implementación del Modelo Nacional para Eliminar Trámites Burocráticos (firmados el 16/10/2025) | A (en su ámbito) |
| MX-CJEF-INI / MX-CJEF-REG | Lineamientos de la Consejería Jurídica del Ejecutivo Federal para iniciativas y reglamentos (DOF 25/05/2022) | B |
| MX-GTO | *Apuntes Legislativos* 7, Congreso de Guanajuato (2006) | B (local) |
| MX-MTL | J. R. Minor Molina y J. Roldán Xopa, *Manual de técnica legislativa*, Cámara de Diputados y M. A. Porrúa (2006) | C |
| MX-SG | E. Sánchez Gómez, directrices lingüísticas, en Mora-Donatto y Sánchez Gómez, UNAM-IIJ (2012) | C |
| MX-RF | R. Rosas Fregoso, *Perspectiva de género y técnica legislativa en México*, UNAM-IIJ (2021) | C |
| MX-FHP | Fundación Humanismo Político, *Manual de Técnica Legislativa* (sin fecha) | C (secundaria) |
| MX-OAJ-006 | Acuerdo General AG-POAJ-006/2026 del Pleno del OAJ (DOF 17/04/2026) | D (práctica observada) |

### Referencias comparadas (todas valen como C en México)
ES-DTN (Directrices de técnica normativa, España, 2005); UE-GPC (Guía práctica común, 2.ª ed., 2015); UE-MC (Manual común, 2023); DE-HdR (Handbuch der Rechtsförmlichkeit, 4.ª ed., 2024); CH-GTR (Gesetzestechnische Richtlinien, 2026); AR-PB (Pérez Bourbon, Manual de Técnica Legislativa, 2007); UK-OPC (Drafting guidance, 2024); US-HLC (House Manual on Drafting Style, 1995); US-DDH (Document Drafting Handbook, rev. 2025); CA-LEG (Legistics, Canadá); OCDE-95 y OCDE-12.

### Metodología, evaluación y diseño de la Skill (no se citan dentro de la Skill)
| Fuente | Datos | URL | Uso |
|---|---|---|---|
| Anthropic, "Agent Skills" (overview) | Consultada 22/10/2026 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview | Estructura, frontmatter (`name` ≤ 64, `description` ≤ 1 024), carga progresiva, disponibilidad en Claude.ai, seguridad |
| Anthropic, "Skill authoring best practices" | Consultada 22/10/2026 | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | Cuerpo < 500 líneas, referencias a un nivel, índice en archivos > 100 líneas, evaluaciones primero, scripts para operaciones deterministas |
| Centro de ayuda de Claude, "Use Skills in Claude" | Consultado 22/10/2026 | https://support.claude.com/en/articles/12512180-use-skills | Requisitos, ruta Customize > Skills, carga del ZIP, activar/desactivar, eliminar |
| Centro de ayuda de Claude, "How to create custom Skills" | Consultado 22/10/2026 | https://support.claude.com/en/articles/12512198-creating-custom-skills | ZIP con la carpeta en la raíz; nombre de carpeta igual al de la Skill |
| Anthropic, "Mitigate jailbreaks and prompt injections" | Consultada 22/10/2026 | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks | Tratar el contenido de documentos como datos, no instrucciones |
| Anthropic, "Define success criteria and build evaluations" | Consultada 22/10/2026 | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests | Diseño de evaluaciones |
| OWASP, "LLM01:2025 Prompt Injection" | 2025 | https://genai.owasp.org/llmrisk/llm01-prompt-injection/ | Inyección indirecta |
| Hendrycks et al., "CUAD" | NeurIPS 2021 | https://arxiv.org/pdf/2103.06268 | Métricas de detección (verdaderos y falsos positivos, omisiones) |
| Porter, Votta y Basili, "Comparing Detection Methods for Software Requirements Inspections" | IEEE TSE 21(6), 1995 | https://drum.lib.umd.edu/items/96204769-6905-4196-b903-709ad81148ee | Tasa de detección en inspecciones por lista de comprobación |

## 4. Discrepancias y discrepancias de autoría o fecha registradas

- Centro de ayuda de Claude: el artículo "How to create custom Skills" indica un máximo de 200 caracteres para la descripción, mientras que la documentación técnica (platform.claude.com) y el validador oficial de Anthropic (`skill-creator`) indican 1 024. Se adoptó el límite técnico (la descripción tiene menos de 1 024 caracteres) y se dejó registro aquí; si la carga fallara por longitud de la descripción, debe acortarse.
- Directrices españolas: el índice y el cuerpo numeran distinto las dir. 55-60; se cita por el cuerpo.
- Manual de la Cámara de Diputados: afirma que se numeran en ordinal "los primeros 10 artículos"; en los textos vigentes son del 1o. al 9o.
- Carbonell y Pedroza, *Elementos de técnica legislativa*: hay discrepancias de edición (2000/2002/2004) y no se leyó el texto.

## 5. Fuentes no verificadas (no usadas como fundamento)

Nota núm. 34 del Instituto Belisario Domínguez (bloqueo de acceso automatizado); *Elementos de técnica legislativa* (texto no accesible); manual *Lenguaje Ciudadano* de la SFP; estándar CONOCER EC1816; Manual de Técnica Legislativa del Congreso del Perú (3.ª ed., 2021); Plain English Manual de Australia; manuales del Digesto Jurídico Argentino y de Chile; Libro de estilo interinstitucional de la UE; ISO 24495-1:2023 (texto de pago); doctrina identificada sólo por catálogo (Atienza, GRETEL, Sainz Moreno, García-Escudero, Xanthaki). No se localizaron criterios públicos del CJF o del OAJ sobre técnica de redacción de sus acuerdos generales.
