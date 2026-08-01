# Web CV — José María Vizcaíno

Web one-page con el CV de José María Vizcaíno (Software Engineer).
Construida con **Astro 5 + TypeScript + Tailwind CSS v4** e interactividad en
**JS vanilla** (~3 KB, cero frameworks).

## ⚡ Rendimiento (build de producción, medido)

| Recurso | Tamaño | gzip |
|---|---|---|
| HTML (con todo el contenido del CV) | 19.9 KB | 4.7 KB |
| CSS | 19.8 KB | 4.8 KB |
| JS (inline, 3 módulos) | 3.2 KB | **0.3 KB** |

El texto del CV está en el HTML desde el primer byte (FCP sin depender de JS) —
antes de la migración desde Vite+React eran ~69 KB gzip de recursos con el
contenido oculto tras la hidratación de React.

## ✨ Características

- One-page con scroll suave y navbar sticky
- **Estética Registry/Manpage** (light-first, JetBrains Mono) — diseñada a propósito para evitar el "look AI" (sin azul por defecto, sin cards genéricas, sin emojis)
- Scroll-spy: la navbar marca la sección activa (`~/experiencia`, `~/habilidades`, …)
- Filtros de habilidades por categoría (`[ todos ] [ desarrollo ] …`)
- Tema dark/light con persistencia en `localStorage` (light por defecto)
- Botón **PDF** → vista de impresión limpia (`@media print`, siempre en tema claro)
- i18n preparado: helper `t()` con fallback a español (traducción EN pendiente; botón oculto hasta entonces)
- Sección de proyectos oculta hasta que haya proyectos que mostrar
- Accesible: `prefers-reduced-motion`, `aria-pressed`/`aria-live`, jerarquía de headings, contraste AA
- Sin-JS friendly: el contenido es visible aunque el JS no cargue (el reveal solo se activa con `html.js`)

## 🚀 Desarrollo

```bash
pnpm install   # dependencias (pnpm, nunca npm)
pnpm dev       # dev server (astro dev)
```

## 🧪 Tests

```bash
pnpm test          # lógica pura (Vitest, entorno node)
pnpm test:watch    # modo watch
```

## 📝 Actualizar el CV

**Un solo archivo:** `src/data/cv.ts` — contiene nombre, resumen, experiencia,
habilidades, educación, idiomas y proyectos. La UI se adapta sola.

- Añadir un proyecto → aparece la sección "Proyectos" automáticamente.
- Traducción EN → rellenar `translations.en` en `src/i18n/translations.ts` y
  volver a mostrar el botón de idioma en `src/components/Navbar.astro`.

## 🏗️ Build de producción

```bash
pnpm build    # → dist/ (HTML estático + CSS + JS inline)
pnpm preview  # servir dist/ localmente
```

## 🖥️ Deploy (VPS)

Ver `deploy.sh` — requiere elegir el método de servir (`nginx` / `caddy` /
contenedor podman / solo acceso Tailscale) y, si se expone al público, abrir
puertos 80/443 en el firewall. La decisión está pendiente (ver `PROGRESS.md`).

## 🗂️ Estructura

```
src/
├── pages/index.astro        # página única: head SEO + layout + script reveal
├── components/              # Navbar, Hero, Experience(+Item), Skills, Education, Projects, Footer (.astro)
├── data/cv.ts               # ⭐ contenido del CV (única fuente de verdad)
├── types/cv.ts              # interfaces del modelo
├── i18n/translations.ts     # diccionarios es/en + helper t()
├── lib/skills.ts            # filtrarSkills() — lógica pura testeable
└── styles/global.css        # Tailwind v4, tokens, dark, print, reveal
```
