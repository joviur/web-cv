import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'
import { useInView } from '../hooks/useInView'

export function Education() {
  const { t } = useLang()
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section id="educacion" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">{t('secciones.educacion')}</h2>
      <div
        ref={ref}
        data-inview={inView}
        className={`grid gap-6 transition-all duration-700 sm:grid-cols-2 ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
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
