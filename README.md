This technical analysis details the architecture, subsystems, and structure of Niño Miguel S. Rodriguez’s single-page portfolio web application.

Core Identity & Tech Stack
Developer: Niño Miguel S. Rodriguez — Full-Stack Web Developer & IT Student.

Architecture: Zero-framework, native client stack: HTML5, CSS3, ES6+ JavaScript, coupled with a custom Node.js server.

Core Highlight: High-performance, hardware-accelerated, scroll-driven canvas scrubbing.

Key Architectural Subsystems
300-Frame Animation Engine (generate_hd_frames.js, main.js):

Video Pipeline: Uses ffmpeg-static with hqdn3d denoising, gradfun, and bicubic scaling to output 300 WebP frames (quality 95).

Rendering & Preloading: Interpolates frame delivery via requestAnimationFrame lerp loop; uses object-fit: cover with pixel snapping and distributed keyframe preloading (stride: 5) via asynchronous Image.decode() to avoid scroll locking.

Custom Delivery Server (server.js):

Zero-dependency Node.js HTTP server on port 3000 (with automatic port escalation).

Serves media with HTTP 206 byte-range partial content streaming.

Implements aggressive immutable caching (max-age=31536000, immutable) for rapid scrubbing and path sanitization to prevent directory traversal.

Frontend Page Modules (index.html, style.css, main.js):

Hero & About (#home, #about): Branding, vector logo, navigation, fitness discipline ethos, and a core competency matrix.

Services (#services): 6 service cards with dynamic cursor spotlight tracking.

Project Showcase (#projects): Category-filtered grid (all, collaborative, my-projects) and deep modal inspection covering collaborative builds (CUP MVCR, NCST SRMS, Fynn Hotel, SmartSpace) and solo works (MIGUEL.FIT, AURA MART, The Grazing Bull).

Arsenal & Credentials (#technologies, #certificates): Segmented tech stack grid alongside verified SoloLearn badges (HTML5, CSS3, JS) with certificate IDs.

Activity Matrix (#activity): Interactive 52-week GitHub-style commit heatmap.

ATS Resume (#resume): Printable, exportable ATS resume modal.

Contact Gatekeeper (#contact): FormSubmit AJAX pipeline with fallback mailto links, receipt/ticket generator (#NMS-YYYY-XXXX), and an input abuse/toxicity filter.

Footer Easter Egg: Chrome Dino-style runner game with jump physics and live scoring.

Repository File Map
index.html: Semantic page layout and inline SVG library (2,124 lines).

style.css: Design tokens, glassmorphism UI scrims, and layout breakpoints.

main.js: State orchestrator (Canvas engine, modal managers, filters, heatmap, Dino runner).

server.js & generate_hd_frames.js: Node.js static/streaming server and FFmpeg processing pipeline.

frames/ & assets/: Optimized WebP frame sequence, UI vector graphics, project previews, and credentials.
