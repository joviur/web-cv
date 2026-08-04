# ARCHITECTURE — Patrones y decisiones del frontend

Cómo está construida la Web CV por dentro: patrones, flujos y restricciones.
Los SPEC (`SPEC-*.md`) documentan las decisiones de cada feature; este
documento es la vista transversal.

## 1. Principios

1. **HTML estático primero**: todo el contenido del CV está en el HTML desde
   el primer byte (FCP sin JS). El JS solo añade capas de interacción.
2. **Progressive enhancement**: nada queda oculto o roto sin JS. El patrón
   `html.js` (clase puesta por un script inline del `<head>`) activa las
   capas JS; sin ella, el contenido es visible y funcional.
3. **Presupuesto JS < 10 KB gzip** (hoy ~2.2 KB): se mide en cada feature.
4. **JS vanilla tipado**, sin frameworks ni dependencias de runtime.
5. **Spec-Driven Design**: cada feature se decide en un SPEC (tabla de
   decisiones cerradas), se implementa, se verifica en navegador y se registra
   en `PROGRESS.md`.

## 2. Estructura

```
src/
├── pages/index.astro        # única página: head SEO, layout, script reveal global
├── components/              # Navbar, Hero, Experience(+Item), Skills, Education,
│                            # Projects, Footer, ContactModal
├── data/cv.ts               # contenido del CV (única fuente de verdad)
├── types/cv.ts              # modelo tipado
├── i18n/translations.ts     # diccionarios es/en + t() con fallback
├── lib/                     # lógica pura testeable (typing.ts, skills.ts)
└── styles/global.css        # Tailwind v4: tokens, dark, print, animaciones
```

## 3. Patrones clave

### 3.1 `html.js` y capas de interacción

El script inline del `<head>` (anti-FOUC del tema) añade `html.js` si hay JS.
Todas las capas JS se guardan detrás de ese selector CSS:

```css
html.js [data-reveal] { opacity: 0; transform: translateY(8px); }
html.js [data-modal-contacto] { display: none; }
html.js.typing [data-tipeo] { visibility: hidden; }
```

Sin JS: contenido visible, modal inline en el footer con submit nativo.

### 3.2 Tema (light-first)

Tokens CSS (`--color-base/panel/ink/muted/line/phos/amber`) con `@theme` de
Tailwind v4; `html.dark` reasigna los tokens. El tema se persiste en
`localStorage('theme')` y se aplica antes del primer paint (sin flash).
`@media print` fuerza siempre el tema claro.

### 3.3 Boot del hero (SPEC-hero-typing + SPEC-hero-resto)

- `html.typing` (puesto solo si hay JS y no `prefers-reduced-motion`, con red
  de seguridad de 6 s) activa la secuencia de tipeo: `$ whoami` → nombre →
  título → `$ cat cv.txt` → resumen.
- Durante el boot, el resto de la página está en `display:none`
  (`[data-tipeo-resto]`) — la página solo mide el hero.
- `finalizar()` es el único punto de finalización (natural, por interrupción
  —scroll/clic/tecla— o por error) y revela el resto con fade de 0.5 s.
- Lógica pura en `lib/typing.ts` (`planTipeo` con jitter inyectable → tests
  deterministas).

### 3.4 Modal de contacto (SPEC-contacto)

- Marcado siempre en el DOM (dentro del footer); con `html.js` se oculta y se
  abre como overlay (`[data-modal-contacto].open` → `position:fixed`).
- Apertura desde cualquier `[data-contact-open]` (navbar + footer); cierre por
  `[x]`, ESC, overlay o `[cerrar]`; **focus trap** Tab/Shift+Tab; foco inicial
  al campo nombre (excluye el honeypot) y restaurado al botón de origen al
  cerrar; reset del formulario al cerrar.
- Envío con `fetch` relativo (`api/contacto`) → resuelve a `/cv/api/contacto`
  en producción y `/api/contacto` en dev. Estados: `enviando…` → éxito con
  agradecimiento (`✓` + botón `[cerrar]`, sin cierre automático) o error
  genérico conservando los datos.
- El endpoint **no** forma parte del frontend: contrato en SPEC-contacto §5.6,
  implementación en `server/contacto/server.mjs`.

### 3.5 Reveal on scroll

Un único `IntersectionObserver` global añade `.revealed` a `[data-reveal]`;
al llegar al fondo se revelan todos (fallback para elementos pequeños que
cruzan el viewport rápido). Sin IO → contenido visible directo.

### 3.6 i18n

`translations.ts` con diccionarios `es`/`en`; `t('clave.punto')` resuelve con
fallback a español. Hoy el idioma es fijo ES (botón EN oculto hasta que
exista `translations.en` completo).

## 4. Flujo del contacto (end-to-end)

```
[modal] fetch POST api/contacto ──► Caddy /cv/api/* ──► contacto-api:8081
                                                          │ valida + honeypot
                                                          │ + rate limit + origin
                                                          ▼
                                                     Resend API
                                                          ▼
                                             📧 contacto@joviur.dpdns.org
                                           (reply-to = email del visitante)
```

Detalles de operación: `DEPLOY.md`; decisiones de seguridad: `SECURITY.md`.

## 5. Base `/cv`

El sitio se publica bajo `/cv` (túnel de Cloudflare). El build de producción
usa `ASTRO_BASE=/cv` (variable `process.env.ASTRO_BASE`, `astro.config.mjs`);
en desarrollo local la base es la raíz. Por eso el formulario usa **rutas
relativas** (`api/contacto`) y los assets/meta se construyen con
`import.meta.env.BASE_URL`.

## 6. Verificación

- `pnpm test` (lógica pura, Vitest) · `pnpm lint` (oxlint) · `pnpm build`.
- Verificación en navegador de cada feature (estados, a11y, sin-JS, dark,
  print, móvil) — registrada en `PROGRESS.md` por fase.
- `scripts/serve-cv-test.mjs`: mini-servidor que simula el `handle_path /cv*`
  de Caddy para verificar el sitio bajo `/cv` localmente.
