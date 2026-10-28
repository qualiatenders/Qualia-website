// Kenmerkende randen (feature edges) rechtstreeks uit de bronmesh:
// randen waar twee vlakken onder een hoek > drempel samenkomen, plus open randen.
// Vertices worden alleen voor de vergelijking samengevoegd (0,5 mm); de mesh zelf blijft onaangetast.
import * as THREE from 'three';

const WELD = 20; // 1 / 0,05 bron-eenheid  (≈ 0,5 mm bij 1 eenheid = 1 cm)

// Onderdelen die in "hoofdlijnen" weggelaten worden: stiksel, borduursel, stickers en inzetpatronen.
const DETAIL_PARTS = /Stitching|Stiching|Embrodiery|Embroidery|Graphics|logo|Insert_Color|Vinyl/i;
export const isDetailPart = (name) => DETAIL_PARTS.test(name);

function nextPow2(n) { let p = 1; while (p < n) p <<= 1; return p; }

export function featureEdges(geometry, thresholdDeg) {
  const pos = geometry.attributes.position.array;
  const vertexCount = geometry.attributes.position.count;
  const index = geometry.index ? geometry.index.array : null;
  const triCount = index ? index.length / 3 : vertexCount / 3;

  // 1. Vertices samenvoegen op gekwantiseerde positie (open adressering).
  const qx = new Int32Array(vertexCount), qy = new Int32Array(vertexCount), qz = new Int32Array(vertexCount);
  const weld = new Uint32Array(vertexCount);
  const vSize = nextPow2(vertexCount * 2), vMask = vSize - 1;
  const vTable = new Int32Array(vSize).fill(-1);
  for (let i = 0; i < vertexCount; i++) {
    const x = Math.round(pos[i * 3] * WELD), y = Math.round(pos[i * 3 + 1] * WELD), z = Math.round(pos[i * 3 + 2] * WELD);
    qx[i] = x; qy[i] = y; qz[i] = z;
    let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) & vMask;
    for (;;) {
      const j = vTable[h];
      if (j === -1) { vTable[h] = i; weld[i] = i; break; }
      if (qx[j] === x && qy[j] === y && qz[j] === z) { weld[i] = j; break; }
      h = (h + 1) & vMask;
    }
  }

  // 2. Vlaknormalen.
  const normals = new Float32Array(triCount * 3);
  const tri = new Uint32Array(triCount * 3);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    for (let k = 0; k < 3; k++) tri[t * 3 + k] = weld[index ? index[t * 3 + k] : t * 3 + k];
    const i0 = tri[t * 3], i1 = tri[t * 3 + 1], i2 = tri[t * 3 + 2];
    a.fromArray(pos, i0 * 3); b.fromArray(pos, i1 * 3); c.fromArray(pos, i2 * 3);
    b.sub(a); c.sub(a); b.cross(c);
    const len = b.length();
    if (len > 0) b.multiplyScalar(1 / len);
    normals[t * 3] = b.x; normals[t * 3 + 1] = b.y; normals[t * 3 + 2] = b.z;
  }

  // 3. Randen tellen; bij de tweede driehoek de vouwhoek bepalen.
  const eSize = nextPow2(triCount * 6), eMask = eSize - 1;
  const eLo = new Int32Array(eSize).fill(-1), eHi = new Int32Array(eSize), eTri = new Int32Array(eSize), eState = new Uint8Array(eSize);
  const cosLimit = Math.cos(THREE.MathUtils.degToRad(thresholdDeg));
  for (let t = 0; t < triCount; t++) {
    const v0 = tri[t * 3], v1 = tri[t * 3 + 1], v2 = tri[t * 3 + 2];
    if (v0 === v1 || v1 === v2 || v0 === v2) continue; // gedegenereerd
    for (let k = 0; k < 3; k++) {
      const p = k === 0 ? v0 : k === 1 ? v1 : v2, q = k === 0 ? v1 : k === 1 ? v2 : v0;
      const lo = p < q ? p : q, hi = p < q ? q : p;
      let h = (Math.imul(lo, 2654435761) ^ Math.imul(hi, 40503)) & eMask;
      for (;;) {
        if (eLo[h] === -1) { eLo[h] = lo; eHi[h] = hi; eTri[h] = t; eState[h] = 1; break; }
        if (eLo[h] === lo && eHi[h] === hi) {
          if (eState[h] === 1) {
            const s = eTri[h];
            const d = normals[s * 3] * normals[t * 3] + normals[s * 3 + 1] * normals[t * 3 + 1] + normals[s * 3 + 2] * normals[t * 3 + 2];
            // |d| zodat tegengesteld georiënteerde buren (dubbelzijdige vlakken) geen valse vouw geven
            eState[h] = Math.abs(d) < cosLimit ? 3 : 2;
          }
          break;
        }
        h = (h + 1) & eMask;
      }
    }
  }

  // 4. Uitvoer: open randen (1x gezien) en scherpe vouwen.
  let count = 0;
  for (let h = 0; h < eSize; h++) if (eState[h] === 1 || eState[h] === 3) count++;
  const out = new Float32Array(count * 6);
  let o = 0;
  for (let h = 0; h < eSize; h++) {
    const s = eState[h];
    if (s !== 1 && s !== 3) continue;
    const lo = eLo[h] * 3, hi = eHi[h] * 3;
    out[o++] = pos[lo]; out[o++] = pos[lo + 1]; out[o++] = pos[lo + 2];
    out[o++] = pos[hi]; out[o++] = pos[hi + 1]; out[o++] = pos[hi + 2];
  }
  return out;
}

// Cache per mesh en drempel; rekent in porties zodat de UI blijft reageren.
export class EdgeCache {
  constructor() { this.cache = new Map(); }

  get(mesh, thresholdDeg) {
    return this.cache.get(`${mesh.uuid}:${thresholdDeg}`);
  }

  async ensure(meshes, thresholdDeg, onProgress) {
    const todo = meshes.filter((m) => !this.get(m, thresholdDeg));
    let done = 0;
    for (const mesh of todo) {
      this.cache.set(`${mesh.uuid}:${thresholdDeg}`, featureEdges(mesh.geometry, thresholdDeg));
      done++;
      onProgress?.(done / todo.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}
