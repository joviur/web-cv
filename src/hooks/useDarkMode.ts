import { useEffect, useState } from 'react'

/**
 * Tema del sitio (dark-first). Devuelve [light, toggleLight].
 * - Default: dark (sin clase en <html>)
 * - light: añade la clase `light` (los tokens de color se reasignan en CSS)
 * - Persistencia en localStorage
 */
export function useDarkMode(): [boolean, () => void] {
  const [light, setLight] = useState<boolean>(
    () => localStorage.getItem('theme') === 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('light', light)
    localStorage.setItem('theme', light ? 'light' : 'dark')
  }, [light])

  return [light, () => setLight((l) => !l)]
}
