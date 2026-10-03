/**
 * Hero 3D View (MVCR - View Layer)
 * Renders the real-time 3D floating crystalline prism with volumetric refraction,
 * caustic luminescence, iridescent facets, and ambient floating particles over the hero hand backdrop.
 */

import * as THREE from '../assets/vendor/three.module.js';

export function createHero3DView(canvas) {
  if (!canvas) return null;

  // 1. Scene & Camera Setup
  const scene = new THREE.Scene();
  
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 7.8);

  // 2. Hardware-Accelerated WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // 3. Lighting Orchestration
  const ambientLight = new THREE.AmbientLight(0x182436, 1.4);
  scene.add(ambientLight);

  // Horizon warm amber rim light (simulates golden horizon glow striking from below/behind)
  const warmHorizonLight = new THREE.DirectionalLight(0xff9f43, 3.2);
  warmHorizonLight.position.set(0, -3.2, -1.8);
  scene.add(warmHorizonLight);

  // Cool icy cyan specular key light (catches upper beveled facets)
  const coolKeyLight = new THREE.DirectionalLight(0x82ccdd, 2.6);
  coolKeyLight.position.set(2.4, 3.8, 3.2);
  scene.add(coolKeyLight);

  // Secondary soft magenta rim light for chromatic richness
  const accentLight = new THREE.PointLight(0xff6b81, 1.8, 12);
  accentLight.position.set(-3.2, 1.2, 2.0);
  scene.add(accentLight);

  // 4. Construct Crystalline Glass Prism Geometry & Materials
  const crystalGroup = new THREE.Group();
  scene.add(crystalGroup);

  // Create rounded rectangular shape for chamfered crystal slab
  const slabW = 3.8;
  const slabH = 2.3;
  const slabR = 0.32;
  const shape = new THREE.Shape();
  shape.moveTo(-slabW / 2 + slabR, -slabH / 2);
  shape.lineTo(slabW / 2 - slabR, -slabH / 2);
  shape.quadraticCurveTo(slabW / 2, -slabH / 2, slabW / 2, -slabH / 2 + slabR);
  shape.lineTo(slabW / 2, slabH / 2 - slabR);
  shape.quadraticCurveTo(slabW / 2, slabH / 2, slabW / 2 - slabR, slabH / 2);
  shape.lineTo(-slabW / 2 + slabR, slabH / 2);
  shape.quadraticCurveTo(-slabW / 2, slabH / 2, -slabW / 2, slabH / 2 - slabR);
  shape.lineTo(-slabW / 2, -slabH / 2 + slabR);
  shape.quadraticCurveTo(-slabW / 2, -slabH / 2, -slabW / 2 + slabR, -slabH / 2);

  const extrudeSettings = {
    steps: 2,
    depth: 0.65,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.16,
    bevelOffset: 0,
    bevelSegments: 6
  };
  const crystalGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  crystalGeometry.center();

  // Outer Physical Glass Material (Refraction, Transmission, Clearcoat)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf6faff),
    emissive: new THREE.Color(0x0a1622),
    roughness: 0.06,
    metalness: 0.04,
    transmission: 0.93,
    ior: 1.55,
    thickness: 1.5,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    attenuationColor: new THREE.Color(0x9bd8ff),
    attenuationDistance: 1.4,
    transparent: true,
    opacity: 0.94
  });

  const crystalMesh = new THREE.Mesh(crystalGeometry, glassMaterial);
  crystalGroup.add(crystalMesh);

  // Inner Caustic Luminescence Core (warm golden glow refracted inside)
  const innerGeometry = new THREE.BoxGeometry(slabW * 0.82, slabH * 0.78, 0.35);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff9944),
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });
  const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  crystalGroup.add(innerMesh);

  // Iridescent Facet Edges
  const edgeGeometry = new THREE.EdgesGeometry(crystalGeometry, 22);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(0xa8e6ff),
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending
  });
  const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  crystalGroup.add(edgeLines);

  // 5. Ambient Floating Luminous Dust Particles
  const particleCount = 150;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const isWarm = Math.random() > 0.45;
    particleColors[i * 3] = isWarm ? 1.0 : 0.45;
    particleColors[i * 3 + 1] = isWarm ? 0.75 : 0.88;
    particleColors[i * 3 + 2] = isWarm ? 0.4 : 1.0;

    particleSpeeds[i] = 0.2 + Math.random() * 0.8;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  // Canvas circle texture for particles
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 32;
  particleCanvas.height = 32;
  const pCtx = particleCanvas.getContext('2d');
  const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 200, 120, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = gradient;
  pCtx.beginPath();
  pCtx.arc(16, 16, 16, 0, Math.PI * 2);
  pCtx.fill();

  const particleTexture = new THREE.CanvasTexture(particleCanvas);
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.16,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Initial group tilt
  crystalGroup.rotation.set(-0.15, 0.22, 0.08);

  // Resize Handler
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w <= 0 || h <= 0) return;

    camera.aspect = w / h;

    // Adjust camera distance for mobile viewport framing
    if (w < 768) {
      camera.position.z = 10.5;
      crystalGroup.position.set(0, 0.8, 0);
    } else {
      camera.position.z = 7.8;
      // Position crystal elegantly to the center-right of the hero
      crystalGroup.position.set(1.1, 0.35, 0);
    }

    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }

  resize();

  return {
    scene,
    camera,
    renderer,
    crystalGroup,
    innerMaterial,
    particleSystem,
    particlePositions,
    particleSpeeds,
    particleCount,
    resize
  };
}
