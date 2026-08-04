#!/usr/bin/env bash
# =============================================================================
# Deploy de la Web CV al VPS (joviur@[ip-vps], SSH puerto 22222)
#
# Arquitectura (PLAN-deploy.md):
#   Cloudflare Tunnel (joviur.dpdns.org/cv/*) → cloudflared (VPS)
#   → Caddy contenedor (127.0.0.1:8080) → estáticos dist/ + proxy /cv/api/*
#   → contacto-api contenedor (127.0.0.1:8081, Resend)
#   Cero puertos abiertos: el túnel es saliente, UFW intacto.
#
# Este script despliega SOLO el contenido web (dist/ + Caddyfile).
# El endpoint y los secrets se despliegan una sola vez (ver PLAN-deploy.md §6).
#
# Uso: ./deploy.sh
# =============================================================================
set -euo pipefail

TARGET="joviur@[ip-vps]"
SSH_PORT=22222
SSH="/c/Windows/System32/OpenSSH/ssh.exe -p ${SSH_PORT} -o BatchMode=yes"
DEST="~/web-cv"

echo "==> Build de producción (base /cv)..."
ASTRO_BASE=/cv pnpm build

echo "==> Transfiriendo dist/ y Caddyfile a ${TARGET}:${DEST} ..."
rsync -avz --delete -e "/c/Windows/System32/OpenSSH/ssh.exe -p ${SSH_PORT} -o BatchMode=yes" \
  dist/ "${TARGET}:${DEST}/dist/"
rsync -avz -e "/c/Windows/System32/OpenSSH/ssh.exe -p ${SSH_PORT} -o BatchMode=yes" \
  deploy/Caddyfile "${TARGET}:${DEST}/Caddyfile"

echo "==> Reiniciando el servicio web (Caddy)..."
${SSH} "${TARGET}" 'systemctl --user restart web-cv && systemctl --user is-active web-cv'

echo ""
echo "==> OK. https://joviur.dpdns.org/cv/ actualizado"
