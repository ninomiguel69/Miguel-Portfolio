/**
 * UI & Interaction Controller (MVCR - Controller Layer)
 * Manages project archive filtering, cursor spotlights, mobile nav, command palette, and resume
 */

export function initProjectArchive() {
  const filterBtns = document.querySelectorAll('.archive-filter-btn');
  const rows = document.querySelectorAll('.archive-row');

  function showRow(el) {
    if (!el) return;
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  function hideRow(el) {
    if (!el) return;
    el.style.display = 'none';
  }

  function setFilter(filter) {
    filterBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (window.appState) {
      window.appState.activeFilter = filter;
    }

    rows.forEach(row => {
      const category = row.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        showRow(row);
      } else {
        hideRow(row);
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  // Synchronous initial view state matching 'all'
  setFilter('all');
}



export function initServicesSpotlight() {
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
}


export function initResumeModal() {
  const modal = document.getElementById('resume-modal');
  const openBtns = [
    document.getElementById('open-resume-preview-btn'),
    ...document.querySelectorAll('.open-resume-trigger')
  ].filter(Boolean);
  const closeBtn = document.getElementById('resume-modal-close-btn');
  const closeFooterBtn = document.getElementById('resume-modal-close-footer-btn');

  const pdfBtn = document.getElementById('download-resume-pdf');
  const printBtn = document.getElementById('print-resume-btn');

  function openResume() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  window.openResumeModal = openResume;

  function closeResume() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openResume();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeResume);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeResume);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeResume();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeResume();
    }
  });

  // 1. PDF Export / Print
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}


export function eradicateNetlifyWatermark() {
  function cleanup() {
    // 1. Selector based cleanup for Netlify badges/iframes/scripts
    const elements = document.querySelectorAll(
      '[class*="netlify-badge"], [id*="netlify-badge"], [data-netlify-badge], .netlify-badge, #netlify-badge, .netlify-badge-wrap'
    );
    elements.forEach(el => el.remove());

    // 2. Direct scan for external netlify.com badges
    document.querySelectorAll('a[href*="netlify.com"]').forEach(link => {
      // Don't remove our project links (e.g. app.netlify.app), only netlify.com badges
      if (link.hostname === 'www.netlify.com' || link.hostname === 'netlify.com' || (link.textContent && link.textContent.toLowerCase().includes('powered by netlify'))) {
        link.remove();
      }
    });

    // 3. Scan for any floating elements containing "Powered by Netlify"
    document.querySelectorAll('body > a, body > div').forEach(node => {
      const text = (node.textContent || '').trim().toLowerCase();
      if (text.includes('powered by netlify')) {
        node.remove();
      }
    });
  }

  cleanup();
  const observer = new MutationObserver(cleanup);
  observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================================================
// Mobile Navigation Drawer (Captivating Futuristic HUD)
// ==========================================================================
export function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('mobile-nav-close');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const links = document.querySelectorAll('.mobile-link');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// ==========================================================================
// Interactive Arsenal Category Filter Bar
// ==========================================================================
export function initArsenalFilter() {
  const filterBtns = document.querySelectorAll('.arsenal-filter-btn');
  const cards = document.querySelectorAll('#build-with-grid .bento-card, #build-with-grid .stack-box');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px) scale(0.96)';
          setTimeout(() => {
            const currentFilter = document.querySelector('.arsenal-filter-btn.active')?.getAttribute('data-filter');
            if (currentFilter !== 'all' && card.getAttribute('data-category') !== currentFilter) {
              card.style.display = 'none';
            }
          }, 240);
        }
      });
    });
  });
}

// ==========================================================================
// Vercel-Inspired Bento Grid: Radial Cursor Spotlight & Proof-of-Work Telemetry Popovers
// ==========================================================================
export function initBentoSpotlightAndPopovers() {
  const cards = document.querySelectorAll('.bento-card');
  const popover = document.getElementById('bento-pow-popover');
  const popProject = document.getElementById('pow-popover-project');
  const popRole = document.getElementById('pow-popover-role');
  const popDesc = document.getElementById('pow-popover-desc');
  const popMetric = document.getElementById('pow-popover-metric');

  // 1. Cursor-following radial spotlight for each Bento Card
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 2. Interactive Proof-of-Work Popovers for Tech Chips
  if (!popover) return;
  const chips = document.querySelectorAll('.bento-chip');
  let hideTimeout = null;
  let activeChip = null;

  function showPopover(chip) {
    if (hideTimeout) clearTimeout(hideTimeout);
    activeChip = chip;
    chips.forEach(c => c.classList.remove('bento-chip-active'));
    chip.classList.add('bento-chip-active');

    const project = chip.getAttribute('data-pow-project') || 'Production System';
    const role = chip.getAttribute('data-pow-role') || 'Full-Stack Implementation';
    const desc = chip.getAttribute('data-pow-desc') || 'Architectural telemetry details.';
    const metric = chip.getAttribute('data-pow-metric') || '3NF Normalized';

    if (popProject) popProject.textContent = project;
    if (popRole) popRole.textContent = role;
    if (popDesc) popDesc.textContent = desc;
    if (popMetric) popMetric.textContent = metric;

    // Position popover relative to chip viewport
    const rect = chip.getBoundingClientRect();
    const popWidth = Math.min(320, window.innerWidth - 30);
    const popHeight = popover.offsetHeight || 160;

    let left = rect.left + (rect.width / 2) - (popWidth / 2);
    
    // Check if positioning above chip would collide with the parent card header or top of viewport
    const card = chip.closest('.bento-card');
    let placeBelow = false;
    
    if (rect.top - popHeight - 14 < 15) {
      placeBelow = true;
    } else if (card) {
      const cardRect = card.getBoundingClientRect();
      // If placing above would cover the card's title group/header and there is space below
      if (rect.top - popHeight - 10 < cardRect.top + 75 && (rect.bottom + popHeight + 14 < window.innerHeight)) {
        placeBelow = true;
      }
    }

    let top = placeBelow ? (rect.bottom + 12) : (rect.top - popHeight - 12);

    // Viewport bounds protection
    if (top < 10) top = 10;
    if (top + popHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - popHeight - 10);
    }
    if (left < 14) left = 14;
    if (left + popWidth > window.innerWidth - 14) {
      left = window.innerWidth - popWidth - 14;
    }

    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.classList.add('active');
    popover.setAttribute('aria-hidden', 'false');
  }

  function dismissPopoverImmediate() {
    if (!popover.classList.contains('active')) return;
    if (hideTimeout) clearTimeout(hideTimeout);
    popover.classList.remove('active');
    popover.setAttribute('aria-hidden', 'true');
    if (activeChip) {
      activeChip.classList.remove('bento-chip-active');
      activeChip = null;
    }
  }

  function hidePopover() {
    hideTimeout = setTimeout(() => {
      dismissPopoverImmediate();
    }, 160);
  }

  chips.forEach(chip => {
    chip.addEventListener('mouseenter', () => showPopover(chip));
    chip.addEventListener('mouseleave', hidePopover);
    chip.addEventListener('focus', () => showPopover(chip));
    chip.addEventListener('blur', hidePopover);
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      // If tapping active chip again, toggle it closed
      if (activeChip === chip && popover.classList.contains('active')) {
        dismissPopoverImmediate();
      } else {
        showPopover(chip);
      }
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeChip === chip && popover.classList.contains('active')) {
          dismissPopoverImmediate();
        } else {
          showPopover(chip);
        }
      }
    });
  });

  popover.addEventListener('mouseenter', () => {
    if (hideTimeout) clearTimeout(hideTimeout);
  });
  popover.addEventListener('mouseleave', hidePopover);
  
  // Clicking the popover box itself dismisses it
  popover.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissPopoverImmediate();
  });

  // Touching the screen, touch-scrolling, or window-scrolling immediately dismisses the box
  window.addEventListener('scroll', dismissPopoverImmediate, { passive: true });
  window.addEventListener('touchmove', dismissPopoverImmediate, { passive: true });
  window.addEventListener('wheel', dismissPopoverImmediate, { passive: true });

  // Touching or clicking outside dismisses immediately
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.bento-chip')) {
      dismissPopoverImmediate();
    }
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.bento-chip')) {
      dismissPopoverImmediate();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bento-chip')) {
      dismissPopoverImmediate();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover.classList.contains('active')) {
      dismissPopoverImmediate();
    }
  });
}

// Initialize all features immediately
initProjectArchive();
initProjectModal();
initServicesSpotlight();
initGitHubHeatmap();
initContactForm();
initResumeModal();
initDinoDanceRunner();
initMobileNavigation();
initArsenalFilter();
initBentoSpotlightAndPopovers();
initCommandPalette();
eradicateNetlifyWatermark();

// ==========================================================================
// Quick Jump Spotlight & Command Palette (Reference Images 1 & 2)
// ==========================================================================
export function initCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('cmd-palette-input');
  const resultsContainer = document.getElementById('cmd-palette-results');
  const closeBtn = document.getElementById('cmd-palette-close-btn');
  const triggerBtn = document.getElementById('header-search-btn');
  const mobileTriggerBtn = document.getElementById('mobile-drawer-search-btn');

  if (!modal || !input || !resultsContainer) return;

  const searchIndex = [
    {
      id: 'celestine',
      type: 'project',
      title: 'Celestine University of the Pacific',
      desc: 'Flagship University Admissions & Enrollment Management System',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('celestine');
      }
    },
    {
      id: 'inventory-system',
      type: 'project',
      title: 'Inventory Management System',
      desc: 'Stock tracking, automated low-inventory alerts, and receipt generation',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('ncst-srms');
      }
    },
    {
      id: 'library-system',
      type: 'project',
      title: 'Library Management System',
      desc: 'Book cataloging, borrowing/return workflows, and patron fine tracking',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('celestine');
      }
    },
    {
      id: 'ui-sneakerhub',
      type: 'project',
      title: 'UI SneakerHub',
      desc: 'Responsive sneaker marketplace storefront with dynamic cart & filter preview',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('auramart');
      }
    },
    {
      id: 'hotel-reservation',
      type: 'project',
      title: 'Hotel Reservation Management System',
      desc: 'Room availability checker, guest billing, and reservation booking engine',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('fynn-hotel');
      }
    },
    {
      id: 'smartspace',
      type: 'project',
      title: 'SmartSpace',
      desc: '3D Room Planning & Furniture Visualizer powered by Three.js',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('smartspace');
      }
    },
    {
      id: 'miguelfit',
      type: 'project',
      title: 'MIGUEL.FIT - Biometric & Tactical OS',
      desc: 'Client-side biometric readiness command center & active resistance logging',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('miguelfit');
      }
    },
    {
      id: 'auramart',
      type: 'project',
      title: 'AURA MART - Boutique E-Commerce',
      desc: 'Curated retail catalog with responsive shopping bag and checkout pipeline',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('auramart');
      }
    },
    {
      id: 'grazingbull',
      type: 'project',
      title: 'The Grazing Bull - Restaurant Monorepo',
      desc: 'Fine-dining digital menu, table booking, and order operations',
      badge: 'Project',
      action: () => {
        if (typeof window.openProjectModal === 'function') window.openProjectModal('grazingbull');
      }
    },
    {
      id: 'sec-arsenal',
      type: 'section',
      title: 'Technical Arsenal & Architecture',
      desc: 'Frontend engineering, PHP MVCR, MySQL relational schemas, Canvas API',
      badge: 'Arsenal',
      action: () => {
        const el = document.getElementById('technologies');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'sec-certs',
      type: 'section',
      title: 'Verified Certifications & Accreditations',
      desc: 'SoloLearn accredited credentials in HTML5, CSS3, and JavaScript ES6+',
      badge: 'Credentials',
      action: () => {
        const el = document.getElementById('certificates');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'sec-resume',
      type: 'section',
      title: 'Curriculum Vitae & Official Resume',
      desc: 'ATS-standard dossier, printable layout, and direct PDF export',
      badge: 'Resume',
      action: () => {
        if (typeof window.openResumeModal === 'function') {
          window.openResumeModal();
        } else {
          const el = document.getElementById('resume');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'sec-activity',
      type: 'section',
      title: 'Engineering Activity & Commit Matrix',
      desc: 'GitHub telemetry, daily contribution streaks, and interactive Dino stage',
      badge: 'Activity',
      action: () => {
        const el = document.getElementById('activity');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'sec-contact',
      type: 'section',
      title: 'Direct Communication & Inquiries',
      desc: 'Connect via email, verified social channels, or direct inquiry form',
      badge: 'Contact',
      action: () => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  let filteredItems = [...searchIndex];
  let selectedIndex = 0;

  function openCommandPalette() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderResults('');
    setTimeout(() => {
      input.focus();
    }, 50);
  }

  function closeCommandPalette() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      filteredItems = [...searchIndex];
    } else {
      filteredItems = searchIndex.filter(item => {
        return item.title.toLowerCase().includes(q) ||
               item.desc.toLowerCase().includes(q) ||
               item.badge.toLowerCase().includes(q);
      });
    }

    selectedIndex = 0;

    if (filteredItems.length === 0) {
      resultsContainer.innerHTML = `
        <div class="cmd-empty-state">
          No records matching "<strong>${escapeHtml(query)}</strong>" found.
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filteredItems.map((item, idx) => `
      <div class="cmd-item ${idx === selectedIndex ? 'active' : ''}" data-idx="${idx}" role="option" aria-selected="${idx === selectedIndex}">
        <div class="cmd-item-icon-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${item.type === 'project'
              ? '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>'
              : '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline>'}
          </svg>
        </div>
        <div class="cmd-item-text">
          <div class="cmd-item-title">${item.title}</div>
          <div class="cmd-item-desc">${item.desc}</div>
        </div>
        <span class="cmd-item-badge">${item.badge}</span>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.cmd-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        executeItem(idx);
      });
      el.addEventListener('mouseenter', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        updateActiveHighlight(idx);
      });
    });
  }

  function updateActiveHighlight(newIndex) {
    if (filteredItems.length === 0) return;
    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;
    selectedIndex = newIndex;

    const items = resultsContainer.querySelectorAll('.cmd-item');
    items.forEach((item, idx) => {
      const isActive = idx === selectedIndex;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function executeItem(index) {
    const item = filteredItems[index];
    if (!item) return;
    closeCommandPalette();
    setTimeout(() => {
      if (typeof item.action === 'function') {
        item.action();
      }
    }, 120);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Keyboard navigation
  input.addEventListener('input', (e) => {
    renderResults(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateActiveHighlight(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateActiveHighlight(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeItem(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  });

  // Global Ctrl+K / Cmd+K listener
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('open')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeCommandPalette();
    }
  });

  if (triggerBtn) triggerBtn.addEventListener('click', openCommandPalette);
  if (mobileTriggerBtn) {
    mobileTriggerBtn.addEventListener('click', () => {
      const drawer = document.getElementById('mobile-nav-drawer');
      if (drawer) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
      openCommandPalette();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeCommandPalette);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('cmd-palette-container')) {
      closeCommandPalette();
    }
  });
}





export function initUI() {
  initProjectArchive();
  initServicesSpotlight();
  initResumeModal();
  eradicateNetlifyWatermark();
  initMobileNavigation();
  initArsenalFilter();
  initBentoSpotlightAndPopovers();
  initCommandPalette();
}
