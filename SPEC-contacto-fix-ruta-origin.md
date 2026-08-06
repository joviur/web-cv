# SPEC — Fix envío del formulario de contacto (ruta + Origin + diagnóstico)

> **Feature:** corrección de los tres puntos frágiles detectados en producción que hacían fallar el envío del formulario (`ContactModal.astro` → `contacto-api`). Fix mínimo, sin cambiar el contrato API ni el diseño.
>
> **Estado:** v1.0 — **APROBADA** (ejecutada 2026-08-06).
> **Fecha:** 2026-08-06 · **Proyecto:** Web CV (Astro 5 + Node 22) · **Depende de:** SPEC-contacto.md (v1.0) · **Ficheros afectados:** `src/components/ContactModal.astro`, `server/contacto/contacto.env.example`, `DEPLOY.md`.

---

## 1. Problema / motivación

El formulario de contacto funcionaba en la cadena interna (Caddy → contacto-api → Resend) pero **fallaba en producción desde el navegador del visitante** con un error mudo `✗ no se ha podido enviar`. Diagnóstico en vivo (2026-08-06):

| # | Síntoma | Causa raíz |
|---|---|---|
| P1 | `POST /cv/api/contacto` con `Origin: https://www.joviur.dpdns.org` → **403** | `ALLOWED_ORIGINS` del VPS solo contenía `https://joviur.dpdns.org`; el visitante que entra por `www` recibe `403 origen no permitido` |
| P2 | `fetch('api/contacto')` **relativo** | La URL se resuelve contra la URL actual; rota si la página se sirve en `/cv` sin slash final o desde otra ruta base |
| P3 | Error genérico sin código HTTP | El `catch` mostraba `✗` sin distinguir 403/404/429/500, imposible diagnosticar sin mirar la consola |

Los registros DNS (MX/SPF/DKIM) y la verificación de Resend ya estaban correctos cuando se detectó; este fix no toca nada de DNS.

## 2. Contexto técnico (restricciones del proyecto)

- El sitio se construye con `ASTRO_BASE=/cv` (deploy.sh): todos los assets llevan prefijo `/cv/`, el endpoint vive en `/cv/api/contacto` (Caddyfile `handle_path /cv/api/*`).
- `import.meta.env.BASE_URL` en Astro **no garantiza slash final**: con `ASTRO_BASE=/cv` vale `/cv` (sin `/`). Concatenar `BASE_URL + 'api/contacto'` produce `/cvapi/contacto` — bug silencioso.
- El contrato API (SPEC-contacto §5.6) **no cambia**: `POST /cv/api/contacto`, JSON, Origin check, rate limit 5/día/IP.
- Progressive enhancement: el atributo `action` del form (submit nativo sin JS) y el `fetch` (con JS) deben apuntar a la misma URL.
- El origen permitido debe cubrir tanto `https://joviur.dpdns.org` como `https://www.joviur.dpdns.org`: ambos se sirven por el mismo túnel (CNAME www → cfargotunnel).

## 3. Cambios aplicados

### 3.1 `src/components/ContactModal.astro`

**Frontmatter** (nuevo):
```ts
// URL del endpoint de contacto, base-aware (ASTRO_BASE=/cv en prod).
// import.meta.env.BASE_URL NO garantiza slash final (/cv vs /cv/), se normaliza.
const base = import.meta.env.BASE_URL
const apiUrl = (base.endsWith('/') ? base : base + '/') + 'api/contacto'
```

**Form** (antes → después):
```html
<!-- antes -->
<form ... action="api/contacto" method="post">
<!-- después -->
<form ... action={apiUrl} method="post">
```

**Script cliente** — el `fetch` no puede usar la const del frontmatter (script separado), se recalcula:
```ts
const base = import.meta.env.BASE_URL
const apiUrl = (base.endsWith('/') ? base : base + '/') + 'api/contacto'
// ...
const res = await fetch(apiUrl, { method: 'POST', ... })
```

**Catch con código HTTP** (antes → después):
```ts
// antes
} catch {
  estado.innerHTML = `<span class="text-amber">✗ ${t('contacto.error')}</span>`
}
// después
} catch (err) {
  const codigo = err instanceof Error && /^\d{3}$/.test(err.message)
    ? ` (HTTP ${err.message})`
    : ''
  estado.innerHTML = `<span class="text-amber">✗ ${t('contacto.error')}${codigo}</span>`
  console.error('[contacto] envío fallido:', err)
}
```

Nota: el mensaje al visitante sigue siendo el genérico de SPEC-contacto D10-A; el código HTTP se añade como ayuda de diagnóstico (no revela datos sensibles, solo el status).

### 3.2 `server/contacto/contacto.env.example`

```env
ALLOWED_ORIGINS=https://joviur.dpdns.org,https://www.joviur.dpdns.org
```
Con comentario explicando que ambos orígenes se sirven por el mismo túnel.

### 3.3 `DEPLOY.md`

El ejemplo de `~/web-cv-secrets/contacto.env` (§3) ahora muestra ambos orígenes.

**Importante:** el archivo real `~/web-cv-secrets/contacto.env` del VPS NO se toca en este cambio de repo; el deploy debe actualizarlo a mano (o en el paso de deploy) para que el 403 de www desaparezca. Sin ese cambio de config en el VPS, el fix del frontend es insuficiente para el caso www.

## 4. Verificación

1. `pnpm run test` → 13/13 OK. `pnpm run lint` → 0 warnings/errors.
2. `ASTRO_BASE=/cv pnpm build` → OK.
3. Inspección del bundle: `fetch` y `action` deben resolver a `/cv/api/contacto` (con slash).
   ```bash
   grep -o 'action="[^"]*contacto"' dist/index.html        # action="/cv/api/contacto"
   grep -oE '.{0,30}api/contacto' dist/_astro/ContactModal*js
   ```
4. En vivo (después del deploy):
   - `curl -X POST https://joviur.dpdns.org/cv/api/contacto -H "Origin: https://joviur.dpdns.org" ...` → 200
   - `curl -X POST https://joviur.dpdns.org/cv/api/contacto -H "Origin: https://www.joviur.dpdns.org" ...` → 200 (tras actualizar ALLOWED_ORIGINS en el VPS)
   - Navegador por `www` y sin `www`: envío OK, email entregado.

## 5. Fuera de alcance

- NO cambiar el contrato API, campos del form, honeypot, rate limit ni el diseño del modal.
- NO tocar DNS/Resend (ya verificado).
- NO añadir redirección www→no-www en Cloudflare (posible mejora futura, requiere tocar el panel).

## 6. Casos borde

| # | Caso | Comportamiento |
|---|---|---|
| E1 | Página servida en `/cv/` (prod) | `apiUrl = /cv/api/contacto` ✓ |
| E2 | Dev en raíz (sin ASTRO_BASE) | `BASE_URL=''` → `apiUrl = /api/contacto` (contrato original dev) ✓ |
| E3 | `BASE_URL='/cv'` sin slash (caso real Astro) | Normalización añade `/` → `/cv/api/contacto` ✓ |
| E4 | Sin JS (submit nativo) | `action={apiUrl}` → mismo destino que fetch ✓ |
| E5 | Error 403/404/429/500 | El visitante ve `✗ … (HTTP 403)` y la consola el detalle ✓ |
| E6 | www vs no-www | Ambos 200 solo si el VPS tiene ambos orígenes; sin update del VPS, www sigue 403 (documentado en §3.3) |
