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
  contacto: {
    abrir: string
    titulo: string
    comando: string
    nombre: string
    empresa: string
    mail: string
    asunto: string
    asuntoOpcional: string
    mensaje: string
    enviar: string
    enviando: string
    cerrar: string
    exitoTitulo: string
    gracias: string
    error: string
    ariaAbrir: string
    ariaCerrar: string
  }
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
    contacto: {
      abrir: 'contactar',
      titulo: '✉ contacto — web-cv',
      comando: 'josema@dev:~$ ./contactar',
      nombre: 'nombre',
      empresa: 'empresa',
      mail: 'mail',
      asunto: 'asunto',
      asuntoOpcional: '(opcional)',
      mensaje: 'mensaje',
      enviar: 'enviar',
      enviando: 'enviando…',
      cerrar: 'cerrar',
      exitoTitulo: 'mensaje enviado',
      gracias:
        'Gracias por ponerte en contacto conmigo. He recibido tu mensaje y te responderé muy pronto.',
      error: 'no se ha podido enviar — inténtalo de nuevo más tarde',
      ariaAbrir: 'Abrir formulario de contacto',
      ariaCerrar: 'Cerrar',
    },
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

/** Helper del sitio: idioma fijo ES en build-time (el botón EN sigue oculto). */
export const t = (key: string): string => resolve('es', key)
