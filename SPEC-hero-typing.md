# SPEC — Hero con animación de tipeo tipo terminal

> **Feature:** el nombre y la descripción del hero se escriben en pantalla como si fueran la salida de los comandos `whoami` y `cat cv.txt` que tienen encima, ejecutándose uno tras otro al cargar la página.
>
> **Estado:** v1.0 — **APROBADA** (decisiones cerradas, tabla §9).
> **Fecha:** 2026-08-01 · **Proyecto:** Web CV (Astro 5 + JS vanilla) · **Ficheros afectados:** `src/components/Hero.astro`, `src/lib/typing.ts` (nuevo), `src/lib/typing.test.ts` (nuevo), `src/styles/global.css`, `src/pages/index.astro`, `PROGRESS.md`.

---

## 1. Problema / motivación

El hero actual es estático: el prompt `josema@dev:~$ whoami`, el nombre, `$ cat cv.txt` y el resumen aparecen todos a la vez. La estética de terminal invita a que el contenido "se ejecute": los comandos se escriben, y su salida (nombre y resumen) aparece como si un proceso real la estuviera imprimiendo. Es el primer impacto visual de la página — la animación refuerza el tema Registry/Manpage del diseño con coste mínimo.

## 2. Contexto técnico (restricciones del proyecto)

- Astro 5 estático: el HTML ya contiene **todo el texto** (SEO, FCP sin JS). La animación es **mejora progresiva**: nunca oculta contenido si no hay JS (guard `html.js`, mismo patrón que el reveal).
- JS vanilla, sin dependencias nuevas. Presupuesto del proyecto: JS total **< 10 KB gzip** (hoy 3.2 KB / 283 B gzip). Este feature debe caber en ~1.5 KB min.
- Convenciones existentes: lógica pura testeable en `src/lib/` (ver `skills.ts` + `vitest.config.ts`, entorno node, sin jsdom); CSS con tokens (`--color-phos`, `--color-muted`, `--color-amber`); `prefers-reduced-motion` respetado globalmente; vista print remapea tokens a claro.
- El hero actual (`Hero.astro`): prompt `$ whoami` → `<h1>` nombre + cursor `cursor-blink` → `titulo @ empresa` → prompt `$ cat cv.txt` → resumen.

## 3. Requisitos funcionales

### RF-1 — Secuencia de tipeo encadenada
Al cargar la página, los bloques se escriben **en orden, uno tras otro**, cada bloque solo cuando el anterior ha terminado:

| Paso | Bloque | Comportamiento |
|---|---|---|
| 1 | `josema@dev:~$ whoami` | El prompt estático (colores) ya está; se **teclea la palabra `whoami`** tras él |
| 2 | Nombre (`<h1>`) | Se escribe como salida del `whoami` |
| 3 | `Software Engineer @ NTT DATA` | Se escribe como **segunda línea de salida del `whoami`** |
| 4 | `josema@dev:~$ cat cv.txt` | El prompt estático ya está; se **teclea `cat cv.txt`** tras él |
| 5 | Resumen (`cv.resumen`) | Se escribe como salida del `cat cv.txt` |

- **CA-1.1:** La secuencia se ejecuta exactamente una vez por carga de página, en el orden 1→5, sin solaparse.
- **CA-1.2:** El texto final renderizado es **idéntico** al actual (mismo contenido, mismo CSS, mismo cursor `blink` al final del nombre). Sin regresión visual una vez terminada.
- **CA-1.3:** Duración total ≈ **4.4 s** (perfil B de §10).
- **CA-1.4:** Cada bloque permanece invisible hasta que comienza su paso (solo la línea activa es visible, como un terminal real). Los márgenes del layout están reservados (`visibility: hidden`, no `display: none`) → sin CLS brusco; la altura del hero crece de forma natural a medida que se escribe.

### RF-2 — Cursores
- Cada bloque en tipeo lleva un **cursor temporal** de bloque parpadeante al final del texto escrito. Al terminar el bloque, su cursor temporal desaparece.
- El **cursor persistente del nombre** (comportamiento actual, `cursor-blink`) queda oculto durante los pasos 1–2 y se muestra al terminar el paso 2, permaneciendo parpadeando (D6-A).

- **CA-2.1:** Nunca hay más de **un cursor temporal** visible a la vez.
- **CA-2.2:** Tras la animación solo queda el cursor persistente del nombre (idéntico al estado actual).

### RF-3 — Efecto "vistoso" (D4: B+C)
- **Glow (B):** cada letra recién escrita lleva un text-shadow sutil en `--color-phos` que se desvanece (~250 ms) mientras la siguiente se imprime → estela de escritura.
- **Comando activo (C):** la línea del comando en ejecución pasa de `text-muted` a `text-ink` con transición suave; al terminar el comando, vuelve a muted.

- **CA-3.1:** El glow solo afecta a la letra recién impresa y se desvanece solo; no altera el texto ya escrito.
- **CA-3.2:** Sin dependencias nuevas; presupuesto JS de RNF-2 respetado.

### RF-4 — Interrupción y finalización
Cualquier interacción del usuario (scroll, click/pointer, teclado) completa la animación al instante. Al volver a una pestaña que estuvo en segundo plano, se completa. Imprimir (`beforeprint`) completa antes del render de impresión.

- **CA-4.1:** Tras la interrupción el estado final es idéntico al de una animación completada (CA-1.2), sin parpadeos ni saltos.
- **CA-4.2:** `finalizar()` es idempotente: llamadas posteriores (listeners que sobreviven al final natural) no tocan el DOM.

## 4. Requisitos no funcionales

- **RNF-1 (Accesibilidad):** Con `prefers-reduced-motion: reduce`, **no hay animación**: el script del head no marca `html.typing` y todo el texto es visible de inmediato (el JS del módulo lo comprueba también por seguridad).
- **RNF-2 (Presupuesto JS):** Sin librerías. `src/lib/typing.ts` (~20 líneas) + script del hero ≤ ~1.5 KB min. JS total del site < 10 KB gzip.
- **RNF-3 (Sin-JS / SEO):** Con JS deshabilitado o fallido, el hero se renderiza exactamente como hoy (el texto completo ya está en el HTML; nada se oculta sin `html.js`/`html.typing`).
- **RNF-4 (Print/PDF):** Imprimir durante la animación muestra el texto completo (`beforeprint` completa; además, en `@media print` los bloques `[data-tipeo]` fuerzan `visibility: visible`).
- **RNF-5 (A11y lectores de pantalla):** Los bloques animados exponen su texto completo vía `aria-label` en el contenedor; los spans visuales (texto, glow, cursores) son `aria-hidden`. El SR lee el contenido completo, no letra a letra.
- **RNF-6 (Rendimiento):** Tipeo por carácter en fuente mono (no cambia el ancho por carácter); la estela de glow colapsa cada span a texto plano a los ~250 ms (DOM final limpio, sin cientos de spans huérfanos).
- **RNF-7 (Red de seguridad):** Si el módulo de tipeo no llega a cargar, un `setTimeout` de 6 s en el script inline del head retira `html.typing` → todo el contenido visible (degradación a hero estático, nunca página rota).

## 5. Diseño propuesto

### 5.1 Lógica pura testeable — `src/lib/typing.ts` (nuevo)

```ts
export interface PerfilTipeo {
  cps: number    // caracteres por segundo objetivo
  jitter: number // variación aleatoria por carácter, en fracción (±jitter); 0 = sin variación
}

// Devuelve un delay (ms) por carácter: el tiempo a esperar ANTES de imprimir cada carácter.
// `aleatorio` es inyectable para tests deterministas (default Math.random).
export function planTipeo(texto: string, perfil: PerfilTipeo, aleatorio: () => number = Math.random): number[]
```

- Testeable en node sin DOM (misma convención que `skills.ts`). La pausa entre pasos (300 ms) vive en el engine del hero, no en la lib.

### 5.2 Marcado — `Hero.astro`

- Cada bloque animado lleva `data-tipeo` (`"cmd"` para comandos, `"out"` para salidas) y su texto visible va en un span `[data-tipeo-texto]` con `aria-hidden`. El contenedor lleva `aria-label` con el texto completo final.
- En las líneas de comando, el **prompt coloreado estático** (`josema@dev` phos + `:~` amber + `$`) queda fuera de `[data-tipeo-texto]`: solo se teclea la palabra del comando → se conservan los colores del prompt.
- El cursor persistente del nombre lleva `data-cursor-nombre` (para ocultarlo/mostrarlo desde el script).
- Script `<script>` (módulo procesado por Astro, como los actuales) al final del componente.

### 5.3 Script del hero (módulo)

1. Guards: sin `html.typing` o `prefers-reduced-motion` → salir (el HTML ya muestra todo).
2. Capturar `textContent` de cada `[data-tipeo-texto]` (orden DOM = orden de secuencia), vaciar los spans y ocultar el cursor persistente del nombre. Todo en `try/catch`: ante cualquier error, retirar `html.typing` (contenido visible).
3. Ejecutar la secuencia: por cada bloque, añadir clase `visible` (CSS lo muestra), cursor temporal al final, e imprimir caracteres con delays de `planTipeo` (glow por letra). Al terminar el bloque: quitar cursor temporal y, si es el nombre, mostrar el cursor persistente. Pausa de 300 ms entre pasos.
4. `finalizar()` (natural, interrupción o error): reescribir el texto completo de cada bloque, añadir `visible` a todos, quitar `html.typing`. Listeners: `scroll`/`pointerdown`/`keydown` (once), `visibilitychange` (al volver visible), `beforeprint`.

### 5.4 CSS — `src/styles/global.css`

```css
html.js.typing [data-tipeo] { visibility: hidden; }        /* oculto hasta su paso */
html.js.typing [data-tipeo].visible { visibility: visible; }
.glow-char { text-shadow: 0 0 8px color-mix(in srgb, var(--color-phos) 55%, transparent); transition: text-shadow .25s ease; }
.cmd-activo { color: var(--color-ink); }                   /* comando en ejecución */
.cursor-tipeo { /* bloque phos, mismo estilo que .cursor-blink, animación blink */ }
.cursor-oculto { display: none; }                          /* cursor persistente del nombre */
/* @media print: html.js.typing [data-tipeo] { visibility: visible !important; } */
```

### 5.5 Marcado del head — `index.astro`

En el script inline existente: además de `html.js`/dark, marcar `html.typing` solo si `!matchMedia('(prefers-reduced-motion: reduce)')` y programar la red de seguridad de 6 s (RNF-7).

### 5.6 Alternativas descartadas

| Alternativa | Motivo de descarte |
|---|---|
| Animación solo-CSS (width/mask sobre texto fijo) | Rompe con acentos/espaciado variable y no permite cursor que avanza con el texto |
| Librerías de tipeo (TypeIt, etc.) | Violan RNF-2 (budget JS) — el patrón es trivial en vanilla |
| Esperar a scroll hasta el hero para animar | El hero es la primera sección visible; animar al cargar es lo natural |
| Ocultar bloques con `display:none` | Pierde el layout reservado → CLS al aparecer cada bloque |

## 6. Casos borde

| # | Caso | Comportamiento esperado |
|---|---|---|
| E1 | `prefers-reduced-motion: reduce` | Sin animación, texto visible (RNF-1) |
| E2 | JS deshabilitado / error en script | Hero estático idéntico al actual (RNF-3) |
| E3 | Print/PDF durante la animación | `beforeprint` completa → texto completo en el PDF (RNF-4) |
| E4 | Usuario hace scroll/clic/tecla durante la animación | Se completa al instante (RF-4) |
| E5 | Pestaña en segundo plano durante la animación | Al volver a visible se completa (RF-4) |
| E6 | Móvil (320–375 px): nombre en 2 líneas | El tipeo fluye por líneas sin saltos; cursor al final de la última |
| E7 | Dark mode | Tokens CSS reasignados — la animación no cambia de color por tema |
| E8 | Futuro i18n (EN) | La animación lee el texto en runtime → funciona con cualquier idioma sin cambios |
| E9 | `html.typing` marcado pero el módulo no carga | Safety de 6 s retira la clase → contenido visible (RNF-7) |
| E10 | El módulo falla a mitad de secuencia | `try/catch` retira `html.typing` y deja `visible` en todos los bloques → texto visible (parcial o completo) |

## 7. Fuera de alcance (no-objetivos)

- NO animar el resto de secciones (experience, skills…) — solo el hero.
- NO sonido, partículas, canvas ni efectos de "glitch" del terminal.
- NO replay al hacer scroll de vuelta al hero (la animación ocurre una vez al cargar; D7-A).
- NO cambios en `cv.ts`, i18n ni en el resto de scripts.

## 8. Plan de verificación

1. **Tests (Vitest, node):** `planTipeo` — un delay por carácter (incl. texto vacío); delays enteros ≥ 0; jitter 0 ⇒ todos = 1000/cps; con aleatorio inyectado, límites `base·(1−j)` y `base·(1+j)`; más cps ⇒ duración total menor.
2. **`pnpm run lint`** (oxlint, 0 errores) y **`pnpm run build`** (astro build OK; JS total gzip medido).
3. **Navegador (dev/preview):**
   - Al cargar: `html.typing` presente; solo el paso 1 visible; secuencia 1→5 sin solapes.
   - Estado final: `html.typing` retirado, texto completo idéntico al estático, cursor persistente del nombre parpadeando, console limpia.
   - Interrupción: dispatch de scroll a mitad de secuencia → todo el texto al instante.
   - Emulación `prefers-reduced-motion` → sin animación (contenido visible).
   - JS deshabilitado → hero estático completo.
   - Print simulado a mitad de animación → texto completo.
   - Móvil 320/375 px y dark mode → sin regresiones.

## 9. Tabla de decisiones (cerradas)

| # | Decisión | Resolución |
|---|---|---|
| D1 | Elementos animados | **B** — comandos y salidas: `whoami` se escribe → nombre → `cat cv.txt` se escribe → resumen |
| D2 | Línea `titulo @ empresa` | **A** — se anima como segunda línea de salida del `whoami` |
| D3 | Perfil de velocidad | **B** — medio, total ≈ 4.4 s (valores finales en §10) |
| D4 | Efecto vistoso | **B+C** — glow sutil en la letra recién escrita + resaltado del comando en ejecución |
| D5 | Interrupción por interacción | **Sí** — scroll/clic/tecla completan al instante |
| D6 | Cursor final | **A** — se mantiene el cursor `blink` al final del nombre |
| D7 | Replay | **A** — cada carga de página |

## 10. Perfiles de velocidad (D3-B, final)

Contenido actual: nombre 19 caracteres, título 26, resumen ≈ 233, `whoami` 6 y `cat cv.txt` 10 (el prompt `josema@dev:~$ ` es estático y no se teclea). Jitter ±15 % por carácter en todos los perfiles. La pausa entre pasos es de 300 ms. **Total real ≈ 4.4 s** (el ajuste 80/50/110 cps + pausa 300 ms compensa el paso extra del título respecto al estimado inicial).

| Perfil | Comandos | Nombre / Título | Resumen | Pausa entre pasos | Total aprox. |
|---|---|---|---|---|---|
| A — Pausado y teatral | 40 cps | 25 cps | 55 cps | 500 ms | ≈ 7.5 s |
| **B — Medio ✅** | 80 cps | 50 cps | 110 cps | 300 ms | ≈ 4.4 s |
| C — Rápido | 110 cps | 70 cps | 160 cps | 200 ms | ≈ 2.7 s |
