import sys, math, random
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]; W = int(sys.argv[-4]); SPP = int(sys.argv[-3])
reset()
floor(mat_dark_surface('Ondergrond', (0.003, 0.003, 0.0035), rough=0.5, metal=0.2))
alu = mat_aluminium('Alu', rough=0.22)
alu2 = mat_aluminium('AluMat', rough=0.35)
rnd = random.Random(5)
# stapel platen in verschillende diktes
z = 0
for i, t in enumerate([0.012, 0.008, 0.006, 0.01, 0.004]):
    p = cube((0.42, 0.26 - i * 0.02, t), (rnd.uniform(-0.01, 0.01), 0.06, z + t / 2), rot=(0, 0, math.radians(rnd.uniform(-3, 3))))
    assign(p, alu if i % 2 else alu2); bevel(p, 0.0006, 2); smooth(p)
    z += t
# ronde staven en kokers ervoor
for i in range(5):
    r = cyl(0.012 + 0.002 * (i % 2), 0.5, (0, 0, 0), verts=96)
    r.rotation_euler = (0, math.radians(90), math.radians(4 + i * 1.5)); r.location = (0.02 + i * 0.01, -0.09 - i * 0.027, 0.013)
    assign(r, alu); bevel(r, 0.0006, 2, angle=50); smooth(r, 50)
k = cube((0.5, 0.04, 0.04), (0.03, -0.25, 0.02)); boolean(k, cube((0.6, 0.034, 0.034), (0.03, -0.25, 0.02)))
assign(k, alu); bevel(k, 0.0015, 3); smooth(k)
studio(key=200, rim=90, fill=18, top=60)
camera((-0.3, -0.55, 0.36), (0.04, -0.07, 0.01), lens=48, fstop=5.6, focus=(-0.1, -0.12, 0.02))
render(out, w=W, h=int(W * 0.75), samples=SPP)
