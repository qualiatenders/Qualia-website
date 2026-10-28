// Camera-aanzichten en framing. Assen van de bronmesh: +Y omhoog, +Z boeg, −Z spiegel/motoren, X breedte.
import * as THREE from 'three';

export const VIEWS = {
  iso:   { label: 'PERSPECTIEF', name: '3D-perspectief', ortho: false, dir: new THREE.Vector3(-0.60, 0.41, 0.69).normalize(), up: new THREE.Vector3(0, 1, 0) },
  top:   { label: 'ORTHOGRAFISCH · BOVEN', name: 'bovenaanzicht', ortho: true, dir: new THREE.Vector3(0, 1, 0), up: new THREE.Vector3(1, 0, 0), upPortrait: new THREE.Vector3(0, 0, 1) },
  side:  { label: 'ORTHOGRAFISCH · ZIJ', name: 'zijaanzicht', ortho: true, dir: new THREE.Vector3(-1, 0, 0), up: new THREE.Vector3(0, 1, 0) },
  bow:   { label: 'ORTHOGRAFISCH · VOOR', name: 'vooraanzicht', ortho: true, dir: new THREE.Vector3(0, 0, 1), up: new THREE.Vector3(0, 1, 0) },
  stern: { label: 'ORTHOGRAFISCH · ACHTER', name: 'achteraanzicht', ortho: true, dir: new THREE.Vector3(0, 0, -1), up: new THREE.Vector3(0, 1, 0) },
};

export const PERSPECTIVE_FOV = 34;

// Bovenaanzicht ligt horizontaal (boeg rechts); op een staand scherm staat de boeg boven.
export function viewUp(view, aspect) {
  const v = VIEWS[view];
  return (aspect < 0.9 && v.upPortrait ? v.upPortrait : v.up).clone();
}

// Basisvectoren (rechts, boven) van het beeldvlak voor een kijkrichting.
function basis(dir, up) {
  const forward = dir.clone().negate();
  const right = new THREE.Vector3().crossVectors(forward, up).normalize();
  const trueUp = new THREE.Vector3().crossVectors(right, forward).normalize();
  return { right, up: trueUp };
}

function boxCorners(box) {
  const { min, max } = box;
  const out = [];
  for (let i = 0; i < 8; i++) out.push(new THREE.Vector3(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z));
  return out;
}

// Breedte/hoogte van een box in het beeldvlak, plus het midden in wereldcoördinaten.
export function projectedExtent(box, dir, up) {
  const b = basis(dir, up);
  let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
  for (const c of boxCorners(box)) {
    const r = c.dot(b.right), u = c.dot(b.up);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minU = Math.min(minU, u); maxU = Math.max(maxU, u);
  }
  return { width: maxR - minR, height: maxU - minU, center: box.getCenter(new THREE.Vector3()) };
}

// Zet een orthografische camera recht op het aanzicht, passend om `box`.
export function frameOrtho(camera, view, box, aspect, margin) {
  const up = viewUp(view, aspect);
  const dir = VIEWS[view].dir;
  const ext = projectedExtent(box, dir, up);
  const radius = box.getSize(new THREE.Vector3()).length();
  const halfH = Math.max(ext.height / 2, ext.width / 2 / aspect) * margin;
  camera.left = -halfH * aspect; camera.right = halfH * aspect;
  camera.top = halfH; camera.bottom = -halfH;
  camera.near = 0.01; camera.far = radius * 4;
  camera.zoom = 1;
  camera.up.copy(up);
  camera.position.copy(ext.center).addScaledVector(dir, radius * 2);
  camera.lookAt(ext.center);
  camera.updateProjectionMatrix();
  camera.userData.halfHeight = halfH;
  return ext.center;
}

export function framePerspective(camera, box, aspect, dir = VIEWS.iso.dir) {
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const fov = Math.min(vfov, hfov);
  const distance = sphere.radius / Math.sin(fov / 2) * 0.92;
  camera.up.set(0, 1, 0);
  camera.position.copy(sphere.center).addScaledVector(dir, distance);
  camera.near = Math.max(0.02, distance / 400);
  camera.far = distance * 20;
  camera.aspect = aspect;
  camera.lookAt(sphere.center);
  camera.updateProjectionMatrix();
  return sphere.center.clone();
}

// Kijkt de camera (nog) recht langs een van de hoofdassen van het aanzicht?
export function isAxisAligned(camera, view) {
  if (!VIEWS[view]?.ortho) return false;
  const look = new THREE.Vector3();
  camera.getWorldDirection(look);
  return look.dot(VIEWS[view].dir) < -0.99995;
}
