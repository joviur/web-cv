import { useEffect, useRef, useState } from 'react'

/**
 * Devuelve ref + flag que se pone a true la primera vez que el elemento
 * entra en el viewport (IntersectionObserver). Se desconecta tras disparar.
 */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true) // fallback (tests, navegadores antiguos)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}
