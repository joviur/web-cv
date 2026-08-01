import { describe, expect, it } from 'vitest'
import { resolve } from './translations'

describe('resolve (i18n)', () => {
  it('resuelve claves en español', () => {
    expect(resolve('es', 'nav.experiencia')).toBe('experiencia')
    expect(resolve('es', 'secciones.experiencia')).toBe('Experiencia')
  })

  it('hace fallback a español cuando el idioma no está traducido', () => {
    expect(resolve('en', 'nav.experiencia')).toBe('experiencia')
  })

  it('devuelve la clave si no existe en ningún idioma', () => {
    expect(resolve('es', 'clave.inexistente')).toBe('clave.inexistente')
  })
})
