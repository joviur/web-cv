import { describe, expect, it } from 'vitest'
import { filtrarSkills } from './skills'

const skills = [
  { nombre: 'Python', categoria: 'Desarrollo' },
  { nombre: 'Linux', categoria: 'Sistemas' },
  { nombre: 'Control-M', categoria: 'Automatización' },
  { nombre: 'Soporte', categoria: 'Soft skills' },
]

describe('filtrarSkills', () => {
  it('Todos devuelve la lista completa', () => {
    expect(filtrarSkills(skills, 'Todos')).toHaveLength(4)
  })

  it('filtra por categoría', () => {
    const r = filtrarSkills(skills, 'Sistemas')
    expect(r).toHaveLength(1)
    expect(r[0].nombre).toBe('Linux')
  })

  it('devuelve vacío si no hay coincidencias', () => {
    expect(filtrarSkills(skills, 'Automatización')).toHaveLength(1)
    expect(filtrarSkills([], 'Todos')).toHaveLength(0)
  })

  it('no muta el array original', () => {
    const copia = [...skills]
    filtrarSkills(skills, 'Sistemas')
    expect(skills).toEqual(copia)
  })
})
