import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'
import { useInView } from '../hooks/useInView'

export function Education() {
  const { t } = useLang()
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section id="educacion" className="py-10">
      <h2 className="text-[13px] uppercase tracking-[0.18em] text-amber">
        ## 03 · {t('secciones.educacion')}
      </h2>
      <div className="mb-2 border-b border-line" aria-hidden="true" />

      <div
        ref={ref}
        data-inview={inView}
        className={`transition-all duration-700 ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        {cv.educacion.map((e) => (
          <div
            key={e.titulo}
            className="grid gap-1 border-b border-line py-4 sm:grid-cols-[150px_1fr] sm:gap-5"
          >
            <span className="text-xs text-phos">{e.anio}</span>
            <div>
              <h3 className="text-[15px] font-bold">{e.titulo}</h3>
              <p className="mt-1 text-sm text-muted">{e.centro}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
