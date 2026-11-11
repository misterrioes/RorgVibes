import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

let port = Number(process.env.PORT || 8080);
const sites = new Map([
  ['', join(import.meta.dirname, 'overview', 'dist')],
  ['/murmel', join(import.meta.dirname, 'murmel-systeme', 'dist')],
  ['/twos-complement', join(import.meta.dirname, 'twos-complement-ring', 'dist')],
  ['/minifloat', join(import.meta.dirname, 'minifloat-labor', 'dist')],
  ['/logic', join(import.meta.dirname, 'dnf-knf-labor', 'dist')],
]);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const base = [...sites.keys()].filter(Boolean).find(key => url.pathname === key || url.pathname.startsWith(`${key}/`)) ?? '';
  if (url.pathname === base) return redirect(res, `${base}/`);
  const relative = normalize(url.pathname.slice(base.length + 1) || 'index.html');
  if (relative.startsWith('..')) return reply(res, 403, 'Forbidden');
  let file = join(sites.get(base), relative);
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch {}
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(body);
  } catch { reply(res, 404, 'Not found'); }
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE' && !process.env.PORT && port < 8090) {
    port += 1;
    server.listen(port);
    return;
  }
  throw error;
});

server.listen(port, () => {
  console.log(`Overview:          http://localhost:${port}/`);
  console.log(`Murmel-Systeme:    http://localhost:${port}/murmel/`);
  console.log(`Two's complement:  http://localhost:${port}/twos-complement/`);
  console.log(`Minifloat-Labor:   http://localhost:${port}/minifloat/`);
  console.log(`DNF/KNF-Labor:     http://localhost:${port}/logic/`);
});

function redirect(res, location) { res.writeHead(302, { location }); res.end(); }
function reply(res, status, body) { res.writeHead(status, { 'Content-Type':'text/plain; charset=utf-8' }); res.end(body); }
