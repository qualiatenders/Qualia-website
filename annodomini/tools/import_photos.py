"""Turn real food photos into the app's pizza artwork.

    pip install rembg onnxruntime pillow numpy
    python3 annodomini/tools/import_photos.py            # all photos
    python3 annodomini/tools/import_photos.py salame     # one ingredient

Folder layout (annodomini/photos/):
    base.jpg            whole pizza, top-down, tomato sauce only   -> pizza/base.webp
    hero.jpg            whole finished pizza, top-down             -> pizza/hero.webp (start screen)
    <topping-id>.jpg    several separate pieces on a plain dark
                        background, e.g. salame.jpg, funghi.jpg    -> pizza/<id>-<n>.webp + thumbs/<id>.webp
    extras/<id>.jpg     one dessert or drink, top-down             -> extras/<id>.webp

Topping ids are the ids in app/catalog.js. Every separate piece in a topping
photo becomes one variant; the scatter positions in manifest.json stay as they are.
Run `node annodomini/tools/bundle.js` afterwards to refresh the shareable file.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / 'photos'
ASSETS = ROOT / 'app' / 'assets'
MANIFEST = ASSETS / 'pizza' / 'manifest.json'
SLATE = (40, 38, 35)


def catalog():
    """Topping ids with their size (fraction of the pizza radius) from catalog.js."""
    src = (ROOT / 'app' / 'catalog.js').read_text()
    return {m[0]: float(m[1]) for m in re.findall(r"\{ id: '([\w-]+)', cat: '[^']+'[^\n]*\n\s*art: \{ painter: '\w+'[^}]*?\bs: ([\d.]+)", src)}


def cut(img, session):
    """Remove the background and return an RGBA image with soft, clean edges."""
    out = remove(img.convert('RGB'), session=session, post_process_mask=True)
    a = out.getchannel('A').filter(ImageFilter.GaussianBlur(.6))
    out.putalpha(a)
    return out


def pieces(rgba, min_area=0.002):
    """Split a cut-out sheet into its separate pieces (connected alpha regions)."""
    a = np.array(rgba.getchannel('A')) > 40
    h, w = a.shape
    labels = np.zeros((h, w), np.int32)
    boxes, n = [], 0
    for y0 in range(0, h, 2):
        for x0 in range(0, w, 2):
            if not a[y0, x0] or labels[y0, x0]:
                continue
            n += 1
            stack, xs, ys = [(y0, x0)], [], []
            labels[y0, x0] = n
            while stack:
                y, x = stack.pop()
                xs.append(x); ys.append(y)
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and a[yy, xx] and not labels[yy, xx]:
                        labels[yy, xx] = n
                        stack.append((yy, xx))
            if len(xs) > min_area * w * h:
                boxes.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1, n))
    out = []
    for x0, y0, x1, y1, k in boxes:
        piece = rgba.crop((x0, y0, x1, y1))
        mask = Image.fromarray(((labels[y0:y1, x0:x1] == k) * 255).astype('uint8'))
        piece.putalpha(Image.fromarray(np.minimum(np.array(piece.getchannel('A')), np.array(mask))))
        out.append(piece)
    return out


def square(piece, size, pad=1.25):
    """Centre a piece on a transparent square canvas, longest side = size / pad."""
    w, h = piece.size
    k = size / pad / max(w, h)
    piece = piece.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    c = Image.new('RGBA', (size, size))
    c.alpha_composite(piece, ((size - piece.width) // 2, (size - piece.height) // 2))
    return c


def largest(rgba):
    """The biggest separate object — drops stray frame lines and specks."""
    parts = pieces(rgba)
    return max(parts, key=lambda p: (np.array(p.getchannel('A')) > 40).sum()) if parts else rgba


def disc(rgba, size):
    """Fit a cut-out whole pizza so its diameter matches the renderer (0.92 of the canvas)."""
    return square(largest(rgba), size, pad=1 / .92)


RINGS = {'cipolla', 'jalapeno'}   # the black background shows through the middle of a ring


def key_black(rgba, lo=18, hi=48):
    """Fade out near-black background that the cut-out kept, e.g. inside onion rings."""
    px = np.array(rgba).astype(np.float32)
    lum = px[..., :3].max(axis=2)
    keep = np.clip((lum - lo) / (hi - lo), 0, 1)
    px[..., 3] *= keep
    return Image.fromarray(px.astype('uint8'), 'RGBA')


def save(img, rel):
    path = ASSETS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=90, method=6)
    print('  ->', rel)


def main(only):
    session = new_session('u2net')
    manifest = json.loads(MANIFEST.read_text())
    sizes = catalog()
    size, pr = manifest['size'], manifest['pr']
    found = False

    for name, rel, px in (('base', 'pizza/base.webp', size), ('hero', 'pizza/hero.webp', 1400)):
        src = next(PHOTOS.glob(f'{name}.*'), None)
        if src and (not only or only == name):
            found = True
            print(src.name)
            save(disc(cut(Image.open(src), session), px), rel)

    for src in sorted(p for p in PHOTOS.glob('*.*') if not p.name.startswith('.')):
        tid = src.stem
        if tid not in sizes or (only and only != tid):
            continue
        found = True
        print(src.name)
        sheet = cut(Image.open(src), session)
        if tid in RINGS:
            sheet = key_black(sheet)
        parts = sorted(pieces(sheet), key=lambda p: -p.size[0] * p.size[1])[:8]
        if not parts:
            print('  !! no separate pieces found — use a plain dark background with space between pieces')
            continue
        px = round(sizes[tid] * pr * 2 * 1.35)
        for old in (ASSETS / 'pizza').glob(f'{tid}-*.webp'):
            old.unlink()
        variants = []
        for n, p in enumerate(parts):
            save(square(p, px, pad=1.35), f'pizza/{tid}-{n}.webp')
            variants.append({'src': f'pizza/{tid}-{n}.webp', 'w': px})
        t = manifest['toppings'][tid]
        t['variants'] = variants
        for i, piece in enumerate(t.get('pieces', [])):
            piece['v'] = i % len(variants)
        # menu thumbnail: up to three pieces on dark slate
        th = Image.new('RGBA', (168, 168), SLATE + (255,))
        spots = [[(84, 84)], [(62, 66), (106, 102)], [(58, 62), (110, 64), (84, 110)]][min(len(parts), 3) - 1]
        for (x, y), p in zip(spots, parts):
            s = square(p, 112 if len(spots) == 1 else 76, pad=1.1)
            th.alpha_composite(s, (x - s.width // 2, y - s.height // 2))
        save(th.convert('RGB'), f'thumbs/{tid}.webp')

    # chili flakes and hot honey stay rendered: thin drizzles and tiny flakes don't cut out cleanly

    for src in sorted(p for p in (PHOTOS / 'extras').glob('*.*') if not p.name.startswith('.')) if (PHOTOS / 'extras').exists() else []:
        if only and only != src.stem:
            continue
        found = True
        print('extras/' + src.name)
        bg = Image.new('RGBA', (240, 240), SLATE + (255,))
        bg.alpha_composite(square(largest(cut(Image.open(src), session)), 240, pad=1.08))
        save(bg.convert('RGB'), f'extras/{src.stem}.webp')

    MANIFEST.write_text(json.dumps(manifest))
    if not found:
        print(f'No photos found in {PHOTOS}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else None)
