import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), 'game'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };
createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (path.includes('\0') || path.includes('\\')) { res.writeHead(403); res.end('Forbidden'); return; }
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const actual = await realpath(file);
    if (!actual.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const info = await stat(actual);
    if (!info.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[extname(actual)] ?? 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end(); else createReadStream(actual).on('error', () => res.destroy()).pipe(res);
  } catch (error) {
    const code = error?.code;
    res.writeHead(code === 'ENOENT' || code === 'ENOTDIR' ? 404 : 400); res.end('Not found');
  }
}).listen(8080, 'localhost', () => console.log('Meridian Ridge: http://localhost:8080'));
