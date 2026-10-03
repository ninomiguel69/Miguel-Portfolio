/**
 * Hero 3D Controller (MVCR - Controller Layer)
 * Manages physics-based damping, mouse parallax, scroll-driven spatial rotation,
 * particle dynamics, and requestAnimationFrame rendering for the 3D crystal prism.
 */

import { createHero3DView } from '../views/hero3dView.js';

export function initHero3DEngine(appState) {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return null;

  const view = createHero3DView(canvas);
  if (!view) return null;

  const {
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
  } = view;

  // Mouse Parallax Coordinates with Lerp Damping
  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let isVisible = true;

  function onMouseMove(e) {
    // Normalize coordinates to [-1, 1]
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

    if (appState && appState.mouse) {
      appState.mouse.targetX = mouse.targetX;
      appState.mouse.targetY = mouse.targetY;
    }
  }

  // Touch Move Parallax for Mobile Devices
  function onTouchMove(e) {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      mouse.targetX = (touch.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  // Active Navbar Tracker
  const sections = ['home', 'about', 'services', 'projects', 'technologies', 'certificates', 'activity', 'resume', 'contact'];
  const navLinks = document.querySelectorAll('.nav-item');

  function updateActiveNav() {
    const scrollY = window.scrollY + 140;
    let currentSection = 'home';

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) {
        currentSection = id;
      }
    });

    if (appState) {
      appState.activeSection = currentSection;
    }

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const heroH = window.innerHeight || 800;

    // Fractional scroll through hero section
    targetScrollProgress = Math.min(2.0, Math.max(0, scrollY / heroH));

    if (appState && appState.scroll) {
      appState.scroll.scrollY = scrollY;
      appState.scroll.progress = targetScrollProgress;
    }

    // Only render high fidelity when hero is near viewport
    isVisible = scrollY < window.innerHeight * 2;

    updateActiveNav();
  }

  // Animation Loop Clock
  let startTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const time = (now - startTime) * 0.001;

    // Smooth Lerp for Mouse Parallax
    const MOUSE_LERP = 0.06;
    mouse.x += (mouse.targetX - mouse.x) * MOUSE_LERP;
    mouse.y += (mouse.targetY - mouse.y) * MOUSE_LERP;

    // Smooth Lerp for Scroll Progress
    const SCROLL_LERP = 0.08;
    scrollProgress += (targetScrollProgress - scrollProgress) * SCROLL_LERP;

    // Responsive Base Positioning
    const isMobile = window.innerWidth < 768;
    const basePosX = isMobile ? 0 : 1.1;
    const basePosY = (isMobile ? 0.8 : 0.35) - scrollProgress * 1.6;
    const basePosZ = -scrollProgress * 2.2;

    // 1. Sinusoidal Levitation Floating
    const levitationY = Math.sin(time * 0.85) * 0.14;
    const levitationRoll = Math.sin(time * 0.6) * 0.04;

    crystalGroup.position.x = basePosX + mouse.x * 0.25;
    crystalGroup.position.y = basePosY + levitationY + mouse.y * 0.2;
    crystalGroup.position.z = basePosZ;

    // 2. Multi-Axis Rotational Parallax (Slow majestic yaw + mouse tilt + scroll twist)
    const targetRotX = -0.12 + mouse.y * 0.38 + scrollProgress * 0.65;
    const targetRotY = 0.22 + time * 0.09 + mouse.x * 0.45 + scrollProgress * 0.9;
    const targetRotZ = 0.06 + levitationRoll + mouse.x * 0.12;

    crystalGroup.rotation.x += (targetRotX - crystalGroup.rotation.x) * 0.05;
    crystalGroup.rotation.y += (targetRotY - crystalGroup.rotation.y) * 0.05;
    crystalGroup.rotation.z += (targetRotZ - crystalGroup.rotation.z) * 0.05;

    // 3. Pulse Inner Caustic Warm Luminescence
    if (innerMaterial) {
      innerMaterial.opacity = 0.18 + Math.sin(time * 1.8) * 0.07;
    }

    // 4. Drift Floating Ambient Particles
    if (particleSystem && particlePositions) {
      const posAttr = particleSystem.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3 + 1; // y-coordinate
        particlePositions[idx] += particleSpeeds[i] * 0.008;

        // Wrap around boundary
        if (particlePositions[idx] > 5) {
          particlePositions[idx] = -5;
        }

        // Gentle horizontal drift
        particlePositions[i * 3] += Math.sin(time * 0.5 + i) * 0.003;
      }
      posAttr.needsUpdate = true;
    }

    // 5. Subtle Camera Parallax
    camera.position.x = mouse.x * 0.35;
    camera.position.y = 0.2 + mouse.y * 0.25;
    camera.lookAt(0, 0, 0);

    // 6. Render
    renderer.render(scene, camera);
  }

  // Event Listeners
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    resize();
    onScroll();
  }, { passive: true });

  // Initial Sync
  onScroll();
  requestAnimationFrame(animate);

  return {
    resize,
    onScroll
  };
}
