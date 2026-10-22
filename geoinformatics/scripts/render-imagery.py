"""
Renders the illustrative geospatial imagery used by the preview content:
shaded relief, satellite-style land cover, LiDAR point clouds, bathymetry,
InSAR fringes, night lights, NDVI, topographic maps, a city model and Earth
from orbit. Procedural (numpy + Pillow only), so every image is original.

Usage: python3 scripts/render-imagery.py public/preview
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 1000
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/preview"
os.makedirs(OUT, exist_ok=True)


def noise(shape, seed, octaves=7, base=4, persistence=0.52):
    """Fractal value noise, 0..1."""
    rng = np.random.default_rng(seed)
    h, w = shape
    out = np.zeros(shape)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = base * 2**o
        grid = rng.random((n + 2, int(n * w / h) + 2))
        img = Image.fromarray((grid * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(img, dtype=float) / 255 * amp
        total += amp
        amp *= persistence
    out /= total
    return (out - out.min()) / (out.max() - out.min())


def ridged(shape, seed, **kw):
    n = noise(shape, seed, **kw)
    return 1 - np.abs(n * 2 - 1)


def hillshade(z, azimuth=315, altitude=40, scale=1.0):
    gy, gx = np.gradient(z * scale)
    slope = np.pi / 2 - np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az = np.radians(360 - azimuth + 90)
    alt = np.radians(altitude)
    hs = np.sin(alt) * np.sin(slope) + np.cos(alt) * np.cos(slope) * np.cos(az - aspect)
    return np.clip(hs, 0, 1)


def ramp(values, stops):
    """Map 0..1 values through colour stops [(pos, (r,g,b)), ...]."""
    pos = np.array([s[0] for s in stops])
    cols = np.array([s[1] for s in stops], dtype=float)
    out = np.zeros(values.shape + (3,))
    for c in range(3):
        out[..., c] = np.interp(values, pos, cols[:, c])
    return out


def save(arr, name, grain=0.0, vignette=0.25):
    a = np.clip(arr, 0, 255)
    if vignette:
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
        a = a * (1 - vignette * np.clip(d - 0.55, 0, 1))[..., None]
    if grain:
        a = a + np.random.default_rng(1).normal(0, grain, a.shape)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img.save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True, progressive=True)
    print("rendered", name)


def terrain(seed, mountains=0.6):
    base = noise((H, W), seed, octaves=8, base=3)
    r = ridged((H, W), seed + 1, octaves=8, base=3)
    return np.clip(base * (1 - mountains) + (r**2) * mountains, 0, 1)


# ── 1. Alpine shaded relief (hypsometric) ─────────────────────────────────
def relief(name, seed, snow=True):
    z = terrain(seed, 0.7)
    hs = hillshade(z, scale=260)
    col = ramp(z, [(0, (44, 82, 52)), (0.3, (88, 120, 70)), (0.5, (150, 140, 100)), (0.68, (130, 110, 90)), (0.8, (190, 185, 180)), (1, (250, 250, 252) if snow else (170, 150, 120))])
    img = col * (0.35 + 0.85 * hs[..., None])
    save(img, name, grain=3)


# ── 2. Satellite land cover with fields and a river ───────────────────────
def satellite(name, seed):
    rng = np.random.default_rng(seed)
    z = terrain(seed, 0.25)
    hs = hillshade(z, scale=90)
    # field parcels: a rotated grid with random crop colours
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    ang = rng.uniform(-0.5, 0.5)
    u = (xx * math.cos(ang) - yy * math.sin(ang)) + noise((H, W), seed + 5, octaves=3) * 60
    v = (xx * math.sin(ang) + yy * math.cos(ang)) + noise((H, W), seed + 6, octaves=3) * 60
    fu = np.floor(u / rng.uniform(70, 120))
    fv = np.floor(v / rng.uniform(45, 90))
    cell = (fu.astype(np.int64) * 73856093 ^ fv.astype(np.int64) * 19349663) % 997 / 997.0
    crops = np.array([(96, 122, 62), (126, 140, 70), (168, 152, 96), (78, 104, 56), (150, 128, 84), (110, 132, 80), (190, 176, 120)])
    col = crops[(cell * len(crops)).astype(int) % len(crops)].astype(float)
    texture = noise((H, W), seed + 7, octaves=6, base=40)[..., None]
    col = col * (0.85 + 0.3 * texture)
    edge = ((np.abs(u % 100) < 2) | (np.abs(v % 70) < 1.6))
    forest = noise((H, W), seed + 8, octaves=6, base=4) > 0.62
    col[forest] = np.array([42, 64, 40]) * (0.8 + 0.4 * texture[forest])
    col[edge & ~forest] *= 0.82
    # river
    t = np.linspace(0, 1, 400)
    rx = W * (0.15 + 0.7 * t) + np.sin(t * 9 + seed) * 90
    ry = H * (0.1 + 0.85 * t) + np.cos(t * 7 + seed) * 70
    img = Image.fromarray(np.clip(col * (0.7 + 0.45 * hs[..., None]), 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    d.line(list(zip(rx, ry)), fill=(38, 60, 72), width=16, joint="curve")
    d.line(list(zip(rx, ry)), fill=(52, 82, 96), width=9, joint="curve")
    # roads
    for k in range(3):
        y0 = rng.uniform(0, H)
        d.line([(0, y0), (W, y0 + rng.uniform(-300, 300))], fill=(206, 200, 186), width=3)
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    save(np.asarray(img, dtype=float), name, grain=4)


# ── 3. LiDAR point cloud in perspective ───────────────────────────────────
def pointcloud(name, seed, palette="turbo"):
    rng = np.random.default_rng(seed)
    z = terrain(seed, 0.45)[::2, ::2]
    gh, gw = z.shape
    n = 900_000
    xs = rng.uniform(0, gw - 1, n)
    ys = rng.uniform(0, gh - 1, n)
    zs = z[ys.astype(int), xs.astype(int)] * 120
    # buildings and trees as raised returns
    for _ in range(40):
        bx, by, bw, bh = rng.uniform(100, gw - 150), rng.uniform(120, gh - 150), rng.uniform(15, 45), rng.uniform(15, 45)
        m = (xs > bx) & (xs < bx + bw) & (ys > by) & (ys < by + bh)
        zs[m] += rng.uniform(18, 60)
    trees = noise((gh, gw), seed + 3, octaves=5, base=12) > 0.64
    tm = trees[ys.astype(int), xs.astype(int)]
    zs[tm] += rng.uniform(5, 30, tm.sum())
    # camera just above the near edge, looking across the terrain
    cam_y, cam_h, f, horizon = -30.0, 150.0, 700.0, H * 0.3
    depth = ys - cam_y
    sx = W / 2 + (xs - gw / 2) * f / depth
    sy = horizon + (cam_h - zs) * f / depth
    ok = (sx >= 0) & (sx < W) & (sy >= 0) & (sy < H) & (depth > 1)
    sx, sy, zs, depth = sx[ok].astype(int), sy[ok].astype(int), zs[ok], depth[ok]
    order = np.argsort(-depth)
    img = np.zeros((H, W, 3))
    img[:] = (6, 8, 12)
    hnorm = np.clip((zs - zs.min()) / (np.percentile(zs, 99.5) - zs.min()), 0, 1)
    if palette == "turbo":
        cols = ramp(hnorm, [(0, (30, 60, 160)), (0.25, (30, 170, 210)), (0.45, (60, 220, 120)), (0.65, (240, 220, 50)), (0.85, (245, 120, 30)), (1, (215, 25, 32))])
    else:
        cols = ramp(hnorm, [(0, (60, 60, 70)), (0.6, (200, 200, 205)), (1, (255, 255, 255))])
    shade = np.clip(1.25 - depth / depth.max(), 0.35, 1)[..., None]
    cols = cols * shade
    sx_o, sy_o, c_o = sx[order], sy[order], cols[order]
    img[sy_o, sx_o] = c_o
    # thicken near points slightly
    near = depth[order] < np.percentile(depth, 35)
    img[np.clip(sy_o[near] + 1, 0, H - 1), sx_o[near]] = c_o[near]
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.35))
    save(np.asarray(out, dtype=float), name, vignette=0.35)


# ── 4. Bathymetry ─────────────────────────────────────────────────────────
def bathymetry(name, seed):
    z = terrain(seed, 0.5)
    yy, xx = np.mgrid[0:H, 0:W]
    canyon = np.exp(-(((xx - W * 0.55 - np.sin(yy / 140) * 120) / 140) ** 2))
    z = np.clip(z - canyon * 0.45, 0, 1)
    hs = hillshade(z, azimuth=300, altitude=35, scale=240)
    col = ramp(z, [(0, (8, 22, 66)), (0.3, (14, 60, 130)), (0.55, (30, 120, 170)), (0.75, (70, 175, 190)), (1, (170, 225, 210))])
    img = col * (0.3 + 0.9 * hs[..., None])
    # multibeam swath limits: data only inside survey strips
    strip = (np.abs(((xx * 0.94 + yy * 0.34) % 380) - 190) < 175)
    img[~strip] = img[~strip] * 0.25 + np.array([10, 14, 22]) * 0.75
    save(img, name, grain=2)


# ── 5. InSAR interferogram ────────────────────────────────────────────────
def insar(name, seed):
    z = terrain(seed, 0.55)
    hs = hillshade(z, scale=200)
    yy, xx = np.mgrid[0:H, 0:W]
    defo = np.exp(-(((xx - W * 0.58) / 260) ** 2 + ((yy - H * 0.5) / 190) ** 2)) * 9 + noise((H, W), seed + 2, octaves=4) * 1.5
    phase = (defo % 1.0)
    fr = ramp(phase, [(0, (215, 25, 32)), (0.17, (240, 200, 40)), (0.34, (80, 200, 80)), (0.5, (40, 190, 220)), (0.67, (50, 80, 200)), (0.84, (180, 60, 190)), (1, (215, 25, 32))])
    gray = (0.25 + 0.75 * hs)[..., None] * 255
    mask = noise((H, W), seed + 9, octaves=5) > 0.33
    img = np.where(mask[..., None], gray * 0.45 + fr * 0.55 * (0.5 + 0.5 * hs[..., None]), gray * 0.6)
    save(img, name, grain=4)


# ── 6. Night lights ───────────────────────────────────────────────────────
def nightlights(name, seed):
    rng = np.random.default_rng(seed)
    land = noise((H, W), seed, octaves=6, base=2) > 0.4
    img = np.zeros((H, W, 3))
    img[:] = (3, 5, 12)
    img[land] = (9, 12, 20)
    light = np.zeros((H, W))
    ys, xs = np.nonzero(land)
    for _ in range(60):
        k = rng.integers(0, len(xs))
        cx, cy, s = xs[k], ys[k], rng.uniform(0.3, 1.0) ** 2
        n = int(6000 * s) + 200
        px = np.clip((cx + rng.normal(0, 45 * s + 6, n)).astype(int), 0, W - 1)
        py = np.clip((cy + rng.normal(0, 35 * s + 5, n)).astype(int), 0, H - 1)
        np.add.at(light, (py, px), 1.0)
        # roads to a neighbour
        k2 = rng.integers(0, len(xs))
        t = rng.random(1500)
        rx = np.clip((cx + (xs[k2] - cx) * t + rng.normal(0, 1.5, t.size)).astype(int), 0, W - 1)
        ry = np.clip((cy + (ys[k2] - cy) * t + rng.normal(0, 1.5, t.size)).astype(int), 0, H - 1)
        ok = land[ry, rx]
        np.add.at(light, (ry[ok], rx[ok]), 0.6)
    light *= land
    glow = np.asarray(Image.fromarray(np.clip(light * 60, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)), dtype=float) / 255
    core = np.clip(light / 3, 0, 1)
    v = np.clip(core + glow * 1.8, 0, 1.4)
    img += ramp(np.clip(v, 0, 1), [(0, (0, 0, 0)), (0.3, (120, 70, 20)), (0.7, (240, 170, 70)), (1, (255, 240, 200))])
    save(img, name, vignette=0.45)


# ── 7. NDVI false colour ──────────────────────────────────────────────────
def ndvi(name, seed):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    u = xx + noise((H, W), seed, octaves=3) * 50
    v = yy + noise((H, W), seed + 1, octaves=3) * 50
    cell = (np.floor(u / 110).astype(np.int64) * 92821 ^ np.floor(v / 80).astype(np.int64) * 68917) % 101 / 101
    val = np.clip(cell * 0.8 + noise((H, W), seed + 3, octaves=7, base=30) * 0.35 - 0.05, 0, 1)
    img = ramp(val, [(0, (165, 0, 38)), (0.25, (244, 109, 67)), (0.45, (254, 224, 139)), (0.65, (166, 217, 106)), (0.85, (26, 152, 80)), (1, (0, 104, 55))])
    edge = (np.abs(u % 110) < 1.5) | (np.abs(v % 80) < 1.5)
    img[edge] *= 0.6
    save(img, name, grain=3)


# ── 8. Topographic map (paper) ────────────────────────────────────────────
def topomap(name, seed):
    z = noise((H, W), seed, octaves=4, base=3)
    hs = hillshade(z, scale=180)
    paper = np.ones((H, W, 3)) * np.array([244, 241, 232])
    tint = ramp(z, [(0, (214, 230, 200)), (0.5, (236, 228, 200)), (1, (240, 220, 196))])
    img = paper * 0.4 + tint * 0.6
    img *= (0.82 + 0.22 * hs[..., None])
    levels = z * 40
    frac = np.abs(levels - np.round(levels))
    minor = frac < 0.06
    major = (frac < 0.09) & (np.round(levels) % 5 == 0)
    img[minor] = img[minor] * 0.55 + np.array([176, 110, 60]) * 0.45
    img[major] = np.array([150, 80, 40])
    water = z < 0.18
    img[water] = np.array([150, 196, 222])
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(out)
    for gx in range(0, W, 200):
        d.line([(gx, 0), (gx, H)], fill=(120, 140, 170), width=1)
    for gy in range(0, H, 200):
        d.line([(0, gy), (W, gy)], fill=(120, 140, 170), width=1)
    save(np.asarray(out, dtype=float), name, vignette=0.1)


# ── 9. City model (digital twin) ──────────────────────────────────────────
def city(name, seed, dusk=True):
    rng = np.random.default_rng(seed)
    sky = ramp(np.linspace(0, 1, H)[:, None].repeat(W, 1), [(0, (14, 18, 30)), (0.6, (40, 46, 66) if dusk else (170, 190, 210)), (1, (70, 60, 70) if dusk else (220, 225, 230))])
    img = Image.fromarray(sky.astype(np.uint8))
    d = ImageDraw.Draw(img)

    def iso(x, y, z):
        return (W / 2 + (x - y) * 0.86, H * 0.22 + (x + y) * 0.5 - z)

    blocks = []
    for gx in range(-2, 15):
        for gy in range(-2, 15):
            if rng.random() < 0.15:
                continue
            x, y = gx * 74, gy * 74
            w = rng.uniform(44, 62)
            h = 20 + rng.random() ** 2.4 * 420
            blocks.append((x + y, x, y, w, h))
    blocks.sort()
    hi = rng.integers(0, len(blocks))
    for k, (_, x, y, w, h) in enumerate(blocks):
        top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + w, h), iso(x, y + w, h)]
        right = [iso(x + w, y, h), iso(x + w, y, 0), iso(x + w, y + w, 0), iso(x + w, y + w, h)]
        left = [iso(x, y + w, h), iso(x + w, y + w, h), iso(x + w, y + w, 0), iso(x, y + w, 0)]
        is_hi = k == hi
        base = np.array([215, 25, 32]) if is_hi else np.array([150, 160, 178])
        d.polygon(left, fill=tuple((base * 0.42).astype(int)))
        d.polygon(right, fill=tuple((base * 0.62).astype(int)))
        d.polygon(top, fill=tuple((base * 0.95).astype(int)))
        # windows
        if h > 80 and not is_hi:
            for wy in np.arange(12, h - 8, 14):
                for wx in np.linspace(0.15, 0.85, 4):
                    if rng.random() < (0.45 if dusk else 0.0):
                        p = iso(x + w * wx, y + w, wy)
                        d.rectangle([p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 1], fill=(255, 214, 140))
        d.line(top + [top[0]], fill=(220, 225, 235) if not is_hi else (255, 120, 120), width=1)
    save(np.asarray(img.filter(ImageFilter.GaussianBlur(0.4)), dtype=float), name, vignette=0.3)


# ── 10. Earth from orbit ──────────────────────────────────────────────────
def earth(name, seed):
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    cx, cy, R = W * 0.62, H * 1.35, H * 1.18
    dx, dy = (xx - cx) / R, (yy - cy) / R
    r2 = dx**2 + dy**2
    inside = r2 < 1
    dz = np.sqrt(np.clip(1 - r2, 0, 1))
    lon = np.arctan2(dx, dz)
    lat = np.arcsin(np.clip(dy, -1, 1))
    tex = noise((H, W), seed, octaves=7, base=3)
    u = ((lon / np.pi + 1) / 2 * (W - 1)).astype(int)
    v = ((lat / np.pi + 0.5) * (H - 1)).astype(int)
    land = tex[v, u]
    col = np.where((land > 0.52)[..., None], ramp(land, [(0.52, (70, 96, 52)), (0.7, (140, 126, 84)), (1, (200, 190, 170))]), ramp(land, [(0, (6, 22, 60)), (0.52, (16, 52, 104))]))
    clouds = noise((H, W), seed + 4, octaves=6, base=6)[v, u]
    col = col * (1 - np.clip((clouds - 0.55) * 2.2, 0, 0.85))[..., None] + np.clip((clouds - 0.55) * 2.2, 0, 0.85)[..., None] * 240
    light = np.clip(dx * -0.55 + dz * 0.7 + dy * -0.25, 0, 1)[..., None]
    img = np.zeros((H, W, 3))
    img[:] = (3, 4, 9)
    stars = np.random.default_rng(seed).random((H, W)) > 0.9985
    img[stars] = 200
    img[inside] = (col * (0.08 + 0.95 * light))[inside]
    rim = np.exp(-((np.sqrt(r2) - 1) * 40) ** 2)
    img += rim[..., None] * np.array([90, 150, 255]) * 0.9
    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(out)
    for k, (a, b, rot) in enumerate([(1.35, 0.5, -0.18), (1.5, 0.62, -0.08)]):
        pts = [(cx + R * a * math.cos(t) * math.cos(rot) - R * b * math.sin(t) * math.sin(rot), cy - R * 0.62 + R * a * math.cos(t) * math.sin(rot) + R * b * math.sin(t) * math.cos(rot)) for t in np.linspace(math.pi * 0.95, math.pi * 1.95, 300)]
        d.line(pts, fill=(215, 25, 32) if k == 0 else (120, 130, 150), width=2 if k == 0 else 1)
    sx, sy = W * 0.3, H * 0.28
    d.rectangle([sx - 7, sy - 7, sx + 7, sy + 7], fill=(235, 235, 240))
    d.rectangle([sx - 40, sy - 3, sx + 40, sy + 3], fill=(120, 140, 190))
    save(np.asarray(out, dtype=float), name, vignette=0.2)


# ── 11. Glacier ───────────────────────────────────────────────────────────
def glacier(name, seed):
    z = terrain(seed, 0.8)
    hs = hillshade(z, azimuth=290, scale=300)
    ice = (z > 0.55) | (noise((H, W), seed + 2, octaves=5) * z > 0.42)
    rock = ramp(z, [(0, (60, 58, 56)), (1, (140, 132, 126))])
    snow = ramp(z, [(0, (190, 210, 228)), (1, (250, 252, 255))])
    col = np.where(ice[..., None], snow, rock)
    img = col * (0.35 + 0.8 * hs[..., None])
    save(img, name, grain=3)


RENDERERS = {
    "relief": relief, "satellite": satellite, "pointcloud": pointcloud, "bathymetry": bathymetry, "insar": insar,
    "nightlights": nightlights, "ndvi": ndvi, "topomap": topomap, "city": city, "earth": earth, "glacier": glacier,
}

if __name__ == "__main__":
    plan = [
        ("relief-1", "relief", 11), ("relief-2", "relief", 23), ("satellite-1", "satellite", 31), ("satellite-2", "satellite", 47), ("satellite-3", "satellite", 59),
        ("pointcloud-1", "pointcloud", 61), ("pointcloud-2", "pointcloud", 73), ("pointcloud-3", "pointcloud", 89), ("bathymetry-1", "bathymetry", 97), ("bathymetry-2", "bathymetry", 101),
        ("insar-1", "insar", 113), ("nightlights-1", "nightlights", 127), ("ndvi-1", "ndvi", 131), ("topomap-1", "topomap", 137), ("topomap-2", "topomap", 149),
        ("city-1", "city", 151), ("city-2", "city", 163), ("city-3", "city", 181),
        ("relief-3", "relief", 191), ("satellite-4", "satellite", 193), ("satellite-5", "satellite", 197), ("pointcloud-4", "pointcloud", 199), ("pointcloud-5", "pointcloud", 211),
        ("bathymetry-3", "bathymetry", 223), ("topomap-3", "topomap", 227), ("insar-2", "insar", 229), ("nightlights-2", "nightlights", 233), ("ndvi-2", "ndvi", 239), ("glacier-2", "glacier", 241), ("earth-3", "earth", 251), ("earth-1", "earth", 167), ("earth-2", "earth", 173), ("glacier-1", "glacier", 179),
    ]
    only = sys.argv[2:] if len(sys.argv) > 2 else None
    for name, kind, seed in plan:
        if only and name not in only:
            continue
        RENDERERS[kind](name, seed)
