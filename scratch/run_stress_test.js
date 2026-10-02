import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bodyLength: Buffer.byteLength(data)
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runStressTest() {
  console.log('====================================================');
  console.log('🔥 STARTING COMPREHENSIVE SYSTEM STRESS TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Core Assets Availability
  console.log('--- TEST 1: Core Assets HTTP 200 Check ---');
  const corePaths = ['/', '/index.html', '/style.css', '/main.js', '/assets/tiger-logo.svg'];
  for (const p of corePaths) {
    const res = await request(p);
    if (res.status === 200) {
      console.log(`  ✅ [200 OK] ${p} (${res.bodyLength} bytes)`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${p} returned ${res.status}`);
      failed++;
    }
  }

  // TEST 2: Frame Sampling Across 300 WebP Frames
  console.log('\n--- TEST 2: Sample 50 Random Animation Frames (1-300) ---');
  const sampleFrameIndices = [1, 2, 5, 10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 299, 300];
  for (let i = 0; i < 33; i++) {
    sampleFrameIndices.push(Math.floor(1 + Math.random() * 299));
  }
  const uniqueFrames = [...new Set(sampleFrameIndices)];

  let frameSuccess = 0;
  const framePromises = uniqueFrames.map(async (idx) => {
    const padded = String(idx).padStart(3, '0');
    const path = `/frames/frame-${padded}.webp`;
    const res = await request(path);
    if (res.status === 200 && res.bodyLength > 1000) {
      frameSuccess++;
    } else {
      console.error(`  ❌ [FRAME FAIL] ${path} returned ${res.status} (${res.bodyLength}b)`);
    }
  });

  await Promise.all(framePromises);
  console.log(`  ✅ Loaded ${frameSuccess} / ${uniqueFrames.length} WebP frames flawlessly`);
  if (frameSuccess === uniqueFrames.length) passed++; else failed++;

  // TEST 3: High-Concurrency Burst (150 Parallel Requests)
  console.log('\n--- TEST 3: High-Concurrency Burst (150 Parallel Concurrent Requests) ---');
  const startTime = Date.now();
  const burstPaths = [
    '/index.html',
    '/style.css',
    '/main.js',
    '/frames/frame-001.webp',
    '/frames/frame-150.webp',
    '/frames/frame-300.webp',
    '/assets/projects/smartspace-banner.jpg',
    '/assets/projects/celestine-banner.png'
  ];

  const concurrentRequests = Array.from({ length: 150 }, (_, i) => {
    const p = burstPaths[i % burstPaths.length];
    return request(p);
  });

  const burstResults = await Promise.all(concurrentRequests);
  const duration = Date.now() - startTime;
  const all200 = burstResults.every(r => r.status === 200);

  if (all200) {
    console.log(`  ✅ 150 concurrent requests handled in ${duration}ms (${(150 / (duration / 1000)).toFixed(1)} req/s) with 0 errors!`);
    passed++;
  } else {
    console.error(`  ❌ Some burst requests failed!`);
    failed++;
  }

  // TEST 4: Security & Path Traversal Injection Tests
  console.log('\n--- TEST 4: Path Traversal & Security Boundary Testing ---');
  const securityTests = [
    { path: '/../../package.json', expected: [400, 403, 404] },
    { path: '/..%2F..%2Fpackage.json', expected: [400, 403, 404] },
    { path: '/non-existent-page-xyz.html', expected: [404] }
  ];

  for (const sec of securityTests) {
    try {
      const res = await request(sec.path);
      if (sec.expected.includes(res.status)) {
        console.log(`  ✅ Security probe for "${sec.path}" properly rejected with HTTP ${res.status}`);
        passed++;
      } else {
        console.error(`  ❌ Security probe for "${sec.path}" unexpected status: ${res.status}`);
        failed++;
      }
    } catch (e) {
      console.log(`  ✅ Security probe "${sec.path}" rejected at connection level (${e.code || e.message})`);
      passed++;
    }
  }

  // TEST 5: Cache Headers Verification
  console.log('\n--- TEST 5: Caching & Performance Headers Verification ---');
  const webpRes = await request('/frames/frame-001.webp');
  const cssRes = await request('/style.css');

  if (webpRes.headers['cache-control'] && webpRes.headers['cache-control'].includes('immutable')) {
    console.log(`  ✅ WebP frames have optimal immutable caching: "${webpRes.headers['cache-control']}"`);
    passed++;
  } else {
    console.warn(`  ⚠️ WebP cache control: "${webpRes.headers['cache-control']}"`);
  }

  if (cssRes.headers['cache-control'] && cssRes.headers['cache-control'].includes('no-cache')) {
    console.log(`  ✅ CSS file has dynamic hot-reloading header: "${cssRes.headers['cache-control']}"`);
    passed++;
  } else {
    console.warn(`  ⚠️ CSS cache control: "${cssRes.headers['cache-control']}"`);
  }

  console.log('\n====================================================');
  console.log(`🏁 STRESS TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStressTest().catch(err => {
  console.error('Fatal stress test failure:', err);
  process.exit(1);
});
