import type { CategoriaSkill } from '../types/cv'

export type FiltroSkill = CategoriaSkill | 'Todos'

/** Filtro puro de skills por categoría (testeable sin DOM). */
export function filtrarSkills<T extends { categoria: CategoriaSkill }>(
  skills: T[],
  filtro: FiltroSkill,
): T[] {
  return filtro === 'Todos'
    ? skills
    : skills.filter((s) => s.categoria === filtro)
}
