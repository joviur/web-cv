import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDarkMode } from './useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light')
  })

  it('default: tema dark sin clase light', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(result.current[0]).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('aplica light si está guardado en localStorage', () => {
    localStorage.setItem('theme', 'light')
    renderHook(() => useDarkMode())
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('el toggle cambia el tema y lo persiste', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('light')

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
