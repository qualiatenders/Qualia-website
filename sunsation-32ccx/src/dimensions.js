// Meshmetingen en maatlijnen. Alle waarden komen uit de bounding boxes van de
// vertexposities (1 mesh-eenheid = 1 cm, scène-eenheid = 1 m). Niet gecertificeerd.
import * as THREE from 'three';

export const fmtMeters = (m) => `${m.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;

export function meshBox(meshes) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const mesh of meshes) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    tmp.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    box.union(tmp);
  }
  return box;
}

// Welke maatlijnen per aanzicht: as van de wereld + welke box.
const PLAN = {
  side:  [{ along: 'z', box: 'hull', label: 'romp' }, { along: 'z', box: 'all', label: 'over alles' }, { along: 'y', box: 'all', label: 'hoogte' }],
  top:   [{ along: 'z', box: 'hull', label: 'romp' }, { along: 'z', box: 'all', label: 'over alles' }, { along: 'x', box: 'all', label: 'breedte' }],
  bow:   [{ along: 'x', box: 'all', label: 'breedte' }, { along: 'y', box: 'all', label: 'hoogte' }],
  stern: [{ along: 'x', box: 'all', label: 'breedte' }, { along: 'y', box: 'all', label: 'hoogte' }],
};

function screenRect(box, camera, w, h) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const v = new THREE.Vector3();
  for (let i = 0; i < 8; i++) {
    v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
    const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return { minX, maxX, minY, maxY };
}

// Teken maatlijnen voor een orthografisch aanzicht op een 2D-context.
// `scale` vergroot lijndikte en tekst (voor export op hoge resolutie).
export function drawDimensions(ctx, { camera, view, w, h, boxes, scale = 1, light = false }) {
  const plan = PLAN[view];
  if (!plan) return;
  const all = screenRect(boxes.all, camera, w, h);
  const ink = light ? '#24364a' : '#dfe8f0';
  const accent = light ? '#c0313d' : '#ef5763';
  const bg = light ? 'rgba(248,250,252,.92)' : 'rgba(16,27,40,.86)';
  const gap = 16 * scale, step = 34 * scale, tick = 5 * scale;
  ctx.save();
  ctx.lineWidth = 1 * scale;
  ctx.font = `700 ${11.5 * scale}px Inter, -apple-system, "Segoe UI", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const label = (x, y, text, sub, vertical) => {
    ctx.save();
    ctx.translate(x, y);
    if (vertical) ctx.rotate(-Math.PI / 2);
    ctx.font = `700 ${11.5 * scale}px Inter, -apple-system, "Segoe UI", sans-serif`;
    const t1 = ctx.measureText(text).width;
    ctx.font = `600 ${8.5 * scale}px Inter, -apple-system, "Segoe UI", sans-serif`;
    const t2 = ctx.measureText(sub).width;
    const pad = 7 * scale, width = t1 + t2 + pad * 3;
    ctx.fillStyle = bg;
    ctx.fillRect(-width / 2, -10 * scale, width, 20 * scale);
    ctx.fillStyle = ink;
    ctx.font = `700 ${11.5 * scale}px Inter, -apple-system, "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(text, -width / 2 + pad, 0.5 * scale);
    ctx.fillStyle = accent;
    ctx.font = `600 ${8.5 * scale}px Inter, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(sub, -width / 2 + pad * 2 + t1, 0.5 * scale);
    ctx.restore();
  };

  // Loopt de wereldas horizontaal of verticaal over het scherm? (bovenaanzicht kan kantelen)
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  let rowH = 0, rowV = 0;
  for (const d of plan) {
    const box = boxes[d.box];
    const r = screenRect(box, camera, w, h);
    const value = box.max[d.along] - box.min[d.along];
    const text = fmtMeters(value);
    const sub = `${d.label.toUpperCase()} · MESHMETING`;
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.9;
    if (Math.abs(right[d.along]) > 0.5) {
      // horizontaal, onder het model
      const y = all.maxY + gap + rowH++ * step + 10 * scale;
      ctx.beginPath();
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.moveTo(r.minX, r.maxY + 4 * scale); ctx.lineTo(r.minX, y + tick);
      ctx.moveTo(r.maxX, r.maxY + 4 * scale); ctx.lineTo(r.maxX, y + tick);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(r.minX, y); ctx.lineTo(r.maxX, y);
      ctx.moveTo(r.minX - tick, y + tick); ctx.lineTo(r.minX + tick, y - tick);
      ctx.moveTo(r.maxX - tick, y + tick); ctx.lineTo(r.maxX + tick, y - tick);
      ctx.stroke();
      label((r.minX + r.maxX) / 2, y, text, sub, false);
    } else {
      // verticaal, rechts van het model
      const x = all.maxX + gap + rowV++ * step + 10 * scale;
      ctx.beginPath();
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.moveTo(r.maxX + 4 * scale, r.minY); ctx.lineTo(x + tick, r.minY);
      ctx.moveTo(r.maxX + 4 * scale, r.maxY); ctx.lineTo(x + tick, r.maxY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, r.minY); ctx.lineTo(x, r.maxY);
      ctx.moveTo(x - tick, r.minY + tick); ctx.lineTo(x + tick, r.minY - tick);
      ctx.moveTo(x - tick, r.maxY + tick); ctx.lineTo(x + tick, r.maxY - tick);
      ctx.stroke();
      label(x, (r.minY + r.maxY) / 2, text, sub, true);
    }
  }
  ctx.restore();
}

// Rijen voor het maatvoeringspaneel.
export function measurementRows({ hull, hullShell, all, engine, triangles }) {
  const size = (b) => b.getSize(new THREE.Vector3());
  const h = size(hull), a = size(all), s = size(hullShell);
  const rows = [
    ['Romplengte (incl. stootrand)', h.z],
    ['Lengte over alles', a.z],
    ['Breedte (max.)', h.x],
    ['Romp t/m dekrand, verticaal', s.y],
    ['Hoogte laagste punt → top', a.y],
  ];
  if (engine) rows.push(['Motoren achter de romp', Math.max(0, hull.min.z - engine.min.z)]);
  return rows.map(([k, v]) => ({ label: k, value: fmtMeters(v), cm: `${Math.round(v * 100)} cm` }))
    .concat([{ label: 'Driehoeken zichtbaar', value: triangles.toLocaleString('nl-NL'), cm: '' }]);
}
