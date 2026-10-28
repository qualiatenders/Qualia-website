// Visualisatiematerialen. Het bronmodel bevat alleen effen basiskleuren
// (geen textures); alles hieronder is een weergave, geen fabrieksmateriaal.
// De geometrie wordt nergens aangeraakt: alleen mesh.material wordt vervangen.
import * as THREE from 'three';

const physical = (params) => new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, ...params });

// Basismaterialen per bronmateriaalnaam uit de GLB.
function baseLibrary() {
  return {
    white: physical({ color: 0xf1f4f5, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
    upholstery: physical({ color: 0xe6e5df, roughness: 0.62, sheen: 0.4, sheenRoughness: 0.6, sheenColor: 0xffffff }),
    engine_black: physical({ color: 0x15181c, roughness: 0.22, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 }),
    carbon: physical({ color: 0x23272d, roughness: 0.45, metalness: 0.25, clearcoat: 0.3, clearcoatRoughness: 0.3 }),
    interior_black: physical({ color: 0x0c0f12, roughness: 0.8 }),
    accent_red: physical({ color: 0xb8212b, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    metal_silver: physical({ color: 0xd9dee2, roughness: 0.16, metalness: 1 }),
    metal_mid: physical({ color: 0x8a9298, roughness: 0.38, metalness: 1 }),
    glass: physical({ color: 0x2c3e48, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false, envMapIntensity: 1.6, clearcoat: 1 }),
    floor_dark: physical({ color: 0x3a4148, roughness: 0.85 }),
    floor_medium: physical({ color: 0x59636b, roughness: 0.85 }),
    deck_teak: physical({ color: 0x7d878e, roughness: 0.8, sheen: 0.2 }),
    stitching: physical({ color: 0xd2d4d4, roughness: 0.7 }),
    light_white: physical({ color: 0xffffff, emissive: 0xe8f2ff, emissiveIntensity: 0.6, roughness: 0.3 }),
    light_red: physical({ color: 0xff3340, emissive: 0xff2030, emissiveIntensity: 0.8, roughness: 0.3 }),
  };
}

// Kleurzones voor de configurator. `match` bepaalt welke meshes bij de zone horen
// (op nodenaam en bronmateriaal); `apply` zet een optie op het zone-materiaal.
export const ZONES = [
  {
    id: 'hull', label: 'Romp', match: (n) => n === 'Boat_Hull_Hull_Hull_0',
    default: 'white',
    options: [
      { id: 'white', label: 'Wit', hex: '#f1f4f5' },
      { id: 'silver', label: 'Zilvergrijs', hex: '#9aa3a9', metallic: true },
      { id: 'charcoal', label: 'Antraciet', hex: '#3b434b' },
      { id: 'navy', label: 'Navy', hex: '#1d3350' },
      { id: 'red', label: 'Rood', hex: '#9e1d27' },
      { id: 'black', label: 'Zwart', hex: '#131619' },
    ],
  },
  {
    id: 'bottom', label: 'Onderwaterschip', match: (n) => n === 'Boat_Hull_Hull_Bottom_Color_0',
    default: 'white',
    options: [
      { id: 'white', label: 'Wit', hex: '#f1f4f5' },
      { id: 'charcoal', label: 'Antraciet', hex: '#3b434b' },
      { id: 'navy', label: 'Navy', hex: '#1d3350' },
      { id: 'black', label: 'Zwart', hex: '#131619' },
    ],
  },
  {
    id: 'hardtop', label: 'Hardtop', match: (n) => n.startsWith('Hardtop_Hardtop_Hardtop_Top') || n.startsWith('Hardtop_Hardtop_Hardtop_Bottom'),
    default: 'white',
    options: [
      { id: 'white', label: 'Wit', hex: '#f1f4f5' },
      { id: 'charcoal', label: 'Antraciet', hex: '#3b434b' },
      { id: 'navy', label: 'Navy', hex: '#1d3350' },
      { id: 'black', label: 'Zwart', hex: '#131619' },
    ],
  },
  {
    id: 'accent', label: 'Accenten & stiksel', default: 'red',
    match: (n, m) => m === 'accent_red' && !n.startsWith('engine_') && !n.includes('Red_Light'),
    options: [
      { id: 'red', label: 'Rood', hex: '#b8212b' },
      { id: 'navy', label: 'Navy', hex: '#22406a' },
      { id: 'charcoal', label: 'Antraciet', hex: '#3b434b' },
      { id: 'sand', label: 'Zand', hex: '#b9a27e' },
    ],
  },
  {
    id: 'upholstery', label: 'Bekleding', default: 'white',
    match: (n, m) => m === 'upholstery',
    options: [
      { id: 'white', label: 'Wit', hex: '#e6e5df' },
      { id: 'grey', label: 'Lichtgrijs', hex: '#b5b9bb' },
      { id: 'sand', label: 'Zand', hex: '#cbbb9f' },
      { id: 'charcoal', label: 'Antraciet', hex: '#3a3f44' },
    ],
  },
  {
    // Vloer bestaat uit drie lagen (top, middel, onder); elke optie kleurt alle drie.
    id: 'floor', label: 'Vloer', default: 'grey',
    match: (n, m) => m === 'deck_teak' || m === 'floor_medium' || m === 'floor_dark',
    layered: true,
    options: [
      { id: 'grey', label: 'Grijs', hex: '#7d878e', layers: { deck_teak: '#7d878e', floor_medium: '#59636b', floor_dark: '#3a4148' } },
      { id: 'teak', label: 'Teak-look', hex: '#a2764a', layers: { deck_teak: '#a2764a', floor_medium: '#7b5636', floor_dark: '#2d2620' } },
      { id: 'black', label: 'Zwart/grijs', hex: '#2b3035', layers: { deck_teak: '#2b3035', floor_medium: '#6a7379', floor_dark: '#1a1d20' } },
      { id: 'sand', label: 'Zand', hex: '#c7b28f', layers: { deck_teak: '#c7b28f', floor_medium: '#998566', floor_dark: '#4a4033' } },
    ],
  },
];

export class MaterialSystem {
  constructor() {
    this.lib = baseLibrary();
    this.zoneMaterials = new Map(); // zoneId -> Map(sourceMaterialName -> material)
    this.state = Object.fromEntries(ZONES.map((z) => [z.id, z.default]));
  }

  // Ken aan elke mesh een visualisatiemateriaal toe op basis van bronmateriaal + nodenaam.
  assign(mesh) {
    const name = mesh.name;
    const source = mesh.userData.sourceMaterial;
    const zone = ZONES.find((z) => z.match(name, source));
    if (zone) {
      if (!this.zoneMaterials.has(zone.id)) this.zoneMaterials.set(zone.id, new Map());
      const perSource = this.zoneMaterials.get(zone.id);
      if (!perSource.has(source)) perSource.set(source, (this.lib[source] || this.lib.white).clone());
      mesh.material = perSource.get(source);
      mesh.userData.zone = zone.id;
    } else if (name.includes('Lightbar') && source === 'white') {
      mesh.material = this.lib.light_white;
    } else if (name.includes('Red_Light')) {
      mesh.material = this.lib.light_red;
    } else {
      mesh.material = this.lib[source] || this.lib.white;
    }
    mesh.userData.studioMaterial = mesh.material;
  }

  set(zoneId, optionId) {
    const zone = ZONES.find((z) => z.id === zoneId);
    const option = zone?.options.find((o) => o.id === optionId);
    if (!option) return false;
    this.state[zoneId] = optionId;
    const perSource = this.zoneMaterials.get(zoneId);
    if (!perSource) return true;
    for (const [source, mat] of perSource) {
      const hex = zone.layered ? option.layers[source] : option.hex;
      mat.color.set(hex);
      if (zoneId === 'hull' || zoneId === 'hardtop' || zoneId === 'bottom') {
        // Metallic lak krijgt wat metaalglans; overige opties blijven gelcoat.
        mat.metalness = option.metallic ? 0.55 : 0;
        mat.roughness = option.metallic ? 0.28 : 0.32;
      }
      if (zone.id === 'floor') mat.roughness = optionId === 'teak' ? 0.7 : 0.85;
    }
    return true;
  }
}
