/**
 * Modal View (MVCR - View Layer)
 * Manages modal DOM rendering, project tabs, gallery views, and tech stack pills
 */

export const collaborativeTabsList = [
  { id: 'celestine', label: '01 — Celestine' },
  { id: 'ncst-srms', label: '02 — NCST SRMS' },
  { id: 'fynn-hotel', label: '03 — Fynn Hotel' },
  { id: 'smartspace', label: '04 — SmartSpace' }
];

export const soloTabsList = [
  { id: 'miguelfit', label: '05 — MIGUEL.FIT' },
  { id: 'auramart', label: '06 — AURA MART' },
  { id: 'grazingbull', label: '07 — The Grazing Bull' }
];

export function getModalElements() {
  return {
    modal: document.getElementById('project-modal'),
    modalKicker: document.getElementById('modal-kicker'),
    modalTitle: document.getElementById('modal-title'),
    modalLeadText: document.getElementById('modal-lead-text'),
    modalSecondaryText: document.getElementById('modal-secondary-text'),
    modalGalleryTabs: document.getElementById('modal-gallery-tabs'),
    displayImg: document.getElementById('modal-display-img'),
    captionEl: document.getElementById('modal-image-caption'),
    modalHighlightsGrid: document.getElementById('modal-highlights-grid'),
    modalTechPills: document.getElementById('modal-tech-pills'),
    modalFooterLinks: document.getElementById('modal-footer-links'),
    modalNavLabel: document.getElementById('modal-nav-label'),
    modalProjectTabs: document.getElementById('modal-project-tabs'),
    closeBtn: document.getElementById('modal-close-btn'),
    closeFooterBtn: document.getElementById('modal-close-footer-btn')
  };
}

export function renderProjectModal(projectId, projectsData, elements, onProjectSelect) {
  const data = projectsData[projectId];
  if (!data) return;

  const {
    modalKicker,
    modalTitle,
    modalNavLabel,
    modalProjectTabs,
    modalLeadText,
    modalSecondaryText,
    modalGalleryTabs,
    displayImg,
    captionEl,
    modalHighlightsGrid,
    modalTechPills,
    modalFooterLinks,
    modal
  } = elements;

  // 1. Kicker & Title
  if (modalKicker) modalKicker.textContent = data.kicker;
  if (modalTitle) modalTitle.textContent = data.title;

  // 2. Separate switch archives: Collaborative only for collaborative projects, Independent only for solo
  const isCollaborative = ['celestine', 'ncst-srms', 'fynn-hotel', 'smartspace'].includes(projectId);
  const activeArchiveList = isCollaborative ? collaborativeTabsList : soloTabsList;

  if (modalNavLabel) {
    modalNavLabel.textContent = isCollaborative ? 'COLLABORATIVE ARCHIVES:' : 'INDEPENDENT ARCHIVES:';
  }

  if (modalProjectTabs) {
    modalProjectTabs.innerHTML = activeArchiveList.map(item => `
      <button type="button" class="modal-proj-tab ${item.id === projectId ? 'active' : ''}" data-proj-id="${item.id}">
        ${item.label}
      </button>
    `).join('');

    modalProjectTabs.querySelectorAll('.modal-proj-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-proj-id');
        if (typeof onProjectSelect === 'function') {
          onProjectSelect(targetId);
        }
      });
    });

    const currentActiveTab = modalProjectTabs.querySelector(`.modal-proj-tab[data-proj-id="${projectId}"]`);
    if (currentActiveTab && typeof currentActiveTab.scrollIntoView === 'function') {
      currentActiveTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // 3. Lead & Secondary Text
  if (modalLeadText) modalLeadText.innerHTML = data.leadText;
  if (modalSecondaryText) modalSecondaryText.innerHTML = data.secondaryText;

  // 4. Gallery Tabs & Initial Display Image
  if (modalGalleryTabs) {
    modalGalleryTabs.innerHTML = data.gallery.map((item, idx) => `
      <button type="button" class="gallery-tab-btn ${idx === 0 ? 'active' : ''}" data-gallery-idx="${idx}">
        <span class="tab-indicator"></span> ${item.label}
      </button>
    `).join('');

    const tabBtns = modalGalleryTabs.querySelectorAll('.gallery-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-gallery-idx'), 10);
        const galleryItem = data.gallery[idx];
        if (!galleryItem || !displayImg) return;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        displayImg.style.opacity = '0';
        setTimeout(() => {
          displayImg.src = galleryItem.src;
          displayImg.alt = data.title;
          if (captionEl) captionEl.innerHTML = galleryItem.caption;
          displayImg.style.opacity = '1';
        }, 150);
      });
    });
  }

  // Set first gallery image
  if (data.gallery.length > 0 && displayImg) {
    displayImg.style.opacity = '0';
    displayImg.src = data.gallery[0].src;
    displayImg.alt = data.title;
    if (captionEl) captionEl.innerHTML = data.gallery[0].caption;
    setTimeout(() => {
      displayImg.style.opacity = '1';
    }, 50);
  }

  // 5. Highlights Grid
  if (modalHighlightsGrid) {
    modalHighlightsGrid.innerHTML = data.highlights.map(h => `
      <div class="highlight-card">
        <div class="highlight-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff2a3a" stroke-width="2">
            ${h.icon}
          </svg>
        </div>
        <h4>${h.title}</h4>
        <p>${h.desc}</p>
      </div>
    `).join('');
  }

  // 6. Tech Stack Pills
  if (modalTechPills) {
    modalTechPills.innerHTML = data.techStack.map(t => `
      <span class="tech-pill"><span class="pill-dot ${t.dot}"></span>${t.name}</span>
    `).join('');
  }

  // 7. Footer Links
  if (modalFooterLinks) {
    modalFooterLinks.innerHTML = data.footerLinks;
    const modalFooter = modalFooterLinks.closest('.modal-footer');
    if (modalFooter) {
      const linkBtns = modalFooterLinks.querySelectorAll('.btn');
      modalFooter.classList.toggle('has-two-links', linkBtns.length >= 2);
    }
  }

  // 8. Reset modal scroll
  const modalBody = modal ? modal.querySelector('.modal-body') : null;
  if (modalBody) modalBody.scrollTop = 0;
}
