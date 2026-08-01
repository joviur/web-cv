# Web CV Interactiva — Plan de Implementación

> **Para Hermes:** ejecutar fase a fase. Un commit de git al final de cada fase. Mantener `PROGRESS.md` actualizado en cada commit de fase. No borrar `.hermes/` (archivos adjuntos y planes).

**Goal:** Convertir el CV de José María Vizcaíno en una web interactiva one-page en React: datos centralizados y editables en un solo archivo, dark/light mode, i18n con mecanismo listo (solo español activo por ahora), sección de proyectos preparada pero oculta (array vacío), timeline de experiencia animado, filtros de skills y descarga de PDF vía vista de impresión.

**Architecture:** SPA estático (sin backend, sin router). Los datos viven en `src/data/cv.ts` — única fuente de verdad, tipada con TypeScript. La UI es una colección de componentes puros que consumen esos datos. Interactividad ligera: hooks propios (`useInView`, `useDarkMode`) y estado local; sin librerías de estado. i18n con React Context y resolución con fallback a español (el objeto `en` se rellenará en el futuro).

**Tech Stack:** Vite 7 · React 19 · TypeScript 5 · Tailwind CSS v4 (plugin `@tailwindcss/vite`) · Vitest 3 + React Testing Library + jsdom · pnpm (gestor de paquetes — el usuario NO usa npm) · git (un commit por fase).

---

## Requisitos previos (verificados)

- ✅ Node.js **v24.13.1** (`C:\Program Files\nodejs\node`) — requiere ≥ 20
- ✅ pnpm **10.30.1** (gestor de paquetes obligatorio — nunca npm)
- ✅ git **2.53.0**
- ✅ Directorio de trabajo: `C:\Users\josem\DEV\Web CV` (contiene `.hermes/` — **no borrar**)

## Decisiones tomadas (confirmadas con el usuario)

| # | Decisión | Resolución |
|---|---|---|
| 1 | Contenido | **NTT DATA** — puesto: **Software Engineer** (desde 07/2023). Bullets del periodo: los del CV (Control-M/SysAdmin) — **TODO: usuario debe confirmarlos** |
| 2 | Idioma | Solo español, pero **mecanismo i18n + botón EN listo** (fallback a ES; traducción en el futuro) |
| 3 | Stack | Vite + React + TypeScript + Tailwind CSS v4 |
| 4 | Proyectos | Sección preparada, **oculta** hasta que haya proyectos (array vacío → no se renderiza) |
| 5 | Interactividad | Timeline animado, filtros de skills, dark/light, descargar PDF (print), micro-animaciones reveal. **Sin terminal hacker** |
| 6 | Foto | No |
| 7 | Redes | No |
| 8 | Deploy | **VPS propio** — método a decidir en Fase 6 (nginx/caddy/docker, dominio) |
| 9 | Estilo | Dark + Light con toggle (persistencia en `localStorage`) |
| 10 | PDF | Sí — botón que dispara `window.print()` con estilos `@media print` |

## Estructura de archivos objetivo

```
Web CV/
├── PLAN.md
├── PROGRESS.md
├── .hermes/                      # NO TOCAR
├── index.html                    # lang="es", title, meta description
├── package.json
├── vite.config.ts                # react + tailwind + vitest config
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── src/
│   ├── main.tsx                  # providers (Language + App)
│   ├── App.tsx                   # layout: Navbar + secciones + Footer
│   ├── index.css                 # tailwind import, dark variant, print styles
│   ├── types/cv.ts               # interfaces del modelo de datos
│   ├── data/cv.ts                # ⭐ ÚNICO ARCHIVO A EDITAR para actualizar el CV
│   ├── i18n/translations.ts      # diccionarios es/en (en vacío, fallback)
│   ├── context/LanguageContext.tsx
│   ├── hooks/useDarkMode.ts
│   ├── hooks/useInView.ts
│   ├── components/
│   │   ├── Navbar.tsx            # sticky, scroll-spy, toggles dark/lang, botón PDF
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Experience.tsx        # timeline
│   │   ├── ExperienceItem.tsx
│   │   ├── Skills.tsx            # grid + filtros por categoría
│   │   ├── Education.tsx
│   │   ├── Projects.tsx          # condicional: array vacío → no renderiza
│   │   ├── PrintButton.tsx
│   │   └── Footer.tsx            # contacto (email, tel, ubicación)
│   └── test/setup.ts             # jest-dom + mock matchMedia
└── src/**/*.test.tsx             # tests por componente
```

---

## Fase 0 — Scaffold del proyecto

**Objetivo:** Proyecto Vite+React+TS funcionando con Tailwind v4 y git inicializado.

### Task 0.1 — Crear scaffold en subcarpeta temporal y mover a la raíz

El directorio actual NO está vacío (`.hermes/`), así que se crea el scaffold en temp y se mueve (evita el prompt interactivo de Vite):

```bash
cd "/c/Users/josem/DEV/Web CV"
pnpm create vite .tmp-scaffold --template react-ts
shopt -s dotglob && mv .tmp-scaffold/* . && shopt -u dotglob
rmdir .tmp-scaffold
```

**Verificar:** `ls` → aparecen `package.json`, `index.html`, `src/`, `tsconfig*`, `.gitignore`, `eslint.config.js`.

### Task 0.2 — Instalar dependencias + Tailwind v4

```bash
pnpm install
pnpm add tailwindcss @tailwindcss/vite
```

### Task 0.3 — Configurar Tailwind (plugin Vite + CSS)

**Editar `vite.config.ts`** → contenido completo:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

**Sobrescribir `src/index.css`** → contenido completo:

```css
@import "tailwindcss";

/* Dark mode por clase en <html> (toggle manual, no solo prefers-color-scheme) */
@custom-variant dark (&:where(.dark, .dark *));

html { scroll-behavior: smooth; }

/* Accesibilidad: respetar reduced-motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== Vista de impresión / PDF ===== */
@media print {
  body { background: #fff !important; color: #000 !important; }
  .no-print { display: none !important; }
  /* Forzar visibilidad de elementos con reveal (opacity 0 hasta inView) */
  [data-inview="false"] { opacity: 1 !important; transform: none !important; }
  section { break-inside: avoid; }
}
```

**Limpiar `src/App.css`** (eliminar archivo) y **sustituir `src/App.tsx`** por un placeholder mínimo que renderice `<h1 className="text-3xl font-bold underline">Hola</h1>` para validar Tailwind.

**Verificar:** `pnpm dev` → abrir `http://localhost:5173`, el h1 se ve con estilos Tailwind (subrayado, negrita). Terminar con Ctrl+C.

### Task 0.4 — Git init + primer commit

```bash
git init -b main
git add -A
git commit -m "chore: scaffold vite react-ts + tailwind v4"
```

**Verificar:** `git log --oneline` muestra el commit. Actualizar `PROGRESS.md` (Fase 0 ✅).

---

## Fase 1 — Modelo de datos, i18n y hooks base

**Objetivo:** Única fuente de verdad tipada con todo el contenido del CV, mecanismo i18n con fallback, hooks de dark mode y reveal.

### Task 1.1 — Crear `src/types/cv.ts`

```ts
export type CategoriaSkill =
  | 'Desarrollo'
  | 'Sistemas'
  | 'Automatización'
  | 'Soft skills'

export interface Experiencia {
  empresa: string
  puesto: string
  desde: string        // '07/2023'
  hasta: string        // 'Actualidad' o '07/2023'
  actual?: boolean
  logros: string[]
}

export interface Skill {
  nombre: string
  categoria: CategoriaSkill
}

export interface Educacion {
  titulo: string
  centro: string
  anio: string
}

export interface Idioma {
  nombre: string
  nivel: string
}

export interface Proyecto {
  nombre: string
  descripcion: string
  tecnologias: string[]
  url?: string
  repo?: string
}

export interface CvData {
  nombre: string
  titulo: string
  ubicacion: string
  email: string
  telefono: string
  resumen: string
  experiencia: Experiencia[]
  skills: Skill[]
  educacion: Educacion[]
  idiomas: Idioma[]
  proyectos: Proyecto[]
}
```

### Task 1.2 — Crear `src/data/cv.ts` (⭐ único archivo a editar en el futuro)

```ts
import type { CvData } from '../types/cv'

export const cv: CvData = {
  nombre: 'José María Vizcaíno',
  titulo: 'Software Engineer',
  ubicacion: 'Alicante, España',
  email: '[email-eliminado]',
  telefono: '[telefono eliminado]',
  resumen:
    'Titulado en Administración de Sistemas Informáticos en Red (ASIR). ' +
    'Software Engineer con experiencia en automatización y orquestación de ' +
    'procesos (Control-M), desarrollo RPA con Python y administración de ' +
    'sistemas Linux y Windows.',
  experiencia: [
    {
      empresa: 'NTT DATA',
      puesto: 'Software Engineer',
      desde: '07/2023',
      hasta: 'Actualidad',
      actual: true,
      // TODO: el usuario debe confirmar/actualizar estos logros
      logros: [
        'Gestión y desarrollo de orquestador de procesos automatizados mediante Control-M',
        'Transferencias de ficheros automatizadas',
        'Resolución de problemas y soporte a usuarios',
        'Administración de sistemas Linux y Windows',
        'Gestión de bases de datos SQL',
      ],
    },
    {
      empresa: 'Redarquia Digital',
      puesto: 'Desarrollador RPA y Administrador de Sistemas',
      desde: '10/2022',
      hasta: '07/2023',
      logros: [
        'Desarrollos de automatizaciones RPA usando Python',
        'Desarrollo en plataformas LowCode/NoCode',
        'Diseño de bases de datos',
        'CI/CD con Jenkins',
      ],
    },
    {
      empresa: 'Azaconsa S.L',
      puesto: 'Responsable de Informática y parte del equipo de compras',
      desde: '09/2021',
      hasta: '10/2022',
      logros: [
        'Soporte técnico a usuarios',
        'Control de procesos y planificación de producción',
        'Gestión de Windows Server y aplicaciones SGA/ERP',
        'Gestión de compras y aprovisionamiento',
        'Configuración y administración de copias de seguridad',
      ],
    },
    {
      empresa: 'Ayuntamiento de Aspe',
      puesto: 'Prácticas FCT — Ayudante de Administrador de Sistemas',
      desde: '03/2018',
      hasta: '06/2018',
      logros: [
        'Soporte microinformático y redes',
        'Administración de Windows Server y Active Directory',
        'Planificación de redes informáticas',
        'Gestión de copias de seguridad',
      ],
    },
  ],
  skills: [
    // Desarrollo
    { nombre: 'Python', categoria: 'Desarrollo' },
    { nombre: 'RPA (Python)', categoria: 'Desarrollo' },
    { nombre: 'SQL', categoria: 'Desarrollo' },
    { nombre: 'CI/CD (Jenkins)', categoria: 'Desarrollo' },
    { nombre: 'LowCode / NoCode', categoria: 'Desarrollo' },
    // Sistemas
    { nombre: 'Linux', categoria: 'Sistemas' },
    { nombre: 'Windows Server', categoria: 'Sistemas' },
    { nombre: 'SysAdmin', categoria: 'Sistemas' },
    { nombre: 'Active Directory', categoria: 'Sistemas' },
    { nombre: 'Redes', categoria: 'Sistemas' },
    { nombre: 'Copias de seguridad', categoria: 'Sistemas' },
    // Automatización
    { nombre: 'Control-M', categoria: 'Automatización' },
    { nombre: 'Orquestación de procesos', categoria: 'Automatización' },
    { nombre: 'Transferencia de ficheros', categoria: 'Automatización' },
    // Soft skills
    { nombre: 'Trabajo en equipo', categoria: 'Soft skills' },
    { nombre: 'Aprendizaje rápido', categoria: 'Soft skills' },
    { nombre: 'Autogestión', categoria: 'Soft skills' },
    { nombre: 'Autodidacta', categoria: 'Soft skills' },
  ],
  educacion: [
    {
      titulo: 'Ciclo Formativo de Grado Superior en Administración de Sistemas Informáticos en Red (ASIR)',
      centro: 'I.E.S. Severo Ochoa, Elche (Alicante)',
      anio: '2020',
    },
    {
      titulo: 'Ciclo Formativo de Grado Medio en Sistemas Microinformáticos y Redes (SMR)',
      centro: 'I.E.S. Villa de Aspe, Aspe (Alicante)',
      anio: '2018',
    },
  ],
  idiomas: [
    { nombre: 'Español', nivel: 'Nativo' },
    { nombre: 'Valenciano', nivel: 'Nativo' },
    { nombre: 'Inglés', nivel: 'A2' },
  ],
  proyectos: [], // ⭐ Sección oculta hasta que haya proyectos que mostrar
}
```

### Task 1.3 — i18n: diccionarios + contexto

**Crear `src/i18n/translations.ts`:**

```ts
export type Lang = 'es' | 'en'

export interface Translation {
  nav: { sobreMi: string; experiencia: string; skills: string; educacion: string; proyectos: string; contacto: string }
  hero: { ctaExperiencia: string; ctaContacto: string }
  secciones: { sobreMi: string; experiencia: string; skills: string; educacion: string; proyectos: string; idiomas: string; contacto: string }
  skills: { todos: string; filtro: string }
  footer: { hechoCon: string }
}

export const translations: Record<Lang, Partial<Translation>> = {
  es: {
    nav: {
      sobreMi: 'Sobre mí',
      experiencia: 'Experiencia',
      skills: 'Habilidades',
      educacion: 'Educación',
      proyectos: 'Proyectos',
      contacto: 'Contacto',
    },
    hero: {
      ctaExperiencia: 'Ver experiencia',
      ctaContacto: 'Contactar',
    },
    secciones: {
      sobreMi: 'Sobre mí',
      experiencia: 'Experiencia profesional',
      skills: 'Habilidades',
      educacion: 'Educación',
      proyectos: 'Proyectos',
      idiomas: 'Idiomas',
      contacto: 'Contacto',
    },
    skills: {
      todos: 'Todos',
      filtro: 'Filtrar por categoría',
    },
    footer: { hechoCon: 'Hecho con React + Tailwind CSS' },
  },
  // TODO(i18n): completar traducción al inglés cuando se implemente.
  // Mientras tanto, todo resuelve con fallback a español.
  en: {},
}

/** Resuelve una clave con notación de puntos, con fallback a español. */
export function resolve(lang: Lang, key: string): string {
  const get = (d: Partial<Translation>) =>
    key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], d)
  const v = get(translations[lang] ?? {})
  if (typeof v === 'string') return v
  const fb = get(translations.es)
  return typeof fb === 'string' ? fb : key
}
```

**Crear `src/context/LanguageContext.tsx`:**

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { resolve, type Lang } from '../i18n/translations'

interface LanguageCtx {
  lang: Lang
  toggleLang: () => void
  t: (key: string) => string
}

const Ctx = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')
  const toggleLang = () => setLang((l) => (l === 'es' ? 'en' : 'es'))
  const t = (key: string) => resolve(lang, key)
  return <Ctx.Provider value={{ lang, toggleLang, t }}>{children}</Ctx.Provider>
}

export function useLang(): LanguageCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang debe usarse dentro de LanguageProvider')
  return ctx
}
```

### Task 1.4 — Hooks base

**Crear `src/hooks/useDarkMode.ts`:**

```ts
import { useEffect, useState } from 'react'

/** Dark mode con persistencia en localStorage y respeto a prefers-color-scheme. */
export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark((d) => !d)]
}
```

**Crear `src/hooks/useInView.ts`:**

```ts
import { useEffect, useRef, useState } from 'react'

/** Devuelve ref + flag que se pone a true la primera vez que el elemento entra en viewport. */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true) // fallback (tests, navegadores antiguos)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}
```

### Task 1.5 — Verificación y commit

```bash
pnpm exec tsc --noEmit
```

**Esperado:** sin errores. **Commit:**

```bash
git add -A
git commit -m "feat: cv data model + i18n base + hooks"
```

Actualizar `PROGRESS.md` (Fase 1 ✅).

---

## Fase 2 — Layout base (Navbar, Hero, Footer, dark mode)

**Objetivo:** Esqueleto visual de la página con navegación, tema oscuro/claro funcional y pie de contacto.

### Task 2.1 — `index.html` (meta y título)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="CV de José María Vizcaíno — Software Engineer. Python, RPA, Linux, SQL, SysAdmin, Control-M." />
    <title>José María Vizcaíno — Software Engineer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Task 2.2 — `src/App.tsx` (estructura + providers)

```tsx
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Skills } from './components/Skills'
import { Education } from './components/Education'
import { Projects } from './components/Projects'
import { Footer } from './components/Footer'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors">
      <Navbar dark={dark} onToggleDark={toggleDark} />
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Education />
        <Projects />
      </main>
      <Footer />
    </div>
  )
}
```

`src/main.tsx` debe envolver con `LanguageProvider`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
```

### Task 2.3 — `src/components/Navbar.tsx`

- Sticky (`sticky top-0`), fondo translúcido con blur (`backdrop-blur`), borde inferior sutil.
- Enlaces de anclaje: `#sobre-mi`, `#experiencia`, `#skills`, `#educacion`, `#contacto` — textos vía `t('nav.…')`.
- Toggle dark: botón con icono ☀️/🌙 según `dark`.
- Botón idioma: muestra `EN` (cambia a inglés; con `en` vacío el texto sigue en español — mecanismo listo).
- Botón `PrintButton` (Task 2.5 puede ir aquí o separado).
- Clase `no-print` en todo el navbar.
- Mobile: menú colapsable simple (useState `open`) o enlaces compactos; mínimo viable: fila que se desborda con `flex-wrap` + `gap` (aceptable para 6 enlaces).

```tsx
import { useLang } from '../context/LanguageContext'
import { PrintButton } from './PrintButton'

interface Props { dark: boolean; onToggleDark: () => void }

export function Navbar({ dark, onToggleDark }: Props) {
  const { lang, toggleLang, t } = useLang()
  const links = [
    ['#sobre-mi', t('nav.sobreMi')],
    ['#experiencia', t('nav.experiencia')],
    ['#skills', t('nav.skills')],
    ['#educacion', t('nav.educacion')],
    ['#contacto', t('nav.contacto')],
  ] as const

  return (
    <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6" aria-label="Principal">
        <a href="#inicio" className="text-sm font-bold tracking-tight">
          JMV<span className="text-sky-500">.</span>
        </a>
        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="hover:text-sky-500 transition-colors">{label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="rounded border px-2 py-1 text-xs hover:border-sky-500 transition-colors" aria-label="Cambiar idioma">
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button onClick={onToggleDark} className="rounded border px-2 py-1 text-xs hover:border-sky-500 transition-colors" aria-label="Cambiar tema">
            {dark ? '☀️' : '🌙'}
          </button>
          <PrintButton />
        </div>
      </nav>
    </header>
  )
}
```

### Task 2.4 — `src/components/Hero.tsx`

- `<section id="inicio">` con padding generoso.
- Nombre en `text-4xl sm:text-5xl font-bold` + acento de color.
- Título profesional (`cv.titulo`) + ubicación.
- Resumen corto (2-3 líneas).
- Badges de tecnologías principales: `Python · RPA · Linux · SQL · SysAdmin · Control-M`.
- CTAs: `#experiencia` (primario) y `mailto:` (secundario) — textos de `t('hero.…')`.
- Datos de `cv` (import de `../data/cv`).

### Task 2.5 — `src/components/PrintButton.tsx` + Footer

```tsx
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded border px-2 py-1 text-xs hover:border-sky-500 transition-colors"
      aria-label="Descargar CV en PDF"
    >
      PDF
    </button>
  )
}
```

**`src/components/Footer.tsx`** — `<footer id="contacto">`:
- Email → `mailto:` (visible), teléfono → `tel:` (visible), ubicación.
- Sección Idiomas (de `cv.idiomas`) con banderita textual (ES/VA/EN) — se muestra aquí o en Education; **decisión de diseño: aquí, bajo contacto, como lista compacta**.
- `t('footer.hechoCon')` + año actual (`new Date().getFullYear()`).

### Task 2.6 — Verificación y commit

```bash
pnpm dev
```

**Verificar en `http://localhost:5173`:**
- Navbar sticky, enlaces saltan a secciones con scroll suave.
- Toggle dark: cambia colores de toda la página; recargar → persiste.
- Botón EN: cambia a "ES" (el texto sigue en español, correcto por ahora).
- Botón PDF: abre el diálogo de impresión del navegador.

**Commit:** `git add -A && git commit -m "feat: layout + dark mode + hero"` → `PROGRESS.md` Fase 2 ✅.

---

## Fase 3 — Secciones de contenido

**Objetivo:** Sobre mí, Experiencia (timeline), Habilidades, Educación y Proyectos (oculto).

### Task 3.1 — `src/components/About.tsx`

`<section id="sobre-mi">`: título de sección (`t('secciones.sobreMi')`) + `cv.resumen` en párrafo + 3-4 chips destacados (Python, RPA, Linux, SQL).

### Task 3.2 — `src/components/Experience.tsx` + `ExperienceItem.tsx`

- `<section id="experiencia">` con título `t('secciones.experiencia')`.
- Timeline vertical: borde izquierdo (`border-l`) con dots por item, `space-y-8`.
- `ExperienceItem` (props: `Experiencia`): empresa (bold, acento si `actual` con badge "Actual"), puesto, `desde — hasta`, `<ul>` con logros.
- Cada item con `useInView` → transición `opacity/translate` al entrar (clase condicional + `data-inview` para el print).

```tsx
// Experiencia.tsx (esquema)
import { cv } from '../data/cv'
import { ExperienceItem } from './ExperienceItem'
import { useLang } from '../context/LanguageContext'

export function Experience() {
  const { t } = useLang()
  return (
    <section id="experiencia" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">{t('secciones.experiencia')}</h2>
      <ol className="relative border-l border-slate-200 dark:border-slate-800 space-y-10 pl-6">
        {cv.experiencia.map((exp) => (
          <ExperienceItem key={exp.empresa + exp.desde} exp={exp} />
        ))}
      </ol>
    </section>
  )
}
```

### Task 3.3 — `src/components/Skills.tsx`

- `<section id="skills">` con título `t('secciones.skills')`.
- Filtros: botones `Todos` + cada categoría (`t('skills.todos')` + `categoria`). Estado `useState<CategoriaSkill | 'Todos'>`.
- Grid de badges (`flex flex-wrap gap-2`), cada badge con acento al hover.
- Filtrado: `cv.skills.filter(...)`. Los filtros llevan `no-print`.

### Task 3.4 — `src/components/Education.tsx`

`<section id="educacion">`: tarjetas con `titulo`, `centro`, `anio` (de `cv.educacion`). Título `t('secciones.educacion')`.

### Task 3.5 — `src/components/Projects.tsx` (condicional)

```tsx
import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Projects() {
  const { t } = useLang()
  if (cv.proyectos.length === 0) return null // ⭐ oculta hasta tener proyectos
  return (
    <section id="proyectos" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">{t('secciones.proyectos')}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {cv.proyectos.map((p) => (
          <article key={p.nombre} className="rounded-xl border p-5">
            <h3 className="font-bold">{p.nombre}</h3>
            <p className="mt-2 text-sm">{p.descripcion}</p>
            <p className="mt-3 text-xs">{p.tecnologias.join(' · ')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
```

### Task 3.6 — Verificación y commit

```bash
pnpm dev
```

**Verificar:** todas las secciones renderizan con datos reales; Projects no aparece (array vacío); timeline muestra NTT DATA primero con badge "Actualidad". **Commit:**

```bash
git add -A
git commit -m "feat: content sections (about, timeline, skills, education, projects)"
```

`PROGRESS.md` Fase 3 ✅.

---

## Fase 4 — Interactividad: filtros, reveal y descarga PDF

**Objetivo:** La web "se mueve": reveal on scroll, filtros funcionales y PDF vía print.

### Task 4.1 — Reveal on scroll

- Aplicar `useInView` en: items de experiencia, tarjetas de educación, badges de skills, secciones About/Hero opcional.
- Patrón de clase: `transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`.
- Añadir `data-inview={inView}` en el elemento para que `@media print` lo fuerce a visible (ya está en CSS de Fase 0).

### Task 4.2 — Filtros de skills funcionales

- Botones: `Todos` + categorías. Botón activo con estilo acentuado (`bg-sky-500 text-white`).
- Al filtrar, contar resultados visibles (`aria-live="polite"` opcional).
- Test de este comportamiento en Fase 5.

### Task 4.3 — Vista de impresión pulida

Añadir a `src/index.css` (bloque `@media print`):

```css
@media print {
  /* ya existente: fondo, .no-print, [data-inview] */
  .print-single-col { display: block !important; }
  main { max-width: 100% !important; }
}
```

- Asegurar que navbar, filtros y botones llevan `no-print`.
- Verificar con Ctrl+P / botón PDF: 1-2 páginas limpias, sin colores de fondo oscuros, sin animaciones pendientes.

### Task 4.4 — Verificación y commit

```bash
pnpm dev
```

**Verificar:** scroll → elementos aparecen con transición; filtro de skills oculta/muestra por categoría; Ctrl+P muestra versión imprimible limpia. **Commit:**

```bash
git add -A
git commit -m "feat: interactions (reveal, skill filters, print view)"
```

`PROGRESS.md` Fase 4 ✅.

---

## Fase 5 — Tests, accesibilidad y responsive

**Objetivo:** Calidad verificable: tests unitarios de los comportamientos clave, accesibilidad y móvil.

### Task 5.1 — Setup de tests

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Crear `src/test/setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom no implementa matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
```

Añadir script a `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

### Task 5.2 — Tests a escribir

| Archivo | Casos |
|---|---|
| `src/App.test.tsx` | Renderiza nombre "José María Vizcaíno"; secciones con id `experiencia`, `skills`, `educacion` presentes |
| `src/components/Experience.test.tsx` | Empresas en orden; NTT DATA primero con "Actualidad" |
| `src/components/Skills.test.tsx` | Click en categoría "Sistemas" → solo badges de Sistemas; click "Todos" → todos |
| `src/components/Projects.test.tsx` | Con `cv.proyectos` vacío → `null` (sección ausente en el DOM) |
| `src/i18n/translations.test.ts` | `resolve('es','nav.sobreMi') === 'Sobre mí'`; `resolve('en','nav.sobreMi')` → fallback a español |
| `src/hooks/useDarkMode.test.tsx` | Al montar con `localStorage.theme='dark'` → `<html>` tiene clase `dark`; toggle la quita |

**Ejemplo (`Skills.test.tsx`):**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Skills } from './Skills'
import { LanguageProvider } from '../context/LanguageContext'

const renderSkills = () =>
  render(
    <LanguageProvider>
      <Skills />
    </LanguageProvider>,
  )

describe('Skills', () => {
  it('filtra por categoría', async () => {
    renderSkills()
    expect(screen.getByText('Python')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sistemas' }))
    expect(screen.queryByText('Python')).not.toBeInTheDocument()
    expect(screen.getByText('Linux')).toBeInTheDocument()
  })
})
```

### Task 5.3 — Accesibilidad y responsive

- `aria-label` en botones de icono (ya incluidos), `lang="es"` en `<html>`, jerarquía de headings correcta (`h1` único en Hero, `h2` por sección, `h3` en items).
- Focus visible (Tailwind default + `focus-visible:ring` en botones).
- `prefers-reduced-motion` ya cubierto en CSS.
- Revisar en viewport móvil (DevTools 375px): navbar no se rompe, grid de educación apila.

### Task 5.4 — Verificación y commit

```bash
pnpm test          # todos en verde
pnpm build     # tsc + vite build sin errores
pnpm preview   # servir dist/ localmente y revisar
```

**Commit:** `git add -A && git commit -m "test: coverage (skills filter, i18n fallback, dark mode) + a11y"` → `PROGRESS.md` Fase 5 ✅.

---

## Fase 6 — Build de producción y deploy al VPS (pendiente de decisión)

**Objetivo:** Artefacto de producción listo y desplegado en el VPS del usuario.

### Task 6.1 — Build de producción

```bash
pnpm build   # → dist/
pnpm preview # comprobar localmente el artefacto final
```

### Task 6.2 — Deploy al VPS — ❓ PENDIENTE DE DECISIÓN

Opciones (decidir con el usuario antes de ejecutar):

| Opción | Pros | Contras |
|---|---|---|
| **A. nginx** en el VPS sirviendo `dist/` | Estándar, rápido, control total | Requiere config manual + TLS (certbot) |
| **B. caddy** en el VPS | TLS automático, config mínima (3 líneas) | Menos común que nginx |
| **C. Contenedor (podman/nginx) + systemd** | Aislado, consistente con su VPS (Podman ya instalado) | Más piezas móviles |
| **D. Acceso solo por Tailscale** (sin exponer puertos) | Máxima seguridad, coherente con su hardening (0 puertos abiertos) | Solo visible en su red mesh |

Transferencia: `rsync`/`scp` de `dist/` al VPS (puerto 22222, clave ed25519). Posible CI con GitHub Actions si el repo sube a GitHub.

**Verificar:** `curl -I https://<dominio-o-IP>` → 200; HTTPS válido; la web completa en móvil.

### Task 6.3 — README.md + cierre

- `README.md`: qué es, stack, cómo ejecutar (`pnpm install && pnpm dev`), cómo actualizar el CV (editar `src/data/cv.ts`), cómo construir y desplegar.
- `PROGRESS.md`: todas las fases ✅, sección "Pendiente" con los TODOs.

**Commit:** `git add -A && git commit -m "docs: readme + deploy"` → `PROGRESS.md` Fase 6 ✅.

---

## Riesgos y preguntas abiertas

1. **Bullets de NTT DATA**: los del CV son del periodo Nunsys (Control-M/SysAdmin). El usuario debe confirmarlos o reescribirlos — TODO marcado en `src/data/cv.ts` (edición de 5 minutos, sin tocar código).
2. **Deploy en VPS**: método a elegir (Fase 6, tabla arriba). El VPS tiene hardening agresivo (0 puertos abiertos, solo Tailscale) — la opción D (solo mesh) es coherente, pero si quiere visibilidad pública habrá que abrir 80/443 con cuidado.
3. **Traducción EN**: mecanismo y botón listos; falta rellenar `translations.en` (tarea futura).
4. **Dominio**: si tiene uno, apuntarlo al VPS; si no, IP directa o subdominio.
5. **Windows/MSYS**: los comandos del plan usan rutas `/c/...` válidas en git-bash. Si `pnpm dev` fallara por puerto ocupado, usar `pnpm dev --port 5174`.

## Checklist final del proyecto

- [ ] Fase 0: scaffold + Tailwind + git ✅ (commit)
- [ ] Fase 1: datos + i18n + hooks (commit)
- [ ] Fase 2: layout + dark mode (commit)
- [ ] Fase 3: secciones (commit)
- [ ] Fase 4: interacciones + print (commit)
- [ ] Fase 5: tests + a11y (commit)
- [ ] Fase 6: build + deploy VPS + README (commit)
- [ ] PROGRESS.md actualizado en cada fase


---

## Fase 7 (añadida) — Rediseño anti-AI-slop

**Contexto:** el diseño original mostraba los "tells" clásicos de salida AI (sky-500,
cards redondeadas, pills, emojis, copy genérica, fuente system).

**Investigación (fuentes):** Claude Cookbook "Frontend Aesthetics" (evitar Inter/Roboto/
Space Grotesk, azul/púrpura, layout promedio), 925studios "AI Slop Web Design Guide"
(contención: Linear/Stripe son distintivos por lo que quitan), axe-web "Why AI Websites
All Look the Same" (la media estadística del entrenamiento), alexlavaee (model collapse,
la iteración humana es irremplazable).

**Decisión del usuario:** Variante B — **Registry/Manpage** (dark-first, JetBrains Mono,
tokens sin azul, prompts de terminal, filtros `[ todos ]`). Mockups comparativos en
`sketches/` (A descartada, B promovida a producción).

**Cambios clave:**
- `src/index.css`: tokens `@theme` (base/panel/ink/muted/line/phos/amber) + override `.light`
- `useDarkMode`: gestiona clase `light` (dark-first), persistencia localStorage
- `Navbar`: barra TUI + nav `~/seccion` + scroll-spy (IntersectionObserver)
- `Hero`: `whoami` / `cat cv.txt` con cursor blink; Sobre mí fusionado (About.tsx eliminado)
- `Experience/Education`: filas tipo registro, fechas en columna meta, badge ACTUAL
- `Skills`: filas con categoría + filtros `[ todos ] [ desarrollo ] [ sistemas ] [ automatización ] [ soft ]`
- Soft skills reformuladas como evidencia; `translations` sin claves huérfanas
- Tests actualizados (IntersectionObserver mockeado en `src/test/setup.ts`)
