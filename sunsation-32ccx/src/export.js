// PNG- en SVG-export. PNG wordt in tegels gerenderd (zo is 8K ook mogelijk op
// apparaten met een kleine maximale canvasgrootte). SVG is afgeleid van de echte mesh.
import * as THREE from 'three';
import { VIEWS } from './views.js';
import { drawDimensions, fmtMeters } from './dimensions.js';
import { isDetailPart } from './edges.js';

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

function paintBackground(ctx, w, h, kind) {
  if (kind === 'transparent') return;
  const g = ctx.createRadialGradient(w * 0.5, h * 0.38, 0, w * 0.5, h * 0.38, Math.hypot(w, h) * 0.62);
  if (kind === 'light') { g.addColorStop(0, '#fbfcfd'); g.addColorStop(0.6, '#eef2f5'); g.addColorStop(1, '#dde4ea'); }
  else { g.addColorStop(0, '#24384d'); g.addColorStop(0.42, '#172a3c'); g.addColorStop(1, '#0d1826'); }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// ---------- PNG ----------
export async function exportPNG(studio, { view, longSide, aspect, background }) {
  const { renderer } = studio;
  const screenAspect = studio.canvas.clientWidth / Math.max(1, studio.canvas.clientHeight);
  const ratio = aspect === 'screen' ? screenAspect : aspect.split(':').reduce((a, b) => a / b);
  const W = ratio >= 1 ? longSide : Math.round(longSide * ratio);
  const H = ratio >= 1 ? Math.round(longSide / ratio) : longSide;

  const camera = view === 'current' ? studio.cloneCurrentCamera(W / H) : studio.makeViewCamera(view, W / H);
  const viewKey = view === 'current' ? studio.alignedView() : view;

  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Deze browser kan geen afbeelding van dit formaat maken. Kies een lagere resolutie.');
  const lightBg = background === 'light' || (background !== 'studio' && studio.linesMode);
  paintBackground(ctx, W, H, background);

  const maxSize = renderer.capabilities.maxTextureSize;
  const tile = Math.min(2048, maxSize);
  const prevSize = renderer.getSize(new THREE.Vector2());
  const prevRatio = renderer.getPixelRatio();
  try {
    studio.aimHeadlight(camera);
    renderer.setPixelRatio(1);
    renderer.setSize(tile, tile, false);
    for (let y = 0; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        camera.setViewOffset(W, H, x, y, tile, tile);
        renderer.render(studio.scene, camera);
        ctx.drawImage(renderer.domElement, 0, 0, tile, tile, x, y, tile, tile);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  } finally {
    camera.clearViewOffset();
    renderer.setPixelRatio(prevRatio);
    renderer.setSize(prevSize.x, prevSize.y, false);
    studio.requestRender();
  }

  const s = W / 1600;
  if (studio.showDims && viewKey && VIEWS[viewKey].ortho) {
    drawDimensions(ctx, { camera, view: viewKey, w: W, h: H, boxes: studio.boxes(), scale: Math.max(1, s * 1.4), light: lightBg });
  }
  // Bijschrift
  ctx.save();
  ctx.font = `700 ${Math.round(13 * s)}px Inter, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = lightBg ? '#24364acc' : '#dfe8f0cc';
  ctx.textBaseline = 'bottom';
  const name = viewKey ? VIEWS[viewKey].name : 'vrije camera';
  ctx.fillText(`SUNSATION 32CCX  ·  ${studio.engineName().toUpperCase()}  ·  ${name.toUpperCase()}`, 28 * s, H - 40 * s);
  ctx.font = `500 ${Math.round(10 * s)}px Inter, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = lightBg ? '#4b5d70aa' : '#a5b4c4aa';
  ctx.fillText('Visualisatie op basis van de originele mesh · materialen en kleuren indicatief · maten zijn meshmetingen, niet gecertificeerd', 28 * s, H - 22 * s);
  ctx.restore();

  const blob = await new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG kon niet worden aangemaakt (te groot voor dit apparaat?)'))), 'image/png'));
  download(blob, `Sunsation_32CCX_${viewKey || 'vrij'}_${W}x${H}_${stamp()}.png`);
  return { W, H };
}

// ---------- SVG ----------

// Contourlijnen (marching squares) over een dekkingsraster; waarden 0..1, drempel 0,5.
function traceContours(cov, W, H) {
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : cov[y * W + x]);
  const segs = new Map(); // startpunt-sleutel -> [x2, y2, key2]
  const pts = [];
  const key = (x, y) => `${x.toFixed(3)},${y.toFixed(3)}`;
  const lerp = (a, b) => (0.5 - a) / (b - a);
  const push = (x1, y1, x2, y2) => { const k = key(x1, y1); segs.set(k, [x2, y2, key(x2, y2)]); pts.push(k); };
  for (let y = -1; y < H; y++) {
    for (let x = -1; x < W; x++) {
      const tl = at(x, y), tr = at(x + 1, y), br = at(x + 1, y + 1), bl = at(x, y + 1);
      const c = (tl > 0.5 ? 8 : 0) | (tr > 0.5 ? 4 : 0) | (br > 0.5 ? 2 : 0) | (bl > 0.5 ? 1 : 0);
      if (c === 0 || c === 15) continue;
      const T = [x + lerp(tl, tr), y], R = [x + 1, y + lerp(tr, br)], B = [x + lerp(bl, br), y + 1], L = [x, y + lerp(tl, bl)];
      // segmenten zo georiënteerd dat "binnen" links ligt → gesloten lussen zijn te koppelen
      switch (c) {
        case 1: push(...L, ...B); break;
        case 2: push(...B, ...R); break;
        case 3: push(...L, ...R); break;
        case 4: push(...R, ...T); break;
        case 5: push(...L, ...T); push(...R, ...B); break;
        case 6: push(...B, ...T); break;
        case 7: push(...L, ...T); break;
        case 8: push(...T, ...L); break;
        case 9: push(...T, ...B); break;
        case 10: push(...T, ...R); push(...B, ...L); break;
        case 11: push(...T, ...R); break;
        case 12: push(...R, ...L); break;
        case 13: push(...R, ...B); break;
        case 14: push(...B, ...L); break;
      }
    }
  }
  const loops = [];
  for (const start of pts) {
    if (!segs.has(start)) continue;
    const loop = [];
    let k = start;
    while (segs.has(k)) {
      const [x2, y2, k2] = segs.get(k);
      segs.delete(k);
      loop.push(x2, y2);
      k = k2;
    }
    if (loop.length >= 6) loops.push(loop);
  }
  return loops;
}

// Ramer–Douglas–Peucker op een vlakke [x,y,...]-lijst.
function simplify(flat, eps) {
  const n = flat.length / 2;
  if (n < 3) return flat;
  const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const ax = flat[i * 2], ay = flat[i * 2 + 1], bx = flat[j * 2], by = flat[j * 2 + 1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let worst = -1, dist = eps;
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs((flat[k * 2] - ax) * dy - (flat[k * 2 + 1] - ay) * dx) / len;
      if (d > dist) { dist = d; worst = k; }
    }
    if (worst !== -1) { keep[worst] = 1; stack.push([i, worst], [worst, j]); }
  }
  const out = [];
  for (let k = 0; k < n; k++) if (keep[k]) out.push(flat[k * 2], flat[k * 2 + 1]);
  return out;
}

// Diepte als 24-bits geheel getal in RGB, exact terug te lezen via readPixels.
const depthMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: 'void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `void main(){
    float v = floor(gl_FragCoord.z * 16777215.0);
    float r = floor(v / 65536.0), g = floor(mod(v / 256.0, 256.0)), b = mod(v, 256.0);
    gl_FragColor = vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);
  }`,
});
const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

function renderOverride(studio, camera, W, H, material, samples, clear) {
  const { renderer, scene } = studio;
  const rt = new THREE.WebGLRenderTarget(W, H, { samples, depthBuffer: true });
  const restore = studio.isolateMeshes();
  const prevOverride = scene.overrideMaterial, prevClear = renderer.getClearColor(new THREE.Color()), prevAlpha = renderer.getClearAlpha();
  scene.overrideMaterial = material;
  renderer.setRenderTarget(rt);
  renderer.setClearColor(clear, 1);
  renderer.clear();
  renderer.render(scene, camera);
  const px = new Uint8Array(W * H * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, W, H, px);
  renderer.setRenderTarget(null);
  renderer.setClearColor(prevClear, prevAlpha);
  scene.overrideMaterial = prevOverride;
  restore();
  rt.dispose();
  return px;
}

export async function exportSVG(studio, { view, detail, scale }, onStatus) {
  const { renderer } = studio;
  const box = studio.boxes().all;
  const v = VIEWS[view];
  // Tekenvlak exact rond het model (2% marge), in meters.
  const camera = studio.makeViewCamera(view, 1, 1.0);
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const size = box.getSize(new THREE.Vector3());
  const worldW = Math.abs(size.dot(right)) * 1.02 + 1e-6, worldH = Math.abs(size.dot(up)) * 1.02 + 1e-6;
  camera.left = -worldW / 2; camera.right = worldW / 2; camera.top = worldH / 2; camera.bottom = -worldH / 2;
  camera.updateProjectionMatrix();

  const maxPx = Math.min(renderer.capabilities.maxTextureSize, studio.isSmallDevice ? 3072 : 4096);
  const pxPerM = maxPx / Math.max(worldW, worldH);
  const W = Math.round(worldW * pxPerM), H = Math.round(worldH * pxPerM);
  const mmPerPx = 1000 / pxPerM;

  onStatus?.('Silhouet rasteren…');
  await new Promise((r) => setTimeout(r, 30));
  const mask = renderOverride(studio, camera, W, H, maskMaterial, 4, 0x000000);
  const cov = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cov[(H - 1 - y) * W + x] = mask[(y * W + x) * 4] / 255;

  onStatus?.('Contour traceren…');
  await new Promise((r) => setTimeout(r, 0));
  const loops = traceContours(cov, W, H).map((l) => simplify(l, 0.35));
  const n1 = (x) => (Math.round(x * 10) / 10).toString();
  const toMM = (x) => n1(x * mmPerPx);
  // rasterpunt i ligt op pixelmidden i + 0,5
  const c = (x) => toMM(x + 0.5);
  const silhouettePath = loops.map((l) => {
    let d = `M${c(l[0])} ${c(l[1])}`;
    for (let i = 2; i < l.length; i += 2) d += `L${c(l[i])} ${c(l[i + 1])}`;
    return `${d}Z`;
  }).join('');

  let edgePath = '', edgeCount = 0;
  if (detail !== 'silhouette') {
    const threshold = detail === 'all' ? 25 : 40;
    const meshes = studio.visibleMeshes().filter((m) => detail === 'all' || !isDetailPart(m.name));
    onStatus?.('Kenmerkende randen berekenen…');
    await studio.edges.ensure(meshes, threshold, (p) => onStatus?.(`Kenmerkende randen berekenen… ${Math.round(p * 100)}%`));
    onStatus?.('Zichtbaarheid bepalen…');
    await new Promise((r) => setTimeout(r, 0));
    const depthPx = renderOverride(studio, camera, W, H, depthMaterial, 0, 0xffffff);
    const depth = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      depth[(H - 1 - y) * W + x] = (depthPx[i] * 65536 + depthPx[i + 1] * 256 + depthPx[i + 2]) / 16777215;
    }
    const tol = 0.02 / (camera.far - camera.near); // 2 cm
    const farthest = (x, y) => {
      let m = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H) m = Math.max(m, depth[yy * W + xx]);
      }
      return m;
    };
    const p = new THREE.Vector3(), q = new THREE.Vector3();
    const parts = [];
    for (const mesh of meshes) {
      const seg = studio.edges.get(mesh, threshold);
      const mw = mesh.matrixWorld;
      for (let i = 0; i < seg.length; i += 6) {
        p.set(seg[i], seg[i + 1], seg[i + 2]).applyMatrix4(mw).project(camera);
        q.set(seg[i + 3], seg[i + 4], seg[i + 5]).applyMatrix4(mw).project(camera);
        const x1 = (p.x * 0.5 + 0.5) * W, y1 = (-p.y * 0.5 + 0.5) * H, d1 = p.z * 0.5 + 0.5;
        const x2 = (q.x * 0.5 + 0.5) * W, y2 = (-q.y * 0.5 + 0.5) * H, d2 = q.z * 0.5 + 0.5;
        const len = Math.hypot(x2 - x1, y2 - y1);
        if (len < 0.4) continue; // loodrecht op het beeldvlak of te klein om te tekenen
        const steps = Math.max(2, Math.ceil(len / 0.75));
        let runStart = -1;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, d = d1 + (d2 - d1) * t;
          const visible = d <= farthest(Math.floor(x), Math.floor(y)) + tol;
          if (visible && runStart < 0) runStart = t;
          if ((!visible || s === steps) && runStart >= 0) {
            const tEnd = visible ? t : (s - 1) / steps;
            if (tEnd > runStart) {
              parts.push(`M${toMM(x1 + (x2 - x1) * runStart)} ${toMM(y1 + (y2 - y1) * runStart)}L${toMM(x1 + (x2 - x1) * tEnd)} ${toMM(y1 + (y2 - y1) * tEnd)}`);
              edgeCount++;
            }
            runStart = -1;
          }
        }
      }
    }
    edgePath = parts.join('');
  }

  // Maatlijnen in mm (tekenvlak-coördinaten).
  const realW = W * mmPerPx, realH = H * mmPerPx;
  const boxes = studio.boxes();
  const toDraw = (vec) => { const c = vec.clone().project(camera); return [(c.x * 0.5 + 0.5) * realW, (-c.y * 0.5 + 0.5) * realH]; };
  const rect = (b) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < 8; i++) {
      const [x, y] = toDraw(new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return { x0, x1, y0, y1 };
  };
  const sw = (mmOnPaper) => n1(mmOnPaper * scale);
  const fs = 3.2 * scale, offs = 9 * scale;
  const dims = [];
  const all = rect(boxes.all);
  const axisH = Math.abs(right.x) > 0.5 ? 'x' : Math.abs(right.y) > 0.5 ? 'y' : 'z';
  const axisV = Math.abs(up.x) > 0.5 ? 'x' : Math.abs(up.y) > 0.5 ? 'y' : 'z';
  const hDims = [[boxes.all, 'over alles']];
  if (axisH === 'z') hDims.unshift([boxes.hull, 'romp']);
  hDims.forEach(([b, name], i) => {
    const r = rect(b), y = all.y1 + offs * (i + 1);
    const val = fmtMeters(b.max[axisH] - b.min[axisH]);
    dims.push(`<path d="M${n1(r.x0)} ${n1(r.y1 + 2 * scale)}V${n1(y + 2 * scale)}M${n1(r.x1)} ${n1(r.y1 + 2 * scale)}V${n1(y + 2 * scale)}M${n1(r.x0)} ${n1(y)}H${n1(r.x1)}"/>`);
    dims.push(`<text x="${n1((r.x0 + r.x1) / 2)}" y="${n1(y - 1.2 * scale)}">${val} · ${name} (meshmeting)</text>`);
  });
  {
    const b = boxes.all, r = rect(b), x = all.x1 + offs;
    const val = fmtMeters(b.max[axisV] - b.min[axisV]);
    const name = axisV === 'y' ? 'hoogte' : axisV === 'x' ? 'breedte' : 'lengte';
    dims.push(`<path d="M${n1(r.x1 + 2 * scale)} ${n1(r.y0)}H${n1(x + 2 * scale)}M${n1(r.x1 + 2 * scale)} ${n1(r.y1)}H${n1(x + 2 * scale)}M${n1(x)} ${n1(r.y0)}V${n1(r.y1)}"/>`);
    dims.push(`<text transform="translate(${n1(x - 1.2 * scale)} ${n1((r.y0 + r.y1) / 2)}) rotate(-90)">${val} · ${name} (meshmeting)</text>`);
  }

  const padR = offs * 2.4, padB = offs * (hDims.length + 1) + fs * 6;
  const vbW = realW + padR, vbH = realH + padB;
  const note = [
    `Sunsation 32CCX · ${v.name} · ${studio.engineName()}${studio.showHardtop ? '' : ' · zonder hardtop'}`,
    `Silhouet: rastertracering van de bronmesh, ${n1(mmPerPx)} mm per pixel (nauwkeurigheid ca. ±${n1(mmPerPx)} mm). Contouren: echte meshranden${detail === 'all' ? ' (vouwhoek > 25°)' : ' (vouwhoek > 40°)'}, zichtbaarheid per pixel bepaald.`,
    'Schaal aangenomen 1 mesh-eenheid = 1 cm, niet fabrieksmatig geverifieerd. Geen productietekening of gecertificeerde DXF.',
  ];
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="${n1(vbW / scale)}mm" height="${n1(vbH / scale)}mm" viewBox="0 0 ${n1(vbW)} ${n1(vbH)}">
  <title>Sunsation 32CCX — ${v.name} (referentie uit mesh)</title>
  <desc>${note.join(' ')} Gegenereerd ${stamp()}. viewBox-eenheden zijn millimeters op ware grootte; tekenschaal 1:${scale}.</desc>
  <g id="silhouet" inkscape:groupmode="layer" inkscape:label="Silhouet" fill="#eef2f5" fill-rule="evenodd" stroke="#14212f" stroke-width="${sw(0.35)}" stroke-linejoin="round">
    <path d="${silhouettePath}"/>
  </g>
  <g id="contouren" inkscape:groupmode="layer" inkscape:label="Contouren (meshranden)" fill="none" stroke="#14212f" stroke-width="${sw(0.13)}" stroke-linecap="round">
    ${edgePath ? `<path d="${edgePath}"/>` : ''}
  </g>
  <g id="maatlijnen" inkscape:groupmode="layer" inkscape:label="Maatlijnen (meshmeting)" fill="none" stroke="#c0313d" stroke-width="${sw(0.15)}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="${n1(fs)}">
    ${dims.join('\n    ').replace(/<text/g, '<text fill="#c0313d" stroke="none" text-anchor="middle"')}
  </g>
  <g id="titel" inkscape:groupmode="layer" inkscape:label="Titel" font-family="Inter, Helvetica, Arial, sans-serif" fill="#14212f">
    ${note.map((t, i) => `<text x="0" y="${n1(realH + offs * (hDims.length + 1) + fs * (1.6 + i * 1.5))}" font-size="${n1(i ? fs * 0.75 : fs)}" font-weight="${i ? 400 : 700}">${t}</text>`).join('\n    ')}
  </g>
</svg>
`;
  download(new Blob([svg], { type: 'image/svg+xml' }), `Sunsation_32CCX_${view}_${detail}_1-${scale}_${stamp()}.svg`);
  return { loops: loops.length, edges: edgeCount, mmPerPx };
}
