/**
 * Architecture: Model-View-Controller-Router (MVCR) Orchestrator
 * High-performance portfolio web application for Niño Miguel S. Rodriguez
 * 
 * - Models:      ./models/ (appState.js, projectsData.js)
 * - Views:       ./views/  (canvasView.js, modalView.js, heatmapView.js, dinoView.js)
 * - Controllers: ./controllers/ (canvasController.js, modalController.js, contactController.js, dinoController.js, uiController.js)
 * - Routes:      ./routes/ (router.js, serverRoutes.js)
 */

import { appState, TOTAL_FRAMES } from './models/appState.js';
import { projectsData } from './models/projectsData.js';
import { renderGitHubHeatmap } from './views/heatmapView.js';
import { initCanvasEngine } from './controllers/canvasController.js';
import { initProjectModal } from './controllers/modalController.js';
import { initContactForm } from './controllers/contactController.js';
import { initDinoDanceRunner } from './controllers/dinoController.js';
import { initUI } from './controllers/uiController.js';
import { initRouter } from './routes/router.js';

// Expose state and models globally for developer inspection and command palette
window.appState = appState;
window.projectsData = projectsData;

function initApplication() {
  // 1. Initialize 300-Frame Hardware Accelerated Canvas Engine
  const canvasEngine = initCanvasEngine(appState);

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
