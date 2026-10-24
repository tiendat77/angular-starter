/**
 * Serves a built app the way nginx does: files as they are, `index.html` for any other path.
 * `node e2e/serve.mjs <directory> <port>`
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const [directory, port] = process.argv.slice(2);
const root = resolve(directory);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = join(root, pathname);

  // A path that leaves the root, or is not a file, is a route of the SPA. A missing asset or chunk
  // (it has an extension) is a real 404, like in nginx.
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    if (extname(pathname)) {
      response.writeHead(404).end();
      return;
    }
    file = join(root, 'index.html');
  }

  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(Number(port), '127.0.0.1');
