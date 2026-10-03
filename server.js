import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleServerRequest } from './routes/serverRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  handleServerRequest(req, res, __dirname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================`);
  console.log(`🚀 Smooth Scroll Animation Server is running!`);
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Network: http://127.0.0.1:${PORT}`);
  console.log(`=================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`\n⚠️ Port ${PORT} is currently in use!`);
    console.warn(`👉 Attempting fallback to port ${nextPort}...`);
    console.warn(`👉 To free port ${PORT} on Windows PowerShell, run:`);
    console.warn(`   Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force\n`);
    server.listen(nextPort, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});
