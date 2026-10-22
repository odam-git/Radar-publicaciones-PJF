#!/usr/bin/env python3
"""Comprobaciones mecánicas auxiliares para la Skill "tecnica-legislativa".

Sólo usa la biblioteca estándar. Sus resultados son CANDIDATOS que deben
confirmarse leyendo el texto: el script no entiende el sentido de las
disposiciones y puede fallar con formatos atípicos.

Uso:
    python3 analizar_texto.py estructura ARCHIVO [--desde TEXTO] [--hasta TEXTO]
    python3 analizar_texto.py terminos   ARCHIVO [--desde TEXTO] [--hasta TEXTO]
    python3 analizar_texto.py comparar   VERSION_1 VERSION_2

ARCHIVO puede ser .txt, .md, .docx o .pdf (este último requiere pypdf o la
utilidad pdftotext). --desde/--hasta limitan el análisis a las líneas
comprendidas entre la primera línea que contiene TEXTO (útil cuando un mismo
archivo incluye el texto vigente y el proyecto).
"""

import argparse
import difflib
import re
import subprocess
import sys
import unicodedata
import zipfile
from pathlib import Path

# ---------------------------------------------------------------------------
# Lectura de archivos
# ---------------------------------------------------------------------------


def leer_docx(ruta):
    with zipfile.ZipFile(ruta) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="replace")
    parrafos = []
    for p in re.findall(r"<w:p[ >].*?</w:p>", xml, flags=re.S):
        p = re.sub(r"<w:tab/>", "\t", p)
        p = re.sub(r"<w:br/>", "\n", p)
        textos = re.findall(r"<w:t[^>]*>(.*?)</w:t>", p, flags=re.S)
        parrafos.append("".join(textos))
    texto = "\n".join(parrafos)
    for a, b in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&apos;", "'")):
        texto = texto.replace(a, b)
    return texto


def leer_pdf(ruta):
    try:
        from pypdf import PdfReader  # type: ignore

        return "\n".join((pag.extract_text() or "") for pag in PdfReader(str(ruta)).pages)
    except ImportError:
        pass
    try:
        salida = subprocess.run(
            ["pdftotext", "-layout", str(ruta), "-"], capture_output=True, text=True, check=True
        )
        return salida.stdout
    except (OSError, subprocess.CalledProcessError):
        sys.exit(
            "No se pudo extraer el texto del PDF: instale pypdf (pip install pypdf) "
            "o convierta el archivo a .txt antes de ejecutar el script."
        )


# Notas marginales y encabezados de las compilaciones de la Cámara de Diputados (LeyesBiblio):
# no forman parte del texto normativo y alteran las comprobaciones de puntuación.
RE_NOTA_COMPILADOR = re.compile(
    r"^\s*(?:(?:Fracci[óo]n|Fracciones|Art[íi]culo|Art[íi]culos|P[áa]rrafo|P[áa]rrafos|Inciso|Incisos|Numeral|Apartado|"
    r"Denominaci[óo]n|Cap[íi]tulo|Secci[óo]n|T[íi]tulo|Base|Libro|Fe de erratas)[^\n]{0,60}?\s+"
    r"(?:reformad[oa]s?|adicionad[oa]s?|derogad[oa]s?|recorrid[oa]s?|abrogad[oa]s?)\s+DOF\b.*"
    r"|\d+\s+de\s+\d+|CÁMARA DE DIPUTADOS DEL H\. CONGRESO DE LA UNIÓN.*|Secretar[íi]a General|"
    r"Secretar[íi]a de Servicios Parlamentarios|.*[ÚU]ltima [Rr]eforma (?:publicada )?DOF.*|"
    # Notas breves que sólo terminan en una o varias fechas del DOF ("Nueva Ley DOF 16-07-2025").
    r"[^.;:]{0,80}\bDOF\s+\d{2}-\d{2}-\d{4}(?:\s*,\s*\d{2}-\d{2}-\d{4})*)\s*$"
)
LINEAS_OMITIDAS = [0]


def limpiar_compilacion(lineas):
    salida = []
    for linea in lineas:
        if RE_NOTA_COMPILADOR.match(linea):
            LINEAS_OMITIDAS[0] += 1
            # El título repetido del ordenamiento precede al encabezado de la Cámara.
            if "CÁMARA DE DIPUTADOS" in linea:
                j = len(salida) - 1
                while j >= 0 and not salida[j].strip():
                    j -= 1
                previa = salida[j].strip() if j >= 0 else ""
                if len(previa) > 15 and previa == previa.upper() and not RE_FRACCION.match(previa):
                    salida[j] = ""  # se vacía en lugar de borrarse, para conservar la numeración de líneas
                    LINEAS_OMITIDAS[0] += 1
            salida.append("")
            continue
        salida.append(linea)
    return salida


def leer(ruta, desde=None, hasta=None):
    ruta = Path(ruta)
    if not ruta.exists():
        sys.exit(f"No existe el archivo: {ruta}")
    sufijo = ruta.suffix.lower()
    if sufijo == ".docx":
        texto = leer_docx(ruta)
    elif sufijo == ".pdf":
        texto = leer_pdf(ruta)
    else:
        texto = ruta.read_text(encoding="utf-8", errors="replace")
    texto = unicodedata.normalize("NFC", texto).replace("\r\n", "\n")
    lineas = limpiar_compilacion(texto.split("\n"))
    if desde:
        idx = next((i for i, l in enumerate(lineas) if desde in l), None)
        if idx is None:
            sys.exit(f"No se encontró la línea indicada en --desde: {desde!r}")
        lineas = lineas[idx:]
    if hasta:
        idx = next((i for i, l in enumerate(lineas) if hasta in l), None)
        if idx is not None:
            lineas = lineas[:idx]
    return lineas


# ---------------------------------------------------------------------------
# Numeración
# ---------------------------------------------------------------------------

ORDINALES_BASE = {
    "primero": 1, "primera": 1, "segundo": 2, "segunda": 2, "tercero": 3, "tercera": 3,
    "cuarto": 4, "cuarta": 4, "quinto": 5, "quinta": 5, "sexto": 6, "sexta": 6,
    "séptimo": 7, "septimo": 7, "séptima": 7, "octavo": 8, "octava": 8,
    "noveno": 9, "novena": 9, "décimo": 10, "decimo": 10, "décima": 10,
    "undécimo": 11, "duodécimo": 12, "vigésimo": 20, "vigesimo": 20,
    "trigésimo": 30, "trigesimo": 30, "cuadragésimo": 40, "quincuagésimo": 50,
    "único": 1, "unico": 1, "única": 1,
}
PALABRA_ORDINAL = (
    r"(?:Primer[oa]|Segund[oa]|Tercer[oa]|Cuart[oa]|Quint[oa]|Sext[oa]|S[ée]ptim[oa]|"
    r"Octav[oa]|Noven[oa]|D[ée]cim[oa]|Und[ée]cim[oa]|Duod[ée]cim[oa]|Vig[ée]sim[oa]|"
    r"Trig[ée]sim[oa]|Cuadrag[ée]sim[oa]|Quincuag[ée]sim[oa]|[ÚU]nic[oa])"
)
ORDINAL_COMPUESTO = rf"{PALABRA_ORDINAL}(?:[\s\-]+{PALABRA_ORDINAL})?"
SUFIJOS_LATINOS = ["bis", "ter", "quáter", "quater", "quinquies", "sexies", "septies", "octies", "nonies"]
SUFIJO_RE = r"(?:\s*[-\s]\s*(Bis|Ter|Qu[áa]ter|Quinquies|Sexies|Septies|Octies|Nonies|[A-Z](?![a-záéíóúñ]))(?:\s*(\d+))?)?"


def ordinal_a_numero(texto):
    total = 0
    for palabra in re.split(r"[\s\-]+", texto.strip().lower()):
        if palabra in ORDINALES_BASE:
            total += ORDINALES_BASE[palabra]
        elif palabra:
            return None
    return total or None


ROMANOS = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}


def romano_a_numero(r):
    r = r.upper()
    if not r or any(c not in ROMANOS for c in r):
        return None
    total = 0
    for i, c in enumerate(r):
        v = ROMANOS[c]
        if i + 1 < len(r) and ROMANOS[r[i + 1]] > v:
            total -= v
        else:
            total += v
    return total


def clave_sufijo(sufijo):
    if not sufijo:
        return 0
    if len(sufijo) == 1 and sufijo.isupper():
        return 100 + ord(sufijo)  # "Artículo 69-A", "69-B"…: se ordenan después de los latinos
    s = sufijo.lower().replace("quater", "quáter")
    return SUFIJOS_LATINOS.index(s) + 1 if s in SUFIJOS_LATINOS else 99


# ---------------------------------------------------------------------------
# Segmentación del texto
# ---------------------------------------------------------------------------

RE_DIVISION = re.compile(
    r"^\s*(LIBRO|T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N)\s+([A-ZÁÉÍÓÚ0-9]+(?:\s+[A-ZÁÉÍÓÚ]+)?)\b", re.I
)
RE_TRANSITORIOS = re.compile(r"^\s*(?:ART[ÍI]CULOS?\s+)?TRANSITORIOS?\s*\.?\s*$", re.I)
RE_ANEXO = re.compile(r"^\s*ANEXO\s+([A-ZÁÉÍÓÚ0-9]+)", re.I)
RE_ARTICULO_NUM = re.compile(
    # "Artículo 10.", "Artículo 1o.-", "Artículo 5o. A ninguna…" (el punto del ordinal basta como cierre).
    r"^\s*(?:\*\*)?(?:Art[íi]culo|ART[ÍI]CULO|Art\.)\s+(\d+)(?:\s*(?:o|º|°)\.?|\.o)?" + SUFIJO_RE
    + r"\s*(?:\*\*)?(?:\s*[\.\-–—:]|(?<=\.)\s)",
)
RE_ARTICULO_ORD = re.compile(
    rf"^\s*(?:\*\*)?(?:Art[íi]culo|ART[ÍI]CULO)\s+({ORDINAL_COMPUESTO})\s*(?:\*\*)?\s*[\.\-–—:]", re.I
)
RE_ORDINAL_SUELTO = re.compile(rf"^\s*(?:\*\*)?({ORDINAL_COMPUESTO})\s*(?:\*\*)?\s*[\.\-–—:]", re.I)
RE_NUMERAL = re.compile(r"^\s*(\d+)(?:\.(\d+))*\.\s+\S")
RE_FRACCION = re.compile(r"^\s*([IVXLC]+)\s*(?:\.|\.\-|\)|\.–)\s+\S")
RE_INCISO = re.compile(r"^\s*([a-zñ])\)\s+\S")
# Encabezado de un decreto de reforma reproducido dentro de una compilación ("ARTÍCULOS TRANSITORIOS DE
# DECRETOS DE REFORMA" / "DECRETO por el que se reforman…"): su articulado no forma parte del texto principal.
RE_DECRETO_EXTERNO = re.compile(r"^\s*(?:ART[ÍI]CULOS\s+TRANSITORIOS\s+DE\s+DECRETOS?\s+DE\s+REFORMA|DECRETO\s+por\s+el\s+que\b)", re.I)
RE_DECRETO = re.compile(r"para\s+quedar\s+(?:como\s+sigue|en\s+los\s+t[ée]rminos\s+siguientes)", re.I)


class Unidad:
    def __init__(self, tipo, etiqueta, numero, sufijo, linea, seccion):
        self.tipo = tipo  # articulo | ordinal | transitorio | numeral
        self.etiqueta = etiqueta
        self.numero = numero
        self.sufijo = sufijo
        self.linea = linea
        self.seccion = seccion  # cuerpo | transitorios | anexo | decreto_externo
        self.grupo = 0  # bloque de transitorios al que pertenece (las compilaciones traen varios)
        self.fracciones = []  # (romano, numero, linea)
        self.incisos = []  # (fraccion, letra, linea)
        self.texto = []

    def clave(self):
        return (self.numero, clave_sufijo(self.sufijo))


def segmentar(lineas):
    unidades, divisiones, anexos = [], [], []
    seccion = "cuerpo"
    grupo = 0
    hubo_articulado = False
    actual = None
    fraccion_actual = None
    for n, linea in enumerate(lineas, start=1):
        limpia = linea.strip().strip("*").strip()
        if not limpia:
            continue
        if RE_TRANSITORIOS.match(limpia):
            seccion = "transitorios"
            grupo += 1
            actual = None
            continue
        if hubo_articulado and RE_DECRETO_EXTERNO.match(limpia):
            seccion = "decreto_externo"
            actual = None
            continue
        m = RE_ANEXO.match(limpia)
        if m and len(limpia) < 80:
            seccion = "anexo"
            anexos.append((m.group(1), n))
            actual = None
            continue
        m = RE_DIVISION.match(limpia)
        if m and len(limpia) < 80:
            divisiones.append((m.group(1).upper(), m.group(2), n))
            continue
        nueva = None
        m = RE_ARTICULO_NUM.match(limpia)
        if m:
            tipo = {"transitorios": "transitorio", "decreto_externo": "otro"}.get(seccion, "articulo")
            nueva = Unidad(tipo, limpia.split(".")[0][:40], int(m.group(1)), m.group(2), n, seccion)
        else:
            m = RE_ARTICULO_ORD.match(limpia) or (
                RE_ORDINAL_SUELTO.match(limpia) if seccion != "anexo" else None
            )
            if m:
                num = ordinal_a_numero(m.group(1))
                if num is not None:
                    tipo = {"transitorios": "transitorio", "decreto_externo": "otro"}.get(seccion, "ordinal")
                    nueva = Unidad(tipo, m.group(1), num, None, n, seccion)
        if nueva:
            nueva.grupo = grupo
            hubo_articulado = hubo_articulado or nueva.tipo in ("articulo", "ordinal")
            unidades.append(nueva)
            actual = nueva
            fraccion_actual = None
            actual.texto.append(limpia)
            continue
        if actual is not None:
            actual.texto.append(limpia)
            m = RE_FRACCION.match(limpia)
            previo = actual.fracciones[-1][1] if actual.fracciones else 0
            # "C." o "L." tras la fracción IV es un apartado, no la fracción C (100).
            if m and romano_a_numero(m.group(1)) and romano_a_numero(m.group(1)) > previo + 5:
                m = None
            if m and romano_a_numero(m.group(1)):
                actual.fracciones.append((m.group(1), romano_a_numero(m.group(1)), n))
                fraccion_actual = m.group(1)
                continue
            m = RE_INCISO.match(limpia)
            if m:
                actual.incisos.append((fraccion_actual, m.group(1), n))
    return unidades, divisiones, anexos


# ---------------------------------------------------------------------------
# Comando: estructura
# ---------------------------------------------------------------------------


def es_unico(etiqueta):
    return etiqueta.strip().lower().rstrip(".") in ("único", "unico", "única", "unica")


def revisar_secuencia(elementos, nombre, avisos, modo_decreto=False):
    """elementos: lista de (clave_ordenable, etiqueta, linea)."""
    vistos = {}
    previo = None
    for clave, etiqueta, linea in elementos:
        if clave in vistos:
            avisos.append(f"[DUPLICADO] {(nombre + ' ') if nombre else ''}{etiqueta} (línea {linea}) repite la numeración de la línea {vistos[clave]}.")
        vistos.setdefault(clave, linea)
        if previo is not None:
            if clave < previo[0]:
                avisos.append(f"[ORDEN] {(nombre + ' ') if nombre else ''}{etiqueta} (línea {linea}) aparece después de {previo[1]}.")
            elif not modo_decreto and clave[1] == 0 and clave[0] > previo[0][0] + 1:
                faltan = ", ".join(str(x) for x in range(previo[0][0] + 1, clave[0]))
                avisos.append(f"[SALTO] Entre {(nombre + ' ') if nombre else ''}{previo[1]} y {etiqueta} (línea {linea}) faltan: {faltan}.")
        previo = (clave, etiqueta)


def unidad_de_linea(unidades, n):
    """Unidad (artículo, lineamiento o transitorio) en la que se encuentra la línea n."""
    contenedor = None
    for u in unidades:
        if u.linea <= n:
            contenedor = u
        else:
            break
    return contenedor


def extraer_numeros(cadena):
    """'3, 5 y 7 Bis' -> [(3, None), (5, None), (7, 'Bis')]"""
    salida = []
    for m in re.finditer(r"(\d+)(?:\s*(?:o\.|º|°))?(?:[\s-]+(bis|ter|qu[áa]ter|quinquies|sexies)\b|-([A-Z])\b)?", cadena, re.I):
        suf = m.group(2).capitalize() if m.group(2) else (m.group(3).upper() if m.group(3) else None)
        salida.append((int(m.group(1)), suf))
    return salida


RE_REF_ART = re.compile(
    r"\bart[íi]culos?\s+((?:\d+(?:\s*(?:o\.|º|°))?(?:[\s-]+(?:bis|ter|qu[áa]ter|quinquies|sexies)\b|-[A-Z]\b)?"
    r"(?:\s*,\s*|\s+y\s+|\s+e\s+|\s+o\s+|\s+a(?:l)?\s+)?)+)",
    re.I,
)
RE_REF_FRACCION_DEL = re.compile(
    r"\bfracci(?:ón|on|ones)\s+([IVXLC]+(?:\s*(?:,|y|e|a)\s*[IVXLC]+)*)\s*,?\s+del\s+art[íi]culo\s+(\d+)", re.I
)
RE_REF_ART_FRACCION = re.compile(
    r"\bart[íi]culo\s+(\d+)\s*(?:o\.|º)?\s*,\s*fracci(?:ón|on|ones)\s+([IVXLC]+(?:\s*(?:,|y|e|a)\s*[IVXLC]+)*)", re.I
)
RE_REF_TRANSITORIO = re.compile(
    rf"\b(?:(?:art[íi]culo|transitorio)\s+({ORDINAL_COMPUESTO})\s+transitorio|transitorio\s+({ORDINAL_COMPUESTO})|({ORDINAL_COMPUESTO})\s+transitorio)\b",
    re.I,
)
RE_REF_ORDINAL = re.compile(rf"\b(?:lineamiento|numeral|regla|punto|art[íi]culo)\s+({ORDINAL_COMPUESTO})\b(?!\s+transitorio)", re.I)
RE_REF_ANEXO = re.compile(r"\banexo\s+([ÚU]nico|\d+|[A-Z]\b|" + PALABRA_ORDINAL + r")", re.I)
RE_EXTERNA = re.compile(
    r"^\W{0,3}(?:constitucional\b|"
    r"(?:(?:bis|ter|qu[áa]ter|quinquies|sexies)\b[\s,y]*)*"
    r"(?:,?\s*(?:y\s+|e\s+)?(?:fracci[óo]n|inciso|p[áa]rrafo|apartado)[^,;.]{0,40})?"
    r",?\s*(?:de\s+la|del|de\s+los|de\s+las)\s+(?:(?:propi|citad|referid|mencionad)[oa]\s+)?(?!(?:presente|este|esta)\b)"
    # La extracción de PDF puede partir palabras ("Constituci ón").
    r"(?:Constituci\s?[óo]n|Ley|C\s?[óo]digo|Reglamento|Estatuto|Acuerdo|Lineamientos|Decreto|Manual|Norma|Convenio))",
    re.I,
)
RE_DECRETO_ENUNCIADO = re.compile(
    r"(Se\s+(?:reforma|reforman|adiciona|adicionan|deroga|derogan|abroga|expide)\b.*?)para\s+quedar", re.I | re.S
)


def roman_list(cadena):
    return [r for r in re.findall(r"[IVXLC]+", cadena)]


def cmd_estructura(lineas):
    texto = "\n".join(lineas)
    unidades, divisiones, anexos = segmentar(lineas)
    # Sólo es decreto de reforma si la fórmula "para quedar como sigue" precede al articulado; en una
    # compilación aparece después, dentro de los transitorios de las reformas.
    linea_formula = next((i for i, l in enumerate(lineas, start=1) if RE_DECRETO.search(l)), None)
    primera_unidad = min((u.linea for u in unidades if u.tipo in ("articulo", "ordinal")), default=None)
    modo_decreto = linea_formula is not None and (primera_unidad is None or linea_formula <= primera_unidad + 3)
    # Un decreto que sólo expide un ordenamiento nuevo ("Se expide la Ley…, para quedar como sigue:") se
    # revisa como texto nuevo: sus saltos de numeración y remisiones sí deben comprobarse.
    expedicion = modo_decreto and not re.search(r"\bse\s+(?:reforma|adiciona|deroga)", lineas[linea_formula - 1], re.I)
    if expedicion:
        modo_decreto = False
    avisos, refs_ok, refs_ext, refs_mal = [], [], [], []

    cuerpo_art = [u for u in unidades if u.tipo == "articulo"]
    cuerpo_ord = [u for u in unidades if u.tipo == "ordinal"]
    trans = [u for u in unidades if u.tipo == "transitorio"]

    print("# Informe mecánico de estructura (candidatos: confirmar leyendo el texto)\n")
    if expedicion:
        print("Decreto de expedición ('Se expide…, para quedar como sigue:'): el cuerpo se revisa como ordenamiento nuevo.\n")
    if modo_decreto:
        print("Modo decreto de reforma: se detectó 'para quedar como sigue'. Los saltos de numeración en el\n"
              "cuerpo son esperables y no se reportan; las remisiones dentro del texto reformado se refieren\n"
              "al ordenamiento reformado y sólo pueden verificarse contra su texto vigente.\n")
    if LINEAS_OMITIDAS[0]:
        print(f"Se omitieron {LINEAS_OMITIDAS[0]} líneas de notas del compilador o encabezados de página (p. ej., "
              "'Fracción reformada DOF…'); no forman parte del texto normativo.\n")
    bloques = len({u.grupo for u in trans})
    if bloques > 1:
        print(f"Se detectaron {bloques} bloques de transitorios (texto original y decretos de reforma); "
              "cada uno se revisa por separado.\n")
    print(f"Divisiones: {len(divisiones)} | Artículos numerados: {len(cuerpo_art)} | "
          f"Unidades ordinales (lineamientos/reglas/artículos en letra): {len(cuerpo_ord)} | "
          f"Transitorios: {len(trans)} | Anexos: {len(anexos)}\n")

    # Divisiones
    # Cada nivel se numera dentro de su división superior (los capítulos vuelven a empezar en cada título).
    nivel = {"LIBRO": 0, "TÍTULO": 1, "TITULO": 1, "CAPÍTULO": 2, "CAPITULO": 2, "SECCIÓN": 3, "SECCION": 3}
    contador_padre = [0, 0, 0, 0]
    por_grupo = {}
    for tipo, num, linea in divisiones:
        k = nivel.get(tipo, 3)
        contador_padre[k] += 1
        for inferior in range(k + 1, 4):
            contador_padre[inferior] = 0
        if es_unico(num):
            continue
        val = romano_a_numero(num.split()[0]) or ordinal_a_numero(num) or (int(num) if num.isdigit() else None)
        if val:
            padre = tuple(contador_padre[:k])
            por_grupo.setdefault((k, padre), []).append(((val, 0), f"{tipo} {num}", linea))
    for elems in por_grupo.values():
        revisar_secuencia(elems, "", avisos)

    revisar_secuencia([(u.clave(), u.etiqueta, u.linea) for u in cuerpo_art], "", avisos, modo_decreto)
    # "Único" (p. ej. el punto único del acuerdo que emite unos lineamientos) no forma serie.
    revisar_secuencia([(u.clave(), u.etiqueta, u.linea) for u in cuerpo_ord if not es_unico(u.etiqueta)], "", avisos)
    for g in sorted({u.grupo for u in trans}):
        revisar_secuencia([(u.clave(), f"transitorio {u.etiqueta}", u.linea) for u in trans if u.grupo == g], "", avisos)

    for u in unidades:
        if u.fracciones:
            if u.fracciones[0][1] != 1 and not modo_decreto:
                avisos.append(f"[INICIO] Las fracciones de {u.etiqueta} comienzan en {u.fracciones[0][0]} (línea {u.fracciones[0][2]}).")
            # Un artículo puede tener varias enumeraciones (en párrafos o apartados distintos): cada
            # fracción I abre una lista nueva. Limitación: una fracción I duplicada no se detecta.
            listas, actual_lista = [], []
            for fr in u.fracciones:
                if fr[1] == 1 and actual_lista:
                    listas.append(actual_lista)
                    actual_lista = []
                actual_lista.append(fr)
            listas.append(actual_lista)
            for lista in listas:
                revisar_secuencia([((num, 0), f"fracción {rom} ({u.etiqueta})", l) for rom, num, l in lista], "", avisos)
                avisos.extend(revisar_puntuacion_enumeracion(u, lineas, lista))
        grupos = {}
        for fr, letra, l in u.incisos:
            grupos.setdefault(fr, []).append(((ord(letra), 0), f"inciso {letra}) ({u.etiqueta}, fr. {fr})", l))
        for elems in grupos.values():
            revisar_secuencia(elems, "", avisos)

    # Remisiones
    claves_art = {u.clave(): u for u in cuerpo_art}
    claves_ord = {u.numero for u in cuerpo_ord}
    claves_trans = {u.numero for u in trans}
    nombres_anexo = {a.lower() for a, _ in anexos}
    for n, linea in enumerate(lineas, start=1):
        siguiente = " ".join(x.strip() for x in lineas[n:n + 2])
        es_encabezado = bool(RE_ARTICULO_NUM.match(linea.strip().strip("*")))
        for m in RE_REF_ART.finditer(linea):
            if es_encabezado and not linea[: m.start()].strip().strip("*"):
                continue  # es el encabezado del propio artículo, no una remisión
            cola = (linea[m.end():] + " " + siguiente)[:160]  # el PDF puede partir la cita en dos líneas
            nums = extraer_numeros(m.group(1))
            if not nums:
                continue
            etiqueta = f"línea {n}: «{linea[m.start(): m.end() + 30].strip()}»"
            if RE_EXTERNA.match(cola):
                refs_ext.append(etiqueta)
                continue
            if modo_decreto:
                refs_ext.append(etiqueta + " (texto reformado o enunciado del decreto)")
                continue
            contenedor = unidad_de_linea(unidades, n)
            for num, suf in nums:
                if (num, clave_sufijo(suf)) in claves_art:
                    if contenedor is not None and contenedor.tipo == "articulo" and contenedor.clave() == (num, clave_sufijo(suf)):
                        refs_mal.append(f"[AUTORREMISIÓN] el artículo {num} se cita a sí mismo; compruebe si la remisión"
                                        f" quedó desfasada por una renumeración o si debe decir 'este artículo' — {etiqueta}")
                        continue
                    refs_ok.append(f"artículo {num}{' ' + suf if suf else ''} ({etiqueta})")
                else:
                    refs_mal.append(f"[REMISIÓN] artículo {num}{' ' + suf if suf else ''} no existe en el texto analizado — {etiqueta}")
        for m in list(RE_REF_FRACCION_DEL.finditer(linea)) + list(RE_REF_ART_FRACCION.finditer(linea)):
            if m.re is RE_REF_FRACCION_DEL:
                romanos, num = roman_list(m.group(1)), int(m.group(2))
            else:
                num, romanos = int(m.group(1)), roman_list(m.group(2))
            cola = (linea[m.end():] + " " + siguiente)[:160]  # el PDF puede partir la cita en dos líneas
            if RE_EXTERNA.match(cola) or modo_decreto:
                continue
            u = claves_art.get((num, 0))
            if u is None:
                continue  # ya reportado como remisión a artículo inexistente
            existentes = {r for r, _, _ in u.fracciones}
            for r in romanos:
                if r not in existentes:
                    refs_mal.append(f"[REMISIÓN] fracción {r} del artículo {num} no existe — línea {n}")
        for m in RE_REF_TRANSITORIO.finditer(linea):
            if RE_EXTERNA.match((linea[m.end():] + " " + siguiente)[:160]):
                refs_ext.append(f"línea {n}: «{linea[m.start(): m.end() + 30].strip()}»")
                continue
            palabra = next(g for g in m.groups() if g)
            num = ordinal_a_numero(palabra)
            if num is None:
                continue
            if num in claves_trans:
                refs_ok.append(f"transitorio {palabra} (línea {n})")
            else:
                refs_mal.append(f"[REMISIÓN] transitorio {palabra} no existe — línea {n}")
        for m in RE_REF_ORDINAL.finditer(linea):
            if m.start() == len(linea) - len(linea.lstrip(" *")):
                continue  # encabezado de la propia unidad
            if RE_REF_TRANSITORIO.search(linea[m.start(): m.end() + 15]):
                continue
            num = ordinal_a_numero(m.group(1))
            if num is None or not cuerpo_ord:
                continue
            if num in claves_ord:
                refs_ok.append(f"{m.group(0)} (línea {n})")
            else:
                refs_mal.append(f"[REMISIÓN] «{m.group(0)}» no corresponde a ninguna unidad ordinal del texto — línea {n}")
        for m in RE_REF_ANEXO.finditer(linea):
            if RE_ANEXO.match(linea.strip().strip("*")):
                continue
            if m.group(1).lower() in nombres_anexo:
                refs_ok.append(f"anexo {m.group(1)} (línea {n})")
            else:
                refs_mal.append(f"[REMISIÓN] anexo {m.group(1)} no se localizó en el texto — línea {n}")

    if modo_decreto:
        imprimir_decreto(texto, cuerpo_art)

    print("## Avisos de numeración y formato")
    print("\n".join(f"- {a}" for a in avisos) if avisos else "- Sin avisos.")
    print("\n## Remisiones internas que no se pudieron resolver")
    print("\n".join(f"- {r}" for r in refs_mal) if refs_mal else "- Ninguna.")
    print("\n## Remisiones externas o no verificables con este texto (pendientes de comprobar)")
    print("\n".join(f"- {r}" for r in refs_ext) if refs_ext else "- Ninguna detectada.")
    lexicas = alertas_lexicas(lineas)
    print("\n## Alertas léxicas (candidatas: valore si generan una duda real en su contexto)")
    print("\n".join(lexicas[:60]) if lexicas else "- Ninguna.")
    if len(lexicas) > 60:
        print(f"- … y {len(lexicas) - 60} más")
    print(f"\n## Remisiones internas resueltas: {len(refs_ok)}")
    for r in refs_ok[:60]:
        print(f"- {r}")
    print("\nNota: el script no detecta remisiones relativas ('artículo anterior', 'presente artículo'),"
          " remisiones a párrafos ni remisiones redactadas de forma atípica. Revíselas manualmente.")


# Alertas léxicas: patrones que suelen generar duda. Son candidatos; sólo cuentan si crean ambigüedad real.
PALABRA = r"[a-záéíóúñ]+"
ALERTAS_LEXICAS = [
    ("Posible ambigüedad de alcance: sustantivos coordinados seguidos de una oración de relativo "
     "(¿el «que…» se refiere a todos o sólo al último?) — matriz CLA-3",
     re.compile(rf"\b(?:[Ll]os|[Ll]as|[Ee]l|[Ll]a)\s+{PALABRA}(?:\s+{PALABRA})?\s+y\s+(?:los|las|el|la)\s+{PALABRA}(?:\s+{PALABRA})?,?\s+que\s+")),
    ("«y/o» — matriz PRE-6", re.compile(r"\by\s*/\s*o\b|\bo\s*/\s*y\b", re.I)),
    ("Expresión temporal indeterminada — matriz PRE-1",
     re.compile(r"\b(?:plazo|tiempo|t[ée]rmino)\s+razonable|a\s+la\s+(?:mayor\s+)?brevedad|\boportunamente\b|"
                r"de\s+manera\s+oportuna|en\s+breve(?:\s+t[ée]rmino)?|lo\s+antes\s+posible|"
                r"tan\s+pronto\s+como\s+sea\s+posible|en\s+su\s+oportunidad", re.I)),
    ("«deber de» + infinitivo (obligación se expresa con «deber» + infinitivo) — matriz LEN-4",
     re.compile(r"\bdeber[áa]n?\s+de\s+" + PALABRA + r"(?:ar|er|ir)\b", re.I)),
    ("«mismo/a que» usado como relativo — matriz LEN-7", re.compile(r"\b(?:mism[oa]s?)\s+que\b", re.I)),
]


def alertas_lexicas(lineas):
    salida = []
    for n, linea in enumerate(lineas, start=1):
        for descripcion, patron in ALERTAS_LEXICAS:
            for m in patron.finditer(linea):
                salida.append(f"- línea {n}: «{m.group(0).strip()}» — {descripcion}")
    return salida


def revisar_puntuacion_enumeracion(u, lineas, fracciones):
    """Convención usual: ';' entre elementos, ', y' / ', o' en el penúltimo y '.' en el último."""
    avisos = []
    if len(fracciones) < 2:
        return avisos
    finales = []
    for i, (rom, _, l) in enumerate(fracciones):
        fin = fracciones[i + 1][2] - 1 if i + 1 < len(fracciones) else l
        # Texto completo de la fracción (el PDF puede partir ", y" en otra línea), sin líneas
        # residuales de encabezados de página (texto sólo en mayúsculas).
        bloque = [x.strip() for x in lineas[l - 1:fin] if x.strip() and not (len(x.strip()) > 10 and x.strip() == x.strip().upper())]
        finales.append((rom, " ".join(bloque).rstrip()))
    for i, (rom, linea) in enumerate(finales):
        ultima, penultima = i == len(finales) - 1, i == len(finales) - 2
        if ultima or linea.endswith(("...", "…")) or re.search(r"\(?\s*(?:Se\s+deroga|Derogad[oa])\.?\s*\)?\.?$", linea, re.I):
            continue  # el cierre puede ser '.' o dar paso a un párrafo; las porciones derogadas no se puntúan
        if penultima and not re.search(r"[,;]\s*(?:y|e|o|u)$", linea) and not linea.endswith(";"):
            avisos.append(f"[PUNTUACIÓN] {u.etiqueta}, fracción {rom}: el penúltimo elemento no termina en ', y' / ', o' ni en ';'.")
        elif not penultima and not linea.endswith((";", ":")):
            avisos.append(f"[PUNTUACIÓN] {u.etiqueta}, fracción {rom}: el elemento no termina en ';'.")
    return avisos


def imprimir_decreto(texto, cuerpo_art):
    print("## Enunciado del decreto frente al cuerpo")
    parrafo = next((p for p in texto.split("\n") if RE_DECRETO.search(p)), "")
    m = RE_DECRETO_ENUNCIADO.search(parrafo)
    if not m:
        print("- No se pudo aislar la fórmula de reforma (Se reforma…/se adiciona…/se deroga… para quedar…).\n")
        return
    enunciado = re.sub(r"\s+", " ", m.group(1))
    # Se retiran las menciones a porciones (fracciones, párrafos, incisos) para aislar los artículos.
    sin_porciones = re.sub(
        r"\b(?:una\s+|un\s+|las\s+|los\s+|la\s+|el\s+)?(?:fracci(?:ón|on|ones)|p[áa]rrafos?|incisos?|apartados?|numerales?)\s+"
        r"(?:[IVXLC]+|[a-z]\)|\d+|\w+o)(?:\s*(?:,|y|e)\s*(?:[IVXLC]+|[a-z]\)|\d+))*\s*(?:,\s*)?",
        "", enunciado, flags=re.I)
    print(f"- Fórmula detectada: «{enunciado.strip()}»")
    anunciados = set()
    for frag in re.split(r";|\by\s+se\b", sin_porciones):
        for ma in re.finditer(r"art[íi]culos?\s+((?:\d+\s*(?:o\.|º)?(?:\s*(?:Bis|Ter|Qu[áa]ter))?(?:\s*(?:,|\by\b|\be\b)\s*)*)+)", frag, re.I):
            for num, suf in extraer_numeros(ma.group(1)):
                anunciados.add((num, clave_sufijo(suf)))
        for ma in re.finditer(r"al\s+art[íi]culo\s+(\d+)", frag, re.I):
            anunciados.add((int(ma.group(1)), 0))
    en_cuerpo = {u.clave() for u in cuerpo_art}
    fmt = lambda c: f"{c[0]}{'' if c[1] == 0 else ' ' + SUFIJOS_LATINOS[c[1] - 1].capitalize()}"
    print(f"- Artículos mencionados en la fórmula: {', '.join(fmt(c) for c in sorted(anunciados)) or 'ninguno'}")
    print(f"- Artículos con texto en el cuerpo: {', '.join(fmt(c) for c in sorted(en_cuerpo)) or 'ninguno'}")
    for c in sorted(anunciados - en_cuerpo):
        print(f"- [DISCORDANCIA] El artículo {fmt(c)} se menciona en la fórmula pero no tiene texto en el cuerpo.")
    for c in sorted(en_cuerpo - anunciados):
        print(f"- [DISCORDANCIA] El artículo {fmt(c)} tiene texto en el cuerpo pero no se menciona en la fórmula.")
    print("- Compruebe manualmente fracciones, párrafos e incisos enunciados, y que cada porción cuyo texto\n"
          "  cambia (incluida la puntuación) esté enunciada como reformada, adicionada o derogada.\n")


# ---------------------------------------------------------------------------
# Comando: terminos
# ---------------------------------------------------------------------------

RE_INICIO_DEF = re.compile(r"se\s+(?:entender[áa]|entiende|entienden|entender[áa]n)\s+por", re.I)
RE_DEF_FRACCION = re.compile(r"^\s*(?:[IVXLC]+|[a-z]|\d+)\s*[\.\)\-–]+\s*([^:]{2,80}?)\s*:\s*(\S.*)$")
# Definición en línea: "se entenderá por Sala la sala de juntas…" o "se entenderá por «Sala»: …".
RE_DEF_LINEA = re.compile(
    r"se\s+(?:entender[áa]|entiende)n?\s+por\s+[\"«“]?([A-ZÁÉÍÓÚÑ][\wáéíóúñ]*(?:\s+(?:de|del|y|[A-ZÁÉÍÓÚÑ][\wáéíóúñ]*))*)[\"»”]?"
    r"\s*(?::|,)?\s+((?:el|la|los|las|al|a|un|una)\b.*)$")
ARTICULOS = r"(?:el|la|los|las|un|una|al)"
# Palabras con mayúscula que no deben tomarse por términos definidos.
NO_TERMINOS = {"Artículo", "Artículos", "Transitorio", "Transitorios", "Capítulo", "Título", "Sección", "Anexo", "Único", "Única"}


def descripcion_nuclear(definicion):
    """Primer sintagma de la definición: 'La sala de juntas de la Unidad…' -> ['sala', 'de', 'juntas']."""
    palabras = re.sub(rf"^{ARTICULOS}\s+", "", definicion.strip(), flags=re.I).split()
    nucleo = [w.strip(",;.:") for w in palabras[:3]]
    return nucleo if len(nucleo) == 3 and nucleo[1].lower() in ("de", "del") else []


def cmd_terminos(lineas):
    print("# Términos definidos y su uso (candidatos: confirmar leyendo el texto)\n")
    inicio = next((i for i, l in enumerate(lineas) if RE_INICIO_DEF.search(l)), None)
    terminos, fin = [], inicio if inicio is not None else -1
    if inicio is not None:
        m = RE_DEF_LINEA.search(lineas[inicio])
        if m:
            terminos.append((m.group(1).strip(), inicio + 1, m.group(2)))
        for i in range(inicio + 1, min(len(lineas), inicio + 200)):
            l = lineas[i].strip()
            if not l:
                continue
            m = RE_DEF_FRACCION.match(l)
            if m:
                terminos.append((m.group(1).strip().strip("*\"“”«»"), i + 1, m.group(2)))
                fin = i
            elif RE_ARTICULO_NUM.match(l) or RE_ORDINAL_SUELTO.match(l) or RE_DIVISION.match(l):
                break
    resto = "\n".join(lineas[fin + 1:])
    if not terminos:
        print("- No se detectaron definiciones con la fórmula 'se entenderá por'. Revise manualmente.\n")
    else:
        print(f"Definiciones detectadas a partir de la línea {inicio + 1}. Términos: {len(terminos)}\n")
        print("| Término | Línea | Usos exactos posteriores | Variantes de mayúsculas | Posibles denominaciones alternativas |")
        print("|---|---|---|---|---|")
    for termino, linea, definicion in terminos:
        # Se cuentan también los plurales regulares ("Solicitud" / "Solicitudes").
        exactos = len(re.findall(rf"(?<!\w){re.escape(termino)}(?:e?s)?(?!\w)", resto))
        variantes = sorted({v for v in re.findall(rf"(?<!\w){re.escape(termino)}(?:e?s)?(?!\w)", resto, re.I)
                            if v not in (termino, termino + "s", termino + "es")})
        alternativas = set()
        palabras = termino.split()
        if len(palabras) >= 2:
            cola = re.escape(" ".join(palabras[1:]))
            for m in re.finditer(rf"(?<!\w)([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)\s+{cola}(?!\w)", resto):
                if m.group(1) != palabras[0]:
                    alternativas.add(m.group(0))
        # Uso de la descripción en lugar del término ("la sala de juntas", "el salón de juntas").
        nucleo = descripcion_nuclear(definicion)
        if nucleo:
            cola = re.escape(" ".join(nucleo[1:]))
            for m in re.finditer(rf"(?<!\w)([\wáéíóúñ]+)\s+{cola}(?!\w)", resto, re.I):
                cabeza = m.group(1).lower()
                # Sólo se sugiere si la palabra inicial coincide o se parece a la de la definición
                # ("sala"/"salón"), para no confundir sintagmas ajenos que comparten la preposición.
                if cabeza != termino.lower() and cabeza[:3] == nucleo[0].lower()[:3]:
                    alternativas.add(m.group(0))
        print(f"| {termino} | {linea} | {exactos} | {', '.join(variantes) or '—'} | {', '.join(sorted(alternativas)) or '—'} |")

    # Expresiones con mayúscula inicial a mitad de oración que no están definidas.
    definidos = {t.lower() for t, _, _ in terminos}
    candidatos = {}
    for m in re.finditer(r"(?<=[a-záéíóúñ0-9,;] )([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|del)\s+[a-záéíóúñ]+|\s+(?:de\s+|del\s+|de\s+la\s+|de\s+los\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)", resto):
        frase = m.group(1)
        base = re.sub(r"(?:e?s)$", "", frase.lower())
        if (frase in NO_TERMINOS or ordinal_a_numero(frase) or frase.lower() in definidos
                or any(base == re.sub(r"(?:e?s)$", "", d) or d.startswith(frase.lower() + " ") for d in definidos)):
            continue
        candidatos[frase] = candidatos.get(frase, 0) + 1
    if candidatos:
        print("\n## Expresiones con mayúscula inicial no definidas (a mitad de oración)")
        print("Pueden ser denominaciones de órganos u ordenamientos (correctas) o términos que perdieron su definición.")
        lista = sorted(candidatos.items())
        for frase, n in lista[:40]:
            print(f"- {frase} ({n})")
        if len(lista) > 40:
            print(f"- … y {len(lista) - 40} más")
    print("\nInterpretación: 0 usos sugiere término definido innecesario o sustituido por otra denominación;"
          " las variantes y alternativas son candidatas a uso inconsistente. El script no detecta todos los"
          " sinónimos de una sola palabra: búsquelos manualmente.")


# ---------------------------------------------------------------------------
# Comando: comparar
# ---------------------------------------------------------------------------

MODALES = re.compile(
    r"\b(deber[áa]n?|debe[n]?|podr[áa]n?|puede[n]?|tendr[áa]n?|queda\s+prohibido|se\s+prohíbe|no\s+podr[áa]n?|"
    r"en\s+su\s+caso|salvo|excepto|sin\s+perjuicio|siempre\s+que|[uú]nicamente|s[óo]lo)\b",
    re.I,
)
NUMEROS = re.compile(
    r"\b(\d+|un[oa]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta|sesenta|noventa|"
    r"h[áa]biles|naturales|d[íi]as|meses|años)\b",
    re.I,
)


def unidades_para_comparar(lineas):
    unidades, _, _ = segmentar(lineas)
    salida = []
    for u in unidades:
        etiqueta = ("Transitorio " if u.tipo == "transitorio" else "") + u.etiqueta
        cuerpo = " ".join(u.texto)
        cuerpo_sin_etiqueta = re.sub(r"^\S+\s+\S+\s*[\.\-–—:]\s*", "", cuerpo, count=1) if u.tipo == "articulo" else cuerpo
        salida.append((etiqueta, u.tipo, cuerpo_sin_etiqueta))
    return salida


def diff_palabras(a, b):
    pa, pb = a.split(), b.split()
    partes = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, pa, pb).get_opcodes():
        if op == "equal":
            seg = pa[i1:i2]
            partes.append(" ".join(seg if len(seg) <= 8 else seg[:3] + ["…"] + seg[-3:]))
        if op in ("delete", "replace"):
            partes.append("[-" + " ".join(pa[i1:i2]) + "-]")
        if op in ("insert", "replace"):
            partes.append("{+" + " ".join(pb[j1:j2]) + "+}")
    return " ".join(partes)


def cmd_comparar(l1, l2):
    u1, u2 = unidades_para_comparar(l1), unidades_para_comparar(l2)
    print("# Comparación mecánica entre versiones (candidatos: confirmar leyendo ambos textos)\n")
    print(f"Unidades en versión 1: {len(u1)} | en versión 2: {len(u2)}\n")
    # Emparejamiento global: primero los pares con texto más parecido. A igual número, basta un
    # parecido menor (la unidad pudo cambiar mucho, como un artículo de definiciones).
    UMBRAL, UMBRAL_MISMO_NUMERO = 0.55, 0.35
    pares = []
    for i, (e1, t1, c1) in enumerate(u1):
        for j, (e2, t2, c2) in enumerate(u2):
            if (t1 == "transitorio") != (t2 == "transitorio"):
                continue
            r = difflib.SequenceMatcher(None, c1, c2).ratio()
            if r >= UMBRAL or (e1 == e2 and r >= UMBRAL_MISMO_NUMERO):
                pares.append((r + (0.01 if e1 == e2 else 0), i, j, r))
    pares.sort(reverse=True)
    asignado1, usados = {}, set()
    for _, i, j, r in pares:
        if i not in asignado1 and j not in usados:
            asignado1[i] = (j, r)
            usados.add(j)
    filas = []
    for i, (e1, t1, c1) in enumerate(u1):
        if i in asignado1:
            j, r = asignado1[i]
            filas.append((e1, u2[j][0], c1, u2[j][2], r))
        else:
            filas.append((e1, None, c1, None, 0.0))
    print("| Versión 1 | Versión 2 | Situación | Detalle |")
    print("|---|---|---|---|")
    alertas = []
    for e1, e2, c1, c2, r in filas:
        if e2 is None:
            print(f"| {e1} | — | SUPRIMIDO | {c1[:120]}… |")
            continue
        renum = " (renumerado)" if e1.split()[-1] != e2.split()[-1] else ""
        if c1 == c2:
            print(f"| {e1} | {e2} | Sin cambios de texto{renum} | |")
        else:
            print(f"| {e1} | {e2} | Modificado{renum} | {diff_palabras(c1, c2)} |")
            m1, m2 = MODALES.findall(c1), MODALES.findall(c2)
            if [m.lower() for m in m1] != [m.lower() for m in m2]:
                alertas.append(f"{e1}→{e2}: cambian expresiones modales o de excepción: {m1} → {m2}")
            n1, n2 = NUMEROS.findall(c1), NUMEROS.findall(c2)
            if [n.lower() for n in n1] != [n.lower() for n in n2]:
                alertas.append(f"{e1}→{e2}: cambian cifras o unidades de plazo: {n1} → {n2}")
    for j, (e2, _, c2) in enumerate(u2):
        if j not in usados:
            print(f"| — | {e2} | AÑADIDO | {c2[:120]}… |")
    print("\n## Cambios que pueden alterar el alcance normativo (requieren confirmación del responsable)")
    print("\n".join(f"- {a}" for a in alertas) if alertas else "- No se detectaron cambios de modales ni de cifras.")
    print("\nSiguiente paso recomendado: ejecute 'estructura' y 'terminos' sobre la versión 2 para detectar"
          " remisiones rotas por la renumeración y términos usados sin definición.")


# ---------------------------------------------------------------------------


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="comando", required=True)
    for nombre in ("estructura", "terminos"):
        s = sub.add_parser(nombre)
        s.add_argument("archivo")
        s.add_argument("--desde")
        s.add_argument("--hasta")
    s = sub.add_parser("comparar")
    s.add_argument("version_1")
    s.add_argument("version_2")
    args = p.parse_args()
    if args.comando == "estructura":
        cmd_estructura(leer(args.archivo, args.desde, args.hasta))
    elif args.comando == "terminos":
        cmd_terminos(leer(args.archivo, args.desde, args.hasta))
    else:
        cmd_comparar(leer(args.version_1), leer(args.version_2))


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:  # salida truncada por el usuario (p. ej., con head)
        sys.exit(0)
