// Endpoint de contacto — Web CV (SPEC-contacto §5.6)
// =====================================================
// Servidor HTTP mínimo (Node 22, cero dependencias) que recibe el POST del
// formulario (encaminado por Caddy: /cv/api/* → 127.0.0.1:8081), valida,
// filtra spam y reenvía el mensaje por Resend al email del dueño.
//
// Seguridad (D11-A): honeypot + rate limit 5/día/IP + Origin check.
// El email real del dueño solo vive en el EnvironmentFile del VPS (600).

import http from 'node:http'

const PORT = Number(process.env.PORT ?? 8081)
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
const RESEND_TO = process.env.RESEND_TO ?? ''
const RESEND_FROM = process.env.RESEND_FROM ?? ''
const ASUNTO_DEFAULT = process.env.ASUNTO_DEFAULT ?? 'Contacto desde web-cv'
// Orígenes permitidos separados por coma. Vacío = permitir todo (dev/curl).
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)
const LIMITE_POR_DIA = Number(process.env.RATE_LIMIT ?? 5)
const MAX_BODY = 16 * 1024 // 16 KB es más que suficiente para el formulario

const RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// --- Rate limit por IP (en memoria; se reinicia con el contenedor) ---
// El SPEC fija 5 envíos/día/IP: para un CV es suficiente y evita abusos.
const envios = new Map() // ip -> { dia: 'YYYY-MM-DD', n: number }

function limpiarEnviosViejos() {
  const hoy = new Date().toISOString().slice(0, 10)
  for (const [ip, e] of envios) {
    if (e.dia !== hoy) envios.delete(ip)
  }
}
setInterval(limpiarEnviosViejos, 60 * 60 * 1000).unref()

function permitidoPorRateLimit(ip) {
  const hoy = new Date().toISOString().slice(0, 10)
  const e = envios.get(ip)
  if (!e || e.dia !== hoy) {
    envios.set(ip, { dia: hoy, n: 1 })
    return true
  }
  // Límite 5/día: se permiten los envíos 1..5; el 6º se bloquea
  if (e.n >= LIMITE_POR_DIA) return false
  e.n += 1
  return true
}

// --- Validación del formulario ---
// Devuelve { ok: true, datos } o { ok: false, error }.
// Límites generosos pero acotados (anti-abuso de payload).
function validar(body) {
  const nombre = String(body.nombre ?? '').trim()
  const empresa = String(body.empresa ?? '').trim()
  const mail = String(body.mail ?? '').trim().toLowerCase()
  const asunto = String(body.asunto ?? '').trim()
  const mensaje = String(body.mensaje ?? '').trim()
  const website = String(body.website ?? '').trim() // honeypot

  if (website !== '') return { ok: false, honeypot: true }
  if (nombre.length < 2 || nombre.length > 100) return { ok: false, error: 'nombre inválido' }
  if (empresa.length > 100) return { ok: false, error: 'empresa inválida' }
  if (!RE_MAIL.test(mail) || mail.length > 254) return { ok: false, error: 'mail inválido' }
  if (asunto.length > 200) return { ok: false, error: 'asunto inválido' }
  if (mensaje.length < 10 || mensaje.length > 5000) return { ok: false, error: 'mensaje inválido' }

  return {
    ok: true,
    datos: {
      nombre,
      empresa,
      mail,
      asunto: asunto || ASUNTO_DEFAULT, // D8-A: default server-side
      mensaje,
    },
  }
}

// --- Envío a Resend ---
async function enviarResend(datos) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: RESEND_TO,
      reply_to: datos.mail, // responder al visitante directamente
      subject: datos.asunto,
      text: [
        `Nombre: ${datos.nombre}`,
        `Empresa: ${datos.empresa || '—'}`,
        `Email: ${datos.mail}`,
        '',
        'Mensaje:',
        datos.mensaje,
      ].join('\n'),
    }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) {
    const detalle = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${detalle.slice(0, 200)}`)
  }
  const json = await res.json().catch(() => ({}))
  return json.id
}

// --- Respuestas ---
function responder(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

// Mini-página HTML para el submit nativo sin JS (CA-5.3): el navegador
// navega a la respuesta, así que debe ser una página presentable.
function responderHtml(res, status, titulo, detalle) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<style>body{font-family:monospace;max-width:36em;margin:3rem auto;padding:0 1rem;color:#1c201d;background:#f4f3ef}pre{border:1px solid #dcdcd4;background:#fff;padding:1rem;white-space:pre-wrap}a{color:#1f7a3d}</style>
</head><body><pre>${titulo}

${detalle}

<a href="/cv/">← volver</a></pre></body></html>`)
}

// --- Servidor ---
const server = http.createServer(async (req, res) => {
  // Health check para el orquestador (GET /health → 200)
  if (req.method === 'GET' && req.url === '/health') {
    responder(res, 200, { ok: true })
    return
  }
  if (req.method !== 'POST') {
    responder(res, 405, { ok: false, error: 'método no permitido' })
    return
  }

  const ip = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '?')
    .toString()
    .split(',')[0]
    .trim()

  // Origin check (D11-A): si el navegador manda Origin, debe ser el nuestro.
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.size > 0 && !ALLOWED_ORIGINS.has(origin)) {
    console.log(`[contacto] origin rechazado: ${origin}`)
    responder(res, 403, { ok: false, error: 'origen no permitido' })
    return
  }

  // Leer el body (JSON con fetch | form-urlencoded con submit nativo)
  let raw = ''
  try {
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > MAX_BODY) {
        responder(res, 413, { ok: false, error: 'body demasiado grande' })
        return
      }
    }
  } catch {
    responder(res, 400, { ok: false, error: 'body ilegible' })
    return
  }

  let body
  try {
    const tipo = (req.headers['content-type'] ?? '').split(';')[0].trim()
    body =
      tipo === 'application/json'
        ? JSON.parse(raw)
        : Object.fromEntries(new URLSearchParams(raw))
  } catch {
    responder(res, 400, { ok: false, error: 'formato inválido' })
    return
  }

  const quiereHtml = (req.headers.accept ?? '').includes('text/html')
  const v = validar(body)

  // Honeypot rellenado (bot): responder 200 falso, sin enviar ni señalizar.
  if (v.ok === false && v.honeypot) {
    console.log('[contacto] honeypot detectado')
    if (quiereHtml) responderHtml(res, 200, '✓ mensaje enviado', 'Gracias por ponerte en contacto conmigo.')
    else responder(res, 200, { ok: true })
    return
  }
  if (!v.ok) {
    if (quiereHtml) responderHtml(res, 400, '✗ no se ha podido enviar', 'Revisa los campos (nombre, mail y mensaje son obligatorios).')
    else responder(res, 400, { ok: false, error: v.error })
    return
  }

  // Rate limit (después de validar: los bots que fallan validación no gastan cuota)
  if (!permitidoPorRateLimit(ip)) {
    console.log(`[contacto] rate limit: ${ip}`)
    if (quiereHtml) responderHtml(res, 429, '✗ no se ha podido enviar', 'Demasiados envíos desde esta IP. Inténtalo más tarde.')
    else responder(res, 429, { ok: false, error: 'límite de envíos alcanzado' })
    return
  }

  // Envío real
  try {
    const id = await enviarResend(v.datos)
    console.log(`[contacto] enviado ok (id=${id})`)
    if (quiereHtml) {
      responderHtml(
        res,
        200,
        '✓ mensaje enviado',
        'Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé muy pronto.',
      )
    } else {
      responder(res, 200, { ok: true })
    }
  } catch (err) {
    console.error(`[contacto] error de envío: ${err.message}`)
    if (quiereHtml) {
      responderHtml(res, 500, '✗ no se ha podido enviar', 'Error interno. Inténtalo de nuevo más tarde.')
    } else {
      responder(res, 500, { ok: false, error: 'error interno' })
    }
  }
})

// Escucha en todas las interfaces DEL CONTENEDOR: el aislamiento real lo da
// el PublishPort (127.0.0.1:8081 solo en el host); dentro del contenedor,
// Caddy lo alcanza por la red interna webcv-net (DNS por nombre).
server.listen(PORT, () => {
  console.log(`[contacto] escuchando en el puerto ${PORT}`)
})
