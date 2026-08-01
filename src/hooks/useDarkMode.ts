import { useEffect, useState } from 'react'

/** Dark mode con persistencia en localStorage y respeto a prefers-color-scheme. */
export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark((d) => !d)]
}
