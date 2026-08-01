import { useState } from 'react'
import { cv } from '../data/cv'
import type { CategoriaSkill } from '../types/cv'
import { useLang } from '../context/LanguageContext'

type Filtro = CategoriaSkill | 'Todos'

const categorias: Filtro[] = [
  'Todos',
  'Desarrollo',
  'Sistemas',
  'Automatización',
  'Soft skills',
]

function SkillBadge({ nombre }: { nombre: string }) {
  return (
    <span className="rounded-full border border-slate-200 px-3 py-1 text-sm transition-colors hover:border-sky-500 dark:border-slate-700">
      {nombre}
    </span>
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
    <section id="skills" className="py-16">
      <h2 className="mb-6 text-2xl font-bold">{t('secciones.skills')}</h2>

      <div className="no-print mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">{t('skills.filtro')}</span>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setFiltro(c)}
            aria-pressed={filtro === c}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filtro === c
                ? 'border-sky-500 bg-sky-500 text-white'
                : 'hover:border-sky-500'
            }`}
          >
            {c === 'Todos' ? t('skills.todos') : c}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {visibles.length} habilidades visibles
      </p>

      <div className="flex flex-wrap gap-2">
        {visibles.map((s) => (
          <SkillBadge key={s.nombre} nombre={s.nombre} />
        ))}
      </div>
    </section>
  )
}
