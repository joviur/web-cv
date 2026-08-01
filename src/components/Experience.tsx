import { cv } from '../data/cv'
import { ExperienceItem } from './ExperienceItem'
import { useLang } from '../context/LanguageContext'

export function Experience() {
  const { t } = useLang()

  return (
    <section id="experiencia" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">
        {t('secciones.experiencia')}
      </h2>
      <ol className="relative space-y-10 border-l border-slate-200 pl-6 dark:border-slate-800">
        {cv.experiencia.map((exp) => (
          <ExperienceItem key={exp.empresa + exp.desde} exp={exp} />
        ))}
      </ol>
    </section>
  )
}
