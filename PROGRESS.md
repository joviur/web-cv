# PROGRESS — Web CV Interactiva

Proyecto: CV de José María Vizcaíno → web one-page React (Vite + TS + Tailwind).
Plan: ver `PLAN.md`. Convención: un commit de git por fase completada + actualizar este archivo.

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Scaffold Vite + React + TS + Tailwind + git init | ✅ Completada |
| 1 | Modelo de datos (`data/cv.ts`), i18n base, hooks | ✅ Completada |
| 2 | Layout: navbar, hero, footer, dark/light | ⬜ Pendiente |
| 3 | Secciones: sobre mí, experiencia (timeline), skills, educación, proyectos | ⬜ Pendiente |
| 4 | Interactividad: reveal on scroll, filtros skills, vista print/PDF | ⬜ Pendiente |
| 5 | Tests (Vitest + RTL), accesibilidad, responsive | ⬜ Pendiente |
| 6 | Build producción + deploy VPS (método pendiente) + README | ⬜ Pendiente |

## Historial de fases

<!-- Actualizar al completar cada fase:
### Fase N — <nombre> (fecha)
- ✅ Hecho: ...
- Commit: `...`
-->

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
