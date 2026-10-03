/**
 * Application State Model (MVCR - Model Layer)
 * Manages central reactive state for 3D crystalline hero scene, active project modal, and filters
 */

export const appState = {
  isLoaded: true,
  currentProject: 'celestine',
  activeFilter: 'all',
  activeSection: 'home',
  scroll: {
    scrollY: 0,
    progress: 0,
    targetProgress: 0
  },
  mouse: {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  },
  hero3D: {
    isHovered: false,
    prismRotation: { x: 0, y: 0, z: 0 }
  }
};

export default appState;
