import sys, math
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]; W = int(sys.argv[-4]); SPP = int(sys.argv[-3])
reset()
floor(mat_dark_surface('Vloer', (0.003, 0.003, 0.0035), rough=0.5, metal=0.2))
tool = mat_metal('Gereedschap', (0.3, 0.31, 0.33), rough=0.3, aniso=0.3)
dark = mat_dark_surface('Machine', (0.01, 0.011, 0.013), rough=0.4, metal=0.5)
L = 0.5
# ondermatrijs (V-die) op balk
die = cube((L, 0.06, 0.05), (0, 0, 0.12), name='Matrijs')
boolean(die, cube((L + 0.1, 0.03, 0.03), (0, 0, 0.145), rot=(math.radians(45), 0, 0)))
assign(die, tool); bevel(die, 0.0008, 2); smooth(die)
base = cube((L + 0.1, 0.11, 0.095), (0, 0, 0.0475), name='Bed'); assign(base, dark); bevel(base, 0.002, 2)
# bovenstempel
punch = cube((L, 0.025, 0.12), (0, 0, 0.27), name='Stempel')
boolean(punch, cube((L + 0.1, 0.03, 0.03), (0, 0.016, 0.205), rot=(math.radians(-30), 0, 0)))
boolean(punch, cube((L + 0.1, 0.03, 0.03), (0, -0.016, 0.205), rot=(math.radians(30), 0, 0)))
assign(punch, tool); bevel(punch, 0.0006, 2); smooth(punch)
ram = cube((L + 0.1, 0.09, 0.12), (0, 0, 0.385), name='Pers'); assign(ram, dark); bevel(ram, 0.002, 2)
# aluminium plaat, gedeeltelijk gezet (V met 160°)
alu = mat_aluminium('AluZet', rough=0.18)
t = 0.003; ang = math.radians(14)
for s in (-1, 1):
    w = 0.16
    b = cube((L - 0.04, w, t), (0, s * (w / 2) * math.cos(ang), 0.1455 + (w / 2) * math.sin(ang)), rot=(-s * ang, 0, 0), name='Vleugel')
    assign(b, alu); bevel(b, 0.0003, 2); smooth(b)
# afgewerkte gezette profielen op de voorgrond
def zprofiel(loc, rotz, length=0.22):
    import bmesh as _b
    pts = [(0, 0), (0.05, 0), (0.05, 0.04), (0.08, 0.04)]
    o = None
    parts = []
    for (x0, z0), (x1, z1) in zip(pts, pts[1:]):
        cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
        lx = max(abs(x1 - x0), t); lz = max(abs(z1 - z0), t)
        parts.append(cube((lx + t, length, lz + (t if lz > t else 0)), (cx, 0, cz)))
    o = parts[0]
    for p in parts[1:]:
        boolean(o, p, 'UNION')
    for k in (-0.06, 0, 0.06):
        boolean(o, cyl(0.0035, 0.05, (0.025, k, 0)))
    assign(o, alu); bevel(o, 0.0015, 4, angle=60); smooth(o, 40)
    o.location = loc; o.rotation_euler = (0, 0, rotz)
    return o
zprofiel((-0.06, -0.2, 0.0015), math.radians(80))
zprofiel((0.03, -0.24, 0.0015), math.radians(70))
studio(key=260, rim=320, fill=22, top=80)
camera((0.42, -0.78, 0.36), (0.0, -0.06, 0.16), lens=42, fstop=6.3, focus=(0, -0.02, 0.15))
render(out, w=W, h=int(W * 0.75), samples=SPP)
