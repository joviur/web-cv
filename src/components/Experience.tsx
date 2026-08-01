import { cv } from '../data/cv'
import { ExperienceItem } from './ExperienceItem'
import { useLang } from '../context/LanguageContext'

export function Experience() {
  const { t } = useLang()

  return (
    <section id="experiencia" className="py-10">
      <h2 className="text-[13px] uppercase tracking-[0.18em] text-amber">
        ## 01 · {t('secciones.experiencia')}
      </h2>
      <div className="mb-2 border-b border-line" aria-hidden="true" />
      <ul>
        {cv.experiencia.map((exp) => (
          <ExperienceItem key={exp.empresa + exp.desde} exp={exp} />
        ))}
      </ul>
    </section>
  )
}
