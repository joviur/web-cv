import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Education() {
  const { t } = useLang()

  return (
    <section id="educacion" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">{t('secciones.educacion')}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {cv.educacion.map((e) => (
          <article
            key={e.titulo}
            className="rounded-xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <p className="text-xs font-semibold text-sky-500">{e.anio}</p>
            <h3 className="mt-1 font-semibold">{e.titulo}</h3>
            <p className="mt-2 text-sm text-slate-500">{e.centro}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
