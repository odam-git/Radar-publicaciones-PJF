#!/usr/bin/env python3
"""
Convierte la hoja de datos (CSV o Excel) en el archivo datos/datos_ppl.js que
la aplicación lee cuando se abre con doble clic (sin servidor).

Todo ocurre en la propia computadora: no se envía nada a Internet.

Uso:
  python3 herramientas/csv_a_js.py                       (usa datos/datos_ppl_ficticios.csv)
  python3 herramientas/csv_a_js.py ruta/mi_archivo.csv
  python3 herramientas/csv_a_js.py ruta/mi_archivo.xlsx  (requiere: pip install openpyxl)

El resultado se escribe en datos/datos_ppl_ficticios.js (el que carga index.html).
"""
import csv
import json
import sys
from datetime import date, datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA_POR_DEFECTO = RAIZ / "datos" / "datos_ppl_ficticios.csv"
SALIDA = RAIZ / "datos" / "datos_ppl_ficticios.js"


def leer_csv(ruta):
    with open(ruta, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def leer_xlsx(ruta):
    from openpyxl import load_workbook
    ws = load_workbook(ruta, read_only=True, data_only=True).worksheets[0]
    filas = list(ws.iter_rows(values_only=True))
    encabezados = [str(c).strip() if c is not None else "" for c in filas[0]]
    registros = []
    for fila in filas[1:]:
        if all(v is None for v in fila):
            continue
        reg = {}
        for k, v in zip(encabezados, fila):
            if isinstance(v, (datetime, date)):
                v = v.strftime("%Y-%m-%d")
            reg[k] = "" if v is None else v
        registros.append(reg)
    return registros


def main():
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else ENTRADA_POR_DEFECTO
    registros = leer_xlsx(ruta) if ruta.suffix.lower() in (".xlsx", ".xlsm") else leer_csv(ruta)
    cuerpo = json.dumps(registros, ensure_ascii=False, indent=1, default=str)
    SALIDA.write_text(
        "// ARCHIVO GENERADO AUTOMÁTICAMENTE. No editar a mano.\n"
        f"// Fuente: {ruta.name}\n"
        "// Para regenerarlo: python3 herramientas/csv_a_js.py <archivo>\n"
        f"window.FUENTE_PPL_EMBEBIDA = {cuerpo};\n",
        encoding="utf-8",
    )
    print(f"{len(registros)} registros convertidos de {ruta.name} a {SALIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
