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

## Historial de fases

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
