import { useLang } from '../context/LanguageContext'
import { PrintButton } from './PrintButton'

interface Props {
  dark: boolean
  onToggleDark: () => void
}

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
      <nav
        className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6"
        aria-label="Principal"
      >
        <a href="#inicio" className="text-sm font-bold tracking-tight">
          JMV<span className="text-sky-500">.</span>
        </a>
        <ul className="flex flex-wrap items-center gap-4 text-sm">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href} className="transition-colors hover:text-sky-500">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded border px-2 py-1 text-xs transition-colors hover:border-sky-500"
            aria-label="Cambiar idioma"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            onClick={onToggleDark}
            className="rounded border px-2 py-1 text-xs transition-colors hover:border-sky-500"
            aria-label="Cambiar tema"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <PrintButton />
        </div>
      </nav>
    </header>
  )
}
