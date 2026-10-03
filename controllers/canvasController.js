/**
 * Canvas Controller (MVCR - Controller Layer)
 * Coordinates 300-frame image sequence preloading, requestAnimationFrame lerping, and responsive viewport sizing
 */

import { resizeCanvas, drawFrame, getCurrentFrameIndex, getFrameUrl } from '../views/canvasView.js';

export function initCanvasEngine(appState) {
  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');

  // Lock scroll during preloading
  document.body.classList.add('is-loading');

  // Scroll Progress Calculation
  function updateScrollProgress() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;

    if (maxScroll <= 0) {
      appState.targetProgress = 0;
    } else {
      appState.targetProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
    }

    scheduleNavUpdate();
  }

  // Active Navbar Highlight Tracker
  let navUpdatePending = false;
  function scheduleNavUpdate() {
    if (navUpdatePending) return;
    navUpdatePending = true;
    requestAnimationFrame(() => {
      updateActiveNav();
      navUpdatePending = false;
    });
  }

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

    appState.activeSection = currentSection;

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Smooth Lerp Animation Loop
  function animate() {
    const LERP_FACTOR = 0.085;
    const diff = appState.targetProgress - appState.currentProgress;

    if (Math.abs(diff) > 0.00005) {
      appState.currentProgress += diff * LERP_FACTOR;
    } else {
      appState.currentProgress = appState.targetProgress;
    }

    const targetIndex = getCurrentFrameIndex(appState.currentProgress, appState.totalFrames);

    if (targetIndex !== appState.lastRenderedIndex || appState.isDirty) {
      drawFrame(canvas, ctx, appState.frameImages, targetIndex, appState.totalFrames);
      appState.lastRenderedIndex = targetIndex;
      appState.isDirty = false;
    }

    requestAnimationFrame(animate);
  }

  // Progressive Frame Preloader with Distributed Keyframes
  async function preloadFrames() {
    let loadedCount = 0;

    function updateProgress(pct) {
      if (loaderBar) loaderBar.style.width = `${pct}%`;
      if (loaderText) loaderText.textContent = `Loading ${pct}%`;
    }

    const loadSingleFrame = (i) => {
      return new Promise((resolve) => {
        if (appState.frameImages[i] && appState.frameImages[i].complete && appState.frameImages[i].naturalWidth > 0) {
          resolve(appState.frameImages[i]);
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(i + 1);

        img.onload = () => {
          appState.frameImages[i] = img;
          loadedCount++;
          const activeIdx = getCurrentFrameIndex(appState.currentProgress, appState.totalFrames);
          if (Math.abs(i - activeIdx) <= 1) {
            appState.isDirty = true;
            drawFrame(canvas, ctx, appState.frameImages, activeIdx, appState.totalFrames);
          }
          if (typeof img.decode === 'function') {
            img.decode().catch(() => {}).finally(() => resolve(img));
          } else {
            resolve(img);
          }
        };

        img.onerror = () => {
          appState.frameImages[i] = appState.frameImages[Math.max(0, i - 1)] || appState.frameImages[0];
          resolve(appState.frameImages[i]);
        };
      });
    };

    // 1. Immediately load hero frame
    updateProgress(10);
    const firstFrame = await loadSingleFrame(0);
    appState.frameImages[0] = firstFrame;
    resizeCanvas(canvas, ctx);
    drawFrame(canvas, ctx, appState.frameImages, 0, appState.totalFrames);
    updateProgress(25);

    // 2. Preload distributed keyframes (stride: 5)
    const keyframeIndices = [];
    const STRIDE = 5;
    for (let i = 1; i < appState.totalFrames; i += STRIDE) {
      keyframeIndices.push(i);
    }

    let keyframesLoaded = 0;
    const keyframePromises = keyframeIndices.map(idx =>
      loadSingleFrame(idx).then(() => {
        keyframesLoaded++;
        const pct = Math.min(98, 25 + Math.round((keyframesLoaded / keyframeIndices.length) * 73));
        updateProgress(pct);
      })
    );

    await Promise.race([
      Promise.all(keyframePromises),
      new Promise((r) => setTimeout(r, 1200))
    ]);

    updateProgress(100);
    appState.isLoaded = true;
    document.body.classList.remove('is-loading');

    if (loader) {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
        }, 400);
      }, 120);
    }

    updateScrollProgress();
    appState.isDirty = true;

    // 3. Background Streaming Queue
    const pending = new Set();
    for (let i = 0; i < appState.totalFrames; i++) {
      if (!appState.frameImages[i] || !appState.frameImages[i].complete) {
        pending.add(i);
      }
    }

    function getNextFrame() {
      if (pending.size === 0) return null;
      const target = getCurrentFrameIndex(appState.currentProgress, appState.totalFrames);
      let best = null;
      let bestDist = Infinity;
      for (const idx of pending) {
        const dist = Math.abs(idx - target);
        if (dist < bestDist) {
          bestDist = dist;
          best = idx;
          if (dist === 0) break;
        }
      }
      if (best !== null) {
        pending.delete(best);
      }
      return best;
    }

    const CONCURRENCY = 6;
    async function worker() {
      while (pending.size > 0) {
        const nextIdx = getNextFrame();
        if (nextIdx === null) break;
        await loadSingleFrame(nextIdx);
      }
    }

    for (let w = 0; w < CONCURRENCY; w++) {
      worker();
    }
  }

  // Window Listeners
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas(canvas, ctx);
    updateScrollProgress();
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.code)) {
      updateScrollProgress();
    }
  });

  // Start Engine
  resizeCanvas(canvas, ctx);
  preloadFrames();
  requestAnimationFrame(animate);

  return {
    updateScrollProgress,
    resize: () => resizeCanvas(canvas, ctx)
  };
}
