# contacto-api — Endpoint del formulario de contacto

Servidor HTTP mínimo (**Node 22, cero dependencias**) que recibe el POST del
formulario de contacto (encaminado por Caddy: `/cv/api/*` → `127.0.0.1:8081`),
valida, filtra spam y reenvía por **Resend** al email del dueño.

Contrato completo: `SPEC-contacto.md` §5.6. Seguridad: `SECURITY.md` §2.

## Variables de entorno (ver `contacto.env.example`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de escucha (8081) |
| `RESEND_API_KEY` | API key de Resend (secreto — solo en el VPS, 600) |
| `RESEND_TO` | Email real de destino (secreto — solo en el VPS, 600) |
| `RESEND_FROM` | Remitente verificado en Resend (p.ej. `contacto@joviur.dpdns.org`) |
| `ASUNTO_DEFAULT` | Asunto cuando el visitante lo deja vacío |
| `ALLOWED_ORIGINS` | Orígenes permitidos separados por coma (Origin check). Vacío = permitir todo (solo para dev/curl) |
| `RATE_LIMIT` | Envíos máx. por IP y día (5) |

## Contrato API

**`POST /api/contacto`** (el path real lo decide el proxy; el endpoint responde
a cualquier POST). Body: JSON (`fetch`) o form-urlencoded (submit nativo).

| Campo | Regla |
|---|---|
| `nombre` | requerido, 2–100 |
| `empresa` | opcional, ≤100 |
| `mail` | requerido, formato válido, ≤254 |
| `asunto` | opcional, ≤200 (vacío → `ASUNTO_DEFAULT`) |
| `mensaje` | requerido, 10–5000 |
| `website` | honeypot: debe ir **vacío** (si no, 200 falso sin enviar) |

Respuestas: `200 {ok:true}` · `400` (validación) · `403` (origin no permitido)
· `413` (body > 16 KB) · `429` (rate limit) · `500` (fallo de Resend).
Con `Accept: text/html` (submit sin JS) responde una mini-página HTML.

**`GET /health`** → `200 {ok:true}` (healthcheck).

## Pruebas locales

```bash
PORT=8081 RESEND_API_KEY=re_key_falsa RESEND_TO=x@y.z \
RESEND_FROM=contacto@test.com ALLOWED_ORIGINS=https://joviur.dpdns.org \
node server.mjs

curl -s http://127.0.0.1:8081/health
curl -X POST http://127.0.0.1:8081/api/contacto \
  -H "Origin: https://joviur.dpdns.org" -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","empresa":"ACME","mail":"ana@test.com","asunto":"","mensaje":"Hola, me gustaría contactar contigo."}'
# honeypot → 200 falso:  -d '{"website":"http://spam"…}'
# origin malo  → 403:     -H "Origin: https://evil.com"
# mail inválido → 400:    -d '{"mail":"noesunmail"…}'
# rate limit: 6º envío válido del día → 429
```

## Despliegue

Imagen: `podman build -t contacto-api:latest .` (ver `Containerfile`).
Unidad Quadlet: `deploy/quadlet/contacto-api.container` (red `webcv-net`,
secrets vía EnvironmentFile). Operación y troubleshooting: `DEPLOY.md`.
