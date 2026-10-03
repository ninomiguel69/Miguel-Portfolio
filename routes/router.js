/**
 * Client-Side Router (MVCR - Router Layer)
 * Manages hash routing, section history, and deep-linking into project and resume modals
 */

export function initRouter(modalController) {
  const sections = ['home', 'about', 'services', 'projects', 'technologies', 'certificates', 'activity', 'resume', 'contact'];

  function handleRoute() {
    const hash = window.location.hash.replace(/^#/, '').trim();
    if (!hash) return;

    // 1. Deep link to project modals (#project-fynn-hotel, #fynn-hotel, etc.)
    const projectMatch = hash.match(/^(?:project-)?(celestine|ncst-srms|fynn-hotel|smartspace|miguelfit|auramart|grazingbull|aura-mart|grazing-bull)$/i);
    if (projectMatch) {
      const projId = projectMatch[1].toLowerCase();
      if (typeof window.openProjectModal === 'function') {
        window.openProjectModal(projId);
      }
      return;
    }

    // 2. Deep link to resume modal
    if (hash === 'resume' || hash === 'resume-preview') {
      if (typeof window.openResumeModal === 'function') {
        window.openResumeModal();
      }
      return;
    }

    // 3. Section scrolling
    if (sections.includes(hash)) {
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Listen to hash changes and initial page load route
  window.addEventListener('hashchange', handleRoute);
  
  // If loaded with a hash, wait for preloader to settle then dispatch
  if (window.location.hash) {
    setTimeout(handleRoute, 450);
  }

  return {
    navigate: (hash) => {
      window.location.hash = hash;
    },
    handleRoute
  };
}
