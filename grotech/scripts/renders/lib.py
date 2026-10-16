"""Gedeelde studio, materialen en hulpfuncties voor de GROTECH-renders (Blender Cycles)."""
import bpy, bmesh, math, random
from mathutils import Vector, Euler

RED = (0.88, 0.004, 0.012)  # GROTECH Red #F10A1D in lineair


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    sc.cycles.max_bounces = 10
    sc.cycles.glossy_bounces = 6
    sc.cycles.transparent_max_bounces = 8
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 0.6
    sc.view_settings.view_transform = 'AgX'
    try:
        sc.view_settings.look = 'AgX - Medium High Contrast'
    except Exception:
        pass
    sc.render.film_transparent = False
    sc.unit_settings.system = 'METRIC'
    w = bpy.data.worlds.new('World')
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (0.004, 0.0045, 0.005, 1)
    bg.inputs['Strength'].default_value = 1.0
    return sc


def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    return m, nt, p


def _noise_rough(nt, p, base, amp, scale=40.0, detail=8.0):
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['To Min'].default_value = base - amp
    mr.inputs['To Max'].default_value = base + amp
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], mr.inputs['Value'])
    nt.links.new(mr.outputs['Result'], p.inputs['Roughness'])
    return tc


def _brushed_bump(nt, p, tc, strength=0.08, stretch=(1.0, 220.0, 1.0), scale=60.0):
    """Fijne borstel-/freessporen: noise uitgerekt langs één as als bump."""
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = stretch
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = 12
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = strength
    bp.inputs['Distance'].default_value = 0.0004
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], p.inputs['Normal'])


def mat_aluminium(name='Aluminium', rough=0.2, brushed=True, color=(0.913, 0.921, 0.924)):
    m, nt, p = node_mat(name)
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = 1.0
    tc = _noise_rough(nt, p, rough, 0.06)
    if brushed:
        # Geen anisotropie zonder tangent (geeft een radiaal swirl-artefact); de borstelstructuur zit in de bump.
        _brushed_bump(nt, p, tc)
    return m


def mat_metal(name, color, rough=0.25, aniso=0.0, bump=True):
    m, nt, p = node_mat(name)
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = 1.0
    tc = _noise_rough(nt, p, rough, 0.07)
    if bump:
        _brushed_bump(nt, p, tc, strength=0.05)
    return m


def mat_stainless():
    return mat_metal('RVS', (0.62, 0.62, 0.63), rough=0.22, aniso=0.4)


def mat_steel():
    return mat_metal('Staal', (0.42, 0.43, 0.45), rough=0.32, aniso=0.2)


def mat_brass():
    return mat_metal('Messing', (0.86, 0.66, 0.33), rough=0.24, aniso=0.3)


def mat_copper():
    return mat_metal('Koper', (0.93, 0.55, 0.38), rough=0.22, aniso=0.2)


def mat_plastic(name='POM', color=(0.82, 0.82, 0.8), rough=0.42):
    m, nt, p = node_mat(name)
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    try:
        p.inputs['Subsurface Weight'].default_value = 0.15
        p.inputs['Subsurface Radius'].default_value = (0.4, 0.4, 0.4)
        p.inputs['Subsurface Scale'].default_value = 0.002
    except Exception:
        pass
    return m


def mat_dark_surface(name='Tafel', color=(0.012, 0.013, 0.015), rough=0.38, metal=0.5, scale=6.0):
    """Donker bewerkt staal / werkbank met vlekken en lichte krassen."""
    m, nt, p = node_mat(name)
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    tc = _noise_rough(nt, p, rough, 0.18, scale=scale, detail=10)
    _brushed_bump(nt, p, tc, strength=0.04, stretch=(1, 60, 1), scale=30)
    return m


def mat_emission(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def smooth(obj, angle=35):
    bpy.context.view_layer.objects.active = obj
    for o in bpy.context.selected_objects:
        o.select_set(False)
    obj.select_set(True)
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    except Exception:
        bpy.ops.object.shade_smooth()
    return obj


def bevel(obj, width=0.0006, segments=3, angle=40):
    b = obj.modifiers.new('Bevel', 'BEVEL')
    b.width = width
    b.segments = segments
    b.limit_method = 'ANGLE'
    b.angle_limit = math.radians(angle)
    b.harden_normals = False
    wn = obj.modifiers.new('WN', 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj


def boolean(target, cutter, op='DIFFERENCE'):
    mod = target.modifiers.new('Bool', 'BOOLEAN')
    mod.operation = op
    mod.object = cutter
    try:
        mod.solver = 'EXACT'
    except Exception:
        pass
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    return target


def cube(size, loc=(0, 0, 0), rot=(0, 0, 0), name='Cube'):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    return o


def cyl(r, depth, loc=(0, 0, 0), rot=(0, 0, 0), verts=96, name='Cyl'):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    return o


def rounded_box(size, radius, loc=(0, 0, 0), name='RBox', segments=12):
    """Box met afgeronde verticale hoeken (zoals een gefreesde contour)."""
    o = cube(size, loc, name=name)
    bm = bmesh.new()
    bm.from_mesh(o.data)
    edges = [e for e in bm.edges if abs((e.verts[0].co - e.verts[1].co).normalized().z) > 0.9]
    bmesh.ops.bevel(bm, geom=edges, offset=radius, segments=segments, profile=0.5, affect='EDGES')
    bm.to_mesh(o.data)
    bm.free()
    return o


def area_light(name, loc, rot, size, power, color=(1, 1, 1), size_y=None, visible=False):
    d = bpy.data.lights.new(name, 'AREA')
    d.energy = power
    d.color = color
    d.shape = 'RECTANGLE'
    d.size = size
    d.size_y = size_y or size
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    o.visible_camera = visible
    return o


def point_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def studio(key=900, rim=600, fill=120, top=350):
    """Donkere productstudio: grote key-softbox, rood strijklicht, koel fill, top-strip."""
    k = area_light('Key', (-0.9, -0.7, 1.1), (0, 0, 0), 1.2, key, size_y=0.8)
    point_at(k, (0, 0, 0.03))
    r = area_light('RimRed', (0.9, 0.85, 0.35), (0, 0, 0), 0.25, rim, RED, size_y=1.2)
    point_at(r, (0, 0, 0.05))
    f = area_light('Fill', (0.9, -0.9, 0.25), (0, 0, 0), 1.6, fill, (0.85, 0.9, 1.0), size_y=0.3)
    point_at(f, (0, 0, 0.03))
    t = area_light('Top', (0, 0.25, 1.4), (0, 0, 0), 2.2, top, size_y=0.18)
    point_at(t, (0, 0.05, 0))
    return k, r, f, t


def floor(mat=None, size=8):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = 'Floor'
    assign(o, mat or mat_dark_surface())
    return o


def camera(loc, target, lens=85, fstop=4.0, focus=None, sensor=36):
    c = bpy.data.cameras.new('Cam')
    c.lens = lens
    c.sensor_width = sensor
    c.dof.use_dof = True
    c.dof.aperture_fstop = fstop
    o = bpy.data.objects.new('Cam', c)
    bpy.context.collection.objects.link(o)
    o.location = loc
    point_at(o, target)
    tgt = Vector(focus or target)
    c.dof.focus_distance = (tgt - Vector(loc)).length
    bpy.context.scene.camera = o
    return o


def render(path, w=1600, h=1200, samples=160):
    sc = bpy.context.scene
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_depth = '16'
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def chips(n, center, radius, mat, seed=1, zmin=0.0):
    """Gekrulde aluminium spanen: kleine spiraalcurves met dikte."""
    rnd = random.Random(seed)
    objs = []
    for i in range(n):
        cu = bpy.data.curves.new(f'chip{i}', 'CURVE')
        cu.dimensions = '3D'
        cu.bevel_depth = rnd.uniform(0.00018, 0.00035)
        cu.bevel_resolution = 2
        cu.resolution_u = 8
        sp = cu.splines.new('POLY')
        turns = rnd.uniform(0.8, 2.6)
        pts = 28
        sp.points.add(pts - 1)
        r0 = rnd.uniform(0.0012, 0.003)
        pitch = rnd.uniform(0.0005, 0.0016)
        for k in range(pts):
            t = k / (pts - 1) * turns * 2 * math.pi
            r = r0 * (1 + 0.25 * k / pts)
            sp.points[k].co = (r * math.cos(t), r * math.sin(t), pitch * t / (2 * math.pi), 1)
        o = bpy.data.objects.new(f'chip{i}', cu)
        bpy.context.collection.objects.link(o)
        a = rnd.uniform(0, 2 * math.pi)
        d = radius * math.sqrt(rnd.random())
        o.location = (center[0] + d * math.cos(a), center[1] + d * math.sin(a), center[2] + zmin + 0.0015)
        o.rotation_euler = (rnd.uniform(0, 3.14), rnd.uniform(0, 3.14), rnd.uniform(0, 3.14))
        cu.materials.append(mat)
        objs.append(o)
    return objs


def lathe(profile, steps=160, name='Lathe'):
    """Draaideel: profiel [(r, z), ...] rond de Z-as gespind (gesloten)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    return o


def sparks(n, origin, seed=3, spread=0.6, length=(0.006, 0.03), down=True, mat=None, reach=0.12):
    """Vonkenregen: dunne gloeiende streepjes vanuit een punt."""
    rnd = random.Random(seed)
    mat = mat or mat_emission('Vonk', (1.0, 0.55, 0.18), 60)
    objs = []
    for i in range(n):
        L = rnd.uniform(*length)
        bpy.ops.mesh.primitive_cylinder_add(radius=rnd.uniform(0.00012, 0.00028), depth=L, vertices=6)
        o = bpy.context.active_object
        th = rnd.uniform(0, 2 * math.pi)
        ph = rnd.uniform(0, spread)
        d = Vector((math.sin(ph) * math.cos(th), math.sin(ph) * math.sin(th), -math.cos(ph) if down else math.cos(ph)))
        dist = rnd.uniform(0.002, reach)
        o.location = Vector(origin) + d * (dist + L / 2)
        o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
        assign(o, mat)
        o.visible_shadow = False
        objs.append(o)
    return objs
