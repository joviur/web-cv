import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Footer() {
  const { t } = useLang()

  return (
    <footer
      id="contacto"
      className="border-t border-slate-200 py-12 dark:border-slate-800"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">{t('secciones.contacto')}</h2>
        <ul className="mt-6 space-y-2">
          <li>
            <a
              href={`mailto:${cv.email}`}
              className="transition-colors hover:text-sky-500"
            >
              {cv.email}
            </a>
          </li>
          <li>
            <a
              href={`tel:${cv.telefono.replace(/\s/g, '')}`}
              className="transition-colors hover:text-sky-500"
            >
              {cv.telefono}
            </a>
          </li>
          <li>{cv.ubicacion}</li>
        </ul>

        <h3 className="mt-8 font-semibold">{t('secciones.idiomas')}</h3>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
          {cv.idiomas.map((i) => (
            <li key={i.nombre}>
              {i.nombre} — {i.nivel}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          {t('footer.hechoCon')} · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
