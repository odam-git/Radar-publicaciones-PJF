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
    "ID", "ID de persona", "Nombre completo", "Expediente", "Causa penal", "Delito(s)",
    "Entidad Federativa", "Circuito", "Juzgado de Distrito", "Lugar de reclusión",
    "Motivo de la privación de libertad", "Otra causa: autoridad", "Otra causa: situación",
    "Fecha de inicio de la averiguación previa", "Fecha de auto de formal prisión",
    "Tipo de procedimiento", "Etapa procesal", "Instancia actual",
    "Fecha de cierre de instrucción", "Fecha de la audiencia de vista",
    "Último acto procesal", "Fecha del último acto procesal",
    "Fecha de sentencia de primera instancia", "Pena impuesta (no firme)",
    "Revisión de la medida: solicitada", "Revisión de la medida: fecha", "Revisión de la medida: resultado",
    "Fecha de ejecutoria", "Motivo de baja", "Fecha de corte", "Observaciones",
]
FECHA_CORTE_ANTERIOR = date(2026, 9, 1)

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

# Catálogo de la versión 3: solo se usa para conservar la secuencia aleatoria original;
# después se traduce al catálogo literal del CFPP (ETAPAS_V4).
ETAPAS = [
    "Instrucción",
    "Cierre de instrucción / conclusiones",
    "Sentencia de primera instancia",
    "Apelación (Tribunal de Alzada)",
    "Amparo directo",
    "Reposición del procedimiento",
]
ETAPAS_CON_SENTENCIA = ETAPAS[2:5]

# Catálogo literal del Código Federal de Procedimientos Penales (versión 4).
ETAPAS_V4 = [
    "Instrucción",                                        # arts. 1o fracc. III y 147
    "Instrucción agotada / cerrada",                      # art. 150
    "Conclusiones",                                       # art. 291
    "Audiencia de vista / citado para sentencia",         # art. 305
    "Sentencia de primera instancia (plazo para apelar)", # arts. 360 y 368
    "Segunda instancia (apelación)",                      # arts. 4o, 363 y 364
    "Reposición del procedimiento",                       # arts. 386 a 388
    "Procedimiento suspendido (art. 468)",                # art. 468
]
ACTOS_V4 = {
    ETAPAS_V4[0]: ["Se desahogó la prueba testimonial ofrecida por la defensa",
                   "Se ordenó girar exhorto para el desahogo de una diligencia",
                   "Se difirió la audiencia de careos por falta de traslado",
                   "Se admitieron las pruebas periciales ofrecidas por las partes"],
    ETAPAS_V4[1]: ["Se declaró agotada la instrucción y se puso el proceso a la vista de las partes",
                   "Se declaró cerrada la instrucción"],
    ETAPAS_V4[2]: ["Se puso la causa a la vista del Ministerio Público para formular conclusiones",
                   "El Ministerio Público formuló conclusiones acusatorias; vista a la defensa"],
    ETAPAS_V4[3]: ["Se celebró la audiencia de vista; el asunto quedó en estado de sentencia",
                   "Se citó a la audiencia de vista"],
    ETAPAS_V4[4]: ["Se dictó sentencia de primera instancia; corre el plazo para apelar",
                   "Se notificó la sentencia de primera instancia a las partes"],
    ETAPAS_V4[5]: ["Se admitió la apelación contra la sentencia de primera instancia; pendiente de resolución",
                   "El tribunal de apelación señaló fecha para la vista"],
    ETAPAS_V4[6]: ["El tribunal de apelación ordenó la reposición del procedimiento",
                   "Se repuso el procedimiento a partir de la diligencia anulada"],
    ETAPAS_V4[7]: ["Se suspendió el procedimiento por incapacidad mental sobrevenida del procesado (art. 468, fracc. III)"],
}
TRADUCCION_ETAPAS = {
    "Instrucción": [ETAPAS_V4[0]],
    "Cierre de instrucción / conclusiones": ETAPAS_V4[1:4],
    "Sentencia de primera instancia": [ETAPAS_V4[4]],
    "Apelación (Tribunal de Alzada)": [ETAPAS_V4[5]],
    "Amparo directo": [ETAPAS_V4[5]],  # el amparo directo sale del universo; aquí se vuelve segunda instancia
    "Reposición del procedimiento": [ETAPAS_V4[6]],
}
CON_CIERRE = ETAPAS_V4[1:6]
CON_AUDIENCIA = ETAPAS_V4[3:6]
CON_SENTENCIA_V4 = ETAPAS_V4[4:6]

# Fechas de entrada en vigor del CNPP en el ámbito federal (declaratorias del Congreso de la Unión).
DECLARATORIAS = {
    "Durango": date(2014, 11, 24), "Puebla": date(2014, 11, 24),
    "Yucatán": date(2015, 3, 16), "Zacatecas": date(2015, 3, 16),
    "Baja California Sur": date(2015, 8, 1), "Guanajuato": date(2015, 8, 1), "Querétaro": date(2015, 8, 1),
    "San Luis Potosí": date(2015, 8, 1),
    "Chiapas": date(2015, 11, 30), "Chihuahua": date(2015, 11, 30), "Coahuila": date(2015, 11, 30),
    "Nayarit": date(2015, 11, 30), "Oaxaca": date(2015, 11, 30), "Sinaloa": date(2015, 11, 30), "Tlaxcala": date(2015, 11, 30),
    "Aguascalientes": date(2016, 2, 29), "Colima": date(2016, 2, 29), "Estado de México": date(2016, 2, 29),
    "Hidalgo": date(2016, 2, 29), "Morelos": date(2016, 2, 29), "Nuevo León": date(2016, 2, 29),
    "Quintana Roo": date(2016, 2, 29), "Tabasco": date(2016, 2, 29), "Ciudad de México": date(2016, 2, 29),
    "Campeche": date(2016, 4, 29), "Michoacán": date(2016, 4, 29), "Sonora": date(2016, 4, 29), "Veracruz": date(2016, 4, 29),
    "Baja California": date(2016, 6, 14), "Guerrero": date(2016, 6, 14), "Jalisco": date(2016, 6, 14), "Tamaulipas": date(2016, 6, 14),
}
MOTIVOS_BAJA = [
    "Sentencia ejecutoriada (art. 360 CFPP)",
    "Libertad provisional bajo caución (art. 399 CFPP)",
    "Libertad por desvanecimiento de datos (art. 422 CFPP)",
    "Sobreseimiento (art. 298 CFPP)",
    "Conclusiones no acusatorias / inmediata libertad (art. 291 CFPP)",
    "Cese o sustitución de la medida (quinto transitorio, DOF 17-06-2016)",
    "Amparo directo promovido (art. 170 Ley de Amparo)",
    "Otro (especificar en observaciones)",
]
RESULTADOS_REVISION = ["Pendiente de resolver", "Se mantuvo la prisión preventiva",
                       "Se sustituyó la medida", "Cesó la medida"]
VIGOR_DECRETO_2016 = date(2016, 6, 18)

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

MOTIVOS = [
    "Solo por esta causa federal",
    "Por esta causa y por otra causa federal",
    "Por esta causa y por causa del fuero común",
    "Solo por causa del fuero común",
    "Compurga pena por otra causa",
]
SITUACIONES_OTRA = ["En proceso", "Sentenciada (no firme)", "Compurgando pena"]

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
    rnd2 = random.Random(SEMILLA + 1)  # campos añadidos en la versión 3 (no altera los demás)
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
        acto = f"{rnd.choice(ACTOS[etapa])}."

        anio = afp.year
        if etapa == "Apelación (Tribunal de Alzada)":
            instancia = f"Tribunal Colegiado de Apelación del {circuito} (Toca FIC-{rnd.randint(1, 300)}/{fecha_acto.year})"
        elif etapa == "Amparo directo":
            instancia = f"Tribunal Colegiado en Materia Penal del {circuito} (A.D. FIC-{rnd.randint(1, 500)}/{fecha_acto.year})"
        else:
            instancia = juzgado

        delitos = rnd.sample(DELITOS, rnd.choice([1, 1, 2]))
        motivo = rnd2.choices(MOTIVOS, weights=[70, 8, 10, 6, 6])[0]
        otra_autoridad, otra_situacion = "", ""
        if motivo == "Por esta causa y por otra causa federal":
            otra_autoridad = rnd2.choice([j for j in juzgados if j != juzgado] or juzgados) + " (otra causa federal)"
            otra_situacion = rnd2.choice(SITUACIONES_OTRA[:2])
        elif "fuero común" in motivo:
            otra_autoridad = f"Juzgado Penal de Primera Instancia en {entidad} (fuero común, ficticio)"
            otra_situacion = rnd2.choice(SITUACIONES_OTRA[:2])
        elif motivo.startswith("Compurga"):
            otra_autoridad = rnd2.choice([f"Juzgado de Ejecución en {entidad} (fuero común, ficticio)",
                                          f"Juzgado de Distrito Especializado en Ejecución en {entidad} (ficticio)"])
            otra_situacion = "Compurgando pena"
        registros.append({
            "ID": i + 1,
            "ID de persona": f"PER-{i + 1:04d}",
            "Nombre completo": nombre,
            "Expediente": f"EXP-FIC-{1000 + i * 7}/{anio}",
            "Causa penal": f"CP-FIC-{100 + i:03d}/{anio}",
            "Delito(s)": "; ".join(delitos),
            "Entidad Federativa": entidad,
            "Circuito": circuito,
            "Juzgado de Distrito": juzgado,
            "Lugar de reclusión": rnd.choice(lugares),
            "Motivo de la privación de libertad": motivo,
            "Otra causa: autoridad": otra_autoridad,
            "Otra causa: situación": otra_situacion,
            "Fecha de auto de formal prisión": afp.isoformat(),
            "Etapa procesal": etapa,
            "Instancia actual": instancia,
            "Último acto procesal": acto,
            "Fecha de inicio de la averiguación previa": "",
            "Tipo de procedimiento": "",
            "Fecha de cierre de instrucción": "",
            "Fecha de la audiencia de vista": "",
            "Revisión de la medida: solicitada": "",
            "Revisión de la medida: fecha": "",
            "Revisión de la medida: resultado": "",
            "Motivo de baja": "",
            "Fecha del último acto procesal": fecha_acto.isoformat(),
            "Fecha de sentencia de primera instancia": sentencia,
            "Pena impuesta (no firme)": pena,
            "Fecha de ejecutoria": "",
            "Fecha de corte": FECHA_REFERENCIA.isoformat(),
            "Observaciones": rnd.choice(OBSERVACIONES),
        })

    adaptar_v4(registros)

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
    r2["ID de persona"] = r1["ID de persona"]  # misma persona, dos causas
    r1["Observaciones"] = r2["Observaciones"] = "Persona ficticia con dos causas penales distintas."

    # Coimputados: varias PPL en la misma causa y juzgado (mismo auto de formal prisión y etapa).
    for base_i, otros in [(40, [54, 63]), (49, [58])]:
        base = registros[base_i]
        for j in otros:
            for campo in ["Expediente", "Causa penal", "Delito(s)", "Entidad Federativa", "Circuito",
                          "Juzgado de Distrito", "Lugar de reclusión", "Fecha de auto de formal prisión",
                          "Etapa procesal", "Instancia actual", "Último acto procesal",
                          "Fecha del último acto procesal", "Fecha de sentencia de primera instancia",
                          "Fecha de inicio de la averiguación previa", "Tipo de procedimiento",
                          "Fecha de cierre de instrucción", "Fecha de la audiencia de vista"]:
                registros[j][campo] = base[campo]
            if not base["Fecha de sentencia de primera instancia"]:
                registros[j]["Pena impuesta (no firme)"] = ""
            elif not registros[j]["Pena impuesta (no firme)"]:
                registros[j]["Pena impuesta (no firme)"] = base["Pena impuesta (no firme)"]
            registros[j]["Observaciones"] = "Coimputado ficticio: comparte causa con otras PPL."

    # Registro sin fecha de auto de formal prisión (debe generar aviso de revisión).
    registros[INDICE_SIN_FECHA]["Fecha de auto de formal prisión"] = ""
    registros[INDICE_SIN_FECHA]["Observaciones"] = "Registro de prueba sin fecha de auto de formal prisión."

    # Registros fuera del seguimiento (IDs 151 a 157), todos ficticios:
    #   bajas: 151 ejecutoria, 152 fecha de ejecutoria sin actualizar la etapa,
    #          153 desvanecimiento de datos, 154 cese de la medida tras su revisión;
    #   amparo directo en trámite: 155, 156 y 157 (sentencia definitiva; fuera del universo).
    salidas = [
        ({"Etapa procesal": "Sentencia ejecutoriada", "Fecha de ejecutoria": "2026-08-14",
          "Motivo de baja": MOTIVOS_BAJA[0]}, "Registro de prueba: sentencia ejecutoriada."),
        ({"Etapa procesal": ETAPAS_V4[5], "Fecha de ejecutoria": "2026-09-03", "Motivo de baja": ""},
         "Registro de prueba: tiene fecha de ejecutoria aunque la etapa no se actualizó."),
        ({"Etapa procesal": ETAPAS_V4[0], "Motivo de baja": MOTIVOS_BAJA[2]},
         "Registro de prueba: obtuvo libertad por desvanecimiento de datos."),
        ({"Etapa procesal": ETAPAS_V4[0], "Motivo de baja": MOTIVOS_BAJA[5], "Revisión de la medida: solicitada": "Sí",
          "Revisión de la medida: fecha": "2026-07-20", "Revisión de la medida: resultado": "Cesó la medida"},
         "Registro de prueba: cesó la prisión preventiva tras su revisión."),
        ({"Etapa procesal": "Amparo directo", "Motivo de baja": ""}, "Registro de prueba: amparo directo en trámite."),
        ({"Etapa procesal": "Amparo directo", "Motivo de baja": ""}, "Registro de prueba: amparo directo en trámite."),
        ({"Etapa procesal": "Amparo directo", "Motivo de baja": ""}, "Registro de prueba: amparo directo en trámite."),
    ]
    for k, (cambios, obs) in enumerate(salidas):
        base = dict(registros[30 + k])
        n = TOTAL + k + 1
        base.update({
            "ID": n,
            "ID de persona": f"PER-{n:04d}",
            "Nombre completo": nombre_aleatorio(rnd),
            "Expediente": f"EXP-FIC-{9000 + k}/2019",
            "Causa penal": f"CP-FIC-{900 + k}/2019",
            "Fecha de ejecutoria": "",
            "Observaciones": obs,
        })
        base.update(cambios)
        if cambios["Etapa procesal"] == "Amparo directo":
            base["Instancia actual"] = f"Tribunal Colegiado en Materia Penal del {base['Circuito']} (A.D. FIC-{40 + k}/2026)"
            base["Último acto procesal"] = "Se promovió amparo directo contra la sentencia de segunda instancia; la persona quedó a disposición del Tribunal Colegiado (art. 191 Ley de Amparo)."
            if not base["Fecha de sentencia de primera instancia"]:
                base["Fecha de sentencia de primera instancia"] = "2022-05-10"
                base["Pena impuesta (no firme)"] = 18
        registros.append(base)

    return registros


ANTERIOR_DE_ETAPA = {
    ETAPAS_V4[2]: ETAPAS_V4[1],
    ETAPAS_V4[3]: ETAPAS_V4[2],
    ETAPAS_V4[4]: ETAPAS_V4[3],
    ETAPAS_V4[5]: ETAPAS_V4[4],
}


def generar_corte_anterior(registros):
    """Corte ficticio del 1 de septiembre de 2026 para probar el comparativo:
    3 altas (no existían), 2 bajas (ya no aparecen), 5 cambios de etapa y las 2
    registros que hoy están fuera del seguimiento (bajas y amparo directo) todavía activos."""
    rnd = random.Random(SEMILLA + 2)
    activos = [r for r in registros if r["ID"] <= TOTAL]
    altas = {r["ID"] for r in activos if r["Fecha de auto de formal prisión"] >= "2026-01-01"}
    altas = set(sorted(altas)[:3])
    anteriores = []
    cambios = 0
    for r in registros:
        if r["ID"] in altas:
            continue
        a = dict(r)
        a["Fecha de corte"] = FECHA_CORTE_ANTERIOR.isoformat()
        if r["ID"] > TOTAL:  # hace un mes todavía estaban en seguimiento
            a.update({"Fecha de ejecutoria": "", "Motivo de baja": "",
                      "Etapa procesal": ETAPAS_V4[0] if r["Etapa procesal"] == ETAPAS_V4[0] else ETAPAS_V4[5]})
            if a["Revisión de la medida: resultado"] == "Cesó la medida":
                a["Revisión de la medida: resultado"] = "Pendiente de resolver"
        elif cambios < 5 and a["Etapa procesal"] in ANTERIOR_DE_ETAPA and r["ID"] % 7 == 0:
            a["Etapa procesal"] = ANTERIOR_DE_ETAPA[a["Etapa procesal"]]
            cambios += 1
        anteriores.append(a)
    for k in range(2):  # bajas: estaban hace un mes y ya no están
        b = dict(registros[80 + k])
        b.update({"ID": 960 + k, "ID de persona": f"PER-{960 + k:04d}", "Nombre completo": nombre_aleatorio(rnd),
                  "Expediente": f"EXP-FIC-{9600 + k}/2010", "Causa penal": f"CP-FIC-{960 + k}/2010",
                  "Fecha de corte": FECHA_CORTE_ANTERIOR.isoformat(),
                  "Observaciones": "Registro de prueba: obtuvo su libertad antes del corte actual (dato ficticio)."})
        anteriores.append(b)
    return anteriores


def adaptar_v4(registros):
    """Traduce las etapas al catálogo literal del CFPP y agrega los rubros de la versión 4
    con fechas coherentes: averiguación previa < auto de formal prisión < cierre de instrucción
    < audiencia de vista < sentencia < último acto <= fecha de referencia."""
    rnd = random.Random(SEMILLA + 3)
    hoy = FECHA_REFERENCIA

    def entre(a, b):
        return a if b <= a else a + timedelta(days=rnd.randint(0, (b - a).days))

    verificar = 0
    for r in registros:
        afp = date.fromisoformat(r["Fecha de auto de formal prisión"])
        etapa = rnd.choice(TRADUCCION_ETAPAS[r["Etapa procesal"]])
        if etapa == ETAPAS_V4[0] and (hoy - afp).days > 3650 and rnd.random() < 0.12:
            etapa = ETAPAS_V4[7]
        sentencia = date.fromisoformat(r["Fecha de sentencia de primera instancia"]) if r["Fecha de sentencia de primera instancia"] else None
        if etapa not in CON_SENTENCIA_V4:
            sentencia = None
            r["Fecha de sentencia de primera instancia"], r["Pena impuesta (no firme)"] = "", ""
        tope = (sentencia or hoy) - timedelta(days=20)

        decl = DECLARATORIAS[r["Entidad Federativa"]]
        ap = afp - timedelta(days=rnd.randint(20, 900))
        # Procedimiento iniciado antes de la declaratoria (sistema tradicional), salvo dos casos de prueba.
        if ap >= decl:
            if verificar < 2 and afp >= decl + timedelta(days=400):
                ap = decl + timedelta(days=30)
                verificar += 1
            else:
                ap = decl - timedelta(days=rnd.randint(30, 1500))
        r["Fecha de inicio de la averiguación previa"] = ap.isoformat()
        r["Tipo de procedimiento"] = "Sumario" if rnd.random() < 0.08 else "Ordinario"

        ultimo = afp
        if etapa in CON_CIERRE:
            cierre = entre(afp + timedelta(days=90), max(afp + timedelta(days=90), tope - timedelta(days=40)))
            r["Fecha de cierre de instrucción"] = cierre.isoformat()
            ultimo = cierre
            if etapa in CON_AUDIENCIA:
                aud = entre(cierre + timedelta(days=15), max(cierre + timedelta(days=15), tope - timedelta(days=1)))
                r["Fecha de la audiencia de vista"] = aud.isoformat()
                ultimo = aud
        if sentencia:
            ultimo = max(ultimo, sentencia)
        acto = date.fromisoformat(r["Fecha del último acto procesal"])
        if acto <= ultimo:
            acto = min(hoy, ultimo + timedelta(days=rnd.randint(1, 60)))
        r["Fecha del último acto procesal"] = min(acto, hoy).isoformat()
        r["Último acto procesal"] = rnd.choice(ACTOS_V4[etapa]) + "."
        if etapa == ETAPAS_V4[5]:
            r["Instancia actual"] = f"Tribunal Colegiado de Apelación del {r['Circuito']} (Toca FIC-{rnd.randint(1, 300)}/{acto.year})"
        else:
            r["Instancia actual"] = r["Juzgado de Distrito"]
        r["Etapa procesal"] = etapa

        if rnd.random() < 0.25:
            inicio = max(afp, VIGOR_DECRETO_2016)
            r["Revisión de la medida: solicitada"] = "Sí"
            r["Revisión de la medida: fecha"] = entre(inicio, hoy - timedelta(days=1)).isoformat()
            r["Revisión de la medida: resultado"] = rnd.choices(RESULTADOS_REVISION[:2], weights=[25, 75])[0]
        else:
            r["Revisión de la medida: solicitada"] = "No"


def escribir_csv(registros, ruta):
    with open(ruta, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNAS)
        w.writeheader()
        w.writerows(registros)


def escribir(registros):
    DIR_DATOS.mkdir(parents=True, exist_ok=True)

    escribir_csv(registros, DIR_DATOS / "datos_ppl_ficticios.csv")
    escribir_csv(generar_corte_anterior(registros), DIR_DATOS / "corte_anterior_ficticio.csv")

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
    anchos = {"ID": 6, "ID de persona": 12, "Nombre completo": 34, "Juzgado de Distrito": 70,
              "Lugar de reclusión": 50, "Otra causa: autoridad": 60, "Instancia actual": 70,
              "Último acto procesal": 80, "Observaciones": 60, "Delito(s)": 50}
    for i, col in enumerate(COLUMNAS, start=1):
        ws.column_dimensions[get_column_letter(i)].width = anchos.get(col, 20)
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
    print(f"Generados {len(regs)} registros ficticios ({TOTAL} en seguimiento, {len(regs) - TOTAL} fuera) en {DIR_DATOS}")
