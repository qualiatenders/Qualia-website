import sys, math, random
sys.path.insert(0, sys.argv[-2])
from lib import *
out = sys.argv[-1]; W = int(sys.argv[-4]); SPP = int(sys.argv[-3])
reset()
floor(mat_dark_surface('Werkbank', (0.004, 0.004, 0.0045), rough=0.45, metal=0.4, scale=3))
alu = mat_aluminium('AluKoker', rough=0.22)
def koker(size, loc, rot=(0, 0, 0), wall=0.003):
    o = cube(size, loc, rot)
    inner = list(size); i = size.index(max(size)); inner = [s - 2 * wall for s in size]; inner[i] = size[i] + 0.02
    boolean(o, cube(tuple(inner), loc, rot))
    assign(o, alu); bevel(o, 0.0012, 3, angle=40); smooth(o)
    return o
koker((0.3, 0.04, 0.04), (0, 0, 0.02))
koker((0.04, 0.04, 0.2), (0.0, 0, 0.14))
# TIG-lasrups ('stack of dimes') rondom de verbinding
bead = mat_metal('Lasrups', (0.8, 0.8, 0.79), rough=0.32, bump=False)
etch = mat_plastic('Reinigingszone', (0.55, 0.56, 0.57), 0.6)
rnd = random.Random(2)
def rups(p0, p1, n):
    for k in range(n):
        t = k / (n - 1)
        p = (p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0032, segments=24, ring_count=12, location=p)
        o = bpy.context.active_object
        o.scale = (1.0, 1.0, 0.55)
        d = Vector(p1) - Vector(p0)
        o.rotation_euler = d.to_track_quat('X', 'Z').to_euler()
        o.rotation_euler.rotate_axis('X', math.radians(45))
        assign(o, bead); smooth(o, 80)
# voorkant (y = -0.02), linker- en rechterzijde van de staande koker
rups((-0.021, -0.021, 0.041), (0.021, -0.021, 0.041), 22)
rups((-0.021, -0.021, 0.041), (-0.021, 0.021, 0.041), 22)
rups((0.021, -0.021, 0.041), (0.021, 0.014, 0.041), 18)
# matte reinigingszone naast de rups (typisch AC-TIG op aluminium)
for (sx, sy, x, y) in [(0.05, 0.008, 0, -0.024), (0.008, 0.05, -0.024, 0)]:
    z = cube((sx, sy, 0.0002), (x, y, 0.0401)); assign(z, etch)
# TIG-toorts: keramische cup, koperen collet, gebogen nek en handgreep
arc_pt = Vector((0.021, 0.0165, 0.0452))
axis = Vector((0.55, 0.45, 0.70)).normalized()          # richting van de toorts (van boog naar handgreep)
rot = axis.to_track_quat('Z', 'Y').to_euler()
def place(o, dist):
    o.rotation_euler = rot
    o.location = arc_pt + axis * dist
cup = lathe([(0.0028, 0), (0.0042, 0), (0.0075, 0.016), (0.0078, 0.019), (0.0028, 0.019)], name='Cup')
assign(cup, mat_plastic('Keramiek', (0.7, 0.42, 0.36), 0.6)); smooth(cup, 50); place(cup, 0.004)
col = lathe([(0.0001, 0), (0.0028, 0), (0.0028, 0.006), (0.0001, 0.006)], name='Collet')
assign(col, mat_copper()); smooth(col, 50); place(col, 0.0085)
w = lathe([(0.0001, 0), (0.0002, 0), (0.0008, 0.002), (0.0008, 0.012), (0.0001, 0.012)], name='Wolfraam')
assign(w, mat_metal('Wolfraam', (0.45, 0.45, 0.47), rough=0.3, bump=False)); smooth(w, 50); place(w, 0.0016)
head = lathe([(0.0001, 0), (0.0085, 0), (0.0095, 0.004), (0.0095, 0.03), (0.007, 0.034), (0.0001, 0.034)], name='Kop')
assign(head, mat_plastic('Rubber', (0.012, 0.012, 0.013), 0.55)); smooth(head, 50); place(head, 0.022)
handle = lathe([(0.0001, 0), (0.0105, 0), (0.0115, 0.01), (0.0115, 0.11), (0.009, 0.12), (0.0001, 0.12)], name='Greep')
assign(handle, mat_plastic('Greep', (0.015, 0.015, 0.016), 0.5)); smooth(handle, 50); place(handle, 0.055)
for k in range(10):
    rib = lathe([(0.0115, 0), (0.0122, 0.002), (0.0115, 0.004)], name='Rib')
    assign(rib, mat_plastic('Greep2', (0.02, 0.02, 0.022), 0.45)); smooth(rib, 50); place(rib, 0.075 + k * 0.008)
# lichtboog: fel blauwwit, met een kegel van licht
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0016, location=arc_pt)
assign(bpy.context.active_object, mat_emission('Boog', (0.72, 0.82, 1.0), 2500))
bpy.ops.mesh.primitive_cone_add(radius1=0.0028, radius2=0.0007, depth=0.0035, location=arc_pt + axis * 0.0012)
cone = bpy.context.active_object; cone.rotation_euler = rot
assign(cone, mat_emission('BoogKegel', (0.6, 0.75, 1.0), 220)); cone.visible_shadow = False
pt = bpy.data.lights.new('Boog', 'POINT'); pt.energy = 4; pt.color = (0.65, 0.78, 1.0); pt.shadow_soft_size = 0.0015
po = bpy.data.objects.new('BoogLicht', pt); bpy.context.collection.objects.link(po); po.location = arc_pt + Vector((0, -0.002, 0.002))
# smeltbad: klein, fel en vloeibaar
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0032, location=arc_pt + Vector((0, 0, -0.004)))
pool = bpy.context.active_object; pool.scale = (1.0, 1.0, 0.35)
m_pool = mat_metal('Smeltbad', (0.95, 0.93, 0.9), rough=0.05, bump=False); assign(pool, m_pool)
# lasdraad
rod = cyl(0.0012, 0.25, (0, 0, 0), verts=16); assign(rod, mat_aluminium('Draad', rough=0.25, brushed=False))
rod.rotation_euler = (math.radians(72), 0, math.radians(-58)); rod.location = arc_pt + Vector((-0.105, -0.07, 0.034))
studio(key=70, rim=160, fill=6, top=22)
camera((0.15, -0.22, 0.11), (0.012, 0.004, 0.05), lens=58, fstop=3.5, focus=(0.021, 0.0165, 0.045))
render(out, w=W, h=int(W * 0.75), samples=SPP)
