"""Zet de preview in elkaar: src/app.html + data + logo -> dist/preview.html (artifact) en dist/index.html (zelfstandig)."""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
data, logo = pathlib.Path(sys.argv[1]).read_text(), pathlib.Path(sys.argv[2]).read_text().strip()
gen = data.split('"gen":')[1].split(",")[0]
page = (root / "src/app.html").read_text().replace("__LOGO__", logo).replace("__GEN__", gen).replace("__NAVDATA__", data)
out = root / "dist"; out.mkdir(exist_ok=True)
(out / "preview.html").write_text(page)
(out / "index.html").write_text('<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
  '<meta name="theme-color" content="#000000"><style>:root{padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}body{margin:0}[hidden]{display:none!important}</style></head><body>'
  + page + '</body></html>')
print("preview.html", len(page))
