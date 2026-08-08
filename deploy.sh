#!/usr/bin/env bash
# =============================================================================
# Deploy de la Web CV al VPS (SSH puerto 22222 — IP real vía VPS_TARGET)
#
# Arquitectura (PLAN-deploy.md):
#   Cloudflare Tunnel (joviur.dpdns.org/cv/*) → cloudflared (VPS)
#   → Caddy contenedor (127.0.0.1:8080) → estáticos dist/ + proxy /cv/api/*
#   → contacto-api contenedor (127.0.0.1:8081, Resend)
#   Cero puertos abiertos: el túnel es saliente, UFW intacto.
#
# Este script despliega SOLO el contenido web (dist/ + Caddyfile).
# El endpoint, cloudflared y los secrets se despliegan una sola vez
# (ver PLAN-deploy.md §6).
#
# Nota: usa tar sobre ssh (rsync no está disponible en este entorno Windows).
#
# Uso: VPS_TARGET="joviur@<ip-vps>" ./deploy.sh
# =============================================================================
set -euo pipefail

TARGET="${VPS_TARGET:?Define VPS_TARGET (ej: VPS_TARGET=\"joviur@<ip-vps>\" ./deploy.sh)}"
SSH_PORT=22222
SSH="/c/Windows/System32/OpenSSH/ssh.exe -p ${SSH_PORT} -o BatchMode=yes"

echo "==> Build de producción (base /cv)..."
ASTRO_BASE=/cv pnpm build

echo "==> Transfiriendo dist/ y Caddyfile a ${TARGET}:~/web-cv ..."
# dist/: reemplazo limpio vía tar-pipe (equivalente a rsync --delete)
tar -C dist -czf - . | ${SSH} "${TARGET}" \
  'rm -rf ~/web-cv/dist && mkdir -p ~/web-cv/dist && tar -xzf - -C ~/web-cv/dist'
# Caddyfile: versionado en el repo
tar -C deploy -czf - Caddyfile | ${SSH} "${TARGET}" \
  'tar -xzf - -C ~/web-cv'

echo "==> Reiniciando el servicio web (Caddy)..."
${SSH} "${TARGET}" 'systemctl --user restart web-cv && systemctl --user is-active web-cv'

echo ""
echo "==> OK. https://joviur.dpdns.org/cv/ actualizado"
