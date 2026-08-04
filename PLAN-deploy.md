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

## 4. Pendiente del usuario (requisitos externos)

1. **Túnel Cloudflare**: crear el tunnel en Zero Trust (Networks → Tunnels) y el public hostname `joviur.dpdns.org` con path `/cv` → `http://localhost:8080` (Cloudflare genera el DNS automáticamente). Entregar el **token** del tunnel (se guarda en el VPS, no en el repo).
2. **Resend**: verificar el dominio `joviur.dpdns.org` en Resend (registros DKIM/SPF a añadir en Cloudflare — los da el panel de Resend). `from` propuesto: `contacto@joviur.dpdns.org`. Confirmar `RESEND_TO` (email real de destino).
3. Ojo: la API key de Resend ya viajó por chat — se guarda solo en `~/web-cv-secrets/contacto.env` (600). Opcional: rotarla en Resend.

## 5. Verificación local (hecha)

- `pnpm run test` 13/13 · `pnpm run lint` 0 · `pnpm run build` OK.
- Build con `ASTRO_BASE=/cv` → assets `/cv/_astro/*`, `form.action` resuelto a `/cv/api/contacto`.
- Endpoint: arranque local + curl (JSON válido → 200, honeypot → 200 falso, mail inválido → 400, origin → 403, rate limit → 429). *(completar tras implementar)*

## 6. Pasos de despliegue en el VPS (requieren permiso del usuario)

```bash
# 1) Secrets (una sola vez)
ssh -p 22222 joviur@[ip-vps]
mkdir -p ~/web-cv-secrets ~/web-cv
# subir contacto.env con los valores reales (chmod 600)

# 2) Imagen del endpoint (una sola vez, o al cambiar server/contacto)
rsync -avz server/contacto/ joviur@IP:~/web-cv/contacto/
ssh … 'cd ~/web-cv/contacto && podman build -t contacto-api:latest .'

# 3) Quadlet + cloudflared
rsync -avz deploy/quadlet/ joviur@IP:~/.config/containers/systemd/
ssh … 'systemctl --user daemon-reload && systemctl --user enable --now web-cv contacto-api'
# cloudflared: contenedor cloudflare/cloudflared con el token (unit quadlet propia)

# 4) Contenido web (repetible)
./deploy.sh

# 5) Prueba end-to-end: envío real desde https://joviur.dpdns.org/cv/ → llega el mail
```

## 7. Fuera de alcance

- NO abrir puertos en UFW (el túnel no lo necesita).
- NO tocar postfix (:25) — queda como está.
- NO cambiar hardening existente.
