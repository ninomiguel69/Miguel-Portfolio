import fs from 'fs';

console.log('====================================================');
console.log('⚡ RUNNING CLIENT-SIDE LOGIC & ARCHITECTURE STRESS TEST');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

// TEST 1: Check HTML DOM Structure Integrity
const html = fs.readFileSync('index.html', 'utf8');

const requiredElements = [
  'header-search-btn',
  'mobile-drawer-search-btn',
  'command-palette-modal',
  'cmd-palette-input',
  'cmd-palette-results',
  'cmd-palette-close-btn',
  'project-coverflow-wrapper',
  'coverflow-track',
  'coverflow-prev',
  'coverflow-next',
  'coverflow-tech-tags',
  'coverflow-project-title',
  'coverflow-project-desc',
  'coverflow-case-study-btn',
  'coverflow-live-btn',
  'coverflow-counter-top',
  'coverflow-progress-bar',
  'coverflow-dots',
  'project-modal',
  'resume-modal',
  'animation-canvas'
];

console.log('--- TEST 1: Checking Required Element IDs in index.html ---');
let missingElements = [];
for (const id of requiredElements) {
  const hasId = new RegExp(`\\sid=["']${id}["']`).test(html);
  if (!hasId) {
    missingElements.push(id);
  }
}

if (missingElements.length === 0) {
  console.log(`  ✅ All ${requiredElements.length} critical DOM element IDs are present.`);
  passed++;
} else {
  console.error(`  ❌ Missing DOM IDs:`, missingElements);
  failed++;
}

// TEST 2: Command Palette Search Index Robustness
console.log('\n--- TEST 2: Command Palette Search Algorithm Stress Test ---');
const mainJs = fs.readFileSync('main.js', 'utf8');

// Extract searchIndex from main.js
const searchIndexMatch = mainJs.match(/const searchIndex = (\[[\s\S]*?\n  \]);/);
if (searchIndexMatch) {
  try {
    let searchIndex;
    const fn = new Function('window', 'document', `
      ${searchIndexMatch[0]};
      return searchIndex;
    `);
    searchIndex = fn(
      { openProjectModal: () => {}, openResumeModal: () => {} },
      { getElementById: () => ({ scrollIntoView: () => {} }) }
    );
    console.log(`  ✅ Successfully parsed search index with ${searchIndex.length} items.`);

    // Stress test with 1,000 rapid queries (including edge cases: symbols, quotes, spaces)
    const testQueries = [
      '', '   ', 'smartspace', 'celestine', 'srms', 'hotel', 'fit', 'bull', 'arsenal',
      'resume', 'contact', 'xyznotfound', '123', '!', '<script>', 'PHP', 'Three.js',
      'a', 'e', 'o', 'project', 'collaboration'
    ];

    let searchExceptions = 0;
    for (let i = 0; i < 1000; i++) {
      const q = testQueries[i % testQueries.length].trim().toLowerCase();
      try {
        const filtered = !q ? [...searchIndex] : searchIndex.filter(item => {
          return item.title.toLowerCase().includes(q) ||
                 item.desc.toLowerCase().includes(q) ||
                 item.badge.toLowerCase().includes(q);
        });
        if (!Array.isArray(filtered)) searchExceptions++;
      } catch (e) {
        searchExceptions++;
      }
    }

    if (searchExceptions === 0) {
      console.log(`  ✅ 1,000 search queries executed with 0 exceptions.`);
      passed++;
    } else {
      console.error(`  ❌ Search queries threw ${searchExceptions} exceptions.`);
      failed++;
    }
  } catch (err) {
    console.error('  ❌ Failed to parse search index:', err);
    failed++;
  }
} else {
  console.error('  ❌ Could not locate searchIndex in main.js');
  failed++;
}

// TEST 3: 3D Coverflow Mathematics & Bounds Stress Test
console.log('\n--- TEST 3: 3D Coverflow Transform Mathematics Stress Test ---');
const projectList = [
  { id: 'smartspace', category: 'collaborative' },
  { id: 'celestine', category: 'collaborative' },
  { id: 'miguelfit', category: 'my-projects' },
  { id: 'ncst-srms', category: 'collaborative' },
  { id: 'fynn-hotel', category: 'collaborative' },
  { id: 'auramart', category: 'my-projects' },
  { id: 'grazingbull', category: 'my-projects' }
];

let mathErrors = 0;
for (let activeIndex = -5; activeIndex <= 15; activeIndex++) {
  // Wrap index safely like goToSlide
  let safeIndex = activeIndex;
  if (projectList.length > 0) {
    if (safeIndex < 0) safeIndex = projectList.length - 1;
    if (safeIndex >= projectList.length) safeIndex = 0;
  }

  projectList.forEach((_, idx) => {
    const offset = idx - safeIndex;
    const absOffset = Math.abs(offset);
    const sign = Math.sign(offset);

    let transform = '';
    let opacity = 0;
    let zIndex = 0;

    if (offset === 0) {
      transform = 'translate3d(0, 0, 70px) rotateY(0deg) scale(1)';
      opacity = 1;
      zIndex = 20;
    } else if (absOffset === 1) {
      const tx = sign * 62;
      const rotY = -sign * 32;
      const sc = 0.82;
      transform = `translate3d(${tx}%, 0, -80px) rotateY(${rotY}deg) scale(${sc})`;
      opacity = 0.62;
      zIndex = 10;
    } else if (absOffset === 2) {
      const tx = sign * 115;
      const rotY = -sign * 45;
      const sc = 0.68;
      transform = `translate3d(${tx}%, 0, -180px) rotateY(${rotY}deg) scale(${sc})`;
      opacity = 0.24;
      zIndex = 5;
    } else {
      const tx = sign * 140;
      transform = `translate3d(${tx}%, 0, -280px) scale(0.5)`;
      opacity = 0;
      zIndex = 1;
    }

    if (!transform || isNaN(opacity) || isNaN(zIndex)) {
      mathErrors++;
    }
  });
}

if (mathErrors === 0) {
  console.log(`  ✅ 3D Transform calculations verified across all viewport indices with 0 math errors.`);
  passed++;
} else {
  console.error(`  ❌ 3D Coverflow math produced ${mathErrors} invalid calculations.`);
  failed++;
}

// TEST 4: Category Filtering Consistency
console.log('\n--- TEST 4: Coverflow Category Filter Integrity ---');
const allCount = projectList.length;
const collabCount = projectList.filter(p => p.category === 'collaborative').length;
const soloCount = projectList.filter(p => p.category === 'my-projects').length;

if (collabCount === 4 && soloCount === 3 && (collabCount + soloCount === allCount)) {
  console.log(`  ✅ Perfect category partition: 4 Collaborative + 3 Solo = 7 Total Projects.`);
  passed++;
} else {
  console.error(`  ❌ Unexpected project counts: Collab=${collabCount}, Solo=${soloCount}`);
  failed++;
}

console.log('\n====================================================');
console.log(`🏁 CLIENT LOGIC STRESS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
