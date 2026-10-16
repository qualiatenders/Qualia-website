import sys, math
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]; W = int(sys.argv[-4]); SPP = int(sys.argv[-3])
reset()
floor(mat_dark_surface('Ondergrond', (0.0025, 0.0027, 0.003), rough=0.6, metal=0.15, scale=5))

# Aluminium flensas (staand)
p = [(0.0001, 0), (0.026, 0), (0.0275, 0.0015), (0.0275, 0.009), (0.026, 0.0105), (0.011, 0.0105), (0.0105, 0.011), (0.0105, 0.034), (0.0095, 0.035),
     (0.0095, 0.038), (0.0105, 0.039), (0.0105, 0.058), (0.0095, 0.059), (0.0001, 0.059)]
fl = lathe(p, name='Flens')
boolean(fl, cyl(0.0045, 0.2, (0, 0, 0.03)))
for i in range(6):
    a = i * math.pi / 3
    boolean(fl, cyl(0.0022, 0.05, (0.019 * math.cos(a), 0.019 * math.sin(a), 0.005), verts=32))
assign(fl, mat_aluminium('Alu', rough=0.14)); bevel(fl, 0.0003, 2, angle=50); smooth(fl, 50)
fl.location = (0.0, 0.0, 0.0)

# RVS-as (liggend)
q = [(0.0001, 0), (0.007, 0), (0.0078, 0.0008), (0.0078, 0.03), (0.0068, 0.031), (0.0068, 0.034), (0.0078, 0.035), (0.0078, 0.07), (0.0105, 0.071),
     (0.0105, 0.09), (0.0098, 0.0915), (0.0098, 0.12), (0.009, 0.121), (0.0001, 0.121)]
ax = lathe(q, name='As')
boolean(ax, cube((0.003, 0.03, 0.006), (0, 0.0075, 0.105)))
assign(ax, mat_stainless()); bevel(ax, 0.0003, 2, angle=50); smooth(ax, 50)
ax.rotation_euler = (math.radians(90), 0, math.radians(-30)); ax.location = (-0.07, 0.035, 0.0105)

# Messing bussen
for i, (x, y) in enumerate([(0.06, 0.03), (0.075, -0.012)]):
    b = lathe([(0.006, 0), (0.0108, 0), (0.0115, 0.0007), (0.0115, 0.016 + i * 0.006), (0.0108, 0.0167 + i * 0.006), (0.006, 0.0167 + i * 0.006)], name=f'Bus{i}')
    # gesloten ring: binnenkant
    assign(b, mat_brass()); bevel(b, 0.0002, 2, angle=50); smooth(b, 50)
    b.location = (x, y, 0)
bpy.ops.mesh.primitive_cylinder_add(radius=0.0062, depth=0.0005, location=(0, 0, -1))

# Zwarte POM-rol op de achtergrond
pr = lathe([(0.0001, 0), (0.014, 0), (0.015, 0.001), (0.015, 0.03), (0.014, 0.031), (0.0001, 0.031)], name='Rol')
assign(pr, mat_plastic('POMzwart', (0.03, 0.03, 0.032), 0.45)); smooth(pr, 50)
pr.location = (-0.03, 0.11, 0)

studio(key=240, rim=300, fill=22, top=80)
camera((0.2, -0.27, 0.14), (0.0, 0.02, 0.022), lens=66, fstop=4.5, focus=(0.0, 0.0, 0.03))
render(out, w=W, h=int(W * 0.75), samples=SPP)
