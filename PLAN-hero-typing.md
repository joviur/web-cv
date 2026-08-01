# Plan — Animación de tipeo en el hero (SPEC-hero-typing.md)

> **Para Hermes:** ejecutar fase a fase. Un commit de git al final de cada fase. Mantener `PROGRESS.md` actualizado en cada commit. SPEC de referencia: `SPEC-hero-typing.md` (v1.0 — APROBADA, decisiones cerradas en su §9).

**Goal:** Al cargar la página, el hero "se ejecuta" como un terminal: `whoami` se teclea → el nombre se escribe → el título se escribe (salida del `whoami`) → `cat cv.txt` se teclea → el resumen se escribe. Mejora progresiva sobre el HTML estático (sin-JS/reduced-motion = contenido visible), vanilla JS, sin dependencias nuevas, presupuesto JS < 10 KB gzip.

**Decisiones:** D1-B · D2-A · D3-B (total ≈ 4.4 s) · D4-B+C (glow + comando activo) · D5-Sí (interrupción) · D6-A (cursor persistente) · D7-A (replay cada carga).

## Fase 0 — Docs (SPEC v1.0 + este plan)

- [x] `SPEC-hero-typing.md` v1.0 (decisiones cerradas) + `PLAN-hero-typing.md`
- **Commit A:** `docs: spec hero typing v1.0 + plan de fases (decisiones cerradas)`

## Fase 1 — Lógica pura `src/lib/typing.ts` + tests

- `planTipeo(texto, perfil, aleatorio?)` → delays (ms) por carácter, con jitter inyectable para tests deterministas (SPEEC §5.1).
- `src/lib/typing.test.ts` — casos: un delay por carácter (incl. vacío); enteros ≥ 0; jitter 0 ⇒ 1000/cps; límites ±jitter con aleatorio fijo; más cps ⇒ menos duración total.
- **Verificar:** `pnpm run test` (7/7 + nuevos) y `pnpm run lint` (0 errores).
- **Commit B:** `feat: planTipeo — planificador de tipeo puro (lib) + tests`

## Fase 2 — Marcado + CSS + script del hero

- `Hero.astro`: bloques `data-tipeo` (`cmd`/`out`), span `[data-tipeo-texto]` con `aria-hidden`, `aria-label` con el texto completo, prompt estático coloreado fuera del span tecleable, `data-cursor-nombre` en el cursor persistente, script módulo con la secuencia (SPEC §5.2–5.3).
- `src/pages/index.astro`: el script inline del head marca `html.typing` (solo si `!prefers-reduced-motion`) + red de seguridad 6 s (RNF-7).
- `src/styles/global.css`: reglas `html.js.typing` (visibility), `.glow-char`, `.cmd-activo`, `.cursor-tipeo`, `.cursor-oculto`, regla print (SPEC §5.4).
- **Verificar:** `pnpm run lint` y `pnpm run build` OK.
- **Commit C:** `feat: animación de tipeo tipo terminal en el hero`

## Fase 3 — Verificación en navegador + docs

- Dev server + navegador: `html.typing` al cargar, secuencia 1→5, estado final idéntico al estático, console limpia, interrupción por scroll, sin-JS, print, reduced-motion (SPEC §8).
- Actualizar `PROGRESS.md` (Fase 11).
- **Commit D:** `docs: verificación navegador + PROGRESS fase 11`
