import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const dir = resolve(new URL('../site/', import.meta.url).pathname);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain' };

createServer(async (req, res) => {
  let filePath = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!filePath.startsWith(dir + '/') && filePath !== dir) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (filePath.endsWith('/') || filePath === dir) filePath = join(filePath, 'index.html');
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000);
