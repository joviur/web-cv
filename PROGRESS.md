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
| 11 | Animación de tipeo tipo terminal en el hero (ver `SPEC-hero-typing.md` + `PLAN-hero-typing.md`) | ✅ Completada |
| 12 | Resto de la página oculto durante el boot (ver `SPEC-hero-resto.md`) — codificación con opencode | ✅ Completada |
| 13 | Contacto: modal TUI + endpoint propio (ver `SPEC-contacto.md`) — email/teléfono fuera de la web | ✅ Completada (frontend) · ⬜ backend VPS pendiente |

## Historial de fases

### Fase 13 — Contacto por modal TUI + endpoint propio (2026-08-01)
Spec Driven Design: `SPEC-contacto.md` v1.0 (decisiones D1-A/D2-A email y teléfono nunca visibles, D3-A idiomas fuera, D4 CTA navbar+footer, D5 modal ventana TUI, D7 campos nombre/empresa/mail/asunto opcional/mensaje, D8 asunto default server-side, D9 agradecimiento post-envío, D11 honeypot+rate limit, D12 endpoint VPS+Resend, D13 progressive enhancement, D14 print limpio). Codificación delegada a **opencode** (`opencode run --agent build`).
- **Comportamiento**: el footer ya no muestra email, teléfono ni idiomas (eliminados también de `cv.ts`/`CvData` — el email real solo vive en la config del VPS). Dos botones `[contactar]` (navbar + footer) abren un modal ventana TUI (semáforos, prompt `./contactar`, campos con `label >`). Envío `fetch POST /api/contacto` con estados: `enviando…` → `✓ mensaje enviado` + agradecimiento ("…te responderé muy pronto") + `[cerrar]`, o `✗` genérico conservando los datos. Focus trap, ESC/`[x]`/overlay cierran, foco restaurado al botón de origen. Sin JS: el formulario se ve inline en el footer con submit nativo (`action=/api/contacto method=post`). Print sin modal ni CTAs.
- **Cambios (7 archivos + opencode.json)**: `ContactModal.astro` (nuevo, modal + lógica vanilla tipada), `Footer.astro` (botón + ubicación + `<ContactModal />`), `Navbar.astro` (botón con icono sobre), `cv.ts`/`types/cv.ts` (email/teléfono/idiomas eliminados), `translations.ts` (bloque `contacto` con 17 claves), `global.css` (+216 líneas: modal, progressive enhancement `html.js`, animación `modal-in` 0.15s, print). `opencode.json` (permisos bash para opencode run, clave `permission` — necesario: sin él opencode auto-rechaza bash y aborta)
- **Fixes de Hermes post-opencode (2)**: foco inicial del modal apuntaba al honeypot (`form.querySelector` devolvía el primer input = website) → selector `input:not([name="website"])`; `novalidate` sin validación manual (desviación del SPEC) → eliminado, validación HTML nativa (`required`/`type=email`/`minlength`)
- **Verificado en navegador** (preview + console): foco inicial en `contacto-nombre`; focus trap `[enviar]→Tab→[x]`; ESC cierra y restaura foco al botón; overlay cierra; envío éxito (body `{website:"",nombre,empresa,mail,asunto:"",mensaje}` + agradecimiento + form oculto); error 500 → `✗` genérico + datos conservados + botón re-habilitado; sin-JS (sin `html.js`) → bloque estático en footer con `action/method`; dark mode con tokens (`#0e110f` panel, phos `#5ce08a`); validación nativa bloquea submit vacío sin llamar a fetch; console 0 errores
- **Métricas**: JS total 2.3 KB gzip (modal 1124 B gzip — presupuesto <10 KB cumplido); tests 13/13, lint 0 errores, build OK; grep `josema.vizcainourban|662 690` en src+dist → 0 resultados; sin `mailto:`/`tel:` en componentes
- **Pendiente**: backend del endpoint (SPEC §5.6: contenedor Podman + Resend) — requiere decisión de deploy.sh (A/B/C/D) y permiso del usuario para el VPS
- Commits: `455ff3c` (docs SPEC)

### Fase 12 — Resto de la página oculto durante el boot del hero (2026-08-01)
Spec Driven Design: `SPEC-hero-resto.md` v1.0 (decisiones D1-A `display:none`, D2-A hero arriba, D3-B fade 0.5 s, D4-A footer oculto). Codificación delegada a **opencode** (`opencode run --agent build`, OpenCode Go).
- **Comportamiento**: mientras `html.typing` está activo, las secciones post-hero y el footer están en `display: none` → la página solo mide el hero (sin zona muerta scrolleable). Al terminar la secuencia (natural o interrupción), `finalizar()` añade `.visible` → fade-in de 0.5 s. Guards intactos: sin-JS, reduced-motion, safety 6 s y print muestran todo siempre
- **Cambios (4 archivos, aplicados por opencode)**: `index.astro` (div `data-tipeo-resto` envolviendo Experience/Skills/Education/Projects), `Footer.astro` (`data-tipeo-resto` en el raíz), `global.css` (`html.js.typing [data-tipeo-resto]:not(.visible){display:none}` + `.visible` con `@keyframes fade-in` + print override), `Hero.astro` (loop de `.visible` en `finalizar()`)
- **Nota de flujo**: opencode en modo no interactivo auto-rechaza los permisos de bash → no pudo ejecutar la verificación; el diff sí lo aplicó correctamente. Verificación hecha por Hermes: tests 13/13, lint 0 errores, build OK, 3 reglas CSS presentes en dist/
- **Verificado en navegador** (iframe + poll): a mitad de animación `restoDisplay: none`, `footerDisplay: none`, `scrollHeight: 598` (solo hero); tras pointerdown: `.visible` + `animation: fade-in`, `typing` retirado, `scrollHeight: 2585`, reveal disparado (h2 opacity 1), footer block; console limpia
- Commits: `0b526e4` (docs SPEC) + verificación

### Fase 11 — Animación de tipeo tipo terminal en el hero (2026-08-01)
Spec Driven Design: `SPEC-hero-typing.md` v1.0 (decisiones cerradas D1-B/D2-A/D3-B/D4-B+C/D5-Sí/D6-A/D7-A) + `PLAN-hero-typing.md`. Commits: 5f0e199 (docs), 81058ec (lib), b26af6e (hero), + verificación.
- **Comportamiento**: al cargar, el hero se "ejecuta" — `$ whoami` se teclea → nombre → `titulo @ empresa` (2ª salida del whoami) → `$ cat cv.txt` → resumen. Glow de 250 ms por letra (estela phos) + línea de comando activa en `ink`. Solo la línea en curso es visible (como un terminal); pausa 300 ms entre pasos; total real ≈ 3.0 s (el resumen real tiene 150 caracteres, no los 233 del plan antiguo)
- **Mejora progresiva**: HTML estático intacto (SEO/sin-JS); `html.typing` solo con JS y sin `prefers-reduced-motion` (guard en el script inline del head, mismo patrón que el reveal); red de seguridad 6 s si el módulo no carga (RNF-7); `beforeprint` completa + print fuerza `visibility: visible`
- **Lógica pura**: `src/lib/typing.ts` — `planTipeo(texto, perfil, aleatorio?)` con jitter inyectable para tests deterministas; 6 tests nuevos
- **Verificado en navegador** (iframe con poll, sin latencia): a mitad de secuencia solo 2/5 bloques visibles y nombre parcial ("Jos"), 1 único cursor temporal; scroll → completado instantáneo (5/5 bloques completos, 0 cursores temporales, cursor persistente visible); estado final idéntico al estático; `cmd-activo` = token ink en dark y light; console limpia
- **Métricas**: JS inline en el HTML (0 requests extra), HTML total 5.8 KB gzip (presupuesto < 10 KB cumplido); tests 13/13, lint 0 errores, build OK

### Fix — Filtros skills: texto invisible en hover (2026-08-01)
Bug: al activar un filtro de habilidades y pasar el puntero por encima, las letras del botón desaparecían.
- **Causa**: el handler de click añadía `bg-phos`/`text-base` al botón activo pero nunca quitaba `hover:text-phos`/`hover:border-phos` de la clase original → en hover el texto se volvía `--color-phos` (#1f7a3d) sobre fondo phos → invisible
- **Fix**: el botón activo ahora elimina las clases hover (solo los inactivos conservan `hover:border-phos hover:text-phos`), en `src/components/Skills.astro`
- Verificado en navegador contra `astro preview`: botón activo crema `#f4f3ef` sobre phos (visible), sin clases hover; inactivos recuperan el efecto hover; filtrado y `aria-pressed` intactos; ciclo completo Todos→Desarrollo→Todos OK
- Tests 7/7, lint 0 errores, build OK

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
