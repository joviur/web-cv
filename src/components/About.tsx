import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function About() {
  const { t } = useLang()

  return (
    <section id="sobre-mi" className="py-16">
      <h2 className="mb-6 text-2xl font-bold">{t('secciones.sobreMi')}</h2>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">{cv.resumen}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {['Python', 'RPA', 'Linux', 'SQL'].map((s) => (
          <span
            key={s}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs dark:border-slate-700"
          >
            {s}
          </span>
        ))}
      </div>
    </section>
  )
}
