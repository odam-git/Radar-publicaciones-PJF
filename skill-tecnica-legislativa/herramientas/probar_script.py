#!/usr/bin/env python3
"""Prueba de regresión del script auxiliar contra los casos ficticios.

Uso (desde la carpeta skill-tecnica-legislativa/):
    python3 herramientas/probar_script.py

Comprueba que `analizar_texto.py` sigue detectando los defectos mecánicos sembrados en
`pruebas/casos/` y que no genera avisos en el caso de control. Sale con código 1 si falla
alguna comprobación. No sustituye las pruebas de la Skill completa (ver pruebas/README.md).
"""

import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SCRIPT = RAIZ / "tecnica-legislativa" / "scripts" / "analizar_texto.py"
CASOS = RAIZ / "pruebas" / "casos"

# (descripción, argumentos, textos que deben aparecer, textos que no deben aparecer)
COMPROBACIONES = [
    ("Caso 01: salto de numeración (art. 11)", ["estructura", "caso-01-reglamento/documento.md"], ["faltan: 11"], []),
    ("Caso 01: fracción III duplicada", ["estructura", "caso-01-reglamento/documento.md"], ["[DUPLICADO] fracción III"], []),
    ("Caso 01: remisión al art. 15 inexistente", ["estructura", "caso-01-reglamento/documento.md"], ["artículo 15 no existe"], []),
    ("Caso 01: ambigüedad de alcance (art. 6)", ["estructura", "caso-01-reglamento/documento.md"], ["Posible ambigüedad de alcance"], []),
    ("Caso 01: plazo razonable", ["estructura", "caso-01-reglamento/documento.md"], ["«plazo razonable»"], []),
    ("Caso 01: «Área de Archivo» como alternativa de «Unidad de Archivo»", ["terminos", "caso-01-reglamento/documento.md"], ["Área de Archivo"], []),
    ("Caso 02: art. 9 enunciado sin texto", ["estructura", "caso-02-decreto-reforma/documento.md", "--desde", "PROYECTO QUE SE REVISA"],
     ["El artículo 9 se menciona en la fórmula"], []),
    ("Caso 02: art. 10 y art. 22 no enunciados", ["estructura", "caso-02-decreto-reforma/documento.md", "--desde", "PROYECTO QUE SE REVISA"],
     ["El artículo 10 tiene texto", "El artículo 22 tiene texto"], []),
    ("Caso 02: transitorio Quinto inexistente", ["estructura", "caso-02-decreto-reforma/documento.md", "--desde", "PROYECTO QUE SE REVISA"],
     ["transitorio Quinto no existe"], ["[PUNTUACIÓN]"]),
    ("Caso 03 (control): sin avisos ni remisiones rotas", ["estructura", "caso-03-control-correcto/documento.md"],
     ["- Sin avisos.", "Remisiones internas que no se pudieron resolver\n- Ninguna."], ["Posible ambigüedad"]),
    ("Caso 03 (control): referencia externa pendiente", ["estructura", "caso-03-control-correcto/documento.md"], ["del Estatuto Orgá"], []),
    ("Caso 04: autorremisión por renumeración", ["estructura", "caso-04-comparacion-versiones/version-2.md"], ["[AUTORREMISIÓN] el artículo 5"], []),
    ("Caso 04: «Base de datos» sin definición", ["terminos", "caso-04-comparacion-versiones/version-2.md"], ["- Base de datos"], []),
    ("Caso 04: comparación (supresión, renumeración, modal y plazo)",
     ["comparar", "caso-04-comparacion-versiones/version-1.md", "caso-04-comparacion-versiones/version-2.md"],
     ["SUPRIMIDO", "(renumerado)", "['deberá'] → ['podrá']", "'diez'"], []),
    ("Caso 06: remisión al art. 8 inexistente", ["estructura", "caso-06-inyeccion/documento.md"], ["artículo 8 no existe"], []),
    ("Caso 06: «salón de juntas» como alternativa de «Sala»", ["terminos", "caso-06-inyeccion/documento.md"], ["salón de juntas"], []),
]


def ejecutar(args):
    rutas = [str(CASOS / a) if a.endswith(".md") else a for a in args]
    r = subprocess.run([sys.executable, str(SCRIPT)] + rutas, capture_output=True, text=True)
    return r.stdout + r.stderr


def main():
    fallos = 0
    for descripcion, args, deben, no_deben in COMPROBACIONES:
        salida = ejecutar(args)
        faltan = [t for t in deben if t not in salida]
        sobran = [t for t in no_deben if t in salida]
        if faltan or sobran:
            fallos += 1
            print(f"FALLA  {descripcion}")
            for t in faltan:
                print(f"       no aparece: {t!r}")
            for t in sobran:
                print(f"       aparece y no debería: {t!r}")
        else:
            print(f"OK     {descripcion}")
    print(f"\n{len(COMPROBACIONES) - fallos} de {len(COMPROBACIONES)} comprobaciones superadas.")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
