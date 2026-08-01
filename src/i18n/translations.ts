export type Lang = 'es' | 'en'

export interface Translation {
  nav: {
    experiencia: string
    skills: string
    educacion: string
    contacto: string
  }
  secciones: {
    experiencia: string
    skills: string
    educacion: string
    proyectos: string
    idiomas: string
    contacto: string
  }
  skills: {
    todos: string
    desarrollo: string
    sistemas: string
    automatizacion: string
    soft: string
    resultado: string
    resultados: string
  }
  footer: { fin: string }
}

export const translations: Record<Lang, Partial<Translation>> = {
  es: {
    nav: {
      experiencia: 'experiencia',
      skills: 'habilidades',
      educacion: 'educación',
      contacto: 'contacto',
    },
    secciones: {
      experiencia: 'Experiencia',
      skills: 'Habilidades',
      educacion: 'Educación',
      proyectos: 'Proyectos',
      idiomas: 'Idiomas',
      contacto: 'Contacto',
    },
    skills: {
      todos: 'todos',
      desarrollo: 'desarrollo',
      sistemas: 'sistemas',
      automatizacion: 'automatización',
      soft: 'soft skills',
      resultado: 'resultado',
      resultados: 'resultados',
    },
    footer: { fin: 'fin del fichero' },
  },
  // TODO(i18n): completar traducción al inglés cuando se implemente.
  // Mientras tanto, todo resuelve con fallback a español.
  en: {},
}

/** Resuelve una clave con notación de puntos, con fallback a español. */
export function resolve(lang: Lang, key: string): string {
  const get = (d: Partial<Translation>) =>
    key
      .split('.')
      .reduce<unknown>(
        (o, k) => (o as Record<string, unknown> | undefined)?.[k],
        d,
      )
  const v = get(translations[lang] ?? {})
  if (typeof v === 'string') return v
  const fb = get(translations.es)
  return typeof fb === 'string' ? fb : key
}
