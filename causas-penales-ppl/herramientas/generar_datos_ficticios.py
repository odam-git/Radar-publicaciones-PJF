#!/usr/bin/env python3
"""
Generador de la base de datos FICTICIA de CAUSAS PENALES PPL
(personas en prisión preventiva oficiosa sin sentencia firme).

Todos los registros se construyen combinando al azar (con semilla fija,
para que el resultado sea reproducible) listas de nombres, apellidos,
delitos genéricos y lugares inventados. Ningún dato proviene de una
fuente real ni de Internet. Expedientes, causas y tocas llevan el prefijo
"FIC" para que nunca puedan confundirse con números reales.

Contenido:
  - 150 registros en seguimiento, repartidos en los 5 niveles de antigüedad
    (contada desde la fecha de auto de formal prisión al 1 de octubre de 2026),
    con casos exactamente en los límites 2, 5, 10, 20 y 30 años y uno sin fecha.
  - 2 registros con sentencia ejecutoriada (IDs 151 y 152) para probar el
    aviso de baja del seguimiento.

Genera:
  datos/datos_ppl_ficticios.csv   (fuente principal, UTF-8 con BOM para Excel)
  datos/datos_ppl_ficticios.xlsx  (misma información en Excel; requiere openpyxl)
  datos/datos_ppl_ficticios.js    (copia para abrir la app con doble clic, sin servidor)

Uso:  python3 herramientas/generar_datos_ficticios.py
"""
import csv
import json
import random
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR_DATOS = RAIZ / "datos"
SEMILLA = 20261001
TOTAL = 150
FECHA_REFERENCIA = date(2026, 10, 1)

COLUMNAS = [
    "ID", "Nombre completo", "Expediente", "Causa penal", "Delito(s)",
    "Entidad Federativa", "Circuito", "Juzgado de Distrito",
    "Lugar de reclusión", "Situación de reclusión",
    "Fecha de auto de formal prisión", "Etapa procesal", "Instancia actual",
    "Último acto procesal", "Fecha de sentencia de primera instancia",
    "Pena impuesta (no firme)", "Fecha de ejecutoria", "Observaciones",
]

NOMBRES = [
    "Adrián", "Alejandra", "Alfonso", "Alma Delia", "Andrés", "Ángel", "Araceli",
    "Arturo", "Beatriz", "Benito", "Blanca Estela", "Bruno", "Carlos Iván",
    "Cecilia", "César", "Claudia", "Cristian", "Daniela", "Diego", "Edgar",
    "Elena", "Emilio", "Ernesto", "Esteban", "Fabiola", "Fernando", "Gabriel",
    "Gerardo", "Gloria", "Gustavo", "Héctor", "Hilda", "Hugo", "Iris", "Isaac",
    "Javier", "Jesús Manuel", "Jorge Alberto", "José Luis", "Juan Pablo",
    "Julián", "Karina", "Leonardo", "Lorena", "Luis Enrique", "Manuel", "Marco Antonio",
    "María Fernanda", "Mario", "Martha", "Mauricio", "Miguel Ángel", "Mónica",
    "Néstor", "Noemí", "Octavio", "Omar", "Pablo", "Patricia", "Ramiro",
    "Raúl", "Ricardo", "Roberto", "Rocío", "Rodrigo", "Rosa Isela", "Salvador",
    "Samuel", "Sergio", "Silvia", "Tomás", "Ulises", "Valeria", "Víctor Hugo",
    "Ximena", "Yolanda", "Zacarías",
]

APELLIDOS = [
    "Aguilar", "Alvarado", "Arellano", "Barrios", "Bautista", "Benítez",
    "Cabrera", "Camacho", "Campos", "Cárdenas", "Castañeda", "Cervantes",
    "Contreras", "Cordero", "Delgado", "Domínguez", "Escobar", "Espinoza",
    "Estrada", "Figueroa", "Fuentes", "Galindo", "Gallardo", "Garza",
    "Guerrero", "Ibarra", "Lara", "Leyva", "Lozano", "Maldonado", "Márquez",
    "Medina", "Mejía", "Miranda", "Montes", "Navarro", "Ochoa", "Orozco",
    "Pacheco", "Palacios", "Peña", "Quintero", "Rangel", "Robles", "Rosales",
    "Salazar", "Sandoval", "Solís", "Tapia", "Trejo", "Valdez", "Valencia",
    "Velasco", "Villaseñor", "Zamora", "Zavala",
]

DELITOS = [
    "Contra la salud (posesión con fines de comercio)",
    "Contra la salud (transporte)",
    "Portación de arma de fuego de uso exclusivo",
    "Acopio de armas",
    "Delincuencia organizada",
    "Operaciones con recursos de procedencia ilícita",
    "Secuestro",
    "Robo de hidrocarburos",
    "Defraudación fiscal",
    "Falsificación de moneda",
    "Tráfico de personas",
    "Delitos contra el ambiente",
]

# Entidad → (circuito, [juzgados], [lugares]). Nombres de centros inventados.
GEOGRAFIA = {
    "Ciudad de México": ("Primer Circuito", [
        "Juzgado Primero de Distrito de Procesos Penales Federales en la Ciudad de México",
        "Juzgado Segundo de Distrito de Procesos Penales Federales en la Ciudad de México",
        "Juzgado Tercero de Distrito de Procesos Penales Federales en la Ciudad de México",
    ], ["Centro de Reinserción Norte (ficticio)", "Centro de Reinserción Oriente (ficticio)"]),
    "Estado de México": ("Segundo Circuito", [
        "Juzgado Primero de Distrito en Materia Penal en el Estado de México",
        "Juzgado Segundo de Distrito en Materia Penal en el Estado de México",
        "Juzgado Tercero de Distrito en Materia Penal en el Estado de México",
    ], ["Centro Federal de Reinserción Región Centro (ficticio)", "Centro Estatal Valle Alto (ficticio)"]),
    "Jalisco": ("Tercer Circuito", [
        "Juzgado Primero de Distrito en Materia Penal en Jalisco",
        "Juzgado Segundo de Distrito en Materia Penal en Jalisco",
        "Juzgado Tercero de Distrito en Materia Penal en Jalisco",
    ], ["Centro Estatal de Reinserción Los Altos (ficticio)", "Centro Federal de Reinserción Occidente (ficticio)"]),
    "Nuevo León": ("Cuarto Circuito", [
        "Juzgado Primero de Distrito en Materia Penal en Nuevo León",
        "Juzgado Segundo de Distrito en Materia Penal en Nuevo León",
    ], ["Centro Estatal de Reinserción Sierra Madre (ficticio)", "Centro Federal de Reinserción Noreste (ficticio)"]),
    "Sonora": ("Quinto Circuito", [
        "Juzgado Primero de Distrito en Sonora",
        "Juzgado Segundo de Distrito en Sonora",
    ], ["Centro Federal de Reinserción Desierto (ficticio)", "Centro Estatal Costa Norte (ficticio)"]),
    "Puebla": ("Sexto Circuito", [
        "Juzgado Primero de Distrito en Materia Penal en Puebla",
        "Juzgado Segundo de Distrito en Materia Penal en Puebla",
    ], ["Centro Estatal de Reinserción Los Volcanes (ficticio)", "Centro Regional de Reinserción Sur (ficticio)"]),
    "Veracruz": ("Séptimo Circuito", [
        "Juzgado Primero de Distrito en Veracruz",
        "Juzgado Segundo de Distrito en Veracruz",
        "Juzgado Tercero de Distrito en Veracruz",
    ], ["Centro Estatal de Reinserción Golfo (ficticio)", "Centro Federal de Reinserción Sureste (ficticio)"]),
    "Michoacán": ("Décimo Primer Circuito", [
        "Juzgado Primero de Distrito en Michoacán",
        "Juzgado Segundo de Distrito en Michoacán",
    ], ["Centro Estatal de Reinserción Tierra Caliente (ficticio)", "Centro Regional Lago Azul (ficticio)"]),
    "Sinaloa": ("Décimo Segundo Circuito", [
        "Juzgado Primero de Distrito en Sinaloa",
        "Juzgado Segundo de Distrito en Sinaloa",
    ], ["Centro Estatal de Reinserción Pacífico (ficticio)", "Centro Federal de Reinserción Noroeste (ficticio)"]),
    "Chihuahua": ("Décimo Séptimo Circuito", [
        "Juzgado Primero de Distrito en Chihuahua",
        "Juzgado Segundo de Distrito en Chihuahua",
    ], ["Centro Estatal de Reinserción Barrancas (ficticio)", "Centro Federal de Reinserción Frontera (ficticio)"]),
}

ETAPAS = [
    "Instrucción",
    "Cierre de instrucción / conclusiones",
    "Sentencia de primera instancia",
    "Apelación (Tribunal de Alzada)",
    "Amparo directo",
    "Reposición del procedimiento",
]
ETAPAS_CON_SENTENCIA = ETAPAS[2:5]

# Probabilidad de cada etapa según el nivel de antigüedad (1 = reciente … 5 = más antigua).
PESOS_ETAPA = {
    1: [70, 20, 10, 0, 0, 0],
    2: [35, 25, 15, 15, 0, 10],
    3: [15, 15, 10, 30, 15, 15],
    4: [10, 10, 5, 30, 25, 20],
    5: [10, 10, 5, 25, 25, 25],
}

ACTOS = {
    "Instrucción": [
        "Se desahogó la prueba testimonial ofrecida por la defensa",
        "Se ordenó girar exhorto para el desahogo de una diligencia",
        "Se difirió la audiencia de careos por falta de traslado",
        "Se admitieron las pruebas periciales ofrecidas por las partes",
    ],
    "Cierre de instrucción / conclusiones": [
        "Se declaró cerrada la instrucción y se dio vista para conclusiones",
        "El Ministerio Público formuló conclusiones acusatorias",
        "Se celebró la audiencia de vista",
    ],
    "Sentencia de primera instancia": [
        "Se dictó sentencia de primera instancia; corre el plazo para apelar",
        "Se notificó la sentencia de primera instancia a las partes",
    ],
    "Apelación (Tribunal de Alzada)": [
        "Se interpuso apelación contra la sentencia de primera instancia; pendiente de resolución",
        "El Tribunal de Alzada admitió el recurso y señaló fecha para la vista",
    ],
    "Amparo directo": [
        "Se promovió amparo directo contra la resolución de segunda instancia; pendiente de resolución",
        "El Tribunal Colegiado admitió la demanda de amparo directo",
    ],
    "Reposición del procedimiento": [
        "El Tribunal de Alzada ordenó la reposición del procedimiento",
        "Se repuso el procedimiento a partir del auto de formal prisión",
    ],
}

SITUACIONES = [
    "Privado de la libertad únicamente por esta causa",
    "Privado de la libertad también por causa penal distinta",
    "Compurga pena por causa penal distinta",
]

OBSERVACIONES = [
    "Sin observaciones adicionales.",
    "Registro de prueba.",
    "Se solicitó la revisión de la medida cautelar (dato ficticio).",
    "Cuenta con otra causa penal en trámite (dato ficticio).",
    "Promovió amparo indirecto contra la prisión preventiva (dato ficticio).",
    "Pendiente de traslado a otro centro (dato ficticio).",
    "Defensa pública federal (dato ficticio).",
    "Defensa particular (dato ficticio).",
]

# Límites de cada nivel en años (inclusivo en el límite superior).
LIMITES = {1: (0, 2), 2: (2, 5), 3: (5, 10), 4: (10, 20), 5: (20, 30)}
# Casos exactamente en el límite superior de cada nivel (deben quedar en ese nivel).
CASOS_LIMITE = {0: 2, 1: 5, 2: 10, 3: 20, 4: 30}
INDICE_SIN_FECHA = 72


def restar_anios(fecha, anios):
    try:
        return fecha.replace(year=fecha.year - anios)
    except ValueError:  # 29 de febrero
        return fecha.replace(year=fecha.year - anios, day=28)


def nombre_aleatorio(rnd):
    return f"{rnd.choice(NOMBRES)} {rnd.choice(APELLIDOS)} {rnd.choice(APELLIDOS)}"


def fecha_afp(rnd, i, nivel):
    if i in CASOS_LIMITE:
        return restar_anios(FECHA_REFERENCIA, CASOS_LIMITE[i])
    menor, mayor = LIMITES[nivel]
    mas_reciente = restar_anios(FECHA_REFERENCIA, menor) - timedelta(days=1 if menor else 30)
    mas_antigua = restar_anios(FECHA_REFERENCIA, mayor) + timedelta(days=1)
    return mas_antigua + timedelta(days=rnd.randint(0, (mas_reciente - mas_antigua).days))


def fmt(fecha):
    return fecha.strftime("%d/%m/%Y")


def generar():
    rnd = random.Random(SEMILLA)
    entidades = list(GEOGRAFIA.keys())
    registros, nombres_usados = [], set()

    for i in range(TOTAL):
        entidad = entidades[i % len(entidades)]
        circuito, juzgados, lugares = GEOGRAFIA[entidad]
        juzgado = juzgados[(i // len(entidades)) % len(juzgados)]
        # El nivel rota distinto que la entidad, para que cada entidad tenga los 5 niveles.
        nivel = (i % 10 + i // 10) % 5 + 1

        nombre = nombre_aleatorio(rnd)
        while nombre in nombres_usados:
            nombre = nombre_aleatorio(rnd)
        nombres_usados.add(nombre)

        afp = fecha_afp(rnd, i, nivel)
        etapa = rnd.choices(ETAPAS, weights=PESOS_ETAPA[nivel])[0]
        dias_en_proceso = (FECHA_REFERENCIA - afp).days
        if etapa in ETAPAS_CON_SENTENCIA and dias_en_proceso < 240:
            etapa = "Instrucción"

        sentencia, pena = "", ""
        if etapa in ETAPAS_CON_SENTENCIA:
            f = afp + timedelta(days=rnd.randint(150, dias_en_proceso - 60))
            sentencia, pena = f.isoformat(), rnd.randint(5, 60)
            inicio_acto = f
        else:
            inicio_acto = afp
        fecha_acto = inicio_acto + timedelta(days=rnd.randint(1, max(2, (FECHA_REFERENCIA - inicio_acto).days - 1)))
        acto = f"{rnd.choice(ACTOS[etapa])} el {fmt(fecha_acto)}."

        anio = afp.year
        if etapa == "Apelación (Tribunal de Alzada)":
            instancia = f"Tribunal Colegiado de Apelación del {circuito} (Toca FIC-{rnd.randint(1, 300)}/{fecha_acto.year})"
        elif etapa == "Amparo directo":
            instancia = f"Tribunal Colegiado en Materia Penal del {circuito} (A.D. FIC-{rnd.randint(1, 500)}/{fecha_acto.year})"
        else:
            instancia = juzgado

        delitos = rnd.sample(DELITOS, rnd.choice([1, 1, 2]))
        registros.append({
            "ID": i + 1,
            "Nombre completo": nombre,
            "Expediente": f"EXP-FIC-{1000 + i * 7}/{anio}",
            "Causa penal": f"CP-FIC-{100 + i:03d}/{anio}",
            "Delito(s)": "; ".join(delitos),
            "Entidad Federativa": entidad,
            "Circuito": circuito,
            "Juzgado de Distrito": juzgado,
            "Lugar de reclusión": rnd.choice(lugares),
            "Situación de reclusión": rnd.choices(SITUACIONES, weights=[70, 20, 10])[0],
            "Fecha de auto de formal prisión": afp.isoformat(),
            "Etapa procesal": etapa,
            "Instancia actual": instancia,
            "Último acto procesal": acto,
            "Fecha de sentencia de primera instancia": sentencia,
            "Pena impuesta (no firme)": pena,
            "Fecha de ejecutoria": "",
            "Observaciones": rnd.choice(OBSERVACIONES),
        })

    # --- Casos de prueba deliberados (todos ficticios) ---------------------
    homonimos = ["José Luis Hernández Ruiz", "María Fernanda López Castro", "Juan Pablo Ramírez Soto"]
    for k, nombre in enumerate(homonimos):
        for j in (0, 1):
            r = registros[20 + k * 11 + j * 47]
            r["Nombre completo"] = nombre
            r["Observaciones"] = "Homonimia ficticia de prueba: existe otro registro con el mismo nombre y distinta causa."
    similares = ["José Luis Hernández Ríos", "José Luis Fernández Ruiz", "María Fernanda López Castillo"]
    for k, nombre in enumerate(similares):
        r = registros[95 + k * 9]
        r["Nombre completo"] = nombre
        r["Observaciones"] = "Nombre ficticio similar a otro registro, para probar búsquedas ambiguas."
    r1, r2 = registros[12], registros[139]
    r2["Nombre completo"] = r1["Nombre completo"]
    r1["Observaciones"] = r2["Observaciones"] = "Persona ficticia con dos causas penales distintas."

    # Registro sin fecha de auto de formal prisión (debe generar aviso de revisión).
    registros[INDICE_SIN_FECHA]["Fecha de auto de formal prisión"] = ""
    registros[INDICE_SIN_FECHA]["Observaciones"] = "Registro de prueba sin fecha de auto de formal prisión."

    # Dos registros con sentencia ejecutoriada (deben salir del seguimiento y listarse en el aviso).
    for k, (etapa, ejecutoria) in enumerate([
        ("Sentencia ejecutoriada", "2026-08-14"),
        ("Apelación (Tribunal de Alzada)", "2026-09-03"),  # etapa sin actualizar, pero con fecha de ejecutoria
    ]):
        base = dict(registros[30 + k])
        n = TOTAL + k + 1
        base.update({
            "ID": n,
            "Nombre completo": nombre_aleatorio(rnd),
            "Expediente": f"EXP-FIC-{9000 + k}/2019",
            "Causa penal": f"CP-FIC-{900 + k}/2019",
            "Etapa procesal": etapa,
            "Fecha de ejecutoria": ejecutoria,
            "Observaciones": "Registro de prueba con sentencia ejecutoriada: debe darse de baja del seguimiento.",
        })
        registros.append(base)

    return registros


def escribir(registros):
    DIR_DATOS.mkdir(parents=True, exist_ok=True)

    with open(DIR_DATOS / "datos_ppl_ficticios.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNAS)
        w.writeheader()
        w.writerows(registros)

    escribir_js(registros, DIR_DATOS / "datos_ppl_ficticios.js")

    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        from openpyxl.utils import get_column_letter
    except ImportError:
        print("openpyxl no está instalado: se omitió el .xlsx (el .csv se abre igual en Excel).")
        return
    wb = Workbook()
    ws = wb.active
    ws.title = "PPL"
    ws.append(COLUMNAS)
    for r in registros:
        ws.append([r[c] for c in COLUMNAS])
    for celda in ws[1]:
        celda.font = Font(bold=True, color="FFFFFF", size=12)
        celda.fill = PatternFill("solid", fgColor="0F1E33")
        celda.alignment = Alignment(wrap_text=True, vertical="center")
    anchos = [6, 34, 20, 18, 50, 20, 22, 70, 50, 45, 18, 34, 70, 90, 18, 14, 16, 60]
    for i, ancho in enumerate(anchos, start=1):
        ws.column_dimensions[get_column_letter(i)].width = ancho
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    wb.save(DIR_DATOS / "datos_ppl_ficticios.xlsx")


def escribir_js(registros, ruta):
    """Copia de los datos como script, para que la app funcione con doble clic
    (los navegadores bloquean la lectura de archivos locales vía fetch)."""
    cuerpo = json.dumps(registros, ensure_ascii=False, indent=1)
    ruta.write_text(
        "// ARCHIVO GENERADO AUTOMÁTICAMENTE. No editar a mano.\n"
        "// Fuente: datos_ppl_ficticios.csv  —  DATOS 100 % FICTICIOS.\n"
        "// Para regenerarlo: python3 herramientas/csv_a_js.py\n"
        f"window.FUENTE_PPL_EMBEBIDA = {cuerpo};\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    regs = generar()
    escribir(regs)
    print(f"Generados {len(regs)} registros ficticios ({TOTAL} en seguimiento) en {DIR_DATOS}")
