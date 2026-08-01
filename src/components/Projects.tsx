import { cv } from '../data/cv'
import { useLang } from '../context/LanguageContext'

export function Projects() {
  const { t } = useLang()

  // ⭐ Sección oculta hasta que haya proyectos que mostrar
  if (cv.proyectos.length === 0) return null

  return (
    <section id="proyectos" className="py-10">
      <h2 className="text-[13px] uppercase tracking-[0.18em] text-amber">
        ## 04 · {t('secciones.proyectos')}
      </h2>
      <div className="mb-2 border-b border-line" aria-hidden="true" />
      <div>
        {cv.proyectos.map((p) => (
          <div
            key={p.nombre}
            className="border-b border-line px-1 py-3 text-[13px]"
          >
            <h3 className="text-[15px] font-bold">{p.nombre}</h3>
            <p className="mt-1 text-muted">{p.descripcion}</p>
            <p className="mt-1 text-[11px] text-muted">{p.tecnologias.join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
