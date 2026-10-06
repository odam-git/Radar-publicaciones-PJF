#!/usr/bin/env python3
"""
Genera plantillas/plantilla_captura_ppl.xlsx: la hoja que llenan los juzgados.

- Hoja "Captura": encabezados exactos que lee la aplicación, con listas desplegables
  (entidad, etapa procesal, motivo de la privación de libertad, situación de la otra causa),
  validación de fechas y de pena, y renglones de ejemplo ficticios en gris.
- Hoja "Instrucciones": qué va en cada columna, si es obligatoria y en qué formato.
- Hoja "Catálogos": las listas que alimentan los desplegables.

Uso:  python3 herramientas/generar_plantilla.py      (requiere: pip install openpyxl)
"""
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "plantillas" / "plantilla_captura_ppl.xlsx"
FILAS = 2000  # renglones con validación

ENTIDADES = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
    "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero",
    "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
    "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
    "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
]
ETAPAS = [
    "Instrucción", "Cierre de instrucción / conclusiones", "Sentencia de primera instancia",
    "Apelación (Tribunal de Alzada)", "Amparo directo", "Reposición del procedimiento",
    "Sentencia ejecutoriada",
]
MOTIVOS = [
    "Solo por esta causa federal", "Por esta causa y por otra causa federal",
    "Por esta causa y por causa del fuero común", "Solo por causa del fuero común",
    "Compurga pena por otra causa",
]
SITUACIONES = ["En proceso", "Sentenciada (no firme)", "Compurgando pena"]

# (columna, obligatoria, tipo, descripción)
COLUMNAS = [
    ("ID", "Sí", "texto", "Número consecutivo del renglón."),
    ("ID de persona", "Recomendado", "texto", "Clave única de la persona (la misma en todas sus causas). Permite contar personas y causas por separado."),
    ("Nombre completo", "Sí", "texto", "Nombre(s) y apellidos. Sin alias."),
    ("Expediente", "Sí", "texto", "Número de expediente."),
    ("Causa penal", "Sí", "texto", "Número de causa penal vigente."),
    ("Delito(s)", "Sí", "texto", "Separar varios delitos con punto y coma."),
    ("Entidad Federativa", "Sí", "lista", "Elegir de la lista."),
    ("Circuito", "Sí", "texto", "Por ejemplo: Sexto Circuito."),
    ("Juzgado de Distrito", "Sí", "texto", "Denominación completa del juzgado."),
    ("Lugar de reclusión", "Sí", "texto", "Centro penitenciario."),
    ("Motivo de la privación de libertad", "Sí", "lista", "Elegir de la lista."),
    ("Otra causa: autoridad", "Si aplica", "texto", "Solo si el motivo menciona otra causa: autoridad que la conoce."),
    ("Otra causa: situación", "Si aplica", "lista", "Solo si el motivo menciona otra causa."),
    ("Fecha de auto de formal prisión", "Sí", "fecha", "Fecha del PRIMER auto de formal prisión (DD/MM/AAAA). Base del semáforo."),
    ("Etapa procesal", "Sí", "lista", "Elegir de la lista. 'Sentencia ejecutoriada' saca el registro del seguimiento."),
    ("Instancia actual", "Sí", "texto", "Órgano que conoce actualmente (juzgado, tribunal de alzada con toca, tribunal colegiado)."),
    ("Último acto procesal", "Sí", "texto", "Reseña breve de la última actuación."),
    ("Fecha del último acto procesal", "Sí", "fecha", "DD/MM/AAAA."),
    ("Fecha de sentencia de primera instancia", "Si aplica", "fecha", "Solo si ya hay sentencia de primera instancia (no firme)."),
    ("Pena impuesta (no firme)", "Si aplica", "número", "En años; se admiten decimales (12.5)."),
    ("Fecha de ejecutoria", "Si aplica", "fecha", "Llenar solo si la sentencia causó ejecutoria; el registro saldrá del seguimiento."),
    ("Fecha de corte", "Sí", "fecha", "Fecha en que se llenó la información (la misma para todos los renglones)."),
    ("Observaciones", "No", "texto", "Información adicional relevante."),
]

EJEMPLO = [
    "1", "PER-0001", "Persona Ficticia Ejemplo", "EXP-FIC-0001/2010", "CP-FIC-001/2010",
    "Delito genérico de ejemplo", "Puebla", "Sexto Circuito", "Juzgado Primero de Distrito en Materia Penal en Puebla",
    "Centro de Reinserción Ficticio", "Solo por esta causa federal", "", "", "15/03/2010", "Instrucción",
    "Juzgado Primero de Distrito en Materia Penal en Puebla", "Se desahogó una prueba testimonial.",
    "10/09/2026", "", "", "", "01/10/2026", "Renglón de ejemplo: bórrelo antes de capturar.",
]


def main():
    wb = Workbook()
    ws = wb.active
    ws.title = "Captura"
    cab = PatternFill("solid", fgColor="0F1E33")
    for i, (nombre, oblig, _, desc) in enumerate(COLUMNAS, start=1):
        c = ws.cell(row=1, column=i, value=nombre)
        c.font = Font(bold=True, color="FFFFFF", size=12)
        c.fill = cab
        c.alignment = Alignment(wrap_text=True, vertical="center")
        ws.column_dimensions[get_column_letter(i)].width = max(16, min(60, len(nombre) + 8))
    for i, v in enumerate(EJEMPLO, start=1):
        c = ws.cell(row=2, column=i, value=v)
        c.font = Font(italic=True, color="5B6573")
    ws.row_dimensions[1].height = 48
    ws.freeze_panes = "A2"

    # Catálogos
    cat = wb.create_sheet("Catálogos")
    for col, (titulo, valores) in enumerate([("Entidades", ENTIDADES), ("Etapas", ETAPAS),
                                             ("Motivos", MOTIVOS), ("Situaciones", SITUACIONES)], start=1):
        cat.cell(row=1, column=col, value=titulo).font = Font(bold=True)
        for f, v in enumerate(valores, start=2):
            cat.cell(row=f, column=col, value=v)
        cat.column_dimensions[get_column_letter(col)].width = 48

    def lista(columna, letra_cat, n):
        dv = DataValidation(type="list", formula1=f"='Catálogos'!${letra_cat}$2:${letra_cat}${n + 1}",
                            allow_blank=True, showErrorMessage=True,
                            errorTitle="Valor no válido", error="Elija un valor de la lista.")
        ws.add_data_validation(dv)
        dv.add(f"{columna}2:{columna}{FILAS}")

    letra = {nombre: get_column_letter(i) for i, (nombre, *_r) in enumerate(COLUMNAS, start=1)}
    lista(letra["Entidad Federativa"], "A", len(ENTIDADES))
    lista(letra["Etapa procesal"], "B", len(ETAPAS))
    lista(letra["Motivo de la privación de libertad"], "C", len(MOTIVOS))
    lista(letra["Otra causa: situación"], "D", len(SITUACIONES))

    for nombre, _, tipo, _ in COLUMNAS:
        rango = f"{letra[nombre]}2:{letra[nombre]}{FILAS}"
        if tipo == "fecha":
            dv = DataValidation(type="date", operator="between", formula1="DATE(1970,1,1)", formula2="DATE(2100,12,31)",
                                allow_blank=True, showErrorMessage=True, showInputMessage=True,
                                promptTitle="Fecha", prompt="Escriba la fecha como DD/MM/AAAA.",
                                errorTitle="Fecha no válida", error="Escriba una fecha válida (DD/MM/AAAA).")
            ws.add_data_validation(dv)
            dv.add(rango)
            for fila in range(2, FILAS + 1):
                ws[f"{letra[nombre]}{fila}"].number_format = "DD/MM/YYYY"
        elif tipo == "número":
            dv = DataValidation(type="decimal", operator="between", formula1="0", formula2="120", allow_blank=True,
                                showErrorMessage=True, errorTitle="Pena no válida", error="Escriba la pena en años (por ejemplo 12.5).")
            ws.add_data_validation(dv)
            dv.add(rango)

    # Instrucciones
    ins = wb.create_sheet("Instrucciones", 0)
    ins.append(["Plantilla de captura — CAUSAS PENALES PPL"])
    ins["A1"].font = Font(bold=True, size=14)
    ins.append(["Llene la hoja 'Captura' (un renglón por persona y causa). No cambie los encabezados."])
    ins.append(["Guárdela como 'CSV UTF-8 (delimitado por comas)' para cargarla en la aplicación."])
    ins.append([])
    ins.append(["Columna", "¿Obligatoria?", "Formato", "Qué capturar"])
    for c in ins[5]:
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = cab
    for nombre, oblig, tipo, desc in COLUMNAS:
        ins.append([nombre, oblig, tipo, desc])
    for col, ancho in zip("ABCD", [40, 16, 12, 100]):
        ins.column_dimensions[col].width = ancho
    for fila in ins.iter_rows(min_row=6):
        for c in fila:
            c.alignment = Alignment(wrap_text=True, vertical="top")

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    wb.save(SALIDA)
    print(f"Plantilla generada: {SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
