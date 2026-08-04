// Verificación local: simula el handle_path /cv* de Caddy sobre dist/
// Uso: node scripts/serve-cv-test.mjs <puerto>
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, relative, isAbsolute, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.argv[2] ?? 4334)
const DIST = fileURLToPath(new URL('../dist/', import.meta.url)) // C:\...\dist\

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

http
  .createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    // Strip del prefijo /cv (como Caddy handle_path /cv*)
    if (path.startsWith('/cv')) path = path.slice(3) || '/'
    if (path === '/') path = '/index.html'
    path = path.replace(/^[/\\]+/, '') // quitar barra inicial para join
    const file = join(DIST, path)
    const rel = relative(DIST, file)
    if (rel.startsWith('..') || isAbsolute(rel)) {
      res.writeHead(403)
      res.end('forbidden')
      return
    }
    try {
      const data = await readFile(file)
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(data)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 not found')
    }
  })
  .listen(PORT, '127.0.0.1', () =>
    console.log(`cv-test sirviendo dist/ bajo /cv en http://127.0.0.1:${PORT}/cv/`),
  )
