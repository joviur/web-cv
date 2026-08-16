# SPEC — Fix apertura del modal con prefers-reduced-motion

> **Feature:** el botón `[contactar]` (navbar y footer) no abre el modal cuando el sistema tiene `prefers-reduced-motion: reduce` (Windows "Efectos de animación" OFF, macOS/iOS "Reducir movimiento", Android "Quitar animaciones"). Fix mínimo de una condición; no cambia el diseño ni el contrato API.
>
> **Estado:** v1.0 — **PENDIENTE DE APROBACIÓN**.
> **Fecha:** 2026-08-16 · **Proyecto:** Web CV (Astro 7 + Vite 8) · **Depende de:** SPEC-contacto.md (v1.0), SPEC-hero-typing.md · **Ficheros afectados:** `src/components/ContactModal.astro` (único).

---

## 1. Problema / motivación

En sistemas con `prefers-reduced-motion: reduce` la animación de tipeo del hero no corre (intencional, accesibilidad: el script del head no añade `html.typing`). Pero el modal de contacto **depende de esa animación para abrirse**: `abrir()` espera con un `MutationObserver` a que el footer (`[data-tipeo-resto]`) reciba la clase `visible` — clase que **solo añade el módulo de tipeo cuando la animación corre**. Sin animación, la clase nunca llega y el modal queda esperando para siempre: "el botón no hace nada de nada".

Reproducido en laboratorio (Playwright, mismo dist de producción):

| Escenario | Animación | Botón Contactar |
|---|---|---|
| Chrome moderno | ✓ tipeo | ✓ abre modal |
| `prefers-reduced-motion: reduce` | ✗ visible directo (por diseño) | ✗ **modal muerto — bug** |
| JS deshabilitado | ✗ (por diseño) | formulario inline en footer (por diseño) |

El bug afecta a todos los usuarios con reduced-motion (opción usada por personas con sensibilidad al movimiento): el modal queda inutilizable justo donde la animación decorativa desaparece.

## 2. Contexto técnico (restricciones del proyecto)

- `html.js.typing [data-tipeo-resto]:not(.visible) { display: none }` — el footer solo se oculta durante el boot del hero **y solo cuando la animación corre** (CSS global).
- Sin `html.typing` (reduced-motion / sin animación), el footer **nunca** se oculta y **nunca** recibe `.visible`: la clase es un artefacto del motor de tipeo, no de la visibilidad real.
- El `MutationObserver` existente es correcto para el caso "el usuario hace click durante los ~5 s del boot": el footer está oculto y hay que esperar a que se revele.
- Progressive enhancement y accesibilidad existentes no cambian: sin JS el formulario inline sigue siendo el fallback; reduced-motion sigue sin animación.

## 3. Cambios aplicados

### 3.1 `src/components/ContactModal.astro` — condición de espera en `abrir()`

Medir la visibilidad **real** del footer (CSS) en lugar de la clase `visible` (artefacto de la animación):

```ts
// antes
if (rest && !rest.classList.contains('visible')) {
  opener = origen
  const obs = new MutationObserver(() => {
    if (rest.classList.contains('visible')) {
      obs.disconnect()
      show()
    }
  })
  obs.observe(rest, { attributes: true, attributeFilter: ['class'] })
  return
}
show()

// después
if (rest && getComputedStyle(rest).display === 'none') {
  opener = origen
  const obs = new MutationObserver(() => {
    if (getComputedStyle(rest).display !== 'none') {
      obs.disconnect()
      show()
    }
  })
  obs.observe(rest, { attributes: true, attributeFilter: ['class'] })
  return
}
show()
```

Dos condiciones cambiadas, cero lógica nueva. `getComputedStyle` en el path de apertura es barato (una lectura por click) y mide el estado real renderizado, no la intención de la animación.

## 4. Verificación

1. `pnpm test` → suite completa OK.
2. `ASTRO_BASE=/cv pnpm build` → OK.
3. Playwright (script en laboratorio, mismo dist desplegado):
   - Contexto `reduced_motion='reduce'`: click en `[data-contact-open]` → `modal.classList` contiene `open` y `display: flex`.
   - Contexto normal: comportamiento actual intacto (click durante el boot → abre al revelarse; click tras el boot → abre inmediato).
4. Deploy: copia de `dist/` a `~/web-cv/dist` (bind mount, sin reiniciar Caddy) + curl local `127.0.0.1:8080/cv/` y público con UA de navegador (200).
5. En Windows con animaciones OFF (caso real de Josema): el modal abre; la animación sigue sin correr (esperado).

## 5. Fuera de alcance

- NO re-activar la animación con reduced-motion (accesibilidad manda).
- NO tocar el contrato API, diseño del modal, focus trap, ni el motor de tipeo.
- NO transpilar el bundle para navegadores pre-baseline (Chrome <107 / FF <104 / Safari <16 fallan por `?.`/`??` sin transpilar): mejora futura documentada aparte, no es el caso reportado.

## 6. Casos borde

| # | Caso | Comportamiento |
|---|---|---|
| E1 | Animación corriendo, click durante el boot (~5 s) | Footer `display:none` real → MutationObserver espera → abre al revelarse ✓ (igual que hoy) |
| E2 | Reduced-motion / sin animación | Footer nunca oculto → `show()` inmediato ✓ (**fix**) |
| E3 | Sin JS | Sin handler: submit nativo inline (por diseño) ✓ |
| E4 | Footer visible pero sin clase `visible` (caso E2 con animación interrumpida) | `display !== 'none'` → abre inmediato ✓ |
| E5 | Click tras el boot (normal) | `display: block` → abre inmediato ✓ |
