# PLAN — Despliegue público con Cloudflare Tunnel (fase 14)

> Web CV servida en **https://joviur.dpdns.org/cv/** mediante Cloudflare Tunnel. Cero puertos abiertos en el VPS (el túnel es saliente), UFW intacto, hardening sin cambios.
>
> **Estado:** v1.0 — pendiente de aprobación del usuario (decisiones D1–D7 cerradas el 2026-08-01).
> **Depende de:** SPEC-contacto.md (§5.6 contrato del endpoint, fase 2) · deploy.sh.
> **Ficheros:** `server/contacto/*` (endpoint + Containerfile + env example), `deploy/Caddyfile`, `deploy/quadlet/*.container`, `deploy.sh`, `astro.config.mjs` (base `/cv`), `src/pages/index.astro`, `src/components/ContactModal.astro`.

---

## 1. Arquitectura

```
Internet → Cloudflare (joviur.dpdns.org/cv/*)
              │  TLS gestionado por Cloudflare
              ▼
       cloudflared (VPS, proceso/contenedor)
              │  túnel saliente (sin puertos abiertos)
              ▼
   Caddy :8080 (contenedor web-cv, loopback)
       │  handle_path /cv/api/* → proxy
       │  handle_path /cv*      → estáticos dist/
       ▼                        ▼
 contacto-api :8081 (contenedor, loopback, Resend)   dist/ (bind mount ro)
```

- **Túnel**: Cloudflare Zero Trust (token del tunnel). DNS del hostname lo gestiona Cloudflare (CNAME proxied `<tunnel-id>.cfargotunnel.com`).
- **Caddy**: sirve bajo `/cv` (el build de Astro usa `base=/cv`), strippea el prefijo con `handle_path` y proxya `/cv/api/*` al endpoint.
- **Endpoint** (`server/contacto/server.mjs`): Node 22 sin dependencias, valida, honeypot, rate limit 5/día/IP, Origin check, envío por Resend (contrato SPEC-contacto §5.6).

## 2. Decisiones cerradas

| # | Decisión | Resolución |
|---|---|---|
| D1 | Método de despliegue | **B** — Caddy en contenedor Podman |
| D2 | Publicación | **Cloudflare Tunnel** bajo `/cv` (dominio `joviur.dpdns.org` en Cloudflare) |
| D3 | Puertos UFW | **No se abren** (túnel saliente) — el hardening queda intacto |
| D4 | Envío de correo | **Resend** (API key del usuario) |
| D5 | Base del sitio | `ASTRO_BASE=/cv` solo en build de producción (dev en raíz) |
| D6 | Formulario | Rutas relativas (`api/contacto`) → funcionan en raíz (dev) y `/cv` (prod) |
| D7 | Contenedores | Quadlet (systemd user): `web-cv` (caddy:2-alpine) + `contacto-api` (node:22-alpine, imagen local) |

## 3. Cambios en el repo (ya aplicados)

- `astro.config.mjs`: `base = process.env.ASTRO_BASE ?? ''`.
- `src/pages/index.astro`: favicon y og:image con `${import.meta.env.BASE_URL}`.
- `src/components/ContactModal.astro`: `action` y `fetch` → `api/contacto` (relativo).
- `server/contacto/server.mjs`: endpoint completo (validación, honeypot, rate limit, Origin, Resend, respuesta HTML sin-JS).
- `server/contacto/Containerfile` + `contacto.env.example` (los valores reales SOLO en el VPS, `chmod 600`).
- `deploy/Caddyfile`: `:80` loopback — `handle_path /cv/api/*` → proxy 8081, `handle_path /cv*` → estáticos, resto 404.
- `deploy/quadlet/web-cv.container` + `contacto-api.container`: unidades Quadlet.
- `deploy.sh`: build con `ASTRO_BASE=/cv`, rsync `dist/` + `Caddyfile`, restart `web-cv`.

## 4. Requisitos externos (estado 2026-08-01)

1. **Túnel Cloudflare**: ✅ creado por el usuario (`web-cv`). Token recibido → se guarda en `~/web-cv-secrets/cloudflared.env` (600). ⬜ Pendiente: confirmar **public hostname** en el dashboard: hostname `joviur.dpdns.org`, path `/cv`, service `http://localhost:8080`.
2. **Resend**: ⬜ dominio `joviur.dpdns.org` dado de alta, **esperando propagación DNS** (registros DKIM/SPF en Cloudflare). Confirmado: `RESEND_TO=[email-eliminado]`, `from` propuesto `contacto@joviur.dpdns.org`. El envío real funcionará cuando Resend detecte el dominio (antes, el endpoint devuelve error al llamar a Resend).
3. La API key de Resend y el token del túnel solo viven en `~/web-cv-secrets/*.env` (600) — nunca en el repo.

## 5. Verificación local (hecha)

- `pnpm run test` 13/13 · `pnpm run lint` 0 · `pnpm run build` OK.
- Build con `ASTRO_BASE=/cv` → assets `/cv/_astro/*`, `og:image`/favicon `/cv/og-image.png`, `form.action` resuelto a `/cv/api/contacto`.
- Endpoint (arranque local + curl): health ✓, honeypot → 200 falso ✓, origin malo → 403 ✓, mail inválido → 400 ✓, rate limit 5/día (6º → 429) ✓, form-urlencoded ✓, respuesta HTML sin-JS ✓.

## 6. Pasos de despliegue en el VPS (requieren permiso del usuario)

```bash
# ── 1) Secrets (una sola vez) ────────────────────────────────────────────
mkdir -p ~/web-cv-secrets ~/web-cv
# (los dos ficheros se crean con heredoc; chmod 600 al final)

# ── 2) Imágenes (una sola vez, o al cambiar server/contacto o deploy/cloudflared) ──
rsync -avz server/contacto/  joviur@[ip-vps]:~/web-cv/contacto/
rsync -avz deploy/cloudflared/ joviur@[ip-vps]:~/web-cv/cloudflared/
ssh -p 22222 joviur@[ip-vps] \
  'cd ~/web-cv/contacto && podman build -t contacto-api:latest . && cd ~/web-cv/cloudflared && podman build -t cloudflared-web-cv:latest .'

# ── 3) Quadlet + arranque de los 3 servicios ────────────────────────────
rsync -avz deploy/quadlet/ joviur@[ip-vps]:~/.config/containers/systemd/
ssh -p 22222 joviur@[ip-vps] \
  'systemctl --user daemon-reload && systemctl --user enable --now web-cv contacto-api cloudflared-web-cv'

# ── 4) Contenido web (repetible) ────────────────────────────────────────
./deploy.sh

# ── 5) Pruebas ──────────────────────────────────────────────────────────
ssh … 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/cv/'          # 200
ssh … 'curl -s http://127.0.0.1:8081/health'                                        # {"ok":true}
# Envío end-to-end desde https://joviur.dpdns.org/cv/ cuando Resend verifique el dominio
```

## 7. Fuera de alcance

- NO abrir puertos en UFW (el túnel no lo necesita).
- NO tocar postfix (:25) — queda como está.
- NO cambiar hardening existente.
