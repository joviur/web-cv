import { useState } from 'react'
import { cv } from '../data/cv'
import type { CategoriaSkill } from '../types/cv'
import { useLang } from '../context/LanguageContext'
import { useInView } from '../hooks/useInView'

type Filtro = CategoriaSkill | 'Todos'

const categorias: { key: Filtro; label: string }[] = [
  { key: 'Todos', label: 'todos' },
  { key: 'Desarrollo', label: 'desarrollo' },
  { key: 'Sistemas', label: 'sistemas' },
  { key: 'Automatización', label: 'automatización' },
  { key: 'Soft skills', label: 'soft' },
]

function SkillRow({ nombre, categoria }: { nombre: string; categoria: CategoriaSkill }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-inview={inView}
      className={`flex items-baseline justify-between gap-4 border-b border-line px-1 py-2 text-[13px] transition-all duration-500 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
      }`}
    >
      <span>{nombre}</span>
      <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-muted">
        {categoria}
      </span>
    </div>
  )
}

export function Skills() {
  const { t } = useLang()
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  const visibles =
    filtro === 'Todos'
      ? cv.skills
      : cv.skills.filter((s) => s.categoria === filtro)

  return (
    <section id="skills" className="py-10">
      <p className="text-[13px] uppercase tracking-[0.18em] text-amber">
        ## 02 · {t('secciones.skills')}
      </p>
      <div className="mb-2 border-b border-line" aria-hidden="true" />

      <div className="no-print flex flex-wrap gap-2 py-3">
        {categorias.map((c) => (
          <button
            key={c.key}
            onClick={() => setFiltro(c.key)}
            aria-pressed={filtro === c.key}
            className={`border px-2.5 py-1 text-xs transition-colors ${
              filtro === c.key
                ? 'border-phos bg-phos text-base'
                : 'border-line text-muted hover:border-phos hover:text-phos'
            }`}
          >
            [ {c.label} ]
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {visibles.length} resultados
      </p>

      <div>
        {visibles.map((s) => (
          <SkillRow key={s.nombre} nombre={s.nombre} categoria={s.categoria} />
        ))}
      </div>
    </section>
  )
}
