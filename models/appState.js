/**
 * Application State Model (MVCR - Model Layer)
 * Manages central reactive state for 300-frame canvas scrubbing, active project, and filters
 */

export const TOTAL_FRAMES = 300;

export const appState = {
  totalFrames: TOTAL_FRAMES,
  frameImages: new Array(TOTAL_FRAMES),
  targetProgress: 0,
  currentProgress: 0,
  lastRenderedIndex: -1,
  isDirty: true,
  isLoaded: false,
  currentProject: 'celestine',
  activeFilter: 'all',
  activeSection: 'home'
};
