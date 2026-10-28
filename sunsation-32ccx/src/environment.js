// Studio-omgeving voor reflecties: donkere ruimte met een paar grote softboxen.
// Contrastrijker dan RoomEnvironment, zodat donkere lakken diep blijven en
// wit gelcoat heldere, strakke reflecties krijgt.
import * as THREE from 'three';

export function studioEnvironment(renderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x0e141b);

  const shell = new THREE.Mesh(new THREE.BoxGeometry(40, 20, 40), new THREE.MeshBasicMaterial({ color: 0x1b232c, side: THREE.BackSide }));
  shell.position.y = 6;
  room.add(shell);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x0b0f14 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.9;
  room.add(floor);

  const box = (w, h, intensity, pos, look, tint = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos);
    m.lookAt(...look);
    room.add(m);
  };
  box(16, 9, 4.2, [0, 15.5, 0], [0, 0, 0]);                 // grote bovenlichtbak
  box(3, 14, 3.2, [-17, 6, 6], [0, 2, 0]);                   // striplight links
  box(3, 14, 2.6, [17, 6, -6], [0, 2, 0], 0xe4eeff);         // striplight rechts, iets koeler
  box(18, 4, 1.4, [0, 4, 19], [0, 2, 0]);                    // zachte front-fill
  box(18, 4, 0.9, [0, 4, -19], [0, 2, 0], 0xdfe9ff);         // achter
  box(40, 1.2, 1.2, [0, 0.5, 19.9], [0, 0.5, 0]);            // horizonlijn
  box(40, 1.2, 1.2, [0, 0.5, -19.9], [0, 0.5, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(room, 0.03).texture;
  pmrem.dispose();
  return texture;
}
