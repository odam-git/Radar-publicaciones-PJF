@echo off
REM CAUSAS PENALES PPL - servidor local (opcional).
REM Solo es accesible desde esta computadora (127.0.0.1); no se publica en la red.
REM Requiere Python instalado. Para detenerlo, cierre esta ventana.
cd /d "%~dp0"
start "" http://127.0.0.1:8000/
python -m http.server 8000 --bind 127.0.0.1
