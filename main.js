/**
 * Ultra-Smooth High-Fidelity Scroll-Driven Image Sequence Engine & Portfolio Controller
 * 300 Frames Background Scrubbing with Hardware Acceleration and High-Precision Lerp
 */

const TOTAL_FRAMES = 300;
const frameImages = new Array(TOTAL_FRAMES);

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

let targetProgress = 0;
let currentProgress = 0;
let lastRenderedIndex = -1;
let isDirty = true;
let isLoaded = false;

// Lock scroll during preloading so frames are never skipped
document.body.classList.add('is-loading');

// Generate 1-indexed padded frame filename (frame-001.webp ... frame-300.webp)
function getFrameUrl(index) {
  const padded = String(index).padStart(3, '0');
  return `frames/frame-${padded}.webp`;
}

// Retrieve the best available decoded frame (fallback to nearest ready frame)
function getBestFrame(index) {
  const target = frameImages[index];
  if (target && target.complete && target.naturalWidth > 0) {
    return target;
  }
  for (let i = index - 1; i >= 0; i--) {
    const f = frameImages[i];
    if (f && f.complete && f.naturalWidth > 0) return f;
  }
  for (let i = index + 1; i < TOTAL_FRAMES; i++) {
    const f = frameImages[i];
    if (f && f.complete && f.naturalWidth > 0) return f;
  }
  return null;
}

// Helper to calculate exact active frame index from current progress
function getCurrentFrameIndex() {
  return Math.min(
    TOTAL_FRAMES - 1,
    Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
  );
}

// Ensure Canvas buffer matches exact device display pixels for crisp HD/4K rendering
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Match documentElement clientWidth to eliminate scrollbar width mismatch distortion
  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = window.innerHeight;

  const targetWidth = Math.round(width * dpr);
  const targetHeight = Math.round(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  isDirty = true;
}

// Draw frame using mathematically exact object-fit: cover scaling
// Aspect ratio is 100% strictly preserved (renderW / renderH === iw / ih)
// Pixel-snapped coordinates eliminate subpixel antialiasing and blur on scroll
function drawFrame(frameIdx) {
  const img = getBestFrame(frameIdx);
  if (!img) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth || 1280;
  const ih = img.naturalHeight || 720;

  // True mathematical cover scale (zero distortion)
  const scale = Math.max(cw / iw, ch / ih);
  const renderW = Math.round(iw * scale);
  const renderH = Math.round(ih * scale);
  const offsetX = Math.round((cw - renderW) * 0.5);
  const offsetY = Math.round((ch - renderH) * 0.35); // Golden-ratio athlete focal center

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}

// Layout-safe Throttled Navbar Highlight Tracker
let navUpdatePending = false;
function scheduleNavUpdate() {
  if (navUpdatePending) return;
  navUpdatePending = true;
  requestAnimationFrame(() => {
    updateActiveNav();
    navUpdatePending = false;
  });
}

// Update scroll progress across entire portfolio document height
function updateScrollProgress() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
  
  if (maxScroll <= 0) {
    targetProgress = 0;
  } else {
    targetProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
  }

  scheduleNavUpdate();
}

// Active Navbar Highlight Tracker
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

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === `#${currentSection}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Butter-Smooth Lerp Animation Loop
function animate() {
  const LERP_FACTOR = 0.085;
  const diff = targetProgress - currentProgress;

  if (Math.abs(diff) > 0.00005) {
    currentProgress += diff * LERP_FACTOR;
  } else {
    currentProgress = targetProgress;
  }

  const targetIndex = getCurrentFrameIndex();

  // Redraw whenever frame changes or window resized
  if (targetIndex !== lastRenderedIndex || isDirty) {
    drawFrame(targetIndex);
    lastRenderedIndex = targetIndex;
    isDirty = false;
  }

  requestAnimationFrame(animate);
}

// High-Speed Progressive Frame Preloader with Distributed Keyframes & Scroll-Prioritized Streaming
async function preloadFrames() {
  let loadedCount = 0;

  function updateProgress(pct) {
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loaderText) loaderText.textContent = `Loading ${pct}%`;
  }

  const loadSingleFrame = (i) => {
    return new Promise((resolve) => {
      if (frameImages[i] && frameImages[i].complete && frameImages[i].naturalWidth > 0) {
        resolve(frameImages[i]);
        return;
      }
      const img = new Image();
      img.src = getFrameUrl(i + 1);

      img.onload = () => {
        frameImages[i] = img;
        loadedCount++;
        const activeIdx = getCurrentFrameIndex();
        if (Math.abs(i - activeIdx) <= 1) {
          isDirty = true;
          drawFrame(activeIdx);
        }
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {}).finally(() => resolve(img));
        } else {
          resolve(img);
        }
      };

      img.onerror = () => {
        frameImages[i] = frameImages[Math.max(0, i - 1)] || frameImages[0];
        resolve(frameImages[i]);
      };
    });
  };

  // 1. Immediately load and draw the first hero frame
  updateProgress(10);
  const firstFrame = await loadSingleFrame(0);
  frameImages[0] = firstFrame;
  resizeCanvas();
  drawFrame(0);
  updateProgress(25);

  // 2. Preload distributed keyframes across the entire scroll sequence (stride: 5)
  // This guarantees every section of the page has nearby ready frames immediately
  const keyframeIndices = [];
  const STRIDE = 5;
  for (let i = 1; i < TOTAL_FRAMES; i += STRIDE) {
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

  // Await keyframes or max 1200ms timeout
  await Promise.race([
    Promise.all(keyframePromises),
    new Promise((r) => setTimeout(r, 1200))
  ]);

  updateProgress(100);
  isLoaded = true;
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
  isDirty = true;

  // 3. Dynamic Scroll-Prioritized Streaming Queue (6 Parallel Workers) for in-between frames
  const pending = new Set();
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    if (!frameImages[i] || !frameImages[i].complete) {
      pending.add(i);
    }
  }

  function getNextFrame() {
    if (pending.size === 0) return null;
    const target = getCurrentFrameIndex();
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

// Event Listeners
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', () => {
  resizeCanvas();
  updateScrollProgress();
}, { passive: true });

// Keyboard scroll support
window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.code)) {
    updateScrollProgress();
  }
});

// Initialize
resizeCanvas();
preloadFrames();
requestAnimationFrame(animate);

// ==========================================================================
// Project Archive Filter & Interactive Modal Controller
// ==========================================================================

function initProjectArchive() {
  const filterBtns = document.querySelectorAll('.archive-filter-btn');
  const projectCard = document.querySelector('.project-card[data-category="collaborative"]');
  const soloShowcase = document.getElementById('solo-placeholder-card');
  const myProjectsCard = document.getElementById('my-projects-showcase-card');
  const switchBtns = document.querySelectorAll('.filter-switch-btn');

  function showElement(el, displayType = 'block') {
    if (!el) return;
    el.style.display = displayType;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  function hideElement(el) {
    if (!el) return;
    el.style.display = 'none';
  }

  function setFilter(filter) {
    filterBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (filter === 'all') {
      // Show Celestine in its original large front view (display: flex)
      showElement(projectCard, 'flex');
      showElement(soloShowcase, 'block');
      showElement(myProjectsCard, 'block');
    } else if (filter === 'collaborative') {
      // Show Celestine (large front view) and Collaborative Bookshelf Showcase; hide My Projects
      showElement(projectCard, 'flex');
      showElement(soloShowcase, 'block');
      hideElement(myProjectsCard);
    } else if (filter === 'my-projects') {
      // When "MY PROJECTS" is selected, ALL collaborative projects are completely OUT OF SIGHT!
      hideElement(projectCard);
      hideElement(soloShowcase);
      showElement(myProjectsCard, 'block');
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target-filter') || 'all';
      setFilter(target);
    });
  });

  // Synchronous initial view state matching 'all'
  setFilter('all');
}

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalKicker = document.getElementById('modal-kicker');
  const modalTitle = document.getElementById('modal-title');
  const modalLeadText = document.getElementById('modal-lead-text');
  const modalSecondaryText = document.getElementById('modal-secondary-text');
  const modalGalleryTabs = document.getElementById('modal-gallery-tabs');
  const displayImg = document.getElementById('modal-display-img');
  const captionEl = document.getElementById('modal-image-caption');
  const modalHighlightsGrid = document.getElementById('modal-highlights-grid');
  const modalTechPills = document.getElementById('modal-tech-pills');
  const modalFooterLinks = document.getElementById('modal-footer-links');
  const modalNavLabel = document.getElementById('modal-nav-label');
  const modalProjectTabs = document.getElementById('modal-project-tabs');

  // Separated archives: collaborative projects ONLY in collaboration, solo projects ONLY in independent
  const collaborativeTabsList = [
    { id: 'celestine', label: '01 — Celestine' },
    { id: 'ncst-srms', label: '02 — NCST SRMS' },
    { id: 'fynn-hotel', label: '03 — Fynn Hotel' },
    { id: 'smartspace', label: '04 — SmartSpace' }
  ];

  const soloTabsList = [
    { id: 'miguelfit', label: '05 — MIGUEL.FIT' },
    { id: 'auramart', label: '06 — AURA MART' },
    { id: 'grazingbull', label: '07 — The Grazing Bull' }
  ];

  const closeBtn = document.getElementById('modal-close-btn');
  const closeFooterBtn = document.getElementById('modal-close-footer-btn');

  const projectsData = {
    celestine: {
      kicker: '01 — FEATURED COLLABORATIVE CASE STUDY • ACADEMIC MVCR ARCHITECTURE',
      title: '01 — Celestine University of the Pacific (CUP)',
      leadText: '<strong>Celestine University of the Pacific (CUP)</strong> is a comprehensive, enterprise-grade academic management ecosystem engineered in close collaboration with the <strong>Yakuzokai</strong> development team. Built from the ground up on a robust <strong>PHP Model-View-Controller-Repository (MVCR)</strong> architecture and an optimized relational MySQL schema (<code>celestine_university.sql</code>), CUP modernizes institutional operations across online applicant intake, real-time asynchronous validation (<code>ajax_validate.php</code>), automated course enrollments (<code>Enrollment/</code>), and fault-tolerant student records management.',
      secondaryText: 'The system decouples data queries into a dedicated Repository layer (<code>repositories/</code>), isolating business controllers (<code>controllers/</code>) and domain models (<code>models/</code>) from presentation views (<code>views/</code>). With centralized request routing (<code>routes/</code>, <code>.htaccess</code>), custom exception recovery (<code>errors/</code>), structured audit logging (<code>logs/</code>), and secure document storage (<code>storage/</code>, <code>uploads/</code>), CUP guarantees zero data corruption, sub-second query performance, and rock-solid system stability.',
      gallery: [
        {
          key: 'hero',
          label: '1. Coastal Admissions Portal',
          src: 'assets/projects/celestine-hero.png',
          caption: '<strong>View 1:</strong> Digital Admissions &amp; Campus Portal — Featuring live applicant metrics (4,200+ Students, 150+ Faculty, 98% Graduation Rate) and modern application gateway.'
        },
        {
          key: 'global',
          label: '2. Global Campuses System',
          src: 'assets/projects/celestine-global.png',
          caption: '<strong>View 2:</strong> Global Campuses System — Multi-campus international directory supporting London, Tokyo, Sydney, Toronto, and Singapore academic hubs.'
        }
      ],
      highlights: [
        {
          icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
          title: 'Enterprise PHP MVCR Architecture',
          desc: 'Strict separation of concerns isolating database transactions in Repositories (<code>repositories/</code>), domain entities (<code>models/</code>), business logic (<code>controllers/</code>), and dynamic UI (<code>views/</code>) for high throughput and zero architectural failures.'
        },
        {
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
          title: 'Asynchronous Intake &amp; Validation Engine',
          desc: 'Real-time student registration and applicant verification powered by <code>ajax_validate.php</code> and modular <code>Enrollment/</code> pipelines, eliminating latency and submission failures.'
        },
        {
          icon: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
          title: 'Relational MySQL &amp; Secure Storage',
          desc: 'Synchronized <code>celestine_university.sql</code> relational database schema fortified by <code>.env</code> environment security, structured <code>logs/</code> audit trails, and isolated <code>storage/</code> document uploads.'
        },
        {
          icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
          title: 'Centralized Routing &amp; Fault Tolerance',
          desc: 'Unified request routing via Apache <code>.htaccess</code> and <code>routes/</code> dispatcher, combined with custom <code>errors/</code> handlers ensuring seamless user recovery without system crashes.'
        }
      ],
      techStack: [
        { dot: 'php-dot', name: 'PHP 8.x (Core Backend)' },
        { dot: 'mvc-dot', name: 'MVCR Architecture' },
        { dot: 'sql-dot', name: 'MySQL (celestine_university.sql)' },
        { dot: 'red-dot', name: 'Repository Pattern (Data Access Layer)' },
        { dot: 'fast-dot', name: 'AJAX Async Validation (ajax_validate.php)' },
        { dot: 'node-dot', name: 'RESTful API Architecture (api/)' },
        { dot: 'mint-dot', name: 'Modular Enrollment Engine (Enrollment/)' },
        { dot: 'yield-dot', name: 'Apache URL Rewriting (.htaccess & routes/)' },
        { dot: 'mint-dot', name: 'Environment Security (.env & config/)' },
        { dot: 'fast-dot', name: 'System Audit & Error Logging (logs/ & errors/)' },
        { dot: 'red-dot', name: 'Secure Document Storage (storage/ & uploads/)' },
        { dot: 'js-dot', name: 'JavaScript (ES6+)' },
        { dot: 'bs-dot', name: 'Bootstrap 5' },
        { dot: 'html-dot', name: 'HTML5 / Semantic UI' },
        { dot: 'css-dot', name: 'CSS3 Flexbox/Grid' }
      ],
      footerLinks: '<a href="https://github.com/Yakuzokai/CUP" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> GitHub Repository</a>'
    },

    'ncst-srms': {
      kicker: '02 — COLLABORATIVE PRODUCTION CASE STUDY • ACADEMIC OPERATIONS',
      title: '02 — NCST Student Record Management System (SRMS)',
      leadText: '<strong>NCST Student Record Management System (SRMS)</strong> is a synchronized, hybrid school operations platform co-engineered with a multidisciplinary development team and powered by a shared MySQL database (<code>ncst_srms_db</code>). It couples a high-throughput Python/PyQt6 desktop client for administrative workflows (registrar, RBAC, enrollment, grading, billing, encrypted automated backups) with a modern PHP web portal for public registration, self-service student/faculty access (grades, COR, document tracking), and PayMongo-integrated payment handling.',
      secondaryText: 'The dual-client architecture synchronizes administrative back-office actions with student web transactions in real time, eliminating institutional data silos while guaranteeing automated scheduled encrypted backups and sub-second registrar query response.',
      gallery: [
        {
          key: 'desktop',
          label: '1. Administrative Desktop (PyQt6)',
          src: 'assets/projects/ncst-srms-desktop.jpg',
          caption: '<strong>View 1: Desktop Registrar Operations:</strong> Python/PyQt6 administrative client featuring student masterfile management, enrollment analytics, academic standing distribution, and automated grade encode/lock.'
        },
        {
          key: 'portal',
          label: '2. Student Web Portal & PayMongo',
          src: 'assets/projects/ncst-srms-portal.jpg',
          caption: '<strong>View 2: Self-Service Web Portal:</strong> PHP student portal with multi-step enrollment checklist, live grade viewing, Certificate of Registration (COR) generation, and PayMongo digital payment integration (GCash, Cards, Maya).'
        },
        {
          key: 'banner',
          label: '3. Synchronized Hybrid Ecosystem',
          src: 'assets/projects/ncst-srms-banner.jpg',
          caption: '<strong>View 3: Dual-Client Hybrid Architecture:</strong> Unified MySQL relational schema (ncst_srms_db) simultaneously serving the PyQt6 registrar desktop workstation and responsive student web portal.'
        }
      ],
      highlights: [
        {
          icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
          title: 'Python / PyQt6 Desktop Suite',
          desc: 'High-throughput native desktop client engineered for registrars and finance officers, featuring granular RBAC permissions, student masterfiles, and automated grade encode/lock.'
        },
        {
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
          title: 'Self-Service Student & Faculty Portal',
          desc: 'Cloud-accessible web portal providing students instant access to digital Certificates of Registration (COR), official grade transcripts, and document clearance tracking.'
        },
        {
          icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',
          title: 'PayMongo Payment Automation',
          desc: 'Integrated payment processing pipeline supporting GCash, debit/credit cards, and digital wallets with instantaneous ledger settlement and automated fee receipts.'
        },
        {
          icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
          title: 'Shared MySQL & Encrypted Backups',
          desc: 'Centralized ncst_srms_db database cluster with automated scheduled encrypted backup routines for zero data loss and fault-tolerant institutional continuity.'
        }
      ],
      techStack: [
        { dot: 'python-dot', name: 'Python 3' },
        { dot: 'red-dot', name: 'PyQt6' },
        { dot: 'php-dot', name: 'PHP (PDO)' },
        { dot: 'sql-dot', name: 'MySQL (ncst_srms_db)' },
        { dot: 'paymongo-dot', name: 'PayMongo API' },
        { dot: 'js-dot', name: 'JavaScript (ES6+)' },
        { dot: 'bs-dot', name: 'Bootstrap / CSS3' },
        { dot: 'mvc-dot', name: 'Automated Encrypted Backups' }
      ],
      footerLinks: '<a href="https://github.com/Yakuzokai/SRMS" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a><span class="modal-badge-meta"><span class="pill-dot red-dot"></span> Collaborative Production Platform • Team Co-Engineered</span>'
    },

    'fynn-hotel': {
      kicker: '03 — COLLABORATIVE PRODUCTION CASE STUDY • HOSPITALITY MONOREPO',
      title: '03 — Fynn Boutique Hotel – Management & Booking System',
      leadText: '<strong>Fynn Boutique Hotel – Management and Booking System</strong> is an enterprise full-stack hospitality platform co-engineered with a dedicated software team, built on PHP 8.1+ (PDO MySQL) and Bootstrap 5.3. It unifies guest booking journeys (dynamic pricing, coupon handling, branded invoices) with enterprise operational controls: real-time housekeeping SLA tracking, mobile staff dispatch, dynamic yield management (RevPAR, ADR, Occupancy KPIs), a two-tier financial refund workflow with reconciliation, an async dead-letter communication outbox, and token-authenticated encrypted database backups (<code>BACKUP_CRON_TOKEN</code>).',
      secondaryText: 'Architected as a modular PHP monorepo, the platform delivers high-concurrency reservation throughput, strict transaction isolation, and fine-grained role delegation across front-desk staff, housekeeping dispatchers, and financial auditors.',
      gallery: [
        {
          key: 'banner',
          label: '1. Yield Management & Bookings',
          src: 'assets/projects/fynn-hotel-banner.jpg',
          caption: '<strong>View 1: Executive KPI Dashboard:</strong> Live yield management computing Occupancy Rate (94%), RevPAR ($315.00), and ADR ($335.10) alongside an interactive booking calendar and luxury suite inventory.'
        },
        {
          key: 'ops',
          label: '2. Housekeeping SLA & Dispatch',
          src: 'assets/projects/fynn-hotel-ops.jpg',
          caption: '<strong>View 2: Operational Dispatch Portal:</strong> Real-time room turnaround tracking (Cleaned, In-Progress, Inspection Pending), mobile staff dispatch queue, turnaround timers, and audit-logged refund reconciliations.'
        }
      ],
      highlights: [
        {
          icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
          title: 'Dynamic Yield Management & KPIs',
          desc: 'Automated executive metrics computing RevPAR, ADR, and real-time Occupancy percentages paired with dynamic rate adjustments and promotional coupon logic.'
        },
        {
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>',
          title: 'Housekeeping SLA & Mobile Dispatch',
          desc: 'Live room turnaround workflow featuring countdown SLA timers, status inspection queues, and automated mobile task dispatching for operational teams.'
        },
        {
          icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',
          title: 'Two-Tier Refund & Reconciliation',
          desc: 'Financial auditing pipeline with dual-authorization refund approval stages, ledger audit trails, and automated branded PDF invoice generation.'
        },
        {
          icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
          title: 'Async Dead-Letter Outbox & Backups',
          desc: 'Resilient background communication queue with dead-letter retry logic, and token-authenticated (BACKUP_CRON_TOKEN) scheduled encrypted database backups.'
        }
      ],
      techStack: [
        { dot: 'php-dot', name: 'PHP 8.1+' },
        { dot: 'sql-dot', name: 'PDO MySQL' },
        { dot: 'bs-dot', name: 'Bootstrap 5.3' },
        { dot: 'yield-dot', name: 'Yield KPIs (RevPAR/ADR)' },
        { dot: 'red-dot', name: 'Housekeeping SLA Queue' },
        { dot: 'mvc-dot', name: 'Two-Tier Refund Pipeline' },
        { dot: 'fast-dot', name: 'Dead-Letter Outbox' },
        { dot: 'red-dot', name: 'BACKUP_CRON_TOKEN' }
      ],
      footerLinks: '<a href="https://github.com/Yakuzokai/Hotel-Project" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a><span class="modal-badge-meta"><span class="pill-dot red-dot"></span> Collaborative Hospitality Monorepo • Team Co-Engineered</span>'
    },

    smartspace: {
      kicker: '04 — COLLABORATIVE PRODUCTION CASE STUDY • SPATIAL AI & WEBGL',
      title: '04 — SmartSpace – AI-Assisted Spatial Planning Platform',
      leadText: '<strong>SmartSpace</strong> is an AI-assisted spatial planning platform co-engineered with a cross-functional development team to eliminate e-commerce "spatial fit blindness" by decoupling generative perceptual AI (Google Gemini 2.0 Flash) from an authoritative, deterministic mathematical geometry engine. Featuring a Figma-faithful architectural aesthetic, it combines a Vue 3.5+ / Three.js (r170+) WebGL planner, a Laravel 11.x REST API (Sanctum), an 11-table MySQL 8.0 schema, and a FastAPI microservice.',
      secondaryText: 'The platform locks 3D meshes at a strict 1.000 scale and computes spatial validity via an explainable 0–100 mathematical compatibility score enforcing strict boundaries, collision detection, and human clearance envelopes with sub-millisecond execution latency (P95 < 0.4 ms).',
      gallery: [
        {
          key: 'banner',
          label: '1. 3D WebGL Spatial Planner',
          src: 'assets/projects/smartspace-banner.jpg',
          caption: '<strong>View 1: Figma-Faithful WebGL Viewport:</strong> Three.js (r170+) isometric room planner with strict 1.000 mesh scaling, millimeter dimensioning, Google Gemini 2.0 Flash AI suggestion engine, and live 98/100 Spatial Compatibility Score.'
        },
        {
          key: 'engine',
          label: '2. Collision & Clearance Engine',
          src: 'assets/projects/smartspace-engine.jpg',
          caption: '<strong>View 2: Deterministic Geometry Microservice:</strong> Real-time 3D collision wireframes, human clearance envelope heatmap analysis, and sub-millisecond mathematical benchmarks (P95 latency 0.38 ms).'
        }
      ],
      highlights: [
        {
          icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
          title: 'Decoupled Perceptual AI (Gemini 2.0)',
          desc: 'Synthesizes generative design intent through Google Gemini 2.0 Flash without violating physical constraints, converting natural language into validated layouts.'
        },
        {
          icon: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
          title: 'Deterministic Geometry Engine (P95 < 0.4ms)',
          desc: 'Ultra-fast mathematical physics calculating collision boundaries and human ergonomics clearance envelopes with sub-millisecond P95 execution time.'
        },
        {
          icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
          title: 'Vue 3.5+ & Three.js (r170+) WebGL Viewport',
          desc: 'Interactive 3D isometric planner enforcing strict 1.000 mesh scaling and millimeter-precision furniture placement with smooth 60fps rendering.'
        },
        {
          icon: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>',
          title: 'Laravel 11 REST & FastAPI Microservice',
          desc: 'High-performance dual backend architecture pairing Sanctum-authenticated Laravel APIs with high-throughput Python FastAPI microservices over 11 MySQL tables.'
        }
      ],
      techStack: [
        { dot: 'vue-dot', name: 'Vue 3.5+' },
        { dot: 'js-dot', name: 'Three.js (r170+)' },
        { dot: 'ai-dot', name: 'Google Gemini 2.0 Flash' },
        { dot: 'fast-dot', name: 'FastAPI (Python)' },
        { dot: 'laravel-dot', name: 'Laravel 11.x REST' },
        { dot: 'sql-dot', name: 'MySQL 8.0 (11 Tables)' },
        { dot: 'red-dot', name: 'P95 < 0.4ms Geometry Engine' },
        { dot: 'html-dot', name: 'WebGL Strict 1.000 Scale' }
      ],
      footerLinks: '<a href="https://github.com/Yakuzokai/smartspace" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a><span class="modal-badge-meta"><span class="pill-dot red-dot"></span> Collaborative Spatial AI &amp; WebGL • Team Co-Engineered</span>'
    },

    miguelfit: {
      kicker: '05 — INDEPENDENT PRODUCTION CASE STUDY • CLIENT-SIDE ARCHITECTURE',
      title: '05 — MIGUEL.FIT – Biometric & Tactical Performance OS',
      leadText: '<strong>MIGUEL.FIT (Performance OS)</strong> is an uncompromising client-centric fitness command center built as a pure, zero-dependency Single-Page Application (SPA) utilizing semantic HTML5, modern vanilla JavaScript (ES6+), and Bootstrap 5.3.3. Engineered to counter superficial trackers through its core philosophy: <em>"Precision execution over empty motivation // Zero Noise,"</em> it delivers clinically validated mathematical modeling, real-time biometric readiness tracking, and active resistance logging entirely client-side.',
      secondaryText: 'Eliminating backend database overhead and compilation pipelines, athlete data persists locally via <code>localStorage</code> with dedicated JSON backup subsystems. An OLED-optimized, glassmorphic dark interface pairs with a procedural Web Audio API synthesizer that generates real-time auditory rest interval cues with zero external media requests.',
      gallery: [
        {
          key: 'today',
          label: '1. Today (Command Center)',
          src: 'assets/projects/miguelfit-today.png',
          caption: '<strong>View 1: Today (Command Center):</strong> Real-time training readiness evaluation (0–100%) through an interactive conic-gradient gauge, balancing recovery, hydration metrics, and contextual training recommendations.'
        },
        {
          key: 'workout',
          label: '2. Workout (Tactical Rig)',
          src: 'assets/projects/miguelfit-workout.png',
          caption: '<strong>View 2: Workout (Tactical Rig):</strong> Pre-programmed, periodized compound splits, active set-by-set logger with live session volume tracking, and an integrated SVG-driven tactical rest interval timer.'
        },
        {
          key: 'fuel',
          label: '3. Fuel (Metabolic Station)',
          src: 'assets/projects/miguelfit-fuel.png',
          caption: '<strong>View 3: Fuel (Metabolic Station):</strong> Fluid intake and macronutrient partitioning calibrated via the Mifflin-St Jeor equation scaled to training frequency, tailored for hypertrophy and athletic performance.'
        },
        {
          key: 'progress',
          label: '4. Progress (Analytics & PRs)',
          src: 'assets/projects/miguelfit-progress.png',
          caption: '<strong>View 4: Progress (Analytics & Hall of Fame):</strong> Longitudinal performance data, automated Personal Record (1RM) updates derived via the Epley formulation, weekly tonnage curves, and tiered discipline milestones.'
        }
      ],
      highlights: [
        {
          icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
          title: 'Zero-Dependency SPA Runtime',
          desc: 'Architected with semantic HTML5, modern vanilla ES6+ JavaScript, and Bootstrap 5.3.3. Runs entirely client-side with zero framework bloat and instant load times.'
        },
        {
          icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
          title: 'Validated Exercise Physiology Math',
          desc: 'Daily energy expenditures projected dynamically via the Mifflin-St Jeor formula; maximum strength capacities calculated through the clinically validated Epley 1RM formula.'
        },
        {
          icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
          title: 'Procedural Web Audio API Synthesizer',
          desc: 'Generates real-time acoustic tones and rest timer interval chimes procedurally through the browser audio synthesizer with zero external media requests or latency.'
        },
        {
          icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
          title: 'Offline-First Local Storage Engine',
          desc: 'Persists reactive athlete logs, hydration, and PR tracking locally in the browser with zero cloud vulnerability, coupled with full JSON data export and restore pipelines.'
        }
      ],
      techStack: [
        { dot: 'html-dot', name: 'Semantic HTML5' },
        { dot: 'js-dot', name: 'Vanilla JavaScript (ES6+)' },
        { dot: 'bs-dot', name: 'Bootstrap 5.3.3' },
        { dot: 'sql-dot', name: 'Offline-First / localStorage' },
        { dot: 'fast-dot', name: 'Web Audio API' },
        { dot: 'yield-dot', name: 'Mifflin-St Jeor Engine' },
        { dot: 'red-dot', name: 'Epley 1RM Formulation' },
        { dot: 'mint-dot', name: 'OLED Dark Glassmorphism' }
      ],
      footerLinks: '<a href="https://aesthetic-toffee-3de2c5.netlify.app/spa.html" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Launch Live App</a><a href="https://github.com/ninomiguel69" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> GitHub Profile</a>'
    },

    auramart: {
      kicker: '06 — INDEPENDENT PRODUCTION CASE STUDY • BOUTIQUE E-COMMERCE',
      title: '06 — AURA MART – Atmospheric Boutique E-Commerce Platform',
      leadText: '<strong>AURA MART</strong> is an original boutique e-commerce concept conceived, architected, and built from the ground up by <strong>Niño Miguel S. Rodriguez</strong>. Engineered as a high-performance Single-Page Application (SPA) using semantic HTML5, modern vanilla JavaScript (ES6+), and <strong>Bootstrap 5</strong>, it merges atmospheric dark-mode glassmorphism with an ultra-lightweight, zero-bloat architecture.',
      secondaryText: 'Designed to make online shopping feel fluid, captivating, and effortless, the platform features instant client-side search, real-time category filtering, quick-view product modals, and an interactive slide-over cart drawer with dynamic free-shipping progress. Powered by a standalone Node.js REST service with atomic JSON file persistence (<code>data/aura_db.json</code>), AURA MART guarantees sub-millisecond speeds and crash-proof reliability—showcasing modern web commerce built on original developer vision.',
      gallery: [
        {
          key: 'hero',
          label: '1. Storefront & Orbit',
          src: 'assets/projects/auramart-hero.png',
          caption: '<strong>View 1: Atmospheric Storefront (The Edit You Can Feel):</strong> Dark-mode glassmorphic interface with radial violet ambient glow, Fraunces serif typography, dynamic collection CTAs, and floating orbital object portal.'
        },
        {
          key: 'drop',
          label: '2. The Aura Drop & Catalog',
          src: 'assets/projects/auramart-drop.png',
          caption: '<strong>View 2: The Aura Drop (Catalog & Micro-Interactions):</strong> Live category filtering across Fashion, Motion, Tech, and Home, interactive drop countdown timer, real-time wishlist heart toggles, and dynamic add-to-cart particle trails.'
        }
      ],
      highlights: [
        {
          icon: '<circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
          title: 'Original Concept & Boutique Architecture',
          desc: 'Conceived and engineered by Niño Miguel S. Rodriguez, merging dark-mode glassmorphism, refined typography, and smooth micro-interactions without runtime bloat.'
        },
        {
          icon: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
          title: 'Client-Side Search & Reactive Cart Drawer',
          desc: 'Real-time instant product filtering, quick-view inspection modals, interactive wishlist manager, and slide-over cart drawer with dynamic free-shipping threshold calculations.'
        },
        {
          icon: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>',
          title: 'Zero-Dependency Node.js REST Service',
          desc: 'Independent HTTP REST microservice providing structured JSON endpoints (/api/health, /api/products, /api/orders, /api/subscribers) without external heavyweight frameworks.'
        },
        {
          icon: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>',
          title: 'Atomic File-Backed JSON Persistence',
          desc: 'Sub-millisecond latency file-backed storage layer (data/aura_db.json) persisting transactional orders, catalog updates, and newsletter subscribers with atomic disk guarantees.'
        }
      ],
      techStack: [
        { dot: 'html-dot', name: 'Semantic HTML5' },
        { dot: 'js-dot', name: 'Vanilla JavaScript (ES6+)' },
        { dot: 'bs-dot', name: 'Bootstrap 5.3' },
        { dot: 'node-dot', name: 'Node.js REST Service' },
        { dot: 'sql-dot', name: 'Atomic JSON DB (aura_db.json)' },
        { dot: 'mint-dot', name: 'Niño Miguel Original Concept' },
        { dot: 'red-dot', name: 'Reactive Cart & Wishlist' },
        { dot: 'fast-dot', name: 'Glassmorphic Design System' }
      ],
      footerLinks: '<a href="https://tangerine-sopapillas-47b121.netlify.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Launch Live App</a><a href="https://github.com/ninomiguel69" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> GitHub Profile</a>'
    },

    grazingbull: {
      kicker: '07 — ENTERPRISE PRODUCTION CASE STUDY • AGTECH & LIVESTOCK GENETICS',
      title: '07 — The Grazing Bull – Cattle Genetics & Sustainable Ranching Platform',
      leadText: 'Founded over 55 years ago, <strong>The Grazing Bull</strong> has evolved from an esteemed family ranch into an industry-leading cattle genetics and sustainable agriculture enterprise. Guided under the executive leadership of <strong>Niño Miguel S. Rodriguez (Chief Executive Officer)</strong>, this enterprise digital platform brings half a century of ranching heritage into the modern digital era.',
      secondaryText: 'Built with semantic HTML5, modern JavaScript, and <strong>Bootstrap 5</strong>, the platform offers commercial partners and clients a seamless portal to explore proven herd genetics lineages, ethical pasture grazing charters, and veterinary-supervised nutrition programs. Anchored by core values of <em>Animal Welfare, Sustainability, and Scientific Innovation</em>, it sets the standard for modern agri-enterprise technology.',
      gallery: [
        {
          key: 'hero',
          label: '1. Ranch Heritage & Portal',
          src: 'assets/projects/grazingbull-hero.png',
          caption: '<strong>View 1: Ranch Heritage & Services Portal:</strong> Dynamic hero showcase with responsive navigation (About Us, Business Profile, Services, Herd Genetics, Sustainability, Gallery), video/image pasture backdrop, and primary service gateway.'
        },
        {
          key: 'leadership',
          label: '2. Executive Leadership & Values',
          src: 'assets/projects/grazingbull-full.png',
          caption: '<strong>View 2: Executive Leadership & Corporate Governance:</strong> Executive directory led by CEO Niño Miguel S. Rodriguez, genetics directorate, sustainability charters, and 8 foundational core values.'
        }
      ],
      highlights: [
        {
          icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
          title: '55-Year Heritage & Scientific Breeding',
          desc: 'Over half a century of cattle ranching tradition united with modern selective genetics, bovine lineage registries, and pasture health benchmarks.'
        },
        {
          icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
          title: 'Executive Leadership Governance',
          desc: 'Spearheaded by CEO Niño Miguel S. Rodriguez alongside dedicated executive directors across Genetics, Sustainability, Finance, Marketing, and Risk.'
        },
        {
          icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
          title: 'Herd Genetics & Vitality Registry',
          desc: 'Comprehensive bovine lineage records, genetic marker tracking, and natural pasture nutrition methodologies to ensure maximum livestock vitality.'
        },
        {
          icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
          title: 'Bootstrap 5 & Enterprise AgTech Architecture',
          desc: 'Responsive modern web architecture delivering rapid consultation channels, high-resolution ranch showcases, and ethical sustainability standards.'
        }
      ],
      techStack: [
        { dot: 'html-dot', name: 'Semantic HTML5' },
        { dot: 'js-dot', name: 'JavaScript (ES6+)' },
        { dot: 'bs-dot', name: 'Bootstrap 5.3' },
        { dot: 'mint-dot', name: 'AgTech Enterprise Platform' },
        { dot: 'red-dot', name: 'CEO Niño Miguel S. Rodriguez' },
        { dot: 'yield-dot', name: 'Herd Genetics Registry' },
        { dot: 'paymongo-dot', name: 'Commercial Inquiries Portal' },
        { dot: 'mvc-dot', name: '55-Year Ranch Heritage' }
      ],
      footerLinks: '<a href="https://rodriguezninomiguelbsit-12a3.netlify.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Launch Live App</a><a href="https://github.com/ninomiguel69" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> GitHub Profile</a>'
    }
  };

  projectsData['aura-mart'] = projectsData.auramart;
  projectsData['grazing-bull'] = projectsData.grazingbull;

  let currentProject = 'celestine';

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loadProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data) return;
    currentProject = projectId;

    // 1. Update kicker and title
    if (modalKicker) modalKicker.textContent = data.kicker;
    if (modalTitle) modalTitle.textContent = data.title;

    // 2. Separate switch archives: Collaborative only for collaborative projects, Independent only for solo projects
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
          loadProjectModal(targetId);
        });
      });

      const currentActiveTab = modalProjectTabs.querySelector(`.modal-proj-tab[data-proj-id="${projectId}"]`);
      if (currentActiveTab && typeof currentActiveTab.scrollIntoView === 'function') {
        currentActiveTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }

    // 3. Update lead text
    if (modalLeadText) modalLeadText.innerHTML = data.leadText;
    if (modalSecondaryText) modalSecondaryText.innerHTML = data.secondaryText;

    // 4. Update gallery buttons and display initial image
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

    // 5. Update Highlights Grid
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

    // 6. Update Tech Stack Pills
    if (modalTechPills) {
      modalTechPills.innerHTML = data.techStack.map(t => `
        <span class="tech-pill"><span class="pill-dot ${t.dot}"></span>${t.name}</span>
      `).join('');
    }

    // 7. Update Footer Links
    if (modalFooterLinks) {
      modalFooterLinks.innerHTML = data.footerLinks;
    }

    // 8. Reset modal scroll to top
    const modalBody = modal ? modal.querySelector('.modal-body') : null;
    if (modalBody) modalBody.scrollTop = 0;
  }

  // Celestine openers
  const celestineBtns = [
    document.getElementById('open-celestine-btn'),
    document.getElementById('open-celestine-modal-visual')
  ].filter(Boolean);

  celestineBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      loadProjectModal('celestine');
      openModal();
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadProjectModal('celestine');
        openModal();
      }
    });
  });

  // Bookshelf cards & open buttons
  const bookshelfCards = document.querySelectorAll('.bookshelf-card');
  bookshelfCards.forEach(card => {
    const projId = card.getAttribute('data-project-id');
    card.addEventListener('click', (e) => {
      // If clicked on button inside, button handler will handle or delegate cleanly
      if (!projId) return;
      loadProjectModal(projId);
      openModal();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!projId) return;
        e.preventDefault();
        loadProjectModal(projId);
        openModal();
      }
    });
  });

  const projectModalBtns = document.querySelectorAll('.open-project-modal-btn');
  projectModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetProj = btn.getAttribute('data-project-target');
      loadProjectModal(targetProj);
      openModal();
    });
  });

  // In-modal quick project switcher tabs are dynamically rendered & bound in loadProjectModal
  // ensuring clean separation between Collaborative Projects and Independent Solo Projects.

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);

  // Close when clicking modal backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// ==========================================================================
// Interactive Services Spotlight Glow Controller
// ==========================================================================
function initServicesSpotlight() {
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

// ==========================================================================
// Interactive GitHub Contribution Matrix Heatmap
// ==========================================================================
function initGitHubHeatmap() {
  const grid = document.getElementById('github-heatmap-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // Create floating tooltip element
  let tooltip = document.querySelector('.heatmap-floating-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'heatmap-floating-tooltip';
    document.body.appendChild(tooltip);
  }

  const TOTAL_WEEKS = 52;
  const DAYS_PER_WEEK = 7;
  const endDate = new Date(2026, 8, 19); // Sep 19, 2026

  // Exact contribution coordinates matching user profile (27 total contributions)
  const activityMap = {
    // March
    '27-1': 1, // Mon
    '27-3': 1, // Wed
    // June
    '39-5': 1, // Fri
    // July
    '43-3': 1, // Wed
    '44-5': 2, // Fri
    // August
    '48-5': 1, // Fri
    '48-6': 2, // Sat
    '49-2': 1, // Tue
    '49-4': 4, // Thu
    // September (intense sprint on CUP and portfolio)
    '50-1': 1, // Mon
    '51-3': 2, // Wed
    '51-5': 3, // Fri
    '52-1': 4, // Mon
    '52-2': 2, // Tue
    '52-3': 1  // Wed
  };

  for (let d = 0; d < DAYS_PER_WEEK; d++) {
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const cell = document.createElement('div');
      cell.className = 'heat-cell';

      const key = `${w + 1}-${d}`;
      const count = activityMap[key] || 0;

      let level = 0;
      if (count >= 4) level = 4;
      else if (count === 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;

      cell.classList.add(`l${level}`);

      // Calculate approximate date for tooltip
      const daysBack = ((TOTAL_WEEKS - 1 - w) * 7) + (6 - d);
      const cellDate = new Date(endDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const dateString = cellDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      cell.setAttribute('data-date', dateString);
      cell.setAttribute('data-count', String(count));

      cell.addEventListener('mouseenter', (e) => {
        const c = parseInt(cell.getAttribute('data-count'), 10);
        const dt = cell.getAttribute('data-date');
        const text = c === 0 ? `No contributions on ${dt}` : `${c} contribution${c > 1 ? 's' : ''} on ${dt}`;
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        updateTooltipPos(e);
      });

      cell.addEventListener('mousemove', updateTooltipPos);

      cell.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });

      grid.appendChild(cell);
    }
  }

  function updateTooltipPos(e) {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
  }
}

// ==========================================================================
// Production Contact Form Handler (FormSubmit AJAX + Security & Abuse Filter)
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  if (!form || !submitBtn) return;

  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const firstNameWarning = document.getElementById('first-name-warning');
  const lastNameWarning = document.getElementById('last-name-warning');
  const emailWarning = document.getElementById('email-warning');
  const messageWarning = document.getElementById('message-warning');

  // Comprehensive Multilingual Verbal Abuse, Profanity & Toxicity Moderation Engine
  // Deeply expanded for Philippine Sociolinguistic, Maternal/Ancestral, Anatomical, and Regional Domains
  function detectAbuse(rawText) {
    if (!rawText || typeof rawText !== 'string') return false;
    const text = rawText.toLowerCase().trim();
    if (!text) return false;

    // False-positive exemptions for benign cultural names or sports
    if (/\b(?:lady\s+gaga|tae\s*kwon\s*do|taekwondo)\b/i.test(text)) {
      // If it only contains the benign phrase without other abusive tokens, allow it
      const strippedBenign = text
        .replace(/\b(?:lady\s+gaga|tae\s*kwon\s*do|taekwondo)\b/gi, '')
        .trim();
      if (!strippedBenign) return false;
    }

    // 1. Direct Regex Patterns (Word Boundaries, Slurs, Ancestral Insults, and Disguised Spellings)
    const directPatterns = [
      // 1. Maternal and Ancestral Insults (Maternal, Grandparents, Parents, Clan, Lineage Honor)
      // Catches: putang ina, tangina, taena, tngna, putaena, potaena, tanginamo, putang ina mo, PI mo, etc.
      /\b(?:p+[ou]+t+[a|e]*[e|i]+n+a+|p+[ou]+t+a+n+g+\s*[e|i]+n+a+|t+a+n+g+\s*[e|i]+n+a+|t+a+[e|i]+n+a+|p+t+n+g+[e|i]+n+a+|t+n+g+n+a+|t+n+g+i+n+a+)(?:\s*(?:m+o+|k+a+|n+y+o+|r+i+n+|d+i+n+))?\b/i,
      /\b(?:p+u+k+i+n+a+n+g+\s*[e|i]+n+a+|p+u+k+i+n+g+\s*[e|i]+n+a+|p+u+k+i+n+g+[e|i]+n+a+|p+u+k+i+n+a+n+g+[e|i]+n+a+)\b/i,
      /\b(?:p+[ou*@0]+t+a+|p+\*+t+a+|p+[ou]+t+r+a+g+i+s+|p+u+n+y+[e|i]+t+a+|p+a+n+y+[e|i]+t+a+|p+u+c+h+a+|p+u+t+e+k+)\b/i,
      /\b(?:a+n+a+k+\s+(?:k+a+n+g+\s+|k+a+\s+)?n+g+\s*(?:p+[ou]+t+a+|p+\*+t+a+|t+o+k+w+a+|t+e+t+e+n+g+|t+u+p+a+|t+i+n+a+p+a+|y+a+w+a+|b+a+k+a+n+g+|p+a+t+i+n+g+|b+w+i+s+i+t+|d+e+m+o+n+y+o+))\b/i,
      /\b(?:p+u+t+a+n+g+\s*i+n+a+\s*m+o+|t+a+n+g+i+n+a+\s*m+o+|t+a+e+n+a+\s*m+o+|p+o+t+a+e+n+a+\s*m+o+|p+\.?i+\.?\s*m+o+|p+\.?i+\b)/i,
      // Ancestral jabs targeting family honor: "lolo mo", "lola mo", "nanay mo", "tatay mo", "ina mo", "angkan mo", "lahi mo", "mukha ng lolo mo", etc.
      /\b(?:(?:m+u+k+h+a+|u+l+o+|a+m+o+y+|t+a+d+y+a+n+g+)\s+(?:n+g+\s+)?)?(?:l+o+l+[o|a]+|n+a+n+a+y+|t+a+t+a+y+|i+n+a+|a+m+a+|m+a+g+u+l+a+n+g+|a+n+g+k+a+n+|l+a+h+i+)\s*(?:m+o+|n+y+o+|n+i+n+y+o+|m+o+n+g+|n+i+n+y+o+n+g+|k+a+|k+a+y+o+)(?:\s*(?:r+i+n+|d+i+n+|p+a+n+o+t+|g+a+g+o+|b+o+b+o+|p+a+n+g+[e|i]+t+))?\b/i,
      /\b(?:i+n+a+|n+a+n+a+y+|t+a+t+a+y+|l+o+l+[o|a]+)\s*m+o+(?:\s*(?:r+i+n+|d+i+n+))?\b/i,

      // 2. Genital and Anatomical Profanities
      // Catches: puke, kiki, kepyas, kipyas, titi, utin, bayag, betlog, pekpek, pepe, puday, kupal, burat, tinggil
      /\b(?:p+u+k+[e|i]+|k+i+k+i+|k+e+p+y+a+[s|z]+|k+i+p+y+a+[s|z]+|k+i+p+a+y+|p+u+d+a+y+|t+i+n+g+g+i+l+)\b/i,
      /\b(?:t+i+t+i+|u+t+i+n+|u+t+e+n+|b+u+r+a+t+)\b/i,
      /\b(?:b+a+y+a+g+|b+e+t+l+o+g+|b+i+t+l+o+g+)\b/i,
      /\b(?:i+t+l+o+g+\s*m+o+)\b/i,
      /\b(?:p+e+k+p+e+k+|p+e+k+-+p+e+k+|p+e+p+e+\s*(?:m+o+|k+a+)?)\b/i,
      /\b(?:k+u+p+a+l+|k+o+p+a+l+|c+u+p+a+l+|k+u+p+a+l+o+)\b/i,
      /\b(?:k+a+n+t+[o|u]+t+|k+a+n+t+[o|u]+t+a+n+|c+h+u+p+a+|t+o+r+j+a+c+k+|j+a+k+[o|u]+l+|j+a+b+[o|u]+l+|s+a+l+s+a+l+)\b/i,

      // 3. Excretory and Bodily Function Terms
      // Catches: tae, tumae, amoy tae, mukhang tae, bwisit, buwisit, ihi, amoy ihi
      /\b(?:t+a+e+|t+u+m+a+e+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+|p+a+|n+a+))?\b/i,
      /\b(?:a+m+o+y+|m+u+k+h+a+n+g+|p+u+r+o+)\s*t+a+e+\b/i,
      /\b(?:b+u?w+[i|e]+s+[i|e]+t+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+))?\b/i,
      /\b(?:a+m+o+y+\s*i+h+i+|i+h+i+\s*(?:k+a+|m+o+|n+y+o+)|p+u+r+o+\s*i+h+i+)\b/i,

      // 4. Intellectual and Mental Degradation
      // Catches: gago, tanga, inutil, ulol, olog, bobo, sira-ulo, engot, ungas, timang, hangal, abnoy, buang, baliw
      /\b(?:g+a+g+[o|a]+|k+a+g+a+g+u+h+a+n+|g+a+g+u+h+a+n+|o+g+a+g+)\b/i,
      /\b(?:t+a+n+g+a+|k+a+t+a+n+g+a+h+a+n+|t+a+n+g+a+n+g+)\b/i,
      /\b(?:i+n+u+t+i+l+)\b/i,
      /\b(?:u+l+[o|u]+l+|o+l+[o|u]+l+|o+l+o+g+)\b/i,
      /\b(?:b+[o|u]+b+[o|a]+|k+a+b+o+b+o+h+a+n+)\b/i,
      /\b(?:s+i+r+a+[- ]*u+l+o+|s+i+r+a+u+l+o+n+g+|m+a+y+\s*s+i+r+a+\s*s+a+\s*u+l+o+)\b/i,
      /\b(?:e+n+g+o+t+|u+n+g+a+s+|t+i+m+a+n+g+|h+a+n+g+a+l+|a+b+n+o+y+|m+o+n+g+g+o+l+o+i+d+|b+u+a+n+g+|b+a+l+i+w+)\b/i,

      // 5. Socio-Behavioral and Character Attacks
      // Catches: pokpok, malibog, manyakis, malandi, tarantado, hudas, salbahe, walang hiya, kapal ng mukha
      /\b(?:p+[o|u]+k+[- ]*p+[o|u]+k+|p+u+k+p+u+k+)\b/i,
      /\b(?:m+a+l+i+b+o+g+|l+i+b+o+g+|m+a+n+y+a+k+|m+a+n+y+a+k+i+s+)\b/i,
      /\b(?:m+a+l+a+n+d+i+|k+a+l+a+n+d+i+a+n+|l+a+l+a+n+d+i+)\b/i,
      /\bm+a+k+a+t+i+\s+a+n+g+\b/i,
      /\b(?:t+a+r+a+n+t+a+d+[o|a]+|k+a+t+a+r+a+n+t+a+d+u+h+a+n+|a+t+a+r+a+n+t+a+d+[o|a]+)\b/i,
      /\b(?:h+u+d+a+s+|s+a+l+o+t+|d+e+m+o+n+y+o+|l+i+n+t+i+k+)\b/i,
      /\b(?:s+a+l+b+a+h+[e|i]+)\b/i,
      /\b(?:w+a+l+a+n+g+[- ]*h+i+y+a+|w+a+l+a+\s*k+a+n+g+\s*h+i+y+a+)\b/i,

      // 6. Regional Expletives (Cebuano / Bisaya, Ilonggo, Ilokano)
      // Catches: bilat sa ina mo, bilat ni nanay mo, yawa, pisting yawa, ukis ti inam, giatay, burikat, botohon
      /\b(?:b+i+l+a+t+(?:\s*(?:s+a+|n+i+|s+a+n+g+)?\s*(?:i+n+a+|n+a+n+a+y+|i+l+o+y+|m+o+))?)\b/i,
      /\b(?:p+i+s+t+i?e?n+g+\s*y+a+w+a+|p+e+s+t+e+\s*n+g+a+\s*y+a+w+a+|y+a+w+a+|y+w+a+)\b/i,
      /\b(?:u+k+i+s+\s*t+i+\s*i+n+a+m+|u+k+i+s+\s*n+i+\s*i+n+a+m+|o+k+i+\s*n+i+\s*i+n+a+m+|u+k+i+s+\s*t+i+\s*i+n+a+\s*m+o+|o+k+i+n+i+s+n+a+m+|u+k+i+s+n+a+m+)\b/i,
      /\b(?:g+i+[- ]*a+t+a+y+|p+i+s+t+i?e?n+g+\s*a+t+a+y+|a+t+a+y+\s*(?:k+a+|m+o+|n+y+o+))\b/i,
      /\b(?:b+u+r+i+k+a+t+|b+o+r+i+k+a+t+|b+o+t+o+h+o+n+|k+o+l+e+r+a+)\b/i,

      // Appearance, Body Shaming & Derogatory Insults (panget, pangit, kapangitan, etc.)
      /\b(?:p+a+n+g+[e|i]+t+|p+a+n+g+e+d+|s+h+o+n+g+e+t+|c+h+a+k+a+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+|s+o+b+r+a+))?\b/i,
      /\b(?:a+n+g+\s*)?p+a+n+g+[e|i]+t+(?:\s*(?:m+o+|k+a+|s+o+b+r+a+))?\b/i,
      /\b(?:m+u+k+h+a+(?:n+g+|\s*k+a+n+g+|\s*k+a+|\s*m+o+)?\s*(?:t+a+e+|u+n+g+g+o+y+|a+s+o+|p+a+a+|t+a+n+g+a+|g+a+g+o+|b+a+s+a+h+a+n+|e+w+a+n+|b+a+n+g+k+a+y+|a+d+i+k+|p+e+r+a+|p+a+n+g+[e|i]+t+))\b/i,
      /\b(?:t+a+b+a+c+h+o+y+|b+a+b+o+y+\s*k+a+|a+n+g+\s*t+a+b+a+\s*m+o+|p+a+y+a+t+u+t+|k+a+l+b+o+\s*k+a+|b+a+n+s+o+t+|p+a+n+d+a+k+|n+g+o+n+g+o+|d+u+l+i+n+g+|k+i+r+a+t+|b+i+n+g+o+t+|b+u+n+g+i+|a+m+o+y+\s*t+a+e+|a+m+o+y+\s*l+u+p+a+|a+m+o+y+\s*p+u+t+o+k+)\b/i,

      // Tagalog / Filipino Insults, Demeaning Phrases, Lack of Value / Competence
      /\b(?:w+a+l+a+(?:n+g+|\s*k+a+n+g+|\s*k+a+y+o+n+g+)?\s*(?:k+w+e+n+t+a+|k+u+w+e+n+t+a+|b+i+t+a+w+|b+i+n+a+t+b+a+t+|s+i+l+b+i+|h+i+y+a+|m+o+d+o+|u+t+a+k+|m+a+r+a+r+a+t+i+n+g+|m+a+r+a+t+i+n+g+|p+i+n+a+g+[- ]*a+r+a+l+a+n+))(?:\s*(?:k+a+|m+o+|n+y+o+))?\b/i,
      /\b(?:w+a+l+a+n+g+\s*k+w+e+n+t+a+n+g+|w+a+l+a+n+g+\s*s+i+l+b+i+n+g+)\s*(?:t+a+o+|g+a+w+a+|t+r+a+b+a+h+o+|p+o+r+t+f+o+l+i+o+)?\b/i,
      /\b(?:k+a+p+a+l+\s*(?:n+g+)?\s*m+u+k+h+a+|m+a+k+a+p+a+l+\s*(?:a+n+g+)?\s*m+u+k+h+a+|k+a+p+a+l+\s*m+u+k+s+|k+a+p+a+l+\s*m+o+)\b/i,
      /\b(?:s+a+y+a+n+g+\s*(?:l+a+n+g+\s*)?o+r+a+s+|s+a+y+a+n+g+\s*p+a+s+a+h+o+d+|u+t+a+k+\s*b+i+y+a+|u+t+a+k+\s*t+a+l+a+n+g+k+a+|h+a+m+p+a+s+l+u+p+a+|a+s+a+l+\s*s+q+u+a+t+t+e+r+|s+k+w+a+t+e+r+)\b/i,
      /\b(?:b+a+s+t+o+s+|l+a+p+a+s+t+a+n+g+a+n+|b+a+l+i+w+|b+u+a+n+g+|a+b+n+o+y+|m+o+n+g+g+o+l+o+i+d+)\b/i,
      /\b(?:m+a+n+l+o+l+o+k+o+|s+i+n+u+n+g+a+l+i+n+g+\s*k+a+|t+r+a+y+d+o+r+|t+a+k+s+i+l+|i+p+o+k+r+i+t+[o|a]+)\b/i,
      /\b(?:m+a+m+a+t+a+y+\s*k+a+(?:\s*n+a+)?|p+a+t+a+y+i+n+\s*k+i+t+a+|p+a+p+a+t+a+y+i+n+\s*k+i+t+a+|s+a+s+a+p+a+k+i+n+\s*k+i+t+a+|b+u+g+b+u+g+i+n+\s*k+i+t+a+|s+a+s+a+m+p+a+l+i+n+\s*k+i+t+a+|i+t+u+m+b+a+\s*k+i+t+a+)\b/i,

      // English Profanity, Toxicity, Demeaning Phrases & Slurs
      /\b(?:p+a+k+s+h+[e|i]+t+|p+a+k+y+u+|f+a+k+y+u+|l+[e|e]+t?c+h+e+)\b/i,
      /\b(?:y+o+u+\s*(?:a+r+e+|r+e+)?\s*u+g+l+y+|u+\s*r+\s*u+g+l+y+|u+g+l+y+\s*a+s+\s*f+u+c+k+|u+g+l+y+\s*b+a+s+t+a+r+d+)\b/i,
      /\b(?:w+o+r+t+h+l+e+s+s+|u+s+e+l+e+s+s+|p+i+e+c+e\s+o+f\s+(?:s+h+i+t+|c+r+a+p+)|w+a+s+t+e\s+o+f\s+(?:s+p+a+c+e+|t+i+m+e+)|g+o+o+d\s+f+o+r\s+n+o+t+h+i+n+g+)\b/i,
      /\b(?:f+u+c+k+|f+u+c+k+i+n+g+|f+u+c+k+e+r+|m+o+t+h+e+r+f+u+c+k+e+r+|f+c+k+|f+u+k+|f\*+c*k|f\.u\.c\.k|s+t+f+u|s+h+u+t\s+t+h+e\s+f+u+c+k\s+u+p)\b/i,
      /\b(?:s+h+i+t+|s+h+i+t+t+y+|b+u+l+l+s+h+i+t+|h+o+r+s+e+s+h+i+t+|d+i+p+s+h+i+t+|s+h+\*+t)\b/i,
      /\b(?:b+i+t+c+h+|b+i+t+c+h+e+s+|b+i+t+c+h+i+n+g+|b+i+t+c+h+a+s+s+|b\*+t*c*h|b!tch)\b/i,
      /\b(?:a+s+s+h+o+l+e+|a+r+s+e+h+o+l+e+|d+u+m+b+a+s+s+|j+a+c+k+a+s+s+|a\*+s*hole|a\$\$hole)\b/i,
      /\b(?:b+a+s+t+a+r+d+|b+a+s+t+a+r+d+s+)\b/i,
      /\b(?:c+u+n+t+|c+u+n+t+s+|c\*+n*t)\b/i,
      /\b(?:d+i+c+k+|d+i+c+k+h+e+a+d+|c+o+c+k+|c+o+c+k+s+u+c+k+e+r+)\b/i,
      /\b(?:p+u+s+s+y+|p+u+s+s+i+e+s+)\b/i,
      /\b(?:r+e+t+a+r+d+|r+e+t+a+r+d+e+d+|i+d+i+o+t+|m+o+r+o+n+|i+m+b+e+c+i+l+e+)\b/i,
      /\b(?:w+h+o+r+e+|s+l+u+t+|s+k+a+n+k+)\b/i,
      /\b(?:s+h+a+m+e+l+e+s+s+|d+i+s+g+u+s+t+i+n+g+|p+a+t+h+e+t+i+c+|s+c+u+m+b+a+g+|s+c+u+m+|l+o+s+e+r+|j+e+r+k+|c+r+e+e+p+|t+r+a+s+h+|n+o\s+s+h+a+m+e+|d+i+s+g+r+a+c+e+)\b/i,
      /\b(?:k+i+l+l\s+y+o+u+r+s+e+l+f|k+y+s|g+o\s+d+i+e|d+r+o+p\s+d+e+a+d|h+o+p+e\s+y+o+u\s+d+i+e|h+a+n+g\s+y+o+u+r+s+e+l+f)\b/i,
      /\b(?:n+i+g+g+e+r+|n+i+g+g+a+|f+a+g+g+o+t+|f+a+g+|t+r+a+n+n+y+)\b/i
    ];

    for (const pattern of directPatterns) {
      if (pattern.test(text)) return true;
    }

    // 2. Leetspeak & Substitution Normalization
    // Converts numbers and glyphs into alphabetic counterparts and strips common obscuring characters
    const normalized = text
      .replace(/[@4]/g, 'a')
      .replace(/[3]/g, 'e')
      .replace(/[1!|]/g, 'i')
      .replace(/[0]/g, 'o')
      .replace(/[$5]/g, 's')
      .replace(/[7+]/g, 't')
      .replace(/[8]/g, 'b')
      .replace(/[*_#^~`\-.]/g, '');

    for (const pattern of directPatterns) {
      if (pattern.test(normalized)) return true;
    }

    // 3. Compacted Substring Check
    // Handles spaced-out text ("l o l o   m o", "t a n g i n a") and sequential character repetitions
    const compacted = normalized
      .replace(/[^a-z]/g, '')
      .replace(/(.)\1+/g, '$1');

    const compactRoots = [
      // Maternal & Ancestral
      'lolomo', 'lolamo', 'nanaymo', 'tataymo', 'inamo', 'amamo', 'angkanmo', 'lahimo',
      'lolomong', 'lolamong', 'nanaymong', 'tataymong', 'inamong',
      'mukhanglolomo', 'mukhankanglolomo', 'ulonglolomo',
      'potangina', 'putangina', 'tangina', 'tangena', 'taena', 'potaena', 'putaena',
      'pukinangina', 'pukingina', 'tanginamo', 'putanginamo', 'potaenamo', 'taenamo', 'tngnamo',
      'anakngputa', 'anakngpota', 'anakngtokwa', 'anakngteteng', 'anakngtupa', 'pimo',

      // Genital & Anatomical
      'pekpek', 'puki', 'puke', 'kiki', 'kepyas', 'kipyas', 'kipay', 'puday', 'tinggil',
      'titi', 'utin', 'uten', 'burat', 'bayag', 'betlog', 'itlogmo', 'kupal', 'kopal',
      'kantot', 'kantotan', 'chupa', 'torjack', 'jakol', 'jabol', 'salsal',

      // Scatological & Excretory
      'amoytae', 'mukhangtae', 'mukhakangtae', 'taemo', 'taeka', 'tumae', 'purotae',
      'bwisit', 'buwisit', 'bwiset', 'buwiset', 'amoyihi', 'puroihi',

      // Intellectual Degradation
      'gago', 'gagoka', 'gaguhan', 'kagaguhan', 'tarantado', 'atarantado',
      'ulol', 'olog', 'inutil', 'bobo', 'boboka', 'kabobohan', 'tanga', 'tangaka',
      'siraulo', 'maykasirasulo', 'siraulong', 'utakbiya', 'utaktalangka',
      'engot', 'ungas', 'timang', 'hangal', 'abnoy', 'buang', 'baliw',

      // Socio-Behavioral Attacks
      'pokpok', 'malibog', 'manyak', 'manyakis', 'malandi', 'kalandian',
      'hudas', 'salbahe', 'walanghiya', 'walakanghiya', 'makapalmukha', 'kapalngmukha', 'kapalmuks', 'kapalmo',
      'walangkwenta', 'walakangkwenta', 'walangsilbi', 'walakangsilbi', 'walangutak', 'walakangutak',
      'walangmodo', 'walakangmodo', 'walangbinatbat', 'walakangbinatbat', 'walangbitaw', 'walangpinagaralan',

      // Regional Expletives
      'bilatsainamo', 'bilatninanaymo', 'bilatsangiloymo', 'bilatmo', 'bilat',
      'pestengyawa', 'pistingyawa', 'pestengayawa', 'yawa',
      'ukistiinam', 'ukisiniinam', 'okiniinam', 'ukistinam', 'okinisnam', 'ukisnam',
      'giatay', 'pistingatay', 'atayka', 'burikat', 'borikat', 'botohon', 'kolera',

      // Appearance & Physical Degredation
      'panget', 'pangit', 'shonget', 'chaka', 'kapangitan',
      'mukhangaso', 'mukhangunggoy', 'mukhangpaa', 'mukhangbasahan', 'mukhangbangkay', 'mukhangadik',
      'tabachoy', 'baboyka', 'angtabamo', 'payatut', 'kalboka', 'bansot', 'pandak', 'amoyputok',
      'hampaslupa', 'asalsquatter', 'skwater',

      // English & Hostility
      'pakyu', 'pakshet', 'bastos', 'lapastangan',
      'mamatayka', 'patayinkita', 'papatayinkita', 'sasapakinkita', 'bugbuginkita', 'sasampalinkita', 'itumbakita',
      'killyourself', 'kys', 'godie', 'dropdead', 'hopeyoudie', 'hangyourself',
      'youareugly', 'urugly', 'uglyasfuck', 'worthless', 'useless', 'pieceofshit', 'wasteofspace', 'wasteoftime', 'goodfornothing',
      'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dickhead', 'retard', 'shameless', 'disgusting', 'pathetic', 'scumbag',
      'nigger', 'faggot'
    ];

    for (const root of compactRoots) {
      if (compacted.includes(root)) return true;
    }

    return false;
  }

  function setWarning(inputEl, warningEl, message, isAbuse = false) {
    if (!warningEl) return;
    if (message) {
      warningEl.innerHTML = `<span class="warning-icon" aria-hidden="true">⚠️</span><span class="warning-text">${message}</span>`;
      warningEl.classList.add('visible');
      if (isAbuse) {
        warningEl.classList.add('abuse-warning');
      } else {
        warningEl.classList.remove('abuse-warning');
      }
      if (inputEl) inputEl.classList.add('input-error');
    } else {
      warningEl.innerHTML = '';
      warningEl.classList.remove('visible', 'abuse-warning');
      if (inputEl) inputEl.classList.remove('input-error');
    }
  }

  // 1. Name Validation (No numbers, no special symbols, max 40 chars)
  function handleNameInput(input, warning, fieldName) {
    if (!input || !warning) return;

    // Check for attempted numbers or prohibited symbols
    const hasForbiddenChars = /[^A-Za-zÀ-ÿ\s'-]/.test(input.value);
    if (hasForbiddenChars) {
      setWarning(input, warning, `${fieldName} cannot contain numbers or special symbols.`);
      // Strip forbidden characters immediately
      input.value = input.value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
    } else if (detectAbuse(input.value)) {
      setWarning(input, warning, 'Inappropriate language detected. Please provide a respectful name.', true);
      submitBtn.disabled = true;
    } else if (input.value.length >= 40) {
      setWarning(input, warning, `Maximum limit of 40 characters reached.`);
      submitBtn.disabled = false;
    } else {
      setWarning(input, warning, null);
      submitBtn.disabled = false;
    }
  }

  if (firstNameInput) {
    firstNameInput.addEventListener('input', () => handleNameInput(firstNameInput, firstNameWarning, 'First Name'));
    firstNameInput.addEventListener('blur', () => {
      const val = firstNameInput.value.trim();
      if (!val) {
        setWarning(firstNameInput, firstNameWarning, 'First Name is required.');
      } else {
        handleNameInput(firstNameInput, firstNameWarning, 'First Name');
      }
    });
  }

  if (lastNameInput) {
    lastNameInput.addEventListener('input', () => handleNameInput(lastNameInput, lastNameWarning, 'Last Name'));
    lastNameInput.addEventListener('blur', () => {
      const val = lastNameInput.value.trim();
      if (!val) {
        setWarning(lastNameInput, lastNameWarning, 'Last Name is required.');
      } else {
        handleNameInput(lastNameInput, lastNameWarning, 'Last Name');
      }
    });
  }

  // 2. Email Validation (RFC 5322 pattern & security check)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function validateEmail(showEmptyError = false) {
    if (!emailInput || !emailWarning) return false;
    const emailVal = emailInput.value.trim();

    if (!emailVal) {
      if (showEmptyError) {
        setWarning(emailInput, emailWarning, 'E-Mail address is required.');
      } else {
        setWarning(emailInput, emailWarning, null);
      }
      return false;
    }

    if (emailVal.length > 80) {
      setWarning(emailInput, emailWarning, 'Email cannot exceed 80 characters.');
      return false;
    }

    // Security check against script injection tags
    if (/<[^>]*>|script|javascript:/i.test(emailVal)) {
      setWarning(emailInput, emailWarning, 'Invalid or unsafe email characters detected.');
      return false;
    }

    if (!emailRegex.test(emailVal)) {
      setWarning(emailInput, emailWarning, 'Please enter a valid email format (e.g., name@domain.com).');
      return false;
    }

    setWarning(emailInput, emailWarning, null);
    return true;
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail(false));
    emailInput.addEventListener('blur', () => validateEmail(true));
  }

  // 3. Message Validation & Verbal Abuse Detection
  function validateMessage(showEmptyError = false) {
    if (!messageInput || !messageWarning) return false;
    const msgVal = messageInput.value.trim();

    if (!msgVal) {
      if (showEmptyError) {
        setWarning(messageInput, messageWarning, 'Message content is required.');
      } else {
        setWarning(messageInput, messageWarning, null);
      }
      submitBtn.disabled = false;
      return false;
    }

    // Check for abusive or inappropriate content FIRST (regardless of character length!)
    if (detectAbuse(msgVal)) {
      setWarning(
        messageInput,
        messageWarning,
        'Inappropriate or abusive language detected. Please maintain a safe, respectful, and professional communication environment.',
        true
      );
      submitBtn.disabled = true;
      return false;
    }

    if (msgVal.length < 10) {
      setWarning(messageInput, messageWarning, 'Message must be at least 10 characters.');
      submitBtn.disabled = false;
      return false;
    }

    if (msgVal.length > 1000) {
      setWarning(messageInput, messageWarning, 'Message exceeds the 1,000 character limit.');
      submitBtn.disabled = false;
      return false;
    }

    setWarning(messageInput, messageWarning, null);
    submitBtn.disabled = false;
    return true;
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => validateMessage(false));
    messageInput.addEventListener('blur', () => validateMessage(true));
  }

  // Captivating Receipt Modal & Banner Elements
  const successModal = document.getElementById('contact-success-modal');
  const modalCloseBtn = document.getElementById('receipt-modal-close-btn');
  const modalCloseFooterBtn = document.getElementById('receipt-close-footer-btn');
  const modalCopyBtn = document.getElementById('receipt-copy-btn');
  const modalSendAnotherBtn = document.getElementById('receipt-send-another-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  const receiptSenderNameDisplay = document.getElementById('receipt-sender-name-display');
  const receiptTicketId = document.getElementById('receipt-ticket-id');
  const receiptSenderName = document.getElementById('receipt-sender-name');
  const receiptSenderEmail = document.getElementById('receipt-sender-email');
  const receiptTimestamp = document.getElementById('receipt-timestamp');
  const receiptMessageBody = document.getElementById('receipt-message-body');

  const inPlaceSuccessBanner = document.getElementById('contact-success-banner');
  const viewReceiptModalTrigger = document.getElementById('view-receipt-modal-trigger');
  const resetContactFormBtn = document.getElementById('reset-contact-form-btn');

  // Ambient Toast Elements
  const toastEl = document.getElementById('transmission-toast');
  const toastDesc = document.getElementById('toast-desc');
  const toastCloseBtn = document.getElementById('toast-close-btn');
  let toastTimer = null;
  let activeReceiptText = '';

  function showToast(desc) {
    if (!toastEl) return;
    if (toastDesc && desc) toastDesc.textContent = desc;
    toastEl.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('active');
    }, 6000);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      if (toastEl) toastEl.classList.remove('active');
      if (toastTimer) clearTimeout(toastTimer);
    });
  }

  function openReceiptModal() {
    if (!successModal) return;
    successModal.classList.add('open');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeReceiptModal() {
    if (!successModal) return;
    successModal.classList.remove('open');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeReceiptModal);
  if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener('click', closeReceiptModal);

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeReceiptModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('open')) {
      closeReceiptModal();
    }
  });

  if (viewReceiptModalTrigger) {
    viewReceiptModalTrigger.addEventListener('click', openReceiptModal);
  }

  function resetFormToCleanState() {
    closeReceiptModal();
    if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'none';
    form.reset();
    setWarning(firstNameInput, firstNameWarning, null);
    setWarning(lastNameInput, lastNameWarning, null);
    setWarning(emailInput, emailWarning, null);
    setWarning(messageInput, messageWarning, null);
    hideStatus();
    if (firstNameInput) firstNameInput.focus();
  }

  if (modalSendAnotherBtn) modalSendAnotherBtn.addEventListener('click', resetFormToCleanState);
  if (resetContactFormBtn) resetContactFormBtn.addEventListener('click', resetFormToCleanState);

  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', async () => {
      if (!activeReceiptText) return;
      try {
        await navigator.clipboard.writeText(activeReceiptText);
        if (copyBtnText) copyBtnText.textContent = 'Receipt Copied!';
        modalCopyBtn.classList.add('copied');
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Receipt';
          modalCopyBtn.classList.remove('copied');
        }, 2500);
      } catch {
        // Fallback for non-secure or restricted clipboard contexts
        const tempArea = document.createElement('textarea');
        tempArea.value = activeReceiptText;
        tempArea.style.position = 'fixed';
        tempArea.style.opacity = '0';
        document.body.appendChild(tempArea);
        tempArea.select();
        try {
          document.execCommand('copy');
          if (copyBtnText) copyBtnText.textContent = 'Receipt Copied!';
          modalCopyBtn.classList.add('copied');
          setTimeout(() => {
            if (copyBtnText) copyBtnText.textContent = 'Copy Receipt';
            modalCopyBtn.classList.remove('copied');
          }, 2500);
        } catch (copyErr) {
          console.warn('Clipboard copy error:', copyErr);
        }
        document.body.removeChild(tempArea);
      }
    });
  }

  // 4. Form Submission with Gatekeeping & Captivating Delivery Flow
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = (firstNameInput?.value || '').trim();
    const lastName = (lastNameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    const isFirstValid = firstName.length > 0 && !/[^A-Za-zÀ-ÿ\s'-]/.test(firstName) && firstName.length <= 40;
    const isLastValid = lastName.length > 0 && !/[^A-Za-zÀ-ÿ\s'-]/.test(lastName) && lastName.length <= 40;
    const isEmailValid = validateEmail(true);
    const isMsgValid = validateMessage(true);

    if (!isFirstValid) {
      setWarning(firstNameInput, firstNameWarning, 'First Name must contain only letters (no numbers or symbols).');
      if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (detectAbuse(firstName)) {
      setWarning(firstNameInput, firstNameWarning, 'Inappropriate or abusive language detected in First Name.', true);
      if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (!isLastValid) {
      setWarning(lastNameInput, lastNameWarning, 'Last Name must contain only letters (no numbers or symbols).');
      if (lastNameInput) lastNameInput.focus();
      return;
    }

    if (detectAbuse(lastName)) {
      setWarning(lastNameInput, lastNameWarning, 'Inappropriate or abusive language detected in Last Name.', true);
      if (lastNameInput) lastNameInput.focus();
      return;
    }

    if (!isEmailValid) {
      if (emailInput) emailInput.focus();
      return;
    }

    if (!isMsgValid) {
      if (messageInput) messageInput.focus();
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Delivering Message...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
    hideStatus();

    // Generate unique transmission reference ID and formatted local timestamp
    const now = new Date();
    const ticketRand = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `#NMS-${now.getFullYear()}-${ticketRand}`;
    const formattedDate = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const payload = {
      '✦ Sender Name': `${firstName} ${lastName}`.trim(),
      '✦ Sender Email': email,
      '✦ Inquiry Message': message,
      '✦ Transmission Ticket': ticketId,
      '✦ Dispatched Timestamp': formattedDate,
      '✦ Priority Classification': '⚡ Priority Direct Client Transmission',
      '✦ Routing Origin': 'Niño Miguel Developer Portfolio (http://localhost:3000)',
      _subject: `⚡ [Priority Inquiry] Message from ${firstName} ${lastName}`,
      _replyto: email,
      _template: 'box',
      _captcha: 'false',
      _autoresponse: `Mabuhay ${firstName}!\n\nThank you for reaching out through my portfolio (http://localhost:3000). Your transmission (${ticketId}) has been delivered directly into my personal inbox.\n\nI personally review each incoming inquiry and will reply to you as soon as possible.\n\nWarm regards,\nNiño Miguel S. Rodriguez\nFull Stack Web Developer\nManila, Philippines`
    };

    // Prepare rich receipt text for clipboard copying
    activeReceiptText = [
      `=== NIÑO MIGUEL S. RODRIGUEZ - OFFICIAL TRANSMISSION RECEIPT ===`,
      `Transmission ID: ${ticketId}`,
      `Sender Identity: ${firstName} ${lastName}`,
      `Verified Email:  ${email}`,
      `Dispatched At:   ${formattedDate}`,
      `Recipient Inbox: ninomiguelsrodriguez@gmail.com`,
      `Delivery Status: CONFIRMED & QUEUED`,
      `---------------------------------------------------------------`,
      `Inquiry Excerpt:`,
      `"${message}"`,
      `===============================================================`
    ].join('\n');

    // Populate modal elements
    if (receiptSenderNameDisplay) receiptSenderNameDisplay.textContent = firstName;
    if (receiptTicketId) receiptTicketId.textContent = ticketId;
    if (receiptSenderName) receiptSenderName.textContent = `${firstName} ${lastName}`.trim();
    if (receiptSenderEmail) receiptSenderEmail.textContent = email;
    if (receiptTimestamp) receiptTimestamp.textContent = formattedDate;
    if (receiptMessageBody) receiptMessageBody.textContent = `"${message}"`;

    try {
      const response = await fetch('https://formsubmit.co/ajax/ninomiguelsrodriguez@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok || data.success === 'true' || data.success === true) {
        showStatus(`✔ Message delivered successfully! Transmission ${ticketId} dispatched to ninomiguelsrodriguez@gmail.com.`, 'success');
        if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'flex';
        openReceiptModal();
        showToast(`Transmission ${ticketId} delivered to Niño Miguel's inbox.`);
        form.reset();
        setWarning(firstNameInput, firstNameWarning, null);
        setWarning(lastNameInput, lastNameWarning, null);
        setWarning(emailInput, emailWarning, null);
        setWarning(messageInput, messageWarning, null);
      } else {
        throw new Error(data.message || 'Transmission response not OK');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback triggered:', err);
      // Still show the modal with dispatch details and launch mailto fallback
      if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'flex';
      openReceiptModal();
      showToast(`Transmission ${ticketId} queued via direct email gateway.`);
      showStatus('Notice: Direct network gateway. Launching your email client with pre-filled message...', 'success');

      const subject = encodeURIComponent(`Portfolio Inquiry from ${firstName} ${lastName} [${ticketId}]`);
      const body = encodeURIComponent(`Transmission ID: ${ticketId}\nName: ${firstName} ${lastName}\nEmail: ${email}\nDate: ${formattedDate}\n\nMessage:\n${message}`);
      window.location.href = `mailto:ninomiguelsrodriguez@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Submit Message';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `form-status active ${type}`;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  }
}

// ==========================================================================
// Career-Grade Resume Preview Modal & Multi-Format Exporter
// ==========================================================================
function initResumeModal() {
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

// ==========================================================================
// Interactive Chrome Dino Runner: Dancing Niño Miguel Edition (Auto-Leap + Arcade Polish)
// ==========================================================================
function initDinoDanceRunner() {
  const stage = document.getElementById('footer-dino-stage');
  const track = document.getElementById('dino-track-wrapper');
  const actor = document.getElementById('dino-runner-actor');
  const liveScoreEl = document.getElementById('dino-live-score');
  const floatScoresEl = document.getElementById('dino-float-scores');
  const soundToggleBtn = document.getElementById('dino-sound-toggle');
  const soundIconEl = document.getElementById('sound-icon');

  if (!stage || !actor) return;

  const obstacles = Array.from(document.querySelectorAll('.dino-obstacle'));
  let currentScore = 420;
  let isJumping = false;
  let soundEnabled = true;
  let audioCtx = null;
  let lastJumpTime = 0;
  let lastObstacleJumped = null;

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundToggleBtn.classList.toggle('sound-muted', !soundEnabled);
      if (soundIconEl) {
        soundIconEl.textContent = soundEnabled ? '🔊' : '🔇';
      }
      const label = soundToggleBtn.querySelector('.sound-label');
      if (label) {
        label.textContent = soundEnabled ? '8-BIT AUDIO ON' : 'AUDIO MUTED';
      }
    });
  }

  // Web Audio API 8-bit retro arcade jump sound
  function playArcadeJumpSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square'; // Classic 8-bit arcade tone
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);

      gain.gain.setValueAtTime(0.08, now); // Gentle volume, never harsh
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (_) {
      // Audio context might fail on restricted autoplay, fail gracefully
    }
  }

  // Floating combo popup in track
  const praiseWords = ['+100 PTS!', 'AUTO-LEAP!', 'PERFECT JUMP!', 'CLEAN MOVE!', 'DANCE JUMP!', 'COMBO x2!'];
  function spawnScorePopup(xPos) {
    if (!floatScoresEl) return;
    const text = praiseWords[Math.floor(Math.random() * praiseWords.length)];
    const pop = document.createElement('div');
    pop.className = 'dino-popup-score';
    pop.textContent = text;
    if (xPos !== undefined) {
      pop.style.left = `${Math.max(10, Math.min(xPos, floatScoresEl.clientWidth - 90))}px`;
    }
    floatScoresEl.appendChild(pop);
    setTimeout(() => {
      pop.remove();
    }, 1100);
  }

  // Jump Trigger Logic
  function triggerJump(isAuto = false, relatedObs = null) {
    if (isJumping) return;
    const now = Date.now();
    if (now - lastJumpTime < 580) return; // Cooldown to finish jump arc
    lastJumpTime = now;
    isJumping = true;
    actor.classList.add('dino-jumping');

    playArcadeJumpSound();

    if (isAuto && relatedObs) {
      relatedObs.classList.add('dino-obstacle-passed');
      setTimeout(() => {
        relatedObs.classList.remove('dino-obstacle-passed');
      }, 700);

      // Add bonus score
      currentScore += 100;
      if (liveScoreEl) {
        liveScoreEl.textContent = String(currentScore).padStart(5, '0');
        liveScoreEl.style.color = '#00f0ff';
        liveScoreEl.style.textShadow = '0 0 14px rgba(0, 240, 255, 0.9)';
        setTimeout(() => {
          liveScoreEl.style.color = '#ffffff';
          liveScoreEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.45)';
        }, 600);
      }

      const actorRect = actor.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const relativeX = actorRect.left - trackRect.left + (actorRect.width / 2);
      spawnScorePopup(relativeX);
    }

    setTimeout(() => {
      actor.classList.remove('dino-jumping');
      isJumping = false;
    }, 650);
  }

  // Collision / Proximity Detection Loop for Automatic Jumping over Crosses
  let prevActorLeft = null;
  const obsCooldowns = new Map();

  function checkObstacleProximity() {
    if (track && actor && obstacles.length > 0) {
      const actorRect = actor.getBoundingClientRect();
      const currentActorLeft = actorRect.left;

      if (prevActorLeft !== null) {
        const isMovingRight = currentActorLeft >= prevActorLeft;
        const actorCenter = actorRect.left + (actorRect.width / 2);
        const now = Date.now();

        obstacles.forEach((obs) => {
          const obsRect = obs.getBoundingClientRect();
          const obsCenter = obsRect.left + (obsRect.width / 2);
          const obsId = obs.getAttribute('data-obs-id') || obs.className || 'obs';
          const dirKey = isMovingRight ? `${obsId}_R` : `${obsId}_L`;
          const lastJumped = obsCooldowns.get(dirKey) || 0;

          // Only trigger if cooldown passed (1.4s between re-jumping in same direction)
          if (now - lastJumped > 1400) {
            const distanceAhead = isMovingRight ? (obsCenter - actorCenter) : (actorCenter - obsCenter);
            // Trigger auto-leap when approaching cross obstacle (38px to 85px range for centered hurdle jump)
            if (distanceAhead >= 38 && distanceAhead <= 85) {
              obsCooldowns.set(dirKey, now);
              triggerJump(true, obs);
            }
          }
        });
      }
      prevActorLeft = currentActorLeft;
    }
    requestAnimationFrame(checkObstacleProximity);
  }
  requestAnimationFrame(checkObstacleProximity);

  // Real-time ticking score counter just like Chrome Dino
  setInterval(() => {
    currentScore++;
    if (liveScoreEl) {
      liveScoreEl.textContent = String(currentScore).padStart(5, '0');
      if (currentScore % 100 === 0) {
        liveScoreEl.style.color = '#ff2a3a';
        liveScoreEl.style.textShadow = '0 0 14px rgba(255, 42, 58, 0.9)';
        setTimeout(() => {
          liveScoreEl.style.color = '#ffffff';
          liveScoreEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.45)';
        }, 800);
      }
    }
  }, 180);

  // Click / tap to jump manually
  if (track) {
    track.addEventListener('click', (e) => {
      if (e.target.closest('#dino-sound-toggle')) return;
      e.preventDefault();
      triggerJump(false);
      const trackRect = track.getBoundingClientRect();
      const relativeX = e.clientX - trackRect.left;
      spawnScorePopup(relativeX);
    });
  }

  // Keyboard Spacebar jump if viewing the footer area
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        e.preventDefault();
        triggerJump(false);
      }
    }
  });
}

// ==========================================================================
// Permanent Eradication of Netlify Watermark & Badge
// ==========================================================================
function eradicateNetlifyWatermark() {
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
function initMobileNavigation() {
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
function initArsenalFilter() {
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
function initBentoSpotlightAndPopovers() {
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

  function hidePopover() {
    hideTimeout = setTimeout(() => {
      popover.classList.remove('active');
      popover.setAttribute('aria-hidden', 'true');
      if (activeChip) {
        activeChip.classList.remove('bento-chip-active');
        activeChip = null;
      }
    }, 160);
  }

  chips.forEach(chip => {
    chip.addEventListener('mouseenter', () => showPopover(chip));
    chip.addEventListener('mouseleave', hidePopover);
    chip.addEventListener('focus', () => showPopover(chip));
    chip.addEventListener('blur', hidePopover);
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      showPopover(chip);
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showPopover(chip);
      }
    });
  });

  popover.addEventListener('mouseenter', () => {
    if (hideTimeout) clearTimeout(hideTimeout);
  });
  popover.addEventListener('mouseleave', hidePopover);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bento-chip') && !e.target.closest('#bento-pow-popover')) {
      popover.classList.remove('active');
      popover.setAttribute('aria-hidden', 'true');
      if (activeChip) {
        activeChip.classList.remove('bento-chip-active');
        activeChip = null;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover.classList.contains('active')) {
      popover.classList.remove('active');
      popover.setAttribute('aria-hidden', 'true');
      if (activeChip) {
        activeChip.classList.remove('bento-chip-active');
        activeChip = null;
      }
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
eradicateNetlifyWatermark();



