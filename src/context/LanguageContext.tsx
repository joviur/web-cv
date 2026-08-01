import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { resolve, type Lang } from '../i18n/translations'

interface LanguageCtx {
  lang: Lang
  toggleLang: () => void
  t: (key: string) => string
}

const Ctx = createContext<LanguageCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')
  const toggleLang = () => setLang((l) => (l === 'es' ? 'en' : 'es'))
  const t = (key: string) => resolve(lang, key)

  // El atributo lang del <html> debe reflejar el idioma activo (a11y/SEO)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <Ctx.Provider value={{ lang, toggleLang, t }}>{children}</Ctx.Provider>
}

export function useLang(): LanguageCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang debe usarse dentro de LanguageProvider')
  return ctx
}
