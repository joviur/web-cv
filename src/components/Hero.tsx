import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Hero() {
  const { t } = useLang()
  const badges = cv.skills
    .filter((s) => s.categoria !== 'Soft skills')
    .slice(0, 6)
    .map((s) => s.nombre)

  return (
    <section id="inicio" className="py-20 sm:py-28">
      <p className="text-sm uppercase tracking-widest text-sky-500">
        {cv.ubicacion}
      </p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{cv.nombre}</h1>
      <p className="mt-2 text-xl text-slate-600 dark:text-slate-300">
        {cv.titulo}
      </p>
      <p className="mt-6 max-w-xl text-slate-600 dark:text-slate-400">
        {cv.resumen}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"
          >
            {b}
          </span>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#experiencia"
          className="rounded-lg bg-sky-500 px-4 py-2 text-white transition-colors hover:bg-sky-600"
        >
          {t('hero.ctaExperiencia')}
        </a>
        <a
          href={`mailto:${cv.email}`}
          className="rounded-lg border border-slate-300 px-4 py-2 transition-colors hover:border-sky-500 dark:border-slate-700"
        >
          {t('hero.ctaContacto')}
        </a>
      </div>
    </section>
  )
}
