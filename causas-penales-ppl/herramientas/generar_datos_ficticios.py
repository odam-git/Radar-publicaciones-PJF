#!/usr/bin/env python3
"""
Generador de la base de datos FICTICIA de CAUSAS PENALES PPL.

Todos los registros se construyen combinando al azar (con semilla fija,
para que el resultado sea reproducible) listas de nombres, apellidos,
delitos genéricos y lugares inventados. Ningún dato proviene de una
fuente real ni de Internet. Los expedientes y causas llevan el prefijo
"FIC" para que nunca puedan confundirse con números reales.

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

COLUMNAS = [
    "ID", "Nombre completo", "Expediente", "Causa penal", "Delito",
    "Entidad Federativa", "Circuito", "Juzgado de Distrito",
    "Lugar donde se encuentra", "Pena en años", "Fecha de sentencia",
    "Fecha de inicio", "Fecha de cumplimiento", "Observaciones",
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

# Entidad → (circuito, [juzgados], [lugares]). Los nombres de los centros
# son genéricos e inventados para esta prueba.
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

OBSERVACIONES = [
    "Sin observaciones adicionales.",
    "Sentencia firme. Registro de prueba.",
    "Interpuso recurso de apelación; pendiente de resolución (dato ficticio).",
    "Solicitó beneficio de libertad anticipada (dato ficticio).",
    "Se encuentra en trámite un incidente de traslado (dato ficticio).",
    "Cuenta con otra causa penal en trámite (dato ficticio).",
    "Promovió juicio de amparo directo (dato ficticio).",
    "Pena compurgada parcialmente en prisión preventiva (dato ficticio).",
    "Pendiente de actualizar cómputo de la pena (dato ficticio).",
    "Requiere verificación de domicilio procesal (dato ficticio).",
]

# Penas que deben aparecer obligatoriamente para probar los límites de color.
PENAS_LIMITE = [9, 10, 15, 20, 21, 9.5, 20.5]


def nombre_aleatorio(rnd):
    return f"{rnd.choice(NOMBRES)} {rnd.choice(APELLIDOS)} {rnd.choice(APELLIDOS)}"


def pena_aleatoria(rnd, i):
    if i < len(PENAS_LIMITE):
        return PENAS_LIMITE[i]
    # Reparto aproximado: 1/3 en cada rango.
    rango = i % 3
    if rango == 0:
        return rnd.randint(2, 9)
    if rango == 1:
        return rnd.randint(10, 20)
    return rnd.randint(21, 50)


def sumar_anios(fecha, anios):
    meses = round(anios * 12)
    anio = fecha.year + (fecha.month - 1 + meses) // 12
    mes = (fecha.month - 1 + meses) % 12 + 1
    dia = min(fecha.day, 28)
    return date(anio, mes, dia)


def generar():
    rnd = random.Random(SEMILLA)
    entidades = list(GEOGRAFIA.keys())
    registros = []
    nombres_usados = set()

    for i in range(TOTAL):
        entidad = entidades[i % len(entidades)]
        circuito, juzgados, lugares = GEOGRAFIA[entidad]
        juzgado = juzgados[(i // len(entidades)) % len(juzgados)]
        lugar = rnd.choice(lugares)

        nombre = nombre_aleatorio(rnd)
        while nombre in nombres_usados:
            nombre = nombre_aleatorio(rnd)
        nombres_usados.add(nombre)

        anio_causa = rnd.randint(2012, 2023)
        pena = pena_aleatoria(rnd, i)
        inicio = date(anio_causa, 1, 1) + timedelta(days=rnd.randint(0, 330))
        sentencia = inicio + timedelta(days=rnd.randint(200, 900))
        cumplimiento = sumar_anios(inicio, pena)

        registros.append({
            "ID": i + 1,
            "Nombre completo": nombre,
            "Expediente": f"EXP-FIC-{1000 + i * 7}/{anio_causa}",
            "Causa penal": f"CP-FIC-{100 + i:03d}/{anio_causa}",
            "Delito": rnd.choice(DELITOS),
            "Entidad Federativa": entidad,
            "Circuito": circuito,
            "Juzgado de Distrito": juzgado,
            "Lugar donde se encuentra": lugar,
            "Pena en años": pena,
            "Fecha de sentencia": sentencia.isoformat(),
            "Fecha de inicio": inicio.isoformat(),
            "Fecha de cumplimiento": cumplimiento.isoformat(),
            "Observaciones": rnd.choice(OBSERVACIONES),
        })

    # --- Casos de prueba deliberados (todos ficticios) ---------------------
    # Homonimias exactas: mismo nombre, distinta causa, expediente y entidad.
    homonimos = ["José Luis Hernández Ruiz", "María Fernanda López Castro", "Juan Pablo Ramírez Soto"]
    for k, nombre in enumerate(homonimos):
        for j in (0, 1):
            r = registros[20 + k * 11 + j * 47]
            r["Nombre completo"] = nombre
            r["Observaciones"] = "Homonimia ficticia de prueba: existe otro registro con el mismo nombre y distinta causa."
    # Nombres muy parecidos (búsquedas ambiguas).
    similares = ["José Luis Hernández Ríos", "José Luis Fernández Ruiz", "María Fernanda López Castillo"]
    for k, nombre in enumerate(similares):
        r = registros[95 + k * 9]
        r["Nombre completo"] = nombre
        r["Observaciones"] = "Nombre ficticio similar a otro registro, para probar búsquedas ambiguas."
    # Misma persona ficticia con dos causas distintas.
    r1, r2 = registros[12], registros[139]
    r2["Nombre completo"] = r1["Nombre completo"]
    r1["Observaciones"] = r2["Observaciones"] = "Persona ficticia con dos causas penales distintas."

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
        celda.fill = PatternFill("solid", fgColor="1F3A5F")
        celda.alignment = Alignment(wrap_text=True, vertical="center")
    anchos = [6, 34, 20, 18, 42, 20, 22, 70, 50, 12, 16, 16, 18, 60]
    for i, ancho in enumerate(anchos):
        ws.column_dimensions[chr(65 + i)].width = ancho
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
    print(f"Generados {len(regs)} registros ficticios en {DIR_DATOS}")
