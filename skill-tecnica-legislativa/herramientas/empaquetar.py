#!/usr/bin/env python3
"""Valida la Skill y genera el ZIP instalable en Claude.ai.

Uso (desde la carpeta skill-tecnica-legislativa/):
    python3 herramientas/empaquetar.py

Genera dist/tecnica-legislativa-v<VERSION>.zip con la carpeta de la Skill en la
raíz del ZIP (estructura exigida por el Centro de ayuda de Claude: la carpeta
debe llamarse igual que el campo `name`). Después abre el ZIP y comprueba su
estructura. La versión se toma del archivo VERSION.
"""

import re
import sys
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "tecnica-legislativa"
DIST = RAIZ / "dist"
EXCLUIR = {"__pycache__", ".DS_Store"}
# Límites de la documentación oficial (platform.claude.com, "Agent Skills" y
# "Skill authoring best practices"), consultada el 22/10/2026.
MAX_NAME, MAX_DESC, MAX_LINEAS_CUERPO = 64, 1024, 500


def error(msg):
    print(f"ERROR: {msg}")
    sys.exit(1)


def validar():
    skill_md = CARPETA / "SKILL.md"
    if not skill_md.exists():
        error("No existe tecnica-legislativa/SKILL.md")
    texto = skill_md.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", texto, re.S)
    if not m:
        error("SKILL.md no inicia con un bloque YAML delimitado por '---'")
    cabecera, cuerpo = m.groups()
    campos = {}
    for linea in cabecera.splitlines():
        if not linea.strip():
            continue
        clave, _, valor = linea.partition(":")
        campos[clave.strip()] = valor.strip()
    extra = set(campos) - {"name", "description"}
    if extra:
        error(f"Campos no previstos en el frontmatter: {extra} (se mantiene sólo name y description por compatibilidad)")
    nombre, desc = campos.get("name", ""), campos.get("description", "")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", nombre) or len(nombre) > MAX_NAME:
        error(f"'name' inválido: {nombre!r}")
    if any(p in nombre for p in ("anthropic", "claude")):
        error("'name' contiene una palabra reservada")
    if nombre != CARPETA.name:
        error(f"La carpeta ({CARPETA.name}) debe llamarse igual que 'name' ({nombre})")
    if not desc or len(desc) > MAX_DESC or "<" in desc or ">" in desc:
        error(f"'description' vacía, mayor de {MAX_DESC} caracteres o con etiquetas (<, >): {len(desc)} caracteres")
    lineas = len(cuerpo.splitlines())
    if lineas >= MAX_LINEAS_CUERPO:
        error(f"El cuerpo de SKILL.md tiene {lineas} líneas (recomendado: menos de {MAX_LINEAS_CUERPO})")
    # Todos los archivos enlazados desde SKILL.md deben existir.
    for enlace in re.findall(r"\]\(([^)#]+)\)", cuerpo):
        if not (CARPETA / enlace).exists():
            error(f"SKILL.md enlaza a un archivo inexistente: {enlace}")
    if len(list(CARPETA.rglob("SKILL.md"))) != 1:
        error("Debe existir un solo SKILL.md dentro de la carpeta de la Skill")
    print(f"OK frontmatter: name={nombre} | description={len(desc)} caracteres | cuerpo={lineas} líneas")
    return nombre


def empaquetar(nombre):
    version = (RAIZ / "VERSION").read_text(encoding="utf-8").strip()
    DIST.mkdir(exist_ok=True)
    destino = DIST / f"{nombre}-v{version}.zip"
    archivos = sorted(p for p in CARPETA.rglob("*") if p.is_file() and not (set(p.parts) & EXCLUIR))
    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED) as z:
        for p in archivos:
            z.write(p, p.relative_to(CARPETA.parent).as_posix())
    return destino


def verificar(destino, nombre):
    with zipfile.ZipFile(destino) as z:
        if z.testzip() is not None:
            error("El ZIP está dañado")
        nombres = z.namelist()
        raices = {n.split("/")[0] for n in nombres}
        if raices != {nombre}:
            error(f"La raíz del ZIP debe ser sólo la carpeta '{nombre}/'; se encontró: {raices}")
        if f"{nombre}/SKILL.md" not in nombres:
            error("El ZIP no contiene <carpeta>/SKILL.md")
        if any("\\" in n for n in nombres):
            error("El ZIP contiene rutas con barras invertidas")
        print(f"OK ZIP: {destino.relative_to(RAIZ)} ({destino.stat().st_size} bytes, {len(nombres)} archivos)")
        for n in nombres:
            print(f"   {n}")


if __name__ == "__main__":
    nombre = validar()
    verificar(empaquetar(nombre), nombre)
