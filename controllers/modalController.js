/**
 * Modal Controller (MVCR - Controller Layer)
 * Manages modal display, accessibility, focus trapping, and project switching
 */

import { getModalElements, renderProjectModal } from '../views/modalView.js';
import { projectsData } from '../models/projectsData.js';

export function initProjectModal(appState) {
  const elements = getModalElements();
  const { modal, closeBtn, closeFooterBtn } = elements;

  if (!modal) return null;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadProject(projectId) {
    if (!projectsData[projectId]) return;
    appState.currentProject = projectId;
    renderProjectModal(projectId, projectsData, elements, (targetId) => {
      loadProject(targetId);
    });
  }

  // Globally accessible modal opener
  window.openProjectModal = (projectId) => {
    loadProject(projectId);
    openModal();
  };

  // Wire all modal opener buttons and interactive viewports
  const projectModalBtns = document.querySelectorAll('.open-project-modal-btn, [data-project-target]');
  projectModalBtns.forEach(btn => {
    const handleTrigger = (e) => {
      e.stopPropagation();
      const targetProj = btn.getAttribute('data-project-target') || btn.getAttribute('data-project-id');
      if (targetProj && projectsData[targetProj]) {
        loadProject(targetProj);
        openModal();
      }
    };

    btn.addEventListener('click', handleTrigger);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTrigger(e);
      }
    });
  });

  // Close Handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  return {
    openModal,
    closeModal,
    loadProject
  };
}
