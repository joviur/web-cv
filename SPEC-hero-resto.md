# SPEC — El resto de la página aparece al terminar la animación del hero

> **Feature:** durante la animación de tipeo del hero (~3 s), el contenido por debajo (experiencia, skills, educación, proyectos, footer) no se ve. Solo cuando los comandos se han ejecutado y sus salidas escritas, el resto de la página se muestra.
>
> **Estado:** v1.0 — **APROBADA** (decisiones cerradas, tabla §9).
> **Fecha:** 2026-08-01 · **Proyecto:** Web CV (Astro 5 + JS vanilla) · **Depende de:** SPEC-hero-typing.md (v1.0, implementada) · **Ficheros afectados:** `src/pages/index.astro`, `src/components/Footer.astro`, `src/components/Hero.astro` (script), `src/styles/global.css`.

---

## 1. Problema / motivación

La animación de tipeo del hero (SPEC-hero-typing) se ejecuta mientras el resto de la página ya es visible debajo. Rompe la ilusión de "terminal que ejecuta comandos": en un terminal real, la pantalla solo muestra lo que el proceso va imprimiendo. Con esta feature, la página arranca como una pantalla de boot: solo el hero visible, y el contenido aparece cuando la secuencia termina.

## 2. Contexto técnico (restricciones del proyecto)

- Ya existe el guard `html.typing` (marcado en el script inline del head solo si hay JS y no `prefers-reduced-motion`, con red de seguridad de 6 s que lo retira) y el patrón `html.js.typing [data-tipeo] { visibility: hidden }` + `.visible`.
- El módulo de tipeo de `Hero.astro` ya tiene un único punto de finalización (`finalizar()`: natural, por interrupción o por error) → es el sitio exacto donde revelar el resto.
- Mejora progresiva obligatoria: sin JS, `prefers-reduced-motion` o error → **todo visible siempre** (nada puede quedar oculto sin animación).
- Presupuesto JS < 10 KB gzip (hoy HTML total 5.8 KB gzip con todo el JS inline). Esta feature no añade JS: solo CSS + un loop corto en `finalizar()`.

## 3. Requisitos funcionales

### RF-1 — El resto de la página oculto durante la animación
Mientras `html.typing` esté activo (animación en curso), las secciones tras el hero (experiencia, skills, educación, proyectos) y el footer no son visibles. **D1-A: `display: none`** — durante la animación la página solo mide el hero; al revelar, la página crece.

- **CA-1.1:** Al cargar, solo se ven navbar + hero. Nada del contenido posterior es visible ni scrolleable durante la secuencia.
- **CA-1.2:** El hero se mantiene arriba como hoy (**D2-A**); solo se oculta lo de debajo.
- **CA-1.3:** Al terminar la secuencia (natural o por interrupción), el resto aparece con **fade suave de 0.5 s (D3-B)**.
- **CA-1.4:** El estado final es idéntico al actual: misma página, mismo scroll, mismo comportamiento de reveal/scroll-spy.

### RF-2 — Coherencia con la interrupción
La interrupción ya aprobada (D5 de SPEC-hero-typing: scroll/clic/tecla completan la animación al instante) revela también el resto de la página en el mismo instante.

- **CA-2.1:** Interrumpir la animación ⇒ hero completo + resto visible inmediatamente (con su fade), sin esperar a la secuencia.

### RF-3 — Guards intactos
- **CA-3.1:** Sin JS → página completa visible (el HTML estático no cambia).
- **CA-3.2:** `prefers-reduced-motion` → página completa visible (sin animación ni ocultación; el fade se anula con la regla global de 0.01 ms).
- **CA-3.3:** Red de seguridad 6 s: si el módulo de tipeo no carga, el guard se retira y todo es visible (incluido el resto).
- **CA-3.4:** Print/PDF durante la animación → documento completo con todo el contenido (hero y resto).

## 4. Requisitos no funcionales

- **RNF-1 (JS budget):** Cero JS nuevo medible — solo el loop de revelado dentro de `finalizar()` (que ya existe) y CSS.
- **RNF-2 (A11y):** El contenido oculto durante la animación no es anunciado por lectores de pantalla (`display: none` lo garantiza); al revelarse, disponible de forma normal.
- **RNF-3 (Layout):** Sin zona muerta scrolleable durante la animación (D1-A); el crecimiento de la página al revelar es deliberado y suavizado por el fade (D3-B).

## 5. Diseño propuesto

### 5.1 Marcado — `src/pages/index.astro` y `src/components/Footer.astro`
- En `index.astro`, envolver las secciones posteriores al hero en un contenedor explícito (el hero queda fuera):
  ```astro
  <main class="mx-auto max-w-[780px] px-6">
    <Hero />
    <div data-tipeo-resto>
      <Experience />
      <Skills />
      <Education />
      <Projects />
    </div>
  </main>
  <Footer />
  ```
- En `Footer.astro`, añadir `data-tipeo-resto` al elemento `<footer>` raíz (los componentes Astro no propagan atributos HTML, hay que ponerlo dentro).

### 5.2 CSS — `src/styles/global.css`
```css
/* Resto de la página oculto durante el boot del hero (SPEC-hero-resto) */
html.js.typing [data-tipeo-resto]:not(.visible) {
  display: none;
}
[data-tipeo-resto].visible {
  display: block;
  animation: fade-in 0.5s ease;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
- La regla de ocultación exige `html.js.typing` **y** que el contenedor no tenga `.visible`: el fallback (catch, safety 6 s) retira `html.typing` y todo vuelve a ser visible sin depender de `.visible`.
- En `@media print`, junto a la regla existente de `[data-tipeo]`: `html.js.typing [data-tipeo-resto] { display: block !important; }`.

### 5.3 Script — `src/components/Hero.astro`
En `finalizar()` (único punto: natural, interrupción y error), antes de retirar `html.typing`:
```ts
for (const el of document.querySelectorAll<HTMLElement>('[data-tipeo-resto]')) {
  el.classList.add('visible')
}
```

### 5.4 Alternativas descartadas

| Alternativa | Motivo de descarte |
|---|---|
| Ocultar todo el `<main>` y dejar el hero fuera del flujo | Más invasivo: rompe `scroll-margin`, el scroll-spy y la estructura de secciones |
| Retrasar la carga/el render del resto con JS | Contradice el FCP estático del proyecto (el HTML ya trae todo) |
| `visibility: hidden` (altura reservada) | Zona vacía scrolleable durante la animación — descartado en D1 |
| Tercer estado de animación (dos fases de CSS) | `html.typing` ya expresa "animación en curso"; no hace falta más estado |

## 6. Casos borde

| # | Caso | Comportamiento esperado |
|---|---|---|
| E1 | Sin JS | Página completa visible (nada cambia) |
| E2 | `prefers-reduced-motion` | Página completa visible (typing no se marca) |
| E3 | Print durante la animación | Documento completo (resto forzado visible en print) |
| E4 | Interrupción por clic/tecla/scroll | Hero + resto completos al instante (con fade) |
| E5 | Módulo de tipeo no carga (safety 6 s) | `html.typing` retirado → página completa visible |
| E6 | Error del módulo a mitad | `try/catch` retira `html.typing` → página completa visible |
| E7 | Dark mode / móvil | Sin cambios: la ocultación es independiente del tema y del viewport |

## 7. Fuera de alcance

- NO tocar la animación del hero (SPEC-hero-typing) ni su timing.
- NO añadir pantallas de carga artificiales ni retrasos extra (el resto aparece en cuanto termina la secuencia, sin espera adicional).
- NO cambios en secciones, navbar, reveal, scroll-spy, i18n ni `cv.ts`.

## 8. Plan de verificación

1. `pnpm run test` (13/13) + `pnpm run lint` (0 errores) + `pnpm run build` OK.
2. Navegador (dev/preview):
   - Al cargar: solo navbar + hero visibles; `scrollHeight` ≈ altura del hero (sin zona muerta).
   - Al terminar la secuencia: el resto aparece con fade, estado final idéntico al actual, scroll-spy/reveal funcionando.
   - Interrupción a mitad (pointerdown): hero + resto visibles al instante.
   - Sin-JS / reduced-motion: página completa sin cambios (inspección del guard).
   - Print simulado a mitad de animación: documento completo.
   - Console limpia.
3. JS total sin crecimiento relevante.

## 9. Tabla de decisiones (cerradas)

| # | Decisión | Resolución |
|---|---|---|
| D1 | Estrategia de ocultación | **A** — `display: none` (la página solo mide el hero durante la animación; crece al revelar) |
| D2 | Hero durante la animación | **A** — se mantiene arriba como hoy; solo se oculta lo de debajo |
| D3 | Aparición del resto | **B** — fade suave de 0.5 s |
| D4 | Footer | **A** — también oculto durante la animación |
