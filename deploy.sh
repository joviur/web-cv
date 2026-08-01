#!/usr/bin/env bash
# =============================================================================
# Deploy de la Web CV al VPS (joviur@152.228.142.220, SSH puerto 22222)
#
# ⚠️  PENDIENTE DE DECISIÓN DEL USUARIO — no ejecutar sin confirmar:
#   El VPS tiene hardening con CERO puertos abiertos (solo acceso Tailscale).
#   Elegir método de servir el sitio:
#     A) nginx + certbot (TLS)          -> requiere abrir 80/443
#     B) caddy (TLS automático)         -> requiere abrir 80/443
#     C) contenedor podman + systemd    -> requiere abrir 80/443
#     D) solo red Tailscale (sin abrir puertos, visible solo en la mesh)
#
# Uso: ./deploy.sh [usuario@host] [ruta_destino]
# =============================================================================
set -euo pipefail

TARGET="${1:-joviur@152.228.142.220}"
DEST="${2:-~/web-cv}"
SSH_PORT=22222

echo "==> Build de producción..."
pnpm build

echo "==> Transfiriendo dist/ a ${TARGET}:${DEST} ..."
rsync -avz --delete -e "ssh -p ${SSH_PORT}" dist/ "${TARGET}:${DEST}/"

echo ""
echo "==> OK. dist/ desplegado en ${TARGET}:${DEST}"
echo "==> Siguiente paso (pendiente de decisión): configurar el servidor web"
echo "    (nginx/caddy/podman) o exponer el sitio solo por Tailscale."
