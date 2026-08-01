import type { Experiencia } from '../types/cv'
import { useInView } from '../hooks/useInView'

export function ExperienceItem({ exp }: { exp: Experiencia }) {
  const { ref, inView } = useInView<HTMLLIElement>()

  return (
    <li
      ref={ref}
      data-inview={inView}
      className={`relative transition-all duration-700 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <span
        className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-sky-500"
        aria-hidden="true"
      />
      <article>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-lg font-bold">{exp.empresa}</h3>
          {exp.actual && (
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              Actualidad
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-300">{exp.puesto}</p>
        <p className="text-xs text-slate-500">
          {exp.desde} — {exp.hasta}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {exp.logros.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </article>
    </li>
  )
}
