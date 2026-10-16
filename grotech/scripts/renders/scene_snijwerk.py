import sys, math, random
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]; W = int(sys.argv[-4]); SPP = int(sys.argv[-3])
reset()
floor(mat_dark_surface('Vloer', (0.002, 0.002, 0.0025), rough=0.6, metal=0.1))
# lasersnijbed: lamellen met zaagtand
lam = mat_dark_surface('Lamel', (0.02, 0.017, 0.015), rough=0.55, metal=0.6, scale=9)
for i in range(-9, 10):
    l = cube((0.0025, 0.6, 0.05), (i * 0.03, 0, 0.025), name='Lamel')
    for k in range(-30, 31):
        boolean(l, cube((0.004, 0.006, 0.006), (i * 0.03, k * 0.01, 0.05), rot=(math.radians(45), 0, 0)))
    assign(l, lam)
# aluminium plaat met gesneden contouren
alu = mat_aluminium('AluPlaat', rough=0.2)
pl = cube((0.42, 0.3, 0.004), (0.02, 0.0, 0.052), name='Plaat')
cuts = [rounded_box((0.07, 0.045, 0.02), 0.008, (-0.1, 0.06, 0.052)), cyl(0.022, 0.02, (0.02, 0.07, 0.052)),
        rounded_box((0.014, 0.08, 0.02), 0.0069, (0.11, 0.05, 0.052)), cyl(0.012, 0.02, (-0.1, -0.06, 0.052)), cyl(0.012, 0.02, (-0.05, -0.06, 0.052))]
for c in cuts:
    boolean(pl, c)
# halve snede: smalle sleuf waar de laser nu loopt
for k in range(28):
    a = math.pi * 0.25 + k / 27 * math.pi * 1.0
    boolean(pl, cyl(0.0006, 0.02, (0.06 + 0.035 * math.cos(a), -0.07 + 0.035 * math.sin(a), 0.052), verts=8))
assign(pl, alu); bevel(pl, 0.0002, 2); smooth(pl)
# laserkop met koperen nozzle
head = lathe([(0.0001, 0.0), (0.0012, 0.0), (0.006, 0.008), (0.009, 0.012), (0.009, 0.02), (0.018, 0.024), (0.018, 0.09), (0.0001, 0.09)], name='Kop')
assign(head, mat_metal('Kop', (0.05, 0.05, 0.055), rough=0.35)); smooth(head, 50)
nz = lathe([(0.0001, 0.0), (0.0011, 0.0), (0.0052, 0.007), (0.0091, 0.0125), (0.0001, 0.0125)], name='Nozzle')
assign(nz, mat_copper()); smooth(nz, 50)
cut = (0.06 + 0.035 * math.cos(math.pi * 1.25), -0.07 + 0.035 * math.sin(math.pi * 1.25), 0.054)
for o in (head, nz):
    o.location = (cut[0], cut[1], cut[2] + 0.0025)
# smeltpunt + vonken onder de plaat
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0012, location=(cut[0], cut[1], cut[2] - 0.001))
assign(bpy.context.active_object, mat_emission('Smelt', (1.0, 0.75, 0.45), 400))
sparks(260, (cut[0], cut[1], cut[2] - 0.003), seed=7, spread=0.55, length=(0.004, 0.022), reach=0.05)
sparks(60, (cut[0], cut[1], cut[2] + 0.0005), seed=9, spread=1.3, length=(0.002, 0.008), down=False, reach=0.02)
pt = bpy.data.lights.new('Gloed', 'POINT'); pt.energy = 3.5; pt.color = (1, 0.55, 0.2); pt.shadow_soft_size = 0.002
po = bpy.data.objects.new('Gloed', pt); bpy.context.collection.objects.link(po); po.location = (cut[0], cut[1], cut[2] - 0.004)
studio(key=200, rim=260, fill=18, top=70)
camera((0.27, -0.31, 0.22), (0.03, -0.06, 0.05), lens=50, fstop=4.5, focus=cut)
render(out, w=W, h=int(W * 0.75), samples=SPP)
