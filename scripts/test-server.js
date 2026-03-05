import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';

const dir = resolve(new URL('../site/', import.meta.url).pathname);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  try {
    let filePath = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!filePath.startsWith(dir + '/') && filePath !== dir) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (filePath.endsWith('/') || filePath === dir) filePath = join(filePath, 'index.html');
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error('Port 3000 already in use');
  else console.error(err);
  process.exit(1);
});
server.listen(3000);
