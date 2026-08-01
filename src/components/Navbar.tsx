import { useEffect, useState } from 'react'
import { useLang } from '../context/LanguageContext'
import { PrintButton } from './PrintButton'

interface Props {
  light: boolean
  onToggleLight: () => void
}

const SECTION_IDS = ['experiencia', 'skills', 'educacion', 'contacto']

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M13.4 9.6A5.6 5.6 0 1 1 6.4 2.6a4.2 4.2 0 0 0 7 7z" />
    </svg>
  )
}

export function Navbar({ light, onToggleLight }: Props) {
  const { lang, toggleLang, t } = useLang()
  const [active, setActive] = useState('')

  // Scroll-spy: marca la sección visible en la banda central del viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const links = [
    ['#experiencia', t('nav.experiencia')],
    ['#skills', t('nav.skills')],
    ['#educacion', t('nav.educacion')],
    ['#contacto', t('nav.contacto')],
  ] as const

  return (
    <header className="no-print sticky top-0 z-50">
      <div className="mx-auto max-w-[780px] px-6">
        {/* Barra tipo TUI */}
        <div className="flex items-center justify-between border border-t-0 border-line bg-panel px-4 py-2 text-xs text-muted">
          <span className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e4572e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber" />
              <span className="h-2.5 w-2.5 rounded-full bg-phos" />
            </span>
            <span>josema@dev — web-cv</span>
          </span>
          <span className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="border border-line px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-phos hover:text-phos"
              aria-label="Cambiar idioma"
            >
              [{lang === 'es' ? 'EN' : 'ES'}]
            </button>
            <button
              onClick={onToggleLight}
              className="flex items-center border border-line px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-phos hover:text-phos"
              aria-label="Cambiar tema"
            >
              {light ? <SunIcon /> : <MoonIcon />}
            </button>
            <PrintButton />
          </span>
        </div>
        {/* Navegación */}
        <nav
          aria-label="Principal"
          className="flex flex-wrap gap-x-6 border-b border-line bg-base px-1 py-2 text-xs"
        >
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={`transition-colors ${
                active === href.slice(1) ? 'text-phos' : 'text-muted hover:text-phos'
              }`}
            >
              ~/{label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
