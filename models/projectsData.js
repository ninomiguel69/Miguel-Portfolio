/**
 * Projects Data Model (MVCR - Model Layer)
 * Central authoritative repository for production case studies, highlights, and architectures
 */

export const projectsData = {
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
    footerLinks: '<a href="https://github.com/Yakuzokai/SRMS" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a><span class="modal-badge-meta">Collaborative Production Platform • Team Co-Engineered</span>'
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
    footerLinks: '<a href="https://github.com/Yakuzokai/Hotel-Project" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a><span class="modal-badge-meta">Collaborative Hospitality Monorepo • Team Co-Engineered</span>'
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
    footerLinks: '<a href="https://github.com/Yakuzokai/smartspace" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-launch-live"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg> View GitHub Repository</a>'
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
