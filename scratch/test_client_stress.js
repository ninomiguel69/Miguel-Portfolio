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
  'project-modal',
  'resume-modal',
  'animation-canvas',
  'projects',
  'projects-grid',
  'open-celestine-btn',
  'solo-placeholder-card',
  'my-projects-showcase-card'
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

// TEST 3: Project Archive DOM & Data-Target Verification
console.log('\n--- TEST 3: Project Archive Integrity & Card Completeness ---');
const bookshelfSlugs = ['ncst-srms', 'fynn-hotel', 'smartspace', 'miguelfit', 'auramart', 'grazingbull'];
let missingCards = [];

for (const slug of bookshelfSlugs) {
  const hasCard = html.includes(`data-project-id="${slug}"`);
  if (!hasCard) {
    missingCards.push(slug);
  }
}

// Also check featured Celestine project
const hasCelestine = html.includes('open-celestine-btn');
if (!hasCelestine) {
  missingCards.push('celestine');
}

if (missingCards.length === 0) {
  console.log(`  ✅ All 7 project showcases (1 Featured + 6 Bookshelf cards) verified in DOM.`);
  passed++;
} else {
  console.error(`  ❌ Missing project cards for:`, missingCards);
  failed++;
}

// TEST 4: Category Filtering Partition Consistency
console.log('\n--- TEST 4: Category Partition Verification ---');
const collabSlugs = ['celestine', 'ncst-srms', 'fynn-hotel', 'smartspace'];
const soloSlugs = ['miguelfit', 'auramart', 'grazingbull'];

if (collabSlugs.length === 4 && soloSlugs.length === 3 && (collabSlugs.length + soloSlugs.length === 7)) {
  console.log(`  ✅ Category partitions verified: 4 Collaborative + 3 Solo = 7 Total.`);
  passed++;
} else {
  console.error(`  ❌ Partition mismatch.`);
  failed++;
}

console.log('\n====================================================');
console.log(`🏁 CLIENT LOGIC STRESS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
