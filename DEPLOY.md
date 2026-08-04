# DEPLOY — Guía de despliegue y operación

> Cómo está desplegada la Web CV, cómo desplegarla desde cero y cómo operarla.
> Documento vivo: cualquier cambio de infraestructura se refleja aquí.
> Histórico de decisiones de la fase: `PLAN-deploy.md`.

## 1. Arquitectura

```
 Visitante ──► https://joviur.dpdns.org/cv/
                    │
            Cloudflare (TLS, DNS, túnel)
                    │  saliente (cloudflared, sin puertos abiertos)
                    ▼
      ┌────────────── VPS OVH (UFW cerrado) ──────────────────────────┐
      │   cloudflared-web-cv (contenedor)                             │
      │       │                                                       │
      │       ▼                                                       │
      │   web-cv — Caddy :8080 (contenedor)                           │
      │    ├─ /cv/*      → /srv/cv = ~/web-cv/dist (mount ro)         │
      │    └─ /cv/api/*  → http://contacto-api:8081 (red webcv-net)   │
      │   contacto-api — Node 22 :8081 (contenedor)                   │
      │       └─ Resend API → [email-eliminado]          │
      └───────────────────────────────────────────────────────────────┘
```

**Características clave**

- **Cero puertos abiertos**: el único acceso al VPS es SSH (22222) y el túnel
  saliente de cloudflared. UFW permanece cerrado.
- **Tres contenedores Podman rootless** (systemd user + Linger), unidades
  generadas por **Quadlet** (`~/.config/containers/systemd/*.container`):
  `web-cv`, `contacto-api`, `cloudflared-web-cv`.
- **Red `webcv-net`** (bridge custom): Caddy y el endpoint se ven por nombre
  (`contacto-api:8081`). La red rootless por defecto no tiene DNS por nombre.
- **Secrets** en `~/web-cv-secrets/*.env` (permisos 600): `contacto.env`
  (Resend) y `cloudflared.env` (token del túnel). Nunca en el repo.
- El sitio se construye con **base `/cv`** (`ASTRO_BASE=/cv`): todo el contenido
  vive bajo esa ruta pública.

## 2. Requisitos

| Recurso | Detalle |
|---|---|
| VPS OVH | Ubuntu 26.04, Podman ≥ 5.7 rootless, Linger activo, usuario `joviur` |
| Dominio | `joviur.dpdns.org` — zona activa en Cloudflare |
| Túnel | Cloudflare Zero Trust (tunnel `web-cv`) con public hostname: `joviur.dpdns.org`, path `/cv` → `http://localhost:8080` |
| Resend | Cuenta + dominio `joviur.dpdns.org` verificado + API key |
| SSH | `ssh -p 22222 joviur@[ip-vps]` (clave ed25519) |

## 3. Despliegue inicial (una sola vez)

```bash
# 1) Secrets (solo en el VPS, permisos 600)
mkdir -p ~/web-cv-secrets ~/web-cv
#   ~/web-cv-secrets/contacto.env:
#     PORT=8081
#     RESEND_API_KEY=re_…
#     RESEND_TO=[email-eliminado]
#     RESEND_FROM=contacto@joviur.dpdns.org
#     ASUNTO_DEFAULT=Contacto desde web-cv
#     ALLOWED_ORIGINS=https://joviur.dpdns.org
#     RATE_LIMIT=5
#   ~/web-cv-secrets/cloudflared.env:
#     TUNNEL_TOKEN=eyJ…
chmod 600 ~/web-cv-secrets/*.env

# 2) Red interna (una sola vez)
podman network create webcv-net

# 3) Imágenes (repetible cuando cambien server/ o deploy/)
#    Subir server/contacto → ~/web-cv/contacto y deploy/cloudflared → ~/web-cv/cloudflared
cd ~/web-cv/contacto   && podman build -t contacto-api:latest .
cd ~/web-cv/cloudflared && podman build -t cloudflared-web-cv:latest .

# 4) Quadlets (repetible cuando cambien deploy/quadlet/)
#    Subir deploy/quadlet/*.container → ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user start web-cv contacto-api cloudflared-web-cv

# 5) Autostart — systemd 256 NO permite `enable` de unidades generadas
mkdir -p ~/.config/systemd/user/default.target.wants
for s in web-cv contacto-api cloudflared-web-cv; do
  ln -sf /run/user/1001/systemd/generator/$s.service \
    ~/.config/systemd/user/default.target.wants/$s.service
done

# 6) Contenido web (desde el repo, en Windows)
./deploy.sh
```

## 4. Operación diaria

```bash
# Estado de los servicios
systemctl --user status web-cv contacto-api cloudflared-web-cv
systemctl --user is-active web-cv contacto-api cloudflared-web-cv

# Logs
journalctl --user -u contacto-api -n 50 --no-pager     # envíos del formulario
journalctl --user -u cloudflared-web-cv -n 20          # conexiones del túnel
journalctl --user -u web-cv -n 20                      # peticiones Caddy

# Reiniciar un servicio
systemctl --user restart web-cv

# Actualizar el sitio (desde el repo)
./deploy.sh    # build base /cv → sube dist/ + Caddyfile → restart web-cv

# Actualizar el endpoint (después de cambiar server/contacto)
# 1) subir server/contacto → ~/web-cv/contacto
# 2) cd ~/web-cv/contacto && podman build -t contacto-api:latest .
# 3) systemctl --user restart contacto-api
```

## 5. Pruebas de salud

```bash
# Desde el VPS
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/cv/      # 200
curl -s http://127.0.0.1:8081/health                                   # {"ok":true}
curl -s http://127.0.0.1:8080/cv/api/health                            # {"ok":true} (proxy)

# Desde fuera (vía túnel)
curl -s https://joviur.dpdns.org/cv/ | grep "<title>"
# Envío de prueba (respeta el rate limit: 5/día/IP)
curl -X POST https://joviur.dpdns.org/cv/api/contacto \
  -H "Origin: https://joviur.dpdns.org" -H "Content-Type: application/json" \
  -d '{"nombre":"Test","empresa":"","mail":"test@example.com","asunto":"","mensaje":"Mensaje de prueba del despliegue"}'
# → 200 {"ok":true} y llega el mail a RESEND_TO
```

## 6. Troubleshooting (problemas reales resueltos)

| Síntoma | Causa | Solución |
|---|---|---|
| `cloudflared` sale con error de argumentos | La imagen oficial es **distroless** (sin shell): un `CMD ["sh","-c",…]` no funciona | Token por env var `TUNNEL_TOKEN` (soporte nativo `--token [$TUNNEL_TOKEN]`), leída por podman desde el EnvironmentFile (600). El contenedor corre como nonroot: no puede leer bind mounts de ficheros 600 |
| Caddy `502` en `/cv/api/*` | El `reverse_proxy 127.0.0.1:8081` apunta al loopback **del contenedor** | Red bridge `webcv-net` + `reverse_proxy http://contacto-api:8081` (DNS por nombre; la red por defecto con pasta no resuelve nombres) |
| Endpoint inalcanzable desde el host (`[000]`) | El servidor escuchaba solo en su loopback interno; el tráfico del host entra por otra interfaz | `server.listen(PORT)` (todas las interfaces del contenedor). El aislamiento lo da el `PublishPort` solo-loopback en el host |
| `systemctl --user enable` falla: "unit is transient or generated" | systemd 256 bloquea el enable de unidades generadas | Autostart con symlinks en `default.target.wants` → `/run/user/1001/systemd/generator/<svc>.service` |
| `rsync: command not found` en Windows | rsync no está en git-bash | `deploy.sh` usa tar-pipe (`tar -C dist -czf - . | ssh … tar -xzf -`) |
| `Address already in use` en 8080 | Otro contenedor usando el puerto | Liberar el puerto o cambiar `PublishPort` (y el service del public hostname en Cloudflare) |
| Envío → `500 error interno` | Resend responde error (ver `journalctl --user -u contacto-api`) | El mensaje de Resend indica la causa (p.ej. dominio no verificado) |

## 7. Rollback

```bash
# Contenido web: volver a un commit anterior del repo y redeployar
git checkout <commit> -- . && ./deploy.sh

# Endpoint: reconstruir la imagen desde el commit anterior
# (server/contacto en el repo) y reiniciar
systemctl --user restart contacto-api

# Túnel: si cloudflared falla, el sitio deja de resolverse (el VPS no se expone)
# — simplemente reiniciar el servicio cuando el token/red estén bien
```

## 8. Fuera de alcance / notas

- **No abrir puertos**: si algún día se sirve el sitio sin túnel, habría que
  abrir 80/443 en UFW y cambiar la estrategia TLS (hoy lo gestiona Cloudflare).
- El `postfix` del host (puerto 25) no se usa: el envío va por Resend.
- El contenido de `~/web-cv/dist` se regenera en cada `deploy.sh` (borrado
  previo) — no editar nada ahí a mano.
