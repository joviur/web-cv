import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Projects() {
  const { t } = useLang()

  // ⭐ Sección oculta hasta que haya proyectos que mostrar
  if (cv.proyectos.length === 0) return null

  return (
    <section id="proyectos" className="py-16">
      <h2 className="mb-8 text-2xl font-bold">{t('secciones.proyectos')}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {cv.proyectos.map((p) => (
          <article
            key={p.nombre}
            className="rounded-xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <h3 className="font-bold">{p.nombre}</h3>
            <p className="mt-2 text-sm">{p.descripcion}</p>
            <p className="mt-3 text-xs text-slate-500">
              {p.tecnologias.join(' · ')}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
