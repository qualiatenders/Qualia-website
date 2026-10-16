import sys, math, random
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]
reset()

# CNC-machinetafel met T-sleuven, licht geolied
table_mat = mat_dark_surface('Machinetafel', (0.0035, 0.0038, 0.0045), rough=0.5, metal=0.25, scale=4)
tbl = cube((1.2, 0.8, 0.06), (0, 0, -0.03), name='Tafel')
for y in (-0.15, -0.05, 0.05, 0.15, 0.25, -0.25):
    boolean(tbl, cube((1.3, 0.018, 0.03), (0, y, -0.005)))
    boolean(tbl, cube((1.3, 0.03, 0.014), (0, y, -0.02)))
assign(tbl, table_mat); bevel(tbl, 0.0008, 2)

alu = mat_aluminium('Alu', rough=0.16)
# gefreesde behuizing
h = rounded_box((0.13, 0.088, 0.042), 0.006, (0, 0, 0.021), 'Behuizing')
boolean(h, rounded_box((0.074, 0.05, 0.03), 0.009, (-0.012, 0, 0.034)))
boolean(h, cyl(0.011, 0.08, (-0.012, 0, 0.02)))
boolean(h, cyl(0.016, 0.006, (-0.012, 0, 0.0195)))
for x, y in [(-0.054, -0.033), (0.054, -0.033), (-0.054, 0.033), (0.054, 0.033)]:
    boolean(h, cyl(0.0034, 0.08, (x, y, 0.02), verts=48))
    boolean(h, cyl(0.0058, 0.012, (x, y, 0.042), verts=48))
boolean(h, rounded_box((0.012, 0.05, 0.03), 0.0059, (0.044, 0, 0.034)))
boolean(h, cyl(0.0032, 0.2, (0.0, 0, 0.02), rot=(0, math.pi / 2, 0), verts=48))
boolean(h, cube((0.04, 0.1, 0.012), (0.066, 0, 0.042)))
assign(h, alu); bevel(h, 0.0005, 3); smooth(h, 30)
h.rotation_euler = (0, 0, math.radians(-24))

# andere materialen op de achtergrond: RVS-blok, messing bus, POM-deel
st = rounded_box((0.06, 0.04, 0.028), 0.003, (-0.115, 0.105, 0.014), 'RVS')
boolean(st, cyl(0.009, 0.08, (-0.115, 0.105, 0.02)))
boolean(st, cube((0.03, 0.05, 0.01), (-0.115 + 0.03, 0.105, 0.028)))
assign(st, mat_stainless()); bevel(st, 0.0004, 3); smooth(st); st.rotation_euler = (0, 0, math.radians(18))
br = cyl(0.016, 0.034, (0.1, 0.115, 0.017), name='Messing')
boolean(br, cyl(0.009, 0.08, (0.1, 0.115, 0.017)))
boolean(br, cyl(0.02, 0.006, (0.1, 0.115, 0.03)))
assign(br, mat_brass()); bevel(br, 0.0004, 3); smooth(br)
pom = rounded_box((0.05, 0.05, 0.016), 0.012, (-0.02, 0.17, 0.008), 'POM')
boolean(pom, cyl(0.012, 0.05, (-0.02, 0.17, 0.01)))
assign(pom, mat_plastic(color=(0.55, 0.55, 0.53))); bevel(pom, 0.0005, 3); smooth(pom)

chips(90, (0.0, -0.02, 0.0), 0.12, mat_aluminium('Spaan', rough=0.12, brushed=False), seed=4)

studio(key=260, rim=320, fill=25, top=90)
camera((0.29, -0.33, 0.16), (0.0, 0.02, 0.012), lens=62, fstop=4.0, focus=(0, -0.01, 0.03))
render(out, w=int(sys.argv[-4]), h=int(int(sys.argv[-4])*0.75), samples=int(sys.argv[-3]) if sys.argv[-3].isdigit() else 64)
