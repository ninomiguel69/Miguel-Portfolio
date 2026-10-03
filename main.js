/**
 * Architecture: Model-View-Controller-Router (MVCR) Orchestrator
 * High-performance portfolio web application for Niño Miguel S. Rodriguez
 * 
 * - Models:      ./models/ (appState.js, projectsData.js)
 * - Views:       ./views/  (hero3dView.js, modalView.js, heatmapView.js, dinoView.js)
 * - Controllers: ./controllers/ (hero3dController.js, modalController.js, contactController.js, dinoController.js, uiController.js)
 * - Routes:      ./routes/ (router.js, serverRoutes.js)
 */

import { appState } from './models/appState.js';
import { projectsData } from './models/projectsData.js';
import { renderGitHubHeatmap } from './views/heatmapView.js';
import { initHero3DEngine } from './controllers/hero3dController.js';
import { initProjectModal } from './controllers/modalController.js';
import { initContactForm } from './controllers/contactController.js';
import { initDinoDanceRunner } from './controllers/dinoController.js';
import { initUI } from './controllers/uiController.js';
import { initRouter } from './routes/router.js';

// Expose state and models globally for developer inspection and command palette
window.appState = appState;
window.projectsData = projectsData;

function initApplication() {
  // 1. Initialize Real-Time 3D Hero Prism Engine (Three.js WebGL)
  const hero3dEngine = initHero3DEngine(appState);

  // 2. Initialize Project Modal Controller & Accessibility
  const modalController = initProjectModal(appState);

  // 3. Initialize Interactive UI Components (Archive filter, Spotlights, Mobile Nav, Command Palette, Resume)
  initUI();

  // 4. Initialize GitHub Activity 52-Week Matrix
  renderGitHubHeatmap('github-heatmap-grid');

  // 5. Initialize Production Contact Form & Anti-Spam Gatekeeper
  initContactForm();

  // 6. Initialize Arcade Dino Dance Runner
  initDinoDanceRunner();

  // 7. Initialize Client-Side SPA Hash Router & Deep Linking
  initRouter(modalController);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}

export {
  appState,
  projectsData,
  initApplication
};
