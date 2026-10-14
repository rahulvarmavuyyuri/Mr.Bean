// Mr. Bean — 3D coffee beans in the hero.
// Procedural bean geometry (ellipsoid with a carved fissure), physical materials with
// clearcoat + sheen, soft three-light rig, rotation on y and z, lazy-rendered only when
// visible. Honors prefers-reduced-motion.
//
// Loaded via import map so Three.js resolves from jsDelivr.

import * as THREE from 'three';

const canvas = document.getElementById('beans');
if (canvas) initBeans(canvas);

function initBeans(canvas) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Guard against WebGL being unavailable (very old devices)
  let gl = null;
  try {
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  } catch (e) { /* ignore */ }
  if (!gl) { canvas.classList.add('is-hidden'); return; }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  // Camera — slightly tilted-down so beans sit on an imaginary surface.
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.1, 7.5);
  camera.lookAt(0, 0, 0);

  // Lighting: a soft hemisphere + key directional + fill directional + rim.
  const hemi = new THREE.HemisphereLight(0xfff6ea, 0x3a2a1f, 0.55);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 4.0, 3.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdcc4ff, 0.6); // subtle lavender fill — matches hero accent
  fill.position.set(-3.5, 2.0, 1.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xfff3dc, 0.9);
  rim.position.set(-1.5, 2.0, -3.5);
  scene.add(rim);

  // Procedural bean geometry — oblong body with a carved fissure along the top.
  const beanGeom = createBeanGeometry({ segmentsX: 72, segmentsY: 36 });

  // Shared physical material tuned for a roasted-bean look.
  const beanMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#5a2f1b'),
    roughness: 0.52,
    metalness: 0.05,
    clearcoat: 0.42,
    clearcoatRoughness: 0.58,
    sheen: 0.5,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffb27a'),
    reflectivity: 0.3,
  });

  // Darker variant for occasional "deeper roast" beans
  const darkMaterial = beanMaterial.clone();
  darkMaterial.color = new THREE.Color('#3b1f12');
  darkMaterial.sheenColor = new THREE.Color('#ffa670');

  // Lighter variant for occasional "lighter roast" beans
  const lightMaterial = beanMaterial.clone();
  lightMaterial.color = new THREE.Color('#7a4426');
  lightMaterial.clearcoat = 0.5;

  const materials = [beanMaterial, darkMaterial, lightMaterial];

  // Place 7 beans at varied positions, sizes, and rotations.
  const beans = [];
  const seeds = [
    // [ x,     y,     z,    scale, rotX,  rotY,  rotZ, matIdx ]
    [-2.3,  0.3, -0.4, 0.95, 0.3, -0.6,  0.4, 0],
    [ 2.1, -0.1,  0.2, 1.0,  0.1,  0.9, -0.3, 1],
    [-0.6,  1.0, -1.0, 0.75, -0.4, 0.3,  0.9, 2],
    [ 0.9,  0.8,  0.6, 0.85, 0.7, -1.2,  0.1, 0],
    [-1.4, -0.9,  0.9, 0.9,  -0.2, 1.4,  0.6, 1],
    [ 0.2, -0.5, -0.7, 0.80, 0.5, -0.2, -0.8, 2],
    [ 1.8,  0.9, -0.9, 0.70, -0.6, 0.5,  0.3, 0],
  ];

  for (let i = 0; i < seeds.length; i++) {
    const [x, y, z, s, rx, ry, rz, mi] = seeds[i];
    const mesh = new THREE.Mesh(beanGeom, materials[mi]);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.setScalar(s);
    mesh.userData.spin = {
      sx: 0.08 + (i % 3) * 0.015,
      sy: 0.14 + ((i * 7) % 11) * 0.004,
      bobPhase: i * 0.9,
      bobAmp: 0.07 + (i % 2) * 0.03,
      baseY: y,
    };
    scene.add(mesh);
    beans.push(mesh);
  }

  // Resize to canvas size
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas); else window.addEventListener('resize', resize);

  // Pause when the hero isn't visible to save battery.
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { isVisible = e.isIntersecting; });
    }, { threshold: 0.01 });
    io.observe(canvas);
  }

  // Pause when the tab isn't active.
  let isActive = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    isActive = !document.hidden;
  });

  const clock = new THREE.Clock();

  function render() {
    const t = clock.getElapsedTime();
    for (const b of beans) {
      const d = b.userData.spin;
      if (!reduce) {
        b.rotation.y += d.sy * 0.012;
        b.rotation.x += d.sx * 0.004;
        b.position.y = d.baseY + Math.sin(t * 0.6 + d.bobPhase) * d.bobAmp;
      }
    }
    renderer.render(scene, camera);
  }

  function loop() {
    if (isVisible && isActive) render();
    requestAnimationFrame(loop);
  }
  // Render once immediately so reduced-motion viewers also see the beans statically.
  render();
  if (!reduce) requestAnimationFrame(loop);
}

/**
 * Build an oblong coffee-bean geometry: a stretched ellipsoid with a smooth
 * fissure carved along the top in the long direction.
 */
function createBeanGeometry({ segmentsX = 64, segmentsY = 32 } = {}) {
  const geo = new THREE.SphereGeometry(1, segmentsX, segmentsY);

  // Base elongation
  geo.scale(1.45, 0.78, 0.95);

  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Carve the fissure: push vertices on the top half (y > 0) inward along y,
    // with maximum depth near the long axis (small |z|) and tapered along x.
    if (v.y > 0) {
      const bellZ = Math.exp(-((v.z * v.z) / 0.045)); // narrow bell across z
      const bellX = Math.exp(-((v.x * v.x) / 1.8));   // soft taper along the long axis
      const depth = 0.33 * bellZ * bellX;
      v.y -= depth;

      // Pinch the ridges toward each other a touch along z, so the fissure has lips
      const pinch = 0.08 * bellX * Math.max(0, 1 - Math.abs(v.z) * 4);
      v.z *= 1 - pinch * 0.4;
    }

    // Give it a very subtle lopsidedness so each rotation looks organic
    const lopsided = 0.015 * Math.sin(v.x * 1.1) * Math.cos(v.z * 2.0);
    v.y += lopsided;

    pos.setXYZ(i, v.x, v.y, v.z);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
