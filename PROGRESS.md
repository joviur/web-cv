# PROGRESS — Web CV Interactiva

Proyecto: CV de José María Vizcaíno → web one-page React (Vite + TS + Tailwind).
Plan: ver `PLAN.md`. Convención: un commit de git por fase completada + actualizar este archivo.

## Estado

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Scaffold Vite + React + TS + Tailwind + git init | ⬜ Pendiente |
| 1 | Modelo de datos (`data/cv.ts`), i18n base, hooks | ⬜ Pendiente |
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

## Pendientes (TODOs)

- [ ] Confirmar/actualizar los logros del puesto actual NTT DATA (Software Engineer) en `src/data/cv.ts`
- [ ] Decidir método de deploy en VPS (nginx / caddy / podman / solo Tailscale) — ver PLAN.md Fase 6
- [ ] Rellenar `translations.en` cuando se implemente el inglés
- [ ] Añadir proyectos reales a `cv.proyectos` cuando existan (la sección aparece sola)
