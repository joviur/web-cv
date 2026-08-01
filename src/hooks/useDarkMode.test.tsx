import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDarkMode } from './useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('default: tema light sin clase dark', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(result.current[0]).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('aplica dark si está guardado en localStorage', () => {
    localStorage.setItem('theme', 'dark')
    renderHook(() => useDarkMode())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('el toggle cambia el tema y lo persiste', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
