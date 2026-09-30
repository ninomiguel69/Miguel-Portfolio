import http from 'http';

function fetchFrame(index) {
  return new Promise((resolve, reject) => {
    const padded = String(index).padStart(3, '0');
    const start = Date.now();
    http.get(`http://localhost:3000/frames/frame-${padded}.webp`, (res) => {
      let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; });
      res.on('end', () => {
        resolve({ index, status: res.statusCode, bytes, duration: Date.now() - start, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing server frame responses:');
  const sample1 = await fetchFrame(1);
  console.log('Frame 1:', sample1);
  const sample50 = await fetchFrame(50);
  console.log('Frame 50:', sample50);
  const sample150 = await fetchFrame(150);
  console.log('Frame 150:', sample150);
  const sample300 = await fetchFrame(300);
  console.log('Frame 300:', sample300);
}

run();
