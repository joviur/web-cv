# SECURITY — Seguridad y privacidad

Postura de seguridad de la Web CV: privacidad de los datos personales,
anti-spam del formulario y política de secrets.

## 1. Privacidad de los datos de contacto

- El **email real y el teléfono del dueño nunca aparecen en el frontend**:
  ni en el HTML, ni en el JS, ni ofuscados, ni en comentarios. La única vía de
  contacto es el formulario (modal TUI).
- Verificación en cada build: `grep -riE "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|6[0-9]{2} ?[0-9]{3} ?[0-9]{3}" src dist`
  debe devolver **0 resultados** (también se comprueba que no existan `mailto:`/`tel:`).
- El destino real del correo (`RESEND_TO`) vive **solo** en
  `~/web-cv-secrets/contacto.env` del VPS (permisos 600) — nunca en el repo.
- La API key de Resend y el token del túnel siguen la misma política
  (`~/web-cv-secrets/*.env`, 600). Si un secreto viaja por un canal no seguro
  (chat, email), lo recomendable es **rotarlo**.

## 2. Anti-spam del formulario (endpoint)

Capas aplicadas en `server/contacto/server.mjs`, en orden:

| Capa | Comportamiento |
|---|---|
| **Honeypot** (`website`, oculto) | Si llega relleno → **200 falso** sin enviar ni señalizar (el bot no aprende) |
| **Validación server-side** | nombre 2–100, mail válido (≤254), mensaje 10–5000, asunto ≤200; la empresa es opcional. Los payloads > 16 KB se rechazan (413) |
| **Rate limit** | 5 envíos/día/IP en memoria (el 6º → 429). Se aplica **después** de validar: los bots que fallan validación no gastan cuota |
| **Origin check** | Si el header `Origin` viene presente debe estar en `ALLOWED_ORIGINS` (el dominio real); si no → 403. Sin Origin (curl, submit antiguo) se permite |
| **Asunto por defecto** | El servidor sustituye el asunto vacío (`Contacto desde web-cv`) — el cliente no decide |

El formulario en sí usa **validación HTML nativa** (`required`, `type=email`,
`minlength`) y el botón se deshabilita durante el envío (anti doble-submit).

**Límites conocidos** (aceptados para un CV): el rate limit es por IP y en
memoria (se reinicia al reiniciar el contenedor); no hay captcha. Si llegara
spam real, la primera mejora sería persistir el rate limit o añadir un captcha
ligero.

## 3. Infraestructura

- **Cero puertos abiertos** en el VPS: UFW cerrado; el único acceso es SSH
  (22222, solo clave) y el **túnel saliente** de cloudflared (Cloudflare
  gestiona el TLS en el borde).
- Contenedores Podman rootless con `PublishPort` **solo-loopback**
  (`127.0.0.1:8080` y `127.0.0.1:8081`): nada escucha en interfaces externas.
- El endpoint solo acepta `POST` (y `GET /health`); el resto → 405.
- El endpoint **no loguea PII** del remitente: solo método, IP (en eventos de
  bloqueo), estado y el id de Resend.

## 4. Si encuentras un problema

El canal público es el propio formulario de contacto del sitio. Para asuntos
sensibles, usa el formulario indicando que es un aviso de seguridad.
