#!/usr/bin/env python3
"""
Genera CAUSAS_PENALES_PPL.html: la aplicación completa (diseño, código y datos)
en UN SOLO archivo, para compartirla por correo o WhatsApp. Quien lo reciba
solo tiene que abrirlo con doble clic; no necesita la carpeta ni Internet.

Uso:  python3 herramientas/empaquetar_un_archivo.py
"""
import base64
import hashlib
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "CAUSAS_PENALES_PPL.html"


def sha256(texto):
    return "'sha256-" + base64.b64encode(hashlib.sha256(texto.encode("utf-8")).digest()).decode() + "'"


def main():
    html = (RAIZ / "index.html").read_text(encoding="utf-8")
    hashes_script, hashes_estilo = [], []

    def estilo(m):
        css = "\n" + (RAIZ / m.group(1)).read_text(encoding="utf-8")
        hashes_estilo.append(sha256(css))
        return f"<style>{css}</style>"

    def script(m):
        # Evita que un "</script>" dentro de los datos cierre la etiqueta.
        js = "\n" + (RAIZ / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
        hashes_script.append(sha256(js))
        return f"<script>{js}</script>"

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', estilo, html)
    html = re.sub(r'<script src="([^"]+)"></script>', script, html)

    # La política de seguridad solo permite ESTOS bloques exactos y sigue
    # bloqueando cualquier conexión externa.
    csp = (f"default-src 'none'; script-src {' '.join(hashes_script)}; "
           f"style-src {' '.join(hashes_estilo)}; img-src data:; connect-src 'none'; "
           "object-src 'none'; base-uri 'none'; form-action 'none'")
    html = re.sub(r'content="default-src[^"]*"', f'content="{csp}"', html, count=1)

    SALIDA.write_text(html, encoding="utf-8")
    print(f"Generado {SALIDA.name} ({SALIDA.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
