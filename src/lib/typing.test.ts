import { describe, expect, it } from 'vitest'
import { planTipeo } from './typing'

const fijo = (v: number) => () => v

describe('planTipeo', () => {
  it('devuelve un delay por carácter (y vacío para texto vacío)', () => {
    expect(planTipeo('abc', { cps: 100, jitter: 0 }, fijo(0.5))).toEqual([10, 10, 10])
    expect(planTipeo('', { cps: 100, jitter: 0 }, fijo(0.5))).toEqual([])
  })

  it('todos los delays son enteros ≥ 0', () => {
    const delays = planTipeo('José María Vizcaíno', { cps: 50, jitter: 0.15 })
    expect(delays.length).toBe(19)
    for (const d of delays) {
      expect(Number.isInteger(d)).toBe(true)
      expect(d).toBeGreaterThanOrEqual(0)
    }
  })

  it('con jitter 0 todos los caracteres tardan 1000/cps ms', () => {
    expect(planTipeo('aaaa', { cps: 40, jitter: 0 }, fijo(0.99))).toEqual([25, 25, 25, 25])
  })

  it('el jitter acota los delays entre base·(1−j) y base·(1+j)', () => {
    // base = 1000/100 = 10 ms
    expect(planTipeo('aaaa', { cps: 100, jitter: 0.2 }, fijo(0))[0]).toBe(8)
    expect(planTipeo('aaaa', { cps: 100, jitter: 0.2 }, fijo(0.999))[0]).toBe(12)
  })

  it('más cps ⇒ duración total menor (mismo aleatorio)', () => {
    const texto = 'texto de prueba'
    const suma = (a: number[]) => a.reduce((x, y) => x + y, 0)
    const lento = planTipeo(texto, { cps: 50, jitter: 0.1 }, fijo(0.5))
    const rapido = planTipeo(texto, { cps: 200, jitter: 0.1 }, fijo(0.5))
    expect(suma(rapido)).toBeLessThan(suma(lento))
  })

  it('el resultado no depende del perfil para texto vacío', () => {
    expect(planTipeo('', { cps: 5, jitter: 0.9 }, fijo(0.5))).toEqual([])
  })
})
