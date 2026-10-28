// Sunsation 32CCX Studio — Three.js-viewer voor model/32CCX_Production.glb.
// De GLB wordt ongewijzigd geladen; alleen de scène wordt geschaald (0,01: bron ≈ cm → m).
// Deze schaal volgt de oorspronkelijke viewer en is niet fabrieksmatig geverifieerd.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MaterialSystem, ZONES } from './materials.js';
import { studioEnvironment } from './environment.js';
import { VIEWS, PERSPECTIVE_FOV, frameOrtho, framePerspective, isAxisAligned } from './views.js';
import { meshBox, drawDimensions, measurementRows } from './dimensions.js';
import { EdgeCache, isDetailPart } from './edges.js';
import { exportPNG, exportSVG } from './export.js';

const MODEL_URL = './model/32CCX_Production.glb';
const SOURCE_SCALE = 0.01;
const ENGINES = {
  '300_black': '300 pk · zwart', '400_black': '400 pk · zwart', '500_black': '500 pk · zwart',
  '300_white': '300 pk · wit', '400_white': '400 pk · wit', '500_white': '500 pk · wit', none: 'zonder motoren',
};
const LINE_THRESHOLD = 40;

const $ = (id) => document.getElementById(id);
const canvas = $('viewerCanvas');
const overlay = $('overlayCanvas');
const viewport = $('viewport');
const isSmallDevice = Math.min(screen.width, screen.height) < 820 && matchMedia('(pointer: coarse)').matches;

const state = {
  engine: '400_black', hardtop: true, dims: true, lines: false, shadow: true,
  view: 'iso', free: false,
};

// ---------- Renderer & scène ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  fail('WebGL2 wordt niet ondersteund of is uitgeschakeld in deze browser. Gebruik een recente Safari, Chrome of Edge.');
  throw e;
}
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallDevice ? 2 : 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;

const scene = new THREE.Scene();
scene.environment = studioEnvironment(renderer);
scene.environmentIntensity = 1.25;

const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.castShadow = true;
key.shadow.mapSize.set(isSmallDevice ? 1024 : 2048, isSmallDevice ? 1024 : 2048);
key.shadow.radius = 5;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.02;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xcfe0ff, 0.55);
scene.add(rim, rim.target);
// zacht vullicht vanaf de camera, zodat ook de orthografische aanzichten egaal belicht zijn
const headlight = new THREE.DirectionalLight(0xffffff, 0.7);
scene.add(headlight, headlight.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.32 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const perspCam = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, 1, 0.05, 300);
const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
let camera = perspCam;
const controls = new OrbitControls(camera, canvas);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.09, rotateSpeed: 0.75, panSpeed: 0.9, zoomSpeed: 1.1, screenSpacePanning: true, minDistance: 3, maxDistance: 60, minZoom: 0.35, maxZoom: 14 });
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

const root = new THREE.Group();
root.scale.setScalar(SOURCE_SCALE);
scene.add(root);

const materials = new MaterialSystem();
const edges = new EdgeCache();
const meshes = [];
let hullMeshes = [], hullShellMeshes = [];
const lineObjects = new Map(); // mesh -> LineSegments
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x17222e });
const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf6f8fa, emissive: 0xf6f8fa, emissiveIntensity: 0.45, roughness: 1, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
let loaded = false, dirty = true;

// ---------- Zichtbaarheid & maten ----------
function isVisiblePart(name) {
  if (name.startsWith('engine_')) return state.engine !== 'none' && name.startsWith(`engine_${state.engine}_`);
  if (name.startsWith('Hardtop_')) return state.hardtop;
  return true;
}
const visibleMeshes = () => meshes.filter((m) => m.visible);

let cachedBoxes = null;
function boxes() {
  if (!cachedBoxes) {
    const vis = visibleMeshes();
    const engine = vis.filter((m) => m.name.startsWith('engine_'));
    cachedBoxes = { all: meshBox(vis), hull: meshBox(hullMeshes), hullShell: meshBox(hullShellMeshes), engine: engine.length ? meshBox(engine) : null };
  }
  return cachedBoxes;
}

function applyVisibility() {
  for (const m of meshes) m.visible = isVisiblePart(m.name);
  cachedBoxes = null;
  const b = boxes();
  const c = b.all.getCenter(new THREE.Vector3()), s = b.all.getSize(new THREE.Vector3());
  ground.position.set(c.x, b.all.min.y - 0.002, c.z);
  // schaduwcamera strak rond het model
  key.position.set(c.x - 3, c.y + 14, c.z + 3);
  key.target.position.copy(c);
  const r = s.length() * 0.62;
  Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 40 });
  key.shadow.camera.updateProjectionMatrix();
  rim.position.set(c.x + 8, c.y + 4, c.z - 9);
  rim.target.position.copy(c);
  renderer.shadowMap.needsUpdate = true;
  updateMeasurements();
  updateEngineLabel();
  if (state.lines) ensureLines();
  if (VIEWS[state.view].ortho && !state.free) setView(state.view);
  requestRender();
}

function updateMeasurements() {
  const b = boxes();
  const triangles = visibleMeshes().reduce((n, m) => n + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);
  const rows = measurementRows({ hull: b.hull, hullShell: b.hullShell, all: b.all, engine: b.engine, triangles });
  $('measureList').innerHTML = rows.map((r) => `<div><dt>${r.label}</dt><dd>${r.value}${r.cm ? `<small>${r.cm}</small>` : ''}</dd></div>`).join('');
  $('helpText').textContent = `${visibleMeshes().length} mesh-onderdelen · ${triangles.toLocaleString('nl-NL')} driehoeken`;
}
function updateEngineLabel() {
  $('engineLabel').textContent = ENGINES[state.engine].toUpperCase() + (state.hardtop ? '' : ' · ZONDER HARDTOP');
}

// ---------- Camera ----------
function aspect() { return Math.max(1, canvas.clientWidth) / Math.max(1, canvas.clientHeight); }

// Ruimte (px) die de UI-lagen over het canvas innemen; het model wordt daarbinnen gekaderd.
function insets() {
  const small = canvas.clientWidth < 700;
  const dims = state.dims && VIEWS[state.view].ortho;
  return { top: small ? 86 : 120, bottom: (small ? 92 : 128) + (dims ? 70 : 0), left: 24, right: 24 + (dims ? 64 : 0) };
}

function setView(view) {
  if (!loaded) return;
  state.view = view;
  state.free = false;
  const box = boxes().all;
  const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
  let target;
  if (VIEWS[view].ortho) {
    const ins = insets();
    const innerW = Math.max(80, w - ins.left - ins.right), innerH = Math.max(80, h - ins.top - ins.bottom);
    target = frameOrtho(orthoCam, view, box, innerW / innerH, 1.0);
    // frustum uitbreiden van het binnenkader naar het hele canvas en het model in het binnenkader zetten
    const worldPerPx = (orthoCam.top - orthoCam.bottom) / innerH;
    const halfH = (h / 2) * worldPerPx;
    Object.assign(orthoCam, { top: halfH, bottom: -halfH, left: -halfH * aspect(), right: halfH * aspect() });
    orthoCam.userData.halfHeight = halfH;
    orthoCam.updateProjectionMatrix();
    const right = new THREE.Vector3().setFromMatrixColumn(orthoCam.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(orthoCam.matrixWorld, 1);
    const shiftX = ((ins.right - ins.left) / 2) * worldPerPx, shiftY = ((ins.top - ins.bottom) / 2) * worldPerPx;
    const shift = right.multiplyScalar(shiftX).addScaledVector(up, shiftY);
    target = target.clone().add(shift);
    orthoCam.position.add(shift);
    camera = orthoCam;
  } else {
    target = framePerspective(perspCam, box, aspect());
    camera = perspCam;
  }
  controls.object = camera;
  controls.target.copy(target);
  controls.minDistance = 2.5;
  controls.maxDistance = box.getSize(new THREE.Vector3()).length() * 4;
  controls.update();
  document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  updateViewTag();
  saveHash();
  requestRender();
}

function updateViewTag() {
  const label = VIEWS[state.view].label;
  if (camera.isOrthographicCamera) $('viewTag').textContent = isAxisAligned(camera, state.view) ? label : 'ORTHOGRAFISCH · VRIJ';
  else $('viewTag').textContent = state.free ? 'PERSPECTIEF · VRIJ' : label;
}

// Aanzicht waarin de camera nu exact staat (voor maatlijnen en export), anders null.
function alignedView() {
  if (camera.isOrthographicCamera && isAxisAligned(camera, state.view)) return state.view;
  return null;
}

function cloneCurrentCamera(targetAspect) {
  const cam = camera.clone();
  const a = aspect();
  if (cam.isPerspectiveCamera) {
    if (targetAspect < a) cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * a / targetAspect));
    cam.aspect = targetAspect;
  } else {
    const cx = (cam.left + cam.right) / 2, cy = (cam.top + cam.bottom) / 2;
    let halfH = (cam.top - cam.bottom) / 2;
    if (targetAspect < a) halfH *= a / targetAspect;
    Object.assign(cam, { left: cx - halfH * targetAspect, right: cx + halfH * targetAspect, top: cy + halfH, bottom: cy - halfH });
  }
  cam.updateProjectionMatrix();
  return cam;
}

function makeViewCamera(view, targetAspect, margin = state.dims ? 1.32 : 1.1) {
  const box = boxes().all;
  if (VIEWS[view].ortho) {
    const cam = new THREE.OrthographicCamera();
    frameOrtho(cam, view, box, targetAspect, margin);
    cam.updateMatrixWorld();
    return cam;
  }
  const cam = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, targetAspect);
  framePerspective(cam, box, targetAspect);
  cam.updateMatrixWorld();
  return cam;
}

function resize() {
  const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
  renderer.setSize(w, h, false);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr);
  perspCam.aspect = w / h; perspCam.updateProjectionMatrix();
  if (camera.isOrthographicCamera) {
    const halfH = orthoCam.userData.halfHeight || 1;
    const cx = (orthoCam.left + orthoCam.right) / 2;
    Object.assign(orthoCam, { left: cx - halfH * w / h, right: cx + halfH * w / h });
    orthoCam.updateProjectionMatrix();
  }
  if (loaded && !state.free) setView(state.view);
  requestRender();
}

// ---------- Render ----------
function requestRender() { dirty = true; }

function aimHeadlight(cam) {
  headlight.position.copy(cam.position);
  headlight.target.position.copy(cam.position).add(cam.getWorldDirection(new THREE.Vector3()));
}

function render() {
  aimHeadlight(camera);
  renderer.render(scene, camera);
  drawOverlay();
}

function drawOverlay() {
  const ctx = overlay.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  const view = alignedView();
  if (!loaded || !state.dims || !view) return;
  const dpr = overlay.width / Math.max(1, canvas.clientWidth);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawDimensions(ctx, { camera, view, w: canvas.clientWidth, h: canvas.clientHeight, boxes: boxes(), light: state.lines });
}

function loop() {
  requestAnimationFrame(loop);
  if (!loaded) return;
  if (controls.update() || dirty) { dirty = false; render(); }
}

controls.addEventListener('change', () => { updateViewTag(); requestRender(); });
controls.addEventListener('start', () => { state.free = true; canvas.focus({ preventScroll: true }); });

// ---------- Lijntekening ----------
async function ensureLines() {
  const targets = visibleMeshes().filter((m) => !isDetailPart(m.name) && !lineObjects.has(m));
  if (targets.length) {
    busy('Contouren uit de mesh berekenen…');
    await edges.ensure(targets, LINE_THRESHOLD, (p) => busy(`Contouren uit de mesh berekenen… ${Math.round(p * 100)}%`));
    for (const m of targets) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(edges.get(m, LINE_THRESHOLD), 3));
      const lines = new THREE.LineSegments(g, lineMaterial);
      lines.matrixAutoUpdate = false;
      m.add(lines);
      lineObjects.set(m, lines);
    }
    busy(null);
  }
  for (const [, l] of lineObjects) l.visible = state.lines;
  requestRender();
}

function setLines(on) {
  state.lines = on;
  $('linesToggle').checked = on;
  viewport.classList.toggle('mode-lines', on);
  for (const m of meshes) {
    m.material = on ? paperMaterial : m.userData.studioMaterial;
  }
  if (on) ensureLines(); else for (const [, l] of lineObjects) l.visible = false;
  requestRender();
}

// Tijdelijk alleen de modelmeshes renderen (voor SVG-maskers).
function isolateMeshes() {
  const hidden = [ground, ...lineObjects.values()].filter((o) => o.visible);
  hidden.forEach((o) => (o.visible = false));
  return () => hidden.forEach((o) => (o.visible = true));
}

// ---------- Laden ----------
async function load() {
  if (location.protocol === 'file:') throw new Error('Dit bestand is direct geopend (file://). Browsers blokkeren dan het laden van het model; start een lokale webserver, zie README.md.');
  $('loadTitle').textContent = 'Originele 3D-geometrie laden…';
  const loader = new GLTFLoader();
  const gltf = await new Promise((resolve, reject) => {
    loader.load(MODEL_URL, resolve, (e) => {
      if (!e.total) return;
      $('loadFill').style.width = `${Math.round((e.loaded / e.total) * 92)}%`;
      $('loadDetail').textContent = `Bestand ophalen: ${(e.loaded / 1048576).toFixed(1)} / ${(e.total / 1048576).toFixed(1)} MB`;
    }, (err) => reject(new Error(err?.message?.includes('404') || err?.target?.status === 404
      ? 'Model niet gevonden: zet 32CCX_Production.glb in de map model/.'
      : `Model kon niet worden geladen: ${err?.message || err}`)));
  });
  $('loadTitle').textContent = 'Mesh voorbereiden…';
  $('loadFill').style.width = '96%';
  await new Promise((r) => setTimeout(r, 20));

  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.sourceMaterial = o.material.name;
    o.geometry.deleteAttribute('uv'); // geen textures; scheelt GPU-geheugen, posities blijven gelijk
    o.castShadow = true;
    o.receiveShadow = true;
    materials.assign(o);
    meshes.push(o);
  });
  root.add(gltf.scene);
  root.updateMatrixWorld(true);
  hullMeshes = meshes.filter((m) => m.name.startsWith('Boat_Hull_') || m.name.startsWith('Rubber_Rail'));
  hullShellMeshes = meshes.filter((m) => /^(Boat_Hull_Hull_Hull|Boat_Hull_Deck_Deck|Rubber_Rail)/.test(m.name));

  for (const z of ZONES) materials.set(z.id, materials.state[z.id]);
  readHash();
  loaded = true;
  syncControls();
  applyVisibility();
  buildColorUI();
  setView(state.view);
  if (state.lines) setLines(true);
  renderer.compile(scene, camera);
  $('loading').classList.add('hidden');
  const badge = $('statusBadge');
  badge.className = 'status status-ready';
  badge.innerHTML = '<i></i> MODEL GELADEN';
  requestRender();
}

function fail(message) {
  $('loading').classList.add('hidden');
  $('errorBox').classList.remove('hidden');
  $('errorText').textContent = message;
  const badge = $('statusBadge');
  badge.className = 'status status-error';
  badge.innerHTML = '<i></i> FOUT';
}

// ---------- UI ----------
function buildColorUI() {
  $('colorZones').innerHTML = ZONES.map((z) => `
    <div class="zone" data-zone="${z.id}">
      <div class="zone-head"><span>${z.label}</span><em>${z.options.find((o) => o.id === materials.state[z.id]).label}</em></div>
      <div class="swatches" role="group" aria-label="${z.label}">
        ${z.options.map((o) => `<button type="button" class="swatch" data-option="${o.id}" title="${o.label}" aria-label="${z.label}: ${o.label}" aria-pressed="${o.id === materials.state[z.id]}" style="background:${o.hex}"></button>`).join('')}
      </div>
    </div>`).join('');
  $('colorZones').addEventListener('click', (e) => {
    const btn = e.target.closest('.swatch');
    if (!btn) return;
    const zoneEl = btn.closest('.zone'), zone = ZONES.find((z) => z.id === zoneEl.dataset.zone);
    materials.set(zone.id, btn.dataset.option);
    zoneEl.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-pressed', s === btn));
    zoneEl.querySelector('em').textContent = btn.title;
    if (state.lines) setLines(false);
    saveHash();
    requestRender();
  });
}

function syncControls() {
  $('engineSelect').value = state.engine;
  $('hardtopToggle').checked = state.hardtop;
  $('dimsToggle').checked = state.dims;
  $('linesToggle').checked = state.lines;
  $('shadowToggle').checked = state.shadow;
  ground.visible = state.shadow;
}

function setEngine(v) { state.engine = v; $('engineSelect').value = v; applyVisibility(); saveHash(); }
function setHardtop(on) { state.hardtop = on; $('hardtopToggle').checked = on; applyVisibility(); saveHash(); }
function setDims(on) { state.dims = on; $('dimsToggle').checked = on; if (!state.free) setView(state.view); saveHash(); requestRender(); }

$('engineSelect').addEventListener('change', (e) => setEngine(e.target.value));
$('hardtopToggle').addEventListener('change', (e) => setHardtop(e.target.checked));
$('dimsToggle').addEventListener('change', (e) => setDims(e.target.checked));
$('linesToggle').addEventListener('change', (e) => { setLines(e.target.checked); saveHash(); });
$('shadowToggle').addEventListener('change', (e) => { state.shadow = e.target.checked; ground.visible = state.shadow; saveHash(); requestRender(); });
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
$('resetButton').addEventListener('click', () => setView('iso'));
$('fullscreenButton').addEventListener('click', toggleFullscreen);
$('helpButton').addEventListener('click', () => toggleHelp(true));
$('helpDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget || e.target.closest('[data-close]')) toggleHelp(false); });
$('shareButton').addEventListener('click', async () => {
  saveHash();
  try { await navigator.clipboard.writeText(location.href); toast('Link met deze configuratie gekopieerd'); }
  catch { toast('Kopiëren lukt niet; neem de adresbalk over'); }
});

const studio = {
  renderer, scene, canvas, edges, isSmallDevice,
  get showDims() { return state.dims; },
  get linesMode() { return state.lines; },
  get showHardtop() { return state.hardtop; },
  requestRender, aimHeadlight, boxes, visibleMeshes, isolateMeshes, alignedView, cloneCurrentCamera, makeViewCamera,
  engineName: () => ENGINES[state.engine],
};

async function runExport(button, job) {
  if (!loaded || button.disabled) return;
  button.disabled = true;
  try { await job(); }
  catch (err) { console.error(err); toast(err.message || 'Export mislukt'); }
  finally { button.disabled = false; busy(null); }
}

$('pngButton').addEventListener('click', () => runExport($('pngButton'), async () => {
  let longSide = Number($('exportSize').value);
  if (isSmallDevice && longSide > 4096) { longSide = 4096; toast('Op dit apparaat maximaal 4096 px'); }
  busy('PNG renderen…');
  const r = await exportPNG(studio, { view: $('exportView').value, longSide, aspect: $('exportAspect').value, background: $('exportBg').value });
  toast(`PNG opgeslagen · ${r.W} × ${r.H} px`);
}));

$('svgButton').addEventListener('click', () => runExport($('svgButton'), async () => {
  busy('SVG voorbereiden…');
  const r = await exportSVG(studio, { view: $('svgView').value, detail: $('svgDetail').value, scale: Number($('svgScale').value) }, busy);
  toast(`SVG opgeslagen · ${r.loops} silhouetlijnen, ${r.edges.toLocaleString('nl-NL')} contoursegmenten · raster ${r.mmPerPx.toFixed(1)} mm`);
}));

// Volledig scherm: native API, met een CSS-variant voor iPhone (geen element-fullscreen).
function toggleFullscreen() {
  const native = viewport.requestFullscreen || viewport.webkitRequestFullscreen;
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  if (active) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else if (viewport.classList.contains('pseudo-fullscreen')) setPseudoFullscreen(false);
  else if (native) native.call(viewport).catch(() => setPseudoFullscreen(true));
  else setPseudoFullscreen(true);
}
function setPseudoFullscreen(on) {
  viewport.classList.toggle('pseudo-fullscreen', on);
  viewport.classList.toggle('is-fullscreen', on);
  document.body.style.overflow = on ? 'hidden' : '';
}
const onFsChange = () => viewport.classList.toggle('is-fullscreen', !!(document.fullscreenElement || document.webkitFullscreenElement));
document.addEventListener('fullscreenchange', onFsChange);
document.addEventListener('webkitfullscreenchange', onFsChange);

function toggleHelp(on) { $('helpDialog').classList.toggle('hidden', !on); if (on) $('helpDialog').querySelector('[data-close]').focus(); }

let busyTimer;
function busy(text) {
  clearTimeout(busyTimer);
  if (!text) { busyTimer = setTimeout(() => $('busy').classList.add('hidden'), 150); return; }
  $('busyText').textContent = text;
  $('busy').classList.remove('hidden');
}
let toastTimer;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3600);
}

// Toetsenbord
function orbit(dAzimuth, dPolar) {
  const offset = camera.position.clone().sub(controls.target);
  const sph = new THREE.Spherical().setFromVector3(offset);
  sph.theta += dAzimuth;
  sph.phi = THREE.MathUtils.clamp(sph.phi + dPolar, 0.02, Math.PI - 0.02);
  camera.up.set(0, 1, 0);
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
  camera.lookAt(controls.target);
  controls.update();
}
function zoom(f) {
  if (camera.isOrthographicCamera) { camera.zoom = THREE.MathUtils.clamp(camera.zoom * f, controls.minZoom, controls.maxZoom); camera.updateProjectionMatrix(); }
  else camera.position.sub(controls.target).multiplyScalar(1 / f).add(controls.target);
  controls.update();
  requestRender();
}
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (!$('helpDialog').classList.contains('hidden')) { if (e.key === 'Escape' || e.key === '?') toggleHelp(false); return; }
  const views = { 1: 'iso', 2: 'top', 3: 'side', 4: 'bow', 5: 'stern', 6: 'bottom', 7: 'side2' };
  const k = e.key.toLowerCase();
  if (views[e.key]) setView(views[e.key]);
  else if (k === 'r') setView('iso');
  else if (k === 'f') toggleFullscreen();
  else if (k === 'h') setHardtop(!state.hardtop);
  else if (k === 'm') setDims(!state.dims);
  else if (k === 'l') { setLines(!state.lines); saveHash(); }
  else if (k === 'e') { const list = Object.keys(ENGINES); setEngine(list[(list.indexOf(state.engine) + 1) % list.length]); }
  else if (k === 'p') $('pngButton').click();
  else if (e.key === '?') toggleHelp(true);
  else if (e.key === 'Escape' && viewport.classList.contains('pseudo-fullscreen')) setPseudoFullscreen(false);
  else if (e.key === 'ArrowLeft') orbit(-0.08, 0);
  else if (e.key === 'ArrowRight') orbit(0.08, 0);
  else if (e.key === 'ArrowUp') orbit(0, -0.06);
  else if (e.key === 'ArrowDown') orbit(0, 0.06);
  else if (e.key === '+' || e.key === '=') zoom(1.15);
  else if (e.key === '-' || e.key === '_') zoom(1 / 1.15);
  else return;
  e.preventDefault();
});

// ---------- Configuratie in de URL (#e=400_black&hull=navy…) ----------
function saveHash() {
  if (!loaded) return;
  const p = new URLSearchParams();
  p.set('e', state.engine);
  if (!state.hardtop) p.set('ht', '0');
  if (!state.dims) p.set('dims', '0');
  if (!state.shadow) p.set('sh', '0');
  if (state.lines) p.set('lines', '1');
  if (state.view !== 'iso') p.set('v', state.view);
  for (const z of ZONES) if (materials.state[z.id] !== z.default) p.set(z.id, materials.state[z.id]);
  history.replaceState(null, '', `#${p}`);
}
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (ENGINES[p.get('e')]) state.engine = p.get('e');
  state.hardtop = p.get('ht') !== '0';
  state.dims = p.get('dims') !== '0';
  state.shadow = p.get('sh') !== '0';
  state.lines = p.get('lines') === '1';
  if (VIEWS[p.get('v')]) state.view = p.get('v');
  for (const z of ZONES) if (p.get(z.id)) materials.set(z.id, p.get(z.id));
}

// ---------- Start ----------
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail('De grafische context is verloren gegaan (geheugen?). Herlaad de pagina.'); });
new ResizeObserver(resize).observe(viewport);
resize();
loop();
load().catch((err) => { console.error('32CCX viewer', err); fail(err.message || String(err)); });
