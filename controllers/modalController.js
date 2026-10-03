/**
 * Modal Controller (MVCR - Controller Layer)
 * Manages modal display, accessibility, focus trapping, and project switching
 */

import { getModalElements, renderProjectModal } from '../views/modalView.js';
import { projectsData } from '../models/projectsData.js';

export function initProjectModal(appState) {
  const elements = getModalElements();
  const { modal, closeBtn, closeFooterBtn } = elements;

  if (!modal) return;

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

  // Celestine Openers
  const celestineBtns = [
    document.getElementById('open-celestine-btn'),
    document.getElementById('open-celestine-modal-visual')
  ].filter(Boolean);

  celestineBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      loadProject('celestine');
      openModal();
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadProject('celestine');
        openModal();
      }
    });
  });

  // Bookshelf Cards
  const bookshelfCards = document.querySelectorAll('.bookshelf-card');
  bookshelfCards.forEach(card => {
    const projId = card.getAttribute('data-project-id');
    card.addEventListener('click', () => {
      if (!projId) return;
      loadProject(projId);
      openModal();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!projId) return;
        e.preventDefault();
        loadProject(projId);
        openModal();
      }
    });
  });

  // Project Modal Buttons
  const projectModalBtns = document.querySelectorAll('.open-project-modal-btn');
  projectModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetProj = btn.getAttribute('data-project-target');
      loadProject(targetProj);
      openModal();
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

  // Expose global programmatic opener for Command Palette and Router
  window.openProjectModal = function(projectId) {
    if (!projectId) return;
    loadProject(projectId);
    openModal();
  };

  return {
    open: openModal,
    close: closeModal,
    loadProject
  };
}
