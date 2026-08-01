import type { Experiencia } from '../types/cv'
import { useInView } from '../hooks/useInView'

export function ExperienceItem({ exp }: { exp: Experiencia }) {
  const { ref, inView } = useInView<HTMLLIElement>()

  return (
    <li
      ref={ref}
      data-inview={inView}
      className={`grid gap-1 border-b border-line py-4 transition-all duration-700 sm:grid-cols-[150px_1fr] sm:gap-5 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {/* En móvil el puesto va primero (order-1); la fecha/empresa debajo (order-2) */}
      <div className="order-2 text-xs leading-relaxed text-muted sm:order-1">
        {exp.desde} — {exp.hasta}
        <br />
        {exp.empresa}
      </div>
      <div className="order-1 sm:order-2">
        <h3 className="text-[15px] font-bold">
          {exp.puesto}
          {exp.actual && (
            <>
              {' '}
              <span className="bg-phos px-1.5 py-0.5 align-middle text-[10px] font-medium text-base">
                ACTUAL
              </span>
            </>
          )}
        </h3>
        <ul className="mt-2 list-none">
          {exp.logros.map((l) => (
            <li key={l} className="py-0.5 text-sm leading-relaxed">
              <span className="text-phos" aria-hidden="true">
                »{' '}
              </span>
              {l}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}
