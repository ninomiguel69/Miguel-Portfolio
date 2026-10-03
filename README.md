# Technical Analysis & Architecture: Niño Miguel S. Rodriguez Portfolio

This technical analysis details the architecture, subsystems, and structure of Niño Miguel S. Rodriguez’s single-page portfolio web application.

## Core Identity & Tech Stack

- **Developer:** Niño Miguel S. Rodriguez — Full-Stack Web Developer & IT Student.
- **Architecture:** Zero-framework, native client stack: HTML5, CSS3, ES6+ JavaScript, architected under the **MVCR (Model-View-Controller-Router)** pattern, coupled with a custom Node.js server.
- **Core Highlight:** Real-time hardware-accelerated 3D WebGL crystal prism background (Three.js), chiaroscuro atmospheric backdrop, and editorial project archive layout.

---

## Architectural Pattern: MVCR (Model-View-Controller-Router)

The codebase is organized under a modular MVCR architecture for high maintainability, zero code conflict, and separation of concerns:

- **Models (`models/`):**
  - [`models/appState.js`](file:///d:/Portfolio%20Website/models/appState.js): Reactive state container (3D parallax mouse tilt, scroll tracking, active filter, modal states).
  - [`models/projectsData.js`](file:///d:/Portfolio%20Website/models/projectsData.js): Authoritative project catalog, tech stacks, highlights, and gallery assets.
  - [`models/index.js`](file:///d:/Portfolio%20Website/models/index.js): Clean re-export barrel.

- **Views (`views/`):**
  - [`views/hero3dView.js`](file:///d:/Portfolio%20Website/views/hero3dView.js): Real-time Three.js scene featuring beveled crystal prism, physical transmission glass, caustic core, and 150 luminous dust particles.
  - [`views/modalView.js`](file:///d:/Portfolio%20Website/views/modalView.js): Project case study modal renderer, gallery tab switcher, and tech pill badges.
  - [`views/heatmapView.js`](file:///d:/Portfolio%20Website/views/heatmapView.js): 52-week GitHub-style commit heatmap matrix and interactive tooltip.
  - [`views/dinoView.js`](file:///d:/Portfolio%20Website/views/dinoView.js): Arcade Dino dance runner visual HUD, floating score popups, and sound synthesizer.
  - [`views/canvasView.js`](file:///d:/Portfolio%20Website/views/canvasView.js): Architectural canvas view stub preserving legacy interface compatibility.
  - [`views/index.js`](file:///d:/Portfolio%20Website/views/index.js): Clean re-export barrel.

- **Controllers (`controllers/`):**
  - [`controllers/hero3dController.js`](file:///d:/Portfolio%20Website/controllers/hero3dController.js): Real-time 3D physics lerp mouse damping, sinusoidal levitation, and scroll-driven spatial rotation loop.
  - [`controllers/modalController.js`](file:///d:/Portfolio%20Website/controllers/modalController.js): Accessible project modal manager (keyboard focus trap, ESC dismiss, deep linking, split button handlers).
  - [`controllers/contactController.js`](file:///d:/Portfolio%20Website/controllers/contactController.js): Production FormSubmit AJAX handler, ticket generator (`#NMS-YYYY-XXXX`), anti-spam honeypot, and abuse moderation.
  - [`controllers/dinoController.js`](file:///d:/Portfolio%20Website/controllers/dinoController.js): Retro runner game loop, obstacle proximity auto-leap, and score tracking.
  - [`controllers/uiController.js`](file:///d:/Portfolio%20Website/controllers/uiController.js): Project category archive filters, services spotlight tracking, mobile HUD navigation drawer, and `Ctrl+K` command palette.
  - [`controllers/canvasController.js`](file:///d:/Portfolio%20Website/controllers/canvasController.js): Architectural canvas controller stub preserving legacy interface compatibility.
  - [`controllers/index.js`](file:///d:/Portfolio%20Website/controllers/index.js): Clean re-export barrel.

- **Routes (`routes/`):**
  - [`routes/router.js`](file:///d:/Portfolio%20Website/routes/router.js): Client-side hash routing, scroll-spy section synchronizer, and deep link dispatcher.
  - [`routes/serverRoutes.js`](file:///d:/Portfolio%20Website/routes/serverRoutes.js): Backend HTTP route handler with MIME resolution, HTTP 206 partial streaming, and immutable caching.
  - [`routes/index.js`](file:///d:/Portfolio%20Website/routes/index.js): Clean re-export barrel.

---

## Key Architectural Subsystems

### 1. Real-Time 3D Hero Prism & Atmospheric Engine (`views/hero3dView.js`, `controllers/hero3dController.js`)

- **Three.js Glass Physics:** Beveled `ExtrudeGeometry` crystal prism with `MeshPhysicalMaterial` (`transmission: 0.93`, `ior: 1.55`, `roughness: 0.05`, `metalness: 0.05`), warm amber caustic core, and 150 luminous floating dust motes with gentle Brownian motion.
- **Cinematic Backdrop:** High-resolution chiaroscuro hand backdrop (`assets/hero-hand-bg.jpg`) with volumetric horizon lighting and dual vignette scrim.
- **Micro-Interactions:** Physics-based mouse tilt damping lerp, continuous floating levitation, and scroll-coupled 3D rotation.

### 2. Editorial Architectural Project Archive (`index.html`, `style.css`, `controllers/uiController.js`)

- **Editorial Specification Grid:** Monospace sequence numerals (`01`–`07`), uppercase technical kickers, pill badges, and comprehensive architectural descriptions.
- **Signature Split CTA:** Dual-segment buttons (`[ VIEW CASE STUDY & ARCHITECTURE | → ]`) with interactive hover states and direct case study modal binding.
- **Architectural Viewports:** Dashed framing boxes with corner crosshairs (`+`) and system HUD telemetry headers (`SYSTEM-ID: ... // EXPAND ARCHITECTURE ↗`).
- **Infinite Marquee Ticker:** Dynamic horizontal tape running below the hero showcasing engineering capabilities and stack telemetry.

### 3. Custom Delivery Server (`server.js`, `routes/serverRoutes.js`)

- Zero-dependency Node.js HTTP server on port 3000 (with automatic port escalation).
- Serves media with HTTP 206 byte-range partial content streaming.
- Implements aggressive immutable caching (`max-age=31536000, immutable`) and path sanitization to prevent directory traversal.

### 4. Repository File Map

- [`index.html`](file:///d:/Portfolio%20Website/index.html): Semantic page layout, inline SVG library, and ES module loader.
- [`style.css`](file:///d:/Portfolio%20Website/style.css): Design tokens, glassmorphism UI scrims, editorial archive styling, and responsive layout breakpoints.
- [`main.js`](file:///d:/Portfolio%20Website/main.js): Orchestrator that initializes all MVCR modules.
- [`server.js`](file:///d:/Portfolio%20Website/server.js): Entry server delegating to `routes/serverRoutes.js`.
- [`assets/`](file:///d:/Portfolio%20Website/assets/): Project banners, verified certificates, vendor scripts (`assets/vendor/three.module.js`), and brand vectors.
- [`scripts/`](file:///d:/Portfolio%20Website/scripts/): Diagnostic and repair utilities (`fix-webview.ps1`, `fix-webview.bat`).
