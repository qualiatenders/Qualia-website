"""Nabewerking: bloom rond felle lichtbronnen, lichte vignettering en filmkorrel."""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst_full, dst_small = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.float32) / 255.0
h, w, _ = a.shape
# bloom: alleen de felste delen (vonken, boog, spiegelingen) laten nagloeien
lum = a.mean(axis=2, keepdims=True)
bright = np.clip((lum - 0.82) / 0.18, 0, 1) * a
bl = Image.fromarray((bright * 255).astype(np.uint8))
glow = np.zeros_like(a)
for r, wgt in ((6, 0.5), (18, 0.35), (48, 0.25)):
    glow += np.asarray(bl.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255.0 * wgt
a = 1 - (1 - a) * (1 - np.clip(glow, 0, 1))  # screen-blend
# vignettering
yy, xx = np.mgrid[0:h, 0:w]
d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
a *= (1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.5)[..., None]
# filmkorrel, sterker in de schaduwen
rng = np.random.default_rng(7)
g = rng.normal(0, 1, (h, w, 1)).astype(np.float32)
a += g * (0.005 + 0.006 * (1 - a.mean(axis=2, keepdims=True)))
out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
out.save(dst_full, quality=78, method=6)
out.resize((800, int(800 * h / w)), Image.LANCZOS).save(dst_small, quality=80, method=6)
print('ok', dst_full)
