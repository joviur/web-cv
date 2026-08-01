# SPEC — Contacto por modal TUI + endpoint propio (sin email/teléfono públicos)

> **Feature:** el email y el teléfono desaparecen del footer (nunca visibles en la web pública). Se añaden botones `[contactar]` en navbar y footer que abren un modal estilo ventana TUI con un formulario de contacto. El envío lo hace un endpoint propio en el VPS (contenedor Podman + Resend) vía `POST /api/contacto`; el visitante recibe un agradecimiento y el dueño recibe el mail con los datos del formulario y reply-to del remitente.
>
> **Estado:** v1.0 — **PENDIENTE DE APROBACIÓN** (decisiones cerradas en tabla §10).
> **Fecha:** 2026-08-01 · **Proyecto:** Web CV (Astro 5 + JS vanilla) · **Depende de:** SPEC-hero-resto.md (implementada) · **Ficheros afectados:** `src/components/Footer.astro`, `src/components/Navbar.astro`, `src/components/ContactModal.astro` (nuevo), `src/data/cv.ts`, `src/types/cv.ts`, `src/i18n/translations.ts`, `src/styles/global.css` (+ infra VPS en fase posterior).

---

## 1. Problema / motivación

El footer muestra hoy el email y el teléfono como texto plano con enlaces `mailto:` y `tel:` — 100 % scrapeables por bots. La página va a ser pública en internet, así que esos datos no deben aparecer nunca en el HTML (ni siquiera ofuscados: la única protección real es no publicarlos). Además, el email y el teléfono tampoco deben aparecer en el PDF generado por print (también es un artefacto público).

Los idiomas del footer se eliminan: no aportan al perfil (nivel de inglés A2) y el usuario los considera irrelevantes.

En su lugar, el contacto fluye por un formulario en un modal estilo "ventana TUI" (coherente con la estética terminal de la página), abierto desde un CTA permanente en el navbar y otro en el footer. El envío lo hace un endpoint propio en el VPS que reenvía el mensaje por Resend al email real del dueño — que **solo vive en la config del VPS**, nunca en el repo ni en el HTML.

## 2. Contexto técnico (restricciones del proyecto)

- Estética TUI existente: barra tipo ventana con semáforos (`Navbar.astro`), prompts `josema@dev:~$`, tokens `--color-base/panel/ink/muted/line/phos/amber`, fuente JetBrains Mono, bordes `border-line`, `bg-panel`, `text-muted`, `hover:text-phos`.
- Progressive enhancement obligatorio (patrón `html.js` ya establecido): sin JS → contenido completo visible y funcional. El modal debe degradar a formulario inline en el footer con submit nativo.
- Presupuesto JS: hoy el HTML total pesa ~5.8 KB gzip con todo el JS inline. El modal puede añadir ~1–2 KB gzip (presupuesto total < 10 KB sigue cumpliéndose).
- `cv.ts` es la única fuente de datos; `translations.ts` con helper `t()` (idioma fijo ES, fallback a es).
- Despliegue: VPS OVH (deploy.sh), decisión de cómo servir el sitio (nginx/caddy/podman + abrir 80/443, o solo Tailscale) **sigue pendiente** — el endpoint de contacto se expondrá vía el proxy web que se elija; el contrato API (§5.6) es independiente de esa decisión.
- El email real del dueño aparece hoy en `cv.ts` (historial git). Al quitarlo del frontend, deja de estar en el código futuro; el destino del correo pasa a ser variable de entorno en el VPS.

## 3. Requisitos funcionales

### RF-1 — Email y teléfono fuera del footer (y del HTML)
- **CA-1.1:** El footer ya no renderiza `cv.email`, `cv.telefono` ni `cv.idiomas` (D1-A, D2-A, D3-A).
- **CA-1.2:** `email` y `telefono` se eliminan de `cv.ts` y de `CvData` en `types/cv.ts` (nada en el frontend los necesita; eliminar datos muertos evita re-exposiciones accidentales).
- **CA-1.3:** El email real no aparece en ningún fichero del frontend: ni HTML, ni JS, ni comentarios, ni atributos `data-*`.
- **CA-1.4:** El print/PDF tampoco incluye email ni teléfono (§5.4).

### RF-2 — CTA `[contactar]` en navbar y footer
- **CA-2.1:** Navbar: botón `[contactar]` (estilo idéntico a `[PDF]`: borde, `text-[11px]`, hover phos) en la fila de botones de la barra superior, junto a `[PDF]` y el theme toggle (D4-A).
- **CA-2.2:** Footer: botón `[contactar]` que sustituye a los antiguos enlaces, acompañado de `{cv.ubicacion}` (D4-B). El footer conserva `[ fin del fichero ]`.
- **CA-2.3:** Ambos botones abren el mismo modal (atributo `data-contact-open`).

### RF-3 — Modal ventana TUI
- **CA-3.1:** Overlay `fixed inset-0` con fondo oscurecido (`color-mix` negro ~50 %) y blur sutil; ventana centrada (`max-w` ~420 px), `bg-panel`, `border border-line`, alineada a la estética TUI.
- **CA-3.2:** Barra de título con los tres semáforos (mismos colores que el navbar) + `✉ contacto — web-cv` + botón `[x]` (D5-A).
- **CA-3.3:** Contenido: línea de prompt `josema@dev:~$ ./contactar` + campos con labels estilo prompt `nombre >`, `empresa >`, `mail >`, `asunto >` (marcado `(opcional)`), `mensaje >` (textarea 4 filas) + botón `[enviar]` (D6-A).
- **CA-3.4:** Animación de apertura: fade-in 0.15 s + scale 0.98→1 (respetando `prefers-reduced-motion`).

### RF-4 — Formulario y envío
- **CA-4.1:** Campos: nombre (requerido), empresa (opcional), mail (requerido, `type=email`), asunto (opcional), mensaje (requerido, min 10 caracteres). (D7-A)
- **CA-4.2:** Asunto vacío → el **servidor** usa el default `Contacto desde web-cv` (D8-A; la lógica vive en el endpoint, el cliente no decide).
- **CA-4.3:** Envío con `fetch` a `POST /api/contacto` (JSON), timeout 10 s (AbortController), doble-submit bloqueado (botón deshabilitado mientras envía).
- **CA-4.4:** Estados del modal: `enviando…` → éxito con **agradecimiento** (D9-A): `✓ mensaje enviado` + "Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé muy pronto." + botón `[cerrar]`; o error genérico (D10-A): `✗ no se ha podido enviar — inténtalo de nuevo más tarde` (sin detalles técnicos).
- **CA-4.5:** Sin cierre automático tras el envío (el visitante lee el agradecimiento y cierra con `[cerrar]`, `[x]`, ESC o overlay).
- **CA-4.6:** Al cerrar, el formulario se resetea (vuelve al estado inicial) y el foco vuelve al botón que lo abrió.

### RF-5 — Progressive enhancement (sin JS)
- **CA-5.1:** Con `html.js`: el formulario vive dentro del modal, oculto del flujo (`display:none`) hasta que un botón lo abre.
- **CA-5.2:** Sin JS: el mismo marcado se muestra **inline dentro del footer** (patrón `html.js [data-modal] { display:none }`, como `data-tipeo-resto`) y el submit es nativo (`POST` form-urlencoded a `/api/contacto`, `Accept: text/html`).
- **CA-5.3:** Sin JS, el endpoint responde una mini-página HTML de confirmación ("mensaje enviado — gracias") en lugar de JSON.

### RF-6 — Accesibilidad del modal
- **CA-6.1:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → título; overlay y ventana con los atributos necesarios.
- **CA-6.2:** Apertura: foco al primer campo. Cierre: `ESC`, `[x]`, click en overlay, `[cerrar]`. Focus trap (Tab cíclico dentro del modal). Foco restaurado al abrir.
- **CA-6.3:** `prefers-reduced-motion` → sin animaciones (apertura instantánea).
- **CA-6.4:** Al abrir, `inert` (o `aria-hidden` + gestión de foco equivalente) sobre el resto de la página si el soporte lo permite; mínimo indispensable: el focus trap.

### RF-7 — Anti-spam y validación
- **CA-7.1:** Honeypot: input `website` oculto (posicional, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`) — si llega relleno, el endpoint responde 200 falso sin enviar (D11-A).
- **CA-7.2:** Validación cliente: `required` + `type=email` + `minlength` (HTML nativo, sin JS extra). Validación servidor independiente (§5.6).

## 4. Requisitos no funcionales

- **RNF-1 (Privacidad):** el email real del dueño no existe en el frontend (ni HTML, ni JS, ni comentarios, ni git futuro). Solo en `RESEND_TO` del VPS.
- **RNF-2 (JS budget):** ≤ ~2 KB gzip nuevos (componente modal + gestión de estados). Total página < 10 KB gzip.
- **RNF-3 (A11y):** modal operable por teclado (Tab/ESC), anunciado como diálogo, sin trampas de foco, reduced-motion respetado.
- **RNF-4 (Móvil):** modal con `max-height` ~85vh y scroll interno; al enfocar un input el modal queda visible (el teclado virtual no lo tapa; `scroll-margin` en inputs si hace falta).
- **RNF-5 (Print):** el modal (abierto o cerrado) y los botones `[contactar]` no se imprimen; el footer en print queda con ubicación + `[ fin del fichero ]`.
- **RNF-6 (Robustez):** fallo de red / 429 / 400 → mensaje de error genérico, formulario conserva los datos (no se pierde lo escrito).

## 5. Diseño propuesto

### 5.1 `src/components/ContactModal.astro` (nuevo)
- Estructura (en el DOM desde el primer render, montado dentro de `<Footer>`):
  ```astro
  <div data-modal-contacto role="dialog" aria-modal="true" aria-labelledby="contacto-titulo" class="…">
    <div class="overlay" data-contacto-cerrar></div>   <!-- click → cerrar -->
    <div class="ventana border border-line bg-panel">
      <div class="barra-titulo"> ● ● ●  <span id="contacto-titulo">✉ contacto — web-cv</span>  <button data-contacto-cerrar>[x]</button></div>
      <p>josema@dev:~$ ./contactar</p>
      <form data-contacto-form novalidate> … </form>
      <p data-contacto-estado role="status" aria-live="polite"></p>
    </div>
  </div>
  ```
- Formulario: `nombre >` `[input name=nombre required]` · `empresa >` `[input name=empresa]` · `mail >` `[input type=email name=mail required]` · `asunto >` `[input name=asunto] (opcional)` · `mensaje >` `[textarea name=mensaje required minlength=10 rows=4]` · honeypot `[input name=website tabindex=-1 autocomplete=off]` · `[enviar]` (submit).
- Script del componente (vanilla, tipado):
  - `document.querySelectorAll('[data-contact-open]')` → abrir (guardar `document.activeElement` como origen del foco).
  - Cerrar: ESC / `[x]` / overlay / `[cerrar]` → reset + restaurar foco.
  - Focus trap: lista de elementos enfocables del modal, Tab/Shift+Tab cíclico.
  - Submit: `fetch('/api/contacto', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(campos), signal: AbortSignal.timeout(10000) })`; manejo de estados (CA-4.4); `novalidate` + validación manual ligera (nombre/mail/mensaje) para mantener el control del mensaje de error.
- Copy i18n: todo el texto visible vía `t('contacto.*')` (§5.5).

### 5.2 `src/components/Footer.astro`
```astro
<footer id="contacto" data-tipeo-resto class="…">
  <div class="…">
    <button data-contact-open class="…estilo botón…">[contactar]</button>
    <span>{cv.ubicacion}</span>
  </div>
  <p class="…">[ {t('footer.fin')} ]</p>
  <ContactModal />
</footer>
```
- Se eliminan el `mailto:`, el `tel:` y el mapeo de idiomas.

### 5.3 `src/components/Navbar.astro`
- En la fila de botones (junto a `print-btn`): `<button data-contact-open class="…">[contactar]</button>` (misma clase visual que `[PDF]`, con icono SVG de sobre de 12 px).
- El nav de secciones (`~/experiencia` … `~/contacto`) no cambia; el scroll-spy sigue apuntando a `#contacto` (el footer sigue existiendo).

### 5.4 Print — `src/styles/global.css`
```css
@media print {
  [data-modal-contacto], [data-contact-open] { display: none !important; }
}
```

### 5.5 i18n — `src/i18n/translations.ts`
Nuevo bloque en `Translation` y en `es` (el `en` sigue vacío con fallback):
```ts
contacto: {
  abrir: 'contactar',            // botones navbar/footer
  titulo: '✉ contacto — web-cv', // barra del modal
  comando: 'josema@dev:~$ ./contactar',
  nombre: 'nombre', empresa: 'empresa', mail: 'mail', asunto: 'asunto',
  asuntoOpcional: '(opcional)', mensaje: 'mensaje', enviar: 'enviar',
  enviando: 'enviando…', cerrar: 'cerrar',
  exitoTitulo: 'mensaje enviado',
  gracias: 'Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé muy pronto.',
  error: 'no se ha podido enviar — inténtalo de nuevo más tarde',
  // Aria
  ariaAbrir: 'Abrir formulario de contacto', ariaCerrar: 'Cerrar',
}
```

### 5.6 Contrato API — `POST /api/contacto` (endpoint VPS, fase posterior)
- **Request** (JSON con fetch | form-urlencoded con submit nativo): `{ nombre, empresa, mail, asunto, mensaje, website }`.
- **Validación servidor:** nombre ≥ 2 chars · mail formato válido · mensaje ≥ 10 chars · asunto opcional (vacío → `Contacto desde web-cv`) · empresa opcional · `website` debe estar **vacío** (honeypot) · rate limit 5/día/IP (en memoria del proceso; suficiente para un CV) · si `Origin` viene presente debe estar en la lista permitida (env `ALLOWED_ORIGINS`: dominio prod + localhost dev).
- **Response:** `200 {ok:true}` | `400 {ok:false}` (validación/honeypot → respuesta falsa 200 si es honeypot) | `429 {ok:false}` | `403` (origin). Con `Accept: text/html` → mini-página de confirmación (CA-5.3).
- **Envío:** Resend `POST https://api.resend.com/emails` con `from` (env `RESEND_FROM`), `to` = email real del dueño (**env `RESEND_TO`**, nunca en el repo), `reply_to` = mail del remitente, `subject` = asunto (o default), `text` = `Nombre: …\nEmpresa: …\nEmail: …\n\nMensaje:\n…`.
- **Despliegue (dependencia):** contenedor Podman rootless en el VPS (imagen node:22-alpine, puerto interno 8080), expuesto como `/api/contacto` por el proxy web que se elija al resolver deploy.sh (nginx/caddy/podman). Secrets (`RESEND_API_KEY`, `RESEND_TO`, `RESEND_FROM`, `ALLOWED_ORIGINS`) vía `EnvironmentFile` con permisos 600. **Esta fase requiere la decisión de despliegue (A/B/C/D de deploy.sh) y permiso explícito del usuario para tocar el VPS** — el frontend se implementa y verifica antes, contra el contrato.

## 6. Alternativas descartadas

| Alternativa | Motivo de descarte |
|---|---|
| Email/teléfono ofuscados (entidades HTML, ROT13 en JS, "mostrar al click") | Contras scrapers headless es inútil; el usuario eligió no publicarlos (D1/D2) |
| Formspree / FormSubmit / EmailJS | El usuario eligió endpoint propio + Resend (D7 anterior); sin dependencias de terceros ni cuotas |
| Formulario inline en el footer (sin modal) | CTA enterrado al final de la página; sin contacto visible sin scroll |
| Drawer lateral | Lenguaje de apps modernas, rompe la metáfora TUI (la ventana centrada con semáforos es la fiel) |
| Página separada `/contacto` | Rompe el one-page y el scroll-spy |
| "Escribir comando" como vía principal | Críptico para el visitante medio; el `./contactar` queda solo como línea decorativa del modal |
| Mostrar el número en imagen | Mala accesibilidad/UX; OCR existe |

## 7. Casos borde

| # | Caso | Comportamiento esperado |
|---|---|---|
| E1 | Sin JS | Botones `[contactar]` sin efecto JS pero el formulario visible inline en el footer; submit nativo → página de confirmación HTML |
| E2 | Red caída / endpoint caído | Estado `✗` genérico; los datos escritos se conservan |
| E3 | 429 (rate limit) | Mismo error genérico (no revelar el límite) |
| E4 | Honeypot rellenado (bot) | 200 falso, sin envío, sin señal al bot |
| E5 | Doble click en enviar | Botón deshabilitado durante el envío |
| E6 | ESC / overlay / [x] durante el envío | Se permite cerrar; el fetch continúa (no se aborta el envío por cerrar) |
| E7 | Móvil: teclado virtual | Modal con scroll interno; el campo enfocado queda visible |
| E8 | Print con modal abierto | Modal y botones no salen en el PDF |
| E9 | `prefers-reduced-motion` | Apertura instantánea, sin fade/scale |
| E10 | Dark mode | El modal usa tokens (`bg-panel`, `border-line`) → correcto en ambos temas |
| E11 | Asunto vacío | El servidor lo sustituye por `Contacto desde web-cv` |
| E12 | Interacción durante el boot del hero | El modal es independiente del tipeo; puede abrirse igualmente (botones fuera de `data-tipeo-resto`) |

## 8. Fuera de alcance

- NO tocar hero, tipeo, reveal, scroll-spy, secciones ni el resto de la página.
- NO implementar el backend del VPS en esta fase (requiere decisión de deploy.sh + permiso); el frontend queda listo contra el contrato §5.6.
- NO tocar la clave `secciones.idiomas` de translations (dead code preexistente, inofensivo).
- NO añadir captcha/recaptcha (honeypot + rate limit es suficiente para un CV; se puede revisar si llega spam real).
- NO abrir puertos en el VPS ni tocar infraestructura.

## 9. Plan de verificación

1. `pnpm run test` (13/13) + `pnpm run lint` (0 errores) + `pnpm run build` OK.
2. Navegador (dev/preview):
   - Footer: sin email, sin teléfono, sin idiomas; botón `[contactar]` + ubicación.
   - Navbar: botón `[contactar]` junto a `[PDF]`; apertura del modal desde ambos.
   - Modal: aspecto TUI (semáforos, prompt, labels `>`), foco al primer campo, Tab cíclico, ESC/`[x]`/overlay cierran, foco restaurado, reset al cerrar.
   - Envío contra un stub local del contrato: estados `enviando…` → `✓` + agradecimiento; error de red → `✗` genérico con datos conservados.
   - Sin-JS (desactivar JS en devtools): formulario visible en el footer, submit nativo funcional.
   - Móvil (viewport 375 px): modal legible, scroll interno, teclado no tapa los campos.
   - Print: modal y botones ausentes; footer mínimo.
   - Dark mode: coherencia de colores. Console limpia.
3. Grep de seguridad: `grep -ri "josema.vizcainourban\|662 690" src dist` → 0 resultados (el email no existe en el frontend ni en el build).
4. JS total: incremento ≤ ~2 KB gzip.

## 10. Tabla de decisiones (cerradas)

| # | Decisión | Resolución |
|---|---|---|
| D1 | Email en la web | **A** — nunca visible, ni ofuscado; solo formulario |
| D2 | Teléfono en la web | **A** — nunca visible, ni ofuscado; solo formulario |
| D3 | Idiomas del footer | **A** — eliminados del footer y de `cv.ts`/`CvData` |
| D4 | Ubicación del CTA | **A** — botón `[contactar]` en navbar (fila de botones) y **B** — en el footer |
| D5 | Formato del modal | **A** — ventana TUI con semáforos, prompt `./contactar`, labels `campo >` |
| D6 | Botón de envío | **A** — `[enviar]` |
| D7 | Campos del formulario | **A** — nombre*, empresa, mail*, asunto (opcional), mensaje* |
| D8 | Asunto vacío | **A** — el servidor usa `Contacto desde web-cv` |
| D9 | Éxito | **A** — `✓ mensaje enviado` + agradecimiento ("…te responderé muy pronto"), sin cierre automático |
| D10 | Error | **A** — mensaje genérico, sin detalles, datos conservados |
| D11 | Anti-spam | **A** — honeypot + rate limit 5/día/IP + Origin check (sin captcha) |
| D12 | Envío | **A** — endpoint propio VPS (Podman + Resend), contrato §5.6 |
| D13 | Progressive enhancement | **A** — sin JS: formulario inline en footer + submit nativo con respuesta HTML |
| D14 | PDF/print | **A** — sin email/teléfono/botones/modal; footer mínimo |
