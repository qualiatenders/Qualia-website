# Start: python3 start_server.py  →  open http://localhost:8000
# Lokale webserver zonder backend; nodig omdat browsers de GLB niet via file:// laden.
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.glb': 'model/gltf-binary'}


if not (ROOT / 'model' / '32CCX_Production.glb').exists():
    print('Let op: model/32CCX_Production.glb ontbreekt — de viewer toont dan een foutmelding.')
host = os.environ.get('HOST', '127.0.0.1')
print(f'Sunsation 32CCX Studio: http://localhost:{PORT}  (Ctrl+C om te stoppen)')
ThreadingHTTPServer((host, PORT), partial(Handler, directory=str(ROOT))).serve_forever()
