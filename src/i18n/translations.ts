export type Lang = 'es' | 'en'

export interface Translation {
  nav: {
    sobreMi: string
    experiencia: string
    skills: string
    educacion: string
    proyectos: string
    contacto: string
  }
  hero: { ctaExperiencia: string; ctaContacto: string }
  secciones: {
    sobreMi: string
    experiencia: string
    skills: string
    educacion: string
    proyectos: string
    idiomas: string
    contacto: string
  }
  skills: { todos: string; filtro: string }
  footer: { hechoCon: string }
}

export const translations: Record<Lang, Partial<Translation>> = {
  es: {
    nav: {
      sobreMi: 'Sobre mí',
      experiencia: 'Experiencia',
      skills: 'Habilidades',
      educacion: 'Educación',
      proyectos: 'Proyectos',
      contacto: 'Contacto',
    },
    hero: {
      ctaExperiencia: 'Ver experiencia',
      ctaContacto: 'Contactar',
    },
    secciones: {
      sobreMi: 'Sobre mí',
      experiencia: 'Experiencia profesional',
      skills: 'Habilidades',
      educacion: 'Educación',
      proyectos: 'Proyectos',
      idiomas: 'Idiomas',
      contacto: 'Contacto',
    },
    skills: {
      todos: 'Todos',
      filtro: 'Filtrar por categoría',
    },
    footer: { hechoCon: 'Hecho con React + Tailwind CSS' },
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
