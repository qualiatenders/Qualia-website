"""Re-scatter the topping pieces on the pizza from catalog.js (count, minD, rMax, s)
without re-rendering or re-importing any images.

    python3 annodomini/tools/relayout.py
"""
import json
import math
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'app' / 'assets' / 'pizza' / 'manifest.json'
src = (ROOT / 'app' / 'catalog.js').read_text()
manifest = json.loads(MANIFEST.read_text())

for tid, art in re.findall(r"\{ id: '([\w-]+)', cat: '[^']+'[^\n]*\n\s*art: (\{[^\n]*)", src):
    if 'painter' not in art or tid not in manifest['toppings']:
        continue
    num = lambda k: float(re.search(rf"\b{k}: ([\d.]+)", art).group(1))
    count, size = int(num('count')), num('s')
    fixed = re.search(r"fixed: \[\[([-\d., ]+)\]\]", art)
    t = manifest['toppings'][tid]
    if fixed:
        pts = [[float(v) for v in fixed.group(1).split(',')]]
    else:
        min_d, r_max, rng, pts = num('minD'), num('rMax'), random.Random(tid), []
        # dart throwing; relax the spacing a little whenever it gets crowded
        while len(pts) < count:
            for _ in range(4000):
                a, d = rng.uniform(0, 2 * math.pi), math.sqrt(rng.random()) * r_max
                p = [math.cos(a) * d, math.sin(a) * d]
                if all(math.dist(p, q) > min_d for q in pts):
                    pts.append(p)
                    break
            else:
                min_d *= .92
    n = len(t['variants'])
    t['pieces'] = [{'x': round(x, 4), 'y': round(y, 4), 'v': i % n} for i, (x, y) in enumerate(pts)]
    # display size follows the catalog size (same rule as the photo importer)
    w = round(size * manifest['pr'] * 2 * 1.35)
    for v in t['variants']:
        v['w'] = w
    print(f'{tid:12} {len(pts):3} pieces')

MANIFEST.write_text(json.dumps(manifest))
