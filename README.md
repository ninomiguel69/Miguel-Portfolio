# Technical Analysis & Architecture: Niño Miguel S. Rodriguez Portfolio

This technical analysis details the architecture, subsystems, and structure of Niño Miguel S. Rodriguez’s single-page portfolio web application.

## Core Identity & Tech Stack
- **Developer:** Niño Miguel S. Rodriguez — Full-Stack Web Developer & IT Student.
- **Architecture:** Zero-framework, native client stack: HTML5, CSS3, ES6+ JavaScript, architected under the **MVCR (Model-View-Controller-Router)** pattern, coupled with a custom Node.js server.
- **Core Highlight:** High-performance, hardware-accelerated, scroll-driven canvas scrubbing.

---

## Architectural Pattern: MVCR (Model-View-Controller-Router)

The codebase is organized under a modular MVCR architecture for high maintainability, zero code conflict, and separation of concerns:

- **Models (`models/`):**
  - [`models/appState.js`](file:///d:/Portfolio%20Website/models/appState.js): Reactive state container (300-frame scroll tracking, active filter, loading states).
  - [`models/projectsData.js`](file:///d:/Portfolio%20Website/models/projectsData.js): Authoritative project catalog, tech stacks, highlights, and gallery assets.
  - [`models/index.js`](file:///d:/Portfolio%20Website/models/index.js): Clean re-export barrel.

- **Views (`views/`):**
  - [`views/canvasView.js`](file:///d:/Portfolio%20Website/views/canvasView.js): Hardware-accelerated canvas sizing, pixel snapping, and golden-ratio cover rendering.
  - [`views/modalView.js`](file:///d:/Portfolio%20Website/views/modalView.js): Project case study modal renderer, gallery tab switcher, and tech pill badges.
  - [`views/heatmapView.js`](file:///d:/Portfolio%20Website/views/heatmapView.js): 52-week GitHub-style commit heatmap matrix and interactive tooltip.
  - [`views/dinoView.js`](file:///d:/Portfolio%20Website/views/dinoView.js): Arcade Dino dance runner visual HUD, floating score popups, and sound synthesizer.
  - [`views/index.js`](file:///d:/Portfolio%20Website/views/index.js): Clean re-export barrel.

- **Controllers (`controllers/`):**
  - [`controllers/canvasController.js`](file:///d:/Portfolio%20Website/controllers/canvasController.js): 300-frame progressive preloader with distributed keyframes and smooth `requestAnimationFrame` lerp loop.
  - [`controllers/modalController.js`](file:///d:/Portfolio%20Website/controllers/modalController.js): Accessible project modal manager (keyboard focus trap, ESC dismiss, deep linking).
  - [`controllers/contactController.js`](file:///d:/Portfolio%20Website/controllers/contactController.js): Production FormSubmit AJAX handler, ticket generator (`#NMS-YYYY-XXXX`), anti-spam honeypot, and abuse moderation.
  - [`controllers/dinoController.js`](file:///d:/Portfolio%20Website/controllers/dinoController.js): Retro runner game loop, obstacle proximity auto-leap, and score tracking.
  - [`controllers/uiController.js`](file:///d:/Portfolio%20Website/controllers/uiController.js): Project category archive filters, services spotlight tracking, mobile HUD navigation drawer, and `Ctrl+K` command palette.
  - [`controllers/index.js`](file:///d:/Portfolio%20Website/controllers/index.js): Clean re-export barrel.

- **Routes (`routes/`):**
  - [`routes/router.js`](file:///d:/Portfolio%20Website/routes/router.js): Client-side hash routing, scroll-spy section synchronizer, and deep link dispatcher.
  - [`routes/serverRoutes.js`](file:///d:/Portfolio%20Website/routes/serverRoutes.js): Backend HTTP route handler with MIME resolution, HTTP 206 partial streaming, and immutable caching.
  - [`routes/index.js`](file:///d:/Portfolio%20Website/routes/index.js): Clean re-export barrel.

---

## Key Architectural Subsystems

### 1. 300-Frame Animation Engine (`views/canvasView.js`, `controllers/canvasController.js`)
- **Video Pipeline:** Uses `ffmpeg-static` with `hqdn3d` denoising, `gradfun`, and bicubic scaling to output 300 WebP frames (quality 95).
- **Rendering & Preloading:** Interpolates frame delivery via `requestAnimationFrame` lerp loop; uses `object-fit: cover` with pixel snapping and distributed keyframe preloading (stride: 5) via asynchronous `Image.decode()` to avoid scroll locking.

### 2. Custom Delivery Server (`server.js`, `routes/serverRoutes.js`)
- Zero-dependency Node.js HTTP server on port 3000 (with automatic port escalation).
- Serves media with HTTP 206 byte-range partial content streaming.
- Implements aggressive immutable caching (`max-age=31536000, immutable`) for rapid scrubbing and path sanitization to prevent directory traversal.

### 3. Repository File Map
- [`index.html`](file:///d:/Portfolio%20Website/index.html): Semantic page layout, inline SVG library, and ES module loader.
- [`style.css`](file:///d:/Portfolio%20Website/style.css): Design tokens, glassmorphism UI scrims, and responsive layout breakpoints.
- [`main.js`](file:///d:/Portfolio%20Website/main.js): Orchestrator that initializes all MVCR modules.
- [`server.js`](file:///d:/Portfolio%20Website/server.js): Entry server delegating to `routes/serverRoutes.js`.
- [`frames/`](file:///d:/Portfolio%20Website/frames/): 300 optimized WebP sequence frames (`frame-001.webp` ... `frame-300.webp`).
- [`assets/`](file:///d:/Portfolio%20Website/assets/): Project banners, verified certificates, and brand vectors.
- [`scripts/`](file:///d:/Portfolio%20Website/scripts/): Diagnostic and repair utilities (`fix-webview.ps1`, `fix-webview.bat`).
