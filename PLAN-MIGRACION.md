# Plan de Migración — Vite+React → Astro 5 + JS vanilla

> **Para Hermes:** ejecutar fase a fase. Un commit de git al final de cada fase. Mantener `PROGRESS.md` actualizado en cada commit. No borrar `.hermes/`.

**Goal:** Migrar la web CV de SPA React (Vite) a Astro 5 estático con interactividad en JS vanilla (~60 líneas). Mismo aspecto, mismo comportamiento, mismas secciones y datos (`src/data/cv.ts` como única fuente de verdad). El objetivo es rendimiento de carga: el HTML sale con todo el contenido (FCP con el primer byte) y el JS total baja de ~64 KB gzip a ~3-5 KB gzip.

## Decisiones (asumidas — vetar cualquier fila antes/durante la ejecución)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Framework | **Astro 5** (estático, cero JS por defecto) |
| 2 | Interactividad | **JS vanilla** en `<script>` de Astro: toggle tema, scroll-spy, filtros skills, reveal on scroll. **React se elimina del proyecto** |
| 3 | Aspecto | Idéntico: tema Registry/Manpage, light-first con `html.dark`, misma tipografía, mismos colores |
| 4 | Animaciones reveal | Se mantienen (fade+slide) pero con **1 solo IntersectionObserver global** (antes 17 por fila), y con mejora: si JS falla/no carga, el contenido es visible (clase `js` en `<html>` activa el estado inicial oculto) |
| 5 | Datos e i18n | `src/data/cv.ts` y `src/i18n/translations.ts` se mantienen **sin cambios** (módulos puros). Botón EN sigue oculto; idioma fijo ES en build-time |
| 6 | Tests | Se eliminan los tests de componentes React (App/Skills/Experience/Projects/useDarkMode). Se mantiene `translations.test.ts` y se añade la lógica de filtrado de skills como **función pura** (`src/lib/skills.ts`) con su test. Vitest en entorno node (sin jsdom) |
| 7 | SEO | Se conservan todas las metas (OG, theme-color, description, favicon, og-image.png) |
| 8 | Print | El CSS `@media print` (tokens claros, no-print, reveal visible) se conserva tal cual |
| 9 | Deploy | `pnpm build` sigue generando `dist/` estático; `deploy.sh` no cambia |
| 10 | Tooling | Se eliminan: react, react-dom, @vitejs/plugin-react, @testing-library/*, jsdom, vite.config.ts, tsconfig.app/node. Se añade: astro. Se mantiene: tailwindcss v4 + @tailwindcss/vite, vitest, oxlint, pnpm |

## Estructura de ficheros objetivo

```
Web CV/
├── PLAN-MIGRACION.md          # este plan
├── PLAN.md / PROGRESS.md      # se actualizan
├── astro.config.mjs           # tailwind v4 via @tailwindcss/vite
├── tsconfig.json              # extends astro/tsconfigs/base
├── vitest.config.ts           # environment node
├── package.json               # scripts: dev/build/preview/test/lint
├── public/                    # favicon.svg + og-image.png (sin cambios)
└── src/
    ├── styles/global.css      # import tailwindcss + tokens + print + reveal
    ├── data/cv.ts             # ⭐ sin cambios
    ├── i18n/translations.ts   # sin cambios + helper t(key) = resolve('es', key)
    ├── lib/skills.ts          # filtrarSkills() — función pura testeable
    ├── pages/index.astro      # head completo + layout + scripts globales
    └── components/            # Hero, Navbar, Experience, Skills, Education,
                               # Projects, Footer (todos .astro)
```

## Fases

- **Fase 0 — Scaffold Astro**: `pnpm add astro`, `pnpm remove` deps React, astro.config.mjs, tsconfig, vitest.config, scripts de package.json
- **Fase 1 — HTML estático**: `pages/index.astro` + componentes `.astro` (head SEO, header, hero, experiencia, skills, educación, proyectos, footer) con `cv.ts` + `t()`
- **Fase 2 — Interactividad vanilla**: script global (tema, scroll-spy con atBottom, reveal con 1 observer) + script de filtros en Skills.astro + botón PDF
- **Fase 3 — CSS**: mover `index.css` → `styles/global.css` (tokens, dark, print, reveal con guard `html.js`, reduced-motion, cursor)
- **Fase 4 — Tests**: `lib/skills.ts` + test; eliminar tests React, hooks, context, main.tsx, App.tsx
- **Fase 5 — Verificación**: navegador (desktop, móvil 320-375, print simulado, scroll-spy, filtros, tema), `pnpm test`, `pnpm lint`, `pnpm build` + medida de tamaños dist/
- **Fase 6 — Docs**: README (arquitectura nueva), PLAN.md (sección migración), PROGRESS.md

## Criterios de éxito (medibles)

1. JS servido en producción: **< 10 KB gzip** (hoy 64.3 KB) — objetivo ~3-5 KB
2. El texto del CV presente en el HTML inicial (sin JS)
3. Tests verdes, lint 0 errores, build OK
4. Aspecto y comportamiento idénticos (verificado en navegador: tema, filtros, scroll-spy, print, móvil)
