import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDarkMode } from './useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('aplica dark si está guardado en localStorage', () => {
    localStorage.setItem('theme', 'dark')
    renderHook(() => useDarkMode())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('el toggle cambia el tema', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current[1]())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
