"""Bouwt de compacte datasnapshot voor Assault Navigation uit FIS-JSONL-dumps.

Gebruik: python3 -I build_data.py <map-met-jsonl> <uitvoer.js>
Bron: Rijkswaterstaat Vaarweginformatie (FIS dataservice 1.4), CC-0.
"""
import json, math, sys, re

SRC, OUT = sys.argv[1], sys.argv[2]
def load(t): return [json.loads(l) for l in open(f"{SRC}/{t}.jsonl")]

EPOCH0 = 946681200000  # 2000-01-01 00:00 lokale tijd (CET) in ms
Q = 1e5                # 1e-5 graad ~ 1 m

def pt(wkt):
    m = re.match(r"POINT \(([-\d.]+) ([-\d.]+)\)", wkt)
    return float(m.group(1)), float(m.group(2))

def centroid(wkt):
    nums = list(map(float, re.findall(r"[-\d.]+", wkt)))
    xs, ys = nums[0::2], nums[1::2]
    return sum(xs)/len(xs), sum(ys)/len(ys)

def coords(wkt):
    out = []
    for part in re.findall(r"\(([^()]+)\)", wkt):
        p = [tuple(map(float, c.split())) for c in part.split(",")]
        out.append(p)
    return out

def simplify(p, tol):
    if len(p) < 3: return p
    kx = math.cos(math.radians(52.2))
    def d(a, b, c):
        ax, ay, bx, by, cx, cy = a[0]*kx, a[1], b[0]*kx, b[1], c[0]*kx, c[1]
        dx, dy = cx-bx, cy-by
        L = dx*dx+dy*dy
        if L == 0: return math.hypot(ax-bx, ay-by)
        t = max(0, min(1, ((ax-bx)*dx+(ay-by)*dy)/L))
        return math.hypot(ax-bx-t*dx, ay-by-t*dy)
    keep = [False]*len(p); keep[0] = keep[-1] = True
    st = [(0, len(p)-1)]
    while st:
        i, j = st.pop(); best, bi = 0, -1
        for k in range(i+1, j):
            dd = d(p[k], p[i], p[j])
            if dd > best: best, bi = dd, k
        if best > tol:
            keep[bi] = True; st += [(i, bi), (bi, j)]
    return [q for q, k in zip(p, keep) if k]

def enc(p):
    out, px, py = [], 0, 0
    for x, y in p:
        ix, iy = round(x*Q), round(y*Q)
        out += [ix-px, iy-py]; px, py = ix, iy
    return out

bridges, openings, locks = load("bridge"), load("opening"), load("lock")
radios, ots, fairways = load("radiocallinpoint"), load("operatingtimes"), load("fairway")

ops = {}
for o in openings:
    ops.setdefault((o.get("ParentGeoType"), o.get("ParentId")), []).append(o)
vhf = {}
for r in radios:
    if r.get("VhfChannels"):
        vhf.setdefault((r.get("ParentGeoType"), r.get("ParentId")), set()).update(r["VhfChannels"])

ot_index, ot_list = {}, []
def ot_ref(i):
    if i is None: return -1
    if i in ot_index: return ot_index[i]
    src = next((o for o in ots if o["Id"] == i), None)
    if not src: return -1
    periods = []
    for per in src.get("OperatingPeriods", []):
        rules = []
        for r in per.get("OperatingRules", []):
            mask = sum(1 << b for b, k in enumerate(
                ["IsMonday","IsTuesday","IsWednesday","IsThursday","IsFriday","IsSaturday","IsSunday","IsHoliday"]) if r.get(k))
            f = round((r["From"]-EPOCH0)/60000); t = round((r["To"]-EPOCH0)/60000)
            rules.append([mask, f, t])
        periods.append([per.get("Start","0101"), per.get("End","1231"), rules])
    ot_index[i] = len(ot_list)
    ot_list.append([(src.get("Note") or "").strip()[:240], periods])
    return ot_index[i]

def lowest(vals):
    # Waarden <= 0,2 m zijn vrijwel altijd t.o.v. een ander peil (NAP) of fout: onbekend.
    v = [x for x in vals if isinstance(x, (int, float)) and x > 0.2]
    return round(min(v), 2) if v else None

S = []
for b in bridges:
    if b.get("Condition") not in (None, "CONSTRUCTED"): continue
    x, y = pt(b["Geometry"])
    oo = ops.get(("bridge", b["Id"]), [])
    hc = lowest([o.get(k) for o in oo for k in ("HeightClosed","ClearanceHeightClosed")])
    ho = lowest([o.get(k) for o in oo for k in ("HeightOpened","ClearanceHeightOpened")])
    w = max([o.get("Width") or 0 for o in oo] or [0]) or None
    kind = 1 if b.get("CanOpen") else 0
    S.append([kind, b.get("Name") or "Brug", round(x,5), round(y,5), hc, ho, w,
              b.get("PhoneNumber") or "", ",".join(sorted(vhf.get(("bridge", b["Id"]), []))),
              ot_ref(b.get("OperatingTimesId")) if kind else -1, b.get("City") or ""])
for l in locks:
    if l.get("Condition") not in (None, "CONSTRUCTED"): continue
    x, y = centroid(l["Geometry"])
    S.append([2, l.get("Name") or "Sluis", round(x,5), round(y,5), None, None, None,
              l.get("PhoneNumber") or "", ",".join(sorted(vhf.get(("lock", l["Id"]), []))),
              ot_ref(l.get("OperatingTimesId")), l.get("City") or ""])

names, FW = {}, []
for f in fairways:
    nm = f.get("Name") or ""
    ni = names.setdefault(nm, len(names))
    for line in coords(f["Geometry"]):
        s = simplify(line, 0.00006)
        if len(s) >= 2: FW.append([ni, enc(s)])

data = {"gen": int(sys.argv[3]) if len(sys.argv) > 3 else 4991, "pub": sys.argv[4] if len(sys.argv) > 4 else "2026-11-03", "names": list(names), "fw": FW, "s": S, "ot": ot_list}
js = "window.NAVDATA=" + json.dumps(data, separators=(",", ":"), ensure_ascii=False) + ";"
open(OUT, "w").write(js)
print("objecten", len(S), "schema's", len(ot_list), "vaarweglijnen", len(FW), "bytes", len(js))
