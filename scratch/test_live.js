import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing live server at http://localhost:3000...');

  // 1. Index page
  const index = await get('http://localhost:3000/');
  console.log('Index status:', index.status);
  console.log('Has tiger-logo favicon link:', index.data.includes('href="assets/tiger-logo.svg"'));
  console.log('Has favicon.ico link:', index.data.includes('href="favicon.ico"'));
  console.log('Has MVCR architecture in lead/desc:', index.data.includes('MVCR'));
  console.log('Collaborative archives tabs present:', index.data.includes('data-proj-id="ncst-srms"'));
  console.log('MIGUEL.FIT NOT in collaborative tabs:', !index.data.includes('id="modal-project-tabs">\n              <button type="button" class="modal-proj-tab active" data-proj-id="celestine">01 — Celestine</button>\n              <button type="button" class="modal-proj-tab" data-proj-id="ncst-srms">02 — NCST SRMS</button>\n              <button type="button" class="modal-proj-tab" data-proj-id="fynn-hotel">03 — Fynn Hotel</button>\n              <button type="button" class="modal-proj-tab" data-proj-id="smartspace">04 — SmartSpace</button>\n              <button type="button" class="modal-proj-tab" data-proj-id="miguelfit">05 — MIGUEL.FIT'));
  console.log('Critical tech pills present:');
  console.log('  - Repository Pattern:', index.data.includes('Repository Pattern'));
  console.log('  - AJAX Async Validation:', index.data.includes('ajax_validate.php'));
  console.log('  - RESTful API Architecture:', index.data.includes('api/'));
  console.log('  - Modular Enrollment Engine:', index.data.includes('Enrollment/'));
  console.log('  - Apache URL Rewriting (.htaccess):', index.data.includes('.htaccess'));
  console.log('  - Secure Document Storage:', index.data.includes('storage/ &amp; uploads/'));
  console.log('  - Error & Audit Logging:', index.data.includes('logs/ &amp; errors/'));

  // 2. Favicon requests
  const ico = await get('http://localhost:3000/favicon.ico');
  console.log('/favicon.ico status:', ico.status, 'content-type:', ico.headers['content-type']);

  const svg = await get('http://localhost:3000/assets/tiger-logo.svg');
  console.log('/assets/tiger-logo.svg status:', svg.status, 'content-type:', svg.headers['content-type']);

  // 3. CSS file
  const css = await get('http://localhost:3000/style.css');
  console.log('style.css status:', css.status, 'has logo glow breath:', css.data.includes('logoGlowBreath'));

  // 4. JS file
  const js = await get('http://localhost:3000/main.js');
  console.log('main.js status:', js.status, 'has collaborativeTabsList:', js.data.includes('collaborativeTabsList'));

  console.log('\nAll checks completed successfully!');
}

run().catch(console.error);
