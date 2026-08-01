import { useEffect, useState } from 'react'

/**
 * Tema del sitio (light-first). Devuelve [dark, toggleDark].
 * - Default: light (sin clase en <html>)
 * - dark: añade la clase `dark` (los tokens de color se reasignan en CSS)
 * - Persistencia en localStorage
 */
export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(
    () => localStorage.getItem('theme') === 'dark',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark((d) => !d)]
}
