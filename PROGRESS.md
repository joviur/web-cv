# PROGRESS — Web CV Interactiva

Proyecto: CV de José María Vizcaíno → web one-page React (Vite + TS + Tailwind).
Plan: ver `PLAN.md`. Convención: un commit de git por fase completada + actualizar este archivo.

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Scaffold Vite + React + TS + Tailwind + git init | ✅ Completada |
| 1 | Modelo de datos (`data/cv.ts`), i18n base, hooks | ✅ Completada |
| 2 | Layout: navbar, hero, footer, dark/light | ✅ Completada |
| 3 | Secciones: sobre mí, experiencia (timeline), skills, educación, proyectos | ✅ Completada |
| 4 | Interactividad: reveal on scroll, filtros skills, vista print/PDF | ✅ Completada |
| 5 | Tests (Vitest + RTL), accesibilidad, responsive | ✅ Completada |
| 6 | Build producción + deploy VPS (método pendiente) + README | ✅ Completada (deploy VPS ⬜ pendiente decisión) |
| 7 | Rediseño anti-AI-slop: tema Registry/Manpage (B), scroll-spy, contenido real | ✅ Completada |
| 8 | Review: fixes print, responsive móvil, scroll-spy, i18n filtros, a11y, OG | ✅ Completada |
| 9 | Light-first + legibilidad (14px, 40em, contraste AA, orden móvil experiencia) | ✅ Completada |
| 10 | Migración Vite+React → **Astro 5 + JS vanilla** (ver `PLAN-MIGRACION.md`) | ✅ Completada |

## Historial de fases

### Fase 10 — Migración a Astro 5 + JS vanilla (2026-08-01)
Plan completo en `PLAN-MIGRACION.md`. Resultado medido en producción:
- HTML estático 19.9 KB (4.7 KB gzip) con **todo el contenido del CV** — FCP sin depender de JS (antes: HTML vacío + 64.3 KB gzip de React)
- JS total: **3.2 KB (283 B gzip)** inline, 3 módulos: tema+scroll-spy+print, filtros, reveal
- CSS: 19.8 KB (4.8 KB gzip) — mismos tokens
- React eliminado (deps, componentes, hooks, context, tests de render). Sustituido por: `pages/index.astro` + 8 componentes `.astro` + `lib/skills.ts` (función pura testeable)
- Interactividad vanilla: toggle tema, scroll-spy con atBottom, filtros con aria-pressed/live, reveal con **1 solo IntersectionObserver** + fallback al fondo + guard `html.js` (sin-JS = contenido visible)
- Verificado en navegador contra `astro preview`: render idéntico, console limpia, tema/filtros/scroll-spy/reveal funcionando, móvil 320/375 sin overflow, print en dark con tokens claros
- Tests 7/7 (lógica pura, entorno node), lint 0 errores, build 872ms
- `deploy.sh` sin cambios (sigue generando `dist/`)

### Fase 9 — Light-first + legibilidad (2026-08-01)
- **Light-first**: tokens base = tema claro; `html.dark` reasigna a dark (inversión completa: hook, Navbar, App, anti-FOUC, theme-color, tests). Verificado: default light, toggle→dark persistido, print sigue forzando claro en dark mode
- **Contraste AA**: `muted` #75817a dark (4.84:1) / #646b66 light (4.93:1); `amber` light #9a4f00 (5.42:1); footer `[ fin del fichero ]` pasa de `text-line` (1.23:1) a `text-muted`
- **Legibilidad**: cuerpo de contenido 13px→14px (`text-sm`); resumen hero `max-w-[46em]`→`40em` → ~67 chars/línea en desktop (antes ~93)
- **Orden móvil experiencia**: puesto primero (`order-1`), fecha/empresa debajo (`order-2`); desktop intacto (fecha izquierda)
- Verificado en navegador (iframe 375px + print simulado + ratios): tests 11/11, lint 0 errores, build OK

### Fase 8 — Review round (2026-08-01)
Review profunda en navegador (viewports 320/360/375, print simulado, ratios de contraste). Fixes aplicados:
- **Print**: tokens remapeados al tema claro en `@media print` (los títulos amber/phos salían casi invisibles sobre papel blanco en dark mode)
- **Responsive**: `clamp(24px,6.5vw,46px)` en el h1 (el nombre se partía en 2 líneas + cursor huérfano en todo móvil); `truncate` + `shrink-0` en la fila superior de la navbar (desbordaba ≤340px)
- **Scroll-spy**: banda central más ancha (-35%/-50%) + marcado explícito de `contacto` al llegar al fondo (el footer nunca alcanzaba la banda)
- **i18n**: filtros de skills con `t(c.label)` (antes keys crudas: `[ soft ]`); `aria-live` con plural correcto; botón EN oculto hasta que exista `translations.en`; `lang` del `<html>` dinámico
- **A11y**: títulos de sección `## 0N` ahora `<h2>` (jerarquía h1→h2→h3); teléfono con `tel:`; script anti-FOUC del tema; `theme-color` + metatags Open Graph + `og-image.png` generado
- Verificado: tests 11/11, lint 0 errores, build OK

### Fase 2 — Layout (2026-08-01)
- ✅ Navbar sticky (scroll suave, toggles dark/EN, botón PDF), Hero, Footer con contacto e idiomas
- ✅ Dark/light con persistencia localStorage — verificado en navegador (`<html class="dark">`)
- Commits: `075a773 feat: layout + dark mode + hero`

### Fase 3 — Secciones (2026-08-01)
- ✅ Sobre mí, timeline de experiencia (NTT DATA con badge Actualidad), skills con filtros, educación, proyectos (oculta, array vacío)
- ✅ Verificado en navegador: render completo, filtro skills (Sistemas → 6 badges), 0 errores JS
- Commit: `332c42d feat: content sections (about, timeline, skills, education, projects)`

### Fase 4 — Interactividad (2026-08-01)
- ✅ Reveal on scroll (ExperienceItem, Education, SkillBadge) con IntersectionObserver + `data-inview` para print
- ✅ Filtros de skills con `aria-pressed` y `aria-live`; vista print lista (CSS de Fase 0, `no-print` en navbar/filtros)
- Commit: `c7bb1bc feat: interactions (reveal, skill filters, print view)`

### Fase 0 — Scaffold (2026-08-01)
- ✅ Vite 8.2 + React + TS scaffold en raíz (creado en temp y movido — el dir no estaba vacío)
- ✅ Tailwind CSS v4.3.3 (plugin `@tailwindcss/vite`), dark variant + print CSS base en `src/index.css`
- ✅ Dev server verificado: HTTP 200 en localhost:5173
- ✅ Gestor de paquetes: **pnpm** (nunca npm) — preferencia del usuario
- ✅ Git init (`main`), `.hermes/` añadido a `.gitignore`, assets demo del scaffold eliminados
- Commit: `fae4d7c chore: scaffold vite react-ts + tailwind v4`

## Pendientes (TODOs)

- [ ] Confirmar/actualizar los logros del puesto actual NTT DATA (Software Engineer) en `src/data/cv.ts`
- [ ] Decidir método de deploy en VPS (nginx / caddy / podman / solo Tailscale) — ver PLAN.md Fase 6
- [ ] Rellenar `translations.en` cuando se implemente el inglés
- [ ] Añadir proyectos reales a `cv.proyectos` cuando existan (la sección aparece sola)
