# Web CV — José María Vizcaíno

Web interactiva one-page con el CV de José María Vizcaíno (Software Engineer).
Construida con Vite + React + TypeScript + Tailwind CSS v4.

## ✨ Características

- One-page con scroll suave y navbar sticky
- **Estética Registry/Manpage** (dark-first, JetBrains Mono) — diseñada a propósito para evitar el "look AI" (sin azul por defecto, sin cards genéricas, sin emojis)
- Scroll-spy: la navbar marca la sección activa (`~/experiencia`, `~/habilidades`, …)
- Filtros de habilidades por categoría (`[ todos ] [ desarrollo ] …`)
- Tema dark/light con persistencia en `localStorage` (dark por defecto)
- Botón **PDF** → vista de impresión limpia (`@media print`)
- i18n preparado: botón ES/EN con fallback a español (traducción EN pendiente)
- Sección de proyectos oculta hasta que haya proyectos que mostrar
- Accesible: `prefers-reduced-motion`, `aria-pressed`/`aria-live`, jerarquía de headings

## 🚀 Desarrollo

```bash
pnpm install   # dependencias (pnpm, nunca npm)
pnpm dev       # dev server en http://localhost:5173
```

## 🧪 Tests

```bash
pnpm test          # suite completa (Vitest + Testing Library)
pnpm test:watch    # modo watch
```

## 📝 Actualizar el CV

**Un solo archivo:** `src/data/cv.ts` — contiene nombre, resumen, experiencia,
habilidades, educación, idiomas y proyectos. La UI se adapta sola.

- Añadir un proyecto → aparece la sección "Proyectos" automáticamente.
- Traducción EN → rellenar `translations.en` en `src/i18n/translations.ts`.

## 🏗️ Build de producción

```bash
pnpm build    # → dist/
pnpm preview  # servir dist/ localmente
```

## 🖥️ Deploy (VPS)

Ver `deploy.sh` — requiere elegir el método de servir (`nginx` / `caddy` /
contenedor podman / solo acceso Tailscale) y, si se expone al público, abrir
puertos 80/443 en el firewall. La decisión está pendiente (ver `PROGRESS.md`).

## 🗂️ Estructura

```
src/
├── data/cv.ts              # ⭐ contenido del CV (única fuente de verdad)
├── types/cv.ts             # interfaces del modelo
├── i18n/translations.ts    # diccionarios es/en
├── context/LanguageContext.tsx
├── hooks/                  # useDarkMode, useInView
└── components/             # Navbar, Hero, About, Experience, Skills, Education, Projects, Footer, PrintButton
```
