/* =========================================================
   TEESZ — the 3D chrome star-T.
   One star lives on top of the whole page and travels between
   sections as you scroll, changing finish and size per section.
   In the "Play" section you can grab it and spin it.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('star3d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  canvas.remove(); // no WebGL — the site still works without the star
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.z = 12;

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(3, 4, 6);
const rim = new THREE.PointLight(0xff2d8a, 0, 0, 2);
rim.position.set(-3, -1, 3);
scene.add(key, rim);

/* --- geometry: same outline as the logo SVG (viewBox 300×240) --- */
const STAR = [[128, 20], [150, 80], [238, 56], [222, 74], [284, 48], [192, 112], [160, 190], [112, 152], [38, 214], [70, 138], [22, 128], [92, 100]];
const T = [[90, 96], [178, 82], [172, 106], [140, 110], [120, 184], [96, 186], [114, 114], [84, 118]];
const shape = (pts) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => {
    const X = (x - 153) / 100, Y = -(y - 117) / 100;
    i ? s.lineTo(X, Y) : s.moveTo(X, Y);
  });
  s.closePath();
  return s;
};
const STAR_H = 1.94; // world height of the star at scale 1

const starGeo = new THREE.ExtrudeGeometry(shape(STAR), { depth: 0.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05, bevelSegments: 6 });
starGeo.translate(0, 0, -0.17);
const tGeo = new THREE.ExtrudeGeometry(shape(T), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 4 });

const starMat = new THREE.MeshPhysicalMaterial({ color: 0x7a0b1d, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
const tMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, clearcoat: 1 });

const star = new THREE.Group();
star.add(new THREE.Mesh(starGeo, starMat));
const tFront = new THREE.Mesh(tGeo, tMat);
tFront.position.z = 0.2;
const tBack = new THREE.Mesh(tGeo, tMat);
tBack.position.z = -0.2;
tBack.scale.z = -1;
star.add(tFront, tBack);
const holder = new THREE.Group();
holder.add(star);
scene.add(holder);

/* --- where the star sits in each section (fractions of the viewport) --- */
const C = (h) => new THREE.Color(h);
const DESKTOP = {
  drop:          { x: 0.5,   y: 0.1,   s: 0,    z: -0.4, star: C('#ff3d9a'), t: C('#ffffff'), rim: 0 },
  moneymaker:    { x: -0.3, y: 0.06, s: 0.32, z: -0.35, star: C('#7a0b1d'), t: C('#b3142f'), rim: 0 },
  'after-hours': { x: 0.38,  y: -0.24, s: 0.2,  z: 0.25, star: C('#ff3d9a'), t: C('#ffd1e8'), rim: 60 },
  play:          { x: 0,     y: 0.03,  s: 0.58, z: 0,    star: C('#d9d9e2'), t: C('#ff3d9a'), rim: 30 },
  next:          { x: 0.3,   y: -0.3,  s: 0,    z: 0,    star: C('#160910'), t: C('#ff3d9a'), rim: 0 },
  shop:          { x: 0,     y: 0,     s: 0,    z: 0,    star: C('#ff3d9a'), t: C('#ffffff'), rim: 0 },
};
const MOBILE = {
  ...DESKTOP,
  moneymaker:    { ...DESKTOP.moneymaker, x: -0.3, y: -0.12, s: 0.12 },
  'after-hours': { ...DESKTOP['after-hours'], x: -0.24, y: -0.08, s: 0.13 },
  play:          { ...DESKTOP.play, x: 0, y: 0.06, s: 0.26 },
};

const sections = [...document.querySelectorAll('main > .sec')].filter((s) => DESKTOP[s.id]);
let keys = [];
let view = { w: 1, h: 1 };
function measure() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  view = { w: vh * camera.aspect, h: vh };
  const states = w < 900 ? MOBILE : DESKTOP;
  keys = [];
  sections.forEach((s) => {
    const top = s.getBoundingClientRect().top + scrollY;
    const st = states[s.id];
    keys.push({ at: top, st });
    const end = top + s.offsetHeight - h;
    if (end > top + 1) keys.push({ at: end, st });
  });
}
measure();
addEventListener('resize', measure);
addEventListener('load', measure);
setTimeout(measure, 1500);

const cur = { x: 0, y: 0, s: 0, z: 0, star: new THREE.Color(), t: new THREE.Color(), rim: 0 };
const smooth = (t) => t * t * (3 - 2 * t);
function sample(y) {
  let a = keys[0], b = keys[0];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].at <= y) a = keys[i];
    if (keys[i].at > y) { b = keys[i]; break; }
    b = keys[i];
  }
  const t = b.at === a.at ? 0 : smooth(Math.min(1, Math.max(0, (y - a.at) / (b.at - a.at))));
  for (const k of ['x', 'y', 's', 'z', 'rim']) cur[k] = a.st[k] + (b.st[k] - a.st[k]) * t;
  cur.star.copy(a.st.star).lerp(b.st.star, t);
  cur.t.copy(a.st.t).lerp(b.st.t, t);
}

/* --- input --- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => {
  mouse.x = e.clientX / innerWidth - 0.5;
  mouse.y = e.clientY / innerHeight - 0.5;
});

const BASE_SPIN = reduced ? 0.15 : 0.45;
let rotY = 0.4, rotX = 0, angVel = BASE_SPIN, tiltVel = 0, userSpin = 0, spins = 0;
let drag = null;
const play = document.getElementById('play');
play.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, t: performance.now(), v: 0 };
  play.setPointerCapture(e.pointerId);
});
play.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const now = performance.now();
  const dt = Math.max(1, now - drag.t) / 1000;
  const dx = (e.clientX - drag.x) * 0.012;
  const dyy = (e.clientY - drag.y) * 0.008;
  rotY += dx;
  rotX = Math.max(-0.9, Math.min(0.9, rotX + dyy));
  drag.v = drag.v * 0.4 + (dx / dt) * 0.6;
  userSpin += Math.abs(dx);
  Object.assign(drag, { x: e.clientX, y: e.clientY, t: now });
});
const release = () => {
  if (!drag) return;
  angVel = Math.max(-40, Math.min(40, drag.v));
  drag = null;
};
play.addEventListener('pointerup', release);
play.addEventListener('pointercancel', release);

/* --- loop --- */
const clock = new THREE.Clock();
let lastScroll = scrollY, scrollVel = 0, wasVisible = true;
function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  scrollVel += ((scrollY - lastScroll) - scrollVel) * 0.15;
  lastScroll = scrollY;
  sample(scrollY);

  const visible = cur.s > 0.002 && !document.body.classList.contains('menu-open');
  if (!visible && !wasVisible) return;
  wasVisible = visible;
  holder.visible = visible;

  // spin: base idle speed + scroll kick + throw inertia
  if (!drag) {
    angVel += (BASE_SPIN - angVel) * Math.min(1, dt * 0.9);
    const step = (angVel + scrollVel * 0.02) * dt;
    rotY += step;
    if (Math.abs(angVel) > BASE_SPIN * 1.5) userSpin += Math.abs(angVel - BASE_SPIN) * dt;
    rotX += (0 - rotX) * Math.min(1, dt * 2);
  }
  const n = Math.floor(userSpin / (Math.PI * 2));
  if (n !== spins) {
    spins = n;
    dispatchEvent(new CustomEvent('star:spins', { detail: spins }));
  }

  mouse.sx += (mouse.x - mouse.sx) * 0.06;
  mouse.sy += (mouse.y - mouse.sy) * 0.06;

  holder.position.set(cur.x * view.w + mouse.sx * 0.3, cur.y * view.h - mouse.sy * 0.2 + Math.sin(time * 1.2) * 0.06, cur.z);
  holder.scale.setScalar((cur.s * view.h) / STAR_H);
  star.rotation.set(rotX + mouse.sy * 0.4, rotY + mouse.sx * 0.6, Math.sin(time * 0.7) * 0.06 - 0.12);

  starMat.color.copy(cur.star);
  tMat.color.copy(cur.t);
  rim.intensity = cur.rim;
  rim.position.set(holder.position.x - 2.5, holder.position.y - 1, 3);

  renderer.render(scene, camera);
}
tick();
